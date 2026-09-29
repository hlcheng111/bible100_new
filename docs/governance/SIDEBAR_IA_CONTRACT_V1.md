# Sidebar IA 契约 V1（B100 Sidebar Kit）

> **版本**：20260804e  
> **金样**：`church_planning/sidebar_plan_v5_preview.html`（G 区）  
> **Kit**：`css/b100_sidebar_kit.css` + `js/b100_sidebar_render.js`  
> **试点**：CM A 区（gold #1）· CM B 区（gold #2）· `js/cm_*_menu_ssot.js`

## 一句話

**命名与 href 只写 SSOT；侧栏 HTML 只留空壳 + 渲染脚本；壳内有 sidebarFrame 则内容页不叠顶栏。**

## 字段契约（每项）

| 字段 | 必填 | 说明 |
|------|------|------|
| `id` | ✓ | 稳定 ID，供测试与 i18n |
| `label` | ✓ | 中文主标（可含 emoji／序号） |
| `en` | ✓ | 英文副标（小字，不拼 H1） |
| `href` | ✓* | 正式相对路径（*landing 可用 planPath） |
| `i18nKey` | 推荐 | 对接 `b100_chrome_i18n` / 4–6 语 |
| `primary` |  | 是否主路（左边线加粗） |
| `maturity` |  | `wip` / `demo` → 徽章 |
| `group` / `categories` |  | 二层 `details` + **N 项** 计数 |

## 三层结构

```
一层 sb-kit-zone        → A–G 区域 / Plan·Do 文件夹
二层 sb-kit-cat         → 分类 summary + 「· N 项」+ ▶
三层 sb-kit-item        → 链结（strong 中文 + small 英文）
```

## 导航

- 同模块内：`data-b100-nav="content"` + 相对 `href`
- 跨模块：`data-b100-nav="module"` + `data-b100-sidebar` / `data-b100-content`
- **禁止** `href="#"` 作主链

## 多语（4–6 语）

1. SSOT 保留 `label` + `en`（zh-Hant + en 默认可读）
2. `i18nKey` → 渲染器输出 `data-i18n` + `data-i18n-bridge="1"`
3. 由 `js/b100_chrome_i18n.js` + 模块 pack 覆盖 vi/id/ch/ad
4. 表单与经文正文 **不** 走侧栏 i18n

## 新模块 checklist

- [ ] `js/<module>_menu_ssot.js`
- [ ] 侧栏 HTML 空 host + 载入 Kit CSS/JS
- [ ] landing 由 SSOT 渲染（可选）
- [ ] `tests/test_<module>_sidebar_contract.py`
- [ ] Hub 注册 `config/modules.json`（hub_sidebar + hub_content）

## 相关

- `docs/governance/UNIFIED_NAVIGATION.md`
- `js/g_do_admin_menu_ssot.js`（G Do 范例）
- `js/cm_b_menu_ssot.js`（CM B 范例）
