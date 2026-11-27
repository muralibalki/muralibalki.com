import base from "./catalog.json";
import archive from "../all-birds/catalog.json";
import settings from "./review.json";

import { speciesKey, type Bird } from "./species";

type Edit = {common: string; hidden?: boolean; scientific: string};
const edits: Record<string, Edit> = settings.edits;

function visibleSpecies(bird: Bird) {
  const edit = bird.entry ? edits[bird.entry] : undefined;
  if (edit?.hidden || (edit && !edit.scientific && edit.common !== bird.common)) return "";
  return speciesKey(edit?.common ?? bird.common);
}

const basePhotos = new Set(base.map(row => row.id));
const additional = (archive as Bird[]).filter(row => !basePhotos.has(row.id));
export const allBirds: Bird[] = [...base, ...additional];
const existing = new Set(base.map(visibleSpecies));
const representatives = new Map<string, Bird>();
for (const bird of additional) {
  const name = visibleSpecies(bird);
  if (!name || existing.has(name)) continue;
  const previous = representatives.get(name);
  if (!previous || (bird.confidence ?? 0) > (previous.confidence ?? 0)) representatives.set(name, bird);
}
export const featuredBirds = [...base, ...representatives.values()];
