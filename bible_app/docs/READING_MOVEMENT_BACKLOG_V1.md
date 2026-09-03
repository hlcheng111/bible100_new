# 聖經跑道 · 讀經運動功能備案 V1

**狀態：** 記錄在案，**尚未實作**  
**建立日期：** 2026-06-18  
**產品定位：** App = 每日跑道；Bible100 = 補給站（見 [`MASTER_PLAN_V1.md`](MASTER_PLAN_V1.md)）  
**資料契約：** 見 [`READING_STATS_SCHEMA_V1.md`](READING_STATS_SCHEMA_V1.md)  
**前置：** P0 入口、四語經文、離線跑道（見 [`IMPLEMENTATION_ORDER_ENTRY_I18N.md`](IMPLEMENTATION_ORDER_ENTRY_I18N.md)）須保持可用

---

## 一、備案功能總覽（以後再做）

### Phase 1 — 本機優先（無 Firebase 也可上線）

| ID | 模組 | 說明 | 主要產出 |
|----|------|------|----------|
| F1-1 | **《天路歷程》** | 個人靈性時間軸；僅本人可見 | `shell/pages/pilgrim-journey.html` |
| F1-2 | **進度 Schema 凍結** | Shell / Expo 共用 `bible100_reading_progress_v1` | `packages/core` 型別 + 遷移 |
| F1-3 | **同跑隊 Lite（離線）** | 家人約定「今日同一關」+ 分享文案 | 沿用 `read-done.html` share |
| F1-4 | **個人模式** | 訪客起跑；進度只在本機 | 不改現有免登入歡迎流 |

### Phase 2 — 教會雲端 MVP

| ID | 模組 | 說明 | 主要產出 |
|----|------|------|----------|
| F2-1 | **報名註冊** | Form → Sheets → `importFromSheets` → 綁定 Auth | 擴充 `pendingRegistrations` 流程 |
| F2-2 | **教會組織** | 教會 / 團契 / 小組 / 事工部門 | `churches/{id}/groups` 擴充 |
| F2-3 | **contributeToChurchStats** | 是否將完成數計入教會總數（**非**公開露名） | `users/{uid}` 欄位 |
| F2-4 | **聚合層 stats** | Cloud Function 增量寫入 | 擴充 `onProgressWrite` |
| F2-5 | **英雄榜（純數字）** | 語言 / 對象 / 賽道 / 教會維度；**零個人資料** | `churches/{id}/stats/*` |
| F2-6 | **同跑隊 Lite（雲端）** | 邀請碼 + 今日誰完成 ✓ + 6 個加油貼圖 | `squads/` + `presence/` |
| F2-7 | **一鍵合併本機進度** | 個人 → 加入教會時 upsert 至 Firebase | 合併 UI + 去重 |

### Phase 3 — 牧養與小組

| ID | 模組 | 說明 |
|----|------|------|
| F3-1 | **小組英雄榜數字** | `churches/{id}/groups/{gid}/stats/*` |
| F3-2 | **牧者關懷板**（非英雄榜） | `memberCare`：完成率、最後活躍；**不含**天路 log |
| F3-3 | **家庭小隊** | 兒童僅家人可見進度；不進教會公開聚合以外之個人列 |
| F3-4 | **讀經證書** | 已有 `onProgressWrite` 證書雛形，接上 UI |

### Phase 4 — 與 Bible100 深度配搭

| ID | 模組 | 說明 |
|----|------|------|
| F4-1 | **主站入口** | `index_v5` 鏈 `/bible_app/`（非 `/shell/`） |
| F4-2 | **讀後深連結** | `read-done` → `bible_study` / `ai_tools`（帶 passage） |
| F4-3 | **USB 教會備援** | 匯出匿名 stats bundle → `importStatsBatch` |
| F4-4 | **member_id 對接** | 與 `church_ministry` 中央會友對齊（非新造永久 ID） |

---

## 二、英雄榜產品定義（凍結，實作時不可偏離）

