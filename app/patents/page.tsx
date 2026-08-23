import type { Metadata } from "next";
import { Frame, PageHeader } from "../site-chrome";
import { patents } from "../site-data";

export const metadata: Metadata = { title: "Patents" };

export default function Patents() {
  return (
    <Frame>
      <article className="content-page">
        <PageHeader kicker="PATENTS" title="things with numbers" description="Selected patents across databases, machine learning systems, dialog, forecasting, and energy systems." />
        <div>
          {patents.map(([year, title, number]) => (
            <article className="patent-row" key={number}>
              <span>{year}</span><h2>{title}</h2><span>{number}</span>
            </article>
          ))}
        </div>
      </article>
    </Frame>
  );
}
