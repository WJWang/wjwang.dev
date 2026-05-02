import {
  Prose,
  CodeBlock,
  Callout,
  Comparison,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <p>
        pnpm workspace 是目前最嚴格、最省空間的 monorepo 套件管理方案。相較於 npm/yarn workspaces，
        pnpm 的 symlink 策略能有效防止幽靈依賴（phantom dependencies），讓每個套件只能存取自己宣告的依賴。
      </p>

      <h2>為什麼選 pnpm？</h2>
      <Comparison
        columns={[
          {
            title: 'pnpm Workspaces',
            tone: 'pos',
            items: [
              '嚴格 symlink 防止幽靈依賴',
              '虛擬 store 跨專案共享，省磁碟空間',
              'workspace:* 協議自動版本替換',
              'install 速度比 npm 快 2-3x',
            ],
          },
          {
            title: 'npm / yarn Workspaces',
            tone: 'neg',
            items: [
              'Flat hoisting 導致幽靈依賴風險',
              '每個專案獨立 node_modules，磁碟浪費',
              'Yarn PnP 模式有相容性問題',
              'npm workspaces 的 hoisting 行為不一致',
            ],
          },
        ]}
      />

      <h2>初始化 workspace</h2>
      <CodeBlock language="yaml" filename="pnpm-workspace.yaml">{`packages:
  - 'apps/*'
  - 'packages/*'`}</CodeBlock>

      <CodeBlock language="json" filename="package.json (root)">{`{
  "name": "my-monorepo",
  "private": true,
  "packageManager": "pnpm@9.12.0",
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "pnpm -r build",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test"
  }
}`}</CodeBlock>

      <h2>workspace 套件間的依賴</h2>
      <p>
        在 monorepo 內部引用其他 package，使用 <code>workspace:*</code> 協議。
        pnpm 會在 publish 時自動替換成實際版本號。
      </p>
      <CodeBlock language="json" filename="apps/web/package.json">{`{
  "name": "@myorg/web",
  "dependencies": {
    "@myorg/ui": "workspace:*",
    "@myorg/utils": "workspace:*"
  }
}`}</CodeBlock>

      <Callout variant="warn" title="Hoisting 陷阱">
        避免在 <code>.npmrc</code> 中開啟 <code>shamefully-hoist=true</code>。
        這會讓 pnpm 退化成 npm flat hoisting 行為，喪失幽靈依賴保護。
        遇到相容性問題，優先嘗試在該套件的 <code>package.json</code> 中正確宣告依賴，
        或使用 <code>public-hoist-pattern</code> 精確指定需要 hoist 的套件。
      </Callout>

      <h2>GitHub Actions CI 設定</h2>
      <CodeBlock language="yaml" filename=".github/workflows/ci.yml">{`name: CI
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - run: pnpm -r build
      - run: pnpm -r test`}</CodeBlock>

      <h2>filter 指令：只跑受影響的套件</h2>
      <CodeBlock language="bash">{`# 只 build 某個 package 和它的 dependencies
pnpm --filter @myorg/web build

# 只跑受 packages/ui 變更影響的套件
pnpm --filter "...[HEAD^]" test

# 並行執行所有套件的 dev server
pnpm -r --parallel dev`}</CodeBlock>

      <p>
        pnpm monorepo 的核心價值在於嚴格的依賴隔離和高效的 store 共享。
        正確設定 CI 快取和 <code>frozen-lockfile</code>，就能確保本機與 CI 環境完全一致。
      </p>
    </Prose>
  );
}
