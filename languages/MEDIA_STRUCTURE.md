# Bible100 媒體資源架構

## 目錄結構

```
languages/
├── images/                    # 【保留】現有圖片
│   ├── image_NT/
│   ├── image_OT/
│   ├── image_T4/
│   └── *.files/
│
├── media/                     # 【新增】共用媒體（general）
│   ├── images/
│   │   └── OT1_ref/           # 舊約參考圖（原 vi BT01OT1...files）
│   ├── video/
│   ├── audio/
│   ├── pdf/
│   └── ppt/
│
├── cn/media/                  # 中文專屬
├── en/media/
├── vi/media/
├── id/media/
├── ch/media/
├── ad/media/
├── kh/media/
├── lo/media/
└── my/media/
    └── images/, video/, audio/, pdf/, ppt/
```

## 路徑解析（image_path_rewriter）

| 舊路徑 | 新路徑 |
|--------|--------|
| vi/OT/chapters/BT01OT1*.files/xxx.jpg | media/images/OT1_ref/xxx.jpg |
| image_nt/xxx | images/image_NT/xxx |
| image_ot/xxx | images/image_OT/xxx |
| whole_book*.files/xxx | images/*.files/xxx |

## 查詢優先順序

1. languages/{lang}/media/{類型}/
2. languages/media/{類型}/
3. languages/images/

---

## 未來新媒體加入程序（新文件放入 media 夾）

### 1. 決定存放位置

| 用途 | 路徑 | 範例 |
|------|------|------|
| **語文專屬**（僅該語文使用） | `languages/{語文}/media/{類型}/` | `languages/vi/media/images/` |
| **共用**（多語文共用） | `languages/media/{類型}/` | `languages/media/images/OT1_ref/` |
| **舊架構保留** | `languages/images/` | image_NT、image_OT、image_T4 |

### 2. 依媒體類型放入對應子夾

- 圖片 → `media/images/`（可再分子夾，如 `OT1_ref/`、`image_T4/`）
- 影片 → `media/video/`
- 音檔 → `media/audio/`
- PDF → `media/pdf/`
- PPT → `media/ppt/`

### 3. 檔名命名建議

- **無自動前綴**：系統不會自動加前綴，需自行命名。
- **建議格式**：`{模組}_{章節}_{序號}.{副檔名}`，例如：
  - `OT1_ch01_img001.jpg`（舊約1 第1章 圖1）
  - `NT1_ch05_photo.png`
  - `T4_apostles_creed.jpg`
- 避免空格，可用底線或連字號；中文檔名請 URL 編碼（如 `%20`）或改用英文。

### 4. 在網頁中引用

從 `{語文}/{NT|OT|T4}/chapters/` 的章節頁：

- 語文專屬：`../../media/images/檔名.jpg`
- 共用：`../../../media/images/子夾/檔名.jpg`

從 `tools/html_editor.html` 預覽時，路徑需以 `../languages/` 開頭，例如：
- `../languages/vi/media/images/檔名.jpg`
- `../languages/media/images/OT1_ref/檔名.jpg`

### 5. 已完成的遷移

- **vi**：`vi/images/*` 已轉移至 `vi/media/images/`，相關頁面連結已更新為 `../../media/images/`。
- **其他語文**（cn, en, id 等）：無自建 `images/`，使用共用 `languages/images/` 或 `languages/media/`，無需遷移。
