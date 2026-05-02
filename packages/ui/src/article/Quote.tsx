import type { ReactNode } from 'react';
import { Quote as QuoteIcon } from 'lucide-react';

export interface QuoteProps {
  author?: string;
  source?: string;
  children: ReactNode;
}

export function Quote({ author, source, children }: QuoteProps) {
  return (
    <blockquote className="my-8 p-6 border-l-4 border-primary bg-card rounded-r-lg">
      <QuoteIcon className="w-6 h-6 text-primary mb-3" aria-hidden />
      <div className="text-lg italic text-foreground">{children}</div>
      {(author || source) && (
        <footer className="mt-4 text-sm text-muted-foreground">
          {author && <span>— {author}</span>}
          {source && <span className="ml-2 opacity-75">{source}</span>}
        </footer>
      )}
    </blockquote>
  );
}
