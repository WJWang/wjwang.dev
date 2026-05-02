import { readFile, readdir } from 'node:fs/promises';
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
