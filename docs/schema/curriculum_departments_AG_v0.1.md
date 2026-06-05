# 課務「系」命名草案（A–G）v0.1

> 討論稿；科／級與 A101、A102 編碼規則之後在 schema 定稿。  
> 曾暫放在 `index_v5_church_layout_v1.html` 主畫面說明區，已改為**僅文件**，避免擠壓雙 iframe。

## 系（課務大類）

| 系 | 名稱 | 備註（科碼僅示意） |
|----|------|---------------------|
| A | 兒童主日學 | 示例：A101、A102…（科／級細則待定） |
| B | 聖經神學 | |
| C | 門徒領袖 | |
| D | 敬拜聖樂 | |
| E | 宣教佈道 | |
| F | 社區服務 | |
| G | 行政管理 | |

## 科／級

未定；對齊 `curriculum_*` 表與學校管理模組後再補。

## index_v5 殼／內容分工（摘要）

- **第一列**：全站模式（`applyMode`）。
- **第二列**：同模式內模組切換，通常同時設定 `sidebarFrame` + `contentFrame`。
- **iframe 內**：側欄連結多數只換 `contentFrame`；深功能用一頁多 Tab。

## church_layout_v1 demo 與總站差異

- `openChurchMinistry()` 載入 `church_ministry/sidebar_church_layout_v1.html` + `dashboard_church_layout_v1.html`。
- 教會模式第二列右側三鈕（教會雷達／工作桌／願景）為示意。
- 總站 `index_v5.html` 仍載入 `sidebar.html` + `dashboard.html`。
