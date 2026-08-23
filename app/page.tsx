// Internal workspace sites can read the authenticated OpenAI user from the
// forwarded request headers:
//
// import { headers } from "next/headers";
//
// export default async function Home() {
//   const requestHeaders = await headers();
//   const email = requestHeaders.get("oai-authenticated-user-email");
//   const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
//   const fullName =
//     encodedFullName &&
//     requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
//       "percent-encoded-utf-8"
//       ? decodeURIComponent(encodedFullName)
//       : null;
//   const displayName = fullName ?? email;
//   // ...
// }

import Link from "next/link";
import { Frame } from "./site-chrome";
import { posts, recentPapers } from "./site-data";

export default function Home() {
  return (
    <Frame>
      <article className="content-page">
        <header className="page-header">
          <p className="kicker">ABOUT ME</p>
          <h1>Defined by my work?</h1>
        </header>

        <section className="prose-section">
          <h2>Current :</h2>
          <p className="lead">
            I am a Normal Senior Principal Machine Learning Scientist working on
            Statistics, Machine Learning, Artificial Intelligence, Big Data,
            Reinforcement Learning, GenAI—add other buzz words here—making history
            at the one and only Amazon.
          </p>
          <p>
            I lead a team in the Learned Systems Group, within the Data and AI Org
            in AWS, working on products such as Amazon Bedrock, Amazon SageMaker
            Unified Studio, Amazon Redshift and Amazon RDS. Some services I
            pretend to, used to, will or sometimes even do help with—with high
            variance and low mean levels of usefulness—include Amazon Personalize,
            Forecast, Redshift and RDS.
          </p>
          <p>
            My research interests lie at the intersection of AI, optimization,
            learning and inference, particularly using them to understand, model
            and combat noise and uncertainty in real-world applications. My goal
            is to develop novel, somewhat theoretically well-motivated
            optimization algorithms that <code>work</code>.
          </p>
        </section>

        <aside className="note-block">
          <span>NEW</span>
          <div>
            <h2>Notes on agents as information-processing systems</h2>
            <p>
              A seven-part series about models, harnesses, watchmen, feedback,
              and what production data systems can teach us about AI agents.
            </p>
            <Link href="/writing">Start with the overview →</Link>
          </div>
        </aside>

        <section className="dense-section">
          <div className="section-title-row">
            <h2>Recent writing</h2>
            <Link href="/writing">All writing</Link>
          </div>
          <div className="compact-list">
            {posts.slice(0, 4).map((post) => (
              <Link href={`/writing/${post.slug}`} className="compact-row" key={post.slug}>
                <span className="mono">{String(post.part).padStart(2, "0")}</span>
                <strong>{post.title}</strong>
                <span className="muted">{post.status}</span>
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
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

        <section className="prose-section trajectory">
          <h2>Trajectory :</h2>
          <p>
            From 2014–2015 I was a post-doc at UC San Diego in the Machine
            Learning Group and MESL. Before that I was a Research Staff Member
            at IBM Research, India Research Lab, working across high-performance
            computing and smarter energy systems.
          </p>
          <p>
            Before IBM (note the obfuscation of a start date), I was a doctoral
            student in Electrical and Computer Engineering at Carnegie Mellon
            University. My PhD work studied theoretical and algorithmic limits
            for large-scale detection using ideas from information and coding
            theory.
          </p>
        </section>

        <section className="education-grid">
          <h2>Education : <small>(kinda)</small></h2>
          <dl>
            <div><dt>B.E.</dt><dd>Electronics &amp; Communication Engineering · M.S.R.I.T., Bangalore · 2003</dd></div>
            <div><dt>M.S.</dt><dd>Electrical &amp; Computer Engineering · Carnegie Mellon · 2005</dd></div>
            <div><dt>Ph.D.</dt><dd>Electrical &amp; Computer Engineering · Carnegie Mellon · 2011</dd></div>
          </dl>
        </section>
      </article>
    </Frame>
  );
}
