# B-C 欄位逐表最終核對（V2.2）

## 核對來源

- 規則：`.cursor/rules/bible100-v2-preset-v2-sheets-ssot.mdc`
- 遷移藍圖：`.cursor/rules/bible100-v2-migration-m001-m010.mdc`
- 橋接規則：`.cursor/rules/bible100-v2-bridge-localstorage-sheets.mdc`
- 程式實作：`v2/apps_script/Schema.gs`

## 核對結果

| 表名 | 結果 | 備註 |
|------|------|------|
| `courses` | PASS | 已對齊唯讀 `getCourseList` |
| `registrations` | PASS | 已對齊 `postFormWebhook` 白名單 |
| `navigation_map` | PASS | 已對齊 `getNavigationMap` 與前端橋接 |
| `qna_sources` | PASS | 已對齊 `getQnaList` join |
| `qna_items` | PASS | 已對齊 `getQnaList` join |
| `bible_versions` | PASS | 已對齊 `getBibleVersions` |
| `hymns` | PASS | 已對齊 `getHymnList` |
| `playlists` | PASS | 已對齊 schema，讀取擴展待下一版 |
| `playlist_items` | PASS | 已對齊 schema，讀取擴展待下一版 |
| `ai_tools_config` | PASS | 已對齊 `getAiToolsConfig` 與 UI 橋接 |
| `planning_kpi` | PASS | 已對齊 `getPlanningKpi` / `postPlanningKpi` |
| `planning_swot` | PASS | 已對齊 `getPlanningKpi` / `postPlanningKpi` |
| `planning_smart` | PASS | 已對齊 `getPlanningKpi` / `postPlanningKpi` |
| `planning_pdca` | PASS | 已保留欄位 `do`（不改名） |
| `planning_health` | PASS | 已對齊 `getPlanningKpi` / `postPlanningKpi` |
| `ministry_logs` | PASS | 已對齊 `getMinistryLogs` 與 `safeLogEvent_` |
| `members` | PASS | 已對齊 `postMember` 白名單 |

## 風險提示

1. `planning_pdca.do` 在 GAS 程式語境較易混淆，已以物件鍵值字串直接讀寫，避免關鍵字衝突。
2. `members.phone` 存在於 schema，但 `postMember` 目前故意不寫入（PII 最小化）。
3. Smart Ministry 匯出僅允許去識別摘要，程式已拒絕 `raw/responses/member_id/email/full_name`。
