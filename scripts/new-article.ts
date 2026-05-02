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
