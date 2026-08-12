# 上云全功能包 · ≤4.8GB（V1 · 2026-08-06）

> 目标：尽量保留诗歌／图片／CN＋VI 课／对照译本文本；**不**把本机 USB 全量镜像上云。  
> 体积锚点：本机实测骨架约 **~2.0GB**；余量 **~2.8GB** 按下方「放回」优先级填，总上限 **4.8GB**。  
> 清单文件：`config/cloud_pack_4p8_include.txt` · `config/cloud_pack_4p8_exclude.txt`  
> 估算脚本：`scripts/estimate_cloud_pack_4p8.ps1`

---

## 0. 综合解读.db —— 本包 **排除**（已拍板）

### 为何可除

| 事实 | 说明 |
|------|------|
| `file://` 打开 `bible_study/parallel_mode_v3.html` | 浏览器 **无法可靠 fetch** 本地 `.db`／大 JSON；sql.js 现又偏向 CDN（`sql.js.org`） |
| 页面上常见 | 仅剩少数中英译本可用；registry 列出的「综合解读／信望爱注释…」**站内用不了** |
| `data/cj/clean/Comprehensive.json` | 本机为 **0 字节空档**，不能当离线 JSON 替身 |
| 体积 | `综合解读.db` ≈ **162MB**；整夹 `data/cj/` ≈ **846MB**（含重复 json／次要库） |

**本包结论：不上 `综合解读.db`，也不上整包 `data/cj/`。**  
释经主路在云端定位为：**外站链接／本机 USB 完整库**；云端对照以 **`data/bibles/clean/*.json` 文本**为主（须 **HTTPS** 托管，如 Cloudflare Pages／静态主机）。

### 若将来要「对照模式 v3 真离线全 registry」（另波 · 不在本包）

须单独开波重建，至少包括：

1. **sql.js 本地化**：优先 `bible_study/js/sql-wasm.js` + `.wasm`，禁止仅依赖 CDN。  
2. **file:// 或打包协议**：IndexedDB／预埋 ArrayBuffer，或强制 **本机 HTTP**／云端 HTTPS（禁止裸 file fetch）。  
3. **registry 五译本 JSON（已有 clean）**：

   | key | 文件（优先） | 约略 |
   |-----|--------------|------|
   | faith | `data/bibles/clean/信望爱(和合本).json` | ~10MB |
   | kjv | `data/bibles/clean/KJV.json` | ~9MB |
   | niv | `data/bibles/clean/NIV.json` | ~6MB |
   | vi1934 | `data/bibles/clean/越南聖經1934.json` | ~6MB |
   | id_ayt | `data/bibles/clean/印尼AYT.json` | ~6MB |

4. **注释**：须有可用内容——要么修好非空 `Comprehensive.json`，要么在 **HTTPS** 下重新接入 `综合解读.db`（单档 >25MB → **不能**进 Cloudflare Pages，须 R2／传统主机）。  
5. 其余注释：`信望爱注释`／`串珠`／`启导本`／`每日研经` 的 **json 或 db** 按 registry 补齐（若干 db 本机已缺失）。

未完成上列前：**不要**为「看起来 registry 齐全」而把 162MB+ 的 db 塞进云端包。

---

## 1. 本包必含（骨架 · 约 2.0GB）

| 区块 | 路径 | 约略 MB | 备注 |
|------|------|---------|------|
| 站壳 | `index.html`、`index_v5.html`、`js/`、`css/`、`config/`、`help/`、`nav_hub/` | ~2 | |
| 模组页 | `bible_study/`、`church_ministry/`、`church_planning/`（无大 pptx）、`ai_tools/`、`school_management/`、`smart_ministry/`、`qna/` | ~90 | 含 hymn **壳** |
| 诗歌＋图 | `hymn_management/`（含 `hymn/`） | ~950 | 诗歌主体积 |
| 共用旧图 | `languages/images/` | ~170 | CN／VI 课共用真相 |
| 共用新媒体 | `languages/media/` | ~363 | 含 `media/images` |
| 中文课 | `languages/cn/`（OT/NT/T4 chapters） | ~197 | 主教材 |
| 越文课（瘦） | `languages/vi/` **排除全部 `*.files`** | ~151 | 见 §2 |
| 英文课 | `languages/en/` | ~25 | |
| 印尼课 | `languages/id/` | ~36 | 可选但本包默认含 |
| 教材入口 | `languages/_landing/`、`landP_*.html`、`landing_new_cn.html` | 少 | **V1.1 补入**（缺则顶栏教材 404） |
| 圣经跑道 | `bible_app/index.html` + `bible_app/shell/` | 少 | **V1.1 补入**（不含 Expo `app/`） |
| 门训动力 | `disciple_dynamics/`（无大 PDF） | 视存量 | **V1.1 补入** |
| 对照译本 | `data/bibles/clean/`（7 个 JSON） | ~48 | registry 五译本＋其它 clean |
| 小注释夹 | `data/commentaries/`（仅已有小档） | ~20 | **不含** cj 大库 |
| 入口 | `languages/index_*.html`、根 README 等 | 少 | |

