# muralibalki.com

Personal research site and technical blog for Balakrishnan (Murali) Narayanaswamy.

The site preserves the dense, slightly irreverent tone and full archive of the original Google Site.

## What is included

- About and professional trajectory
- Complete original biographical text and links
- Recent research publications
- Patent archive
- Responsive editorial layout
- Metadata and favicon
- Cloudflare Workers configuration

## Local development

Requires Node.js 22.13 or newer.

```bash
npm ci
npm run dev
```

## Production build

```bash
npm run build
```

## Adding blog posts

Add Markdown files to `content/blog`. The filename becomes the post title and URL slug unless optional `title`, `description`, or `date` front matter is provided.

## Deploy to Cloudflare Workers

Connect this repository in the Cloudflare dashboard, or deploy from the command line after authenticating Wrangler:

```bash
npm run build
npx wrangler deploy
```

The site is built with React, Next-compatible routes, Vinext, Vite, and Cloudflare Workers.

## Disclaimer

The postings on this site are the author's own and do not necessarily represent Amazon's positions, strategies, or opinions.

## Bird and astronomy galleries

From this checkout, import an extracted Google Photos album or a folder of new photos:

```sh
uv run --python 3.11 scripts/bird-gallery.py "$HOME/Downloads/mostly birds"
```

The command identifies birds with SpeciesNet and BirdTrace. For new photos without
a bird detection it screens for stars, then tries local Astrometry.net plate
solving. A solved star field appears in `/astro`; a prominent catalog target is
named when the field center and extent support a single match. Night landscapes
and lunar images without a star match may need manual identification.

`content/gallery/processed.json` records each photo’s SHA-256 and processing
outcome. Keep this file with both gallery catalogs, assets, and bird reviews.
Reimporting a subset or renaming a file preserves earlier results. The ignored
`work/` directory caches models, star indexes, and intermediate predictions.
Use `--retry-unresolved` to retry previously unsuccessful astronomy candidates.

### Species inventory

Every import refreshes `work/bird-gallery/all-species.csv` from the entire gallery,
including when the input folder contains only new photos. Each species has one
row with identification evidence, confirmed and possible countries, and filenames.
The export includes suggestions for review. It does not submit sightings to eBird.

Private notes in `work/bird-gallery/species-notes.json` can supply
`photo_countries` (photo SHA-256 to country), `confirmed_ids` (confirmed photo
hashes), `possible_trips` (start and end dates in YYYY-MM-DD format and country),
and `additional_records` (name, status, optional scientific name, photo key,
filename, and country). A capture date inside a trip window only suggests a
country. Back up these notes to keep your personal confirmations across checkouts.

### Merlin review

The importer writes pending BirdTrace scores below 50% to
`work/bird-gallery/merlin-review.csv`, lowest first. Change the threshold with
`--low-confidence 0.65`. Use Merlin Photo ID on the original photo and enter its
identification in the CSV’s `reviewed_name` column; `scientific_name` is optional.
Leave unfinished rows blank. Apply completed reviews with:

```sh
uv run --python 3.11 scripts/bird-gallery.py "$HOME/Downloads/mostly birds" --merlin-results work/bird-gallery/merlin-review.csv
```

Completed rows persist in `app/birds/review.json` and leave the queue. The script
does not upload photos to Merlin. Commit the updated galleries, assets, reviews,
and processing record to publish through the site's normal deployment.

### Local review

The gallery ranks BirdTrace candidates using BirdNET's year-round occurrence estimates
and an album-level location mixture: San Jose 50%, Mariposa 25%, a California
sample 15%, Pittsburgh (Pennsylvania) 7%, Bengaluru 3%. These are editable
assumptions in the importer, not inferred photo locations. Ranking excludes
candidates with a weighted occurrence below 0.001 or without a matched range
label. The displayed percentage is the selected species' original visual score.
Changing the location mixture requires a new classification cache version.

Run `python3 scripts/review-birds.py` alongside the site preview at
`http://127.0.0.1:4178/birds`. Click **Edit locally** to change the page title,
description, or bird names and hide unwanted rows. **Save draft** keeps changes
under `work/bird-gallery/`. **Finalize locally** saves them in
`app/birds/review.json` for the next site build. The importer keeps this file
separate from its predictions. Only the local preview connects to the editor.
