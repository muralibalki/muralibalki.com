import type { Metadata } from "next";
import { Frame, PageHeader } from "../site-chrome";
import { sourceResearch } from "../source-content";

export const metadata: Metadata = { title: "Research Publications" };

export default function Research() {
  return (
    <Frame>
      <article className="content-page">
        <PageHeader
          kicker="RESEARCH PUBLICATIONS"
          title="peer-review pressure?"
          description="Work in learned systems, databases, online learning, optimization, natural-language interfaces, energy systems, game theory, vision, and speech."
        />
        <div className="research-archive source-copy">
          {sourceResearch.map((item, index) => {
            if (item.kind === "divider") {
              return <hr key={index} />;
            }
            if (item.kind === "topic") {
              return (
                <h2
                  dangerouslySetInnerHTML={{ __html: item.html }}
                  key={index}
                />
              );
            }
            if (item.kind === "year") {
              return (
                <h3
                  dangerouslySetInnerHTML={{ __html: item.html }}
                  key={index}
                />
              );
            }
            return (
              <p
                className={item.kind === "note" ? "archive-note" : undefined}
                dangerouslySetInnerHTML={{ __html: item.html }}
                key={index}
              />
            );
          })}
        </div>
      </article>
    </Frame>
  );
}
