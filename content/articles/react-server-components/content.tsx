import {
  Prose,
  CodeBlock,
  Callout,
  KeyTakeaways,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <p>
        React Server Components（RSC）是 React 18 引入的全新架構，允許元件在伺服器端執行並將結果
        序列化傳送給客戶端。與 SSR 不同，RSC 不只是在伺服器渲染 HTML 再 hydrate，而是讓伺服器端元件
        永遠不出現在客戶端 bundle 中。
      </p>

      <KeyTakeaways items={[
        'Server Components 的程式碼永遠不進入客戶端 bundle，實現真正的零 JS',
        '可直接 async/await 存取資料庫，無需 API 層',
        'Client Components 以 "use client" 劃定邊界，向下傳染',
        'RSC Payload 序列化後由客戶端重組，與傳統 SSR hydration 根本不同',
      ]} />

      <h2>RSC 與 SSR 的根本差異</h2>
      <p>
        傳統 SSR：伺服器渲染 HTML → 客戶端下載所有 JS → hydration。所有元件程式碼都進 bundle。
        RSC：伺服器執行 Server Components → 序列化成 RSC Payload → 客戶端只渲染 Client Components。
      </p>

      <h2>Server Component：直接存取後端</h2>
      <p>
        Server Component 可以直接 async/await，存取資料庫、檔案系統或任何伺服器資源，不需要 API 層。
        它不能使用瀏覽器 API、useState、useEffect。
      </p>
      <CodeBlock language="tsx" filename="app/blog/[slug]/page.tsx">{`// 這是 Server Component（預設，無需標記）
// 相依：db from '@/lib/db'

interface Props { params: { slug: string } }

export default async function ArticlePage({ params }: Props) {
  // 直接查詢資料庫，不需要 fetch('/api/...')
  const article = await db.article.findUnique({
    where: { slug: params.slug },
  });

  if (!article) notFound();

  return (
    <article>
      <h1>{article.title}</h1>
      {/* ArticleBody 也是 Server Component，語法高亮在伺服器完成 */}
      <ArticleBody content={article.content} />
    </article>
  );
}`}</CodeBlock>

      <h2>Client Component：互動邊界</h2>
      <p>
        加上 <code>'use client'</code> 指令的元件及其子樹都會進入客戶端 bundle。
        只有需要狀態、事件處理或瀏覽器 API 的部分才需要這個指令。
      </p>
      <CodeBlock language="tsx" filename="components/LikeButton.tsx">{`'use client';
// 使用 useState from 'react'

interface Props { initialCount: number; articleId: string }

export function LikeButton({ initialCount, articleId }: Props) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);

  async function handleLike() {
    setLiked(true);
    setCount(c => c + 1);
    await fetch(\`/api/articles/\${articleId}/like\`, { method: 'POST' });
  }

  return (
    <button onClick={handleLike} disabled={liked}>
      {liked ? '❤️' : '🤍'} {count}
    </button>
  );
}`}</CodeBlock>

      <Callout variant="info" title="重要觀念">
        Server Component 可以把 Client Component 當 children 接收，但不能直接 import。
        這讓你可以在 Server Component 中「包住」Client Component，將伺服器資料透過 props 傳入。
      </Callout>

      <h2>bundle size 的實際影響</h2>
      <p>
        典型部落格文章頁，使用 RSC 後客戶端 JS 可從 200KB 降至 30KB 以下。語法高亮（Shiki 5MB）、
        markdown 解析、日期格式化全部在伺服器完成，完全不出現在 bundle 中。
      </p>
      <CodeBlock language="bash" filename="bundle analysis">{`# RSC 前
Route (app)                 Size   First Load JS
└ /blog/[slug]           4.2 kB        212 kB

# RSC 後（syntax highlighting 移至 server）
Route (app)                 Size   First Load JS
└ /blog/[slug]           1.1 kB         29 kB`}</CodeBlock>

      <p>
        RSC 不是 SSR 的升級版，而是元件模型的範式轉移。掌握伺服器邊界、理解 RSC Payload 的序列化機制，
        是充分發揮 Next.js App Router 效能的關鍵。
      </p>
    </Prose>
  );
}
