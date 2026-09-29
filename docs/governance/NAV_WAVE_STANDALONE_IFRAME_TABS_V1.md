# 導覽三波 · 獨立站／外連／Tab（工序）

> 2026-08-31 · **B 已做**：Hub 跑道改 `pages/landing.html`；研讀 landing「主頁」改 `_landing/home.html`。  
> 一波一主題。不要同時大改三個模組 IA。

## 已完成（今日）

- **A** `bba76f5c`：file:// 讀經 + 多語頂欄（☰ 側欄／更多／中文頂欄2 英譯）
- **B** Hub 禁跑道殼中殼；地理／工具／版本／詞典／註釋／原文 landing 不連 `bible_study/index.html`

---

## 波 1 · 獨立站對齊（約 1 次任務／一模組）

**原則**：頂欄1 才需要獨立站。頂欄2 捷徑＝右欄內容，不另做網站。

| 序 | 模組 | 工序 | 完成線 |
|----|------|------|--------|
| 1.1 | 教材 `languages/index.html` | 預設改 `_landing/home` + `index_cn`，與 Hub 同套 | 單開 index 所見＝Hub 教材 |
| 1.2 | AI `ai_tools/index.html` | 預設 `sidebar_lab` + `_landing/home` | 單開不再走舊 dashboard 側欄 |
| 1.3 | 詩歌 | Hub dashboard vs 獨立站播放列表：文案標清「獨立／Hub」 | 不強行合併 UI |
| 1.4 | 智慧事奉 | AI 頂欄2 進 SM 必須明示「換模組／換側欄」 | 小白知道已出國 |
| 1.5 | Q&A | 維持 `qna/index.html` 自有框；Hub 繼續整頁塞右欄（特殊族） | 不改成雙欄殼 |

**不要做**：多語／逐字／地理／釋經各自獨立站。

---

## 波 2 · 外連 iframe vs ↗ 新頁（研讀先、再 Q&A）

**契約**（已有範本 `geography_history_data.js`）：

- `embed:true` → 右欄（無禁嵌、條款允許）
- `embed:false` → `target="_blank"`（YouTube、聖光、登入牆、禁 framing）

| 序 | 範圍 | 工序 |
|----|------|------|
| 2.1 | 研讀側欄外站譯本 | 已 ↗ 的保持；能嵌的標 `data-b100-nav=content` |
| 2.2 | Q&A 來源 | 對照 `qna/SOURCES_PLAN.md`：禁嵌一律飛出 |
| 2.3 | 詩歌 AI 外連 | 維持新分頁 |
| 2.4 | 測試 | 抽 10 條：iframe 非空白；飛出不丟 Hub |

---

## 波 3 · 子功能：Tab 或 首頁←→（先地圖，再動手）

**判斷**：同一條工作流 → 一頁多 Tab。不同任務 → 側欄 L2–L4。連結農場 → landing，不要 Tab。

| 序 | 頁 | 建議 | 不做 |
|----|----|------|------|
| 3.1 | 地理歷史 | 維持 landing + embed 旗 | 不要做成多 Tab |
| 3.2 | `_landing/tools.html` ←→ | 拿掉自製上一頁／下一頁（與總站搶） | 不要再造第二套頂欄 |
| 3.3 | 跑道子頁 | 已有 `page_nav_bar.js` 🏠←→ | 只修壞鏈 |
| 3.4 | 教會 A–G／學校工作台／AI 備課／規劃 ACS | 已有 Tab | 本波不重做 |
| 3.5 | 義工排班 `volunteer_shift/index.html` | 返回列改 content，勿再套儀表板殼 | |

新頁開工前查 `docs/governance/SITE_PAGE_REGISTRY_V1.md` §4。

---

## 每次開工口訣

1. Hub 右欄只載**內容頁**，不載模組 `index.html` / `shell/index.html`。  
2. landing「主頁」= 該模 `_landing/home.html` + `data-b100-nav="content"`。  
3. 改 `modes.json`／`modules.json` 後跑 `node scripts/generate_config_embedded.js`。  
4. 驗收：`file:///C:/Users/hlche/.cursor/bible100_new/index.html` Ctrl+F5。
