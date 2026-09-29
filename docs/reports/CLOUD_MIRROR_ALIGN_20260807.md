# 云端镜像对齐报告 · 2026-08-07

## 结论

| 项目 | 状态 |
|------|------|
| `bible100_new` → `bible100_new_2` 全量 sync | **完成**（57/57 纳入项） |
| 关键路径 parity audit | **PASS** |
| 旧云遗留页清理 | 已删 mirror 内 `ai_smart_ministry_overview.html` |
| kh/lo 404 | 已加占位页（籌備中） |
| 诗歌 Big5 | 已加 `hymn_management/hymn/.htaccess` |

## 双轨约定（今后）

1. **只改** `bible100_new`
2. 改完跑 **`run_sync_cloud_mirror.bat`**
3. FileZilla 上传 **`bible100_new_2` 整包** → `htdocs`
4. 云端验收：`https://bible100.lovestoblog.com/index_v5.html?v=日期`

## 您需再 FTP 一次

本次已在 PC 完成 sync；若尚未用新 mirror 覆盖主机，请 FileZilla 再传整包 `bible100_new_2`。

## 对齐检查清单（上传后浏览器）

- [ ] 顶栏 1 仅 6 模式（无独立「智慧事奉」顶栏）
- [ ] 教会事工 → 侧栏 `sidebar_church_layout_v1` + gateway
- [ ] Q&A → `qna/index.html`（非 qna_index_4layer）
- [ ] AI → `_landing/home.html`；`dashboard.html` 跳转工作台
- [ ] vi/id `chapter1.html` 可开（非 404）
- [ ] kh/lo 显示「籌備中」而非 404
- [ ] `temp_hymn.html` 显示 2015 首列表
- [ ] 诗歌页中文不乱码（若仍乱码，确认 `.htaccess` 已上传）

## Agent 自动机制

- 规则：`.cursor/rules/bible100-cloud-mirror-sync.mdc`
- 文档：`docs/governance/CLOUD_MIRROR_WORKFLOW_V1.md`
- 脚本：`scripts/sync_cloud_pack_to_mirror.ps1` · `scripts/audit_cloud_mirror.ps1`
- 测试：`tests/test_cloud_mirror_parity.py`
