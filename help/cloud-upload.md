# 雲端試用與上傳說明

## 一、適應不同裝置

本站原則為適應不同裝置（PC、平板、手機）。雲端試用前請確認：

- 已上傳以下「新功能與修改」相關檔案（見下一節）。
- 以 **https** 開啟本站時，頂欄「翻譯」可帶入當前網址，貼到翻譯頁後即可用沉浸式／Google 翻譯。

---

## 二、雲端試用前請上傳的檔案／夾

為在雲端（如 https://bible100.lovestoblog.com）試用新功能，請至少上傳：

| 類型 | 路徑 | 說明 |
|------|------|------|
| 主站 | `index.html` | 頂欄分群色彩、global-tools |
| 腳本 | `js/global-tools.js` | 翻譯／送給 AI／我的收藏／說明 |
| 說明與工具頁 | `help/global-tools.htm` | 全站結構與使用說明（含頁外翻譯方法） |
| | `help/translate.html` | 翻譯頁（貼網址後選沉浸式或 Google 翻譯） |
| | `help/my-saved.html` | 我的收藏列表 |
| | `help/ai-chooser.html` | 送給 AI 的更多 AI 選擇頁 |
| QnA 四層 | `qna/qna_index_4layer.html` | 若 `.htm` 在雲端 404，請上傳此 .html 版；主站已改開此檔。 |
| **QnA 靜態版（分層載入）** | `qna/index.html` | 左側分層載入、右側 iframe。預設使用 `qna_sidebar_progressive.html`（輕量，無需 4.3MB）。需上傳：`qna_layer1_static.htm`、`qna_sidebar_progressive.html`、`qna_landing.htm`、`qna/data/qna_level1.json`、`qna/data/qna_data_*.json`。 |
| **QnA 分層 sidebar** | `qna/qna_sidebar_progressive.html` | 分層載入：Level 1 顯示 A/B/C＋來源，點來源→載入子分類，點子分類→顯示題目。依賴 `data/qna_level1.json` 與 `data/qna_data_*.json`（由 `build_qna_list.py` 產出）。 |
| **QnA 左側 sidebar（舊版）** | `qna/qna_list_auto.htm` | 全部來源單頁（約 4.3MB）。若主機限制上傳，請用分層版。 |
| | `qna/qna_list_equiptoserve.htm` | 「以斯拉百科網」的目錄頁。 |
| | `qna/qna_list_chineseapologetics.htm` | 「華人護教」的目錄頁。 |
| | `qna/qna_nav_config.js` | 四層導航設定，layer2 依賴此檔。靜態版**不需**此檔。 |
| | `qna/qna_catalog.html` | 選用：目錄版（依 JSON 資料），可從靜態版 noframes 連結進入。 |
| 各模組入口 | `qna/index.html`, `languages/index.html`, `nav_hub/index.html`, `ai_tools/index.html`, `smart_ministry/index.html`, `disciple_dynamics/index.html`, `school_management/index.html`, `church_ministry/index.html`, `bible_study/index.html` | 各頁已含 global-tools 的 div＋script |

**建議**：若您不確定哪些有改過，可**全站重新上傳**一次，以確保雲端與本機一致。

---

## 三、圖片在雲端不顯示的原因與需上傳的資料夾

### 原因說明

在 PC 本機圖正常、在 https://bible100.lovestoblog.com/languages/cn/OT/chapters/chapter2.html 部分圖不見，常見原因：

1. **OneDrive／本機絕對路徑**  
   部分 HTML 內圖檔路徑指向本機，例如：  
   `../../../../../../OneDrive/Documents/My%20Webs/Bible100_OT/image_ot/ot_image089.png`  
   雲端主機無法讀取您電腦上的 OneDrive，故這些圖在雲端一定無法顯示。

2. **站內相對路徑依賴的資料夾未上傳**  
   - 若頁面已引入 `scripts/image_path_rewriter.js`，會把上述 OneDrive 路徑改寫成站內路徑，指向 **`languages/cn/OT/images/image_OT/`**（檔名不變）。  
   - 若雲端沒有 `languages/cn/OT/images/image_OT/` 且內含對應圖檔（如 ot_image089.png），改寫後仍會 404。

3. **跨語系圖檔路徑**  
   - 部分 cn 章節（如 chapter2.html）內圖檔路徑指向 **`languages/vi/OT/chapters/BT01OT1-...files/`**。  
   - 雲端必須存在該 **vi** 底下的 `.files` 資料夾及所有圖檔，否則這些圖在雲端也會不見。

### 建議上傳的資料夾（依您實際有使用的為準）

