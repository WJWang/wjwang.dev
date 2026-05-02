import { describe, it, expect } from 'vitest';
import { renderManifest } from './emit-manifest';
import type { ArticleListItem } from '@wjwang/ui/types';

const items: ArticleListItem[] = [
  {
    slug: 'foo', title: 'Foo', excerpt: 'e', date: '2026-01-01',
    readTime: '3 分鐘', tags: ['react'], featured: false, author: 'WJWang',
  },
];

describe('renderManifest', () => {
  it('emits articles array as TS literal', () => {
    const out = renderManifest(items);
    expect(out).toContain("slug: 'foo'");
    expect(out).toContain("title: 'Foo'");
    expect(out).toContain('articleLoaders');
  });

  it('escapes single quotes in strings', () => {
    const out = renderManifest([{ ...items[0]!, title: "it's a test" }]);
    expect(out).toContain("\\'");
  });

  it('emits dynamic import for each slug', () => {
    const out = renderManifest(items);
    expect(out).toContain("'foo':");
    expect(out).toContain("../../../content/articles/foo/content'");
  });
});
