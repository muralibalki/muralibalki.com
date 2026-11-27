import { Frame } from "../site-chrome";
import { BirdTable } from "../birds/table";
import { birdInventory, speciesCount } from "../birds/collection";
import review from "../birds/review.json";

export const metadata = { title: "All birds", robots: { index: false, follow: false } };

export default function AllBirds() {
  return <Frame><article className="content-page">
    <BirdTable speciesCount={speciesCount} birds={birdInventory.filter(row => row.showOnAllBirds)} initial={{...review, title: "All birds"}} collection />
    <p><a href="/bird-inventory.csv" download>Download the bird inventory (CSV)</a></p>
    <p><a href="https://photos.google.com/share/AF1QipPR3pNkf4FF2MzubNoZHeWBiy0ZXZ5k24vOfEYc8TrIXmgaqviq29rcvcaUTS5tKQ?key=eE9mUWVKSy1RNHFqcjRGYkQ1NHZGUnFwZUNSdldn">Open the interesting birds album in Google Photos</a></p>
  </article></Frame>;
}