1. **沒有個人姓名、uid、email、排名列。**
2. 只顯示**聚合數字**：總完成章數、總星數、活躍人數（count only）。
3. 切片維度（對齊現有型別）：
   - **語言** `Locale`：`zh-Hant | en | vi | id`
   - **對象** `Persona`：`kids | youth | adult | seeker | parent`
   - **賽道** `ReadingModeId`：`bible66 | thirty_day | golden_100 | thematic`
   - **教會** `churchId`（需 `churchMember` 權限）
   - **小組** `groupId`（需組員 / leader / pastor）
4. **opt-in 語意**：`contributeToChurchStats` = 是否計入教會／小組**總數**；不是「是否上榜露名」。
5. **《天路歷程》**永遠私人，不出現在英雄榜或牧者公開視圖。
6. **同跑隊**為邀請制小隊，與英雄榜分開；不可把隊友進度寫進公開 stats。

---

## 三、Firestore 權限原則（凍結）

| 路徑 | 讀 | 寫 |
|------|----|----|
| `users/{uid}/progress/*` | 僅本人 | 僅本人 |
| `churches/.../stats/*` | `churchMember` | **僅 Admin SDK（Cloud Function）** |
| `churches/.../groups/{gid}/stats/*` | 組員 / leader / pastor | **僅 Function** |
| `churches/.../memberCare/*` | leader / pastor | **僅 Function** |
| 天路 milestones（若上雲） | 僅本人 | 僅本人 |

**禁止**為牧者儀表板放寬 `users/{uid}/progress` 的 read 規則。牧者與英雄榜只讀聚合文件。

現有缺口：`church/index.tsx` 若直接查他人 `progress` 在正式 Rules 下會失敗——實作時改讀 `stats` / `memberCare`。

---

## 四、不可動／不可改清單（防止「有加新忘舊」）

### A. bible_app 產品紅線

| # | 不可破壞 | 原因 | 相關檔案 |
|---|----------|------|----------|
| A1 | **免登入即可讀經**（個人模式） | 兒少 / 慕道友門檻 | 歡迎頁、`AuthContext` 訪客 |
| A2 | **離線可讀經**（有 DB 時） | USB / 本機治理 | `bible_reader.db`、`read_progress.js` |
| A3 | **對外 URL 一律 `/bible_app/`** | 上云 / bat / 文件一致 | `index.html`, `serve.json`, bat/vbs |
| A4 | **讀後 AI 預設走 supply** | 無 Hub 時不 404 | `bridge.js`, `supply/prompt.html` |
| A5 | **Hub 工具須 probe 成功才顯示** | 獨立部署不壞 | `bridge.js` `probeHubAi` |
| A6 | **localStorage 鍵 `bible100_read_progress_v1`** | 既有用戶進度 | `read_progress.js` |
| A7 | **四語經文與 locale 切換** | P0.5 驗收 | `page_locale.js`, `bible_reader_core.js` |
| A8 | **無 DB 時顯示警告，不假裝全庫** | `br-db-alert` | 殼 probe |
| A9 | **App=跑道、Bible100=補給站** | 產品分工 | 不把釋經重寫進跑道 |
| A10 | **兒童預設不產生可識別個人的公開列** | 隱私 | 英雄榜設計 |

### B. 實作新功能時「只能擴充、不能替換」

| 項目 | 做法 |
|------|------|
| `read_progress.js` | **新增** v1 schema 遷移；讀到舊格式自動升級；**勿**改鍵名或清空 `done{}` |
| `bridge.js` | 可**追加**深連結；**勿**移除 supply 預設、**勿**強制依賴 `ai_tools` |
| `firestore.rules` | 可**新增** `stats` / `memberCare` match；**勿**放寬 `progress` 給牧者 |
| `onProgressWrite` | 可**追加**聚合邏輯；**勿**刪除現有證書觸發（除非明確棄用並文件化） |
| Expo `TrackingEngine` | 新功能走同一 `unitId` 格式；**勿**另造第三套章節 ID |
| `packages/core/data/*` | 跑道 JSON 可擴充；**勿**改既有 `unitId` 語意 |

