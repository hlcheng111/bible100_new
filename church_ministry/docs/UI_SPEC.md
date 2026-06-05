# 教會事工模組 · UI 規範 v1

## 字級

| 用途 | 建議 |
|------|------|
| 頁面主標題（iframe 內） | 1.15rem–1.35rem（或 Tailwind `text-2xl` 級） |
| 內文／表單 | 12–13px（`0.8125rem`） |
| 輔助說明 | 11–12px（`0.75rem`–`0.8125rem`） |
| 頂部返回列 | `0.8125rem` |

## 色票（CSS 變數）

見 `church_ministry/css/church_ministry_ui.css` 之 `:root`：`--cm-brand`、`--cm-text`、`--cm-muted`、`--cm-warn-bg` 等。新頁請優先引用該檔，少用手寫 `#` 色碼。

## 頂部返回列

- 類名：`.cm-back-bar`、連結 `.cm-back-bar__link`（指向 `dashboard.html` 或相對路徑之儀表板）
- 右側可選：`.cm-back-bar__muted`（例如「研究與統計」）
- 資料來源提示：`.cm-data-banner` + `#cm-data-source-line`（由 `cm_research_snapshot.js` 填入）

## Tab 命名（建議）

整合型工作桌建議採：**看 ·**（清單／雷達）、**填 ·**（登記／表單）、**知 ·**（理念／說明）；細部子 Tab 可用具體名稱（如「總覽」「收支」）。

## 引用方式

```html
<link rel="stylesheet" href="../../css/church_ministry_ui.css">
```

（路徑依頁面深度調整。）
