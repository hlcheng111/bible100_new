# 全站 Cleanup Wave V1（study 掛入＋根夾／臨時檔）

**版本：** 2026-08-05  
**觸發：** 將 `bible_app/shell` 掛入「聖經研讀」；並按 material 樣板做可安全清理。  
**原則：** 夾名不改 · LIVE 路徑凍結 · 唯一副本進 `_archive/` · 掃描用臨時檔可刪 · 上云窗口不改路徑  

---

## 0. 本波做了什麼

| 項 | 結果 |
|----|------|
| **bible_app → study** | `modes.study.moduleIds` 含 `bible_app`；頂欄2「跑道」；路線圖站 5；側欄捷徑 |
| **正式入口** | Hub 深鏈 `bible_app/shell/index.html`；完整版新分頁 `bible_app/index.html` |
| **非第七大模組** | 仍遵守產品凍結：不新增頂欄大 mode |
| **repo 根臨時檔** | ✅ 已刪 `_tmp_*` / `_test_*` / `audit_*`；`index_v5 - 複製*` → `_archive/repo_root_20260805/` |
| **bible_study 根雜訊** | ✅ 測試／診斷／報告 md·html → `bible_study/_archive/root_noise_20260805/` |
| **smart_ministry** | ✅ `test01`–`test04` + apply_*.py → `_archive/root_noise_20260805/` |
| **church_ministry** | ✅ `00temp.html`、`remove_welcome_dialogs.ps1` → `_archive/` |
| **languages** | ✅ `index - 複製.html`、`cn/OT/index - 複製.html` → `_archive/` |
| **文件** | 本檔 + 更新 `PRODUCT_SCOPE_FREEZE`；**未**整夾搬迁 `docs/` 历史长文（避免断链；另波） |

> **未做／下波：** `docs/` 根上过期进度报告迁入 `docs/reports/archive_*`；`church_planning` 根上 Vite 残迹（另 cleanup wave）；全站 orphan HTML 盘点。

---

## 1. 聖經跑道掛入契約

```
頂欄「聖經研讀」 study
├── bible_study/     對照 · 釋經 · 工具（Hub 主桌）
└── bible_app/       聖經跑道 shell（每日讀經伴侶 · 不搬夾）
```

| 入口 | 路徑 | 說明 |
|------|------|------|
| Hub 右欄 | `bible_app/shell/index.html` | file:// 可預覽；自有頂欄在 contentFrame 內 |
| 正式／HTTP | `bible_app/index.html` | 轉址 shell；建議新分頁 |
| 側欄 | `bible_study/sidebar.html` | 捷徑 + 新分頁完整版 |

驗收：`file:///…/index_v5.html` → 聖經研讀 →「跑道」或路線圖第 5 站。

---

## 2. 根目錄整頓規則（各模套用）

**根上只留：** `index*`／`sidebar*`／`dashboard*`／`_landing/`／`js|css|docs|modules|tools|…` 白名單。  

**進 `_archive/`：** `*TEST*`、`*DIAGNOSIS*`、`00temp*`、`*複製*`、一次性報告 md、實驗頁。  

**可刪：** repo 根 `_tmp_*`、`_test_*`（掃描產物，非產品）。  

**禁止：** rename LIVE chapter／工具主檔；硬刪唯一產品副本。

---

## 3. 文件清理範圍（本波）

| 做 | 不做 |
|----|------|
| 刪掃描臨時檔 | 不整庫重排 `docs/*.md` |
| 模組根噪聲 → `_archive` | 不刪 `docs/governance` 生效契約 |
| 寫本波日誌 | 不在上云窗口改路徑 |

後續可選：把 `docs/` 根上过期进度报告迁入 `docs/reports/archive_*`（另开 wave）。

---

## 4. 相關檔

- `config/modes.json` · `modules.json` · `module_manifest.json`
- `js/b100_nav_ssot.js` · `bible_study/sidebar.html` · `_landing/home.html`
- `bible_app/docs/PRODUCT_SCOPE_FREEZE.md`
- `docs/governance/MATERIAL_MODULE_CLEANUP_WAVE_V1.md`（樣板）
