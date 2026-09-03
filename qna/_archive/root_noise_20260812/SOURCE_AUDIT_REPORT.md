# SOURCE_AUDIT_REPORT

產出時間：本輪 Agent 深研（先審核、後改功能）

審核範圍：你列出的站點與 `qna_nav_config` 來源。

審核方法（第一輪）：
- 讀取 `qna/data/qna_data_*.json` 結構；
- 統計每站 `groups / items / unique URL`；
- 估算「首頁/目錄/分類頁比例」與「像題目的標題比例」；
- 判定是否適合 sidebar 直接「一按即到」。

> 說明：此報告是先交你過目的 **審核結論**。下一步才是按本報告逐站改功能（重抓、修 URL、切換 book/topic 模式、清洗無效項）。

---

## 判級規則

- `A = 可直接用（book/topic 結構清楚，點題可期待到答案）`
- `B = 可用但需清洗（混入目錄/首頁/重覆，或分層不夠）`
- `C = 不可直接用（大量導覽連結、404 舊路徑、或無題目資料）`

---

## 逐站審核（你指定名單）

| 來源 | 目前分層可用性 | 判級 | 主要問題 | 建議動作 |
|---|---|---:|---|---|
| 以斯拉·聖經難題 | 有書卷分組（38 組），但大量舊 URL | C | 舊 `.../聖經難題/卷-號` 路徑多 404 | 必做 URL 新舊映射（至少卷級先導向新站卷目錄） |
| 以斯拉·申命～路得 | 有分組（6 組） | B | 連結偏舊站格式，需抽樣驗證 | 補 fixups + 抽樣 20 條 |
| 以斯拉·舊約背景 | 分組有（10），但 unique URL 幾乎=10 | C | 大量重覆導向同少數頁，非題目清單 | 改為 topic-mode，或重抓新站分類頁 |
| 以斯拉·新約背景 | 分組有（11），但 unique URL 幾乎=12 | C | 同上，題目密度低 | 改 topic-mode + 新站重抓 |
| Defending Inerrancy | 書卷分組完整（66） | A | 題名噪音少量 | 保留 book-mode，僅清洗標題 |
| Bible Questions! | 僅 1 組「未分類」 | C | 混字母索引、PDF、目錄頁 | 改 B 類 topic-mode，先 curate |
| GotQuestions.org | 有 35 組但含入口頁 | B | 混入首頁/搜尋/FAQ 導覽 | 重抓只留文章頁 pattern |
| 以斯拉·辯道護教 | 35 組主題結構 | B | 非書卷型、可能同 URL 多題 | topic-mode；必要時段落錨點化 |
| Reformed Answers | 僅 1 組，題目多但偏分類頁 | B | topic 導覽成分高 | topic-mode + 白名單文章頁 |
| Christian Answers（英） | 僅 1 組，home/category 混多 | C | 首頁/目錄/語言頁混入明顯 | 以 Directory + 專題頁重建 curated JSON |
| CA 繁中首頁 | 無本地題目 JSON | C | 現僅 sidebar 載首頁，無題目樹 | 建 `CA_zh_curated` 題庫 |
| CA Bahasa Indonesia | 無本地題目 JSON | C | 同上 | 建 `CA_id_curated` 題庫 |
| CA Tiếng Việt | 無本地題目 JSON | C | 同上 | 建 `CA_vi_curated` 題庫 |
| 恩泉·陳終道（聖經問答） | 僅 1 組 6 條 | C | 僅入口索引，非題目樹 | 併入陳終道子系列，不單列 |
| 恩泉·Archer 彙編 | 38 組，書卷感強 | B | 混導覽頁與部分非題目連結 | 書卷模式保留，清掉導覽噪音 |
| 恩泉·《圣经问题解答》 | 僅 1 條 | C | 無實質題庫 | 取消獨立 source，改併陳終道 |
| 陈终道·旧约 | 1 組 33 條 | B | 組層太平，仍可用 | 補分卷（若可）或保留單層題目 |
| 陈终道·新约 | 1 組 73 條 | B | 同上 | 同上 |
| 恩泉·蘇佐揚·新約難題 | 17 組，題目量高 | A | 噪音很少 | 直接書卷模式 |
| 恩泉·蘇佐揚·讀經深思 | 1 組 15 條 | B | 單層可用但不夠引導 | 保留 topic-mode |
| 恩泉·李道生·舊約難題 | 36 組，題量佳 | A | 少量導覽型連結 | 書卷模式，微清洗 |
| 恩泉·呂鴻基 | 1 組 11 條 | B | 偏卷次目錄 | 保留單層 |
| 恩泉·難題（卷二） | 1 組 38 條 | B | 含索引型連結 | 清洗後可用 |
| 華人查經網 ccbiblestudy | 99 組、結構清楚 | A | 少數索引頁 | 直接書卷/查經分組 |

---

## 自動審核摘要（關鍵數據）

> 指標：`groups / total items / unique URLs / 首頁型項 / 目錄或分類型項 / PDF / 題目樣式(含問號) / 含舊約新約分組鍵`

- `equiptoserve`：`38 / 2600 / 424 / 0 / 0 / 0 / 2397 / 25`  
  - 題目樣式看似很好，但舊 URL 大量重覆且失效風險高，是目前最大阻塞。
- `defendinginerrancy`：`66 / 2861 / 787 / 0 / 0 / 0 / 2861 / 2`  
  - 可直接作為 A 類骨幹。
- `gotquestions`：`35 / 93 / 78 / 4 / 0 / 0 / 31 / 0`  
  - 混入口頁比例偏高（需白名單化）。
- `christiananswers(英)`：`1 / 98 / 65 / 45 / 21 / 0 / 11 / 0`  
  - 幾乎是入口/目錄資料，不可直接當題庫。
- `biblequestions`：`1 / 48 / 25 / 0 / 19 / 14 / 8 / 0`  
  - 索引與 PDF 佔比高，不宜當書卷問答庫。

---

## 目前阻塞點（必先解）

1. **以斯拉舊路徑大面積失效**  
   - 要做 `old -> new` 映射，至少先做到「卷級導向」。

2. **Christian Answers 多語缺本地題庫**  
   - 目前只是首頁 iframe，不是 sidebar 題目樹。

3. **GotQuestions / Bible Questions / Reformed 混目錄頁**  
   - 要做 URL 白名單策略，否則「一按即到」不成立。

---

## 下一步改功能（將立即執行的順序）

1. **能力標記（source capability）**  
   - `book-ready`: Defending, 華人護教, 蘇佐揚 NT, 李道生 OT, ccbiblestudy  
   - `topic-ready`: Reformed, Bible Questions, 陳終道/卷二/讀經深思  
   - `needs-curation`: Christian Answers（英/繁中/印尼/越南）, 以斯拉背景系列

2. **先修可見體驗**
   - 以斯拉來源：先卷級 fallback 到新站卷目錄（避免 404）
   - sidebar 對 `book-ready` 來源只顯示可用分組與可點題目

3. **再補資料**
   - 建 `CA_*_curated.json`
   - 重抓 GotQuestions（只收文章頁）

---

## 結論（給你先看）

- 你的判斷是對的：目前只有少數來源達到「小白一按即看」標準。  
- 第一優先不是 UI，而是 **URL 可達性 + 資料分層純度**。  
- 我下一步會按本報告直接改功能，不再先做介面微調。

