import { Frame } from "../site-chrome";
import review from "./review.json";
import { birdInventory, speciesCount } from "./collection";
import { BirdTable } from "./table";

export const metadata = { title: "Bird photographs" };

export default function Birds() {
  return <Frame><article className="content-page">
    <BirdTable speciesCount={speciesCount} birds={birdInventory.filter(row => row.showOnBirds)} initial={review} />
  </article></Frame>;
}
