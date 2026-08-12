# 聖經跑道 · 產品範圍凍結 V1

**狀態：** 已凍結（2026-07-05）  
**版本：** `20260705a`  
**一句話：** 開心長跑、你跑我追、跨代同行；**App = 每日跑道**，**Bible100 = 補給站**。

---

## 正式入口（使用者只看這個）

| 情境 | URL / 路徑 |
|------|------------|
| 雲端／本機 HTTP | `/bible_app/` 或 `/bible_app/index.html` |
| 本機預覽 | `bible_app/index.html`（`file://` 僅創 1–2 章示範） |
| 本機完整版 | `bible_app/打開聖經跑道.bat` → `http://127.0.0.1:3000/bible_app/` |

**禁止**對外文件寫「請開 `/bible_app/shell/`」；`shell/` 僅為資產目錄，舊鏈會 302 到根入口。

---

## 主環（必須穩定）

```
Landing 首頁 → 今日關卡 → 四語讀經 → 讀完打卡
```

- 四語：`zh-Hant` · `en` · `vi` · `id`
- 四跑道：六十六卷 · 三十日 · 100金句 · 主題讀經
- 輔助（首頁可見）：同跑隊伍 · 牧養問答 · 智慧導師 · 怎麼用／為什麼做

---

## 與 Bible100 總站關係

- **不**把聖經跑道做成 `index_v5` **第七個頂欄大模組**。
- **已掛入**頂欄「聖經研讀」深鏈（2026-08）：`modes.study` → 頂欄2「跑道」／路線圖第 5 站 → `bible_app/shell/index.html`（左欄仍為研讀側欄）。
- 完整體驗（自有頂欄＋HTTP）：新分頁開 `bible_app/index.html`（轉入 shell）。
- 總站僅 **外連**（⋯ 面板 →「Bible100 總站 ↗」→ `index_v5.html`，新分頁）仍保留。
- 讀後深連結到 `bible_study` / `ai_tools` 屬 **備案**（見 `READING_MOVEMENT_BACKLOG_V1.md` F4-2）。

**正式入口（使用者）：** `bible_app/index.html` → `shell/index.html`。Hub 深鏈可直開 shell 以利 `file://` 預覽。

---

## 技術邊界（本階段不做）

| 不做 | 原因 |
|------|------|
| Expo `app/` 為主線 | Web shell 為產品主體 |
| Google Sheets SSOT 預設 | 離線 localStorage 優先 |
| 把 `shell/` 實體搬到根目錄一次搬完 | 已扁平 **URL**；資產仍 `shell/js|css|pages` |
| 英雄榜露名、PII 上雲 | 見 backlog 凍結條款 |
| 殼中殼嵌 `index_v5` | 導航與 iframe 命名衝突 |

---

## UI 原則（R1 起）

- 殼 iframe 內 **不重複** 頂欄：隱藏頁內字體列、跑道 hero、讀經器內「單語／雙語／四語」切換（由殼 ⋯ 控制）。
- `file://` **永遠** 先進 landing，不恢復上次讀經頁。
- 預覽版錯誤文案：**不**顯示「請稍後再試」，改為「僅創 1–2 章示範」四語提示。

---

## 資料與隱私

- 進度 canonical：`localStorage`（`bible_shell_state`、`B100Progress`）。
- 牧養筆記、個人靈命 raw **不上** Sheets / 公開 API。
- 會友對齊須用 `member_id`（跨模組時才啟用）。

---

## 驗收測試（改動後最小集）

```powershell
python bible_app/tests/test_track_landing.py
python bible_app/tests/test_reader_layout_copy.py
python bible_app/tests/test_shell_standalone.py
python bible_app/tests/test_bible_reader_unified.py
```

---

## 相關文件

- `docs/MASTER_PLAN_V1.md` — 產品願景
- `docs/READING_MOVEMENT_BACKLOG_V1.md` — 備案與紅線 A/C/D
- `docs/LANDING_MAINTAINER_CHECKLIST.md` — 維護清單
- `docs/IMPLEMENTATION_ORDER_ENTRY_I18N.md` — 入口與四語 P0

---

## 變更紀錄

| 日期 | 說明 |
|------|------|
| 2026-07-05 | R0 預覽／landing／四語色；R1 殼內精簡讀經 UI；R2 扁平 `/bible_app/` 入口、總站外連、幽靈 index 歸檔 |
