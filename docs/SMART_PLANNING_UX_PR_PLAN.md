# Smart Ministry × Church Planning · 牧者工作台 UX 對齊（PR 粒度）

**目的**：把「一頁一故事、數字有來源、小白三步內」落實到 **smart_ministry** 與 **church_planning** 同類頁，便於分批審 PR、降回歸風險。

**約束**：不變更 `localStorage` 主鍵與 canonical 頂層 schema；擴充僅透過既有 `metadata` 等欄位（見 `DATA_RULES`／`ADVANCED_SELF_KNOWLEDGE_TOOLS` 若需再寫明）。

---

## PR-1（已完成本輪）· `talent_ministry_matching.html` 第一線可用性

| 項目 | 說明 |
|------|------|
| 字體 | 與 `pastoral-spiritual-survey-pro.html` 對齊：`Noto Sans TC`、`Microsoft JhengHei`，基礎字級約 15px、行高 1.6 |
| 導覽 | 頂部 🔗／🗺️／🏠 改 **`target="_blank"`**，避免取代 landing／啟動頁 |
| 摺疊 | 脈絡／步驟、分數與資料流說明改 **`details` 展開**；批量策略維持摺疊 |
| 統計 | 人才／崗位／紀錄改 **橫向柱狀**＋**紀錄／人才比**環形示意；**情境列**顯示「已選崗位已分配人數」 |
| 分頁順序 | 窄螢幕預設 **③ 事工崗位** → ② → ①（進階）；選崗後 ≤900px **自動切到 ②** |
| ② 中欄 | 步驟橫幅、**崗位優先下拉**、邀請表單（狀態／備註／日期→`metadata`）、按鈕改名、規則說明摺疊 |
| 歷史 | 表格精簡欄位、**撤銷這次紀錄**、匯出 JSON／CSV 前 **confirm** |

**檔案**：`smart_ministry/talent_ministry_matching.html`

---

## PR-2 · 配對頁收尾與追蹤聯動（可選下一支）

| 項目 | 檔案 |
|------|------|
| `talent_tracking.html` 讀取 `metadata.invite_stage`／`invite_note` 顯示於時間軸或卡片 | `smart_ministry/talent_tracking.html` |
| Dashboard 全教會 KPI（註冊／恩賜／邀請覆蓋）與配對頁「情境列」不重複 | `smart_ministry/dashboard.html` |
| 更新 `guide_for_leaders.html`：AI／批量配對若移出主 UI，改文件內操作路徑 | `smart_ministry/guide_for_leaders.html` |

---

## PR-3 · 技能字典單一故事

| 項目 | 檔案 |
|------|------|
| 頂部說明、雙欄（列表＋表單）、移除配對／分數用語 | `smart_ministry/skills_expertise.html` |

---

## PR-4 · AI 實驗室三頁統一壳

| 項目 | 檔案 |
|------|------|
| 紅色警語、關係一句話、主按鈕、空資料提示、底部「主線四步」連結 | `smart_ministry/ai_matching.html`、`ai_team_optimizer.html`、`ai_performance_analyzer.html` |

---

## PR-5 · Planning 模組對齊（同原則）

**原則**：與 `docs/LANDING_UX_PRINCIPLES.md`／問卷專業版一致——**字體 stack、摺疊長說明、導覽新分頁**。

| 優先序 | 檔案 | 改良方向 |
|--------|------|----------|
| P1 | `church_planning/pastoral-spiritual-survey-pro.html` | 作為 **參考基準**（已具 16px、`Noto Sans TC`、摺疊 `intro-benefit-fold`） |
| P2 | `church_planning/ministry-8020-planning.html` 等規劃主頁 | 每頁頂部一句故事、大段說明摺疊、離開主索引用 `_blank`（若適用） |
| P3 | `church_planning/church-planning-index.html`、`index_plan.html` | 與 Smart 主線的 **手動匯出銜接** 文案對齊 OPTIMIZATION_SUMMARY |

---

## 回歸檢查清單（每 PR）

1. `file://` 與（若有用）`index_v5.html` iframe 內開啟：導覽是否如預期。
2. 窄螢幕 ≈900px：③→② 自動切換、三 panel 只顯示一個。
3. `addMinistryAssignment`：仍禁止同人同崗重複；`metadata` 可於匯出 CSV 帶出（若欄位有加）。
4. 無改 `bible100_smart_ministry_main` 頂層鍵名。

---

## 文件同步

- 本計畫：`docs/SMART_PLANNING_UX_PR_PLAN.md`
- 摘要入口：`docs/OPTIMIZATION_SUMMARY.md`（Smart 四步與本頁改良註記）
