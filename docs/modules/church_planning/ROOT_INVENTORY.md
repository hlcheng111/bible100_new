# church_planning 根目錄清單（Wave 5c）

根夾 **51 個 HTML** 多數為 **~400B redirect stub**；**實質頁** 在 `tools/`、`companion/`、`guides/`。

## 根目錄非 HTML（Wave 5a 後應為 0 個 dev 檔）

以下 **不得** 再出現於 `church_planning/` 根：

| 檔案 | 歸檔位置 |
|------|----------|
| `package.json` / `package-lock.json` | `_archive/dev_vite_shell_2026-06/` |
| `vite.config.ts` / `tsconfig*.json` | 同上 |
| `postcss.config.js` / `tailwind.config.js` | 同上 |
| `DEPLOY.md` / `Open-ChurchHealthPro-local.cmd` | 同上 |
| `*.pptx` | 同上 |

## 禁止目錄（P2 · 不得出現在根下）

`node_modules/` · `public/` · `src/` · `dist/` · `test/` · `tests/` · `sub/` · `__tests__/`

清理：`python scripts/p2_forbidden_root_cleanup.py` · 契約：`python tests/test_module_root_discipline.py`

## HTML 分類

### 實質頁（>5KB · 維護時改這裡）

| 檔案 | 角色 |
|------|------|
| `index_plan.html` | 主 landing |
| `sidebar_plan.html` | 5F 側欄 |
| `dashboard.html` | 戰情總覽 |
| `assessment-os-hub.html` | 健康診斷中心 |
| `cta-os-war-room.html` | 戰情室 |
| `cta-os-tool-report.html` | 工具報表 |
| `index.html` | → index_plan |

### Redirect stub（~400B · 勿手改正文）

| 目標 | 根 stub 數 | 範例 |
|------|------------|------|
| `tools/` | 17 | `shape-gifts-assessment.html` |
| `companion/` | 15 | `page_see.html`、`ministry-8020-slasher.html` |
| 舊工具書籤 | 8 | `smart-assessment.html` |
| `guides/` | 4 | `guide_planning_step2_raci.html` |

### 實質內容目錄

| 目錄 | 檔數（約） | 說明 |
|------|------------|------|
| `tools/` | 17 HTML | registry live 主檔 |
| `planning/raci-reflection.html` | 1 | 第 18 live（步驟 3） |
| `companion/` | 15 HTML | 戰情衛星 / 擴展 |
| `guides/` | 5+ | 五步導覽 |
| `js/`、`css/` | — | 共用資源 |

## 驗收（Wave 5c）

```bash
python tests/test_church_planning_root_p1.py
```

契約包含：根目錄無 dev 殘留、實質 HTML ≤8 個（>5KB）、`tools/` 17 主檔齊全。
