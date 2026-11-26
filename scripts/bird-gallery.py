# /// script
# requires-python = ">=3.10,<3.13"
# dependencies = ["speciesnet==5.0.6", "Pillow", "pillow-heif", "onnxruntime", "numpy", "astrometry==4.3.0", "astropy", "sep"]
# ///
"""Run with uv run --python 3.11 scripts/bird-gallery.py /path/to/unzipped-album."""
import argparse
import fcntl
import hashlib
import json
import subprocess
import sys
import tempfile
import math
import re
from urllib.request import urlretrieve

import numpy as np
import onnxruntime as ort
from pathlib import Path

from PIL import Image, ImageOps
from pillow_heif import register_heif_opener
from astro_gallery import solve_photo
from gallery_review import import_reviews, write_queue

ROOT = Path(__file__).resolve().parents[1]
FORMATS = {".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp", ".tif", ".tiff", ".avif"}


MODEL_REV = "134a1f8702fe439e99cf936e496777ec8464b352"
WORK = ROOT / "work/bird-gallery"


def load_classifier():
    model = WORK / "birdtrace"
    model.mkdir(exist_ok=True)
    base = f"https://huggingface.co/warden123/BirdTrace-FastViT-MA36-10K/resolve/{MODEL_REV}/"
    geo = "https://huggingface.co/tphakala/BirdNET-Geomodel/resolve/67cc263fe9d9c0ceb2f34534e75374e877ca2666/"
    for filename, url in {
        "range.onnx": geo + "birdnet-geomodel-v3.0.4-fp32-b1.onnx",
        "range.txt": geo + "birdnet-geomodel-v3.0.4-labels-b1.txt",
        "classes.json": base + "classes.json",
        "model.onnx": base + "model.onnx",
        "taxonomy.json": "https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json",
    }.items():
        target = model / filename
        if not target.exists():
            temp = target.with_suffix(".part")
            urlretrieve(url, temp)
            temp.replace(target)
    classes = json.loads((model / "classes.json").read_text())
    taxonomy = {normalize(t["comName"]): t for t in json.loads((model / "taxonomy.json").read_text())
                if t["category"] == "species"}
    options = ort.SessionOptions()
    options.intra_op_num_threads = 4
    session = ort.InferenceSession(str(model / "model.onnx"), options, providers=["CPUExecutionProvider"])
    geo_session = ort.InferenceSession(str(model / "range.onnx"), options, providers=["CPUExecutionProvider"])
    # Album-level location mixture. Sample several California habitats and all seasons.
    regions = [(37.34, -121.89, .50), (37.48, -119.97, .25),
               (40.80, -124.16, .03), (38.58, -121.49, .03), (34.05, -118.24, .03),
               (36.60, -121.89, .03), (32.83, -115.57, .03),
               (40.44, -80.00, .07), (12.97, 77.59, .03)]
    labels = (model / "range.txt").read_text().splitlines()
    mixture = np.zeros(len(labels))
    for lat, lon, weight in regions:
        season = []
        for week in range(1, 49, 4):
            inputs = np.array([[lat, lon, week]], dtype=np.float32)
            season.append(geo_session.run(None, {geo_session.get_inputs()[0].name: inputs})[0].reshape(-1))
        mixture += weight * np.max(season, axis=0)
    ranges = {normalize(label.split("_", 1)[1]): val for label, val in zip(labels, mixture)}
    prior = np.array([ranges.get(normalize(c["species_name"]), 0) for c in classes])
    return session, classes, taxonomy, np.where(prior >= .001, np.log(np.maximum(prior, 1e-12)), -np.inf)


def normalize(name):
    return re.sub(r"[^a-z0-9]", "", name.casefold())


def bird_boxes(record):
    if record.get("failures"):
        raise RuntimeError(f"SpeciesNet failed on {record['filepath']}: {record['failures']}")
    boxes = []
    for detection in record["detections"]:
        parts = detection.get("processed_classification", {}).get("class", "").split(";")
        if len(parts) == 7 and parts[1].lower() == "aves":
            boxes.append(detection["bbox"])
    return boxes


