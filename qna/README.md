# 聖經難題 Q&A

## 正式入口

- **Standalone**：`qna/index.html`（可 `file://` 或 HTTP 獨立開啟）
- **總站**：`index_v5.html` → 頂列「聖經難題 Q&A」→ 右欄載入 `qna/index.html`

## 設定與資料

| 檔案 | 用途 |
|------|------|
| `qna_nav_config.js` | 大類、來源、landing |
| `data/qna_sidebar_bundle.js` | 側欄題庫（`node qna/tools/build_sidebar_bundle.mjs` 重建） |
| `qna_landing_*.htm` | 各類別預設說明頁 |

## 舊版

- `qna_index_4layer_V2.htm`、`qna_index_4layer_V3.htm` → 重新導向 `index.html`
- `archive/legacy/` — 舊 frameset／分層版
- `archive/hub_retired/` — 已下架的多站導覽試用頁

說明：`qna/docs/QNA_HUB_RETIREMENT.md`
