"""Keep capture dates and oriented dimensions for the public photo gallery."""
import json
from datetime import datetime
from PIL import Image


def update_photo_metadata(target, paths):
    metadata = json.loads(target.read_text()) if target.exists() else {}
    missing = paths.keys() - metadata.keys()
    if not missing:
        return
    for key in missing:
        with Image.open(paths[key]) as image:
            exif = image.getexif()
            width, height = image.size
            if exif.get(274) in (5, 6, 7, 8):
                width, height = height, width
            stamp = exif.get_ifd(34665).get(36867)
            try:
                date = datetime.strptime(str(stamp)[:10], "%Y:%m:%d").date().isoformat()
            except ValueError:
                date = None
            metadata[key] = {"width": width, "height": height, "date": date}
    temp = target.with_suffix(".tmp")
    temp.write_text(json.dumps(metadata, sort_keys=True, indent=2) + "\n")
    temp.replace(target)
