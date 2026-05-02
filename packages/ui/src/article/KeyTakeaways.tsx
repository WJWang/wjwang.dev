import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

export interface KeyTakeawaysProps {
  title?: string;
  items: ReactNode[];
}

export function KeyTakeaways({ title = '重點摘要', items }: KeyTakeawaysProps) {
  return (
    <aside className="my-8 p-6 rounded-lg border border-border bg-card">
      <h3 className="flex items-center gap-2 font-semibold text-lg mb-4">
        <Sparkles className="w-5 h-5 text-primary" aria-hidden />
        {title}
      </h3>
      <ul className="space-y-2 list-disc list-inside marker:text-primary">
        {items.map((item, i) => (
          <li key={i} className="text-foreground">{item}</li>
        ))}
      </ul>
    </aside>
  );
}
