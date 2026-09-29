# B100 壳层统一规范 V1（W0 · 20260807a）

> **验收口径**：`file:///…/index_v5.html` 强刷后，教会事工 → 顶栏2 **A** → 诗班页：**左栏 focus 变短、右栏无叠三条导航、半屏窗口仍可见正文**。

## 一句話

**顶栏选区 · 侧栏 SSOT · 右栏 hub-hidden；壳量高度 · 内容一层滚动；App/PWA 另族外连。**

---

## file:// 人工验收（已签收 · 2026-08-04）

| 范围 | 状态 | 签收 |
|------|------|------|
| **教會事工 CM** 步 0–7 | ✅ file:// 通过 | **CM OK** |
| **研讀** focus 侧栏 + 工具顶栏2 | ✅ 路线/工具/版本/释经/地理 SSOT 对齐 · landing href 修复 | **研讀 focus OK** + 20260807a |
| **學校 / AI** focus | 🔄 代码已接；待单独签收 | — |
| **步 8** 上云 spot-check | ⏳ 待部署 | — |

---

## 八大类考量（全站统一边界）

| # | 类 | 要点 | 本仓 SSOT |
|---|-----|------|-----------|
| 1 | **导航 IA** | 顶栏1 大模块 · 顶栏2 选区 · 侧栏1–4 · 右栏 Tab 不重复 | `modes.json` · `cm_zone_nav_ssot.js` · `b100_module_nav_ssot.js` |
| 2 | **壳层 iframe** | 固定 `sidebarFrame`/`contentFrame` · 禁壳中壳 · 禁侧栏进右栏 | `index_v5.html` · `shell_nav.js` |
| 3 | **内容 Chrome** | hub-hidden / minimal / full 三档 | `js/b100_hub_embed.js` · `ae_primary_nav.js` |
| 4 | **装置响应** | ≤767px 侧栏抽屉 · 窄窗顶栏 ResizeObserver | `index_v5.html` @media |
| 5 | **离线/云** | file:// 与 HTTP 同布局；数据路径可不同 | `config-embedded.js` |
| 6 | **多语** | 壳 i18n 繁体；CM SSOT 繁体 | `b100_chrome_i18n.js` |
| 7 | **数据隐私** | `member_id` 对齐 · 敏感留本机 | `bible100-cross-module-data` |
| 8 | **测试验收** | 契约测试 + file:// 人工一眼 | `tests/test_b100_shell_unified_contract.py` |

**产品族边界**（不嵌进 index_v5 iframe）：

- `bible_journey` PWA · `bible_app` 跑道 → 外连总站 ↗
- APK 远期 → 包跑道 SPA，非整站 WebView

---

## 七步路线图 — CM 范本（见一步做一步）

| 步 | 内容 | 看一眼就算过 | 代码 build | 签收 |
|----|------|--------------|------------|------|
| **0** | W0 文档 + 契约测试 | `python tests/test_b100_shell_unified_contract.py` → OK | 20260805f | ✅ |
| **1** | Hub 内藏重复 chrome | v5 → A → 诗班：**无** ae 绿条叠在本页 `top-nav` 上 | 20260805f | ✅ |
| **2** | 侧栏 focus | `?focus=a`：**A 展开**，B–F **一行**；底有「展开 A–G 全地图」 | 20260805d+ | ✅ |
| **3** | 壳高度 dvh + top-offset | 半屏窗口：右栏仍见正文 | index_v5 | ✅ |
| **4** | A 区 SSOT 4 层 + 改名 | 「聚會出席」「敬拜音樂事工 ▶」繁体 | 20260805e | ✅ |
| **5** | Landing 统一壳 + A–G 地址条 | 顶栏2 A → **右栏 landing**（非侧栏地图） | 20260805f | ✅ |
| **6** | B–F SSOT 4 层 | 各区一层主任务 + 事工 ▶ + 层4 子项 | 20260805e | ✅ |
| **7** | Standalone 顶栏 A–G | `church_ministry/index.html` 双列顶栏与 Hub 同款 | 20260805f | ✅ |
| **8** | 上云 spot-check | 部署后顶栏2/侧栏/landing 与 file:// 一致 | — | ⏳ |

---

## 模块复制波 M（研讀 · 學校 · AI）

| 步 | 内容 | 看一眼就算过 | build | 签收 |
|----|------|--------------|-------|------|
| **M1** | `b100_module_nav_ssot.js` + 禁壳 + 禁侧栏进右栏 | 右栏不出现 `sidebar.html` / `index.html` 壳 | 20260806c | ✅ |
| **M2** | focus 侧栏 + 顶栏2 `?focus=` 同步 | 研讀点「釋經」→ 左栏 **📌 目前分區** 蓝条 | 20260806d | ✅ 研讀 |
| **M3** | landing 说明下沉 | 释经/CMC 说明在 `_landing/home.html`，不在侧栏 | 20260806d | ✅ 研讀 |
| **M4** | 學校 / AI focus 签收 | 点「註冊」「Lab」侧栏收合 | 20260806d | ⏳ |
| **M5** | 學校 Standalone 顶栏对齐 CM | `school_management/index.html` 双列顶栏 | — | ⏳ |

