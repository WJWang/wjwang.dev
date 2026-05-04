import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleLayout } from '@wjwang/ui/article';
import { articles, articleLoaders, findBySlug, relatedTo } from '@/lib/articles';
import { JsonLdArticle } from '@/components/JsonLdArticle';
import { SITE } from '@/lib/site-config';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = findBySlug(slug);
  if (!meta) return {};
  // Point at the .png-suffixed copy (mirrored by scripts/postbuild-og.ts) so
  // GitHub Pages serves it as image/png. Without the extension, GH Pages serves
  // application/octet-stream and Facebook refuses to render the OG card.
  const ogUrl = `${SITE.url}/articles/${meta.slug}/opengraph-image.png`;
  return {
    title: meta.title,
    description: meta.excerpt,
    openGraph: {
      title: meta.title,
      description: meta.excerpt,
      url: `${SITE.url}/articles/${meta.slug}`,
      type: 'article',
      publishedTime: meta.date,
      modifiedTime: meta.updatedAt ?? meta.date,
      tags: meta.tags,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: meta.title, type: 'image/png' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.excerpt,
      images: [ogUrl],
    },
    alternates: { canonical: `/articles/${meta.slug}` },
  };
}

export default async function ArticleDetail({ params }: PageProps) {
  const { slug } = await params;
  const meta = findBySlug(slug);
  if (!meta) notFound();

  const loader = articleLoaders[slug];
  if (!loader) notFound();
  const Content = (await loader()).default;
  const related = relatedTo(slug);

  return (
    <>
      <JsonLdArticle meta={meta} />
      <ArticleLayout meta={meta} related={related}>
        <Content />
      </ArticleLayout>
    </>
  );
}
