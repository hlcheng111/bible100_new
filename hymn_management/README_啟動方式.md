# 聖詩管理系統 - 啟動與路徑說明

## 正確啟動方式

1. **雙擊** `start_http_聖詩.bat`（在 hymn_management 資料夾內）
2. 或於 **bible100_new** 資料夾執行：`python -m http.server 8080`
3. 瀏覽器開啟：**http://127.0.0.1:8080/hymn_management/**

### file:// 與 2015 首詩歌

- **sidebar_playlist** 已內嵌詩歌資料，`file://` 開啟時也能顯示 2015 首
- 若更新了 `data/source-hymns-*.json`，請執行：`node scripts/build-sidebar-embedded.js` 重新內嵌

## 若出現 404

若伺服器是從 **專案根目錄**（如 `.cursor`）啟動，路徑會不同：

- 試試：**http://127.0.0.1:8080/bible100_new/hymn_management/**
- 模範頁：**http://127.0.0.1:8080/bible100_new/hymn_management/hymn_template.html**

## 各頁面功能狀態

| 頁面 | 功能 | 說明 |
|------|------|------|
| **temp_hymn.html** | ✅ 有 | 載入 source-hymns.json（2015 首），需 HTTP |
| **hymn_template.html** | ✅ 有 | 模範頁，可加 ?id=hymn_00_0001 載入詩歌 |
| **hymn_learner.html** | ✅ 有 | 需 ?id=hymn_00_0001（非 century_praise_001） |
| **dashboard.html** | 部分 | 依 data-parser 載入 |
| **hymn_sidebar_all** | 示範 | 靜態範例 |
| **hymn_search_interface** | 示範 | 靜態範例 |
| **hymn_playlist_unified** | 示範 | 靜態範例 |
| **hymn_editor** | 示範 | 靜態範例 |
| **hymn_content_welcome** | 示範 | 靜態範例 |
| **copyright_management** | 示範 | 靜態範例 |

## 模範頁設計說明

- **H04B-01J**：可連結到 hymnary.org 搜尋（依 tune 或歌名）
- **樂譜**：來自 source-hymns.json 的 scoreImage，或 placeholder
- **Text Information**：Lectionary/Scripture/Languages 可從 hymnary.org 查或自行填寫
