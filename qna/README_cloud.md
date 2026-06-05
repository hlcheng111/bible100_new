# QNA 雲端上傳說明（含 1MB 單檔限制）

## 1. 若有 HTML 1MB 限制，是否只有分檔這方法？

**實務上是的。** 目前「全部」單頁 `qna_list_auto.htm` 約 **4.2MB**，超過 1MB 的寄存無法上傳該檔。

**做法：用「分檔」、不要上傳「全部」單頁。**

- 專案已內建分檔，每個檔案都 **< 1MB**：
  - 五經至詩歌書 ~698KB、先知書 ~224KB、福音書行傳 ~752KB、書信啟示錄 ~813KB、神學教義 ~236KB、信徒教會 ~232KB
- 雲端版入口用 **QNA_cloud.html**，左欄預設是「選單」，點分類才載入對應分檔，不會載入 4MB 的 `qna_list_auto.htm`。

若不想分檔，理論上可改為「頁面只載入小 HTML + 用 JavaScript 動態拉 JSON/HTML 區塊」，但需改架構與程式，比直接使用現成分檔複雜許多。

---

## 2. 其他寄存站是否也有這限制？

**依各家規定不同。**

- **Blogger / 部分免費站**：常有單檔或單頁大小上限（例如 1MB）。
- **GitHub Pages、Netlify、Vercel**：一般沒有 1MB 單檔限制，可上傳較大檔案（仍建議注意載入速度）。
- **自架主機**：通常由伺服器或 PHP 設定決定。

上傳前請查看該站的「檔案大小／上傳限制」說明。

---

## 3. 現是否可上載試試？（bible100.lovestoblog.com）

**可以。** 建議用「雲端版」一組檔案，全部單檔 < 1MB，適合有大小限制的寄存。

### 若出現 404，常見原因

- **檔名大小寫**：InfinityFree 等 Linux 主機**區分大小寫**。請用 **qna_cloud.html**（全小寫）作為入口；若用 QNA_cloud.html 則網址須與檔名完全一致。
- **未上傳該檔**：請對照下方清單，確保每個檔都有上傳到 `qna/` 目錄。
- **中文檔名**：部分主機或 FTP 對中文檔名會 404。雲端版已改為**純英文檔名**（qna_OT_1.htm、qna_OT_2.htm、qna_NT_1.htm、qna_NT_2.htm），請上傳 build 後產生的這四個檔，並用雲端選單（連結已指到這些檔）。

### 建議上傳清單（qna 資料夾內，全部用英文檔名）

| 檔案 | 說明 | 約略大小 |
|------|------|----------|
| **qna_cloud.html** | 雲端版入口（小寫，建議用此避免 404） | ~1.5KB |
| QNA_cloud.html | 同上，大寫版（可選） | ~1.5KB |
| qna_layer1_6files.htm | 頂層導航 | ~0.6KB |
| qna_layer2_6files_cloud.htm | 第二列選單（雲端用） | ~1.5KB |
| qna_split_index_cloud.htm | 左欄預設選單（雲端用） | ~1KB |
| **qna_OT_1.htm** | 分檔：五經～詩歌書（build 後產生） | ~698KB |
| **qna_OT_2.htm** | 分檔：先知書（build 後產生） | ~224KB |
| **qna_NT_1.htm** | 分檔：福音書～行傳（build 後產生） | ~752KB |
| **qna_NT_2.htm** | 分檔：書信～啟示錄（build 後產生） | ~813KB |
| qna_B.htm | 分檔：神學教義 | ~236KB |
| qna_C.htm | 分檔：信徒教會 | ~232KB |
| qna_landing.htm | 右欄預設說明頁 | ~11KB |

**不要上傳**（超過 1MB 或雲端版用不到）：

- `qna_list_auto.htm`（約 4.2MB）
- 若空間很緊，也可不上傳 `qna02_*.htm`、`qna02.htm`、`qna02_sidebar.htm` 等舊版大檔。

### 站上如何開啟

- **建議用小寫入口**（避免主機區分大小寫導致 404）：  
  **https://bible100.lovestoblog.com/qna/qna_cloud.html**
- 若首頁是 `https://bible100.lovestoblog.com/index.html`，可在 index 裡加一個連結到 **qna/qna_cloud.html**。
- 若 404，請確認：檔名是否為 **qna_cloud.html**（全小寫）、是否已上傳上述全部檔案到 `qna/` 目錄。

### 路徑注意

- 上傳後請保持 **qna/** 底下檔案的相對路徑不變（例如 `qna_OT_五經至詩歌書.htm` 與 `QNA_cloud.html` 在同一層）。
- 若你把 QNA 放在別的子目錄（例如 `bible100/qna/`），則首頁連結要改成對應路徑，例如：`qna/QNA_cloud.html`。

上傳完成後用瀏覽器開一次 `https://bible100.lovestoblog.com/.../QNA_cloud.html`，點各分類確認能載入、右欄能開題目連結即可。
