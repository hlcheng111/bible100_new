# 出席／點名 · 治理綱要（ATTENDANCE GOVERNANCE）

> 版本：V1 · 2026-10-16  
> 對齊：`ATTENDANCE_CHECKIN_W0_W1.md`、產品憲法、`member_id` SSOT  
> 畫面元件：`js/attendance_route_kit.js` + `css/attendance_route_kit.css`

---

## 1. 一句話

**人（中央會友）→ 場（應出席分母）→ 簽（多入口寫同一流）→ 權（誰可改）→ 用（核對／預警／探訪 HITL）→ 審（審計／備份）。**

登記 ≠ 睇圖 ≠ 跟進人。三步必須在 landing 講清。

---

## 2. 身份與名單

| 概念 | SSOT | 規則 |
|------|------|------|
| 總名單 | `memberSystemData`／CentralMemberDB · `member_id` | 禁止各模組另造永久人員 ID |
| 小組／團隊名單 | `groupMemberships`／團隊 roster | 只存關係，不複製第二套人 |
| 訪客 | `visitors`（簽到台 W2） | 可合併轉正；合併後出席 `person_key` 重指向 |
| 學校學籍 | `schoolDB` + 連 `member_id` | **出席桶分開**；結業可回寫會友，不混崇拜／小組點名入口 |

**CRUD 互通：** 新加／改／軟刪只經中央會友（或核准合併工具）。刪人≠抹出席史；應出席名單即時排除停餐／轉出。

---

## 3. 出席資料桶（誠實標示）

| 桶 | 鍵／來源 | 用途 | 狀態 |
|----|----------|------|------|
| B 事件簽到 | `bible100_attendance_checkin_v1` | 現場點名、多類型場次 | **主路徑（新）** |
| B 週報 | `group_attendance_v1` | 小組週報、連續缺席預警 | 小組批量時同步 |
| A 主日一桌 | `attendanceRecords` | 舊寫法（一場一筆） | **已收編**：新點名只經 `js/attendance_ledger.js` 寫入事件桶；舊桶只做鏡射＋一次性遷移 |
| 學校 | `student.attendance` | 堂課點名 | 永久分域 |

**主線＝事件桶**（`bible100_attendance_checkin_v1`）。三套資料現在是一條線：

1. **寫**：簽到臺（`AttendanceCheckinStore`）與主日一桌（`AttendanceLedger.saveSunday` → `saveSessionRows`）都寫事件桶；小組批量另同步週報桶。
2. **讀**：報表、預警、探訪橋一律問 `AttendanceLedger`（`sessions()`／`flatRows()`／`summary()`），不直接解析舊桶。
3. **舊桶**：`attendanceRecords` 只鏡射（舊報表不斷線）；打開主日一桌時自動把舊場次併進主線（`migrateLegacy`，可重複執行）。
4. **學校**：永久分域，只用 `member_id` 對齊，不混入教會桶。

每個工作桌步驟下面都有一行「📥 資料來自 → 📤 去向」小字（`attendance_route_kit.js` 的 `FLOW` 表），小白看得到資料從哪來、往哪去。

Dashboard／統計頁必須標「本數來自哪一桶」，禁止假裝已全站合一。

### 會友編號（只有一種正式寫法）

正式編號＝中央會友的**數字 memberId**（例 `1`、`1001`）。舊寫法（`M1`／`M001`／`cm-12`）一律認得、一律轉回數字：`MemberIdBridge.normalizeId()`／`resolveById()`。
`cm-<id>` 只當別名（`member_id` 欄位）；各模組**不得自造**編號。對不上中央會友的人顯示「未對齊」，由人按「按姓名對齊」，不自動亂配。

### 分母（凍結）

- 崇拜：全體（或當日登記名單）
- 小組／團契／詩班：該 `groupId` roster
- 請假 ≠ 無故缺席；遲到計入出席（狀態 `late`）

### 一筆出席

`eventId` + `memberId` 邏輯唯一；`checkinMethod`；`checkedInAt`；`operator`。  
重複打卡 →「已於 HH:MM 打卡」，不當 error。

