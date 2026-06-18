# Phase 1 PRD — 跨平台聖經 App MVP

**版本:** 1.0  
**範圍:** 成年信徒 persona · 中英雙語 · 三跑道讀經 · 本地進度 + Firebase 同步  
**不在 Phase 1:** 兒童皮膚、換物券核銷、教會後台、越印語言包

---

## 1. 產品目標

讓使用者能在 iOS / Android / Web 上：

1. 選擇三條讀經跑道之一，按書卷章節順序閱讀
2. 標記「已讀 / 未讀」，查看跑道與全域進度
3. 切換中文 / 英文介面與譯本（支援雙語並排）
4. 複製 AI Prompt 至外部工具（NotebookLM 等）
5. 登入後將進度同步至 Firebase

---

## 2. Persona — 成年信徒 (`adult`)

| 維度 | Phase 1 規格 |
|------|-------------|
| UI | 簡潔、專業色（藍灰）、標準字級 16px |
| 讀經單元 | 以「章」為單位（`bookId + chapter`） |
| 註釋 | 每章摘要占位（CDN JSON，可後補） |
| 獎勵 | 章節完成徽章 + 跑道進度條（無物質券） |
| 提醒 | 本地每日提醒（FCM 留 Phase 2） |

`seeker` / `child` persona 在 Phase 3 啟用；Phase 1 程式碼預留 `persona` 欄位。

---

## 3. 跑道定義

跑道註冊表見 [`../packages/core/data/reading_tracks.json`](../packages/core/data/reading_tracks.json)。

| track_id | 名稱 | 書卷範圍 | 單元數（章） |
|----------|------|----------|-------------|
| `ot_front` | 舊約前部 | 創世記 (1) – 以斯帖記 (17) | 436 |
| `ot_back` | 舊約後部 | 約伯記 (18) – 瑪拉基書 (39) | 493 |
| `nt` | 新約 | 馬太福音 (40) – 啟示錄 (66) | 260 |
| `bible_in_year` | 一年讀經（預留） | 365 天預排 | Phase 2 |

**單元 ID 格式:** `{trackId}_{bookId}_{chapter}`，例：`ot_front_1_1`（創世記第 1 章）。

**已讀判定:**

- 使用者點「標記完成」，或
- 停留 ≥ 30 秒且捲動至章末（可選，預設關閉）

**三跑道全完成:** 觸發 `certificate_eligible` 事件（Phase 3 發證書）。

---

## 4. 語言與譯本

| locale | 預設譯本 ID | 顯示名 |
|--------|------------|--------|
| `zh-Hant` | `cuv_trust` | 信望愛(和合本) |
| `en` | `kjv` | King James Version |

雙語模式：`primaryLocale` + `secondaryLocale`，Reader 左右並排。

詳見 [`LICENSE_BIBLE_VERSIONS.md`](LICENSE_BIBLE_VERSIONS.md)。

---

## 5. 畫面清單（Phase 1）

| 畫面 | 路由 | 功能 |
|------|------|------|
| 歡迎 / 登入 | `/` | Email 登入、訪客模式 |
| 跑道選擇 | `/tracks` | 三跑道卡片 + 進度環 |
| 跑道詳情 | `/tracks/[id]` | 書卷列表、章節已讀狀態 |
| 讀經 | `/read/[unitId]` | 經文、標記完成、雙語切換 |
| 設定 | `/settings` | 語系、譯本、提醒、persona |
| Prompt | `/prompt/[bookId]` | 生成 AI prompt、複製 |

---

## 6. 資料契約

### 本地（AsyncStorage / SQLite）

- `progress:{userId}:{unitId}` → `{ status, completedAt, durationSec }`
- `settings` → `{ locale, bibleVersion, persona, bilingual }`

### 雲端（Firestore）

見 [`../firebase/README.md`](../firebase/README.md)。

---

## 7. 驗收標準

- [ ] 三跑道章節列表正確（單元數與 `reading_tracks.json` 一致）
- [ ] 離線可讀 KJV + 信望愛和合本（SQLite 包）
- [ ] 標記完成後進度持久化，重開 App 仍保留
- [ ] Firebase 登入後進度雙向合併（本地優先、較新 `completedAt` 勝）
- [ ] 中英 UI 字串切換
- [ ] Prompt 生成器可複製至剪貼簿
- [ ] `npm test` 通過 TrackingEngine 單元測試

---

## 8. 時程參考

| 週 | 交付 |
|----|------|
| 1–2 | PRD、跑道表、Expo 骨架 |
| 3–4 | Bible SQLite 包、Reader UI |
| 5–6 | TrackingEngine、Firebase Auth + 同步 |
| 7–8 | Prompt、設定、測試、Web 構建 |
