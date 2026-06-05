# 教會 CRM 藍圖（Bible100 · church_ministry）

> **定位**：企業 CRM 管「客戶旅程」；本專案管「**信徒屬靈旅程 + 跨事工協作**」。  
> **技術主線**：`member_id` + `ChurchDataBridge` + `churchMasterDatabase` +（配對）`SmartMinistryCanonical`。  
> **相關**：[`CHURCH_MINISTRY_HUB_AUDIT.md`](./CHURCH_MINISTRY_HUB_AUDIT.md) · [`CRM_ENGINEERING_PHASES.md`](./CRM_ENGINEERING_PHASES.md) · [`MEMBER_DATA_MODEL.md`](./MEMBER_DATA_MODEL.md) · [`DECISION_MAKER_PATH.md`](./DECISION_MAKER_PATH.md) · [`../../docs/CHURCH_ERP_OPERATION_SUBSYSTEM_SPEC.md`](../../docs/CHURCH_ERP_OPERATION_SUBSYSTEM_SPEC.md)

---

## 1. 三層 CRM 對照

| CRM 層 | 企業 | 教會 Bible100 | 現況（約） |
|--------|------|---------------|------------|
| **操作層** | 聯絡人、Ticket、流程 | 會友、探訪、志工排班、牧養事件 | **55%** — 主檔+探訪+志工已可寫；新人 SLA 規則已入 Bridge |
| **分析層** | 漏斗、預測 | SPAC、留存、Smart Alerts、研究 KPI、CTA-OS | **45%** — 教會級強；個人漏斗未全站強制 |
| **協同層** | 部門共享客戶 360 | `getMember360Timeline`、配對目錄同步 | **40%** — API 已補；UI 入口與側欄去重未完成 |

儀表板可讀 **`ChurchDataBridge.getCrmMaturitySummary()`** 即時成熟度（0–100）。

---

## 2. Inventory → Standardize → Automate

### 2.1 Inventory（盤點）— 還缺什麼？如何補？

| 缺口 | 說明 | 補足工程 |
|------|------|----------|
| **I1 部門實體資料未進系統** | 紙本、WhatsApp、各部 Excel 不在 `memberSystemData` | 教會實務：`Church CRM Inventory` 資料夾匯總 → **`load_central_member_seed` / JSON 匯入**；工程：**統一匯入精靈**（待做） |
| **I2 頁面級幽靈資料** | 78 側欄頁各自 `localStorage` 鍵 | **`PAGE_AUDIT_MATRIX_v1.md`** + 側欄精簡（階段 2）；禁止新頁自造永久鍵 |
| **I3 問卷結果散落** | `church_planning`、Smart Ministry 多處 | 清單：`attachAssessmentToTalent` 接線表（見 `smart_ministry/docs/IMPLEMENTATION_ORDER.md`） |
| **I4 機械盤點未進 CI** | 斷連、缺頁 | **M-04**：`site_full_audit.py` 發版前可選跑 |

**已具備**：`scripts/generate_page_audit_matrix.py`、`PHASE0_INVENTORY_CHECKLIST`、`scripts/audit_sidebar_links.py`。

### 2.2 Standardize（標準化）— 還缺什麼？如何補？

| 缺口 | 說明 | 補足工程 |
|------|------|----------|
| **S1 屬靈階段不統一** | 各頁自訂文字 | ✅ **`js/church_crm_constants.js`**：`seeker` / `new_believer` / `growing` / `serving` / `leader`；Bridge 正規化 `spiritual_journey_stage` |
| **S2 事件類型不統一** | 探訪、課程、服事各說各話 | ✅ **`pastoral_events_v1`** + `appendPastoralEvent` / `listPastoralEvents` |
| **S3 崗位 ID 雙源** | 志工崗位 vs 配對目錄 | ✅ **`syncMinistryCatalogFromVolunteer`**（志工存檔時同步） |
| **S4 Master People 欄位** | 與您 Google Sheet 對齊 | 見 [`MEMBER_DATA_MODEL.md`](./MEMBER_DATA_MODEL.md) 增補欄位 |

### 2.3 Automate（自動化）— 還缺什麼？如何補？

