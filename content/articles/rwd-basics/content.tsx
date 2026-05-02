import {
  Prose,
  CodeBlock,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <h2>1. Viewport</h2>

      <p>
        參考資源：「html viewport meta 說明及淺見」與 Mozilla 的 viewport meta tag 使用指南，說明如何控制行動裝置上的版面排版。
      </p>

      <h2>2. 使用 JS 偵測螢幕寬度</h2>

      <CodeBlock language="js">{`// add event listener on resize
window.resize event

// detect window.screen width
window.screen

// control viewport by js
const meta = document.createElement('meta');
meta.setAttribute('name', 'viewport');`}</CodeBlock>

      <ul>
        <li><strong>orientation:</strong> portrait / landscape</li>
      </ul>

      <h2>3. mediaQuery</h2>

      <p>IE9+，斷點參考 Bootstrap 4.0。</p>

      <CodeBlock language="css">{`/* 320px */
@media screen and (max-width: 320px) {

}

/* 640px */
@media screen and (max-width: 640px) {

}

/* 800px */
@media screen and (max-width: 800px) {

}`}</CodeBlock>

      <h2>4. Unit</h2>

      <p>使用 <code>%</code>、<code>vh</code>、<code>vw</code>、<code>em</code>、<code>rem</code>。</p>

      <p><strong>Hint:</strong> 100% = 1 em ~= 16px ~= 14pt</p>

      <CodeBlock language="css">{`html { font-size: 62.5%; }
body { font-size: 14px; font-size: 1.4rem; } /* =14px */
h1   { font-size: 24px; font-size: 2.4rem; } /* =24px */`}</CodeBlock>

      <h2>5. Layout</h2>

      <p>使用 flex box / css grid。</p>

      <h2>6. Event</h2>

      <ul>
        <li><strong>行動裝置沒有：</strong> DnD / MouseOver</li>
        <li><strong>行動裝置有：</strong> touch</li>
      </ul>

      <h2>7. Debug</h2>

      <p>使用瀏覽器 DevTools 的裝置模擬功能進行除錯。</p>

      <p>原文發表於 <a href="https://wjwang.medium.com/rwd-basic-88df29cc6176">Medium</a></p>
    </Prose>
  );
}
