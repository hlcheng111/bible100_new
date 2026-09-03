# 圣经跑道 · bible_app（Satellite → 挂②研读）

**物理独立文件夹 · 非顶栏第七 mode**

## Standalone

| 角色 | 路径 |
|------|------|
| HTTP 入口 | `bible_app/index.html` → 转 `shell/index.html` |
| L0 壳 | `bible_app/shell/index.html`（赛道顶栏 + contentFrame） |
| 经库 | `bible_app/app/assets/bible/`（manifest + part001…005） |
| sql.js | `bible_app/shell/vendor/sqljs/` |

## Hub

- content → `bible_app/shell/index.html`（**不要**嵌 `bible_app/index.html` 壳中壳）
- **多语查经（全站）** → `bible_app/shell/pages/reader-multilang.html`（`bible_reader.db` 四语并排；顶栏 🌐 或研读②「多语」）
- sidebar → 仍用 `bible_study/sidebar.html`（`modules.json` bible_app.sidebar）

## 模块内文档

- `bible_app/docs/CLOUD_LOCAL_RUNTIME.md`
- `bible_app/docs/LANDING_MAINTAINER_CHECKLIST.md`
- `bible_app/docs/PRODUCT_SCOPE_FREEZE.md`

## 云端

须上传 shell + `app/assets/bible/` 分片；**勿**上传整包 `app/node_modules/`。
