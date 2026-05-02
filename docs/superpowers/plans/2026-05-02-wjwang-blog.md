# WJWang Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `wjwang.dev` — a personal blog where each article is a TSX component (LLM-converted from MD), built as static export, deployed to GitHub Pages.

**Architecture:** pnpm monorepo with `packages/ui` (`@wjwang/ui` workspace lib) + `apps/web` (Next.js App Router, `output: 'export'`). Articles live in `content/articles/{slug}/`; a `build-articles.ts` script scans the dir, validates `metadata.yml` with zod, and emits `articles.generated.ts` (manifest + dynamic loaders) + `search-index.generated.json` + `rss.xml`. Deploy via GitHub Actions to GH Pages with custom domain `wjwang.dev`.

**Tech Stack:** Next.js 15+ (App Router, static export), React 18, TypeScript (strict), Tailwind CSS v4, shadcn/ui (Radix), tsup, pnpm workspaces, Vitest + @testing-library/react, zod, yaml, fuse.js, feed (RSS), chokidar.

**Spec:** `docs/superpowers/specs/2026-05-02-wjwang-blog-design.md` — read first. Plan tasks reference spec sections.

**Reference UI:** `reference/blog-ui-theme/` — figma export. Visual design is the **source of truth**; migrate, don't redesign.

---

## Phase 0 — Repo Bootstrap

### Task 0.1: pnpm workspace + Node version

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `.nvmrc`
- Modify: `package.json` (root) — currently doesn't exist, will create
- Create: `CNAME`

- [ ] **Step 1: Create `.nvmrc`**

```
20
```

- [ ] **Step 2: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

- [ ] **Step 3: Create root `package.json`**

```json
{
  "name": "wjwang.dev",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@9.12.0",
  "engines": { "node": ">=20" },
  "scripts": {
    "dev":              "tsx scripts/dev.ts",
    "build":            "pnpm -w build:articles && pnpm -r build",
    "preview":          "pnpm --filter web exec serve out -p 3000 -L",
    "build:articles":   "tsx scripts/build-articles.ts",
    "new:article":      "tsx scripts/new-article.ts",
    "validate:article": "tsx scripts/validate-article.ts",
    "lint":             "pnpm -r lint",
    "typecheck":        "pnpm -r typecheck",
    "test":             "pnpm -r test"
  },
  "devDependencies": {
    "tsx": "^4.19.0",
    "typescript": "^5.6.0"
  }
}
```

- [ ] **Step 4: Create `CNAME`**

```
wjwang.dev
```

- [ ] **Step 5: Run `pnpm install` to lock pnpm version**

```bash
corepack enable
pnpm install
```

Expected: `pnpm-lock.yaml` created, no errors.

- [ ] **Step 6: Commit**

```bash
git add pnpm-workspace.yaml .nvmrc package.json CNAME pnpm-lock.yaml
git commit -m "chore: bootstrap pnpm workspace"
```

---

### Task 0.2: TypeScript base config

**Files:**
- Create: `tsconfig.base.json`
- Create: `tsconfig.json` (root, references)

- [ ] **Step 1: Create `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "preserve",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "verbatimModuleSyntax": false,
    "forceConsistentCasingInFileNames": true,
    "useDefineForClassFields": true
  }
}
```

- [ ] **Step 2: Create root `tsconfig.json`**

```json
{
  "files": [],
  "references": [
    { "path": "./packages/ui" },
    { "path": "./apps/web" }
  ]
}
```

> Note: package-level tsconfigs will be created in their respective tasks (1.1, 3.1). The root file just declares references.

- [ ] **Step 3: Commit**

```bash
git add tsconfig.base.json tsconfig.json
git commit -m "chore: add base TypeScript config"
```

---

### Task 0.3: Linting & formatting

**Files:**
- Create: `.prettierrc.json`
- Create: `.prettierignore`
- Create: `.editorconfig`

- [ ] **Step 1: Create `.prettierrc.json`**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

- [ ] **Step 2: Create `.prettierignore`**

```
node_modules
.next
dist
out
pnpm-lock.yaml
**/content-generated/**
**/public/articles/**
reference/
```

- [ ] **Step 3: Create `.editorconfig`**

```
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
```

- [ ] **Step 4: Add prettier as root devDependency**

```bash
pnpm add -Dw prettier prettier-plugin-tailwindcss
```

- [ ] **Step 5: Commit**

```bash
git add .prettierrc.json .prettierignore .editorconfig package.json pnpm-lock.yaml
git commit -m "chore: add prettier + editorconfig"
```

> ESLint is intentionally deferred — Next.js installs its own eslint config in Task 3.1, and `@wjwang/ui` follows that style. No standalone eslint root config.

---

### Task 0.4: Vitest setup at root

**Files:**
- Create: `vitest.config.ts` (root)

- [ ] **Step 1: Add Vitest deps to root**

```bash
pnpm add -Dw vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 2: Create root `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'packages/**/src/**/*.test.{ts,tsx}',
      'apps/**/src/**/*.test.{ts,tsx}',
      'scripts/**/*.test.ts',
    ],
  },
});
```

- [ ] **Step 3: Add `@vitejs/plugin-react`**

```bash
pnpm add -Dw @vitejs/plugin-react
```

- [ ] **Step 4: Create `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts vitest.setup.ts package.json pnpm-lock.yaml
git commit -m "chore: add vitest + testing-library setup"
```

---

## Phase 1 — UI Kit Foundation (`@wjwang/ui`)

### Task 1.1: Create `packages/ui` skeleton

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Create: `packages/ui/src/index.ts`

- [ ] **Step 1: Create `packages/ui/package.json`**

```json
{
  "name": "@wjwang/ui",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "sideEffects": ["**/*.css"],
  "exports": {
    ".":              { "types": "./dist/index.d.ts",            "import": "./dist/index.js" },
    "./components":   { "types": "./dist/components/index.d.ts", "import": "./dist/components/index.js" },
    "./article":      { "types": "./dist/article/index.d.ts",    "import": "./dist/article/index.js" },
    "./primitives":   { "types": "./dist/primitives/index.d.ts", "import": "./dist/primitives/index.js" },
    "./types":        { "types": "./dist/types/index.d.ts",      "import": "./dist/types/index.js" },
    "./styles/theme.css":   "./src/styles/theme.css",
    "./styles/fonts.css":   "./src/styles/fonts.css",
    "./tailwind-preset":    { "types": "./dist/tailwind.preset.d.ts", "import": "./dist/tailwind.preset.js" }
  },
  "scripts": {
    "build":     "tsup",
    "dev":       "tsup --watch",
    "typecheck": "tsc --noEmit",
    "test":      "vitest run",
    "lint":      "echo 'no lint'"
  },
  "peerDependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.0.0",
    "zod": "^3.23.8",
    "lucide-react": "^0.487.0",
    "react-syntax-highlighter": "^16.1.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/react-syntax-highlighter": "^15.5.13",
    "tsup": "^8.3.0",
    "typescript": "^5.6.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  }
}
```

- [ ] **Step 2: Create `packages/ui/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "noEmit": true
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules", "**/*.test.ts", "**/*.test.tsx"]
}
```

- [ ] **Step 3: Create `packages/ui/src/index.ts`**

```ts
export * from './components';
export * from './article';
export * from './primitives';
export * from './types';
```

- [ ] **Step 4: Create empty barrel files**

```ts
// packages/ui/src/components/index.ts
export {};

// packages/ui/src/article/index.ts
export {};

// packages/ui/src/primitives/index.ts
export {};

// packages/ui/src/types/index.ts
export {};
```

- [ ] **Step 5: Install deps**

```bash
pnpm install
```

- [ ] **Step 6: Commit**

```bash
git add packages/ui/ pnpm-lock.yaml
git commit -m "feat(ui): scaffold @wjwang/ui package skeleton"
```

---

### Task 1.2: tsup build config

**Files:**
- Create: `packages/ui/tsup.config.ts`

- [ ] **Step 1: Create `tsup.config.ts`**

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'index':            'src/index.ts',
    'components/index': 'src/components/index.ts',
    'article/index':    'src/article/index.ts',
    'primitives/index': 'src/primitives/index.ts',
    'types/index':      'src/types/index.ts',
    'tailwind.preset':  'src/tailwind.preset.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  esbuildOptions(opts) {
    opts.jsx = 'automatic';
  },
});
```

- [ ] **Step 2: Verify build runs (will produce empty bundles since src is empty)**

```bash
pnpm --filter @wjwang/ui build
```

Expected: `packages/ui/dist/` created with `.js` and `.d.ts` for each entry. No errors.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/tsup.config.ts
git commit -m "feat(ui): add tsup build config"
```

---

### Task 1.3: Migrate theme.css and fonts from reference

**Files:**
- Create: `packages/ui/src/styles/theme.css`
- Create: `packages/ui/src/styles/fonts.css`
- Create: `packages/ui/src/styles/fonts/` (directory for font files)

- [ ] **Step 1: Copy theme.css from reference**

```bash
cp reference/blog-ui-theme/src/styles/theme.css packages/ui/src/styles/theme.css
```

- [ ] **Step 2: Copy fonts.css from reference**

```bash
cp reference/blog-ui-theme/src/styles/fonts.css packages/ui/src/styles/fonts.css
```

- [ ] **Step 3: Inspect fonts.css and copy any referenced font files**

```bash
cat reference/blog-ui-theme/src/styles/fonts.css
# If it references local font files (woff2 etc.), copy them:
# cp reference/blog-ui-theme/src/styles/fonts/* packages/ui/src/styles/fonts/
# Adjust @font-face url() paths in fonts.css to be relative if needed.
```

- [ ] **Step 4: Mark `packages/ui/src/styles/` as side-effecting in tsup**

Already covered by `"sideEffects": ["**/*.css"]` in package.json. Verify CSS is **not** bundled by tsup (it's exported via package.json `exports` map directly from `src/`, intentional — Tailwind v4 needs raw CSS).

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/styles/
git commit -m "feat(ui): migrate theme.css and fonts.css from reference"
```

---

### Task 1.4: Tailwind v4 preset

**Files:**
- Create: `packages/ui/src/tailwind.preset.ts`

- [ ] **Step 1: Add Tailwind v4 to ui devDeps**

```bash
pnpm --filter @wjwang/ui add -D tailwindcss@^4.1.0 @tailwindcss/postcss@^4.1.0
```

- [ ] **Step 2: Create `tailwind.preset.ts`**

```ts
import type { Config } from 'tailwindcss';

const preset = {
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        destructive: 'var(--destructive)',
        'destructive-foreground': 'var(--destructive-foreground)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
} satisfies Partial<Config>;

export default preset;
```

> Why preset shape: Tailwind v4 reads CSS variables from `theme.css`; preset just maps Tailwind utility names → CSS vars so authors can write `bg-primary text-foreground` etc. The actual values live in `theme.css`.

- [ ] **Step 3: Verify build still works**

```bash
pnpm --filter @wjwang/ui build
```

