# 多站導覽（試）下架說明 · 2026-07-26

## 為何下架

「多站導覽（試）」用本地 `qna_*_index.htm` 作雙欄導覽殼，點題後在**內嵌 iframe** 載入原站。實測結果：

| 原 HUB 入口 | 側欄題目 | 右欄 iframe | 處置 |
|-------------|----------|-------------|------|
| 以斯拉百科 etspedia | 有（四層樹） | ✅ 可嵌 | **併入書卷大類** → `以斯拉百科（etspedia）` |
| ReformedAnswers | 有（~280 則） | ❌ 禁嵌 | **併入神學大類** → `Reformed Answers`（bundle 80+ 則，點題新分頁） |
| Billy Graham | 有（menu.js） | ❌ 禁嵌 | **併入信徒大類** → `葛培理 Answers` |
| Christian Answers（英） | 有（Teen/Family 等） | ❌ 禁嵌 | **併入書卷大類** → `Christian Answers（英）` |
| CA · 繁中／印尼 | 多為目錄連結，非難題題庫 | ❌ | **放棄**（保留 `CA 繁中首頁` 等 A 類導覽入口即可） |
| CA · Teen / Family | 有英文 Q&A | ❌ 禁嵌 | **放棄**（小眾＋與 CA 英重疊） |

**結論**：除以斯拉外，英文站無法在 iframe 內穩定顯示答案；試用模組造成「有題目但點了空白」的假象，故從 `qna_nav_config.js` 移除 `HUB` 大類與全部 `hub_*` 來源。

## 現在去哪找

| 需求 | 大類 | 來源 |
|------|------|------|
| 以斯拉書卷／背景／護教 | 聖經書卷難題／舊約／新約／神學 | **以斯拉百科（etspedia）** |
| 英文書卷難題（可 iframe） | 聖經書卷難題 | **Defending Inerrancy** |
| 英文主題 Q&A | 聖經書卷難題 | Christian Answers、GotQuestions、Bible Questions! |
| 改革宗神學問答 | 神學教義難題 | **Reformed Answers** |
| 信徒生活問答 | 信徒教會難題 | **葛培理 Answers**、陳終道系列 |
| 中文查經／章節 | 聖經書卷難題 | **華人查經網 ccbiblestudy** |

舊導覽頁仍保留於 `qna/qna_*_index.htm`（供直接開啟或日後參考），**不再出現在頂列大類**。

## 日後可考慮新增的外站（需可爬＋prefer iframe 或接受新分頁）

1. **CARM.org**（Christian Apologetics & Research Ministry）— 英文護教／聖經難題，結構化 Q&A。
2. **Answers in Genesis**（answersingenesis.org）— 創造／護教；與現有 A 類互補。
3. **Bible.org / NET Bible notes** — 逐節註釋中的疑難說明（偏研讀，非純 Q&A）。
4. **GotQuestions 中文** — 擴充現有 `gotquestions` bundle（目前英文較完整）。
5. **台灣／香港教會釋經 Q&A 站** — 若找到穩定、可嵌或可離線鏡像的中文站，優先於英文禁嵌站。

新增流程：`qna/data/qna_data_*.json` → `build_sidebar_bundle.mjs` → `qna_nav_config.js` 登記來源與大類。
