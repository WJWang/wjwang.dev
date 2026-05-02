# Next.js Static Export 的 SEO 完整實戰

Next.js 的 `output: 'export'` 選項讓你把整個應用程式輸出為純靜態 HTML，部署到 GitHub Pages、Cloudflare Pages、S3 等任何 CDN。代價是失去 Server Actions、Route Handlers 等執行期功能，SEO 相關的 meta 必須全部在建置期生成。

## next.config.ts 設定

```typescript
const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true }, // 靜態 export 不支援 Image Optimization API
};
```

## app/sitemap.ts：自動生成 XML sitemap

Next.js App Router 支援特殊的 sitemap.ts 檔案，返回 MetadataRoute.Sitemap 陣列：

```typescript
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getArticles();
  return [
    { url: 'https://example.com', lastModified: new Date() },
    ...articles.map(a => ({
      url: `https://example.com/blog/${a.slug}`,
      lastModified: new Date(a.date),
    })),
  ];
}
```

## JSON-LD 結構化資料

搜尋引擎理解 JSON-LD 結構化資料，能顯示豐富搜尋結果（Rich Results）。對部落格文章，Article schema 是最重要的：

```tsx
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: article.title,
  datePublished: article.date,
  author: { '@type': 'Person', name: 'Author' },
};
```

## Open Graph 設定

Next.js Metadata API 讓 Open Graph 設定很直觀。搭配 `opengraph-image.tsx` 可以用 React 元件生成 OG 圖片。
