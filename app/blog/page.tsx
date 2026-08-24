import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "../blog-data";
import { Frame, PageHeader } from "../site-chrome";

export const metadata: Metadata = { title: "Blog" };

export default function Blog() {
  return (
    <Frame>
      <article className="content-page">
        <PageHeader
          kicker="BLOG"
          title="notes from the gap"
          description="Occasional writing on research, systems, AI, databases, and whatever refuses to fit neatly into one community."
        />
        <div className="blog-list">
          {blogPosts.map((post, index) => (
            <article className="blog-card" key={post.slug}>
              <div className="blog-card-meta">
                <span>{String(index + 1).padStart(2, "0")}</span>
                {post.date ? <time dateTime={post.date}>{post.date}</time> : null}
              </div>
              <h2><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2>
              <p>{post.description}</p>
              <Link className="read-link" href={`/blog/${post.slug}`}>Read post →</Link>
            </article>
          ))}
        </div>
      </article>
    </Frame>
  );
}

