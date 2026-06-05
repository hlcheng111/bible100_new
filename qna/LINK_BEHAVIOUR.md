# 目錄連結說明（為何有的可出、有的不能）

## 1. 為什麼原文有的可出、有的不能？

### 以斯拉百科

- **辯道護教／舊約背景／新約背景（分類頁）**  
  連結是依「麵包屑」還原的，例如 `舊約背景-近東與舊約`、`新約背景-政治局勢`，**分類頁**可正常開啟。

- **同一分類下的「單篇文章」**  
  目前資料裡，同一分類下所有題目共用**同一個 URL**（該分類頁）。  
  站上每篇文章其實有各自網址，但解析 qna02 時沒有抓到每篇的獨立連結，所以點題目只會開到分類頁，無法直連單篇。  
  **可行做法**：從以斯拉站上抓每篇文章的真實 URL，更新到 `qna02_tree.json` 或解析腳本（`parse_qna02_to_json.py`）的來源後再 build。

- **聖經難題 - 以斯拉百科網（如撒上 6:19）**  
  資料裡的 URL 是**整卷分類**（如「撒母耳記上,下」），不是「聖經難題/書卷-N」這種單題網址。  
  所以點題目會變成開分類頁或 pagenotfound。  
  **可行做法**：解析 qna02 時改為儲存每個題目的真實 `href`（或站上「聖經難題/書卷-N」格式），再重建目錄。

### GotQuestions / Bible Questions! 等

- 若目錄只顯示**主題索引頁**（如 `content_God.html`），而沒有底下各題的連結，多半是來源資料（`links_merged.json` 或 qna02）裡只存了該索引頁 URL。  
- 若「以前可出、今次不能」：可能是對方網站改版、改網址或移除了該頁。

---

## 2. 標題字眼（如「未分類」）怎麼改？

- **只改顯示文字**：在 `scripts/build_qna_list.py` 裡改 **`DISPLAY_LABEL_OVERRIDE`**，例如：
  ```python
  DISPLAY_LABEL_OVERRIDE = {
      "未分類": "其他",
      "未標註經文／主題": "其他",
  }
  ```
  存檔後重新執行 `python bible100_new/scripts/build_qna_list.py`，目錄上的標題就會變更。**不必**逐行改 HTML。

- **增減某標題下的題目**：要改的是**來源資料**（例如 `qna/data/qna02_tree.json`、`links_merged.json`），或改解析腳本（如 `parse_qna02_to_json.py`）讓它正確抓每題的連結與分類，再重新 build。  
  單改 `qna_list_auto.htm` 會在下次 build 時被蓋掉。

---

## 3. qna_layer2.htm、qna_layer1.htm

- `qna_layer2.htm?cat=A&src=all` 的標題與來源列表來自 **`qna_nav_config.js`**（由 `qna_nav_config.json` 產生）。  
- 若要改「所有類似標題字眼」或分類名稱，可：
  - 改 **`build_qna_list.py`** 的 `DISPLAY_LABEL_OVERRIDE`（只影響 build 出來的靜態目錄），或  
  - 改 **`qna_nav_config.json`** / 產生該 config 的流程（影響 layer1/layer2 的導航與標題）。
