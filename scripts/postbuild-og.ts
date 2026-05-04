// Walk apps/web/out/ and copy every extension-less `opengraph-image` to
// `opengraph-image.png` next to it, so GitHub Pages serves it with
// Content-Type: image/png. Facebook rejects application/octet-stream.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT_DIR = path.resolve(__dirname, '..', 'apps', 'web', 'out');

async function* walk(dir: string): AsyncGenerator<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else yield full;
  }
}

async function main() {
  let copied = 0;
  for await (const file of walk(OUT_DIR)) {
    if (path.basename(file) !== 'opengraph-image') continue;
    const target = `${file}.png`;
    await fs.copyFile(file, target);
    copied++;
  }
  console.log(`✓ Mirrored ${copied} OG image(s) → opengraph-image.png`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
