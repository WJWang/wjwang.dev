'use client';

import { useMemo, useState } from 'react';
import { ArticleCard } from '@wjwang/ui/article';
import { cn } from '@wjwang/ui';
import type { ArticleListItem } from '@wjwang/ui/types';

const PAGE_SIZE = 12;

export interface ArticlesGridProps {
  articles: ArticleListItem[];
  tags: { tag: string; count: number }[];
}

export function ArticlesGrid({ articles, tags }: ArticlesGridProps) {
  const [active, setActive] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => (active ? articles.filter((a) => a.tags.includes(active)) : articles),
    [articles, active],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function pickTag(t: string | null) {
    setActive(t);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => pickTag(null)}
          className={cn(
            'px-3 py-1.5 text-sm rounded-md font-medium transition-colors',
            active === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-foreground hover:bg-primary/20',
          )}
        >
          全部 ({articles.length})
        </button>
        {tags.map((t) => (
          <button
            key={t.tag}
            onClick={() => pickTag(t.tag)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-md font-medium transition-colors',
              active === t.tag
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-foreground hover:bg-primary/20',
            )}
          >
            {t.tag} ({t.count})
          </button>
        ))}
      </div>

      {pageItems.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">沒有符合的文章</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pageItems.map((a) => (
            <ArticleCard key={a.slug} meta={a} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 pt-4" aria-label="pagination">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 text-sm rounded-md bg-secondary disabled:opacity-50 hover:bg-primary/20"
          >
            上一頁
          </button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-sm rounded-md bg-secondary disabled:opacity-50 hover:bg-primary/20"
          >
            下一頁
          </button>
        </nav>
      )}
    </div>
  );
}
