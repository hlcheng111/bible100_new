# VISITATION_DATA_MODEL（探訪 · pastoral.visitation）

本文件描述 **探訪** JSON 與會友主檔的關聯鍵。實作見 `bible100_new/js/church_data_bridge.js`（`getVisitationData`、`saveVisitationData`、`normalizeVisitationPayload`）。

## 儲存位置

| 鍵名 | 說明 |
|------|------|
| `visitationData` | 探訪頁主要讀寫 |
| `churchMasterDatabase.pastoral.visitation` | 與上列同步 |

## `missions[]`（探訪任務）

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `id` | number \| string | ✔ | 任務唯一 ID |
| `targetMemberId` | number \| string | 建議 | **對應 `members.memberId`**（舊欄 `targetId` 會由 bridge 遷移） |
| `zoneId` | string | 建議 | **分區 ID**；若缺且可從會友主檔解析，bridge 會依 `targetMemberId` 補上 |
| `date` | string |  | ISO 日期 |
| `status` | string |  | 與 `visitation.html` 既有：`planned` / `completed` / `overdue` 等 |
| `target` | string |  | 對象顯示名（無 ID 時後備） |

## `zones[]`（探訪分區）

| 欄位 | 說明 |
|------|------|
| `zoneId` | 若僅有數字 `id`，bridge 會補 `zoneId` 如 `Z-{id}` |
| `zoneName` | 與 `name` 同步 |

## 與會友主檔的關係

1. **覆蓋率**、**分區統計**：以 `members.zoneId` / `group_members` 與 `missions.targetMemberId` 對齊。
2. 任務建立時應優先填 **`targetMemberId`**，**`zoneId`** 優先來自該會友之 `zoneId`（或其所屬小組的 `zoneId`），避免隨機字串。

## API 遷移

- `ChurchDataBridge.loadVisitationMissions()` 已標 **TODO**：正式環境改為 `fetch`，回傳結構需符合本文件。
