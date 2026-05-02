import { describe, it, expect } from 'vitest';
import { parseMetadata } from './parse-metadata';

describe('parseMetadata', () => {
  it('parses valid yaml + applies defaults', () => {
    const yaml = `
title: Hello
excerpt: An intro
date: 2026-01-01
tags: [react]
`;
    const result = parseMetadata(yaml, '/fake/foo/metadata.yml');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.title).toBe('Hello');
      expect(result.data.featured).toBe(false);
      expect(result.data.author).toBe('WJWang');
    }
  });

  it('returns error for invalid yaml', () => {
    const result = parseMetadata(': bad', '/fake/m.yml');
    expect(result.ok).toBe(false);
  });

  it('returns error for missing required field', () => {
    const result = parseMetadata('title: x\nexcerpt: y\ntags: [t]', '/fake/m.yml');
    expect(result.ok).toBe(false);
  });
});
