import { ImageResponse } from 'next/og';
import { articles, findBySlug } from '@/lib/articles';

export const dynamicParams = false;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Article cover';

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = findBySlug(slug);
  const title = meta?.title ?? "WJWang's Blog";
  const tags = meta?.tags ?? [];
  const date = meta?.date ?? '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#080808',
          padding: '64px 72px',
          fontFamily: 'system-ui, sans-serif',
          color: '#fafafa',
          position: 'relative',
        }}
      >
        {/* neon-green accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: '#00ff88',
          }}
        />

        {/* brand row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              background: '#00ff88',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#080808',
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            W
          </div>
          <div style={{ fontSize: 28, fontWeight: 600 }}>WJWang's Blog</div>
        </div>

        {/* title — biggest element */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: 32,
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title}
        </div>

        {/* spacer */}
        <div style={{ flex: 1 }} />

        {/* footer: tags + date */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #1a1a1a',
            paddingTop: 24,
          }}
        >
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {tags.slice(0, 4).map((t) => (
              <div
                key={t}
                style={{
                  display: 'flex',
                  fontSize: 22,
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: '#151515',
                  color: '#a3a3a3',
                }}
              >
                {t}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 24, color: '#a3a3a3' }}>{date}</div>
        </div>
      </div>
    ),
    size,
  );
}
