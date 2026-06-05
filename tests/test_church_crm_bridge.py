# -*- coding: utf-8 -*-
"""Smoke: Church CRM Bridge APIs exist (static check)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BRIDGE = ROOT / "js" / "church_data_bridge.js"
CONSTANTS = ROOT / "js" / "church_crm_constants.js"

CRM5_FILES = [
    "js/church_auth.js",
    "js/church_sheets_ssot.js",
    "js/church_crm_maturity_seed.js",
    "js/church_ai_pastoral_draft.js",
    "scripts/church_api_local_server.js",
    "church_ministry/admin/cloud_login.html",
    "church_ministry/load_crm_maturity_seed.html",
    "church_ministry/modules/support/ai-pastoral-draft.html",
    "church_ministry/apps_script/CrmSheetsSsot.gs",
    "church_ministry/docs/CRM-5_CLOUD_AUTH_SHEETS.md",
]

REQUIRED_BRIDGE = [
    "listMinistryAssignmentsByMemberId",
    "syncMinistryCatalogFromVolunteer",
    "appendPastoralEvent",
    "listPastoralEvents",
    "evaluateNewcomerFollowUpAlerts",
    "getCrmMaturitySummary",
    "exportMemberSystemBundle",
    "importMemberSystemBundle",
    "getSpiritualStageFunnel",
    "suggestStagePromotion",
    "getCrmWorkbenchTodos",
    "syncPlanningAssessmentFromCtaReport",
    "confirmMinistryAssignment",
    "listPendingMinistrySuggestions",
    "applyCrmMaturitySeed",
    "hydrateFromSheets",
    "listVolunteerShifts",
    "saveVolunteerShift",
    "getVolunteerShiftSummary",
    "listShiftCandidates",
    "promoteAssignmentToShift",
    "getPersonMappingPreview",
    "listPastoralFollowups",
    "getPastoralFollowupSummary",
    "savePastoralFollowup",
    "buildPastoralFollowupSnippet",
    "promotePastoralAlertToFollowup",
    "getFinanceReconciliationData",
    "listFinanceReconciliationRecords",
    "getFinanceReconciliationSummary",
    "saveFinanceReconciliationRecord",
    "buildFinanceReceiptSnippet",
    "markFinanceRecordReconciled",
    "getSyncHealthSummary",
]

REQUIRED_CONSTANTS = [
    "ChurchCrmConstants",
    "normalizeSpiritualStage",
    "seeker",
    "NEWCOMER_SLA_DAYS",
]


def test_bridge_exports_crm_methods():
    text = BRIDGE.read_text(encoding="utf-8")
    for name in REQUIRED_BRIDGE:
        assert name + ":" in text or name + " :" in text, "missing Bridge method: " + name


def test_crm_constants_file():
    text = CONSTANTS.read_text(encoding="utf-8")
    for token in REQUIRED_CONSTANTS:
        assert token in text, "missing in church_crm_constants.js: " + token


def test_blueprint_docs_exist():
    assert (ROOT / "church_ministry" / "docs" / "CHURCH_CRM_BLUEPRINT.md").is_file()
    assert (ROOT / "church_ministry" / "docs" / "CRM_ENGINEERING_PHASES.md").is_file()


def test_visitation_index_wires_pastoral_event():
    path = ROOT / "church_ministry" / "modules" / "support" / "visitation_index.html"
    text = path.read_text(encoding="utf-8")
    assert "recordPastoralEvent" in text
    assert "appendPastoralEvent" in text
    assert "resolveMemberIdFromBridge" in text


def test_member_integrated_crm_fields():
    path = ROOT / "church_ministry" / "modules" / "members" / "member-integrated.html"
    text = path.read_text(encoding="utf-8")
    assert "church_crm_constants.js" in text
    assert "spiritual_journey_stage" in text
    assert "first_visit_date" in text
    assert "buildSpiritualStageSelectHtml" in text
    assert "visitation_index.html" in text


def test_analytics_redirects_to_research():
    analytics_dir = ROOT / "church_ministry" / "modules" / "analytics"
    sample = analytics_dir / "member-statistics.html"
    text = sample.read_text(encoding="utf-8")
    assert "../research/" in text
    assert "location.replace" in text


def test_bridge_has_nowIso_helper():
    text = BRIDGE.read_text(encoding="utf-8")
    assert "function nowIso()" in text


def test_visitation_followup_tool_pages_exist():
    base = ROOT / "church_ministry" / "tools" / "visitation_followup"
    for name in [
        "index.html", "dashboard.html", "form.html", "list.html", "setting.html",
        "load_a2_demo.html", "uat.html", "tool.meta.json", "tool.js",
    ]:
        assert (base / name).is_file(), "missing " + str(base / name)
    tool_js = (base / "tool.js").read_text(encoding="utf-8")
    assert "loadA2DemoData" in tool_js
    assert "clearA2DemoData" in tool_js
    assert "renderTrustBadge" in tool_js
    assert "pastoral_sensitive" in tool_js
    for page in ["index.html", "dashboard.html", "form.html", "list.html", "setting.html", "uat.html"]:
        text = (base / page).read_text(encoding="utf-8")
        assert "data_trust_badge.js" in text, page + " missing data_trust_badge.js"
        assert "renderTrustBadge" in text or "VisitationFollowupTool.renderTrustBadge" in text
    form = (base / "form.html").read_text(encoding="utf-8")
    assert "copy_only" in form or "不會自動通知" in form
    assert "pastoral_sensitive" in form
    list_html = (base / "list.html").read_text(encoding="utf-8")
    assert "copy_only" in list_html or "不會自動通知" in list_html
    assert "notePreview" not in list_html
    assert "truncateReason(t.note" not in list_html
    assert "查看敏感備註" in list_html
    assert "牧養敏感資料，請限牧者" in list_html
    dash = (base / "dashboard.html").read_text(encoding="utf-8")
    assert "t.note" not in dash
    assert "notePreview" not in dash
    uat_idx = (ROOT / "church_ministry" / "tools" / "uat_index.html").read_text(encoding="utf-8")
    assert "visitation_followup" in uat_idx
    assert "A2 · LIVE" in uat_idx


def test_volunteer_shift_tool_pages_exist():
    base = ROOT / "church_ministry" / "tools" / "volunteer_shift"
    for name in [
        "index.html", "dashboard.html", "form.html", "list.html", "setting.html",
        "load_a1_demo.html", "uat.html", "tool.meta.json", "tool.js",
    ]:
        assert (base / name).is_file(), "missing " + str(base / name)
    tool_js = (base / "tool.js").read_text(encoding="utf-8")
    assert "loadA1DemoData" in tool_js
    assert "renderDataSourceStrip" in tool_js


def test_ai_lab_sidebar_crm_automation_link():
    text = (ROOT / "ai_tools" / "sidebar_lab.html").read_text(encoding="utf-8")
    assert "crm_automation_console.html" in text
    assert "營運自動化" in text


def test_index_v5_crm_automation_topbar():
    text = (ROOT / "index_v5.html").read_text(encoding="utf-8")
    assert "btnCrmAutomationTop" in text
    assert "openCrmAutomationConsole" in text


def test_tool_kit_data_trust_v12():
    kit = ROOT / "church_ministry" / "_templates" / "tool-kit"
    for name in ["index.html", "dashboard.html", "form.html", "list.html", "setting.html", "uat.html", "tool.js"]:
        p = kit / name
        assert p.is_file(), "missing template " + name
        text = p.read_text(encoding="utf-8")
        assert "data_trust_badge.js" in text, name + " missing data_trust_badge.js"
    assert "renderTrustBadge" in (kit / "tool.js").read_text(encoding="utf-8")
    assert "getToolDataStats" in (kit / "tool.js").read_text(encoding="utf-8")
    assert "notifySync" in (kit / "tool.js").read_text(encoding="utf-8")
    std = (ROOT / "docs" / "TOOL_KIT_STANDARD.md").read_text(encoding="utf-8")
    assert "DataTrustBadge" in std
    assert "demo_marker_key" in std
    assert (ROOT / "church_ministry" / "tools" / "uat_index.html").is_file()
    vidx = (ROOT / "church_ministry" / "tools" / "volunteer_shift" / "index.html").read_text(encoding="utf-8")
    assert "小白驗收檢查" in vidx
    assert "uat.html" in vidx
    cidx = (ROOT / "church_ministry" / "index.html").read_text(encoding="utf-8")
    assert "uat_index.html" in cidx
    assert "小白驗收" in cidx


def test_data_trust_three_hubs():
    assert (ROOT / "docs" / "DATA_TRUST_LAYER.md").is_file()
    doc = (ROOT / "docs" / "DATA_TRUST_LAYER.md").read_text(encoding="utf-8")
    for term in ["prefill_only", "manual_save", "不會自動通知", "只預填", "尚無資料", "demo", "mixed"]:
        assert term in doc, "DATA_TRUST_LAYER missing: " + term
    hubs = {
        "school_management/index.html": ["data_trust_badge.js", "schoolTrustMount", "renderSchoolEntryTrust"],
        "school_management/dashboard.html": ["data_trust_badge.js", "renderSchoolEntryTrust", "schoolTrustMount"],
        "ai_tools/ai_lab_landing.html": ["data_trust_badge.js", "aiLabTrustMount", "renderAiLabEntryTrust"],
        "church_ministry/index.html": ["data_trust_badge.js", "churchMinistryTrustMount", "renderChurchMinistryEntryTrust"],
    }
    for rel, needles in hubs.items():
        text = (ROOT / rel).read_text(encoding="utf-8")
        for n in needles:
            assert n in text, rel + " missing: " + n


def test_data_trust_badge_module_and_wiring():
    badge = ROOT / "js" / "data_trust_badge.js"
    assert badge.is_file()
    text = badge.read_text(encoding="utf-8")
    for fn in [
        "renderDataTrustBadge",
        "renderActionTrustNotice",
        "getStorageModeLabel",
        "getDataFreshness",
        "classifyDataState",
        "clearVolunteerShiftA1Demo",
        "renderSchoolEntryTrust",
        "renderChurchMinistryEntryTrust",
        "renderAiLabEntryTrust",
    ]:
        assert fn in text
    assert "volunteer_shift_demo_loaded_at" in text
    assert "只預填，不儲存" in text
    assert "不會自動通知" in text
    assert "需人工確認" in text or "requires_human_confirmation" in text
    pages = [
        "church_ministry/tools/volunteer_shift/dashboard.html",
        "church_ministry/tools/volunteer_shift/list.html",
        "church_ministry/tools/volunteer_shift/form.html",
        "church_ministry/tools/volunteer_shift/uat.html",
        "ai_tools/pages/crm_automation_console.html",
        "church_ministry/dashboard.html",
    ]
    for rel in pages:
        p = (ROOT / rel).read_text(encoding="utf-8")
        assert "data_trust_badge.js" in p, rel
        assert "資料來源" in p or "dataTrustMount" in p or "hubDataTrustMount" in p, rel
    crm = (ROOT / "ai_tools/pages/crm_automation_console.html").read_text(encoding="utf-8")
    assert "prefill_only" in crm
    assert "只預填" in crm or "不儲存" in crm
    dash = (ROOT / "church_ministry/tools/volunteer_shift/dashboard.html").read_text(encoding="utf-8")
    assert "localStorage" in dash or "dataTrustMount" in dash


def test_crm_intent_router_v2():
    text = (ROOT / "js" / "crm_intent_router.js").read_text(encoding="utf-8")
    assert "bible100_crm_intent_v2" in text
    assert "routeForPrefill" in text
    assert "volunteer_shift.create" in text
    assert "visitation_followup.create" in text
    assert "finance_reconciliation.create" in text
    assert "listAvailableTools" in text
    assert "prefill_only" in text


def test_crm_journey_brand_pages():
    base = ROOT / "church_ministry"
    for name in [
        "guide_crm_journey_hub.html",
        "guide_crm_from_learning.html",
        "guide_crm_for_teachers.html",
        "guide_crm_for_leaders.html",
        "css/crm_journey_brand.css",
        "js/crm_journey_common.js",
        "docs/CRM_JOURNEY_BRAND.md",
    ]:
        assert (base / name).is_file(), "missing journey brand: " + name
    hub = (base / "guide_crm_journey_hub.html").read_text(encoding="utf-8")
    assert "CrmJourneyBrand.initLanding" in hub
    assert "master-sec-intro" in hub
    assert "master-sec-journey" in hub
    assert "master-sec-matchmaker" in hub
    assert "crmJourneyRoleNav" in hub
    assert "crmMatchmakerDepts" in hub
    assert "教會CRM 理念運用" in hub
    assert "crm-intro-manual-banner" in hub
    assert "crmIntroRoadmap" in hub
    assert "crmIntroEightList" in hub
    assert "crmIntroAiList" in hub
    assert "crm-intro-local-nav" in hub
    assert "crm-intro-dept-btn" in hub
    assert "data-intro-static" in hub
    assert "crm-intro-index-fold" in hub
    assert "data-goto-matchmaker-tab" in hub
    assert "crmIntroToolCatalog" in hub
    assert "AI 看見與提醒" in hub
    assert "crmJourneyRoadmap" in hub
    assert "crmJourneyStagesList" in hub
    assert "crmMatchmakerRoadmap" in hub
    assert "crmMatchmakerStagesList" in hub
    assert "lang-zh-only" in hub
    assert "btnCrmHelpMore" in hub
    assert "crm-master-tabs" in hub
    assert "crm-split" in hub
    assert "bi-en" not in hub
    common = (base / "js/crm_journey_common.js").read_text(encoding="utf-8")
    assert "initLanding" in common
    assert "JOURNEY_MAPS" in common
    assert "JOURNEY_BY_ROLE" in common
    assert "MATCHMAKER_DATA" in common
    assert "switchMasterTab" in common
    assert "PAIN_ACCORDION" in common
    assert "TAB_KEY" in common
    assert "TOOL_GROUPS" in common
    assert "bindIntroStaticPanel" in common
    assert "CRM_EIGHT_PRINCIPLES" in common
    assert "CRM_AI_ROLES" in common
    assert "renderIntroRoadmap" in common
    assert "renderIntroEightPrinciples" in common
    assert "renderIntroAiRoles" in common
    assert "renderJourneyRoadmap" in common
    assert "BELIEVER_JOURNEY_BY_ROLE" in common
    assert "MATCHMAKER_MANAGER_STAGES" in common
    assert "crm-match-urgent" in common
    assert "科技只當僕人" in common
    assert "複製邀請草稿" in common
    assert "沒有強塞的事工" in common
    assert "敬拜第一線" in common
    assert "NCD 視角" in common
    assert "renderIntroToolCatalog" in common
    assert "initRedirect" in common
    redirect = (base / "guide_crm_from_learning.html").read_text(encoding="utf-8")
    assert "entry=learning" in redirect
    trans = (ROOT / "help/translate.html").read_text(encoding="utf-8")
    assert "btn-open-page" in trans
    landing = (ROOT / "languages/landing_new_cn.html").read_text(encoding="utf-8")
    assert "guide_crm_journey_hub.html" in landing
    dash = (base / "dashboard.html").read_text(encoding="utf-8")
    assert "guide_crm_journey_hub.html" in dash
    sb = (base / "sidebar.html").read_text(encoding="utf-8")
    assert "guide_crm_journey_hub.html?entry=learning" in sb
    assert "guide_crm_journey_hub.html?role=teacher" in sb
    modes = (ROOT / "config" / "modes.json").read_text(encoding="utf-8")
    assert "guide_crm_journey_hub.html" in modes
    idx5 = (ROOT / "index_v5.html").read_text(encoding="utf-8")
    assert "church_ministry/sidebar.html" in idx5
    assert "guide_crm_journey_hub.html" in idx5


def test_sync_health_summary_and_drawer():
    bridge = (ROOT / "js" / "church_data_bridge.js").read_text(encoding="utf-8")
    assert "getSyncHealthSummary" in bridge
    assert "finance_reconciliation" in bridge
    assert "optional: true" in bridge or "optional: true" in bridge.replace(" ", "")
    phase1 = (ROOT / "js" / "church_data_bridge_phase1.js").read_text(encoding="utf-8")
    assert "getSyncHealthSummary" in phase1
    drawer = (ROOT / "js" / "sync_observer_drawer.js").read_text(encoding="utf-8")
    assert "syncObserverHealth" in drawer
    assert "renderHealth" in drawer
    idx = (ROOT / "index_v5.html").read_text(encoding="utf-8")
    assert "syncObserverHealth" in idx
    crm = (ROOT / "ai_tools/pages/crm_automation_console.html").read_text(encoding="utf-8")
    assert "crmToolQuickLinks" in crm
    assert "finance_reconciliation.create" in crm
    path_doc = (ROOT / "church_ministry/docs/DECISION_MAKER_PATH.md").read_text(encoding="utf-8")
    assert "finance_reconciliation" in path_doc
    assert "可選" in path_doc


def test_tool_kit_standard_doc():
    assert (ROOT / "docs" / "TOOL_KIT_STANDARD.md").is_file()
    assert (ROOT / "docs" / "SCHOOL_CRM_PERSONID_BRIDGE.md").is_file()


def test_crm5_files_exist():
    for rel in CRM5_FILES:
        assert (ROOT / rel).is_file(), "missing CRM-5 file: " + rel


def test_cloud_config_crm5_flags():
    text = (ROOT / "js" / "cloud_config.js").read_text(encoding="utf-8")
    assert "USE_SHEETS_SSOT" in text
    assert "REQUIRE_AUTH" in text
    assert "SHEETS_WEB_APP_URL" in text


def test_church_auth_rbac():
    text = (ROOT / "js" / "church_auth.js").read_text(encoding="utf-8")
    assert "ChurchAuth" in text
    assert "assertCan" in text
    assert "maskMemberForRole" in text


def test_dashboard_crm_workbench():
    text = (ROOT / "church_ministry" / "dashboard.html").read_text(encoding="utf-8")
    assert "getCrmWorkbenchTodos" in text
    assert "renderCrmWorkbench" in text
    assert "CrmRoleDashboard" in text
    assert "visitation_index.html" in text


def test_finance_reconciliation_tool_pages_exist():
    base = ROOT / "church_ministry" / "tools" / "finance_reconciliation"
    for name in [
        "index.html", "dashboard.html", "form.html", "list.html", "setting.html",
        "load_a3_demo.html", "uat.html", "tool.meta.json", "tool.js",
    ]:
        assert (base / name).is_file(), "missing " + str(base / name)
    tool_js = (base / "tool.js").read_text(encoding="utf-8")
    assert "loadA3DemoData" in tool_js
    assert "finance_sensitive" in tool_js
    for page in ["index.html", "dashboard.html", "form.html", "list.html", "setting.html", "uat.html"]:
        text = (base / page).read_text(encoding="utf-8")
        assert "data_trust_badge.js" in text
        assert "renderTrustBadge" in text or "FinanceReconciliationTool.renderTrustBadge" in text
    list_html = (base / "list.html").read_text(encoding="utf-8")
    assert "notePreview" not in list_html
    assert "查看財務備註" in list_html
    assert "copy_only" in list_html or "不會自動" in list_html
    form = (base / "form.html").read_text(encoding="utf-8")
    assert "finance_sensitive" in form
    badge = (ROOT / "js" / "data_trust_badge.js").read_text(encoding="utf-8")
    assert "clearFinanceReconciliationA3Demo" in badge
    assert "financeReconciliationRowStats" in badge
    uat_idx = (ROOT / "church_ministry" / "tools" / "uat_index.html").read_text(encoding="utf-8")
    assert "finance_reconciliation" in uat_idx
    assert "A3 · LIVE" in uat_idx


def test_demo_data_governance_v1():
    gov = ROOT / "church_ministry" / "admin" / "demo_data_governance.html"
    assert gov.is_file()
    text = gov.read_text(encoding="utf-8")
    badge = (ROOT / "js" / "data_trust_badge.js").read_text(encoding="utf-8")
    for needle in [
        "volunteer_shift_demo_loaded_at",
        "visitation_followup_demo_loaded_at",
        "school_management_demo_loaded_at",
        "getDemoGovernanceSummary",
        "clearVisitationFollowupA2Demo",
        "clearSchoolDemoMarker",
        "clearVolunteerShiftA1Demo",
        "a1_demo_seed",
        "a2_demo_seed",
        "finance_reconciliation_demo_loaded_at",
        "a3_demo_seed",
        "clearFinanceReconciliationA3Demo",
        "financeReconciliationData_records",
    ]:
        assert needle in text or needle in badge, "governance missing: " + needle
    assert "demo KPI 不可當正式決策" in text
    assert "不會自動通知" in text
    dash = (ROOT / "church_ministry" / "dashboard.html").read_text(encoding="utf-8")
    uat = (ROOT / "church_ministry" / "tools" / "uat_index.html").read_text(encoding="utf-8")
    cidx = (ROOT / "church_ministry" / "index.html").read_text(encoding="utf-8")
    assert "demo_data_governance.html" in dash
    assert "demo_data_governance.html" in uat
    assert "demo_data_governance.html" in cidx
    assert "t.note" not in text
    assert "notePreview" not in text


def test_crm_dashboard_v1_kpi():
    dash = (ROOT / "church_ministry" / "dashboard.html").read_text(encoding="utf-8")
    role_js = (ROOT / "church_ministry" / "js" / "crm_role_dashboard.js").read_text(encoding="utf-8")
    combined = dash + role_js
    for needle in [
        "getVolunteerShiftSummary",
        "getPastoralFollowupSummary",
        "listPendingMinistrySuggestions",
    ]:
        assert needle in combined, "missing CRM KPI bridge: " + needle
    assert "visitation_followup/list.html" in combined
    assert "visitation_followup/form.html" in combined
    assert "tools/volunteer_shift/list.html" in combined
    assert "demo KPI 不可當正式決策" in combined
    assert "不會自動通知" in combined
    assert "牧養敏感資料不顯示全文" in combined
    assert "小白今日工作桌" in dash
    assert "crm-kpi-v1-root" in dash
    assert "getCrmKpiSnapshot" in role_js
    assert "t.note" not in dash
    assert "notePreview" not in dash
    assert "t.note" not in role_js
    assert "notePreview" not in role_js


def test_spiritual_stage_funnel_page():
    path = ROOT / "church_ministry" / "modules" / "research" / "spiritual-stage-funnel.html"
    assert path.is_file()
    text = path.read_text(encoding="utf-8")
    assert "getSpiritualStageFunnel" in text


def test_cta_bridge_syncs_crm():
    text = (ROOT / "church_planning" / "js" / "cta_os_bridge.js").read_text(encoding="utf-8")
    assert "syncPlanningAssessmentFromCtaReport" in text


def test_volunteer_crm_suggestions():
    text = (ROOT / "church_ministry" / "modules" / "volunteer" / "volunteer-integrated.html").read_text(encoding="utf-8")
    assert "renderCrmMinistrySuggestions" in text
    assert "confirmCrmSuggestion" in text


def test_member_import_export_bundle():
    text = (ROOT / "church_ministry" / "modules" / "members" / "member-integrated.html").read_text(encoding="utf-8")
    assert "exportMemberSystemBundle" in text
    assert "importMemberSystemBundle" in text


def test_sidebar_crm_streamlined():
    text = (ROOT / "church_ministry" / "sidebar.html").read_text(encoding="utf-8")
    assert "v3.1" in text
    assert "member-360-timeline.html" in text
    assert "visitation_index.html" in text
    assert text.count('href="people/people_list.html"') == 1
    assert "financial-management.html" not in text
    assert "modules/research/member-statistics.html" not in text


if __name__ == "__main__":
    test_bridge_exports_crm_methods()
    test_crm_constants_file()
    test_blueprint_docs_exist()
    test_visitation_index_wires_pastoral_event()
    test_member_integrated_crm_fields()
    test_analytics_redirects_to_research()
    test_bridge_has_nowIso_helper()
    test_visitation_followup_tool_pages_exist()
    test_volunteer_shift_tool_pages_exist()
    test_ai_lab_sidebar_crm_automation_link()
    test_index_v5_crm_automation_topbar()
    test_tool_kit_data_trust_v12()
    test_data_trust_three_hubs()
    test_data_trust_badge_module_and_wiring()
    test_crm_intent_router_v2()
    test_tool_kit_standard_doc()
    test_crm5_files_exist()
    test_cloud_config_crm5_flags()
    test_church_auth_rbac()
    test_dashboard_crm_workbench()
    test_finance_reconciliation_tool_pages_exist()
    test_demo_data_governance_v1()
    test_crm_dashboard_v1_kpi()
    test_spiritual_stage_funnel_page()
    test_cta_bridge_syncs_crm()
    test_volunteer_crm_suggestions()
    test_member_import_export_bundle()
    test_sidebar_crm_streamlined()
    print("OK: church CRM bridge smoke tests passed")
