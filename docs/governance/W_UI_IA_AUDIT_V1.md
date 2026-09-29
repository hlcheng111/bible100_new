# W_UI · 全站 IA／Chrome 收斂 · 討論紀錄與驗收清單 V1

> **日期**：2026-07-27  
> **狀態**：**紀錄在案 · 待 W_UI-0 第二重功課後再綜合行動**  
> **觸發**：外觀巡視（不進每頁功能細改）— `index_v5` 進教會事工迷路、CRM 舊名、dashboard 多層 chrome  
> **相關**：[`PLAN_ADMIN_TWO_BRANCH_V1.md`](./PLAN_ADMIN_TWO_BRANCH_V1.md) · [`SITE_PAGE_REGISTRY_V1.md`](./SITE_PAGE_REGISTRY_V1.md) · [`UNIFIED_NAVIGATION.md`](./UNIFIED_NAVIGATION.md) · [`PRODUCT_CONSTITUTION_V1.md`](./PRODUCT_CONSTITUTION_V1.md) · [`UI_PATTERN_CATALOG.md`](./UI_PATTERN_CATALOG.md)

---

## 0. 文件用途（給維護者與 Agent）

本檔 **不是** 直接開工改 UI 的任務單，而是：

1. **封存** 2026-07-27 巡視討論結論（小白視角 + 建網／UI 專家視角）。  
2. **收錄** W_UI 驗收 Checklist（實作後勾選）。  
3. **定義 W_UI-0「第二重功課」** — 全模組盤點與決策表填完後，才進入 W_UI 綜合改碼波次。  

**原則**：邊做邊改造成 **新舊並呈**；功能波次（CM P0–P2 等）可測過，但 **IA 與 chrome 未收斂**，小白仍易迷路。

---

## 1. 討論摘要（使用者困惑 → 根因）

### 1.1 現象

| # | 使用者觀察 | 技術／產品解讀 |
|---|------------|----------------|
| A | `index_v5` 點「教會事工」卻到 **🗺️ CRM 旅程** | 現行 SSOT 預設應為 **規劃 landing**（`index_plan.html`），非 CRM Hub；舊入口、教材大門 4F 按鈕、搜尋索引、書籤仍導向 `guide_crm_journey_hub.html` |
| B | 直接開 `church_ministry/dashboard.html` 資訊過多、不知何來何去 | 該頁為 **行政深度戰情**，非 Standalone 預設首屏；且頁內疊多層 chrome |
| C | 頂欄／側欄／語言／「15 主桌」／總站導航／Quick Links 重複 | **五層 chrome 並存**（總站 + 模組頂欄 + 側欄 + 內容頁 top-nav + desk-kit／CRM bar） |
| D | 側欄 A–F 後又有「換模組／專用側欄／總站／舊 index」 | 產品憲法允許 **明示** 換左欄，但與日常 A–F 混在同一視野 → 認知負荷過高 |
| E | 全站大模組能否短時間適應「萬多頁」 | 實際為 **數百～上千 HTML**；教會 CM 有 0–F 細編最完整；問題是 **landing 與路線不足**，非單純頁數 |

### 1.2 診斷結論（一句話）

**CRM 獨立品牌已在 config 退役，但連結／文案／manifest／部分 Cursor 規則未收口；教會事工存在「規劃／行政／Standalone／巨石 dashboard」多首頁角色，chrome 未依 iframe 層級做減法。**

### 1.3 教會事工 · 三入口並存（現況對照）

| 入口 | 左欄（sidebar） | 右欄（content） | 設計角色 |
|------|-----------------|-----------------|----------|
| `index_v5` → `applyMode('church')` | `church_planning/sidebar_plan.html` | `church_planning/index_plan.html` | 總站 · **規劃（決策）** landing |
| `index_v5` 頂欄2「🟩 行政」 | `sidebar_church_layout_v1.html?focus=f` | `dashboard.html` | 總站 · **行政（執行）** landing |
| `church_ministry/index.html` Standalone | `sidebar_church_layout_v1.html` | `dashboard_church_layout_v1.html` | 模組獨立 · **精簡**事工總覽 |
| 直接 URL `dashboard.html` | （視外層殼而定） | 單頁巨石 | F 區深度戰情 + 全套 chrome |

