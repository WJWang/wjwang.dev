import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import type { ArticleListItem } from '../types/article';

export interface ArticleHeroProps {
  meta: ArticleListItem;
  backHref?: string;
  backLabel?: string;
}

export function ArticleHero({ meta, backHref = '/articles', backLabel = '返回文章列表' }: ArticleHeroProps) {
  return (
    <div className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-20">
        <a
          href={backHref}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {backLabel}
        </a>

        <h1 className="text-4xl md:text-5xl mb-6 font-bold text-foreground">{meta.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{meta.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{meta.readTime}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {meta.tags.map((tag) => (
            <span key={tag} className="px-3 py-1 text-sm rounded-md bg-secondary text-foreground font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
