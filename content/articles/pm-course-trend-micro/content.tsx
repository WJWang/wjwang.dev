import {
  Prose,
  Callout,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <h2>專案開始之前</h2>

      <h3>1. 業務跟客戶的接洽</h3>
      <p>
        業務在接洽客戶的時候所接觸的人必然是最多的，但真正會發案走下去的大多也只會有 2 成會是真正簽約的，業務的工作內容就是在被授權的範圍內拿到這張單、簽約。
      </p>

      <h3>2. Sales Engineer</h3>
      <p>
        當業務並不清楚其自己的允許授權範圍，或是報價的底線時，必須要有內部的教育訓練讓業務有一定的概念，或是衍伸出另一種身份「Sales Engineer（SE）」。
      </p>
      <p>
        Sales Engineer 多數出現在科技公司，通常是在業務無法在專案功能報價上獨立報價、或是提供客戶保證或支票，往往需要跟技術人員確認後才能提供客戶回應的情形下才會出現的職務。
      </p>
      <p>
        Sales Engineer 過去必須有一段時間是「工程師」，雖然不一定是頂尖的工程師或是好的工程師，但必須要有「工程師的思維」，面對客戶需求，要知道在實務的技術面上能不能夠有解決方案、或是解決的難易程度，取決於工作經驗的累積，成為業務與工程師二者之間溝通的管道。
      </p>
      <p>
        工作目標為降低工程師與業務及業務與客戶之間的溝通成本，讓業務能順利的在簽下單同時可以有合理的技術資源與報酬來完成簽約當下所擔保客戶的需求。
      </p>

      <h3>3. 需求訪談</h3>
      <p>
        詢問執行內容，確認客戶的需求，進行各種文件、需求確認，某種程度上來說，必須將需求訪談也視為一個 Project，必須由 SE, Sales 共同完成。
      </p>

      <h2>專案開始初期</h2>

      <p>
        PM（Project Manager）的進場，必須先定位清楚在專案中每一個人的角色，進行溝通與協調的任務。而每一個 PM 心中所需謹記的，是每一個 Project 的「目的」、「目標」，必須是整個 team 中，最為清楚當下進度，且保持專注在「完成目標」這個任務上的人。
      </p>

      <p><strong>KickOff (Initial) Meeting：</strong></p>
      <ul>
        <li>目標：如何 co-work</li>
        <li>會議時間：15 min — 1 hr</li>
        <li>決定專案所使用的技術：Git、Slack… 包含專案版本控制工具、溝通工具、專案管理工具…等</li>
        <li>估算專案所需的工時：通常一個人的工作時間的六成會是對於這個專案的執行時間（不包含 survey 問題的解決方式或學習等等）</li>
        <li>將問題分解 (Breakdown)：將需求、功能架構化後進行分工，分配任務給團隊成員，並排定時程</li>
        <li>執行計畫：包含「user story」、「project purpose」、「對於任務的認知程度一致化，哪些完成哪些未完成」</li>
        <li>與團隊成員達成「任務交付」共識：定義產出完畢的定義，每個團隊在每個專案對功能上之正式「產出完畢」的定義皆不同，在會議中應先論定是於「哪個階段」會進行驗收，在程式碼產出及測試後才能算是「產出完畢」</li>
        <li>程式撰寫完成 → Unit Test（單元測試）→ Build Success → Git Branch Commit → QA 通過 → 專案負責人通過 → 客戶通過</li>
        <li>開始繪製 Burndown Chart</li>
      </ul>

      <h2>專案執行期</h2>

      <h3>PM 與時間的控制</h3>
      <p>每日必須控制專案在執行正確的事情與正確的時辰 Control Right Thing and Time (Each Time / Day)</p>

      <h3>Standup Meeting（15~30 mins，每日）</h3>
      <ul>
        <li>會議重點：在最短時間內瞭解專案團隊的實情及專案狀況</li>
        <li>
          <strong>Only Three Questions：</strong>
          <ol>
            <li>Done：團隊各自完成了什麼？</li>
            <li>Next：團隊各自完成手上進度後，下一步會做什麼？</li>
            <li>Obstacle：團隊中是否有遇上困難？</li>
          </ol>
        </li>
      </ul>

      <p><strong>Stand-up Meeting 結束後</strong></p>
      <ul>
        <li>組員們應繼續進行專案開發</li>
        <li>
          PM 則是接續問題處理：
          <ol>
            <li>若有不當的 Next 產生（如未按照排定順序開發、應完成部分尚未完成卻抽身去另一專案）則 PM 須獨立向該組員洽談，並修正組員之工作順序</li>
            <li>若有 Obstacle 產生，需判定此 obstacle 是否要解決？如何解決？</li>
          </ol>
        </li>
      </ul>

      <Callout variant="warn">
        絕對不要在 Stand-up Meeting 或是這個階段追究責任未完成的問題。
      </Callout>

      <h2>專案完成 / 專案階段性完成</h2>

      <h3>Retrospective Meeting</h3>
      <ol>
        <li>提出問題，追究責任歸屬</li>
        <li>決定人員是否適任接續下一個任務</li>
        <li>決定該專案是否該繼續執行</li>
      </ol>

      <h2>其他議題</h2>
      <ol>
        <li>專案型態是否適宜現在的管理方法 (Project Type)</li>
        <li>專案規模是否適宜現在的管理方法 (Project Scope 3–15 人)</li>
      </ol>

      <p>原文發表於 <a href="https://wjwang.medium.com/a-project-manager-course-at-trend-micro-28c7977c756a">Medium</a></p>
    </Prose>
  );
}
