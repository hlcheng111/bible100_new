# 聖經與神學難題 Q&A（試做）

- **爬蟲**：只抓「列表頁／目錄頁」的**連結 + 標題**，不抓正文。
- **前端**：左側 sidebar 顯示目錄，點選後在右側以 **iframe 顯示原站**（合法引用）；若該站禁止嵌入，請點「在新分頁開啟原頁」。

## 使用方式

1. **直接看試做頁**  
   開啟 `qna/index.html`（或從主站 → 目錄搜索 → 「聖經與神學難題 Q&A」→ 難題解答目錄）。  
   預設會載入 `data/links_sample.json` 的範例連結。

2. **執行爬蟲（可選）**  
   在專案根目錄執行：
   ```bash
   pip install requests beautifulsoup4
   python scripts/crawl_qna_list.py
   ```
   - **列表來源**：爬蟲會讀取 `qna/data/sources_config.json` 的 `list_pages`（每項含 `url`、`label_zh`、`label_en`）。若無此檔則用腳本內建預設。
   - **限制筆數**：可只抓前 N 個列表頁，方便測試：`python scripts/crawl_qna_list.py --limit=3`
   - **單一頁**：`python scripts/crawl_qna_list.py "https://example.com/list.htm"`
   結果寫入 `qna/data/links_<source>.json`（每站一份）與合併檔 `links_merged.json`。前端會依 `source_label` 分組顯示。

3. **若 iframe 無法顯示**  
   許多網站會禁止被嵌入（X-Frame-Options）。請點頁面上的「在新分頁開啟原頁」到原站閱讀。

## 檔案說明

- `scripts/crawl_qna_list.py`：爬蟲，只抓列表頁的 `<a href>` 與標題（無標題時以 URL 檔名為備用）。
- `qna/data/sources_config.json`：列表頁 URL 與顯示名稱（`list_pages`）；可自行增刪。
- `qna/data/links_sample.json`：範例資料（無爬蟲結果時前端會載入此檔）。
- `qna/data/links_<source>.json`：各站單一列表頁抓取結果。
- `qna/data/links_merged.json`：爬蟲合併輸出（有至少一筆時才會產生）。
- `qna/qna02.htm`：既有難題目錄（如恩泉陳終道）可解析為三層選單；執行 `python scripts/parse_qna02_to_json.py` 產生 `qna/data/qna02_tree.json`。
- `scripts/build_qna_list.py`：依 `links_merged.json` 與（若有）`qna02_tree.json` 產生 `qna_list_auto.htm`、`qna_list_chineseapologetics.htm`、`qna_list_equiptoserve.htm`，以及 **分層載入用** `qna/data/qna_level1.json`、`qna/data/qna_data_*.json`。
- `qna/index.html`：難題解答目錄與 iframe 檢視頁。預設使用 **分層載入** `qna_sidebar_progressive.html`（Level 1：A/B/C＋來源 → Level 2：子分類 → Level 3：題目），無需 4.3MB 單檔，適合雲端部署。
- `qna/qna_index.htm`：三欄 frameset 入口（網站入口、主模組、目錄＋右欄原文），為總 index 與 nav_hub 預設連結。
- `qna/qna_index_4layer.htm`：**四層導航**（無需跑爬蟲）：一層難題性質→二層來源→三層書卷側欄→四層 iframe 內文。手動編輯 `qna_nav_config.js` 即可調整選單。
- `qna/qna_index_4layer_V2.htm`：結構化側欄＋`data/qna_sidebar_bundle.js`（`node qna/tools/build_sidebar_bundle.mjs` 重建）。來源總表見 **`qna/SOURCES_PLAN.md`**；外界站匯入流程見 **`.cursor/rules/external-source-ingestion.mdc`**。

### 四層導航（無需跑爬蟲）

開啟 `qna_index_4layer.htm` 或從原入口點「四層導航」進入。

| 層級 | 說明 | 可編輯處 |
|------|------|----------|
| 一層 | 難題性質（聖經書卷／舊約／新約／神學教義／信徒教會） | `qna_nav_config.js` → `layer1_categories` |
| 二層 | 來源（以斯拉百科｜華人護教｜GotQuestions｜...）＋語言選譯 | `qna_nav_config.js` → `sources` |
| 三層 | 左側欄（書卷／專題目錄，來自既有 `qna_list_*.htm`） | 沿用 build 產物或手動改 HTML |
| 四層 | 右側 iframe（內文或 landing page） | 點選側欄連結即載入 |

新增來源：在 `qna_nav_config.js` 的 `sources` 陣列加入一筆，指定 `category`、`sidebar`、`landing`、`lang`、`zh_url`（若有中文版）即可。無需跑爬蟲。

## 如何手動加入難題（給「不能多層爬蟲」的來源）

目錄實際來自 **build 產生的** `qna_list_auto.htm`，不是直接改 `qna_index.htm`。你要加難題時，依來源類型操作：

### 方法一：可爬蟲的站（GotQuestions、Christian Answers 英文等）

- 在 `qna/data/sources_config.json` 加入或調整該站的列表頁，再執行 `python scripts/crawl_qna_list.py`，最後執行 `python scripts/build_qna_list.py`。
- 或直接編輯 `qna/data/links_merged.json`（較不建議，容易被下次爬蟲覆蓋）。

