# Ministry OS 全站理順基線（不改模組佈局）

## 1) 殼層規範（固定）

- 全站主入口與模組入口維持：`topbar -> sidebar -> iframe(content)`
- 不拆現有 iframe 架構，不改各模組 sidebar 與內容頁路徑
- `index_v5.html` 繼續作為總站殼；各模組 `index.html` 作為子殼

## 2) 本次已落地

- 新增 `js/shell_contract.js`
  - 目的：在執行期檢核三件事是否存在：
    - topbar（`.topbar` / `.shell-toolbar` / `#topWrap`）
    - `sidebarFrame`
    - `contentFrame`
  - 若不符合則輸出 warning，避免新頁面偏離殼層規範

- 已在以下入口掛載檢核：
  - `index_v5.html`
  - `church_ministry/index.html`
  - `ai_tools/index.html`
  - `disciple_dynamics/index.html`
  - `smart_ministry/index.html`
  - `church_planning/index.html`
  - `school_management/index.html`
  - `bible_study/index.html`
  - `hymn_management/index.html`

- 補齊殼層不一致頁面（不改模組內容）：
  - `disciple_dynamics/index.html`：改為標準 module shell（topbar + sidebar iframe + content iframe）
  - `ai_tools/index.html`：補 topbar，維持既有 sidebar/content iframe
  - `church_ministry/index.html`：補 topbar，維持既有 sidebar/content iframe

- 資料層收口（不改現有頁面流程）：
  - `js/persistence_provider.js` 新增 `getJson/setJson/getChurchScopedKey/getChurchId`
  - `js/central_member_db.js` 讀寫時自動正規化 `id/memberId`、補 `churchId`
  - `js/church_data_bridge_phase1.js` 寫入 `members/survey_logs` 時強制補 `church_id`
  - `js/smart_ministry_canonical_store.js` 改為優先走 `PersistenceProvider`，並在 canonical 記錄補 `church_id`

- 第三段（高風險直寫 localStorage 收口 + 告警）：
  - `js/church_data_bridge_phase1.js` 的 queue / observer / member mirror 路徑改為共用 storage wrapper（優先 provider，fallback 才 localStorage）
  - `js/smart_ministry_canonical_store.js` 的 migration 與主存取改為 wrapper，並輸出一次性 DataPolicy 告警
  - `js/church_data_bridge.js` 的 local provider 新增一次性 DataPolicy 告警（不阻斷）

- 先修（Stabilize）第一輪：
  - `church_ministry/modules/fellowship/small-groups-integrated.html`：`smallGroupsSystemData` 與 A 模組目標資料改為經 storage wrapper（優先 `PersistenceProvider`，fallback 才 localStorage）
  - `church_ministry/modules/tech/automation-workflow.html`：改讀 `ChurchDataBridgePhase1` 的 queue / observer 實際資料，並可直接執行 `flushQueue()`
  - `church_ministry/modules/fellowship/group-report-copilot.html`：新增 Human-in-the-loop 試點頁（口述回報 -> 結構化摘要 -> 人工確認 -> 提交與 workflow trigger）

- 先修（Stabilize）第二輪：
  - `church_ministry/modules/tech/ai-assistant.html`：由純關鍵字示範改為「資料感知回覆」（讀取 `ChurchDataBridge` 的會友/小組統計），回覆附 `source` 來源標記
  - `church_ministry/modules/tech/ai-assistant.html`：對話歷史讀寫改為 storage wrapper（優先 `PersistenceProvider`），避免新增直寫 localStorage 分散點

- 新能力（本輪已落地）：
  - `js/church_data_bridge.js`：新增 `submitSmallGroupVoiceReport/listSmallGroupVoiceReports`（正式語音回報資料模型 v1）
  - `js/church_data_bridge.js`：新增 `createGiftAssessmentSnapshot/listGiftAssessmentSnapshots`（恩賜測評版本化與快照）
  - `js/church_data_bridge.js`：新增 `getMember360Timeline`（會眾 360 Timeline 讀模型）
  - `js/church_data_bridge.js`：新增 `getDashboardQueryModel`（KPI 讀模型，避免頁面直接掃交易資料）
  - `church_ministry/modules/fellowship/group-report-copilot.html`：提交時同步寫入正式語音回報模型
  - `js/smart_ministry_canonical_store.js`：測評 attach 時同步落地版本化快照
  - `church_ministry/modules/research/trend-analysis.html`：圖表與表格改讀 `getDashboardQueryModel` + 語音回報資料
  - `church_ministry/modules/members/member-360-timeline.html`：新增 360 Timeline 視圖頁
  - `church_planning/dashboard-query-model.html`：新增讀模型檢視頁

## 3) 全站資料理順原則（本階段只定規，不重寫）

- 主鍵原則：`memberId` 為 canonical（`id` / `member_id` 視為相容別名）
- 多租戶原則：所有新寫入資料都必須可追溯 `church_id/churchId`
- 存儲原則：新代碼優先經 `PersistenceProvider`，避免新增直接 `localStorage.*` 分散點
- 相容原則：舊資料格式透過 bridge/adapter 正規化，不破壞現有頁面

## 4) 後續理順順序（不涉及新功能）

1. 先做「新增代碼管制」：禁止新增直寫 localStorage（舊碼先留）
2. 再做「ID 正規化收口」：集中在 bridge 層輸入輸出
3. 最後做「tenant 寫入強制」：新寫入若缺 churchId 即告警

---

本文件持續維護「整體理順」底線，並記錄已落地的新能力（語音回報模型、恩賜快照、360 Timeline、Dashboard Query Model）。

