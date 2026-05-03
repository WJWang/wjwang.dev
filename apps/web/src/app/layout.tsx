import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SiteHeader, SiteFooter } from '@wjwang/ui/components';
import { SearchProvider, SearchTrigger, SearchCommand } from '@/components/SearchCommand';
import { NAV, SOCIALS, SITE } from '@/lib/site-config';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: `%s | ${SITE.title}` },
  description: SITE.description,
  openGraph: { siteName: SITE.title, type: 'website' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <SearchProvider>
          <SiteHeader nav={NAV} socials={SOCIALS} searchSlot={<SearchTrigger />} />
          <div className="flex-1 flex flex-col">{children}</div>
          <SiteFooter copyright={SITE.copyright} />
          <SearchCommand />
        </SearchProvider>
      </body>
    </html>
  );
}
