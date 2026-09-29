# M3 · 會友／探訪／志工 · 單一主路徑（ENTRY SSOT）

> **狀態**：2026-07-23 落地  
> **驗收**：無第二套「主入口」宣傳搶同一任務；捷徑可留，文案須標「同主路徑」。  
> **測試**：`python tests/test_church_m3_entry_paths.py`

---

## 三條唯一主路徑

| 任務 | 唯一主路徑（相對 `church_ministry/`） | 標準顯示名 | `data-m3-entry` |
|------|----------------------------------------|------------|-----------------|
| 會友 | `modules/members/member-integrated.html` | **會友主檔** | `members` |
| 探訪 | `modules/support/visitation_index.html` | **探訪工作桌** | `visitation` |
| 志工日常排班 | `tools/volunteer_shift/index.html` | **義工排班** | `volunteer` |

**全站宣傳主場**：`sidebar_church_layout_v1.html` 行政分支「日常三步」（M2＋M3）。  
獨立 CRM 側欄已廢品牌（見 `PLAN_ADMIN_TWO_BRANCH_V1.md`）。

---

## 允許的「同頁捷徑」（非第二產品）

| 位置 | 允許 | 文案要求 |
|------|------|----------|
| B 牧養側欄 | 探訪可當本區主入口；會友僅捷徑 | 會友標「同 CRM／F」 |
| F 行政側欄 | 會友可當本區主入口 | 標準名「會友主檔」 |
| E 社會服務 | 義工排班＝主路徑；`volunteer-integrated` 進階 | 禁止與排班並列兩個「主入口」 |
| Hub／儀表板 | 可連同一 URL | 禁止另發明「跟進台／全自動／名冊」當第二品牌 |

## 降級（非主路徑）

| 路徑 | 角色 |
|------|------|
| `modules/volunteer/volunteer-integrated.html` | 志工**體系／進階**（招募、崗位），非「今日排班」主宣傳 |
| `tools/visitation_followup/*` | A2 跟進子工具，從探訪工作桌進入 |
| `people/people_list.html` | 人員索引捷徑，非會友主檔 |
| `smart_ministry/registration.html` | 舊註冊入口，Hub 折疊區可留，不稱主路徑 |

---

## 頂欄對齊

| 頂欄 | path 應對準 |
|------|-------------|
| E. 社會服務 | `…/tools/volunteer_shift/index.html`（與今日三步同一 URL） |
| F 內會友 | 由側欄／儀表板進 `member-integrated` |

---

## 與轉型 A/B/C

- 三條主路徑＝**類 A** 平移對象。  
- `volunteer-integrated`／Hub 理念頁＝**類 B** 雙軌或進階，不搶類 A 品牌。
