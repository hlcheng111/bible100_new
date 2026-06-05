# 雲端 vs PC 對比報告（QnA 模組）

## 一、對比摘要

| 項目 | 雲端 (bible100.lovestoblog.com) | PC (bible100_new) |
|------|----------------------------------|-------------------|
| 主站 index | 連結 qna_index.htm（舊版） | 連結 qna_index_4layer.htm（四層） |
| 四層導航 | qna_index_4layer.htm 可能 404 | ✅ 已存在 |
| **全部來源** | **qna_list_auto.htm 404** | ✅ 已存在（約 4.3MB） |
| qna_layer1/2 | 待確認 | ✅ 已存在 |
| qna_nav_config.js | 待確認 | ✅ 已存在 |
| qna_landing.htm | 待確認 | ✅ 已存在 |

---

## 二、「全部來源」404 可能原因

### 1. 檔案過大（最可能）

| 檔案 | 大小 | 說明 |
|------|------|------|
| qna_list_auto.htm | **約 4.3 MB** | 多數主機上傳限制為 2MB，可能導致上傳失敗或截斷 |

### 2. 路徑差異

- 雲端若使用子目錄（如 `bible100_new/qna/`），frame 的 `src="qna_list_auto.htm"` 會解析為 `.../qna/qna_list_auto.htm`
- 請確認上傳路徑與網址一致

### 3. 副檔名

- 部分主機對 `.htm` 與 `.html` 處理不同，可嘗試上傳 `qna_list_auto.html` 作為備援

### 4. File-List 連結

- `qna_list_auto.htm` 內含 `<link rel="File-List" href="qna_list_auto.files/filelist.xml">`
- 若未上傳 `qna_list_auto.files/` 資料夾，會產生 404（不影響主頁載入，但可移除以減少錯誤）

---

## 三、建議處理方式

### 方案 A：解決大檔上傳（優先）

1. **壓縮後上傳**：將 `qna_list_auto.htm` 壓成 zip，上傳後在 cPanel／檔案管理員解壓
2. **FTP 分段上傳**：使用 FileZilla 等 FTP 軟體，確認傳輸完成且檔案大小正確
3. **提高主機限制**：若可調整 `upload_max_filesize`、`post_max_size`，改為 ≥ 5MB

### 方案 B：使用雲端版（已建立，推薦）

已建立完整雲端版，使用輕量左側欄，無需上傳 4.3MB 檔案：

1. 上傳以下檔案至 `qna/`：
   - `qna_index_4layer_cloud.htm`
   - `qna_layer2_cloud.htm`
   - `qna_nav_config_cloud.js`
   - `qna_contents_default.html`（約 3KB）
2. 主站 `index.html` 的 Q&A 連結改為：`qna/qna_index_4layer_cloud.htm`
3. 或直接開啟：`https://您的網域/qna/qna_index_4layer_cloud.htm`

### 方案 C：移除 File-List 連結（可選）

- 修改 `scripts/build_qna_list.py`，不再輸出 File-List 那一行
- 或手動刪除 `qna_list_auto.htm` 第 6 行

---

## 五、雲端上傳檢查清單

上傳後請逐一確認：

- [ ] `qna/qna_index_4layer.htm` → 直接開啟可載入
- [ ] `qna/qna_list_auto.htm` → 直接開啟可載入（約 4.3MB）
- [ ] `qna/qna_layer1.htm`、`qna_layer2.htm`
- [ ] `qna/qna_nav_config.js`
- [ ] `qna/qna_landing.htm`
- [ ] 根目錄 `index.html` 已改為連結 qna_index_4layer

---

*最後更新：2026-02-16*
