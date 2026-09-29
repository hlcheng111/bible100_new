# 教會規劃工具 · 用字與 UI 字典 v1

> SSOT：17+1 正式工具 ACS 四 Tab 頁面。側欄、landing 文案另對 `planning_tool_registry.js`。

## Tab 名稱（全站固定）

| Tab | 標準文案 | 備註 |
|-----|----------|------|
| ① | **理念與說明** | 可含 H2 副標（如「五維儀」），不作 Tab 按鈕自創名 |
| ② | **開始測評** | 不用「問卷」「填表」混作 Tab 名 |
| ③ | **分析報告** | 不用「成績」「結果」 |
| ④ | **輔導員手冊** | 戰略類可副標「長執工作桌」，Tab 仍用此名 |

## 按鈕

| 用途 | 文案 |
|------|------|
| 主行動 | **進入測評 →** |
| 示範 | **🔍 先看示範報告** |
| 提交 | **提交並生成報告** |
| Demo 標籤 | **示範報告** |

## 免責（Tab① 至少 1 次、Tab③ 建議重複）

> 這是**自我覺察與陪伴**，不是考核排名；分數為了選一個可守住的小步。試任與服事調整須經禱告、面談與人工確認（HITL）。

奉獻相關題目加註：**私人自覺，非財政考核，不作公開比较。**

## 正式工具名稱

- **工具頁 H1**：`planning_tool_registry.js` 的 `label`（可較完整，如「權責梳理 · RACI」）
- **側欄主行**：`planning_sidebar_labels.js` 的 `main`（中文 4～6 字 · 縮寫）
- **側欄副行**：`sidebarEn` — **僅 1～2 英文詞**，不重複縮寫（例：`Job Clarity`）
- **Landing / blurb**：`landingHint` 或 registry `blurb` — 用途一句，可含題數時間

### 側欄 18 件對照（SSOT：`planning_sidebar_labels.js`）

| id | 側欄主行 | 副行 en |
|----|----------|---------|
| spiritual | 靈命健康 | Spiritual Health |
| pastoral | 領袖健康 | Leader Care |
| ncd | 教會健康 · NCD | Church Health |
| shape | 恩賜探索 · SHAPE | Gift Profile |
| competency | 事奉能力 · KSA | Ministry Skills |
| alda | 領導基準 · ALDA | Leadership |
| johari | 盲點覺察 · Johari | Blind Spots |
| disc | 溝通風格 · DISC | Communication |
| mbti | 性格傾向 · MBTI | Personality |
| matchmaker | 崗位配對 · Fit | Role Fit |
| raci | 權責梳理 · RACI | Job Clarity |
| urgent | 輕重緩急 · Priority | Urgent Matrix |
| swot | 戰略盤點 · SWOT | Strategy Map |
| smart | 目標設定 · SMART | Clear Goals |
| kpiokr | 指標對齊 · KPI | KPI Alignment |
| pdca | 季度跟進 · PDCA | Review Cycle |
| ministry8020 | 事工聚焦 · 80/20 | Focus Prune |
| culture | 長執同心 · Culture | Team Alignment |

其他模組功能頁可参照：**主標中文先、方法缩写后；副标 1～2 英文词**。

## CSS 殼（優先使用）

- 頁：`acs-page` + `assessment_coaching_shell.css`
- 標題：`acs-title` + `serif-title`
- 入門：`acs-quickstart`
- 角色：`acs-role-badge`
- 報告心臟：`acs-report-heart`
- 輔導：`acs-coaching-desk` / `acs-coaching-section`

## 類型代碼

| 代碼 | 說明 |
|------|------|
| T1 | 個人測評 |
| T2 | 戰略／治理 |
| T3 | 整合收網（matchmaker） |
| T4 | 工作桌（RACI，charterExempt） |
| T5 | 鏈路批次（Phase3 四件） |
