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
| BS-01 | `comprehensive_exegesis_reader.html` | ✅🔗 | 釋經參讀；CMC iframe 為主 |
| BS-02 | `parallel_mode_v3.html` | 🔄 | 對照 v3；離線信望愛 + NIV |
| BS-03 | `search_reader.html` | 🔄 | 全文搜尋；需 HTTP + JSON |
| BS-04 | `reader.html` | 🔄 | 雙欄閱讀 |
| BS-05 | `external_bible_reader.html` | 🔗 | 越/印尼/寮/緬外站 |
| BS-06 | `_landing/versions.html` | ✅ | 版本與多語導覽 |
| BS-07 | `_landing/tools.html` | ✅ | 功能地圖（原 dashboard 卡片職責） |
| BS-09 | `data_sources.html` | ✅ | 資料綠燈 · registry 掃描 |

---

## L5 · 輔助研讀

| ID | 頁面 | 狀態 | 備註 |
|----|------|------|------|
| BS-10 | `dictionary_reader.html` | 🔄 | 詞典 UI；資料 SSOT 待 W1 |
| BS-11 | `crossref_reader.html` | 🔄 | 串珠 |
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
| BS-X06 | `data/bibles/bible_reader_final.html` | 🔄 | 舊站內閱讀器；側欄「回聖經」 |

---

## OT/NT 書卷 Landing（66 卷樹）

| 區塊 | 路徑模式 | 狀態 | 備註 |
|------|----------|------|------|
| 舊約導論 | `OT/*/index.html` | 🔄 | 靜態導讀 |
| 新約導論 | `NT/*/index.html` | 🔄 | 靜態導讀 |
| 單卷 | `OT/**/**.html`, `NT/**/**.html` | 🔄 | 非全部 wired 至資料層 |

---

## 跨模組契約

| 項目 | 狀態 | 備註 |
|------|------|------|
| `config/modules.json` path | ✅ | `bible_study/index.html` |
| `index_v5` study 模式 | ✅ | 右欄內容頁，非 L0 殼 |
| 教會 C 側欄跨模組 | ✅ | `data-b100-content` → 釋經參讀 |
| 與 `qna/` 同章節深連 | 📦 | W3 規劃 |
| 與 `ai_tools/` 同上下文 Prompt | 📦 | W3 規劃 |

---

## W1 已完成（2026-07-26）

- [x] `js/bible_version_registry.js` 譯本／註釋 SSOT
- [x] `BibleEngine.js` 合併原 universal-data-loader 能力
- [x] `universal-data-loader.js` 改為薄相容層
- [x] `data_sources.html` 資料綠燈 UI

## W2 起待填
- [ ] clean 越/印尼 JSON 接入 parallel v3
- [ ] 細編號 BS-01～BS-99 與 `SITE_PAGE_REGISTRY_V1.md` 同步
