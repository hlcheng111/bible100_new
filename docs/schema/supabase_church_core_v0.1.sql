-- =============================================================================
-- supabase_church_core_v0.1.sql
-- 全站核心教會主庫 · 第一輪建表（PostgreSQL / Supabase）
-- 依據：docs/schema/全站DB藍圖_v0.1.md、docs/schema/church_ministry_v0.1.md
-- =============================================================================
--
-- Supabase 注意事項（建表後請在 Dashboard 處理）：
--
-- 1) Row Level Security（RLS）
--    預設應為每張表啟用 RLS，避免以 anon key 直接暴露全表資料。
--    參考：https://supabase.com/docs/guides/auth/row-level-security
--
-- 2) Policies
--    可先為每張表新增基本 policy：例如僅允許已登入使用者（auth.uid()）
--    依教會／campus／事工角色讀寫；實際規則依 RBAC 設計再細化。
--
-- 3) REST API
--    Supabase 會透過 PostgREST 自動為 public 表產生 REST 端點；
--    前端可用 supabase-js：supabase.from('visitations').insert(...) 等。
--    參考：https://supabase.com/docs/reference/javascript/introduction
--
-- 本檔僅定義 schema，不包含 RLS policy 實作。
-- =============================================================================

-- 統一更新 updated_at（可選；若專案已有全域 trigger 可刪除此段）
create or replace function public.church_core_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- members：會友主檔
-- -----------------------------------------------------------------------------
create table public.members (
  id                bigserial primary key,
  name              text not null,
  contact_phone     text,
  contact_email     text,
  status            text not null default 'active',
  campus_id         text,
  joined_at         date,
  left_at           date,
  pastoral_region   text,
  metadata          jsonb default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  created_by        uuid,
  updated_by        uuid,
  is_deleted        boolean not null default false
);

create index idx_members_campus_id on public.members (campus_id) where is_deleted = false;
create index idx_members_status on public.members (status) where is_deleted = false;

create trigger trg_members_updated_at
  before update on public.members
  for each row execute function public.church_core_set_updated_at();

-- -----------------------------------------------------------------------------
-- ministries：事工單位
-- -----------------------------------------------------------------------------
create table public.ministries (
  id                  bigserial primary key,
  name                text not null,
  category            text,
  campus_id           text,
  leader_member_id    bigint references public.members (id),
  status              text not null default 'active',
  description         text,
  metadata            jsonb default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  created_by          uuid,
  updated_by          uuid,
  is_deleted          boolean not null default false
);

create index idx_ministries_campus_id on public.ministries (campus_id) where is_deleted = false;
create index idx_ministries_leader_member_id on public.ministries (leader_member_id) where is_deleted = false;

create trigger trg_ministries_updated_at
  before update on public.ministries
  for each row execute function public.church_core_set_updated_at();

-- -----------------------------------------------------------------------------
-- ministry_members：事工同工分派
-- -----------------------------------------------------------------------------
create table public.ministry_members (
  id            bigserial primary key,
  ministry_id   bigint not null references public.ministries (id) on delete cascade,
  member_id     bigint not null references public.members (id) on delete cascade,
  role          text,
  started_at    date,
  ended_at      date,
  is_core       boolean not null default false,
  metadata      jsonb default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  created_by    uuid,
  updated_by    uuid,
  is_deleted    boolean not null default false,
  unique (ministry_id, member_id)
);

create index idx_ministry_members_ministry_id on public.ministry_members (ministry_id) where is_deleted = false;
create index idx_ministry_members_member_id on public.ministry_members (member_id) where is_deleted = false;

create trigger trg_ministry_members_updated_at
  before update on public.ministry_members
  for each row execute function public.church_core_set_updated_at();

-- -----------------------------------------------------------------------------
-- events：聚會／活動
-- -----------------------------------------------------------------------------
create table public.events (
  id            bigserial primary key,
  name          text not null,
  event_type    text not null,
  event_date    date not null,
  start_time    time without time zone,
  end_time      time without time zone,
  campus_id     text,
  ministry_id   bigint references public.ministries (id),
  location_note text,
  metadata      jsonb default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  created_by    uuid,
  updated_by    uuid,
  is_deleted    boolean not null default false
);

