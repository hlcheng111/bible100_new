# -*- coding: utf-8 -*-
"""Re-apply M1–M6 patches to sidebar_church_layout_v1.html after accidental git checkout."""
from pathlib import Path

p = Path(__file__).resolve().parents[1] / "sidebar_church_layout_v1.html"
t = p.read_text(encoding="utf-8")

if "sidebar_maturity_badges.css" not in t:
    t = t.replace(
        '  <link rel="stylesheet" href="../css/sidebar_construction_markers.css">\n</head>',
        '  <link rel="stylesheet" href="../css/sidebar_construction_markers.css">\n'
        '  <link rel="stylesheet" href="../css/sidebar_maturity_badges.css">\n</head>',
    )

if "layout-m2-hint" not in t:
    t = t.replace(
        '  <div id="container">\n\n    <a href="javascript:void(0)" class="sidebar-item sidebar-item-primary" style="margin-bottom:10px;',
        """  <div id="container">

    <p class="sb-m2-hint" id="layout-m2-hint">
      <strong>M2 誠實角標</strong>：
      <span class="sb-mat sb-mat--live">LIVE</span> 可日常用 ·
      <span class="sb-mat sb-mat--partial">PARTIAL</span> 半成品 ·
      <span class="sb-mat sb-mat--demo">DEMO</span> 示範。
      F 區進階目錄預設收合；會友／探訪／義工排班以 CRM「今日三步」為全站唯一主路徑宣傳（M3）。
    </p>

    <a href="javascript:void(0)" class="sidebar-item sidebar-item-primary" style="margin-bottom:10px;""",
    )

# A: LIVE + collapse advanced
t = t.replace(
    '🏛️ 部长 · 主日策划</a>\n      <details open>\n        <summary>进阶工具目录 <span class="arrow">▶</span></summary>',
    '🏛️ 部长 · 主日策划 <span class="sb-mat sb-mat--live">LIVE</span></a>\n'
    '      <details>\n        <summary>进阶工具目录 <span class="arrow">▶</span> <span class="sb-mat sb-mat--partial">PARTIAL</span></summary>',
)

# B visitation + members
t = t.replace(
    'data-b100-shell-nav="content">💬 探访事工（主入口）</a>',
    'data-b100-shell-nav="content" data-m2-step="visitation" data-m3-entry="visitation">'
    '💬 探訪工作桌 <span class="sb-mat sb-mat--live">LIVE</span></a>',
)
t = t.replace(
    'data-b100-shell-nav="content">📇 会友主档</a>',
    'data-b100-shell-nav="content" data-m2-step="members" data-m3-entry="members" data-m3-shortcut="1">'
    '📇 會友主檔 <small>（同 CRM／F）</small> <span class="sb-mat sb-mat--live">LIVE</span></a>',
)

# C education LIVE
t = t.replace(
    "#tab-roster'});\">📚 主日學工作桌</a>",
    "#tab-roster'});\">📚 主日學工作桌 <span class=\"sb-mat sb-mat--live\">LIVE</span></a>",
)

# D outreach LIVE chain
t = t.replace(
    'href="modules/expansion/outreach-strategy.html?crm_from=sidebar&amp;role=staff&amp;step=2" class="sidebar-item sidebar-item-primary">🗺️ 外展策略地圖（主入口）</a>',
    'href="modules/expansion/outreach-strategy.html?crm_from=sidebar&amp;role=staff&amp;step=2" '
    'class="sidebar-item sidebar-item-primary" data-m6-d-chain="1">'
    '🗺️ 外展策略 · 需求真鏈 <span class="sb-mat sb-mat--live">LIVE</span></a>',
)

# E + F blocks: replace old admin section
old_e_admin = """    <!-- E. 社會服務類 -->
    <div class="sidebar-section" data-sb-group="併">
      <h3>🤝 E. 社會服務</h3>
      <details>
        <summary>1. 志工事工 <span class="arrow">▶</span></summary>
        <a href="modules/volunteer/volunteer-integrated.html?crm_from=sidebar&role=leader&step=1" class="sidebar-item submenu-item">志工事工完整系統</a>
      </details>
      <details>
        <summary>2. 社區服務 <span class="arrow">▶</span></summary>
        <a href="congregation/index.html?crm_from=sidebar&role=leader&step=1" class="sidebar-item submenu-item">社區學苑／會眾入口（congregation）</a>
      </details>
    </div>

    <!-- 行政支援類（E · 戰情與行政） -->
    <div class="sidebar-section" data-sb-group="修">
      <h3>⚙️ 行政支援</h3>
      <a href="dashboard.html?crm_from=sidebar&amp;role=leader&amp;step=1" class="sidebar-item sidebar-item-primary">📊 事工戰情儀表板（主入口）</a>
      <details>
        <summary>1. 會員與財政 <span class="arrow">▶</span></summary>"""

