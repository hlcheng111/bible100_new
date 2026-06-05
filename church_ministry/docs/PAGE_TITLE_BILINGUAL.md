# 頁面標題雙語約定（供多語言編輯／對照）

## 格式

```html
<title>中文名稱 · English Name | Church Ministry</title>
```

- **中文 · English**：方便站內與翻譯同事辨識用途。
- **`| Church Ministry`**：可選；模組內頁建議保留以利瀏覽器分頁辨識。

## 維護

- 批量更新：在 `church_ministry` 目錄執行  
  `python scripts/apply_title_en_church_ministry.py`  
  會略過已含「·」後英文片段的 `<title>`。**手動改頁時請維持同一格式**。

## 與 meta

可選（利於程式讀取）：

```html
<meta name="page-title-en" content="English Name">
```

非必填；以 `<title>` 為準。
