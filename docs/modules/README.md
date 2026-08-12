# Bible100 模块入口索引（Hub · Standalone · Satellite）

> **SSOT 配置：** `config/modes.json`（顶栏 mode）· `config/modules.json`（模块 path/sidebar）  
> **验收：** `file:///…/bible100_new/index_v5.html` 强刷  
> **清理记录：** [`docs/reports/CLEANUP_WAVE_20260812_INVENTORY.md`](../reports/CLEANUP_WAVE_20260812_INVENTORY.md)

---

## 三种关系

| 类型 | 含义 | 示例 |
|------|------|------|
| **Hub 大 mode** | `index_v5` 顶栏①–⑥ | 教材、研读、Q&A、教会、学校、AI |
| **Standalone** | 自有 `index`/shell，可单独 HTTP/`file://` 开 | `church_ministry/index.html` |
| **Satellite** | 有 Standalone 能力，但 IA 挂在别 mode 下 | `bible_app`（挂研读）、`church_planning`（挂教会） |

**禁止：** Hub 右栏再嵌一层带同名 `contentFrame` 的模块壳（壳中壳）。

---

## 顶栏 Hub 一览

| 顶栏 | mode id | 默认 sidebar | 默认 content | 模块索引 |
|------|---------|--------------|--------------|----------|
| ① 教材与培训 | `material` | `languages/index_cn.html` | `languages/_landing/home.html` | [languages](./languages/README.md) · [disciple_dynamics](./disciple_dynamics/README.md) |
| ② 圣经研读 | `study` | `bible_study/sidebar.html` | `bible_study/_landing/home.html` | [bible_study](./bible_study/README.md) · [bible_app](./bible_app/README.md) |
| ③ 圣经难题 | `qna` | （loader） | `qna/index.html` | [qna](./qna/README.md) |
| ④ 教会事工 | `church` | `sidebar_church_layout_v1` | gateway landing | [church_ministry](./church_ministry/README.md) · [church_planning](./church_planning/README.md) |
| ⑤ 学校管理 | `school` | `school_management/sidebar.html` | `_landing/home.html` | [school_management](./school_management/README.md) |
| ⑥ AI 辅助 | `ai` | `ai_tools/sidebar_lab.html` | `_landing/home.html` | [ai_tools](./ai_tools/README.md) · [smart_ministry](./smart_ministry/README.md) |

**总站壳：** [shell/README.md](./shell/README.md)

---

## Satellite / 工具模块

| 模块 | 前缀 | Standalone | Hub 进法 | 文档 |
|------|------|------------|----------|------|
| 诗歌管理 | HY | `hymn_management/index.html` | 工具总览 / 教会 A 区 | [hymn_management](./hymn_management/README.md) |
| 目录搜索 | NAV | `nav_hub/dashboard.html` | 工具总览 | [nav_hub](./nav_hub/README.md) |
| 门徒动力站 | DD | `dashboard.html` + `sidebar.html` | 顶栏①「门徒动力」；CM-C 为主路 | [disciple_dynamics](./disciple_dynamics/README.md) |

---

## 模块根夹白名单（清理守則）

根上只留：**index\*** / **sidebar\*** / **dashboard\*** / **_landing/** / **js css docs tools modules** 等。

进 **`_archive/`：** `*temp*`、`*複製*`、一次性脚本、扫描报告、实验 HTML。

**勿删：** `data/`（本机库）、LIVE 侧栏链到的 HTML、各模 `tests/` 烟测目录。

---

## 云端镜像

- 开发源：`bible100_new/`
- FTP 包：`bible100_new_2/`（sync 后上传）
- 工作流：[`CLOUD_MIRROR_WORKFLOW_V1.md`](../governance/CLOUD_MIRROR_WORKFLOW_V1.md)
