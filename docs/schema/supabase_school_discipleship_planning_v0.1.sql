-- =============================================================================
-- supabase_school_discipleship_planning_v0.1.sql
-- School（學校）／Discipleship & AI（門訓）／Planning（長期計劃）建表
-- 依據：docs/schema/全站DB藍圖_v0.1.md §3–§5
-- =============================================================================
--
-- 依賴：須先執行 docs/schema/supabase_church_core_v0.1.sql
--       （public.members、church_core_set_updated_at() 須已存在）
--
-- Supabase 注意事項：
-- - 建表後請在 Dashboard 為各表啟用 Row Level Security（RLS），並依教會角色撰寫 policy。
-- - anon key 不應在未設 policy 時暴露個資；開發階段可暫用 service_role 或寬鬆 policy 僅限測試。
-- - PostgREST 會自動暴露 public 表為 REST API（supabase-js）。
-- =============================================================================

-- 若單獨重跑本檔，確保 updated_at 觸發函式存在（與 core 相同定義）
create or replace function public.church_core_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- =============================================================================
-- § SchoolMasterDatabase
-- =============================================================================

-- -----------------------------------------------------------------------------
-- students：學員（可選連結會友 member_id）
-- -----------------------------------------------------------------------------
create table public.students (
  id                bigserial primary key,
  member_id         bigint references public.members (id) on delete set null,
  display_name      text not null,
  student_code      text,
  birth_date        date,
  grade             text,
  guardian_name     text,
  guardian_phone    text,
  campus_id         text,
  status            text not null default 'active',
  metadata          jsonb default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  created_by        uuid,
  updated_by        uuid,
  is_deleted        boolean not null default false
);

create index idx_students_member_id on public.students (member_id) where is_deleted = false;
create index idx_students_campus_id on public.students (campus_id) where is_deleted = false;
create index idx_students_status on public.students (status) where is_deleted = false;

create trigger trg_students_updated_at
  before update on public.students
  for each row execute function public.church_core_set_updated_at();

-- -----------------------------------------------------------------------------
-- teachers：教師（可連 members 或獨立）
-- -----------------------------------------------------------------------------
create table public.teachers (
  id                bigserial primary key,
  member_id         bigint references public.members (id) on delete set null,
  name              text not null,
  title             text,
  contact_email     text,
  contact_phone     text,
  campus_id         text,
  status            text not null default 'active',
  metadata          jsonb default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  created_by        uuid,
  updated_by        uuid,
  is_deleted        boolean not null default false
);

create index idx_teachers_member_id on public.teachers (member_id) where is_deleted = false;
create index idx_teachers_campus_id on public.teachers (campus_id) where is_deleted = false;

create trigger trg_teachers_updated_at
  before update on public.teachers
  for each row execute function public.church_core_set_updated_at();

-- -----------------------------------------------------------------------------
-- courses：課程主檔
-- -----------------------------------------------------------------------------
create table public.courses (
  id                bigserial primary key,
  name              text not null,
  course_type       text,
  semester          text,
  campus_id         text,
  credit_hours      numeric(4, 1),
  teacher_id        bigint references public.teachers (id) on delete set null,
  status            text not null default 'open',
  description       text,
  metadata          jsonb default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  created_by        uuid,
  updated_by        uuid,
  is_deleted        boolean not null default false
);

create index idx_courses_campus_id on public.courses (campus_id) where is_deleted = false;
create index idx_courses_teacher_id on public.courses (teacher_id) where is_deleted = false;

create trigger trg_courses_updated_at
  before update on public.courses
  for each row execute function public.church_core_set_updated_at();

-- -----------------------------------------------------------------------------
-- enrollments：選課
-- -----------------------------------------------------------------------------
create table public.enrollments (
  id                bigserial primary key,
  student_id        bigint not null references public.students (id) on delete cascade,
  course_id         bigint not null references public.courses (id) on delete cascade,
  status            text not null default 'enrolled',
  grade             text,
  enrolled_at       date default current_date,
  completed_at      date,
  metadata          jsonb default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  created_by        uuid,
  updated_by        uuid,
  is_deleted        boolean not null default false,
  unique (student_id, course_id)
);

create index idx_enrollments_student_id on public.enrollments (student_id) where is_deleted = false;
create index idx_enrollments_course_id on public.enrollments (course_id) where is_deleted = false;
create index idx_enrollments_student_course on public.enrollments (student_id, course_id) where is_deleted = false;

create trigger trg_enrollments_updated_at
  before update on public.enrollments
  for each row execute function public.church_core_set_updated_at();

