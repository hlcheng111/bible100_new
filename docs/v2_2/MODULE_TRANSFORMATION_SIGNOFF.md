# Bible100 V2.2 模組轉變打勾與簽核表

> 用途：站上逐模組驗收「既有功能未破壞 + 新增能力已上線」  
> 使用方式：每次驗收一個環境（dev/staging/prod）各打一份；不共用打勾結果。

---

## A. 驗收基本資訊

- 驗收日期：`____-__-__`
- 環境：`dev / staging / prod`
- Web App Base URL：`________________________`
- SSOT Spreadsheet ID：`________________________`
- 驗收人：`________________________`

---

## B. 全站級檢查（先過這關再進模組）

- [ ] `?action=getSchemaStatus` 全部 `ok=true`
- [ ] `?action=getWriteLayerReadiness` 回傳符合當前策略（通常 prod 初期 `writeEnabled=false`）
- [ ] `index_v5.html` 可正常載入（無白屏）
- [ ] `localStorage` 舊主線 canonical 未被覆蓋
- [ ] 無 raw 問卷、無 Member PII 暴露於公開 API

簽核（全站）：  
TL：`____________`　Data Guard：`____________`

---

## C. 模組逐項簽核

### C1. 教材與導覽 Shell（`index_v5.html`）

- [ ] Mode 切換（material/explorer/church/ai）正常
- [ ] 第二列 contextBar 可正常顯示
- [ ] 設定 `b100_v2_api_base` 後，能看到 `navigation_map` 捷徑（橋接）
- [ ] 移除 API Base 後，fallback 仍正常

簽核：產品/運營 `____________`，工程 `____________`

### C2. Q&A（`qna/` + API）

- [ ] `getQnaList` 可依 `source_id/lang/q` 篩選
- [ ] `format=html` 回傳 `items + html`
- [ ] 非 active 項目未出現在結果
- [ ] 既有 Q&A 頁面可正常使用（不破壞舊路徑）

簽核：內容同工 `____________`，工程 `____________`

### C3. Bible Versions（`bible_versions`）

- [ ] `getBibleVersions` 回傳 active 資料
- [ ] `lang/q` 篩選正確
- [ ] 前端導向連結可打開

簽核：內容同工 `____________`，工程 `____________`

### C4. Hymn / Playlist（`hymns`, `playlists`, `playlist_items`）

- [ ] `getHymnList` 可依 `lang/tag/q` 篩選
- [ ] 歌詞/音訊 URL 可正常開啟
- [ ] 歌單資料關聯無斷鏈（playlist -> playlist_items -> hymn）

簽核：敬拜同工 `____________`，工程 `____________`

### C5. AI Tools（`ai_tools/index.html` + `ai_tools_config`）

- [ ] `getAiToolsConfig` 正常回傳
- [ ] AI Tools 頁可顯示 Sheets 捷徑（橋接）
- [ ] fallback（無 API Base）仍正常
- [ ] 不可用工具項目不會誤導向

簽核：AI 同工 `____________`，工程 `____________`

### C6. 課程與報名（`courses`, `registrations`）

- [ ] `getCourseList` 篩選正確
- [ ] （若灰度開啟）`postFormWebhook` 冪等有效
- [ ] `form_response_id + course_id` 重送不重複寫入
- [ ] 報名異常會寫入 `ministry_logs`

簽核：行政同工 `____________`，工程 `____________`

### C7. Members（`members`）

- [ ] （若啟用）`postMember` 僅寫白名單欄位
- [ ] 同 email 不重複建檔（idempotent）
- [ ] 不寫入 phone/address 等敏感欄位

簽核：行政同工 `____________`，Data Guard `____________`

### C8. Planning KPI（`planning_kpi` + 子表）

- [ ] `getPlanningKpi` 組裝結構正確
- [ ] （若啟用）`postPlanningKpi` 可寫主表與子表
- [ ] `postSmartMinistryExport` 可寫摘要，不允許 raw/PII

簽核：規劃同工 `____________`，工程 `____________`

### C9. Logs 觀測（`ministry_logs`）

- [ ] `getMinistryLogs` 可依 `module/level/action/status` 篩選
- [ ] 錯誤流可追蹤，且 details 無 email 明文
- [ ] 監控週期日報可產出

簽核：On-call `____________`，TL `____________`

---

## D. 發版決策

- [ ] Go
- [ ] No-Go

No-Go 原因（若有）：  
`__________________________________________________`

最終批准：  
TL：`____________`　UAT Owner：`____________`　Data Guard：`____________`
