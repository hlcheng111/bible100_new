# 聖經跑道 · 教練模組 V1

**狀態：** P0 已實作（Shell 本機）  
**四語：** UI 與 JSON 內容同步提供 zh-Hant / en / vi / id

## 模組與檔案

| 模組 | 頁面 | JS | 說明 |
|------|------|-----|------|
| 今日關卡 | `pages/today.html` | `today_hub.js` | resolveToday + 能量環 + 跳讀經 |
| 讀後教練 | `pages/read-done.html` | `read_done_coach.js` | 應用 + 禱告 + 軟連結 |
| 牧養問答 | `pages/ai-qna.html` | `qna_hub.js` | FAQ + 詞彙 + Prompt 複製 |
| 同跑隊伍 | `pages/pacing.html` | `squad_lite.js` | 本機留言 + 共振 |
| 智慧導師 | `pages/ai-tutor.html` | `mentor_hub.js` | 週回顧 + 跑道建議 |

## 共用核心

- `coach_kernel.js` — resolveToday、readerUrl、weekStats
- `coach_state.js` — `bible100_coach_state_v1`（能量環、小隊）
- `coach_i18n.js` — 四語 UI
- `prompt_guardrails.js` — 無 API Prompt 護欄

## 資料

- `data/coach_reflections.json`
- `data/coach_faq.json`
- `data/coach_glossary.json`

## 原則

1. 不排行榜、不羞辱文案  
2. P0 不內嵌 AI API  
3. 進度沿用 `bible100_read_progress_v1`  
4. UI：`coach-modules.css` 單欄文字流

### 說明頁（招待處）

- `pages/guide-howto.html` + `guide_content.js` — 四語操作說明
- `pages/guide-idea.html` — 四語本站理念

`landing / 今日關卡` → `bible66` → `read-done` →（問答 / 隊伍 / 導師）
