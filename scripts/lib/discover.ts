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