-- -----------------------------------------------------------------------------
-- class_sessions：上課場次
-- -----------------------------------------------------------------------------
create table public.class_sessions (
  id                bigserial primary key,
  course_id         bigint not null references public.courses (id) on delete cascade,
  session_no        integer not null default 1,
  session_date      date not null,
  start_time        time without time zone,
  end_time          time without time zone,
  room              text,
  topic             text,
  metadata          jsonb default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  created_by        uuid,
  updated_by        uuid,
  is_deleted        boolean not null default false
);

create index idx_class_sessions_course_id on public.class_sessions (course_id) where is_deleted = false;
create index idx_class_sessions_session_date on public.class_sessions (session_date) where is_deleted = false;

create trigger trg_class_sessions_updated_at
  before update on public.class_sessions
  for each row execute function public.church_core_set_updated_at();

-- -----------------------------------------------------------------------------
-- class_attendance：課堂出席
-- -----------------------------------------------------------------------------
create table public.class_attendance (
  id                bigserial primary key,
  session_id        bigint not null references public.class_sessions (id) on delete cascade,
  student_id        bigint not null references public.students (id) on delete cascade,
  attendance_type   text not null default 'present',
  status            text not null default 'confirmed',
  remark            text,
  metadata          jsonb default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  created_by        uuid,
  updated_by        uuid,
  is_deleted        boolean not null default false,
  unique (session_id, student_id)
);

create index idx_class_attendance_session_id on public.class_attendance (session_id) where is_deleted = false;
create index idx_class_attendance_student_id on public.class_attendance (student_id) where is_deleted = false;

create trigger trg_class_attendance_updated_at
  before update on public.class_attendance
  for each row execute function public.church_core_set_updated_at();

-- =============================================================================
-- § Discipleship & AI
-- =============================================================================

-- -----------------------------------------------------------------------------
-- discipleship_classes：門訓班級
-- -----------------------------------------------------------------------------
create table public.discipleship_classes (
  id                  bigserial primary key,
  name                text not null,
  level               text,
  campus_id           text,
  leader_member_id    bigint references public.members (id) on delete set null,
  status              text not null default 'open',
  start_date          date,
  end_date            date,
  description         text,
  metadata            jsonb default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  created_by          uuid,
  updated_by          uuid,
  is_deleted          boolean not null default false
);

create index idx_discipleship_classes_campus_id on public.discipleship_classes (campus_id) where is_deleted = false;
create index idx_discipleship_classes_leader on public.discipleship_classes (leader_member_id) where is_deleted = false;

create trigger trg_discipleship_classes_updated_at
  before update on public.discipleship_classes
  for each row execute function public.church_core_set_updated_at();

-- -----------------------------------------------------------------------------
-- discipleship_enrollments：門訓修課
-- -----------------------------------------------------------------------------
create table public.discipleship_enrollments (
  id                bigserial primary key,
  member_id         bigint not null references public.members (id) on delete cascade,
  class_id          bigint not null references public.discipleship_classes (id) on delete cascade,
  status            text not null default 'enrolled',
  started_at        date,
  completed_at      date,
  progress_note     text,
  metadata          jsonb default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  created_by        uuid,
  updated_by        uuid,
  is_deleted        boolean not null default false,
  unique (member_id, class_id)
);

create index idx_discipleship_enrollments_member_id on public.discipleship_enrollments (member_id) where is_deleted = false;
create index idx_discipleship_enrollments_class_id on public.discipleship_enrollments (class_id) where is_deleted = false;

create trigger trg_discipleship_enrollments_updated_at
  before update on public.discipleship_enrollments
  for each row execute function public.church_core_set_updated_at();

-- -----------------------------------------------------------------------------
-- ai_chat_history：AI 對話紀錄
-- -----------------------------------------------------------------------------
create table public.ai_chat_history (
  id                bigserial primary key,
  member_id         bigint references public.members (id) on delete set null,
  session_key       text,
  role              text not null default 'user',
  content           text,
  summary           text,
  tags              text[],
  metadata          jsonb default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  created_by        uuid,
  updated_by        uuid,
  is_deleted        boolean not null default false
);

create index idx_ai_chat_history_member_id on public.ai_chat_history (member_id) where is_deleted = false;
create index idx_ai_chat_history_created_at on public.ai_chat_history (created_at desc) where is_deleted = false;

create trigger trg_ai_chat_history_updated_at
  before update on public.ai_chat_history
  for each row execute function public.church_core_set_updated_at();

-- -----------------------------------------------------------------------------
-- ai_insights：AI 洞察
-- -----------------------------------------------------------------------------
create table public.ai_insights (
  id                bigserial primary key,
  member_id         bigint references public.members (id) on delete set null,
  chat_id           bigint references public.ai_chat_history (id) on delete set null,
  insight_type      text,
  title             text,
  body              text,
  confidence        numeric(5, 4),
  metadata          jsonb default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  created_by        uuid,
  updated_by        uuid,
  is_deleted        boolean not null default false
);

