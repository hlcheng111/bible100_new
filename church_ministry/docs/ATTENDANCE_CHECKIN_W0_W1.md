# 出席點名 · W0／W1（事件式簽到台）

> 產品定位：把「點名工具」升級為牧養關懷閉環的**第一段**（先準簽到，再黃紅燈）。  
> 本波：**唔使買掃碼槍**；掃碼／場次 QR／HTTPS 部署見規劃 W3。  
> **治理綱要＋landing 路線圖：** `ATTENDANCE_GOVERNANCE.md` · `js/attendance_route_kit.js`

## 掛載

| 入口 | 路徑 |
|------|------|
| 牧養工作桌 Tab② | `modules/fellowship/attendance-checkin.html` |
| 牧羊小徑側欄 | 「✅ 現場點名」 |
| 趨勢／週報（既有） | `pastoral-attendance.html`（仍保留） |

## 資料契約

| 鍵 | 說明 |
|----|------|
| `bible100_attendance_checkin_v1` | 事件式 SSOT：`events[]` + `attendance[]` + `visitors[]`（W2） |
| `group_attendance_v1` | 既有週報；小組批量儲存時**同步**，供缺席預警 |
| `memberSystemData` | 會友身份；`memberId`／`id`／`phone` |

### attendance 一筆

- `eventId` + `memberId`（邏輯唯一；重複打卡回「已於 HH:MM 打卡」）
- `status`: `present` \| `late` \| `leave` \| `absent`
- `checkinMethod`: `manual_code` \| `manual_phone` \| `manual_name` \| `leader_batch` \| `identity_qr`（新人短碼／`B100|…`；相機 scan_* 仍待 HTTPS）

### 分母

- 崇拜／其他無小組：全體會友
- 小組／團契／詩班有 `groupId`：該組 roster

## 實作檔

- `js/attendance_checkin_store.js` — 唯一寫入 `checkIn` / `saveLeaderBatch`
- `js/attendance_checkin_ui.js` — 簽到台 UI
- `modules/fellowship/attendance-checkin.html`

## 驗收（file://）

1. `index.html` → 教會事工 → B 牧養 → Tab「② 點名」
2. 「載入示範會友／場次」→「開始聚會」
3. 手輸會員編號或電話 Enter → 成功；再簽同一人 →「已於 … 打卡」
4. 「組長批量」勾選後儲存 → 本場名單更新；小組場可觸發缺席預警（人確認探訪）

## 新人身份碼（試用延伸）

- 手機登記／發碼台／手冊：見 `ATTENDANCE_OPS_HANDBOOK.html`、`newcomer_qr_store.js`
- 簽到台 `findMembers` 可解析短碼與 `B100|memberId|短碼`

## 刻意不做（本波）

硬體相機（file://）、限時場次 QR、正式雲端會友同步、完整 RBAC、認臉。
