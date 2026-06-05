-- =============================================================================
-- supabase_seed_school_discipleship_planning_v0.1.sql
-- School / Discipleship / Planning 假資料種子（約 50 筆級別核心記錄）
-- =============================================================================
--
-- 依賴：須先執行
--   1) docs/schema/supabase_church_core_v0.1.sql
--   2) docs/schema/supabase_school_discipleship_planning_v0.1.sql
--
-- 一次貼入 Supabase SQL Editor 執行後，預期約略：
--   · 50 members（學校／門訓示範用會友）
--   · 10 teachers、10 courses、50 students、50 enrollments
--   · 20 class_sessions、50 class_attendance
--   · 5 discipleship_classes、50 discipleship_enrollments
--   · 2 planning_history、2 planning_vision、5 planning_surveys、50 planning_survey_responses、5 planning_ai_summaries
--   · 若干 ai_chat_history、ai_insights
--
-- 若已啟用 RLS，請確認有 insert policy 或使用具權限角色執行。
-- 重複執行會重複插入；正式環境請先備份或 truncate（注意外鍵順序）。
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- A) 50 位會友（學校／門訓共用）
-- ---------------------------------------------------------------------------
with ins_members as (
  insert into public.members (name, status, campus_id, joined_at, pastoral_region)
  values
    ('林小明', 'active', 'main', '2018-03-01', '北區'),
    ('陳小芳', 'active', 'main', '2019-01-10', '中區'),
    ('黃阿華', 'active', 'main', '2020-06-01', '南區'),
    ('張雅文', 'active', 'main', '2017-11-20', '北區'),
    ('吳志強', 'active', 'main', '2016-05-15', '中區'),
    ('劉佳玲', 'active', 'main', '2021-02-28', '南區'),
    ('鄭家豪', 'active', 'main', '2015-09-09', '北區'),
    ('許淑娟', 'active', 'main', '2018-12-01', '中區'),
    ('蔡承恩', 'active', 'main', '2019-07-07', '南區'),
    ('楊美玲', 'active', 'main', '2020-01-15', '北區'),
    ('謝俊傑', 'active', 'main', '2017-04-22', '中區'),
    ('曾怡君', 'active', 'main', '2022-03-03', '南區'),
    ('廖文龍', 'active', 'main', '2016-10-10', '全區'),
    ('賴欣怡', 'active', 'main', '2018-08-18', '北區'),
    ('江冠宇', 'active', 'main', '2019-11-11', '中區'),
    ('方詩涵', 'active', 'main', '2021-09-01', '南區'),
    ('彭子安', 'active', 'main', '2015-06-06', '北區'),
    ('簡如筠', 'active', 'main', '2020-12-24', '中區'),
    ('羅偉誠', 'active', 'main', '2017-01-30', '南區'),
    ('葉靜宜', 'active', 'main', '2018-05-05', '北區'),
    ('蘇建宏', 'active', 'main', '2019-02-14', '中區'),
    ('呂宜臻', 'active', 'main', '2022-01-01', '南區'),
    ('魏書豪', 'active', 'main', '2016-12-12', '全區'),
    ('田芷琳', 'active', 'main', '2020-07-07', '北區'),
    ('杜冠廷', 'active', 'main', '2017-09-09', '中區'),
    ('白羽彤', 'active', 'main', '2018-11-11', '南區'),
    ('邱奕辰', 'active', 'main', '2021-04-04', '北區'),
    ('金品睿', 'active', 'main', '2019-08-08', '中區'),
    ('范宗穎', 'active', 'main', '2015-03-03', '南區'),
    ('夏舒涵', 'active', 'main', '2022-06-06', '北區'),
    ('鍾哲維', 'active', 'main', '2017-07-18', '中區'),
    ('姜佳玲', 'active', 'main', '2018-02-02', '南區'),
    ('范秉宏', 'active', 'main', '2020-10-10', '北區'),
    ('石宜臻', 'active', 'main', '2016-04-04', '中區'),
    ('姚昱安', 'active', 'main', '2019-12-12', '南區'),
    ('戴翊萱', 'active', 'main', '2021-01-20', '北區'),
    ('夏冠儒', 'active', 'main', '2017-11-11', '中區'),
    ('汪若琳', 'active', 'main', '2018-06-06', '南區'),
    ('田奕廷', 'active', 'main', '2020-05-05', '北區'),
    ('白心瑜', 'active', 'main', '2019-03-03', '中區'),
    ('石宗翰', 'active', 'main', '2015-08-08', '全區'),
    ('江孟儒', 'active', 'main', '2022-02-02', '南區'),
    ('金詩涵', 'active', 'main', '2017-12-12', '北區'),
    ('羅承澤', 'active', 'main', '2018-09-09', '中區'),
    ('葉品妍', 'active', 'main', '2020-08-08', '南區'),
    ('蘇奕辰', 'active', 'main', '2016-01-01', '北區'),
    ('呂品睿', 'active', 'main', '2021-11-11', '中區'),
    ('魏羽彤', 'active', 'main', '2019-04-04', '南區'),
    ('田宗穎', 'active', 'main', '2018-07-07', '北區'),
    ('杜舒涵', 'active', 'main', '2020-03-03', '中區'),
    ('白哲維', 'active', 'main', '2017-05-05', '南區')
  returning id
),
numbered as (
  select id, row_number() over (order by id) as rn
  from ins_members
),
ins_teachers as (
  insert into public.teachers (name, title, contact_email, campus_id, status)
  values
    ('王老師', '主日學主任', 'wang@school.demo', 'main', 'active'),
    ('李老師', '青少年導師', 'lee@school.demo', 'main', 'active'),
    ('張老師', '基要課教師', 'chang@school.demo', 'main', 'active'),
    ('陳老師', '門訓助教', 'chen@school.demo', 'main', 'active'),
    ('林老師', '行政組長', 'lin@school.demo', 'main', 'active'),
    ('黃老師', '音樂老師', 'huang@school.demo', 'main', 'active'),
    ('吳老師', '課程規劃', 'wu@school.demo', 'main', 'active'),
    ('劉老師', '輔導老師', 'liu@school.demo', 'main', 'active'),
    ('鄭老師', '教材編輯', 'zheng@school.demo', 'main', 'active'),
    ('周老師', '外展事工', 'zhou@school.demo', 'main', 'active')
  returning id
),
teach_ord as (
  select id, row_number() over (order by id) as tn
  from ins_teachers
),
ins_courses as (
  insert into public.courses (name, course_type, semester, campus_id, credit_hours, teacher_id, status, description)
  select v.nm, v.ct, '2026春季', 'main', v.cr, t.id, 'open', v.ds
  from (
    values
      (1, '基要真理班', '主日學', 1.0, '創造、墮落、救贖概論'),
      (2, '青少年主日學', '主日學', 1.0, '信仰生活與同儕見證'),
      (3, '門徒訓練一', '門訓', 2.0, '靈修、禱告、見證'),
      (4, '門徒訓練二', '門訓', 2.0, '服事恩賜與團隊'),
      (5, '舊約概覽', '聖經', 1.5, '歷史書與智慧文學'),
      (6, '新約概覽', '聖經', 1.5, '福音書與書信'),
      (7, '家庭與婚姻', '生活', 1.0, '聖經觀點與實務'),
      (8, '敬拜與音樂', '音樂', 1.0, '詩歌與樂理基礎'),
      (9, '宣教導論', '宣教', 1.0, '大使命與跨文化'),
      (10, '初信造就', '初信', 1.0, '新生活與教會生活')
  ) as v(rn, nm, ct, cr, ds)
  join teach_ord t on t.tn = v.rn
  returning id, name
),
course_ord as (
  select id, row_number() over (order by id) as cn
  from ins_courses
),
ins_students as (
  insert into public.students (member_id, display_name, student_code, grade, campus_id, status)
  select n.id, m.name, 'STU2026' || lpad(n.rn::text, 3, '0'),
         case when n.rn % 3 = 0 then '國中' when n.rn % 3 = 1 then '高中' else '大學' end,
         'main', 'active'
  from numbered n
  join public.members m on m.id = n.id
  returning id, member_id
),
stud_ord as (
  select id, row_number() over (order by id) as sn
  from ins_students
),
ins_enroll as (
  insert into public.enrollments (student_id, course_id, status, enrolled_at)
  select s.id, c.id, 'enrolled', current_date - (s.sn % 30)
  from stud_ord s
  join course_ord c on c.cn = ((s.sn - 1) % 10) + 1
  returning id
),
ins_sessions as (
  insert into public.class_sessions (course_id, session_no, session_date, start_time, end_time, room, topic)
  select c.id, sn, current_date - (20 - sn * 7), '09:30'::time, '11:00'::time,
         '教室' || ((c.cn % 5) + 1), '第' || sn || '堂：' || left(co.name, 8)
  from course_ord c
  join public.courses co on co.id = c.id
  cross join lateral (values (1), (2)) as s(sn)
  returning id, course_id, session_no
),
sess_first as (
  select distinct on (course_id) id as session_id, course_id
  from ins_sessions
  order by course_id, session_no
)
insert into public.class_attendance (session_id, student_id, attendance_type, status, remark)
select sf.session_id, st.id, 'present', 'confirmed', '種子資料'
from public.enrollments e
join public.students st on st.id = e.student_id
join sess_first sf on sf.course_id = e.course_id;

