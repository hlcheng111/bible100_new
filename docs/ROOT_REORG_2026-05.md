# 根目錄重組紀要（2026-05）

本次調整目標：減少 `bible100_new` 根層同名異義模組夾、將小型入口併入語意母模組，並保留不可刪之工程資產。

## 已變更之路徑

| 舊路徑（根下） | 新路徑 | 備註 |
|----------------|--------|------|
| `congregation/` | `church_ministry/congregation/` | `config/modules.json` 已更新；`index_v3`／`index_legacy`／工具總覽等連結已改。 |
| `people/` | `church_ministry/people/` | 人員總覽／詳情；教會事工側欄改為 `people/…` 相對路徑。 |
| `search/` | `nav_hub/search/` | `index_v5`／`index_v5_church_layout_v1`／`nav_hub/omni_entry.html` 等已改。 |
| `visitation/`（獨立站示範） | `church_ministry/projects/visitation_site/` | 與 `modules/support/visitation*.html` 並存；主線仍以事工模組為準。 |
| `v2/` | `archive/v2/` | 實驗性 Sheets 驅動前端；`nav_hub/index.html` 入口已改。 |
| `test/` | （移除） | JSDOM 版 TOC 測試改為 `tests/run-toc-jsdom.js`；目錄 `test/` 已刪。 |

## 新增

- `church_planning/image_plan/`：教會規劃模組內之圖像／媒體預設歸檔（見該夾 `README.md`）。
- `archive/README.md`：說明封存內容。

## 刻意未刪除／未搬移

| 項目 | 原因 |
|------|------|
| `translation_system/` | i18n／翻譯管線與資料；刪除會破壞多語流程。 |
| `config/` | 全站模組註冊與路徑；**必留**。 |
| `scripts/` | Python／稽核／備份；與 `tools/` 內維運腳本分擔職責，可再文件化分工。 |
| `tools/` | 含可開啟之 HTML 儀表與大量 `.ps1`/`.py`；未整夾搬移以免一次破壞過多相對路徑。 |
| `toc/` | 目錄產生器內嵌路徑與產物假設 `toc/`；搬移需改 generator 字串，另案處理。 |
| `tests/` | **保留**自動化測試；僅合併舊 `test/`。 |
| `disciple_dynamics/` → `training/` | **未執行**；牽涉全站連結與殼層載入，建議獨立 PR。 |

## 後續可選

- `help/` 內單頁按主題遷回各模組（維持本目錄索引）。
- `tools/` 與 `scripts/` 寫清「何者放哪」後再物理合併至例如 `devtools/`。
