#!/usr/bin/env python3
"""Wave 5a: archive Vite/React dev artifacts from church_planning root."""
from __future__ import annotations

import shutil
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
PLAN = REPO / "church_planning"
ARCHIVE = PLAN / "_archive" / "dev_vite_shell_2026-06"

ROOT_FILES = (
    "package.json",
    "package-lock.json",
    "vite.config.ts",
    "tsconfig.json",
    "tsconfig.node.json",
    "postcss.config.js",
    "tailwind.config.js",
    "DEPLOY.md",
    "Open-ChurchHealthPro-local.cmd",
    "教會健康戰略診斷系統 Church SWOT AI.pptx",
)

ROOT_DIRS = (
    "src",
    "dist",
)

README = """# dev_vite_shell_2026-06 · 自根目錄移出

**日期**：2026-06 · Wave 5a

舊 **Vite + React** 實驗殼（Church SWOT AI Pro），**非**現行靜態教會規劃 OS 主線。
現行 SSOT：`index_plan.html` + `tools/` + `js/planning_tool_registry.js`。

## 本目錄內容

- `package.json` / `vite.config.ts` / `tsconfig*` — 建置設定
- `DEPLOY.md` — 舊上雲說明
- `Open-ChurchHealthPro-local.cmd` — 本機 preview 捷徑
- `教會健康戰略診斷系統 Church SWOT AI.pptx` — 簡報素材（~19MB）
- `src/`、`dist/` — React 源碼與建置產物（如有）

## 還原開發環境

```bash
cd church_planning/_archive/dev_vite_shell_2026-06
npm ci
npm run dev
```

`node_modules/` 若仍在 `church_planning/` 根下，可刪除後於歸檔目錄重裝。

## 不影響

- HTTP 靜態站：`index_plan.html`、`tools/*` smoke 測試
- PDCA 等工具：根目錄 stub → `tools/Church_Governance_*`
"""


def main() -> None:
    ARCHIVE.mkdir(parents=True, exist_ok=True)
    moved: list[str] = []
    for name in ROOT_FILES:
        src = PLAN / name
        if src.is_file():
            shutil.move(str(src), str(ARCHIVE / name))
            moved.append(name)
    for name in ROOT_DIRS:
        src = PLAN / name
        if src.is_dir():
            dst = ARCHIVE / name
            if dst.exists():
                shutil.rmtree(dst)
            shutil.move(str(src), str(dst))
            moved.append(name + "/")
    (ARCHIVE / "README.md").write_text(README, encoding="utf-8")
    print(f"OK: Wave 5a — archived {len(moved)} items to {ARCHIVE.relative_to(REPO)}")


if __name__ == "__main__":
    main()
