import { Frame } from "../site-chrome";
import review from "../birds/review.json";
import { birdInventory, speciesCount } from "../birds/collection";
import { BirdTable } from "../birds/table";

export const metadata = { title: "Bird list" };

export default function Birds() {
  return <Frame><article className="content-page">
    <p className="gallery-back"><a href="/birds">Photo gallery</a></p>
    <BirdTable speciesCount={speciesCount} birds={birdInventory.filter(row => row.showOnBirds)} initial={review} />
  </article></Frame>;
}
