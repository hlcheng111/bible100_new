# Firebase 部署

## 集合結構

| 路徑 | 說明 |
|------|------|
| `users/{uid}` | 使用者設定、persona、churchId、streak |
| `users/{uid}/progress/{trackId}_{book}_{ch}` | 章節進度 |
| `users/{uid}/rewards/{rewardId}` | 徽章、券、證書 |
| `churches/{churchId}` | 教會名稱、時區、牧者 ID |
| `churches/{churchId}/members/{uid}` | 角色 RBAC |
| `churches/{churchId}/groups/{groupId}` | 小組 |
| `churches/{churchId}/qna/{qnaId}` | 讀經問答 |
| `groupSessions/{sessionId}` | 小組共讀場次 |
| `aiAssets/{assetId}` | 使用者 AI 產出 |

## 部署

```bash
cd bible_app/firebase
firebase deploy --only firestore:rules,firestore:indexes
firebase deploy --only functions
```

## 環境變數（App）

複製 `app/.env.example` → `app/.env`，填入 Firebase Web 設定。

## Security Rules

見 [`firestore.rules`](firestore.rules) — 多租戶 `churchId` + `pastor > leader > member`。
