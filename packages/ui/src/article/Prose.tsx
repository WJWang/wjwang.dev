import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

export interface ProseProps {
  children: ReactNode;
  size?: 'base' | 'lg';
  className?: string;
}

export function Prose({ children, size = 'base', className }: ProseProps) {
  return (
    <div
      className={cn(
        'prose max-w-none',
        size === 'lg' && 'prose-lg',
        '[&_h1]:text-4xl [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:font-bold',
        '[&_h2]:text-3xl [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:font-bold',
        '[&_h3]:text-2xl [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:font-semibold',
        '[&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-foreground',
        '[&_ul]:list-disc [&_ul]:list-inside [&_ul]:mb-4 [&_ul]:space-y-2',
        '[&_ol]:list-decimal [&_ol]:list-inside [&_ol]:mb-4 [&_ol]:space-y-2',
        '[&_li]:text-foreground',
        '[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:text-muted-foreground',
        '[&_a]:text-primary [&_a:hover]:underline',
        '[&_hr]:my-8 [&_hr]:border-border',
        '[&_strong]:font-semibold',
        '[&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-secondary [&_code]:text-sm',
        '[&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-border [&_table]:text-sm',
        '[&_thead]:bg-secondary',
        '[&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold',
        '[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:align-top',
        className,
      )}
    >
      {children}
    </div>
  );
}
