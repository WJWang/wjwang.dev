# 5 個 TypeScript Strict Mode 你該打開的 flag

開啟 `strict: true` 是好的開始，但 TypeScript 還有幾個預設關閉的進階 flag，能讓型別系統更準確地反映程式的實際行為。

## 1. noUncheckedIndexedAccess

預設情況下，`arr[0]` 的型別是 `T`，而非 `T | undefined`。但陣列存取在執行期完全可能是 undefined。開啟此 flag 後，型別系統會強迫你處理 undefined 情況。

## 2. exactOptionalPropertyTypes

`{ foo?: string }` 預設允許 `foo: undefined`，但語意上「有這個 key 但值是 undefined」和「沒有這個 key」是不同的。開啟後，你必須用 `foo?: string | undefined` 才能表達前者。

## 3. noImplicitOverride

在 class 繼承中，如果子類別覆寫了父類別的方法，必須明確加上 `override` 關鍵字。這能防止父類別改名時子類別悄悄失去覆寫效果。

## 4. noFallthroughCasesInSwitch

switch 語句的 fallthrough 行為（case 沒有 break 繼續執行下一個 case）幾乎永遠是 bug 而非故意為之。開啟此 flag 讓這種情況變成編譯錯誤。

## 5. verbatimModuleSyntax

確保型別 import 使用 `import type`，值 import 使用普通 `import`。這讓打包工具能正確 tree-shake，避免型別 import 意外出現在 bundle 中。
