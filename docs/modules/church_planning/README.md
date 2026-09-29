# 教会规划 · church_planning（PLAN · Satellite）

## Standalone

| 角色 | 路径 |
|------|------|
| 转址 | `church_planning/index.html` → `index_plan.html` |
| Hub 内容 SSOT | `index_plan.html` |
| Hub 侧栏 SSOT | `sidebar_plan.html` |
| 18 live 工具 | `church_planning/tools/` |

## Hub（重要）

总站进规划：**外層** `sidebar_plan.html` + `index_plan.html`  
**禁止** 把 `church_planning/index.html`（内层双栏壳）塞进 index_v5 右栏。

## 模块内文档

- [ROOT_INVENTORY.md](./ROOT_INVENTORY.md)
- [PHASE_UNLOCK_RULES.md](./PHASE_UNLOCK_RULES.md)
- `church_planning/js/planning_tool_registry.js`

## 验收

```powershell
python tests/test_all_live_tools_smoke.py
python tests/test_church_planning_root_p1.py
```
