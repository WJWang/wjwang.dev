import {
  Prose,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <p>
        這陣子剛好工作上有個機會要介紹 redux，便順手整理了這篇文章，主要是關於從過去到現在寫前端的過程中，我是如何認知 redux 與資料狀態管理的一些想法，並沒有太多的技術內容的實作。
      </p>

      <p>
        資料狀態的管理一直以來無論前端或後端，或者說在那個不用前端框架的年代，問題一直都是存在的。
      </p>

      <p>
        雖然前端早期，有著 YUI (Yahoo User Interface), UnderscoreJS, Knockoutjs…，實際開發上似乎還是 jQuery 當道，然後搭配著各種後端 MVC 框架再進行著。對我來說，是到了 2012, 2013 年時，Angular 1 才真正帶起了一股前端框架的浪潮，當時首推的 feature 便是 two-way data binding，然後搭配當時的各種開發工具包如 grunt, bower 並透過 yomen 來生成 boilerplate 生成 SPA，可以說是一種前端獨立出後端、透過 API 進行全面的溝通的開發新風格，也因為 two-way data binding 這種方式的出現，前端對於資料狀態與視覺呈現上的互動操作可說是如虎添翼。
      </p>

      <p>
        2014 年前後的幾年，是我感受前端各種工具框架噴發式發展的幾年，無論是 react、vue 新框架的出現，工具上 webpack、babel，或著是語言上 JS 的各種變種如 Coffeescript, LiveScript, Elm… 因為新一代 ES6 的普及開始沒落，那時候寫起 JS 的感受就是每幾個月便是一代開發生態系汰換舊一代，相較現在起來的感覺倒是各種工具與框架趨近平穩發展了。
      </p>

      <p>
        儘管框架工具發展日益平穩，網頁前端開發一路依舊是越來越複雜，從早期的 server 回應 html, js, css 到現在的 SPA (single page application) 的各種框架，完全透過 javascript 來產生、渲染所需要呈現的畫面，其中的變化可以說是十分巨大，其背後的原因不外乎是 Client 端的效能越來越好，能處理的事情越來越多，前端應用要處理的邏輯也不在是過往的單純呈現與樣式渲染，而是越來越多元的情境與互動以及資料操作與交換。
      </p>

      <p>
        早期我們單純的透過 js 來直接對 DOM 進行操作，無論是插入/移除 DOM 元素、修改 DOM 元素的屬性…等，我們基於 server 已經 response 給前端的畫面後，再使用 javascript 進行修改操作，這個時期的 js 大多在處理一些簡單的邏輯或是畫面的動畫等，且往往不會跟資料狀態有太多的關聯。
      </p>

      <p>
        時至今日，現今的前端幾乎所有的操作與畫面呈現都是透過 js 來進行處理，其資料狀態的複雜度更是不同以往，因此，無論使用哪一個前端框架進行開發，可以精準且簡潔的管理應用中的資料狀態變成了十分重要的問題。
      </p>

      <p>
        React 推出不久的隔一年，Facebook 官方提出的狀態管理方式 Flux，便是基於 two-way data bindings 在日益大型應用中會造成大量且不易預期的 Cascading Updates 所提出的新解決方案，使用單一資料流的方式來進行資料的控管。
      </p>

      <p>
        Flux 的基礎概念上，是 store 對 dispatcher 來進行註冊，當變動產生時會由 dispatcher 去發出 action，store 則依據對應的 action 來執行內部資料的變動，然後使用該 store 內的 event emitter 發出 change 信號，當 UI Component 是與該 store 內資料有關時，則會在 UI Component 的 lifecycle 內去 subscribe 這個 store 的 event emitter，並且隨資料改變變換 UI 呈現方式。
      </p>

      <p>
        Flux 這種作法很快地被廣大開發者們開始借鏡與使用，然後 Flux 更多的是提供一種在 react 框架中單向資料流的思考方式，與其說是一種 framework 更像是一種 pattern。
      </p>

      <p>
        很快的在一場 React Europe Conf. 2015，Dan Abramov 為了談論如何在 react application 開發過程中可以有 Time Travel Debug 的模式，他基於 Flux 的邏輯，做出了一套 Redux (Reducers + Flux) 這樣的資料狀態 container 的 library，其中最大的特色就是讓資料狀態是可預測的 (predictable)，並且在同一次的演講中 demo 了 store 內的資料是如何歷經每一次的 action 透過 reducer 去改變資料，每一個 action dispatch 的步驟記錄與資料狀態的前進與後退。
      </p>

      <p>
        沒多久，redux 的生態系日益壯大，可用於記錄 action dispatch 的各種 debug logger 與工具與圖形化工具大量地產生，各種基於 redux 資料流上處理 side effect 的 middleware 套件也都各有其擁護者，其中以官方首推的 redux-thunk 為最大宗。
      </p>

      <p>
        此外，透過 react-redux 所提供的 Provider component 幫開發者 subscribe redux store，並讓 Provider 的 children component 皆可以透過 connect function 來取得 store 中所需要的資料作為 prop 傳入 component 中，讓開發者在使用 redux 與 react 的共同開發上就更為緊密的連結。
      </p>

      <p>
        時至今日，直接將 redux 做為預設開發 react application 的資料狀態處理方案也不在少數。
      </p>

      <p>
        也因為這樣，現在的很多人談及 redux 時，往往都會忽略 redux 是一個可以獨立於 react 而存在的 state container。另一方面來說，react 也並非 redux 不可，依然有許多狀態處理的 library。Flux 其實也在 redux 大紅大紫後續有一些改進，而 mobx 也是另外一套可以供選擇的 library。
      </p>

      <p>
        很多時候回頭去看當初 redux 作者寫的 <a href="https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367">You might not need redux</a> 時，就更會有深刻的感受，有的時候隨著開發情境的不同，換一種開發使用的 library 或許可以更輕鬆地解決問題，或者，當真正理解 redux 的原理與想解決的問題後，也許在一些情境上，我們可以更簡單的去做出更快速的解決方案，而不是不假思索地使用 redux 作為萬靈丹。
      </p>

      <p>原文發表於 <a href="https://wjwang.medium.com/redux%E8%88%87%E8%B3%87%E6%96%99%E7%8B%80%E6%85%8B%E7%AE%A1%E7%90%86-87060b1e2086">Medium</a></p>
    </Prose>
  );
}
