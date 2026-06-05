# 上傳傳統寄存（非 Netlify）

## 上傳什麼

全站約 **6 GB**，多數虛擬主機無法一次上傳。建議：

| 方案 | 內容 |
|------|------|
| **精簡站** | `index.html`、`index_v5.html`、`js/`、`css/`、`config/`、各模組 dashboard+sidebar、`languages/cn/`（或僅 landing） |
| **完整站** | 再加 `languages/`、`hymn_management/`、`data/`（注意單檔 10–20MB 限制） |

排除清單見 [`config/cloud-upload-exclude.txt`](config/cloud-upload-exclude.txt)。

## 伺服器設定

根目錄已有 [`.htaccess`](.htaccess)：

- 預設首頁：`index.html` → 自動轉 `index_v5.html`
- `Options -Indexes`（禁止目錄列表）

上傳後網址範例：`https://你的網域/index.html` 或 `https://你的網域/index_v5.html`

## 手機「加到主畫面」

上線 **HTTPS** 後，`manifest.json` + `service-worker.js` 可支援 PWA 離線快取（需從網址開啟，非 file://）。

## 打包上傳用 zip

```powershell
.\scripts\build_phone_package.ps1 -Profile HostingSlim
```

將產生的 zip 解壓到主機 `public_html` 或 `www` 根目錄。
