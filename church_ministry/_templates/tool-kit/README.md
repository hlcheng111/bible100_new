# 教會 ERP 工具 · 標準 5 頁模板

複製本資料夾為 `church_ministry/tools/<tool_id>/`，替換佔位符：

| 佔位符 | 說明 |
|--------|------|
| `{{TOOL_ID}}` | 如 `volunteer_shift` |
| `{{TOOL_LABEL_ZH}}` | 如 `義工智能排班` |
| `{{REL_ROOT}}` | 自 `tools/<id>/` 到專案根：`../../../` |

## 五頁

1. `index.html` — 任務式 Landing（小白 3 步）
2. `dashboard.html` — Bridge 圖表／KPI
3. `form.html` — 錄入 + `data-crm-intent`（供 AI 填表）
4. `list.html` — 篩選清單
5. `setting.html` — RBAC／工作流開關

## 必載腳本（form / list / dashboard）

```html
<script src="{{REL_ROOT}}js/persistence_provider.js"></script>
<script src="{{REL_ROOT}}js/church_data_bridge.js"></script>
<script src="{{REL_ROOT}}js/church_auth.js"></script>
```

## 規格全文

- [`docs/TOOL_KIT_STANDARD.md`](../../../docs/TOOL_KIT_STANDARD.md) — **正式五頁標準**
- [`docs/CHURCH_ERP_OPERATION_SUBSYSTEM_SPEC.md`](../../../docs/CHURCH_ERP_OPERATION_SUBSYSTEM_SPEC.md)

## 檔案清單（9 項）

`index.html` · `dashboard.html` · `form.html` · `list.html` · `setting.html` · `uat.html` · `tool.meta.json` · `tool.js` · `_shared.css`

複製後必換：`{{TOOL_ID}}` · `{{TOOL_LABEL_ZH}}` · `{{SOURCE_KEY}}` · `{{PRIVACY_LEVEL}}`
