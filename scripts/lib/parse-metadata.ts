import { parse as parseYaml } from 'yaml';
import { ArticleMetadataSchema, type ArticleMetadata } from '@wjwang/ui/types';

export type ParseResult =
  | { ok: true; data: ArticleMetadata }
  | { ok: false; error: string };

export function parseMetadata(yamlContent: string, filePath: string): ParseResult {
  let raw: unknown;
  try {
    raw = parseYaml(yamlContent);
  } catch (e) {
    return { ok: false, error: `${filePath}: yaml parse error — ${(e as Error).message}` };
  }

  const result = ArticleMetadataSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    return { ok: false, error: `${filePath}: ${issues}` };
  }

  return { ok: true, data: result.data };
}
