# muralibalki.com

Personal research site and technical blog for Balakrishnan (Murali) Narayanaswamy.

The site preserves the dense, slightly irreverent tone of the original Google Site while adding a dedicated seven-part writing series on AI agents as information-processing systems.

## What is included

- About and professional trajectory
- Writing index and seven article templates
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

## Deploy to Cloudflare Workers

Connect this repository in the Cloudflare dashboard, or deploy from the command line after authenticating Wrangler:

```bash
npm run build
npx wrangler deploy
```

The site is built with React, Next-compatible routes, Vinext, Vite, and Cloudflare Workers.

## Editing the blog

The series metadata lives in `app/site-data.ts`. Article templates live at `app/writing/[slug]/page.tsx`; replace the placeholder body with each completed essay or split posts into individual content modules as the series grows.

## Disclaimer

The postings on this site are the author's own and do not necessarily represent Amazon's positions, strategies, or opinions.
