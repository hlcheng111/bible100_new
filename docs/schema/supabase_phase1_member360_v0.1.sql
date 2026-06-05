-- =============================================================================
-- supabase_phase1_member360_v0.1.sql
-- Phase 1: Member 360 neural backbone
-- Depends on: supabase_church_core_v0.1.sql
-- =============================================================================

-- Reuse global updated_at trigger function (safe if already exists).
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
-- 1) members extension for Member 360
-- -----------------------------------------------------------------------------
alter table public.members
  add column if not exists spiritual_stage integer not null default 1,
  add column if not exists gifts_set jsonb not null default '[]'::jsonb,
  add column if not exists ministry_load_index numeric(6,4) not null default 0,
  add column if not exists training_credits integer not null default 0,
  add column if not exists spiritual_health_score numeric(6,2) not null default 0,
  add column if not exists health_trend_status varchar(20),
  add column if not exists human_capital_index numeric(6,2) not null default 0,
  add column if not exists training_status text not null default 'pending',
  add column if not exists meta_data jsonb not null default '{}'::jsonb;

-- keep members trigger deterministic after schema expansion
drop trigger if exists trg_members_updated_at on public.members;
create trigger trg_members_updated_at
  before update on public.members
  for each row execute function public.church_core_set_updated_at();

-- -----------------------------------------------------------------------------
-- 2) Survey logs (audit trail)
-- -----------------------------------------------------------------------------
create table if not exists public.survey_logs (
  id                  bigserial primary key,
  member_id           bigint not null references public.members (id) on delete cascade,
  survey_type         text not null,
  survey_version      text,
  score               numeric(8,2),
  payload             jsonb not null default '{}'::jsonb,
  source_module       text,
  source_ref          text,
  submitted_at        timestamptz not null default now(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  created_by          uuid,
  updated_by          uuid,
  is_deleted          boolean not null default false
);

create index if not exists idx_survey_logs_member on public.survey_logs (member_id) where is_deleted = false;
create index if not exists idx_survey_logs_type_time on public.survey_logs (survey_type, submitted_at desc) where is_deleted = false;

drop trigger if exists trg_survey_logs_updated_at on public.survey_logs;
create trigger trg_survey_logs_updated_at
  before update on public.survey_logs
  for each row execute function public.church_core_set_updated_at();

-- -----------------------------------------------------------------------------
-- 3) Quarterly health trend table
-- -----------------------------------------------------------------------------
create table if not exists public.member_health_quarterly (
  id                  bigserial primary key,
  member_id           bigint not null references public.members (id) on delete cascade,
  quarter_key         text not null, -- e.g. 2026Q1
  health_score        numeric(8,2) not null,
  source_survey_log_id bigint references public.survey_logs (id) on delete set null,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  created_by          uuid,
  updated_by          uuid,
  is_deleted          boolean not null default false,
  unique (member_id, quarter_key)
);

create index if not exists idx_member_health_quarterly_member on public.member_health_quarterly (member_id) where is_deleted = false;
create index if not exists idx_member_health_quarterly_q on public.member_health_quarterly (quarter_key) where is_deleted = false;

drop trigger if exists trg_member_health_quarterly_updated_at on public.member_health_quarterly;
create trigger trg_member_health_quarterly_updated_at
  before update on public.member_health_quarterly
  for each row execute function public.church_core_set_updated_at();

-- -----------------------------------------------------------------------------
-- 4) Leader pipeline
-- -----------------------------------------------------------------------------
create table if not exists public.leader_pipeline (
  id                  bigserial primary key,
  member_id           bigint not null references public.members (id) on delete cascade,
  stage               integer not null default 1,
  status              text not null default 'active',
  source_type         text,
  source_ref_id       text,
  last_promoted_at    timestamptz,
  metadata            jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  created_by          uuid,
  updated_by          uuid,
  is_deleted          boolean not null default false,
  unique (member_id)
);

create index if not exists idx_leader_pipeline_stage on public.leader_pipeline (stage) where is_deleted = false;
create index if not exists idx_leader_pipeline_status on public.leader_pipeline (status) where is_deleted = false;

