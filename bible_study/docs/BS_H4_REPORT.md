# BS-H4 · 瀏覽器抽樣驗收 + 資料層收口（dictionary/crossref、vi/id）

> **日期**：2026-07-26
> **本機 HTTP**：`python -m http.server 8080 --bind 127.0.0.1`（專案根 `bible100_new`）

## 一、瀏覽器抽樣結果（cursor-ide-browser 實測）

| # | 頁面 | 驗證 | 結果 |
|---|------|------|------|
| 1 | `OT/law/創世記.html` | BS-H2 區塊、章節 1–50 深鏈 | ✅ |
| 2 | `reader.html?book=1&chapter=1` | 書卷=創世記、經文載入 | ✅ |
| 3 | `parallel_mode_v3.html` | 下拉含 vi1934/id_ayt（registry 動態） | ✅ |
| 4 | parallel 左 vi + 右 id · 創1 | 雙欄渲染越南文/印尼文各 31 節 | ✅ |
| 5 | `dictionary_reader.html` | registry 載入 416 詞條、搜「摩西」2 筆 | ✅ |
| 6 | `crossref_reader.html` | faith_crossref · 創1:1 → 59 處引用 | ✅ |
| 7 | `index_v5.html` → 聖經研讀 | 外層雙欄 `sidebarFrame`+`contentFrame` 正確載入 BS 側欄/主頁 | ✅ |

## 二、資料層收口

### registry SSOT 修正

- `dictionaries.bible_dict` 路徑改為實際存在的 `data/cd/圣经语汇词典.json`（原 `data/dictionaries/圣经词典.json` 不存在）。
- 新增 `BS_getRegistryEntry(category, key)` 取單一資料源。

### 工具頁接線（不再硬編路徑）

- `dictionary_reader.html`、`crossref_reader.html` → `bible_version_registry.js` + `BibleEngine.js` + `bs_registry_reader.js`（`BS_loadRegistryResource`）。
- 串珠 source key 改用 registry key：`faith_crossref` / `cuv_crossref`（原 `xinwangai` / `heheben`）。

### BibleEngine 修復（關鍵）

`data/cd/`、串珠類匯出 JSON 把結構性換行寫成 `\n` 字面序列，導致 `JSON.parse` 失敗。
`initJson` 新增 `_unescapeJsonText` 掃描器：**只在字串外**把 `\n` `\r` `\t` 還原為空白，字串內合法轉義（含 `\\` Windows 路徑）不動。詞典（416 詞條）與信望愛串珠（創1:1 → 59 引用）均實測通過。

## 三、已知限制

- **詞典 Description 加密**：`圣经语汇词典.json` 的釋義欄位為加密內容（非 `l001w` 前綴，現有 `safeDecryptContent` 不適用）。詞條名（Word）可讀可搜；釋義顯示需來源解密方案，另立任務。
- 詞條覆蓋僅 416 條（如「耶路撒冷」不在表內），屬資料範圍非接線問題。

## 四、vi / id 小語種實機

- `vi1934` → `data/bibles/clean/越南聖經1934.json`：創1 = 31 節，「Ban đầu Đức Chúa Trời dựng nên trời đất.」
- `id_ayt` → `data/bibles/clean/印尼AYT.json`：創1 = 31 節，「Pada mulanya, Allah menciptakan langit dan bumi.」
- parallel v3 雙欄同時渲染兩語成功（6MB 級 JSON 懶載入約 3–8 秒）。

## 五、重跑

```powershell
python -m http.server 8080 --bind 127.0.0.1
$env:PYTHONIOENCODING="utf-8"
python tests/test_bs_h4_smoke.py
python tests/test_bible_study_data_registry.py
```
