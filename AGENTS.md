# Maintaining the bird galleries

Run commands from the repository root. Both pages and the downloadable inventory are built from `birdInventory` in `app/birds/collection.ts`. Update the underlying sightings and reviews once. The inventory computes page visibility and the species count.

## Import new images

Use the extracted local originals. For one album, run its command. For both, run these in order so the larger album can reuse primary-album results.

```sh
uv run --python 3.11 scripts/bird-gallery.py "$HOME/Downloads/mostly birds"
uv run --python 3.11 scripts/bird-gallery.py "$HOME/Downloads/interesting birds" --all-birds
```

- **Mostly birds** is the primary album. Its importer records SHA-256 photo IDs in `content/gallery/processed.json`. Presence in this ledger determines primary-album membership even when a row uses archive image assets. The primary import also screens unmatched photos for astronomy and attempts local plate solving. Use `--retry-unresolved` for an intentional astronomy retry.
- **Interesting birds** is the larger album. Always use `--all-birds` for it. Its importer reuses case-insensitive filenames and known photo IDs through `content/gallery/all-birds-files.json`. Keep both ledgers between runs. Either command accepts a folder of additions for its respective album.
- Preserve existing identifications, hidden rows and previous visual reviews. If a previously archived photo is added to the primary album, check its existing entry, review and assets after import. Keep one sighting per photo and species and verify the updated album membership.

## Review the additions

1. Compare the input filenames and photo IDs with the catalog inputs, saved reviews and `content/gallery/missed-photo-review.csv`. A photo can be processed without getting a bird row. Inspect newly omitted originals individually, enlarging the bird where needed. Record the outcome for skipped photos and exact duplicates so later runs can reuse the decision.
2. Keep SpeciesNet/BirdTrace predictions in their importer-managed catalogs. For a missed bird, follow the existing rows in `app/birds/visual.json`: use the original file's SHA-256 ID, a stable unique entry per identification, the original filename, common and scientific names, album number (1 or 2), and `source: "Visual review"`. Follow the existing archive asset convention for visual rows: a large WebP and a `-thumb.webp` in `public/all-bird-photos/`, both named by photo ID. Multiple species in one photo share the assets.
3. Save corrections in `app/birds/review.json` under the exact entry key. Match the filename including suffixes such as `-2`, `(1)` and `~2`. For multi-species photos, change only the requested identifications. Use `source: "User confirmed"` for the user's confirmations and clear any obsolete `unsure` or `speciesUnresolved` flag. Set `unsure: false` explicitly when confirming an originally unsure row. Use the gallery taxonomy for the scientific name.
4. Use `unsure: true` for tentative IDs and `speciesUnresolved: true` for a confirmed group without a species-level ID. Use `hidden: true` for rejected rows. A visible bird with an unknown species belongs in All Birds for review. Keep model confidence separate from visual or user confirmation.
5. Direct visual review is the default for missed birds. If Merlin review is requested, use actual Photo ID results. The importer writes a low-confidence worklist in `work/bird-gallery/merlin-review.csv`. Apply filled model-entry reviews with the appropriate album command plus `--merlin-results work/bird-gallery/merlin-review.csv`. See the README for the local editor, regional ranking and astronomy workflow.

## Page membership and verification

- **All Birds** (`/all_birds.html`) includes every non-hidden bird entry from either album. Tentative identifications appear in its yellow table.
- **Birds** (`/birds.html`) includes the countable primary-album entries and one representative per additional countable species found only in the larger album. The selection prefers featured photos, then reviewed IDs, then model confidence within the same preference level, with a stable entry-key tie break. Keep unsure and species-unresolved rows archive-only.
- Both pages use the same deterministic count of distinct eligible species, including any saved sightings without a photo. Never enter a literal species total. Search, sort and confidence filters affect displayed rows only.
- Build and run the rendered-site tests with `npm test`. On a Mac without GNU `timeout`, run `bash scripts/sites-env.sh -- node_modules/.bin/vinext build` followed by `node --test tests/rendered-html.test.mjs`.
- Check changed filenames in `/bird-inventory.csv`. Verify the final names, album, unsure/unresolved flags and both visibility columns against the rendered pages. Hidden entries are omitted from the public CSV. Verify the thumbnails and larger images, equal species totals, and one representative for each species unique to the second album.
- For publication, commit the changed source data, ledgers, review decisions and referenced website assets together. Keep originals and private `work/` caches local. After deployment, verify the live gallery links and CSV.
