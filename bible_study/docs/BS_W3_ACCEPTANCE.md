# BS-W3 驗收清單

> 人工／HTTP 實機步驟；資料夾 `data/` 不在 Git 時需本機還原。

## 1. Prompt 複製（無 API）

| 步驟 | URL | 預期 |
|------|-----|------|
| 釋經頁 | `bible_study/comprehensive_exegesis_reader.html?book=創世記&chapter=1` | 頂欄有「AI Prompt」下拉 + 複製；剪貼板含護欄 + 經文 |
| 對照 | `bible_study/parallel_mode_v3.html` | 同上；PT-02 含雙譯本 |
| 閱讀 | `bible_study/reader.html?book=1&chapter=1` | 同上 |

## 2. QnA 同章深連

| 步驟 | 預期 |
|------|------|
| 釋經頁點「❓ 同章難題」 | 新分頁 `qna/index.html?cat=A_OT&src=wellsofgrace_chen_ot&book=創世記&chapter=1&q=…` |
| QnA 左欄 | 顯示「研讀深連」提示；題目列表依 `q` 篩選 |
| 總站殼 Topbar「❓ 難題」 | 依 `StudyState` 當前書卷開 QnA |

## 3. 越/印尼 parallel

| 譯本 key | registry | 檔案（本機） |
|----------|----------|--------------|
| vi1934 | `parallel: true` | `data/bibles/clean/越南聖經1934.json` |
| id_ayt | `parallel: true` | `data/bibles/clean/印尼AYT.json` |

```
python -m http.server 8765
# 開 http://127.0.0.1:8765/bible_study/parallel_mode_v3.html
# 左右欄選 vi1934 / id_ayt → 創世記 1 章應有懶載入經文
```

## 4. State / 搜尋聯動

| 步驟 | 預期 |
|------|------|
| `bible_study/index.html` 換章 | 頂欄「📖 書名 第N章」更新 |
| 搜尋 Enter | `search_reader.html?q=…` + URL `frame` / `q` 保留 |
| F5 | 還原上次 `contentFrame` |

## 5. 尚未在本波完成

- 全站其他模組「地圖內只換右欄」掃描
- `languages/` 六語版本中心與 registry 文案一鍵對照
- SQLite FTS 全文索引