def identify(image, bbox, classifier):
    session, classes, taxonomy, log_prior = classifier
    x, y, w, h = bbox
    iw, ih = image.size
    # Square crop around the detection, with context and edge padding.
    side = max(1, math.ceil(1.15 * max(w * iw, h * ih)))
    cx, cy = (x + w / 2) * iw, (y + h / 2) * ih
    left, top = round(cx - side / 2), round(cy - side / 2)
    crop = image.crop((left, top, left + side, top + side)).resize((384, 384), Image.Resampling.LANCZOS)
    pixels = np.asarray(crop, dtype=np.float32).transpose(2, 0, 1)[None] / 255
    logits = session.run(["visual_logits"], {"image": pixels})[0][0]
    index = int((logits + log_prior).argmax())
    score = float(np.exp(logits[index] - logits.max()) / np.exp(logits - logits.max()).sum())
    label = classes[index]["species_name"].replace("_", " ")
    taxon = taxonomy.get(normalize(label), {})
    return taxon.get("comName", label), taxon.get("sciName", ""), score


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("album", type=Path)
    parser.add_argument("--low-confidence", type=float, default=.50, metavar="FRACTION",
                        help="Queue visual scores below this value for manual Merlin Photo ID (default .50)")
    parser.add_argument("--merlin-results", type=Path, metavar="CSV",
                        help="Apply filled reviewed_name entries to the final site review file")
    parser.add_argument("--retry-unresolved", action="store_true",
                        help="Try local plate solving again on previously unresolved photos")
    args = parser.parse_args()
    if not 0 <= args.low_confidence <= 1:
        parser.error("--low-confidence must be between 0 and 1")
    files = sorted(p for p in args.album.rglob("*") if p.is_file() and p.suffix.lower() in FORMATS)
    if not files:
        parser.error("No supported still images in this folder")
    register_heif_opener()
    images = ROOT / "public/bird-photos"
    images.mkdir(exist_ok=True)
    state = WORK / ("geo-v2-" + MODEL_REV)
    state.mkdir(parents=True, exist_ok=True)
    with (WORK / "gallery.lock").open("a") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        run_album(files, images, state, args)


def run_album(files, images, state, args):
    ledger = ROOT / "content/gallery/processed.json"
    done = json.loads(ledger.read_text()) if ledger.exists() else {}
    paths = {hashlib.sha256(path.read_bytes()).hexdigest(): path for path in files}
    birds_file = ROOT / "app/birds/catalog.json"
    birds = json.loads(birds_file.read_text())
    known_birds = {r["id"] for r in birds}
    astro_file = ROOT / "app/astro/catalog.json"
    astro = {r["slug"]: r for r in json.loads(astro_file.read_text())}
    new = {}
    remaining = {}
    for key, path in paths.items():
        status = done.get(key)
        if status == "bird" and (key not in known_birds or not all(
                (images / (key + suffix)).exists() for suffix in (".jpg", "-thumb.jpg"))):
            status = None
        if status is None:
            new[key] = path
        elif status == "unresolved" and args.retry_unresolved:
            remaining[key] = path
        elif status == "astro" and (key[:20] not in astro or not all(
                (ROOT / "public/astro-photos" / (key[:20] + suffix)).exists() for suffix in (".jpg", "-thumb.jpg"))):
            if key[:20] not in astro:
                remaining[key] = path
            else:
                from astro_gallery import write_images
                write_images(path, key[:20], ROOT)
    if new:
        update(new, images, state)
        birds = json.loads(birds_file.read_text())
        bird_ids = {r["id"] for r in birds}
        for key, path in new.items():
            if key in bird_ids:
                done[key] = "bird"
            else:
                remaining[key] = path
        save_json(ledger, done)
    for key, path in remaining.items():
        status, item = solve_photo(path, key, ROOT)
        if item:
            astro[item["slug"]] = item
            save_json(astro_file, list(astro.values()))
        done[key] = status
        save_json(ledger, done)
    review_file = ROOT / "app/birds/review.json"
    review = json.loads(review_file.read_text())
    if args.merlin_results:
        previous_edits = dict(review["edits"])
        import_reviews(args.merlin_results, birds, review, WORK)
        save_json(review_file, review)
        draft_file = WORK / "review-draft.json"
        if draft_file.exists():
            draft = json.loads(draft_file.read_text())
            draft["edits"].update({k: v for k, v in review["edits"].items() if previous_edits.get(k) != v})
            save_json(draft_file, draft)
    queue = WORK / "merlin-review.csv"
    count = write_queue(queue, birds, review["edits"], args.low_confidence)
    print(f"{len(paths)} distinct photos; {len(new)} new; {len(remaining)} astronomy checks; "
          f"{count} pending Merlin reviews in {queue}")


