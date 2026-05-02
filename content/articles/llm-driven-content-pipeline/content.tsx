import {
  Prose,
  CodeBlock,
  Callout,
  KeyTakeaways,
  Comparison,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <p>
        wjwang.dev 的文章不使用傳統 MDX。取而代之的是一個 LLM 驅動的轉換 pipeline：
        作者用 Markdown 寫原稿，把原稿交給 LLM，搭配精心設計的 prompt，
        輸出使用 UI Kit 元件的 TSX 檔案。這篇文章本身，就是用這個 pipeline 產生的。
      </p>

      <KeyTakeaways items={[
        'Markdown 作為原稿格式，LLM 負責轉換成結構化 TSX',
        'UI Kit 元件提供型別安全的 props，比 MDX 更易維護',
        'validate:article 腳本作為 pipeline 守門員，阻擋非法 import',
        'Prompt 設計決定 LLM 能否做出語意正確的元件選擇',
      ]} />

      <h2>為什麼不用 MDX？</h2>
      <Comparison
        columns={[
          {
            title: '傳統 MDX',
            tone: 'neg',
            items: [
              'Markdown + JSX 混合語法，linting 困難',
              'Remark/Rehype plugin 生態碎片化',
              '型別安全性弱，元件 props 不易檢查',
              '複雜 UI 元件在 Markdown 中表達不自然',
            ],
          },
          {
            title: 'LLM-driven TSX',
            tone: 'pos',
            items: [
              '純 TSX，完整 TypeScript 型別檢查',
              '元件可任意複雜，LLM 理解語意選用',
              '作者只需寫 Markdown，無需了解元件語法',
              'validate 腳本在建置期阻擋非法元件',
            ],
          },
        ]}
      />

      <h2>Pipeline 架構</h2>
      <CodeBlock language="bash" filename="pipeline overview">{`# 1. 作者寫原稿
vim content/articles/my-article/originalcontent.md

# 2. LLM 轉換（使用 prompts/md-to-tsx.md 作為 system prompt）
# 把 originalcontent.md 內容 + prompt 傳給 Claude
# 把輸出貼到 content.tsx

# 3. 驗證
pnpm validate:article my-article

# 4. 建置
pnpm build:articles`}</CodeBlock>

      <h2>Prompt 設計：讓 LLM 選對元件</h2>
      <p>
        System prompt 的核心是提供元件的語意文件，而不只是 API 說明。
        LLM 需要知道「何時」用某個元件，而不只是「如何」用它。
      </p>
      <CodeBlock language="markdown" filename="prompts/md-to-tsx.md (excerpt)">{`## 元件選用指南

- **KeyTakeaways**：放在文章開頭，列出 3-5 個核心要點
- **Callout[info]**：補充說明，不是警告也不是技巧
- **Callout[warn]**：可能踩坑的地方，需要特別注意
- **Callout[tip]**：最佳實踐或省力技巧
- **Callout[danger]**：破壞性操作或嚴重後果
- **Comparison**：並排比較兩個方案的優缺點
- **Quote**：引用外部資料或名人說法
- **Aside**：延伸閱讀、背景知識，可以跳過`}</CodeBlock>

      <h2>驗證層：守門員腳本</h2>
      <CodeBlock language="typescript" filename="scripts/lib/validate.ts (excerpt)">{`export const ALLOWED_COMPONENTS = [
  'Prose', 'CodeBlock', 'ImageFigure', 'Callout',
  'KeyTakeaways', 'Quote', 'Aside', 'Comparison',
];

const ALLOWED_IMPORT_SOURCES = ['@wjwang/ui/article', 'react'];

export function extractImports(src: string) {
  // 掃描所有 import 語句，檢查來源是否在白名單
  const disallowed = [];
  for (const match of src.matchAll(IMPORT_RE)) {
    if (!ALLOWED_IMPORT_SOURCES.includes(match[1])) {
      disallowed.push(match[1]);
    }
  }
  return { allowed, disallowed };
}`}</CodeBlock>

      <Callout variant="tip" title="這個設計的 meta 意義">
        validate 腳本讓 LLM 輸出的 TSX 無法引入任意套件，確保文章的 JS bundle 不會被污染。
        LLM 就算幻覺產生了不存在的 import，也會在 CI 建置前被擋下來。
      </Callout>

      <p>
        這個 pipeline 的本質是：用 LLM 的語言理解能力橋接「人類易讀的 Markdown」和「機器安全的 TSX」。
        Prompt 是關鍵的設計點，驗證層是安全網。兩者缺一不可。
      </p>
    </Prose>
  );
}
