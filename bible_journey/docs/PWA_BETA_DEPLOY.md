# PWA 真機試用 · 部署說明（Vercel／Netlify）

本專案是 **Vite SPA**，封測期用 **PWA（加到主畫面）**，不必出 APK／IPA。

## 一、一鍵建置（本機）

```powershell
cd bible_journey
npm run build:pwa
```

- 產出：`dist/`（含 Service Worker、`manifest.webmanifest`、圖示）
- 預設 `BJ_BASE=/`（適合 Vercel／Netlify 專案根）
- 子路徑部署：`$env:BJ_BASE='/bible_journey/'; npm run build:pwa`

**不要**用 `build:offline` 當雲端 PWA 包：離線 ZIP 用相對路徑且**不**啟用 SW，避免與 HTTPS 安裝體驗打架。

**相依：** `workbox-build` 已列入 devDependencies（解決 ESM 下 `Dynamic require of workbox-build`）。若建置仍失敗，請用 **Node 20+**。

## 二、部署

### Vercel（建議）

1. GitHub 連到此 repo（Private 可），Root Directory 設 `bible_journey`（若 monorepo）
2. Build Command：`npm run build:pwa`
3. Output：`dist`
4. 部署後得到 `https://xxxx.vercel.app`

或本機：

```powershell
npm i -g vercel
cd bible_journey
npm run build:pwa
vercel --prod
```

### Netlify

- Build：`npm run build:pwa`
- Publish：`dist`
- SPA：`public/_redirects` 已含 `/* /index.html 200`

## 三、真機「安裝」

| 裝置 | 做法 |
|------|------|
| **Android Chrome** | 開網址 → 選單「安裝應用程式」／「加到主畫面」 |
| **iPhone／iPad Safari** | 分享 →「加入主畫面」 |
| **平板** | 同上 |

安裝後圖示開啟會接近全螢幕（隱藏網址列）。

## 四、QR Code

部署完成後，把 HTTPS 網址貼到任一 QR 產生器，印出／傳 LINE。  
試用文案見 [BETA_TESTER_HANDOUT.md](./BETA_TESTER_HANDOUT.md)。

## 五、注意

- **必須 HTTPS**（localhost／`*.vercel.app` 可）才有完整 PWA。
- 經文章節 JSON **不**全部預先快取（會撐爆）；採讀過再 CacheFirst。
- Android ZIP、`file://` 仍見 [ALPHA_OFFLINE_CHECKLIST.md](./ALPHA_OFFLINE_CHECKLIST.md)；**iOS 請用網址**。
