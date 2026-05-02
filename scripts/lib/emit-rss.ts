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
