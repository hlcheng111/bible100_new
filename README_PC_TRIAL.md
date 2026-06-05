# PC 試用（雙擊 index，不用 localhost）

## 怎麼開

1. 在檔案總管進入 `bible100_new` 資料夾  
2. **雙擊** [`index.html`](index.html)（會自動進入 `index_v5.html`）  
   或雙擊 [`開啟 Bible100.bat`](開啟%20Bible100.bat)

不必執行 `Serve-Bible100-local.cmd`，也**不必**輸入 `http://127.0.0.1`。

## 建議瀏覽器

- **Edge / Chrome** 皆可；改版後若畫面像舊版，請 **Ctrl+F5** 或關分頁後再雙擊 `index.html` 重開。

## 試用時可用功能

| 功能 | file:// 雙擊 |
|------|----------------|
| 教材與培訓（languages） | 可用（需保留 `languages/` 資料夾） |
| 聖經研讀 / Q&A / 教會事工 dashboard | 多數可用 |
| 詩歌管理 dashboard | 可用；深層 2000+ 首 `.htm` 在 `hymn_management/hymn/` |
| 大型 SQLite（`data/cj/`） | 部分頁面需 HTTP 或上線後較穩 |
| 教會規劃 React（`church_planning/dist`） | 建議上線後用，file:// 常無法載入 |

## 複製到手機

執行打包腳本後，將 zip 解壓到手機，用檔案管理器開啟 **`index.html`**（見 [`README_PHONE.txt`](README_PHONE.txt)）。

```powershell
.\scripts\build_phone_package.ps1
```

## 日後上傳寄存

見 [`DEPLOY_HOSTING.md`](DEPLOY_HOSTING.md)（Apache / InfinityFree 類主機，已有 `.htaccess`）。

## 可選：本機 HTTP

僅在 file:// 遇到模組載入問題時再用 `Serve-Bible100-local.cmd`（進階，非試用預設）。