**SSOT 來源**：`config/modes.json`（church 模式）、`church_ministry/index.html`、`config/modules.json`（⚠ 仍指 `dashboard.html`，與 modes 不完全一致）。

### 1.4 CRM 旅程 · 退役狀態

| 項目 | 狀態 |
|------|------|
| `modes.json` description | 「廢 CRM 獨立品牌」 |
| `guide_crm_journey_hub.html` | 頁首橫幅：「**已下架為主入口**」 |
| `sidebar_crm_journey.html` | 標「舊 CRM 側欄（已廢）」 |
| 仍導向 CRM 的入口（非 exhaustive） | `languages/landing_new_cn.html` 的 `b100Open4F()`、`site_search.js`、`site_map.js`、`nav_hub`、`help/site-navigation-guide.html`、`sidebar_c_education_journey.html` 底部、`js/church_tools_manifest.js`、`js/onboarding_v1.js` 等 |
| `.cursor/rules/bible100-planning-guide-template.mdc` | ⚠ 仍寫「CRM 橋接必用 `sidebar_crm_journey.html`」— **與現行憲法衝突**，W_UI-0 須更新 |

---

## 2. 小白應記住的三句（產品憲法 · UI 待貫徹）

1. **頂欄1** = 換**大模組**（可換左欄地圖）。  
2. **左欄 A–F（行政側欄）** = 只換**右欄**做事（日常）。  
3. **🧭 規劃** 與 **🟩 行政** = 教會事工兩條故事線 — **不是**第三套「CRM 大樓」。

迷路時 canonical 說明頁：`help/site-navigation-guide.html`（導覽憲法）。

---

## 3. 全模組 · 小白適應度（巡視快照 · 2026-07-27）

| 模式 ID | 對外名 | 預設 landing（Hub） | 適應度 | 主要卡點 |
|---------|--------|---------------------|--------|----------|
| `material` | 教材與培訓 | `languages/landing_new_cn.html` | ★★★★☆ | 語言多；第二列語言軌尚可 |
| `study` | 聖經研讀 | `bible_study` 次入口 | ★★★☆☆ | 側欄深、工具多 |
| `qna` | 聖經難題 | QnA loader | ★★★☆☆ | 與標準雙欄契約不同族 |
| `church` | 教會事工 | `index_plan.html`（規劃） | ★★☆☆☆ | 規劃／行政／CRM 舊名；dashboard 過載 |
| `school` | 學校管理 | embed `school_management/index.html` | ★★★☆☆ | Hub embed 與他模不一致 |
| `ai` | AI 輔助 | `ai_tools/ai_lab_landing.html` | ★★★★☆ | Lab landing 較清楚 |

---

## 4. 專家建議 · 收斂方向（紀錄 · 未實作）

### 4.1 原則 A · 一頁一職（Landing SSOT）

| 層級 | 建議唯一 landing | 降級／合併 |
|------|------------------|------------|
| 總站進教會 · 決策 | `church_planning/index_plan.html` | CRM Hub 僅 redirect |
| 總站進教會 · 執行 | 待 W_UI-0 決策：`dashboard_church_layout_v1` vs `dashboard.html` | 巨石 dashboard → F 深度戰情 |
| CM Standalone | 維持 `dashboard_church_layout_v1.html` | — |
| 各模組 Hub | 各 `modes.json` `defaultEntry` | 禁止殼中殼 |

**⚠ 待決策**：[`PLAN_ADMIN_TWO_BRANCH_V1.md`](./PLAN_ADMIN_TWO_BRANCH_V1.md) 寫行政預設右欄為 `dashboard.html`；巡視建議改以 **layout_v1 作首屏**、dashboard 作進階 — W_UI-0 §5.1 必決。

### 4.2 原則 B · Chrome 只留一層

