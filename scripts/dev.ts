import { spawn } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import chokidar from 'chokidar';
import { buildArticles } from './build-articles.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function debounce<T extends (...args: never[]) => unknown>(fn: T, ms: number): T {
  let t: NodeJS.Timeout | null = null;
  return ((...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => { void fn(...args); }, ms);
  }) as T;
}

async function main(): Promise<void> {
  await buildArticles();

  const next = spawn('pnpm', ['--filter', 'web', 'dev'], { cwd: ROOT, stdio: 'inherit' });

  const rebuild = debounce(async () => {
    try {
      await buildArticles();
    } catch (e) {
      console.error('build-articles failed:', (e as Error).message);
    }
  }, 200);

  const watcher = chokidar.watch(join(ROOT, 'content', 'articles'), {
    ignoreInitial: true,
    ignored: ['**/node_modules/**'],
  });
  watcher.on('all', () => rebuild());

  const shutdown = () => {
    watcher.close().catch(() => {});
    next.kill('SIGINT');
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((e) => { console.error(e); process.exit(1); });
