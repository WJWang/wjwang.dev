# WJWang Blog — Design Spec

**Date**: 2026-05-02
**Status**: Approved (brainstorming phase)
**Source**: `reference/SPEC.md` + `reference/blog-ui-theme/`
**Next step**: invoke `superpowers:writing-plans` to produce implementation plan

---

## 0. Summary

WJWang 個人技術部落格。每篇文章是一個獨立的 React 元件 (`content.tsx`)，
原始 markdown 由 LLM 轉成 TSX。內容資料夾 (`content/articles/{slug}/`) 是
first-class artifact，build script 掃描後產生 manifest、search index、
sitemap、RSS。前端走 Next.js App Router 的 static export，部署到 GitHub
Pages，自訂網域 `wjwang.dev`。UI Kit 抽成 `@wjwang/ui` workspace package。

關鍵決策（brainstorming 共識）：
- **渲染策略**：SSG only（`output: 'export'`）
- **框架**：Next.js App Router
- **Monorepo**：pnpm workspace
- **內容流水線**：build script + zod-validated metadata + dynamic-import loader map
- **域名**：`wjwang.dev` from day 1（無 basePath）
- **主題**：dark only，完全沿用 reference 的 neon green 設計
- **搜尋**：客戶端 fuse.js + cmd-k modal
- **MD→TSX**：手動 LLM 轉換，repo 提供 scaffolder + prompt 範本 + validator

---

## 1. Monorepo 結構

```
wjwang.dev/
├── pnpm-workspace.yaml
├── package.json                               # monorepo-level scripts
├── tsconfig.base.json
├── .nvmrc                                     # Node 20+
├── .github/workflows/deploy.yml
├── CNAME                                      # wjwang.dev
├── README.md
│
├── packages/
│   └── ui/                                    # @wjwang/ui
│       ├── package.json                       # exports map: ., /components, /article, /primitives, /types, /styles/*
│       ├── tsup.config.ts                     # ESM bundle + d.ts
│       ├── tailwind.preset.ts
│       └── src/
│           ├── components/                    # SiteHeader, SiteFooter, GeometricBackground
│           ├── article/                       # ArticleLayout, ArticleCard, ArticleHero, Prose, CodeBlock, ImageFigure, Callout, KeyTakeaways, Quote, Aside, Comparison
│           ├── primitives/                    # shadcn primitives barrel
│           ├── styles/                        # theme.css, fonts.css
│           ├── lib/                           # utils (cn, useMobile)
│           ├── types/                         # ArticleMetadata zod schema + types
│           └── index.ts
│
├── apps/
│   └── web/                                   # Next.js 站點
│       ├── package.json                       # depends on "@wjwang/ui": "workspace:*"
│       ├── next.config.mjs
│       ├── tailwind.config.ts                 # extends @wjwang/ui preset
│       ├── app/                               # App Router routes
│       ├── components/                        # 站點專屬: Hero, Sidebar, SearchCommand, JsonLdArticle
│       ├── lib/                               # site-config, articles, search
│       ├── public/                            # avatar.jpg, og/*, mirrored articles assets, CNAME
│       └── content-generated/                 # build 產物 (git-ignored)
│           ├── articles.generated.ts
│           └── search-index.generated.json
│
├── content/articles/                          # 文章一等公民 (git-tracked, 含 assets)
│   └── {slug}/
│       ├── originalcontent.md
│       ├── metadata.yml
│       ├── content.tsx
│       └── assets/
│
├── scripts/
│   ├── build-articles.ts
│   ├── new-article.ts
│   └── validate-article.ts
│
├── prompts/
│   └── md-to-tsx.md                           # LLM 轉換的 system prompt
│
└── reference/                                 # 既有 figma export，遷移後 archive
```

**理由**
- `content/` 在 root 而不在 `apps/web/`：文章是 first-class artifact，與 app 解耦
- `content-generated/` 在 `apps/web/` 且 git-ignored：build 產物不進版控
- `tsup` bundle UI Kit：行為一致於未來真發布到 npm，IDE 跳轉與 tree-shake 穩定
- Tailwind preset 由 `@wjwang/ui` 出，`apps/web` extend：確保 article TSX 內 class 與 lib 元件 token 一致

