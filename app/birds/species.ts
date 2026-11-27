export type Bird = {entry?: string; source?: string; unsure?: boolean; id: string; filename?: string; common: string; scientific: string; confidence?: number; archive?: boolean; featured?: boolean; confirmed?: boolean};

export function speciesKey(name: string) {
  return name.replace(/ *\(tentative\)$/i, "").trim().toLowerCase();
}

export type SpeciesCount = { total: number; photographed: number; unpictured: string[] };

export type BirdEdit = {
  common: string;
  scientific: string;
  featured?: boolean;
  hidden?: boolean;
  unsure?: boolean;
  speciesUnresolved?: boolean;
  merlinRequested?: boolean;
  source?: string;
};

export function applyReview(original: Bird, edit?: BirdEdit) {
  return {
    ...original, ...edit, original,
    key: original.entry ?? original.id + "/" + original.common,
    confidence: edit && (edit.source || edit.common !== original.common) ? undefined : original.confidence,
  };
}

export type InventoryRow = ReturnType<typeof applyReview> & {
  album: "mostly birds" | "interesting birds";
  countedSpecies: string;
  showOnBirds: boolean;
  showOnAllBirds: boolean;
};