create index idx_events_event_date on public.events (event_date) where is_deleted = false;
create index idx_events_ministry_id on public.events (ministry_id) where is_deleted = false;
create index idx_events_campus_id on public.events (campus_id) where is_deleted = false;

create trigger trg_events_updated_at
  before update on public.events
  for each row execute function public.church_core_set_updated_at();

-- -----------------------------------------------------------------------------
-- attendance：出席紀錄
-- -----------------------------------------------------------------------------
create table public.attendance (
  id                bigserial primary key,
  event_id          bigint not null references public.events (id) on delete cascade,
  member_id         bigint not null references public.members (id) on delete cascade,
  attendance_type   text not null default 'in_person',
  status            text not null default 'confirmed',
  remark            text,
  metadata          jsonb default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  created_by        uuid,
  updated_by        uuid,
  is_deleted        boolean not null default false,
  unique (event_id, member_id)
);

create index idx_attendance_event_id on public.attendance (event_id) where is_deleted = false;
create index idx_attendance_member_id on public.attendance (member_id) where is_deleted = false;
create index idx_attendance_event_member on public.attendance (event_id, member_id) where is_deleted = false;

create trigger trg_attendance_updated_at
  before update on public.attendance
  for each row execute function public.church_core_set_updated_at();

-- -----------------------------------------------------------------------------
-- care_cases：關懷個案（須先於 visitations，供 case_id 外鍵）
-- -----------------------------------------------------------------------------
create table public.care_cases (
  id                  bigserial primary key,
  member_id           bigint not null references public.members (id) on delete restrict,
  case_type           text not null,
  opened_at           timestamptz not null default now(),
  closed_at           timestamptz,
  owner_member_id     bigint references public.members (id),
  source              text,
  risk_level          text,
  last_contact_at     date,
  summary             text,
  detail_notes        text,
  status              text not null default 'open',
  campus_id           text,
  metadata            jsonb default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  created_by          uuid,
  updated_by          uuid,
  is_deleted          boolean not null default false
);

create index idx_care_cases_member_id on public.care_cases (member_id) where is_deleted = false;
create index idx_care_cases_status on public.care_cases (status) where is_deleted = false;
create index idx_care_cases_risk_level on public.care_cases (risk_level) where is_deleted = false;

create trigger trg_care_cases_updated_at
  before update on public.care_cases
  for each row execute function public.church_core_set_updated_at();

-- -----------------------------------------------------------------------------
-- visitations：探訪紀錄
-- -----------------------------------------------------------------------------
create table public.visitations (
  id                    bigserial primary key,
  member_id             bigint not null references public.members (id) on delete restrict,
  visitor_member_id     bigint references public.members (id),
  visit_date            date not null,
  visit_type            text not null default '一般關懷',
  origin                text,
  summary               text,
  detail_notes          text,
  follow_up_action      text,
  priority              text not null default '中',
  status                text not null default 'done',
  case_id               bigint references public.care_cases (id) on delete set null,
  campus_id             text,
  metadata              jsonb default '{}'::jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  created_by            uuid,
  updated_by            uuid,
  is_deleted            boolean not null default false
);

create index idx_visitations_member_id on public.visitations (member_id) where is_deleted = false;
create index idx_visitations_visit_date on public.visitations (visit_date desc) where is_deleted = false;
create index idx_visitations_member_visit_date on public.visitations (member_id, visit_date desc) where is_deleted = false;
create index idx_visitations_case_id on public.visitations (case_id) where is_deleted = false;
create index idx_visitations_status on public.visitations (status) where is_deleted = false;

create trigger trg_visitations_updated_at
  before update on public.visitations
  for each row execute function public.church_core_set_updated_at();

-- =============================================================================
-- 後續：在 Supabase SQL Editor 執行本檔後，於 Table Editor 為各表啟用 RLS 並新增 policies。
-- 其他域（School、Discipleship、Planning、Hymns）可於同一 public schema 增量加表並以外鍵連回 members / events。
-- =============================================================================
