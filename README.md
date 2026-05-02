# wjwang.dev

WJWang 個人技術部落格。每篇文章是一個獨立的 React 元件 (`content.tsx`)，由 LLM 從 markdown 轉換而來；build script 自動產生 manifest、search index、sitemap、RSS。Next.js App Router static export，部署到 GitHub Pages。

**Live:** https://wjwang.dev

## Quick-start

```bash
# Prereqs: Node 20+, pnpm 9+
corepack enable
pnpm install

# Build the UI Kit (required before tests/dev)
pnpm --filter @wjwang/ui build

# Generate content artifacts (manifest, search index, RSS)
pnpm build:articles

# Run dev server
pnpm dev
# → http://localhost:3000

# Run all tests
pnpm vitest run
```

## Tech stack

- **Framework:** Next.js 15 (App Router, `output: 'export'`)
- **UI:** React 19 + Tailwind CSS v4 + shadcn/ui (Radix)
- **Lang:** TypeScript (strict)
- **Tests:** Vitest + @testing-library/react
- **Monorepo:** pnpm workspaces
- **Build (lib):** tsup (ESM)
- **Search:** fuse.js (client-side, lazy-loaded)
- **Deploy:** GitHub Actions → GitHub Pages (custom domain `wjwang.dev`)

## Project structure

```
wjwang.dev/
├── apps/web/              # Next.js site (static export)
├── packages/ui/           # @wjwang/ui — components, theme, types
├── content/articles/      # First-class article folders
│   └── {slug}/
│       ├── metadata.yml         # title, excerpt, date, tags, ...
│       ├── originalcontent.md   # raw markdown source
│       ├── content.tsx          # React component (LLM-converted)
│       └── assets/              # per-article images
├── scripts/               # build-articles, new-article, validate-article, dev
├── prompts/md-to-tsx.md   # LLM system prompt for MD → TSX conversion
├── docs/superpowers/      # Spec + implementation plan
└── .github/workflows/     # CI (Pages deploy)
```

## Authoring workflow

```bash
# 1. Scaffold a new article folder
pnpm new:article my-new-post

# 2. Edit content/articles/my-new-post/metadata.yml + originalcontent.md
#    Drop image assets into content/articles/my-new-post/assets/

# 3. Convert MD → TSX using your preferred LLM (Claude / GPT / etc)
#    Feed it the contents of prompts/md-to-tsx.md as system prompt
#    Paste originalcontent.md as user input
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

## Scripts reference

| Script | Purpose |
|---|---|
| `pnpm dev` | chokidar watcher rebuilds articles + spawns Next dev |
| `pnpm build` | full production build (UI Kit → articles → Next export) |
| `pnpm preview` | serve the static export locally |
| `pnpm build:articles` | scan content/, validate, emit manifest/search/RSS, mirror assets |
| `pnpm new:article <slug>` | scaffold new article folder |
| `pnpm validate:article <slug>` | check metadata schema, imports, asset refs |
| `pnpm vitest run` | run all tests |
| `pnpm typecheck` | TypeScript check across workspaces |

## Deployment

CI/CD via `.github/workflows/deploy.yml` (push to `main` → build → upload artifact → Pages deploy).

### Manual GitHub Pages setup (one-time)

1. Repo Settings → Pages → Source = **GitHub Actions**
2. Custom domain = `wjwang.dev`, tick **Enforce HTTPS**
3. DNS at registrar:
   - 4 × `A` records → `185.199.108.153`, `109.153`, `110.153`, `111.153`
   - 1 × `CNAME` record → `www` → `<user>.github.io`

The repo root `CNAME` file (containing `wjwang.dev`) is mirrored to `apps/web/public/CNAME` by `build:articles` so it ends up in `out/CNAME`.

## Documentation

- **Design spec:** [docs/superpowers/specs/2026-05-02-wjwang-blog-design.md](docs/superpowers/specs/2026-05-02-wjwang-blog-design.md) — architecture decisions, component API, content schema
- **Implementation plan:** [docs/superpowers/plans/2026-05-02-wjwang-blog.md](docs/superpowers/plans/2026-05-02-wjwang-blog.md) — phase-by-phase task breakdown
- **LLM prompt:** [prompts/md-to-tsx.md](prompts/md-to-tsx.md) — content conversion guide

## License

Private. © 2026 WJWang.
