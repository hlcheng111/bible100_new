---
name: bible100-static-site
description: Bible100 靜態網站專案：file:// 測試、共用 CSS、側邊欄行為、模組架構。Use when working with bible100_new, static site modules, sidebar logic, or unified styles.
---

# Bible100 靜態網站專案

## 專案性質
- 本機靜態網站，主入口 `bible100_new/index.html`
- 測試以 `file:///` 開啟；需載入 JSON 時（如對照模式 v2）用本地 HTTP 伺服器

## 本地伺服器
- 在 **bible100_new** 根目錄執行 `.\tools\start_http_bible100.ps1` 或 `npx serve`（port 8080）
- 對照模式 v2：`http://localhost:8080/bible_study/parallel_mode_v2.html`

## 跨模組修改
- 統一側邊欄、抽離共用 CSS、批量修復路徑 → 使用 Composer/Agent
- 大型目錄（data/、languages/）用 @folders 或 @codebase 縮小上下文

## 模組入口
- 聖經研讀：bible_study/index.html
- 教會事工：church_ministry/index.html
- 學校管理：school_management/
- AI 工具：ai_tools/index.html
- 門訓動力站：disciple_dynamics/
- AI智慧事奉：smart_ministry/

## 規則
- 詳見 `.cursor/rules/bible100-conventions.mdc` 與 `docs/架構與內容約定.md`
