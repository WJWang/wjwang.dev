# wjwang.dev

[![Deploy](https://github.com/WJWang/wjwang.dev/actions/workflows/deploy.yml/badge.svg)](https://github.com/WJWang/wjwang.dev/actions/workflows/deploy.yml)
[![Live](https://img.shields.io/badge/live-wjwang.dev-00ff88)](https://wjwang.dev)

> WJWang's personal tech blog.
> Each article is its own React Component (`content.tsx`), converted from markdown by an LLM. A build script scans `content/articles/`, validates `metadata.yml` with zod, then emits a static manifest, fuse-indexed search, sitemap, and RSS. Next.js App Router (`output: 'export'`) ships the result to GitHub Pages on `wjwang.dev`.

**🌏 Live:** <https://wjwang.dev> · **📰 RSS:** <https://wjwang.dev/rss.xml> · **🗺 Sitemap:** <https://wjwang.dev/sitemap.xml>

---

## Table of contents

1. [Quick start](#quick-start)
2. [Architecture at a glance](#architecture-at-a-glance)
3. [Tech stack](#tech-stack)
4. [Project structure](#project-structure)
5. [Authoring a new article](#authoring-a-new-article)
6. [`@wjwang/ui` component reference](#wjwangui-component-reference)
7. [Scripts reference](#scripts-reference)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)
10. [Documentation](#documentation)
11. [Acknowledgments](#acknowledgments)
12. [License](#license)

---

## Quick start

```bash
# Prereqs: Node 20+, pnpm 9+
corepack enable
pnpm install

# REQUIRED: build the UI Kit before tests / dev / build
pnpm --filter @wjwang/ui build

# Generate content artifacts (manifest, search index, RSS)
pnpm build:articles

# Run dev server with chokidar article-watcher
pnpm dev
# → http://localhost:3000

# Run all tests
pnpm vitest run

# Production build + local preview
pnpm build
pnpm preview
# → http://localhost:3000 (serving apps/web/out)
```

> ⚠ Always build `@wjwang/ui` first after a clean clone — the workspace lib is consumed via `dist/`, and tests/build will fail with module-resolution errors otherwise. See [CLAUDE.md](CLAUDE.md) for the full list of stack gotchas.

---

## Architecture at a glance

```
                    ┌────────────────────────────────┐
                    │   content/articles/{slug}/      │  ← author edits these
                    │   • metadata.yml (zod-typed)    │
                    │   • originalcontent.md (source) │
                    │   • content.tsx (LLM-converted) │
                    │   • assets/                     │
                    └──────────────┬─────────────────┘
                                   │
                                   ▼
                    ┌────────────────────────────────┐
                    │   scripts/build-articles.ts     │
                    │   scan → parse → validate →     │
                    │   enrich → emit + mirror        │
                    └──────────────┬─────────────────┘
                                   │
              ┌────────────────────┼─────────────────┐
              ▼                    ▼                 ▼
   articles.generated.ts   search-index.json    rss.xml + assets
              │                    │                 │
              └─────────┬──────────┴─────────┬───────┘
                        ▼                    ▼
                ┌──────────────────────────────────┐
                │ apps/web (Next.js App Router)     │
                │ • SSG via generateStaticParams    │
                │ • cmd+K modal (lazy fuse.js)      │
                │ • sitemap.ts / robots.ts          │
                │ • output: 'export' → out/         │
                └──────────────┬───────────────────┘
                               │
                               ▼
                ┌──────────────────────────────────┐
                │ GitHub Actions → Pages           │
                │ Custom domain: wjwang.dev (HTTPS)│
                └──────────────────────────────────┘
```

**Why this shape?**

- **Per-article folders** decouple content from app code; LLM-generated TSX is easy to diff & version.
- **Build-time manifest** lets pages stay 100% server-renderable / static-exportable.
- **`@wjwang/ui` workspace package** isolates the design system and is publishable later.
- **Fuse.js client search** avoids any server runtime — a single small JSON file does the indexing.

---

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 15** (App Router, `output: 'export'`) | static export, no Node runtime needed in prod |
| UI library | **React 19** | required by Next 15 + testing-library 16 |
| Styling | **Tailwind CSS v4** + custom theme tokens | dark theme, neon-green primary `#00ff88` |
| Components | **shadcn/ui** (Radix primitives) | bundled into `@wjwang/ui/primitives` |
| Language | **TypeScript** (strict + `noUncheckedIndexedAccess`) | one shared `tsconfig.base.json` |
| Build (lib) | **tsup** (ESM only) | per-bundle `'use client'` banner where needed |
| Build (app) | Next.js 15 + `@tailwindcss/postcss` | static HTML out to `apps/web/out/` |
| Tests | **Vitest 4** + `@testing-library/react@16` | jsdom env; root + per-package config |
| Validation | **zod 3** | `ArticleMetadata` schema as single source of truth |
| Search | **fuse.js 7** | client-side, lazy-loaded, weighted (title 3× / tags 2× / excerpt 1×) |
| Markdown rendering | hand-rolled (`Prose` + targeted utilities) | no `react-markdown` at runtime — TSX is authored directly |
| Code highlighting | **react-syntax-highlighter** (Prism, `vscDarkPlus`) | per `<CodeBlock language="...">` |
| Workspace | **pnpm 9** workspaces | `apps/*` + `packages/*` |
| CI/Deploy | **GitHub Actions** → **GitHub Pages** | custom domain `wjwang.dev` with auto-provisioned Let's Encrypt cert |

---

## Project structure

```
wjwang.dev/
├── apps/web/                      # Next.js site (static export target)
│   ├── src/
│   │   ├── app/                   # App Router routes (sitemap.ts, robots.ts, manifest.ts)
│   │   ├── components/            # site-specific: Hero, Sidebar, ArticlesGrid, SearchCommand, JsonLdArticle
│   │   └── lib/                   # site-config, articles helper
│   ├── public/                    # avatar.jpg, og/*.png, mirrored articles assets, CNAME, rss.xml
│   ├── content-generated/         # build outputs (gitignored): articles.generated.ts + search-index.generated.json
│   ├── next.config.mjs            # output: 'export', trailingSlash, transpilePackages
│   └── tailwind.config.ts         # extends @wjwang/ui preset
│
├── packages/ui/                   # @wjwang/ui — design system
│   ├── src/
│   │   ├── components/            # SiteHeader, SiteFooter, GeometricBackground
│   │   ├── article/               # 11 article building blocks (see component reference below)
│   │   ├── primitives/            # 46 shadcn primitives + cn util
│   │   ├── styles/                # theme.css, fonts.css
│   │   └── types/                 # ArticleMetadataSchema (zod) + types
│   ├── tailwind.preset.ts         # CSS-var-mapped utility names
│   └── tsup.config.ts             # client/server split bundles
│
├── content/articles/              # Articles (first-class artifacts)
│   └── {slug}/
│       ├── metadata.yml
│       ├── originalcontent.md
│       ├── content.tsx
│       └── assets/
│
├── scripts/                       # build-articles, new-article, validate-article, dev (chokidar concierge)
│   └── lib/                       # discover, parse-metadata, enrich, emit-{manifest,search,rss}, mirror-assets, validate
│
├── prompts/md-to-tsx.md           # LLM system prompt (rules + examples) for MD → TSX
├── docs/superpowers/              # Spec + implementation plan (decision history)
├── CLAUDE.md                      # Quick reference for stack gotchas + workflow conventions
└── .github/workflows/deploy.yml   # CI: push main → build → Pages deploy
```

---

## Authoring a new article

```bash
# 1. Scaffold a new article folder
pnpm new:article my-new-post

# 2. Edit content/articles/my-new-post/metadata.yml + originalcontent.md
#    Drop image assets into content/articles/my-new-post/assets/

# 3. Convert MD → TSX using your preferred LLM (Claude, GPT, etc.)
#    System prompt: paste contents of prompts/md-to-tsx.md
#    User input:    paste contents of originalcontent.md
#    Save the LLM's output to content/articles/my-new-post/content.tsx

# 4. Validate
pnpm validate:article my-new-post

# 5. Preview
pnpm dev
# → http://localhost:3000/articles/my-new-post

# 6. Commit + push → CI deploys to wjwang.dev
git add content/articles/my-new-post/
git commit -m "feat(content): add my-new-post"
git push
```

`metadata.yml` schema (zod-validated; see `packages/ui/src/types/article.ts`):

```yaml
title: 必填
excerpt: 必填，≤ 280 字
date: 2026-05-02      # YYYY-MM-DD
tags: [Tag1, Tag2]    # ≥ 1

# optional
category: Frontend
featured: false
coverImage: ./assets/cover.jpg
ogImage: ./assets/og.png
draft: false          # if true, excluded from build
updatedAt: 2026-05-03
author: WJWang
readTime: auto        # or "5 分鐘"
slug: explicit-slug   # default: folder name
```

---

## `@wjwang/ui` component reference

Imports allowed inside an article's `content.tsx`:

```tsx
import {
  Prose, CodeBlock, ImageFigure, Callout, KeyTakeaways,
  Quote, Aside, Comparison, ArticleCard, ArticleHero, ArticleLayout,
} from '@wjwang/ui/article';
```

| Component | Purpose | Notable props |
|---|---|---|
| `<Prose>` | Typography wrapper for any rendered markdown-flavor content | `size?: 'base' \| 'lg'` |
| `<CodeBlock>` | Syntax-highlighted code (Prism + vscDarkPlus) | `language`, `filename?`, `highlightLines?` |
| `<ImageFigure>` | Image + caption + aspect-ratio container | `src`, `alt?`, `caption?`, `ratio?` |
| `<Callout>` | Highlighted note box, 5 variants | `variant?: 'info' \| 'warn' \| 'success' \| 'danger' \| 'tip'`, `title?` |
| `<KeyTakeaways>` | Bulleted summary box (default title: "重點摘要") | `items: ReactNode[]`, `title?` |
| `<Quote>` | Featured pull-quote with attribution | `author?`, `source?` |
| `<Aside>` | Side note / digression in dashed box | `title?` |
| `<Comparison>` | Multi-column compare (pros/cons, A/B) | `columns: { title, items, tone? }[]` |
| `<ArticleCard>` | Article card for lists | `meta`, `variant?: 'default' \| 'featured'` |
| `<ArticleHero>` | Article detail hero (title, date, tags, back link) | `meta`, `backHref?` |
| `<ArticleLayout>` | Article page outer shell (hero + content + related) | `meta`, `related?`, `children` |

Full API reference and source: [`packages/ui/src/article/`](packages/ui/src/article).

Site-level layout components (consumed by `apps/web/src/app/layout.tsx`):

```tsx
import { SiteHeader, SiteFooter, GeometricBackground } from '@wjwang/ui/components';
```

---

## Scripts reference

| Script | Purpose |
|---|---|
| `pnpm dev` | chokidar watcher rebuilds articles + spawns Next dev server |
| `pnpm build` | full production build (UI Kit → articles → Next export) |
| `pnpm preview` | serve the static export locally on :3000 |
| `pnpm build:articles` | scan `content/`, validate, emit manifest / search / RSS, mirror assets |
| `pnpm new:article <slug>` | scaffold a new article folder |
| `pnpm validate:article <slug>` | check zod schema, allowed imports, dead asset refs |
| `pnpm vitest run` | run all tests across workspaces |
| `pnpm typecheck` | TypeScript check |
| `pnpm lint` | run lint per package |

---

## Deployment

CI/CD via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): push to `main` → build → upload artifact → Pages deploy. Typical run is ~1.5 minutes.

### One-time GitHub Pages setup

1. Repo Settings → Pages → Source = **GitHub Actions**
2. Custom domain = `wjwang.dev`, tick **Enforce HTTPS** (after cert is provisioned, ~5–15 min after first deploy)
3. DNS at registrar:
   - 4 × `A` records on `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - 1 × `CNAME` on `www` → `WJWang.github.io`

The repo-root `CNAME` file (containing `wjwang.dev`) is mirrored into `apps/web/public/CNAME` by `build:articles`, so it lands in the deploy artifact.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `pnpm test` fails with "Cannot find module '@wjwang/ui/...'" | UI Kit `dist/` missing | `pnpm --filter @wjwang/ui build` |
| Tailwind classes from `@wjwang/ui` not applied (e.g. avatar shows raw size) | Tailwind v4 auto-detect skips workspace symlinks in `node_modules` | already fixed via `@source` directives in `apps/web/src/app/globals.css` — keep them |
| Next.js build "no prerendered routes" error on `[slug]` | `revalidate = 0` on dynamic routes | don't add it — let `generateStaticParams` work |
| Article detail returns 404 in production | dynamic route didn't prerender (see above) | confirm `apps/web/out/articles/<slug>/index.html` exists |
| Build fails with "Multiple versions of pnpm" in CI | `pnpm/action-setup` `version:` conflicts with `packageManager` field | drop `version:` from the action config — `packageManager` is source of truth |
| Vitest can't resolve `'@wjwang/ui/types'` | UI Kit not built before tests | `pnpm --filter @wjwang/ui build` first |
| `react-day-picker` / `recharts` / `react-resizable-panels` API errors after upgrade | major version bump broke shadcn primitives | pin to v8 / v2 / v2 respectively (existing pins must stay) |

For deeper context on stack-level decisions and "why we did it this way" see [CLAUDE.md](CLAUDE.md).

---

## Documentation

- **Design spec:** [`docs/superpowers/specs/2026-05-02-wjwang-blog-design.md`](docs/superpowers/specs/2026-05-02-wjwang-blog-design.md) — architecture decisions, component API, content schema
- **Implementation plan:** [`docs/superpowers/plans/2026-05-02-wjwang-blog.md`](docs/superpowers/plans/2026-05-02-wjwang-blog.md) — phase-by-phase task breakdown
- **LLM prompt:** [`prompts/md-to-tsx.md`](prompts/md-to-tsx.md) — content conversion guide
- **Stack notes:** [`CLAUDE.md`](CLAUDE.md) — gotchas and workflow conventions for any contributor (human or AI)

---

## Acknowledgments

- **shadcn/ui** for the Radix-based component primitives (MIT)
- **Vercel** for Next.js + the App Router static export pipeline
- **Tailwind Labs** for Tailwind CSS v4
- **fuse.js** for the lightweight client-side fuzzy search
- The original visual design (in `reference/blog-ui-theme/`, gitignored locally) was hand-built in Figma and exported via Figma Make

---

## License

Private. © 2026 WJWang. Article content is the author's; site code is unlicensed pending later clarification.
