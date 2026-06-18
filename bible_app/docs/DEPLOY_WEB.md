# Bible App — Web 預覽與上雲

## 為什麼 `localhost:8081` 看不到？

常見原因：

1. **埠號不對** — 8081 被佔用時 Expo 會改 **8082**（終端機會寫 `Web is waiting on http://localhost:8082`）
2. **伺服器已停止** — 終端出現 `Stopped server` 後，瀏覽器當然連不上
3. **Windows 路徑** — 開發模式偶發 bundle 路徑問題；改用下方 **靜態網站** 較穩

---

## 方法一：區網 IP（不用打 localhost）

同一 Wi‑Fi 下手機/平板也可開：

```powershell
cd bible_app\app
npm run web:lan
```

終端會顯示例如 `http://192.168.1.147:8081`，用該網址開啟（**以終端顯示為準**）。

---

## 方法二：靜態網站預覽（推薦，最穩）

```powershell
cd bible_app\app
npm run web:preview
```

- 先打包到 `bible_app/app/dist/`
- 再用靜態伺服器開：**http://localhost:3000**
- 不依賴 Metro 開發伺服器，行為與上雲後一致

僅打包：

```powershell
npm run web:build
```

僅預覽已打包檔：

```powershell
npm run web:serve
```

---

## 方法三：上雲（靜態託管）

`dist/` 資料夾即完整網站（含 `index.html`、JS、經庫 db ~26MB）。

### Netlify / Vercel

1. `npm run web:build`
2. 上傳 `bible_app/app/dist` 為網站根目錄
3. 無需 Node 伺服器，純靜態即可

### GitHub Pages

若放在子路徑（如 `username.github.io/bible-app/`），需在 `app.json` 加：

```json
"experiments": { "baseUrl": "/bible-app" }
```

重新 `npm run web:build` 後上傳 `dist/`。

### lovestoblog / FTP 主機

1. 本機執行 `npm run web:build`
2. 將 `dist/` **內部所有檔案** 上傳到子目錄，例如：  
   `public_html/bible_app/`
3. 瀏覽：`https://bible100.lovestoblog.com/bible_app/`

### 注意

- `dist/` 已在 `bible_app/.gitignore`，**不要 commit**（體積大）
- 完整 66 卷經文需本機已執行過 `npm run build:bible`（經庫才會進 bundle）
- 與 Bible100 主站互補：主站補給站 + 本 App 每日跑道

---

## 快速對照

| 用途 | 指令 | 網址 |
|------|------|------|
| 開發熱更新 | `npm run web` | 終端顯示的埠（8081 或 8082） |
| 區網訪問 | `npm run web:lan` | `http://你的IP:8081` |
| 穩定預覽/上雲前測試 | `npm run web:preview` | http://localhost:3000 |
| 產出上雲包 | `npm run web:build` | 輸出 `dist/` |
