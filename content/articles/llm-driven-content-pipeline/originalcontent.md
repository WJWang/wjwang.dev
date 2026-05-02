# 用 LLM 驅動的內容轉換 pipeline

wjwang.dev 的文章不使用傳統 MDX。取而代之的是一個 LLM 驅動的轉換 pipeline：作者用 Markdown 寫原稿，然後把原稿交給 LLM，搭配精心設計的 prompt，輸出使用 UI Kit 元件的 TSX 檔案。

## 為什麼不用 MDX？

MDX 讓你在 Markdown 中嵌入 JSX，聽起來很美好，但實際上有幾個問題：Markdown 和 JSX 的混合語法讓 linting 和 TypeScript 型別檢查困難；Remark/Rehype plugin 生態碎片化；最重要的是，複雜的 UI 元件（Comparison、KeyTakeaways）在 Markdown 語法中表達很不自然。

## LLM 轉換的優勢

把 Markdown 給 LLM 轉換成 TSX，讓你有完整的 TypeScript 型別安全：元件的 props 型別在編譯期檢查。UI Kit 元件可以任意複雜，LLM 能理解語意並選用適當的元件。作者專注寫 Markdown，不需要了解元件語法。

## Pipeline 架構

整個 pipeline 分三個階段：
1. 作者用 Markdown 寫 originalcontent.md
2. 執行 prompt：把 Markdown + 元件文件 → Claude API → TSX
3. validate:article 腳本驗證 TSX 的 import 和元件合法性

## Prompt 設計要點

System prompt 要明確說明可用的元件和它們的語意：Callout 用於注意事項、Comparison 用於並排比較、KeyTakeaways 用於文章開頭的重點摘要。這樣 LLM 才能做出語意正確的元件選擇，而不只是機械性翻譯。

## 驗證層

validate:article 腳本是整個 pipeline 的守門員。它檢查 import 來源是否只有允許的白名單、元件名稱是否都在 ALLOWED_COMPONENTS 清單內、referenced assets 是否都存在於 assets 資料夾。
