import { Calendar, Clock, ArrowRight } from 'lucide-react';
import type { ArticleListItem } from '../types/article';
import { cn } from '../lib/utils';

export interface ArticleCardProps {
  meta: ArticleListItem;
  variant?: 'default' | 'featured';
}

export function ArticleCard({ meta, variant = 'default' }: ArticleCardProps) {
  const featured = variant === 'featured';
  return (
    <a href={`/articles/${meta.slug}`} className={cn('group block', featured && 'md:col-span-2')}>
      <article
        className={cn(
          'group cursor-pointer',
          featured && 'md:col-span-2',
        )}
      >
        <div className="h-full p-6 rounded-lg border border-border bg-card hover:border-primary transition-all duration-200">
          <div className="flex flex-wrap gap-2 mb-4">
            {meta.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs rounded-md bg-secondary text-foreground font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          <h3
            className={cn(
              'mb-3 group-hover:text-primary transition-colors',
              featured ? 'text-3xl' : 'text-xl',
            )}
          >
            {meta.title}
          </h3>

          <p className="text-muted-foreground mb-4 line-clamp-3">{meta.excerpt}</p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{meta.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{meta.readTime}</span>
            </div>
            <div className="ml-auto flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              <span>閱讀更多</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </article>
    </a>
  );
}
