# 數據庫維護工具 (DB Maintenance Tools)

本目錄為 **Bible100 研讀模組** 的維護工具，由原 `translation-workstation/bible_reading` 整合而來。

## 工具說明

| 檔案 | 用途 |
|------|------|
| **db_analyzer.html** | 分析 SQLite 數據庫結構（表、欄位、行數、樣本），可導出分析結果 JSON |
| **db_diagnosis.html** | 診斷 .db 能否載入、列出表與結構、樣本數據（頁面載入即自動執行） |
| **db_to_json_converter.html** | 將 .db 轉換為 JSON 並下載，便於靜態站或備份 |

## 數據路徑

- 工具會依序嘗試：`data/bibles/`、`data/cj/` 下的 .db 檔案。
- 請透過 **HTTP** 開啟專案（例如 VS Code Live Server），否則 `fetch()` 無法讀取本地 .db。

## 導航

- 聖經工具中心：`_landing/tools.html` → 卡片「數據庫維護工具」
- 側欄：`sidebar.html` → 區塊「維護工具」
