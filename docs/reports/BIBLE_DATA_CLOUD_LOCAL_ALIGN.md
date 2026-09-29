# 经文字库 · 本机 file:// 与云端 HTTPS 对齐说明

**日期：** 2026-08-08  
**验收本机：** `file:///C:/Users/hlche/.cursor/bible100_new/index_v5.html`  
**验收云端：** https://bible100.lovestoblog.com/index_v5.html

---

## 两套经文字库（不是同一文件，但可同源）

| 功能 | 页面 | 本机 file:// | 本机 HTTP | 云端 HTTPS |
|------|------|--------------|-----------|------------|
| **译本对照** | `bible_study/parallel_mode_v3.html` | 读 `data/bibles/bible_data_faith.js` + `bible_data_niv.js`（约 12MB+5MB） | 懒加载 `data/bibles/clean/*.json` | 须上传 **`data/bibles/clean/`** |
| **圣经跑道** | `bible_app/shell/…` | **仅示范**（创 1、约 3:16） | 读 **`bible_app/app/assets/bible/bible_reader.db`**（约 41MB） | 须上传 **同一 .db** |

**不能**指望跑道与对照共用同一个 `.json` 文件：跑道用 **SQLite 四语经库**；对照用 **JSON 或嵌入式 .js**。内容可来自同一批源数据，但格式不同。

---

## 你遇到的现象 = 预期行为 + 云端缺文件

### 1. 圣经跑道「示范模式」

- **file:// 打开** `bible_app/shell/index.html` → 浏览器**禁止** fetch 本地 41MB `.db` → 只能示范几节。
- **完整 66 卷** → 双击 `bible_app/打開聖經跑道.bat`（或 VBS），用 `http://127.0.0.1:3000/bible_app/` 打开。
- **不是 404**：壳在；是**经库未载入**。

### 2. 云端跑道同样只有示范

- 若 **`bible_app/app/assets/bible/bible_reader.db` 未 FTP 上去**（约 41MB），HTTP 也会降级示范模式。
- 本次 ALIGN 包已纳入该路径；请确认 FileZilla 传完且远端文件 **> 10MB**（不是 893 字节的 aes 挑战页）。

### 3. 译本对照无经文

- **file://**：依赖 `data/bibles/bible_data_*.js`（已在你的 `data/`，但**不上云**）。
- **云端**：依赖 `data/bibles/clean/*.json`（KJV、NIV、信望爱…）；**上次 600MB 包未含此目录**时，对照页 UI 在、经文空。
- 已修 `parallel_mode_v3.html`：HTTPS 下**优先**读 `data/bibles/clean/`（与 registry 一致）。

---

## 本机 file:// 快速自检

| 检查 | 路径 | 期望 |
|------|------|------|
| 对照嵌入式经库 | `data/bibles/bible_data_faith.js` | 存在，约 12MB |
| 对照 clean（HTTP/云） | `data/bibles/clean/KJV.json` 等 | 7 个 json |
| 跑道 DB | `bible_app/app/assets/bible/bible_reader.db` | 约 41MB |
| 跑道壳 | `bible_app/shell/index.html` | 存在 |

**file:// 对照**：强刷 `bible_study/parallel_mode_v3.html`，应能看到创世记 1 章和合本+NIV。若仍空，看是否被 setup 说明页取代（表示 .js 未载入）。

**file:// 跑道完整版**：不要只靠 file://；用 bat 开 HTTP。

---

## 云端补传清单（与 file:// 能力对齐）

上传到 `htdocs/`（保持路径）：

```
data/bibles/clean/          ← 对照全文（约 30MB+）
bible_app/app/assets/bible/bible_reader.db   ← 跑道全文（约 41MB）
bible_study/parallel_mode_v3.html          ← 含 clean 路径修复
bible_app/shell/            ← 含本地 sql.js vendor
```

或解压最新 **`FTP_ALIGN_*`** 包内 `htdocs/` 对应目录。

**验收 URL：**

- 对照：https://bible100.lovestoblog.com/bible_study/parallel_mode_v3.html  
- DB 探测（应 >10MB）：`…/bible_app/app/assets/bible/bible_reader.db`  
- 跑道：https://bible100.lovestoblog.com/bible_app/shell/pages/bible66.html?book=1&chapter=1  

---

## 旧新两边对齐原则

1. **壳与导航**（index_v5、sidebar 链接）→ HTML/JS，已在 ALIGN 包。  
2. **经文字库**→ 单独大文件，**必须额外 FTP**；不在「只传 HTML」范围内。  
3. **file:// 跑道**永远示范；**完整跑道**本机用 bat，云端用 HTTPS + .db。  
4. **对照** file:// 用 .js；云端用 clean JSON（已改代码优先 clean）。

---

## 本次代码改动

- `bible_study/parallel_mode_v3.html` — HTTPS 读 `data/bibles/clean/`；file:// 无数据时显示 setup 而非空面板  
- `bible_app/shell/js/bible_reader_core.js` — sql.js 改读 `vendor/sqljs/`（少依赖 CDN）  
- `config/ftp_cloud_align_pack.txt` — 加入 `bible_app/`、`data/bibles/clean/`、parallel 相关 js

重新打包：

```powershell
powershell -ExecutionPolicy Bypass -File scripts\build_ftp_alignment_pack.ps1
```
