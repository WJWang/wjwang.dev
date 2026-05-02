import { describe, it, expect } from 'vitest';
import { estimateReadTime, enrichToListItem } from './enrich';
import type { ArticleMetadata } from '@wjwang/ui/types';

describe('estimateReadTime', () => {
  it('returns "1 分鐘" for very short content', () => {
    expect(estimateReadTime('hello world')).toBe('1 分鐘');
  });

  it('counts CJK characters at 300/min', () => {
    const cjk = '中'.repeat(900);
    expect(estimateReadTime(cjk)).toBe('3 分鐘');
  });

  it('counts ASCII words at 200/min', () => {
    const words = 'word '.repeat(800).trim();
    expect(estimateReadTime(words)).toBe('4 分鐘');
  });
});

describe('enrichToListItem', () => {
  const meta: ArticleMetadata = {
    title: 'T',
    excerpt: 'E',
    date: '2026-01-01',
    tags: ['x'],
    featured: false,
    draft: false,
    author: 'WJWang',
    readTime: 'auto',
  };

  it('uses folder slug when metadata slug missing', () => {
    const item = enrichToListItem(meta, 'folder-slug', '中'.repeat(300));
    expect(item.slug).toBe('folder-slug');
  });

  it('overrides folder slug when metadata.slug present', () => {
    const item = enrichToListItem({ ...meta, slug: 'meta-slug' }, 'folder-slug', '');
    expect(item.slug).toBe('meta-slug');
  });

  it('substitutes auto readTime', () => {
    const item = enrichToListItem(meta, 'x', '中'.repeat(600));
    expect(item.readTime).toBe('2 分鐘');
  });

  it('keeps manual readTime', () => {
    const item = enrichToListItem({ ...meta, readTime: '99 分鐘' }, 'x', 'short');
    expect(item.readTime).toBe('99 分鐘');
  });

  it('resolves coverImage relative to /articles/{slug}/', () => {
    const item = enrichToListItem({ ...meta, coverImage: './assets/c.jpg' }, 'foo', '');
    expect(item.coverImage).toBe('/articles/foo/assets/c.jpg');
  });
});
