// apps/web/src/app/tags/[tag]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleCard } from '@wjwang/ui/article';
import { allTags, articlesByTag } from '@/lib/articles';

interface PageProps {
  params: Promise<{ tag: string }>;
}

export const dynamicParams = false;
export const dynamic = 'force-static';
export const revalidate = 0; // bypass Next 15.5 empty-params quirk (same as articles/[slug])

export function generateStaticParams() {
  return allTags().map((t) => ({ tag: encodeURIComponent(t.tag) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `標籤：${decoded}`,
    description: `所有標記為「${decoded}」的文章`,
    alternates: { canonical: `/tags/${tag}` },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const list = articlesByTag(decoded);
  if (list.length === 0) notFound();

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <a href="/tags" className="text-muted-foreground hover:text-foreground text-sm mb-2 inline-block">
        ← 所有標籤
      </a>
      <h1 className="text-3xl font-bold mb-2">#{decoded}</h1>
      <p className="text-muted-foreground mb-8">{list.length} 篇文章</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {list.map((a) => (
          <ArticleCard key={a.slug} meta={a} />
        ))}
      </div>
    </main>
  );
}
