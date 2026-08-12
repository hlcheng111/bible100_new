# 模組根目錄紀律（P2 · 全站）

**版本：** P2 · 2026-06  
**適用：** 各模組根夾（`church_planning/`、`church_ministry/`、`bible_study/` …）

---

## 1. 原則

模組根目錄 = **入口 + hub + redirect stub + 白名單子目錄**。  
**禁止**在根下新建 dev / 測試 / 打包殘留目錄；**禁止**在根下堆 `sub/`、`test/`、`tests/` 等臨時夾。

測試、腳本、CI 一律在 **repo 根** `tests/`、`scripts/`，不在模組根。

---

## 2. 禁止出現在模組根的目錄（黑名單）

| 目錄 | 原因 |
|------|------|
| `node_modules/` | npm 依賴 |
| `src/`、`dist/` | 前端建置源／產物 |
| `public/` | Vite 靜態殼（主線用 HTTP 靜態頁） |
| `test/`、`tests/`、`__tests__/` | 測試 → repo `tests/` |
| `sub/`、`tmp/`、`temp/` | 臨時實驗 |
| `coverage/`、`.pytest_cache/` | 測試產物 |

發現後：**移入** `_archive/` 或刪除（`node_modules` 可本地刪除後在歸檔目錄 `npm ci`）。

---

## 3. church_planning 白名單子目錄

| 目錄 | 用途 |
|------|------|
| `_archive/` | legacy / dev 歸檔 |
| `tools/` | 18 live 工具主檔 |
| `companion/` | 戰情衛星 |
| `guides/`、`planning/` | 五步導覽、RACI |
| `js/`、`css/` | 共用資源 |
| `docs/` | 模組說明 |
| `image_plan/`、`planning_surveys/` | 素材／問卷 |
| `spiritual_app/` | 靈命子應用（待 P3 再收） |

**根目錄檔案：** 僅 hub/shell HTML、redirect stub、`README.txt`；**不得**再出現 `package.json`、`vite.config.*`、`.pptx` 等（見 Wave 5a）。

---

## 4. P2 驗收

```bash
python tests/test_module_root_discipline.py
python tests/test_church_planning_root_p1.py
python tests/test_p2_shell_and_tags.py
```

---

## 5. Cursor / 新功能

- 新 HTML → `tools/` 或 `companion/` 或 `guides/`，**不要**在 `church_planning/` 根新建  
- 新測試 → `tests/test_*.py`  
- 新子模組實驗 → `church_planning/_archive/` 或 repo 外 worktree
