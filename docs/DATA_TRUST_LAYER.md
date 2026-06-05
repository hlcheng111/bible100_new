# 資料可信度層（Data Trust Layer）

> 版本：v1.1 · 共用腳本：`js/data_trust_badge.js`  
> 目的：讓牧者、同工、老師與小白**一眼看懂**數字從哪來、是否為 demo、會不會自動寫入或通知。

## 設計原則

1. **只說明、不寫入** — Badge 不修改業務 SSOT，僅渲染 UI。
2. **HITL 預設** — AI 路徑預設 `prefill_only`；教會 CRM 寫入需人工確認。
3. **Demo 不可當 KPI** — `demo` / `mixed` 狀態必須明示，禁止包裝成正式營運數字。
4. **不擴大架構** — 各頁呼叫 `DataTrustBadge.render*`；不新增第二套 SSOT。

## 資料狀態 `data_state`

| 值 | 小白文案 | 何時使用 |
|----|----------|----------|
| `real` | 真實填寫資料 | 僅正式填寫、無 demo 標記 |
| `demo` | A1／示範試用資料 | 僅種子或試用標記資料 |
| `empty` | 尚無資料 | 筆數為 0 |
| `disconnected` | 尚未連接資料層 | Bridge／DB 未載入 |
| `mixed` | 試用 + 真實填寫 | 同時存在 demo 與正式列 |

判斷 API：`DataTrustBadge.classifyDataState({ key, count, demoFlag, has_demo_rows, has_real_rows })`

## 寫入行為 `write_behavior`

| 值 | 小白文案 |
|----|----------|
| `read_only` | 僅讀取，不會寫入 |
| `prefill_only` | 只預填，不儲存 |
| `manual_save` | 會寫入本機（需勾選人工確認） |
| `auto_write` | 會自動寫入（預設未啟用） |

## 通知行為 `notify_behavior`

| 值 | 小白文案 |
|----|----------|
| `none` | 不會自動通知 |
| `copy_only` | 只產生文字，不會發送 |
| `browser_notification` | 可能使用瀏覽器通知 |
| `external_api` | 可能呼叫外部 API（未啟用時標示） |

## 儲存模式

`DataTrustBadge.getStorageModeLabel()` 讀取 `js/cloud_config.js`：

- 預設：**本機模式 · localStorage**
- `USE_API` / `USE_SHEETS_SSOT` / `USE_MOCK_CLOUD` 組合 → 雲端或混合說明

## 三大入口（v1.1）

| 入口 | 頁面 | 呼叫方式 |
|------|------|----------|
| 教會事工 | `church_ministry/index.html` | `renderChurchMinistryEntryTrust('churchMinistryTrustMount')` |
| 教會儀表板 | `church_ministry/dashboard.html` | `renderDataTrustBadge`（hub 變體） |
| 學校管理 | `school_management/index.html`、`dashboard.html` | `renderSchoolEntryTrust('schoolTrustMount')` |
| AI Lab | `ai_tools/ai_lab_landing.html` | `renderAiLabEntryTrust('aiLabTrustMount')` |
| 義工排班 A1 | `church_ministry/tools/volunteer_shift/*` | `VolunteerShiftTool.renderTrustBadge()` |
| 營運自動化 | `ai_tools/pages/crm_automation_console.html` | `renderDataTrustBadge` + `renderActionTrustNotice` |

## Demo 標記鍵

| 模組 | localStorage 鍵 | 清除 API |
|------|-----------------|----------|
| 義工排班 A1 | `volunteer_shift_demo_loaded_at` | `clearVolunteerShiftA1Demo()` |
| 學校管理 | `school_management_demo_loaded_at` | 手動清空 `schoolMasterDatabase` 或種子頁「清空並重新載入」 |

學校 `schoolMasterDatabase.meta.isDemoSeed` 於 `ensureSeedFull()` 寫入。

## 五頁模板內建（v1.2）

複製 `church_ministry/_templates/tool-kit/` 即含：

- 五頁 + `uat.html` + `tool.js`（`renderTrustBadge` / `getToolDataStats` / `notifySync`）
- 驗收總表：`church_ministry/tools/uat_index.html`

---

## 24 工具接入步驟（五頁模板）

1. 在 `index|dashboard|form|list|setting.html` 引入：

```html
<script src="../../../js/cloud_config.js"></script>
<script src="../../../js/data_trust_badge.js"></script>
```

2. 放置 `<div id="dataTrustMount"></div>`（dashboard/list 頂部或底部）。

3. 依頁面設定 options：

```javascript
DataTrustBadge.renderDataTrustBadge({
  mount: 'dataTrustMount',
  source_key: 'yourSystemData.entity',
  source_label_zh: '工具中文名',
  count: n,
  last_updated: '…',
  data_state: 'real', // 或 classifyDataState(...)
  write_behavior: 'manual_save', // form 頁
  notify_behavior: 'copy_only',  // 有邀請文字時
  privacy_level: 'normal',
  show_clear_demo: false
});
```

4. **form.html** 在送出鈕旁：

```javascript
DataTrustBadge.renderActionTrustNotice({
  mount: 'trustSaveNotice',
  write_behavior: 'manual_save',
  notify_behavior: 'none',
  requires_human_confirmation: true
});
```

5. 若工具有 demo 種子：載入時呼叫模組專用 `mark*DemoLoaded()`，並在 `tool.meta.json` 註明 `intent_actions` 與 `write_behavior`。

## 禁止事項（與治理規則一致）

- 不自動 LINE / WhatsApp / 簡訊
- 不讓 AI Intent 自動 `save*` 寫入
- 不把 demo KPI 當決策報表
- 不修改 `ChurchDataBridge` 對外 API 名稱

## 測試

```bash
node tests/test_volunteer_shift_bridge.js
python tests/test_church_crm_bridge.py
```

靜態檢查含：`test_data_trust_three_hubs`（三大入口 + `docs/DATA_TRUST_LAYER.md`）。