| 目的 | 資料夾 | 說明 |
|------|--------|------|
| OneDrive 改寫後的 OT 圖 | `languages/cn/OT/images/image_OT/` | 請從本機 OneDrive 的 Bible100_OT/image_ot 複製所有圖檔到此，再上傳整個 `languages/cn/OT/images/`。 |
| NT 圖（若有類似路徑） | `languages/cn/OT/images/image_NT/` 或對應 NT 路徑 | 若有 image_NT 改寫，同上。 |
| vi 章節內嵌圖 | `languages/vi/OT/chapters/` | 含子資料夾 `BT01OT1-百步舊約參考資料-100%20steps%20OT%20Ref-100%20Bước_di%20chúc%20cũ_tham%20khảo.files` 及其中所有圖檔。cn 的 chapter2 會引用這裡的圖。 |
| 改寫腳本（若尚未上傳） | `languages/scripts/image_path_rewriter.js` | 讓 OneDrive 路徑在瀏覽器端改寫成站內路徑。 |

### 要「只補傳」還是「全站重傳」？

- **只補傳**：至少上傳上述 **二、** 的檔案與 **三、** 的資料夾（`help/`、`js/global-tools.js`、各模組 index、`languages/cn/OT/images/`、`languages/vi/OT/chapters/` 含 .files），並確認 `languages/scripts/image_path_rewriter.js` 已存在。
- **全站重新上傳**：最省事，可避免漏檔或路徑不一致；上傳後再依「三、」檢查雲端是否已有對應的 image_OT、vi 的 .files 等。

---

## 四、雲端與本機差異排查（頂欄、QnA、AI 智慧事奉）

### 頂欄缺少「翻譯／送給 AI／我的收藏／已收藏／說明」

若雲端頂欄沒有這些按鈕，表示以下檔案未上傳或版本過舊：

| 檔案 | 說明 |
|------|------|
| `index.html`（根目錄） | 必須含 `<div id="global-tools-root"></div>` 與 `<script src="js/global-tools.js"></script>` |
| `js/global-tools.js` | 負責注入 翻譯、送給 AI ▾、我的收藏、已收藏、說明 |
| `help/translate.html` | 翻譯頁 |
| `help/my-saved.html` | 我的收藏列表 |
| `help/ai-chooser.html` | 送給 AI 的更多 AI 選擇 |
| `help/global-tools.htm` | 全站說明 |

**處理**：重新上傳最新 `index.html` 與 `js/`、`help/` 資料夾。

**若上傳後頂欄仍無變化，請檢查 404：**

1. 在瀏覽器開啟：**https://bible100.lovestoblog.com/js/global-tools.js**
2. 若出現 **404 Not Found**，表示 `global-tools.js` 未在正確路徑：
   - 在 FTP 中進入與 `index.html` **同一層**的目錄（例如 `htdocs` 或 `public_html`）
   - 在該目錄下**新增資料夾** `js`（若尚未存在）
   - 將本機 **`bible100_new\js\global-tools.js`** 上傳到該 `js` 資料夾內
   - 完成後，網址應可開啟：`https://bible100.lovestoblog.com/js/global-tools.js`（顯示 JS 程式碼，非 404）
3. 清除瀏覽器快取或使用無痕視窗重新開啟 https://bible100.lovestoblog.com/index.html 再試。

### AI 智慧事奉無 sidebar

若點「AI智慧事奉」後左側欄為空，請確認已上傳：

| 檔案 | 說明 |
|------|------|
| `smart_ministry/sidebar.html` | AI 智慧事奉模組的側邊導航 |

**處理**：上傳 `smart_ministry/sidebar.html` 至雲端 `smart_ministry/` 目錄。

### QnA 聖經難題未能正常開啟

主站已改為**自動偵測**：在 bible100.lovestoblog.com 會使用輕量版 `qna_index_4layer_cloud.htm`（不依賴 4.3MB 的 qna_list_auto.htm）。

請確認已上傳：

| 檔案 | 說明 |
|------|------|
| `qna/qna_index_4layer_cloud.htm` | 雲端輕量版四層導航 |
| `qna/qna_layer1.htm` | 第一層選單 |
| `qna/qna_layer2_cloud.htm` | 第二層來源選單（雲端版） |
| `qna/qna_nav_config_cloud.js` | 雲端版導航設定（layer2 依賴） |
| `qna/qna_contents_default.html` | 左側輕量目錄 |
| `qna/qna_landing.htm` | 右側介紹頁 |

---

## 五、QnA 雲端與 PC 差異（重要）

### 差異說明

| 項目 | 雲端 (bible100.lovestoblog.com) | PC (bible100_new) |
|------|----------------------------------|-------------------|
| 主站 Q&A 連結 | 自動使用 `qna_index_4layer_cloud.htm`（輕量，無需 4.3MB） | 使用 `qna_index_4layer.htm`（完整） |
| 左側目錄 | `qna_contents_default.html`（輕量） | `qna_list_auto.htm`（約 4.3MB） |
| 行為 | 點 Q&A 開四層（性質→來源→側欄→內文） | 同上 |

**重要**：無法直接修改雲端檔案，只能修改 PC 本機檔案。雲端需透過 FTP／主機上傳，將 PC 的檔案同步上去。

