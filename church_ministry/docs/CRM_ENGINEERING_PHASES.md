# 教會 CRM · 工程分期（40% → 100%）

> 對照 [`CHURCH_CRM_BLUEPRINT.md`](./CHURCH_CRM_BLUEPRINT.md)。驗收以 **`ChurchDataBridge.getCrmMaturitySummary()`** 的 `percent` 為參考（非取代牧者分辨）。  
> **功能更新白話版**：[`CRM_RELEASE_NOTES_2026-05.md`](./CRM_RELEASE_NOTES_2026-05.md)（已同步至 `dashboard.html`、`planning-user-guide.html`）。

---

## 成熟度階段

| percent | phase | 含義 |
|---------|-------|------|
| 0–39 | `inventory` | 盤點、種子、鍵名對齊 |
| 40–69 | `standardize` | 主檔、階段、事件流、目錄 |
| 70–89 | `automate` | 提醒、漏斗、匯入 |
| 90–100 | `collaborate` | 360 常駐、部門無重複、雲端同工 |

**本次落地後預期**：有種子資料的開發環境約 **55–65%**（視是否已有配對與牧養事件而定）。

---

## Phase CRM-0（✅ 本次）

| ID | 交付 | 檔案 |
|----|------|------|
| CRM-0a | 屬靈階段常數 | `js/church_crm_constants.js` |
| CRM-0b | `listMinistryAssignmentsByMemberId` | `js/church_data_bridge.js` |
| CRM-0c | `pastoral_events_v1` + append/list | 同上 |
| CRM-0d | `syncMinistryCatalogFromVolunteer` | 同上 + 志工 `saveVolunteerSystemData` |
| CRM-0e | `evaluateNewcomerFollowUpAlerts` | 同上 |
| CRM-0f | `getCrmMaturitySummary` | 同上 + `dashboard.html` |
| CRM-0g | 360 時間軸含 pastoral/attendance | `getMember360Timeline` |
| CRM-0h | 藍圖與分期文件 | 本目錄 `docs/*` |

---

## Phase CRM-1（垂直做深 · 2–3 人週）

| ID | 任務 | 驗收 |
|----|------|------|
| CRM-1a | 探訪工作桌存檔 → `appendPastoralEvent` + 本機 `saveVisitationMission` | ✅ `visitation_index.html`；360 可見 `visitation` / `newcomer_followup` |
| CRM-1b | 會友整合頁：編輯 `spiritual_journey_stage`、`first_visit_date` | ✅ `member-integrated.html`；下拉來自 `ChurchCrmConstants` |
| CRM-1c | 會友匯出／匯入 JSON 一鍵 | ✅ `exportMemberSystemBundle` / `importMemberSystemBundle` |
| CRM-1d | 新人 alert → 一鍵開啟探訪工作桌（帶 `memberId`） | ✅ 儀表板工作桌 `buildVisitationDeskUrl` |

---

## Phase CRM-2（調查 ↔ 部門 · 2–4 人週）

| ID | 任務 | 驗收 |
|----|------|------|
| CRM-2a | SHAPE + 事奉能力 + 恩賜卷 → `attachAssessmentToTalent` | ✅ `cta_os_bridge` → `syncPlanningAssessmentFromCtaReport` |
| CRM-2b | 配對 `suggested` → 牧者確認 → `volunteer` 排班 | ✅ `confirmMinistryAssignment` / `promoteMinistryAssignmentToVolunteer` |
| CRM-2c | 志工頁「本崗建議人選」區塊 | ✅ `volunteer-integrated` 總覽區 |
| CRM-2d | `suggestStagePromotion` 規則 v1 | ✅ 儀表板工作桌「可晉升階段」 |

---

## Phase CRM-3（精簡交付 · 1–2 人週）

| ID | 任務 | 驗收 |
|----|------|------|
| CRM-3a | 側欄：核心 3 + 整合 6 + 探訪 2 + 研究索引 + 管理文件 | ✅ `sidebar.html` v3.1；無重複 dashboard/people |
| CRM-3b | `modules/analytics/*` → redirect `research/*` | ✅ 14 頁 `location.replace` 至同名 research |
| CRM-3c | 360 / 會友整合 進側欄「人員」 | ✅ 整合事工區塊含兩頁 |

---

## Phase CRM-4（分析層收斂 · 2 人週）

| ID | 任務 | 驗收 |
|----|------|------|
| CRM-4a | `modules/research/*` 僅讀 Bridge | ✅ `cm_research_snapshot.js` + KPI 列 |
| CRM-4b | 漏斗報表：各 `spiritual_journey_stage` 人數 | ✅ `spiritual-stage-funnel.html` |
| CRM-4c | 「我的工作桌」動態待辦 | ✅ `dashboard` `getCrmWorkbenchTodos` |

---

## Phase CRM-5（上雲 · 依 CLOUD_ROADMAP）

| ID | 任務 | 驗收 |
|----|------|------|
| CRM-5a | `USE_API` 分支 | ✅ `scripts/church_api_local_server.js` + `hydrateFromApi` |
| CRM-5b | Auth + RBAC | ✅ `church_auth.js` + `admin/cloud_login.html` + Bridge 寫入檢查 |
| CRM-5c | Sheets SSOT | ✅ `church_sheets_ssot.js` + `apps_script/CrmSheetsSsot.gs` |
| CRM-5d | 成熟度種子 ≥90% | ✅ `load_crm_maturity_seed.html` |
| CRM-5e | AI 牧養草稿（人工確認） | ✅ `ai-pastoral-draft.html` + `church_ai_pastoral_draft.js` |

---

## 100% 定義（勾選表 · A+B demo 範圍）

- [x] `getCrmMaturitySummary()` 可用（≥90 需種子＋配對＋牧養事件實資料）  
- [x] E1：360 API + 會友整合頁 + 探訪工作桌連結  
- [x] E2：儀表板四類待辦（新人／關懷／晉升／CTA-OS）  
- [x] E3：側欄精簡 + 志工崗位 SSOT + 配對確認 UI  
- [x] 問卷→配對→志工：CTA 報告 sync + 配對 proposed + 志工確認／排班  
- [x] 上雲 demo：CRM-5a–5e（本機 API／RBAC／Sheets 適配／成熟度種子／AI 草稿）  

---

*工時為單人週粗估；可與 `docs/CLOUD_ROADMAP.md` 並行規劃。*