| Chrome 類型 | 建議保留位置 | 內容頁／landing 應隱藏 |
|-------------|--------------|------------------------|
| 語言 | 總站頂欄 **或** 模組頂欄（二選一） | 側欄 lang row、頁內 lang host |
| 回總站／換模組 | 總站頂欄 + 側欄 meta 摺疊 | `landing-top-nav`（iframe 內） |
| 「← 15 主桌」 | 僅 CM 深層子頁（`cm_desk_kit.js`） | landing／dashboard |
| CRM context bar | workflow 子頁 | landing |

### 4.3 原則 C · CRM 退役收口

- 舊 Hub／側欄 → redirect 或書籤相容頁（橫幅已存在）。  
- 全站 grep「CRM 旅程」文案 → 改「教會事工 · 規劃／行政」。  
- 更新衝突 Cursor 規則與 `UI_PATTERN_CATALOG.md` 之 **P-CRM-HUB** 標記。

### 4.4 原則 D · Landing 四塊模板

沿用規劃模組 `planning-guide-box`（適合誰／何時用／體量／填完去哪），推廣至 CM 行政 landing、BS、AI。

### 4.5 原則 E · 頂欄2 命名鎖

小標 = 模組正式名；工程詞（CTA-OS、CRM、Phase）不得作 H1／主按鈕。

### 4.6 原則 F · 色彩 SSOT

共用 token；模組僅 accent 差異（規劃 indigo、行政 green、教材 blue）。

---

## 5. W_UI-0 · 第二重功課（**綜合行動前必做**）

> 使用者要求：**不只擴 checklist、不立刻只做 UI 皮膚** — 先完成下列盤點與決策，再開 W_UI 改碼波次。

### 5.1 產品決策表（填完才改 defaultEntry）

| ID | 問題 | 選項 | 決策 | 決策人／日期 |
|----|------|------|------|--------------|
| D1 | 總站「教會事工」首次點擊 landing | A 規劃（現行） B 行政 C 分流問答 | **暫維持 A**（modes.json） | 待確認 |
| D2 | 行政分支 **首屏** 右欄 | A `dashboard.html` B `dashboard_church_layout_v1.html` C 新合一頁 | **未決** — 與 PLAN_ADMIN 對照 | |
| D3 | `dashboard.html` 最終角色 | A 行政 landing B F 深度戰情 C 合併進 layout_v1 | **未決** | |
| D4 | CRM Hub 處置 | A 硬 redirect B 保留橫幅 C 移 archive | **未決** | |
| D5 | 語言控制 SSOT | A 僅總站 B 僅模組 C 總站+模組同步 | **未決** | |

### 5.2 全模組 Chrome 盤點表（每模組一行 · W_UI-0 交付物）

對 `config/modes.json` 各 `id` 填：

| 模式 | defaultEntry sidebar/content | 頂欄2 項數 | 側欄檔 | 內容頁重複 chrome（Y/N） | 殼中殼風險 | landing 有路線圖（Y/N） | 備註 |
|------|------------------------------|------------|--------|--------------------------|------------|------------------------|------|
| material | | | | | | | |
| study | | | | | | | |
| qna | | | | | | | |
| church | | | | | | | |
| school | | | | | | | |
| ai | | | | | | | |

**建議產出**：`docs/governance/W_UI_CHROME_INVENTORY_V1.md`（或本檔附錄 B）由 Agent 掃描 HTML 自動填表。

### 5.3 CRM／舊入口連結審計（W_UI-0 交付物）

- [ ] 產出 `guide_crm_journey` / `sidebar_crm_journey` / 字面「CRM 旅程」**完整檔案清單 + 行號**（grep 報告存 `docs/reports/w_ui_crm_link_audit_YYYYMMDD.md`）  
- [ ] 分類：主入口／深鏈／書籤相容／測試 fixture／可刪  
- [ ] 對照 `config/modules.json` 與 `modes.json` 不一致項  

### 5.4 小白 5 分鐘劇本 · 基線錄影／截圖（W_UI-0）

改碼前後各跑一遍，結果寫入 `docs/reports/w_ui_baseline_YYYYMMDD.md`：

