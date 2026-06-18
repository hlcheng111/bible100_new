# 小白營運與後續維護指南

## 每日（牧者 / 組長）

1. 打開 App Web 版「教會儀表板」查看小組完成率
2. 回覆「讀經問答」中待答問題（須神學審核 checklist）
3. 核銷換物券：在 Google Sheets `vouchers` 將 `redeemed` 改為 `TRUE`

## 每週（內容同工）

1. 更新 Sheets `resources` Tab：本週共讀書卷的 YouTube / 文章連結
2. 在「小組共讀」建立下週 `groupSession`
3. 檢查越 / 印 AI 草稿是否已人工校對

## 每月（技術義工）

1. Firebase Console → Usage：確認 Firestore 讀寫與 Storage 用量
2. Crashlytics / 商店評論
3. 執行 `npm test` 與 `python bible_app/tests/test_reading_tracks.py`

## 每季（教會決策）

1. 審核譯本授權續約（見 `LICENSE_BIBLE_VERSIONS.md`）
2. 調整跑道或新增 `bible_in_year`
3. 精選優質 AI 資產至教會園地

## 新教會 Onboarding

1. Firebase 建立 `churches/{churchId}` 文件
2. 新增牧者至 `members` 子集合，`role: pastor`
3. Google Form 報名 → Sheets `registrations` → 每日匯入
4. 發送 App 下載連結與 `churchId` 給會眾

## 常見問題

| 問題 | 處理 |
|------|------|
| 經文顯示空白 | 執行 `npm run build:bible` 匯入離線包 |
| 進度不同步 | 確認已登入 Firebase；訪客模式僅本機 |
| 兒童帳號隱私 | 啟用家長連結；不收集多餘 PII |
