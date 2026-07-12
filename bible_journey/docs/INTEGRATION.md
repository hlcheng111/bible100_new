# bible_journey 與 Bible100 總站整合

## 專案放在哪？

```
bible100_new/
├── index.html          → 轉到 index_v5.html
├── index_v5.html       → 總站殼（六模組）
├── bible_app/          → 舊跑道（凍結，不再修補）
└── bible_journey/      → 新跑道 2.0（本專案）
```

**不在 `bible100_new` 之外。** 方便同一 repo 部署、同一域名、同一 git。

---

## 上雲後網址

建置並將 `dist/` 內容部署到：

```
https://你的網域/bible_journey/
```

本機 repo 根目錄 `serve` 時：

```
http://127.0.0.1:3000/bible_journey/
```

建置需指定 base（已內建於部署腳本約定）：

```bash
cd bible_journey
BJ_BASE=/bible_journey/ npm run build
# 將 dist/* 複製到 bible100_new/bible_journey/ 或伺服器同名目錄
```

---

## 從 index_v5 怎麼「叫出來」？

### 推薦：外連新分頁（不嵌 iframe）

在 `index_v5.html` 頂欄或導覽加一個連結：

```html
<a href="bible_journey/" target="_blank" rel="noopener">🦁 聖經跑道 2.0</a>
```

或使用完整雲端 URL：

```html
<a href="https://bible100.lovestoblog.com/bible_journey/" target="_blank">🦁 聖經跑道</a>
```

**不要**把整個 `bible_journey` 塞進 `index_v5` 的 `contentFrame` iframe——那是舊 shell 痛苦來源；新 App 自己是完整 SPA。

### 可選：總站右欄全頁載入（仍非 iframe 巢狀）

若堅持在總站內開啟，可讓 `contentFrame` **直接**指向 `bible_journey/index.html`（單一全幅頁），**不要**再包一層 `bible_app` 殼。

---

## serve.json 重定向（repo 根）

在 `bible100_new/serve.json` 增加（部署時由維護者加入）：

```json
{ "source": "/bible_journey", "destination": "/bible_journey/index.html", "type": 302 },
{ "source": "/bible_journey/", "destination": "/bible_journey/index.html", "type": 302 }
```

開發期也可把 `npm run build` 輸出放到 `bible_journey/dist/`，並用 `bible_journey/index.html` 轉址到 `dist/index.html`（與 `bible_app` 早期模式類似，可之後簡化）。

---

## 桌面版（Electron）

```bash
npm run build
electron electron/main.cjs
```

打包後使用者只雙擊 `.exe`，無 bat、無終端機。

---

## 手機 PWA

部署 HTTPS 後，手機瀏覽器「加到主畫面」。完整 66 卷需後續接上 sql.js + Service Worker 快取經文庫。
