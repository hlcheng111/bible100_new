# 優化方向與技術摘要 OPTIMIZATION_SUMMARY

**用途**：記錄全站優化傾向與技術決策摘要；細節見各專題文件。

---

## 問卷與靈命／教牧調查的共用實作

- **全站問卷原則與三份對齊報告**（進度、算法門檻、技術總覽、localStorage 真實 key）：  
  **`docs/SURVEY_DESIGN_PRINCIPLES.md`**
- 信徒靈命審查與教牧專業版，目標共用 `church_planning/js/spiritual_health_scoring.js`（`normalizeScore` / `computeDimensionScores` / `levelFromScore`）。
- **教牧／信徒卷專用**實作細節（id、DOM、iframe、JS 路徑等）：  

  `church_planning/docs/PASTORAL_MEMBER_IMPLEMENTATION_NOTES.md`

- 未來若增設新問卷（例如小組長版），優先沿用共用模組與 **`SURVEY_DESIGN_PRINCIPLES.md`** 之約定，並同步更新該檔 §三～§五。
- **教會規劃工具**（含 **80/20** `church_planning/ministry-8020-planning.html`）：不接 `spiritual_health_scoring.js`；掛號與技術欄見該檔 §三「規劃工具」與 §五。
- **屬靈恩賜** `smart_ministry/spiritual_gifts.html`：§三 狀態 `已完成`；報告區可 **複製結果 JSON**。

**入口對照**：工具與路徑亦見 `docs/TOOLS_AND_ENTRY_REFERENCE.md`（「Church Planning／問卷與調查工具」小節）。

---

## Landing／模組入口 UX（跨模組）

- **Bible 100 · AI Lab v2（本機檔案路徑）**：主入口為 `bible100_new/ai_tools/ai_lab.html`（**雙 iframe**：左 `sidebar_lab.html`、右 `contentFrame` 預設載入 **`ai_lab_landing.html`**；總覽為單頁捲動，含 `#dashboard`／`#ab-hub` 等區塊）。殼層 `postMessage` 導向空路徑時對應 **`ai_lab_landing.html`**。讀經主工作站仍為 `ai_tools/pages/guide_reading_hub.html`。`file://` 下 nested iframe 若異常，可改開 `ai_lab_landing.html` 或直接以本機靜態伺服器從 `ai_tools` 提供 http。
- **原則與待套用模組清單**：`docs/LANDING_UX_PRINCIPLES.md`
- **智慧事奉 · 牧者／同工指南**：`smart_ministry/guide_for_leaders.html`
- **進階自我認識工具（MBTI 簡化／DISC／SHAPE）原則與約束**：`smart_ministry/docs/ADVANCED_SELF_KNOWLEDGE_TOOLS.md`

---

## Smart Ministry 四步主線 URL（單一對照 · 2026-04）

| 步驟 | 角色 | 主入口 | 備註 |
|------|------|--------|------|
| ① Be known | 會友 | `smart_ministry/registration.html`、`spiritual_gifts.html` | 進階性格工具見 landing 摺疊區 |
| ② Discern | 同工 | `smart_ministry/talent_skill_unified.html` | `talent_acquisition.html` 為進階／集線 |
| ③ Fit | 同行 | `smart_ministry/talent_ministry_matching.html` | `ai_matching.html` 為進階實驗 |
| ④ Grow | 同行 | `smart_ministry/talent_tracking.html` | `dashboard.html` 為領袖總覽（非主線第一步） |

**Legacy／轉址（書籤仍有效，不掛側欄主線）**

- `talent_main_survey.html` → 轉址 `spiritual_gifts.html`
- `matching.html` → 轉址 `talent_ministry_matching.html`
- `ai_analytics_dashboard.html` 不列主路線；若檔案仍存在僅供研究／舊連結

**內部 DEMO（僅開發／培訓）**：`talent_pool_demo.html`、`export_talent_stats_demo.html` — 見側欄「內部 DEMO」摺疊，不當會友入口。

---

## 教會規劃 × 智慧事奉 聯營（摘要）

- 個人／人才資料：**Smart Ministry**；教會層健康與 SWOT／SMART／PDCA：**church_planning**。
- 銜接方式：**理念＋手動匯出**（JSON／CSV／報表），非自動黑盒串分。快速文案見 `church_planning/church-planning-index.html`、`index_plan.html`。

---

## 上雲、BaaS 與跨模組分析（預留）

- **設計備忘與下一輪 UX 對象頁**：`docs/CLOUD_BAAS_AND_CROSS_MODULE.md`（後端／登入權限、統一鍵、集中儲存；建議下一輪與「配對頁」同一牧者向改良的模組為 **`talent_skill_unified.html`**、**`talent_tracking.html`**）。
- **配對主線頁** `smart_ministry/talent_ministry_matching.html`：同上，並含首屏一句話、選崗後 **前往②** 按鈕、寫入紀錄鏈結 **talent_tracking**。  
- **技能字典** `skills_expertise.html`：改為 **talent_skill／崗位需求聚合** + `meta.skill_catalog_v1` 維護，移除個人勾選大表。  
- **AI 三頁**、**追蹤**、**Smart dashboard**、**Planning（80/20／戰情／SWOT／SMART／PDCA）**：依 **`docs/UX_CHECKLIST_SMART_PLANNING.md`** 驗收。PR 粒度見 **`docs/SMART_PLANNING_UX_PR_PLAN.md`**。
