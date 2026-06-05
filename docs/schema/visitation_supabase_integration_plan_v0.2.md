# 探訪工作桌 1.0 · Supabase 整合方案 v0.2

**目標檔案（僅作設計依據，本文件不修改原檔）：**  
`church_ministry/modules/support/visitation_index.html`

**相關草稿：**  
`docs/schema/visitation_supabase_client_v0.1.js`、`docs/schema/visitation_supabase_migration_plan_v0.1.md`、`docs/schema/supabase_church_core_api_v0.1.md`

本文件為 **步驟 1：只產生修改方案**；實作時再依此改頁面與腳本。

---

## 1. 目前實作現況（整理）

### 1.1 localStorage

| 項目 | 內容 |
|------|------|
| Key 名稱 | `visitation_demo_list_v1` |
| 資料形態 | JSON 陣列，元素為「訪視列」物件 |

### 1.2 訪視物件欄位（陣列元素）

| 欄位 | 說明 |
|------|------|
| `person` | 對象姓名（字串） |
| `type` | 探訪類型（與表單 `visitType`：新朋友／病患長者／流失預警／一般關懷） |
| `worker` | 探訪同工（字串） |
| `plannedDate` | `YYYY-MM-DD` |
| `status` | `pending` \| `planned` \| `done`（對應清單 pill） |
| `summary` | 探訪簡要（表單送出時寫入；`resetDemoData` 示範列可能無） |
| `followups` | 陣列：勾選之「需要跟進」選項字串 |

**表單另有** `priority`（radio）、`followup`（checkbox）；目前 **priority 未寫入** localStorage 物件，僅 `followups` 有寫入。

### 1.3 讀／寫／渲染責任

| 函式 | 職責 |
|------|------|
| `getVisits()` | 從 localStorage 讀取並 `JSON.parse` 為陣列 |
| `saveVisits(list)` | 將陣列 `JSON.stringify` 寫回 localStorage |
| `resetDemoData()` | 寫死三筆示範物件 → `saveVisits` → `renderTable()` |
| `handleSubmit()` | 讀表單 → 驗證 `person` → `getVisits()` → `unshift` 新列 → `saveVisits` → `renderTable` → `clearForm` → `alert` |
| `renderTable()` | `getVisits()` → 清空 tbody → 逐列輸出五欄（對象／類型／同工／預計日期／狀態） |
| `statusLabel()` | 將 `pending`/`planned`/`done` 轉中文標籤 |
| `escapeHtml()` | 輸出脫敏 |
| `clearForm()` | 重置表單並把探訪日期設回今日 |
| `initTabs()` | Tab 切換；預設顯示「填」 |
| `init()` | 預設日期、綁定 submit／載入示範／清除表單、`renderTable()`、`initTabs()` |

### 1.4 流程簡述

- **載入示範清單**：按 `#btnResetDemo` → `resetDemoData()` → 覆寫整份 localStorage 為三筆假資料 → `renderTable()`。
- **新增記錄**：在「填 · 新增記錄」送出表單 → `handleSubmit` → 新列插在陣列最前 → 存 localStorage → 重繪表格 → 清空表單。

---

## 2. 接 Supabase 的最小方案

### 2.1 策略選擇：**第一階段以 Supabase 為單一資料來源（不保留 localStorage）**

**理由（簡要）：**

- 現有邏輯集中在單一陣列讀寫，沒有離線佇列；改為「只打 API」路徑最短、除錯最單純。
- 若同時維護 localStorage 與雲端，需處理雙寫一致、衝突與同步，複雜度明顯高於目前 IIFE 規模。
- **建議**：第一條雲端線先 **移除** `getVisits`／`saveVisits`／`STORAGE_KEY`；錯誤時以 `alert`／畫面提示「請檢查網路或登入」，不寫回 localStorage。若日後需要離線，再獨立做「佇列＋同步」迭代。

**結論（2–3 行）：** 優先採 **Supabase 單一資料源**，刪除本頁對 `visitation_demo_list_v1` 的依賴；不建議第一版就做 localStorage fallback，以免雙軌邏輯拖慢上線與測試。

### 2.2 欄位對應表（local 物件 → `public.visitations`）

| 現有（local） | `visitations` 欄位 | 說明 |
|---------------|-------------------|------|
| — | `id` | 列表不需編輯可僅內部使用 |
| `person`（無會友選單時） | `member_id` **必填** | **生產路徑**：表單改為選會友或搜尋 `members` 後帶入 id。**過渡**：以姓名在 `members` 做模糊選一筆，或暫用固定 demo `member_id` + `metadata.display_name` 備份顯示 |
| `person`（僅文字過渡） | `summary` 前綴或 `metadata` | 若暫無法選 id：可 `[對象:姓名] ` + 摘要併入 `summary`，並在 `metadata` 存 `{ display_name }` 供除錯 |
| `type` | `visit_type` | 與表單選項字串對應 |
| `worker` | `visitor_member_id` 或文字 | 有同工主檔時改為 id；否則 `metadata.worker_name` 或寫入 `detail_notes` 一行 |
| `plannedDate` | `visit_date` | 同 `YYYY-MM-DD` |
| `status` | `status` | 維持 `pending`/`planned`/`done` 或與 DB 種子一致；`statusLabel`／CSS class 需與 DB 值一致 |
| `summary` | `summary` | 直接寫入 |
| `followups`（陣列） | `follow_up_action` | `followups.join('、')` 或 `metadata.followups` |
| 表單 `priority` | `priority` | 第一版接 DB 時應一併從 radio 讀取並寫入（如 高／中／低） |
| — | `origin` | 可選；表單若無欄位可省略或預設「手動登錄」 |
| — | `is_deleted` | 查詢時由 `fetchVisitsThisWeek` 已過濾 `false`（見 client 草稿） |

