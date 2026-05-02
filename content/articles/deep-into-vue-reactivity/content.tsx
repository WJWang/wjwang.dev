import {
  Prose,
  CodeBlock,
  Callout,
  Aside,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <h2>前言與相關背景知識</h2>

      <p>
        本篇文章分析 Vue 對資料 Reactivity 的實現方式與原理。適合已經了解如何使用 Vue 或想要實作 Reactivity 特性的讀者。
      </p>

      <p>閱讀本文的建議背景知識包括：</p>
      <ul>
        <li>Concept: Reactivity Programming</li>
        <li>Design Pattern: Observer</li>
        <li>Data Structure: Tree, Set</li>
        <li>Algorithm: Tree traversal</li>
      </ul>

      <h2>Reactivity / Reactive Programming 是什麼</h2>

      <p>
        Reactivity Programming 的核心概念在於：當某個值在一個位置發生變化時，所有依賴於該值的其他位置都會自動重新計算和更新，而無需阻塞線程等待事件發生。
      </p>

      <p>此觀念可比喻為數學中的自變數與應變數關係：</p>

      <CodeBlock language="text">{`x → f(x)
x → g(x)
x → f・g(x)`}</CodeBlock>

      <p>
        當自變數 <code>x</code> 變更時，所有相依的 function 都會重新計算。在程式設計中，這樣的 <code>x</code> 通常是 GUI 操作產生的事件。
      </p>

      <p>
        在 Vue 中，會變動的 <code>data</code> 就是上述的 <code>x</code>，無論是在 <code>computed</code>、<code>template</code> 中顯示的資料，或是 <code>directive</code>（如 <code>v-if</code>、<code>v-for</code>）使用的資料，都是相依於它的 function 執行結果。
      </p>

      <h2>Vue 為什麼需要 Reactivity</h2>

      <p>
        隨著應用操作複雜性增加，單一資料被更新的管道與情境會十分多變。以圖片上傳應用為例，狀態包括：尚未上傳 → 上傳中 → 上傳成功/失敗，期間可能涉及：
      </p>
      <ul>
        <li>使用者操作（上傳、取消）</li>
        <li>Server 回應（成功、失敗）</li>
        <li>重試邏輯</li>
        <li>狀態衝突處理</li>
      </ul>

      <p>
        若透過條件式處理，需要考慮許多因素組合，容易產生邏輯錯誤。而使用 Reactivity 方式，將資料做成可被觀測的變數，當資料異動時主動通知對應操作行為。這樣從描述「流程」轉變為描述「事件處理」，邏輯相對單純許多。
      </p>

      <h2>Reactivity 在 Vue 中發生的時機與作用區域</h2>

      <p>
        在每個 Component 的 lifecycle 中，<code>computed</code>、<code>data</code>、<code>props</code> 的 Reactivity 脫離不了關係。具體來說：
      </p>
      <ul>
        <li>當 component mounted 觸發 <code>render</code> 開始，需要對 <code>template</code>、<code>vue directive</code> 中的資料進行求值來顯示</li>
        <li>例如：<code>{'{{ x + 10 }}'}</code>、<code>{'v-if="(x + 10) > 2"'}</code>，或在 <code>computed</code> 中使用這樣的邏輯</li>
      </ul>

      <p>
        此過程需要進行「dependency collect（相依性收集）」——找出求值 <code>f(x) = x + 10</code> 時所需的變數 <code>x</code>。因此 <code>x + 10</code> 是一個 <code>Observer</code>，而 <code>x</code> 本身是一個 <code>Observable</code>。
      </p>

      <p>流程為：</p>
      <ol>
        <li>存取資料的 <code>getter</code> 函式</li>
        <li>將相依的變數放入 <code>Watcher</code> 更新佇列</li>
        <li>觸發畫面重新 <code>render</code></li>
      </ol>

      <p>
        當程式事件（touch、click、Ajax 回應等）更動資料值時，觸發資料的 <code>setter</code>，該資料發出通知，告知 <code>Watcher</code> 更新 Component，形成循環。
      </p>

      <h2>Vue 如何實現 Reactivity</h2>

      <p>Reactivity 邏輯實作主要在 <code>observer</code> 中：</p>

      <h3>初始化、Object.defineProperty 與 defineReactive</h3>

      <p>
        Vue 透過 <code>initMixin</code> 在 <code>Vue.prototype</code> 中新增 <code>Vue.prototype._init</code>。當執行 <code>new Vue(options)</code> 時，會觸發 <code>initState</code>：
      </p>

      <CodeBlock language="javascript">{`export function initState (vm: Component) {
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
}`}</CodeBlock>

      <p>
        <code>observe</code> 函式使用 <code>Observer class</code> 產生 observer instance。在建構子中會遍歷物件的 <code>Object.keys</code>，透過 <code>defineReactive(obj, keys[i])</code> 將各項屬性重新包裝賦予 Reactive 性質。
      </p>

      <p>
        <code>defineReactive</code> 透過使用 <code>Object.defineProperty</code> 將傳入 value 的 <code>get</code> 與 <code>set</code> 屬性進行修改。
      </p>

      <h3>Collect as Dependency 與 Notify</h3>

      <p>
        在 reactive getter 及 setter 中分別執行 <code>dep.depend()</code> 及 <code>dep.notify()</code>。
      </p>

      <p>
        <code>Dep</code> 物件在 observer 建構子中透過 <code>new Dep()</code> 產生，是一個具備可被觀察的變數。它擁有許多 <code>subscribers</code> 訂閱，並具有 <code>notify</code> 行為通知每個訂閱者進行 <code>update</code> 行為。
      </p>

      <p>
        當 <code>reactiveSetter</code> 被執行，表示資料被變更，便透過 <code>dep</code> 執行 <code>notify</code> 通知所有相關的 <code>subscribers</code> 進行更新。
      </p>

      <p>
        <code>Dep</code> class 的命名是 Dependency 的縮寫。<code>Dep instance</code> 就是 <code>observable</code> 的概念，其屬性 <code>subs</code> 表示許多的 <code>subscribers (observers)</code>，型態為 <code>Array of Watcher</code>。
      </p>

      <p>
        值得注意的是 <code>static target: ? Watcher</code> 這個 <code>Watcher class</code> 的 nullable instance。當變數的 <code>getter</code> 被觸發時，其 <code>dep instance</code> 透過 <code>depend</code> 把自身加入 <code>target</code> 這個 <code>Watcher</code> 之中。當變數發出 <code>notify</code> 時便被 <code>target</code> 接收並執行對應操作。
      </p>

      <h2>後記</h2>

      <h3>一些使用細節</h3>

      <p>了解上述實現原理後，就不難理解以下細節：</p>
      <ol>
        <li>Watch handler 中 deep 的差別</li>
        <li>computed 的實現</li>
        <li>$set 使用時機與原因</li>
        <li>template / v-model 等 directive 資料如何被更新</li>
        <li>如何偵測（追蹤）Array / Object type data 的變更</li>
      </ol>

      <h3>Source Code 與參考版本</h3>

      <p>本文參考 VueJS 2.6.10 版本中的實作版本。若有理解上的錯誤歡迎指出與糾正。</p>

      <h3>未來相關發展</h3>

      <p>在 Vue 3.0 的發布訊息中，有以下變更預計：</p>
      <ol>
        <li><strong>Proxy-based Observation</strong>：透過 <code>Object.defineProperty</code> 方式改寫 get、set function 將改用 Proxy 進行實作</li>
        <li><strong>Decoupled Packages</strong>：預計將許多邏輯進行解耦合，包含 <code>src/core/observer</code> 及 scheduler 邏輯，拆分作為獨立模組</li>
        <li><strong>Exposed reactivity API</strong>：將 Reactivity 相關 API 公開給使用者使用</li>
      </ol>

      <Aside title="相關參考資訊與文章">
        <ul>
          <li><a href="https://ustbhuangyi.github.io/vue-analysis/reactive/getters.html">Vue.js 技术揭秘 | 依赖收集</a></li>
          <li><a href="https://github.com/xingbofeng/xingbofeng.github.io/issues/15">Vue源码学习笔记之Dep和Watcher</a></li>
          <li><a href="https://github.com/answershuto/learnVue">answershuto/learnVue</a></li>
          <li><a href="https://medium.com/vue-mastery/evan-you-previews-vue-js-3-0-ab063dec3547">Evan You Previews Vue.js 3.0</a></li>
          <li><a href="https://vuejs.org/v2/guide/reactivity.html">Reactivity in Depth - Vue.js</a></li>
          <li><a href="https://segmentfault.com/a/1190000011153487">深入浅出基于"依赖收集"的响应式原理</a></li>
          <li><a href="https://stackoverflow.com/questions/16652773/what-is-difference-between-observer-pattern-and-reactive-programming">What is difference between observer pattern and reactive programming?</a></li>
        </ul>
      </Aside>

      <p>原文發表於 <a href="https://wjwang.medium.com/deep-into-vue-reactivity-%E7%9A%84%E5%AF%A6%E7%8F%BE-f2261af1d168">Medium</a></p>
    </Prose>
  );
}
