import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts, getBlogPost } from "../../blog-data";
import { Frame } from "../../site-chrome";

export function generateStaticParams() {
  return blogPosts.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  return post
    ? { title: post.title, description: post.description }
    : { title: "Post not found" };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <Frame>
      <article className="content-page">
        <header className="article-header">
          <div className="article-meta">
            <span>BLOG</span>
            {post.date ? <time dateTime={post.date}>{post.date}</time> : null}
          </div>
          <h1>{post.title}</h1>
        </header>
        <div
          className="article-body source-copy"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
        <Link className="back-link" href="/blog">← All posts</Link>
      </article>
    </Frame>
  );
}

