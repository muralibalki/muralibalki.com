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

## Bird gallery

From this checkout, import an extracted Google Photos album or a folder of new photos:

```sh
uv run --python 3.11 scripts/bird-gallery.py "$HOME/Downloads/mostly birds"
```

The first run downloads SpeciesNet, BirdTrace FastViT-MA36-10K, and the eBird taxonomy. Repeat the command after adding
photos locally. The importer hashes image contents and saves predictions (including
non-birds) under `work/bird-gallery/`. Keep that directory to skip prior inference.
Importing a smaller folder preserves previously cataloged birds. SpeciesNet locates birds, and BirdTrace suggests a species per crop. The percentage is
the BirdTrace classification score. Scientific names come from matching eBird names. When several detections in
a photo share a label, the gallery displays their highest classification score.

The site serves `/birds` from `app/birds/catalog.json` and JPEGs in
`public/bird-photos/`. Include both in a site deployment after updating the album.

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