drop trigger if exists trg_leader_pipeline_updated_at on public.leader_pipeline;
create trigger trg_leader_pipeline_updated_at
  before update on public.leader_pipeline
  for each row execute function public.church_core_set_updated_at();

-- -----------------------------------------------------------------------------
-- 5) Dashboard alerts
-- -----------------------------------------------------------------------------
create table if not exists public.dashboard_alerts (
  id                  bigserial primary key,
  alert_type          text not null,
  member_id           bigint references public.members (id) on delete set null,
  severity            text not null default 'warning',
  payload             jsonb not null default '{}'::jsonb,
  is_active           boolean not null default true,
  detected_at         timestamptz not null default now(),
  resolved_at         timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  created_by          uuid,
  updated_by          uuid,
  is_deleted          boolean not null default false
);

create index if not exists idx_dashboard_alerts_active on public.dashboard_alerts (is_active, alert_type, detected_at desc) where is_deleted = false;

drop trigger if exists trg_dashboard_alerts_updated_at on public.dashboard_alerts;
create trigger trg_dashboard_alerts_updated_at
  before update on public.dashboard_alerts
  for each row execute function public.church_core_set_updated_at();

-- -----------------------------------------------------------------------------
-- 6) Matching & alert indexes
-- -----------------------------------------------------------------------------
create index if not exists idx_members_gifts_gin on public.members using gin (gifts_set);
create index if not exists idx_members_load_health on public.members (ministry_load_index, spiritual_health_score) where is_deleted = false;
create index if not exists idx_members_training on public.members (training_status, training_credits) where is_deleted = false;

-- -----------------------------------------------------------------------------
-- 7) Dashboard summary view for one-query frontend
-- -----------------------------------------------------------------------------
create or replace view public.view_church_health_summary as
with member_base as (
  select *
  from public.members
  where is_deleted = false
),
quarter_scores as (
  select
    quarter_key,
    avg(health_score) as quarter_avg_score
  from public.member_health_quarterly
  where is_deleted = false
  group by quarter_key
),
health_trend as (
  select
    max(case when q.rn = 1 then q.quarter_avg_score end) as avg_current_quarter_score,
    max(case when q.rn = 2 then q.quarter_avg_score end) as avg_previous_quarter_score
  from (
    select
      quarter_key,
      quarter_avg_score,
      row_number() over (order by quarter_key desc) as rn
    from quarter_scores
  ) q
),
alert_counts as (
  select
    count(*) filter (where is_active = true and is_deleted = false) as active_alerts,
    count(*) filter (where is_active = true and alert_type = 'load_over_80' and is_deleted = false) as load_alerts,
    count(*) filter (where is_active = true and alert_type = 'health_two_quarter_down' and is_deleted = false) as trend_alerts
  from public.dashboard_alerts
)
select
  now() as generated_at,
  (select count(*) from member_base) as total_members,
  (select count(*) from member_base where status = 'active') as active_members,
  (select count(*) from member_base where ministry_load_index > 0.8) as overloaded_members,
  (select round(avg(spiritual_health_score)::numeric, 2) from member_base) as avg_spiritual_health_score,
  (select round(avg(human_capital_index)::numeric, 2) from member_base) as avg_human_capital_index,
  (select count(*) from member_base where coalesce(training_status, 'pending') <> 'completed') as pending_training_members,
  (select count(*) from public.leader_pipeline where is_deleted = false and status = 'active' and stage >= 3) as active_leader_pipeline_members,
  (select avg_current_quarter_score from health_trend) as avg_current_quarter_score,
  (select avg_previous_quarter_score from health_trend) as avg_previous_quarter_score,
  case
    when (select round(avg(spiritual_health_score)::numeric, 2) from member_base) >= 70
      and (select round(avg(ministry_load_index)::numeric, 4) from member_base) <= 0.25
      then '動員力不足'
    when (select round(avg(spiritual_health_score)::numeric, 2) from member_base) < 55
      and (select round(avg(ministry_load_index)::numeric, 4) from member_base) >= 0.72
      then '同工枯竭風險'
    else '平衡'
  end as vision_alignment_status,
  (select active_alerts from alert_counts) as active_alerts,
  (select load_alerts from alert_counts) as load_alerts,
  (select trend_alerts from alert_counts) as trend_alerts;

