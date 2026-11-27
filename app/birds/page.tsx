import { Frame } from "../site-chrome";
import { birdInventory, speciesCount } from "./collection";
import metadataById from "./photo-metadata.json";
import { PhotoGallery, type GalleryPhoto } from "./photo-gallery";

export const metadata = { title: "Bird photography" };
const dimensions: Record<string, {width: number; height: number; date: string | null}> = metadataById;
const photos = new Map<string, GalleryPhoto>();
for (const row of birdInventory) {
  if (!row.showOnBirds) continue;
  let photo = photos.get(row.id);
  if (!photo) {
    const details = dimensions[row.id];
    photo = {
      id: row.id, filename: row.filename ?? row.id, album: row.album,
      src: row.archive ? `/all-bird-photos/${row.id}.webp` : `/bird-photos/${row.id}.jpg`,
      width: details?.width, height: details?.height, date: details?.date ?? null, species: [],
    };
    photos.set(row.id, photo);
  }
  if (!photo.species.some(bird => bird.common === row.common)) {
    photo.species.push({common: row.common, scientific: row.scientific});
  }
}
for (const photo of photos.values()) photo.species.sort((a,b) => a.common.localeCompare(b.common, "en"));

export default function Birds() {
  return <Frame><PhotoGallery photos={[...photos.values()]} total={speciesCount.total} /></Frame>;
}
