# 雲端瘦身與大型資產外掛（GitHub + lovestoblog + Google Drive）

> 目標：線上「基本展示站」約 **4–4.5 GB**（從 ~6 GB 移出 **1.5–2 GB**），  
> 大型庫本機/USB/Google Drive 保留，按需連結。

## 現況（本機實測）

| 路徑 | 約略大小 | GitHub | 建議上雲 |
|------|----------|--------|----------|
| `hymn_management/hymn/` | ~1.4 GB | 已自 Git 移除追蹤 | **不上傳** → Drive |
| `data/` | 視本機而定 | 從未進 Git | **不上傳** 或精簡 subset |
| `church_planning/image_plan/` | ~64 MB | 媒體已自 Git 移除 | **不上傳** → Drive |
| `archive/`、`backups/` | 不定 | 忽略 | 不上傳 |

## 一、GitHub（程式碼倉庫）

1. `.gitignore` 已排除 `hymn_management/hymn/`、image_plan 媒體、`data/`。
2. `git rm --cached` 只停止**未來**追蹤；**舊 commit 歷史仍佔空間**。
3. 若要 GitHub clone 也變小，需另做歷史瘦身（`git filter-repo`，需明確同意 force push）。

## 二、lovestoblog 上傳（6 GB → ~4 GB）

### 原則

- 上傳 **殼 + HTML + JS + CSS + 小圖示**，不上傳整包詩歌庫與本機 `data/`。
- 使用 `.deploy-exclude`（見 repo 根目錄）配合 FTP/手動上傳清單。

### 建議「基本展示」必含

```
index.html / index_v5.html
bible_study/（不含巨型附件）
church_ministry/（精簡頁）
church_planning/（不含 image_plan 大圖）
nav_hub/、help/、ai_tools/（入口）
config/build_version.js
```

### 建議不要上傳（省 ~1.5–2 GB+）

```
hymn_management/hymn/          ← 約 1.4 GB
data/                          ← 聖經 .db 等（本機/USB）
archive/、backups/
church_planning/image_plan/*.png
church_planning/image_plan/*.pptx
node_modules/
**/_archive/
```

### 上傳前檢查（PowerShell）

```powershell
# 估算若排除 hymn+data 後的大小（本機）
$exclude = @('hymn_management\hymn','data','archive','backups','node_modules')
# 手動對照 .deploy-exclude 逐資料夾上傳
```

## 三、Google Drive 外掛（可與 Git 瘦身一起做）

### 適合放 Drive 的內容

- `hymn_management/hymn/` 整包（詩歌 HTML/媒體）
- `church_planning/image_plan/` 簡報與架構圖
- 完整 `data/` 備份 zip（給進階使用者下載）

### 操作步驟

1. 在 Google Drive 建資料夾：`Bible100_Offload_2026`
2. 上傳 `hymn_management/hymn`（壓縮為 `hymn_offline_pack.zip` 較好管理）
3. 分享 → **知道連結的使用者** → **檢視者**
4. 取得檔案 ID，填入 `config/asset_offload_manifest.json`（見下）

### 站內連結方式（不破壞 file:// 本機）

在需要「完整詩歌庫」的入口頁加 **外部下載** 按鈕，例如：

- 詩歌模組 landing：`hymn_management/index.html` →「下載完整離線包（Google Drive）」
- URL 格式：`https://drive.google.com/file/d/FILE_ID/view?usp=sharing`

**不要**把整站改成依賴 Drive 載入 iframe（不穩定、需登入、CORS 限制）。

### manifest 契約（可選擴充）

`config/asset_offload_manifest.json`：

```json
{
  "version": 1,
  "packs": [
    {
      "id": "hymn_offline",
      "label": "完整詩歌庫離線包",
      "drive_view_url": "https://drive.google.com/file/d/YOUR_FILE_ID/view",
      "local_path": "hymn_management/hymn/",
      "size_hint_mb": 1400
    }
  ]
}
```

頁面用 JS 讀 manifest，有網路時顯示 Drive 按鈕；離線時提示「請用 USB 本機包」。

## 四、一起解？可以

| 層 | 做法 |
|----|------|
| GitHub | `.gitignore` + `git rm --cached`（本次） |
| 雲端主機 | 不上傳 hymn/data，只上傳展示殼 |
| 大型檔 | Google Drive 連結 + manifest |
| 本機/USB | 完整包仍可用 `file://` + `data/` |

## 五、安全 push 步驟（本次變更）

```powershell
cd C:\Users\hlche\.cursor\bible100_new
git status
python tests/test_unified_navigation.py
git add .gitignore docs/governance/CLOUD_ASSET_OFFLOAD.md .deploy-exclude config/asset_offload_manifest.json
git commit -m "chore: 自 Git 排除 hymn/image_plan 大型資產並附雲端外掛說明"
git push origin main
```

**注意：** 此次 push 後 GitHub **新 clone 不再含 hymn 檔案**，但**舊歷史仍大**；要縮歷史需另開議題。

## 六、lovestoblog 上線檢查清單

- [ ] FTP 未上傳 `hymn_management/hymn/`
- [ ] FTP 未上傳 `data/`（或只上傳 1 個示範 .db）
- [ ] 首頁 `index_v5.html` 可開
- [ ] 詩歌入口改為「Drive 下載」或「本機完整版說明」
- [ ] 總容量目標 < 4.5 GB
