# 聖詩管理系統 - 啟動與路徑說明

## 若 hymn/hymn_main_index.html 404（詩歌庫被削弱）

舊版全庫在 **`C:\bible100_new\hymn_management\hymn\`**。若 Cursor 工作區缺檔，在 PowerShell 執行：

```powershell
powershell -ExecutionPolicy Bypass -File hymn_management\scripts\restore_hymn_legacy_from_c_drive.ps1
```

還原後可開：

- **全庫主控台**：`hymn_management/hymn/hymn_main_index.html`（5 本詩集瀏覽）
- **總索引**：`hymn_management/hymn/default.htm`
- **2015 首列表**：`hymn_management/index.html`（sidebar_playlist）

總站入口：教會事工 → A 敬拜 → **4. 詩歌管理 → 詩歌庫（全庫主控台）**

## 正確啟動方式

1. **主入口（統一）**：`hymn_management/index.html`
2. **雙擊** `start_http_聖詩.bat` 或 `python -m http.server 8080`
3. 瀏覽器：**http://127.0.0.1:8080/hymn_management/index.html**

### 樂譜圖 image_hymn（約 493MB）

若樂譜仍 placeholder，在本機 PowerShell 執行：

```powershell
powershell -ExecutionPolicy Bypass -File hymn_management\scripts\copy-image_hymn.ps1
```

或完整還原：`restore_hymn_legacy_from_c_drive.ps1`（已含 `image_hymn`）

### 編輯正式資料

```powershell
cd hymn_management
node scripts/hymn-data-server.js
```

瀏覽器開 `hymn_editor.html` → **存到 hymn-overrides**

### file:// 與 2015 首詩歌

- **sidebar_playlist** 已內嵌詩歌資料，`file://` 開啟時也能顯示 2015 首
- 若更新了 `data/source-hymns-*.json`，請執行：`node scripts/build-sidebar-embedded.js` 重新內嵌

## 若出現 404

若伺服器是從 **專案根目錄**（如 `.cursor`）啟動，路徑會不同：

- 試試：**http://127.0.0.1:8080/bible100_new/hymn_management/**
- 模範頁：**http://127.0.0.1:8080/bible100_new/hymn_management/hymn_template.html**

## 根目錄頁面清冊（現行）

### 主流程（請用這些）

| 頁面 | 狀態 | 說明 |
|------|------|------|
| **index.html** | ✅ **主殼** | 頂欄 + 雙欄；點歌開 **原 .htm 全頁** |
| **hymn/index.html** | 轉址 | → `../index.html` |
| **sidebar_playlist.html** | ✅ | 2015 首搜尋；點選 → `hymn/hymn_00/…htm` 全頁 |
| **playlist_placeholder.html** | ✅ | 右欄尚未選歌時的提示 |
| **landing.html** | ✅ | 功能入口卡（模範頁／學習／流程／編輯／PPT） |
| **temp_hymn.html** | ✅ | 2015 首表格預覽（內嵌；雲端可用 `temp_hymn_cloud.html`） |
| **hymn_template.html** | ✅ | 單首摘要（`?id=hymn_00_0001`）；樂譜優先 http |
| **hymn_learner.html** | ✅ | 學習頁（需 `?id=hymn_00_0001`） |
| **index_playlist.html** | ✅ | 播放列表專用雙欄殼 |
| **hymn_playlist_unified.html** | ✅ | 崇拜詩歌流程建設器 → 可開 PPT |
| **ppt_generator.html** | ✅ | PPT 投影片生成 |
| **hymn_editor.html** | ⚠️ 半成品 | 側欄有入口；編輯能力仍偏示範 |
| **dashboard.html** | ⚠️ 部分 | 儀表板／跨模組捷徑 |
| **sidebar.html** | ⚠️ 舊側欄 | 非預設；主殼已改用 `sidebar_playlist` |

### 資料層（2015 首）

| 路徑 | 說明 |
|------|------|
| `data/source-hymns.json` | 完整 2015 |
| `data/source-hymns-1.json`～`4.json` + `source-hymns-manifest.json` | 分片載入（上傳用） |
| `data/source-hymns-loader.js` | 自動合併 chunks |
| `hymn/hymn_00/` 等 | 原詩 HTML 內文（點側欄「開」） |

**注意：** 資料層 2015 **齊**；並非每首都有可用樂譜圖（部分僅 `C:/hymn/...` 路徑，`hymn_template` 只認 http）。歌詞正文以原 `.htm` 為主，JSON 的 `lyrics_zh` 多數為空。

### 已移除（廢置示範，2026-07）

下列根目錄頁與現行主殼重複或僅靜態示範，已刪除（可用 git 還原）：

- `hymn_sidebar_all.html` — 舊「所有聖詩目錄」側欄示範
- `hymn_content_welcome.html` — 舊瀏覽歡迎頁
- `hymn_search_interface.html` — 舊智能搜索示範 UI
- `hymn_playlist_browse.html` — 與 `index.html`+`sidebar_playlist` 功能重複的雙欄瀏覽

`hymn/` 底下舊版（`hymn_5hymnals_*`、`hymn_cursor/`、`index_hymn_web/`、診斷頁等）仍保留作參考，**不要**當主入口。

### 示範／未接主殼（暫留）

| 頁面 | 說明 |
|------|------|
| **copyright_management.html** | 版權表示範；主殼未連入。nav_hub 文件仍可能提到 |

## 模範頁設計說明

- **H04B-01J**：可連結到 hymnary.org 搜尋（依 tune 或歌名）
- **樂譜**：來自 source-hymns.json 的 http `scoreImages`，否則 placeholder
- **Text Information**：Lectionary/Scripture/Languages 可從 hymnary.org 查或自行填寫