1. 無痕 → `index_v5.html` → 教材 → 教會事工 → **預期** 長執決策大腦  
2. 頂欄2 → 🟩 行政 → **預期** 行政 landing（依 D2 決策）  
3. 側欄 → 會友主檔 → **只換右欄**  
4. 側欄 → 🧭 回規劃 → **雙欄互切**  
5. `help/site-navigation-guide.html` → 能解釋「我在哪一樓」  

### 5.5 規則／文件同步清單（W_UI-0）

- [ ] 更新 `PLAN_ADMIN_TWO_BRANCH_V1.md` 與 D2/D3 決策一致  
- [ ] 更新 `UI_PATTERN_CATALOG.md`：P-CRM-HUB 標 **deprecated**  
- [ ] 更新 `bible100-planning-guide-template.mdc` CRM 橋接句  
- [ ] `config/modules.json` church_ministry.path 與 modes 對齊  
- [ ] 必要時增 `tests/test_w_ui_landing_ssot.py`（靜態：modes defaultEntry、禁止 CRM 為 church 預設）

### 5.6 W_UI-0 完成定義（DoD）

- D1–D5 決策表 **無空白「未決」**（或明確標「暫緩 + 理由」）  
- §5.2 六模式 chrome 盤點表 **填滿**  
- §5.3 grep 報告 **已存檔**  
- §5.4 基線報告 **已存檔**（改碼前至少一版）  
- 維護者簽核：**可以開 W_UI-P0 改碼**

---

## 6. W_UI 實施波次（** gated by W_UI-0 **）

| 波次 | 內容 | 依賴 |
|------|------|------|
| **W_UI-0** | 第二重功課（§5） | — |
| **W_UI-P0** | CRM 連結收口；`landing_new_cn` 4F 改道；modules.json 對齊 | W_UI-0 DoD |
| **W_UI-P1** | dashboard chrome 剝離；iframe 內隱藏 `landing-top-nav`；desk-kit／CRM bar 條件載入 | D2/D3 |
| **W_UI-P2** | 全模組 landing 四塊模板；語言 SSOT | §5.2 |
| **W_UI-P3** | 色彩 token；site_search／onboarding 文案；Cursor 規則 | P0–P2 穩定 |

---

## 7. W_UI 驗收 Checklist（實作後勾選）

### A. 入口與 SSOT

- [ ] `config/modes.json` 與 `config/modules.json` 教會路徑一致  
- [ ] 總站「教會事工」→ 規劃 landing（非 CRM Hub）  
- [ ] 全站無 **未 redirect** 的 CRM Hub **主入口**連結  
- [ ] `church_ministry/index.html` 預設 = `dashboard_church_layout_v1.html`  
- [ ] Hub 進 CM **不**嵌 `church_ministry/index.html`（無殼中殼）  

### B. Chrome 去重

- [ ] iframe 內容頁在 Hub 內時隱藏 `landing-top-nav`  
- [ ] 語言控制全站 ≤ 1 可見層（依 D5）  
- [ ] landing 不注入 `cm-desk-bar` / `crm_context_bar`  
- [ ] 側欄「換模組」僅 meta 一處；A–F 無 silent 換他模側欄  

### C. Landing 內容

- [ ] 各模組 landing 含 **3 步路線** + **填完去哪**  
- [ ] 行政首屏有「今日三條路」優先於 KPI 牆（若 D2 採 layout_v1）  
- [ ] demo 頁有能力徽章（`page_capability_badge.js`）  
- [ ] F 區「怎麼走」→ `vision_and_plan.html`，非 CRM Hub  

### D. 導航契約

- [ ] 側欄主鏈 `data-b100-nav="content"`；跨模 `module` + 明示文案  
- [ ] `python tests/test_unified_navigation.py` 通過  
- [ ] `python tests/test_church_nav_ui_contract.py` 通過  
- [ ] 改 nav/help 後 `python scripts/check_phase_tool_and_nav_links.py` 通過  

### E. 搜尋與 onboarding

