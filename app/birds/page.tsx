import { Frame } from "../site-chrome";
import review from "./review.json";
import catalog from "./catalog.json";
import { BirdTable } from "./table";

export const metadata = { title: "Bird photographs" };

export default function Birds() {
  return <Frame><article className="content-page">
    <BirdTable birds={catalog} initial={review} />
  </article></Frame>;
}
