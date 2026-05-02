import {
  Prose,
  CodeBlock,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <p>與前端有關的偶然所得</p>

      <h2>1. document.designMode = &apos;on&apos;</h2>

      <p>
        在 chrome 的 console 輸入這一行，即可任意編輯頁面上的文字，可以用來看文字很多時候是否爆版 / word-break 是否沒調整好。
      </p>

      <CodeBlock language="js">{`document.designMode = 'on'`}</CodeBlock>

      <h2>2. .babelrc, .eslintrc, …rc</h2>

      <p>rc 是 RunCom 也就是 run commands。</p>

      <blockquote>
        <p>「在 UNIX 世界，rc 經常被用作程序之啟動腳本的文件名。它是『run commands』（運行命令）的縮寫。」</p>
      </blockquote>

      <h2>3. iOS Safari Input type [&quot;date&quot;] / [&quot;time&quot;] default style change</h2>

      <CodeBlock language="css">{`input[type="date"]
{
    -webkit-appearance: textfield;
    -moz-appearance: textfield;
}`}</CodeBlock>

      <h2>4. Is Mouse inside an element?</h2>

      <CodeBlock language="javascript">{`isMouseWithin = (e) => {
    const mousePosition = { x: e.clientX, y: e.clientY };
    const targetElement = document.querySelector('...');
    let isMouseWithin = false;
    if (mousePosition.x && mousePosition.y) {
      const {
        bottom, height, left, right, top, width, x, y,
      } = targetElement.getBoundingClientRect();
      isMouseWithin = (
        (mousePosition.x <= x + width && mousePosition.x >= x)
        &&
        (mousePosition.y <= y + height && mousePosition.y >= y)
      );
    }
    return isMouseWithin;
}`}</CodeBlock>

      <h2>5. Babeljs 的官方歌曲</h2>

      <p>Babeljs 的官方網站有一首官方歌曲，點開後可以聽到一段搞笑的歌曲。</p>

      <p>原文發表於 <a href="https://wjwang.medium.com/%E9%97%9C%E6%96%BC%E5%89%8D%E7%AB%AF%E7%9A%84%E7%84%A1%E8%81%8A%E4%BA%8B-e8ff7084219">Medium</a></p>
    </Prose>
  );
}
