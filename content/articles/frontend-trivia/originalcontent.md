# 關於前端的無聊事

與前端有關的偶然所得

## 1. document.designMode = 'on'

在 chrome 的 console 輸入這一行，即可任意編輯頁面上的文字，可以用來看文字很多時候是否爆版 / word-break 是否沒調整好。

## 2. .babelrc, .eslintrc, …rc

rc 是 RunCom 也就是 run commands.

> "在 UNIX 世界，rc 經常被用作程序之啟動腳本的文件名。它是『run commands』（運行命令）的縮寫。"

## 3. iOS Safari Input type ["date"] / ["time"] default style change

```css
input[type="date"]
{
    -webkit-appearance: textfield;
    -moz-appearance: textfield;
}
```

## 4. Is Mouse inside an element?

```javascript
isMouseWithin = (e) => {
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
}
```

## 5. Babeljs 的官方歌曲

Babeljs 的官方網站有一首官方歌曲，點開後可以聽到一段搞笑的歌曲。
