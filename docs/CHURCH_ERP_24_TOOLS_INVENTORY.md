# 24 工具接線盤點表（機器可讀摘要）

完整規格：[`CHURCH_ERP_OPERATION_SUBSYSTEM_SPEC.md`](./CHURCH_ERP_OPERATION_SUBSYSTEM_SPEC.md)

| # | 場景 | tool_id | 工具名稱 | 現有主要檔案 | 5頁 | 接線 |
|---|------|---------|----------|--------------|-----|------|
| 1 | 行政 | doc_assets | 文檔資產管理 | church_ministry/modules/library/library-management.html | N | STUB |
| 2 | 行政 | meeting_minutes | 會議記錄 | church_ministry/modules/fellowship/group-report-copilot.html | N | PARTIAL |
| 3 | 行政 | smart_directory | 智能通訊錄 | church_ministry/modules/members/member-integrated.html | N | LIVE |
| 4 | 行政 | dept_weekly | 部門周報 | church_ministry/modules/fellowship/groups-reports.html | N | STUB |
| 5 | 財務 | donation_online | 線上奉獻 | church_ministry/modules/finance/finance-integrated.html | N | PARTIAL |
| 6 | 財務 | finance_ledger | 收支記帳 | church_ministry/modules/finance/finance-management.html | N | PARTIAL |
| 7 | 財務 | bank_reconcile | 銀行對帳 | church_ministry/tools/finance_reconciliation/*（A3 可選；非強制 CRM） | N | PARTIAL |
| 8 | 財務 | finance_reports | 財報奉獻單 | church_ministry/modules/finance/finance-reports.html | N | PARTIAL |
| 9 | 事工 | small_groups | 團契小組 | church_ministry/modules/fellowship/small-groups-integrated.html | N | LIVE |
| 10 | 事工 | checkin_qr | 掃碼簽到 | church_ministry/modules/worship/attendance-management.html | N | PARTIAL |
| 11 | 事工 | ss_students | 主日學學員 | school_management/* + education-integrated.html | N | PARTIAL |
| 12 | 事工 | event_registration | 活動報名 | school_management/course_completion.html | N | PARTIAL |
| 13 | 事工 | attendance_stats | 出席率統計 | church_ministry/modules/analytics/activity-statistics.html | N | STUB |
| 14 | 義工 | volunteer_profile | 義工檔案 | church_ministry/modules/volunteer/volunteer-integrated.html | N | LIVE |
| 15 | 義工 | volunteer_shift | 智能排班 | church_ministry/tools/volunteer_shift/* + talent_ministry_matching | **Y** | **LIVE** |
| 16 | 義工 | volunteer_leave | 請假調班 | — | N | MISSING |
| 17 | 義工 | volunteer_hours | 工時累計 | volunteer-integrated.html（片段） | N | STUB |
| 18 | 崇拜 | worship_order | 程序單 | church_ministry/modules/worship/worship-management.html | N | STUB |
| 19 | 崇拜 | hymn_projection | 詩歌投影 | hymn_management/index.html | N | PARTIAL |
| 20 | 崇拜 | worship_attendance | 聚會人數 | attendance-management.html | N | PARTIAL |
| 21 | 崇拜 | worship_team_roles | 崗位聯動 | worship-integrated.html | N | PARTIAL |
| 22 | 外展 | visitation_followup | 探訪跟進 | church_ministry/tools/visitation_followup/* + visitation_index | **Y** | **LIVE** |
| 23 | 外展 | outreach_street | 街頭佈道 | church_ministry/modules/expansion/outreach-strategy.html | N | STUB |
| 24 | 外展 | mission_supply | 短宣物資 | church_ministry/modules/mission/mission-ministry.html | N | STUB |

**統計**：LIVE 6 · PARTIAL 12 · STUB 7 · MISSING 1

**路徑 SSOT（機器）**：[`js/church_tools_manifest.js`](../js/church_tools_manifest.js) · 人讀 [`church_planning/docs/TOOL_PATH_SSOT.md`](../church_planning/docs/TOOL_PATH_SSOT.md)

**A 收口（牧者一條路）**：`getSyncHealthSummary`（Bridge／Phase1）+ 總站同步抽屜；Intent 支援 A1/A2/A3（A3 可選，不影響 `finance-integrated` 等既有財務頁）。

**模板**：`church_ministry/_templates/tool-kit/`
