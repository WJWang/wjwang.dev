# Tailwind v4 在 Monorepo 裡的 3 個踩雷

Tailwind CSS v4 帶來了重大架構改變：從 tailwind.config.js 遷移到 CSS-first 設定，用 `@import "tailwindcss"` 和 `@theme` 指令替代 JavaScript 設定。這讓 monorepo 中的設定分享方式需要全面重新思考。

## 陷阱 1：content scan 路徑不包含 workspace packages

Tailwind v4 預設掃描 CSS 入口檔案附近的 HTML/TSX 檔案，但不會自動跨越 workspace 邊界。如果你的 UI 元件在 `packages/ui/`，而 CSS 入口在 `apps/web/`，那麼 `packages/ui/` 中的 class 會被 purge 掉。

解法是在 CSS 入口明確加上 `@source` 指令：

```css
@import "tailwindcss";
@source "../../packages/ui/src/**/*.{tsx,ts}";
```

## 陷阱 2：@theme 指令必須透過 PostCSS 處理

`@theme` 是 Tailwind v4 新的 CSS 自定義變數系統。但如果你的 `packages/ui` 在 TypeScript 中 `import './theme.css'`，而這個 CSS 包含 `@theme`，打包工具不會自動把它交給 PostCSS 處理，`@theme` 指令就會被當成普通 CSS 輸出，導致 `@theme` 字樣出現在最終 CSS 中。

正確做法是只在 CSS 入口（通過 PostCSS 的那個）使用 `@theme`，packages 中只輸出普通 CSS 變數。

## 陷阱 3：preset vs CSS config 分裂

Tailwind v3 的 preset 在 v4 中沒有直接對應。v4 的「共享設定」是透過 CSS 檔案的 `@import` 鏈，但這意味著每個 app 的 PostCSS 設定都要正確指向這個共享 CSS。如果有某個 app 忘記 import，它就不會有共享的 token，而且不會有任何錯誤提示。