---

## 2. 內容流水線

### 2.1 `scripts/build-articles.ts` 生命週期

| Step | 行為 |
|---|---|
| 1. SCAN | `glob('content/articles/*/metadata.yml')` |
| 2. PARSE | yaml → object |
| 3. VALIDATE | zod schema；違規 / 缺檔 → exit 1，錯誤含檔案路徑 |
| 4. ENRICH | slug = folder name（覆蓋優先級 metadata.slug > folder）；`readTime: auto` 時從 `originalcontent.md` 字數估算（中文 300 / 英文 200 字/分）；`coverImage` 路徑解析為 `/articles/{slug}/assets/...`；`draft: true` 直接過濾 |
| 5. SORT | desc by date |
| 6. EMIT | `apps/web/content-generated/articles.generated.ts` + `search-index.generated.json` |
| 7. MIRROR | `content/articles/{slug}/assets/**` → `apps/web/public/articles/{slug}/assets/**`（每次先 rimraf 對應 slug 子目錄） |
| 8. REPORT | 印出新增/變更/移除清單 |
| 9. RSS | 用 `feed` 套件寫 `apps/web/public/rss.xml`（最新 50 篇，只放摘要） |

**執行時機**
- `apps/web/package.json#scripts.prebuild`: `pnpm -w build:articles`
- `pnpm dev`: chokidar 監看 `content/articles/**`，debounce 200ms 重產
- CI 第一步即執行；錯誤 fail-fast

### 2.2 `articles.generated.ts` 形狀

```ts
// AUTO-GENERATED — DO NOT EDIT
import type { ArticleListItem } from '@wjwang/ui/types';

export const articles: ArticleListItem[] = [
  {
    slug: 'react-server-components',
    title: '深入理解 React Server Components',
    excerpt: '探討 RSC 的核心概念...',
    date: '2026-04-28',
    updatedAt: '2026-05-01',
    readTime: '8 分鐘',
    tags: ['React', 'Frontend', 'Performance'],
    category: 'Frontend',
    featured: true,
    coverImage: '/articles/react-server-components/assets/cover.jpg',
    ogImage: '/articles/react-server-components/assets/cover.jpg',
    author: 'WJWang',
  },
  // ...
];

export const articleLoaders: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  'react-server-components': () =>
    import('../../../content/articles/react-server-components/content.tsx'),
  // ...
};
```

`apps/web/app/articles/[slug]/page.tsx` 用法：

```tsx
import { articles, articleLoaders } from '@/content-generated/articles.generated';
import { ArticleLayout } from '@wjwang/ui/article';
import { JsonLdArticle } from '@/components/JsonLdArticle';

export const dynamicParams = false;
export const generateStaticParams = () => articles.map(a => ({ slug: a.slug }));

export const generateMetadata = ({ params }) => {
  const meta = articles.find(a => a.slug === params.slug)!;
  return {
    title: meta.title,
    description: meta.excerpt,
    openGraph: { images: [meta.ogImage ?? meta.coverImage ?? '/og/default.png'] },
    alternates: { canonical: `/articles/${meta.slug}` },
  };
};

export default async function Page({ params }) {
  const meta = articles.find(a => a.slug === params.slug)!;
  const related = articles
    .filter(a => a.slug !== meta.slug && a.tags.some(t => meta.tags.includes(t)))
    .slice(0, 2);
  const Content = (await articleLoaders[params.slug]()).default;
  return (
    <>
      <JsonLdArticle meta={meta} />
      <ArticleLayout meta={meta} related={related}><Content /></ArticleLayout>
    </>
  );
}
```

### 2.3 `search-index.generated.json` 形狀

```json
[
  {
    "slug": "react-server-components",
    "title": "深入理解 React Server Components",
    "excerpt": "探討 RSC 的核心概念...",
    "tags": ["React", "Frontend", "Performance"],
    "category": "Frontend"
  }
]
```