| 缺口 | 說明 | 補足工程 |
|------|------|----------|
| **A1 新人 3 日跟進** | 手冊承諾、未實作 | ✅ **`evaluateNewcomerFollowUpAlerts`**（依 `first_visit_date` / `membershipDate`） |
| **A2 流失／RSVP 規則** | 部分有 | ✅ 既有 `evaluateSmartAlertsAsync`；儀表板合併新人 alert |
| **A3 階段晉升建議** | 無 | 待做：規則 `suggestStagePromotion(member_id)` 讀 `education_history` + 服事 |
| **A4 表單→CRM** | Google Form 管線 | 待做：匯入 API 或 **AI 標準化上傳**（`CLOUD_ROADMAP` 中期） |
| **A5 雲端多同工** | 僅本機 | **I-03～I-05**：`USE_API`、Auth、RBAC |

---

## 3. 完整 CRM 終局驗收（三條）

| # | 驗收句 | 走到 100% 的工程 |
|---|--------|------------------|
| **E1** | 搜尋一人 → **一頁 360**（初來、受洗、小組、課程、奉獻、探訪、服事、問卷摘要） | 主推 **`member-360-timeline.html`** + 會友整合頁嵌入；時間軸已含 pastoral / attendance / assignment |
| **E2** | 儀表板三類待辦：**未跟進新人 / 風險關懷 / 可晉升階段** | 新人 ✅；風險 ✅ Smart Alerts；晉升 ⏳ `suggestStagePromotion` + 右欄「我的工作桌」動態化 |
| **E3** | 部門只看**缺口與建議人選**，不再第八份 Excel | 志工崗位 SSOT + 目錄同步 ✅；配對確認 UI ⏳；側欄去重 ⏳ |

---

## 4. 從 40–50% → 100%：四大缺口與工程包

您先前摘要的四項缺口，對應如下：

| 缺口 | 含義 | 補足狀態 | 剩餘工程 |
|------|------|----------|----------|
| **統一階段** | 慕道→領袖全站同一枚舉 | 🟡 常數+正規化已上線 | 各整合頁表單改下拉；種子資料寫入 `spiritual_journey_stage` |
| **統一事件流** | 所有牧養動作進時間軸 | 🟡 `pastoral_events_v1` 已上線 | 探訪工作桌／會友頁存檔時呼叫 `appendPastoralEvent` |
| **統一新人工作流** | 3 日 SLA + 任務 | 🟡 規則已上線 | 工作桌自動建立任務列；與 `visitation` newcomer 計劃連動 |
| **部門零重複** | 一業務一入口 | 🔴 未做 | 側欄精簡 + 301；analytics→research |

**成熟度計算**：`getCrmMaturitySummary().percent` — 8 項檢查加權（會友、階段、事件流、探訪、崗位、目錄、配對、360 API）。

---

## 5. 兩大模組互聯（調查配對 × 事工部門）

```
信徒問卷 (church_planning / smart_ministry)
    → attachAssessmentToTalent + gift snapshots
    → 配對引擎 (talent_ministry_matching)
    → ministry_assignment (suggested → confirmed)
    → volunteer 排班 (active)
    ↑
部門招募 (volunteer-integrated 崗位)
    → syncMinistryCatalogFromVolunteer
```

**鐵律**：配對不自動派工；探訪不自動轉事奉。

---

## 6. 建議實施順序（與產品決策一致）

1. **垂直做深**：會友 + 探訪 + 志工 + `member_id`（進行中）  
2. **CRM 底座**：本文件 + Bridge API（**本次已落地**）  
3. **接線**：探訪存檔 → `appendPastoralEvent`；問卷 → `attachAssessmentToTalent`  
4. **精簡側欄**：去重清單（見前次稽核報告 §五）  
5. **上雲**：API 替換 Bridge 讀寫，不改頁面 `saveData` 簽名  

細分期程與工時見 **[`CRM_ENGINEERING_PHASES.md`](./CRM_ENGINEERING_PHASES.md)**。

---

*最後更新：CRM 常數、牧養事件流、配對讀取、崗位同步、成熟度 KPI。*
