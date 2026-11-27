"""Build a private, repeatable species inventory from the entire reviewed gallery."""
import csv
import json
from pathlib import Path

from PIL import Image


def write_species_list(work, birds, edits, paths, confirmed=()):
    settings = work / "species-notes.json"
    notes = json.loads(settings.read_text()) if settings.exists() else {}
    date_file = work / "species-photo-dates.json"
    dates = json.loads(date_file.read_text()) if date_file.exists() else {}
    for key, path in paths.items():
        if key not in dates:
            with Image.open(path) as image:
                stamp = image.getexif().get_ifd(34665).get(36867, "")
            dates[key] = str(stamp)[:10].replace(":", "-")
    tmp = date_file.with_suffix(".tmp")
    tmp.write_text(json.dumps(dates, indent=2) + "\n")
    tmp.replace(date_file)

    entries = []
    for bird in birds:
        edit = edits.get(bird["entry"], {})
        if edit.get("hidden") or edit.get("unsure", bird.get("unsure")):
            continue
        name = edit.get("common", bird["common"]).strip()
        if "(unconfirmed)" in name.lower() or name.lower() == "unidentified bird":
            continue
        status = "Reviewed" if edit else bird.get("source", "Model suggestion")
        if name.endswith(" (tentative)"):
            name = name.removesuffix(" (tentative)")
            status = "Tentative"
        entries.append(dict(name=name, scientific=edit.get("scientific", bird["scientific"]),
                            status=status, filename=bird["filename"], key=bird["id"]))
    for item in confirmed:
        entries.append(dict(name=item["common"], scientific=item["scientific"], status="User confirmed",
                            filename=item.get("filename", ""), key=item.get("id", "")))
    entries.extend(notes.get("additional_records", []))
    groups = {}
    for record in entries:
        name = record["name"]
        group = groups.setdefault(name.casefold(), dict(name=name, scientific="", status=set(),
                                                       countries=set(), candidates=set(), places=set(), files=set()))
        group["scientific"] = group["scientific"] or record.get("scientific", "")
        group["status"].add(record["status"])
        key = record.get("key", "")
        country = record.get("country") or notes.get("photo_countries", {}).get(key)
        place = record.get("locality") or notes.get("photo_localities", {}).get(key)
        if place:
            group["places"].add(place + (" (" + record["filename"] + ")" if record.get("filename") else ""))
        if country:
            group["countries"].add(country)
            if record.get("confirmed") or key in notes.get("confirmed_ids", {}):
                group["status"].add("User confirmed")
        else:
            for trip in notes.get("possible_trips", []):
                if trip["start"] <= dates.get(key, "") <= trip["end"]:
                    group["candidates"].add(trip["country"])
        if record.get("filename"):
            group["files"].add(record["filename"])
    target = work / "all-species.csv"
    tmp = target.with_suffix(".tmp")
    with tmp.open("w", newline="", encoding="utf-8") as stream:
        writer = csv.writer(stream)
        writer.writerow(["Species", "Scientific name", "ID evidence", "Confirmed countries",
                         "Possible countries (photo dates)", "Confirmed localities", "Gallery or source filenames"])
        for _, item in sorted(groups.items()):
            writer.writerow([item["name"], item["scientific"], "; ".join(sorted(item["status"])),
                             "; ".join(sorted(item["countries"])), "; ".join(sorted(item["candidates"])),
                             "; ".join(sorted(item["places"])), "; ".join(sorted(item["files"]))])
    tmp.replace(target)
    print(f"{len(groups)} named species in {target}")