僅放 fuse.js 索引欄位（不含 content 全文）。`SearchCommand` 第一次開啟才 fetch + 初始化 fuse instance。

### 2.4 `ArticleMetadata` zod schema（`packages/ui/src/types/article.ts`）

```ts
import { z } from 'zod';

export const ArticleMetadataSchema = z.object({
  // 必填
  title: z.string().min(1),
  excerpt: z.string().min(1).max(280),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tags: z.array(z.string()).min(1),

  // 選填
  category: z.string().optional(),
  featured: z.boolean().optional().default(false),
  coverImage: z.string().optional(),
  ogImage: z.string().optional(),
  draft: z.boolean().optional().default(false),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  author: z.string().optional().default('WJWang'),
  readTime: z.union([z.literal('auto'), z.string()]).optional().default('auto'),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
});

export type ArticleMetadata = z.infer<typeof ArticleMetadataSchema>;

export type ArticleListItem = Required<Pick<ArticleMetadata,
  'title' | 'excerpt' | 'date' | 'tags' | 'author'>> & {
  slug: string;
  readTime: string;
  updatedAt?: string;
  category?: string;
  featured: boolean;
  coverImage?: string;
  ogImage?: string;
};
```

**Single source of truth**：未來新增欄位只動這檔，型別自動傳遞到 manifest、卡片、SEO、搜尋。

### 2.5 Assets 處理

- Build script 把 `content/articles/{slug}/assets/**` mirror 到 `apps/web/public/articles/{slug}/assets/**`
- `apps/web/.gitignore` 加 `public/articles/`（整個被 mirror 出來的資料夾不進版控；版控只有 `content/articles/{slug}/assets/`）
- TSX 引用一律用字串絕對路徑：`/articles/{slug}/assets/diagram.png`
- `validate-article` 檢查 TSX 內所有 `/articles/{slug}/assets/...` 路徑對應檔案實際存在

---

## 3. UI Kit (`@wjwang/ui`)

### 3.1 Package exports

```json
{
  "name": "@wjwang/ui",
  "type": "module",
  "sideEffects": ["**/*.css"],
  "exports": {
    ".":              { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./components":   { "types": "./dist/components/index.d.ts", "import": "./dist/components/index.js" },
    "./article":      { "types": "./dist/article/index.d.ts",    "import": "./dist/article/index.js" },
    "./primitives":   { "types": "./dist/primitives/index.d.ts", "import": "./dist/primitives/index.js" },
    "./types":        { "types": "./dist/types/index.d.ts",      "import": "./dist/types/index.js" },
    "./styles/theme.css":   "./src/styles/theme.css",
    "./styles/fonts.css":   "./src/styles/fonts.css",
    "./tailwind-preset":    { "types": "./dist/tailwind.preset.d.ts", "import": "./dist/tailwind.preset.js" }
  }
}
```

### 3.2 元件清單與 API

**`@wjwang/ui/primitives`** — shadcn 全套（從 `reference/blog-ui-theme/src/app/components/ui/*` 直搬）。

**`@wjwang/ui/components`** — 站點層級 layout

| 元件 | Props |
|---|---|
| `SiteHeader` | `nav: NavItem[]; socials: SocialLink[]; searchSlot?: ReactNode` |
| `SiteFooter` | `copyright: string` |
| `GeometricBackground` | (none) |

**`@wjwang/ui/article`** — 文章內呈現元件

| 元件 | Props |
|---|---|
| `ArticleCard` | `meta: ArticleListItem; variant?: 'default' \| 'featured'` |
| `ArticleLayout` | `meta: ArticleListItem; related?: ArticleListItem[]; children: ReactNode` |
| `ArticleHero` | `meta: ArticleListItem` |
| `Prose` | `children: ReactNode; size?: 'base' \| 'lg'` |
| `CodeBlock` | `language: string; children: string; filename?: string; highlightLines?: number[]` |
| `ImageFigure` | `src: string; alt?: string; caption?: string; ratio?: '16/9' \| '4/3' \| '1/1' \| string` |
| `Callout` | `variant?: 'info' \| 'warn' \| 'success' \| 'danger' \| 'tip'; title?: string; children: ReactNode` |
| `KeyTakeaways` | `title?: string; items: ReactNode[]` |
| `Quote` | `author?: string; source?: string; children: ReactNode` |
| `Aside` | `title?: string; children: ReactNode` |
| `Comparison` | `columns: { title: string; items: ReactNode[]; tone?: 'pos' \| 'neg' \| 'neutral' }[]` |

