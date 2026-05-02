export interface SiteFooterProps {
  copyright: string;
}

export function SiteFooter({ copyright }: SiteFooterProps) {
  return (
    <footer className="border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-muted-foreground">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
}
