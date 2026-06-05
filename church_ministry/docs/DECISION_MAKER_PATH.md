# 決策者一條路（Decision Maker Path）

> 給牧者／長執：從零到「看得懂戰情、派得動工、少填表」。  
> **互動地圖（中英標題 · 小語種友善）**：[`guide_crm_journey_hub.html`](../guide_crm_journey_hub.html) · [`guide_crm_for_leaders.html`](../guide_crm_for_leaders.html)  
> 規格全文：[`docs/CHURCH_ERP_OPERATION_SUBSYSTEM_SPEC.md`](../../docs/CHURCH_ERP_OPERATION_SUBSYSTEM_SPEC.md) · 品牌說明：[`docs/CRM_JOURNEY_BRAND.md`](./CRM_JOURNEY_BRAND.md)

## 第 0 步 · 資料就緒（10 分鐘）

1. 總站 → **教會事工** 模式  
2. 開啟 [`load_central_member_seed.html`](../load_central_member_seed.html) → 載入試用會友  
3. 儀表板查看 **CRM 就緒度**（目標 ≥70% 再推廣給全教會）

## 第 1 步 · 減少內耗（RACI + CTV）

| 順序 | 頁面 | 目的 |
|------|------|------|
| 1 | [`church_planning/planning/raci-reflection.html`](../../church_planning/planning/raci-reflection.html) | 權責清晰，避免重複派工 |
| 2 | [`church_planning/assessment-os-hub.html`](../../church_planning/assessment-os-hub.html) | 選 4～8 項評估（含 CTV） |
| 3 | [`church_planning/cta-os-war-room.html`](../../church_planning/cta-os-war-room.html) | 跨工具向量合成、風險預警 |

## 第 2 步 · 事工執行（一 ID 走全站）

| 缺口 | 走這裡 |
|------|--------|
| 會友／通訊錄 | [`modules/members/member-integrated.html`](../modules/members/member-integrated.html) |
| 小組 | [`small-groups-integrated.html`](../modules/fellowship/small-groups-integrated.html) |
| 探訪 | [`modules/support/visitation.html`](../modules/support/visitation.html) · 工作桌 [`visitation_index.html`](../modules/support/visitation_index.html) |
| 探訪跟進（A2） | [`tools/visitation_followup/index.html`](../tools/visitation_followup/index.html) |
| 義工＋CTV 排班（A1） | [`smart_ministry/talent_ministry_matching.html`](../../smart_ministry/talent_ministry_matching.html) → [`tools/volunteer_shift/index.html`](../tools/volunteer_shift/index.html) → [`volunteer-integrated.html`](../modules/volunteer/volunteer-integrated.html) |
| 財務對帳（A3，**可選**） | [`tools/finance_reconciliation/index.html`](../tools/finance_reconciliation/index.html) — 許多教會不在 CRM 記帳；略過不影響其他 CRM |

## 第 3 步 · 崇拜＋詩歌（收斂入口）

1. [`_landing/worship.html`](../_landing/worship.html) — 決策者總覽  
2. [`worship-integrated.html`](../modules/worship/worship-integrated.html) — 事工崗位  
3. [`hymn_management/index.html`](../../hymn_management/index.html) — 詩歌庫／投影（總站 embed）

## 第 4 步 · 主日學／學校

- 教會內簡表：[`education-integrated.html`](../modules/education/education-integrated.html)  
- 完整學籍：[`school_management/dashboard.html`](../../school_management/dashboard.html)（學生欄填 `memberId`）

## 第 5 步 · 自動化（HITL）

- 口述／文字：[`group-report-copilot.html`](../modules/fellowship/group-report-copilot.html)  
- **營運自動化（Intent 三工具）**：[`ai_tools/pages/crm_automation_console.html`](../../ai_tools/pages/crm_automation_console.html) — `volunteer_shift` · `visitation_followup` · `finance_reconciliation`（財務可選，只預填）  
- **同步健康**：總站 ⚡ **同步紀錄** 抽屜頂部「健康摘要」（本機 A1/A2；A3 0 筆正常）  
- CRM 戰情：[`dashboard.html`](../dashboard.html)  

**鐵律**：配對不自動派工；探訪不自動轉事奉；財務不強制進 CRM；通知預設複製稿人工發送。