**当前：CM 0–7 + 研讀 M1–M3 已签收。下一步 M4 或步 9（见下）。**

### 20260805f 热修（CM Issue A/B/C）

| 项 | 修复 |
|----|------|
| **(A) 右栏误载侧栏** | `cm_zone_nav_ssot.js` · focus rail · `sidebar_behavior` · contentFrame 自保 |
| **(B) 简繁** | CM `cm_*_menu_ssot.js` 繁体 · 侧栏 `lang=zh-Hant` |
| **(C) Standalone 顶栏** | `b100_cm_hub_secondary.css` · `cm_standalone_zone_bar.js` |

### 20260806d（三模块 focus）

| 项 | 修复 |
|----|------|
| **focus 侧栏** | `b100_module_sidebar_focus.js` · `?focus=` · 分区蓝条 · 展开全地图 |
| **顶栏2** | `modes.json`：`版本/釋經/地理` + `focusZone`；去掉重复「路線」 |
| **禁壳** | `bible_study/index.html` 等 → landing / 工作页 |
| **说明归位** | 释经资源说明 → `bible_study/_landing/home.html` |

---

## 步 9（规划 · 未开工）

**三模块 SSOT 4 层侧栏**（范本：`cm_*_menu_ssot.js` + `b100_sidebar_render.js`）

| 模块 | 分区 | 4 层目标 |
|------|------|----------|
| 研讀 | tools / versions / commentary / geo | 层1 主任务 · 层2 事工 ▶ · 层3–4 子项 |
| 學校 | home / courses | 层1 入口 · 层2 模块 Tab |
| AI | home / lab / smart | 层1 Lab 三区 · 层2 导读/备课/创作 |

看一眼：侧栏 HTML 不再 500+ 行手写树；改菜单只改 `study_*_menu_ssot.js`。

---

## 十条「专家提前想、小白容易漏」

| # | 项 | 对策 | 状态 |
|---|-----|------|------|
| 1 | 性能 | focus 侧栏减渲染量 | ✅ |
| 2 | 无障碍 | 折叠 summary 可键盘；rail 链接有 title | 🔄 |
| 3 | 打印 | `@media print` 藏壳 | ⏳ 后置 |
| 4 | 深链接 | `?focus=` / `?content=` | ✅ |
| 5 | 缓存 | JS `?v=20260806d` | ✅ |
| 6 | SEO | 内网 iframe 弱 SEO | ⏳ 后置 |
| 7 | 维护 SSOT | CM → `cm_*`；三模块 → `b100_module_nav_ssot.js` | ✅ |
| 8 | 改新亡旧 | 每波跑 `test_b100_shell_unified_contract.py` | ✅ |
| 9 | F/G 换模块 | F→hymn；G→plan 双栏 | ✅ |
| 10 | App 分族 | 跑道不嵌 v5 | ✅ |

---

## file:// 验收清单（维护者）

### CM（已签收 ✅）

1. **index_v5** → 教會事工 → 顶栏2 **A** → 右栏 = worship landing（非侧栏 HTML）
2. **Standalone** `church_ministry/index.html` → 顶栏 A–G → 点 **C** → 右栏 education landing
3. 侧栏点 **诗班** → 右栏仅诗班正文（**无** ae 绿条第三条）

### 研讀（已签收 ✅）

1. 顶栏2 **釋經** → 左栏顶 **📌 目前分區：釋經參讀**；⚡/版本/地理 收为标题条
2. 右栏 = 综合解读（非 `index.html` 双壳）
3. 路线 landing 正文含释经/CMC/数据说明（侧栏无长段说明）

### 學校 / AI（待签收）

1. 顶栏2 **註冊** / **Lab** → 左栏 focus 蓝条
2. 右栏 = 工作页 / Lab landing

---

## 相关文件

- `docs/governance/B100_CONTENT_CHROME_V1.md`
- `docs/governance/CM_FOCUS_SIDEBAR_V1.md`
- `docs/governance/B100_SHELL_LAYOUT_V1.md`
- `js/cm_zone_nav_ssot.js`
- `js/b100_module_nav_ssot.js`
- `js/b100_site_path.js`
- `tests/test_b100_module_nav_contract.py`
- `church_ministry/tests/test_cm_hub_content_guard.py`
