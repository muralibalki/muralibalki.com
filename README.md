# muralibalki.com

Personal research site and technical blog for Balakrishnan (Murali) Narayanaswamy.

The site preserves the dense, slightly irreverent tone and full archive of the original Google Site.

## What is included

- About and professional trajectory
- Complete original biographical text and links
- Recent research publications
- Patent archive
- Responsive editorial layout
- Metadata and favicon
- Cloudflare Workers configuration

## Local development

Requires Node.js 22.13 or newer.

```bash
npm ci
npm run dev
```

## Production build

```bash
npm run build
```

## Adding blog posts

Add Markdown files to `content/blog`. The filename becomes the post title and URL slug unless optional `title`, `description`, or `date` front matter is provided.

## Deploy to Cloudflare Workers

Connect this repository in the Cloudflare dashboard, or deploy from the command line after authenticating Wrangler:

```bash
npm run build
npx wrangler deploy
```

The site is built with React, Next-compatible routes, Vinext, Vite, and Cloudflare Workers.

## Disclaimer

The postings on this site are the author's own and do not necessarily represent Amazon's positions, strategies, or opinions.