- [ ] `site_search.js` / `site_map.js` 不以 CRM 為教會主入口  
- [ ] `onboarding_v1.js` 改「規劃／行政」敘事  
- [ ] `help/site-navigation-guide.html` 更新 4F/5F（去 CRM 品牌）  

### F. 視覺統一

- [ ] 共用 landing／guide CSS token  
- [ ] `--top-offset` 各模組一致  
- [ ] 手機：總站 ☰ + 單欄；CM Standalone 上選單／下內容  

### G. 小白 5 分鐘劇本（改碼後必過）

- [ ] §5.4 五條 **全部通過**（可附截圖連結至 reports）  

---

## 8. 驗收 URL（本機 HTTP · 根目錄 `bible100_new`）

| 目的 | URL |
|------|-----|
| 總站 | `http://127.0.0.1:8080/index_v5.html` |
| 教會 · Standalone | `http://127.0.0.1:8080/church_ministry/index.html` |
| 教會 · 規劃 landing | `http://127.0.0.1:8080/church_planning/index_plan.html` |
| 教會 · 行政巨石（現頂欄2 行政） | `http://127.0.0.1:8080/church_ministry/dashboard.html` |
| 教會 · 精簡總覽 | `http://127.0.0.1:8080/church_ministry/dashboard_church_layout_v1.html` |
| 導覽憲法 | `http://127.0.0.1:8080/help/site-navigation-guide.html` |
| 舊 CRM Hub（應非主入口） | `http://127.0.0.1:8080/church_ministry/guide_crm_journey_hub.html` |

---

## 9. Chrome 堆疊示意（教會行政 · 現況 · 待 P1 減法）

```
[index_v5 頂欄1 大模組 + 頂欄2 教會子入口 + 語言]
    ↓
[CM Standalone 頂欄（若直接開 index.html）+ 語言]
    ↓
[sidebar_church_layout_v1：語言 + 回規劃 + 今日常用 + A–F + 總站 + 換模組]
    ↓
[dashboard.html 內容]
  · landing-top-nav（全站捷徑列）
  · crm_context_bar
  · cm-desk-kit「← 15 主桌」
  · 頁內語言
  · hero + KPI + Quick Links …
```

**目標**：landing 僅保留 **hero + 路線圖 + 今日三入口**；其餘 chrome 依 §4.2 上移或條件關閉。

---

## 10. 與其他波次關係

| 波次 | 關係 |
|------|------|
| CM P0–P2（功能） | 已實作島嶼頁／Tab 整合；**不取代** W_UI landing／chrome 收斂 |
| W1 各模 SSOT | `SITE_PAGE_REGISTRY_V1.md` 細編；W_UI 不發明第二套 0–F |
| W3 導航行為 | `UNIFIED_NAVIGATION.md`；W_UI-P1 落實 iframe chrome |
| 產品憲法 | 地圖穩 · 頂欄2 正式名 · 禁止 silent 換側欄 |

---

## 11. 修訂紀錄

| 日期 | 變更 |
|------|------|
| 2026-07-27 | V1 建立：巡視討論摘要、W_UI Checklist、W_UI-0 第二重功課定義、待決策表 |

---

## 附錄 A · 關鍵程式／設定錨點

| 用途 | 路徑 |
|------|------|
| 總站 church 模式載入 | `js/index_v5_shell.js` → `loadMode` → `config/modes.json` |
| 教會 Standalone 頂欄按鈕 | `church_ministry/js/cm_index_shell.js`（`btn-focus-crm` → `dashboard.html`） |
| 行政側欄 SSOT | `church_ministry/sidebar_church_layout_v1.html` |
| 規劃 landing | `church_planning/index_plan.html` |
| 舊 CRM Hub | `church_ministry/guide_crm_journey_hub.html` |
| 教材大門 4F（仍連 CRM） | `languages/landing_new_cn.html` → `b100Open4F()` |
| desk-kit「15 主桌」 | `church_ministry/js/cm_desk_kit.js` |
| 模組 manifest（church path 舊） | `config/modules.json` |