commit;

-- ---------------------------------------------------------------------------
-- B) 門訓：5 班級 + 50 修課（每位會友一班）
-- ---------------------------------------------------------------------------
begin;

with ins_dc as (
  insert into public.discipleship_classes (name, level, campus_id, status, start_date, end_date, description)
  values
    ('門徒 I · 基礎', '初階', 'main', 'open', '2026-01-05', '2026-06-30', '信仰基礎與靈修習慣'),
    ('門徒 II · 成長', '中階', 'main', 'open', '2026-01-05', '2026-06-30', '服事與見證'),
    ('小組長培訓', '領袖', 'main', 'open', '2026-02-01', '2026-08-31', '帶領討論與關懷'),
    ('舊約精讀', '進階', 'main', 'open', '2026-03-01', '2026-12-15', '歷史脈絡與應用'),
    ('新約精讀', '進階', 'main', 'open', '2026-03-01', '2026-12-15', '福音神學與書信')
  returning id
),
dc_ord as (
  select id, row_number() over (order by id) as dn
  from ins_dc
),
pool as (
  select m.id as member_id, row_number() over (order by m.id) as rn
  from public.members m
  where m.name in (
    select unnest(array[
      '林小明','陳小芳','黃阿華','張雅文','吳志強','劉佳玲','鄭家豪','許淑娟','蔡承恩','楊美玲',
      '謝俊傑','曾怡君','廖文龍','賴欣怡','江冠宇','方詩涵','彭子安','簡如筠','羅偉誠','葉靜宜',
      '蘇建宏','呂宜臻','魏書豪','田芷琳','杜冠廷','白羽彤','邱奕辰','金品睿','范宗穎','夏舒涵',
      '鍾哲維','姜佳玲','范秉宏','石宜臻','姚昱安','戴翊萱','夏冠儒','汪若琳','田奕廷','白心瑜',
      '石宗翰','江孟儒','金詩涵','羅承澤','葉品妍','蘇奕辰','呂品睿','魏羽彤','田宗穎','杜舒涵','白哲維'
    ])
  )
)
insert into public.discipleship_enrollments (member_id, class_id, status, started_at, progress_note)
select p.member_id, d.id, 'enrolled', current_date - 45,
       '進度正常，已完成第' || ((p.rn % 4) + 1) || '單元。'
