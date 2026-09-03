# 讀經進度與統計 Schema V1

**狀態：** 凍結契約，**尚未全面實作於程式碼**  
**建立日期：** 2026-06-18  
**備案總覽：** [`READING_MOVEMENT_BACKLOG_V1.md`](READING_MOVEMENT_BACKLOG_V1.md)

本文件定義 Shell（`read_progress.js`）與 Expo（`TrackingEngine`）共用的進度格式，以及雲端英雄榜聚合文件格式。

---

## 1. 本機進度 `bible100_reading_progress_v1`

**儲存位置：**

- Shell：`localStorage` 鍵 `bible100_read_progress_v1`（現有鍵名**不可改**）
- Expo：`AsyncStorage` 同名鍵或等價 namespace

### 1.1 完整結構

```typescript
interface LocalReadingProgressV1 {
  schema_version: 1;
  device_id: string;           // 隨機 UUID，非姓名
  locale: 'zh-Hant' | 'en' | 'vi' | 'id';
  persona: 'kids' | 'youth' | 'child' | 'adult' | 'seeker' | 'parent';
  events: ReadingEvent[];
  totals: {
    stars: number;
    streak: number;
    last_active_date: string;  // YYYY-MM-DD
  };
  contribute_to_church_stats?: boolean;  // 預設 false；加入教會後可設 true
  /** 遷移期保留：舊版 done{} 升級後可選保留唯讀鏡像 */
  done_legacy?: Record<string, { at: number; meta?: object }>;
}

interface ReadingEvent {
  event_id: string;            // UUID，雲端去重用
  unit_key: string;            // 見 §1.2
  track_mode: 'bible66' | 'thirty_day' | 'golden_100' | 'thematic';
  at: string;                  // ISO8601
  stars_delta?: number;
}
```

### 1.2 unit_key 對照（與現有 Shell 一致）

| Shell 函數 | unit_key 格式 | 範例 |
|------------|---------------|------|
| `chapterId(book, ch)` | `b66:{book}:{ch}` | `b66:43:3` |
| `dayId(day)` | `30d:{day}` | `30d:7` |
| `goldenId(id)` | `gv:{id}` | `gv:g12` |
| `themeUnitId(theme, idx)` | `theme:{theme}:{idx}` | `theme:hope:2` |

Expo `TrackingEngine` 章節跑道（`ot_front_1_1` 等）映射規則：

- 寫入雲端 `users/{uid}/progress` 時保留原 `unitId`
- 寫入本機 `events[]` 時**另加**對應 `unit_key`（若模式為 bible66 則用 `b66:` 格式）

### 1.3 從舊格式遷移

現有 Shell 結構：

```json
{ "stars": 0, "streak": 0, "lastDay": "", "done": {}, "log": [] }
```

遷移規則（實作 Phase 1 時）：

1. 讀取舊鍵內容；若無 `schema_version` 則觸發遷移。
2. 將 `done` 每一項轉為 `events[]`（補 `event_id`、`track_mode` 推斷）。
3. 寫回同鍵 `bible100_read_progress_v1`，設 `schema_version: 1`。
4. **不刪除**使用者已打卡的 `done` 資料（可保留 `done_legacy` 或合併後驗證總數一致）。

---

## 2. 雲端使用者進度（私有）

路徑：`users/{uid}/progress/{progressId}`

與 [`packages/core/src/types.ts`](../packages/core/src/types.ts) `UnitProgress` 一致：

```typescript
interface UnitProgress {
  unitId: string;
  trackId: string;
  status: 'unread' | 'in_progress' | 'completed';
  completedAt?: string;
  durationSec?: number;
  updatedAt: string;
}
```

**僅本人可讀寫**（見 `firestore.rules`）。牧者與英雄榜**不得**直接查此集合。

---

## 3. 聚合統計文件（英雄榜）

**僅 Cloud Function（Admin SDK）可寫。** 前端只讀。

