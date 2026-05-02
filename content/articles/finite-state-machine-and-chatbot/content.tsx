import {
  Prose,
  Aside,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <h2>初期的 Chatbot 開發經驗</h2>

      <p>作者的早期 chatbot 開發經驗主要集中在簡單的指令式機器人，例如：</p>
      <ol>
        <li>用戶輸入指令查詢資料庫並直接回應</li>
        <li>根據指令生成報表並提供下載連結</li>
      </ol>

      <p>
        這類機器人邏輯簡單，開發快速。後來他想將家務事務（如記帳、寵物健康追蹤、行事曆）自動化，但發現 Slack 不適合普通家庭用戶，改採 Line bot 和 Messenger bot。
      </p>

      <h2>遇到的問題：複雜的對話流程</h2>

      <p>實現 Messenger Bot 後，面臨兩個主要挑戰：</p>

      <p>
        <strong>多用戶並發問題</strong>：當多個用戶同時與機器人互動時，無法追蹤每個用戶的對話狀態。
      </p>

      <blockquote>
        <p>Bot 無可避免的會面臨同時有多個 User 與他對話的狀況</p>
      </blockquote>

      <p>
        <strong>單一用戶的連續對話問題</strong>：記帳流程需要多步驟確認（選擇支出/收入 → 輸入項目名稱 → 輸入金額 → 確認），機器人需要記住用戶在流程中的位置。
      </p>

      <h2>解決方案：狀態管理</h2>

      <p>
        通過在伺服器端記錄 <code>userId</code> 和對話狀態（採用 session 概念），機器人可以：
      </p>
      <ul>
        <li>區分不同用戶</li>
        <li>根據當前狀態和用戶輸入決定回應</li>
        <li>驗證輸入是否符合當前狀態的預期</li>
      </ul>

      <h2>Finite State Machine (FSM) 的應用</h2>

      <p>
        隨著流程複雜度增加，作者採用 FSM 來建模對話流程。FSM 是自動機理論中的數學模型，「用於描述有限狀態及這些狀態交互轉移及行為」。
      </p>

      <p>關鍵概念：</p>
      <ul>
        <li><strong>狀態 (State)</strong>：機器人所處的條件（如「等待輸入記帳類型」）</li>
        <li><strong>轉移 (Transition)</strong>：狀態之間的變化條件</li>
        <li>使用狀態圖或狀態轉移表表示</li>
      </ul>

      <h2>實現技術</h2>

      <Aside title="使用工具">
        Node.js 搭配 <code>javascript-state-machine</code> 函式庫實現 FSM。
      </Aside>

      <p>
        作者使用 Node.js 和 <code>javascript-state-machine</code> 函式庫實現 FSM，為每個狀態定義相應的處理器，並設定狀態轉移條件，簡化複雜的對話邏輯。
      </p>

      <p>原文發表於 <a href="https://wjwang.medium.com/finite-state-machine-%E8%88%87-chatbot-%E9%96%8B%E7%99%BC-ddce9a9666f7">Medium</a></p>
    </Prose>
  );
}