### 2.3 `handleSubmit` 改法（偽碼）

**現況：** 從 `form` 取 `visitDate`、`visitPerson`、`visitType`、`visitWorker`、`visitSummary`、checkbox `followup`；組一個物件 `unshift` 進 `getVisits()` 陣列後 `saveVisits`。

**目標：**

```text
async function handleSubmit(e) {
  e.preventDefault();
  // 1. 讀表單（同上），另讀 priority radio
  // 2. 解析 member_id：
  //    - 理想：由 UI 選 members.id
  //    - 過渡：resolveMemberIdByName(person) 或預設單一 demo id（僅開發）
  // 3. worker → visitor_member_id 或 metadata / detail_notes
  // 4. await insertVisit({
  //      member_id,
  //      visit_date,
  //      visit_type: type,
  //      summary: summaryWithOptionalPersonPrefix,
  //      priority,
  //      status: 'done',
  //      follow_up_action: followups.join('、'),
  //      visitor_member_id: ...,
  //      metadata: { display_name: person, worker_name: worker }  // 可選
  //    })
  // 5. const rows = await fetchVisitsThisWeek({ weekStart, weekEnd })
  // 6. renderTableFromApiRows(rows)   // 或 await renderTable()
  // 7. clearForm(); alert 成功／失敗
}
```

### 2.4 `renderTable` 改法（偽碼）

**現況：** `const visits = getVisits()`，每列用 `v.person`、`v.type`、`v.worker`、`v.plannedDate`、`v.status`。

**目標：**

```text
async function renderTable() {
  // 1. const { weekStart, weekEnd } = getCurrentWeekRange();  // 與 init 一致
  // 2. const rows = await fetchVisitsThisWeek({ weekStart, weekEnd });
  // 3. 若 rows.length === 0 → 顯示空狀態（可改文案：改為提示「尚無本週資料」）
  // 4. rows.forEach(row => {
  //      對象：row.members?.name（若 select 有 join）或 metadata.display_name 或從 summary 解析
  //      類型：row.visit_type
  //      同工：members 關聯 visitor_member_id 或 metadata.worker_name
  //      日期：row.visit_date
  //      狀態：row.status → statusLabel + status-pill class
  //    })
}
```

**建議 API：** `fetchVisitsThisWeek` 的查詢改為（或另包一函式）：

```text
.select(`
  id, visit_date, visit_type, summary, status, priority,
  member_id, visitor_member_id, metadata,
  members:member_id ( id, name ),
  visitor:visitor_member_id ( id, name )
`)
```

（實際欄位名需符合 PostgREST 外鍵命名；若關聯名失敗，可先 `select('*')` 再以第二查詢補名稱。）

### 2.5 `init` 與週期邊界

```text
function getCurrentWeekRange() {
  // 訂一規則：例如週一至週日（或週日到週六），回傳 weekStart, weekEnd 字串 YYYY-MM-DD
}

async function init() {
  // 1. 載入 Supabase（見 §3）
  // 2. visitDate 預設 todayISO()
  // 3. form submit → handleSubmit（async）
  // 4. btnResetDemo → 改為「重新整理本週清單」：await fetchVisitsThisWeek + renderTable；
  //    或移除寫死三筆示範（雲端已有種子資料時）
  // 5. await renderTable()
  // 6. initTabs()
}
```

---

## 3. 手動設定 vs. 可自動改寫的範圍

### 3.1 將來由你／環境手動處理

| 項目 | 說明 |
|------|------|
| Supabase **Project URL**、**anon key** | 填入前端設定；**勿**把 service key 或密鑰提交公開 repo |
| **RLS / policy** | 在 Supabase Dashboard 為 `visitations`、`members` 等設定適當讀寫規則；匿名可讀僅限 demo 時再開，正式應以登入角色為準 |
| **member_id 解析策略** | 是否先做「姓名搜尋 members」、或強制下拉選會友，屬產品決策 |

### 3.2 可安全由實作步驟 2 修改的程式範圍

| 項目 | 說明 |
|------|------|
| 移除 | `STORAGE_KEY`、`getVisits`、`saveVisits`、依賴 localStorage 的 `resetDemoData`（或改為僅 refetch） |
| 改寫 | `handleSubmit` → async，改呼叫 `insertVisit` + `fetchVisitsThisWeek` |
| 改寫 | `renderTable` → async，資料來自 Supabase 列；欄位映射見 §2.2 |
| 改寫 | `init` → 先算 `weekStart`/`weekEnd`，再 `await renderTable()` |
| 新增 | 引入 `@supabase/supabase-js`（CDN `import` 或 bundle）；將 `visitation_supabase_client_v0.1.js` 的邏輯內嵌或改為與本頁同目錄可載入之模組 |
| 保留 | `initTabs`、`escapeHtml`、`statusLabel`（若 DB 狀態值不變）、表單 `id`/`name` 盡量不變以利漸進修改 |

---

## 4. 與 v0.1 遷移草案的關係

- `visitation_supabase_migration_plan_v0.1.md` 已描述欄位對應與 `resetDemoData` 調整方向；**v0.2** 明確採 **單一資料源**、並補上 **週範圍**、**join `members` 渲染**、**priority 寫入**。
- `visitation_supabase_client_v0.1.js` 的 `fetchVisitsThisWeek`／`insertVisit`／`deleteVisit` 名稱建議沿用，實作時可改為 **IIFE 內區域函式**（若不用 ES module）。

---

## 5. 修訂紀錄

- **v0.2**：整合現況盤點、單一資料源建議、欄位對應、handleSubmit／renderTable／init 偽碼、手動／可改範圍；供步驟 2 實改 `visitation_index.html` 使用。
