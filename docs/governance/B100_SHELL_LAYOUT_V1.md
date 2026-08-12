# B100 壳层布局契约 V1

## Hub（index_v5）

```
顶栏1 mode · 顶栏2 选区（contextBar）
├── sidebarFrame  → 模块侧栏（CM: sidebar_church_layout_v1?focus=*）
└── contentFrame  → 内容/L4/L5（chrome hub-hidden）
```

## 高度

- `--top-offset` = `#topWrap` 实测高度（`syncTopOffset` + `ResizeObserver`）
- 主区：`height: calc(100dvh - var(--top-offset))`，fallback `100vh`
- 内容页 iframe 内：**避免** `body { min-height:100vh }` 叠高

## Standalone 模块

- `church_ministry/index.html`：模块顶栏 + 双 iframe；`cm_hub_detect` 藏模块顶栏当在 Hub 内
- 侧栏 SSOT **与 Hub 相同文件**

## 禁止

- 右栏载入带同名 `contentFrame` 的模块 index（壳中壳）
- Hub 内 L5 页再叠 ae/crm/本页三套顶导

## 验收

`tests/test_b100_shell_unified_contract.py` · `tests/test_index_v5_shell.py`
