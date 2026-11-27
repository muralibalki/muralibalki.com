"""Keep public camera details, capture dates and oriented dimensions for the public photo gallery."""
import json
from datetime import datetime
from PIL import Image


def update_photo_metadata(target, paths):
    metadata = json.loads(target.read_text()) if target.exists() else {}
    missing = [key for key in paths if "details" not in metadata.get(key, {})]
    if not missing:
        return
    for key in missing:
        with Image.open(paths[key]) as image:
            exif = image.getexif()
            width, height = image.size
            if exif.get(274) in (5, 6, 7, 8):
                width, height = height, width
            tags = exif.get_ifd(34665)
            stamp = tags.get(36867)
            details = {}
            model = str(exif.get(272) or "").strip()
            make = str(exif.get(271) or "").strip()
            camera = model if model.lower().startswith(make.lower()) else f"{make} {model}".strip()
            if camera:
                details["Camera"] = camera
            if tags.get(42036):
                details["Lens"] = str(tags[42036]).strip()
            for tag, label, template in [(33437, "Aperture", "ƒ/{:g}"), (37386, "Focal length", "{:g} mm"),
                                         (34855, "ISO", "{:g}"), (33434, "Shutter speed", "{:g} s")]:
                try:
                    number = float(tags.get(tag))
                    if number > 0:
                        if tag == 33434 and number < 1 and abs(1 / number - round(1 / number)) < 0.01:
                            details[label] = f"1/{round(1 / number)} s"
                        else:
                            details[label] = template.format(number)
                except (TypeError, ValueError, ZeroDivisionError):
                    continue
            try:
                details["Capture time"] = datetime.strptime(str(stamp), "%Y:%m:%d %H:%M:%S").strftime("%H:%M:%S")
            except ValueError:
                pass
            details["Original file size"] = f"{paths[key].stat().st_size / 1_000_000:.2f} MB"
            try:
                date = datetime.strptime(str(stamp)[:10], "%Y:%m:%d").date().isoformat()
            except ValueError:
                date = None
            metadata[key] = {"width": width, "height": height, "date": date, "details": details}
    temp = target.with_suffix(".tmp")
    temp.write_text(json.dumps(metadata, sort_keys=True, indent=2) + "\n")
    temp.replace(target)
