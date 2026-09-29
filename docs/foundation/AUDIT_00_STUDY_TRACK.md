# AUDIT_00 · 研讀＋跑道閱讀閉環

**日期**：2026-09-29  
**執行者**：Agent（Foundation 0 · A 類）  
**改碼**：**否**（本輪只盤點）  
**對照**：`01_PLATFORM_CHARTER` · `02_SCRIPTURE_LINK_SPEC` · `03_DATA_STORAGE_SPEC` · `ACCEPTANCE_GATES` §樣板期

---

## A. 模組使命

幫助初信與帶領者：從跑道或研讀地圖進入 → 讀到經文 → 打卡 → 可進 OIA 或難題 → 能回原進度；**不取代**牧者與嚴謹釋經。

| 項 | 值 |
|----|-----|
| 技能包 | **A**（經文教學） |
| 風險級 | **R0–R1**（公開經文 + 私人進度／OIA 草稿） |

---

## B. 事實盤點（只讀）

| 項 | 路徑／證據 | 備註 |
|----|------------|------|
| 研讀預設入口 | `config/modes.json` → `bible_study/workbench.html` | 總站 study 右欄預設工作台，非跑道 |
| 跑道 landing | `bible_app/shell/pages/landing.html` + `landing_tracks.js` | 「怎麼用」已收 3 步＋OIA／難題捷徑 |
| 五線 | `track-30day` / `golden` / `theme` / `plan1y` / `plan3y` | 側欄 `bible_study/sidebar.html` 有對應鏈 |
| 閱讀器 | `reader-multilang.html` + `reader_multilang.js` / `bible_reader_core.js` | 賽道經 `page_links.bibleReadUrl` 帶入 |
| 打卡頁 | `read-done.html` | 寫進度並給 OIA／AI 工具卡 |
| OIA | `bible_study/oia/index.html` | 讀 `book/chapter/verse/ref/locale/source`；可回退 `bible100_study_last` |
| 難題 | `qna/index.html`；跑道側另有 `ai-qna.html` + `ai_qna_hub.js` | Hub 可組 `book` 進題庫桌 |
| 側欄深讀 | `sidebar.html`「讀完 → OIA／難題」 | **靜態 href，不帶當前書卷** |

### 參數現況（對照 02 · Canonical）

| Canonical 欄 | 現況 | 證據 |
|--------------|------|------|
| `book` | **有**，多為**數字 id**；OIA 可經 `B100LessonContext` 映射 | `page_links.js` L31；`oia/index.html` L403–406 |
| `chapter` | **有** | 同上 |
| `locale` | **有** | `page_links` / `read-done` → OIA |
| `verse` | 選填，賽道／打卡可帶 | `page_links`；`read-done` L141 |
| `ref` | 打卡→OIA 有帶入 | `read-done` L139–140 |
| `translation` | **無**統一參數 | 未證實有跨頁 `translation=` |
| `from` | 實際用 **`source=`**（如 `track`） | `read-done` L139；OIA L413 |
| `return_to` | **無** | OIA／難題頁未見白名單回程參數 |
| `track` / `day` / `gv` / `theme` | Legacy 跑道專用，閱讀器有 | `page_links.js` L33–37 |

**結論（已有／增量）**：Legacy 閉環「賽道→讀→打卡→OIA（帶 book）」**半通**；Canonical 的 `return_to`／`translation`／統一 `from` 屬**增量未落地**。

### Storage 現況（對照 03）

| 現用 key | 模組 | 內容 | PII？ | R | 目標 key（尚未遷移） |
|----------|------|------|-------|---|----------------------|
| `bible100_read_progress_v1` | track | 星星／連續／done／log | 否 | R1 | `b100:v1:route:progress` |
| `bible_shell_state` | shell | 含 `bibleView` 等 | 否 | R1 | （拆偏好後再定） |
| `bible100_oia_draft` | oia | OIA 草稿 | 否（私人筆記） | R1 | `b100:v1:study:oia_draft` |
| `bible100_study_last` | study/oia | 最近書章 | 否 | R1 | `b100:v1:study:last_ref` |

**禁止本輪 rename**（規格已寫明）。

### 語系／空狀態

| 現象 | 證據 |
|------|------|
| 多語閱讀器空狀態仍有**簡體** | `reader_multilang.js`：「请至少选择一种译本」「本章暂无经文」 |
| 一年頁規則／標題本輪已改繁＋落後可續 | `track-plan1y.html`、`track_plan.js`（產品波，非本 AUDIT 改碼） |

### 讀者頁技術雜訊

| 現象 | 證據 | 判斷 |
|------|------|------|
| 核心含 SQLite／wasm 載入 | `bible_reader_core.js` | 載入路徑存在；**未證實**一般讀者主畫面常駐「健康／同步佇列」條。若出現，應進診斷頁（憲章 §6）。 |

### 手機

Landing／賽道頁有 viewport；窄屏閱讀器譯本列刻意不藏抽屜（`reader_multilang.js` 註解）。**完整實機手勢未在本輪手工點測** → 標「未證實」。

