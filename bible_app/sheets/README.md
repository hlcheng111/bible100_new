# Google Sheets 營運模板

非技術同工用試算表維護內容，每日由 Cloud Function `importFromSheets` 同步至 Firebase。

## 建立試算表

1. 複製欄位結構（見下方三個 Tab）
2. 記下 Spreadsheet ID，設為 Firebase Functions 環境變數 `SHEETS_ID`
3. 建立 Service Account，分享試算表給該帳號「檢視者」
4. 設定 `IMPORT_SECRET`，以 POST 觸發匯入：

```bash
curl -X POST https://REGION-PROJECT.cloudfunctions.net/importFromSheets \
  -H "Content-Type: application/json" \
  -H "x-import-secret: YOUR_SECRET" \
  -d '{"tab":"registrations"}'
```

可用 [Google Apps Script 時間驅動觸發器](templates/SheetsImportTrigger.gs) 每日自動匯入。

## Tab: registrations

| email | displayName | churchId | groupName |
|-------|-------------|----------|-----------|
| user@example.com | 王小明 | church_tpe_01 | 青年小組 |

對應 Google Form 可將回應送到此 Tab。

## Tab: resources

| trackId | bookId | chapter | type | url | title | locale |
|---------|--------|---------|------|-----|-------|--------|
| ot_front | 1 | 1 | youtube | https://youtube.com/... | 創世記導論 | zh-Hant |

## Tab: vouchers

| code | churchId | trackId | redeemed | redeemedBy |
|------|----------|---------|----------|------------|
| GIFT-2026-001 | church_tpe_01 | ot_front | FALSE | |

牧者核銷時將 `redeemed` 改為 `TRUE` 並填 `redeemedBy`。

## 小白維護節奏

- **每週一**：更新 `resources` 本週推薦影片
- **報名期**：Form 回應進 `registrations`，每日自動匯入
- **跑道完成**：手動在 `vouchers` 新增券碼，或批次產生
