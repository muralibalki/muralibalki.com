import { marked } from "marked";

type FrontMatter = {
  title?: string;
  description?: string;
  date?: string;
};

export type BlogPost = {
  body: string;
  description: string;
  html: string;
  slug: string;
  title: string;
  date?: string;
};

const markdownFiles = import.meta.glob<string>("/content/blog/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
});

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseMarkdown(source: string): { attributes: FrontMatter; body: string } {
  if (!source.startsWith("---\n")) {
    return { attributes: {}, body: source.trim() };
  }

  const end = source.indexOf("\n---\n", 4);
  if (end === -1) {
    return { attributes: {}, body: source.trim() };
  }

  const attributes: FrontMatter = {};
  for (const line of source.slice(4, end).split("\n")) {
    const match = line.match(/^(title|description|date):\s*(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    attributes[key as keyof FrontMatter] = rawValue.replace(/^["']|["']$/g, "");
  }

  return { attributes, body: source.slice(end + 5).trim() };
}

function plainText(markdown: string) {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_~>#`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export const blogPosts: BlogPost[] = Object.entries(markdownFiles)
  .map(([path, source]) => {
    const filename = path.split("/").at(-1)?.replace(/\.md$/i, "") ?? "Post";
    const { attributes, body } = parseMarkdown(source);
    const fallbackDescription = plainText(body).slice(0, 180);

    return {
      body,
      description: attributes.description ?? `${fallbackDescription}${fallbackDescription.length === 180 ? "…" : ""}`,
      html: marked.parse(body, { async: false }),
      slug: slugify(filename),
      title: attributes.title ?? filename,
      ...(attributes.date ? { date: attributes.date } : {}),
    };
  })
  .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || a.title.localeCompare(b.title));

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

