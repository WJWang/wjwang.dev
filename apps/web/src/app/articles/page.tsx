import type { Metadata } from 'next';
import { articles, allTags } from '@/lib/articles';
import { ArticlesGrid } from '@/components/ArticlesGrid';

export const metadata: Metadata = {
  title: '所有文章',
  description: 'WJWang 寫過的所有文章',
  alternates: { canonical: '/articles' },
};

export default function ArticlesPage() {
  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">所有文章</h1>
      <ArticlesGrid articles={articles} tags={allTags()} />
    </main>
  );
}
