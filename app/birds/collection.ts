import base from "./catalog.json";
import archive from "../all-birds/catalog.json";
import visual from "./visual.json";
import confirmed from "./confirmed.json";
import settings from "./review.json";
import mostlyBirdsPhotos from "../../content/gallery/processed.json";

import { applyReview, speciesKey, type Bird, type BirdEdit, type InventoryRow, type SpeciesCount } from "./species";

const edits: Record<string, BirdEdit> = settings.edits;
const primaryIds = new Set(Object.keys(mostlyBirdsPhotos));

const basePhotos = new Set(base.map(row => row.id));
const confirmedPhotos = confirmed.filter(row => row.id) as Bird[];
const confirmedIds = new Set(confirmedPhotos.map(row => row.id));
const additional = [...confirmedPhotos, ...(archive as Bird[]).filter(row => !basePhotos.has(row.id) && !confirmedIds.has(row.id))];
export const birdInventory: InventoryRow[] = [...base, ...additional, ...visual].map(original => {
  const edit = original.entry ? edits[original.entry] : undefined;
  const row = applyReview(original, edit);
  const countedSpecies = row.hidden || row.unsure || row.speciesUnresolved ||
    (edit && !row.scientific && row.common !== original.common) ? "" : speciesKey(row.common);
  const primary = primaryIds.has(row.id);
  return {
    ...row, countedSpecies,
    album: primary ? "mostly birds" : "interesting birds",
    showOnAllBirds: !row.hidden,
    showOnBirds: primary && Boolean(countedSpecies),
  };
});

const photographed = new Set(birdInventory.map(row => row.countedSpecies).filter(Boolean));
const sightingNames = new Map(confirmed.filter(row => !row.id).map(row => [speciesKey(row.common), row.common]));
const unpictured = [...sightingNames].filter(([key]) => key && !photographed.has(key)).map(([, name]) => name).sort();
export const speciesCount: SpeciesCount = { total: photographed.size + unpictured.length, photographed: photographed.size, unpictured };

function preference(row: InventoryRow) {
  if (row.featured || row.original.featured) return 3;
  if (row.confirmed || edits[row.key]?.source) return 2;
  return row.source ? 1 : 0;
}

function prefer(candidate: InventoryRow, current: InventoryRow) {
  const rank = preference(candidate) - preference(current);
  if (rank) return rank > 0;
  const confidence = (candidate.original.confidence ?? -1) - (current.original.confidence ?? -1);
  if (confidence) return confidence > 0;
  return candidate.key < current.key;
}

const primarySpecies = new Set(birdInventory.filter(row => row.showOnBirds).map(row => row.countedSpecies));
const representatives = new Map<string, InventoryRow>();
for (const row of birdInventory) {
  const name = row.countedSpecies;
  if (row.album === "mostly birds" || !name || primarySpecies.has(name)) continue;
  const previous = representatives.get(name);
  if (!previous || prefer(row, previous)) representatives.set(name, row);
}
for (const row of representatives.values()) row.showOnBirds = true;
