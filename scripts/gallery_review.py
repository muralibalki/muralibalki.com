"""Prepare a persistent CSV worklist for human review in Merlin Photo ID."""
import csv
import json
from pathlib import Path

FIELDS = ["entry", "filename", "suggested_name", "visual_confidence", "photo_url", "reviewed_name", "scientific_name"]


def read_csv(path):
    with path.open(newline="", encoding="utf-8-sig") as stream:
        reader = csv.DictReader(stream)
        if not {"entry", "reviewed_name"}.issubset(reader.fieldnames or []):
            raise ValueError(f"Expected entry and reviewed_name columns in {path}")
        return list(reader)


def import_reviews(path, birds, review, work):
    ids = {r["entry"]: r for r in birds}
    taxonomy_path = work / "birdtrace/taxonomy.json"
    taxonomy = {}
    if taxonomy_path.exists():
        taxonomy = {r["comName"].casefold(): r["sciName"] for r in json.loads(taxonomy_path.read_text())
                    if r["category"] == "species"}
    seen = set()
    for row in read_csv(path):
        name = (row.get("reviewed_name") or "").strip()
        if not name:
            continue
        entry = row["entry"]
        if entry not in ids or entry in seen:
            raise ValueError(f"Unknown or duplicate review entry: {entry}")
        seen.add(entry)
        sci = (row.get("scientific_name") or "").strip() or taxonomy.get(name.casefold(), "")
        review["edits"][entry] = dict(common=name, scientific=sci, source="Merlin review")


def write_queue(path, birds, edits, threshold):
    existing = {r["entry"]: r for r in read_csv(path)} if path.exists() else {}
    temp = path.with_suffix(".tmp")
    count = 0
    with temp.open("w", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=FIELDS)
        writer.writeheader()
        for bird in sorted(birds, key=lambda r: r["confidence"]):
            entry = bird["entry"]
            previous = existing.get(entry, {})
            if entry in edits or (bird["confidence"] >= threshold and not previous.get("reviewed_name")):
                continue
            writer.writerow(dict(entry=entry, filename=bird["filename"], suggested_name=bird["common"],
                                 visual_confidence=f"{bird['confidence']:.5f}",
                                 photo_url=f"https://muralibalki.com/bird-photos/{bird['id']}.jpg",
                                 reviewed_name=previous.get("reviewed_name", ""),
                                 scientific_name=previous.get("scientific_name", "")))
            count += 1
    temp.replace(path)
    return count