**`@wjwang/ui/types`** — `ArticleMetadataSchema`、`ArticleMetadata`、`ArticleListItem`、`NavItem`、`SocialLink`

### 3.3 Theme 分發

- `theme.css` 含所有 CSS variables（`--primary: #00ff88` 等），**完全沿用 reference 的 neon green dark 設計**
- `fonts.css` 含 `@font-face`（reference 的字檔一併搬入 `packages/ui/src/styles/fonts/`）
- `apps/web/app/layout.tsx` 引入順序：fonts → theme → app globals
- `apps/web/tailwind.config.ts` extends `@wjwang/ui/tailwind-preset`，並把 content scan 包含 `packages/ui/src/**` 與 `content/articles/**`

### 3.4 Build pipeline

- `tsup` 出 ESM only、external `react`、`react-dom`、`next`
- `prepublishOnly`: `tsc --noEmit && tsup`
- Workspace 內走 dist（dev 時 `tsup --watch`）

---

## 4. App Routes

### 4.1 Root layout (`app/layout.tsx`)

```tsx
import '@wjwang/ui/styles/fonts.css';
import '@wjwang/ui/styles/theme.css';
import './globals.css';
import { SiteHeader, SiteFooter } from '@wjwang/ui/components';
import { SearchCommand, SearchProvider, SearchTrigger } from '@/components/SearchCommand';
import { NAV, SOCIALS } from '@/lib/site-config';

export const metadata: Metadata = {
  metadataBase: new URL('https://wjwang.dev'),
  title: { default: 'WJWang', template: '%s | WJWang' },
  description: '...',
  openGraph: { siteName: 'WJWang', type: 'website' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <SearchProvider>
          <SiteHeader nav={NAV} socials={SOCIALS} searchSlot={<SearchTrigger />} />
          {children}
          <SiteFooter copyright="© 2026 WJWang. All rights reserved." />
          <SearchCommand />
        </SearchProvider>
      </body>
    </html>
  );
}
```

**搜尋開關線路**：`SearchProvider` 用 React context（或 zustand）管 `isOpen` state。`SearchTrigger` 是站點專屬按鈕（顯示在 header 內、call `setOpen(true)`），透過 `SiteHeader` 的 `searchSlot` props 注入——讓 `@wjwang/ui` 的 `SiteHeader` 不知道搜尋細節，保持解耦。`SearchCommand` 同時掛全域 `cmd+k` listener。

### 4.2 路由清單

| 檔案 | URL | 渲染 | 內容 |
|---|---|---|---|
| `app/page.tsx` | `/` | static | Hero + 1 篇 featured + 最新 6 篇 + Sidebar |
| `app/articles/page.tsx` | `/articles` | static | 全部文章 + tag filter chips + client pagination（每頁 12） |
| `app/articles/[slug]/page.tsx` | `/articles/{slug}` | SSG via `generateStaticParams` | §2.2 |
| `app/tags/page.tsx` | `/tags` | static | tag cloud（字級隨數量） |
| `app/tags/[tag]/page.tsx` | `/tags/{tag}` | SSG | 該 tag 下文章列表 |
| `app/about/page.tsx` | `/about` | static | avatar + bio + socials |
| `app/not-found.tsx` | * | static | 404 + 返回首頁 |
| `app/sitemap.ts` | `/sitemap.xml` | build | §5.3 |
| `app/robots.ts` | `/robots.txt` | build | §5.4 |

### 4.3 站點專屬元件（`apps/web/components/`）

