import type { Metadata } from "next";
import { Frame, PageHeader } from "../site-chrome";
import { additionalPatents } from "../site-data";
import { sourcePatents } from "../source-content";

export const metadata: Metadata = { title: "Patents" };

export default function Patents() {
  return (
    <Frame>
      <article className="content-page">
        <PageHeader
          kicker="PATENTS"
          title="things with numbers"
          description="Patents across databases, machine learning systems, dialog, forecasting, and energy systems."
        />
        <div className="patent-archive source-copy">
          {additionalPatents.map((patent) => (
            <article className="patent-source-row" key={patent.number}>
              <h2><a href={patent.href} target="_blank" rel="noreferrer">{patent.title}</a></h2>
              <p>{patent.inventors}</p>
              <p className="patent-number">{patent.number}</p>
            </article>
          ))}
          {sourcePatents.map((patent) => (
            <article className="patent-source-row" key={patent.number}>
              <h2 dangerouslySetInnerHTML={{ __html: patent.title }} />
              {patent.body ? (
                <p dangerouslySetInnerHTML={{ __html: patent.body }} />
              ) : null}
              <p
                className="patent-number"
                dangerouslySetInnerHTML={{ __html: patent.number }}
              />
            </article>
          ))}
        </div>
      </article>
    </Frame>
  );
}
