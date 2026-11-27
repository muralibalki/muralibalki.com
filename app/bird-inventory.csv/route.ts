import { birdInventory } from "../birds/collection";

export function GET() {
  const columns = ["Entry", "Filename", "Species", "Scientific name", "Album", "Unsure", "Species unresolved", "Birds", "All Birds"];
  const rows = birdInventory.filter(row => row.showOnAllBirds).map(row => [
    row.key, row.filename ?? "", row.common, row.scientific, row.album,
    String(!!row.unsure), String(!!row.speciesUnresolved), String(row.showOnBirds), String(row.showOnAllBirds),
  ]);
  const csv = [columns, ...rows].map(row => row.map(value => '"' + value.replaceAll('"', '""') + '"').join(",")).join("\r\n");
  return new Response(csv + "\r\n", { headers: { "Content-Type": "text/csv; charset=utf-8" } });
}
