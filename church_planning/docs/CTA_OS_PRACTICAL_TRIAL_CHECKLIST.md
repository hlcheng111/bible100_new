# CTA-OS 實用版試用清單（老師／同工）

本清單對應「實用 100%」範圍：統一 CTV 報告、NCD 接入、戰情室合成、Smart Ministry 配對示範、總站入口。不含雲端 Sheets SSOT 與正式神學審核流程。

## 前置

- 以 **本機 HTTP** 或 **file://** 開啟 `index_v5.html`（建議 HTTP 以利 iframe）。
- 從總站進入：**教會規劃** → 左欄 `sidebar_plan` → 右欄內容。
- 或直接：`church_planning/assessment-os-hub.html`（`target="contentFrame"` 時需在總站殼內）。

## 建議試用路徑（約 45–60 分鐘）

| 步驟 | 頁面 | 驗收 |
|------|------|------|
| 1 | `信徒靈性生命健康自我審查.html` | 底部或報告區出現 **CTA-OS 統一報告**（六維向量、優勢、成長、風險） |
| 2 | `smart-planning.html` | 完成至少一筆 SMART 自評並儲存 |
| 3 | `Church_Health_NCD_planning.html` | 完成八維診斷並**儲存結果**；應自動觸發 `ncd` 報告寫入 |
| 4 | `cta-os-war-room.html` | 按 **重新掃描**；合成雷達有 ≥3 工具來源；角色表有分數與來源標籤 |
| 5 | `cta-os-tool-report.html` | 可從 registry 檢視各工具快照 |

## 進階示範工具（各 8 題）

已載入 `cta_os_item_packs.js`：Johari、SHAPE、能力模型、KPI/OKR、重要緊急。填寫後按頁內「生成 CTA-OS 報告」，再回戰情室掃描。

## 總站捷徑

- `index_v5.html`：`openChurchPlanningCtaWarRoom()`（Console 或日後頂欄綁定）。
- `index_plan.html`：**CTA-OS 戰情室** 卡片。
- `config/modes.json` → 教會事工模式：**CTA-OS 戰情室** 次導覽。

## 資料與隱私

- 報告與 registry 存於 **本機 localStorage**（`cta-os-*` 鍵）；勿將含個人識別的 raw 上傳公開服務。
- Smart Ministry 配對為**示範演算法**；正式事奉決策須經牧者／堂議。

## 已知限制（非本階範圍）

- 未接 Google Sheets v2 SSOT。
- 戰情室未讀雲端會友 PII；僅用本機 canonical 事工目錄（若有）。
- 小語種課件 AI 草稿仍須人工校對。

## 快速檢查指令

```powershell
cd church_planning
npm test
```

```powershell
python tests/test_index_v5_shell.py
```

---

*文件版本：實用版完工（2026-05-28）*
