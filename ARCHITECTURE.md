# BaziGPT — Architecture

This document explains how BaziGPT is put together and the reasoning behind the
main decisions. For setup and feature overview, see [README.md](README.md).

## Overview

BaziGPT is a single-page React app served as static assets, backed by a set of
Vercel serverless functions and a Neon Postgres database. There is no traditional
long-running server — the frontend talks directly to `/api/*` functions, which in
turn call OpenAI and Neon.

```
Browser (React SPA)
   │
   ├─ static assets (Vite build, served by Vercel CDN)
   │
   └─ /api/*  ──► Vercel serverless functions
                    ├─ OpenAI Chat Completions  (readings, forecasts)
                    └─ Neon serverless Postgres  (famous-people dataset)
```

## Frontend

- **Vite 6 + React 18 + TypeScript** with project references (`tsc -b`).
- **Routing** is centralized in [`src/routes/index.tsx`](src/routes/index.tsx): a
  single array of `{ path, component, title, description }`. Every page is
  `React.lazy`-loaded, so each route is its own code-split chunk. `App.tsx` maps the
  array to `<Route>`s — adding a page never touches `App.tsx`.
- **Pages vs components.** `src/pages/*` are thin route wrappers that own per-route
  SEO (`react-helmet-async`) and delegate to feature components in
  `src/components/*`. `Home` is a mode switcher between `SoloReading` and
  `CompatibilityReading`.
- **UI layer.** Tailwind CSS v4 with shadcn/ui components built on Radix primitives
  (`src/components/ui/*`). Shared reading building blocks (birth inputs, share
  dialog, markdown renderers) live in `src/components/reading/*`.
- **Design system** ("Celestial Noir") lives in `src/index.css` as design tokens
  plus a motion utility layer, and in `src/components/brand/*` (animated celestial
  background, page hero, cosmic loader, scroll-reveal wrapper). All motion is gated
  behind `prefers-reduced-motion`.

> **Migration note:** the app was moved off Material-UI + Emotion onto Tailwind v4 +
> shadcn. This removed the MUI core chunk (~289 KB) and the entire CSS-in-JS runtime,
> the dominant cost in the old mobile LCP/TBT numbers.

## Internationalization

i18next + react-i18next with browser language detection. Locale bundles for English,
Thai, and Chinese live in `src/i18n/locales/*.json`. Language is a client-side
concern at a single URL set (no per-language routes), so the picker swaps the active
bundle in place.

## Backend (`/api`)

Each file in `api/` is an independent Vercel function:

| Function | Responsibility |
| --- | --- |
| `bazi-reading.ts` | Solo Four Pillars reading |
| `bazi-followup.ts` | Targeted follow-up questions |
| `bazi-compatibility.ts` | Two-chart compatibility reading |
| `daily-bazi.ts` / `daily-bazi-status.ts` | Shared daily forecast (+ status) |
| `daily-personal-forecast.ts` | Personalized daily forecast |
| `daily-share-card-png.ts` / `daily-share-card-portrait.ts` | Server-rendered share images |
| `famous/index.ts` · `famous/[slug].ts` · `famous/categories.ts` | Famous-people dataset |
| `sitemap.ts` | Dynamic sitemap (static routes + famous slugs from the DB) |

Shared concerns are factored out: [`src/utils/openai-util.ts`](src/utils/openai-util.ts)
wraps the OpenAI call (typed request/response), and
[`src/services/neondb.ts`](src/services/neondb.ts) exports the Neon SQL client. The
OpenAI key is **server-side only** (`OPENAI_API_KEY`) — it is never shipped to the
browser.

### Caching

Read-mostly endpoints (famous list, categories, sitemap) set
`Cache-Control: s-maxage / stale-while-revalidate` so Vercel's edge absorbs repeat
traffic instead of hitting Neon on every request. The daily forecast is cached by day
so a single OpenAI generation is reused by all visitors.

## SEO

- Per-route meta via `react-helmet-async`; static defaults + JSON-LD in `index.html`.
- A **dynamic sitemap** ([`api/sitemap.ts`](api/sitemap.ts)) reads famous-person slugs
  from the database, so newly added charts are indexed without editing a static file.
  `vercel.json` rewrites `/sitemap.xml` → `/api/sitemap`.
- Canonical domain is `https://www.bazigpt.io`; the apex 307-redirects to www, and all
  canonical/OG/sitemap/robots URLs point to www to avoid duplicate-content splitting.

## Share cards

Reading cards are composed in the DOM and rasterized client-side with `html2canvas`.
Because html2canvas can't parse modern CSS color functions, the card surfaces
(`ShareCardBase`, `ShareMarkdown`) deliberately use **inline hex styles only** rather
than Tailwind theme utilities. Daily cards are additionally available as
server-rendered PNGs via the `daily-share-card-*` functions.

## Error handling & PWA

- A top-level `ErrorBoundary` wraps the app; a dev-only `/test-error` route exercises it.
- A service worker (`public/sw.js`) is registered in production only, providing offline
  caching and an auto-update flow.

## Adding a new page

1. Create `src/pages/NewPage.tsx` (a thin wrapper with its `<Helmet>` SEO).
2. Add a `lazy(() => import('../pages/NewPage'))` entry to the `routes` array in
   `src/routes/index.tsx` with its `title` and `description`.

That's it — routing, code-splitting, and the layout/footer are handled centrally.
