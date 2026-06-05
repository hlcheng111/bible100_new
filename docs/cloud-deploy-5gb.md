# 5GB 雲端靜態部署說明

本專案總體約 5.8 GB，雲端主機通常有 5GB 存量限制。依 `config/cloud-upload-exclude.txt` 排除大型資料後，可控制在限制內。

---

## 一、必傳（核心功能）

| 類型 | 路徑 | 說明 |
|------|------|------|
| 主站 | `index.html` | 首頁、頂欄、導航 |
| 腳本 | `js/` | global-tools.js、coming-soon.js、config-loader.js 等 |
| 樣式 | `css/` | 全域樣式 |
| 設定 | `config/` | modules.json、paths.json、languages.json |
| 說明 | `help/` | global-tools.htm、translate.html、my-saved.html 等 |
| PWA | `manifest.json`、`service-worker.js` | 離線支援、加入主畫面 |
| 模組 | `nav_hub/`、`ai_tools/`、`smart_ministry/`、`church_ministry/`、`school_management/`、`bible_study/`、`qna/`、`disciple_dynamics/`、`hymn_management/` | 各模組 index、dashboard、sidebar、子頁 |

---

## 二、選傳（依空間決定）

| 類型 | 路徑 | 說明 |
|------|------|------|
| 多語 | `languages/` | 約 2.5 GB；可只傳 1–2 語（如 cn + en）以控制體積 |
| QnA 資料 | `qna/data/` | 若用分層版，需 qna_level1.json、qna_data_*.json |

---

## 三、不傳（排除）

依 `config/cloud-upload-exclude.txt`：

| 路徑 | 說明 |
|------|------|
| `backups/` | 備份檔 |
| `data/` | 大型 JSON、DB、bible_data_embedded.js 等 |
| `disciple_dynamics/disciple_d text/` | 門訓文字檔 |
| `disciple_dynamics/*.pdf` | 大型 PDF（18–109 MB） |
| `*.pdf`（>10MB） | 單檔過大 |

單檔過大範例（多數主機單檔限 10–20 MB）：
- `data/orig/gb_parsing.json` (~185 MB)
- `data/bibles/bible_data_embedded.js` (~56 MB)
- `data/cj/*.db`、`data/cd/*.db` (20–166 MB each)

---

## 四、精簡版建議

若空間不足，可採用「雲端精簡版」：

1. **必傳**：index.html、js/、css/、config/、help/、manifest.json、service-worker.js
2. **模組**：各模組 dashboard、sidebar、主要子頁（不含 data/、backups/）
3. **languages**：只傳 `languages/index_cn.html` + 中文 landing，或再加 `index_en.html` + 英文 landing
4. **QnA**：若主機允許多檔，傳 qna/；否則用 qna_contents_default 等精簡頁

---

## 五、上傳後檢查

- 頂欄「翻譯／送給 AI／我的收藏／說明」是否正常
- 各模組 dashboard 是否可進入
- PWA：以 HTTPS 開啟，檢查「加入主畫面」是否可用
- 若圖檔 404，參考 `help/cloud-upload.md` 的圖片路徑說明
