# 教會 CRM／規劃整合 · 功能更新紀錄（2026-05）

> **適用頁面**：`church_ministry/dashboard.html`、`church_planning/planning-user-guide.html`  
> **工程分期**：[`CRM_ENGINEERING_PHASES.md`](./CRM_ENGINEERING_PHASES.md)（CRM-0～CRM-5 已勾選 demo 完成）  
> **上雲細節**：[`CRM-5_CLOUD_AUTH_SHEETS.md`](./CRM-5_CLOUD_AUTH_SHEETS.md)

**最後更新**：2026-05-28

---

## 總覽

| 主線 | 狀態 | 一句話 |
|------|------|--------|
| 教會 CRM 底座 | ✅ | `ChurchDataBridge` + 屬靈階段／牧養事件流 |
| 垂直做深（探訪・會友） | ✅ | 探訪工作桌、會友 CRM 欄位、匯入匯出 |
| 調查 ↔ 事工部門 | ✅ | CTA-OS → Smart Ministry；配對 → 志工排班 |
| 側欄精簡 | ✅ | `sidebar.html` v3.1 |
| 分析與工作桌 | ✅ | 漏斗、Bridge KPI、四類待辦 |
| 上雲 demo | ✅ | 本機 API、RBAC、Sheets 適配、AI 草稿（人工確認） |

**成熟度**：儀表板顯示 `getCrmMaturitySummary().percent`；要 **≥90%** 請執行 [`load_crm_maturity_seed.html`](../load_crm_maturity_seed.html)。

---

## CRM-0 · 底座

- `js/church_crm_constants.js`：屬靈階段 `seeker` → `leader`
- `pastoral_events_v1`、`appendPastoralEvent` / `listPastoralEvents`
- `evaluateNewcomerFollowUpAlerts`（新人 SLA）
- `syncMinistryCatalogFromVolunteer`
- `getCrmMaturitySummary`、`getMember360Timeline`
- 文件：`CHURCH_CRM_BLUEPRINT.md`、`CRM_ENGINEERING_PHASES.md`

## CRM-1 · 垂直做深

| ID | 功能 |
|----|------|
| 1a | `visitation_index.html` 存檔寫入牧養事件 |
| 1b | `member-integrated.html`：屬靈階段、初來日期 |
| 1c | `exportMemberSystemBundle` / `importMemberSystemBundle` |
| 1d | 儀表板工作桌 → `visitation_index.html?memberId=` |

## CRM-2 · 規劃 ↔ 部門

| ID | 功能 |
|----|------|
| 2a | `cta_os_bridge` 生成報告 → `syncPlanningAssessmentFromCtaReport` |
| 2b | `confirmMinistryAssignment` / `promoteMinistryAssignmentToVolunteer` |
| 2c | 志工整合頁「本崗建議人選」（proposed） |
| 2d | `suggestStagePromotion` → 工作桌「可晉升階段」 |

## CRM-3 · 側欄精簡

- 核心 3 + 整合 6 + 牧養 2 + 研究索引 + 管理文件
- `modules/analytics/*` → 導向 `modules/research/*`

## CRM-4 · 分析層

- `cm_research_snapshot.js`：研究頁讀 Bridge KPI
- `spiritual-stage-funnel.html`：教會級階段漏斗
- `getCrmWorkbenchTodos`：新人／關懷／晉升／CTA-OS

## CRM-5 · 上雲 demo

| ID | 功能 |
|----|------|
| 5a | `scripts/church_api_local_server.js` |
| 5b | `church_auth.js`、`admin/cloud_login.html`；`index_v5`／`dashboard` 預載 |
| 5c | `church_sheets_ssot.js`、`apps_script/CrmSheetsSsot.gs` |
| 5d | `load_crm_maturity_seed.html` |
| 5e | `ai-pastoral-draft.html`（Prompt → 外部 LLM → 人工確認寫入） |

---

## 教會規劃（CTA-OS）連動

- 戰情室：`cta-os-war-room.html`（載入 Bridge）
- 評估工具完成 CTV 報告後同步至 Smart Ministry `attachAssessmentToTalent`
- 規劃風險項可出現在教會事工儀表板「CTA-OS」待辦

---

## 預設腳本載入（2026-05-28）

- `index_v5.html`：`cloud_config` → `cloud_api` → `church_auth`
- `church_ministry/dashboard.html`、`church_ministry/index.html`：同上順序

---

## 仍須牧者／工程另案

- 正式 HTTPS 後端與 JWT（取代 demo 帳密）
- Google Sheets 部署後設 `USE_SHEETS_SSOT`
- 站內 LLM API（治理上維持人工確認，不自動派工）
