---
name: QnA 目錄與搜尋改善
overview: 依你回饋：修正以斯拉「約珥書」與「說明／其他入口」結構；書卷排序僅對以斯拉／華人護教套用舊約→新約，其餘接入站保留該站原有次序；首頁→ 一鍵載入 sidebar＋iframe；AI 提問區改為 Sidebar 搜尋框；並接入你列出的其他站難題（恩泉、陳終道、蘇佐揚、李道生、呂鴻基、luke54、以斯拉其他區塊、Defending Inerrancy、GotQuestions、BibleQuestions、葛培理等）。
todos: []
isProject: false
---

# QnA 目錄與搜尋改善計劃

## 現況與問題對應


| 你的回饋                          | 現況原因                                                              | 計劃做法                                                                              |
| ----------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 舊約/約珥書 + 約珥書-瑪拉基書 成一大模組不合理    | 「約珥書-瑪拉基書」是站內分類頁，卻因標題以「約珥」開頭被歸成書卷「舊約/約珥書」                         | 把「約珥書-瑪拉基書」視為分類頁，歸到「各書卷（點入以斯拉站內）」；若該卷無單篇題目則不再出現「舊約/約珥書」區塊                         |
| 說明／其他入口 混雜舊約/新約/不知經卷          | `reshape_equiptoserve_tree` 把「未標註」且非 EQUIP_CATEGORY 的全丟進「說明／其他入口」 | 重做：拆成「以斯拉站內－舊約其他書卷」「以斯拉站內－新約其他書卷」（依標題判斷舊/新約），僅真正無法歸類的才放「未標經節／其他」                  |
| 華人護教／全部難題 書卷次序亂               | 目前用 `sorted(books.keys())`，依字串排序，非經卷順序                            | **僅對以斯拉聖經難題、華人護教** 套用「舊約→新約」書卷排序；**其餘接入站**（恩泉、陳終道、蘇佐揚等）書卷排序已正確，**不需改變**，保留該站連結順序  |
| 華人護教首頁→ 只到 iframe，應先有 sidebar | 目前僅 `target="main"` 開首頁                                           | 改為一鍵：同一點擊同時把「該站目錄」載入 contents、「該站首頁」載入 main（用 `parent.frames` 在頂列頁用 JS 設定兩 frame） |
| AI 提問文字 只是自抄題目                | 目前為 textarea + 點題目填入                                              | 改為「搜尋框」：使用者輸入關鍵字後，Sidebar 只顯示符合的書卷/題目（過濾）；保留點題目後填入提問文字供複製貼到 AI                    |


---

## 1. 以斯拉：約珥書-瑪拉基書 與 說明／其他入口

**檔案：** [scripts/build_qna_list.py](c:\Users\hlche.cursor\bible100_new\scripts\build_qna_list.py)

- **約珥書-瑪拉基書**
  - 在 `EQUIP_CATEGORY_TITLES` 加入 `"約珥書-瑪拉基書"`，讓它被歸到「各書卷（點入以斯拉站內）」。
  - 或改為：凡標題為「X書」「X記」或「X-Y」且無括號經節的連結，一律視為「站內分類頁」不當作單一書卷；僅有括號經節或可對應到單一書卷的題目才放在「舊約/某某書」。
- **說明／其他入口 重做**
  - 在 `reshape_equiptoserve_tree` 中，對「未標註經文／主題」中剩餘項目（rest）再分類：
    - 依標題或連結判斷為「舊約書卷入口」（如 撒母耳記、列王記、歷代志、以斯拉記-約伯記、詩篇-雅歌、以賽亞書-耶利米哀歌、以西結書-何西阿書 等）→ 歸入「以斯拉站內－舊約其他書卷」。
    - 依標題判斷為「新約書卷入口」（如 馬太福音、使徒行傳、羅馬書…）→ 歸入「以斯拉站內－新約其他書卷」。
    - 其餘無法判別或單篇難題但無經節的 → 放「未標經節／其他」（數量預期很少）。
  - 實作方式：可建一個「以斯拉站內舊約/新約關鍵字或標題集合」或簡單規則（標題含「記」「書」「福音」等）來分舊約/新約；或依現有 `BOOK_MAP` 反推該標題屬舊約或新約。

