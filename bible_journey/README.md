# 聖經跑道 2.0（bible_journey）

**位置：** `bible100_new/bible_journey/`（與 `bible_app/` 並列，**不在 repo 外**）

Vite + TypeScript 單頁應用（SPA）。同一套程式可：

- 本機開發：`npm run dev`
- **PWA 真機試用（建議）**：`npm run build:pwa` → 部署 Vercel／Netlify（見 [docs/PWA_BETA_DEPLOY.md](docs/PWA_BETA_DEPLOY.md)）
- 離線 ZIP 封測：`npm run build:offline`（見 [docs/ALPHA_OFFLINE_CHECKLIST.md](docs/ALPHA_OFFLINE_CHECKLIST.md)）
- 試用者轉貼文案：[docs/BETA_TESTER_HANDOUT.md](docs/BETA_TESTER_HANDOUT.md)
- 上雲子路徑：`npm run build:cloud`（`/bible_journey/`）
- 日後 Electron：包 `dist/` 成 `.exe`（尚未接線）

## MVP 驗收

1. 開啟首頁 → 按「開始今日關卡」→ 創世記第 1 章四語並排
2. 頂欄 🤝／💬／✨、？／▶／❤ 均有畫面切換
3. 無巢狀框架、無 bat、無恐嚇文案

## 開發

```bash
cd bible_journey
npm install
npm run dev
```

瀏覽器開 http://localhost:5173

```bash
npm run test:smoke
npm run build
```

## 與總站整合

見 [docs/INTEGRATION.md](docs/INTEGRATION.md)

## 經文資料（66 卷四語）

從舊專案 SQLite 匯出靜態 JSON：

```bash
cd bible_journey
npm install
npm run export:bible
```

- 讀取：`../bible_app/app/assets/bible/bible_reader.db`
- 輸出：`src/data/bible/[書卷Id]_[章].json`（例：`1_2.json` = 創世記第 2 章）
- 目錄：`src/data/bible/catalog.json`
- 同步至 `public/data/bible/` 供前端 `fetch` 載入

自訂路徑：

```bash
node scripts/export_bible.js --db "C:/path/to/bible_reader.db" --out "./src/data/bible"
```

版本對照：`cuv_trust`(中) · `kjv`(EN) · `vi_1934`(VI) · `id_ayt`(ID)

