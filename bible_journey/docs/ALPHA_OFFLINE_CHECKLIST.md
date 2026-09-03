# 聖經跑道 · 離線封測分發清單

> **給試用者的「開箱說明＋四身份任務卡」（可直接轉貼 LINE）：**  
> [BETA_TESTER_HANDOUT.md](./BETA_TESTER_HANDOUT.md)  
> **PWA（加到主畫面／Vercel）：** [PWA_BETA_DEPLOY.md](./PWA_BETA_DEPLOY.md)

## 一、打包（維護者）

```powershell
cd bible_journey
npm run build:offline
```

成功後：`dist/` 含 `index.html`、`assets/`、`data/`、`請先看我.txt`。

壓縮整個 `dist` 資料夾為 ZIP（檔名例：`BibleJourney_Alpha_2026-07-13.zip`）。

---

## 二、同工／牧師：怎麼打開（Windows / Mac）

1. **解壓縮**整個資料夾（不要只複製 `index.html`）。
2. **雙擊** `index.html`。
3. 若白畫面：用 **Chrome** 或 **Edge**；或右鍵 → 開啟方式 → 瀏覽器。
4. **完全離線**可讀經、打卡、四語並排；AI 門診需自行連網貼提示詞。

---

## 三、手機 / 平板 / iOS 分發

| 裝置 | 建議做法 | 注意 |
|------|----------|------|
| **Android** | ZIP 傳到手機 → 解壓 → 用 Chrome 開 `index.html` | 部分檔案管理器需「用瀏覽器開啟」 |
| **iPhone / iPad** | 不建議只靠雙擊 `file://` | iOS Safari 對本地 HTML+JS 限制多，易白畫面 |
| **iOS 較穩** | ① 同 WiFi 用筆電 `npm run preview` 分享網址；② 或上傳到內網/雲端 HTTPS | 封測優先：Android + 筆電 |
| **平板** | 同 Android；iPad 同 iOS 限制 | |

**給 iOS 同工的預備話術：**

> 這包主要是給電腦離線用。若你用 iPhone/iPad，請先告訴我們型號；我們會提供測試網址或安排 Android/電腦先測。

---

## 四、測試 Checklist（每位封測者）

- [ ] 解壓後雙擊 `index.html`，首頁有畫面（非白屏）
- [ ] 斷開 WiFi / 飛航模式，仍能開啟並讀一章經文
- [ ] 四語並排有文字（至少中文 + 英文）
- [ ] 任選一跑道讀完 → 打卡成功，星星/進度有變化
- [ ] 關閉瀏覽器再開，進度仍在
- [ ] 切換介面語言（繁中 / EN / VI / ID）無整段中文穿幫
- [ ] （可選）點 AI 門診 → 能開外部頁或看到複製提示

---

## 五、問題回報格式（給牧師轉交）

請截圖並填：

1. **裝置**：例 Windows 11 筆電 / Samsung A54 / iPad 10
2. **瀏覽器**：Chrome / Edge / Safari 版本
3. **步驟**：第幾步卡住（解壓 / 雙擊 / 讀經 / 打卡）
4. **現象**：白畫面 / 按鈕無反應 / 經文空白
5. **跑道**：六十六卷 / 三十日 / 金句 / 主題 + 書卷章節
6. **是否離線**：是 / 否

回報方式：LINE / Email / 表單（由牧師指定）。

---

## 六、維護者驗收指令

```powershell
npm run verify:bible    # 1189 章 JSON 齊全
npm run build:offline   # 驗證 + 建置 + 寫入請先看我.txt
```

檢查 `dist/index.html` 內路徑應為 `./assets/...`，非 `/assets/...`。

---

## 七、常見問答

**Q：為什麼要解壓整包？**  
A：經文與樣式在 `data/`、`assets/` 子資料夾，只複製 html 會找不到檔案。

**Q：可以放在 USB 嗎？**  
A：可以，整包資料夾複製到 USB，在別台電腦解壓或直接使用。

**Q：舊版 Bible100 整站有關係嗎？**  
A：此 ZIP 為獨立 `bible_journey`，不需安裝整站；若與整站並存，AI 門診可連到站內查經頁。
