import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { scaffoldArticle, isValidSlug } from './new-article';

describe('isValidSlug', () => {
  it.each(['foo', 'foo-bar', 'a1b2', 'react-server-components'])('accepts %s', (s) => {
    expect(isValidSlug(s)).toBe(true);
  });
  it.each(['Foo', 'foo bar', 'foo_bar', 'foo!'])('rejects %s', (s) => {
    expect(isValidSlug(s)).toBe(false);
  });
});

describe('scaffoldArticle', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(join(tmpdir(), 'wjw-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('creates the four expected files', async () => {
    await scaffoldArticle('my-post', dir, '2026-05-02');
    const slugDir = join(dir, 'my-post');
    await stat(join(slugDir, 'metadata.yml'));
    await stat(join(slugDir, 'originalcontent.md'));
    await stat(join(slugDir, 'content.tsx'));
    await stat(join(slugDir, 'assets', '.gitkeep'));
  });

  it('includes today date in metadata.yml', async () => {
    await scaffoldArticle('p', dir, '2026-05-02');
    const meta = await readFile(join(dir, 'p', 'metadata.yml'), 'utf8');
    expect(meta).toContain('2026-05-02');
  });

  it('rejects existing slug', async () => {
    await scaffoldArticle('p', dir, '2026-05-02');
    await expect(scaffoldArticle('p', dir, '2026-05-02')).rejects.toThrow();
  });
});
