# AI Lab · Wave a（定案）

**日期：** 2026-07-25  
**狀態：** 執行中  

## 產品定案

聖經 AI 學習 Lab 主業＝借助 AI 平台發掘經文真相、釋經、對照。  
側欄主分區改為任務名（**避免與教會事工 A–E 撞字**）：

| 分區 | 任務 | 舊標籤 |
|------|------|--------|
| 導讀 | 經文真相／釋經／問答草稿 | A · 聖經神學 AI 導讀 |
| 備課 | 教案／測驗／Prompt | C · 課程與作業設計 |
| 創作 | 圖／樂／聲／影 | D · 創作與媒體 |

**行政捷徑（非主分區）：** 口述預填控制台 → 教會執行層減壓閥；排班／UAT 請走教會行政（Wave c 再收主入口）。

後續：Wave b＝`smart_ministry` 真路徑；Wave c＝Auto 主敘事進 🟩 行政。

---

## Wave b／c（已落地 2026-07-25）

| Wave | 變更 |
|------|------|
| **b** | `modes.ai`「智慧事奉」→ `smart_ministry/sidebar.html` + `landing.html`；`openAISmartMinistry` 外層雙欄（不嵌 `index.html` 殼） |
| **c** | 口述預填從 AI 第二列移出；掛 `modes.church` 行政列＋行政側欄 F；頂欄鈕／`openCrmAutomationConsole` 進教會模式 |

### 經典選單歸位（2026-07-25）

`sidebar_lab.html` 已併入舊 `sidebar.html` 重要項，分類仍為 **導讀｜備課｜創作**；名稱沿用易懂舊稱（如「文字轉圖像」）。各項下顯示相對路徑細字。
