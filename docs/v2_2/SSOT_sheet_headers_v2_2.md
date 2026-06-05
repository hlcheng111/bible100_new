# Sheets SSOT 表頭模板（V2.2）

以下表名與欄位由 v2 preset 凍結，供 M-002 建立空表使用。

## 1) courses
`course_id, title, lang, category, summary, target_url, status, sort_order, updated_at`

## 2) registrations
`reg_id, member_id, course_id, form_response_id, status, created_at, updated_at`

## 3) navigation_map
`nav_id, module, tier, label_zh, label_en, lang, action_type, target_url, target_webapp_action, target_course_id, roles_allowed, status, sort_order, updated_at`

## 4) qna_sources
`source_id, name, lang, base_url, status, sort_order, notes`

## 5) qna_items
`item_id, source_id, lang, category, question, answer_url, tags, status, sort_order, updated_at`

## 6) bible_versions
`version_id, name, abbr, lang, provider, resource_url, status, sort_order, updated_at`

## 7) hymns
`hymn_id, title, lang, category, tags, lyrics_url, audio_url, status, sort_order, updated_at`

## 8) playlists
`playlist_id, name, lang, description, status, sort_order, updated_at`

## 9) playlist_items
`playlist_item_id, playlist_id, hymn_id, sort_order, status, updated_at`

## 10) ai_tools_config
`tool_id, module, name, label_zh, label_en, target_url, needs_login, reset_profile, status, sort_order, updated_at`

## 11) planning_kpi
`kpi_id, kpi_type, title, description, owner, period, status, score, updated_at`

## 12) planning_swot
`swot_id, kpi_id, swot_type, description, status, sort_order, updated_at`

## 13) planning_smart
`smart_id, kpi_id, specific, measurable, achievable, relevant, timebound, status, updated_at`

## 14) planning_pdca
`pdca_id, kpi_id, plan, do, check, act, status, sort_order, updated_at`

## 15) planning_health
`health_id, kpi_id, dimension, score, notes, status, sort_order, updated_at`

## 16) ministry_logs
`log_id, timestamp, module, action, level, message, details, status, reg_id, tool_id, version_id`

## 17) members
`member_id, email, full_name, lang, roles, phone, status, updated_at`
