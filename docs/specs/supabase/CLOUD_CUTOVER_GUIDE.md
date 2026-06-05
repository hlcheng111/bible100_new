# Cloud Cutover Guide (Supabase)

## 1) Initialize Supabase tables

1. Open Supabase project SQL editor.
2. Run `docs/specs/supabase/001_bible100_core_schema.sql`.
3. Confirm tables exist:
   - `church_kv_store`
   - `members`
   - `survey_logs`
   - `leader_pipeline`
   - `dashboard_alerts`
   - `strategy_cycles`
   - `strategy_actions`

## 2) Configure persistence provider

Inject these meta tags in your entry page `<head>` (production):

```html
<meta name="bible100-persistence-mode" content="hybrid" />
<meta name="bible100-supabase-url" content="https://YOUR_PROJECT.supabase.co" />
<meta name="bible100-supabase-anon-key" content="YOUR_SUPABASE_ANON_KEY" />
<meta name="bible100-supabase-kv-table" content="church_kv_store" />
```

Then load scripts in this order:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/persistence_provider.js"></script>
<script src="js/bible100_backend_init.js"></script>
```

## 3) Mode switch

- `local`: localStorage only
- `hybrid`: local cache + async cloud sync (recommended first rollout)
- `cloud`: local cache + mandatory cloud path (same API, stricter ops policy)

## 4) Validation checklist

- Open `church_planning/uat-smoke-runner.html`, click seed/check.
- Open `pdca-planning.html` and verify `chp2026-pdca-snapshots` updates.
- In Supabase, verify `church_kv_store` rows appear for:
  - `memberSystemData`
  - `chp2026_<church_id>_longTermPlanning_*`
  - `chp2026-pdca-log`

## 5) Rollback

Set:

```html
<meta name="bible100-persistence-mode" content="local" />
```

No code rollback required.