---

## C. 斷點清單

| ID | 現象 | 小白影響 | 證據路徑 | 嚴重度 |
|----|------|----------|----------|--------|
| **D1** | Landing／側欄「OIA／難題」**不帶當前書章**；只有打卡後 OIA 卡才帶入 | 從「怎麼用」點進去常空白或靠 `study_last` 猜 | `landing_tracks.js` howHtml；`sidebar.html`；對照 `read-done.html` L139–142 | **高** |
| **D2** | OIA／難題**無 `return_to`**；打卡頁雖有回讀／回賽道，深入後易迷路 | 讀完深讀後不知道怎麼回三十日／一年 | OIA 無 `return_to`；`read-done` 僅本頁有 `backTrack` | **高** |
| **D3** | 打卡後工具卡仍偏 **AI／舊牧養問答**；題庫桌 `qna` 非第一張必經卡 | 「讀完→難題」心智與畫面不一致 | `bridge.js` readDone tools；`read-done` 先插 OIA 再 render AI 卡 | **中** |
| **D4** | 閱讀器空狀態簡體＋「暫无」不夠像「本機無此譯本／章」 | file:// 缺資料時以為網站壞了 | `reader_multilang.js` L718、L729 | **中** |
| **D5** | 總站 study 預設 **workbench**，跑道是側欄／頂欄 2 另進 | 小白以為「研經＝跑道」會對不齊 | `modes.json` defaultEntry | **低**（產品已定，標認知差） |
| **D6** | `book` 數字 id 與中文書名兩套並存 | 跨模偶發對不上（OIA 有 mapper 緩和） | `page_links` vs 釋經 `book=創世記` | **中**（adapter 期可接受） |

---

## D. 目標旅程（樣板只做第 1 條）

1. **主閉環（本 AUDIT）**：尋寶地圖 → 選線 → 讀一小段 → 打卡 → OIA 或難題（帶同一書章）→ 回賽道／回讀。  
2. 工作台選章 → 釋經／OIA（既有 `bible100_study_last`）。  
3. 多語對照深讀（次要）。

本輪只鎖定 **第 1 條**。

---

## E. 資料與權限

| 物件 | 建立 | 讀 | 改 | 刪 | 保存 | 匯出 | 敏感 |
|------|------|----|----|----|------|------|------|
| 讀經進度 | 本機打卡 | 本機 | 本機 | 清 LS | 長期本機 | 未見正式匯出 UI（未證實） | 否 |
| OIA 草稿 | 使用者 | 本機 | 本機 | 清／覆寫 | 本機 | 頁內匯出／列印 | 私人筆記 |
| 最近書章 | 工作台／阅读 | OIA 回退讀 | 覆寫 | 清 LS | 本機 | 無 | 否 |

---

## F. 最小改造範圍（**須另下產品口令**才做）

**建議做（下一刀）：**

1. `read-done` → OIA／難題 補 `return_to`（白名單：當前 track 頁或 `landing.html`）。  
2. OIA（及難題若可）頂欄加「← 回跑道／回今日」讀取 `return_to`。  
3. 閱讀器空狀態改繁中人話：「本機沒有這一章／此譯本」。

**刻意不做：**

- 視覺大翻、第六賽道、PWA、帳號  
- 全站 localStorage rename  
- 一次改完所有 `book` 為 Gen 代碼  
- 地理接書卷、資料地圖編號（另案）

---

## G. 樣板驗收對照（現況自评）

| 門檻 | 現況 |
|------|------|
| 深連結帶 `book/chapter/locale` 走通地圖→讀→打卡→OIA | **打卡→OIA：通**；Landing／側欄捷徑：**不通書章** |
| 能回原進度 | **打卡頁可回**；OIA 內：**弱** |
| 空白章有明確本機缺資料文案 | **半**（有空狀態，簡體且語意偏弱） |
| 不新增 R3、不接 AI API | **符合**（本輪未改碼） |

手工 `file://` 全路徑點測：**本輪以靜態證據為主，實機點測列為下一刀驗收**。

---

## 已有／增量／衝突

| 主題 | 狀態 |
|------|------|
| Hub／側欄導覽 | 已有 · UNIFIED_NAVIGATION |
| 打卡→OIA 帶 book | **已有**（半閉環） |
| `return_to` 白名單 | **增量未做** |
| `b100:v1:*` storage | **增量規格，未遷移** |
| 與 PRODUCT_CONSTITUTION | **無衝突**；樣板選 A 類正確 |

---

## 建議下一刀產品口令（一句）

```
執行閉環補丁：只改 read-done→OIA／難題 的 return_to＋OIA 返回鈕＋reader_multilang 空狀態繁中人話；不做 storage rename、不做第六賽道。
```

驗收：`file://…/index.html` → 研經 → 跑道 → 三十日讀一關打卡 → OIA 見書章 → 一鍵回三十日；缺經文時見「本機沒有…」繁中句。