def detect(paths):
    with tempfile.TemporaryDirectory() as tmp:
        stage = Path(tmp) / "photos"
        stage.mkdir()
        for key, path in paths.items():
            with Image.open(path) as original:
                img = ImageOps.exif_transpose(original).convert("RGB")
                img.thumbnail((2000, 2000))
                img.save(stage / (key + ".jpg"), quality=89, exif=b"")
        output = Path(tmp) / "detections.json"
        local_model = WORK / "model"
        args = ["--model", str(local_model)] if (local_model / "info.json").exists() else []
        subprocess.run([sys.executable, "-m", "speciesnet.scripts.run_model", "--folders",
                        str(stage), "--predictions_json", str(output), *args], check=True)
        results = {Path(r["filepath"]).stem: bird_boxes(r) for r in json.loads(output.read_text())["predictions"]}
        if results.keys() != paths.keys():
            raise RuntimeError("Incomplete detections")
        return results


def update(paths, images, state):
    target = ROOT / "app/birds/catalog.json"
    catalog = [r for r in json.loads(target.read_text()) if r["id"] not in paths]
    box_dir = WORK / "speciesnet-5.0.6-boxes"
    box_dir.mkdir(exist_ok=True)
    missing = {key: path for key, path in paths.items() if not (box_dir / (key + ".json")).exists()}
    if missing:
        for key, boxes in detect(missing).items():
            save_json(box_dir / (key + ".json"), boxes)
    classifier = None
    count = 0
    for key, path in paths.items():
        cache = state / (key + ".json")
        boxes = json.loads((box_dir / (key + ".json")).read_text())
        large = images / (key + ".jpg")
        thumb = images / (key + "-thumb.jpg")
        if boxes and (not large.exists() or not thumb.exists()):
            with Image.open(path) as original:
                img = ImageOps.exif_transpose(original).convert("RGB")
                img.thumbnail((2000, 2000))
                img.save(large, quality=89, exif=b"")
                img.thumbnail((200, 150))
                img.save(thumb, quality=82, exif=b"")
        if cache.exists():
            rows = json.loads(cache.read_text())
        else:
            best = {}
            if boxes:
                if classifier is None:
                    classifier = load_classifier()
                with Image.open(large) as photo:
                    for index, bbox in enumerate(boxes):
                        common, scientific, score = identify(photo, bbox, classifier)
                        first, previous = best.get((common, scientific), (index, 0))
                        best[common, scientific] = first, max(score, previous)
                count += 1
            rows = [dict(id=key, entry=f"{key}-{i}", common=c, scientific=s, confidence=v)
                    for (c, s), (i, v) in best.items()]
            save_json(cache, rows)
        catalog.extend(dict(r, filename=path.name) for r in rows)
    catalog.sort(key=lambda r: (r["common"], r["id"]))
    save_json(target, catalog)
    print(f"{len(paths)} distinct photos, {len(missing)} new detection runs, "
          f"{count} photos classified by BirdTrace, {len(catalog)} gallery rows")


def save_json(path, value):
    temporary = path.with_suffix(".tmp")
    temporary.write_text(json.dumps(value, indent=2) + "\n")
    temporary.replace(path)


if __name__ == "__main__":
    main()
