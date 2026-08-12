# 聖經研讀 · 頁面成熟度（BS）

> **波次**：BS-W0 骨架（2026-07-26）  
> **Standalone 入口**：`bible_study/index.html`（`dashboard.html` → redirect）  
> **總站 Hub**：左 `sidebar.html` + 右內容頁（不載入 `index.html`）  
> **前綴**：BS（細編號待 W1 起逐頁填）

## 成熟度圖例

| 標記 | 含義 |
|------|------|
| **L0** | 模組殼 / Standalone 入口 |
| **L3** | 側欄片段 |
| **L5** | 單一功能子頁 |
| ✅ | 可用（有已知限制） |
| 🔄 | 發展中 / 資料依賴 |
| 🧪 | 實驗 / 勿入主線導覽 |
| 🔗 | 外站嵌入 |
| 📦 | 占位 / 假資料 |

---

## L0 · 模組殼

| ID | 頁面 | 狀態 | 備註 |
|----|------|------|------|
| BS-L0-01 | `index.html` | ✅ | Standalone 唯一入口；Topbar 三模式 + State.js |
| BS-L0-02 | `dashboard.html` | ✅ | 僅 redirect → `index.html` |
| BS-L0-03 | `sidebar.html` | ✅ | `data-b100-nav="content"`；總站 / Standalone 共用 |

---

## L5 · 主線功能（Topbar / 側欄曝光）

| ID | 頁面 | 狀態 | 備註 |
|----|------|------|------|
| BS-01 | `comprehensive_exegesis_reader.html` | ✅ | 本地綜合解讀優先；CMC fallback |
| BS-02 | `parallel_mode_v3.html` | ✅ | registry + 章節懶載入；嵌入式 .js 仍可用 |
| BS-03 | `search_reader.html` | ✅ | registry 驅動搜尋；BibleEngine 懶載入 JSON |
| BS-04 | `reader.html` | ✅ | 主閱讀器（取代 bible_reader_final） |
| BS-05 | `external_bible_reader.html` | 🔗 | 越/印尼/寮/緬外站 |
| BS-06 | `_landing/versions.html` | ✅ | 版本與多語導覽 |
| BS-07 | `_landing/tools.html` | ✅ | 功能地圖（原 dashboard 卡片職責） |
| BS-09 | `data_sources.html` | ✅ | 資料綠燈 · registry 掃描 |

---

## L5 · 輔助研讀

| ID | 頁面 | 狀態 | 備註 |
|----|------|------|------|
| BS-10 | `dictionary_reader.html` | ✅ | H4：registry SSOT（`bible_dict`）；釋義加密待解（見 BS_H4_REPORT） |
| BS-11 | `crossref_reader.html` | ✅ | H4：registry keys `faith_crossref`/`cuv_crossref`；創1:1 實測 59 引用 |
| BS-12 | `original_text_real_integrated.html` | 🔄 | 原文 / Strong |
| BS-13 | `timeline_viewer.html` | 🔄 | 時間軸 |
| BS-14 | `commentaries/_landing.html` | 🔄 | 註釋導覽 |

---

## L5 · 實驗 / 收斂候選（W0 不曝光主線）

| ID | 頁面 | 狀態 | 備註 |
|----|------|------|------|
| BS-X01 | `parallel_mode_v2.html` | 🧪 | 轉址 v3 |
| BS-X02 | `unified_bible_reader.html` | 🧪 | |
| BS-X03 | `refined_bible_reader.html` | 🧪 | |
| BS-X04 | `simple-exegesis-reader.html` | 🧪 | |
| BS-X05 | `favorites_reader.html` | 📦 | 收藏占位 |
| BS-X06 | `data/bibles/bible_reader_final.html` | 🧪 | **@deprecated** redirect → `reader.html`；legacy 備份 `.legacy.html` |

---

## OT/NT 書卷 Landing（66 卷樹）

| 區塊 | 路徑模式 | 狀態 | 備註 |
|------|----------|------|------|
| 舊約導論 | `OT/*/index.html` | ✅ | H2：reader 深鏈 + 分類捷徑 |
| 新約導論 | `NT/*/index.html` | ✅ | H2：reader 深鏈 + 分類捷徑 |
| 單卷 | `OT/**/**.html`, `NT/**/**.html` | ✅ | 66 卷 landing 含章節→`reader.html?book=&chapter=` |

---

## 跨模組契約

