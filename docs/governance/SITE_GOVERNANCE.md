# 全站治理 · P0 最小包（SITE_GOVERNANCE）

**版本：** P0 · 2026-06  
**狀態：** 邊做邊改期 — **定邊界、不大搬家**  
**人類入口：** [help/tools-overview.html](../../help/tools-overview.html) · [help/docs-hub.html](../../help/docs-hub.html)

---

## 1. 初心（三種運行模式）

每個模組可：

| 模式 | 代號 | 說明 |
|------|------|------|
| **獨立運行** | `standalone` | 自有 index / sidebar / landing，可單開 HTTP |
| **殼內運行** | `shell` | 經 `index_v5.html` + `config/modes.json` 第二列路由 |
| **雙軌** | `hybrid` | 兩種入口皆官方支持（如 planning、church_ministry） |

**機器 SSOT：** `config/module_manifest.json`（模組邊界）+ `config/modes.json`（頂欄路由）+ `config/modules.json`（模組註冊）。

改 `config/modes.json` 後必跑：

```powershell
node scripts/generate_config_embedded.js
python tests/test_config_embedded_sync.py
```

---

## 2. P0 / P1 / P2 收拾順序（邊定規則、邊分波清）

| 階段 | 做什麼 | 不做什麼 |
|------|--------|----------|
| **P0（現在）** | 治理文檔、manifest 草案、凍結核心、新檔歸屬規則 | 全站 rename、大搬夾 |
| **P1** | **按模組分波** 歸位 + 單支 sidebar 重整 + archive | 同時改 CRM/plan/layout 三支 sidebar |
| **P2** | 檔名前綴、`data-b100-module` 批量、全站連結 fail-on-broken | 未驗測前刪歷史檔 |

**P1 建議波次：** 殼/config → church_planning → church_ministry → bible_study / ai / school → help/nav_hub

對齊 `index_v5.html` 註解：**併 → 修 → 新 → 留**

---

## 3. 凍結核心（P0 不可破壞）

以下改動必跑對應測試（見 §6）：

| 項目 | 路徑 |
|------|------|
| 總站殼 | `index_v5.html` |
| 模式路由 | `config/modes.json` → `js/config-embedded.js` |
| 教會 CRM 側欄 | `church_ministry/sidebar_crm_journey.html` |
| 教會執行側欄 | `church_ministry/sidebar_church_layout_v1.html` |
| 教會規劃側欄 | `church_planning/sidebar_plan.html` |
| Planning 工具 SSOT | `church_planning/js/planning_tool_registry.js`（18 live） |
| 戰略 Store | `church_planning/js/assessment_run_store.js` |
| CRM 治理排水 | `church_planning/js/governance_crm_bridge.js` |

---

## 4. 新檔歸屬（P0 起強制）

1. **目錄 = 模組** — 新 HTML/JS 只進對應根夾（`church_planning/`、`church_ministry/` …）  
2. **新頁建議標記** — `<body data-b100-module="…" data-b100-pattern="…">`（見 [UI_PATTERN_CATALOG.md](./UI_PATTERN_CATALOG.md)）  
3. **跨模組跳轉** — 優先 `bible100ShellNav(event,{ sidebarUrl, contentUrl })`  
4. **不確定是否淘汰** — 移入同模組 `_archive/` 或 `_deprecated/`，**勿硬刪**唯一副本  
5. **Planning live 工具** — 必入 `planning_tool_registry.js`，遵循 `.cursor/rules/bible100-church-planning-new-tool-checklist.mdc`

模組短碼（新檔可選前綴）：`cp` planning · `cm` ministry · `bs` bible_study · `ai` ai_tools · `sm` school · `nh` nav/help

---

## 5. 教會大樓（互聯記憶）

```
5F 規劃大腦  sidebar_plan.html  +  index_plan.html
4F CRM 旅程  sidebar_crm_journey.html  +  guide_crm_journey_hub.html
4F 事工執行  sidebar_church_layout_v1.html  （A–E 六類）
```

三角導航（P1 驗收）：CRM ↔ planning ↔ layout_v1 互回；詳見 manifest `crossLinks`。

---

## 6. 必跑命令（P0）

```powershell
# 殼 + config
python tests/test_index_v5_shell.py
python tests/test_config_embedded_sync.py

# 教會導航契約
python tests/test_church_nav_ui_contract.py

# Planning 18 工具 + 戰略鏈
python tests/test_all_live_tools_smoke.py

# P0 manifest 草案
python tests/test_module_manifest_p0.py

# help/nav 連結（改 tools-overview / nav_hub 後）
python scripts/check_phase_tool_and_nav_links.py
```

全量：`powershell -ExecutionPolicy Bypass -File tests/run-all-tests.ps1`

---

## 7. 相關文檔

| 文檔 | 用途 |
|------|------|
| [UI_PATTERN_CATALOG.md](./UI_PATTERN_CATALOG.md) | 頁型規格（4-Tab 等） |
| [MODULE_INTEGRITY_CHECKLIST.md](./MODULE_INTEGRITY_CHECKLIST.md) | MIC 通用 10 項 |
| [../TOOLS_AND_ENTRY_REFERENCE.md](../TOOLS_AND_ENTRY_REFERENCE.md) | 入口清單 |
| [../CHURCH_TOOL_PLAYBOOK.md](../CHURCH_TOOL_PLAYBOOK.md) | 教會工具 A–G 七層 |
| `.cursor/rules/bible100-site-governance.mdc` | Cursor 觸發規則 |

---

## 8. P0 完成標準

- [x] `docs/governance/` 三文檔 + `config/module_manifest.json`  
- [x] `help/tools-overview.html` 運作原則區  
- [x] `.cursor/rules/bible100-site-governance.mdc`  
- [x] `tests/test_module_manifest_p0.py` 綠  
- [ ] P1：第一收拾波次 `church_planning/`（待排）
