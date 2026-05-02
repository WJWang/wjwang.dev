// apps/web/src/app/tags/page.tsx
import type { Metadata } from 'next';
import { allTags } from '@/lib/articles';

export const metadata: Metadata = {
  title: '標籤',
  description: 'WJWang blog 所有文章標籤',
  alternates: { canonical: '/tags' },
};

const SIZES = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'];
function bucket(count: number, max: number): string {
  if (max <= 1) return SIZES[2]!;
  const ratio = count / max;
  const idx = Math.min(SIZES.length - 1, Math.floor(ratio * SIZES.length));
  return SIZES[idx]!;
}

export default function TagsPage() {
  const tags = allTags();
  const max = tags.reduce((m, t) => Math.max(m, t.count), 0);

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">標籤</h1>
      {tags.length === 0 ? (
        <p className="text-muted-foreground">目前還沒有任何標籤。</p>
      ) : (
        <div className="flex flex-wrap gap-3 items-baseline">
          {tags.map((t) => (
            <a
              key={t.tag}
              href={`/tags/${encodeURIComponent(t.tag)}`}
              className={`${bucket(t.count, max)} text-foreground hover:text-primary transition-colors font-medium`}
            >
              #{t.tag}
              <span className="ml-1 text-xs text-muted-foreground align-baseline">({t.count})</span>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
