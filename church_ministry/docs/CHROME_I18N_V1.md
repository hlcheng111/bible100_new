# 教會事工 · Chrome + Blurb 四語認路（v1）

**目標：** 任何人進來都能看懂模組結構（A–F 地圖、頂欄、今日常用）。  
**不做：** 表單欄位／CRM 內文全譯（維持中文工作區）。

## 技術設計

| 檔案 | 角色 |
|------|------|
| `js/b100_chrome_i18n.js` | 共用庫：locale、fallback、`data-i18n`、`postMessage(b100-locale)` |
| `church_ministry/js/cm_chrome_i18n_pack.js` | 教會事工文案包 |
| `church_ministry/index.html` | 頂欄語言鈕 + 套用文案 |
| `sidebar_church_layout_v1.html` | 地圖區標題／主入口四語 |
| `dashboard_church_layout_v1.html` | 首屏地圖卡 + hero／快捷 |
| `js/cm_index_shell.js` | iframe 載入帶 `?locale=`；切語重載雙欄 |

**語系：** `zh-Hant` · `en` · `vi` · `id`  
**Fallback：** `vi`／`id` 缺譯 → `en` → `zh-Hant`  
**儲存：** `localStorage.b100_ui_locale`

## 波次進度

| 波次 | 範圍 | 狀態 |
|------|------|------|
| 1 | 頂欄 + A–F 大標題 + 儀表板地圖卡 | ✅ |
| 2 | 側欄三層（L2 主入口 + L3 details/submenu） | ✅ |
| 3 | `_landing/*` 標題／導語認路 | ✅（卡片內長文仍中文） |
| 4 | `index_v5` 總站四語 | ✅（頂欄模式＋教會第二列；見 `js/hub_chrome_i18n_pack.js`） |
| 5 | 高價值非 landing 頁認路 | ✅（見下表；表單／CRM 內文仍中文） |

### 波次 5 · 已掛認路的非 landing 頁

| 頁面 | 譯什麼 |
|------|--------|
| `desks/index.html` | 15 主桌標題／導語 |
| `dashboard.html` | hero 標題／導語 |
| `dashboard_church_layout_v1.html` | 地圖卡 + hero（附英譯） |
| `vision_and_plan.html` | 願景標題／導語 |
| `roadmap-overview.html` | 路線圖標題／導語 |
| `tools/volunteer_shift/index.html` | 排班工具 hero |
| `modules/support/visitation_index.html` | 探訪桌標題／Tab |
| `modules/fellowship/index.html` | 團契入口標題／導語 |

**刻意未譯：** 各 CRM／表單欄位、長報告正文、深層工具操作說明（維持中文工作區）。

### VI／ID 附小小英譯

- 共用庫：`data-i18n-bridge="1"` → VI/ID 主文下自動附 **英文細字**（有 vi/id 譯文時也附）。
- 總站：沿用既有 `.t-zh` + `.t-en`；選 VI/ID 時主標為該語、細字為 EN。

### 新頁怎麼加（不難）

1. HTML：`data-i18n="某key"`（認路句可加 `data-i18n-bridge="1"`）  
2. 在對應 pack（`cm_chrome_i18n_pack.js` 或 `hub_chrome_i18n_pack.js`）補四語；至少 **zh + en**，vi/id 可後補（會 fallback 英並仍顯示英譯細字）  
3. 總站第二列新捷徑：在 `modes.json` 加 `labelZh`/`labelEn`，並在 `HubChromeI18nMap.PATH_KEY` 對上 path → hub key  

**驗收：** 開 `index_v5.html` → 點 **VI** → 頂欄模式鈕應為越文＋英文細字；進「教會事工」第二列 A–E 同理。

## 新建頁 SOP

1. 若是 **Landing／認路說明**：加 `data-i18n="cm.…"`，並在 `cm_chrome_i18n_pack.js` 補四語（至少 zh + en）。
2. 若是 **功能表單頁**：可只譯頁首 title／一句 lead；表單維持中文。
3. 進側欄的新連結：主入口務必加 `data-i18n`；深層 submenu 可第二波再譯。

## 測試

```powershell
python church_ministry/tests/test_cm_chrome_i18n.py
python church_ministry/tests/test_church_ministry_index_shell.py
```

## 驗收 URL

- `file:///C:/Users/hlche/.cursor/bible100_new/church_ministry/index.html`
- 或 HTTP：`http://127.0.0.1:8080/church_ministry/index.html?locale=en`
