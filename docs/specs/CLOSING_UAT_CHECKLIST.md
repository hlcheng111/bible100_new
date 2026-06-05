# Closing UAT Checklist

## P0 Data Contract

- [ ] `LongTermPipeline` reads namespaced key first, then legacy fallback
- [ ] `LongTermPipeline` writes namespaced key only
- [ ] `CentralMemberDB.set()` is used for member updates
- [ ] `training_credits` field is updated from course completion flow

## P1 A-Stage to B-Stage Link

- [ ] A1 submission updates health payload and dashboard picks latest
- [ ] SWOT entries create refs and goals can bind `swotRef`
- [ ] Orphan goal refs show red warning in dashboard/goals
- [ ] Strategy conflict report detects leadership-risk mismatch

## P0 Smoke Before Cloud

- [ ] `index.html` redirects to `index_v5.html`
- [ ] `index_v5` System Hub links open DB / course / matching
- [ ] `church_planning/dashboard.html` strategy tool links all valid
- [ ] `pdca-planning.html` saves snapshots and renders trend chart
- [ ] `pastoral-professional-review.html` writes back to `memberSystemData.notes`

