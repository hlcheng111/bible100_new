# 全站对标报告 · 云端 vs 本机 SSOT

**日期：** 2026-08-08  
**本机验收：** `file:///C:/Users/hlche/.cursor/bible100_new/index_v5.html`  
**云端验收：** https://bible100.lovestoblog.com/index_v5.html?v=20260807_2301  
**方法：** 真实浏览器逐页抽检 + mirror 审计 + `test_index_v5_shell.py` / `test_cloud_mirror_parity.py`

> 说明：InfinityFree 对脚本/urllib 请求会返回 `aes.js` 挑战页（约 860B），**不能**用 curl/Python 直连判断文件是否存在；以下云端结论均来自浏览器实测。

---

## 总评

| 维度 | 结论 |
|------|------|
| **总站壳 index_v5** | ✅ 已对齐（标题、双 iframe、顶栏语言含 KH/LO） |
| **Q&A 新入口** | ✅ `qna/index.html` 引導式目錄正常 |
| **旧 QNA 4layer** | ✅ 已 404（云端无旧页） |
| **KH / LO 占位** | ✅ landP + chapter 籌備中页正常 |
| **教會 / AI / 研讀 / 詩歌** | ✅ 抽检 landing 正常 |
| **VI / ID 章節** | ❌ **OT/NT chapters 仍 404**（大文件未上云） |
| **旧 smart_ministry 总览** | ❌ **仍在云端**（须手动删除） |
| **mirror ↔ SSOT** | ⚠️ 17 个关键文件本机已更新、mirror 偏旧 |

**整体：主壳与模块 landing 已基本对齐；越南/印尼章節树 + 1 个旧页删除尚未完成。**

---

## 1. 入口与总壳

| 检查项 | 本机 | 云端 | 结果 |
|--------|------|------|------|
| `/` → index_v5 | 转址 | 200 | ✅ |
| `/?i=1` | — | 200，壳正常 | ✅ |
| `index_v5.html` 标题 | 聖經百步四寶 · index_v5 · 總站殼 | 同左 | ✅ |
| 顶栏语言 KH / LO | 有 | 有链接 | ✅ |
| `test_index_v5_shell.py` | PASS | — | ✅ |

---

## 2. 上次对齐项逐项

| 项目 | 云端结果 | 说明 |
|------|----------|------|
| kh/lo 404 修复 | ✅ | `landP_kh.html`、`kh_OT_chapter01.html` 等显示「籌備中」 |
| vi/id chapter 404 | ❌ | `languages/vi/OT/chapters/chapter1.html` → **404**；`id/OT/chapters/chapter1.html` → **404**；但 `vi/index.html`、`id/index.html`、`id/OT/index.html` 正常 |
| 诗歌 temp_hymn | ✅ | 2015 首列表可开 |
| hymn Big5 .htaccess | ⏳ | 文件应在包内；需点开一首 `.htm` 目测编码（本次未逐首验） |
| 旧 QNA 4layer | ✅ | `qna_index_4layer.htm` / `_cloud.htm` → 404 |
| 旧 smart_ministry 顶栏页 | ❌ | `smart_ministry/ai_smart_ministry_overview.html` **仍可访问** |

---

## 3. 模块 landing 抽检（云端）

| URL | 标题 | 结果 |
|-----|------|------|
| `qna/index.html` | 聖經難題 Q&A · 引導式目錄 | ✅ |
| `church_ministry/_landing/gateway.html` | 教會事工 · A–G | ✅ |
| `ai_tools/_landing/home.html` | AI 輔助 · A–E | ✅ |
| `bible_study/_landing/home.html` | 聖經研讀 · 首頁 | ✅ |
| `hymn_management/temp_hymn.html` | 已抽取詩歌預覽 | ✅ |
| `languages/landP_kh.html` | 柬埔寨語 · 籌備中 | ✅ |

---

## 4. VI / ID 章節 404 根因（重要）

mirror（`bible100_new_2`）里文件**存在**，体积很大，FTP 易失败：

| 文件 | mirror 大小 |
|------|-------------|
| `languages/vi/OT/chapters/chapter1.html` | **~3.0 MB** |
| `languages/id/OT/chapters/chapter1.html` | **~6.9 MB** |

云端已有 `languages/id/OT/index.html`（~3KB），但 **`chapters/` 子目录未上去** → 典型「大文件/深层目录上传中断」。

**建议补传（FileZilla，并发 1）：**

```
htdocs/languages/vi/OT/chapters/
htdocs/languages/vi/NT/chapters/
htdocs/languages/id/OT/chapters/
htdocs/languages/id/NT/chapters/
```

或从 `_ftp_outbox` 最新 ALIGN 包的 `htdocs/languages/vi/`、`htdocs/languages/id/` 整夹重拖（只拖 chapters 亦可）。

---

## 5. 须在云端删除的旧文件

PATHS_DELETE 尚未执行：

```
smart_ministry/ai_smart_ministry_overview.html   ← 仍在，请 FileZilla 远端删除
```

（两个 qna 4layer 已 404，无需再删。）

---

## 6. 本机 mirror 与 SSOT 偏差

`audit_cloud_mirror.ps1`：**17 项 STALE MIRROR**（本机 `bible100_new` 比 `bible100_new_2` 新），包括：

- `index_v5.html`、`js/index_v5_shell.js`、`config/modules.json`
- `church_ministry/sidebar_church_layout_v1.html`
- `ai_tools/*`、`bible_study/_landing/home.html`
- `qna/index.html`、`hymn_management/hymn/.htaccess` 等

若你本机 file:// 已与云端目测一致，可下次改代码后跑：

```powershell
run_sync_cloud_mirror.bat
```

再取 `_ftp_outbox/FTP_*.zip` 增量补传。

---

## 7. 验收清单（请你 file:// 强刷后对照）

1. **顶栏 1**：模式数量与名称与本机一致（教材 / 研讀 / Q&A / 教會 / 學校 / AI…）
2. **顶栏 2 · VI**：进入越文 OT 第一章 — 本机应开章；云端目前 404
3. **Q&A**：应是引導式目錄，不是旧 4layer
4. **KH / LO**：应显示籌備中，不是 404
5. **诗歌**：任一首 `.htm` 中文是否正常（非乱码）

---

## 8. 脚本与报告路径

- 浏览器对标脚本（供维护者）：`scripts/cloud_site_align_audit.py`（需浏览器或带 cookie 环境；urllib 会被 aes.js 挡）
- 本报告：`docs/reports/CLOUD_SITE_ALIGN_20260808.md`
- Mirror 审计：`scripts/audit_cloud_mirror.ps1`

---

**下一步最小动作（约 15–30 分钟 FTP）：**

1. 远端删除 `smart_ministry/ai_smart_ministry_overview.html`  
2. 补传 `languages/{vi,id}/{OT,NT}/chapters/`  
3. 强刷验收：`https://bible100.lovestoblog.com/languages/vi/OT/chapters/chapter1.html`
