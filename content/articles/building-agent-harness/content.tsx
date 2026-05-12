import {
  Prose,
  CodeBlock,
  ImageFigure,
  Quote,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <p>
        像 Claude Code、Cursor、Codex CLI、Pi、Tau 這類工具，常見的稱呼是 Agent Client，但更準確的技術名稱是 <strong>Agent Harness</strong>——包覆 LLM 推理 loop 的 runtime orchestration layer，負責協調 tool 執行、context 管理、安全強制、與 session 持續性。本文整理對這一層架構的理解，分兩部分：前半是概念解析——架構分了幾層、訊息流怎麼跑、五個核心元件各自負責什麼；後半是實作指南——一份可以直接 copy 下來跑的 Python，幫助讀者把概念對應到程式碼。
      </p>

      <h2>Agent Client 與 Agent Harness</h2>

      <p>兩個命名的差異在心理模型：</p>

      <ul>
        <li><strong>Agent Client</strong>：強調對 LLM API 的呼叫——「發 request、收 response」，類似 HTTP client。</li>
        <li><strong>Agent Harness</strong>：強調 runtime——「把模型放進一個 control loop，協調它跟外界（檔案系統、shell、tool、使用者）互動」。</li>
      </ul>

      <p>
        Anthropic、Glean、Addy Osmani 等多家的技術文章近年都採用 Agent Harness 一詞，因為它更貼近實際的工程內容。本文以下統一使用此命名。
      </p>

      <h2>五層架構</h2>

      <p>以 Claude Code 為標竿，Agent Harness 可以拆成五層：</p>

      <ImageFigure
        src="/articles/building-agent-harness/assets/01-five-layer-architecture.svg"
        alt="Agent Harness 五層架構：User Interaction、Agent Core Scheduling、Context Engineering、Tool & Permission、Integration"
        caption="圖一：Agent Harness 的五層架構"
        maxWidth="800px"
      />

      <p>各層職責：</p>

      <ul>
        <li><strong>Layer 5 User Interaction</strong>：CLI、IDE 插件、桌面 / Web UI，以及 streaming、diff、TODO list、progress 等渲染。</li>
        <li><strong>Layer 4 Agent Core Scheduling</strong>：master loop、message queue、TODO planner、sub-agent dispatcher。</li>
        <li><strong>Layer 3 Context Engineering</strong>：system reminders、prompt composer、memory（跨 session）、context compaction。</li>
        <li><strong>Layer 2 Tool & Permission</strong>：permission gate、tool registry、tool executor。</li>
        <li><strong>Layer 1 Integration</strong>：LLM provider、MCP servers、檔案系統、git、shell、lifecycle hooks。</li>
      </ul>

      <p>值得注意的是：AI 模型本身只出現在 Layer 1 與 Layer 4 各一個節點——其餘都是傳統 runtime 工程。</p>

      <h2>Agent Loop 的本質</h2>

      <p>Layer 4 的 master loop 是整個系統的核心，本質是一個 while 迴圈。完整邏輯如下：</p>

      <ImageFigure
        src="/articles/building-agent-harness/assets/02-agent-loop.svg"
        alt="Agent Loop 六步：接收 prompt、組裝 context、呼叫 LLM、解析回應、permission gate、執行 tool、加回 message array、回到步驟 3"
        caption="圖二：Agent Loop 的六個步驟"
      />

      <p>六個步驟、四種終止條件：</p>

      <ol>
        <li>assistant 產出沒有 tool call 的純文字訊息</li>
        <li>達到 max_turns 限制</li>
        <li>達到 token budget 上限</li>
        <li>使用者中斷（Ctrl+C）</li>
      </ol>

      <p>
        整個 loop 唯一的狀態是一個 message array——沒有顯式狀態機、沒有 workflow graph。這個設計選擇來自 Anthropic 在〈Building Effective Agents〉一文的觀察：
      </p>

      <Quote author="Anthropic" source="Building Effective Agents">
        過去一年我們跟數十個建 LLM agent 的團隊合作，最成功的實作不是用複雜框架，而是用簡單、可組合的模式。
      </Quote>

      <p>實務上的建議是：先用 LLM API 直接寫，幾十行就能跑通；等完全理解底層後再評估是否引入 LangChain、LlamaIndex 等框架。</p>

      <h2>單一 Turn 的訊息流</h2>

      <p>把上面的步驟 4-5 放大來看，是一個 response 進來、permission gate 判斷、tool 執行、結果回 loop 的子流程：</p>

      <ImageFigure
        src="/articles/building-agent-harness/assets/03-message-flow.svg"
        alt="單一 turn 訊息流：User Input、Context Assembly、LLM API Call、Response Parse、Permission Gate 三分支（ALLOW/PROMPT/DENY）、Append result"
        caption="圖三：單一 turn 內部的訊息流，特別是 permission gate 的 ALLOW / PROMPT / DENY 三條分支"
      />

      <p>
        Permission Gate 有三個出口：ALLOW（直接執行）、PROMPT（問使用者）、DENY（拒絕並把錯誤訊息加回 context）。production 等級的 harness 跟 demo 等級的差別，很大一部份就在這三條分支的細節：哪些 tool 在哪些情境自動放行、哪些要詢問、哪些直接擋下。
      </p>

      <h2>五個核心元件</h2>

      <p>下面依序拆解 Tool System、Permission Gate、Context Management、Sub-agent、Memory + Hooks 五個元件。</p>

      <h3>1. Tool System</h3>

      <p>Tools 讓 agent 從「只會輸出文字」變成「能執行動作」。Claude Code 內建的 tool 大致分五類：</p>

      <table>
        <thead>
          <tr>
            <th>類別</th>
            <th>範例</th>
            <th>安全等級</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>檔案讀取</td><td><code>read_file</code>, <code>glob</code>, <code>grep</code></td><td>ReadOnly</td></tr>
          <tr><td>檔案寫入</td><td><code>write_file</code>, <code>edit</code></td><td>WorkspaceWrite</td></tr>
          <tr><td>執行</td><td><code>bash</code>, <code>run_command</code></td><td>Dangerous</td></tr>
          <tr><td>網路</td><td><code>web_search</code>, <code>web_fetch</code></td><td>ReadOnly</td></tr>
          <tr><td>委派</td><td><code>dispatch_agent</code></td><td>Special</td></tr>
        </tbody>
      </table>

      <p>
        設計上的關鍵：<strong>LLM 是根據 tool 的 description 來決定要呼叫哪一個</strong>。所以 tool 的命名、description、input schema 的清晰程度，比整體 prompt 的微調更重要。Anthropic 團隊提到他們花在優化 tool 定義上的時間，比花在整體 system prompt 上還多。
      </p>

      <p>Tool 在程式碼裡的長相是一個 list of dict：</p>

      <CodeBlock language="python">{`TOOLS = [
    {
        "name": "read_file",
        "description": "Read the contents of a file",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path"}
            },
            "required": ["path"]
        },
        "_safety": "read_only"
    },
    {
        "name": "bash",
        "description": "Execute a bash command",
        "input_schema": {
            "type": "object",
            "properties": {
                "command": {"type": "string"}
            },
            "required": ["command"]
        },
        "_safety": "dangerous"
    },
    # ... write_file, list_files, dispatch_agent ...
]`}</CodeBlock>

      <p>Tool 設計的五條原則：</p>

      <ul>
        <li>單一明確職責（10 個精準 tool 通常勝過 30 個寬泛 tool）</li>
        <li>嚴格的 input schema</li>
        <li>給 LLM 看的 description 要清楚</li>
        <li>修改狀態的 tool 加上 confirmation step</li>
        <li>標記 <code>read_only</code> / <code>destructive</code> flag，讓 permission system 自動 routing</li>
      </ul>

      <h3>2. Permission Gate</h3>

      <p>Permission system 是 production-grade harness 跟玩具的最大差別。五個權限等級：</p>

      <CodeBlock language="text">{`ReadOnly         ──►  讀檔、查詢、搜尋（自動允許）
WorkspaceWrite   ──►  在 workspace 內寫檔（可設定自動）
DangerFullAccess ──►  全系統存取（需明確授權）
Prompt           ──►  每次都詢問使用者
Allow            ──►  使用者已預先批准`}</CodeBlock>

      <p>核心判斷邏輯：</p>

      <CodeBlock language="python">{`if current_level >= required_level:
    allow()
elif one_level_gap:
    ask_user()
else:
    deny()`}</CodeBlock>

      <p>
        設計上的關鍵原則：<strong>permission system 在架構上必須跟 tool 執行分開</strong>，不能寫成 tool 內的 feature flag。理由是當 tool 數量成長之後，feature flag 的方式很容易在某個 tool 漏掉檢查——而一個漏掉檢查的 destructive tool 就是 production incident 的來源。把 permission gate 當成 tool 執行前的強制 invariant，可以避免這類錯誤蔓延。
      </p>

      <h3>3. Context Management</h3>

      <p><strong>Context Rot</strong>：模型隨著 context window 填滿，推理能力會下降。因此 context 不是免費資源，必須主動管理。</p>

      <p>五種主要策略：</p>

      <table>
        <thead>
          <tr>
            <th>策略</th>
            <th>觸發時機</th>
            <th>做法</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Compaction</td><td>~92% context 使用率</td><td>LLM 摘要舊對話，保留最近 N tokens</td></tr>
          <tr><td>Tool-call offloading</td><td>大 tool output（如 2000 行 log）</td><td>存到檔案，context 裡只放摘要與檔案路徑</td></tr>
          <tr><td>Sub-agent isolation</td><td>廣泛搜尋 / 探索性任務</td><td>開新 context window，回傳結果即丟棄</td></tr>
          <tr><td>File-based memory</td><td>跨 session</td><td>寫入 <code>CLAUDE.md</code> / <code>AGENTS.md</code></td></tr>
          <tr><td>Search-first skills</td><td>Skill 數量多</td><td>索引化檢索，只在需要時 hydrate schema</td></tr>
        </tbody>
      </table>

      <p>建議從第一天就把 compaction 內建到系統，不要等到 context 爆炸才補。預設 threshold 落在 85%–92% 是常見的選擇。</p>

      <h3>4. Sub-agent</h3>

      <p>對於需要探索或廣泛搜尋的任務，主 agent 可以派出 sub-agent。三個關鍵限制：</p>

      <ul>
        <li>Sub-agent 不能再生自己的 sub-agent（避免遞迴爆炸）</li>
        <li>每個 sub-agent 有獨立的 context window</li>
        <li>結果像普通 tool output 一樣回到主 loop</li>
      </ul>

      <p>「不能再生 sub-agent」這條是有意識的設計選擇：限制 dispatch 的深度為 1，可以確保資源使用上界可預測，並避免任務樹失控。</p>

      <h3>5. Memory 與 Hooks</h3>

      <p>
        <strong>Memory</strong>：Claude Code 使用 <code>CLAUDE.md</code>，OpenAI Codex 使用 <code>AGENTS.md</code>。設計上採用「檔案系統就是記憶」的取向，優點是：
      </p>

      <ul>
        <li>使用者可以直接讀、編、版本控</li>
        <li>模型可以透過既有的 <code>read_file</code> / <code>write_file</code> tool 自然讀寫</li>
        <li>不需要額外的 vector DB 或 embedding pipeline</li>
      </ul>

      <p><strong>Hooks</strong>：lifecycle hook 是企業整合介面，提供五個常見掛載點：</p>

      <CodeBlock language="text">{`PreToolUse      ──► 攔截 tool 呼叫、加 policy check
PostToolUse     ──► 記錄 audit log
PreCompaction   ──► 在壓縮前 flush 狀態到檔案
SessionStart    ──► 載入專案特定設定
SessionEnd      ──► 寫入摘要、計算 cost`}</CodeBlock>

      <p>audit log、policy enforcement、cost tracking、合規通報等需求，通常都掛在這幾個 hook 點。</p>

      <h2>實作指南：一份可運行的 Minimal Agent Harness</h2>

      <p>下面是一份可以直接 copy 下來跑的 minimal harness，Python 實作，幫助讀者把上面的概念對應到程式碼。</p>

      <h3>安裝相依</h3>

      <CodeBlock language="bash">{`pip install anthropic
export ANTHROPIC_API_KEY="your-key-here"`}</CodeBlock>

      <h3>Tool 定義</h3>

      <CodeBlock language="python">{`"""
Minimal Agent Harness - 一個可運行的 agent harness
展示了 agent loop、tool system、permission gate、context 管理的核心概念
"""

import json
import os
import subprocess
from pathlib import Path
from anthropic import Anthropic

TOOLS = [
    {
        "name": "read_file",
        "description": "Read the contents of a file",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path"}
            },
            "required": ["path"]
        },
        "_safety": "read_only"
    },
    {
        "name": "write_file",
        "description": "Write content to a file (creates or overwrites)",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string"},
                "content": {"type": "string"}
            },
            "required": ["path", "content"]
        },
        "_safety": "workspace_write"
    },
    {
        "name": "bash",
        "description": "Execute a bash command",
        "input_schema": {
            "type": "object",
            "properties": {
                "command": {"type": "string"}
            },
            "required": ["command"]
        },
        "_safety": "dangerous"
    },
    {
        "name": "list_files",
        "description": "List files in a directory",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "default": "."}
            }
        },
        "_safety": "read_only"
    }
]`}</CodeBlock>

      <p><code>_safety</code> 是自訂欄位（給 permission gate 用），Anthropic API 不接受，後面送 API 時會剝掉。</p>

      <h3>ToolExecutor</h3>

      <CodeBlock language="python">{`class ToolExecutor:
    def __init__(self, workspace: Path):
        self.workspace = workspace.resolve()

    def _check_in_workspace(self, path: str) -> Path:
        """確保路徑在 workspace 內，防止 path traversal 攻擊"""
        full_path = (self.workspace / path).resolve()
        if not str(full_path).startswith(str(self.workspace)):
            raise ValueError(f"Path {path} is outside workspace")
        return full_path

    def execute(self, tool_name: str, tool_input: dict) -> str:
        try:
            if tool_name == "read_file":
                path = self._check_in_workspace(tool_input["path"])
                return path.read_text()

            elif tool_name == "write_file":
                path = self._check_in_workspace(tool_input["path"])
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(tool_input["content"])
                return f"Wrote {len(tool_input['content'])} bytes to {path}"

            elif tool_name == "bash":
                result = subprocess.run(
                    tool_input["command"],
                    shell=True,
                    capture_output=True,
                    text=True,
                    cwd=self.workspace,
                    timeout=30
                )
                output = result.stdout + result.stderr
                # 截斷大 output（避免 context 爆炸）
                if len(output) > 5000:
                    output = output[:5000] + "\\n... [truncated]"
                return output

            elif tool_name == "list_files":
                path = self._check_in_workspace(tool_input.get("path", "."))
                return "\\n".join(str(p.relative_to(self.workspace))
                                 for p in path.iterdir())
            else:
                return f"Unknown tool: {tool_name}"

        except Exception as e:
            return f"Error: {type(e).__name__}: {e}"`}</CodeBlock>

      <p><code>_check_in_workspace</code> 防 path traversal、bash 有 30 秒 timeout、output 超過 5000 chars 截斷。這些邊界檢查不大、但少了就是 production incident。</p>

      <h3>PermissionGate</h3>

      <CodeBlock language="python">{`class PermissionGate:
    def __init__(self, mode: str = "ask"):
        # mode: "auto" (read_only auto-allow), "ask" (always prompt), "yolo" (allow all)
        self.mode = mode
        self.approved_tools = set()

    def check(self, tool_name: str, tool_input: dict, safety: str) -> bool:
        if self.mode == "yolo":
            return True

        if safety == "read_only" and self.mode == "auto":
            return True

        if tool_name in self.approved_tools:
            return True

        # Ask user
        print(f"\\n🔒 Tool request: {tool_name}({json.dumps(tool_input)})")
        print(f"   Safety level: {safety}")
        choice = input("   Allow? [y/n/a (always allow this tool)]: ").strip().lower()

        if choice == "a":
            self.approved_tools.add(tool_name)
            return True
        return choice == "y"`}</CodeBlock>

      <p>三種 mode：<code>auto</code>（read-only 自動放行、其他詢問）、<code>ask</code>（一律詢問）、<code>yolo</code>（全部放行，僅用於 toy / demo 場景）。<code>approved_tools</code> set 記住「永遠允許這個 tool」的選擇，避免每次都問。</p>

      <h3>ContextManager</h3>

      <CodeBlock language="python">{`class ContextManager:
    def __init__(self, client: Anthropic, max_tokens: int = 100_000):
        self.client = client
        self.max_tokens = max_tokens
        self.threshold = int(max_tokens * 0.85)  # 85% 觸發壓縮

    def estimate_tokens(self, messages: list) -> int:
        """粗略估算 token 數（實際應用 tokenizer）"""
        text = json.dumps(messages)
        return len(text) // 4  # 約 4 chars per token

    def maybe_compact(self, messages: list, system: str) -> list:
        """超過 threshold 就壓縮"""
        if self.estimate_tokens(messages) < self.threshold:
            return messages

        print("\\n📦 Compacting context...")

        # 保留最近 5 個訊息，壓縮其餘
        recent = messages[-5:]
        to_compact = messages[:-5]

        if not to_compact:
            return messages

        summary_prompt = (
            "Summarize the following conversation history concisely, "
            "preserving key decisions, file paths, and intermediate results:\\n\\n"
            + json.dumps(to_compact, ensure_ascii=False)
        )

        response = self.client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=2000,
            messages=[{"role": "user", "content": summary_prompt}]
        )

        summary = response.content[0].text
        return [
            {"role": "user", "content": f"[Previous conversation summary]\\n{summary}"}
        ] + recent`}</CodeBlock>

      <p>簡化版的 compaction：超過 85% 就用一個便宜的 model（Haiku）摘要前面的訊息，保留最近 5 則。production 實作通常還會處理 tool_use / tool_result 配對、避免半段被切掉造成 API error，這裡為了簡潔省略。</p>

      <h3>AgentClient（主 loop）</h3>

      <CodeBlock language="python">{`class AgentClient:
    def __init__(self, workspace: str = ".", permission_mode: str = "auto"):
        self.client = Anthropic()
        self.workspace = Path(workspace)
        self.executor = ToolExecutor(self.workspace)
        self.permission = PermissionGate(mode=permission_mode)
        self.context_mgr = ContextManager(self.client)
        self.messages = []
        self.system_prompt = self._build_system_prompt()

    def _build_system_prompt(self) -> str:
        base = (
            "You are a helpful coding agent running in a terminal. "
            "Use the available tools to accomplish the user's tasks. "
            "Be concise. When done, respond with plain text (no tool calls)."
        )
        memory_file = self.workspace / "CLAUDE.md"
        if memory_file.exists():
            base += f"\\n\\n# Project Memory (from CLAUDE.md)\\n{memory_file.read_text()}"
        return base

    def _tools_for_api(self) -> list:
        """剝掉 _safety 欄位，因為 Anthropic API 不接受"""
        return [
            {k: v for k, v in tool.items() if not k.startswith("_")}
            for tool in TOOLS
        ]

    def _get_tool_safety(self, name: str) -> str:
        for t in TOOLS:
            if t["name"] == name:
                return t.get("_safety", "dangerous")
        return "dangerous"

    def run(self, user_prompt: str, max_turns: int = 20):
        """主 agent loop"""
        self.messages.append({"role": "user", "content": user_prompt})

        for turn in range(max_turns):
            # 1. Compact if needed
            self.messages = self.context_mgr.maybe_compact(
                self.messages, self.system_prompt
            )

            # 2. Call LLM
            response = self.client.messages.create(
                model="claude-sonnet-4-5",
                max_tokens=4096,
                system=self.system_prompt,
                tools=self._tools_for_api(),
                messages=self.messages
            )

            # 3. Add assistant message to history
            self.messages.append({
                "role": "assistant",
                "content": response.content
            })

            # 4. Check stop reason
            if response.stop_reason == "end_turn":
                for block in response.content:
                    if hasattr(block, "text"):
                        print(f"\\n🤖 {block.text}")
                return

            # 5. Process tool calls
            if response.stop_reason == "tool_use":
                tool_results = []
                for block in response.content:
                    if hasattr(block, "text") and block.text:
                        print(f"\\n💭 {block.text}")

                    if block.type == "tool_use":
                        safety = self._get_tool_safety(block.name)

                        allowed = self.permission.check(
                            block.name, block.input, safety
                        )

                        if not allowed:
                            result = "User denied this tool call."
                        else:
                            print(f"\\n🔧 {block.name}({json.dumps(block.input)[:80]}...)")
                            result = self.executor.execute(block.name, block.input)
                            print(f"   ↳ {result[:200]}...")

                        tool_results.append({
                            "type": "tool_result",
                            "tool_use_id": block.id,
                            "content": result
                        })

                self.messages.append({
                    "role": "user",
                    "content": tool_results
                })

        print(f"\\n⚠️  Reached max_turns ({max_turns}). Stopping.")`}</CodeBlock>

      <p><code>run()</code> 是整個 harness 的核心——三十行不到，對應前面圖二裡的六個步驟。如果讀者只想記一件事，就是這段 for loop 的形狀：呼叫 LLM → 解析 → 視情況執行 tool → 把結果加回 messages → 再呼叫。</p>

      <h3>CLI 入口</h3>

      <CodeBlock language="python">{`def main():
    print("🚀 Mini Agent Client (type 'exit' to quit)")
    print(f"   Workspace: {os.getcwd()}")
    print(f"   Permission mode: auto (read_only auto-allow, others ask)\\n")

    agent = AgentClient(workspace=".", permission_mode="auto")

    while True:
        try:
            user_input = input("\\n👤 You: ").strip()
            if not user_input or user_input.lower() in ("exit", "quit"):
                break
            agent.run(user_input)
        except KeyboardInterrupt:
            print("\\n\\n👋 Interrupted. Bye!")
            break

if __name__ == "__main__":
    main()`}</CodeBlock>

      <h3>跑起來測試</h3>

      <CodeBlock language="bash">{`mkdir agent-test && cd agent-test
echo "# My Project" > README.md
python agent.py

# 試試這些 prompt：
# - "What files are in this directory?"
# - "Create a hello.py that prints 'Hello, Agent World!'"
# - "Run the hello.py and show me the output"
# - "Refactor hello.py to accept a name argument"`}</CodeBlock>

      <h2>進階：Sub-agent 與 MCP</h2>

      <h3>Sub-agent</h3>

      <p>在 <code>TOOLS</code> 加上 <code>dispatch_agent</code>、在 <code>ToolExecutor</code> 加一個對應的 dispatch 方法：</p>

      <CodeBlock language="python">{`# 在 TOOLS 加上 dispatch_agent
{
    "name": "dispatch_agent",
    "description": (
        "Dispatch a sub-agent to handle a focused sub-task in an isolated "
        "context window. Use for broad searches or exploring alternatives. "
        "The sub-agent returns a final report; its conversation is discarded."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "task": {"type": "string", "description": "Detailed task description"}
        },
        "required": ["task"]
    },
    "_safety": "read_only"
}

# 在 ToolExecutor 加上對應處理
def _dispatch_sub_agent(self, task: str) -> str:
    """開一個新的 agent，限制只能用 read-only tool"""
    sub_agent = AgentClient(
        workspace=str(self.workspace),
        permission_mode="auto"
    )
    sub_agent._allowed_tools = [
        t["name"] for t in TOOLS if t.get("_safety") == "read_only"
    ]
    sub_agent.run(task, max_turns=10)

    for msg in reversed(sub_agent.messages):
        if msg["role"] == "assistant":
            for block in msg["content"]:
                if hasattr(block, "text"):
                    return f"Sub-agent report:\\n{block.text}"
    return "Sub-agent finished with no report."`}</CodeBlock>

      <h3>MCP 整合</h3>

      <p>用官方 MCP SDK 連到 MCP server，把它提供的 tool list 併入 agent 的 <code>TOOLS</code>：</p>

      <CodeBlock language="python">{`from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

class MCPIntegration:
    def __init__(self, server_command: list):
        self.params = StdioServerParameters(
            command=server_command[0],
            args=server_command[1:]
        )

    async def list_tools(self) -> list:
        """從 MCP server 拿到 tool list，併入 agent 的 TOOLS"""
        async with stdio_client(self.params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                tools = await session.list_tools()
                return [
                    {
                        "name": f"mcp__{t.name}",
                        "description": t.description,
                        "input_schema": t.inputSchema,
                        "_safety": "ask"  # 預設詢問
                    }
                    for t in tools.tools
                ]`}</CodeBlock>

      <p>MCP 是 Anthropic 推的 tool 互通協議。寫好一次的 MCP server，可以同時被 Claude Code、Cursor、Codex CLI 等多個 harness 共用，這也是它生態快速擴張的主因。</p>

      <h2>三種設計哲學</h2>

      <p>不同 harness 對「該幫使用者做多少事」採取不同立場：</p>

      <table>
        <thead>
          <tr>
            <th>維度</th>
            <th>Claude Code</th>
            <th>Pi</th>
            <th>Glean Harness</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>定位</td><td>Opinionated 全套件</td><td>Minimal 可駭客</td><td>Enterprise multi-agent</td></tr>
          <tr><td>System prompt</td><td>~10k+ tokens</td><td>&lt;1k tokens</td><td>中等</td></tr>
          <tr><td>Tool 套件</td><td>內建完整</td><td>最少必要</td><td>企業整合導向</td></tr>
          <tr><td>Context 策略</td><td>自動 compaction</td><td>使用者主控</td><td>PTC + sub-agent + compaction</td></tr>
          <tr><td>適合對象</td><td>一般開發者</td><td>Power user</td><td>企業客戶</td></tr>
          <tr><td>擴展機制</td><td>Skills + MCP + Hooks</td><td>TypeScript extension</td><td>Skill registry + 沙箱</td></tr>
        </tbody>
      </table>

      <ul>
        <li><strong>Claude Code 派</strong>：所有事都做了，給使用者一個有 opinion 的 ~10k token system prompt，降低使用門檻。</li>
        <li><strong>Pi 派</strong>：把控制權交給使用者，system prompt 不到 1k token，靠 power user 自己組裝。</li>
        <li><strong>Glean 派</strong>：給企業用，內建 PTC（per-task context）、sub-agent isolation、compaction 等企業級 context 管理機制。</li>
      </ul>

      <p>選擇取決於你的使用者是誰、可承擔的「自由 vs 預設體驗」的權衡。</p>

      <h2>實作路徑建議</h2>

      <p>如果要從零做一個 agent harness，建議的階段分法：</p>

      <ol>
        <li><strong>第一階段：驗證 loop 能跑（1-2 天）</strong>——用 Anthropic SDK 直接寫最簡 tool-use loop（&lt;100 行），加 3-5 個基本 tool，純文字 CLI 介面。目標是感受 loop 本質。</li>
        <li><strong>第二階段：production 必備（1 週）</strong>——三層 permission system、context compaction、session 持久化、error recovery、cost tracking。</li>
        <li><strong>第三階段：差異化能力（2-4 週）</strong>——sub-agent、MCP client、skills 系統、hooks 機制、diff-based file editing。</li>
        <li><strong>第四階段：產品化（持續）</strong>——TUI、IDE 整合、觀測性（trace、cost dashboard）、多模型支援、plugin marketplace。</li>
      </ol>

      <h2>結語</h2>

      <p>
        Agent Harness 的核心是一個 while 迴圈，但 production-grade 的 harness 是「圍繞 while-loop 的紀律工程」：permission gate 確保安全、context manager 確保長期可用、tool system 確保能做事、memory 確保連續性、hooks 確保可整合。理解這五個元件，就理解了大部分 Agent Harness 的設計問題。
      </p>

      <h2>深入閱讀</h2>

      <p><strong>官方：</strong></p>

      <ul>
        <li><a href="https://www.anthropic.com/research/building-effective-agents">Building Effective Agents</a> — Anthropic</li>
        <li><a href="https://code.claude.com/docs/en/how-claude-code-works">How Claude Code works</a> — Claude Code Docs</li>
        <li><a href="https://platform.claude.com/docs/en/agent-sdk/agent-loop">Agent Loop — Claude API Docs</a></li>
      </ul>

      <p><strong>逆向工程／原始碼分析：</strong></p>

      <ul>
        <li><a href="https://github.com/VILA-Lab/Dive-into-Claude-Code">Dive into Claude Code (VILA Lab)</a> — v2.1.88 完整拆解</li>
        <li><a href="https://kotrotsos.medium.com/claude-code-internals-part-2-the-agent-loop-5b3977640894">Claude Code Internals (Marco Kotrotsos)</a></li>
        <li><a href="https://dev.to/brooks_wilson_36fbefbbae4/claude-code-architecture-explained-agent-loop-tool-system-and-permission-model-rust-rewrite-41b2">Claude Code Architecture Explained — Rust Rewrite</a></li>
      </ul>

      <p><strong>比較與生態：</strong></p>

      <ul>
        <li><a href="https://addyosmani.com/blog/agent-harness-engineering/">Agent Harness Engineering (Addy Osmani)</a></li>
        <li><a href="https://arize.com/blog/context-management-in-agent-harnesses/">Context Management in Agent Harnesses (Arize)</a></li>
        <li><a href="https://www.glean.com/blog/harness-context-manager">The Harness as the Context Manager (Glean)</a></li>
        <li><a href="https://openrouter.ai/announcements/create-agent-harness-with-agent-sdk">Build Your Own Harness with Agent SDK (OpenRouter)</a></li>
      </ul>

      <p><strong>開源實作：</strong></p>

      <ul>
        <li><a href="https://pi.dev/">Pi</a> — Minimal TypeScript harness</li>
        <li><a href="https://github.com/nwyin/tau">Tau</a> — Rust harness with TUI/CLI/serve modes</li>
      </ul>
    </Prose>
  );
}
