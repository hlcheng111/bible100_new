# 聖經研讀 Bible Study

## 正式入口（BS-W0 · 方案 A）

- **Standalone**：`bible_study/index.html`（雙 iframe 殼：Topbar + `sidebarFrame` + `contentFrame`；需 HTTP 以載入 JSON／SQLite）
- **總站**：`index_v5.html` → 頂列「聖經研讀」→ 左欄 `sidebar.html` + 右欄內容頁（**不**載入 `index.html`，避免殼中殼）

## 舊版／相容

- `dashboard.html` → 重新導向 `index.html`（保留 `?lang=` 等查詢參數）
- 全站仍指向 `dashboard.html` 的連結可繼續使用，會自動轉址

## 核心子頁

| 路徑 | 用途 |
|------|------|
| `js/bible_version_registry.js` | 譯本／註釋路徑 SSOT |
| `js/BibleEngine.js` | 統一載入引擎 |
| `data_sources.html` | 資料綠燈掃描 |
| `comprehensive_exegesis_reader.html` | 釋經參讀（CMC + 本地資源） |
| `parallel_mode_v3.html` | 譯本對照 |
| `search_reader.html` | 全文搜尋 |
| `external_bible_reader.html` | 多語外站嵌入 |
| `sidebar.html` | 66 卷 + 版本樹（`data-b100-nav="content"`） |

## 資料

本機 `data/bibles/`、`data/cj/` 不在 Git；clone 後需自行還原。見根目錄 `run_backup_data.bat`。

## 成熟度

頁面狀態見 `docs/PAGE_MATURITY_BS.md`（BS 前綴，W0 骨架）。
