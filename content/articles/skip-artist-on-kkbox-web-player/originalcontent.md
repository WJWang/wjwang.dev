# 在KKBOX Web Player 跳過特定藝人的歌曲

看到同事分享了 Spotify 的封鎖藝人功能，想說來研究看看 KKBOX Web Player([https://play.kkbox.com/](https://play.kkbox.com/)) 封鎖藝人歌曲的 script 有沒有辦法土炮出來 XD

下面的方法就是用 workaround 來封鎖自己不想聽的藝人歌曲 XD

有需要的朋友可以拿去使用，我有時間在改寫成 Chrome Extension 吧…(先把 code 留在這 [https://github.com/WJWang/kk-webplayer-blocker](https://github.com/WJWang/kk-webplayer-blocker))

## 使用方法

1. 在 KKBOX 搜尋介面中搜尋你想要封鎖的藝人 [https://www.kkbox.com/tw/tc/search.php](https://www.kkbox.com/tw/tc/search.php)

2. 進入藝人頁面，複製網址內的藝人編號（圖中反白部分）

3. 前往 KKBOX Web Player ([https://play.kkbox.com/](https://play.kkbox.com/)) 按一下 F12，然後在跳出的 console 介面中貼上這段程式碼，按下 enter

4. 然後接著輸入

```javascript
ARTIST_ID_BLACKLIST=["藝人編號"]
```

若是有多個藝人可以這樣輸入

```javascript
ARTIST_ID_BLACKLIST=["藝人編號A", "藝人編號B", "藝人編號C"]
```

5. 完成，接下來遇到設定的藝人歌曲就會跳過不播了