- **`Hero.tsx`** — 從 reference 直搬，文案/avatar 寫死或讀 `lib/site-config.ts`
- **`Sidebar.tsx`** — 100% 從 manifest 聚合 categories（依 `category` 欄位）與 popular tags（top 8）
- **`SearchCommand.tsx`** — cmd-k modal、shadcn `Command` 元件
  - 全域 `cmd+k` / `ctrl+k` hotkey（root layout 常駐）
  - 第一次開啟才 fetch `/search-index.generated.json`（lazy + cache）
  - fuse.js: `threshold: 0.3`、`keys: ['title', 'excerpt', 'tags']`
  - 結果點擊 → `router.push('/articles/{slug}')`
- **`JsonLdArticle.tsx`** — 注入 `BlogPosting` JSON-LD（§5.2）

### 4.4 Loading / error / not-found

- `app/articles/[slug]/not-found.tsx`：slug 對不到時呈現
- 不額外做 `loading.tsx`（純 SSG，無 streaming）
- 各 `error.tsx` 給 client component throw fallback

---

## 5. SEO / Sitemap / RSS / Metadata Pipeline

### 5.1 Per-route metadata

由 `generateMetadata` 提供。Root `template = '%s | WJWang'` 統一站名後綴。

| 路由 | title | description | OG image | canonical |
|---|---|---|---|---|
| `/` | `WJWang` | bio | `/og/home.png` | `/` |
| `/articles` | `所有文章` | 描述 | `/og/home.png` | `/articles` |
| `/articles/[slug]` | `{title}` | `{excerpt}` | `coverImage \|\| ogImage \|\| /og/default.png` | `/articles/{slug}` |
| `/tags` | `標籤` | 描述 | `/og/home.png` | `/tags` |
| `/tags/[tag]` | `標籤：{tag}` | 描述 | `/og/home.png` | `/tags/{tag}` |
| `/about` | `關於` | 描述 | `/og/about.png` | `/about` |

### 5.2 文章頁 JSON-LD

```tsx
// components/JsonLdArticle.tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: meta.title,
  description: meta.excerpt,
  image: meta.coverImage ? new URL(meta.coverImage, 'https://wjwang.dev').toString() : undefined,
  datePublished: meta.date,
  dateModified: meta.updatedAt ?? meta.date,
  author: { '@type': 'Person', name: meta.author, url: 'https://wjwang.dev/about' },
  publisher: { '@type': 'Person', name: 'WJWang', url: 'https://wjwang.dev' },
  mainEntityOfPage: `https://wjwang.dev/articles/${meta.slug}`,
  keywords: meta.tags.join(', '),
})}} />
```

### 5.3 `app/sitemap.ts`

```ts
import type { MetadataRoute } from 'next';
import { articles } from '@/content-generated/articles.generated';

