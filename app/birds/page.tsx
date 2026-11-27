import { Frame } from "../site-chrome";
import review from "./review.json";
import { featuredBirds, sightingNames } from "./collection";
import { BirdTable } from "./table";

export const metadata = { title: "Bird photographs" };

export default function Birds() {
  return <Frame><article className="content-page">
    <BirdTable sightingNames={sightingNames} birds={featuredBirds} initial={review} />
  </article></Frame>;
}
