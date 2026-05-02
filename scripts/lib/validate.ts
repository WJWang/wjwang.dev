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
