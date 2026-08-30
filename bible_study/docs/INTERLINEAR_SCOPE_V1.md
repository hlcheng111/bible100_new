# 逐字對照 · 範圍紀錄（INTERLINEAR_SCOPE_V1）

> **日期**：2026-08-30  
> **頁面**：`bible_study/interlinear/index.html`（Hub：研讀頂欄「逐字」）  
> **目的**：寫死產品邊界，避免再被六語示範殼帶跑；Git 可回退。

## 決議（主人確認）

| 項目 | 決議 |
|------|------|
| 原文語言 | **只做越南文、印尼文** |
| 泰／緬／日／韓 | **刻意不做**（無空白切詞、經庫無對應譯本、負荷與品質都不划算） |
| 越–印詞對詞自動對齊 | 不做（同一節可並列經庫文本，不假裝第 n 詞對第 n 詞） |
| 任意新句中英譯＋文法 | **要做、本機先可用**：已校 overlay → 本機經節 → 譯文記憶 → Gemini 草稿 → MyMemory 草稿 |
| 上雲 FTP | **本機／GitHub 驗收通過前不上雲** |
| 譯文性質 | 非 overlay／經節者一律標 **草稿**，人審後才算教材 |

## 本機可用條件

- 建議：`打开Bible100.bat` → `http://127.0.0.1:8080/bible_study/interlinear/index.html`
- 經節對譯：本機 `bible_reader.db`（越1934、印尼AYT、和合、KJV）
- 任意新句：本機上網；選填 Gemini Key（只存瀏覽器）

## 刻意不做

- 離線、無網、無 Key 仍保證通順譯
- 把原文填進「中文／英文」欄
- 把 Downloads 單頁 HTML 當生產入口

## 回退

Git 分支 `bible-study-bs-w1`；還原本功能時還原 `bible_study/interlinear/` 與 `config/modes.json` 的「逐字」項。