---

## 2. 書卷次序：舊約→新約，各約內按經卷順序

**檔案：** [scripts/build_qna_list.py](c:\Users\hlche.cursor\bible100_new\scripts\build_qna_list.py)

- 定義**書卷顯示順序**列表（例如 `BOOK_DISPLAY_ORDER`）：  
舊約 / 創世記 → … → 舊約 / 瑪拉基書，再 新約 / 馬太福音 → … → 新約 / 啟示錄（與 `BOOK_MAP` 一致）。
- 非書卷的 key（如「各書卷（點入以斯拉站內）」「以斯拉站內－舊約其他書卷」「以斯拉站內－新約其他書卷」「未標經節／其他」）排在最後，順序可固定。
- 在 `write_list_html` 中，不再使用 `sorted(books.keys())`，改為依 `BOOK_DISPLAY_ORDER` 排序；不在列表中的 key 放最後。
- **僅對** 以斯拉聖經難題、華人護教 兩類來源套用此排序；其餘來源（恩泉、陳終道、蘇佐揚、Defending Inerrancy、GotQuestions 等）**保留爬取順序**，不強制改寫書卷次序。

---

## 3. 首頁→ 一鍵：Sidebar 目錄 + iframe 首頁

**檔案：** [qna/qna_sites.htm](c:\Users\hlche.cursor\bible100_new\qna\qna_sites.htm)

- 將「華人護教首頁→」「以斯拉首頁→」改為**單一連結、雙 frame 更新**：
  - 點「華人護教首頁→」：`parent.frames['contents'].location = 'qna_list_chineseapologetics.htm?v=2'`；`parent.frames['main'].location = 'https://www.chineseapologetics.net/'`。
  - 點「以斯拉首頁→」：contents → `qna_list_equiptoserve.htm?v=2`，main → 以斯拉首頁 URL。
- 使用 `onclick` + `return false` 或 `href="javascript:void(0)"`，避免只導向 main；如此可達成「先有 sidebar 選單，再開首頁」。

---

## 4. Sidebar 搜尋（取代／補強「AI 提問文字」）

**檔案：** 由 [scripts/build_qna_list.py](c:\Users\hlche.cursor\bible100_new\scripts\build_qna_list.py) 輸出的三個 list HTML（或共用的 inline script）。

- **搜尋框**
  - 在目錄上方（或原「AI 提問文字」區塊上方）加入一個 **Search 輸入框**（例如 `<input type="text" id="qnaSearch" placeholder="輸入關鍵字過濾題目／書卷">`）。
- **行為**
  - 使用者輸入時（`input` 或 `keyup`）：即時過濾左欄內容。
  - 過濾對象：`<details>`（書卷）與其中的 `<a>`（題目）。規則建議：若關鍵字出現在該書卷的 `summary` 文字或該區塊內任一道題目標題，則保留該 `<details>` 並顯示；否則收合或隱藏。隱藏時可整塊 `display:none`。
  - 清空搜尋框時：恢復顯示全部書卷／題目。
- **與「AI 提問文字」的關係**
  - 保留「點題目後可複製的 AI 提問文字」：例如保留一個較小的 textarea 或只讀區塊，點題目後仍填入「請根據以下聖經／神學難題…」等文字供複製。
  - 意即：**搜尋 = 過濾 Sidebar 結果**；**複製用文字 = 點選題目後帶出的提問範本**，兩者並存。

---

## 5. 第二層（書卷）與第二排（主模組）

- **Sidebar 第二層（書卷）**
  - 維持現有 `<details>/<summary>` 的「書卷可開合」設計；僅調整排序與以斯拉分組（如上），使第二層更有意義、次序合理。
- **畫面上方第二排（主模組 frame）**
  - 目前僅「聖經難題（全部）」有作用。可選：在第二排增加「以斯拉百科網」「華人護教」連結（與第一排對應），讓使用者也可從第二排切換目錄；或維持精簡，僅在計劃中註明「第二排可選擴充」，由你決定是否實作。

---

## 實作順序建議

