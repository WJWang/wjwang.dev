import { readdir, stat, mkdir, copyFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

export interface MirrorTask {
  fromAssetsDir: string;
  toAssetsDir: string;
}

async function exists(p: string): Promise<boolean> {
  return stat(p).then(() => true).catch(() => false);
}

async function copyDirRecursive(src: string, dst: string): Promise<void> {
  await mkdir(dst, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });
  for (const e of entries) {
    const s = join(src, e.name);
    const d = join(dst, e.name);
    if (e.isDirectory()) await copyDirRecursive(s, d);
    else if (e.isFile()) await copyFile(s, d);
  }
}

export async function mirrorAssets(tasks: MirrorTask[]): Promise<void> {
  for (const { fromAssetsDir, toAssetsDir } of tasks) {
    if (await exists(toAssetsDir)) await rm(toAssetsDir, { recursive: true, force: true });
    if (await exists(fromAssetsDir)) await copyDirRecursive(fromAssetsDir, toAssetsDir);
  }
}

export async function mirrorFile(src: string, dst: string): Promise<void> {
  if (!(await exists(src))) return;
  await mkdir(join(dst, '..'), { recursive: true });
  await copyFile(src, dst);
}
