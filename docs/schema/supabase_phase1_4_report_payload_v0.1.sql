-- Phase 1.4 - Governance report payload view
-- One query payload base for PDF / board reporting.

create or replace view public.view_church_governance_report_payload as
with summary as (
  select *
  from public.view_church_health_summary
  limit 1
),
latest_alert as (
  select
    count(*) filter (where is_active = true and is_deleted = false) as active_alerts,
    max(detected_at) as latest_alert_at
  from public.dashboard_alerts
  where is_deleted = false
),
pipeline as (
  select
    count(*) filter (where is_deleted = false and status = 'active' and stage >= 3) as stage3_count,
    max(last_promoted_at) as latest_promotion_at
  from public.leader_pipeline
),
strategy_cycles as (
  select
    count(*) as cycles_total,
    count(*) filter (where status = 'active') as cycles_active
  from public.strategy_cycles
),
strategy_actions as (
  select
    count(*) as actions_total,
    count(*) filter (where is_completed = false) as actions_open,
    count(*) filter (where is_completed = true) as actions_completed
  from public.strategy_actions
)
select
  now() as generated_at,
  s.total_members,
  s.active_members,
  s.overloaded_members,
  s.pending_training_members,
  s.avg_spiritual_health_score,
  s.avg_human_capital_index,
  s.active_leader_pipeline_members,
  s.avg_current_quarter_score,
  s.avg_previous_quarter_score,
  s.vision_alignment_status,
  la.active_alerts,
  la.latest_alert_at,
  p.stage3_count,
  p.latest_promotion_at,
  sc.cycles_total,
  sc.cycles_active,
  sa.actions_total,
  sa.actions_open,
  sa.actions_completed
from summary s
cross join latest_alert la
cross join pipeline p
cross join strategy_cycles sc
cross join strategy_actions sa;