const BASE = 'https://wjwang.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const articleEntries = articles.map(a => ({
    url: `${BASE}/articles/${a.slug}`,
    lastModified: a.updatedAt ?? a.date,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const tags = Array.from(new Set(articles.flatMap(a => a.tags)));
  const tagEntries = tags.map(tag => {
    const inTag = articles.filter(a => a.tags.includes(tag));
    return {
      url: `${BASE}/tags/${encodeURIComponent(tag)}`,
      lastModified: inTag.map(a => a.updatedAt ?? a.date).sort().at(-1)!,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    };
  });

  const homeLast = articles.map(a => a.updatedAt ?? a.date).sort().at(-1)!;

  return [
    { url: BASE,                priority: 1.0, changeFrequency: 'weekly',  lastModified: homeLast },
    { url: `${BASE}/articles`,  priority: 0.9, changeFrequency: 'weekly',  lastModified: homeLast },
    { url: `${BASE}/tags`,      priority: 0.6, changeFrequency: 'monthly', lastModified: homeLast },
    { url: `${BASE}/about`,     priority: 0.5, changeFrequency: 'yearly' },
    ...articleEntries,
    ...tagEntries,
  ];
}
```

### 5.4 `app/robots.ts`

```ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://wjwang.dev/sitemap.xml',
    host: 'https://wjwang.dev',
  };
}
```

### 5.5 RSS

由 `scripts/build-articles.ts` step 9 用 `feed` 套件寫 `apps/web/public/rss.xml`：
- 最新 50 篇
- 只放 excerpt（不放全文）
- 含 cover image 連結（若有）

### 5.6 OG Image

- 預設靜態：`/og/home.png`、`/og/default.png`、`/og/about.png` 三張（手繪 / Figma 出）
- Per-article：作者填 `coverImage` 或 `ogImage` 路徑自動套用
- `next/og` 動態生成留待之後（YAGNI）

### 5.7 Favicon / App Icons / Manifest

`apps/web/app/` 用 Next.js 慣例：
- `icon.png`（32x32 + 192x192）
- `apple-icon.png`（180x180）
- `manifest.webmanifest`（`theme_color: '#080808'`、`background_color: '#080808'`，PWA-ready 但不做 service worker）

### 5.8 Indexing 策略

- 上線即允許 Google 收錄（無 noindex 階段）
- 不裝 analytics（保留之後加 Plausible / Umami 的選項）

---

## 6. 部署 Pipeline

### 6.1 GitHub Pages 設定（一次性）

1. Repo Settings → Pages → Source = **GitHub Actions**
2. Settings → Pages → Custom domain = `wjwang.dev`、勾 **Enforce HTTPS**
3. DNS：
   - `A` records → `185.199.108.153 / 109.153 / 110.153 / 111.153`
   - `CNAME`：`www` → `wjwang.github.io`
4. Repo root 放 `CNAME` 內容單行 `wjwang.dev`；build script 額外 mirror 到 `apps/web/public/CNAME`（避免 next export 時遺失）

### 6.2 `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm -w build:articles
      - run: pnpm --filter @wjwang/ui build
      - run: pnpm --filter web build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: apps/web/out

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 6.3 `next.config.mjs`

```js
/** @type {import('next').NextConfig} */
export default {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  experimental: { typedRoutes: true },
};
```
無 `basePath` / `assetPrefix`（自訂網域 from day 1）。

### 6.4 Root `package.json` scripts

```json
{
  "scripts": {
    "dev":              "tsx scripts/dev.ts",
    "build":            "pnpm -w build:articles && pnpm -r build",
    "preview":          "pnpm --filter web exec npx serve out -p 3000 -L",
    "build:articles":   "tsx scripts/build-articles.ts",
    "new:article":      "tsx scripts/new-article.ts",
    "validate:article": "tsx scripts/validate-article.ts",
    "lint":             "pnpm -r lint",
    "typecheck":        "pnpm -r typecheck"
  },
  "packageManager": "pnpm@9.x"
}
```

### 6.5 PR Preview

不接 Vercel / Cloudflare Pages preview。所有測試走本地 `pnpm dev` / `pnpm preview`。

---

## 7. Dev Workflow

### 7.1 典型流程

```
1. pnpm new:article rsc-deep-dive
2. 編輯 metadata.yml + 寫 originalcontent.md + 放素材到 assets/
3. 把 originalcontent.md 餵給 LLM (Claude/GPT)，搭配 prompts/md-to-tsx.md
   → LLM 產出 content.tsx，貼回去
4. pnpm validate:article rsc-deep-dive
5. pnpm dev → http://localhost:3000/articles/rsc-deep-dive 預覽
6. git commit + push → GH Actions 部署
```

### 7.2 `scripts/new-article.ts`

```bash
$ pnpm new:article rsc-deep-dive
✓ Created content/articles/rsc-deep-dive/
  ├── metadata.yml
  ├── originalcontent.md
  ├── content.tsx
  └── assets/.gitkeep
```

樣板內容：
- `metadata.yml`：必填欄位先填 TODO，`date` 自動帶今天，選填欄位以註解列出
- `content.tsx`：含完整 `import { ... } from '@wjwang/ui/article'` skeleton
- `originalcontent.md`：空檔案

Slug 驗證：`^[a-z0-9-]+$`，違規 reject；資料夾已存在則 fail。

### 7.3 `prompts/md-to-tsx.md`

LLM system prompt，內容規範：

