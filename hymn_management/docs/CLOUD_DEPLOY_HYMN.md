# 聖詩模組上雲部署計劃（含 493MB 樂譜圖）

## 主入口（統一）

| 用途 | URL |
|------|-----|
| **唯一主入口** | `hymn_management/index.html` |
| 子目錄轉址 | `hymn_management/hymn/index.html` → 上列 |
| 總站教會 A | 詩歌庫 → `hymn_management/hymn/index.html` |

## 單檔 2MB 限制 — 建議解法

本專案已採 **JSON 分片 + manifest**（無須再拆）：

```
data/source-hymns-manifest.json   ← 清單
data/source-hymns-1.json … 4.json ← 每片 <2MB
data/source-hymns-loader.js       ← 瀏覽器自動合併
data/hymn-overrides.json          ← 小檔，人改/AI 審核後增量
data/hymn-lyrics-index.json       ← 歌詞搜尋索引（可選上傳，約數 MB）
```

**不要**把 9.7MB 的 `source-hymns.json` 當上雲唯一檔；保留在 Git/本機作建置來源即可。

## 493MB `hymn/image_hymn/` 怎麼放最省事

您已有上雲體積預備，建議 **整包靜態托管**（與 HTML 同站或同 CDN 前綴）：

```
hymn_management/
  hymn/image_hymn/*.png    ← 493MB，與程式同路徑（template 已支援相對路徑）
  data/…
  hymn/index.html
```

| 平台 | 做法 |
|------|------|
| **Netlify / Cloudflare Pages / 自有 Nginx** | 整個 `hymn_management/` 或整站 `bible100_new/` 上傳；無單檔 2MB 問題（限制在 build 工具，不在靜態 png） |
| **GitHub Pages** |  repo 可不含 493MB；用 **Release 附件** 或 **第二 repo / 子模組** 放 `image_hymn`，部署時 rsync 合併 |
| **USB / 離線** | 與現行 `file://` 相同，拷齊 `image_hymn` 即可 |

**Git 策略**：`image_hymn/` 建議 `.gitignore` 或 Git LFS；正式上雲用 CI/rsync 從本機 `C:\bible100_new` 同步，避免每次 push 493MB。

## 上雲前檢查清單

```powershell
cd hymn_management
node scripts/build-hymn-lyrics-index.js
node scripts/check-hymn-external-links.js --limit=300
node scripts/build-sidebar-embedded.js
```

- 連結報告：`data/hymn-link-audit.json`（可貼給 AI 做失效連結摘要）
- 樂譜：側欄點歌 → `hymn_template.html?id=` → http 或 `hymn/image_hymn/`

## 本機維護（加歌 / 改歌）

1. 編輯：`hymn_editor.html`
2. 啟動：`node scripts/hymn-data-server.js`
3. 按「存到 hymn-overrides」
4. 新歌：`node scripts/build-sidebar-embedded.js`
5. 歌詞搜尋有變：`node scripts/build-hymn-lyrics-index.js`

## 還原本機樂譜（一次性）

```powershell
powershell -ExecutionPolicy Bypass -File hymn_management\scripts\restore_hymn_legacy_from_c_drive.ps1
```

來源：`C:\bible100_new\hymn_management\hymn\image_hymn\`
