# Deep into Vue: Reactivity 的實現

## 前言與相關背景知識

本篇文章分析 Vue 對資料 Reactivity 的實現方式與原理。適合已經了解如何使用 Vue 或想要實作 Reactivity 特性的讀者。

閱讀本文的建議背景知識包括：

* Concept: Reactivity Programming
* Design Pattern: Observer
* Data Structure: Tree, Set
* Algorithm: Tree traversal

## Reactivity / Reactive Programming 是什麼

Reactivity Programming 的核心概念在於：當某個值在一個位置發生變化時，所有依賴於該值的其他位置都會自動重新計算和更新，而無需阻塞線程等待事件發生。

此觀念可比喻為數學中的自變數與應變數關係：

```
x → f(x)   
x → g(x)  
x → f・g(x)
```

當自變數 `x` 變更時，所有相依的 function 都會重新計算。在程式設計中，這樣的 `x` 通常是 GUI 操作產生的事件。

在 Vue 中，會變動的 `data` 就是上述的 `x`，無論是在 `computed`、`template` 中顯示的資料，或是 `directive`（如 `v-if`、`v-for`）使用的資料，都是相依於它的 function 執行結果。

## Vue 為什麼需要 Reactivity

隨著應用操作複雜性增加，單一資料被更新的管道與情境會十分多變。以圖片上傳應用為例：

狀態包括：尚未上傳 → 上傳中 → 上傳成功/失敗，期間可能涉及：
- 使用者操作（上傳、取消）
- Server 回應（成功、失敗）
- 重試邏輯
- 狀態衝突處理

若透過條件式處理，需要考慮許多因素組合，容易產生邏輯錯誤。而使用 Reactivity 方式，將資料做成可被觀測的變數，當資料異動時主動通知對應操作行為。這樣從描述「流程」轉變為描述「事件處理」，邏輯相對單純許多。

## Reactivity 在 Vue 中發生的時機與作用區域

在每個 Component 的 lifecycle 中，`computed`、`data`、`props` 的 Reactivity 脫離不了關係。具體來說：

- 當 component mounted 觸發 `render` 開始，需要對 `template`、`vue directive` 中的資料進行求值來顯示
- 例如：`{{ x + 10 }}`、`v-if="(x + 10) > 2"`，或在 `computed` 中使用這樣的邏輯

此過程需要進行「dependency collect（相依性收集）」——找出求值 `f(x) = x + 10` 時所需的變數 `x`。因此 `x + 10` 是一個 `Observer`，而 `x` 本身是一個 `Observable`。

流程為：
1. 存取資料的 `getter` 函式
2. 將相依的變數放入 `Watcher` 更新佇列
3. 觸發畫面重新 `render`

當程式事件（touch、click、Ajax 回應等）更動資料值時，觸發資料的 `setter`，該資料發出通知，告知 `Watcher` 更新 Component，形成循環。

## Vue 如何實現 Reactivity

Reactivity 邏輯實作主要在 `observer` 中：

### 初始化、Object.defineProperty 與 `defineReactive`

Vue 透過 `initMixin` 在 `Vue.prototype` 中新增 `Vue.prototype._init`。當執行 `new Vue(options)` 時，會觸發 `initState`：

```javascript
export function initState (vm: Component) {  
  vm._watchers = []  
  const opts = vm.$options  
  if (opts.props) initProps(vm, opts.props)  
  if (opts.methods) initMethods(vm, opts.methods)  
  if (opts.data) {  
    initData(vm)  
  } else {  
    observe(vm._data = {}, true /* asRootData */)  
  }  
  if (opts.computed) initComputed(vm, opts.computed)  
  if (opts.watch && opts.watch !== nativeWatch) {  
    initWatch(vm, opts.watch)  
  }  
}
```

`observe` 函式使用 `Observer class` 產生 observer instance。在建構子中會遍歷物件的 `Object.keys`，透過 `defineReactive(obj, keys[i])` 將各項屬性重新包裝賦予 Reactive 性質。

`defineReactive` 透過使用 `Object.defineProperty` 將傳入 value 的 `get` 與 `set` 屬性進行修改。

### Collect as Dependency 與 Notify

在 reactive getter 及 setter 中分別執行 `dep.depend()` 及 `dep.notify()`。

`Dep` 物件在 observer 建構子中透過 `new Dep()` 產生，是一個具備可被觀察的變數。它擁有許多 `subscribers` 訂閱，並具有 `notify` 行為通知每個訂閱者進行 `update` 行為。

當 `reactiveSetter` 被執行，表示資料被變更，便透過 `dep` 執行 `notify` 通知所有相關的 `subscribers` 進行更新。

在 `reactiveGetter` 與 `depend()` 部分涉及「Collect as Dependency」流程，為解決變數改動後因相依性產生的畫面顯示問題。

`Dep` class 的命名是 Dependency 的縮寫。`Dep instance` 就是 `observable` 的概念，其屬性 `subs` 表示許多的 `subscribers (observers)`，型態為 `Array of Watcher`。

值得注意的是 `static target: ? Watcher` 這個 `Watcher class` 的 nullable instance。當變數的 `getter` 被觸發時，其 `dep instance` 透過 `depend` 把自身加入 `target` 這個 `Watcher` 之中。當變數發出 `notify` 時便被 `target` 接收並執行對應操作。

## 後記

### 一些使用細節

了解上述實現原理後，就不難理解以下細節：

1. Watch handler 中 deep 的差別
2. computed 的實現
3. $set 使用時機與原因
4. template / v-model 等 directive 資料如何被更新
5. 如何偵測（追蹤）Array / Object type data 的變更

### Source Code 與參考版本

本文參考 VueJS 2.6.10 版本中的實作版本。若有理解上的錯誤歡迎指出與糾正。

### 未來相關發展

在 Vue 3.0 的發布訊息中，有以下變更預計：

1. **Proxy-based Observation**: 透過 `Object.defineProperty` 方式改寫 get、set function 將改用 Proxy 進行實作
2. **Decoupled Packages**: 預計將許多邏輯進行解耦合，包含 `src/core/observer` 及 scheduler 邏輯，拆分作為獨立模組
3. **Exposed reactivity API**: 將 Reactivity 相關 API 公開給使用者使用

## 相關參考資訊與文章

- [Vue.js 技术揭秘 | 依赖收集](https://ustbhuangyi.github.io/vue-analysis/reactive/getters.html)
- [Vue源码学习笔记之Dep和Watcher](https://github.com/xingbofeng/xingbofeng.github.io/issues/15)
- [answershuto/learnVue](https://github.com/answershuto/learnVue)
- [Evan You Previews Vue.js 3.0](https://medium.com/vue-mastery/evan-you-previews-vue-js-3-0-ab063dec3547)
- [Reactivity in Depth - Vue.js](https://vuejs.org/v2/guide/reactivity.html)
- [深入浅出基于"依赖收集"的响应式原理](https://segmentfault.com/a/1190000011153487)
- [What is difference between observer pattern and reactive programming?](https://stackoverflow.com/questions/16652773/what-is-difference-between-observer-pattern-and-reactive-programming)