1. **強制規則**
   - 只能 import `@wjwang/ui/article`
   - 一律 default export `Content` 函式
   - 整篇用 `<Prose>` 包起來
   - 圖片一律 `<ImageFigure>`，path = `/articles/{slug}/assets/{filename}`
   - code block 一律 `<CodeBlock language="...">`
   - 不寫客製 heading/paragraph 樣式（交給 `<Prose>`）

2. **元件選用對照表**
   - heading / 段落 / list / 一般 blockquote → `<Prose>` 包原生 HTML
   - fenced code → `<CodeBlock language="..." filename="...">`
   - `![...]()` → `<ImageFigure src="..." alt="..." caption="..." ratio="16/9">`
   - `> 💡 Tip:` / `> ⚠️ Warning:` 等帶 emoji 提示 → `<Callout variant="...">`
   - 文章開頭/結尾「重點摘要」 → `<KeyTakeaways items={[...]}>`
   - 名人引言（含作者） → `<Quote author="..." source="...">`
   - 補充題外話 → `<Aside title="...">`
   - pros/cons 或 A vs B 對照 → `<Comparison columns={[...]}>`

3. **風格慣例**
   - 中英文間保留半形空格
   - 段落保持 3-5 句
   - code block 必填 `language`
   - caption / title 中文化

4. **輸出格式**：直接回傳完整 `content.tsx`，無 markdown fence、無解釋

5. **完整範例**：放 1-2 個 input MD → output TSX 對照

> **維護**：UI Kit 元件 API 變動時必須同步更新此 prompt。

### 7.4 `scripts/validate-article.ts` 檢查項

| 檢查 | 行為 |
|---|---|
| metadata schema | zod 驗證 → fail |
| originalcontent.md 存在且非空 | → fail |
| content.tsx 有 default export | AST 解析 → fail |
| import 來源限制 | 非 `@wjwang/ui/article` 的 import（除 react） → fail |
| 元件存在性 | 用到的 component 名不在 `@wjwang/ui/article` 匯出清單 → fail |
| 圖片路徑 | `/articles/{slug}/assets/X` 對應檔案不存在 → fail |
| dead asset | `assets/` 內檔案 content.tsx 沒用到 → **warn** |
| slug 一致性 | metadata.slug（若有）與資料夾名不符 → fail |
| date 與 updatedAt | updatedAt < date → fail |

CI: `pnpm -w validate:articles --all` 跑全部。

### 7.5 Dev server 概念

```ts
// scripts/dev.ts
import chokidar from 'chokidar';
import { spawn } from 'child_process';
import { rebuildArticles } from './build-articles';

await rebuildArticles();
const next = spawn('pnpm', ['--filter', 'web', 'dev'], { stdio: 'inherit' });

chokidar.watch('content/articles/**', { ignoreInitial: true })
  .on('all', debounce(rebuildArticles, 200));
```

新增/修改文章資料夾 → 自動重產 manifest + mirror assets，Next HMR 撿起 generated 檔。

---

## 8. Migration Plan

### 8.1 高階里程碑

| Milestone | 內容 | 估時 |
|---|---|---|
| M0 | Repo 骨架（pnpm workspace、tsconfig.base、.nvmrc、CNAME、prettier、eslint） | 半天 |
| M1 | `packages/ui` 從 reference 抽出（shadcn primitives、theme.css、fonts、tailwind preset、SiteHeader/Footer/GeometricBackground、tsup pipeline） | 1 天 |
| M2 | Article building blocks（ArticleCard / ArticleLayout / ArticleHero / Prose / CodeBlock / ImageFigure / Callout / KeyTakeaways / Quote / Aside / Comparison） + zod schema | 1-1.5 天 |
| M3 | `apps/web` Next.js 骨架（next.config、layout.tsx、tailwind 接 preset） | 半天 |
| M4 | Content pipeline（build-articles.ts、new-article.ts、validate-article.ts、chokidar dev watcher） | 1 天 |
| M5 | Pages & routes（/、/articles 含 tag chips + pagination、/articles/[slug]、/tags、/tags/[tag]、/about、not-found、Hero、Sidebar、SearchCommand cmd-k） | 1 天 |
| M6 | SEO 收尾（generateMetadata、JsonLdArticle、sitemap.ts、robots.ts、RSS、icons、og 預設圖） | 半天 |
| M7 | `prompts/md-to-tsx.md`（規則 + 對照表 + 慣例 + 範例） | 半天 |
| M8 | 種子文章遷移（從 reference 取 1 篇 dogfood 整個流程） | per-article |
| M9 | Deploy（GH Actions、Pages 設定、CNAME、HTTPS、Lighthouse baseline） | 半天 |
| M10 | reference/blog-ui-theme archive、reference/SPEC.md 改 link 指向本 spec | 5 分 |