### C. Bible100 全站治理（跨模組）

| # | 不可違反 | 出處 |
|---|----------|------|
| C1 | 敏感靈性資料預設**不上雲** | `.cursor/rules/bible100-current-governance.mdc` |
| C2 | 人員主鍵對齊 **`member_id`**，不新造永久 ID | `.cursor/rules/bible100-cross-module-data.mdc` |
| C3 | `index_v5` 右欄 `contentFrame`；避免殼中殼 | Hub 規則 |
| C4 | `data/`、`.db` 不進 Git | `.cursor/rules/bible100-git-push.mdc` |
| C5 | 側欄導航用 `data-b100-nav` 四模式 | `bible100-unified-navigation.mdc` |
| C6 | v2 Sheets SSOT **須明確啟用**，不默認覆蓋 v1 | 現行治理 |

### D. 新功能開發時「禁止」行為

1. **禁止**英雄榜出現個人排名列或真實姓名。
2. **禁止**要求 Firebase 登入才能讀經（教會功能可選登入）。
3. **禁止**把 `bible_study` / `ai_tools` iframe 嵌進跑道主流程（用深連結）。
4. **禁止**前端直接 aggregate 全教會 `users/*/progress`（費用 + 違規則）。
5. **禁止**修改進度結構而不做 `schema_version` 遷移。
6. **禁止**對外文件或連結使用 `/bible_app/shell/` 作為 canonical URL。
7. **禁止**同跑隊做成開放聊天室（僅固定加油貼圖）。
8. **禁止**在未更新測試的情況下破壞 `test_shell_*.py` / `test_reading_tracks.py` 假設。

---

## 五、實作前後必跑測試（回歸清單）

```powershell
cd bible_app
python tests\test_shell_standalone.py
python tests\test_shell_url_smoke.py
python tests\test_shell_locale_smoke.py
python scripts\check_bible_db_versions.py
python tests\test_reading_tracks.py
cd packages\core && npm test
```

將來新增（尚未撰寫）：

- `tests/test_reading_stats_schema.py` — schema 遷移、unit_key 對照
- `tests/test_hero_board_no_pii.py` — stats 文件無 uid/姓名欄位

---

## 六、與現有文件的關係

| 文件 | 關係 |
|------|------|
| [`MASTER_PLAN_V1.md`](MASTER_PLAN_V1.md) | 產品願景；本備案為社交／教會／統計延伸 |
| [`READING_STATS_SCHEMA_V1.md`](READING_STATS_SCHEMA_V1.md) | 本機 + 雲端聚合資料契約 |
| [`PHASE1_PRD.md`](PHASE1_PRD.md) | Expo 成年跑道；與 Phase 2+ 對齊 |
| [`IMPLEMENTATION_ORDER_ENTRY_I18N.md`](IMPLEMENTATION_ORDER_ENTRY_I18N.md) | **P0–P2 優先**；本備案不得跳過 P0 約束 |
| [`OPERATIONS_GUIDE.md`](OPERATIONS_GUIDE.md) | 教會營運；英雄榜／報名接上後更新 |
| [`firebase/README.md`](../firebase/README.md) | 集合結構；實作時擴充 `stats` 章節 |
| [`sheets/README.md`](../sheets/README.md) | 報名 `registrations` tab 已存在 |

---

## 七、實施順序（凍結）

```
Phase 1 → 凍結 schema + 天路歷程本機頁
Phase 2 → stats 聚合 + 英雄榜數字 + 報名 + 同跑隊 Lite
Phase 3 → 小組 stats + memberCare + 家庭隊
Phase 4 → index_v5 入口 + USB 備援 + member_id
```

**硬規則：** Phase 1 的 schema 沒凍結前，不開 Phase 2 Firebase 聚合。

---

## 八、給未來開發者

> 加教會、加英雄榜、加同跑隊時：**只加聚合層與新頁面，不放寬 progress 隱私、不逼登入、不換對外 URL、不刪 supply 離線鏈。**  
> 英雄榜是**統計儀表板**，不是**個人排行榜**。
