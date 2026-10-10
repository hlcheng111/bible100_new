# 聖詩影音庫 · 改修策（決策版）

> 位子：**使用聖詩**工具。不取代找聖詩曲譜表。  
> 頁：`ai_youtube_music_library_ai_parser_ironclad_153_proof_edition.html`  
> 儲存：`js/yt_sacred_store.js` · 對名：`js/yt_sacred_match.js`  
> **不接 YouTube Data API。本機優先；上雲另談。**

## 決策（已定）

1. Phase B：章節 bulk＋對站內歌名＋可匯出契約；不接 API。  
2. 1k／1 萬先 IndexedDB＋分頁，再灌量。  
3. 對歌名＝建議＋**人確認**才正式。  
4. 模組主位「使用聖詩」；找／研究只讀「已確認」捷徑。  
5. 雲端非預設。  
6. **字典改誠實／預設只用章節**（2026-10-10）：內建假時間軸預設關閉；主路徑＝章節 bulk／yt-dlp。  
7. **已核對真 TRACKLIST**（2026-10-10）：`js/yt_verified_tracklists.js`（yt-dlp 官方章節）；頁面「一鍵填入並分析入庫（10 址）」；無章節＝真片名整片占位；**OCR 維持未接**。  
8. **體驗／閉環優先序**（2026-10-10）：  
   1. 手機卡片＋觸控（&lt;768px 卡片；聽／收藏 ≥44px）  
   2. 灌庫 → 對歌名確認 → 側欄找聖詩「也可聽」  
   3. 節期／異本掛主資料（`HYMN_AXES`＋`hymn_main_meta_bridge.js`）；影音庫只消費  
   4. 搜尋索引／虛擬滾動：**萬筆痛點再做**（現維持分頁；可選每頁 100）  
   5. AI Prompt（組曲／故事）只掛**已確認**曲目；草稿須人審  

## 資料來源標記 `source`

| 值 | 意義 | 總表 | 對歌名 |
|----|------|------|--------|
| `chapter` | 章節 bulk 貼上 | 可信 | 可 |
| `ytdlp` | yt-dlp JSON chapters | 可信 | 可 |
| `import` | 契約 JSON 匯入 | 可信 | 可 |
| `url_stub` | 只登記網址／整片 00:00 | 占位 | 可（歌名弱） |
| `dictionary` | 示範假字典 | 紅底警告 | **不可** |
| `legacy` | 舊資料無標記 | 警告 | **不可** |
| `memo` | 譜圖備忘 | 備註 | 不可 |

## 契約 JSON（schema_version 3）

含 `tracks[].source` 與 `hymn_match_status`。見頁頂「匯出」。

## 使用順序（小白）

1. 開頁會**自動清掉 ⚠ 假資料**（不會清空你貼過的真章節）。  
2. 左欄：貼章節或「一鍵填入已核對真 TRACKLIST」→ 入庫。  
3. 「對歌名」確認站內 id → 側欄搜該詩會出現「也可聽」。  
4. 點曲名或「聽／看」→ 真 YouTube 該秒；Excel 可匯出連結。  
5. （可選）複製左欄 AI 組曲／故事 Prompt → 貼外部 AI；人審後再用。  

進階（yt-dlp／只登記網址／備忘）收在左欄「進階」。  
**暫不另開 `hymn_library/` 模組夾**；萬首用本機 IndexedDB＋CSV／JSON 匯出；入口仍在「使用聖詩」。

## 效能門檻（先記下，不先做）

| 量級 | 做法 |
|------|------|
| ～1 千 | 現況分頁即可 |
| ～1 萬 | 仍以 IndexedDB＋分頁；必要時加輕量索引（titleNorm） |
| ～10 萬 | 再評估 Virtual Scroll／Worker |

## 波次

| 波次 | 內容 | 狀態 |
|------|------|------|
| A | 外連聽看、同名、入口 | 完成 |
| B | IndexedDB、契約、章節 bulk、對名 | 完成 |
| B′ | 字典誠實、source、真 TRACKLIST、OCR 未接 | 完成 |
| C | 手機卡片、也可聽閉環、節期消費、AI Prompt | **本輪** |
| D | 萬筆搜尋索引／虛擬滾動 | 痛點再做 |
