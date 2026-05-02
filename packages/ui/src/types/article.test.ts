import { describe, it, expect } from 'vitest';
import { ArticleMetadataSchema } from './article';

describe('ArticleMetadataSchema', () => {
  const minimal = { title: 't', excerpt: 'e', date: '2026-01-01', tags: ['x'] };

  it('accepts minimal valid metadata', () => {
    const result = ArticleMetadataSchema.parse(minimal);
    expect(result.title).toBe('t');
    expect(result.featured).toBe(false);
    expect(result.draft).toBe(false);
    expect(result.author).toBe('WJWang');
    expect(result.readTime).toBe('auto');
  });

  it('rejects missing title', () => {
    expect(() => ArticleMetadataSchema.parse({ ...minimal, title: '' })).toThrow();
  });

  it('rejects bad date format', () => {
    expect(() => ArticleMetadataSchema.parse({ ...minimal, date: '2026/01/01' })).toThrow();
  });

  it('rejects empty tags array', () => {
    expect(() => ArticleMetadataSchema.parse({ ...minimal, tags: [] })).toThrow();
  });

  it('rejects excerpt > 280 chars', () => {
    expect(() => ArticleMetadataSchema.parse({ ...minimal, excerpt: 'x'.repeat(281) })).toThrow();
  });

  it('rejects bad slug pattern', () => {
    expect(() => ArticleMetadataSchema.parse({ ...minimal, slug: 'Bad Slug' })).toThrow();
  });

  it('accepts all optional fields', () => {
    const result = ArticleMetadataSchema.parse({
      ...minimal,
      category: 'Frontend',
      featured: true,
      coverImage: './assets/c.jpg',
      ogImage: './assets/og.jpg',
      draft: false,
      updatedAt: '2026-02-01',
      author: 'X',
      readTime: '5 分鐘',
      slug: 'my-post',
    });
    expect(result.category).toBe('Frontend');
    expect(result.featured).toBe(true);
  });
});