### 方法二：不能多層爬蟲的站（如 Christian Answers 中文、恩泉陳終道）

在 **qna02.htm** 裡加區塊（建議加在 `</body>` 前）：

1. **標題**：用 `<h2>來源名稱</h2>`（或 `<h1>`／`<h3>`）。  
   **來源名稱必須與** `qna/data/links_merged.json` 裡 `sources[].label` **完全一致**（例如 `Christian Answers 中文`），否則解析器會略過。
2. **連結列表**：在同一個區塊內，用 `<p>...</p>` 包住多個 `<a href="完整網址">題目標題</a>`，每行一則（可多個 `<br>` 或分多個 `<p>`）。
3. **存檔後**：執行  
   `python scripts/parse_qna02_to_json.py`  
   再執行  
   `python scripts/build_qna_list.py`  
   然後用瀏覽器開 `file:///.../qna/qna_list_auto.htm` 或 `qna_index.htm` 看結果（必要時強制重新整理或改 `?v=5` 避快取）。

**範例（貼在 qna02.htm 末尾 `</body>` 前）：**

```html
<hr>
<h2>Christian Answers &#20013;&#25991;</h2>
<p>
<a href="https://christiananswers.net/chinese/">Christian Answers &#20013;&#25991;&#39318;&#38913;</a><br>
<a href="https://christiananswers.net/chinese/某題目.html">題目名稱</a>
</p>
```

### 為什麼不能直接改 qna_list_auto.htm？

`qna_list_auto.htm` 是 **build 腳本產生的**。你直接改（或在 FrontPage 裡加連結）都會在下次執行 `build_qna_list.py` 時被覆蓋，所以不會出現在 `qna_index_4layer.htm`。**要加難題請改 qna02.htm**，再執行 `parse_qna02_to_json.py` → `build_qna_list.py`。

### 以斯拉百科網連結出現 ????、點進去只到首頁或 Server Error？

- 原因：解析時 URL 路徑（如 `聖經難題/創-1`）曾因編碼變成 `?????????/???-1`，build 已改為依書卷與題號還原成 **percent-encoded** 網址（如 `.../%E8%81%96%E7%B6%93%E9%9B%A3%E9%A1%8C/%E5%89%B5-1`）。
- 若點擊後仍出現 **「Server Error in '/' Application」**：那是 **以斯拉百科網伺服器** 回傳的錯誤，不是本機 HTML 的問題。可能原因：該頁不存在、需登入、或伺服器暫時異常；請用瀏覽器直接開同一網址確認。

### 要注意什麼？

| 項目 | 說明 |
|------|------|
| **編碼** | qna02.htm 若存成非 UTF-8，中文可能變 `??`。可改用 **HTML 實體**（如 `&#20013;&#25991;` = 中文）寫標題與連結文字，解析與顯示都正常。 |
| **label 一致** | `<h2>` 內文字必須與 `links_merged.json` 的某個 `sources[].label` 一字不差；多一個空格或全半形不同都會被略過。 |
| **不要混進導覽** | 連結標題避免純「回首頁」「返回」「更多」等，解析器會略過這類導覽連結。 |
| **建置順序** | 先 `parse_qna02_to_json.py`（產生 `qna02_tree.json`），再 `build_qna_list.py`（產生 `qna_list_auto.htm`）。 |
| **四層 A/B/C** | `qna_list_auto.htm` 採四層：A 聖經書卷／B 神學教義／C 信徒教會 → 網站 → 書卷 → 題目。設定見 `qna/data/qna_abc_config.json`。 |
| **快取** | 若改完沒看到更新，強制重新整理（Ctrl+F5）或把 `qna_index.htm` 裡 `qna_list_auto.htm?v=5` 改成 `?v=6` 再開。 |

### 加完後我會改良嗎？

會。你手動在 qna02 加入／修正難題後，我可以幫你：

- **檢查**：標題是否與 `links_merged` 的 label 對上、編碼與實體是否正確、是否有被略過的連結。
- **腳本**：若需要新來源但 `links_merged` 還沒有該 label，可改 `parse_qna02_to_json.py` 支援「僅來自 qna02」的來源，或一起調建置順序與目錄排序。
- **結構**：若某站題目很多，可約定在 qna02 用 `<h3>` 做第二層分類（需擴充解析器），讓三層選單更細。

你只要把「加了哪一段、希望目錄長怎樣」貼給我，我就依現有流程幫你對齊與改良。

## 目錄入口與總 index

- **總 index**：主站 `index.html` 頂列有「聖經難題 Q&A」按鈕，點擊後在內容區載入 `qna/qna_index.htm`（三欄：網站入口／主模組／目錄＋iframe）。
- **跨模組導航**：任一頁若在 frameset 內，可呼叫 `parent.openQnA()` 或 `window.top.openQnA()` 開啟難題模組。目錄搜索 (nav_hub) 左側：「聖經與神學難題 Q&A」→「聖經難題（全部來源／以斯拉／華人護教）」或本站地圖→「聖經難題 Q&A」。
