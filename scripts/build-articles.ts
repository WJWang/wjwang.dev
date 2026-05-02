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

  // Also write search index to public/ so the browser can fetch it at runtime
  await writeFile(
    join(publicDir, 'search-index.generated.json'),
    JSON.stringify(buildSearchIndex(enriched)),
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
