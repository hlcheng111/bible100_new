# MIC · 模組完整性清單（通用 10 項）

任何模組（獨立或殼內）收拾或上線前勾選。詳見 [SITE_GOVERNANCE.md](./SITE_GOVERNANCE.md)。

| # | 檢查項 | standalone | shell / hybrid |
|---|--------|:----------:|:--------------:|
| M1 | `moduleId` 在 `config/modules.json` 或 `module_manifest.json` | ✓ | ✓ |
| M2 | 存在 **landing**（dashboard / index_plan / hub） | ✓ | ✓ |
| M3 | 存在 **sidebar**（嵌殼時 `target="contentFrame"`） | 建議 | ✓ |
| M4 | `config/modes.json` 有第二列路由（若要頂欄入口） | — | ✓ |
| M5 | 側欄主要 `href` 目標檔存在 | ✓ | ✓ |
| M6 | 新頁有 `data-b100-module` + `data-b100-pattern` | 建議 | 建議 |
| M7 | 域測通過（見 manifest `tests`） | ✓ | ✓ |
| M8 | 跨模組橋已列 manifest `crossLinks`（若適用） | 若適用 | 若適用 |
| M9 | `docs/modules/{id}/` 或模組内 README 一行索引 | 建議 | 建議 |
| M10 | 未破坏 `test_church_nav_ui_contract` / 殼測 | ✓ | ✓ |

## 域附加（P0 已有）

| 域 | 命令 |
|----|------|
| Planning 18 live | `python tests/test_all_live_tools_smoke.py` |
| 戰略链 → CRM | `python tests/test_strategic_chain_integrity.py` |
| 教會頂欄/側欄 | `python tests/test_church_nav_ui_contract.py` |
| Manifest P0 | `python tests/test_module_manifest_p0.py` |

## P1 波次勾選表

收拾某模組根夾時：M1–M5 + M7 + 該模組 sidebar 只改 **一支**。
