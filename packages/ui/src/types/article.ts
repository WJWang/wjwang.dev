import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD');

export const ArticleMetadataSchema = z.object({
  title: z.string().min(1),
  excerpt: z.string().min(1).max(280),
  date: isoDate,
  tags: z.array(z.string()).min(1),

  category: z.string().optional(),
  featured: z.boolean().optional().default(false),
  coverImage: z.string().optional(),
  ogImage: z.string().optional(),
  draft: z.boolean().optional().default(false),
  updatedAt: isoDate.optional(),
  author: z.string().optional().default('WJWang'),
  readTime: z.union([z.literal('auto'), z.string()]).optional().default('auto'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'slug must be lowercase alphanumeric with dashes').optional(),
});

export type ArticleMetadata = z.infer<typeof ArticleMetadataSchema>;

export interface ArticleListItem {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  updatedAt?: string;
  readTime: string;
  tags: string[];
  category?: string;
  featured: boolean;
  coverImage?: string;
  ogImage?: string;
  author: string;
}
