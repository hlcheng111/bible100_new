# CM 侧栏 Focus 模式 V1

## 行为

| URL | 左栏 |
|-----|------|
| `sidebar_church_layout_v1.html`（无 focus） | A–F 全区 Kit 展开（地图模式） |
| `?focus=a`（顶栏2 按 A） | **A 层1–3 全展开**；B–F **仅层1 一行**（可点 → `?focus=b`…） |
| `?focus=g` | 仍仅 G 路牌（换模块至 planning 侧栏） |

## 渲染

- `B100SidebarRender.renderZoneRail()` — 折叠区一行
- `CmSidebarZoneRender.bootCmLayoutZones()` — 读 `focus` query
- 底栏：`#sb-focus-footer` → 「📋 展开 A–G 全地图」链到无 query 侧栏

## SSOT

菜单项仍只写在 `js/cm_*_menu_ssot.js`；focus 只改**呈现**，不改 href。

## 验收

`tests/test_cm_focus_sidebar_contract.py`
