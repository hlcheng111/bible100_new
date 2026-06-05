# 探訪工作桌：localStorage → Supabase 遷移方案草稿 v0.1

對應頁面：`church_ministry/modules/support/visitation_index.html`  
客戶端草稿：`docs/schema/visitation_supabase_client_v0.1.js`  
API 大綱：`docs/schema/supabase_church_core_api_v0.1.md`

本檔僅為設計說明，**不修改**既有 HTML／JS 原檔。

---

## 1. 現況：資料流與 localStorage

### 1.1 localStorage key

| Key | 用途 |
|-----|------|
| `visitation_demo_list_v1` | 陣列 JSON：本週清單與表單新增列共用同一儲存 |

### 1.2 記錄物件欄位（陣列元素）

現有程式在 `resetDemoData`、`handleSubmit` 建立的物件大致為：

| 欄位 | 說明 |
|------|------|
| `person` | 對象姓名（字串） |
| `type` | 探訪類型（與表單 `visitType` 一致，如：新朋友、病患長者、流失預警、一般關懷） |
| `worker` | 負責同工（字串） |
| `plannedDate` | 日期字串 `YYYY-MM-DD`（表單的探訪日期） |
| `status` | `pending` \| `planned` \| `done`（清單狀態 pill） |
| `summary` | 探訪簡要（表單送出時寫入；示範資料可能無） |
| `followups` | 陣列：勾選的「需要跟進」選項字串 |

示範列（`resetDemoData`）無 `summary`、`followups`。

### 1.3 讀寫 localStorage 的位置

| 函式／流程 | 行為 |
|------------|------|
| `getVisits()` | `localStorage.getItem(STORAGE_KEY)` → `JSON.parse` → 陣列 |
| `saveVisits(list)` | `JSON.stringify` → `setItem` |
| `resetDemoData()` | 建立示範陣列 → `saveVisits` → `renderTable()` |
| `handleSubmit()` | `getVisits()` → `unshift` 新物件 → `saveVisits` → `renderTable()` → `clearForm()` |
| `renderTable()` | 僅 **讀** `getVisits()`，不寫入 |
| `init()` | 設表單預設日期、`renderTable()`、綁定 submit／按鈕 |

表單欄位另有：`priority`（radio）、`followup`（checkbox），寫入時合併進新物件的僅 `followups`；**priority 未存入** localStorage 物件（表單有選但程式未 push 到 visit 物件）。

---

## 2. 與 `public.visitations` 的欄位對應（設計取向）

資料庫需 **`member_id`（bigint）** 指向 `members`。目前 UI 只有**姓名輸入**，沒有會友主檔選取。

| 現有（local） | Supabase `visitations` | 備註 |
|----------------|-------------------------|------|
| — | `id` | 主鍵；列表列可顯示或內部用 |
| `person` | **過渡** | 無 `member_id` 前：可將姓名放進 `summary` 前綴如 `[對象: 張弟兄] …`，或放 `metadata.display_name`（需 RLS 允許 jsonb） |
| 理想 | `member_id` | 有會友選單／搜尋後改為必填 FK |
| `type` | `visit_type` | 字串對應 |
| `worker` | `visitor_member_id` 或過渡文字 | 有同工主檔時用 ID；否則 `metadata.worker_name` 或併入 `detail_notes` |
| `plannedDate` | `visit_date` | 同 `YYYY-MM-DD` |
| `status` | `status` | DB 現為文字；建議對應：`pending`→待跟進類、`planned`→已排程、`done`→done（或統一為中文狀態，與 UI `statusLabel` 一併調整） |
| `summary` | `summary` | 直接對應 |
| `followups` | `follow_up_action` | 可 `join('、')` 成單一字串，或寫入 `metadata.followups: string[]` |
| — | `priority` | 表單有值但 local 未存；接 DB 時應一併寫入 |
| — | `is_deleted` | 軟刪；列表查詢加 `.eq('is_deleted', false)` |
| — | `case_id` | 可選；連到 `care_cases` |

---

## 3. 修改方案草稿（偽碼／註解級）

### 3.1 `handleSubmit`（概念）

```text
async function handleSubmit(e) {
  e.preventDefault();
  // 1. 讀表單：visitDate, visitPerson, visitType, visitWorker, visitSummary, priority, followups
  // 2. 解析 member_id：
  //    - 若有會友選取 UI → member_id = 選到的 id
  //    - 否則（過渡）→ insert 仍須合法 member_id：可先建「訪客／未對檔」members 列，或僅 demo 環境允許寫 metadata
  // 3. await insertVisit({ member_id, visit_date, visit_type, summary, priority, status: 'done', follow_up_action, metadata? })
  // 4. await fetchVisitsThisWeek({ weekStart, weekEnd })
  // 5. renderTableFromRows(rows)  // 不再 getVisits() from localStorage
  // 6. clearForm(); 成功提示
}
```

### 3.2 `renderTable`（概念）

```text
async function renderTable() {
  // const rows = await fetchVisitsThisWeek({ weekStart, weekEnd });
  // 每列：對象名 ← row.members?.name 或 metadata.display_name
  //      類型 ← visit_type
  //      同工 ← visitor 名稱（join 或 metadata）
  //      日期 ← visit_date
  //      狀態 ← status（映射 CSS class：與 pending/planned/done 對齊）
}
```

若使用 `select('*, members:member_id(name)')`，需 PostgREST 關聯名稱正確且 RLS 允許讀 `members`。

### 3.3 `resetDemoData`（概念）

- **不再**寫入 localStorage。
- 選項 A：改為呼叫後端 seed／只在開發環境 insert 示範列（需有效 `member_id`）。
- 選項 B：暫停按鈕或改為「說明：請由牧者於後台建示範會友」。

### 3.4 localStorage 是否保留作 fallback？

| 策略 | 說明 |
|------|------|
| **僅 Supabase** | 最簡；離線則失敗提示，不雙寫。 |
| **雙寫** | submit 同時寫 local + 遠端；風險為資料不一致，需同步策略。 |
| **離線佇列** | 先存 IndexedDB／localStorage 佇列，上線後批次 `insert`；實作較重，適合第二階段。 |

建議第一階段：**不保留** localStorage 作資料源，僅 Supabase；若無網路則提示重試。

---

## 4. 與 `visitation_supabase_client_v0.1.js` 的對齊

- 初始化：沿用 `export const supabase = createClient(...)`。
- 清單：`fetchVisitsThisWeek({ weekStart, weekEnd })`。
- 新增：`insertVisit(visit)`，欄位與上表一致。
- 軟刪：`deleteVisit(id)`（若 UI 未來加「刪除」按鈕）。

---

## 5. 修訂紀錄

- v0.1：依 `visitation_index.html` 內現有 IIFE 行為整理；實作時請再對照最新頁面與 RLS policy。