1. **接入其他站**：擴充 `sources_config.json`（你列出的恩泉、陳終道、蘇佐揚、luke54、以斯拉其他區塊、GotQuestions、BibleQuestions、葛培理等），跑 `crawl_qna_list.py` 更新 `links_merged.json`；實作「其餘來源保留原序」邏輯。
2. **書卷排序**：在 `build_qna_list.py` 加入 `BOOK_DISPLAY_ORDER`，**僅對以斯拉、華人護教** 套用舊約→新約排序；其餘來源保留爬取順序。
3. **以斯拉結構**：調整 `EQUIP_CATEGORY_TITLES`（含約珥書-瑪拉基書）並重做 `reshape_equiptoserve_tree`（說明／其他入口 → 舊約/新約其他書卷 + 未標經節／其他）。
4. **首頁→ 雙 frame**：修改 `qna_sites.htm` 的兩個「首頁→」連結為 JS 同時設定 contents 與 main。
5. **Sidebar 搜尋**：在產生之 HTML 中加入搜尋框與過濾用 JS，並保留「點題目→填入提問文字」區塊。
6. **（可選）** 第二排增加以斯拉／華人護教連結。

---

## 6. 接入其他站難題（你列出的網站）

你要接入的來源已列在計劃中；**他們的書卷排序都是正確的，不需改變**，接入時保留該站目錄／連結順序即可。

### 6.1 來源清單（納入 `sources_config.json` 並爬取）


