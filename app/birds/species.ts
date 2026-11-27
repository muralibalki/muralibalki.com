export type Bird = {entry?: string; source?: string; unsure?: boolean; id: string; filename?: string; common: string; scientific: string; confidence?: number; archive?: boolean; featured?: boolean; confirmed?: boolean};

export function speciesKey(name: string) {
  return name.replace(/ *\(tentative\)$/i, "").trim().toLowerCase();
}
