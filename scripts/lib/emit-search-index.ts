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
