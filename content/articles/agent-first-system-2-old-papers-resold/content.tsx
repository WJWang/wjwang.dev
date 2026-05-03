import { Prose, Callout, Aside, Comparison } from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <p>
        Agent-First System 這個詞最近很紅。前陣子寫過一篇談這個 buzzword 跟業界劇本 —
        為什麼老闆說「失控」從來不是真的失控、為什麼員工的「AI 一人公司」在老闆讀起來變成裁員名單、為什麼從 Active Directory 到 ZTNA 到 Agent-First，這個業界用同一套劇本跑了五十年。
      </p>

      <p>那篇是劇本層。這篇來看技術層 — buzzword 之外，「給 agent 用」這件事，實作起來到底長什麼樣？</p>

      <hr />

      <p>讓我們攤開來看。</p>

      <p>
        <strong>互動順序倒轉</strong>：以前的資料流是 DB → API → UI → Human，現在的資料流是 State → Agent → Intent → Adaptive Render。
      </p>

      <p>
        <strong>Edge-rendered presentation</strong>：同一份底層狀態，依照每個使用者的偏好，在 edge 端各自 render 成不同樣貌。
        MMORPG 早就在這樣搞了 — World of Warcraft 的 world state 在 Blizzard 機房，每個玩家的 PC 上各自 render 出他要的畫面、他要的 UI、他要的快捷鍵配置。
      </p>

      <p>
        <strong>「系統」消解</strong>：它不再是一坨 monolithic system，而是 (Knowledge Graph) × (Agent Network) × (Adaptive Render Engine) 的組合。
      </p>

      <p>
        每一句話都是真的。每一句話都會在投影片上很好看。每一句話也都偷偷把一件事藏起來沒講 —
        <strong>這套架構的隱性副作用，是把員工從「組織的協作者」變成「organization 的 telemetry source」</strong>。
      </p>

      <p>
        當底層只剩一份 World State，當所有人類動作都要經過 agent 去摸這份 State，當 render 是在 edge 端各自客製化的 —
        <strong>管理層看到的那份 World State，就是公司的全部現實</strong>。員工看到的那份，是被 render 出來、被 agent 包裝過、被 governance 層過濾過的版本。
      </p>

      <p>
        如果員工是玩家、agent 是 NPC、那這份 World State 的 admin 只有一個人 — 而那個人，從來不會是員工。
      </p>

      <p>
        我們以前說「上面老闆看的是 dashboard，下面員工看的是 CRUD 介面」，那是相對溫和的版本，因為大家還共用一套 UI 跟一套資料。
        Agent-First System 的版本是 — <strong>連『同一個系統』這個前提都拿掉</strong>。
      </p>

      <p>聽起來，是不是覺得心情振奮、熱血沸騰？非常好。所有 CFO 看到這套設計都會立刻批預算。</p>

      <hr />

      <p>順便講一件這個業界的考古笑話。</p>

      <p>
        最近這幾個月，AI agent 越鋪越多，每一場跟客戶的對焦會議、每一張 RFP，問的問題已經從「要不要導 AI」變成「這個 agent 動過什麼、合法嗎、出事誰負責、能不能稽核」。
      </p>

      <p>聽著聽著我就有點頭痛 — 怎麼這些問題，跟我十年前在 lab 念過、後來進業界完全沒派上用場的那批東西，問的是同一件事？</p>

      <p>
        碩班那兩年我啃過 compiler 紫皮書、念過 Automata Theory、翻過 Lamport 的 TLA+。
        我們 lab 那時候大家都覺得這些東西業界用不到、沒人請你做狀態機證明 — 學了浪費時間。
        我自己更乾脆：怕沒工作，課餘跑去學 React、Node、跑社群、把前後端跟系統架構自己補一輪，覺得這才是吃飯的本事。
      </p>

      <p>過去十年我以為我賭對了。業界全在做前後端、做大數據，沒人在意 formal language。</p>

      <p>
        <strong>結果現在這些東西全部回來了。</strong>
      </p>

      <p>
        為什麼回來？很簡單。當年自動機理論被發明出來的目的，從來就不是為了寫 Pascal 編譯器 —
        <strong>是為了證明哪些狀態是可達的、哪些動作是合法的、哪些路徑是不可能的</strong>。寫 compiler 只是這套理論最普及、最商業化的一個應用而已。
      </p>

      <p>
        而現在我們對 agent 要做的事情是什麼？是要證明：
        <strong>哪些狀態是 agent 可以走的、哪些 tool call 是合法的、哪些決策路徑是不可能繞過稽核軌跡的</strong>。
      </p>

      <p>對，是同一件事。差別只是這次的對象，是一個機率性、會做夢、有時候會幻覺、會自己 plan 出我們沒同意過的工作流的 LLM agent。</p>

      <p>
        不只 automata。最近 AI 工程師 RFP 上每張投影片都會出現的「ontology」、「knowledge graph」這幾個字 — Palantir 帶起來的新顯學 —
        攤開背後的技術對應，是這樣的：
      </p>

      <Comparison
        columns={[
          {
            title: 'Palantir Ontology（2026 包裝）',
            tone: 'neutral',
            items: ['Object Type', 'Property', 'Link', 'Action'],
          },
          {
            title: 'Peter Chen ER Model（1976 原型）',
            tone: 'neutral',
            items: ['表（Entity）', '列（Attribute）', '外鍵（Relationship）', '存儲過程（Operation）'],
          },
        ]}
      />

      <p>
        這就是大學資料庫課要畫的第一張 ERD。Peter Chen 1976 年那篇〈The Entity-Relationship Model — Toward a Unified View of Data〉，五十年來業界畫過幾百萬張，從來沒人覺得它是個 buzzword。
        直到 Palantir 把它包裝成「Ontology」、加上 OWL / RDF 的 namespace、塞進企業 RFP — 同一份 1976 年的論文，因為加了 AI 兩個字，賣得比 Peter Chen 當年領的稿酬高一兩個 zero。
      </p>

      <Callout variant="warn" title="大詞的危害">
        把 Data Modeling 包裝成「Ontology」這個哲學大詞，<strong>不是在抬高它的價值，而是讓你不再追問</strong>。
        一旦你接受了「Ontology」這個詞，你就不會再問「這跟我十年前畫的 ERD 有什麼差別？」、「為什麼這值五倍的錢？」、「為什麼一定要用這家 vendor 的 namespace？」
      </Callout>

      <p>
        CIO 不問了、CFO 批預算了、sales 完成 quota 了。<strong>這才是「Ontology」在 2026 年企業 RFP 上存在的真正理由</strong>。
      </p>

      <Aside title="同類觀察">
        中文 IT 圈這兩年其實有人攤開來講過這件事 — 一個叫做 data model 的東西，工程師知道它是可以換的；但一個叫做 Ontology 的東西，暗示它是世界的客觀結構，誰會質疑「本體」？
        大詞的危害，不是它說錯了什麼，而是讓你不再追問什麼。
      </Aside>

      <p>
        當年 Dennis 跟 Van Horn 1966 年那篇〈Programming Semantics for Multiprogrammed Computations〉寫的 capability-based security、後來在 PDP-1 上的早期實作、再到 KeyKOS、EROS、seL4 —
        這些 1970 年代被認為太冷門、太學院、太不切實際的方向，今天包裝成「agent permission」、「tool scope」、「least privilege execution」，變成 2026 年金融場景每一張 RFP 必問的設計題。
      </p>

      <hr />

      <p>
        這場考古現場可以看出一個 pattern：<strong>業界從來就沒有所謂的新議題，只有新名字。</strong>
      </p>

      <p>舊論文翻出來，換個前綴詞、加上 AI 兩個字，就可以重新賣一次。賣的價錢，還比上次貴。</p>

      <p>那這份重賣的論文，到了 2026 年的企業 RFP 上，真正的功能是什麼？</p>

      <p>
        不是「優化 data modeling」。也不是「重新發明系統架構」。
        <strong>那是 sales deck 上寫給投資人看的話</strong>。
      </p>

      <p>
        它真正的功能 — 在公司簽完合約、佈署完 pilot、過了一兩個會計年度之後 —
        是怎麼讓員工剛拿到的 AI 超能力，一道一道收進可監控、可審計、可被擴張使用到員工管理上的 governance 層裡。
      </p>

      <p>
        那些設計題（state machine 邊界放在哪、token 怎麼變成新的工時記錄、governance 怎麼從 compliance 表面爬進系統 kernel）每一條都得攤開來細部展開，我之後另寫一篇。
      </p>

      <p>但有一件事先收住：</p>

      <p>下次你在 RFP 上看到「Ontology」、「Knowledge Graph」、「Agent Permission」、「Tool Scope」這些字 — 記得它們的共同特徵：</p>

      <p>
        <strong>都是 1970 年代的論文翻出來、換個前綴詞、加上 AI 兩個字、再賣一輪而已。</strong>
      </p>

      <p>而你願意付這個錢，是因為這次的縮寫聽起來夠新、Gartner 的報告夠厚、行銷預算終於買到了該買的位置。</p>

      <hr />

      <blockquote>
        <em>
          本篇引用：Aho/Sethi/Ullman《Compilers》、Hopcroft/Ullman《Automata Theory》、Lamport TLA+ Specification、
          Peter Chen (1976) "The Entity-Relationship Model — Toward a Unified View of Data" (ACM TODS)、
          W3C RDF / OWL Specifications、馮若航 vonng.com〈Ontology again：本體論的本體與權力〉、
          Dennis & Van Horn (1966) "Programming Semantics for Multiprogrammed Computations" (CACM)、
          Anthropic MCP Specification、Google A2A Protocol
        </em>
      </blockquote>
    </Prose>
  );
}
