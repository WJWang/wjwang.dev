import type { ArticleListItem } from '@wjwang/ui/types';
import { SITE } from '@/lib/site-config';

export function JsonLdArticle({ meta }: { meta: ArticleListItem }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: meta.title,
    description: meta.excerpt,
    image: meta.coverImage ? `${SITE.url}${meta.coverImage}` : undefined,
    datePublished: meta.date,
    dateModified: meta.updatedAt ?? meta.date,
    author: { '@type': 'Person', name: meta.author, url: `${SITE.url}/about` },
    publisher: { '@type': 'Person', name: SITE.name, url: SITE.url },
    mainEntityOfPage: `${SITE.url}/articles/${meta.slug}`,
    keywords: meta.tags.join(', '),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