from pool p
join dc_ord d on d.dn = ((p.rn - 1) / 10) + 1;

commit;

-- ---------------------------------------------------------------------------
-- C) AI：對話與洞察（示範）
-- ---------------------------------------------------------------------------
begin;

insert into public.ai_chat_history (member_id, session_key, role, content, summary, tags)
select m.id, 'demo-session-' || m.id, 'user',
       '我想更了解如何為家人禱告。',
       '關心家庭禱告主題',
       array['禱告', '家庭']
from public.members m
where m.name in ('林小明', '陳小芳', '黃阿華', '張雅文', '吳志強')
limit 5;

insert into public.ai_chat_history (member_id, session_key, role, content, summary, tags)
select m.id, 'demo-session-' || m.id, 'assistant',
       '可以從感恩與代求兩方面開始，每天固定十分鐘…',
       '建議簡短禱告流程',
       array['禱告']
from public.members m
where m.name in ('林小明', '陳小芳', '黃阿華', '張雅文', '吳志強')
limit 5;

insert into public.ai_insights (member_id, insight_type, title, body, confidence)
select m.id, 'pastoral', '關懷提醒', '受訪者表達對家庭關係的焦慮，建議小組長跟進。', 0.82
from public.members m
where m.name in ('劉佳玲', '鄭家豪', '許淑娟', '蔡承恩', '楊美玲')
limit 5;

commit;

-- ---------------------------------------------------------------------------
-- D) Planning：Step 0–3 示範
-- ---------------------------------------------------------------------------
begin;