### 8.2 依賴圖

```
M0 ─▶ M1 ─┬─▶ M2 ─┐
          └─▶ M3 ─┴─▶ M4 ─▶ M5 ─▶ M6 ─▶ M7 ─▶ M8 ─▶ M9 ─▶ M10
```
M2 與 M3 可並行。

### 8.3 風險與緩解

| 風險 | 緩解 |
|---|---|
| Tailwind v4 + shadcn 在 monorepo 的 content scan 設定踩雷（class 被 purge） | tailwind content 包 `packages/ui/src/**` 與 `content/articles/**`；M3 用簡單頁面驗證 |
| `output: 'export'` 不支援 route handlers / `next/og` 部份功能 | 設計已避開；之後新功能必須先驗 export 相容 |
| react-router-dom v7 → Next.js App Router 改寫 | 集中於 ArticleDetail / ArticleCard / Header；無深度耦合 |
| `dynamic import` 路徑在 monorepo + tsup 下能否被 Next webpack 解析 | M4 用 dummy 文章驗證；不通則 fallback 改 codegen 出明文 import |
| 自訂網域 DNS 生效 lag | 先用 `wjwang.github.io` 預覽；DNS 生效後驗 CNAME |

### 8.4 Definition of Done

- [ ] `pnpm install && pnpm build` 在乾淨 clone 上一次成功
- [ ] `https://wjwang.dev/` 顯示首頁，視覺與 reference 100% 對齊
- [ ] 至少 1 篇種子文章走完 new:article → LLM → validate → deploy 流程
- [ ] `https://wjwang.dev/sitemap.xml` 列出所有 URL
- [ ] `https://wjwang.dev/rss.xml` 可被 RSS reader 解析
- [ ] cmd-k 開搜尋 modal、輸入關鍵字能跳到對應文章
- [ ] Lighthouse 行動版 Performance ≥ 90、SEO = 100、A11y ≥ 95
- [ ] GH Actions 在 push main 後 3 分鐘內完成 deploy

---

## 附錄 A：被否決的方案

- **Astro + React islands**：MD/MDX 不需內建（用 LLM 轉），content collections 優勢消失，留下的 islands 便利不足以對抗「框架熟悉度」與「未來 SSR 遷移彈性」。
- **Vite + vite-react-ssg**：保留現有 Vite 但生態工具最薄，sitemap/RSS/route generation 全要自己拼，長期維護成本高。
- **`output: 'export'` + repo 名 `wjwang.dev`（project site，需 basePath）**：basePath 切換成本高、踩雷常見。改用 custom domain from day 1（C 路線）省掉所有 basePath 邏輯。
- **light/dark theme toggle**：neon green 在淺色背景視覺很弱，硬切會破壞 brand。Dark only。
- **`/categories` 路由**：與 `/tags` 重疊，先不做（metadata.category 仍存在，UI 不曝光）；之後再加成本低。
- **獨立 `/search` 頁**：cmd-k modal 更現代、bundle 更小、與 shadcn Command 契合。
- **Algolia / Pagefind**：fuse.js 對個人 blog 文章量綽綽有餘，零 server cost。
- **`pnpm convert:article` 直接呼叫 Claude API 自動轉 MD→TSX**：綁 API key、未來換模型成本高，先做 prompt + 手動流程。
- **上線初期掛 noindex**：URL 結構靠 zod schema 與 script 鎖定相對穩定，無需延後曝光。
- **接 Vercel / Cloudflare PR preview**：個人 blog，本地 preview 已足夠。
