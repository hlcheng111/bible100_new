-- Bible100 / Digital Academy - Core cloud schema
-- Run in Supabase SQL Editor

create extension if not exists pgcrypto;

-- 1) Generic KV store for localStorage-compatible migration
create table if not exists public.church_kv_store (
  id uuid primary key default gen_random_uuid(),
  church_id text not null,
  key text not null,
  value_text text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (church_id, key)
);

-- 2) Members table used by ChurchDataBridgePhase1
create table if not exists public.members (
  id bigint primary key,
  name text,
  training_status text,
  training_credits numeric,
  spiritual_health_score numeric,
  meta_data jsonb default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 3) Workflow log table
create table if not exists public.survey_logs (
  id bigint generated always as identity primary key,
  member_id bigint,
  survey_type text not null,
  payload jsonb default '{}'::jsonb,
  source_module text,
  submitted_at timestamptz not null default now()
);

-- 4) Leader pipeline table
create table if not exists public.leader_pipeline (
  id bigint generated always as identity primary key,
  member_id bigint not null unique,
  stage int not null default 1,
  status text not null default 'active',
  source_type text,
  source_ref_id text,
  last_promoted_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  is_deleted boolean not null default false,
  updated_at timestamptz not null default now()
);

-- 5) Dashboard alerts
create table if not exists public.dashboard_alerts (
  id bigint generated always as identity primary key,
  alert_type text not null,
  member_id bigint,
  severity text not null default 'info',
  payload jsonb default '{}'::jsonb,
  is_active boolean not null default true,
  is_deleted boolean not null default false,
  detected_at timestamptz not null default now()
);

-- 6) Strategy tables for governance summary
create table if not exists public.strategy_cycles (
  id bigint generated always as identity primary key,
  status text not null default 'active'
);

create table if not exists public.strategy_actions (
  id bigint generated always as identity primary key,
  is_completed boolean not null default false
);

-- 7) Summary view used by bridge
create or replace view public.view_church_health_summary as
select
  count(*)::int as total_members,
  count(*) filter (where coalesce(training_status, '') in ('completed','done'))::int as trained_members,
  round(avg(coalesce(spiritual_health_score, 0))::numeric, 2) as avg_spiritual_health_score
from public.members;

-- Optional: enable RLS (recommended for production; adjust policies by your auth model)
alter table public.church_kv_store enable row level security;
alter table public.members enable row level security;
alter table public.survey_logs enable row level security;
alter table public.leader_pipeline enable row level security;
alter table public.dashboard_alerts enable row level security;