new_e_f = """    <!-- E. 社會服務類 · M3：義工排班＝唯一主路徑 -->
    <div class="sidebar-section" data-sb-group="併">
      <h3>🤝 E. 社會服務</h3>
      <a href="tools/volunteer_shift/index.html?crm_from=sidebar&amp;role=leader&amp;step=1" class="sidebar-item sidebar-item-primary" data-m3-entry="volunteer">📅 義工排班 <span class="sb-mat sb-mat--live">LIVE</span> <small>（同 CRM）</small></a>
      <a href="congregation/index.html?crm_from=sidebar&amp;role=leader&amp;step=1" class="sidebar-item">🏘️ 會眾／社區學苑 <span class="sb-mat sb-mat--partial">PARTIAL</span></a>
      <details>
        <summary>進階 · 志工體系（非排班主路徑） <span class="arrow">▶</span></summary>
        <a href="modules/volunteer/volunteer-integrated.html?crm_from=sidebar&role=leader&step=1" class="sidebar-item submenu-item">志工體系／崗位 <span class="sb-mat sb-mat--partial">PARTIAL</span></a>
        <a href="congregation/index.html?crm_from=sidebar&role=leader&step=1" class="sidebar-item submenu-item">社區學苑／會眾入口</a>
      </details>
    </div>

    <!-- F. 行政支援類 · M2/M3 -->
    <div class="sidebar-section" data-sb-group="修" data-m2-zone="f">
      <h3>⚙️ F. 行政支援</h3>
      <a href="dashboard.html?crm_from=sidebar&amp;role=leader&amp;step=1" class="sidebar-item sidebar-item-primary">📊 事工戰情儀表板 <span class="sb-mat sb-mat--live">LIVE</span></a>
      <a href="modules/members/member-integrated.html?crm_from=sidebar&amp;role=leader&amp;step=1" class="sidebar-item sidebar-item-primary" data-m2-step="members" data-m3-entry="members">👤 會友主檔 <span class="sb-mat sb-mat--live">LIVE</span> <small>（同 CRM）</small></a>
      <details data-m2-f-core="1">
        <summary>1. 會員與財政 <span class="arrow">▶</span></summary>"""

if "F. 行政支援" not in t:
    if old_e_admin not in t:
        raise SystemExit("E/F block not found for replace")
    t = t.replace(old_e_admin, new_e_f)

# F submenu badges
t = t.replace(
    '        <a href="people/people_list.html?crm_from=sidebar&role=leader&step=1" class="sidebar-item submenu-item">人員總覽</a>\n'
    '        <a href="modules/members/member-integrated.html?crm_from=sidebar&role=leader&step=1" class="sidebar-item submenu-item">會友事工</a>\n'
    '        <a href="modules/finance/finance-integrated.html?crm_from=sidebar&role=leader&step=1" class="sidebar-item submenu-item">財務事工</a>',
    '        <a href="people/people_list.html?crm_from=sidebar&role=leader&step=1" class="sidebar-item submenu-item">人員總覽 <small>（索引捷徑）</small></a>\n'
    '        <a href="modules/members/member-integrated.html?crm_from=sidebar&role=leader&step=1" class="sidebar-item submenu-item" data-m3-shortcut="1">會友主檔（同上）</a>\n'
    '        <a href="modules/finance/finance-integrated.html?crm_from=sidebar&role=leader&step=1" class="sidebar-item submenu-item">財務事工 <span class="sb-mat sb-mat--partial">PARTIAL</span></a>',
)

for old, new in [
    ('<summary>2. 財務與資產 <span class="arrow">▶</span></summary>',
     '<summary>2. 財務與資產 <span class="arrow">▶</span> <span class="sb-mat sb-mat--partial">PARTIAL</span></summary>'),
    ('<summary>3. 研究與統計 <span class="arrow">▶</span> <small style="color:#999;">示意</small></summary>',
     '<summary>3. 研究與統計 <span class="arrow">▶</span> <span class="sb-mat sb-mat--demo">DEMO</span></summary>'),
    ('<summary>4. 媒體與科技 <span class="arrow">▶</span></summary>',
     '<summary>4. 媒體與科技 <span class="arrow">▶</span> <span class="sb-mat sb-mat--demo">DEMO</span></summary>'),
    ('<summary>5. 工具與支援 <span class="arrow">▶</span></summary>',
     '<summary>5. 工具與支援 <span class="arrow">▶</span> <span class="sb-mat sb-mat--demo">DEMO</span></summary>'),
    ('<summary>6. 行政管理 <span class="arrow">▶</span></summary>',
     '<summary>6. 行政管理 <span class="arrow">▶</span> <span class="sb-mat sb-mat--partial">PARTIAL</span></summary>'),
]:
    t = t.replace(old, new)

# focus map + f special-case
old_keys = "      var keys = { a: '🎼 A.', b: '🌾 B.', c: '📚 C.', d: '🌍 D.', admin: '⚙️ 行政' };"
new_keys = """      var keys = {
        a: 'A.',
        b: 'B.',
        c: 'C.',
        d: 'D.',
        e: 'E.',
        f: 'F.',
        admin: 'F.'
      };"""
if old_keys in t:
    t = t.replace(old_keys, new_keys)

old_focus_open = "        sec.querySelectorAll('details').forEach(function (d, i) { if (i === 0) d.open = true; });"
new_focus_open = """        if (focus === 'f' || focus === 'admin') {
          sec.querySelectorAll('details').forEach(function (d) {
            d.open = !!d.getAttribute('data-m2-f-core');
          });
        } else if (focus === 'e') {
          sec.querySelectorAll('details').forEach(function (d, i) { d.open = i === 0; });
        } else {
          sec.querySelectorAll('details').forEach(function (d, i) { if (i === 0) d.open = true; });
        }"""
if old_focus_open in t and "focus === 'f'" not in t:
    t = t.replace(old_focus_open, new_focus_open)

p.write_text(t, encoding="utf-8")
checks = {
    "E. 社會服務": "E. 社會服務" in t,
    "F. 行政支援": "F. 行政支援" in t,
    "layout-m2-hint": "layout-m2-hint" in t,
    "volunteer_shift": "volunteer_shift" in t,
    "data-m6-d-chain": 'data-m6-d-chain="1"' in t,
    "data-m2-f-core": 'data-m2-f-core="1"' in t,
    "maturity css": "sidebar_maturity_badges.css" in t,
}
for k, v in checks.items():
    print(("OK" if v else "FAIL"), k)
