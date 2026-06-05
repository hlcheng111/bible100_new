# Supabase 核心教會主庫 · API 使用大綱 v0.1

本文件說明如何在前端使用 **Supabase JS Client**（PostgREST 自動產生的 REST API）讀寫 `public` schema 下第一輪核心表，重點放在**探訪／關懷**流程。實際專案需先設定 `SUPABASE_URL` 與 `SUPABASE_ANON_KEY`，並在啟用 **RLS** 後補上符合教會權限的 policies。

參考：[Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

---

## 1. 資料流（文字示意）

### 1.1 探訪工作桌

1. 使用者於表單填寫：受訪對象（`member_id`）、探訪日、類型、摘要、優先級、狀態等。
2. 前端呼叫 `supabase.from('visitations').insert({ ... })` 寫入一筆探訪紀錄。
3. 成功後再 `select` 同一表（可依日期區間篩選），重新渲染「本週清單」或「已完成清單」。
4. 若該次探訪屬於長期個案，可一併帶入 `case_id` 連到 `care_cases`。

### 1.2 教會雷達／儀表板（未來）

- 從 **`attendance`**（連續缺席、出席率）、**`care_cases`**（開啟個案數、`risk_level`）、**`visitations`**（近期頻率、`priority`、`status`）彙總指標。
- 可再建立 **VIEW** 或 **物化視圖** 做快取，避免每次全表掃描。

---

## 2. 基本 CRUD 範例（JS）

以下假設已建立 `supabase` 客戶端（`createClient`）。錯誤處理與型別請依專案補齊。

### 2.1 插入一筆探訪紀錄

```js
const { data, error } = await supabase
  .from('visitations')
  .insert({
    member_id: 42,
    visitor_member_id: 7,
    visit_date: '2026-04-02',
    visit_type: '家訪',
    origin: '牧者交辦',
    summary: '關心術後恢復，約定下週電話跟進。',
    priority: '中',
    status: 'done',
    case_id: null,
  })
  .select()
  .single();
```

### 2.2 讀取某日期區間的 visitations（例如「本週」）

```js
const weekStart = '2026-04-01';
const weekEnd = '2026-04-07';

const { data, error } = await supabase
  .from('visitations')
  .select('*')
  .gte('visit_date', weekStart)
  .lte('visit_date', weekEnd)
  .eq('is_deleted', false)
  .order('visit_date', { ascending: false });
```

### 2.3 與 members 一併查詢（關聯）

```js
const { data, error } = await supabase
  .from('visitations')
  .select(`
    id,
    visit_date,
    visit_type,
    summary,
    priority,
    status,
    members:member_id ( id, name, contact_phone )
  `)
  .gte('visit_date', weekStart)
  .lte('visit_date', weekEnd);
```

（需在 Supabase 中為 `visitations.member_id → members.id` 設定 foreign key 關係後，PostgREST 才能正確解析嵌套 select；本輪 SQL 已建立此外鍵。）

### 2.4 新增／更新關懷個案（care_cases）

```js
const { data, error } = await supabase
  .from('care_cases')
  .insert({
    member_id: 42,
    case_type: '流失預警',
    owner_member_id: 3,
    risk_level: '高',
    summary: '連續多週未出席，需小組關懷。',
    status: 'open',
    detail_notes: '可在此放較長備註。',
  })
  .select()
  .single();
```

### 2.5 出席：寫入一筆 attendance

```js
const { data, error } = await supabase
  .from('attendance')
  .insert({
    event_id: 100,
    member_id: 42,
    attendance_type: 'in_person',
    status: 'confirmed',
    remark: null,
  });
```

---

## 3. 軟刪除與審計

- 查詢時建議加上 `.eq('is_deleted', false)`（若業務上需隱藏已刪除列）。
- `created_by` / `updated_by` 可在應用層於 insert/update 時填入 `auth.uid()`（需 RLS 與權限允許）。

---

## 4. 未來擴充

- **學校、門訓、Planning、詩歌**等模組使用**同一個 Supabase 專案**、同一個 **`public` schema**，增量新增表即可，例如：
  - `students`、`courses`、`enrollments`
  - `discipleship_classes`、`discipleship_enrollments`
  - `planning_surveys`、`planning_survey_responses`
  - `songs`、`worship_sets`
- 與本輪核心的銜接方式：能指向「人」的資料盡量以 **`members.id`（member_id）** 外鍵連結；活動類可連 **`events`**，與《全站 DB 藍圖 v0.1》一致。

---

## 5. 修訂紀錄

- v0.1：配合 `supabase_church_core_v0.1.sql` 第一輪表結構，僅涵蓋探訪／關懷優先用法與擴充方向。
