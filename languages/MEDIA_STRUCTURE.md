# Bible100 媒體資源架構

> 治理對齊：`docs/governance/MATERIAL_MODULE_CLEANUP_WAVE_V1.md`  
> Alias 表：`languages/media_registry.json`（不另開新夾專門「整理」）  
> 路徑修復腳本：`scripts/fix_material_image_paths.py`

## 正當做法（先讀這段，避免越整理越亂）

### 舊圖（多語共用、已在用）

- **留在** `languages/images/image_OT|image_NT|image_T4/`（凍結目錄）。
- **不要**為了「統一」搬進每個語言的 `{lang}/media/`，也不要複製成 cn/en/vi 多份。
- HTML **只改連結**，指向共用夾的**相對路徑**（相對章節頁），例如：  
  `../../../images/image_OT/ot_map_image117.gif`  
  → `file://` 與上云（站在域名根）行為一致。
- **禁止**再用 `file:///C:/.../OneDrive/...`、`/languages/...` 絕對根路徑（後者在 `file://` 會變成 `C:/languages/...`）。

### 新圖要放哪？

| 問題 | 答案 |
|------|------|
| 多語課頁共用同一張？ | **是** → 放入 **`languages/media/images/`**（可分子夾，如 `OT1_ref/`） |
| 只有某一語才需要不同圖？ | **是** → 放入 **`languages/{lang}/media/images/`** |
| 新舊要不要併成「同一夾」？ | **不要硬併**。舊=`images/` 凍結；新=`media/`。靠連結與 registry，不靠搬家。 |

**預設選共用。** 只有「換成別的語言圖就必須不同檔」才用語專夾。

### 外站圖

- 保留 **`https://...` 完整 URL**（腳本會把 `http://`／`//` 盡量改成 https，利於上云）。
- 若對方防盗链／下线：再**人工**下載進 `languages/media/images/` 或 `languages/images/`，並改成本站相對路徑；無法自動保證外站永遠可開。

### 上云注意

- 必須一併上傳 **`languages/images/`**（體積大，常被漏傳）。漏傳則路徑對了仍 404。
- 章節頁已注入／應載入 `languages/scripts/image_path_rewriter.js` 作舊路徑兜底；**正式真相仍以 HTML 內相對路徑為準**。

---

## 0. 先決：共用還是分語言？

| 情況 | 放哪 | 命名 |
|------|------|------|
| **多語課頁共用同一張圖**（地圖、流程、聖經故事圖） | **共用**：新檔 → `media/{type}/`；舊檔繼續 `images/`（**勿搬**） | 新檔：`{track}_{unit}_{role}.ext` |
| **只有該語需要**（疊字標籤、語專示意） | `{lang}/media/{type}/` | 同上，可加語碼後綴 `_vi` |
| 已被章節 HTML 引用的舊路徑 | **不改磁碟路徑**；改 HTML 連結或登記 `media_registry.json` | 舊名可醜，靠 Alias |

**預設選共用。** 只有「換成別的語言圖就必須不同檔」才用語專夾。  
**禁止**把同一張共用圖複製進 cn/en/vi… 各一份。

## 目錄結構

```
languages/
├── images/                    # 【保留·凍結】現有共用圖（legacy）
│   ├── image_NT/
│   ├── image_OT/
│   ├── image_T4/
│   └── *.files/
│
├── media/                     # 【新共用】多語 general
│   ├── images/
│   │   └── OT1_ref/
│   ├── video/
│   ├── audio/
│   ├── pdf/
│   └── ppt/
│
├── cn/media/ … vi/media/ …    # 語專（僅該語）
```

## 路徑解析（image_path_rewriter）

| 舊路徑 | 新路徑 |
|--------|--------|
| OneDrive / My Webs / image_ot\|nt | `../../../images/image_OT\|NT\|T4/` |
| `/languages/...` 絕對根路徑 | 相對路徑（同語 media 或共用 images） |
| BT01OT1*.files/xxx | `../../../media/images/OT1_ref/xxx` |
| whole_book*.files/xxx | `../../../images/*.files/xxx` |

## 查詢優先順序

1. `languages/{lang}/media/{類型}/`
2. `languages/media/{類型}/`
3. `languages/images/`

---

## 未來新媒體加入程序

### 1. 決定存放位置

| 用途 | 路徑 |
|------|------|
| 語文專屬 | `languages/{語文}/media/{類型}/` |
| 新共用 | `languages/media/{類型}/` |
| 舊共用（已存在） | `languages/images/`（勿搬） |

### 2. 章節頁引用範例（從 `chapters/`）

- 語專：`../../media/images/檔名.jpg`
- 新共用：`../../../media/images/子夾/檔名.jpg`
- 舊共用：`../../../images/image_OT/檔名.gif`

### 3. 修復指令

```powershell
python scripts/fix_material_image_paths.py          # dry-run
python scripts/fix_material_image_paths.py --apply --inject-rewriter
```

報告：`reports/material_image_path_fix_report.json`
