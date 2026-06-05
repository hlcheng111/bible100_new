# Bible100 模組地圖（config 驅動）

總站殼：`index_v5.html`（雙 iframe）+ `js/index_v5_shell.js`（`Bible100Shell`）。

## 設定檔

| 檔案 | 用途 |
|------|------|
| `config/modules.json` | 模組 id → `path` / `sidebar` |
| `config/modes.json` | 頂欄模式、第二列捷徑、`defaultEntry` / `loader` |
| `config/languages.json` | 語言軌（material 第二列） |
| `js/config-loader.js` | fetch 或 `file://` 時讀 `js/config-embedded.js` |

## 模式（modes.json）

| id | 第一列 | 第二列 | 預設載入 |
|----|--------|--------|----------|
| `material` | 教材與培訓 | 語言分組（`language-groups`） | `languages` 模組 |
| `study` | 聖經研讀 | 版本／對照／釋經等捷徑 | `bible_study` |
| `qna` | 聖經難題 Q&A | （隱藏） | `loader: qna-v2` → 四層 V2 |
| `church` | 教會事工 | 事工／規劃／詩歌等 | `church_ministry/index.html`（embed） |
| `school` | 學校管理 | 完課登記等 | `school_management/index.html`（embed） |
| `ai` | AI 輔助 | Lab／智慧事奉 | `ai_lab_landing` + `sidebar_lab` |

## 模組（modules.json）

| id | 內容區 | 側欄 |
|----|--------|------|
| `languages` | `languages/landP_cn.html` | `languages/index_cn.html` |
| `bible_study` | `bible_study/dashboard.html` | `bible_study/sidebar.html` |
| `qna` | `qna/qna_landing.htm` | — |
| `church_ministry` | `church_ministry/dashboard.html` | `church_ministry/sidebar.html` |
| `school_management` | `school_management/dashboard.html` | `school_management/sidebar.html` |
| `ai_tools` | `ai_tools/dashboard.html` | `ai_tools/sidebar.html` |
| `smart_ministry` | `smart_ministry/...` | `smart_ministry/sidebar.html` |
| `hymn_management` | `hymn_management/dashboard.html` | `hymn_management/sidebar.html` |
| `disciple_dynamics` | `disciple_dynamics/dashboard.html` | `disciple_dynamics/sidebar.html` |
| `nav_hub` | `nav_hub/dashboard.html` | `nav_hub/sidebar.html` |
| `congregation` | 會眾入口 | 會眾側欄 |

## 本機測試

- 雙擊 `index.html` 或 `開啟 Bible100.bat`（`file://`）
- 改版 config 後執行：`node scripts/generate_config_embedded.js`
- 驗證：`node scripts/validate_shell_config.js`
