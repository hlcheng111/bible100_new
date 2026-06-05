# 模組重整收口後 · Shell／導覽 backlog

> **時機**：目錄與模組邊界大致穩定後再啟動，避免邊搬邊綁規格。  
> **觸發 Rule**：`.cursor/rules/bible100-shell-standard-post-refactor.mdc`  
> **同工入口（HTML）**：`help/project-status-hub.html`（內含里程碑與工程總表連結）

## 與「已定工程」的關係

- **工程總表**：`docs/ENGINEERING_MASTER_ROADMAP.md`（全站互通 × 模組微調 × 文檔治理、可勾選工作流）。  
- **里程碑／立此存案**：`PROJECT_MILESTONE_2026-04-29.md`（Playbook、Phase0、四類工具波次等快照）。  
- 本檔只收 **Shell／全站導覽體驗** 類、且適合排在重整**之後**的項目。

## Backlog（精簡）

| ID | 項目 | 說明 |
|----|------|------|
| SH-01 | **`nav_hub` 智能搜索與 `index_v5` 路徑基準** | `postMessage` 的 URL 須以殼（`index_v5.html`）解析正確，避免 `../` 相對 `nav_hub` 導致載入錯誤。 |
| SH-02 | **搜尋入口整併敘事** | `nav_hub` 內建搜尋 vs `search/` vs Omni — 文件與 UI 標籤寫清主線。 |
| SH-03 | **殼內「翻譯」可見性** | `file://` 限制已在 `help/translate.html`；殼橫幅是否加一句提醒（localhost/https）。 |
| SH-04 | **全站搜尋／翻譯產品決策** | 是否「僅殼 + Hub」或「深頁浮動列」— 定案後再實作。 |
| SH-05 | **行為驗收清單** | 殼內：工具總覽 → 目錄搜索 → 搜尋點結果 → 右欄正確（非僅 href 腳本）。 |

## 維護

- 大波次重整後：跑 `python scripts/check_phase_tool_and_nav_links.py`（見 `docs/LINK_CHECK_AFTER_NAV_CHANGES.md`）。  
- 本 backlog 有變更時，同步在 `help/project-status-hub.html` 是否需要加錨點或說明（可僅連回本檔）。
