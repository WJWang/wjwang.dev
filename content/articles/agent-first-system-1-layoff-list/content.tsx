import { Prose, Quote } from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <p>Agent-First System 真正的核心，跟所有業界 buzzword 一樣，可以一句話講完：</p>

      <blockquote>
        <strong>過去五十年的系統，都是給人類用的。接下來十年的系統，是給 agent 用的。</strong>
      </blockquote>

      <p>這話聽起來很哲學，攤開來其實一點都不哲學。</p>

      <p>
        從 1968 年 Engelbart 用滑鼠演示開始，Macintosh、Web、Mobile、Touch — 過去五十年所有 UI 進化的本質，是工程師在做同一件事：
        <strong>替人類的肌肉、視網膜、跟注意力曲線，蓋服務廠房</strong>。
        你在 SaaS 上看到的每一個按鈕，背後都曾經坐著一個工程師在認真思考：「使用者的食指搆不搆得到這個位置」、「這顆按鈕的對比色差會不會刺眼」、「這個欄位放在第二行還是第三行，使用者比較願意填」。
        Don Norman 的《The Design of Everyday Things》、Apple 的 HIG、Google 的 Material Design — 全是同一個學科的不同版本：
        <strong>人類器官人體工學</strong>。
      </p>

      <p>
        工程師寫了五十年的程式，他們以為自己在寫軟體。原來不是。
        <strong>他們是在替使用者的食指、視網膜、注意力曲線，蓋一座極其精緻的服務廠房</strong>。
        Salesforce、SAP、Notion、Figma、整個 SaaS 生態 — 全部都是這座廠房的不同樓層。
      </p>

      <p>差別只是 — 使用者從 2025 年開始，就不太需要食指跟視網膜了。</p>

      <p>
        Agent-First System 翻過來的就是這件事。
        <strong>使用者從此變成 agent</strong>。
      </p>

      <p>
        agent 沒有眼睛、沒有手指、沒有注意力疲勞、沒有食指搆不到的位置。agent 一秒可以打開三百個 dashboard，但 agent 從來不看 dashboard 上的圖示。
        agent 直接讀 state、自己呼叫 tool、自己做 plan、自己留 trace。
      </p>

      <p>人類在這個新系統裡剩下一個位置 — 在 agent 已經把事情做完之後，按那個寫著「同意」的按鈕。</p>

      <p>過去五十年蓋的所有 UI、API、Schema — 一夜之間，原來都是替錯誤的客戶蓋的。</p>

      <hr />

      <p>
        聽起來真好聽。<strong>Agent-First</strong> 這幾個字打在投影片上的時候，前面通常還會配個從 stable diffusion 跑出來的小齒輪圖示，
        後面會緊跟著「典範轉移」、「architecture 翻新」、「下一個十年的地基」這幾個詞。
        所有 CIO 看到這個組合都會輕輕點頭，因為他們上禮拜剛在 Gartner 報告裡看過一模一樣的句子。
      </p>

      <p>
        而<strong>所有 CIO 點頭的事，都不是真理 — 只是行銷預算終於買到了該買的位置</strong>。
      </p>

      <hr />

      <p>但這齣戲的真正主角，從來不在投影片上。</p>

      <p>是員工。</p>

      <p>如果你是一家稍有規模的公司、稍有政治嗅覺的主管，最近幾個月你會發現一件事：員工自己會用 AI 了。</p>

      <p>
        員工會自己接 Claude、用 GPT、用 Gemini、自己跑 MCP server、自己在桌機底下偷偷架 local LLM 跑公司資料。
        一家三千人的金控，員工的 AI 工具清查表上會跑出十七種、二十種、三十種不同 model — 每一個都不在主管的批可流程上。
        員工會講「我覺得這樣比較有效率」；而主管 — 在這幾個月每一場對焦會議、每一份內部備忘、每一通打給顧問的電話上 — 講的都是同一句：
      </p>

      <Quote>
        最可怕的不是員工在用 — 是我<strong>完全不知道</strong>每一個 agent 動過哪些資料、做過什麼決策、繞過了我們的哪些 SOP。我覺得我的組織失控了。
      </Quote>

      <p>
        <strong>老闆們會講「失控」這兩個字的時候，從來不是真的失控</strong> — 公司沒倒、財報沒爆、客服沒人在哭、Slack 上也沒有同事人間蒸發。
        失控的意思是：員工現在會的東西老闆不會、員工做得到的事老闆插不進去、員工的能動性沒有經過老闆批可、沒走過 SSO 登入、也沒出現在月報的 KPI 表上。
      </p>

      <p>
        這種員工的腦袋，是違章建築 — 蓋得很好用、住得很爽、市政府查不到。這在管理學上不叫失控，叫<strong>勢力消長</strong>。
      </p>

      <p>
        員工那邊也很懂得替自己的能動性找命名。最近最熱的詞，叫做「<strong>AI 時代的一人公司</strong>」 —
        英文圈早就把它縮寫成 <strong>OPC（One Person Company）</strong>。
        新縮寫一誕生，就代表這個族群已經完成命名儀式、可以開始開大會、上《哈佛商業評論》、被 Gartner 排進 quadrant 了。
      </p>

      <p>
        論述的彈藥也已經備好。社群上的招牌動員口號是「下一個十年屬於一人公司的時代，已經徹底來了」、底下會配一張裝備清單告訴你 Claude 一個月二十美元、Supabase 免費、再加上幾隻 open source 的 agent — 傳統創業的遊戲規則「已經被砸得稀碎」；
        同一個族群裡也有人把整套 agent 系統二十四小時掛在自家客廳的 Mac mini 上，連 Telegram、連 Discord、跑 cron、開 sub-agent、自己讀寫 memory，一個人在沙發背後默默監督一隊不會請假、不會抱怨、也不會跟 HR 哭訴的 digital labor。底下永遠一片「這就是未來」。
      </p>

      <p>光是社群這一層，倒也還好 — 命名運動本來就需要群眾基底。真正棘手的是，這一波連業界頂層也親自下場背書。</p>

      <p>
        <strong>Andrej Karpathy</strong>（OpenAI 創始成員、Tesla 前 AI 總監那位）公開講過一句話：「我大概從十二月開始，就沒打過一行程式碼了。」
        翻譯一下，意思就是：以前我是世界級的 ML 工程師，現在我<strong>連工程師都不是了</strong> — 我是 agent 的甲方。
      </p>

      <p>
        <strong>Garry Tan</strong>（Y Combinator 的 CEO）不只認證 Karpathy，還親自開源一個叫 <strong>gstack</strong> 的 Claude Code 設定包當示範。
        截至發稿 66K stars、MIT license，二十三個 slash command 一字排開：你的 CEO、你的設計師、你的工程經理、你的 release manager、你的 QA、你的安全官、你的文件工程師 — 全部都是 markdown 檔案。
        Tan 順手附上自己的 metric 佐證 — 他 2026 年的 logical lines of code，是 2013 年的 <strong>810 倍</strong>（11,417 比 14），同時還在全職經營 YC。
      </p>

      <p>翻譯一下 — 全世界最有名的早期投資人，現在不寫程式；但他「不寫程式時的產出」，比他十年前認真寫程式的時候，還多 810 倍。</p>

      <p>
        這套敘事員工愛看。員工讀到的是 — 「我可以飛了」。
        你是 CEO、CTO、CMO、CFO，全是你自己；你的 daily standup 是你跟 ChatGPT 在通勤捷運上的對話；你的 OKR 是昨晚失眠時跟 Claude 排好的；你的離職面談是你跟你自己的深度檢討；你的尾牙抽獎是你自己跟自己猜拳。
      </p>

      <p>但同一篇文章，老闆也在看。老闆讀到的是 — 「原來這三十個員工，理論上一個人就能做完，那我現在每個月發薪水給這三十個是何苦」？</p>

      <p>同一份文章。員工看到的是降落傘，老闆看到的是 — 三十封還沒寄出的「感謝您過去的貢獻」資遣信。</p>

      <p>
        員工焦慮自己跟不上 AI、老闆焦慮自己壓不住員工。中間賣治理工具的人 — 跟 2000 年的 Y2K 顧問、2018 年的 GDPR 律師、2020 年的雲端遷移顧問，是同一批人。
        <strong>哪裡有焦慮，哪裡就有 invoice。</strong>
      </p>

      <p>而勢力消長，是這個業界永恆的搖錢樹。</p>

      <hr />

      <p>這個劇本，業界已經演過五十年了。</p>

      <p>每一次員工掌握新工具，這個業界都有同一批人，把員工的能動性重新打包、命名、分級、管控，然後用一個聽起來很酷的縮寫名稱賣回給管理層：</p>

      <ul>
        <li>
          1980 年代叫 <strong>Active Directory</strong> — 員工從此被分類成 user，每個 user 配一個 password。
        </li>
        <li>
          1990 年代叫 <strong>Group Policy</strong> — 員工的 desktop 從此屬於 IT 部門。
        </li>
        <li>
          2000 年代叫 <strong>MDM</strong> — 你的手機加入公司之後就不再是你的。
        </li>
        <li>
          2010 年代加上 <strong>SSO 跟 IAM</strong> — 你所有應用程式被串在同一條繩子上。
        </li>
        <li>
          2015 年加上 <strong>DLP</strong> — 你 Ctrl+C 都會留痕跡。
        </li>
        <li>
          2020 年代加上 <strong>ZTNA</strong> — 連「信任公司」的權利都被收回去了。
        </li>
      </ul>

      <p>每一個縮寫都是工程師畢生的飯碗，也每一個都是員工自由的訃聞。</p>

      <p>
        而 2026 年這一波的縮寫，叫做 <strong>Agent-First System</strong>。
      </p>

      <hr />

      <p>
        這個 buzzword 的技術內裡，跟它真正的功能 — 怎麼把員工剛拿到的 AI 超能力一道一道收回去 — 那些設計題每一條都得攤開來細部展開，這篇先不講。
      </p>

      <p>這篇先收住的，是那個你已經看到的事實：</p>

      <p>
        <strong>業界從來就沒有所謂的新議題，只有新名字。</strong>
      </p>

      <p>
        下次你在 RFP 上看到一個閃亮的縮寫 — 先別急著驚訝這個 paradigm 多前衛。回頭看看 1980 年代到今天那串名單，問自己：這個東西跟前面六十年的縮寫，本質上是不是同一件事、只是換了個名字而已？
      </p>

      <p>通常都是。</p>

      <p>而你的公司 IT 預算，會繼續為這個「通常都是」付錢，從現在到下下個十年。</p>

      <hr />

      <blockquote>
        <em>
          本篇引用：Engelbart (1968) "Mother of All Demos"、Don Norman《The Design of Everyday Things》、Apple HIG、Google Material Design、Andrej Karpathy 公開發言、Garry Tan《gstack》(github.com/garrytan/gstack)
        </em>
      </blockquote>
    </Prose>
  );
}
