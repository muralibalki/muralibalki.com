import type { Metadata } from "next";
import { Frame, PageHeader } from "../site-chrome";
import { recentPapers } from "../site-data";

export const metadata: Metadata = { title: "Research Publications" };

export default function Research() {
  const years = [...new Set(recentPapers.map((paper) => paper.year))];
  return (
    <Frame>
      <article className="content-page">
        <PageHeader kicker="RESEARCH PUBLICATIONS" title="peer-review pressure?" description="Recent work in learned systems, databases, online learning, optimization, and natural-language interfaces." />
        {years.map((year) => (
          <section className="dense-section" key={year}>
            <div className="section-title-row"><h2>{year} :</h2></div>
            <div className="publication-list">
              {recentPapers.filter((paper) => paper.year === year).map((paper) => (
                <article className="publication" key={paper.title}>
                  <div className="publication-meta">{paper.venue}</div>
                  <h3><a href={paper.href} target="_blank" rel="noreferrer">{paper.title}</a></h3>
                  <p>{paper.authors}</p>
                </article>
              ))}
            </div>
          </section>
        ))}
        <p className="article-placeholder">The full historical archive remains available on the <a href="https://sites.google.com/site/muralibalki/research" target="_blank" rel="noreferrer">original publications page ↗</a> while older entries are transferred.</p>
      </article>
    </Frame>
  );
}
