---
name: bible100-cm-rebuild
description: >-
  Rebuilds church_ministry (CM) A–G zones: Tab-integrated desks (pastoral,
  admin, outreach), desks redirects, visitation handoff, mobile-first RWD, HITL
  AI guardrails. Use when restructuring CM pages, pastoral-integrated,
  admin-integrated, G zone IA, or absence-to-visitation bridge on bible100_new.
---

# Bible100 · 教會事工 CM 重構 Skill

## 何时启用

- 整理／重建 `church_ministry/`
- B `pastoral-integrated`、G `admin-integrated`、desks redirect
- 缺席→探訪闭环、三端 RWD、小白 UX

## 核心哲学

1. **Mobile-First**：Tab 横滑、触控 ≥44px（`css/cm_responsive_tokens.css`）
2. **C 区标竿**：Tab 壳 + iframe 子页；不 rewrite 巨石
3. **Hub + Bridge 同波交付**；**HITL**：不自动派探访
4. **file:// 验收**：`index_v5.html` 强刷
5. **Vanilla only**：禁止 CM 内 React/Vue

## IA（A–G SSOT：`js/cm_zone_nav_ssot.js`）

| 区 | 主工作桌 |
|----|----------|
| B | `modules/fellowship/pastoral-integrated.html` |
| C | `modules/education/education-integrated.html` |
| D | `modules/expansion/outreach-integrated.html` |
| G | `modules/admin/admin-integrated.html` |
| F | `hymn_management`（跨模块） |

**M3 三主路径**：`member-integrated` · `visitation_index` · `volunteer_shift/index`

## 禁止

- ❌ 新建 `visitation_bridge.js` → 用 `PastoralDataHub.addHandoverTask`
- ❌ `desks/pastoral.html` → C 区（应 → pastoral-integrated）
- ❌ 改 `modes.json` 后不跑 `node scripts/generate_config_embedded.js`

## Bridge

| 来源 | 机制 |
|------|------|
| C | `education_cross_module_bridge.js` |
| B | `pastoral_data_hub.js` / alerts panel |
| 枢纽 | `visitation_index.html` + `cm_visitation_queue_ui.js` |

## 波次

- **W0**：desks redirect、G/B/D modes、embedded sync
- **W1**：pastoral-integrated 4 Tab
- **W1.5**：visitation 来源标签
- **W2**：admin-integrated 3+1 Tab
- **W3**：E 分流、D landing 收口
- **W6**：Church Center `role=member` 纯会众 + B 侧栏 `cm_b_menu_ssot` → pastoral-integrated

## 验收（file://）

1. 教会事工 → B → ≤3 点击 → Tab② 点名
2. 预警 → 推送后自动切 Tab④ 探访队列
3. E 区 → Church Center `?role=member` 无 E-03／无 desk bar
4. G → admin-integrated（非 index_plan 劫持）
5. 390px 无破版

## 测试

```powershell
python church_ministry/tests/test_cm_rebuild_w0_w2.py
python church_ministry/tests/test_cm_w6.py
python tests/test_church_nav_ui_contract.py
python tests/test_config_embedded_sync.py
node scripts/generate_config_embedded.js
```

## SSOT 文档

- `church_ministry/docs/B_PASTORAL_W0_CONTENT_SPEC.md`
- `church_ministry/docs/PAGE_MATURITY_INVENTORY_0AF.md`
