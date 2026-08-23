import type { Metadata } from "next";
import Link from "next/link";
import { Frame, PageHeader } from "../site-chrome";
import { posts } from "../site-data";

export const metadata: Metadata = { title: "Writing" };

export default function Writing() {
  return (
    <Frame>
      <article className="content-page">
        <PageHeader kicker="WRITING" title="notes from the systems loop" description="Long-form notes on agents, learned systems, and the untidy distance between a model that works and a product that keeps working." />
        <div className="post-grid">
          {posts.map((post) => (
            <Link className="post-card" href={`/writing/${post.slug}`} key={post.slug}>
              <div className="post-number"><span>Part {String(post.part).padStart(2, "0")}</span><span>{post.status}</span></div>
              <h2>{post.title}</h2>
              <p>{post.summary}</p>
              <span className="read">Read article →</span>
            </Link>
          ))}
        </div>
      </article>
    </Frame>
  );
}
