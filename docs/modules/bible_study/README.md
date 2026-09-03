# 圣经研读 · bible_study（BS）

**前缀：** BS · **Hub 顶栏：** ② 研读

## Standalone

| 角色 | 路径 |
|------|------|
| L0 壳 | `bible_study/index.html`（topbar + sidebarFrame + contentFrame） |
| 侧栏 SSOT | `bible_study/sidebar.html` |
| Landing | `bible_study/_landing/home.html` |
| 译本对照 | `bible_study/parallel_mode_v3.html` |

## Hub

- 外層 sidebar → `bible_study/sidebar.html`
- 默认 content → `_landing/home.html`
- 顶栏2：路线图 / 跑道 / 版本 / 释经 / 地理…（见 `config/modes.json` study.secondaryNav）

## 模块内文档

- 成熟度：`bible_study/docs/PAGE_MATURITY_BS.md`
- 工具：`bible_study/tools/`（如 `gen_parallel_v3_data.py`）

## 验收

```powershell
python tests/test_unified_navigation.py
```

`file://` → index_v5 → ② → 左栏对照 / 跑道链接只换右栏。
