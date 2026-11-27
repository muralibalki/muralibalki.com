import base from "./catalog.json";
import archive from "../all-birds/catalog.json";
import visual from "./visual.json";
import confirmed from "./confirmed.json";
import settings from "./review.json";

import { speciesKey, type Bird, type SpeciesCount } from "./species";

type Edit = {speciesUnresolved?: boolean; featured?: boolean; common: string; hidden?: boolean; unsure?: boolean; scientific: string; source?: string};
const edits: Record<string, Edit> = settings.edits;

function visibleSpecies(bird: Bird) {
  const edit = bird.entry ? edits[bird.entry] : undefined;
  if (edit?.speciesUnresolved || edit?.hidden || (edit?.unsure ?? bird.unsure) || (edit && !edit.scientific && edit.common !== bird.common)) return "";
  return speciesKey(edit?.common ?? bird.common);
}

const basePhotos = new Set(base.map(row => row.id));
const confirmedPhotos = confirmed.filter(row => row.id) as Bird[];
const confirmedIds = new Set(confirmedPhotos.map(row => row.id));
const additional = [...confirmedPhotos, ...(archive as Bird[]).filter(row => !basePhotos.has(row.id) && !confirmedIds.has(row.id))];
export const allBirds: Bird[] = [...base, ...additional, ...visual];
const photographed = new Set(allBirds.map(visibleSpecies).filter(Boolean));
const sightingNames = new Map(confirmed.filter(row => !row.id).map(row => [speciesKey(row.common), row.common]));
const unpictured = [...sightingNames].filter(([key]) => key && !photographed.has(key)).map(([, name]) => name).sort();
export const speciesCount: SpeciesCount = { total: photographed.size + unpictured.length, photographed: photographed.size, unpictured };

const featuredPhotos = additional.filter(row => (row.featured || (row.entry && edits[row.entry]?.featured)) && visibleSpecies(row));
const existing = new Set([...base, ...featuredPhotos].map(visibleSpecies));
function reviewed(bird: Bird) {
  return Boolean(bird.confirmed || (bird.entry && edits[bird.entry]?.source));
}

const representatives = new Map<string, Bird>();
for (const bird of additional) {
  const name = visibleSpecies(bird);
  if (!name || existing.has(name)) continue;
  const previous = representatives.get(name);
  if (!previous || (reviewed(bird) && !reviewed(previous)) ||
      (reviewed(bird) === reviewed(previous) && (bird.confidence ?? 0) > (previous.confidence ?? 0))) {
    representatives.set(name, bird);
  }
}
const uncertain = additional.filter(row => row.entry && edits[row.entry]?.unsure && !edits[row.entry]?.hidden);
const previousFeatured = [...base, ...featuredPhotos, ...representatives.values(), ...uncertain];
const firstAlbum = visual.filter(row => row.album === 1);
const publicSpecies = new Set([...previousFeatured, ...firstAlbum].map(visibleSpecies));
const newSpecies = visual.filter(row => {
  if (row.album !== 2) return false;
  const name = visibleSpecies(row);
  if (!name || publicSpecies.has(name)) return false;
  publicSpecies.add(name);
  return true;
});
export const featuredBirds = [...previousFeatured, ...firstAlbum, ...newSpecies];
