# BS 任務 · 詞典釋義解密（另立，未排程）

> **開立日期**：2026-07-26（H4 收口時發現）
> **狀態**：⏳ 待啟動
> **前置**：不阻塞 H4；詞條名（Word）已可搜可讀

## 問題

`data/cd/圣经语汇词典.json` 的 `Description` 欄位為加密內容（base64 樣式、**無** `l001w` 前綴），
現有 `BibleEngine.safeDecryptContent`（l001w + XOR key）不適用，釋義暫顯示原樣密文。

## 起點素材（都在本機，不進 git）

| 檔案 | 大小 | 備註 |
|------|------|------|
| `data/cd/圣经语汇词典.db` | 925 KB | SQLite 原檔——**第一步先查此檔是否明文** |
| `data/cd/圣经语汇词典.json` | 767 KB | 由 .db 匯出，Description 加密 |
| `data/cd/证主圣经百科全书.db/.json` | 13 MB | 同批來源，可能同一加密方案 |
| `data/cd/简明圣经史地图解.db/.json` | 42/4 MB | 同上 |

## 執行步驟

1. **查 .db 是否明文**：`sqlite3` 開 `圣经语汇词典.db`，`SELECT Description FROM Dictionary LIMIT 3`。
   若明文 → 直接改 registry 走 `db` 路徑（`paths.db`），BibleEngine 已支援 SQLite，任務即完成。
2. **若 .db 同樣加密**：比對三本 cd 資料的加密樣式是否一致；
   追來源 App（此批為安卓聖經 App 匯出格式）的解密邏輯（key／演算法）。
3. **拿到方案後**：擴充 `BibleEngine.safeDecryptContent` 支援新格式（保留 l001w 相容），
   `dictionary_reader.html` 不需再改（已統一走 `safeDecryptContent`）。
4. **若無法解密**：換開放授權詞典資料源填 `dictionaries` registry。

## ⚠️ 授權注意

加密可能是**版權保護**。啟動前先確認此資料來源的使用授權；
若授權不允許，走第 4 步（換開放資料源），不要破解。

## 驗收

- `dictionary_reader.html` 搜「摩西」→ 釋義為可讀中文
- `python tests/test_bs_h4_smoke.py` 全綠