**合计骨架 ≈ 2050MB ≈ 2.0GB** → 距 4.8GB 约 **2.8GB** 余量。

---

## 2. 必排除（砍重复／后备／无用）

见 `config/cloud_pack_4p8_exclude.txt`。摘要：

| 排除 | 约略省 | 理由 |
|------|--------|------|
| `data/cj/` 整夹（含 `综合解读.db`） | ~846MB | 站内用不了；重建另波 |
| `data/orig/`（`gb_parsing.*`） | ~272MB | 解析用 |
| `data/bibles/bible_data_embedded.js` 等大杂烩 | ~54MB+ | 非 clean 路径 |
| `languages/vi/**/*.files` | ~937MB | Word 后备图床（BT02／OT Ref／temp…） |
| `vi/media/images/image_NT/` 残档 | 可忽略 | 改链 `languages/images/` |
| `backups/`、`archive/`、`node_modules/`、`.git/`、`.cursor/` | 不定 | 永不上传 |
| `church_planning/image_plan/*.{png,pptx}` | 视情况 | 大图外挂 Drive |
| `*.mp4`、大 `*.pdf`、`*.zip` | | |

---

## 3. 余量 ~2.8GB —— 建议「放回」顺序（总 ≤4.8GB）

| 序 | 放回 | 约略 | 说明 |
|----|------|------|------|
| R1 | `qna/data/` 全套（若尚未在模组体积内算全） | 视存量 | 难题库 |
| R2 | `data/bibles/` 中与 clean **不重复**的 `和合本.json`／备用 faith 档 | ≤30MB | 容错路径 |
| R3 | `启导本圣经注释.json`＋`.db`（仅此注释） | ~12MB | 小；仍非综合解读 |
| R4 | `信望爱注释.json`（无 db 也可） | ~12MB | registry 有列出 |
| R5 | `languages/ch/` 儿童入口 | ~8MB | |
| R6 | 预留 **≥400MB** 空档 | | 更新／误算缓冲 |
| **勿放回** | `综合解读.db`／整包 cj／VI `.files`／`gb_parsing` | | 本波禁止 |

填完 R1–R5 后若仍远低于 4.8GB：**不要硬塞备份**；保持空档或只加「经明确授权」的第二诗集／教材语。

---

## 4. 托管注意（与体积无关但决定「能不能用」）

| 环境 | 对照 clean JSON | 综合解读.db |
|------|-----------------|-------------|
| `file://` | 多数浏览器失败 | 失败 |
| **HTTPS 静态**（Pages／主机） | **可用**（推荐云端验收） | 单档 162MB：**Pages 单档上限 25MB → 不可进 Pages**；须 R2／大空间 FTP |
| 本机 `python -m http.server` | 可用 | 可用（若文件在盘上） |

云端全功能站验收请用：**`https://你的域名/index_v5.html`**，不要用 file:// 当云端标准。

---

## 5. 操作步骤（人工／Agent）

```powershell
cd C:\Users\hlche\.cursor\bible100_new
powershell -ExecutionPolicy Bypass -File scripts\estimate_cloud_pack_4p8.ps1
# 按报告把「INCLUDE」同步到 D:\bible100_cloud_4p8\ （或 R2／FTP）
# 确认总大小 ≤ 4800 MB
```

上传前抽查：

1. `index_v5.html` 顶栏／侧栏  
2. `hymn_management/dashboard.html` 有图  
3. `languages/cn/.../chapters` 有图（`languages/images`）  
4. HTTPS 下 `bible_study/parallel_mode_v3.html` 能否出现 **clean 五译本**（不要期望综合解读面板）

---

## 6. 状态

| 项 | 状态 |
|----|------|
| 综合解读.db 进云端包 | **否** |
| clean 五译本进云端包 | **是**（HTTPS 对照文本） |
| 离线全 registry＋注释重建 | **未做**（另波） |
| 包体目标 | **≤4.8GB**（骨架 ~2.0GB + 有序放回） |
| 站根路径 | **不依赖** 文件夹名；以 `index_v5`／顶层模块目录推算（`js/shell_nav.js`） |
