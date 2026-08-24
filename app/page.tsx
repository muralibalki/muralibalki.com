import Link from "next/link";
import { Frame } from "./site-chrome";
import { recentPapers } from "./site-data";
import { sourceAbout } from "./source-content";

function SourceParagraph({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  return (
    <p
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function Home() {
  return (
    <Frame>
      <article className="content-page">
        <header className="page-header">
          <p className="kicker">ABOUT ME</p>
          <h1>Defined by my work?</h1>
        </header>

        <figure className="about-portrait">
          {/* Vinext's image optimizer returns 400 on this Cloudflare deployment. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/murali.jpg"
            alt="Balakrishnan (Murali) Narayanaswamy"
            width={431}
            height={386}
          />
        </figure>

        <section className="prose-section source-copy">
          <h2>Current :</h2>
          {sourceAbout.current.map((html, index) => (
            <SourceParagraph
              html={html}
              className={index === 0 ? "lead" : undefined}
              key={html}
            />
          ))}
        </section>

        <section className="dense-section">
          <div className="section-title-row">
            <h2>Recent research</h2>
            <Link href="/research">Research publications</Link>
          </div>
          <div className="publication-list">
            {recentPapers.slice(0, 5).map((paper) => (
              <article className="publication" key={paper.title}>
                <div className="publication-meta">{paper.year} · {paper.venue}</div>
                <h3><a href={paper.href} target="_blank" rel="noreferrer">{paper.title}</a></h3>
                <p>{paper.authors}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="prose-section trajectory source-copy">
          <h2>Trajectory :</h2>
          {sourceAbout.trajectory.map((html) => (
            <SourceParagraph html={html} key={html} />
          ))}
        </section>

        <section className="prose-section source-copy">
          <h2>Service :</h2>
          <ul className="source-list">
            {sourceAbout.service.map((html) => (
              <li dangerouslySetInnerHTML={{ __html: html }} key={html} />
            ))}
          </ul>
        </section>

        <section className="education-grid source-copy">
          <h2>Education : <small>(kinda)</small></h2>
          <dl>
            {sourceAbout.education.slice(0, 3).map((html, index) => (
              <div key={html}>
                <dt>{["B.E.", "M.S.", "Ph.D."][index]}</dt>
                <dd dangerouslySetInnerHTML={{ __html: html }} />
              </div>
            ))}
          </dl>
        </section>
      </article>
    </Frame>
  );
}
