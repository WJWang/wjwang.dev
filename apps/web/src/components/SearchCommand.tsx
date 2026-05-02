'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { Search } from 'lucide-react';

interface SearchCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
}
const Ctx = createContext<SearchCtx | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
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
      aria-label="開啟搜尋"
      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
    >
      <Search className="w-5 h-5" />
    </button>
  );
}

// Real modal lives in Task 5.11. Stub for now so layout can mount provider.
export function SearchCommand() {
  return null;
}
