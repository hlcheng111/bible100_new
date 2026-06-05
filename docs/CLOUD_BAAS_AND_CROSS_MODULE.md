# 上雲、BaaS、登入權限與跨模組分析（預留設計）

**狀態**：規劃／預留 — 目前主線仍為瀏覽器 `localStorage`（canonical 鍵 `bible100_smart_ministry_main`）。本文件供日後實作後端時對齊，避免各頁各自發明儲存格式。

---

## 1. 為何需要後端／BaaS

- **集中真實來源**：多裝置、多同工、可稽核的寫入與讀取。
- **登入與角色**：誰可匯出、誰可改指派、誰僅能填答 — 需身分驗證與授權（例如 RLS 或 API 層檢查）。
- **跨模組分析**：將恩賜測驗、性格工具、技能映射、事工指派、追蹤時間線等匯入**同一語意層**（統一人物鍵 + 事件時間軸），才能做報表與儀表板，而非僅單頁 localStorage。

---

## 2. 建議技術切角（非綁定廠商）

- **BaaS 範例**：Supabase（Postgres + Auth + RLS）、Firebase、或自建 API + PostgreSQL。
- **最小遷移路徑**：以現有 canonical JSON 形狀為 **v1 API 契約**；前端逐步改為「離線快取 + 同步」而非唯一真相。
- **統一鍵**：預留 `person_id`（或 `talent_id` 與教會成員主檔對照表）；跨模組列一律可關聯到該鍵，見 `docs/DATA_SCHEMA.md`／`DATA_CONTRACT_v0.1.md` 並隨實作升版。

---

## 3. 跨模組集中儲存策略（概念）

| 層級 | 內容 |
|------|------|
| 身分 | 登入使用者、教會／堂會範圍、角色（會友／同工／領袖／管理）。 |
| 人物 | 統一 `person_id`，與 registration、問卷結果、talent 列、assignment 列關聯。 |
| 事件／快照 | 問卷提交、配對確認、追蹤里程碑 — 帶 `source`、`timestamp`、`schema_version`。 |
| 匯出與分析 | 受權 API 或批次匯出；敏感匯總在後端計算。 |

---

## 4. 下一輪「類似 UX 改良」優先頁面（與配對頁同一牧者向原則）

以下兩頁與主線 **Discern → Fit → Grow** 直接銜接，建議沿用：**精簡統計、搜尋優先、進階欄摺疊、工具／匯出收斂、窄螢幕分區**，並在文案／頁尾鏈結本文件作雲端預留。

1. **`smart_ministry/talent_skill_unified.html`**（恩賜與技能統整、表格與多區塊並列，技術欄與 AI 按鈕宜分層）
2. **`smart_ministry/talent_tracking.html`**（時間線／列表並存時易顯「控制台感」，可改搜尋優先與摺疊篩選）

**可選第三輪**：`smart_ministry/dashboard.html`（領袖總覽 — 卡片與連結多時同樣適合收斂與分層）。

---

## 5. 與現有文件的關係

- 資料規則與鍵名：**`smart_ministry/docs/SMART_MINISTRY_DATA_RULES.md`**
- 全站問卷與 storage 原則：**`docs/SURVEY_DESIGN_PRINCIPLES.md`**
- 優化總覽與主線 URL：**`docs/OPTIMIZATION_SUMMARY.md`**