insert into public.planning_history (campus_id, period_year, history_text, health_summary, self_description, ministry_id)
values
  ('main', 2026, '本會於 1995 年植堂，至今約 30 年，曾歷經兩次分堂與一次建堂。', '主日出席穩定，青少年比例略降，長者關懷需求上升。', '我們是一群願意接待新朋友、在社區中作光作鹽的弟兄姐妹。', null),
  ('main', 2025, '前一年度曾推動門訓與小組倍增，疫情後實體聚會已恢復。', '財務大致穩健，同工疲勞感需關注。', '教會自評：在敬拜與教導上較強，外展與社區連結可再加強。', null);

insert into public.planning_vision (mission_statement, vision_statement, key_verses, core_values, ministry_id)
values
  ('使人作門徒，在愛中建立基督身體。', '五年內成為社區中可信賴的屬靈家園，每週有百人穩定敬拜。', '馬太福音 28:19-20；使徒行傳 1:8',
   '["愛神愛人", "真理紮根", "使命導向", "團隊同行"]'::jsonb, null),
  ('回應大使命，在城巿中見證福音。', '培育 50 位小組長，建立 30 個活力小組。', '約翰福音 15:5',
   '["禱告優先", "門徒導向", "跨代同行"]'::jsonb, null);

insert into public.planning_surveys (survey_key, version, title, questions_json, status)
values
  ('congregation_health_2026', 1, '會眾健康度問卷 v1',
   '[{"id":"q1","text":"你多久參加一次主日？"},{"id":"q2","text":"你對小組生活的滿意度？"}]'::jsonb, 'published'),
  ('leader_readiness_2026', 1, '領袖預備度調查 v1',
   '[{"id":"q1","text":"你是否願意接受門訓？"},{"id":"q2","text":"你每週靈修時間？"}]'::jsonb, 'published'),
  ('mission_alignment_2026', 1, '使命對齊度問卷 v1',
   '[{"id":"q1","text":"你是否能說出教會使命？"}]'::jsonb, 'published'),
  ('youth_engagement_2026', 1, '青少年參與度 v1',
   '[{"id":"q1","text":"你最常參加哪類聚會？"}]'::jsonb, 'published'),
  ('care_ministry_2026', 1, '關懷事工需求 v1',
   '[{"id":"q1","text":"你是否需要一對一關懷？"}]'::jsonb, 'draft');

with surveys as (
  select id, survey_key, version, row_number() over (order by id) as sn
  from public.planning_surveys
  where survey_key in (
    'congregation_health_2026', 'leader_readiness_2026', 'mission_alignment_2026',
    'youth_engagement_2026', 'care_ministry_2026'
  )
),
resp as (
  select s.id as survey_id, s.version, gs.i,
         m.id as respondent_member_id,
         jsonb_build_object(
           'q1', (array['每週', '隔週', '每月', '不定期'])[1 + (gs.i % 4)],
           'q2', (array['滿意', '普通', '待加強'])[1 + (gs.i % 3)],
           'note', '種子回覆 #' || gs.i
         ) as answers_json
  from surveys s
  cross join lateral generate_series(1, 10) as gs(i)
  join public.members m on m.id = (
    select id from public.members order by id offset ((s.sn - 1) * 10 + gs.i - 1) limit 1
  )
)
insert into public.planning_survey_responses (survey_id, version, respondent_member_id, respondent_label, answers_json, submitted_at)
select r.survey_id, r.version, r.respondent_member_id, null, r.answers_json, now() - (r.i || ' hours')::interval
from resp r;

insert into public.planning_ai_summaries (survey_id, response_batch_key, summary_text, recommendations_json)
select ps.id, 'batch-' || ps.survey_key || '-2026Q1',
       '綜合 ' || ps.title || '：會眾參與度整體正向，建議加強青少年與初信跟進。',
       '[{"action":"加開門徒班","owner":"教育牧區"},{"action":"小組長培訓","owner":"牧養部"}]'::jsonb
from public.planning_surveys ps;

commit;

-- =============================================================================
-- 驗證用（需要時取消註解）：
-- select 'members' as t, count(*)::text from public.members where name like any (array['林小明%','陳小芳%']); -- 示意
-- select 'students', count(*) from public.students;
-- select 'enrollments', count(*) from public.enrollments;
-- select 'discipleship_enrollments', count(*) from public.discipleship_enrollments;
-- select 'planning_survey_responses', count(*) from public.planning_survey_responses;
-- select 'planning_ai_summaries', count(*) from public.planning_ai_summaries;
-- =============================================================================
