import {
  Prose,
  CodeBlock,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <h2>screen 指令</h2>

      <CodeBlock language="bash">{`# 建立 session
screen -S NAME

# 離開（detach）
ctrl+a ctrl+d

# 重新連線
screen -r NAME

# 強制重新連線
screen -rd NAME`}</CodeBlock>

      <h2>tmux 指令</h2>

      <CodeBlock language="bash">{`tmux new -s {name}
tmux ls
tmux a -t
tmux kill-session -t`}</CodeBlock>

      <ul>
        <li><code>c-b + [</code> — 捲動，按 <code>q</code> 離開</li>
        <li><code>c-b + z</code> — zoom in / out</li>
        <li><code>c-b + o</code> + num — 移至目標 pane</li>
      </ul>

      <h2>References</h2>

      <ul>
        <li><a href="https://blog.gtwang.org/linux/screen-command-examples-to-manage-linux-terminals/">screen usage</a></li>
        <li><a href="https://tmux.github.io/">tmux usage</a></li>
        <li><a href="https://superuser.com/questions/209437/how-do-i-scroll-in-tmux">Scrolling in tmux</a></li>
      </ul>

      <p>原文發表於 <a href="https://wjwang.medium.com/screen-tmux-memo-6b2fff11c596">Medium</a></p>
    </Prose>
  );
}
