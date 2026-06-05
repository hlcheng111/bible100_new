教會長期計劃 · 靜態功能模組（與 church_ministry、school_management 同級）
================================================================================
- planning/index.html   流程總覽：分頁（Step 0～3 + 第二階段）+ iframe，黃底 fill-zone 為填寫區
- assets/shell.js       在 index 內嵌 iframe 時隱藏重複「前往下一步」大按鈕
- dashboard.html        戰情總覽（摘要 + 年度草稿）
- sidebar.html          給 index_v5 左欄；預設入口＝流程總覽、戰情
- page_see.html         ① 看
- page_learn.html       ② 學
- page_fill.html        ③ 填（Next 工作台）
- page_reports.html     ④ 報表

雲端填寫與資料庫：見上一層資料夾 church-planning（Next.js + Supabase）