| 名稱／說明                                       | URL（列表／索引頁）                                                                                                                                                              |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 《圣经难题汇编》Dr. Gleason Archer                  | [https://wellsofgrace.com/index-bible.htm](https://wellsofgrace.com/index-bible.htm)                                                                                     |
| 《圣经问题解答》陈终道                                 | [https://wellsofgrace.com/messages/chen/bible_qna/xu1.htm](https://wellsofgrace.com/messages/chen/bible_qna/xu1.htm)                                                     |
| 第二部分：生活问题 - 陈终道                             | [https://wellsofgrace.com/messages/chen/bible_qna/index3.htm](https://wellsofgrace.com/messages/chen/bible_qna/index3.htm)                                               |
| 第三部分：神学问题 - 陈终道                             | [https://wellsofgrace.com/messages/chen/bible_qna/index4.htm](https://wellsofgrace.com/messages/chen/bible_qna/index4.htm)                                               |
| 新约圣经难题 苏佐扬                                  | [https://wellsofgrace.com/bible/qna/nanti-su/index.html（已在](https://wellsofgrace.com/bible/qna/nanti-su/index.html（已在) config）                                           |
| 读经深思系列 苏佐扬                                  | [https://wellsofgrace.com/bible/qna/su-index.htm](https://wellsofgrace.com/bible/qna/su-index.htm)                                                                       |
| 旧约圣经问题总解(下) 李道生                             | [https://wellsofgrace.com/bible/qna/old2-li/index.html（已在](https://wellsofgrace.com/bible/qna/old2-li/index.html（已在) config）                                             |
| 《圣经难题解答》吕鸿基                                 | [https://wellsofgrace.com/bible/qna/bible_wenti/wenti3/index.htm](https://wellsofgrace.com/bible/qna/bible_wenti/wenti3/index.htm)                                       |
| 傳福音佈道常遇問題 / 福音常遇难题50题 / 60個你想問…             | [https://www.luke54.org/view/1060/10655.html](https://www.luke54.org/view/1060/10655.html)                                                                               |
| 信仰问题解答（一）远志明等                               | （需你提供具體列表頁 URL）                                                                                                                                                          |
| 辯道護教 - 以斯拉百科網                               | 以斯拉站內該區索引頁 URL                                                                                                                                                           |
| 基要衛道 - 以斯拉百科網                               | 以斯拉站內該區索引頁 URL                                                                                                                                                           |
| 舊約背景 - 以斯拉百科網                               | 以斯拉站內該區索引頁 URL                                                                                                                                                           |
| 新約背景 - 以斯拉百科網                               | 以斯拉站內該區索引頁 URL                                                                                                                                                           |
| Solutions To Bible "Errors"                 | [https://defendinginerrancy.com/bible-difficulties/（已在](https://defendinginerrancy.com/bible-difficulties/（已在) config）                                                   |
| Old Testament - Solutions To Bible "Errors" | （同上站內子頁，若有的話）                                                                                                                                                            |
| GotQuestions.org                            | [https://www.gotquestions.org/content.html](https://www.gotquestions.org/content.html)                                                                                   |
| Bible Questions                             | [https://www.biblequestions.org/](https://www.biblequestions.org/)                                                                                                       |
| Billy Graham - Answers                      | [https://billygraham.org/answers?answer%5BsortBy%5D=answer%3ApublicationDate%3Adesc](https://billygraham.org/answers?answer%5BsortBy%5D=answer%3ApublicationDate%3Adesc) |


備註：恩泉多個子站（Archer、陈终道、苏佐扬、李道生、吕鸿基）可各佔一筆 `list_pages`，用 `label_zh` 區分；以斯拉四個區塊需補上實際索引頁 URL 後加入。

### 6.2 怎樣做（實作步驟）

- **步驟一：擴充 [qna/data/sources_config.json**](c:\Users\hlche.cursor\bible100_new\qna\data\sources_config.json)  
  - 在 `list_pages` 中新增上表所列的 URL，並設好 `label_zh`（必要時 `label_en`）。  
  - 已有部分在 config 內（如 恩泉－新約聖經難題、舊約李道生、Defending Inerrancy）；未有的逐條加入；以斯拉 辯道護教／基要衛道／舊約背景／新約背景 需你提供或我從以斯拉站找出索引頁 URL 後補上。
- **步驟二：執行爬蟲產生合併資料**  
  - 執行 [scripts/crawl_qna_list.py](c:\Users\hlche.cursor\bible100_new\scripts\crawl_qna_list.py)（不帶參數時會依 config 依序抓取所有列表頁）。  
  - 爬蟲會把每頁的「連結＋標題」抓下，並在合併時為每筆寫上 `source_label`（來自 config 的 `label_zh`）。  
  - 輸出寫入 [qna/data/links_merged.json](c:\Users\hlche.cursor\bible100_new\qna\data\links_merged.json)。
- **步驟三：區分「需重整排序」與「保留原序」**  
  - 在 [scripts/build_qna_list.py](c:\Users\hlche.cursor\bible100_new\scripts\build_qna_list.py) 中：  
    - 對 **以斯拉聖經難題、華人護教** 兩類來源，繼續使用 `reshape_equiptoserve_tree`／書卷排序（`BOOK_DISPLAY_ORDER`）。  
    - 對 **其餘來源**（恩泉、陳終道、蘇佐揚、luke54、Defending Inerrancy、GotQuestions、BibleQuestions、葛培理等）：不套用書卷重排，依 `links_merged.json` 裡該來源的項目順序或現有 `build_tree` 的 key 順序輸出即可（即「他們的書卷排序都是正確的，你不需改變」）。
- **步驟四：目錄與頂列**  
  - `build_qna_list.py` 目前產出「全部難題」「華人護教」「以斯拉」三份 HTML；「全部難題」已含所有 `links_merged` 的來源。  
  - 接入新站後，「全部難題」會自動包含新來源；頂列可維持現狀，或視需要增加「恩泉」「以斯拉其他」等入口（連結到同一份全部難題頁並用錨點或前端過濾依來源篩選），依你之後決定。
- **步驟五：特殊站處理（可選）**  
  - 若某站結構特殊（例如需點進第二層才見題目列表），可為該站寫專用解析或手動維護一小份 JSON 再併入 `links_merged`，不影響其餘流程。

### 6.3 有信心做好嗎？

可以按上述步驟分階段做：先擴充 config 並跑一輪爬蟲，確認 `links_merged.json` 有新來源且 `source_label` 正確；再跑 `build_qna_list.py` 看「全部難題」是否顯示新站、書卷是否保留原序；最後再套用本計劃其餘改善（以斯拉結構、首頁→ 雙 frame、Sidebar 搜尋）。若某站需特殊解析（如 luke54、Billy Graham 的 DOM 結構），再針對該站補寫擷取邏輯即可。整體依現有 pipeline（config → crawl → merge → build_qna_list）擴充，風險可控。

---

## 若改做其他模組

若你希望改做**其他模組**（例如聖經閱讀、經文搜尋、別種 QnA 來源），可說明優先模組與目標，再另開一計劃；本計劃僅針對目前 QnA 目錄與搜尋的改善。