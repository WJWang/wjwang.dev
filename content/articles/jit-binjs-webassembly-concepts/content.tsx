import {
  Prose,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <p>整理從 JIT 編譯器到 BinJS 與 WebAssembly 的相關概念，以下為延伸閱讀資源。</p>

      <ul>
        <li><a href="https://medium.com/dailyjs/a-guide-to-javascript-engines-for-idiots-479a6a53cc4f">A Guide to JavaScript Engines for Idiots</a></li>
        <li><a href="https://webkit.org/blog/6978/javascript-engines-and-lazy-parsing/">Lazy Parsing in JavaScript Engines</a></li>
        <li><a href="https://github.com/alex/what-happens-when">what-happens-when</a> (GitHub repository)</li>
        <li><a href="https://hacks.mozilla.org/2017/02/a-cartoon-intro-to-webassembly/">A cartoon intro to WebAssembly</a></li>
        <li><a href="https://hacks.mozilla.org/2017/02/a-crash-course-in-just-in-time-jit-compilers/">A crash course in just-in-time (JIT) compilers</a></li>
        <li><a href="https://hacks.mozilla.org/2017/02/a-crash-course-in-assembly/">A crash course in assembly</a></li>
      </ul>

      <p>原文發表於 <a href="https://wjwang.medium.com/article-of-the-concepts-from-jit-to-binjs-webassembly-ce9b3e7fa17a">Medium</a></p>
    </Prose>
  );
}
