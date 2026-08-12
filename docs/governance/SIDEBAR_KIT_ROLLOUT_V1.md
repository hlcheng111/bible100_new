# Sidebar Kit 波次 rollout（20260805b）

## 波0 · 壳层统一 W0 + P0 ✅

- `docs/governance/B100_SHELL_UNIFIED_V1.md`（8 大类 · 7 步 · 10 条）
- `docs/governance/B100_CONTENT_CHROME_V1.md`
- `docs/governance/CM_FOCUS_SIDEBAR_V1.md`
- `docs/governance/B100_SHELL_LAYOUT_V1.md`
- `js/b100_hub_embed.js` — Hub 内 hub-hidden
- `js/cm_sidebar_zone_render.js` — focus 模式（A 展开 / B–F 一行）
- `index_v5.html` — `100dvh` + ResizeObserver
- `tests/test_b100_shell_unified_contract.py`
- `church_ministry/tests/test_cm_focus_sidebar_contract.py`

## 波1 · CM A–F 全区 Kit ✅

| 区 | SSOT | Host |
|----|------|------|
| A 敬拜音樂 | `js/cm_a_menu_ssot.js` | `#sb-zone-a` |
| B 牧養小組 | `js/cm_b_menu_ssot.js` | `#sb-zone-b` |
| C 聖經門訓 | `js/cm_c_menu_ssot.js` | `#sb-zone-c` |
| D 外展差傳 | `js/cm_d_menu_ssot.js` | `#sb-zone-d` |
| E 社會服務 | `js/cm_e_menu_ssot.js` | `#sb-zone-e` |
| F 詩歌應用 | `js/cm_f_menu_ssot.js` | `#sb-zone-f` |

- 渲染：`js/cm_sidebar_zone_render.js`
- 注册：`js/cm_a_g_menu_registry.js`（A–F + G 路牌）
- 测试：`church_ministry/tests/test_cm_*_sidebar_contract.py`

## 波2 · G 独立侧栏（已完成）

- `js/g_do_admin_menu_ssot.js` + `church_planning/sidebar_plan_v5_preview.html`
- CM 主栏 G 仅路牌 → 换模块至规划侧栏

## 波3 · 总 index 联邦

- Hub 侧栏：`config/modules.json` 已登记 `church_ministry/sidebar_church_layout_v1.html`
- G 独立侧栏：`church_planning/sidebar_plan_v5_preview.html`（不壳中壳）
- 新模块：复制 checklist → `SIDEBAR_IA_CONTRACT_V1.md`

## 多语（4–6 语）

- SSOT 输出 `data-i18n` + `i18nKey`
- 运行时：`b100_chrome_i18n.js` + 模块 pack
- 验收：`?locale=vi` 于 CM 侧栏 spot-check

## 新页／修订页自动规则

1. 菜单项 **不得** 硬编码于侧栏 HTML
2. 新增入口 → 只改对应 `*_menu_ssot.js`
3. PR 必跑：`test_b100_sidebar_kit_contract.py` + 该区 `test_*_sidebar_contract.py`
