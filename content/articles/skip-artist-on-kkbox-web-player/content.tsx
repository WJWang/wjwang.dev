import {
  Prose,
  CodeBlock,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <p>
        看到同事分享了 Spotify 的封鎖藝人功能，想說來研究看看 KKBOX Web Player（<a href="https://play.kkbox.com/">https://play.kkbox.com/</a>）封鎖藝人歌曲的 script 有沒有辦法土炮出來 XD
      </p>

      <p>
        下面的方法就是用 workaround 來封鎖自己不想聽的藝人歌曲 XD
      </p>

      <p>
        有需要的朋友可以拿去使用，我有時間在改寫成 Chrome Extension 吧…（先把 code 留在這 <a href="https://github.com/WJWang/kk-webplayer-blocker">https://github.com/WJWang/kk-webplayer-blocker</a>）
      </p>

      <h2>使用方法</h2>

      <ol>
        <li>
          在 KKBOX 搜尋介面中搜尋你想要封鎖的藝人：<a href="https://www.kkbox.com/tw/tc/search.php">https://www.kkbox.com/tw/tc/search.php</a>
        </li>
        <li>
          進入藝人頁面，複製網址內的藝人編號（圖中反白部分）
        </li>
        <li>
          前往 KKBOX Web Player（<a href="https://play.kkbox.com/">https://play.kkbox.com/</a>）按一下 F12，然後在跳出的 console 介面中貼上這段程式碼，按下 enter
        </li>
        <li>
          然後接著輸入：
          <CodeBlock language="javascript">{`ARTIST_ID_BLACKLIST=["藝人編號"]`}</CodeBlock>
          若是有多個藝人可以這樣輸入：
          <CodeBlock language="javascript">{`ARTIST_ID_BLACKLIST=["藝人編號A", "藝人編號B", "藝人編號C"]`}</CodeBlock>
        </li>
        <li>
          完成，接下來遇到設定的藝人歌曲就會跳過不播了
        </li>
      </ol>

      <p>原文發表於 <a href="https://wjwang.medium.com/%E5%9C%A8kkbox-web-player-%E8%B7%B3%E9%81%8E%E7%89%B9%E5%AE%9A%E8%97%9D%E4%BA%BA%E7%9A%84%E6%AD%8C%E6%9B%B2-cc1b0fdc2bbc">Medium</a></p>
    </Prose>
  );
}
