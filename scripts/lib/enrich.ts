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
  const readTime = meta.readTime === 'auto' ? estimateReadTime(originalContent) : meta.readTime ?? estimateReadTime(originalContent);
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
