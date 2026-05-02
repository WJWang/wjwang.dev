// apps/web/src/app/sitemap.ts
import type { MetadataRoute } from 'next';
import { articles, allTags, lastUpdated } from '@/lib/articles';
import { SITE } from '@/lib/site-config';

export const dynamic = 'force-static';

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