---

## 4. 權限與 QR

| 角色 | 可做 | 不可 |
|------|------|------|
| 簽到義工 | 本場簽到／手輸 | 牧養備註、改歷史、匯出敏感 |
| 組長／詩班長 | 本組批量、開／關本場 | 他組、全會敏感 |
| 牧者／傳道 | 全覽、預警、跟進日誌 | （行政合併可另授） |
| 會友 | 自己預登記／請假（若開） | 他人資料 |
| 系統管理 | 合併、設定、審計 | — |

**兩種碼：**

- **身份碼**（長期）：紙證／手機 → `member_id`＋短碼 `checkinCode`（載荷 `B100|memberId|短碼`）
- **場次限時碼**（短效）：防截圖代打（W3）

**新人試用鏈（本機）：**

| 步驟 | 頁面 |
|------|------|
| 在家手機登記 | `modules/fellowship/newcomer-self-register.html` |
| 負責人審核出 QR | `modules/fellowship/newcomer-qr-desk.html` |
| 簽到（短碼／貼載荷） | `modules/fellowship/attendance-checkin.html` |
| 儀表更新 | `dashboard_church_layout_v1_content.html` · 團契 landing 新人卡 |
| 可點手冊 | `docs/ATTENDANCE_OPS_HANDBOOK.html` |

資料桶：`bible100_newcomer_qr_v1`（申請／已發卡）＋會友主檔欄位 `checkinCode`／`qrPayload`。  
正式雲端會友／硬體相機／完整 RBAC 仍未做；發碼台「角色」僅試用下拉。

改已存出席 → 必留 `audit_log`（誰／何時／舊→新）。

---

## 5. 器材（部署，非功能主線）

盤點：2D 掃碼槍、kiosk 筆電／平板、支架、誰保管、`device_id`。  
相機掃碼僅 HTTPS／localhost；否則降級槍／手輸。詳見現場手冊規劃（W3）。

---

## 6. 點名後運用與核測

```
簽到入庫 → 組長確認本場
        → 牧區／儀表（趨勢、結構）
        → 黃3／紅6 燈（W5）
        → 探訪建議（人確認，不自動派）
        → 關懷日誌／週摘要
```

**相互追蹤：** 出席 ←→ member_id ←→ 探訪草稿來源標籤 ←→（可選）服事排班對照。  
**備份：** 本機為主時須定期 JSON／CSV 匯出；清瀏覽器＝資料風險。

---

## 7. 畫面契約（今日一件事＋互動路線圖）

| 檔 | 職責 |
|----|------|
| `js/attendance_route_kit.js` | 角色芯片、今日 CTA、可點步驟、本機回測勾選 |
| `css/attendance_route_kit.css` | 樣式 |
| Host | `<div data-att-route="b_pastoral|a_worship|school|…"></div>` |

回測：勾選步驟寫入 `localStorage` 鍵 `bible100_att_route_check_v1`，方便小白自測與巡查。

### 建議掛載頁

- B：`_landing/fellowship.html`、`pastoral-integrated.html`、`attendance-checkin.html`、`pastoral-attendance.html`、探訪工作桌
- A：`_landing/worship.html`、`worship-sunday-desk.html`
- 學校：`school_management/_landing/home.html`（文案分域）

---

## 8. 命名（側欄／按鈕）

| 用途 | 建議文案 |
|------|----------|
| 登記 | ✅ 現場點名／主日一桌／學校今天點名 |
| 睇圖 | 📊 出席統計 |
| 跟進 | 🙏 缺席預警 → 探訪（人確認） |

禁止三個入口都叫「聚會出席」卻無說明。

---

## 9. 刻意不做（本綱範圍）

認臉、自動 WhatsApp 群發、未合流前假「單一全會儀表」、兒童接送全套（另波）。

---

## 10. 驗收

1. 各掛載 landing 見「今日一件事」＋可點路線圖  
2. 角色切換後 CTA 改變  
3. 回測勾選重整後仍在  
4. file:// 教會事工 → B → ≤3 點擊到簽到台  
5. 統計頁可見資料桶說明  
