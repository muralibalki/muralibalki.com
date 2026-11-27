import base from "./catalog.json";
import archive from "../all-birds/catalog.json";
import visual from "./visual.json";
import confirmed from "./confirmed.json";
import settings from "./review.json";
import mostlyBirdsPhotos from "../../content/gallery/processed.json";

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

const primaryIds = new Set(Object.keys(mostlyBirdsPhotos));
const primaryRows = allBirds.filter(bird => primaryIds.has(bird.id) && visibleSpecies(bird));
const primarySpecies = new Set(primaryRows.map(visibleSpecies));

function preference(bird: Bird) {
  const edit = bird.entry ? edits[bird.entry] : undefined;
  if (bird.featured || edit?.featured) return 3;
  if (bird.confirmed || edit?.source) return 2;
  if (bird.source) return 1;
  return 0;
}

function prefer(candidate: Bird, current: Bird) {
  const rank = preference(candidate) - preference(current);
  if (rank) return rank > 0;
  const confidence = (candidate.confidence ?? -1) - (current.confidence ?? -1);
  if (confidence) return confidence > 0;
  return (candidate.entry ?? candidate.id) < (current.entry ?? current.id);
}

const representatives = new Map<string, Bird>();
for (const bird of allBirds) {
  if (primaryIds.has(bird.id)) continue;
  const name = visibleSpecies(bird);
  if (!name || primarySpecies.has(name)) continue;
  const previous = representatives.get(name);
  if (!previous || prefer(bird, previous)) representatives.set(name, bird);
}

export const featuredBirds = [...primaryRows, ...representatives.values()];
