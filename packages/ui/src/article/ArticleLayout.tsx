import type { ReactNode } from 'react';
import type { ArticleListItem } from '../types/article';
import { ArticleHero } from './ArticleHero';
import { GeometricBackground } from '../components/GeometricBackground';

export interface ArticleLayoutProps {
  meta: ArticleListItem;
  related?: ArticleListItem[];
  children: ReactNode;
}

export function ArticleLayout({ meta, related, children }: ArticleLayoutProps) {
  return (
    <div className="min-h-screen relative">
      <GeometricBackground />
      <ArticleHero meta={meta} />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-20">
        {children}
      </article>

      {related && related.length > 0 && (
        <div className="border-t border-border mt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-20">
            <h3 className="text-2xl mb-6 font-bold">相關文章</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {related.map((r) => (
                <a
                  key={r.slug}
                  href={`/articles/${r.slug}`}
                  className="block p-6 rounded-lg border border-border bg-card hover:border-primary transition-all group"
                >
                  <h4 className="mb-2 group-hover:text-primary transition-colors">{r.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{r.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{r.date}</span>
                    <span>•</span>
                    <span>{r.readTime}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
