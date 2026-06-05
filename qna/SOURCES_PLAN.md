# 難題來源總表（17 類）· 考證要點與落地對照

本檔與 `qna_nav_config.js`、`tools/build_sidebar_bundle.mjs`、`data/qna_data_*.json` 同步維護。流程見專案規則：`.cursor/rules/external-source-ingestion.mdc`。

---

## 總覽

| # | 顯示名（頂欄2） | sourceId | 大類 | 結構化 JSON（bundle） | 右欄 landing／備註 |
|---|-----------------|------------|------|----------------------|---------------------|
| 1 | 華人護教 | `chineseapologetics` | A | `qna_data_華人護教_聖經難題（錯誤_矛盾）解答.json` | 原站首頁 |
| 2 | 以斯拉·聖經難題 | `equiptoserve` | A | `qna_data_聖經難題_-_以斯拉百科網.json` | etspedia |
| 3 | 以斯拉·申命～路得 | `equiptoserve_deut_ruth` | A | `qna_data_以斯拉百科_申命記～路得記.json` | 同主題列表 |
| 4 | 以斯拉·舊約背景 | `equiptoserve_ot_bg` | A | `qna_data_以斯拉百科_舊約背景.json` | 背景專區 |
| 5 | 以斯拉·新約背景 | `equiptoserve_nt_bg` | A | `qna_data_以斯拉百科_新約背景.json` | 背景專區 |
| 6 | 以斯拉·辯道護教 | `equiptoserve_apologetics` | B | `qna_data_以斯拉百科_辯道護教.json` | 辯道護教 etspedia |
| 7 | 恩泉·陳終道（聖經問答） | `wellsofgrace` | A | `qna_data_恩泉_聖經問題解答_陳終道.json` | wellsofgrace 陳終道索引 |
| 8 | 恩泉·Archer 彙編 | `wellsofgrace_archer` | A | `qna_data_恩泉_聖經難題彙編_Archer.json` | Archer 索引 |
| 9 | 恩泉·《圣经问题解答》陈终道 | `wellsofgrace_chen_book` | A | `qna_data_《圣经问题解答》_-_陈终道.json` | 依 JSON 內 url |
| 10 | 陈终道·旧约 | `wellsofgrace_chen_ot` | A | `qna_data_-_旧约_-_陈终道.json` | 依 JSON |
| 11 | 陈终道·新约 | `wellsofgrace_chen_nt` | A | `qna_data_-_新约_-_陈终道.json` | 依 JSON |
| 12 | 恩泉·蘇佐揚·新約難題 | `wellsofgrace_su_nt` | A | `qna_data_恩泉_新約聖經難題_蘇佐揚.json` | 依 JSON |
| 13 | 恩泉·蘇佐揚·讀經深思 | `wellsofgrace_su_reading` | A | `qna_data_恩泉_讀經深思系列_蘇佐揚.json` | 依 JSON |
| 14 | 恩泉·李道生·舊約難題 | `wellsofgrace_li_ot` | A | `qna_data_恩泉_舊約聖經難題_李道生.json` | 依 JSON |
| 15 | 恩泉·呂鴻基 | `wellsofgrace_lv` | A | `qna_data_恩泉_聖經難題解答_呂鴻基.json` | 依 JSON |
| 16 | 恩泉·難題（卷二） | `wellsofgrace_wenti2` | A | `qna_data_恩泉_難題（卷二）.json` | 依 JSON |
| 17 | 查經網 ccbiblestudy | `ccbiblestudy` | A | `qna_data_華人基督徒查經網站_(_ccbiblestudy_).json` | 依 JSON |
| — | Reformed Answers | `reformedanswers` | B | `qna_data_Reformed_Answers_聖經與神學問答.json` | reformedanswers.org |
| — | Solutions / Defending | `defendinginerrancy` | A | `qna_data_Defending_Inerrancy_Bible_Difficulties.json` | bible-difficulties |
| — | Bible Questions! | `biblequestions` | A | `qna_data_-_Bible_Questions!.json` | 依站點 |
| — | GotQuestions | `gotquestions` | A | 中＋英兩 JSON | content + 中文入口 |
| — | CA 英文 | `christiananswers` | A | `qna_data_Christian_Answers_英文.json` | christiananswers.net |
| — | CA 繁中（目錄） | `christiananswers_zh_trad` | A | （無，左欄 iframe） | `https://christiananswers.net/chinese/trad/home.html` |
| — | CA 印尼 | `christiananswers_id` | A | （無） | `https://christiananswers.net/indonesian/home.html` |
| — | CA 越南 | `christiananswers_vi` | A | （無） | `https://christiananswers.net/vietnamese/home.html` |
| — | 葛培理 Answers | `billygraham` | C | `qna_data_-_Billy_Graham_Answers.json` | billygraham.org/answers |
| — | 證道浸信會 | `logosbaptist` | C | `qna_data_證道浸信會_信仰難題解答.json` | logosbaptist |
| — | 陳終道·神學（第三部分） | `wellsofgrace_chen_theology` | B | `qna_data_第三部分：_神学问题_-_陈终道.json` | 恩泉索引 |
| — | 陳終道·生活（第二部分） | `wellsofgrace_chen_life` | C | `qna_data_第二部分：_生活问题_-_陈终道.json` | 恩泉索引 |
| — | 陳終道·教會（第四部分） | `wellsofgrace_chen_church` | C | `qna_data_第四部分：_教会问题_-_陈终道.json` | 恩泉索引 |