### QnA 雲端上傳清單（讓雲端與 PC 一致）

上傳以下檔案至雲端 `qna/` 目錄：

| 優先 | 檔案 | 說明 |
|------|------|------|
| 必傳 | `index.html`（根目錄） | 主站頂欄，改為連結 qna_index_4layer.htm |
| 必傳 | `qna/qna_index_4layer.htm` | 四層導航主檔 |
| 必傳 | `qna/qna_index_4layer.html` | 若 .htm 404 時備用 |
| 必傳 | `qna/qna_layer1.htm` | 一層：難題性質 |
| 必傳 | `qna/qna_layer2.htm` | 二層：來源選單 |
| 必傳 | `qna/qna_nav_config.js` | 四層導航設定 |
| 必傳 | `qna/qna_list_auto.htm` | 左側目錄（全部來源）**約 4.3MB**，若主機限制上傳請改用雲端版（見下） |
| 必傳 | `qna/qna_landing.htm` | 右側預設 landing |
| 選傳 | `qna/qna_list_equiptoserve.htm` | 以斯拉百科目錄 |
| 選傳 | `qna/qna_list_chineseapologetics.htm` | 華人護教目錄 |
| 選傳 | `qna/qna_landing_A.htm` 等 | 各分類 landing 頁 |

### QnA 簡化版（分層載入，推薦）

`qna/index.html` 已改為使用 `qna_sidebar_progressive.html`，無需上傳 4.3MB 的 `qna_list_auto.htm`：

1. 執行 `python scripts/build_qna_list.py` 產出 `qna/data/qna_level1.json` 與 `qna/data/qna_data_*.json`
2. 上傳 `qna/`：`index.html`、`qna_sidebar_progressive.html`、`qna_layer1_static.htm`、`qna_landing.htm`
3. 上傳 `qna/data/`：`qna_level1.json` 及所有 `qna_data_*.json`（各檔約數 KB～數十 KB）

### 若「全部來源」仍 404：使用雲端版（已自動啟用）

主站 `index.html` 已改為**自動偵測**：在 bible100.lovestoblog.com 會自動使用 `qna_index_4layer_cloud.htm`，無需手動修改設定。

請上傳至 `qna/`：`qna_index_4layer_cloud.htm`、`qna_layer2_cloud.htm`、`qna_nav_config_cloud.js`、`qna_contents_default.html`、`qna_layer1.htm`、`qna_landing.htm`
3. 重新上傳 `index.html`

### QnA 雲端路徑與 404

- **主站「聖經難題 Q&A」入口**已改為 **qna_index_4layer.htm**。雲端請開：  
  **https://bible100.lovestoblog.com/qna/qna_index_4layer.htm**
- 若您上傳到 **htdocs/qna/**（FTP 路徑如 `ftpupload.net/htdocs/qna/`），則網址為 **…/qna/…**，無需 bible100_new 子目錄。
- 若 **…/qna/index.html** 仍 404（topbar/sidebar 在但內容 404），可暫時只用四層版：**…/qna/qna_index_4layer.htm**。同目錄需有：`qna_layer1.htm`、`qna_layer2.htm`、`qna_nav_config.js`、`qna_list_auto.htm`、`qna_landing.htm` 等。
- 靜態版（全部來源＋iframe）需 **…/qna/index.html** 與 `qna_layer1_static.htm`、`qna_list_auto.htm`、`qna_landing.htm`；若 index.html 在雲端 404，可略過靜態版，改用上述四層版。

### QnA 雲端 404 排查

| 現象 | 可能原因 | 解法 |
|------|----------|------|
| **index.htm** 404 | 檔名為 `index.html`（注意是 **html** 不是 htm） | 用 `.../qna/index.html` 開啟 |
| **qna_index_4layer.htm** 404 | 未上傳或路徑錯誤 | 上傳 `qna_index_4layer.htm`、`qna_index_4layer.html`（備用）至 `qna/` |
| **qna_layer2.htm?cat=A&src=equiptoserve** 只顯示部分以斯拉 | `src=equiptoserve` 為篩選參數，只顯示該來源 | 正常。若要全部來源，用 `src=all` 或開 `qna_index_4layer.htm` 完整頁 |
| **qna_list_auto.htm** 上傳失敗 | InfinityFree 等主機可能限制單檔大小（約 4.3MB） | 改用**分層載入版**：上傳 `index.html`＋`qna_sidebar_progressive.html`＋`qna/data/*.json`，無需 4.3MB 單檔 |

---

## 五、說明頁若「不見了」

若頂欄「說明」在雲端打不開，可能為路徑計算差異。請直接造訪：

- `https://您的網域/help/global-tools.htm`  
例如：`https://bible100.lovestoblog.com/help/global-tools.htm`

頁外翻譯方法與 localhost 提示均寫在該說明頁中。若網域帶子目錄（如 bible100_new），請改為：`https://bible100.lovestoblog.com/bible100_new/help/global-tools.htm`。
