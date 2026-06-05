# Smart Tools 頂部互動工具箱

## 架構

```
languages/
├── js/
│   ├── smart_tools.css    # 樣式（sticky、毛玻璃、聖經綠）
│   ├── smart_tools.js     # 邏輯（路徑解析、PROMPT_DICT、4-5 Tab）
│   └── SMART_TOOLS_README.md
scripts/
└── inject_smart_header.py # 批次注入腳本
```

## 功能

- **經文背景**：顯示 context.tips（OIA 提點）
- **影音教材**：YouTube iframe，支援多 Tab（videos 陣列）
- **AI 拼裝車**：依 OT/NT/T4 顯示不同選單，多語系 Prompt
- **課後測驗**：選擇題互動 + **Canvas 學習卡**（一鍵生成 PNG 下載）
- **靈修/FAQ**（選用）：NotebookLM 整合 - 音頻、疑難解答、深度思考題

## 插入位置

工具箱插入在「← 返回目錄」之後，避免與右側 TOC 重疊。

## localConfig 範例

在 `</body>` 前加入（須在 inject 區塊之前）：

```html
<script>
window.localConfig = {
  type: "OT",
  lang: "zh-Hant",
  title: "第 X 課",
  videoID: "xxx",
  videos: [{id: "xxx", label: "解析"}, {id: "yyy", label: "音樂"}],
  quiz: [{q: "問題1", options: ["A","B","C"], a: 0}],
  context: { title: "標題", tips: ["觀察：...", "解釋：...", "應用：..."] },
  // NotebookLM 整合（選用）
  audio: { url: "https://...", label: "靈修聽力" },
  faq: [{q: "問題？", a: "答案"}],
  deepQuestions: ["深度思考題1", "深度思考題2"]
};
</script>
```

## 批次注入

```bash
# 預覽（不寫入）
python scripts/inject_smart_header.py --dry-run

# 注入前備份
python scripts/inject_smart_header.py --backup

# 僅處理部分檔案
python scripts/inject_smart_header.py --test chapter2 --limit 5
python scripts/inject_smart_header.py --file "languages/cn/OT/chapters/chapter2.html"
```

## 備份與還原

- `--backup` 會複製 `languages/` 到 `languages_backup/`
- 還原：刪除 `languages/`，將 `languages_backup/` 改名為 `languages/`

## 上雲端技術注意

| 功能 | 技術 | 雲端限制 |
|------|------|----------|
| Canvas 學習卡 | 純前端 Canvas API | 無，靜態託管即可 |
| NotebookLM 音頻 | `<audio src="URL">` | 音頻 URL 需 CORS 允許，或同源 |
| YouTube | iframe embed | 無，Google 允許嵌入 |
| 批次注入 | Python 腳本 | 本地執行，不影響部署 |

建議：音頻若來自 NotebookLM 匯出，可上傳至同網域或支援 CORS 的 CDN。

## 已測試

- `languages/cn/OT/chapters/chapter2.html` 已注入並加入範例 localConfig（含 audio、faq、deepQuestions）
