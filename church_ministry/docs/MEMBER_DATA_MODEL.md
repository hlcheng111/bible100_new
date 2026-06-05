# MEMBER_DATA_MODEL（會友主檔 · churchMasterDatabase 對齊）

本文件為 **前端 JSON / localStorage** 與未來 **後端 API** 共用之契約。實作見 `bible100_new/js/church_data_bridge.js`（`normalizeMemberSystemData`、`saveMemberSystemData`）。

## 儲存位置

| 鍵名 | 說明 |
|------|------|
| `memberSystemData` | 會友事工頁主要讀寫 |
| `churchMasterDatabase` | 全站匯總；`members`、`fellowship.*`、`zones` 由 bridge 同步 |

## 主表：`members[]`

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `memberId` | number \| string | ✔ | 會友唯一 ID；**與舊欄位 `id` 同值**（bridge 會雙向同步） |
| `id` | 同上 | ✔ | legacy，與 `memberId` 一致 |
| `fullName` | string |  | 與 `name` 同步；API 可只送 `fullName` |
| `name` | string | ✔ | 顯示用姓名 |
| `gender` | string |  | 例：`男` / `女` / `M` / `F`（前端展示） |
| `age` | number |  |  |
| `phone` | string |  |  |
| `email` | string |  |  |
| `baptized` | boolean |  |  |
| `membershipDate` | string (ISO date) |  |  |
| `status` | string | ✔ | `in_communion` / `pending_transfer` / `transferred` / `left` |
| `membershipStatus` | string |  | 正規化枚舉：`ACTIVE` / `PENDING_TRANSFER` / `TRANSFERRED_OUT` / `INACTIVE`（由 bridge 依 `status` 填） |
| `zone` | string |  | 分區**顯示名**（與探訪分區對齊時填寫） |
| `zoneId` | string |  | 與 `zones[]` 對應；由 bridge 依 `zone` 文字建立 |
| `gifts` | string |  | 恩賜（逗號分隔；進階可改 `string[]`） |
| `spiritual_journey_stage` | string |  | **CRM 標準階段**：`seeker` / `new_believer` / `growing` / `serving` / `leader`（見 `js/church_crm_constants.js`） |
| `spiritual_stage` | number |  | **相容欄位**：0–4，由 bridge 依 `spiritual_journey_stage` 同步 |
| `first_visit_date` | string (ISO date) |  | 第一次來教會；與 `firstVisitDate` 雙向同步；供新人 SLA 提醒 |
| `ministryIntent` | string |  | 事奉意向 |
| `schoolName` / `schoolClass` | string |  | 預留教育模組 |
| `education_history` | array |  | 課程／造就紀錄；見下方 **資料契約**（建議物件陣列；過渡期可含純字串元素） |

### `education_history[]` 資料契約（真雲／API 對齊）

**目標：** 每筆紀錄為可機讀結構，便於報表、權限與課程目錄關聯；舊資料若僅為 `"已完成受洗班"` 等字串，匯入時可轉成 `courseName` + `status: "completed"` 或保留字串由 UI 顯示。

**建議元素型別：** `EducationHistoryEntry` 物件（陣列順序通常代表時間由舊到新，或由 API 明確排序）。

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `courseId` | string | 建議 | 穩定課程代碼，如 `BAPTISM_01` |
| `courseName` | string | ✔ | 顯示用課程名稱，如 `受洗班` |
| `status` | string | ✔ | `planned` / `in_progress` / `completed` / `waived` / `expired` |
| `date` | string (ISO date) |  | 完成或狀態變更日期 |
| `instructor` | string |  | 講師／牧者姓名 |

**範例：**

```json
{
  "courseId": "BAPTISM_01",
  "courseName": "受洗班",
  "status": "completed",
  "date": "2026-04-20",
  "instructor": "陳牧師"
}
```

**陣列範例：**

```json
"education_history": [
  {
    "courseId": "BAPTISM_01",
    "courseName": "受洗班",
    "status": "completed",
    "date": "2026-04-20",
    "instructor": "陳牧師"
  },
  {
    "courseId": "DISCIPLE_01",
    "courseName": "門徒訓練初階",
    "status": "in_progress",
    "date": "2026-04-28",
    "instructor": "林傳道"
  }
]
```

## 關聯表

### `group_members` → 本專案 `groupMemberships[]`

| 欄位 | 說明 |
|------|------|
| `memberId` | 對應 `members.memberId` |
| `groupId` | 對應 `groups.groupId` |

### `groups[]`

| 欄位 | 說明 |
|------|------|
| `groupId` | 與 `id` 同值 |
| `id` | legacy |
| `zoneId` | 可選；小組所屬分區 |

### `ministries[]` / `ministryAssignments[]`

| 欄位 | 說明 |
|------|------|
| `ministryId` | 與事工 `id` 同值 |
| `memberId` | 對應會友 |

## 分區目錄 `zones[]`（由 bridge 產生）

| 欄位 | 說明 |
|------|------|
| `zoneId` | 穩定字串，如 `Z-` + hash（由分區名稱導出） |
| `zoneName` | 與 `members.zone` 相同語意 |

## API 遷移

- `ChurchDataBridge.loadMembers()` / `saveMemberSystemData()` 已標 **TODO**：正式環境改為 `fetch`，回傳結構須與本文件一致。
