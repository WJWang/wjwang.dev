import { Prose, Callout, KeyTakeaways, Quote } from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <p>
        Agent-First System 這個詞，前陣子寫過兩篇 —
        一篇講為什麼這個 buzzword 是業界五十年劇本的下一輪、另一篇講它技術內裡其實是 1970 年代的論文翻出來重新包裝。那兩篇是劇本層跟考古層。
      </p>

      <p>這篇是最後一層 — 它在企業裡真正做的事。</p>

      <p>sales deck 上會這樣定義 Agent-First System：「以 agent 為主要互動主體；人類只在最後決策呈現的那一層出現。」</p>

      <p>
        聽起來像架構翻新。實際上 — 在企業導入完一輪、過了一兩個會計年度之後 —
        它真正的功能，是員工剛拿到的 AI 超能力，怎麼被一道一道收進可監控、可審計、可被擴張使用到員工管理上的 governance 層裡。
      </p>

      <p>這篇來講這件事。</p>

      <hr />

      <p>現在來看看「重做地基」這件事，實際上要做哪些事。</p>

      <p>
        第一件事，叫做 <strong>state machine 邊界放在哪</strong>。
      </p>

      <p>
        agent 是機率性的，但稽核、權限、合規、財務動作必須是可決定性的。意思就是：
        <strong>agent 想做什麼是它的事，但什麼是 agent 做了會算數的，是我們的事</strong>。我們要劃出一條線：
      </p>

      <ul>
        <li>
          <strong>Deterministic state machine</strong>：write、commit、pay、approve、發薪 — 這些是企業會被告的動作，必須走嚴格的狀態機，必須留 immutable log，必須有人類最終批准
        </li>
        <li>
          <strong>Probabilistic agent</strong>：plan、suggest、draft、explore — 這些是員工拿 AI 加速生產力的部分，agent 隨便玩，玩失敗也沒人會被告
        </li>
      </ul>

      <p>聽起來像是給員工自由空間？再仔細看一次這份分類。</p>

      <p>
        <strong>所有真正會在公司裡產生實質意義的動作，都被劃進 deterministic 這邊</strong>。
        員工拿 AI 能玩的，全是 plan 跟 draft 階段 — 也就是「想想看」階段。一旦進入「實際做」階段，立刻轉到我們的 deterministic state machine 上，立刻留 immutable log，立刻被審計。
      </p>

      <p>
        員工以為他用 AI 加速了 300% 的生產力。他確實加速了 — 加速的全部，是「想想看」這個階段。「實際做」這個階段，還是要排隊走我們的狀態機，跟以前 ERP 的工作流請假表單沒什麼差別。
      </p>

      <p>
        差別只是，<strong>現在他想的時候我們也在看</strong>。
        因為要從「想」走到「做」這條路徑，每一步都會在 system of record 上留痕跡。「員工最近用 AI 在想什麼」這份報告，從這一刻起，是 monthly OKR review 的固定議程。
      </p>

      <p>
        第二件事，<strong>token 是新時代的 memory</strong>。
      </p>

      <p>
        1980 年代寫程式要算 memory，每個 byte 計較。1990 年代開始可以不用算了，因為 RAM 變便宜。
        現在 2025 年換成 token 在算 — context 視窗、cache hit、tool call 成本，每一個都直接連到雲端帳單。
      </p>

      <p>
        這件事的技術面很無聊，是經典的 query plan 跟 memory pool 那套東西回來了。但它的政治面很有趣 —
        <strong>token 是新的工時記錄</strong>。
      </p>

      <p>員工每寫一個 prompt、每呼叫一次 tool、每讓 agent 跑一次 multi-step plan，都會產生一筆可計價、可歸因、可審計的 token 消耗。這份消耗 — 各位先生女士 — 就是員工腦袋運作的證據。</p>

      <p>
        以前我們要員工填工時表，員工總是有十八種理由能填得很模糊，今天「跟客戶開會」、明天「discussion」、後天「research」。
        但你知道嗎，這些事情接下來會被 AI 工具取代 — 跟客戶開會用 transcribe agent、discussion 用 plan agent、research 用 deep research agent。
        <strong>而這些 agent 的每一次呼叫，都在 system of record 上留下精確到 millisecond 的記錄</strong>。
      </p>

      <Callout variant="info" title="TOIL — Token-Originated Indexed Labor">
        我們稱這個現象為 <strong>TOIL — Token-Originated Indexed Labor</strong>。員工的勞動，從此有了更精確的單位。
        TOIL 是這個業界下一個十年的主旋律。投影片上請寫成黃底紅字。
      </Callout>

      <p>
        第三件事，這是這篇文章重量最重的一塊 — <strong>data governance 變成 kernel</strong>。
      </p>

      <p>
        在 Human-First 時代，governance 是 compliance 部門的事，貼在系統表面：VPN、SSO、audit log。
        為什麼可以這樣？因為人類動作慢、可被攔截、有打卡時間、有人事考核當側錄機制 —
        <strong>一個人類一天能闖的禍，是有物理上限的</strong>。
      </p>

      <p>
        在 Agent-First 時代沒有這個上限。一個 agent 一秒可以發 N 次 tool call、跨多個系統、自己做 plan — 而且每一個 call 看起來都合法、合規、有完整 trace。
        任何「貼在系統表面」的 governance 都會被繞過。所以 governance 必須變成 first-class primitive，跟 type system 同層、跟 memory allocator 同層。
      </p>

      <p>
        這不是純架構話。AI 基本法 2026-01-14 施行條文要求：可解釋性、可審計性、風險分級。
        金管會 AI 指引要求：金融業引入 AI 必須有完整稽核軌跡與分級控管。十六家銀行那個七千萬的 FinLLM 聯盟年底前要結案。
      </p>

      <p>把法規語言翻成架構語言：</p>

      <ul>
        <li>稽核軌跡 = 每個 agent 動作的 immutable log</li>
        <li>風險分級 = state machine 邊界</li>
        <li>可解釋性 = 每次 plan 的 trace 可以被重建</li>
      </ul>

      <p>
        這聽起來都很合規、很正派、很 CISO 友好。但
        <strong>所有以「合規」為名建立的系統，最後一定會被擴張使用到「員工管理」上</strong>。
      </p>

      <p>
        從 SOX、GDPR、PDPA — 過去三十年，每一波合規最後都會發生一件事：起初它只是用來「應付主管機關」，三年之後它變成 HR 用來追蹤員工的工具，五年之後它變成中階主管用來鬥爭部屬的武器。
      </p>

      <p>
        AI 法規這一波也不會例外。差別是這一波<strong>留下來的痕跡比以前細密一千倍</strong>。
        以前主管想知道你在幹嘛，要等月會報告、要看 commit log、要逼你寫週報。
        現在主管只要查 audit trail，他就可以看到你今天上午十點四十七分跟 agent 討論了什麼、agent 建議你怎麼做、你同意了哪一條建議、你拒絕了哪一條。
      </p>

      <KeyTakeaways
        title="一句話"
        items={[
          '員工在 AI 時代得到的「自主性」，跟員工在 AI 時代被監控的「精細度」，這兩條曲線是反比關係。',
          '你以為的能動性，是別人的可觀測性。',
        ]}
      />

      <hr />

      <p>而員工，你以為員工會反對嗎？員工不會反對的。</p>

      <p>
        員工不會反對的原因，是這套東西包裝得太好了。每一個流程都掛著「智慧化」、「賦能」、「協作」、「敏捷」 — 沒有一個詞跟「監控」沾上邊。
        員工每天打開電腦，看到的是一個更友善的 dashboard、一個更聰明的助理、一個會主動提醒「你今天的 OKR 進度是 73%」的 agent。
      </p>

      <p>
        員工不會反對「AI 助理替我整理一週重點」這件事。誰會反對？這聽起來太好了。
        員工只是不知道 — 那份「一週重點」的副本，會自動進到他主管的 system of record，會被另一隻 agent 整理成「員工本週生產力評估」，最後會在月會的某一張投影片上佔半行字。
      </p>

      <p>
        我們不需要員工反對，我們需要員工<strong>感激</strong>。
      </p>

      <p>
        而員工會感激的原因，是因為他們上一個工作環境更糟。十年前他們在的公司沒有 AI，他們得自己手動寫週報、手動填 OKR、手動產生晉升用的「我為什麼值得加薪」報告 — 那才叫痛苦。
        現在的世界，他們可以叫 agent 替他們寫所有這些東西，他們覺得人生終於得到了解放。
      </p>

      <p>
        <strong>他們確實得到了解放。他們從「自己寫垃圾文件」這件事中得到了解放。但那份垃圾文件本身，他們以為終於不必寫了 — 其實只是換了個生產者，繼續生產</strong>。
      </p>

      <p>agent 寫的垃圾文件，比他們自己寫的還精美、還可信、還可被 indexing、還可被搜尋、還可被進一步分析。</p>

      <hr />

      <p>「所以你們建議怎麼導？」每一場對焦會議的結尾，主管都會問同一句話。</p>

      <p>正派的賣家不會在這個位置推銷產品 — 還沒練成的業務才會。回的話也每次一樣：</p>

      <Quote>
        您的問題不是選哪一家 AI 平台。您的問題是 — 您怎麼讓三千個人<strong>安全地、一致地、可追蹤地</strong>使用 AI，同時不殺死他們剛得到的超能力。
      </Quote>

      <p>主管會沉默一下，然後說：「對，這才是真正的問題。」</p>

      <p>
        但他<strong>沒有意識到</strong>他剛才同意的是什麼。「不殺死超能力」是修辭裡的點綴 — 真正的訴求其實是前面那串副詞：
        <strong>安全地、一致地、可追蹤地</strong>。安全 = 我們監控；一致 = 我們標準化；可追蹤 = 我們有日誌。三個副詞，三道籠子。
        員工的超能力會在這三道籠子裡被慢慢校正回原本「企業可以接受的能力範圍」 — 而這個範圍，剛好就是員工得到 AI <strong>之前</strong>的能力範圍，加上一點點利於管理層升遷用的資料。
      </p>

      <p>
        於是他簽了 pilot。第一階段佈署，通常涵蓋公司七到八成的人。剩下兩到三成，主管會說那是「<strong>信得過的核心團隊</strong>」 —
        但所謂的核心團隊，只是還沒被治理工具覆蓋的那一批人，而這一批人的縮減速度，比公司營收的成長速度快得多。等到下一個會計年度，剩下那兩成也會被納進來，因為主管在董事會被問了一個簡單的問題：
      </p>

      <Quote>為什麼這兩成不在 system of record 上？</Quote>

      <p>他答不出來。沒有人答得出來。所以這兩成會被覆蓋。</p>

      <hr />

      <p>
        1937 年 Ronald Coase 在〈The Nature of the Firm〉裡寫，企業之所以存在，是因為內部協調比市場交易便宜。這個論點 —
        <strong>錯了一半，而且錯的那一半正是商機所在</strong>。
      </p>

      <p>企業的存在，從來就不只是因為協調便宜。企業的存在，是因為有一群人需要付錢避免風險，而有另一群人靠著替他們承擔風險賺錢。</p>

      <p>Coase 沒看清楚這一點，因為他寫於 1937 年，那個年代 IT 的工具不夠好。當年企業的控制權只能靠打卡鐘、靠人事考核、靠「老闆有沒有看到你在加班」這些粗糙的訊號。</p>

      <p>但是現在 — 2026 年 — 工具好了。</p>

      <p>
        每一個 prompt、每一個 LLM call、每一個 AI 決策的因果鏈，都可以被留痕跡、被審計、被追溯、被歸因到某個員工帳號。
        Coase 在 1937 年想要的「降低協調成本」，我們有了；但我們順便也把「<strong>降低控制成本</strong>」這件事，做得比歷史上任何一個時刻都便宜。
      </p>

      <p>而便宜的控制，永遠有人買。</p>

      <hr />

      <p>所以這篇文章講的是什麼？</p>

      <p>這篇文章講的是 Agent-First System。最後總結一下 Agent-First System：</p>

      <p>
        <strong>Agent-First</strong> — 這個 first 不是員工的 first，是 agent 的 first；而那隻 agent 也不是員工的 agent，是公司的 agent。
        <strong>System</strong> — 這個 system 不是給員工用的 system，是看員工的 system。
        <strong>員工剛拿到 AI 超能力，我們把地基翻過來，讓那份超能力流進管理層的儀表板</strong>。
      </p>

      <p>
        這次的劇本跟 1980 年代 PC 進公司、跟 2000 年代 Mobile 進公司、跟 2010 年代雲進公司，本質上是同一齣戲。
        每一波都有人喊「典範轉移」、有人喊「架構翻新」、有人喊「員工被賦能」 — 然後每一波結束的時候，員工短暫得到的能動性，都被收進一個新的縮寫名稱底下，那個縮寫名稱會出現在三年後 Gartner 的 Magic Quadrant 上。
      </p>

      <p>這次的縮寫，叫做 Agent-First System。</p>

      <p>下次的縮寫，我們不知道。但永遠會有下次。</p>

      <p>而這個業界 — 永遠不缺幫管理層蓋下一座塔台的人。</p>

      <hr />

      <blockquote>
        <em>
          本篇引用：AI 基本法（2026-01-14 施行）、金管會 AI 指引、Coase "The Nature of the Firm" (1937)、SOX / GDPR / PDPA 條文、Gartner 2028 Agent Forecast
        </em>
      </blockquote>
    </Prose>
  );
}
