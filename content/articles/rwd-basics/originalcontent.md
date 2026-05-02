# RWD Basic

## 1. Viewport

參考資源：「html viewport meta 說明及淺見」與 Mozilla 的 viewport meta tag 使用指南。

## 2. Using JS for detecting screen width

```javascript
// add event listener on resize
window.resize event

// detect window.screen width
window.screen

// control viewport by js
const meta = document.createElement('meta');
meta.setAttribute('name', 'viewport');
```

- **orientation:** portrait / landscape

## 3. mediaQuery

- IE9+
- breakpoints (references Bootstrap 4.0)

```css
/* 320px */
@media screen and (max-width: 320px) {

}

/* 640px */
@media screen and (max-width: 640px) {

}

/* 800px */
@media screen and (max-width: 800px) {

}
```

## 4. Unit

Use `%, vh, vw, em, rem`

**Hint:** 100% = 1 em ~= 16px ~= 14pt

```css
html { font-size: 62.5%; }
body { font-size: 14px; font-size: 1.4rem; } /* =14px */
h1   { font-size: 24px; font-size: 2.4rem; } /* =24px */
```

## 5. Layout

- Using flex box / css grid

## 6. Event

- **DO NOT HAVE:** DnD / MouseOver
- **HAVE:** touch

## 7. Debug

使用瀏覽器 DevTools 的裝置模擬功能進行除錯。
