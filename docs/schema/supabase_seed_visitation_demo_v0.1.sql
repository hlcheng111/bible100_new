-- =============================================================================
-- supabase_seed_visitation_demo_v0.1.sql
-- 假資料：50 位會友 + 50 筆探訪紀錄（中文姓名）
-- 對應：docs/schema/supabase_church_core_v0.1.sql
--
-- 使用方式：
--   1. 已在 Supabase 執行過建表 SQL。
--   2. 若已啟用 RLS 且無 insert policy，請暫時以「專案設定 → Database → 使用 service_role」
--      或在 SQL Editor（通常以 postgres 執行）確認可寫入；否則先為 members / visitations
--      新增允許 insert 的 policy，或開發階段關閉 RLS 測試。
--   3. 本腳本可重複執行會造成重複會友；若需「重灌」，請先自行 truncate 或刪除
--      visitations 再 members（注意外鍵順序），本檔不附帶 truncate，避免誤刪正式資料。
-- =============================================================================

-- 先插入 50 位會友；第 4 筆為「王傳道」，供 visitor_member_id 參照
WITH ins_members AS (
  INSERT INTO public.members (name, contact_phone, contact_email, status, campus_id, joined_at, pastoral_region)
  VALUES
    ('陳弟兄', '0912-345678', 'chan@example.com', 'active', 'main', '2020-01-01', '北區'),
    ('李姐妹', '0923-456789', 'lee@example.com', 'active', 'main', '2019-09-15', '中區'),
    ('張先生（新朋友）', NULL, NULL, 'new', 'main', CURRENT_DATE, '未分配'),
    ('王傳道', '0934-567890', 'pastor.wong@example.com', 'staff', 'main', '2015-06-01', '全區'),
    ('林志明', '0945-678901', 'lin@example.com', 'active', 'main', '2018-03-20', '北區'),
    ('黃美玲', '0956-789012', 'huang@example.com', 'active', 'main', '2017-11-05', '中區'),
    ('吳長老', '0967-890123', 'wu@example.com', 'active', 'main', '2010-01-10', '全區'),
    ('劉淑芬', '0978-901234', 'liu@example.com', 'active', 'main', '2019-06-01', '南區'),
    ('趙建國', '0989-012345', 'zhao@example.com', 'active', 'main', '2021-02-14', '北區'),
    ('周雅婷', '0910-123456', 'zhou@example.com', 'active', 'main', '2020-08-08', '中區'),
    ('鄭文雄', '0921-234567', 'zheng@example.com', 'active', 'main', '2016-05-22', '南區'),
    ('蔡佳慧', '0932-345678', 'cai@example.com', 'active', 'main', '2018-12-12', '北區'),
    ('楊俊賢', '0943-456789', 'yang@example.com', 'active', 'main', '2019-04-01', '中區'),
    ('許佩珊', '0954-567890', 'xu@example.com', 'active', 'main', '2017-07-18', '南區'),
    ('盧冠宇', '0965-678901', 'lu@example.com', 'active', 'main', '2022-01-03', '北區'),
    ('謝宜君', '0976-789012', 'xie@example.com', 'active', 'main', '2021-09-09', '中區'),
    ('洪偉誠', '0987-890123', 'hong@example.com', 'active', 'main', '2015-11-11', '全區'),
    ('郭書瑋', '0919-901234', 'guo@example.com', 'active', 'main', '2018-02-28', '南區'),
    ('馬秀英', '0920-012345', 'ma@example.com', 'active', 'main', '2016-10-10', '北區'),
    ('邱宗翰', '0931-123456', 'qiu@example.com', 'active', 'main', '2020-05-05', '中區'),
    ('曾心瑜', '0942-234567', 'zeng@example.com', 'active', 'main', '2019-08-19', '南區'),
    ('廖志豪', '0953-345678', 'liao@example.com', 'active', 'main', '2017-03-03', '北區'),
    ('賴怡靜', '0964-456789', 'lai@example.com', 'active', 'main', '2021-11-11', '中區'),
    ('顏柏翰', '0975-567890', 'yan@example.com', 'active', 'main', '2018-06-06', '南區'),
    ('江語彤', '0986-678901', 'jiang@example.com', 'active', 'main', '2022-04-04', '北區'),
    ('范承恩', '0918-789012', 'fan@example.com', 'active', 'main', '2019-12-25', '中區'),
    ('彭子晴', '0929-890123', 'peng@example.com', 'active', 'main', '2020-07-07', '南區'),
    ('簡睿哲', '0940-901234', 'jian@example.com', 'active', 'main', '2016-09-09', '北區'),
    ('陳雅筑', '0951-012345', 'chen.yz@example.com', 'active', 'main', '2017-01-01', '中區'),
    ('李冠廷', '0962-123456', 'lee.gt@example.com', 'active', 'main', '2021-06-06', '南區'),
    ('張芸甄', '0973-234567', 'chang@example.com', 'active', 'main', '2018-04-14', '北區'),
    ('王志豪', '0984-345678', 'wang.zh@example.com', 'active', 'main', '2015-08-08', '全區'),
    ('林孟儒', '0905-456789', 'lin.mr@example.com', 'active', 'main', '2019-10-10', '中區'),
    ('黃詩涵', '0916-567890', 'huang.sh@example.com', 'active', 'main', '2020-02-02', '南區'),
    ('吳承澤', '0927-678901', 'wu.cz@example.com', 'active', 'main', '2017-05-17', '北區'),
    ('劉品妍', '0938-789012', 'liu.py@example.com', 'active', 'main', '2022-03-03', '中區'),
    ('趙奕辰', '0949-890123', 'zhao.yc@example.com', 'active', 'main', '2016-12-12', '南區'),
    ('周品睿', '0960-901234', 'zhou.pr@example.com', 'active', 'main', '2018-09-09', '北區'),
    ('鄭羽彤', '0971-012345', 'zheng.yt@example.com', 'active', 'main', '2021-01-20', '中區'),
    ('蔡宗穎', '0982-123456', 'cai.zy@example.com', 'active', 'main', '2019-07-07', '南區'),
    ('楊舒涵', '0903-234567', 'yang.sh@example.com', 'active', 'main', '2020-11-11', '北區'),
    ('許哲維', '0914-345678', 'xu.zw@example.com', 'active', 'main', '2017-04-04', '中區'),
    ('盧佳玲', '0925-456789', 'lu.jl@example.com', 'active', 'main', '2018-08-18', '南區'),
    ('謝秉宏', '0936-567890', 'xie.bh@example.com', 'active', 'main', '2015-10-20', '全區'),
    ('洪宜臻', '0947-678901', 'hong.yz@example.com', 'active', 'main', '2022-06-06', '北區'),
    ('郭昱安', '0958-789012', 'guo.ya@example.com', 'active', 'main', '2019-05-05', '中區'),
    ('馬翊萱', '0969-890123', 'ma.yx@example.com', 'active', 'main', '2020-12-24', '南區'),
    ('邱冠儒', '0980-901234', 'qiu.gr@example.com', 'active', 'main', '2016-06-06', '北區'),
    ('曾若琳', '0911-012345', 'zeng.rl@example.com', 'active', 'main', '2018-01-15', '中區'),
    ('廖奕廷', '0922-123456', 'liao.yt@example.com', 'active', 'main', '2021-08-08', '南區')
  RETURNING id
),
numbered AS (
  SELECT id, row_number() OVER (ORDER BY id) AS rn
  FROM ins_members
),
pastor AS (
  SELECT id AS pastor_id FROM numbered WHERE rn = 4
)
INSERT INTO public.visitations (
  member_id,
  visitor_member_id,
  visit_date,
  visit_type,
  origin,
  summary,
  detail_notes,
  follow_up_action,
  priority,
  status,
  case_id
)
SELECT
  n.id,
  CASE
    WHEN n.rn IN (1, 2, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47) THEN p.pastor_id
    ELSE NULL
  END,
  (CURRENT_DATE - ((n.rn * 3) % 14))::date,
  (ARRAY['家訪', '醫院', '電話', '線上', '一般關懷', '新朋友', '病患長者', '流失預警'])[1 + (n.rn % 8)],
  (ARRAY['牧者交辦', '系統流失預警', '會友主動', '小組回報', '年度關懷'])[1 + (n.rn % 5)],
  CASE n.rn
    WHEN 1 THEN '關心最近未出席情況，約定下週再聯絡。'
    WHEN 2 THEN '術後探訪，與家人一起禱告。'
    WHEN 3 THEN '首次主日後電話關懷，介紹小組與教會活動。'
    ELSE '例行關懷：近況問安、禱告扶持，並記錄後續跟進。'
  END,
  CASE WHEN n.rn % 4 = 0 THEN '詳述：家庭、工作、身心狀況已記錄於內部牧養筆記。' ELSE NULL END,
  CASE n.rn % 3
    WHEN 0 THEN '牧者跟進、小組多關心'
    WHEN 1 THEN '祈禱代求'
    ELSE '實際援助（探病、物資）'
  END,
  (ARRAY['高', '中', '低'])[1 + (n.rn % 3)],
  (ARRAY['pending', 'planned', 'done'])[1 + (n.rn % 3)],
  NULL
FROM numbered n
CROSS JOIN pastor p;

-- 驗證（可選）：應為 50 / 50
-- SELECT (SELECT count(*) FROM public.members)::text || ' members';
-- SELECT (SELECT count(*) FROM public.visitations)::text || ' visitations';
