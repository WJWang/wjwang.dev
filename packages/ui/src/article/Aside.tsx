import type { ReactNode } from 'react';

export interface AsideProps {
  title?: string;
  children: ReactNode;
}

export function Aside({ title, children }: AsideProps) {
  return (
    <aside className="my-6 p-5 rounded-md border border-dashed border-border bg-muted/30">
      {title && <div className="text-sm uppercase tracking-wide text-muted-foreground mb-2">{title}</div>}
      <div className="text-foreground/90">{children}</div>
    </aside>
  );
}
