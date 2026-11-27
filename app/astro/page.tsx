import { Frame, PageHeader } from "../site-chrome";
import catalog from "./catalog.json";

export const metadata = { title: "Astrophotography" };

export default function Astro() {
  return <Frame><article className="content-page">
    <PageHeader kicker="PHOTOGRAPHY" title="Astrophotography" />
    <div className="astro-gallery">{catalog.map(photo =>
      <figure key={photo.slug}>
        <a href={`/astro-photos/${photo.slug}.jpg`}>
          <img loading="lazy" src={`/astro-photos/${photo.slug}-thumb.jpg`} alt={photo.title} />
        </a>
        <figcaption>
          <h2>{photo.title}</h2>
          <a href={`/astro-photos/${photo.slug}.jpg`}>{photo.filename}</a>
          <p>{photo.note}</p>
        </figcaption>
      </figure>
    )}</div>
    <p>Star fields were matched locally with <a href="https://astrometry.net/">Astrometry.net</a>.
      Object coordinates were checked against Mattia Verga’s <a href="https://github.com/mattiaverga/OpenNGC">OpenNGC</a> (CC BY-SA 4.0).</p>
  </article></Frame>;
}
