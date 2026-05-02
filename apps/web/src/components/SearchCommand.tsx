'use client';

import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from 'react';
import { Search } from 'lucide-react';
import Fuse from 'fuse.js';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@wjwang/ui/primitives';

interface SearchEntry {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  category?: string;
}

interface SearchCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
}
const Ctx = createContext<SearchCtx | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return <Ctx.Provider value={{ open, setOpen }}>{children}</Ctx.Provider>;
}

export function useSearch() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useSearch must be used within SearchProvider');
  return c;
}

export function SearchTrigger() {
  const { setOpen } = useSearch();
  return (
    <button
      onClick={() => setOpen(true)}
      aria-label="開啟搜尋 (Cmd+K)"
      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
    >
      <Search className="w-5 h-5" />
    </button>
  );
}

export function SearchCommand() {
  const { open, setOpen } = useSearch();
  const [entries, setEntries] = useState<SearchEntry[] | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open || entries) return;
    fetch('/search-index.generated.json')
      .then((r) => r.json())
      .then((data: SearchEntry[]) => setEntries(data))
      .catch(() => setEntries([]));
  }, [open, entries]);

  const fuse = useMemo(
    () => (entries ? new Fuse(entries, { threshold: 0.3, keys: ['title', 'excerpt', 'tags'] }) : null),
    [entries],
  );

  const results = useMemo(() => {
    if (!fuse || !query) return entries ?? [];
    return fuse.search(query).map((r) => r.item);
  }, [fuse, entries, query]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="搜尋文章... (按 Esc 關閉)" value={query} onValueChange={setQuery} />
      <CommandList>
        {entries === null && <div className="p-4 text-sm text-muted-foreground">載入索引中…</div>}
        {entries !== null && results.length === 0 && <CommandEmpty>沒有結果</CommandEmpty>}
        {results.length > 0 && (
          <CommandGroup heading="文章">
            {results.slice(0, 10).map((r) => (
              <CommandItem
                key={r.slug}
                value={r.title}
                onSelect={() => {
                  setOpen(false);
                  window.location.href = `/articles/${r.slug}`;
                }}
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{r.title}</span>
                  <span className="text-xs text-muted-foreground line-clamp-1">{r.excerpt}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
