# pnpm Monorepo 實戰：從零搭建到 CI 部署

pnpm workspace 是目前最嚴格、最省空間的 monorepo 套件管理方案。相較於 npm/yarn workspaces，pnpm 的 symlink 策略能有效防止幽靈依賴（phantom dependencies），讓每個套件只能存取自己宣告的依賴。

## 為什麼選 pnpm？

npm 和 yarn 的 flat hoisting 策略雖然節省磁碟空間，但會讓套件意外存取到未宣告的依賴。這在小專案無感，但在 monorepo 中可能造成 A 套件意外依賴 B 套件的 dependency，一旦 B 升級就爆炸。

pnpm 用虛擬 store（`~/.pnpm-store`）+ symlink 的方式，讓每個套件的 `node_modules` 只有自己宣告的依賴，徹底解決幽靈依賴問題。

## pnpm-workspace.yaml 設定

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

這告訴 pnpm 哪些目錄是 workspace packages。每個 package 有自己的 `package.json`，根目錄的 `package.json` 則是 workspace root。

## workspace:* 依賴協議

在 monorepo 內部引用其他 package，使用 `workspace:*` 協議：

```json
{
  "dependencies": {
    "@myorg/ui": "workspace:*"
  }
}
```

pnpm 會在 publish 時自動把 `workspace:*` 替換成實際版本號，不需要手動維護。

## 常見的 hoisting 陷阱

pnpm 的 `shamefully-hoist` 選項（`.npmrc` 中設定）會讓行為退化成 npm flat hoisting，雖然能解決某些工具的相容性問題，但會失去幽靈依賴保護。要優先嘗試正確宣告依賴，而不是開啟 shamefully-hoist。

## CI 設定要點

GitHub Actions 中要快取 pnpm store，否則每次 CI 都重新下載所有套件。搭配 `pnpm install --frozen-lockfile` 確保 CI 環境與本機一致。
