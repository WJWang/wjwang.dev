# 深入理解 React Server Components

React Server Components（RSC）是 React 18 引入的全新架構，允許元件在伺服器端執行並將結果序列化傳送給客戶端。與 SSR 不同，RSC 不只是在伺服器渲染 HTML 再 hydrate，而是讓伺服器端元件永遠不出現在客戶端 bundle 中。

## RSC 與 SSR 的根本差異

傳統 SSR 的流程是：伺服器渲染完整 HTML → 客戶端下載對應 JS → hydration。這個過程中所有元件的程式碼都必須出現在客戶端 bundle。

RSC 的流程則是：伺服器執行 Server Components → 序列化成 RSC Payload → 客戶端只渲染 Client Components。Server Components 的程式碼永遠不會進入客戶端 bundle，這是根本差異。

## Server Component 的特性

Server Component 可以直接 async/await，直接存取資料庫、檔案系統或任何伺服器端資源，完全不需要 API 層。它不能使用任何瀏覽器 API、不能有狀態（useState）、不能有副作用（useEffect）。

## Client Component 的邊界

當你在元件頂部加上 `'use client'` 指令，這個元件及其所有子元件都會被納入客戶端 bundle。這個邊界是單向的：Client Component 可以引入其他 Client Components，但不能引入 Server Components（雖然可以透過 children prop 接收）。

## 資料取得模式的改變

RSC 讓「component-level data fetching」變得可行且高效。不再需要在頁面層級聚合所有資料需求，每個元件可以自己取得需要的資料，React 會自動處理並行和去重。

## bundle size 的實際影響

一個典型的部落格文章頁，使用 RSC 後客戶端 JS 可從 200KB 降至 30KB 以下，因為語法高亮、markdown 解析、日期格式化等都可以在伺服器完成，完全不出現在 bundle 中。
