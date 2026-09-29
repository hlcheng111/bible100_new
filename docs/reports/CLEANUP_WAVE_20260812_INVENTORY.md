# Cleanup Wave 2026-08-12 · 盘点与归档记录

**原则：** LIVE 路径冻结 · 噪声进 `_archive/` · 文档只索引不搬家 · 验收 `file:///…/index_v5.html`

---

## 1. 归档清单（本波已执行）

| 来源 | 目标 | 数量/说明 |
|------|------|-----------|
|  repo 根 `_tmp_*` | `_archive/repo_root_20260812/` | 29 扫描临时文件 |
| `hymn_management/temp_hymn*.html` | `hymn_management/_archive/root_noise_20260812/` | 2 预览导出页 |
| `church_planning/church-health-diagnosis.html` | `church_planning/_archive/root_noise_20260812/` | 1 实验页 |
| `bible_study/_gen_book_landings.py` | `bible_study/_archive/root_noise_20260812/` | 1 一次性脚本 |
| `ai_tools/_inject_lab_nav.ps1` | `ai_tools/_archive/root_noise_20260812/` | 1 注入脚本 |
| `qna/SOURCE_AUDIT_REPORT.md` | `qna/_archive/root_noise_20260812/` | 1 审计报告 |
| `smart_ministry/mbti_test.html` | `smart_ministry/_archive/root_noise_20260812/` | 1 根级重复测试页 |
| `bible100_new_2/_ftp_outbox/*`（除最新） | `bible100_new_2/_archive/ftp_outbox_20260812/` | 26 项旧 delta/align/cloud_final |
| **保留 FTP** | `_ftp_outbox/FTP_20260811_2308.zip` + `.txt` | 当前有效增量包 |

---

## 2. 模块根夹健康（归档后）

| 模块 | Standalone 入口 | Hub 关系 | 根夹状态 |
|------|-----------------|----------|----------|
| **总站 Hub** | `index_v5.html` | — | ✅ 仅壳与配置 |
| **languages** | `index_cn.html` 等 + `_landing/` | 顶栏① | ✅ |
| **bible_study** | `index.html` + `sidebar.html` + `_landing/` | 顶栏② | ✅ 已清根脚本 |
| **bible_app** | `shell/index.html`；`index.html` 转址 | 卫星·挂②研读 | ✅ |
| **qna** | `index.html` | 顶栏③ | ✅ |
| **church_ministry** | `index.html` + `sidebar_church_layout_v1` | 顶栏④ | ✅ |
| **school_management** | `index.html` + `_landing/` | 顶栏⑤ | ✅ |
| **ai_tools** | `ai_lab.html` + `sidebar_lab.html` | 顶栏⑥ | ✅ 已清 inject 脚本 |
| **hymn_management** | `index.html` + `sidebar.html` | 卫星·工具/教会 | ✅ 已清 temp 页 |
| **church_planning** | `index_plan.html` + `sidebar_plan.html` | 卫星·Hub 外層双栏 | ✅ 已清实验 HTML |
| **disciple_dynamics** | `dashboard.html` + `sidebar.html` | 卫星·挂①教材 | ✅ |
| **smart_ministry** | `landing.html` + `sidebar.html` | AI 内深链 | ✅ |
| **nav_hub** | `dashboard.html` + `sidebar.html` | 工具总览 | ✅ |

**刻意保留（非噪声）：** 各模 `tests/` 子目录（模块烟测）、`bible_app/node_modules/`（Expo 本地，不上云）、`hymn_management/copyright_management.html`（功能页）。

---

## 3. 未动（下波可选）

- `docs/` 根上过期进度 md → `docs/reports/archive_*`
- `church_planning/tests/` 与 repo `tests/` 职责对照（不合并，避免断 CI）
- 全站 orphan HTML 链接扫描（`analyze_broken_links_fast.py`）

---

## 4. 相关索引

- 模块入口 SSOT：[`docs/modules/README.md`](../modules/README.md)
- 全站注册表：[`SITE_PAGE_REGISTRY_V1.md`](../governance/SITE_PAGE_REGISTRY_V1.md)
- 上波清理：[`SITE_CLEANUP_WAVE_V1.md`](../governance/SITE_CLEANUP_WAVE_V1.md)
