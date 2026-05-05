import {
  Prose,
  CodeBlock,
  ImageFigure,
  Aside,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <h1>CMS 之死：自架部落格的下一站，是把那層中介也拆了</h1>
      <h3>── 從 wjwang.dev 到 asgard-slides，兩個示範</h3>

      <p>
        過去十五年，業界寫部落格的標準姿勢，是某種形式的 <strong>CMS</strong> — Medium、WordPress、Hashnode、Ghost、Notion、Substack。做投影片也是某種 CMS — Keynote、PowerPoint、Slidev、Reveal.js。近幾年最熱的方向叫 <strong>headless CMS</strong>，把 head 拆掉、留 admin UI 跟 API。
      </p>

      <p>
        這些東西的存在前提，業界一向假設是同一條：<strong>內容跟版型要分開</strong>。讓會打字的人寫字、讓會排版的人排版，中間用 WYSIWYG editor 或 markdown 當共通語言。
      </p>

      <p>這個前提，在 LLM 上場之後 — <strong>整層崩了</strong>。</p>

      <p>
        當 LLM 可以一次讀完你的 markdown、看懂你 design system 裡 11 個 component 的 props、然後正確生出一份排好版的 React component — 你就不再需要那個中間層。CMS 從必要設施變成多餘中介。業界現在在做的是 <strong>headless CMS</strong>；下一站是直接 <strong>no CMS</strong>。
      </p>

      <p>接下來這篇分享兩個 repo，做這件事：</p>

      <ul>
        <li>
          <strong>wjwang.dev</strong> — 我自己的 blog，<a href="https://wjwang.dev">https://wjwang.dev</a>
        </li>
        <li>
          <strong>asgard-slides</strong> — Asgard AI Platform 的投影片 mono-repo，<a href="https://github.com/asgard-ai-platform/asgard-slides">https://github.com/asgard-ai-platform/asgard-slides</a>
        </li>
      </ul>

      <p>
        兩個 repo 共用同一個設計哲學：<strong>內容單位 = 一個 React Component；作者只寫 markdown 或 outline；LLM 把它轉成 component；共用一套 design system；剩下交給 build pipeline 跟 GitHub Actions。</strong>
      </p>

      <p>整個 CMS 這一層，從架構圖上消失。</p>

      <ImageFigure
        src="/articles/no-cms-blog-as-components/assets/01-wjwang-dev-live.png"
        alt="wjwang.dev 線上長相"
        caption="wjwang.dev 首頁。這個 blog 沒有 admin 後台、沒有 CMS、沒有 dashboard、沒有登入頁 — 整站從 markdown 一路 build 到 GitHub Pages。"
      />

      <hr />

      <h2>第一招：每篇文章是一個 React Component（不是 markdown）</h2>

      <p>
        業界寫部落格的標準姿勢是 markdown — Medium、Hashnode、dev.to、Ghost、Substack — 你把字打進去，框架幫你 render。
      </p>

      <p>這套東西的好處是：你只要會打字。</p>
      <p>
        壞處是：<strong>你只能打字</strong>。
      </p>

      <p>
        在你的部落格文章裡，要插入一個有 5 個分頁的 comparison table、要 highlight code block 的第 3 行跟第 7 行、要插入一個帶 icon 的 callout、要做一個帶作者跟出處的 pull-quote — markdown 替你準備好的姿勢，是 <code>{'> 引用'}</code> 跟 <code>**粗體**</code>。
      </p>

      <p>業界面對這個問題的兩種解法：</p>

      <ol>
        <li>
          <strong>MDX</strong> — 在 markdown 裡寫 React component，一發 build 全部炸給你看、跑 hydration、踩 RSC boundary 踩到天荒地老。
        </li>
        <li>
          <strong>WYSIWYG editor</strong> — Notion / Substack / Medium 的編輯器，你會懷念以前用滑鼠在框框裡拖段落的痛苦。
        </li>
      </ol>

      <p>
        <code>wjwang.dev</code> 走第三條路：<strong>每篇文章是一個 React component</strong>。
      </p>

      <CodeBlock language="text">{`content/articles/my-new-post/
├── metadata.yml          # zod-typed
├── originalcontent.md    # 我寫的 markdown 原稿
├── content.tsx           # LLM 把 markdown 轉成的 TSX
└── assets/`}</CodeBlock>

      <p>
        沒有 markdown runtime renderer。沒有 MDX。<code>content.tsx</code> 是一個 default-exported 的 React component，build 的時候被當成正常 component 處理。要 highlight 第 3 行跟第 7 行就直接 <code>{'<CodeBlock highlightLines={[3, 7]}>'}</code>，要插入 callout 就直接 <code>{'<Callout variant="warn">'}</code>，要做一個 pros/cons 對照表就直接 <code>{'<Comparison columns={[...]}>'}</code>。
      </p>

      <p>
        所有可用的元件，都來自一個叫 <strong><a href="https://github.com/WJWang/wjwang.dev/tree/main/packages/ui"><code>@wjwang/ui</code></a></strong> 的內部 design system，目前有 11 個：<code>{'<Prose>'}</code>、<code>{'<CodeBlock>'}</code>、<code>{'<ImageFigure>'}</code>、<code>{'<Callout>'}</code>、<code>{'<KeyTakeaways>'}</code>、<code>{'<Quote>'}</code>、<code>{'<Aside>'}</code>、<code>{'<Comparison>'}</code>、<code>{'<ArticleCard>'}</code>、<code>{'<ArticleHero>'}</code>、<code>{'<ArticleLayout>'}</code>。每個元件有自己的 props schema、自己的 Tailwind 樣式、自己用 shadcn primitives 包裝過。
      </p>

      <ImageFigure
        src="/articles/no-cms-blog-as-components/assets/02-rendered-components.png"
        alt="一篇文章 render 出的 components"
        caption="wjwang.dev 上一篇文章中段。一頁同時看得到分節 heading、syntax-highlighted 的 CodeBlock、綠線標的 Quote、Prose 段落 — 每個都是 React component，不是 markdown 直譯。"
      />

      <p>
        問題來了 — <strong>「那我每寫一篇都要手刻 React component 嗎？」</strong>
      </p>

      <p>不是。</p>

      <hr />

      <h2>第二招：用 LLM 把 markdown 轉成 TSX</h2>

      <p>
        整個 repo 根目錄有一個檔案叫 <a href="https://github.com/WJWang/wjwang.dev/blob/main/prompts/md-to-tsx.md"><code>prompts/md-to-tsx.md</code></a>。
      </p>

      <p>
        這個檔案是寫給 LLM 看的 <strong>system prompt</strong>。內容大致是：
      </p>

      <ul>
        <li>你是 WJWang blog 的 content compiler</li>
        <li>這個 blog 有 11 個可用元件，這是它們的 props 跟 use case</li>
        <li>
          markdown 結構 → 元件選用對照表（<code>{'> 💡 Tip:'}</code> 帶 emoji 的 blockquote → <code>{'<Callout variant="tip">'}</code>、文章開頭結尾的「重點摘要」list → <code>{'<KeyTakeaways>'}</code>）
        </li>
        <li>
          強制規則：只能 import <code>@wjwang/ui/article</code>、必須 default export、整篇用 <code>{'<Prose>'}</code> 包起來、不要自己寫客製樣式
        </li>
        <li>
          風格慣例：中英文之間保留半形空格、段落 3-5 句、<code>{'<CodeBlock>'}</code> 必填 <code>language</code>
        </li>
        <li>一份完整的 input/output 範例</li>
      </ul>

      <ImageFigure
        src="/articles/no-cms-blog-as-components/assets/03-md-to-tsx-prompt.png"
        alt="md-to-tsx system prompt on GitHub"
        caption="prompts/md-to-tsx.md 在 GitHub repo 上的樣子 — 標題「WJWang Blog — Markdown → TSX 轉換指南」、強制規則、import 白名單。這份 ~120 行的 system prompt 是這個 blog 真正的「內容編譯器」，每一條規則都是上一次 LLM 出包之後補上去的。"
      />

      <p>於是寫一篇文章的流程，變成：</p>

      <ol>
        <li>
          <code>pnpm new:article my-new-post</code> — scaffold 空殼
        </li>
        <li>
          編輯 <code>metadata.yml</code>（zod schema 跑過：title、date、tags、excerpt、optional cover/og image…）
        </li>
        <li>
          把寫好的文章存進 <code>originalcontent.md</code>（<strong>這份 markdown 自己怎麼來的，是下一招的事</strong>）
        </li>
        <li>
          把 <code>prompts/md-to-tsx.md</code> 當 system prompt 餵 LLM、把 <code>originalcontent.md</code> 當 user message 丟進去 — Claude / GPT / Gemini 隨便挑一個都行
        </li>
        <li>
          把 LLM 的 output 存成 <code>content.tsx</code>
        </li>
        <li>
          <code>pnpm validate:article my-new-post</code> — 跑 zod schema、import 白名單、dead asset reference 檢查
        </li>
        <li>
          <code>pnpm dev</code> 看一下沒爛掉
        </li>
        <li>
          <code>git push</code> — 剩下交給 GitHub Actions
        </li>
      </ol>

      <p>
        寫一篇文章，<strong>作者真正動手的部分，理論上只有第 3 步（寫 markdown）</strong>。
      </p>

      <p>剩下：</p>

      <ul>
        <li>React component 的事 → LLM 處理</li>
        <li>Callout / KeyTakeaways / Comparison 該放哪裡 → LLM 自己判斷（system prompt 教過了）</li>
        <li>Build → CI 處理（chokidar 偵測檔案變化 → 重跑 manifest / search index / RSS / mirror assets）</li>
        <li>上線 → GitHub Pages 處理（push main → Actions → 大概 1.5 分鐘後上線）</li>
      </ul>

      <p>於是「寫部落格」這件事，被縮減到只剩一份 markdown。</p>

      <p>但這也只是上一個版本的故事 — 因為連那份 markdown，現在也不是作者一個字一個字打出來的。</p>

      <hr />

      <h2>第三招：連 markdown 自己，也是跟 AI agent 一起寫的</h2>

      <p>
        到這裡為止，整條 pipeline 還剩一個環節沒被工程化 — <strong>markdown 本身</strong>，也就是文章的字。前兩招處理「寫完之後」的事；markdown 這一段，看起來還是非作者打字不可。
      </p>

      <p>
        實際上，這個 blog 上每一篇 markdown，都是作者跟 AI agent <strong>一起</strong>寫的。具體做法：
      </p>

      <ul>
        <li>作者把要寫的主題、論點、素材、語氣偏好、要避開的角度，全部丟給一個 AI agent</li>
        <li>
          Agent 載入特定的 <strong>writing skill</strong>（例如某種敘事結構、某種專欄 voice、某種社群貼文格式）— 不是一次性 prompt，而是一份結構化的寫作系統，包含風格規則、anti-pattern 清單、迭代流程、verification checklist。每個 skill 都是一個資料夾，包含 SKILL.md、語料樣本、風格分析
        </li>
        <li>作者跟 agent 反覆對稿 — agent 先丟一份初稿，作者讀、罵、指出哪段聲音斷掉、哪句太 LinkedIn、哪個 metaphor 不對；agent 修；再讀、再罵、再修</li>
        <li>5 到 15 輪迭代之後，markdown 出版</li>
      </ul>

      <p>
        所以「作者寫 markdown」這句話，其實也是 misleading 的。實際情境是 — <strong>作者寫 brief、寫對話、做判斷；agent 寫字。</strong>
      </p>

      <p>整條 pipeline 攤平來看：</p>

      <table>
        <thead>
          <tr>
            <th>層</th>
            <th>動作</th>
            <th>誰做</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>概念</td>
            <td>想寫什麼、為什麼、給誰看</td>
            <td>人</td>
          </tr>
          <tr>
            <td>Brief</td>
            <td>主題、素材、論點、tone</td>
            <td>人</td>
          </tr>
          <tr>
            <td>對話</td>
            <td>哪裡聲音斷掉、哪裡太溫情、哪段要砍</td>
            <td>人主導，agent 執行</td>
          </tr>
          <tr>
            <td>Markdown</td>
            <td>字、句、段落</td>
            <td>agent 寫，人審</td>
          </tr>
          <tr>
            <td>TSX</td>
            <td>component 排版</td>
            <td>另一個 LLM 跑 system prompt</td>
          </tr>
          <tr>
            <td>Build</td>
            <td>manifest / search / RSS / og</td>
            <td>CI</td>
          </tr>
          <tr>
            <td>Deploy</td>
            <td>上線</td>
            <td>GitHub Actions</td>
          </tr>
        </tbody>
      </table>

      <p>從上往下看 — 越接近底層（字、code、CI），越自動。越接近上層（概念、判斷、品味），越人類。</p>

      <p>
        順帶一提 — <strong>你正在讀的這篇文章本身，就是這樣寫出來的</strong>。
      </p>

      <hr />

      <h2>第四招：把同一個招式，用在投影片</h2>

      <p>
        這套思路的真正用處，<strong>不是只能用在部落格</strong>。
      </p>

      <p>
        <code>asgard-slides</code> 是 Asgard AI Platform 的投影片 mono-repo，用一模一樣的設計哲學蓋出來：
      </p>

      <ul>
        <li>pnpm workspaces</li>
        <li>
          一個共享的元件庫（這次叫 <a href="https://github.com/asgard-ai-platform/asgard-slides/tree/main/packages/deck-kit"><code>deck-kit</code></a>，不叫 <code>@wjwang/ui</code>）
        </li>
        <li>
          每個內容單位 = 一個 <code>.tsx</code> 檔
        </li>
        <li>mono-repo 裡可以塞多個 deck，每個 deck 自己一個資料夾</li>
        <li>同樣 GitHub Pages 自動部署</li>
      </ul>

      <CodeBlock language="text">{`asgard-slides/
├── packages/
│   └── deck-kit/                  # 共享 React kit（primitives / layouts / shell / theme）
└── decks/
    └── asgard-ai-agent-workshop/  # 一個 deck — 「從 Chat 到 Agent · 六層架構實戰」
        └── src/slides/
            ├── 01-opening.tsx
            ├── 02-agenda.tsx
            └── ...`}</CodeBlock>

      <p>
        這個 deck 部署後直接可以打開來看：<a href="https://asgard-ai-platform.github.io/asgard-slides/asgard-ai-agent-workshop/">從 Chat 到 Agent · 六層架構實戰</a> — 101 張投影片、15 個 chapter。每張投影片 = 一個 <code>.tsx</code> 檔，命名 <code>NN-name.tsx</code>、編號從 <code>01</code> 開始連續、不能跳號。<code>deck-kit</code> 內建一個 <code>discoverSlides()</code> 函式，用 Vite 的 <code>import.meta.glob</code> 自動掃描這個資料夾、組成投影片陣列、塞進 <code>{'<DeckProvider>'}</code>。
      </p>

      <p>
        一張投影片的長相就是一個 default-exported component（從 <code>deck-kit</code> 拉 <code>SlideShell</code>、<code>Kicker</code> 等元件進來，附上 <code>meta</code> 跟 <code>notes</code> 的具名 export）：
      </p>

      <CodeBlock language="tsx" filename="src/slides/01-cover.tsx">{`export const meta = { title: "Cover", section: "Intro", theme: "dark" } as const;
export const notes = "講者備註寫這裡。";

export default function Cover() {
  return (
    <SlideShell variant="dark">
      <Kicker>Sandboxed Agent 實戰</Kicker>
      <h1>從 Chat 到 Agent — 六層架構實戰</h1>
    </SlideShell>
  );
}`}</CodeBlock>

      <p>
        <code>deck-kit</code> 提供的素材跟 <code>@wjwang/ui</code> 性質一樣，只是換了用途：
      </p>

      <ul>
        <li>
          <strong>Primitives</strong> — <code>SlideShell</code>、<code>Kicker</code>、<code>Card</code>、<code>Quote</code>、<code>Tag</code>、<code>CodeBlock</code>、<code>Talkbox</code>、<code>Node</code>、<code>ProductCard</code>、<code>Credential</code>、<code>DemoShot</code>
        </li>
        <li>
          <strong>Layouts</strong> — <code>Matrix</code>、<code>CardGrid</code>、<code>Steps</code>、<code>Diagram</code>、<code>FlowDiagram</code>、<code>TermRow</code>、<code>SectionTitle</code>、<code>TwoColumn</code>
        </li>
        <li>
          <strong>Shell</strong> — <code>Deck</code>、<code>DeckProvider</code>、<code>OverviewMode</code>、<code>SwipeHint</code> — 內建 carousel、touch、鍵盤導覽、hash deep-link、章節分組
        </li>
      </ul>

      <p>
        跟 <code>wjwang.dev</code> 那邊一樣，做投影片的流程也可以變成：
      </p>

      <ol>
        <li>把整份 talk 大綱寫成一份 markdown / outline</li>
        <li>
          把 <code>deck-kit</code> 的元件清單（primitives / layouts / props / 範例）丟給 LLM 當 system prompt
        </li>
        <li>把大綱當 user message 餵進去</li>
        <li>
          LLM 一次吐出 N 張 <code>01-opening.tsx</code>、<code>02-agenda.tsx</code>、<code>03-six-layers.tsx</code>…
        </li>
        <li>
          <code>{'pnpm -F <deck> dev'}</code> 預覽、肉眼看一輪、調有違和感的那 2-3 張
        </li>
        <li>
          push main → GitHub Actions → <code>{'https://asgard-ai-platform.github.io/asgard-slides/<deck>/'}</code> 自動上線
        </li>
        <li>
          順便一個 OG image 也自動生好（每個 deck 有自己的 <code>{'og/<slug>.png'}</code>）
        </li>
      </ol>

      <p>整個流程跟寫 blog 文章是同一套 — 換了個元件庫、換了個目錄名、換了個 deploy URL。</p>

      <ImageFigure
        src="/articles/no-cms-blog-as-components/assets/05-asgard-slides-overview.png"
        alt="asgard-slides OverviewMode"
        caption="asgard-slides 部署版的 OverviewMode — 一鍵看到 101 張投影片、15 個 chapter，每張是一個獨立的 React Component。DeckProvider 自動接 carousel + touch + 鍵盤導覽 + hash deep-link + 章節分組。Keynote 沒這個東西。"
      />

      <hr />

      <h2>為什麼這座工廠真的解決了「不想寫部落格」這個問題</h2>

      <p>這時候要回到一開始那個核心問題 — 工程師說「我想要一個自己的 blog」的時候，他真正不想做的事，到底是什麼？</p>

      <p>不是「打字」。打字是 30 分鐘的事。</p>

      <p>
        真正不想做的，是<strong>打字以外的所有雜事</strong>：
      </p>

      <ul>
        <li>想插入一個 callout，要去研究這個平台用什麼 markdown extension</li>
        <li>圖片要自己上傳、自己裁切、自己標 alt</li>
        <li>上稿之後要去後台改 metadata、補 SEO description、補 og:image</li>
        <li>想 highlight 某幾行 code 要去查這個編輯器有沒有支援</li>
        <li>排版跟設計改了一次、十篇舊文章要全部回去調一次</li>
        <li>文章寫完還要手動去 RSS feed 上加一筆</li>
        <li>sitemap、robots.txt、analytics tracking、HTTPS 憑證、custom domain — 上面那些事，每一件單獨拉出來都不難，加在一起就是「我寧願不要寫部落格」</li>
      </ul>

      <p>
        業界一向把這個現象稱為 <strong>friction</strong>。但翻譯成普通話 — <strong>是讓工程師看到自己平常用滑鼠就放棄一切的那種疲倦</strong>。
      </p>

      <p>
        <code>wjwang.dev</code> + <code>asgard-slides</code> 這套設計，把上面那些 friction 通通做成 <strong>once 的工程任務</strong> — 蓋一次、之後永遠免費：
      </p>

      <table>
        <thead>
          <tr>
            <th>痛點</th>
            <th>工程化解法</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Callout / KeyTakeaways / Comparison 排版麻煩</td>
            <td>
              寫進 <code>@wjwang/ui</code> 一次、所有文章都能用
            </td>
          </tr>
          <tr>
            <td>markdown 轉複雜結構</td>
            <td>LLM 一次跑完，作者只審稿</td>
          </tr>
          <tr>
            <td>圖片裁切上傳</td>
            <td>
              把檔案丟進 <code>assets/</code>、validator 自動 mirror、<code>{'<ImageFigure>'}</code> 自動套 caption + ratio
            </td>
          </tr>
          <tr>
            <td>metadata 跟 SEO</td>
            <td>
              <code>metadata.yml</code> zod schema + 自動產 og image / sitemap / RSS
            </td>
          </tr>
          <tr>
            <td>投影片做完還要 export PDF / 上傳</td>
            <td>git push → 自動 pre-render HTML + OG image，連網址都自動產</td>
          </tr>
          <tr>
            <td>樣式改一次、舊文章要重排</td>
            <td>design system 改一個 component、全站全部 deck 全部文章自動套用</td>
          </tr>
        </tbody>
      </table>

      <p>
        於是真相浮現 — <strong>AI 在這套東西裡的角色，是「執行」</strong>。AI 沒有自己的觀點、沒有自己的論述、沒有自己關於這個產業的內部知識 — 那些東西仍然來自人類。但從「想清楚要寫什麼」之後的所有具體動作 — 寫字、排版、選元件、套 props、補 metadata、產同步檔案、跑 CI — <strong>都可以全部交出去</strong>。
      </p>

      <p>
        人類負責<strong>想</strong>；agent 負責<strong>做</strong>。
      </p>

      <p>
        這個分工拉出來之後，工程師會發現一件意外的事：他開始會寫文章了。不是因為他變勤勞了 — 是因為「寫一篇文章」這件事的人類成本，從「打字幾個小時 + 排版幾個小時 + 上稿幾個小時」，被砍到只剩「跟 agent 對話幾輪、看初稿、罵兩句、按 enter」。
      </p>

      <hr />

      <h2>推廣這個用法</h2>

      <p>
        這套東西不需要你也叫 WJWang、也不需要你也叫 Asgard AI Platform。底層的招式，可以複製到任何「<strong>內容多、結構固定、需要 AI 輔助轉換</strong>」的場景：
      </p>

      <ul>
        <li>你的 documentation site — 每篇 doc 是一個 TSX、共用 docs-kit</li>
        <li>你的 product changelog — 每個版本一個 TSX、共用 changelog-kit</li>
        <li>你的 newsletter — 每期一個 TSX、共用 issue-kit</li>
        <li>你的內部 wiki — 每篇一個 TSX、共用 internal-kit</li>
        <li>你的 portfolio case study — 每個 case 一個 TSX、共用 case-kit</li>
      </ul>

      <p>複製樣板的步驟（可以先抄這兩個 repo 看一遍，授權 MIT 跟 unlicensed-pending — 真要商用先回頭問一下）：</p>

      <ol>
        <li>
          <strong>設計你的元件庫</strong> — 什麼元件 reuse 多次就抽成 component。一開始可以亂蓋，三篇文章後再 refactor。
        </li>
        <li>
          <strong>寫 md→tsx 的 system prompt</strong> — 條列你的元件清單、props、選用對照表、強制規則、輸出格式。範例就是 <code>prompts/md-to-tsx.md</code> 那 200 行。
        </li>
        <li>
          <strong>寫你的 writing skill</strong> — 你的 voice、目標讀者、結構偏好、anti-pattern、verification checklist，寫成一份 SKILL.md，配上 5-10 篇你欣賞的範本當風格錨點。給 AI agent 載入後，markdown 那一段就交出去了。
        </li>
        <li>
          <strong>scaffold script</strong> — 寫一個 <code>{'pnpm new:article <slug>'}</code> 自動建空殼，加 zod 驗 metadata。
        </li>
        <li>
          <strong>build pipeline</strong> — 一次 scan、一次驗、一次產 manifest + search + RSS。
        </li>
        <li>
          <strong>GitHub Pages + custom domain</strong> — DNS 接好之後幾乎沒事可做。
        </li>
      </ol>

      <p>整套東西一個週末蓋得完。第二個週末就會有第一篇文章。</p>

      <p>
        但說真的 — 你要做的事<strong>不是把上面這個 stack 複製貼上</strong>。
      </p>

      <p>
        你要做的事，是<strong>承認自己不想做的那部分是哪些</strong> — 然後把那些事<strong>寫成 once 的工程任務</strong>，丟給 LLM 跟 CI。
      </p>

      <p>
        業界一向把這種行為稱作「自動化」。但翻譯成普通話 — <strong>是允許自己只做自己想做的那一小部分</strong>。
      </p>

      <hr />

      <p>
        業界都在問 AI 會不會取代工程師。這篇先示範另一個方向 — <strong>怎麼把「工程師寫部落格、做投影片」這件事，做到從概念到上線之間，沒有一段需要工程師親自打字</strong>。
      </p>

      <p>整條 pipeline — agent 寫 markdown、LLM 轉 TSX、CI 跑 build、Actions 部署。</p>

      <p>人類做的事，從「寫部落格」變成「跟 agent 對話、做判斷、按 push」。</p>

      <p>這篇文章本身，就是這樣寫出來的。</p>

      <Aside title="參考連結">
        <ul>
          <li>
            <strong>Blog 線上：</strong> <a href="https://wjwang.dev">https://wjwang.dev</a>　·　repo：<a href="https://github.com/WJWang/wjwang.dev">WJWang/wjwang.dev</a>
          </li>
          <li>
            <strong>投影片線上：</strong> <a href="https://asgard-ai-platform.github.io/asgard-slides/">https://asgard-ai-platform.github.io/asgard-slides/</a>　·　repo：<a href="https://github.com/asgard-ai-platform/asgard-slides">asgard-ai-platform/asgard-slides</a>
          </li>
          <li>
            <strong>md→tsx system prompt：</strong> <a href="https://github.com/WJWang/wjwang.dev/blob/main/prompts/md-to-tsx.md"><code>prompts/md-to-tsx.md</code></a>
          </li>
          <li>
            <strong>元件庫：</strong> <a href="https://github.com/WJWang/wjwang.dev/tree/main/packages/ui"><code>@wjwang/ui</code></a>（11 個 article components）　·　<a href="https://github.com/asgard-ai-platform/asgard-slides/tree/main/packages/deck-kit"><code>deck-kit</code></a>（slide primitives + layouts + shell）
          </li>
          <li>
            <strong>技術 stack：</strong> Next.js 15 · React 19 · Tailwind v4 · shadcn/ui · pnpm workspaces · Vitest 4 · zod · fuse.js · tsup · Vite · GitHub Pages
          </li>
        </ul>
      </Aside>
    </Prose>
  );
}
