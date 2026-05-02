import {
  Prose,
  CodeBlock,
  Callout,
  Aside,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <h1>Tailwind v4 在 Monorepo 裡的 3 個踩雷</h1>
      <p>
        Tailwind CSS v4 帶來了重大架構改變：從 <code>tailwind.config.js</code> 遷移到 CSS-first 設定，
        用 <code>@import tailwindcss</code> 和 <code>@theme</code> 指令替代 JavaScript 設定。
        這讓 monorepo 中的設定分享方式需要全面重新思考。以下三個陷阱都可能讓 class 神秘消失。
      </p>

      <h2>陷阱 1：content scan 不跨越 workspace 邊界</h2>
      <p>
        Tailwind v4 預設掃描 CSS 入口附近的 HTML/TSX 檔案，但不自動跨越 workspace 邊界。
        如果 UI 元件在 <code>packages/ui/</code>，CSS 入口在 <code>apps/web/</code>，
        <code>packages/ui/</code> 中的 class 會被 purge 掉。
      </p>

      <Callout variant="danger" title="症狀：class 神秘消失">
        開發環境正常，production build 後 UI 元件樣式全部消失。
        這是因為 dev server 通常不 purge，但 production build 會嚴格掃描 content 路徑。
        如果你的元件在 workspace packages 裡，必須明確設定 <code>@source</code>。
      </Callout>

      <CodeBlock language="css" filename="apps/web/src/globals.css">{`/* apps/web/src/globals.css */
/* 先用 @import 載入 tailwindcss（見 Tailwind v4 文件）*/

/* 明確告訴 Tailwind v4 要掃描哪些路徑 */
@source "../../packages/ui/src/**/*.{tsx,ts}";

/* 如果有多個 UI packages */
@source "../../packages/icons/src/**/*.tsx";`}</CodeBlock>

      <h2>陷阱 2：@theme 指令必須透過 PostCSS 處理</h2>
      <p>
        <code>@theme</code> 是 Tailwind v4 新的 CSS 自定義 token 系統，但它是 PostCSS 指令，
        不是原生 CSS。如果 package 在 TypeScript 中直接引用含 <code>@theme</code> 的 CSS，
        打包工具會直接輸出字面量 <code>@theme</code>，導致瀏覽器解析錯誤。
      </p>

      <Callout variant="danger" title="症狀：@theme 字樣出現在 DevTools CSS">
        打開 DevTools，在 style 面板看到 <code>@theme &#123; ... &#125;</code> 原樣輸出。
        這代表這段 CSS 完全沒有被 PostCSS 處理。
      </Callout>

      <CodeBlock language="css" filename="packages/ui/src/tokens.css">{`/* ✗ 錯誤：packages 中不能用 @theme */
/* @theme { --color-brand: oklch(65% 0.2 250); } */
/* 只有透過 PostCSS 的 CSS 入口才能使用 @theme */

/* ✓ 正確：在 packages 中只輸出標準 CSS 變數 */
:root {
  --color-brand: oklch(65% 0.2 250);
}`}</CodeBlock>

      <CodeBlock language="css" filename="apps/web/src/globals.css">{`/* apps/web/src/globals.css — 透過 PostCSS 處理 */
/* 1. 載入 tailwindcss（@import 指令） */
/* 2. 引入 packages 的 CSS 變數檔（@import 指令）  */

/* @theme 只在這裡，確保透過 PostCSS 處理 */
@theme {
  --color-brand: var(--color-brand);
}`}</CodeBlock>

      <h2>陷阱 3：preset vs CSS config 分裂，無聲失效</h2>
      <p>
        Tailwind v3 的 <code>preset</code> 讓多個 app 共享設定很直觀。v4 改為 CSS 引用鏈，
        但沒有自動機制確保每個 app 都引入了共享 token。遺漏了引用，所有共享 token 都不存在，
        而且沒有任何 warning。
      </p>

      <Callout variant="danger" title="症狀：部分 app 的 token 不一致">
        <code>apps/web</code> 的按鈕顏色正確，但 <code>apps/admin</code> 的按鈕顏色回退到預設 Tailwind 藍。
        原因是 admin 忘記引入共享 token CSS。v4 不會報錯，只是靜默使用預設值。
      </Callout>

      <CodeBlock language="css" filename="packages/ui/src/preset.css">{`/* packages/ui/src/preset.css — 共享 token */
/* 每個 app 的 globals.css 都必須透過 @import 引入這個檔案 */

/* 先載入 tailwindcss base */
@source "../../packages/ui/src/**/*.{tsx,ts}";

@theme {
  --color-primary: oklch(65% 0.25 250);
  --radius-card: 0.75rem;
  --font-sans: 'Inter', sans-serif;
}`}</CodeBlock>

      <CodeBlock language="css" filename="apps/web/src/globals.css">{`/* ✓ 正確：先引入共享 preset，再加 app 特有 token */
/* 步驟 1：透過 @import 引入 packages/ui/src/preset.css */

/* App 特有的 token（覆寫或新增） */
@theme {
  --color-accent: oklch(70% 0.3 30);
}`}</CodeBlock>

      <Aside title="遷移建議">
        從 v3 遷移到 v4 時，建議先建立一個共享的 <code>packages/tailwind-config/preset.css</code>，
        把所有 <code>@theme</code> 和 <code>@source</code> 集中在這裡，
        再讓每個 app 的 CSS 入口用 <code>@import</code> 引入它。
        用 ESLint 或 grep CI check 確保每個 app 的 CSS 入口都有這個引入。
      </Aside>

      <p>
        Tailwind v4 的 CSS-first 設定在單一應用程式中體驗很好，但在 monorepo 中需要更多明確的設定。
        掌握這三個陷阱，就能避免最常見的 class 消失和 token 不一致問題。
      </p>
    </Prose>
  );
}
