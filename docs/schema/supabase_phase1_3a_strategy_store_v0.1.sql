-- Phase 1.3a - Strategy Store (P2 draft)
-- Purpose: keep non-flat strategy artifacts (80/20, PDCA, SWOT)

create table if not exists public.strategy_cycles (
  id bigserial primary key,
  member_id bigint references public.members(id),
  cycle_type varchar(20) not null check (cycle_type in ('8020', 'PDCA', 'SWOT')),
  title text not null,
  content_json jsonb not null default '{}'::jsonb,
  status varchar(20) not null default 'draft' check (status in ('draft', 'active', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.strategy_actions (
  id bigserial primary key,
  cycle_id bigint not null references public.strategy_cycles(id) on delete cascade,
  assignee_id bigint references public.members(id),
  task_description text not null,
  due_date date,
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_strategy_cycles_type_status
  on public.strategy_cycles(cycle_type, status);

create index if not exists idx_strategy_cycles_member
  on public.strategy_cycles(member_id);

create index if not exists idx_strategy_actions_cycle_completed
  on public.strategy_actions(cycle_id, is_completed);

create index if not exists idx_strategy_actions_assignee_due
  on public.strategy_actions(assignee_id, due_date);

create or replace function public.set_strategy_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_strategy_cycles_updated_at on public.strategy_cycles;
create trigger trg_strategy_cycles_updated_at
before update on public.strategy_cycles
for each row execute function public.set_strategy_updated_at();

drop trigger if exists trg_strategy_actions_updated_at on public.strategy_actions;
create trigger trg_strategy_actions_updated_at
before update on public.strategy_actions
for each row execute function public.set_strategy_updated_at();
