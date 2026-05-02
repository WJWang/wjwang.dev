import {
  Prose,
  CodeBlock,
  KeyTakeaways,
  Aside,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <h1>5 個 TypeScript Strict Mode 你該打開的 flag</h1>
      <p>
        開啟 <code>strict: true</code> 是好的開始，但 TypeScript 還有幾個預設關閉的進階 flag，
        能讓型別系統更準確地反映程式的實際行為，在編譯期抓到更多執行期才會爆的 bug。
      </p>

      <KeyTakeaways items={[
        'noUncheckedIndexedAccess：陣列存取型別改為 T | undefined，強迫處理越界情況',
        'exactOptionalPropertyTypes：區分「key 不存在」與「key 值為 undefined」',
        'noImplicitOverride：子類別覆寫必須明確加 override，防止父類別改名悄悄失效',
        'noFallthroughCasesInSwitch：switch fallthrough 視為編譯錯誤',
        'verbatimModuleSyntax：強制型別 import 使用 import type，讓 tree-shake 正確',
      ]} />

      <CodeBlock language="json" filename="tsconfig.json">{`{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true
  }
}`}</CodeBlock>

      <h2>1. noUncheckedIndexedAccess</h2>
      <CodeBlock language="typescript">{`const arr = ['a', 'b', 'c'];

// 開啟前：item 型別是 string（可能 crash）
const item = arr[0];
item.toUpperCase(); // OK（但 arr[99] 是 undefined！）

// 開啟後：item 型別是 string | undefined
const item2 = arr[0];
item2.toUpperCase(); // ✗ 錯誤：item2 可能是 undefined
item2?.toUpperCase(); // ✓ 安全`}</CodeBlock>

      <h2>2. exactOptionalPropertyTypes</h2>
      <CodeBlock language="typescript">{`interface Config {
  timeout?: number; // 語意：timeout 可以不存在
}

// 開啟前：以下兩者都合法
const a: Config = {};             // timeout 不存在 ✓
const b: Config = { timeout: undefined }; // timeout 存在但 undefined ✓

// 開啟後：
const c: Config = { timeout: undefined }; // ✗ 錯誤
// 必須寫成：
interface Config2 {
  timeout?: number | undefined; // 明確允許 undefined 值
}`}</CodeBlock>

      <h2>3. noImplicitOverride</h2>
      <CodeBlock language="typescript">{`class Base {
  render() { return '<div/>'; }
}

class Child extends Base {
  // 開啟前：悄悄覆寫，父類別改名 render→draw 後這裡變孤兒方法
  render() { return '<span/>'; } // ✗ 錯誤（少了 override）

  // 開啟後必須明確標記：
  override render() { return '<span/>'; } // ✓
}`}</CodeBlock>

      <h2>4. noFallthroughCasesInSwitch</h2>
      <CodeBlock language="typescript">{`type Status = 'pending' | 'active' | 'closed';

function label(s: Status): string {
  switch (s) {
    case 'pending':
      return '待審';
    case 'active':
      // 開啟前：忘記 return/break，fallthrough 到 'closed'
      // 開啟後：✗ 編譯錯誤，必須明確 return 或 break
    case 'closed':
      return '已關閉';
  }
}`}</CodeBlock>

      <h2>5. verbatimModuleSyntax</h2>
      <p>
        開啟後，型別 import 必須使用 <code>import type</code>，值 import 使用普通 <code>import</code>。
        混用會導致 TypeScript 報錯，打包工具也能更準確地 tree-shake。
      </p>
      <CodeBlock language="typescript">{`// 開啟前：型別與值可混在同一 import
// → TypeScript 無法確定 SomeType 能否在執行期存取
// → 打包工具可能把純型別也打進 bundle

// 開啟後：必須明確區分
// "import type" — 純型別，TS 編譯時完全移除，不進 bundle
// "import"      — 值，保留在 bundle 中供執行期使用

// Re-export 也同理：
// "export type { Foo }" — 型別 re-export，安全
// "export { Foo }"      — 若 Foo 只是型別，verbatimModuleSyntax 會報錯`}</CodeBlock>

      <Aside title="漸進式採用建議">
        在既有專案中一次打開所有 flag 會產生大量錯誤。建議的順序是：先開
        <code>verbatimModuleSyntax</code>（影響最廣但修法機械），
        再開 <code>noFallthroughCasesInSwitch</code>（錯誤數少），
        最後才是 <code>noUncheckedIndexedAccess</code>（需要最多思考）。
      </Aside>

      <p>
        這 5 個 flag 加上 <code>strict: true</code>，能讓 TypeScript 的型別安全性大幅提升。
        代價是更多的型別標注，但換來的是更少的執行期驚喜。
      </p>
    </Prose>
  );
}