| 項目 | 狀態 | 備註 |
|------|------|------|
| `config/modules.json` path | ✅ | `bible_study/index.html`（Standalone L0） |
| `index_v5` study 模式 | ✅ | 右欄內容頁，非 L0 殼 |
| Hub 跑道內容 | ✅ | `bible_app/shell/index.html`（非第七大模組；不嵌 `bible_study/index.html`） |
| `b100_module_nav_ssot` study.`track` | ✅ | SITE-7：頂欄「跑道」→ shell |
| 教會 C 側欄跨模組 | ✅ | `data-b100-content` → 釋經參讀 |
| 與 `qna/` 同章節深連 | ✅ | `BS_QnaBridge` + 頂欄／釋經／對照 |
| 與 `ai_tools/` 同上下文 Prompt | ✅ | `BS_PromptBuilder` 複製 UI（無 API） |

---

## W1 已完成（2026-07-26）

- [x] `js/bible_version_registry.js` 譯本／註釋 SSOT
- [x] `BibleEngine.js` 合併原 universal-data-loader 能力
- [x] `universal-data-loader.js` 改為薄相容層
- [x] `data_sources.html` 資料綠燈 UI

## W2 已完成（2026-07-26 · BS-W2-lite + BS-W2）

- [x] `js/bible_lazy_chapter.js` 章節懶載入 + `searchBible`
- [x] `parallel_mode_v3.html` 接入 registry / BibleEngine
- [x] `search_reader.html` 接入 registry / BibleEngine
- [x] `comprehensive_exegesis_reader.html` 本地綜合解讀優先 → CMC fallback
- [x] `docs/PROMPT_TEMPLATES_P3.md` AI Prompt 模板規格（無 API）

## W3 已完成（2026-07-26）

- [x] `js/bs_prompt_builder.js` + 釋經／對照／reader Prompt 複製 UI
- [x] `js/bs_qna_bridge.js` + `qna/index.html?book=&chapter=&q=` 深連
- [x] `js/bs_study_chrome.js` State 同步 + 共用工具列
- [x] `reader.html` registry 懶載入收斂（主閱讀器）
- [x] `index.html` StudyState ↔ 頂欄位置 / URL / 搜尋聯動
- [x] `SITE_PAGE_REGISTRY_V1.md` BS 前綴狀態同步

## W3 驗收／後續（見 `bible_study/docs/BS_W3_ACCEPTANCE.md`）

- [ ] 越/印尼 parallel 實機（需 `data/bibles/clean/`）
- [x] 六語 ↔ `languages/` 文案對齊（`languagesHub` + 版本中心）
- [x] 全站 W3 行為統一掃描（`tests/test_w3_navigation_scan.py`）
- [x] FTS 索引（`bible_fts.js` + 可選 `scripts/build_bible_fts_index.py`）
- [x] SITE-7：跑道區從 tools 拆出；`b100_module_nav_ssot` study.`track` → `bible_app/shell/index.html`

## W4 已完成（2026-07-26 · D1B–D5A）

- [x] Topbar 任務文案（讀經文／看註釋／比譯本／同章難題／全部工具）
- [x] Topbar `📋 備課包`（`copyLessonPack`）
- [x] 資料 chip + 釋經 CMC 橫幅 + 父殼 ☁️ 提示
- [x] 📡 資料移入全部工具 + `_landing/tools.html` 綠燈卡片
- [x] 牧長／工程模式（localStorage + 選單切換）
- [x] debug footer（`bs_page_registry.js` + `?debug=1`）
- [x] `docs/FOUR_IDENTITY_UI_BS.md` 決策記錄

## W5 已完成（2026-07-26）

- [x] `bible_reader_final` → `reader.html`（全站連結 + redirect stub）
- [x] `languagesHub` 六語 SSOT + `_landing/versions.html` Hub 列
- [x] `js/bible_fts.js` FTS-lite + `search_reader.html`
- [x] `tests/test_w3_navigation_scan.py` + `docs/BS_W5_REPORT.md`

## W6 起待填

- [ ] 可選：`tests/test_bs_hub_paths.py`（跑道／釋經 Hub 路徑 smoke）
- [ ] 側欄 focus 細部 polish（非阻塞）

## H2 已完成（2026-07-26 · 66 卷 wired）

- [x] `data/bible_books_66.json` 66 卷 SSOT（id/name/chapters/category）
- [x] `scripts/wire_ot_nt_to_reader.py` 批量注入 `reader.html` 深鏈（冪等）
- [x] 66 書卷 landing + 10 分類 index + OT/NT 根 index（76 檔）
- [x] `tests/test_ot_nt_reader_wire.py`

