import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Frame } from "../../site-chrome";
import { posts } from "../../site-data";

export function generateStaticParams() { return posts.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);
  return post ? { title: post.title, description: post.summary } : {};
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);
  if (!post) notFound();
  return (
    <Frame>
      <article className="content-page">
        <header className="article-header">
          <div className="article-meta"><span>Part {String(post.part).padStart(2, "0")} of 07</span><span>·</span><span>{post.status}</span></div>
          <h1>{post.title}</h1>
          <p className="page-description">{post.summary}</p>
        </header>
        <div className="article-body">
          <p className="article-placeholder"><strong>Article template.</strong> Replace this note with the finished essay. The route, title, description, navigation, typography, and share metadata are already in place.</p>
          <h2>The opening example</h2>
          <p>Start with a concrete production failure, observation, or small experiment. Let the example establish the problem before naming the broader claim.</p>
          <h2>The systems argument</h2>
          <p>Connect the example to the model, harness, environment, watchman, and feedback loop. Keep the machinery visible and the abstraction earned.</p>
          <h2>What this changes</h2>
          <p>End with a specific design consequence, an unresolved question, or a bridge to the next article in the series.</p>
          <Link className="back-link" href="/writing">← Back to all writing</Link>
        </div>
      </article>
    </Frame>
  );
}
