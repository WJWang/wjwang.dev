import { ImageResponse } from 'next/og';
import { SITE } from '@/lib/site-config';

export const dynamic = 'force-static';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = "WJWang's Blog";

// Root-level OG card — used for /, /articles, /tags, /tags/[tag], /about, etc.
// Article detail pages override this via app/articles/[slug]/opengraph-image.tsx.
export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#080808',
          padding: '72px 80px',
          fontFamily: 'system-ui, sans-serif',
          color: '#fafafa',
          position: 'relative',
        }}
      >
        {/* neon-green accent bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: '#00ff88' }} />

        {/* spacer top */}
        <div style={{ flex: 1 }} />

        {/* brand mark + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 28 }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              background: '#00ff88',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#080808',
              fontSize: 44,
              fontWeight: 800,
            }}
          >
            W
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.1 }}>{SITE.title}</div>
          </div>
        </div>

        {/* tagline */}
        <div style={{ fontSize: 32, color: '#a3a3a3', marginBottom: 12 }}>{SITE.tagline}</div>

        {/* spacer bottom */}
        <div style={{ flex: 1 }} />

        {/* footer: domain */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #1a1a1a',
            paddingTop: 24,
            fontSize: 24,
            color: '#a3a3a3',
          }}
        >
          <div>{SITE.domain}</div>
          <div>—</div>
        </div>
      </div>
    ),
    size,
  );
}
