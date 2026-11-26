"""Local star extraction, plate solving and conservative target association."""
import csv
import re
from urllib.request import urlretrieve

import astrometry
import numpy as np
import sep
from astropy.coordinates import SkyCoord
from astropy.io.fits import Header
from astropy.wcs import WCS
from PIL import Image, ImageOps

from astropy import units as u


def resource(directory, filename, url):
    path = directory / filename
    if not path.exists():
        temp = path.with_suffix(".part")
        urlretrieve(url, temp)
        temp.replace(path)
    return path


def field_target(directory, ra, dec, width):
    path = resource(directory, "NGC.csv",
                    "https://raw.githubusercontent.com/mattiaverga/OpenNGC/master/database_files/NGC.csv")
    center = SkyCoord(ra, dec, unit="deg")
    candidates = []
    with path.open() as stream:
        for row in csv.DictReader(stream, delimiter=";"):
            if not row["RA"] or row["Type"] not in {"G", "PN", "Neb", "RfN", "EmN", "HII", "SNR", "OCl", "GCl", "Cl+N"}:
                continue
            # Restrict naming to prominent, extended targets near the field center.
            diameter = float(row["MajAx"] or 0) / 60
            if diameter < width * .03 or not (row["M"] or row["Common names"]):
                continue
            pos = SkyCoord(row["RA"], row["Dec"], unit=(u.hourangle, u.deg))
            offset = center.separation(pos).deg
            if offset <= min(width * .20, diameter * .6):
                name = row["Common names"].split(",")[0] or ("M" + str(int(row["M"])))
                candidates.append((offset, name, row["Name"]))
    candidates.sort()
    # OpenNGC lists several bright portions of the Rosette complex separately.
    if candidates and all(code in {"NGC2237", "NGC2238", "NGC2239", "NGC2246"}
                          for _, _, code in candidates):
        return "Rosette Nebula field"
    if len(candidates) == 1:
        _, name, code = candidates[0]
        number = re.search(r"[0-9]+", code)
        display = code if number is None else code[:number.start()] + " " + str(int(number[0])) + code[number.end():]
        return f"{name} field · {display}"
    return "Plate-solved star field"


def solve_photo(path, key, root):
    directory = root / "work/astro"
    directory.mkdir(parents=True, exist_ok=True)
    with Image.open(path) as original:
        image = ImageOps.exif_transpose(original).convert("RGB")
    small = image.convert("L")
    small.thumbnail((1500, 1500))
    pixels = np.array(small, dtype=np.float32)
    if np.median(pixels) > 65:
        return "other", None
    background = sep.Background(pixels)
    pixels -= background.back()
    stars = sep.extract(pixels, max(2, background.globalrms * 3), minarea=4)
    stars = stars[(stars["a"] < 12) & (stars["a"] < 2.5 * stars["b"])]
    if len(stars) < 12:
        return "unresolved", None
    points = [[star["x"] + 1, star["y"] + 1] for star in sorted(stars, key=lambda s: -s["flux"])[:100]]
    for i in (4107, 4108, 4109, 4110, 4112, 4115, 4116):
        name = f"index-{i}.fits"
        resource(directory, name, "https://data.astrometry.net/4100/" + name)
    indexes = list(directory.glob("index-*.fits"))
    options = astrometry.SolutionParameters(output_logodds_threshold=30, maximum_quads=450,
                                             logodds_callback=lambda _: astrometry.Action.STOP)
    with astrometry.Solver(indexes) as solver:
        solution = solver.solve(points, astrometry.SizeHint(.3, 300), None, options)
    if not solution.has_match():
        return "unresolved", None
    match = solution.best_match()
    wcs = WCS(Header({k: v[0] for k, v in match.wcs_fields.items()}))
    ra, dec = map(float, wcs.all_pix2world([[(small.width+1)/2, (small.height+1)/2]], 1)[0])
    title = field_target(directory, ra, dec, small.width * match.scale_arcsec_per_pixel / 3600)
    slug = key[:20]
    write_images(path, slug, root)
    return "astro", dict(slug=slug, filename=path.name, title=title, ra=ra, dec=dec,
                         note=f"Plate solution · RA {ra:.3f}°, Dec {dec:+.3f}°.")



def write_images(path, slug, root):
    with Image.open(path) as original:
        image = ImageOps.exif_transpose(original).convert("RGB")
    dest = root / "public/astro-photos"
    dest.mkdir(exist_ok=True)
    for size, suffix in ((1920, ""), (560, "-thumb")):
        image.thumbnail((size, size), Image.Resampling.LANCZOS)
        temp = dest / (slug + suffix + ".tmp")
        image.save(temp, format="JPEG", quality=88, exif=b"")
        temp.replace(dest / (slug + suffix + ".jpg"))
