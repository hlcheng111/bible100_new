# 教材與培訓 · Cleanup Wave 範本（V1）

**版本：** 2026-08-05  
**適用模組：** `languages/`（百步／四寶／多語）+ `disciple_dynamics/`（門訓動力站／無愧工人）  
**頂欄 mode：** `material`（教材與培訓）  
**原則：** 夾名不改 · 路徑＝永久 ID · 新檔先進登記 · 硬刪禁止 · 上云窗口不改路徑  

> 本檔是 **cleanup wave 範本**：他模組可照抄結構，只換 moduleId 與 LIVE 閉包來源。

---

## 0. 一分鐘摘要

| 問題 | 解法 |
|------|------|
| 夾名不能改 | 物理路徑凍結；用 Alias／curriculum 登記表當邏輯 ID |
| 圖要多語共用 | **預設共用** `languages/images/`（舊）或 `languages/media/`（新）；語專才進 `{lang}/media/` |
| chapter 有檔名未完工 | 標 `status: named_todo`，**保留檔**，不刪、不改名 |
| DD 未歸屬 | **不搬進 languages**；掛入 `material` mode + 路線圖一站 |
| 跨模互連 | 課元預留 `deepLinks` 欄位；內容 SSOT ≠ 人／進度 SSOT |

**最小系統化交付（本波已做／對照）：**

1. Alias／課元登記 → `config/locale_manifest.json`（擴充既有空檔，不另開 curriculum 新檔）  
2. 媒體規則 + 少數示例 → `languages/MEDIA_STRUCTURE.md` + `languages/media_registry.json`  
3. modes 掛 DD → `config/modes.json`  
4. 教材地圖 → `languages/_landing/home.html` + `js/b100_nav_ssot.js`（S5 門訓動力）  
5. manifest 波次 → `config/module_manifest.json`

---

## 1. 產品邊界（兩棵樹，一個頂欄）

```
頂欄「教材與培訓」 material
├── languages/          聖經動作版 · 100 步 · 四寶 · 多語（母本 cn）
└── disciple_dynamics/  門訓動力站 · 無愧工人培訓（繁中為主 · 不搬夾）
```

| | languages | disciple_dynamics |
|--|-----------|-------------------|
| 正式名 | 語言教材／百步四寶 | 門訓動力站 |
| Hub 內容 | `languages/_landing/home.html` | `disciple_dynamics/dashboard.html` |
| 側欄 | `languages/index_{lang}.html` | `disciple_dynamics/sidebar.html` |
| 與 CM-C | 深鏈教材 | 深鏈教材；**名冊不雙寫** |
| 上云 | HTML 可傳；大圖／PDF 看 exclude | `disciple_d text/` PDF 通常排除 |

---

## 2. 媒體：夾怎定、名怎取（不亂開新夾）

### 2.1 決策表（貼圖前先問）

| 問題 | 是 → | 否 → |
|------|------|------|
| 多語課頁會共用同一張圖？ | **共用**：`languages/media/{type}/…`（新）或沿用 `languages/images/…`（舊，凍結） | 語專：`languages/{lang}/media/{type}/…` |
| 是否已有舊路徑被章節引用？ | **不搬**；在 `media_registry.json` 加 alias | 新檔才進上述白名單夾 |
| 是否影片／PDF／大檔？ | `media/video|pdf|…`；上云進 exclude | 小圖可進 images／media |

**禁止：** 為「整理好看」新建第三套圖片根夾；禁止把共用圖複製進每個語言夾。

### 2.2 舊圖 vs 新圖

| 種類 | 做法 |
|------|------|
| 已存在的 `image001.gif`、`image_OT/`… | **路徑凍結**；需要時在 `media_registry` 登記 `mediaId → path` |
| 新圖 | 檔名：`{track}_{unit}_{role}.ext`（例：`OT1_ch01_map.jpg`、`T4_armor_overview.png`） |
| 語專疊字圖（僅越文標籤） | `languages/vi/media/images/…`，registry `langs.vi` 覆蓋 `general` |

查詢優先（已寫在 `MEDIA_STRUCTURE.md`）：

1. `{lang}/media/`  
2. `media/`  
3. `images/`（legacy 共用）

### 2.3 Alias（媒體）

SSOT 檔：**既有** `languages/media_registry.json`（勿另開）。  
`mediaId` 穩定；頁面日後可改 `data-media-id`，路徑只改登記表。

---

## 3. 課元 Alias（路徑凍結）

SSOT 檔：**既有** `config/locale_manifest.json`（擴充為課元／語言追蹤，勿另開 curriculum 新檔）。

建議欄位：

| 欄位 | 說明 |
|------|------|
| `id` | 邏輯 ID，例 `lang.cn.ot.ch01`、`dd.c.doctrine_basics` |
| `path` | 永久相對路徑（夾名不改） |
| `lang` | `cn`／`zh-Hant`／`en`… |
| `track` | `OT`／`NT`／`T4`／`DD`／`advance` |
| `canonicalId` | 小語種指向中文母本 id |
| `status` | `live`／`named_todo`／`draft_mt`／`legacy_alias`／`archive` |
| `deepLinks` | 可選：`bibleStudy`／`qna`／`ai`／`school`／`cmC` |

