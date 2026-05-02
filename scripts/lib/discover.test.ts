import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { discoverArticles } from './discover';

describe('discoverArticles', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'wjw-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('discovers slug folders containing metadata.yml', async () => {
    await mkdir(join(dir, 'foo'), { recursive: true });
    await writeFile(join(dir, 'foo', 'metadata.yml'), 'title: F');
    await mkdir(join(dir, 'bar'), { recursive: true });
    await writeFile(join(dir, 'bar', 'metadata.yml'), 'title: B');
    await mkdir(join(dir, 'no-meta'), { recursive: true });

    const result = await discoverArticles(dir);
    const slugs = result.map((r) => r.slug).sort();
    expect(slugs).toEqual(['bar', 'foo']);
    expect(result[0]?.dir).toContain(slugs[0]!);
  });

  it('returns empty array when no articles', async () => {
    const result = await discoverArticles(dir);
    expect(result).toEqual([]);
  });
});