「全部來源」仍用 `all` / `all_B` / `all_C` → `qna_list_auto.htm`。

---

## 各站考證 → 計策（摘要）

### 1. 華人護教
- **考證**：列表多依書卷；url 宜為單題或章節頁。
- **計策**：維持 `subcategories` 為「舊約/創世記」式；bundle 已掛 `chineseapologetics`。

### 2–6. 以斯拉百科（全站／申命～路得／舊約背景／新約背景／辯道）
- **考證**：全站題量大；窄專題（申命～路得、背景、辯道）應 **分 sourceId**，避免側欄單層過長。
- **計策**：五個 id 對五份 JSON；辯道歸 **B**，其餘 **A**。

### 7–16. 恩泉系列
- **考證**：Archer 與陳終道、蘇、李、呂、卷二 **勿混為單一「未分類」**。
- **計策**：**一書系一 sourceId**；陳終道神學／生活／教會拆至 **B/C**。

### 17. ccbiblestudy
- **考證**：目錄結構可能與恩泉不同；先信 JSON 分組。
- **計策**：獨立 `ccbiblestudy`；之後可手選錨點再擴爬。

### Reformed / Defending / Bible Questions!
- **考證**：英文書卷鍵；Bible Questions 與 Defending 分檔。
- **計策**：`defendinginerrancy` 與 `biblequestions` 分開；側欄用英文組名，必要時日後加中文副標。

### GotQuestions
- **考證**：列表頁 vs 文章頁 URL；抽樣確認可讀正文。
- **計策**：中英兩 JSON 合併進 bundle，landing 保留雙語捷徑。

### Christian Answers（多語）
- **考證**：站方 **禁止 framing 整站**；英文題庫已有爬蟲 JSON；繁中／印尼／越南首頁為 **導覽入口**。
- **計策**：英文維持 bundle；繁中／印尼／越南 **無 bundle 時** 左欄 iframe 直開各語 `home`（見 `qna_nav_config.js` 之 `https://...` sidebar）；後續可加 `qna_data_CA_zh_curated.json` 從 [directry](https://christiananswers.net/directry.html) 手選錨點。

### 葛培理、證道浸信會
- **考證**：主題偏生活與初信 → **C**。
- **計策**：bundle 已掛；landing 指向 Answers 專區。

---

## 維護指令

```bash
cd qna
node tools/build_sidebar_bundle.mjs
```

完成後提交 `data/qna_sidebar_bundle.js`（或由 CI 生成）。
