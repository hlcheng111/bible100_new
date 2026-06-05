# Sidebar 結構重整計劃

## 目標結構

```
▼ A 聖經書卷難題
  ▼ 恩泉－聖經問題解答 陳終道
    ▼ 舊約 / 創世記
      • 1、神用六日便创造了天地？
      • 2、"生气"是什么？
      ...
    ▼ 舊約 / 出埃及記
      ...
  ▼ 華人護教
    ▼ 舊約 / 創世記
      ...
  ▼ 以斯拉百科網
    ▼ 申命記～路得記
      ...
▼ B 神學教義難題
  ▼ 以斯拉百科－辯道護教
    ...
▼ C 信徒教會難題
  ▼ 葛培理福音協會
    ...
```

## 整合 qna02 資料的方法

### 方案一：擴充 parse_qna02_to_json.py（推薦）

1. **修改 `parse_qna02_to_json.py`**，讓它能解析 qna02.htm 中所有來源（不僅限於恩泉陳終道）
2. **在 qna02.htm 中，為每個來源區塊加上正確的標題**（必須與 `links_merged.json` 的 `label` 完全一致）
3. 執行 `parse_qna02_to_json.py` → `build_qna_list.py`
4. 結果會自動整合到 `qna_list_auto.htm`

### 方案二：手動建立新 sidebar（qna_sidebar_4layer.htm）

1. 建立 `qna_sidebar_4layer.htm`，使用 JavaScript 動態載入：
   - 從 `qna_nav_config.js` 讀取分類與來源
   - 從 `qna_list_auto.htm` 或 `qna02_tree.json` 讀取書卷結構
   - 動態生成「大分類 → 網站 → 書卷」的樹狀結構

2. 優點：可完全控制結構，不依賴 build 腳本
3. 缺點：需要維護 JavaScript 邏輯

### 方案三：重構 build_qna_list.py 輸出格式

1. 修改 `build_qna_list.py`，讓它輸出「大分類 → 網站 → 書卷」的 details 嵌套結構
2. 優點：一次修改，之後自動生成正確格式
3. 缺點：需要修改 Python 腳本

## 建議

**短期**：先使用現有的 `qna_list_auto.htm`（已有 A/B/C 結構），擴充 search 功能已完成。

**中期**：建立 `qna_sidebar_4layer.htm`，整合 qna02 資料，提供更好的導航體驗。

**長期**：重構 `build_qna_list.py`，讓它直接輸出理想的 sidebar 結構。

## qna02 資料整合檢查清單

- [ ] 確認 qna02.htm 中所有來源的標題與 `links_merged.json` 的 `label` 一致
- [ ] 擴充 `parse_qna02_to_json.py` 支援更多來源格式
- [ ] 執行 parse + build，檢查 `qna02_tree.json` 是否包含所有來源
- [ ] 確認 `qna_abc_config.json` 為每個來源設定正確的 A/B/C 分類
- [ ] 測試新 sidebar 的展開/收合與搜尋功能
