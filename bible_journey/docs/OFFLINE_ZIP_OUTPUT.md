# 離線 ZIP 與跨國試用產出位置

## 離線包（本次）

預設輸出資料夾：

`C:\Users\hlche\Desktop\BibleJourney_releases\`

內含：

- `BibleJourney_Offline_YYYY-MM-DD_4lang.zip` — 給 Android／電腦試用
- `怎麼掛_Vercel_PWA.txt` — 跨國／iPhone 用 HTTPS 的步驟

ZIP 內必讀：`請先看我_HOW_TO_OPEN_4LANG.txt`（中／英／越／印尼）

重新打包：

```powershell
cd C:\Users\hlche\.cursor\bible100_new\bible_journey
npm run build:offline
# 再手動 Compress-Archive dist，或請 Agent「再打一包 ZIP」
```

## 跨國主推

仍建議 Vercel／Netlify：`npm run build:pwa` → HTTPS → QR。見 `PWA_BETA_DEPLOY.md`。