Expected: `dist/tailwind.preset.js` and `dist/tailwind.preset.d.ts` exist.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/tailwind.preset.ts packages/ui/package.json pnpm-lock.yaml
git commit -m "feat(ui): add tailwind v4 preset"
```

---

### Task 1.5: `cn` utility + tests

**Files:**
- Create: `packages/ui/src/lib/utils.ts`
- Create: `packages/ui/src/lib/utils.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// packages/ui/src/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('drops falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });

  it('resolves Tailwind conflicts (tailwind-merge)', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter @wjwang/ui test -- utils
```

Expected: FAIL with "Cannot find module './utils'".

- [ ] **Step 3: Implement `cn`**

```ts
// packages/ui/src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter @wjwang/ui test -- utils
```

Expected: 3 tests PASS.

- [ ] **Step 5: Re-export `cn` from package root + primitives barrel**

So consumers (e.g. `apps/web`) can `import { cn } from '@wjwang/ui'` or `'@wjwang/ui/primitives'`.

```ts
// packages/ui/src/index.ts (append before barrel exports)
export { cn } from './lib/utils';
```

```ts
// packages/ui/src/primitives/index.ts (prepend)
export { cn } from '../lib/utils';
```

> The primitives barrel will be regenerated in Task 1.6 — re-add this line after the regeneration if it gets clobbered.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/lib/ packages/ui/src/index.ts packages/ui/src/primitives/index.ts
git commit -m "feat(ui): add cn() utility with tests + re-export"
```

---

### Task 1.6: Migrate shadcn primitives

**Files:**
- Create: `packages/ui/src/primitives/*.tsx` (~46 files from reference)
- Create: `packages/ui/src/primitives/index.ts`

- [ ] **Step 1: Copy all shadcn primitives**

```bash
cp -r reference/blog-ui-theme/src/app/components/ui/* packages/ui/src/primitives/
```

- [ ] **Step 2: Fix import paths in each file**

The reference files import `cn` from `./utils.ts` (sibling). After moving, `utils.ts` is at `../lib/utils`. Update via sed:

```bash
find packages/ui/src/primitives -name '*.tsx' -exec \
  sed -i '' -e "s|from \"\./utils\"|from \"../lib/utils\"|g" \
            -e "s|from '\./utils'|from '../lib/utils'|g" {} +
```

Also remove `use-mobile.ts` and `utils.ts` from primitives (these are not primitives):

```bash
mv packages/ui/src/primitives/use-mobile.ts packages/ui/src/lib/use-mobile.ts
rm packages/ui/src/primitives/utils.ts
```

- [ ] **Step 3: Add Radix + lucide deps**

Look at the imports in primitives:

```bash
grep -h '^import' packages/ui/src/primitives/*.tsx | grep '@radix-ui' | sort -u
```

Add all referenced `@radix-ui/*` packages. From the reference `package.json`, they're already a known set. Run:

```bash
pnpm --filter @wjwang/ui add \
  @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio \
  @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible \
  @radix-ui/react-context-menu @radix-ui/react-dialog @radix-ui/react-dropdown-menu \
  @radix-ui/react-hover-card @radix-ui/react-label @radix-ui/react-menubar \
  @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-progress \
  @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select \
  @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot \
  @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toggle \
  @radix-ui/react-toggle-group @radix-ui/react-tooltip \
  class-variance-authority cmdk date-fns embla-carousel-react input-otp \
  react-day-picker react-hook-form react-resizable-panels recharts sonner vaul next-themes
```

- [ ] **Step 4: Create `primitives/index.ts` barrel**

Run a script to generate barrel exports for all primitive files:

```bash
{
  echo "export { cn } from '../lib/utils';"
  ls packages/ui/src/primitives/*.tsx | xargs -I{} basename {} .tsx | sort \
    | awk '{ print "export * from \"./" $0 "\";"; }'
} > packages/ui/src/primitives/index.ts
```

> The shadcn primitives use **named exports** (e.g. `export { Button }`), so `export *` works. Verify by inspecting one file:

```bash
grep '^export' packages/ui/src/primitives/button.tsx
```

If any file has a default export only (rare), add explicit re-export.

- [ ] **Step 5: Verify build**

```bash
pnpm --filter @wjwang/ui build
```

Expected: builds without errors. If TypeScript complains about missing types, fix imports as needed.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/primitives/ packages/ui/src/lib/use-mobile.ts packages/ui/package.json pnpm-lock.yaml
git commit -m "feat(ui): migrate shadcn primitives from reference"
```

---

### Task 1.7: SiteHeader component

**Files:**
- Create: `packages/ui/src/components/SiteHeader.tsx`
- Create: `packages/ui/src/components/SiteHeader.test.tsx`

- [ ] **Step 1: Define types in `packages/ui/src/types/nav.ts`**

```ts
// packages/ui/src/types/nav.ts
export interface NavItem {
  label: string;
  href: string;
}

export type SocialKind = 'github' | 'linkedin' | 'medium' | 'mail';

export interface SocialLink {
  kind: SocialKind;
  href: string;
}
```

Update `packages/ui/src/types/index.ts`:

```ts
export * from './nav';
```

- [ ] **Step 2: Write the failing test**

```tsx
// packages/ui/src/components/SiteHeader.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SiteHeader } from './SiteHeader';

describe('SiteHeader', () => {
  const nav = [{ label: '文章', href: '/articles' }];
  const socials = [{ kind: 'github' as const, href: 'https://github.com/x' }];

  it('renders nav items as links', () => {
    render(<SiteHeader nav={nav} socials={socials} />);
    const link = screen.getByRole('link', { name: '文章' });
    expect(link).toHaveAttribute('href', '/articles');
  });

  it('renders search slot when provided', () => {
    render(<SiteHeader nav={nav} socials={socials} searchSlot={<button>搜尋</button>} />);
    expect(screen.getByRole('button', { name: '搜尋' })).toBeInTheDocument();
  });

  it('renders social links with kind-specific aria-label', () => {
    render(<SiteHeader nav={nav} socials={socials} />);
    expect(screen.getByRole('link', { name: /github/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test (will fail, file doesn't exist)**

```bash
pnpm --filter @wjwang/ui test -- SiteHeader
```

- [ ] **Step 4: Implement SiteHeader**

```tsx
// packages/ui/src/components/SiteHeader.tsx
'use client';

import { useState, type ReactNode } from 'react';
import { Github, Linkedin, Mail, Menu, X, BookOpen } from 'lucide-react';
import type { NavItem, SocialLink, SocialKind } from '../types/nav';
import { cn } from '../lib/utils';

const SOCIAL_ICON: Record<SocialKind, typeof Github> = {
  github: Github,
  linkedin: Linkedin,
  medium: BookOpen,
  mail: Mail,
};

const SOCIAL_LABEL: Record<SocialKind, string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  medium: 'Medium Blog',
  mail: 'Email',
};

export interface SiteHeaderProps {
  nav: NavItem[];
  socials: SocialLink[];
  searchSlot?: ReactNode;
  avatarSrc?: string;
  brand?: string;
}

export function SiteHeader({
  nav,
  socials,
  searchSlot,
  avatarSrc = '/avatar.jpg',
  brand = 'WJWang',
}: SiteHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-border',
        'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={avatarSrc} alt={brand} className="w-10 h-10 rounded-full ring-2 ring-primary/20" />
            <span className="font-semibold text-lg">{brand}</span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {searchSlot}
            {socials.map((s) => {
              const Icon = SOCIAL_ICON[s.kind];
              return (
                <a
                  key={s.kind + s.href}
                  href={s.href}
                  target={s.kind === 'mail' ? undefined : '_blank'}
                  rel={s.kind === 'mail' ? undefined : 'noopener noreferrer'}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={SOCIAL_LABEL[s.kind]}
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              {nav.map((item) => (
                <a key={item.href} href={item.href} className="text-foreground hover:text-primary transition-colors">
                  {item.label}
                </a>
              ))}
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                {socials.map((s) => {
                  const Icon = SOCIAL_ICON[s.kind];
                  return (
                    <a
                      key={s.kind + s.href}
                      href={s.href}
                      target={s.kind === 'mail' ? undefined : '_blank'}
                      rel={s.kind === 'mail' ? undefined : 'noopener noreferrer'}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={SOCIAL_LABEL[s.kind]}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
```

> Adapted from `reference/blog-ui-theme/src/app/components/Header.tsx`. Changes: hard-coded socials replaced with prop-driven; `searchSlot` injected so app can wire SearchTrigger without UI Kit knowing search internals.

- [ ] **Step 5: Add to barrel**

```ts
// packages/ui/src/components/index.ts
export * from './SiteHeader';
```

- [ ] **Step 6: Run tests**

```bash
pnpm --filter @wjwang/ui test -- SiteHeader
```

Expected: 3 PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/components/SiteHeader.tsx packages/ui/src/components/SiteHeader.test.tsx packages/ui/src/components/index.ts packages/ui/src/types/nav.ts packages/ui/src/types/index.ts
git commit -m "feat(ui): add SiteHeader with searchSlot injection"
```

---

### Task 1.8: SiteFooter component

**Files:**
- Create: `packages/ui/src/components/SiteFooter.tsx`
- Create: `packages/ui/src/components/SiteFooter.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// packages/ui/src/components/SiteFooter.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SiteFooter } from './SiteFooter';

describe('SiteFooter', () => {
  it('renders copyright text', () => {
    render(<SiteFooter copyright="© 2026 WJWang" />);
    expect(screen.getByText('© 2026 WJWang')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test (fails)**

```bash
pnpm --filter @wjwang/ui test -- SiteFooter
```

- [ ] **Step 3: Implement**

```tsx
// packages/ui/src/components/SiteFooter.tsx
export interface SiteFooterProps {
  copyright: string;
}

export function SiteFooter({ copyright }: SiteFooterProps) {
  return (
    <footer className="border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-muted-foreground">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Add to barrel**

```ts
// packages/ui/src/components/index.ts
export * from './SiteHeader';
export * from './SiteFooter';
```

- [ ] **Step 5: Run test, commit**

```bash
pnpm --filter @wjwang/ui test -- SiteFooter
git add packages/ui/src/components/
git commit -m "feat(ui): add SiteFooter"
```

---

### Task 1.9: GeometricBackground component

**Files:**
- Create: `packages/ui/src/components/GeometricBackground.tsx`

- [ ] **Step 1: Copy from reference**

```bash
cp reference/blog-ui-theme/src/app/components/GeometricBackground.tsx packages/ui/src/components/GeometricBackground.tsx
```

- [ ] **Step 2: Fix imports**

Open the file and adjust any imports that use the reference's `@/` alias. Replace with relative paths or remove if unneeded.

```bash
grep '^import' packages/ui/src/components/GeometricBackground.tsx
```

If only React/lucide imports, no changes needed.

- [ ] **Step 3: Add to barrel**

```ts
// packages/ui/src/components/index.ts
export * from './SiteHeader';
export * from './SiteFooter';
export * from './GeometricBackground';
```

- [ ] **Step 4: Smoke test**

```tsx
// packages/ui/src/components/GeometricBackground.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { GeometricBackground } from './GeometricBackground';

describe('GeometricBackground', () => {
  it('renders without crashing', () => {
    const { container } = render(<GeometricBackground />);
    expect(container.firstChild).toBeTruthy();
  });
});
```

- [ ] **Step 5: Run test, commit**

```bash
pnpm --filter @wjwang/ui test -- GeometricBackground
git add packages/ui/src/components/
git commit -m "feat(ui): migrate GeometricBackground from reference"
```

---

### Task 1.10: Verify full UI Kit build

- [ ] **Step 1: Clean and rebuild**

```bash
rm -rf packages/ui/dist
pnpm --filter @wjwang/ui build
```

- [ ] **Step 2: Verify expected outputs exist**

```bash
ls packages/ui/dist/
# Expected: index.js, index.d.ts, components/, article/, primitives/, types/, tailwind.preset.js, tailwind.preset.d.ts
```

- [ ] **Step 3: Run all UI tests**

```bash
pnpm --filter @wjwang/ui test
```

Expected: all green.

- [ ] **Step 4: Run typecheck**

```bash
pnpm --filter @wjwang/ui typecheck
```

Expected: no errors.

- [ ] **Step 5: Commit any fixes (if needed)**

```bash
git status
# Commit any straggler fixes
```

---

## Phase 2 — Article Building Blocks

### Task 2.1: ArticleMetadata zod schema + types + tests

**Files:**
- Create: `packages/ui/src/types/article.ts`
- Create: `packages/ui/src/types/article.test.ts`
- Modify: `packages/ui/src/types/index.ts`

- [ ] **Step 1: Write failing test for schema**

```ts
// packages/ui/src/types/article.test.ts
import { describe, it, expect } from 'vitest';
import { ArticleMetadataSchema } from './article';

describe('ArticleMetadataSchema', () => {
  const minimal = { title: 't', excerpt: 'e', date: '2026-01-01', tags: ['x'] };

  it('accepts minimal valid metadata', () => {
    const result = ArticleMetadataSchema.parse(minimal);
    expect(result.title).toBe('t');
    expect(result.featured).toBe(false);
    expect(result.draft).toBe(false);
    expect(result.author).toBe('WJWang');
    expect(result.readTime).toBe('auto');
  });

  it('rejects missing title', () => {
    expect(() => ArticleMetadataSchema.parse({ ...minimal, title: '' })).toThrow();
  });

  it('rejects bad date format', () => {
    expect(() => ArticleMetadataSchema.parse({ ...minimal, date: '2026/01/01' })).toThrow();
  });

  it('rejects empty tags array', () => {
    expect(() => ArticleMetadataSchema.parse({ ...minimal, tags: [] })).toThrow();
  });

  it('rejects excerpt > 280 chars', () => {
    expect(() => ArticleMetadataSchema.parse({ ...minimal, excerpt: 'x'.repeat(281) })).toThrow();
  });

  it('rejects bad slug pattern', () => {
    expect(() => ArticleMetadataSchema.parse({ ...minimal, slug: 'Bad Slug' })).toThrow();
  });

  it('accepts all optional fields', () => {
    const result = ArticleMetadataSchema.parse({
      ...minimal,
      category: 'Frontend',
      featured: true,
      coverImage: './assets/c.jpg',
      ogImage: './assets/og.jpg',
      draft: false,
      updatedAt: '2026-02-01',
      author: 'X',
      readTime: '5 分鐘',
      slug: 'my-post',
    });
    expect(result.category).toBe('Frontend');
    expect(result.featured).toBe(true);
  });
});
```

- [ ] **Step 2: Run test (fails — module missing)**

```bash
pnpm --filter @wjwang/ui test -- article
```

- [ ] **Step 3: Implement schema**

```ts
// packages/ui/src/types/article.ts
import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD');

export const ArticleMetadataSchema = z.object({
  title: z.string().min(1),
  excerpt: z.string().min(1).max(280),
  date: isoDate,
  tags: z.array(z.string()).min(1),

  category: z.string().optional(),
  featured: z.boolean().optional().default(false),
  coverImage: z.string().optional(),
  ogImage: z.string().optional(),
  draft: z.boolean().optional().default(false),
  updatedAt: isoDate.optional(),
  author: z.string().optional().default('WJWang'),
  readTime: z.union([z.literal('auto'), z.string()]).optional().default('auto'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'slug must be lowercase alphanumeric with dashes').optional(),
});

export type ArticleMetadata = z.infer<typeof ArticleMetadataSchema>;

export interface ArticleListItem {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  updatedAt?: string;
  readTime: string;
  tags: string[];
  category?: string;
  featured: boolean;
  coverImage?: string;
  ogImage?: string;
  author: string;
}
```

- [ ] **Step 4: Update types barrel**

```ts
// packages/ui/src/types/index.ts
export * from './nav';
export * from './article';
```

- [ ] **Step 5: Run tests**

```bash
pnpm --filter @wjwang/ui test -- article
```

Expected: 7 PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/types/
git commit -m "feat(ui): add ArticleMetadata zod schema with tests"
```

---

### Task 2.2: Prose component

**Files:**
- Create: `packages/ui/src/article/Prose.tsx`
- Create: `packages/ui/src/article/Prose.test.tsx`

- [ ] **Step 1: Write test**

```tsx
// packages/ui/src/article/Prose.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Prose } from './Prose';

describe('Prose', () => {
  it('renders children inside a typography wrapper', () => {
    render(<Prose><p>hello</p></Prose>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('applies size variant class', () => {
    const { container } = render(<Prose size="lg"><span>x</span></Prose>);
    expect(container.firstChild).toHaveClass('prose-lg');
  });
});
```

- [ ] **Step 2: Implement**

```tsx
// packages/ui/src/article/Prose.tsx
import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

export interface ProseProps {
  children: ReactNode;
  size?: 'base' | 'lg';
  className?: string;
}

export function Prose({ children, size = 'base', className }: ProseProps) {
  return (
    <div
      className={cn(
        'prose max-w-none',
        size === 'lg' && 'prose-lg',
        // Inline typography (Tailwind v4 has no @tailwindcss/typography by default; we hand-roll)
        '[&_h1]:text-4xl [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:font-bold',
        '[&_h2]:text-3xl [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:font-bold',
        '[&_h3]:text-2xl [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:font-semibold',
        '[&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-foreground',
        '[&_ul]:list-disc [&_ul]:list-inside [&_ul]:mb-4 [&_ul]:space-y-2',
        '[&_ol]:list-decimal [&_ol]:list-inside [&_ol]:mb-4 [&_ol]:space-y-2',
        '[&_li]:text-foreground',
        '[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:text-muted-foreground',
        '[&_a]:text-primary [&_a:hover]:underline',
        '[&_hr]:my-8 [&_hr]:border-border',
        '[&_strong]:font-semibold',
        '[&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-secondary [&_code]:text-sm',
        className,
      )}
    >
      {children}
    </div>
  );
}
```

> Why hand-rolled typography: Tailwind v4 doesn't ship `@tailwindcss/typography` by default and we want fine control matching the reference design (especially `border-primary` blockquote, neon `text-primary` links).

- [ ] **Step 3: Add to article barrel**

```ts
// packages/ui/src/article/index.ts
export * from './Prose';
```

- [ ] **Step 4: Run tests, commit**

```bash
pnpm --filter @wjwang/ui test -- Prose
git add packages/ui/src/article/
git commit -m "feat(ui): add Prose typography wrapper"
```

---

### Task 2.3: CodeBlock component

**Files:**
- Create: `packages/ui/src/article/CodeBlock.tsx`
- Create: `packages/ui/src/article/CodeBlock.test.tsx`

- [ ] **Step 1: Write test**

```tsx
// packages/ui/src/article/CodeBlock.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CodeBlock } from './CodeBlock';

describe('CodeBlock', () => {
  it('renders code content', () => {
    render(<CodeBlock language="ts">{'const x = 1;'}</CodeBlock>);
    expect(screen.getByText(/const/)).toBeInTheDocument();
  });

  it('renders filename header when provided', () => {
    render(<CodeBlock language="ts" filename="foo.ts">{'x'}</CodeBlock>);
    expect(screen.getByText('foo.ts')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implement**

```tsx
// packages/ui/src/article/CodeBlock.tsx
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '../lib/utils';

export interface CodeBlockProps {
  language: string;
  children: string;
  filename?: string;
  highlightLines?: number[];
}

export function CodeBlock({ language, children, filename, highlightLines }: CodeBlockProps) {
  return (
    <div className="my-6 rounded-lg overflow-hidden border border-border bg-card">
      {filename && (
        <div className="px-4 py-2 border-b border-border bg-secondary text-sm text-muted-foreground font-mono">
          {filename}
        </div>
      )}
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '0.875rem' }}
        wrapLines={highlightLines && highlightLines.length > 0}
        lineProps={(lineNumber: number) =>
          highlightLines?.includes(lineNumber)
            ? { style: { background: 'rgba(0,255,136,0.08)', display: 'block' } }
            : { style: { display: 'block' } }
        }
        showLineNumbers={false}
      >
        {children.replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
}
```

- [ ] **Step 3: Update barrel, run, commit**

```ts
// packages/ui/src/article/index.ts
export * from './Prose';
export * from './CodeBlock';
```

```bash
pnpm --filter @wjwang/ui test -- CodeBlock
git add packages/ui/src/article/
git commit -m "feat(ui): add CodeBlock with vscDarkPlus + filename + line highlight"
```

---

### Task 2.4: ImageFigure component

**Files:**
- Create: `packages/ui/src/article/ImageFigure.tsx`
- Create: `packages/ui/src/article/ImageFigure.test.tsx`

- [ ] **Step 1: Write test**

```tsx
// packages/ui/src/article/ImageFigure.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ImageFigure } from './ImageFigure';

describe('ImageFigure', () => {
  it('renders img with src and alt', () => {
    render(<ImageFigure src="/x.png" alt="alt text" />);
    const img = screen.getByAltText('alt text');
    expect(img).toHaveAttribute('src', '/x.png');
  });

  it('renders caption when provided', () => {
    render(<ImageFigure src="/x.png" caption="cap" />);
    expect(screen.getByText('cap')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implement**

```tsx
// packages/ui/src/article/ImageFigure.tsx
import { cn } from '../lib/utils';

export interface ImageFigureProps {
  src: string;
  alt?: string;
  caption?: string;
  ratio?: '16/9' | '4/3' | '1/1' | string;
}

export function ImageFigure({ src, alt = '', caption, ratio }: ImageFigureProps) {
  const style = ratio ? { aspectRatio: ratio } : undefined;
  return (
    <figure className="my-6">
      <div
        className={cn('overflow-hidden rounded-lg border border-border bg-card', ratio && 'w-full')}
        style={style}
      >
        <img
          src={src}
          alt={alt}
          className={cn('w-full h-auto block', ratio && 'h-full object-cover')}
          loading="lazy"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-center text-muted-foreground">{caption}</figcaption>
      )}
    </figure>
  );
}
```

- [ ] **Step 3: Update barrel, run, commit**

```ts
// packages/ui/src/article/index.ts
export * from './Prose';
export * from './CodeBlock';
export * from './ImageFigure';
```

```bash
pnpm --filter @wjwang/ui test -- ImageFigure
git add packages/ui/src/article/
git commit -m "feat(ui): add ImageFigure with aspect-ratio + caption"
```

---

### Task 2.5: Callout component

**Files:**
- Create: `packages/ui/src/article/Callout.tsx`
- Create: `packages/ui/src/article/Callout.test.tsx`

- [ ] **Step 1: Write test**

```tsx
// packages/ui/src/article/Callout.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Callout } from './Callout';

describe('Callout', () => {
  it('renders children', () => {
    render(<Callout>note</Callout>);
    expect(screen.getByText('note')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Callout title="重要">x</Callout>);
    expect(screen.getByText('重要')).toBeInTheDocument();
  });

  it.each(['info', 'warn', 'success', 'danger', 'tip'] as const)('accepts variant %s', (v) => {
    const { container } = render(<Callout variant={v}>x</Callout>);
    expect(container.firstChild).toBeTruthy();
  });
});
```

- [ ] **Step 2: Implement**

```tsx
// packages/ui/src/article/Callout.tsx
import type { ReactNode } from 'react';
import { Info, AlertTriangle, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import { cn } from '../lib/utils';

export type CalloutVariant = 'info' | 'warn' | 'success' | 'danger' | 'tip';

export interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: ReactNode;
}

const STYLE: Record<CalloutVariant, { ring: string; icon: typeof Info; iconColor: string }> = {
  info:    { ring: 'border-l-blue-500',   icon: Info,           iconColor: 'text-blue-500' },
  warn:    { ring: 'border-l-yellow-500', icon: AlertTriangle,  iconColor: 'text-yellow-500' },
  success: { ring: 'border-l-primary',    icon: CheckCircle2,   iconColor: 'text-primary' },
  danger:  { ring: 'border-l-destructive',icon: XCircle,        iconColor: 'text-destructive' },
  tip:     { ring: 'border-l-accent',     icon: Lightbulb,      iconColor: 'text-accent' },
};

export function Callout({ variant = 'info', title, children }: CalloutProps) {
  const s = STYLE[variant];
  const Icon = s.icon;
  return (
    <aside
      className={cn(
        'my-6 p-4 rounded-md border border-border bg-card',
        'border-l-4',
        s.ring,
      )}
      role="note"
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('w-5 h-5 mt-0.5 shrink-0', s.iconColor)} aria-hidden />
        <div className="flex-1">
          {title && <div className="font-semibold mb-1">{title}</div>}
          <div className="text-foreground/90">{children}</div>
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Update barrel, run, commit**

```ts
// packages/ui/src/article/index.ts
export * from './Prose';
export * from './CodeBlock';
export * from './ImageFigure';
export * from './Callout';
```

```bash
pnpm --filter @wjwang/ui test -- Callout
git add packages/ui/src/article/
git commit -m "feat(ui): add Callout with 5 variants"
```

---

### Task 2.6: KeyTakeaways component

**Files:**
- Create: `packages/ui/src/article/KeyTakeaways.tsx`
- Create: `packages/ui/src/article/KeyTakeaways.test.tsx`

- [ ] **Step 1: Write test**

```tsx
// packages/ui/src/article/KeyTakeaways.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KeyTakeaways } from './KeyTakeaways';

describe('KeyTakeaways', () => {
  it('renders default title 重點摘要', () => {
    render(<KeyTakeaways items={['a', 'b']} />);
    expect(screen.getByText('重點摘要')).toBeInTheDocument();
  });

  it('renders custom title', () => {
    render(<KeyTakeaways title="TL;DR" items={['x']} />);
    expect(screen.getByText('TL;DR')).toBeInTheDocument();
  });

  it('renders all items', () => {
    render(<KeyTakeaways items={['one', 'two', 'three']} />);
    expect(screen.getByText('one')).toBeInTheDocument();
    expect(screen.getByText('two')).toBeInTheDocument();
    expect(screen.getByText('three')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implement**

```tsx
// packages/ui/src/article/KeyTakeaways.tsx
import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

export interface KeyTakeawaysProps {
  title?: string;
  items: ReactNode[];
}

export function KeyTakeaways({ title = '重點摘要', items }: KeyTakeawaysProps) {
  return (
    <aside className="my-8 p-6 rounded-lg border border-border bg-card">
      <h3 className="flex items-center gap-2 font-semibold text-lg mb-4">
        <Sparkles className="w-5 h-5 text-primary" aria-hidden />
        {title}
      </h3>
      <ul className="space-y-2 list-disc list-inside marker:text-primary">
        {items.map((item, i) => (
          <li key={i} className="text-foreground">{item}</li>
        ))}
      </ul>
    </aside>
  );
}
```

- [ ] **Step 3: Update barrel, run, commit**

```ts
// packages/ui/src/article/index.ts (append)
export * from './KeyTakeaways';
```

```bash
pnpm --filter @wjwang/ui test -- KeyTakeaways
git add packages/ui/src/article/
git commit -m "feat(ui): add KeyTakeaways"
```

---

### Task 2.7: Quote component

**Files:**
- Create: `packages/ui/src/article/Quote.tsx`
- Create: `packages/ui/src/article/Quote.test.tsx`

- [ ] **Step 1: Test**

```tsx
// packages/ui/src/article/Quote.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Quote } from './Quote';

describe('Quote', () => {
  it('renders children + author', () => {
    render(<Quote author="Dijkstra">Simplicity is prerequisite for reliability.</Quote>);
    expect(screen.getByText(/Simplicity/)).toBeInTheDocument();
    expect(screen.getByText(/Dijkstra/)).toBeInTheDocument();
  });

  it('renders source when provided', () => {
    render(<Quote author="X" source="EWD"><p>q</p></Quote>);
    expect(screen.getByText(/EWD/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implement**

```tsx
// packages/ui/src/article/Quote.tsx
import type { ReactNode } from 'react';
import { Quote as QuoteIcon } from 'lucide-react';

export interface QuoteProps {
  author?: string;
  source?: string;
  children: ReactNode;
}

export function Quote({ author, source, children }: QuoteProps) {
  return (
    <blockquote className="my-8 p-6 border-l-4 border-primary bg-card rounded-r-lg">
      <QuoteIcon className="w-6 h-6 text-primary mb-3" aria-hidden />
      <div className="text-lg italic text-foreground">{children}</div>
      {(author || source) && (
        <footer className="mt-4 text-sm text-muted-foreground">
          {author && <span>— {author}</span>}
          {source && <span className="ml-2 opacity-75">{source}</span>}
        </footer>
      )}
    </blockquote>
  );
}
```

- [ ] **Step 3: Barrel, test, commit**

```ts
// packages/ui/src/article/index.ts (append)
export * from './Quote';
```

```bash
pnpm --filter @wjwang/ui test -- Quote
git add packages/ui/src/article/
git commit -m "feat(ui): add Quote"
```

---

### Task 2.8: Aside component

**Files:**
- Create: `packages/ui/src/article/Aside.tsx`
- Create: `packages/ui/src/article/Aside.test.tsx`

- [ ] **Step 1: Test + impl + commit**

```tsx
// packages/ui/src/article/Aside.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Aside } from './Aside';

describe('Aside', () => {
  it('renders title and children', () => {
    render(<Aside title="Side note">extra context</Aside>);
    expect(screen.getByText('Side note')).toBeInTheDocument();
    expect(screen.getByText('extra context')).toBeInTheDocument();
  });
});
```

```tsx
// packages/ui/src/article/Aside.tsx
import type { ReactNode } from 'react';

export interface AsideProps {
  title?: string;
  children: ReactNode;
}

export function Aside({ title, children }: AsideProps) {
  return (
    <aside className="my-6 p-5 rounded-md border border-dashed border-border bg-muted/30">
      {title && <div className="text-sm uppercase tracking-wide text-muted-foreground mb-2">{title}</div>}
      <div className="text-foreground/90">{children}</div>
    </aside>
  );
}
```

```ts
// packages/ui/src/article/index.ts (append)
export * from './Aside';
```

```bash
pnpm --filter @wjwang/ui test -- Aside
git add packages/ui/src/article/
git commit -m "feat(ui): add Aside"
```

---

### Task 2.9: Comparison component

**Files:**
- Create: `packages/ui/src/article/Comparison.tsx`
- Create: `packages/ui/src/article/Comparison.test.tsx`

- [ ] **Step 1: Test**

```tsx
// packages/ui/src/article/Comparison.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Comparison } from './Comparison';

describe('Comparison', () => {
  it('renders all column titles and items', () => {
    render(
      <Comparison
        columns={[
          { title: 'Pros', items: ['fast', 'simple'], tone: 'pos' },
          { title: 'Cons', items: ['expensive'], tone: 'neg' },
        ]}
      />,
    );
    expect(screen.getByText('Pros')).toBeInTheDocument();
    expect(screen.getByText('Cons')).toBeInTheDocument();
    expect(screen.getByText('fast')).toBeInTheDocument();
    expect(screen.getByText('expensive')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implement**

```tsx
// packages/ui/src/article/Comparison.tsx
import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

export type ComparisonTone = 'pos' | 'neg' | 'neutral';

export interface ComparisonColumn {
  title: string;
  items: ReactNode[];
  tone?: ComparisonTone;
}

export interface ComparisonProps {
  columns: ComparisonColumn[];
}

const TONE_BORDER: Record<ComparisonTone, string> = {
  pos: 'border-t-primary',
  neg: 'border-t-destructive',
  neutral: 'border-t-border',
};

export function Comparison({ columns }: ComparisonProps) {
  return (
    <div
      className="my-6 grid gap-4"
      style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0,1fr))` }}
    >
      {columns.map((col, idx) => (
        <div
          key={idx}
          className={cn(
            'p-4 rounded-md border border-border bg-card border-t-4',
            TONE_BORDER[col.tone ?? 'neutral'],
          )}
        >
          <div className="font-semibold mb-3">{col.title}</div>
          <ul className="space-y-2 list-disc list-inside text-foreground">
            {col.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Barrel, test, commit**

```ts
// packages/ui/src/article/index.ts (append)
export * from './Comparison';
```

```bash
pnpm --filter @wjwang/ui test -- Comparison
git add packages/ui/src/article/
git commit -m "feat(ui): add Comparison"
```

---

### Task 2.10: ArticleCard component

**Files:**
- Create: `packages/ui/src/article/ArticleCard.tsx`
- Create: `packages/ui/src/article/ArticleCard.test.tsx`

- [ ] **Step 1: Test**

```tsx
// packages/ui/src/article/ArticleCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ArticleCard } from './ArticleCard';
import type { ArticleListItem } from '../types/article';

const meta: ArticleListItem = {
  slug: 'foo',
  title: 'Foo Post',
  excerpt: 'about foo',
  date: '2026-01-01',
  readTime: '3 分鐘',
  tags: ['React'],
  featured: false,
  author: 'WJWang',
};

describe('ArticleCard', () => {
  it('renders title, excerpt, date, readTime, tags', () => {
    render(<ArticleCard meta={meta} />);
    expect(screen.getByText('Foo Post')).toBeInTheDocument();
    expect(screen.getByText('about foo')).toBeInTheDocument();
    expect(screen.getByText('2026-01-01')).toBeInTheDocument();
    expect(screen.getByText('3 分鐘')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('links to /articles/{slug}', () => {
    render(<ArticleCard meta={meta} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/articles/foo');
  });

  it('applies featured class when variant=featured', () => {
    const { container } = render(<ArticleCard meta={meta} variant="featured" />);
    expect(container.querySelector('article')).toHaveClass('md:col-span-2');
  });
});
```

- [ ] **Step 2: Implement**

```tsx
// packages/ui/src/article/ArticleCard.tsx
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import type { ArticleListItem } from '../types/article';
import { cn } from '../lib/utils';

export interface ArticleCardProps {
  meta: ArticleListItem;
  variant?: 'default' | 'featured';
}

export function ArticleCard({ meta, variant = 'default' }: ArticleCardProps) {
  const featured = variant === 'featured';
  return (
    <a href={`/articles/${meta.slug}`} className={cn('group block', featured && 'md:col-span-2')}>
      <article
        className={cn(
          'group cursor-pointer',
          featured && 'md:col-span-2',
        )}
      >
        <div className="h-full p-6 rounded-lg border border-border bg-card hover:border-primary transition-all duration-200">
          <div className="flex flex-wrap gap-2 mb-4">
            {meta.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs rounded-md bg-secondary text-foreground font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          <h3
            className={cn(
              'mb-3 group-hover:text-primary transition-colors',
              featured ? 'text-3xl' : 'text-xl',
            )}
          >
            {meta.title}
          </h3>

          <p className="text-muted-foreground mb-4 line-clamp-3">{meta.excerpt}</p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{meta.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{meta.readTime}</span>
            </div>
            <div className="ml-auto flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              <span>閱讀更多</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </article>
    </a>
  );
}
```

> Migrated from `reference/blog-ui-theme/src/app/components/ArticleCard.tsx`. Key changes: replaced `useNavigate` with native `<a>` (UI Kit must be router-agnostic; Next's `<Link>` defaults to `<a>` for static export anyway).

- [ ] **Step 3: Barrel, test, commit**

```ts
// packages/ui/src/article/index.ts (append)
export * from './ArticleCard';
```

```bash
pnpm --filter @wjwang/ui test -- ArticleCard
git add packages/ui/src/article/
git commit -m "feat(ui): add ArticleCard (router-agnostic, accepts ArticleListItem)"
```

---

### Task 2.11: ArticleHero component

**Files:**
- Create: `packages/ui/src/article/ArticleHero.tsx`

- [ ] **Step 1: Implement (no test — purely presentational, props are simple)**

```tsx
// packages/ui/src/article/ArticleHero.tsx
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import type { ArticleListItem } from '../types/article';

export interface ArticleHeroProps {
  meta: ArticleListItem;
  backHref?: string;
  backLabel?: string;
}

export function ArticleHero({ meta, backHref = '/articles', backLabel = '返回文章列表' }: ArticleHeroProps) {
  return (
    <div className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-20">
        <a
          href={backHref}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {backLabel}
        </a>

        <h1 className="text-4xl md:text-5xl mb-6 font-bold text-foreground">{meta.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{meta.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{meta.readTime}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {meta.tags.map((tag) => (
            <span key={tag} className="px-3 py-1 text-sm rounded-md bg-secondary text-foreground font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Barrel + commit**

```ts
// packages/ui/src/article/index.ts (append)
export * from './ArticleHero';
```

```bash
git add packages/ui/src/article/
git commit -m "feat(ui): add ArticleHero"
```

---

### Task 2.12: ArticleLayout component

**Files:**
- Create: `packages/ui/src/article/ArticleLayout.tsx`

- [ ] **Step 1: Implement**

```tsx
// packages/ui/src/article/ArticleLayout.tsx
import type { ReactNode } from 'react';
import type { ArticleListItem } from '../types/article';
import { ArticleHero } from './ArticleHero';

export interface ArticleLayoutProps {
  meta: ArticleListItem;
  related?: ArticleListItem[];
  children: ReactNode;
}

export function ArticleLayout({ meta, related, children }: ArticleLayoutProps) {
  return (
    <div className="min-h-screen relative">
      <ArticleHero meta={meta} />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-20">
        {children}
      </article>

      {related && related.length > 0 && (
        <div className="border-t border-border mt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-20">
            <h3 className="text-2xl mb-6 font-bold">相關文章</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {related.map((r) => (
                <a
                  key={r.slug}
                  href={`/articles/${r.slug}`}
                  className="block p-6 rounded-lg border border-border bg-card hover:border-primary transition-all group"
                >
                  <h4 className="mb-2 group-hover:text-primary transition-colors">{r.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{r.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{r.date}</span>
                    <span>•</span>
                    <span>{r.readTime}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Barrel + commit**

```ts
// packages/ui/src/article/index.ts (append)
export * from './ArticleLayout';
```

```bash
git add packages/ui/src/article/
git commit -m "feat(ui): add ArticleLayout (hero + content + related)"
```

---

### Task 2.13: Verify article building blocks

- [ ] **Step 1: Final article barrel**

The `packages/ui/src/article/index.ts` should now contain:

```ts
export * from './Prose';
export * from './CodeBlock';
export * from './ImageFigure';
export * from './Callout';
export * from './KeyTakeaways';
export * from './Quote';
export * from './Aside';
export * from './Comparison';
export * from './ArticleCard';
export * from './ArticleHero';
export * from './ArticleLayout';
```

- [ ] **Step 2: Build + test + typecheck**

```bash
pnpm --filter @wjwang/ui build
pnpm --filter @wjwang/ui test
pnpm --filter @wjwang/ui typecheck
```

Expected: all green.

- [ ] **Step 3: Commit any straggler fixes**

```bash
git status
git add -A
git commit -m "chore(ui): tidy article barrel"
```

## Phase 3 — Next.js App Skeleton (`apps/web`)

### Task 3.1: Initialize Next.js app

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/next-env.d.ts`
- Create: `apps/web/next.config.mjs`

- [ ] **Step 1: Create `apps/web/package.json`**

```json
{
  "name": "web",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev":       "next dev",
    "build":     "next build",
    "start":     "next start",
    "lint":      "next lint",
    "typecheck": "tsc --noEmit",
    "test":      "vitest run"
  },
  "dependencies": {
    "@wjwang/ui": "workspace:*",
    "next": "^15.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "fuse.js": "^7.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0",
    "postcss": "^8.4.0",
    "serve": "^14.2.0",
    "tailwindcss": "^4.1.0",
    "@tailwindcss/postcss": "^4.1.0",
    "typescript": "^5.6.0"
  }
}
```

- [ ] **Step 2: Create `apps/web/next.config.mjs`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  transpilePackages: ['@wjwang/ui'],
};

export default nextConfig;
```

> `transpilePackages: ['@wjwang/ui']` — needed because workspace deps are resolved to source / dist by Next.js; transpiling ensures Next applies its loaders (CSS, JSX) to the lib correctly.

- [ ] **Step 3: Create `apps/web/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "noEmit": true,
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "@/content-generated/*": ["./content-generated/*"]
    },
    "jsx": "preserve",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true
  },
  "include": ["next-env.d.ts", "src/**/*.ts", "src/**/*.tsx", "content-generated/**/*.ts", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "out", ".next"]
}
```

- [ ] **Step 4: Create `apps/web/next-env.d.ts`**

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
```

- [ ] **Step 5: Install**

```bash
pnpm install
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/ pnpm-lock.yaml
git commit -m "feat(web): scaffold Next.js app with static export config"
```

---

### Task 3.2: Tailwind v4 + PostCSS for `apps/web`

**Files:**
- Create: `apps/web/postcss.config.mjs`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/src/app/globals.css`

- [ ] **Step 1: PostCSS config**

```js
// apps/web/postcss.config.mjs
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

- [ ] **Step 2: Tailwind config**

```ts
// apps/web/tailwind.config.ts
import type { Config } from 'tailwindcss';
import preset from '@wjwang/ui/tailwind-preset';

const config: Config = {
  presets: [preset],
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../content/articles/**/*.tsx',
  ],
};

export default config;
```

- [ ] **Step 3: Create `apps/web/src/app/globals.css`**

```css
@import 'tailwindcss';
```

> Theme tokens come from `@wjwang/ui/styles/theme.css` (imported in layout). `globals.css` stays minimal — only Tailwind v4 entry.

- [ ] **Step 4: Commit**

```bash
git add apps/web/postcss.config.mjs apps/web/tailwind.config.ts apps/web/src/app/globals.css
git commit -m "feat(web): wire Tailwind v4 + @wjwang/ui preset"
```

---

### Task 3.3: Site config (NAV + SOCIALS)

**Files:**
- Create: `apps/web/src/lib/site-config.ts`

- [ ] **Step 1: Implement**

```ts
// apps/web/src/lib/site-config.ts
import type { NavItem, SocialLink } from '@wjwang/ui/types';

export const SITE = {
  name: 'WJWang',
  domain: 'wjwang.dev',
  url: 'https://wjwang.dev',
  description: 'WJWang 的技術部落格',
  copyright: '© 2026 WJWang. All rights reserved.',
  author: {
    name: 'WJWang',
    email: 'anderson.thereisnospoon@gmail.com',
    avatar: '/avatar.jpg',
  },
} as const;

export const NAV: NavItem[] = [
  { label: '文章', href: '/articles' },
  { label: '標籤', href: '/tags' },
  { label: '關於', href: '/about' },
];

export const SOCIALS: SocialLink[] = [
  { kind: 'github',   href: 'https://github.com/WJWang' },
  { kind: 'linkedin', href: 'https://www.linkedin.com/in/wj-wang-696a0b86/' },
  { kind: 'medium',   href: 'https://wjwang.medium.com/' },
  { kind: 'mail',     href: `mailto:${'anderson.thereisnospoon@gmail.com'}` },
];
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/lib/site-config.ts
git commit -m "feat(web): add site-config (NAV, SOCIALS, SITE constants)"
```

---

### Task 3.4: Root layout (with provisional Search stubs)

**Files:**
- Create: `apps/web/src/app/layout.tsx`
- Create: `apps/web/src/components/SearchCommand.tsx` (stub)

- [ ] **Step 1: Create stub SearchCommand**

```tsx
// apps/web/src/components/SearchCommand.tsx
'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { Search } from 'lucide-react';

interface SearchCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
}
const Ctx = createContext<SearchCtx | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <Ctx.Provider value={{ open, setOpen }}>{children}</Ctx.Provider>;
}

export function useSearch() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useSearch must be used within SearchProvider');
  return c;
}

export function SearchTrigger() {
  const { setOpen } = useSearch();
  return (
    <button
      onClick={() => setOpen(true)}
      aria-label="開啟搜尋"
      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
    >
      <Search className="w-5 h-5" />
    </button>
  );
}

// Real modal lives in Task 5.11. Stub for now so layout can mount provider.
export function SearchCommand() {
  return null;
}
```

- [ ] **Step 2: Create root layout**

```tsx
// apps/web/src/app/layout.tsx
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SiteHeader, SiteFooter } from '@wjwang/ui/components';
import { SearchProvider, SearchTrigger, SearchCommand } from '@/components/SearchCommand';
import { NAV, SOCIALS, SITE } from '@/lib/site-config';

import '@wjwang/ui/styles/fonts.css';
import '@wjwang/ui/styles/theme.css';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s | ${SITE.name}` },
  description: SITE.description,
  openGraph: { siteName: SITE.name, type: 'website' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <SearchProvider>
          <SiteHeader nav={NAV} socials={SOCIALS} searchSlot={<SearchTrigger />} />
          <div className="flex-1 flex flex-col">{children}</div>
          <SiteFooter copyright={SITE.copyright} />
          <SearchCommand />
        </SearchProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Create placeholder home page**

```tsx
// apps/web/src/app/page.tsx
export default function HomePage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">WJWang Blog (skeleton)</h1>
      <p className="text-muted-foreground mt-2">Real content lands in Phase 5.</p>
    </main>
  );
}
```

- [ ] **Step 4: Build UI Kit and verify dev server**

```bash
pnpm --filter @wjwang/ui build
pnpm --filter web dev
```

Visit `http://localhost:3000`. Expected: header with nav links + search button + footer; main content shows "WJWang Blog (skeleton)". Theme is dark. Stop server with Ctrl-C.

- [ ] **Step 5: Avatar — copy from reference**

```bash
mkdir -p apps/web/public
cp reference/blog-ui-theme/public/avatar.jpg apps/web/public/avatar.jpg
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/ apps/web/src/components/ apps/web/public/avatar.jpg
git commit -m "feat(web): root layout with SiteHeader/Footer + Search stubs"
```

---

## Phase 4 — Content Pipeline

### Task 4.1: Create `content/` + `.gitignore` updates

**Files:**
- Create: `content/articles/.gitkeep`
- Modify: `.gitignore`
- Modify: `apps/web/.gitignore` (new file)

- [ ] **Step 1: Create content directory**

```bash
mkdir -p content/articles
touch content/articles/.gitkeep
```

- [ ] **Step 2: Add Next/build outputs to root `.gitignore`**

Append to existing `.gitignore`:

```
# Next.js
.next/
out/

# Build outputs
dist/
*.tsbuildinfo

# Generated
**/content-generated/
```

- [ ] **Step 3: Create `apps/web/.gitignore` for app-specific ignores**

```
# Mirrored article assets (originals in content/articles/{slug}/assets/)
public/articles/

# Mirrored CNAME (source is repo-root /CNAME)
public/CNAME

# Generated RSS
public/rss.xml
```

- [ ] **Step 4: Commit**

```bash
git add content/articles/.gitkeep .gitignore apps/web/.gitignore
git commit -m "chore: add content/ dir and gitignore for build artifacts"
```

---

### Task 4.2: `build-articles` — scan + parse + validate (TDD)

**Files:**
- Create: `scripts/build-articles.ts`
- Create: `scripts/build-articles.test.ts`
- Create: `scripts/lib/discover.ts`
- Create: `scripts/lib/discover.test.ts`

- [ ] **Step 1: Add deps**

```bash
pnpm add -Dw yaml globby zod feed chokidar @types/node
```

- [ ] **Step 2: Write failing test for discovery**

```ts
// scripts/lib/discover.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { discoverArticles } from './discover';

describe('discoverArticles', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'wjw-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('discovers slug folders containing metadata.yml', async () => {
    await mkdir(join(dir, 'foo'), { recursive: true });
    await writeFile(join(dir, 'foo', 'metadata.yml'), 'title: F');
    await mkdir(join(dir, 'bar'), { recursive: true });
    await writeFile(join(dir, 'bar', 'metadata.yml'), 'title: B');
    await mkdir(join(dir, 'no-meta'), { recursive: true });

    const result = await discoverArticles(dir);
    const slugs = result.map((r) => r.slug).sort();
    expect(slugs).toEqual(['bar', 'foo']);
    expect(result[0]?.dir).toContain(slugs[0]!);
  });

  it('returns empty array when no articles', async () => {
    const result = await discoverArticles(dir);
    expect(result).toEqual([]);
  });
});
```

- [ ] **Step 3: Run test — fails**

```bash
pnpm vitest run scripts/lib/discover
```

- [ ] **Step 4: Implement discover**

```ts
// scripts/lib/discover.ts
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

export interface DiscoveredArticle {
  slug: string;
  dir: string;
  metadataPath: string;
  contentPath: string;
  originalContentPath: string;
  assetsDir: string;
}

export async function discoverArticles(rootDir: string): Promise<DiscoveredArticle[]> {
  let entries: string[];
  try {
    entries = await readdir(rootDir);
  } catch {
    return [];
  }

  const out: DiscoveredArticle[] = [];
  for (const slug of entries) {
    if (slug.startsWith('.')) continue;
    const dir = join(rootDir, slug);
    const s = await stat(dir).catch(() => null);
    if (!s?.isDirectory()) continue;

    const metadataPath = join(dir, 'metadata.yml');
    const exists = await stat(metadataPath).then(() => true).catch(() => false);
    if (!exists) continue;

    out.push({
      slug,
      dir,
      metadataPath,
      contentPath: join(dir, 'content.tsx'),
      originalContentPath: join(dir, 'originalcontent.md'),
      assetsDir: join(dir, 'assets'),
    });
  }
  return out;
}
```

- [ ] **Step 5: Run test — passes**

```bash
pnpm vitest run scripts/lib/discover
```

- [ ] **Step 6: Commit**

```bash
git add scripts/ package.json pnpm-lock.yaml
git commit -m "feat(scripts): add discoverArticles with tests"
```

---

### Task 4.3: `build-articles` — parse + validate metadata

**Files:**
- Create: `scripts/lib/parse-metadata.ts`
- Create: `scripts/lib/parse-metadata.test.ts`

- [ ] **Step 1: Test**

```ts
// scripts/lib/parse-metadata.test.ts
import { describe, it, expect } from 'vitest';
import { parseMetadata } from './parse-metadata';

describe('parseMetadata', () => {
  it('parses valid yaml + applies defaults', () => {
    const yaml = `
title: Hello
excerpt: An intro
date: 2026-01-01
tags: [react]
`;
    const result = parseMetadata(yaml, '/fake/foo/metadata.yml');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.title).toBe('Hello');
      expect(result.data.featured).toBe(false);
      expect(result.data.author).toBe('WJWang');
    }
  });

  it('returns error for invalid yaml', () => {
    const result = parseMetadata(': bad', '/fake/m.yml');
    expect(result.ok).toBe(false);
  });

  it('returns error for missing required field', () => {
    const result = parseMetadata('title: x\nexcerpt: y\ntags: [t]', '/fake/m.yml');
    expect(result.ok).toBe(false);
  });
});
```

- [ ] **Step 2: Implement**

```ts
// scripts/lib/parse-metadata.ts
import { parse as parseYaml } from 'yaml';
import { ArticleMetadataSchema, type ArticleMetadata } from '@wjwang/ui/types';

export type ParseResult =
  | { ok: true; data: ArticleMetadata }
  | { ok: false; error: string };

export function parseMetadata(yamlContent: string, filePath: string): ParseResult {
  let raw: unknown;
  try {
    raw = parseYaml(yamlContent);
  } catch (e) {
    return { ok: false, error: `${filePath}: yaml parse error — ${(e as Error).message}` };
  }

  const result = ArticleMetadataSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    return { ok: false, error: `${filePath}: ${issues}` };
  }

  return { ok: true, data: result.data };
}
```

- [ ] **Step 3: Build UI Kit (so import resolves), run test, commit**

```bash
pnpm --filter @wjwang/ui build
pnpm vitest run scripts/lib/parse-metadata
git add scripts/lib/
git commit -m "feat(scripts): add parseMetadata with zod validation"
```

---

### Task 4.4: `build-articles` — enrich (slug, readTime, draft filter)

**Files:**
- Create: `scripts/lib/enrich.ts`
- Create: `scripts/lib/enrich.test.ts`

- [ ] **Step 1: Test**

```ts
// scripts/lib/enrich.test.ts
import { describe, it, expect } from 'vitest';
import { estimateReadTime, enrichToListItem } from './enrich';
import type { ArticleMetadata } from '@wjwang/ui/types';

describe('estimateReadTime', () => {
  it('returns "1 分鐘" for very short content', () => {
    expect(estimateReadTime('hello world')).toBe('1 分鐘');
  });

  it('counts CJK characters at 300/min', () => {
    const cjk = '中'.repeat(900);
    expect(estimateReadTime(cjk)).toBe('3 分鐘');
  });

  it('counts ASCII words at 200/min', () => {
    const words = 'word '.repeat(800).trim();
    expect(estimateReadTime(words)).toBe('4 分鐘');
  });
});

describe('enrichToListItem', () => {
  const meta: ArticleMetadata = {
    title: 'T',
    excerpt: 'E',
    date: '2026-01-01',
    tags: ['x'],
    featured: false,
    draft: false,
    author: 'WJWang',
    readTime: 'auto',
  };

  it('uses folder slug when metadata slug missing', () => {
    const item = enrichToListItem(meta, 'folder-slug', '中'.repeat(300));
    expect(item.slug).toBe('folder-slug');
  });

  it('overrides folder slug when metadata.slug present', () => {
    const item = enrichToListItem({ ...meta, slug: 'meta-slug' }, 'folder-slug', '');
    expect(item.slug).toBe('meta-slug');
  });

  it('substitutes auto readTime', () => {
    const item = enrichToListItem(meta, 'x', '中'.repeat(600));
    expect(item.readTime).toBe('2 分鐘');
  });

  it('keeps manual readTime', () => {
    const item = enrichToListItem({ ...meta, readTime: '99 分鐘' }, 'x', 'short');
    expect(item.readTime).toBe('99 分鐘');
  });

  it('resolves coverImage relative to /articles/{slug}/', () => {
    const item = enrichToListItem({ ...meta, coverImage: './assets/c.jpg' }, 'foo', '');
    expect(item.coverImage).toBe('/articles/foo/assets/c.jpg');
  });
});
```

- [ ] **Step 2: Implement**

```ts
// scripts/lib/enrich.ts
import type { ArticleMetadata, ArticleListItem } from '@wjwang/ui/types';

const CJK_RE = /[一-鿿぀-ゟ゠-ヿ]/g;
const WORD_RE = /[A-Za-z0-9]+/g;

export function estimateReadTime(text: string): string {
  const cjkCount = (text.match(CJK_RE) ?? []).length;
  const wordCount = (text.match(WORD_RE) ?? []).length;
  const minutes = Math.max(1, Math.ceil(cjkCount / 300 + wordCount / 200));
  return `${minutes} 分鐘`;
}

function resolveAssetPath(input: string | undefined, slug: string): string | undefined {
  if (!input) return undefined;
  if (input.startsWith('./assets/')) return `/articles/${slug}/assets/${input.slice('./assets/'.length)}`;
  if (input.startsWith('assets/')) return `/articles/${slug}/${input}`;
  return input;
}

export function enrichToListItem(
  meta: ArticleMetadata,
  folderSlug: string,
  originalContent: string,
): ArticleListItem {
  const slug = meta.slug ?? folderSlug;
  const readTime = meta.readTime === 'auto' ? estimateReadTime(originalContent) : meta.readTime;
  return {
    slug,
    title: meta.title,
    excerpt: meta.excerpt,
    date: meta.date,
    updatedAt: meta.updatedAt,
    readTime,
    tags: meta.tags,
    category: meta.category,
    featured: meta.featured,
    coverImage: resolveAssetPath(meta.coverImage, slug),
    ogImage: resolveAssetPath(meta.ogImage, slug),
    author: meta.author,
  };
}
```

- [ ] **Step 3: Test, commit**

```bash
pnpm vitest run scripts/lib/enrich
git add scripts/lib/
git commit -m "feat(scripts): add enrichToListItem + readTime estimator"
```

---

### Task 4.5: `build-articles` — emit manifest

**Files:**
- Create: `scripts/lib/emit-manifest.ts`
- Create: `scripts/lib/emit-manifest.test.ts`

- [ ] **Step 1: Test**

```ts
// scripts/lib/emit-manifest.test.ts
import { describe, it, expect } from 'vitest';
import { renderManifest } from './emit-manifest';
import type { ArticleListItem } from '@wjwang/ui/types';

const items: ArticleListItem[] = [
  {
    slug: 'foo', title: 'Foo', excerpt: 'e', date: '2026-01-01',
    readTime: '3 分鐘', tags: ['react'], featured: false, author: 'WJWang',
  },
];

describe('renderManifest', () => {
  it('emits articles array as TS literal', () => {
    const out = renderManifest(items);
    expect(out).toContain("slug: 'foo'");
    expect(out).toContain("title: 'Foo'");
    expect(out).toContain('articleLoaders');
  });

  it('escapes single quotes in strings', () => {
    const out = renderManifest([{ ...items[0]!, title: "it's a test" }]);
    expect(out).toContain("\\'");
  });

  it('emits dynamic import for each slug', () => {
    const out = renderManifest(items);
    expect(out).toContain("'foo':");
    expect(out).toContain("../../../content/articles/foo/content.tsx");
  });
});
```

- [ ] **Step 2: Implement**

```ts
// scripts/lib/emit-manifest.ts
import type { ArticleListItem } from '@wjwang/ui/types';

function ts(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  if (typeof value === 'string') return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  if (Array.isArray(value)) return `[${value.map(ts).join(', ')}]`;
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `    ${k}: ${ts(v)}`)
      .join(',\n');
    return `{\n${entries}\n  }`;
  }
  return 'undefined';
}

export function renderManifest(items: ArticleListItem[]): string {
  const articleLines = items.map((item) => `  ${ts(item)}`).join(',\n');
  const loaderLines = items
    .map(
      (item) =>
        `  '${item.slug}': () => import('../../../content/articles/${item.slug}/content.tsx'),`,
    )
    .join('\n');

  return `// AUTO-GENERATED by scripts/build-articles.ts — DO NOT EDIT
import type { ArticleListItem } from '@wjwang/ui/types';
import type { ComponentType } from 'react';

export const articles: ArticleListItem[] = [
${articleLines}
];

export const articleLoaders: Record<string, () => Promise<{ default: ComponentType }>> = {
${loaderLines}
};
`;
}
```

- [ ] **Step 3: Test, commit**

```bash
pnpm vitest run scripts/lib/emit-manifest
git add scripts/lib/
git commit -m "feat(scripts): render articles.generated.ts manifest"
```

---

### Task 4.6: `build-articles` — search index + RSS

**Files:**
- Create: `scripts/lib/emit-search-index.ts`
- Create: `scripts/lib/emit-rss.ts`
- Create: `scripts/lib/emit-rss.test.ts`

- [ ] **Step 1: Search index implementation**

```ts
// scripts/lib/emit-search-index.ts
import type { ArticleListItem } from '@wjwang/ui/types';

export interface SearchIndexEntry {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  category?: string;
}

export function buildSearchIndex(items: ArticleListItem[]): SearchIndexEntry[] {
  return items.map((i) => ({
    slug: i.slug,
    title: i.title,
    excerpt: i.excerpt,
    tags: i.tags,
    category: i.category,
  }));
}
```

- [ ] **Step 2: RSS test**

```ts
// scripts/lib/emit-rss.test.ts
import { describe, it, expect } from 'vitest';
import { buildRss } from './emit-rss';
import type { ArticleListItem } from '@wjwang/ui/types';

const items: ArticleListItem[] = [
  {
    slug: 'foo', title: 'Foo', excerpt: 'about foo', date: '2026-01-01',
    readTime: '3 分鐘', tags: ['react'], featured: false, author: 'WJWang',
  },
];

describe('buildRss', () => {
  it('produces well-formed RSS XML containing item title and link', () => {
    const xml = buildRss(items);
    expect(xml).toContain('<rss');
    expect(xml).toContain('<title>WJWang</title>');
    expect(xml).toContain('Foo');
    expect(xml).toContain('https://wjwang.dev/articles/foo');
  });

  it('limits to 50 items', () => {
    const many: ArticleListItem[] = Array.from({ length: 60 }, (_, i) => ({
      ...items[0]!, slug: `s${i}`, title: `T${i}`,
    }));
    const xml = buildRss(many);
    const matches = xml.match(/<item>/g) ?? [];
    expect(matches.length).toBe(50);
  });
});
```

- [ ] **Step 3: Implement RSS**

```ts
// scripts/lib/emit-rss.ts
import { Feed } from 'feed';
import type { ArticleListItem } from '@wjwang/ui/types';

const SITE_URL = 'https://wjwang.dev';

export function buildRss(items: ArticleListItem[]): string {
  const feed = new Feed({
    title: 'WJWang',
    description: 'WJWang 的技術部落格',
    id: `${SITE_URL}/`,
    link: `${SITE_URL}/`,
    language: 'zh-Hant',
    favicon: `${SITE_URL}/favicon.ico`,
    copyright: '© 2026 WJWang',
    feedLinks: { rss2: `${SITE_URL}/rss.xml` },
    author: { name: 'WJWang', email: 'anderson.thereisnospoon@gmail.com', link: SITE_URL },
  });

  for (const a of items.slice(0, 50)) {
    feed.addItem({
      title: a.title,
      id: `${SITE_URL}/articles/${a.slug}`,
      link: `${SITE_URL}/articles/${a.slug}`,
      description: a.excerpt,
      date: new Date(a.updatedAt ?? a.date),
      category: a.tags.map((name) => ({ name })),
      image: a.coverImage ? `${SITE_URL}${a.coverImage}` : undefined,
    });
  }

  return feed.rss2();
}
```

- [ ] **Step 4: Test, commit**

```bash
pnpm vitest run scripts/lib/emit-rss scripts/lib/emit-search-index
git add scripts/lib/
git commit -m "feat(scripts): add search-index + RSS emitters"
```

---

### Task 4.7: `build-articles` — assets mirror + CNAME mirror

**Files:**
- Create: `scripts/lib/mirror-assets.ts`

- [ ] **Step 1: Implement**

```ts
// scripts/lib/mirror-assets.ts
import { readdir, stat, mkdir, copyFile, rm } from 'node:fs/promises';
import { join, relative } from 'node:path';

export interface MirrorTask {
  fromAssetsDir: string;
  toAssetsDir: string;
}

async function exists(p: string): Promise<boolean> {
  return stat(p).then(() => true).catch(() => false);
}

async function copyDirRecursive(src: string, dst: string): Promise<void> {
  await mkdir(dst, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });
  for (const e of entries) {
    const s = join(src, e.name);
    const d = join(dst, e.name);
    if (e.isDirectory()) await copyDirRecursive(s, d);
    else if (e.isFile()) await copyFile(s, d);
  }
}

export async function mirrorAssets(tasks: MirrorTask[]): Promise<void> {
  for (const { fromAssetsDir, toAssetsDir } of tasks) {
    if (await exists(toAssetsDir)) await rm(toAssetsDir, { recursive: true, force: true });
    if (await exists(fromAssetsDir)) await copyDirRecursive(fromAssetsDir, toAssetsDir);
  }
}

export async function mirrorFile(src: string, dst: string): Promise<void> {
  if (!(await exists(src))) return;
  await mkdir(join(dst, '..'), { recursive: true });
  await copyFile(src, dst);
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/lib/mirror-assets.ts
git commit -m "feat(scripts): add asset/file mirror helpers"
```

---

### Task 4.8: `build-articles` — main entry

**Files:**
- Create: `scripts/build-articles.ts`

- [ ] **Step 1: Implement orchestrator**

```ts
// scripts/build-articles.ts
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { discoverArticles } from './lib/discover.js';
import { parseMetadata } from './lib/parse-metadata.js';
import { enrichToListItem } from './lib/enrich.js';
import { renderManifest } from './lib/emit-manifest.js';
import { buildSearchIndex } from './lib/emit-search-index.js';
import { buildRss } from './lib/emit-rss.js';
import { mirrorAssets, mirrorFile } from './lib/mirror-assets.js';
import type { ArticleListItem } from '@wjwang/ui/types';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export async function buildArticles(): Promise<{ count: number; drafts: number }> {
  const articlesRoot = join(ROOT, 'content', 'articles');
  const generatedDir = join(ROOT, 'apps', 'web', 'content-generated');
  const publicDir = join(ROOT, 'apps', 'web', 'public');

  const discovered = await discoverArticles(articlesRoot);
  const enriched: ArticleListItem[] = [];
  let drafts = 0;

  for (const a of discovered) {
    const yaml = await readFile(a.metadataPath, 'utf8');
    const parsed = parseMetadata(yaml, a.metadataPath);
    if (!parsed.ok) {
      console.error(`✗ ${parsed.error}`);
      process.exitCode = 1;
      throw new Error(parsed.error);
    }
    if (parsed.data.draft) {
      drafts++;
      continue;
    }
    const md = await readFile(a.originalContentPath, 'utf8').catch(() => '');
    enriched.push(enrichToListItem(parsed.data, a.slug, md));
  }

  enriched.sort((a, b) => (a.date < b.date ? 1 : -1));

  await mkdir(generatedDir, { recursive: true });
  await writeFile(join(generatedDir, 'articles.generated.ts'), renderManifest(enriched));
  await writeFile(
    join(generatedDir, 'search-index.generated.json'),
    JSON.stringify(buildSearchIndex(enriched), null, 2),
  );

  await mirrorAssets(
    discovered.map((d) => ({
      fromAssetsDir: d.assetsDir,
      toAssetsDir: join(publicDir, 'articles', d.slug, 'assets'),
    })),
  );

  await mirrorFile(join(ROOT, 'CNAME'), join(publicDir, 'CNAME'));

  await writeFile(join(publicDir, 'rss.xml'), buildRss(enriched));

  console.log(`✓ Built ${enriched.length} articles (${drafts} drafts skipped)`);
  return { count: enriched.length, drafts };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  buildArticles().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
```

- [ ] **Step 2: Verify dry run with empty content/articles**

```bash
pnpm build:articles
```

Expected: `✓ Built 0 articles (0 drafts skipped)`. `apps/web/content-generated/articles.generated.ts` exists with empty `articles` array.

- [ ] **Step 3: Wire as `prebuild`**

Edit `apps/web/package.json` `scripts`:

```json
{
  "scripts": {
    "prebuild": "pnpm -w build:articles",
    "build":    "next build",
    ...
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add scripts/build-articles.ts apps/web/package.json
git commit -m "feat(scripts): orchestrate build-articles + wire as web prebuild"
```

---

### Task 4.9: `new-article` scaffolder

**Files:**
- Create: `scripts/new-article.ts`
- Create: `scripts/new-article.test.ts`

- [ ] **Step 1: Test**

```ts
// scripts/new-article.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { scaffoldArticle, isValidSlug } from './new-article';

describe('isValidSlug', () => {
  it.each(['foo', 'foo-bar', 'a1b2', 'react-server-components'])('accepts %s', (s) => {
    expect(isValidSlug(s)).toBe(true);
  });
  it.each(['Foo', 'foo bar', 'foo_bar', 'foo!'])('rejects %s', (s) => {
    expect(isValidSlug(s)).toBe(false);
  });
});

describe('scaffoldArticle', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(join(tmpdir(), 'wjw-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('creates the four expected files', async () => {
    await scaffoldArticle('my-post', dir, '2026-05-02');
    const slugDir = join(dir, 'my-post');
    await stat(join(slugDir, 'metadata.yml'));
    await stat(join(slugDir, 'originalcontent.md'));
    await stat(join(slugDir, 'content.tsx'));
    await stat(join(slugDir, 'assets', '.gitkeep'));
  });

  it('includes today date in metadata.yml', async () => {
    await scaffoldArticle('p', dir, '2026-05-02');
    const meta = await readFile(join(dir, 'p', 'metadata.yml'), 'utf8');
    expect(meta).toContain('2026-05-02');
  });

  it('rejects existing slug', async () => {
    await scaffoldArticle('p', dir, '2026-05-02');
    await expect(scaffoldArticle('p', dir, '2026-05-02')).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Implement**

```ts
// scripts/new-article.ts
import { mkdir, writeFile, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export function isValidSlug(s: string): boolean {
  return /^[a-z0-9-]+$/.test(s);
}

export async function scaffoldArticle(slug: string, baseDir: string, today: string): Promise<void> {
  if (!isValidSlug(slug)) {
    throw new Error(`Invalid slug "${slug}": must match /^[a-z0-9-]+$/`);
  }
  const dir = join(baseDir, slug);
  const exists = await stat(dir).then(() => true).catch(() => false);
  if (exists) throw new Error(`Article folder already exists: ${dir}`);

  await mkdir(join(dir, 'assets'), { recursive: true });
  await writeFile(join(dir, 'assets', '.gitkeep'), '');

  await writeFile(join(dir, 'metadata.yml'), `# 必填
title: TODO
excerpt: TODO（卡片摘要 + meta description，280 字內）
date: ${today}
tags:
  - TODO

# 選填
# category: Frontend
# featured: false
# coverImage: ./assets/cover.jpg
# updatedAt: ${today}
# readTime: auto
`);

  await writeFile(join(dir, 'originalcontent.md'), '');

  await writeFile(join(dir, 'content.tsx'), `import {
  Prose,
  CodeBlock,
  ImageFigure,
  Callout,
  KeyTakeaways,
  Quote,
  Aside,
  Comparison,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      {/* 把 originalcontent.md 的內容透過 prompts/md-to-tsx.md 轉成 TSX 後貼這裡 */}
    </Prose>
  );
}
`);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const slug = process.argv[2];
  if (!slug) {
    console.error('Usage: pnpm new:article <slug>');
    process.exit(1);
  }
  const today = new Date().toISOString().slice(0, 10);
  scaffoldArticle(slug, join(ROOT, 'content', 'articles'), today)
    .then(() => {
      console.log(`✓ Created content/articles/${slug}/`);
      console.log('  ├── metadata.yml');
      console.log('  ├── originalcontent.md');
      console.log('  ├── content.tsx');
      console.log('  └── assets/.gitkeep');
    })
    .catch((e) => {
      console.error(`✗ ${(e as Error).message}`);
      process.exit(1);
    });
}
```

- [ ] **Step 3: Test, commit**

```bash
pnpm vitest run scripts/new-article
git add scripts/new-article.ts scripts/new-article.test.ts
git commit -m "feat(scripts): add new:article scaffolder"
```

---

### Task 4.10: `validate-article` script

**Files:**
- Create: `scripts/validate-article.ts`
- Create: `scripts/lib/validate.ts`
- Create: `scripts/lib/validate.test.ts`

- [ ] **Step 1: Test for validate logic**

```ts
// scripts/lib/validate.test.ts
import { describe, it, expect } from 'vitest';
import { extractAssetPaths, extractImports, ALLOWED_COMPONENTS } from './validate';

describe('extractImports', () => {
  it('finds imports from @wjwang/ui/article', () => {
    const src = `import { Prose, CodeBlock } from '@wjwang/ui/article';`;
    const r = extractImports(src);
    expect(r.allowed).toEqual(['Prose', 'CodeBlock']);
    expect(r.disallowed).toEqual([]);
  });

  it('flags non-allowed imports', () => {
    const src = `import x from 'lodash';`;
    const r = extractImports(src);
    expect(r.disallowed).toContain('lodash');
  });

  it('allows react import', () => {
    const src = `import * as React from 'react';\nimport { Prose } from '@wjwang/ui/article';`;
    const r = extractImports(src);
    expect(r.disallowed).toEqual([]);
  });
});

describe('extractAssetPaths', () => {
  it('finds /articles/{slug}/assets/* references', () => {
    const src = `<img src="/articles/foo/assets/x.png" />`;
    expect(extractAssetPaths(src, 'foo')).toEqual(['x.png']);
  });

  it('ignores other slugs', () => {
    const src = `<img src="/articles/bar/assets/y.png" />`;
    expect(extractAssetPaths(src, 'foo')).toEqual([]);
  });
});

describe('ALLOWED_COMPONENTS', () => {
  it('contains all 11 article building blocks', () => {
    expect(ALLOWED_COMPONENTS).toEqual(
      expect.arrayContaining([
        'Prose', 'CodeBlock', 'ImageFigure', 'Callout', 'KeyTakeaways',
        'Quote', 'Aside', 'Comparison', 'ArticleCard', 'ArticleHero', 'ArticleLayout',
      ]),
    );
  });
});
```

- [ ] **Step 2: Implement validate lib**

```ts
// scripts/lib/validate.ts
export const ALLOWED_COMPONENTS = [
  'Prose', 'CodeBlock', 'ImageFigure', 'Callout', 'KeyTakeaways',
  'Quote', 'Aside', 'Comparison', 'ArticleCard', 'ArticleHero', 'ArticleLayout',
];

const ALLOWED_IMPORT_SOURCES = ['@wjwang/ui/article', 'react', 'react/jsx-runtime'];
const IMPORT_RE = /import\s+(?:[\w*{}\s,]+from\s+)?['"]([^'"]+)['"]/g;
const NAMED_IMPORTS_RE = /import\s*\{([^}]+)\}\s*from\s*['"]@wjwang\/ui\/article['"]/g;
const ASSET_RE = /\/articles\/([a-z0-9-]+)\/assets\/([^\s"'<>]+)/g;

export function extractImports(src: string): { allowed: string[]; disallowed: string[] } {
  const disallowed: string[] = [];
  for (const match of src.matchAll(IMPORT_RE)) {
    const source = match[1]!;
    if (!ALLOWED_IMPORT_SOURCES.includes(source)) disallowed.push(source);
  }

  const allowed: string[] = [];
  for (const match of src.matchAll(NAMED_IMPORTS_RE)) {
    const names = match[1]!.split(',').map((n) => n.trim()).filter(Boolean);
    allowed.push(...names);
  }

  return { allowed, disallowed };
}

export function extractAssetPaths(src: string, slug: string): string[] {
  const out: string[] = [];
  for (const match of src.matchAll(ASSET_RE)) {
    if (match[1] === slug) out.push(match[2]!);
  }
  return out;
}
```

- [ ] **Step 3: Implement CLI wrapper**

```ts
// scripts/validate-article.ts
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverArticles } from './lib/discover.js';
import { parseMetadata } from './lib/parse-metadata.js';
import { extractImports, extractAssetPaths, ALLOWED_COMPONENTS } from './lib/validate.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

interface Issue { level: 'error' | 'warn'; slug: string; message: string }

async function validateOne(slug: string, baseDir: string): Promise<Issue[]> {
  const issues: Issue[] = [];
  const dir = join(baseDir, slug);
  const metaPath = join(dir, 'metadata.yml');
  const contentPath = join(dir, 'content.tsx');
  const originalPath = join(dir, 'originalcontent.md');
  const assetsDir = join(dir, 'assets');

  const metaText = await readFile(metaPath, 'utf8').catch(() => null);
  if (!metaText) {
    issues.push({ level: 'error', slug, message: `missing metadata.yml` });
    return issues;
  }
  const parsed = parseMetadata(metaText, metaPath);
  if (!parsed.ok) issues.push({ level: 'error', slug, message: parsed.error });
  else if (parsed.data.slug && parsed.data.slug !== slug) {
    issues.push({ level: 'error', slug, message: `metadata.slug "${parsed.data.slug}" ≠ folder name "${slug}"` });
  } else if (parsed.data.updatedAt && parsed.data.updatedAt < parsed.data.date) {
    issues.push({ level: 'error', slug, message: `updatedAt (${parsed.data.updatedAt}) < date (${parsed.data.date})` });
  }

  const original = await readFile(originalPath, 'utf8').catch(() => '');
  if (original.length === 0) issues.push({ level: 'error', slug, message: 'originalcontent.md missing or empty' });

  const content = await readFile(contentPath, 'utf8').catch(() => null);
  if (!content) {
    issues.push({ level: 'error', slug, message: 'content.tsx missing' });
    return issues;
  }
  if (!/export\s+default\s+function/.test(content)) {
    issues.push({ level: 'error', slug, message: 'content.tsx must `export default function ...`' });
  }

  const { allowed, disallowed } = extractImports(content);
  for (const src of disallowed) {
    issues.push({ level: 'error', slug, message: `disallowed import source: ${src}` });
  }
  for (const name of allowed) {
    if (!ALLOWED_COMPONENTS.includes(name)) {
      issues.push({ level: 'error', slug, message: `unknown component: ${name}` });
    }
  }

  const refdAssets = new Set(extractAssetPaths(content, slug));
  let realAssets: Set<string> = new Set();
  try {
    const entries = await readdir(assetsDir);
    for (const name of entries) if (!name.startsWith('.')) realAssets.add(name);
  } catch { /* assets dir may not exist */ }

  for (const ref of refdAssets) {
    if (!realAssets.has(ref)) issues.push({ level: 'error', slug, message: `asset not found: assets/${ref}` });
  }
  for (const real of realAssets) {
    if (!refdAssets.has(real)) issues.push({ level: 'warn', slug, message: `dead asset: assets/${real}` });
  }

  return issues;
}

async function main(): Promise<void> {
  const baseDir = join(ROOT, 'content', 'articles');
  const arg = process.argv[2];
  let slugs: string[];

  if (!arg || arg === '--all') {
    const articles = await discoverArticles(baseDir);
    slugs = articles.map((a) => a.slug);
  } else {
    slugs = [arg];
  }

  let errors = 0;
  for (const slug of slugs) {
    const issues = await validateOne(slug, baseDir);
    for (const i of issues) {
      const tag = i.level === 'error' ? '✗' : '⚠';
      console.log(`${tag} ${i.slug}: ${i.message}`);
      if (i.level === 'error') errors++;
    }
    if (issues.length === 0) console.log(`✓ ${slug}`);
  }

  if (errors > 0) process.exit(1);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 4: Run lib tests, commit**

```bash
pnpm vitest run scripts/lib/validate
git add scripts/validate-article.ts scripts/lib/validate.ts scripts/lib/validate.test.ts
git commit -m "feat(scripts): add validate:article (imports, components, assets, metadata)"
```

---

### Task 4.11: Dev concierge with chokidar watcher

**Files:**
- Create: `scripts/dev.ts`

- [ ] **Step 1: Implement**

```ts
// scripts/dev.ts
import { spawn } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import chokidar from 'chokidar';
import { buildArticles } from './build-articles.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function debounce<T extends (...args: never[]) => unknown>(fn: T, ms: number): T {
  let t: NodeJS.Timeout | null = null;
  return ((...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => { void fn(...args); }, ms);
  }) as T;
}

async function main(): Promise<void> {
  await buildArticles();

  const next = spawn('pnpm', ['--filter', 'web', 'dev'], { cwd: ROOT, stdio: 'inherit' });

  const rebuild = debounce(async () => {
    try {
      await buildArticles();
    } catch (e) {
      console.error('build-articles failed:', (e as Error).message);
    }
  }, 200);

  const watcher = chokidar.watch(join(ROOT, 'content', 'articles'), {
    ignoreInitial: true,
    ignored: ['**/node_modules/**'],
  });
  watcher.on('all', () => rebuild());

  const shutdown = () => {
    watcher.close().catch(() => {});
    next.kill('SIGINT');
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Verify (smoke)**

```bash
pnpm dev
# Visit http://localhost:3000 — should still work
# Stop with Ctrl-C
```

- [ ] **Step 3: Commit**

```bash
git add scripts/dev.ts
git commit -m "feat(scripts): dev concierge with chokidar article watcher"
```

## Phase 5 — Routes & Pages

> **Prereq:** `pnpm build:articles` has been run at least once so `apps/web/content-generated/articles.generated.ts` exists. With empty `content/articles/`, the manifest exports `articles: []` and `articleLoaders: {}` — pages still compile (they just render empty lists). The first real article enters in Phase 8.

### Task 5.1: `articles.ts` lib helper (DRY)

**Files:**
- Create: `apps/web/src/lib/articles.ts`

- [ ] **Step 1: Implement**

```ts
// apps/web/src/lib/articles.ts
import { articles, articleLoaders } from '@/content-generated/articles.generated';
import type { ArticleListItem } from '@wjwang/ui/types';

export { articles, articleLoaders };

export function findBySlug(slug: string): ArticleListItem | undefined {
  return articles.find((a) => a.slug === slug);
}

export function relatedTo(slug: string, max = 2): ArticleListItem[] {
  const target = findBySlug(slug);
  if (!target) return [];
  return articles
    .filter((a) => a.slug !== slug && a.tags.some((t) => target.tags.includes(t)))
    .slice(0, max);
}

export function allTags(): { tag: string; count: number }[] {
  const map = new Map<string, number>();
  for (const a of articles) {
    for (const t of a.tags) map.set(t, (map.get(t) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count);
}

export function articlesByTag(tag: string): ArticleListItem[] {
  return articles.filter((a) => a.tags.includes(tag));
}

export function allCategories(): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const a of articles) {
    if (!a.category) continue;
    map.set(a.category, (map.get(a.category) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

export function lastUpdated(): string | undefined {
  if (articles.length === 0) return undefined;
  const dates = articles.map((a) => a.updatedAt ?? a.date);
  return dates.sort().at(-1);
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/lib/articles.ts
git commit -m "feat(web): add articles lib helpers (findBySlug, relatedTo, allTags, etc.)"
```

---

### Task 5.2: Hero component

**Files:**
- Create: `apps/web/src/components/Hero.tsx`

- [ ] **Step 1: Migrate from reference**

```bash
cp reference/blog-ui-theme/src/app/components/Hero.tsx apps/web/src/components/Hero.tsx
```

- [ ] **Step 2: Fix imports**

Open `apps/web/src/components/Hero.tsx` and replace any `@/` imports referring to reference paths. The Hero is mostly a presentational component — likely it imports lucide icons and shadcn primitives. Update primitive imports:

```bash
sed -i '' \
  -e "s|from '@/components/ui/|from '@wjwang/ui/primitives'|g" \
  -e "s|from './ui/|from '@wjwang/ui/primitives'|g" \
  apps/web/src/components/Hero.tsx
```

(Multi-named-import lines may need manual fixup — open the file and verify.)

- [ ] **Step 3: Update text/avatar to read from site-config**

If the Hero hard-codes WJWang's name/avatar, replace with imports from `@/lib/site-config`:

```tsx
import { SITE } from '@/lib/site-config';
// Replace hardcoded "WJWang" with {SITE.name}, hardcoded "/avatar.jpg" with {SITE.author.avatar}, etc.
```

- [ ] **Step 4: Verify renders in dev**

```bash
pnpm dev
# Add <Hero /> temporarily to apps/web/src/app/page.tsx and check
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/Hero.tsx
git commit -m "feat(web): migrate Hero from reference, drive copy from site-config"
```

---

### Task 5.3: Sidebar component (manifest-driven)

**Files:**
- Create: `apps/web/src/components/Sidebar.tsx`

- [ ] **Step 1: Implement**

```tsx
// apps/web/src/components/Sidebar.tsx
import { Tag, TrendingUp } from 'lucide-react';
import { allCategories, allTags } from '@/lib/articles';

export function Sidebar() {
  const categories = allCategories();
  const tags = allTags().slice(0, 8);

  return (
    <aside className="space-y-8">
      {categories.length > 0 && (
        <div className="p-6 rounded-lg border border-border bg-card">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <TrendingUp className="w-5 h-5 text-primary" />
            熱門分類
          </h3>
          <div className="space-y-1">
            {categories.map((c) => (
              <a
                key={c.name}
                href={`/tags/${encodeURIComponent(c.name)}`}
                className="flex items-center justify-between p-3 rounded-md hover:bg-secondary transition-colors group"
              >
                <span>{c.name}</span>
                <span className="text-sm text-muted-foreground">{c.count}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div className="p-6 rounded-lg border border-border bg-card">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Tag className="w-5 h-5 text-primary" />
            熱門標籤
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <a
                key={t.tag}
                href={`/tags/${encodeURIComponent(t.tag)}`}
                className="px-3 py-1.5 text-sm rounded-md bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors font-medium"
              >
                {t.tag}
              </a>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
```

> Note: We surface `category` via `/tags/{name}` rather than building a separate `/categories` route (per design §4.2 — categories deferred). When/if we add `/categories`, swap the href.

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/Sidebar.tsx
git commit -m "feat(web): Sidebar driven by article manifest (no hardcoded data)"
```

---

### Task 5.4: Home page (`/`)

**Files:**
- Modify: `apps/web/src/app/page.tsx`

- [ ] **Step 1: Implement**

```tsx
// apps/web/src/app/page.tsx
import { ArticleCard } from '@wjwang/ui/article';
import { GeometricBackground } from '@wjwang/ui/components';
import { Hero } from '@/components/Hero';
import { Sidebar } from '@/components/Sidebar';
import { articles } from '@/lib/articles';

export default function HomePage() {
  const featured = articles.find((a) => a.featured);
  const latest = articles.filter((a) => !a.featured).slice(0, 6);

  return (
    <>
      <Hero />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        <GeometricBackground />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          <div className="lg:col-span-2 space-y-8">
            {featured && (
              <section>
                <h2 className="text-2xl mb-6 font-semibold">精選文章</h2>
                <ArticleCard meta={featured} variant="featured" />
              </section>
            )}
            <section>
              <h2 className="text-2xl mb-6 font-semibold">最新文章</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {latest.map((a) => (
                  <ArticleCard key={a.slug} meta={a} />
                ))}
              </div>
            </section>
          </div>
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </main>
    </>
  );
}
```

- [ ] **Step 2: Verify renders (empty state OK)**

```bash
pnpm dev
# Visit http://localhost:3000 — should show Hero + empty sections, no errors
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/page.tsx
git commit -m "feat(web): implement home page (Hero + featured + latest + sidebar)"
```

---

### Task 5.5: Articles list `/articles` (with tag filter chips + client pagination)

**Files:**
- Create: `apps/web/src/app/articles/page.tsx`
- Create: `apps/web/src/components/ArticlesGrid.tsx`

- [ ] **Step 1: Client component with state**

```tsx
// apps/web/src/components/ArticlesGrid.tsx
'use client';

import { useMemo, useState } from 'react';
import { ArticleCard } from '@wjwang/ui/article';
import type { ArticleListItem } from '@wjwang/ui/types';
import { cn } from '@wjwang/ui/primitives';

const PAGE_SIZE = 12;

export interface ArticlesGridProps {
  articles: ArticleListItem[];
  tags: { tag: string; count: number }[];
}

export function ArticlesGrid({ articles, tags }: ArticlesGridProps) {
  const [active, setActive] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => (active ? articles.filter((a) => a.tags.includes(active)) : articles),
    [articles, active],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function pickTag(t: string | null) {
    setActive(t);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => pickTag(null)}
          className={cn(
            'px-3 py-1.5 text-sm rounded-md font-medium transition-colors',
            active === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-foreground hover:bg-primary/20',
          )}
        >
          全部 ({articles.length})
        </button>
        {tags.map((t) => (
          <button
            key={t.tag}
            onClick={() => pickTag(t.tag)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-md font-medium transition-colors',
              active === t.tag
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-foreground hover:bg-primary/20',
            )}
          >
            {t.tag} ({t.count})
          </button>
        ))}
      </div>

      {pageItems.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">沒有符合的文章</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pageItems.map((a) => (
            <ArticleCard key={a.slug} meta={a} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 pt-4" aria-label="pagination">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 text-sm rounded-md bg-secondary disabled:opacity-50 hover:bg-primary/20"
          >
            上一頁
          </button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-sm rounded-md bg-secondary disabled:opacity-50 hover:bg-primary/20"
          >
            下一頁
          </button>
        </nav>
      )}
    </div>
  );
}
```

> Note: `cn` is re-exported from `@wjwang/ui/primitives` via the shadcn primitives barrel that already exports `cn` from utils. If that's not the case, add an explicit re-export in `packages/ui/src/primitives/index.ts`:
> ```ts
> export { cn } from '../lib/utils';
> ```

- [ ] **Step 2: Server page wrapper**

```tsx
// apps/web/src/app/articles/page.tsx
import type { Metadata } from 'next';
import { articles, allTags } from '@/lib/articles';
import { ArticlesGrid } from '@/components/ArticlesGrid';

export const metadata: Metadata = {
  title: '所有文章',
  description: 'WJWang 寫過的所有文章',
  alternates: { canonical: '/articles' },
};

export default function ArticlesPage() {
  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">所有文章</h1>
      <ArticlesGrid articles={articles} tags={allTags()} />
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/articles/page.tsx apps/web/src/components/ArticlesGrid.tsx
git commit -m "feat(web): articles list with tag chips + client pagination"
```

---

### Task 5.6: Article detail `/articles/[slug]`

**Files:**
- Create: `apps/web/src/app/articles/[slug]/page.tsx`
- Create: `apps/web/src/app/articles/[slug]/not-found.tsx`
- Create: `apps/web/src/components/JsonLdArticle.tsx`

- [ ] **Step 1: JsonLdArticle component**

```tsx
// apps/web/src/components/JsonLdArticle.tsx
import type { ArticleListItem } from '@wjwang/ui/types';
import { SITE } from '@/lib/site-config';

export function JsonLdArticle({ meta }: { meta: ArticleListItem }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: meta.title,
    description: meta.excerpt,
    image: meta.coverImage ? `${SITE.url}${meta.coverImage}` : undefined,
    datePublished: meta.date,
    dateModified: meta.updatedAt ?? meta.date,
    author: { '@type': 'Person', name: meta.author, url: `${SITE.url}/about` },
    publisher: { '@type': 'Person', name: SITE.name, url: SITE.url },
    mainEntityOfPage: `${SITE.url}/articles/${meta.slug}`,
    keywords: meta.tags.join(', '),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

- [ ] **Step 2: Page**

```tsx
// apps/web/src/app/articles/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleLayout, Prose } from '@wjwang/ui/article';
import { articles, articleLoaders, findBySlug, relatedTo } from '@/lib/articles';
import { JsonLdArticle } from '@/components/JsonLdArticle';
import { SITE } from '@/lib/site-config';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;
export const dynamic = 'force-static';

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = findBySlug(slug);
  if (!meta) return {};
  const og = meta.ogImage ?? meta.coverImage ?? '/og/default.png';
  return {
    title: meta.title,
    description: meta.excerpt,
    openGraph: {
      title: meta.title,
      description: meta.excerpt,
      url: `${SITE.url}/articles/${meta.slug}`,
      images: [og],
      type: 'article',
      publishedTime: meta.date,
      modifiedTime: meta.updatedAt ?? meta.date,
      tags: meta.tags,
    },
    twitter: { card: 'summary_large_image', title: meta.title, description: meta.excerpt, images: [og] },
    alternates: { canonical: `/articles/${meta.slug}` },
  };
}

export default async function ArticleDetail({ params }: PageProps) {
  const { slug } = await params;
  const meta = findBySlug(slug);
  if (!meta) notFound();

  const loader = articleLoaders[slug];
  if (!loader) notFound();
  const Content = (await loader()).default;
  const related = relatedTo(slug);

  return (
    <>
      <JsonLdArticle meta={meta} />
      <ArticleLayout meta={meta} related={related}>
        <Prose>
          <Content />
        </Prose>
      </ArticleLayout>
    </>
  );
}
```

> Note: `<Prose>` wraps `<Content />` here so the article TSX itself does NOT need to add another `<Prose>` outer wrapper — but the LLM prompt tells it to add one anyway. **Keep only one `<Prose>`** — remove from this page so the article TSX (per spec §3.1) owns it. Updating:

Actually re-read spec §3.1: the example article tsx already has `<Prose>` inside `Content`. So we should NOT wrap Content in Prose here. Fix:

```tsx
// In ArticleDetail above, replace:
//   <Prose><Content /></Prose>
// with:
//   <Content />
```

Apply the fix:

```tsx
      <ArticleLayout meta={meta} related={related}>
        <Content />
      </ArticleLayout>
```

And remove `Prose` from the import line.

- [ ] **Step 3: Not-found page**

```tsx
// apps/web/src/app/articles/[slug]/not-found.tsx
export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl mb-4">文章不存在</h2>
        <a
          href="/articles"
          className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          返回文章列表
        </a>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/articles/[slug]/ apps/web/src/components/JsonLdArticle.tsx
git commit -m "feat(web): article detail page with SSG params + OG metadata + JSON-LD"
```

---

### Task 5.7: Tags list `/tags`

**Files:**
- Create: `apps/web/src/app/tags/page.tsx`

- [ ] **Step 1: Implement tag cloud**

```tsx
// apps/web/src/app/tags/page.tsx
import type { Metadata } from 'next';
import { allTags } from '@/lib/articles';

export const metadata: Metadata = {
  title: '標籤',
  description: 'WJWang blog 所有文章標籤',
  alternates: { canonical: '/tags' },
};

const SIZES = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'];
function bucket(count: number, max: number): string {
  if (max <= 1) return SIZES[2]!;
  const ratio = count / max;
  const idx = Math.min(SIZES.length - 1, Math.floor(ratio * SIZES.length));
  return SIZES[idx]!;
}

export default function TagsPage() {
  const tags = allTags();
  const max = tags.reduce((m, t) => Math.max(m, t.count), 0);

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">標籤</h1>
      {tags.length === 0 ? (
        <p className="text-muted-foreground">目前還沒有任何標籤。</p>
      ) : (
        <div className="flex flex-wrap gap-3 items-baseline">
          {tags.map((t) => (
            <a
              key={t.tag}
              href={`/tags/${encodeURIComponent(t.tag)}`}
              className={`${bucket(t.count, max)} text-foreground hover:text-primary transition-colors font-medium`}
            >
              #{t.tag}
              <span className="ml-1 text-xs text-muted-foreground align-baseline">({t.count})</span>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/app/tags/page.tsx
git commit -m "feat(web): tags cloud page"
```

---

### Task 5.8: Tag detail `/tags/[tag]`

**Files:**
- Create: `apps/web/src/app/tags/[tag]/page.tsx`

- [ ] **Step 1: Implement**

```tsx
// apps/web/src/app/tags/[tag]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleCard } from '@wjwang/ui/article';
import { allTags, articlesByTag } from '@/lib/articles';

interface PageProps {
  params: Promise<{ tag: string }>;
}

export const dynamicParams = false;
export const dynamic = 'force-static';

export function generateStaticParams() {
  return allTags().map((t) => ({ tag: encodeURIComponent(t.tag) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `標籤：${decoded}`,
    description: `所有標記為「${decoded}」的文章`,
    alternates: { canonical: `/tags/${tag}` },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const list = articlesByTag(decoded);
  if (list.length === 0) notFound();

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <a href="/tags" className="text-muted-foreground hover:text-foreground text-sm mb-2 inline-block">
        ← 所有標籤
      </a>
      <h1 className="text-3xl font-bold mb-2">#{decoded}</h1>
      <p className="text-muted-foreground mb-8">{list.length} 篇文章</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {list.map((a) => (
          <ArticleCard key={a.slug} meta={a} />
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/app/tags/[tag]/page.tsx
git commit -m "feat(web): tag detail page with SSG params"
```

---

### Task 5.9: About page `/about`

**Files:**
- Create: `apps/web/src/app/about/page.tsx`

- [ ] **Step 1: Implement**

```tsx
// apps/web/src/app/about/page.tsx
import type { Metadata } from 'next';
import { Github, Linkedin, Mail, BookOpen } from 'lucide-react';
import { Prose } from '@wjwang/ui/article';
import { SITE, SOCIALS } from '@/lib/site-config';

export const metadata: Metadata = {
  title: '關於',
  description: `關於 ${SITE.name}`,
  alternates: { canonical: '/about' },
  openGraph: { images: ['/og/about.png'] },
};

const ICON = { github: Github, linkedin: Linkedin, medium: BookOpen, mail: Mail };
const LABEL = { github: 'GitHub', linkedin: 'LinkedIn', medium: 'Medium', mail: 'Email' };

export default function AboutPage() {
  return (
    <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-6 mb-8">
        <img
          src={SITE.author.avatar}
          alt={SITE.author.name}
          className="w-24 h-24 rounded-full ring-2 ring-primary/30"
        />
        <div>
          <h1 className="text-3xl font-bold">{SITE.author.name}</h1>
          <p className="text-muted-foreground mt-1">{SITE.description}</p>
        </div>
      </div>

      <Prose>
        <p>
          歡迎來到我的部落格。這裡會記錄我在軟體工程、系統設計與工具實踐的學習筆記。
        </p>
        <p>
          技術棧主要圍繞 React、TypeScript、Node.js，以及一些雲端與基礎設施議題。
          也會有對 LLM workflow 與 dev productivity 的觀察與實驗。
        </p>
      </Prose>

      <div className="mt-8 flex gap-4">
        {SOCIALS.map((s) => {
          const Icon = ICON[s.kind];
          return (
            <a
              key={s.kind}
              href={s.href}
              target={s.kind === 'mail' ? undefined : '_blank'}
              rel={s.kind === 'mail' ? undefined : 'noopener noreferrer'}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:border-primary transition-colors"
            >
              <Icon className="w-5 h-5" />
              <span>{LABEL[s.kind]}</span>
            </a>
          );
        })}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/app/about/page.tsx
git commit -m "feat(web): About page with bio + socials"
```

---

### Task 5.10: Root not-found

**Files:**
- Create: `apps/web/src/app/not-found.tsx`

- [ ] **Step 1: Implement**

```tsx
// apps/web/src/app/not-found.tsx
export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-muted-foreground mb-6">找不到這個頁面。</p>
        <a
          href="/"
          className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          返回首頁
        </a>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/app/not-found.tsx
git commit -m "feat(web): root 404 page"
```

---

### Task 5.11: SearchCommand cmd-k modal (replace stub)

**Files:**
- Modify: `apps/web/src/components/SearchCommand.tsx`

- [ ] **Step 1: Implement real modal**

```tsx
// apps/web/src/components/SearchCommand.tsx
'use client';

import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from 'react';
import { Search } from 'lucide-react';
import Fuse from 'fuse.js';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@wjwang/ui/primitives';

interface SearchEntry {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  category?: string;
}

interface SearchCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
}
const Ctx = createContext<SearchCtx | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return <Ctx.Provider value={{ open, setOpen }}>{children}</Ctx.Provider>;
}

export function useSearch() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useSearch must be used within SearchProvider');
  return c;
}

export function SearchTrigger() {
  const { setOpen } = useSearch();
  return (
    <button
      onClick={() => setOpen(true)}
      aria-label="開啟搜尋 (Cmd+K)"
      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
    >
      <Search className="w-5 h-5" />
    </button>
  );
}

export function SearchCommand() {
  const { open, setOpen } = useSearch();
  const [entries, setEntries] = useState<SearchEntry[] | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open || entries) return;
    fetch('/search-index.generated.json')
      .then((r) => r.json())
      .then((data: SearchEntry[]) => setEntries(data))
      .catch(() => setEntries([]));
  }, [open, entries]);

  const fuse = useMemo(
    () => (entries ? new Fuse(entries, { threshold: 0.3, keys: ['title', 'excerpt', 'tags'] }) : null),
    [entries],
  );

  const results = useMemo(() => {
    if (!fuse || !query) return entries ?? [];
    return fuse.search(query).map((r) => r.item);
  }, [fuse, entries, query]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="搜尋文章... (按 Esc 關閉)" value={query} onValueChange={setQuery} />
      <CommandList>
        {entries === null && <div className="p-4 text-sm text-muted-foreground">載入索引中…</div>}
        {entries !== null && results.length === 0 && <CommandEmpty>沒有結果</CommandEmpty>}
        {results.length > 0 && (
          <CommandGroup heading="文章">
            {results.slice(0, 10).map((r) => (
              <CommandItem
                key={r.slug}
                value={r.title}
                onSelect={() => {
                  setOpen(false);
                  window.location.href = `/articles/${r.slug}`;
                }}
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{r.title}</span>
                  <span className="text-xs text-muted-foreground line-clamp-1">{r.excerpt}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
```

- [ ] **Step 2: Wire search-index to be served by Next**

`apps/web/src/app/search-index.generated.json/route.ts` — NOT used (route handlers don't work in static export). Instead, the build script writes to `apps/web/public/search-index.generated.json`.

Add a step to `scripts/build-articles.ts` to also write the search index to `apps/web/public/`:

```ts
// In buildArticles(), after writing content-generated:
await writeFile(
  join(publicDir, 'search-index.generated.json'),
  JSON.stringify(buildSearchIndex(enriched)),
);
```

> Why both: `content-generated/` is for type-safe imports (manifest); `public/` is for runtime fetch in the browser.

Add to `apps/web/.gitignore`:

```
public/search-index.generated.json
```

- [ ] **Step 3: Verify**

```bash
pnpm build:articles
ls apps/web/public/search-index.generated.json   # should exist
pnpm dev
# Visit homepage, press cmd+K. Modal should open.
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/SearchCommand.tsx scripts/build-articles.ts apps/web/.gitignore
git commit -m "feat(web): SearchCommand cmd-k modal with fuse.js + lazy fetch"
```

---

## Phase 6 — SEO

### Task 6.1: `app/sitemap.ts`

**Files:**
- Create: `apps/web/src/app/sitemap.ts`

- [ ] **Step 1: Implement**

```ts
// apps/web/src/app/sitemap.ts
import type { MetadataRoute } from 'next';
import { articles, allTags, lastUpdated } from '@/lib/articles';
import { SITE } from '@/lib/site-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const homeLast = lastUpdated() ?? new Date().toISOString().slice(0, 10);

  const articleEntries = articles.map((a) => ({
    url: `${SITE.url}/articles/${a.slug}`,
    lastModified: a.updatedAt ?? a.date,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const tagEntries = allTags().map(({ tag }) => {
    const inTag = articles.filter((a) => a.tags.includes(tag));
    const last = inTag.map((a) => a.updatedAt ?? a.date).sort().at(-1) ?? homeLast;
    return {
      url: `${SITE.url}/tags/${encodeURIComponent(tag)}`,
      lastModified: last,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    };
  });

  return [
    { url: SITE.url,               priority: 1.0, changeFrequency: 'weekly',  lastModified: homeLast },
    { url: `${SITE.url}/articles`, priority: 0.9, changeFrequency: 'weekly',  lastModified: homeLast },
    { url: `${SITE.url}/tags`,     priority: 0.6, changeFrequency: 'monthly', lastModified: homeLast },
    { url: `${SITE.url}/about`,    priority: 0.5, changeFrequency: 'yearly' },
    ...articleEntries,
    ...tagEntries,
  ];
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/app/sitemap.ts
git commit -m "feat(web): sitemap.ts (home + articles + tags + about)"
```

---

### Task 6.2: `app/robots.ts`

**Files:**
- Create: `apps/web/src/app/robots.ts`

- [ ] **Step 1: Implement**

```ts
// apps/web/src/app/robots.ts
import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/app/robots.ts
git commit -m "feat(web): robots.ts"
```

---

### Task 6.3: Icons + manifest

**Files:**
- Create: `apps/web/src/app/icon.png` (32x32, derived from avatar)
- Create: `apps/web/src/app/apple-icon.png` (180x180)
- Create: `apps/web/src/app/manifest.ts`
- Create: `apps/web/public/og/home.png` (placeholder 1200x630)
- Create: `apps/web/public/og/about.png` (placeholder 1200x630)
- Create: `apps/web/public/og/default.png` (placeholder 1200x630)

- [ ] **Step 1: Manifest**

```ts
// apps/web/src/app/manifest.ts
import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site-config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.name,
    description: SITE.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#080808',
    theme_color: '#080808',
    icons: [
      { src: '/icon.png', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
```

- [ ] **Step 2: Generate icons from avatar**

```bash
# Use sips (macOS built-in) or imagemagick to resize avatar to required sizes.
sips -z 32 32 apps/web/public/avatar.jpg --out apps/web/src/app/icon.png
sips -z 180 180 apps/web/public/avatar.jpg --out apps/web/src/app/apple-icon.png
```

> If sips/imagemagick unavailable, use any image editor. Output PNG.

- [ ] **Step 3: OG image placeholders**

For now, make 1200x630 solid-color placeholders so the build doesn't break:

```bash
mkdir -p apps/web/public/og
# Use sips to resize avatar to 1200x630 (will distort, but it's a placeholder)
sips -z 630 1200 apps/web/public/avatar.jpg --out apps/web/public/og/home.png
cp apps/web/public/og/home.png apps/web/public/og/about.png
cp apps/web/public/og/home.png apps/web/public/og/default.png
```

> User should replace these with proper designs later. Note in `apps/web/public/og/README.md`:

```bash
cat > apps/web/public/og/README.md <<'EOF'
# OG Image Placeholders

These are temporary placeholders. Replace with proper 1200x630 designs:
- home.png — homepage / list pages
- about.png — about page
- default.png — fallback for articles without coverImage
EOF
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/manifest.ts apps/web/src/app/icon.png apps/web/src/app/apple-icon.png apps/web/public/og/
git commit -m "feat(web): icons, manifest, OG image placeholders"
```

---

### Task 6.4: Verify SEO outputs in built artifacts

- [ ] **Step 1: Build**

```bash
pnpm --filter web build
```

- [ ] **Step 2: Check artifacts**

```bash
ls apps/web/out/sitemap.xml apps/web/out/robots.txt apps/web/out/rss.xml apps/web/out/manifest.webmanifest
```

Expected: all four exist.

- [ ] **Step 3: Spot-check sitemap content**

```bash
grep -c '<url>' apps/web/out/sitemap.xml
# Should equal 4 (home + articles + tags + about) since content is empty in this phase
```

- [ ] **Step 4: Verify CNAME made it**

```bash
cat apps/web/out/CNAME
# Should contain "wjwang.dev"
```

- [ ] **Step 5: Commit any tweaks (none expected)**

```bash
git status
```

---

## Phase 7 — LLM Prompt Template

### Task 7.1: Write `prompts/md-to-tsx.md`

**Files:**
- Create: `prompts/md-to-tsx.md`

- [ ] **Step 1: Create the prompt**

```bash
mkdir -p prompts
```

Create `prompts/md-to-tsx.md`:

````markdown
# WJWang Blog — Markdown → TSX 轉換指南

你是 WJWang blog 的 content compiler。任務：把使用者提供的 markdown 文件轉成 WJWang blog 系統可直接渲染的 React 元件 (`content.tsx`)。

## 強制規則

1. **Imports** — 只能 import 以下來源，**不可** import 任何其他 npm 套件：
   ```tsx
   import {
     Prose, CodeBlock, ImageFigure, Callout, KeyTakeaways, Quote, Aside, Comparison,
   } from '@wjwang/ui/article';
   ```
2. 必須 default export 一個 `Content` 函式
3. 整篇用 `<Prose>` 包起來
4. 圖片一律用 `<ImageFigure>`，path 規則：`/articles/{slug}/assets/{filename}`（slug 與資料夾名相同）
5. 程式碼 block 一律用 `<CodeBlock language="...">`，內容用 template literal（` \`...\` `）並 escape 反引號
6. **不要**自己寫 `<h1>` / `<p>` 客製樣式類；交給 `<Prose>` 套 typography
7. **不要**輸出 HTML 註解、markdown fence、解釋、前言、結語

## 元件選用對照

| Markdown 結構 | 改用 |
|---|---|
| Headings / 段落 / list / 一般 blockquote | `<Prose>` 內原生 `<h1> <p> <ul> <blockquote>` |
| ` ```lang code``` ` | `<CodeBlock language="lang" filename="optional.ext">` |
| `![alt](path)` | `<ImageFigure src="..." alt="..." caption="..." ratio="16/9">` |
| `> 💡 Tip:` / `> ⚠️ Warning:` 等帶 emoji 的提示 blockquote | `<Callout variant="tip\|warn\|info\|success\|danger">` |
| 文章開頭 / 結尾的「重點摘要」list | `<KeyTakeaways items={[...]}>` |
| 名人引言（含作者） | `<Quote author="..." source="...">` |
| 補充說明、題外話 | `<Aside title="...">` |
| pros/cons 或 A vs B 對照表 | `<Comparison columns={[{ title, items, tone }]}>` |

## Component API（精簡）

- `<Prose size?="base"|"lg">` — typography wrapper
- `<CodeBlock language: string, filename?: string, highlightLines?: number[]>` — children = code string
- `<ImageFigure src: string, alt?: string, caption?: string, ratio?: "16/9"|"4/3"|"1/1">`
- `<Callout variant?="info"|"warn"|"success"|"danger"|"tip", title?: string>`
- `<KeyTakeaways title?: string, items: ReactNode[]>`
- `<Quote author?: string, source?: string>`
- `<Aside title?: string>`
- `<Comparison columns: { title: string, items: ReactNode[], tone?: "pos"|"neg"|"neutral" }[]>`

## 風格慣例

- 中英文 / 中文與數字之間保留半形空格（pangu 風格）
- 段落保持簡短（每段 3-5 句）
- `<CodeBlock>` 必填 `language`（如：`tsx`, `ts`, `js`, `bash`, `yaml`, `json`, `md`, `css`）
- `caption` / `title` 一律中文化
- 列表項目精簡，避免過長句子

## 輸出格式

直接回傳一份完整的 `content.tsx`：第一行就是 `import`，最後一行是 `}`。不要有 markdown fence、不要有解釋文字。

## 完整範例

### Input MD

````md
# 重新理解 SOLID

最近在 review code 時，發現 SOLID 五原則被誤用得很頻繁。

## SRP 不是「一個 class 只做一件事」

> 💡 Tip: SRP 真正在說的是「一個 class 應該只有一個變更的理由」。

很多人把 Single Responsibility Principle 解讀成「一個 class 只做一件事」，但這個說法太模糊。

```ts
class UserService {
  createUser(data: UserData) { /* ... */ }
  sendWelcomeEmail(user: User) { /* ... */ }
}
```

上面這段看起來「做兩件事」，但若兩個方法**同樣**因為「使用者註冊流程」而變更，它們就應該在一起。
````

### Output TSX

```tsx
import {
  Prose, CodeBlock, ImageFigure, Callout, KeyTakeaways, Quote, Aside, Comparison,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <h1>重新理解 SOLID</h1>

      <p>最近在 review code 時，發現 SOLID 五原則被誤用得很頻繁。</p>

      <h2>SRP 不是「一個 class 只做一件事」</h2>

      <Callout variant="tip">
        SRP 真正在說的是「一個 class 應該只有一個變更的理由」。
      </Callout>

      <p>
        很多人把 Single Responsibility Principle 解讀成「一個 class 只做一件事」，但這個說法太模糊。
      </p>

      <CodeBlock language="ts">{`class UserService {
  createUser(data: UserData) { /* ... */ }
  sendWelcomeEmail(user: User) { /* ... */ }
}`}</CodeBlock>

      <p>
        上面這段看起來「做兩件事」，但若兩個方法<strong>同樣</strong>因為「使用者註冊流程」而變更，它們就應該在一起。
      </p>
    </Prose>
  );
}
```

## 維護備註

- 當 `@wjwang/ui/article` 新增/移除/重命名元件時，**必須**同步更新本檔案
- 元件 API 變動時，更新 "Component API" 段落
- 範例若失效，從最新發布的文章中挑一篇重做範例
````

- [ ] **Step 2: Commit**

```bash
git add prompts/md-to-tsx.md
git commit -m "feat(prompts): add md-to-tsx LLM conversion guide"
```

---

## Phase 8 — Seed Article (Dogfood)

### Task 8.1: Scaffold first article

- [ ] **Step 1: Pick a seed**

Use the `react-server-components` article from `reference/blog-ui-theme/src/app/data/articles.ts` as the seed.

- [ ] **Step 2: Run scaffolder**

```bash
pnpm new:article react-server-components
```

Expected output: `✓ Created content/articles/react-server-components/` with the four files.

- [ ] **Step 3: Fill `metadata.yml`**

```yaml
title: 深入理解 React Server Components
excerpt: 探討 React Server Components 的核心概念、運作原理，以及如何在實際專案中應用這項新技術來提升應用程式效能。
date: 2026-04-28
tags:
  - React
  - Frontend
  - Performance

category: Frontend
featured: true
# coverImage: ./assets/cover.jpg   # add when you have one
```

- [ ] **Step 4: Copy MD content**

Open `reference/blog-ui-theme/src/app/data/articles.ts`, find the `react-server-components` entry, and copy its `content` field (the markdown string) into `content/articles/react-server-components/originalcontent.md`. Strip the leading/trailing newline.

- [ ] **Step 5: Commit**

```bash
git add content/articles/react-server-components/
git commit -m "feat(content): seed first article (react-server-components) — metadata + raw md"
```

---

### Task 8.2: LLM-convert MD → TSX

- [ ] **Step 1: Manual LLM run**

Open Claude (or another capable LLM). Paste:
1. The full content of `prompts/md-to-tsx.md` as system / context
2. The content of `content/articles/react-server-components/originalcontent.md` as user input
3. Add: "slug = `react-server-components`. Output only the TSX."

- [ ] **Step 2: Replace `content.tsx`**

Take the LLM output and replace the entire content of `content/articles/react-server-components/content.tsx` with it.

- [ ] **Step 3: Validate**

```bash
pnpm validate:article react-server-components
```

Expected: `✓ react-server-components` (or specific errors). Fix any errors by re-prompting the LLM with the validation message.

- [ ] **Step 4: Build articles + preview**

```bash
pnpm build:articles
pnpm dev
# Visit http://localhost:3000/articles/react-server-components
```

- [ ] **Step 5: Visual check against reference**

Compare against `reference/blog-ui-theme` running on its own port to ensure the visual matches:

```bash
# In another terminal:
cd reference/blog-ui-theme && pnpm install && pnpm dev
# It will run on a different port; navigate to that article
```

If anything is off (typography, code block style, etc.), fix in `@wjwang/ui` and rebuild.

- [ ] **Step 6: Commit**

```bash
git add content/articles/react-server-components/content.tsx
git commit -m "feat(content): convert seed article MD → TSX via LLM"
```

---

### Task 8.3: Add a cover image

- [ ] **Step 1: Pick or create a cover image**

Save a 16:9 image as `content/articles/react-server-components/assets/cover.jpg` (any reasonable size, ~1600x900).

- [ ] **Step 2: Add to metadata**

Edit `content/articles/react-server-components/metadata.yml`:

```yaml
coverImage: ./assets/cover.jpg
```

- [ ] **Step 3: Rebuild + verify**

```bash
pnpm build:articles
ls apps/web/public/articles/react-server-components/assets/cover.jpg   # should exist (mirrored)
```

Visit `http://localhost:3000/articles/react-server-components` and verify OG meta in `<head>` (view source) references the cover.

- [ ] **Step 4: Commit**

```bash
git add content/articles/react-server-components/
git commit -m "feat(content): add cover image to seed article"
```

---

## Phase 9 — Deploy

### Task 9.1: GitHub Actions workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create workflow**

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
        with:
          version: 9

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

- [ ] **Step 2: Commit and push**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions workflow for Pages deploy"
git push origin main
```

- [ ] **Step 3: First run will fail until Pages is configured (Task 9.2)**

The push triggers the workflow but it'll likely fail at the `actions/configure-pages` step until the user enables Pages. That's expected; Task 9.2 fixes it.

---

### Task 9.2: GitHub Pages settings (manual, user must do)

> **Manual checklist for the human (cannot be done by code agent):**

- [ ] **Step 1: GitHub repo Settings → Pages**
  - Source: **GitHub Actions**

- [ ] **Step 2: Custom domain**
  - Custom domain: `wjwang.dev`
  - Tick **Enforce HTTPS** (may take ~10 min to provision after DNS resolves)

- [ ] **Step 3: DNS at registrar**
  - 4 × `A` records → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
  - 1 × `CNAME` record → `www` → `wjwang.github.io`

- [ ] **Step 4: Re-run failed workflow**
  - Actions tab → failed run → "Re-run all jobs"
  - Should now deploy successfully

- [ ] **Step 5: Verify production**
  - Visit `https://wjwang.dev/` → home loads
  - Visit `https://wjwang.dev/articles/react-server-components/` → article loads
  - Visit `https://wjwang.dev/sitemap.xml` → XML loads
  - Visit `https://wjwang.dev/rss.xml` → RSS loads
  - Visit `https://wjwang.dev/robots.txt` → contains sitemap URL

---

### Task 9.3: Lighthouse baseline

- [ ] **Step 1: Run Lighthouse on production**

In Chrome, open `https://wjwang.dev/articles/react-server-components/`. DevTools → Lighthouse → Mobile → Generate report.

- [ ] **Step 2: Verify thresholds**

Expected (per Definition of Done):
- Performance ≥ 90
- SEO = 100
- Accessibility ≥ 95
- Best Practices ≥ 90 (loose)

- [ ] **Step 3: If any below threshold, file issues**

Common issues:
- LCP image lacking `priority` / `fetchpriority="high"` → add to ImageFigure when used in hero
- Missing alt text → enforce alt in ImageFigure (already required for a11y? — verify)
- Color contrast on neon colors → verify with Lighthouse

Fix iteratively; commit fixes.

- [ ] **Step 4: Commit baseline note (optional)**

```bash
mkdir -p docs/superpowers/notes
cat > docs/superpowers/notes/2026-05-02-lighthouse-baseline.md <<'EOF'
# Lighthouse Baseline 2026-05-02

URL: https://wjwang.dev/articles/react-server-components/
Mode: Mobile

| Metric | Score |
|---|---|
| Performance | XX |
| Accessibility | XX |
| SEO | XX |
| Best Practices | XX |

(Replace XX with actual scores)
EOF
git add docs/superpowers/notes/
git commit -m "docs: lighthouse baseline notes"
```

---

## Phase 10 — Cleanup

### Task 10.1: Archive `reference/`

- [ ] **Step 1: Confirm reference no longer needed at runtime**

The reference is only useful for visual comparison and source code lookup during initial migration. Phase 8 has dogfooded the full pipeline. From here, reference is read-only.

Options:

- **Keep ignored**: leave `reference/` in `.gitignore` (already done in Task 0.1's gitignore). Files stay locally, never committed. Simplest.
- **Move to `archive/`**: Rename `reference/` → `archive/blog-ui-theme/`. Update `.gitignore` to ignore `archive/` instead. Same effect, slightly cleaner naming.
- **Delete**: Remove the directory locally. No going back; reference always available on the original Figma export anyway.

Recommendation: **keep ignored** — zero work, references stay handy for future component additions.

- [ ] **Step 2: Update `reference/SPEC.md` (if keeping)**

Add a note pointing to the new spec:

```bash
cat > reference/SPEC.md <<'EOF'
> **Migrated.** This spec has been superseded by `docs/superpowers/specs/2026-05-02-wjwang-blog-design.md`.
> See `docs/superpowers/plans/2026-05-02-wjwang-blog.md` for implementation.
> The original spec content is preserved below for historical reference.

[original SPEC content here]
EOF
```

> Since `reference/` is git-ignored, this edit is purely local — no commit needed.

- [ ] **Step 3: Commit (no-op if no changes)**

```bash
git status
# Should show clean working tree
```

---

## Final Verification (Definition of Done)

- [ ] **`pnpm install && pnpm build` on a clean clone succeeds**

  ```bash
  cd /tmp && git clone <repo> wjwang-test && cd wjwang-test && pnpm install && pnpm build
  ```

- [ ] **`https://wjwang.dev/` shows home page; visual matches reference**

- [ ] **At least 1 article rendered via full pipeline (`new:article` → MD → LLM → `validate` → deploy)**

- [ ] **`https://wjwang.dev/sitemap.xml` lists all URLs (home, /articles, /tags, /about + each article + each tag)**

- [ ] **`https://wjwang.dev/rss.xml` parses cleanly in an RSS reader (e.g. Feedly)**

- [ ] **cmd+K opens search modal; typing a keyword surfaces matching articles; Enter navigates**

- [ ] **Lighthouse mobile: Performance ≥ 90, SEO = 100, Accessibility ≥ 95**

- [ ] **GH Actions deploys within 3 min of push to `main`**

---

## Tested-and-True Patterns (for the executing agent)

- **Per-task commits.** Don't batch unrelated changes. The plan's commit messages are deliberate.
- **Build UI Kit before testing dependent code.** Workspace deps resolve through `dist/` — if you skip the build, imports break.
- **Use real fixtures for build script tests.** `mkdtemp` + write real files. Don't mock `fs`.
- **Don't add features beyond the task.** If you notice something missing, add a new task to the plan rather than expanding the current one.
- **If a step's expected output doesn't match reality, stop and investigate.** Don't bulldoze through — diagnose first.



