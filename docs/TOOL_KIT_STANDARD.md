# 24 工具 · 五頁標準模板（Tool Kit Standard）

**版本**：2026-06-03  
**樣板實例**：`church_ministry/tools/volunteer_shift/`（首個 LIVE 工具）  
**複製來源**：`church_ministry/_templates/tool-kit/`

---

## 1. 固定檔案清單（每 tool_id 一資料夾）

```
church_ministry/tools/<tool_id>/
  index.html       # 任務式 Landing · 小白 3 步
  dashboard.html   # 只讀 Bridge KPI／圖表
  form.html        # 錄入 · CRM_INTENT_PREFILL · HITL 確認後才寫
  list.html        # 篩選清單
  setting.html     # 本機／雲端／權限
  uat.html         # 小白驗收（建議每工具一份）
  tool.meta.json   # 契約（含 data_trust）
  tool.js          # renderTrustBadge／getToolDataStats／notifySync
  _shared.css      # 五頁共用樣式
```

---

## 2. tool.meta.json 必填欄位

```json
{
  "tool_id": "example_tool",
  "scene": "volunteer|finance|admin|...",
  "label_zh": "顯示名稱",
  "label_en": "English label",
  "version": 1,
  "pages": ["index.html", "dashboard.html", "form.html", "list.html", "setting.html"],
  "bridge": {
    "read": ["getMembers"],
    "write": ["saveExample"]
  },
  "required_permissions": {
    "dashboard": "volunteer.read",
    "form": "volunteer.write",
    "list": "volunteer.read",
    "setting": "crm.admin"
  },
  "intent_actions": [
    "example_tool.create",
    "example_tool.update"
  ],
  "offline_ok": true
}
```

---

## 3. DataTrustBadge（必填 · v1.2）

**所有 24 工具五頁套件必須內建** [`js/data_trust_badge.js`](../../js/data_trust_badge.js) + `tool.js` → `renderTrustBadge()`。規格詳見 [`DATA_TRUST_LAYER.md`](./DATA_TRUST_LAYER.md)。

### tool.meta.json → `data_trust`

| 欄位 | 說明 |
|------|------|
| `source_key` | SSOT 路徑，例 `volunteerSystemData.schedules` |
| `source_label_zh` | 小白可讀名稱 |
| `demo_marker_key` | 例 `{tool_id}_demo_loaded_at`（載入種子時 `ToolKit.markDemoLoaded()`） |
| `demo_seed_page` | 例 `load_a1_demo.html`（可選） |
| `privacy_level` | `normal` / `sensitive` / `pastoral_sensitive` / `finance_sensitive` |
| `auto_notify` | **必須 `false`**，除非另有 HITL 文件 |
| `uat_page` | 例 `uat.html` |
| `write_behavior` | 各頁：`read_only` / `manual_save` / `prefill_only` |
| `notify_behavior` | `none` / `copy_only`（清單有邀請稿時） |

### 各頁最低要求

| 頁 | DataTrust | 按鈕旁說明 |
|----|-----------|------------|
| index | `#dataTrustMount` · `read_only` | 連結 `uat.html` + `../uat_index.html` |
| dashboard | `read_only` | — |
| form | `manual_save` | `renderActionTrustNotice`：會寫入本機、需人工確認、不會自動通知 |
| list | `read_only` + `copy_only`（若有邀請文字） | 同上（notify copy_only） |
| setting | 顯示 storage 模式、Bridge read/write、demo 標記 | — |

### tool.js 必備 API

- `renderTrustBadge(mountId, extra)`
- `getToolDataStats()`（實作時接 Bridge）
- `notifySync()`
- `markDemoLoaded()` / `isDemoLoaded()`

複製模板時替換：`{{TOOL_ID}}`、`{{SOURCE_KEY}}`、`{{PRIVACY_LEVEL}}`。

---

## 4. UI 規範

| 項目 | 規範 |
|------|------|
| CSS | `unified_module_styles.css` + `church_ministry_ui.css` + `_shared.css` |
| 返回列 | `.cm-back-bar` → 工具 index + 教會儀表板 |
| 分頁 nav | `.cm-tool-nav` 五 tab，當前頁 `aria-current="page"` |
| 空狀態 | 說明原因 + 一個明確連結（種子／上一步工具） |
| KPI | **禁止**假數字；只讀 `ChurchDataBridge` 方法 |

---

## 5. form.html 契約

1. `id="crmIntentForm"` + `data-crm-intent="<tool_id>.create"`  
2. 必勾 `#humanConfirm` 才允許 submit  
3. 實作 `window.applyCrmIntentToForm(payload)`  
4. 監聽 `message`：`event.data.type === 'CRM_INTENT_PREFILL'`  
5. 成功後 `parent.postMessage({ type: 'SYNC_OBSERVER_UPDATED', module: tool_id }, '*')`  
6. **禁止**在 Intent 路由中自動 submit

---

## 6. CRM Intent 對接

| target_tool | 表單路徑 |
|-------------|----------|
| `volunteer_shift.create` | `church_ministry/tools/volunteer_shift/form.html` |
| `ministry_matching.suggest` | 同上 |
| `pastoral_alert.create` | `church_ministry/modules/support/visitation_index.html` |

路由：`js/crm_intent_router.js` → `routeForPrefill()` → `postPrefillToFrame()`  
控制台：`ai_tools/pages/crm_automation_console.html`

Intent 欄位（v2）：

- `intent_id`, `actor_role`, `confidence`, `target_tool`, `action`  
- `person_id` / `member_id`, `payload`, `risk_flags`  
- `required_human_confirmation`, `suggested_next_actions`

---

## 7. Bridge 寫入原則

- 新增 API 加在 `js/church_data_bridge.js`，**不改**既有 storage 鍵名  
- 寫入前 `assertRbac`（若啟用）  
- 活動 log：`logActivity(..., 'tool_id')`  
- 時間戳：使用模組內 `nowIso()` helper

---

## 8. 驗收清單（每工具上線前）

- [ ] 五頁 + `tool.js` + `uat.html` 可互跳  
- [ ] **五頁皆含** `data_trust_badge.js` 與 `#dataTrustMount`  
- [ ] index 有 **「小白驗收檢查」** → `uat.html`  
- [ ] form 儲存後 dashboard／list 同一筆可見  
- [ ] CRM 控制台可預填 form（不自動存）  
- [ ] 無新 localStorage 永久鍵（除 `{tool_id}_settings_v1`、demo 標記鍵）  
- [ ] 更新 `docs/CHURCH_ERP_24_TOOLS_INVENTORY.md` 與 [`tools/uat_index.html`](../church_ministry/tools/uat_index.html)  

---

## 9. Codex 批量 Prompt 模板

```
複製 church_ministry/_templates/tool-kit/ → church_ministry/tools/<tool_id>/
替換 {{TOOL_ID}} / {{TOOL_LABEL_ZH}}，實作 tool.meta.json bridge.read/write
dashboard/list 只呼叫 ChurchDataBridge 既有或新增方法
form 接 saveXxx；通過 node tests/test_volunteer_shift_bridge.js 模式加專項測試
```
