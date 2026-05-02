import { describe, it, expect } from 'vitest';
import { buildRss } from './emit-rss';
import type { ArticleListItem } from '@wjwang/ui/types';

const items: ArticleListItem[] = [
  {
    slug: 'foo', title: 'Foo', excerpt: 'about foo', date: '2026-01-01',
    readTime: '3 分鐘', tags: ['react'], featured: false, author: 'WJWang',
  },
];

describe('buildRss', () => {
  it('produces well-formed RSS XML containing item title and link', () => {
    const xml = buildRss(items);
    expect(xml).toContain('<rss');
    expect(xml).toContain('<title>WJWang</title>');
    expect(xml).toContain('Foo');
    expect(xml).toContain('https://wjwang.dev/articles/foo');
  });

  it('limits to 50 items', () => {
    const many: ArticleListItem[] = Array.from({ length: 60 }, (_, i) => ({
      ...items[0]!, slug: `s${i}`, title: `T${i}`,
    }));
    const xml = buildRss(many);
    const matches = xml.match(/<item>/g) ?? [];
    expect(matches.length).toBe(50);
  });
});
