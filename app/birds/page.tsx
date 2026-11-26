import { Frame } from "../site-chrome";
import review from "./review.json";
import catalog from "./catalog.json";
import { BirdTable } from "./table";

export const metadata = { title: "Bird photographs" };

export default function Birds() {
  return <Frame><article className="content-page">
    <BirdTable birds={catalog} initial={review} />
    <p>Species identification by <a href="https://huggingface.co/warden123/BirdTrace-FastViT-MA36-10K">BirdTrace FastViT-MA36-10K</a> (CC BY-NC 4.0). Regional ranking powered by <a href="https://birdnet.cornell.edu/">BirdNET</a>.</p>
  </article></Frame>;
}
