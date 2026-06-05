# V2.2 回歸測試計畫（跨頁接線）

## A. Shell/首頁

1. `index_v5.html` 開啟後可正常載入中文教材（既有流程）。
2. 設定 `localStorage.b100_v2_api_base=<webapp-url>` 後，`contextBar` 會附加 `navigation_map` 捷徑按鈕。
3. 切換 mode（material/explorer/church/ai）不影響既有 iframe 導航。

## B. AI Tools

1. `ai_tools/index.html` 既有 sidebar + contentFrame 可用。
2. 設定 API Base 後右上角出現 `Sheets AI 工具捷徑` 區塊。
3. 點擊捷徑應在 `contentFrame` 載入對應 URL。

## C. v2 Shell

1. `v2/index.html` 在無 API Base 時保留內建 routes（fallback）。
2. 有 API Base 時從 `navigation_map` 與 `ai_tools_config` 回填 UI。

## D. API 唯讀

必測 action：

- `getCourseList`
- `getQnaList`
- `getBibleVersions`
- `getHymnList`
- `getNavigationMap`
- `getAiToolsConfig`
- `getPlanningKpi`
- `getMinistryLogs`
- `getSchemaStatus`
- `getWriteLayerReadiness`

## E. API 寫入閘門

1. `WRITE_LAYER_ENABLED=false`：`postFormWebhook/postPlanningKpi/postMember/postSmartMinistryExport` 皆回 `WRITE_DISABLED`。
2. `WRITE_LAYER_ENABLED=true`：白名單欄位可寫入；違規欄位／raw 應被拒絕。
