import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

export type ComparisonTone = 'pos' | 'neg' | 'neutral';

export interface ComparisonColumn {
  title: string;
  items: ReactNode[];
  tone?: ComparisonTone;
}

export interface ComparisonProps {
  columns: ComparisonColumn[];
}

const TONE_BORDER: Record<ComparisonTone, string> = {
  pos: 'border-t-primary',
  neg: 'border-t-destructive',
  neutral: 'border-t-border',
};

export function Comparison({ columns }: ComparisonProps) {
  return (
    <div
      className="my-6 grid gap-4"
      style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0,1fr))` }}
    >
      {columns.map((col, idx) => (
        <div
          key={idx}
          className={cn(
            'p-4 rounded-md border border-border bg-card border-t-4',
            TONE_BORDER[col.tone ?? 'neutral'],
          )}
        >
          <div className="font-semibold mb-3">{col.title}</div>
          <ul className="space-y-2 list-disc list-inside text-foreground">
            {col.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
