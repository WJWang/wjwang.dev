import { describe, it, expect } from 'vitest';
import { extractAssetPaths, extractImports, ALLOWED_COMPONENTS } from './validate';

describe('extractImports', () => {
  it('finds imports from @wjwang/ui/article', () => {
    const src = `import { Prose, CodeBlock } from '@wjwang/ui/article';`;
    const r = extractImports(src);
    expect(r.allowed).toEqual(['Prose', 'CodeBlock']);
    expect(r.disallowed).toEqual([]);
  });

  it('flags non-allowed imports', () => {
    const src = `import x from 'lodash';`;
    const r = extractImports(src);
    expect(r.disallowed).toContain('lodash');
  });

  it('allows react import', () => {
    const src = `import * as React from 'react';\nimport { Prose } from '@wjwang/ui/article';`;
    const r = extractImports(src);
    expect(r.disallowed).toEqual([]);
  });
});

describe('extractAssetPaths', () => {
  it('finds /articles/{slug}/assets/* references', () => {
    const src = `<img src="/articles/foo/assets/x.png" />`;
    expect(extractAssetPaths(src, 'foo')).toEqual(['x.png']);
  });

  it('ignores other slugs', () => {
    const src = `<img src="/articles/bar/assets/y.png" />`;
    expect(extractAssetPaths(src, 'foo')).toEqual([]);
  });
});

describe('ALLOWED_COMPONENTS', () => {
  it('contains all 11 article building blocks', () => {
    expect(ALLOWED_COMPONENTS).toEqual(
      expect.arrayContaining([
        'Prose', 'CodeBlock', 'ImageFigure', 'Callout', 'KeyTakeaways',
        'Quote', 'Aside', 'Comparison', 'ArticleCard', 'ArticleHero', 'ArticleLayout',
      ]),
    );
  });
});
