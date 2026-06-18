# Bible Journey App（兒少 UI 優先）

Expo App：**兒童／青少年歡迎、敢用、樂用** — 35 關彩色內容、小遊戲、貼紙牆、同跑隊。  
Bible100 網站為補給站。名稱與標題為初稿。

## 結構

```
bible_app/
├── app/                 # Expo Router 行動 / Web 客戶端
├── packages/core/       # TrackingEngine、BibleService、i18n
├── firebase/            # Firestore Rules、Cloud Functions
├── sheets/              # Google Sheets 營運模板
├── scripts/             # 跑道生成、JSON→SQLite
└── docs/                # PRD、授權、營運指南
```

## 快速開始（兒少 UI）

```powershell
cd bible_app
python scripts/create_placeholder_assets.py
python scripts/generate_kids_youth_content.py
python scripts/json_to_sqlite.py
cd packages\core
npm install
npm test
cd ..\..\app
npm install
npm run web
```

瀏覽器打開 Expo 提示的網址 → **歡迎頁 → 選跑者 → 今日／地圖／獎品**。

## 環境變數

複製 `app/.env.example` → `app/.env`，填入 Firebase Web 設定（可選；未配置時使用訪客模式 + 示範資料）。

## 指令

| 指令 | 說明 |
|------|------|
| `npm run generate:tracks` | 重新生成三跑道章節表 |
| `npm run build:bible` | 從 `data/bibles/clean/` 建 SQLite 離線包 |
| `npm test` | TrackingEngine 單元測試 |
| `npm run app:web` | 啟動 Expo Web |

## 文件

- [Phase 1 PRD](docs/PHASE1_PRD.md)
- [譯本授權](docs/LICENSE_BIBLE_VERSIONS.md)
- [營運指南](docs/OPERATIONS_GUIDE.md)
- [Firebase](firebase/README.md)
- [Sheets](sheets/README.md)
