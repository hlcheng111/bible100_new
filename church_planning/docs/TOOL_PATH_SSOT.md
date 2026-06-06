# 教會工具路徑 SSOT（Batch 1 · GitHub）

**版本**：2026-06-05  
**機器可讀清單**：[`js/church_tools_manifest.js`](../../js/church_tools_manifest.js)  
**規劃問卷 SSOT**：[`js/planning_tool_registry.js`](../js/planning_tool_registry.js)  
**24 工具盤點**：[`docs/CHURCH_ERP_24_TOOLS_INVENTORY.md`](../../docs/CHURCH_ERP_24_TOOLS_INVENTORY.md)

---

## 1. 三層分類（易認、防 sidebar 亂闖）

| 層 | 用途 | 目錄慣例 | 檔名慣例（現行 → Batch 2 目標） | 側欄擁有者 |
|----|------|----------|----------------------------------|------------|
| **planning** | 5F 十四項量表、RACI、戰情室 | `church_planning/` | 現：`*.html` 根目錄 → 目標：`tools/tool_{id}.html` | `sidebar_plan.html` |
| **guide** | 七步故事線「本步導覽」 | `church_planning/guides/` | `guide_step{N}_{topic}.html` | `sidebar_plan.html` |
| **crm** | 4F 會友／探訪／排班等 | `church_ministry/modules/`、`tools/` | 現：模組路徑 → 目標：`crm/crm_{tool_id}.html` | `sidebar_crm_journey.html` |
| **crm_guide** | CRM 理念、試玩、角色入口 | `church_ministry/` | `guide_crm_*.html` | `sidebar_crm_journey.html` |
| **automation** | 同步佇列、AI 營運輔助（HITL） | `church_ministry/modules/tech/`、`ai_tools/pages/` | 目標：`auto/auto_{id}.html` | 頂欄 AI／Bridge 文件指向 |

**禁止**：在 sidebar 硬編未登記路徑；新增工具必先更新 manifest + registry。

---

## 2. Batch 1（本批 · 只整理、不大改名）

- [x] 步驟導覽 → `church_planning/guides/guide_step*.html`
- [x] 舊檔名留 **301 式 stub**（`guide_planning_step*.html` → `guides/`）
- [x] 暫存／UAT → `church_planning/_archive/`（不進主流程 sidebar）
- [x] 全站清單 → `js/church_tools_manifest.js`
- [ ] **未做**：十四量表整批改名 `tool_*.html`（Batch 2）
- [ ] **未做**：上雲部署包、`dist/` 精簡樹（Batch 2 預備）

---

## 3. 新增頁面檢查表

1. 在 manifest 加一列：`layer`、`id`、`path`（根相對）、`status`（live|partial|stub|planned|missing）、`sidebar`
2. 規劃問卷另同步 `planning_tool_registry.js`
3. 側欄只引用 manifest／registry 的 `path`，勿自造 URL
4. 跑 `python tests/test_church_tools_manifest.py` + `python tests/test_church_nav_ui_contract.py`

---

## 4. 與 v2 雲端關係

上雲為 **預備**：manifest 預留 `targetPath` 欄位供 Batch 2 改名；本批 **不** 打包 Apps Script／Sheets 部署。