create index idx_ai_insights_member_id on public.ai_insights (member_id) where is_deleted = false;
create index idx_ai_insights_chat_id on public.ai_insights (chat_id) where is_deleted = false;

create trigger trg_ai_insights_updated_at
  before update on public.ai_insights
  for each row execute function public.church_core_set_updated_at();

-- =============================================================================
-- § Planning（長期計劃 Step 0–3）
-- =============================================================================

-- -----------------------------------------------------------------------------
-- planning_history：Step 0 教會歷史與健康
-- -----------------------------------------------------------------------------
create table public.planning_history (
  id                  bigserial primary key,
  campus_id           text,
  period_year         integer,
  history_text        text,
  health_summary      text,
  self_description    text,
  ministry_id         bigint references public.ministries (id) on delete set null,
  metadata            jsonb default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  created_by          uuid,
  updated_by          uuid,
  is_deleted          boolean not null default false
);

create index idx_planning_history_campus_id on public.planning_history (campus_id) where is_deleted = false;

create trigger trg_planning_history_updated_at
  before update on public.planning_history
  for each row execute function public.church_core_set_updated_at();

-- -----------------------------------------------------------------------------
-- planning_vision：Step 1 使命異象
-- -----------------------------------------------------------------------------
create table public.planning_vision (
  id                  bigserial primary key,
  mission_statement   text,
  vision_statement    text,
  key_verses          text,
  core_values         jsonb default '[]'::jsonb,
  ministry_id         bigint references public.ministries (id) on delete set null,
  metadata            jsonb default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  created_by          uuid,
  updated_by          uuid,
  is_deleted          boolean not null default false
);

create trigger trg_planning_vision_updated_at
  before update on public.planning_vision
  for each row execute function public.church_core_set_updated_at();

-- -----------------------------------------------------------------------------
-- planning_surveys：問卷定義（含版本）
-- -----------------------------------------------------------------------------
create table public.planning_surveys (
  id                  bigserial primary key,
  survey_key          text not null,
  version             integer not null default 1,
  title               text not null,
  questions_json      jsonb not null default '[]'::jsonb,
  status              text not null default 'draft',
  metadata            jsonb default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  created_by          uuid,
  updated_by          uuid,
  is_deleted          boolean not null default false,
  unique (survey_key, version)
);

create index idx_planning_surveys_survey_key on public.planning_surveys (survey_key) where is_deleted = false;

create trigger trg_planning_surveys_updated_at
  before update on public.planning_surveys
  for each row execute function public.church_core_set_updated_at();

-- -----------------------------------------------------------------------------
-- planning_survey_responses：問卷回覆
-- -----------------------------------------------------------------------------
create table public.planning_survey_responses (
  id                      bigserial primary key,
  survey_id               bigint not null references public.planning_surveys (id) on delete cascade,
  version                 integer not null,
  respondent_member_id    bigint references public.members (id) on delete set null,
  respondent_label        text,
  answers_json            jsonb not null default '{}'::jsonb,
  submitted_at            timestamptz default now(),
  metadata                jsonb default '{}'::jsonb,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  created_by              uuid,
  updated_by              uuid,
  is_deleted              boolean not null default false
);

create index idx_planning_survey_responses_survey_id on public.planning_survey_responses (survey_id) where is_deleted = false;
create index idx_planning_survey_responses_respondent on public.planning_survey_responses (respondent_member_id) where is_deleted = false;

create trigger trg_planning_survey_responses_updated_at
  before update on public.planning_survey_responses
  for each row execute function public.church_core_set_updated_at();

-- -----------------------------------------------------------------------------
-- planning_ai_summaries：Step 3 AI 歸納
-- -----------------------------------------------------------------------------
create table public.planning_ai_summaries (
  id                  bigserial primary key,
  survey_id           bigint references public.planning_surveys (id) on delete set null,
  response_batch_key  text,
  summary_text        text,
  recommendations_json jsonb default '[]'::jsonb,
  metadata            jsonb default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  created_by          uuid,
  updated_by          uuid,
  is_deleted          boolean not null default false
);

create index idx_planning_ai_summaries_survey_id on public.planning_ai_summaries (survey_id) where is_deleted = false;

create trigger trg_planning_ai_summaries_updated_at
  before update on public.planning_ai_summaries
  for each row execute function public.church_core_set_updated_at();

-- =============================================================================
-- 完成後請於 Supabase 啟用 RLS 並撰寫 policies。
-- =============================================================================
