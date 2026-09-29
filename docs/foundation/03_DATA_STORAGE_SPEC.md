# Foundation 0 · 資料儲存規格

**對齊**：`bible100-cross-module-data`、各模組 `*_DATA_RULES.md`。  
**鐵律**：先盤點、再 adapter、後退役；**禁止盤點期全站 rename**。

## 1. 目標命名（新寫入）

```
b100:v1:<domain>:<resource>
```

例：

| Key | 用途 | 風險 |
|-----|------|------|
| `b100:v1:reader:preferences` | 譯本／字級 | R1 |
| `b100:v1:route:progress` | 跑道打卡 | R1 |
| `b100:v1:study:notes` | 研讀筆記 | R1 |
| `b100:v1:qna:drafts` | Q&A 草稿 | R2 |
| `b100:v1:ai:settings` | AI 偏好（無個資） | R1 |
| `b100:v1:export:last` | 上次匯出時間戳 | R0 |

禁止過泛 key：`progress`、`data`、`notes`、`temp`、`cache`、`userState`。

## 2. Lifecycle（正式內容）

適用：教材、Q&A、AI 草稿、聖詩教導稿。

```
draft → needs_review → reviewed → published → retired
```

欄位建議：`author`、`reviewer`、`reviewed_at`、`version`、`source`、`license`、`locale`、`last_updated`。

**不適用**：私人讀經進度／私人筆記——只要「私人、可匯出、可清除」。

## 3. 現況盤點表（複製填）

| 現用 key / 檔 | 模組 | 內容摘要 | 含 PII？ | R 級 | 目標 key | 遷移狀態 |
|---------------|------|----------|----------|------|----------|----------|
| （例）`b100_read_progress_*` | track | 打卡 | 否 | R1 | `b100:v1:route:progress` | 未遷移 |
| | | | | | | |

## 4. 讀者頁狀態提示（人話）

頁腳或側邊一句即可：

- 保存位置：本機  
- 最後保存：……  
- 可見範圍：僅此裝置  

**禁止**在讀者主畫面放：健康摘要、待同步佇列、技術 debug。

## 5. 跨模規則

- 人員主鍵對齊 `member_id`（若涉會友）。  
- 每業務領域一個 canonical 寫入路徑。  
- Smart Ministry 等已有 SSOT 的，跟既有文件，不塞進跑道桶。
