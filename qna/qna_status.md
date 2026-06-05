# QNA 模組狀態說明

## 目前問題與修復

### ✅ 已修復
1. **B/C 分類閃現問題**：已為 B/C 分類加入「全部來源」選項，選擇分類時會先顯示 landing page
2. **JavaScript 錯誤處理**：已加入 try-catch 與 console.error，避免頁面卡住

### ⚠️ 已知問題

#### 1. Sidebar 仍是舊結構
**原因**：目前 sidebar 仍使用 `qna_list_auto.htm`（由 build 腳本產生），結構為：
```
h2: A 聖經書卷難題
  h4: 恩泉－聖經問題解答 陳終道
    details: 舊約 / 創世記
      ul: 題目列表
```

**目標結構**（你希望的）：
```
details: A 聖經書卷難題
  details: 恩泉－聖經問題解答 陳終道
    details: 舊約 / 創世記
      ul: 題目列表
```

**解決方案**：
- **短期**：繼續使用現有 `qna_list_auto.htm`（已擴充 search 功能）
- **中期**：建立 `qna_sidebar_4layer.htm`，整合 qna02 資料
- **長期**：重構 `build_qna_list.py`，讓它輸出理想的結構

#### 2. 按難題有的有、有的無
**原因**：qna02.htm 的資料尚未完全整合到 `qna_list_auto.htm`

**目前狀態**：
- `qna02_tree.json` 只包含：
  - ✅ 恩泉－聖經問題解答 陳終道（有舊約/新約/生活問題/神學問題）
  - ✅ Christian Answers 中文
- ❌ 其他來源（如 Archer、蘇佐揚、李道生、以斯拉百科等）尚未被 parse

**解決方案**：
1. **檢查 qna02.htm**：確認所有來源的標題與 `links_merged.json` 的 `label` 完全一致
2. **擴充 parse_qna02_to_json.py**：讓它能解析更多來源格式
3. **執行腳本**：`parse_qna02_to_json.py` → `build_qna_list.py`

## 建議流程

### 步驟 1：整理 qna02.htm
在 qna02.htm 中，為每個來源區塊加上正確的標題（必須與 `links_merged.json` 的 `label` 完全一致），例如：

```html
<h2>恩泉－聖經難題彙編 Archer</h2>
<p>
<a href="https://wellsofgrace.com/index-bible.htm">首頁</a><br>
<a href="https://tochrist.org/...">創世記</a><br>
...
</p>

<h2>恩泉－新約聖經難題 蘇佐揚</h2>
<p>
<a href="https://wellsofgrace.com/bible/qna/nanti-su/index.html">首頁</a><br>
<a href="...">馬太福音</a><br>
...
</p>
```

### 步驟 2：擴充解析器
修改 `parse_qna02_to_json.py`，讓它能：
- 識別更多來源標題格式
- 解析書卷分類（如「馬太福音 - 蘇佐揚」）

### 步驟 3：執行建置
```bash
python scripts/parse_qna02_to_json.py
python scripts/build_qna_list.py
```

### 步驟 4：測試
開啟 `qna_index_4layer.htm`，檢查：
- 所有來源是否出現在 sidebar
- 書卷分類是否正確
- 題目連結是否可點擊

## 目前可用的功能

✅ 四層導航結構  
✅ 主 landing page 與各分類 landing page  
✅ Search 功能（關鍵字 + 分類過濾 + 書卷速達）  
✅ 語言選譯（中/EN）  
✅ AI 提問文字自動填入  

## 待完成

⏳ 整合 qna02 所有來源資料  
⏳ 建立新的 sidebar 結構（大分類 → 網站 → 書卷）  
⏳ 重構 build 腳本輸出格式  
