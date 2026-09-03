# 教会事工 · church_ministry（CM）

**前缀：** CM（细编号 0–F 已落地）

## Standalone

| 角色 | 路径 |
|------|------|
| L0 壳 | `church_ministry/index.html` |
| 默认侧栏 | `church_ministry/sidebar_church_layout_v1.html` |
| Gateway | `church_ministry/_landing/gateway.html` |
| C 区工作桌 | `modules/education/education-integrated.html` |

## Hub

- 顶栏④；Hub 进 C 区：外層 sidebar C + 右栏 education-integrated（**非** church_ministry/index.html）

## 模块内文档

- `church_ministry/docs/PAGE_MATURITY_INVENTORY_0AF.md`
- `church_ministry/docs/DATA_LINK_CRM_ADMIN_V1.md`

## 验收

```powershell
python tests/test_unified_navigation.py
python church_ministry/tests/test_church_ministry_index_shell.py
```
