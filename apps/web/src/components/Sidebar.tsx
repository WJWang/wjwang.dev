// apps/web/src/components/Sidebar.tsx
import { Tag, TrendingUp } from 'lucide-react';
import { allCategories, allTags } from '@/lib/articles';

export function Sidebar() {
  const categories = allCategories();
  const tags = allTags().slice(0, 8);

  return (
    <aside className="space-y-8">
      {categories.length > 0 && (
        <div className="p-6 rounded-lg border border-border bg-card">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <TrendingUp className="w-5 h-5 text-primary" />
            熱門分類
          </h3>
          <div className="space-y-1">
            {categories.map((c) => (
              <a
                key={c.name}
                href={`/tags/${encodeURIComponent(c.name)}`}
                className="flex items-center justify-between p-3 rounded-md hover:bg-secondary transition-colors group"
              >
                <span>{c.name}</span>
                <span className="text-sm text-muted-foreground">{c.count}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div className="p-6 rounded-lg border border-border bg-card">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Tag className="w-5 h-5 text-primary" />
            熱門標籤
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <a
                key={t.tag}
                href={`/tags/${encodeURIComponent(t.tag)}`}
                className="px-3 py-1.5 text-sm rounded-md bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors font-medium"
              >
                {t.tag}
              </a>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
