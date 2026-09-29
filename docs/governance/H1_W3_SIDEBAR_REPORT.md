# H1 · 全站 W3 側欄大改報告

> **日期**：2026-07-26  
> **範圍**：H1a–e（16 個 `sidebar*.html`）

## 批次

| 批次 | 側欄 | 狀態 |
|------|------|------|
| H1a | `church_ministry/sidebar_church_layout_v1` + journey×3 + `congregation/sidebar` | ✅ |
| H1b | `school_management` + `smart_ministry` + `hymn_management`×2 | ✅ |
| H1c | `ai_tools/sidebar` + `sidebar_lab` | ✅ |
| H1d | `church_planning/sidebar_plan` + `disciple_dynamics` + `nav_hub` | ✅ |
| H1e | `help/sidebar_help` + `languages/my/sidebar` | ✅ |

## 契約

- 必載：`sidebar_shell_target_fallback.js` · `shell_nav.js` · `sidebar_behavior.js`
- 地圖內連結：`data-b100-nav="content"`
- 換模組：`data-b100-nav="module"` + `data-b100-sidebar` + `data-b100-content`
- 禁止：`href="#"` · `javascript:void(0)` · inline `bible100ShellNav` onclick

## 工具

- `scripts/apply_w3_sidebar_contract.py` — 批量遷移
- `scripts/fix_w3_broken_module_links.py` — 修復 module 連結 markup
- `tests/test_w3_navigation_scan.py` — 靜態驗收（擴充 H1 清單）

## 已知限制

- `ai_tools/sidebar_lab.html` 仍保留 `sidebar-postmsg-nav.js`（Lab 右欄 frame 特殊規則）
- `nav_hub/sidebar.html` 的 `expandModule()` 為區塊展開，非導航，保留
- `hymn_management/sidebar_playlist.html` 體積大（嵌入資料），僅加契約腳本與 `data-b100-nav`

## 測試

```powershell
python tests/test_w3_navigation_scan.py
python tests/test_unified_navigation.py
```
