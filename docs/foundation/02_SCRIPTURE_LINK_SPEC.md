# Foundation 0 · 經文深連結規格

**對齊**：現況 `bible_app/shell/js/page_links.js`、研讀工作台、Q&A 轉址。  
**策略**：Canonical（新）+ Legacy adapter（舊）；**禁止**第一期全站改參數。

## 1. Canonical（目標）

| 參數 | 必填 | 說明 |
|------|------|------|
| `book` | 是 | 書卷代碼（如 `Gen`）或與 id 雙寫 |
| `chapter` | 是 | 章 |
| `locale` | 建議 | 如 `zh-Hant` |
| `translation` | 建議 | 如 `CUV`；缺省＝本機預設譯本 |
| `verse_start` / `verse_end` | 選 | 節範圍 |
| `ref` | 選 | 緊湊形如 `Gen.1.1-31` |
| `from` | 建議 | 來源模組短碼（`track` / `study` / `qna` / `ai`） |
| `return_to` | 選 | 回程相對路徑（**白名單**，禁止 `javascript:`／外站） |

範例：

```
bible_study/oia/index.html?book=Gen&chapter=1&locale=zh-Hant&from=track&return_to=bible_app/shell/pages/track-30day.html
```

## 2. Legacy（現況必須容納）

常見舊形：

- 數字 `book` id + `chapter` + `locale` + `track`
- 中文書名 `book=創世記&chapter=1`
- 缺 `translation` / `from` / `return_to`

Adapter 規則：

1. 能解 Canonical 就用 Canonical。  
2. 只有數字 id → 對照表轉代碼（表未齊則保留數字並標記 `legacy_book=1`）。  
3. 只有中文書名 → 對照表轉代碼。  
4. 缺 `translation` → 讀本機讀者偏好或預設 CUV／和合。  
5. 缺 `return_to` → 回模組首頁或瀏覽器上一頁（明示「回跑道／回研讀」按鈕）。

## 3. 必須能讀契約的表面

讀經跑道、多語閱讀器、OIA、Q&A、釋經參讀、AI Prompt 入口。

## 4. 回程 UX（最低）

深入頁至少有其一：

- 返回今天閱讀／原進度  
- 返回本模組首頁  
- 返回上一頁（真人可理解文案）

## 5. 遷移節奏

| 期 | 做什麼 |
|----|--------|
| 0（本檔） | 規格 + 盤點現況參數 |
| 1 | 新連結只寫 Canonical；讀端雙讀 |
| 2 | 高流量舊連結加 adapter 測試 |
| 3 | 退役無引用舊形 |

**盤點期禁止大改既有 href。**

## 6. 驗收（樣板閉環）

1. 跑道關卡 → OIA／難題 帶得了 `book/chapter`。  
2. 從 OIA／難題能回跑道或研讀首頁。  
3. 無經文時顯示「本機無此譯本／章」，不是空白假成功。
