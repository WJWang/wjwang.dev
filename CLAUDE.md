# CLAUDE.md — How to Work in This Repo

> Read this before touching anything. README covers quickstart + structure. This file covers the **surprises**.

## Project at a glance

Personal tech blog (wjwang.dev) built as a pnpm monorepo. Every article is a hand-authored React component (`content.tsx`) converted from Markdown by an LLM — no CMS, no MDX runtime. Next.js 15 App Router with `output: 'export'` deploys to GitHub Pages as a fully static site.

## Quickstart for any change

```bash
# Always in this order:
pnpm --filter @wjwang/ui build   # 1. Build UI Kit — dist/ must exist before anything else
pnpm build:articles               # 2. Emit manifest/search/RSS/mirror assets
pnpm dev                          # 3. Dev server (chokidar watches both)

pnpm vitest run                   # Tests — requires step 1 to have run
pnpm typecheck                    # TS across all workspaces
```

See README for full scripts reference.

## Stack-level gotchas

### Tailwind v4 + monorepo symlinks

**Problem:** Tailwind v4 content auto-detection doesn't follow workspace symlinks inside `node_modules/`. Classes defined in `packages/ui/src` or `content/articles/*.tsx` are silently dropped from the CSS bundle.

**Fix:** Explicit `@source` directives in `apps/web/src/app/globals.css`:

```css
@source "../../../../packages/ui/src/**/*.{ts,tsx}";
@source "../../../../content/articles/**/*.tsx";
```

If you see a class working in dev but missing in prod (or vice versa), this is usually why.

---

### tsup + Next 15 RSC: `'use client'` gets stripped

**Problem:** tsup/esbuild strips source-level `'use client'` directives during bundling. Without them, Next 15 treats everything as RSC and breaks on hooks/event handlers.

**Fix:** Two separate tsup config entries in `packages/ui/tsup.config.ts`:
- `components/index` + `primitives/index` → built with `banner: { js: "'use client';" }` at the top of the output
- `article/index`, `index`, `types/index`, `tailwind.preset` → no banner (RSC-safe)

Never merge these into one entry or the RSC boundary breaks.

---

### Next 15.5 + `output: 'export'` + empty `generateStaticParams`

**Problem:** If `generateStaticParams()` returns `[]` (no articles yet) on a dynamic route page, the build throws "no prerendered routes" and aborts.

**Fix:** Add `export const revalidate = 0;` to the dynamic route page (`[slug]/page.tsx`). Also set `export const dynamicParams = false;` so unknown slugs 404 cleanly.

---

### Next 15.5 + `output: 'export'` + route handlers (`sitemap.ts`, `robots.ts`, `manifest.ts`)

**Problem:** These special Next route handlers aren't treated as static by default under `output: 'export'`, causing build failures.

**Fix:** Add `export const dynamic = 'force-static';` at the top of each file.

---

### Vitest 4 + workspace package imports resolve to source, not dist

**Problem:** Vitest's module resolver finds `packages/ui/src` via workspace symlink, but the package exports point at `dist/`. Type-only imports work; runtime component imports fail with "cannot find module".

**Fix:** Root `vitest.config.ts` has `resolve.alias` entries hardcoded to `packages/ui/dist/...`. **The UI Kit must be built before running tests.** If tests fail with module-not-found errors, run `pnpm --filter @wjwang/ui build` first.

---

### Vitest 4 + `@testing-library/jest-dom` setup

**Problem:** OXC (Vitest 4's TS resolver) has a bug resolving a local wrapper file that re-exports `@testing-library/jest-dom/vitest` — it loses type augmentations.

**Fix:** In `vitest.config.ts`, use `setupFiles: ['@testing-library/jest-dom/vitest']` directly. Do not create a local `vitest.setup.ts` wrapper that re-exports it.

---

### React 19 alignment

Next 15 requires React 19. `@testing-library/react@16` requires React 19. The UI Kit's `peerDependencies` accept `^18.3.0 || ^19.0.0` for consumer flexibility, but its own `devDependencies` are locked to React 19. Don't downgrade.

---

### Version pinnings — do NOT bump these majors

| Package | Pinned | Why |
|---|---|---|
| `react-day-picker` | `^8.x` | v9+ rewrites the API; breaks shadcn Calendar primitive |
| `recharts` | `^2.x` | v3+ changes chart component API; breaks shadcn Chart |
| `react-resizable-panels` | `^2.x` | v3 changes prop API; breaks shadcn ResizablePanel |

These are shadcn peer constraints. Check the shadcn changelog before bumping.

---

### GH Actions + pnpm version conflict

**Problem:** Setting `version:` in `pnpm/action-setup@v4` when `package.json` already has a `packageManager` field causes a conflict and fails CI.

**Fix:** Omit `version:` from `pnpm/action-setup`. The action reads the version from `packageManager: "pnpm@9.12.0"` in root `package.json` automatically. The deploy workflow comment says "version pinned via root package.json `packageManager` field" — keep it that way.

---

## Authoring an article

Full workflow in README. The non-obvious part:

- The LLM prompt is at `prompts/md-to-tsx.md` — feed its contents as the system prompt, then paste `originalcontent.md` as the user message.
- `content.tsx` must be a default-exported React component with no external state or data fetching — it's lazy-loaded at runtime by the article page.
- Run `pnpm validate:article <slug>` after conversion; it catches bad imports and missing assets before you hit the build.

## Adding a new UI component

| Where it belongs | Use case |
|---|---|
| `packages/ui/src/article/` | Article-body building blocks (prose, callout, code block, figure) — used by content.tsx files |
| `packages/ui/src/components/` | Site-layout components shared across pages (header, nav, cards) — needs `'use client'` if interactive |
| `packages/ui/src/primitives/` | Raw Radix/shadcn primitives — always gets `'use client'` banner |
| `apps/web/src/components/` | Site-specific components that depend on Next.js or app-level data (search command, JSON-LD) |

If a component uses `useState`/`useEffect` or Radix interactivity, it goes in `components/` or `primitives/` (gets the banner). Pure RSC-safe components go in `article/` or `index`.

After adding to `packages/ui`, run `pnpm --filter @wjwang/ui build` before importing in the app or tests.

## When tests fail unexpectedly

1. **First check:** did `packages/ui/dist/` get built? Run `pnpm --filter @wjwang/ui build`.
2. **Second check:** did you add a new export to the UI Kit without rebuilding? Same fix.
3. **Third check:** `vitest.config.ts` `resolve.alias` points at specific `dist/*.js` files — if you renamed an entry point in `tsup.config.ts`, update the alias map.
4. **React act() warnings** in component tests are usually harmless but indicate async state updates; wrap assertions in `await act(async () => { ... })` if flaky.

## Commit conventions

```
feat(scope): add X
fix(scope): correct Y
chore: update deps
docs: update Z
ci: fix pnpm version conflict
perf(scope): reduce bundle size
```

Scope is usually `ui`, `web`, `content`, `scripts`, or `ci`. Claude commits append:

```
Co-Authored-By: Claude <noreply@anthropic.com>
```

## Deploy

Push to `main` → `.github/workflows/deploy.yml` → GitHub Pages.

- Build order in CI matches local: UI Kit → articles → Next export
- Custom domain `wjwang.dev` is set by `CNAME` at repo root; `build:articles` mirrors it to `apps/web/public/CNAME` so it lands in `out/CNAME`
- HTTPS via Let's Encrypt — auto-provisioned ~5–15 min after first Pages deploy; set in Repo Settings → Pages → Enforce HTTPS
- DNS: 4 × `A` records to GitHub Pages IPs + `CNAME www → <user>.github.io` (see README for IPs)
