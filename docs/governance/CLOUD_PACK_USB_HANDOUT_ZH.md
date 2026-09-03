# Bible100 · 雲端／USB 試用包說明（給上傳者與試用者）

建置來源：`bible100_new` → 同步目錄建議：`C:\Users\hlche\.cursor\bible100_new_2`  
規格：`docs/governance/CLOUD_PACK_4P8_FULL_V1.md`

---

## 這是什麼？

精簡後的「全功能展示站」骨架（約 **2GB**，上限設計 **≤4.8GB**）：

- 總站殼 `index_v5.html`、各模組頁
- 詩歌庫（含圖）
- 教材 CN／VI（瘦）／EN／ID＋共用圖 `languages/images`、`languages/media`
- 對照譯本 **JSON**（`data/bibles/clean/`）— 須用 **http(s)** 打開才可靠

**不含：** `data/cj/`（含綜合解讀.db）、`data/orig/`、越文 Word 後備 `*.files`、本機備份／archive。

---

## 更好做法（建議順序）

| 方案 | 何時用 |
|------|--------|
| **A. 資料夾 `bible100_new_2`**（本腳本預設） | 上 lovestoblog FTP、拷 USB — **推薦**，不必先打 4.8GB ZIP |
| **B. ZIP** | 僅當對方只要「一個檔下載」；壓縮慢、FTP 易斷，斷了難續傳 |
| **C. Cloudflare Pages + 重資產另放** | 殼用 Git；大詩歌／圖用 R2／本包 FTP — 長期較穩 |
| **D. 完整 USB（本機全庫）** | 給老師「真研讀」：仍用完整 `bible100_new`＋`data/`，不要只用本精簡包 |

**結論：** 重新上云用 **資料夾同步**；ZIP 可選做第二備份。試用者若要綜合解讀／完整註釋，另給完整本機包或等「對照離線重建」波次。

---

## 重新上載 lovestoblog（https://bible100.lovestoblog.com/）

1. **先備份舊站**（若還需要）：FTP 下載一份或主機面板備份。  
2. **清空遠端舊資料**（或清空 `public_html`／站根對應目錄）— 避免舊路徑殘檔與新包混雜。  
3. 用 FileZilla／主機檔案管理，把 **`bible100_new_2` 內全部內容** 上傳到站根（使 `index_v5.html` 在網址根可開）。  
4. 上傳後打開：`https://bible100.lovestoblog.com/index_v5.html`（或你的實際域名）**強制重新整理**。  
5. 抽查：頂欄模組、詩歌是否有圖、`languages/cn` 課圖、`bible_study/parallel_mode_v3.html`（HTTPS 下應能載 clean 譯本；**不要期望綜合解讀**）。

單檔過大時：部分免費主機限制 10–20MB／檔；本包已避開多數巨型 `.db`。若仍失敗，查主機日誌。

---

## USB 備案（給其他用家試用）

1. U 盤建議 **≥8GB 空閒**（FAT32 單檔限 4GB — 本包單檔多小於該限；若打 ZIP＞4GB 請用 **exFAT／NTFS**）。  
2. 拷貝整個 `bible100_new_2` 資料夾到 U 盤（例如 `USB:\bible100_new_2\`）。  
3. 試用者雙擊：`index_v5.html`（`file://`）。  
4. **務必告知試用者注意事項（下一節）**。

可選：在 U 盤再放一份「完整版說明」指向如何取得含 `data/cj` 的完整包（不放進本精簡夾）。

---

## 注意事項（必讀）

1. **成品驗收**  
   - 雲端：以 **HTTPS** 為準。  
   - USB／本機精簡包：`file://` 可看殼與多數靜態頁；**對照／註釋／SQLite 常不完整**。  

2. **沒有綜合解讀.db**  
   - 精簡包設計如此；不是上傳失敗。完整釋經請用完整本機庫或外站。  

3. **隱私**  
   - 教會事工／問卷等若曾在瀏覽器寫入，屬該電腦本機；U 盤站不會自動帶別人的會友資料。  
   - 勿把含真實會友匯出的 JSON 塞進試用包。  

4. **版權**  
   - 聖經譯本／詩歌／圖片僅限教會內部試用與授權範圍；勿公開再分發未授權內容。  

5. **不要把 `bible100_new_2` 放進 Git**  
   - 體積大；已在倉庫外同级目录建置。  

6. **更新流程（不要逐頁手傳）**  
   - 只在 `bible100_new` 改程式／加新頁。  
   - 新模組或新頂層目錄：先寫入 `config/cloud_pack_4p8_include.txt` 與 `scripts/build_cloud_pack_4p8.ps1`。  
   - 再跑 `scripts\build_cloud_pack_4p8.ps1`（增量同步到 `bible100_new_2`）。  
   - 上云／USB：同步整個 `bible100_new_2`（或改過的子樹），不要只手傳單一 HTML。  

---

## 建置指令

```powershell
cd C:\Users\hlche\.cursor\bible100_new
powershell -ExecutionPolicy Bypass -File scripts\estimate_cloud_pack_4p8.ps1
powershell -ExecutionPolicy Bypass -File scripts\build_cloud_pack_4p8.ps1
# 預設輸出：C:\Users\hlche\.cursor\bible100_new_2
```

可選 ZIP（完成資料夾後，本機手動）：

```powershell
Compress-Archive -Path "C:\Users\hlche\.cursor\bible100_new_2\*" -DestinationPath "C:\Users\hlche\.cursor\bible100_new_2_pack.zip" -CompressionLevel Optimal
```

（數 GB 壓縮可能需數十分鐘；失敗時優先保留資料夾。）