### 3.1 chapter「有檔名、未完工」

- **保留檔名與路徑**（未來要做好的課）。  
- 登記 `status: named_todo`。  
- 側欄可鏈到檔；頁內可標「建設中」，**不要刪、不要改名等內容做好再改**。

### 3.2 根夾 cleanup（languages 樣板）

| 根上保留 | 處理 |
|----------|------|
| `index*.html`、`_landing/`、`ot|nt|t4_landing*.html` | LIVE 入口 |
| `cn|en|…/`、`media/`、`images/`、`js/`、`data/` | 正文／資源 |
| `MEDIA_STRUCTURE.md`、`media_registry.json` | 契約 |
| `index - 複製.html`、過時實驗 | → `languages/_archive/`（本波可不搬，只列清單） |
| `landP_*`／`lang_*` | 標 `legacy_alias`；確認無主鏈後再 archive |

**硬刪禁止** → `_archive/`。

---

## 4. 門訓動力站（本波焦點）

### 4.1 怎麼「做好」歸屬（不搬家）

1. `modes.json` → `material.moduleIds` 含 `disciple_dynamics`  
2. 頂欄2 增加「門訓動力」→ `sidebar` + `dashboard.html`  
3. 路線圖 S5 → 雙欄切到 DD 側欄＋總覽  
4. `modules.json` 已有 DD 條目則對齊即可  
5. dashboard 錨點：`#wuqian`（無愧工人）、`#resource`、`#notebooklm` 維持  

### 4.2 驗收（file://）

1. 開 `file:///C:/Users/hlche/.cursor/bible100_new/index_v5.html`，Ctrl+F5  
2. 頂欄「教材與培訓」→ 右欄路線圖見 **門訓動力／無愧工人**  
3. 點入後：左欄＝DD 側欄，右欄＝`dashboard.html`  
4. 點 `#wuqian` 可見無愧工人官網說明  
5. 直開 `disciple_dynamics/dashboard.html` 仍可用（Standalone）

### 4.3 與無愧工人官網

- 外部官網：dashboard 內連結保留（權威教材品牌）。  
- 本站：C–G landing + PDF（`disciple_d text/`）＝本地培訓桌面。  
- 上云：PDF 大檔預設 exclude；HTML landing 上傳。

---

## 5. 跨模預備（欄位先占，不必一次做完）

| 他模 | 教材側 | 他模側 |
|------|--------|--------|
| Bible Study | `deepLinks.bibleStudy` 經文參 | iframe／module 深鏈，不寫教材正文 |
| Q&A | `qnaTags` | 題庫 id 對齊 |
| AI | `promptContext` 路徑 | Lab 草稿須人審 |
| School | `schoolCourseId` | 進度在 SCH，正文在 material |
| CM-C | 選課深鏈 | roster／member_id 只在 CM |

---

## 6. 波次與時段

| 時機 | 做 | 不做 |
|------|----|------|
| 本波（最小交付） | 登記表骨架、modes 掛 DD、地圖一站 | 不搬 chapter、不 rename 圖 |
| 功能開發中 | 新課／新圖先寫 manifest／registry | 不堆 languages 根 |
| Push GitHub 前 | 排除 `_tmp`、大 PDF、data | 不借 push 大搬家 |
| 上云前 | 對照 `.deploy-exclude` | **不改路徑** |
| 下波 languages 根清理 | `_archive` 複製檔、legacy 入口 | 不同時改六語側欄結構 |

建議 manifest `cleanupWaves` 增加：**material（languages + DD 歸屬）**。

---

## 7. 他模套用本範本（複製清單）

1. 寫／更新本模組一頁治理（可抄本檔標題結構）  
2. 指定 LIVE 閉包來源（側欄或 registry）  
3. 路徑凍結 + alias 表（優先擴充既有 JSON）  
4. modes／manifest 掛入口  
5. `_landing` 或路線圖一站  
6. MIC M1–M5 + 域測  
7. file:// 驗收三步（頂欄／左欄／右欄）

---

## 8. 相關檔案

| 檔 | 角色 |
|----|------|
| `config/modes.json` | material 頂欄／DD 入口 |
| `config/modules.json` | 模組註冊 |
| `config/module_manifest.json` | 邊界＋cleanup 波次 |
| `config/locale_manifest.json` | 課元／語言 Alias |
| `languages/MEDIA_STRUCTURE.md` | 媒體夾規則 |
| `languages/media_registry.json` | 媒體 Alias |
| `languages/_landing/home.html` | 教材地圖 |
| `js/b100_nav_ssot.js` | 路線圖 SSOT（含 DD） |
| `disciple_dynamics/dashboard.html` | 門訓／無愧工人總覽 |
| `docs/governance/SITE_GOVERNANCE.md` | 全站 P0／P1 |
| `docs/governance/CROSS_MODULE_DATA_CONTRACT_V1.md` | DD vs CM-C 邊界 |
