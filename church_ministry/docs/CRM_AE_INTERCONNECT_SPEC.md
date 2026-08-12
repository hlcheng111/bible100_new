# CRM 旅程 × A–F 互聯規格

> 原則：自動化為誰、做什麼、小白敢點。減少重複。  
> **M5 起**：CRM 側欄 UI 以靜態 HTML 為 SSOT，見 [`CRM_SIDEBAR_SSOT_M5.md`](./CRM_SIDEBAR_SSOT_M5.md)。

## SSOT

| 檔案 | 用途 |
|------|------|
| `sidebar_crm_journey.html` | **CRM 側欄 UI（唯一上線）** |
| `js/crm_journey_registry.js` | 角色、A–F primary、工具路徑、C 殼連結 |
| `js/crm_nav.js` | 雙欄導航輔助（非側欄 DOM 來源） |
| `js/crm_sidebar_render.js` | **已棄用、不上線**（歷史參考） |
| `js/church_triangle_nav.js` | 三扇門 URL（全站） |

## 側欄資訊架構（CRM · 靜態）

**規則：** 灰色 pin／details 分區；連結下方可用角標，不寫左欄/右欄/path。

| 區塊 | 行為 |
|------|------|
| 今日三步 | 永遠展開 · M3 唯一主路徑 |
| 回教會規劃 | 預設收合 · `bible100ShellNav` → `sidebar_plan` |
| Hub／角色 | 預設收合 · 右欄 Hub · 左欄保持 CRM |
| 事工區 A–F | 預設收合 · 雙欄切換；C 用 `sidebar_c_education_journey` |
| 進階 | 非主路徑 |

## 互聯 query

- `crm_from=hub` — 從 Hub 進工具  
- `crm_from=sidebar` / `crm` — 從 CRM 側欄進工具  
- `role` / `step` — 情境頂條與回 Hub 用  

## 波次（歷史）

| 波 | 範圍 | 狀態 |
|----|------|------|
| 1–3 | CRM＋A–E 互聯 | ✅ |
| M1–M4 | 字母／誠實 UI／入口／C 殼 | ✅ |
| **M5** | CRM 側欄單一 SSOT（靜態 HTML） | ✅ |

## 驗收

```bash
python tests/test_crm_sidebar_nav_contract.py
python tests/test_church_m2_honest_ui.py
python tests/test_church_m3_entry_paths.py
```
