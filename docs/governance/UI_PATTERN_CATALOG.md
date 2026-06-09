# UI Pattern 目錄（P0）

**用途：** 新頁開工前先選 Pattern；**不是**每頁都用 4 Tab。

| 代號 | 名稱 | 適用 | 規格 / 樣板 |
|------|------|------|-------------|
| **P-SHELL** | 總站雙 iframe | `index_v5.html` | `.cursor/rules/bible100-shell-standard-post-refactor.mdc` |
| **P-MOD-STANDALONE** | 模組 index + sidebar + dashboard | school、bible_study、hymn | `config/modules.json` |
| **P-LANDING** | 屬靈前言 + 步驟卡片 | 5F 規劃入口 | `church_planning/index_plan.html` |
| **P-4TAB-ACS** | 理念／測評／報告／輔導 | planning 測評 live 工具 | `.cursor/rules/bible100-church-planning-assessment-4tab-charter.mdc` |
| **P-CRM-HUB** | intro / journey / vision / matchmaker | CRM 旅程 | `guide_crm_journey_hub.html` |
| **P-SIDEBAR-LAYOUT** | 六類事工側欄 + focus | 4F 執行 A–E | `sidebar_church_layout_v1.html` |
| **P-WORKBENCH** | 單一工作桌 | 探訪、排班 | `modules/support/*` |
| **S / P / M / H** | Playbook 四類 | 調查／計劃／配對／混合 | `docs/CHURCH_TOOL_PLAYBOOK.md` |

## HTML 標記（P0 起新頁建議）

```html
<body data-b100-module="church_planning" data-b100-pattern="P-4TAB-ACS">
```

| 屬性 | 值示例 |
|------|--------|
| `data-b100-module` | `church_planning` · `church_ministry` · `bible_study` · `ai_tools` · `school_management` |
| `data-b100-pattern` | 上表代號 |

舊頁不必一次補齊；**P1 收拾該模組時**順便加。
