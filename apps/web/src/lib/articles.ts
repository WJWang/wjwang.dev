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
