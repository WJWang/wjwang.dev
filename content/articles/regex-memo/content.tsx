import {
  Prose,
  CodeBlock,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <h2>Online Resource</h2>

      <h3>Simple Concept</h3>

      <p>"I have a book"</p>
      <ul>
        <li><code>/a/</code> =&gt; I h<strong>a</strong>ve <strong>a</strong> book</li>
        <li><code>/have/</code> =&gt; I <strong>have</strong> a book</li>
      </ul>

      <p>需要 <code>\</code> 前綴的字元：<code>$.|?*+()</code></p>

      <p>範例："Mr.Wang" =&gt; <code>/Mr\./</code> =&gt; <strong>Mr.</strong>Wang</p>

      <ul>
        <li><code>.</code> — 任意字元</li>
        <li><code>[]</code> — 代表一個位置的多種可能字元
          <ul>
            <li><code>[a-zA-Z]</code> — a 到 z、A 到 Z</li>
            <li><code>[^a]</code> — 非 'a'</li>
          </ul>
        </li>
        <li><code>\d</code> — 數字 <code>[0-9]</code></li>
        <li><code>\w</code> — 英數字 <code>[A-Za-z0-9_]</code></li>
        <li><code>\s</code> — 空白 <code>[ \n\r\t]</code></li>
        <li><code>\b</code> — 字界
          <ul>
            <li>"This is a book" =&gt; <code>/\bis\b/</code> =&gt; "This <strong>is</strong> a book"</li>
          </ul>
        </li>
        <li><code>\D</code> — 非數字 <code>[^\d]</code></li>
        <li><code>\W</code> — 非英數字 <code>[^\w]</code></li>
        <li><code>\S</code> — 非空白 <code>[^\s]</code></li>
      </ul>

      <p><strong>Quantifiers（量詞）：</strong></p>
      <ul>
        <li><code>*</code> — 零或多次</li>
        <li><code>+</code> — 至少一次</li>
        <li><code>?</code> — 零或一次</li>
        <li><code>&#123;times&#125;</code>、<code>&#123;min,max&#125;</code>
          <ul>
            <li>"Hello world"，<code>/l&#123;2&#125;/</code> =&gt; "He<strong>ll</strong>o world"</li>
            <li><code>/l&#123;0,2&#125;/</code> =&gt; "He<strong>ll</strong>o wor<strong>l</strong>d"</li>
          </ul>
        </li>
      </ul>

      <p><strong>Anchors &amp; Operators：</strong></p>
      <ul>
        <li><code>/^/</code> — 開頭</li>
        <li><code>/$/</code> — 結尾</li>
        <li><code>|</code> — OR</li>
      </ul>

      <h3>Code Example</h3>

      <CodeBlock language="js">{`var re = /(\w+)\s(\w+)/;
var str = "John Smith";
var newstr = str.replace(re, "$2, $1");
console.log(newstr) // Smith, John`}</CodeBlock>

      <h3>Reference</h3>

      <ul>
        <li><a href="https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/String/replace">MDN — String.prototype.replace()</a></li>
      </ul>

      <p>原文發表於 <a href="https://wjwang.medium.com/regex-memo-6285e8cb57c0">Medium</a></p>
    </Prose>
  );
}
