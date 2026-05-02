import {
  Prose,
  CodeBlock,
  Callout,
  ImageFigure,
  Quote,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <h1>Next.js Static Export 的 SEO 完整實戰</h1>
      <p>
        Next.js 的 <code>output: 'export'</code> 讓你把整個應用程式輸出為純靜態 HTML，
        部署到 GitHub Pages、Cloudflare Pages、S3 等任何 CDN。代價是失去 Server Actions、
        Route Handlers 等執行期功能，SEO 相關的 meta 必須全部在建置期生成。
      </p>

      <h2>基礎設定</h2>
      <CodeBlock language="typescript" filename="next.config.ts">{`// next.config.ts（相依 next 型別）
const config = {
  output: 'export',
  trailingSlash: true,
  images: {
    // 靜態 export 不支援 Next.js Image Optimization API
    unoptimized: true,
  },
};

export default config;`}</CodeBlock>

      <h2>sitemap.ts：建置期生成 XML</h2>
      <p>
        Next.js App Router 的特殊 <code>sitemap.ts</code> 檔案在建置期執行，
        輸出符合 Sitemaps.org 標準的 XML 檔案。
      </p>
      <CodeBlock language="typescript" filename="app/sitemap.ts">{`// app/sitemap.ts — Next.js 特殊路由，建置期執行
// 相依：MetadataRoute from 'next', getArticles from '@/lib/articles'

const BASE = 'https://example.com';

export default async function sitemap() {
  const articles = await getArticles();

  const staticRoutes = [
    { url: BASE, lastModified: new Date(), priority: 1.0 },
    { url: BASE + '/articles', lastModified: new Date(), priority: 0.8 },
  ];

  const articleRoutes = articles.map((a) => ({
    url: BASE + '/articles/' + a.slug,
    lastModified: new Date(a.updatedAt ?? a.date),
    priority: 0.7,
  }));

  return [...staticRoutes, ...articleRoutes];
}`}</CodeBlock>

      <h2>robots.ts</h2>
      <CodeBlock language="typescript" filename="app/robots.ts">{`// app/robots.ts — Next.js 特殊路由
// 相依：MetadataRoute from 'next'

export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://example.com/sitemap.xml',
  };
}`}</CodeBlock>

      <h2>JSON-LD 結構化資料</h2>
      <p>
        JSON-LD 讓搜尋引擎理解文章的作者、發布日期、標題，能觸發 Google 的豐富搜尋結果（Rich Results）。
      </p>
      <CodeBlock language="tsx" filename="app/articles/[slug]/page.tsx">{`export default async function ArticlePage({ params }) {
  const article = getArticle(params.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    dateModified: article.updatedAt ?? article.date,
    author: {
      '@type': 'Person',
      name: article.author,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleLayout article={article} />
    </>
  );
}`}</CodeBlock>

      <ImageFigure
        src="/og/home.png"
        alt="Open Graph 預覽圖示意"
        caption="透過 opengraph-image.tsx 用 React 元件生成的 OG 圖片，在社群分享時顯示"
        ratio="16/9"
      />

      <Callout variant="tip" title="OG 圖片尺寸建議">
        Open Graph 圖片建議使用 1200×630px（16:9 比例）。Twitter Card 建議 1200×600px。
        Next.js 的 <code>opengraph-image.tsx</code> 預設輸出 1200×630，只需在 ImageResponse 中設定。
      </Callout>

      <Quote
        author="Google Search Central"
        source="Advanced SEO documentation"
      >
        Structured data is a standardized format for providing information about a page and classifying
        the page content. Search engines use structured data to understand the content of the page better,
        which can enable special presentation of content in Search results.
      </Quote>

      <h2>Open Graph Metadata</h2>
      <CodeBlock language="typescript" filename="app/articles/[slug]/page.tsx">{`export async function generateMetadata({ params }) {
  const article = getArticle(params.slug);
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.date,
      authors: [article.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
    },
  };
}`}</CodeBlock>

      <p>
        靜態 export 的 SEO 設定雖然需要在建置期完成所有工作，但換來的是極致的 CDN 快取效率和零伺服器成本。
        Next.js App Router 的 Metadata API 讓這個過程相對自然。
      </p>
    </Prose>
  );
}
