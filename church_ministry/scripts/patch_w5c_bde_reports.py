#!/usr/bin/env python3
"""W5c stage-3: CSV + print + data-w5-report markers for B/D/E zone pages."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

UTILS_MODULES = '<script src="../../js/cm_report_utils.js"></script>'
UTILS_CONG = '<script src="../js/cm_report_utils.js"></script>'

REPORT_BAR_STYLE = (
    'style="padding:8px 16px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;'
    'background:#ecfdf5;border-bottom:1px solid #a7f3d0;"'
)


def ensure_utils_before_body_close(text: str, util_tag: str) -> str:
    if "cm_report_utils.js" in text:
        return text
    idx = text.rfind("</body>")
    if idx < 0:
        return text
    return text[:idx] + f"\n<!-- b100-w5-report-utils -->\n{util_tag}\n" + text[idx:]


def patch_file(rel: str, transform) -> bool:
    path = ROOT / rel.replace("/", "\\") if "\\" not in rel else ROOT / rel
    if not path.exists():
        print(f"SKIP missing: {rel}")
        return False
    orig = path.read_text(encoding="utf-8")
    new = transform(orig)
    if new == orig:
        print(f"UNCHANGED: {rel}")
        return False
    path.write_text(new, encoding="utf-8")
    print(f"PATCHED: {rel}")
    return True


# --- fellowship/index.html B-03 ---
def patch_fellowship_index(t: str) -> str:
    if 'data-w5-report="fellowship-index-csv"' in t:
        return ensure_utils_before_body_close(t, UTILS_MODULES)
    bar = f'''
    <div id="w5ReportBar" {REPORT_BAR_STYLE}>
        <strong>B-03 報告</strong>
        <button type="button" onclick="exportFellowshipOverviewCsv()" data-w5-report="fellowship-index-csv">⬇ CSV</button>
        <button type="button" onclick="printFellowshipOverview()" data-w5-report="fellowship-index-print">🖨 列印</button>
    </div>'''
    t = t.replace(
        '<div class="p-6">',
        bar + '\n    <div class="p-6">',
        1,
    )
    export_js = '''
        function readLs(key, fallback) {
            try { var r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch (e) { return fallback; }
        }
        function exportFellowshipOverviewCsv() {
            var U = window.CmReportUtils;
            if (!U) return;
            var esc = U.csvEsc;
            var groups = readLs('groups', []);
            var members = readLs('groupMembers', []);
            var plans = readLs('visitPlans', []);
            var records = readLs('visitRecords', []);
            var lines = [['類別','名稱','備註'].map(esc).join(',')];
            groups.forEach(function (g) { lines.push(['小組', g.name || g.id, (g.leader || '') + ' · ' + (g.memberCount || '')].map(esc).join(',')); });
            members.forEach(function (m) { lines.push(['組員', m.name || m.memberId, m.groupName || ''].map(esc).join(',')); });
            plans.forEach(function (p) { lines.push(['探訪計劃', p.memberName || p.target || '', p.date || ''].map(esc).join(',')); });
            records.forEach(function (r) { lines.push(['探訪記錄', r.memberName || r.target || '', r.date || ''].map(esc).join(',')); });
            U.downloadCsv('fellowship_overview_' + new Date().toISOString().slice(0, 10) + '.csv', lines);
        }
        function printFellowshipOverview() {
            var U = window.CmReportUtils;
            if (!U) return;
            var groups = readLs('groups', []);
            var rows = groups.map(function (g) { return [g.name || '', g.leader || '', String(g.memberCount || ''), g.status || '']; });
            U.printTable('團契互動概況', ['小組', '組長', '人數', '狀態'], rows);
        }
'''
    t = t.replace("        // 更新統計數據", export_js + "\n        // 更新統計數據", 1)
    return ensure_utils_before_body_close(t, UTILS_MODULES)


# --- pastoral HTML pages (toolbar + inline export) ---
PASTORAL_ORG_EXPORT = '''
<script>
(function () {
  function exportPastoralOrgRosterCsv() {
    var H = window.PastoralDataHub, U = window.CmReportUtils;
    if (!H || !U) return;
    var esc = U.csvEsc;
    var lines = [['memberId', '姓名', '小組', '年齡帶', '地區', '事奉標籤', '生命週期'].map(esc).join(',')];
    H.getMembersMatrixFiltered({}).forEach(function (r) {
      lines.push([
        r.member.id, r.member.name, r.group ? r.group.name : '',
        r.matrix.ageZone || '', r.matrix.geoZone || '',
        (r.ministryLabels || []).join('、'),
        H.getMemberLifecycleStage ? H.getMemberLifecycleStage(r.member.id) : ''
      ].map(esc).join(','));
    });
    U.downloadCsv('pastoral_org_roster_' + (H.todayISO ? H.todayISO() : '') + '.csv', lines);
  }
  function printPastoralOrgRoster() {
    var H = window.PastoralDataHub, U = window.CmReportUtils;
    if (!H || !U) return;
    var rows = H.getMembersMatrixFiltered({}).map(function (r) {
      return [r.member.name, r.group ? r.group.name : '', r.matrix.ageZone || '', (r.ministryLabels || []).join('、')];
    });
    U.printTable('組織與名册', ['姓名', '小組', '年齡帶', '事奉標籤'], rows);
  }
  window.exportPastoralOrgRosterCsv = exportPastoralOrgRosterCsv;
  window.printPastoralOrgRoster = printPastoralOrgRoster;
})();
</script>'''

PASTORAL_EVENTS_EXPORT = '''
<script>
(function () {
  function exportPastoralEventsCsv() {
    var H = window.PastoralDataHub, U = window.CmReportUtils;
    if (!H || !U) return;
    var esc = U.csvEsc;
    var b = H.getEventsBoard();
    var lines = [['類型', '標題', '日期', '狀態/備註'].map(esc).join(',')];
    (b.announcements || []).forEach(function (a) {
      var st = H.getAnnouncementRelayStats ? H.getAnnouncementRelayStats(a.id) : null;
      lines.push(['通告', a.title || '', a.date || '', st ? ('傳遞率' + st.relayRate + '%') : ''].map(esc).join(','));
    });
    (b.registrations || []).forEach(function (r) {
      lines.push(['報名', r.title || r.eventTitle || '', r.date || '', r.groupName || ''].map(esc).join(','));
    });
    (b.rotas || []).forEach(function (r) {
      lines.push(['排班', r.title || r.role || '', r.date || '', (r.memberName || r.memberId || '')].map(esc).join(','));
    });
    U.downloadCsv('pastoral_events_' + (H.todayISO ? H.todayISO() : '') + '.csv', lines);
  }
  function printPastoralEvents() {
    var H = window.PastoralDataHub, U = window.CmReportUtils;
    if (!H || !U) return;
    var b = H.getEventsBoard();
    var rows = (b.announcements || []).map(function (a) {
      var st = H.getAnnouncementRelayStats ? H.getAnnouncementRelayStats(a.id) : null;
      return [a.title || '', a.date || '', st ? st.relayRate + '%' : ''];
    });
    U.printTable('聖工與活動通告', ['標題', '日期', '小組傳遞率'], rows);
  }
  window.exportPastoralEventsCsv = exportPastoralEventsCsv;
  window.printPastoralEvents = printPastoralEvents;
})();
</script>'''

PASTORAL_STRATEGY_EXPORT = '''
<script>
(function () {
  function exportPastoralStrategyCsv() {
    var H = window.PastoralDataHub, U = window.CmReportUtils;
    if (!H || !U) return;
    var esc = U.csvEsc;
    var s = H.getStrategyStore();
    var lines = [['類型', '日期', '摘要', '狀態'].map(esc).join(',')];
    (s.visitLogs || []).forEach(function (v) {
      lines.push(['探訪', v.date || '', v.summary || v.topic || '', v.painCategory || ''].map(esc).join(','));
    });
    (s.proposals || []).forEach(function (p) {
      lines.push(['提案', p.date || '', p.title || p.summary || '', p.status || ''].map(esc).join(','));
    });
    (s.prayerItems || []).forEach(function (p) {
      lines.push(['代禱', p.date || '', p.request || '', p.urgency || ''].map(esc).join(','));
    });
    U.downloadCsv('pastoral_strategy_' + (H.todayISO ? H.todayISO() : '') + '.csv', lines);
  }
  function printPastoralStrategy() {
    var H = window.PastoralDataHub, U = window.CmReportUtils;
    if (!H || !U) return;
    var s = H.getStrategyStore();
    var rows = (s.visitLogs || []).map(function (v) {
      return [v.date || '', v.summary || '', v.painCategory || ''];
    });
    U.printTable('牧養策略 · 探訪記錄', ['日期', '摘要', '痛點分類'], rows);
  }
  window.exportPastoralStrategyCsv = exportPastoralStrategyCsv;
  window.printPastoralStrategy = printPastoralStrategy;
})();
</script>'''


def patch_pastoral_toolbar(t: str, csv_id: str, print_id: str, csv_fn: str, print_fn: str, export_block: str) -> str:
    if f'data-w5-report="{csv_id}"' in t:
        return ensure_utils_before_body_close(t, UTILS_MODULES)
    btn = (
        f'\n                <button type="button" class="sg-btn outline" onclick="{csv_fn}()" '
        f'data-w5-report="{csv_id}">⬇ CSV</button>'
        f'\n                <button type="button" class="sg-btn outline" onclick="{print_fn}()" '
        f'data-w5-report="{print_id}">🖨 列印</button>'
    )
    t = t.replace(
        '<button type="button" class="sg-btn outline" id="por-seed-btn">',
        btn + '\n                <button type="button" class="sg-btn outline" id="por-seed-btn">',
        1,
    ) if 'por-seed-btn' in t else t.replace(
        '<button type="button" class="sg-btn outline" id="pev-seed-btn">',
        btn + '\n                <button type="button" class="sg-btn outline" id="pev-seed-btn">',
        1,
    ) if 'pev-seed-btn' in t else t.replace(
        '<button type="button" class="sg-btn outline" id="pst-seed-btn">',
        btn + '\n                <button type="button" class="sg-btn outline" id="pst-seed-btn">',
        1,
    )
    if export_block not in t:
        t = t.replace("</body>", export_block + "\n</body>", 1)
    return ensure_utils_before_body_close(t, UTILS_MODULES)


def patch_fellowship_circles(t: str) -> str:
    if 'data-w5-report="fellowship-circles-csv"' in t:
        return ensure_utils_before_body_close(t, UTILS_MODULES)
    bar = f'''
        <div {REPORT_BAR_STYLE.replace("border-bottom", "border-radius:8px;margin-bottom:12px;border")}>
            <strong>B-10 報告</strong>
            <button type="button" onclick="exportFellowshipCirclesCsv()" data-w5-report="fellowship-circles-csv">⬇ CSV</button>
            <button type="button" onclick="printFellowshipCircles()" data-w5-report="fellowship-circles-print">🖨 列印</button>
        </div>'''
    t = t.replace('<div class="circle-grid" id="circle-grid"></div>', bar + '\n        <div class="circle-grid" id="circle-grid"></div>', 1)
    export_js = '''
    function exportFellowshipCirclesCsv() {
        var H = window.PastoralDataHub, U = window.CmReportUtils;
        if (!U) return;
        var esc = U.csvEsc;
        var stats = H && H.getFellowshipCircleStats ? H.getFellowshipCircleStats() : [];
        var lines = [['圈別', '標籤', '說明', 'Hub人數', 'Hub小組數'].map(esc).join(',')];
        CIRCLES.forEach(function (c) {
            var st = stats.find(function (s) { return c.ageZone && s.ageZone === c.ageZone; });
            lines.push([c.title, (c.tags || []).join('、'), c.desc, st ? st.memberCount : '', st ? st.groupCount : ''].map(esc).join(','));
        });
        U.downloadCsv('fellowship_circles_' + new Date().toISOString().slice(0, 10) + '.csv', lines);
    }
    function printFellowshipCircles() {
        var H = window.PastoralDataHub, U = window.CmReportUtils;
        if (!U) return;
        var stats = H && H.getFellowshipCircleStats ? H.getFellowshipCircleStats() : [];
        var rows = CIRCLES.map(function (c) {
            var st = stats.find(function (s) { return c.ageZone && s.ageZone === c.ageZone; });
            return [c.title, (c.tags || []).join('、'), st ? st.memberCount + '人' : ''];
        });
        U.printTable('團契的圈', ['圈別', '標籤', 'Hub人數'], rows);
    }
    window.exportFellowshipCirclesCsv = exportFellowshipCirclesCsv;
    window.printFellowshipCircles = printFellowshipCircles;
'''
    t = t.replace("        var stats = H && H.getFellowshipCircleStats", export_js + "\n        var stats = H && H.getFellowshipCircleStats", 1)
    return ensure_utils_before_body_close(t, UTILS_MODULES)


def patch_youth_ministry(t: str) -> str:
    if 'data-w5-report="youth-ministry-csv"' in t:
        return ensure_utils_before_body_close(t, UTILS_MODULES)
    bar = f'''
<div {REPORT_BAR_STYLE.replace("border-bottom", "border-radius:8px;margin-bottom:12px;border")}>
<strong>B-12 報告</strong>
<button type="button" onclick="exportYouthActivitiesCsv()" data-w5-report="youth-ministry-csv">⬇ CSV</button>
<button type="button" onclick="printYouthActivities()" data-w5-report="youth-ministry-print">🖨 列印</button>
</div>'''
    t = t.replace('<div class="header"><h1>', bar + '\n<div class="header"><h1>', 1)
    t = t.replace(
        "function loadDemo() {\nconst activities = [",
        "var youthActivities = [];\nfunction loadDemo() {\nconst activities = [",
        1,
    )
    t = t.replace(
        "document.getElementById('loadBtn').style.display = 'none';\n}",
        "youthActivities = activities;\n"
        "try { localStorage.setItem('youth_ministry_activities', JSON.stringify(activities)); } catch (e) {}\n"
        "document.getElementById('loadBtn').style.display = 'none';\n}\n"
        "function getYouthActivities() {\n"
        "  if (youthActivities && youthActivities.length) return youthActivities;\n"
        "  try { return JSON.parse(localStorage.getItem('youth_ministry_activities') || '[]'); } catch (e) { return []; }\n"
        "}\n"
        "function exportYouthActivitiesCsv() {\n"
        "  var U = window.CmReportUtils; if (!U) return;\n"
        "  var esc = U.csvEsc;\n"
        "  var list = getYouthActivities();\n"
        "  var lines = [['活動', '日期', '類型', '參與人數'].map(esc).join(',')];\n"
        "  list.forEach(function (a) { lines.push([a.name, a.date, a.type, a.participants].map(esc).join(',')); });\n"
        "  U.downloadCsv('youth_ministry_' + new Date().toISOString().slice(0, 10) + '.csv', lines);\n"
        "}\n"
        "function printYouthActivities() {\n"
        "  var U = window.CmReportUtils; if (!U) return;\n"
        "  var rows = getYouthActivities().map(function (a) { return [a.name, a.date, a.type, String(a.participants)]; });\n"
        "  U.printTable('青年事工活動', ['活動', '日期', '類型', '參與人數'], rows);\n"
        "}",
        1,
    )
    return ensure_utils_before_body_close(t, UTILS_MODULES)


def patch_congregation_index(t: str) -> str:
    if 'data-w5-report="congregation-index-csv"' in t:
        return ensure_utils_before_body_close(t, UTILS_CONG)
    bar = f'''
  <div id="w5ReportBar" {REPORT_BAR_STYLE}>
    <strong>E-03 報告</strong>
    <button type="button" onclick="exportCongregationSummaryCsv()" data-w5-report="congregation-index-csv">⬇ CSV</button>
    <button type="button" onclick="printCongregationSummary()" data-w5-report="congregation-index-print">🖨 列印</button>
  </div>'''
    t = t.replace('<div class="card-grid">', bar + '\n  <div class="card-grid">', 1)
    export_js = '''
  window._congregationPeopleList = [];
  function exportCongregationSummaryCsv() {
    var U = window.CmReportUtils; if (!U) return;
    var esc = U.csvEsc;
    var list = window._congregationPeopleList || [];
    var lines = [['姓名', '性別', '出席次數', '狀態'].map(esc).join(',')];
    list.forEach(function (p) {
      lines.push([p.name, p.gender || '', p.attendance_count || 0, p.status || ''].map(esc).join(','));
    });
    U.downloadCsv('congregation_summary_' + new Date().toISOString().slice(0, 10) + '.csv', lines);
  }
  function printCongregationSummary() {
    var U = window.CmReportUtils; if (!U) return;
    var list = window._congregationPeopleList || [];
    var rows = list.slice(0, 200).map(function (p) {
      return [p.name, p.gender || '', String(p.attendance_count || 0), p.status || ''];
    });
    U.printTable('會眾入口 · 人員摘要', ['姓名', '性別', '出席', '狀態'], rows);
  }
'''
    t = t.replace(
        "function updateUI(list) {",
        export_js + "\n      function updateUI(list) {\n        window._congregationPeopleList = list || [];",
        1,
    )
    return ensure_utils_before_body_close(t, UTILS_CONG)


def patch_simple_demo_page(
    t: str,
    prefix: str,
    title: str,
    data_var: str,
    headers: list[str],
    row_fn: str,
    ls_key: str | None = None,
    load_from_ls: str | None = None,
) -> str:
    csv_id = f"{prefix}-csv"
    if f'data-w5-report="{csv_id}"' in t:
        return ensure_utils_before_body_close(t, UTILS_MODULES)
    bar = f'''
        <div {REPORT_BAR_STYLE.replace("border-bottom", "border-radius:8px;margin-bottom:12px;border")}>
            <strong>報告</strong>
            <button type="button" onclick="export{prefix.title().replace('-', '')}Csv()" data-w5-report="{csv_id}">⬇ CSV</button>
            <button type="button" onclick="print{prefix.title().replace('-', '')}()" data-w5-report="{prefix}-print">🖨 列印</button>
        </div>'''
    if '<div class="header">' in t:
        t = t.replace('<div class="header">', bar + '\n        <div class="header">', 1)
    elif '<div class="header"><h1>' in t:
        t = t.replace('<div class="header"><h1>', bar + '\n<div class="header"><h1>', 1)
    fn_base = "".join(w.capitalize() for w in prefix.replace("-", "_").split("_"))
    fn_base = fn_base[0].upper() + fn_base[1:] if fn_base else "Report"
    # simpler: use prefix parts
    parts = [p.capitalize() for p in prefix.split("-")]
    fn = "".join(parts)
    hdr_js = str(headers)
    get_data = f"var list = {data_var} || [];"
    if ls_key:
        get_data = (
            f"var list = {data_var} || [];\n"
            f"  if (!list.length) {{ try {{ list = JSON.parse(localStorage.getItem('{ls_key}') || '[]'); }} catch (e) {{ list = []; }} }}"
        )
    export_block = f'''
function export{fn}Csv() {{
  var U = window.CmReportUtils; if (!U) return;
  var esc = U.csvEsc;
  {get_data}
  var lines = [{hdr_js}.map(esc).join(',')];
  list.forEach(function (item) {{ lines.push(({row_fn}).map(esc).join(',')); }});
  U.downloadCsv('{prefix}_' + new Date().toISOString().slice(0, 10) + '.csv', lines);
}}
function print{fn}() {{
  var U = window.CmReportUtils; if (!U) return;
  {get_data}
  var rows = list.map(function (item) {{ return [{row_fn}]; }});
  U.printTable('{title}', {hdr_js}, rows);
}}
'''
    t = t.replace("</script>\n</body>", export_block + "</script>\n</body>", 1)
    if t.count("</script>\n</body>") == 0:
        t = t.replace("</body>", f"<script>{export_block}</script>\n</body>", 1)
    return ensure_utils_before_body_close(t, UTILS_MODULES)


def main() -> None:
    patched: list[str] = []
    specs = [
        ("modules/fellowship/index.html", patch_fellowship_index),
        (
            "modules/fellowship/pastoral-org-roster.html",
            lambda t: patch_pastoral_toolbar(
                t, "pastoral-org-roster-csv", "pastoral-org-roster-print",
                "exportPastoralOrgRosterCsv", "printPastoralOrgRoster", PASTORAL_ORG_EXPORT,
            ),
        ),
        (
            "modules/fellowship/pastoral-events.html",
            lambda t: patch_pastoral_toolbar(
                t, "pastoral-events-csv", "pastoral-events-print",
                "exportPastoralEventsCsv", "printPastoralEvents", PASTORAL_EVENTS_EXPORT,
            ),
        ),
        (
            "modules/fellowship/pastoral-strategy.html",
            lambda t: patch_pastoral_toolbar(
                t, "pastoral-strategy-csv", "pastoral-strategy-print",
                "exportPastoralStrategyCsv", "printPastoralStrategy", PASTORAL_STRATEGY_EXPORT,
            ),
        ),
        ("modules/fellowship/fellowship-circles.html", patch_fellowship_circles),
        ("modules/development/youth-ministry-dev.html", patch_youth_ministry),
        ("congregation/index.html", patch_congregation_index),
    ]
    for rel, fn in specs:
        if patch_file(rel, fn):
            patched.append(rel)

    simple_pages = [
        ("modules/expansion/community-assessment.html", "community-assessment", "社區需求調研",
         "surveys", ["區域", "主題", "發現", "優先級", "分數"],
         "item.area, item.topic, item.findings, item.priority, item.score"),
        ("modules/expansion/mission-opportunities.html", "mission-opportunities", "宣教機會",
         "missions", ["地點", "類型", "時長", "團隊", "預算", "可行性"],
         "item.location, item.type, item.duration, item.team, item.cost, item.feasibility"),
        ("modules/expansion/new-ministry-planning.html", "new-ministry-planning", "新事工規劃",
         "projects", ["名稱", "類型", "負責人", "預算", "狀態", "進度", "開始日期"],
         "item.name, item.type, item.leader, item.budget, item.status, item.progress, item.startDate",
         "new_ministry_projects"),
        ("modules/expansion/church-planting.html", "church-planting", "植堂計劃",
         "projects", ["地點", "負責人", "預算", "進度"],
         "item.location, item.leader, item.budget, item.progress", "plantingData"),
        ("modules/expansion/branch-management.html", "branch-management", "分堂管理",
         "branches", ["分堂", "地址", "牧者", "會友數"],
         "item.name, item.address, item.pastor, item.members", "branchData"),
        ("modules/expansion/mission-expansion.html", "mission-expansion", "宣教拓展",
         "missions", ["地點", "類型", "團隊", "預算", "狀態"],
         "item.location, item.type, item.team, item.budget, item.status", "missionData"),
        ("modules/expansion/cross-cultural.html", "cross-cultural", "跨文化事工",
         "projects", ["項目", "族群", "負責人", "服事人數", "團隊", "狀態"],
         "item.name, item.targetGroup, item.leader, item.served, item.workers, item.status", "cross_cultural"),
        ("modules/innovation/new-media.html", "new-media", "新媒體事工",
         "contents", ["標題", "平台", "觸及", "日期"],
         "item.title, item.platform, item.reach, item.date", "new_media"),
        ("modules/innovation/innovation-projects.html", "innovation-projects", "創新項目",
         "projects", ["項目", "類別", "進度", "預期效果"],
         "item.name, item.category, item.progress, item.effect", "innovationData"),
        ("modules/innovation/technology-integration.html", "technology-integration", "科技應用",
         "tools", ["工具", "類別", "使用率", "評價"],
         "item.name, item.category, item.usage, item.rating", "techData"),
    ]
    for rel, prefix, title, var, headers, row_fn, *rest in simple_pages:
        ls = rest[0] if rest else None

        def make_patch(p=prefix, ti=title, v=var, h=headers, r=row_fn, lk=ls):
            return lambda t: patch_simple_demo_page(t, p, ti, v, h, r, lk)

        if patch_file(rel, make_patch()):
            patched.append(rel)

    print("\n=== Patched", len(patched), "files ===")
    for p in patched:
        print(" ", p)


if __name__ == "__main__":
    main()