### 3.1 路徑

| 路徑 | 用途 | 讀取權限 |
|------|------|----------|
| `platformStats/daily_{YYYY-MM-DD}` | 全平台運動總覽（可選） | 公開或登入者 |
| `platformStats/weekly_{YYYY-Www}` | 全平台週累計 | 同上 |
| `churches/{churchId}/stats/daily_{YYYY-MM-DD}` | 教會日統計 | `churchMember` |
| `churches/{churchId}/stats/weekly_{YYYY-Www}` | 教會週統計 | `churchMember` |
| `churches/{churchId}/groups/{groupId}/stats/daily_{YYYY-MM-DD}` | 小組日統計 | 組員 / leader / pastor |
| `churches/{churchId}/groups/{groupId}/stats/weekly_{YYYY-Www}` | 小組週統計 | 同上 |

### 3.2 文件內容（零 PII）

```typescript
interface AggregateStatsDoc {
  schema_version: 1;
  period: 'daily' | 'weekly';
  date?: string;       // daily: YYYY-MM-DD
  week?: string;       // weekly: YYYY-Www
  church_id?: string;
  group_id?: string;
  updated_at: string;  // ISO8601

  totals: {
    units_completed: number;
    stars_earned: number;
    active_readers: number;  // 人數計數，無名單
  };

  by_locale: Record<Locale, SliceStats>;
  by_persona: Record<string, SliceStats>;  // kids | youth | adult | seeker | parent
  by_track: Record<ReadingModeId, SliceStats>;
}

interface SliceStats {
  units: number;
  readers: number;
}
```

**禁止欄位：** `uid`、`displayName`、`email`、`member_id`、任何可識別個人的陣列。

### 3.3 增量寫入

`onProgressWrite`（或專用 `onStatsIncrement`）收到完成事件時：

1. 讀取 user profile：`locale`、`persona`、`churchId`、`groupIds`、`contributeToChurchStats`。
2. 若 `contributeToChurchStats === false`，**不**更新教會聚合（仍可更新本人 progress）。
3. 對應 `stats` 文件做 `FieldValue.increment`。
4. 以 `event_id` 寫入 `churches/{id}/processedEvents/{event_id}` 防重複計數。

---

## 4. 牧者關懷摘要（非英雄榜，Phase 3）

路徑：`churches/{churchId}/memberCare/{memberId}`

```typescript
interface MemberCareSummary {
  schema_version: 1;
  percent_complete: number;
  last_active_date: string;
  streak_current: number;
  streak_broken: boolean;
  updated_at: string;
}
```

- **不含**章節明細、天路 log、心情筆記。
- 僅 leader / pastor 可讀；僅 Function 可寫。

---

## 5. USB 匯出 bundle（Phase 4）

```typescript
interface StatsExportBundle {
  schema_version: 1;
  export_type: 'stats_bundle';
  church_id: string;
  group_id?: string;
  week: string;  // YYYY-Www
  anonymous_events: Array<{
    locale: Locale;
    persona: string;
    track: ReadingModeId;
    units: number;
    stars: number;
  }>;
}
```

不含 `uid`。匯入端點：`importStatsBatch`（Cloud Function，待實作）。

---

## 6. 同跑隊 presence（Phase 2，邀請制）

路徑：`squads/{squadId}/presence/{uid}`

```typescript
interface SquadPresence {
  display_emoji: string;   // 非真名優先
  current_unit_key: string;
  today_done: boolean;
  updated_at: string;
}
```

與英雄榜 `stats` **分開**；僅 squad 成員可讀（Rules 待實作時新增）。

---

## 7. 版本演進

| 版本 | 變更 |
|------|------|
| v1 | 初版（本文件） |

遞增 `schema_version` 時必須：

1. 在本文件記錄遷移步驟。
2. 提供本機與雲端遷移函數。
3. 更新 `tests/test_reading_stats_schema.py`（待建）。
