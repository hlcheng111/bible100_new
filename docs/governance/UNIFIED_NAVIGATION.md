# Bible100 統一導航法則（UNIFIED_NAVIGATION）

> **目的**：避免各模組「各師各法」導致 iframe 災情（右欄載入側欄、殼中殼、左欄不換、Tab 與側欄重複）。
>
> **實作**：`js/sidebar_behavior.js`（`data-b100-nav`）+ `js/shell_nav.js`（`bible100ShellNav`）
>
> **範本側欄**：`church_ministry/sidebar_c_education_journey.html`

## 一句話

**殼只換框；側欄只指路；Tab 只切任務；跨框一律走契約 API。**

## 導覽層級（L0–L5）

| 層 | 職責 | 範例 |
|----|------|------|
| L1 | 總站 Hub | `index_v5.html` 頂欄切大模組 |
| L0 | 模組 Standalone 殼 | `church_ministry/index.html` |
| L3 | 雙欄 | `sidebarFrame` + `contentFrame` |
| L4 | 工作桌 Tab 殼 | `education-integrated.html` |
| L5 | 單一功能子頁 | `edu_roster.html` |

Hub 進 C 區：

```
index_v5
├── sidebarFrame → church_ministry/sidebar_c_education_journey.html
└── contentFrame → church_ministry/modules/education/education-integrated.html
```

**禁止** Hub 右欄載入模組 `index.html`（殼中殼）。

## 四種導航模式

| 模式 | `data-b100-nav` | 行為 | 典型用途 |
|------|-----------------|------|----------|
| NAV-CONTENT | `content` | 只換右欄 | 同模組內頁、門訓、主日學 |
| NAV-MODULE | `module` | 左+右雙欄 | 聖經、學校、AI、CRM |
| NAV-TAB | （在 L4 內，不用側欄） | Tab 切子 iframe | education 5 Tab |
| NAV-EXIT | `target="_blank"` | 新分頁 | 外部 https |

## HTML 寫法（標準）

### 只換右欄（NAV-CONTENT）

```html
<a href="modules/education/education-integrated.html#tab-guide"
   data-b100-nav="content">主日學工作桌</a>
```

- `href`：**相對於側欄檔**的路徑
- 必載：`shell_nav.js` + `sidebar_behavior.js`

### 換模組雙欄（NAV-MODULE）

```html
<a href="../bible_study/dashboard.html?lang=CN"
   data-b100-nav="module"
   data-b100-sidebar="bible_study/sidebar.html"
   data-b100-content="bible_study/dashboard.html?lang=CN">聖經教材</a>
```

- `href`：右欄降級路徑（無 JS 時仍可載入內容）
- `data-b100-sidebar` / `data-b100-content`：Hub **根相對**（相對 `bible100_new/`）
- **禁止** `href="#"`、`javascript:void(0)`、inline `onclick` 混用

## 必載腳本（側欄頁）

```
sidebar_shell_target_fallback.js
shell_nav.js
sidebar_behavior.js
（教會事工 Standalone）cm_shell_paths.js
```

## postMessage 契約（勿自造新 type）

| type | 用途 |
|------|------|
| `bible100-shell` | 雙欄 `{ sidebarUrl, contentUrl }` |
| `navigate` | 只換右欄 `{ url }` |
| `bible100-sidebar-content-nav` | AI Lab 側欄專用 |

## 禁止清單

1. 模組 `index.html` 僅 redirect
2. Hub 右欄載入模組雙欄殼
3. 內層 iframe 命名 `contentFrame` 與外殼衝突
4. 側欄放與 L4 Tab 重複的 ①②③④
5. `href="#"` + `<base target="contentFrame">`
6. `javascript:void(0)` 當主導航
7. `data-edu-cross`、自訂 onclick 與 `data-b100-nav` 並存
8. 跨模組只靠 `href` 不設 `data-b100-nav="module"`

## 新連結檢查清單

- [ ] 屬於 content / module / tab / exit 哪一種？
- [ ] 要不要換左欄？要 → `module`
- [ ] `href` 在 Standalone 與 Hub 各測一次
- [ ] 無 `#`、無 `void(0)`、無殼中殼

## 相關規則

- `.cursor/rules/bible100-unified-navigation.mdc`
- `.cursor/rules/bible100-module-hub-standalone.mdc`
- `.cursor/rules/bible100-index-shell-sidebar.mdc`

## 驗收（必從殼進入）

**不要**單獨開 `sidebar_*.html` 驗收雙欄切換。

```text
file:///.../bible100_new/church_ministry/index.html?focus=c
file:///.../bible100_new/index_v5.html  → 教會事工 C 區
```

失敗時 handler 會降級為 `href` + `<base target="contentFrame">`（至少右欄可載入）。

## 測試

```powershell
python tests/test_unified_navigation.py
python church_ministry/tests/test_education_data_hub.py
```
