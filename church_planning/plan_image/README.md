# plan_image · 教會規劃工具圖

## 三類（檔名開頭）

| 前缀 | 用途 | 放哪 |
|------|------|------|
| **C** | Concept · Tab① 框架教學圖 | `C/` |
| **R** | Report · Tab③ 靜態示意（可選；多數工具用 JS 動態圖） | `R/` |
| **M** | Method · Tab④ 或輔導手冊用圖 | `M/` |

## 檔名格式（簡版）

```
C{编号}_{toolId}.png
```

也可在中間加自選后缀：`C03_shape_venn.png`  
（编号与 toolId 之间固定；**末尾 `_` 可省略**，Windows 友好）

- **编号**：兩位數，對照 `INDEX.md`（01～18，與「17 量表索引 + RACI」一致）
- **toolId**：英文小寫，與側欄 `data-tool-id` 相同（如 `shape`、`urgent`）

## 您怎麼放圖（小白步驟）

1. 把圖片丟進對應資料夾（Concept 丟 `C/`）
2. 檔名可先隨意（如 `shape圖.png`）
3. 跟 Agent 說「依 INDEX 改名」— 會改成 `C03_shape.png` 這類

## 技術

- 用**相對路徑**引用：`plan_image/C/C03_shape.png`
- `file://` 可開；優先 PNG / SVG / WebP
- 版權素材暫不處理（依專案約定）

## 首批 5 張（Concept · 已建占位）

| 檔名 | 工具 |
|------|------|
| `C/C07_urgent_.svg` | 重要 vs 緊急 · 四象限 |
| `C/C17_ncd.svg` | NCD · 木桶短板 |
| `C/C03_shape_.svg` | SHAPE · 五向度 |
| `C/C13_swot_.svg` | SWOT · TOWS 交叉 |
| `C/C01_spiritual_.svg` | 靈命快評 · 五維 |

您可直接**覆蓋**同名檔，或丟入任意檔名後請 Agent 依 `INDEX.md` 改名。
