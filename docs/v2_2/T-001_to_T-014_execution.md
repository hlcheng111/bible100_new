# Bible100 V2.2 工程任務執行紀錄（T-001～T-020）

> 模式：v2（Sheets SSOT）  
> 限制：預設 `WRITE_LAYER_ENABLED=false`；寫入 API 已實作但不上線啟用。

## T-001 凍結舊主線 canonical（localStorage）

- 內容：啟用 v2 preset，並保留舊主線不改寫原有 localStorage canonical。
- 實作：僅新增 v2 並行層，不修改 `smart_ministry` / 問卷 canonical 寫入路徑。
- 驗收：既有頁面 localStorage key 行為不變；v2 新增檔案不引用舊主線寫入邏輯。

## T-002 建立 Sheets SSOT 空表結構（模板）

- 內容：在 Apps Script schema 中凍結表名與必備欄位，作為建表模板。
- 實作檔：`v2/apps_script/Schema.gs` (`SSOT_SCHEMA`)。
- 驗收：`getSchemaStatus` 可逐表檢查缺欄/缺表。

## T-003 建立只讀 API 入口

- 內容：建立 `doGet` + `action` 分派；`doPost` 走寫入 action dispatcher 與安全閘。
- 實作檔：`v2/apps_script/ApiRouter.gs`。
- 驗收：`?action=getCourseList` 有 JSON 信封；`WRITE_LAYER_ENABLED=false` 時，所有 `post*` 皆回 `WRITE_DISABLED`。

## T-004 導覽與 AI 工具列改為 Sheets 驅動（並保留 fallback）

- 內容：前端新增讀取 `getNavigationMap` / `getAiToolsConfig` 的 bootstrap。
- 實作檔：`v2/js/sheets_driven_ui.js`、`v2/index.html`。
- 驗收：提供 `apiBase` 時使用 Sheets API 回填；未提供時保持原本 routes。

## T-005～T-010 讀取層 API（欄位契約）

- `getCourseList`
- `getQnaList`（含 `format=html`）
- `getBibleVersions`
- `getHymnList`
- `getNavigationMap`
- `getAiToolsConfig`
- `getPlanningKpi`（主表 + SWOT/SMART/PDCA/Health 組裝）
- `getMinistryLogs`
- `getDriveFolderIndex`（保留介面，預設 disabled）

實作檔：`v2/apps_script/ReadOnlyApis.gs`

驗收方式：

1. 以 Web App URL 呼叫 `?action=getSchemaStatus`，確認各表 `ok=true`。
2. 分別呼叫各 `getXxx`，確認 `ok/action/data/meta` 結構。
3. `getQnaList&format=html` 回傳 `data.items` 與 `data.html`。

## T-011～T-014 寫入層預備（僅骨架）

- 內容：建立 payload 驗證、冪等 key、record 組裝骨架。
- 實作檔：`v2/apps_script/WriteLayerSkeleton.gs`
- 驗收：`?action=getWriteLayerReadiness` 可反映開關狀態。

## T-015：postFormWebhook（寫入 registrations）

- 實作：`postFormWebhook_` + `validateRegistrationPayload_` + 冪等檢查（`form_response_id + course_id`）。
- 行為：可選 `create_member=true` 建立 member（白名單欄位）。
- 實作檔：`v2/apps_script/WriteApis.gs`

## T-016：ministry_logs 寫入層

- 實作：`safeLogEvent_`，覆蓋 `doGet/doPost` 錯誤與寫入層事件記錄。
- 安全：details 自動遮罩 email，限制長度。
- 實作檔：`v2/apps_script/WriteApis.gs`、`v2/apps_script/ApiRouter.gs`

## T-017：planning_kpi 寫入層

- 實作：`postPlanningKpi_` 支援 KPI 主表 + SWOT/SMART/PDCA/Health 子表白名單寫入。
- 實作檔：`v2/apps_script/WriteApis.gs`

## T-018：members 寫入層（可選）

- 實作：`postMember_`，僅 `email/full_name/roles/lang/status`。
- 安全：不接受 phone/address 等敏感欄位。
- 實作檔：`v2/apps_script/WriteApis.gs`

## T-019：Smart Ministry 去識別匯出

- 實作：`postSmartMinistryExport_` 僅允許摘要/分數類欄位。
- 阻擋：`raw/responses/member_id/email/full_name`。
- 實作檔：`v2/apps_script/WriteApis.gs`

## T-020：寫入層最終整合（不啟用）

- 實作：`isWriteLayerEnabled_` / `isLogWriteEnabled_` 與 `getWriteLayerReadiness_`。
- 預設：`WRITE_LAYER_ENABLED=false`，需手動開關才允許寫入。
- 實作檔：`v2/apps_script/WriteConfig.gs`、`v2/apps_script/WriteLayerSkeleton.gs`

## 附加完成項（你要求的剩餘工程主體）

1. **B-C 欄位逐表核對**：`docs/v2_2/BC_field_contract_audit.md`
2. **試算簿建置與測試資料腳本**：`v2/apps_script/BootstrapSkeleton.gs`（create/seed；需開關）
3. **部署與權限策略**：`docs/v2_2/WEBAPP_DEPLOYMENT_SECURITY.md`
4. **跨頁接線**：`index_v5.html`、`ai_tools/index.html` 接入 `js/ssot_shell_bridge.js`
5. **回歸測試計畫**：`docs/v2_2/REGRESSION_TEST_PLAN.md`
