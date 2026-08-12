#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Add 4-Tab charter intro/methodology to pastoral-spiritual-survey-pro.html."""
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
HTML = REPO / "church_planning" / "pastoral-spiritual-survey-pro.html"
text = HTML.read_text(encoding="utf-8")

# Title
text = text.replace(
    "<h1>教牧／領袖靈命調查（專業版）</h1>",
    "<h1>領袖健康診斷</h1>",
    1,
)
text = text.replace(
    "<p class=\"header-subtitle\">給教牧與屬靈領袖的自我反省與陪伴對話工具</p>",
    "<p class=\"header-subtitle\">教牧／核心同工 · 負擔與節奏 · 專業版（近似 ALDA 四 Tab）</p>",
    1,
)

# Nav: prepend intro, append methodology; relabel core tabs
old_nav = """    <nav class="main-tabs main-tabs--compact tab-compact no-print" id="mainTabs" role="tablist" aria-label="主分頁">
      <button type="button" class="main-tab active" id="mainTabProfile" role="tab" aria-selected="true" data-view="profile">🧾 資料</button>
      <button type="button" class="main-tab" id="mainTabSurvey" role="tab" aria-selected="false" data-view="survey">📝 填寫問卷</button>
      <button type="button" class="main-tab" id="mainTabOverview" role="tab" aria-selected="false" data-view="overview">📊 概覽報告</button>
      <button type="button" class="main-tab" id="mainTabReflect" role="tab" aria-selected="false" data-view="reflect">💭 再想想看</button>
      <button type="button" class="main-tab" id="mainTabRisk" role="tab" aria-selected="false" data-view="risk">⚠ 交叉風險</button>
      <button type="button" class="main-tab" id="mainTabCoordinator" role="tab" aria-selected="false" data-view="coordinator">📋 負責人綜合研判</button>
    </nav>"""

new_nav = """    <nav class="main-tabs main-tabs--compact tab-compact no-print" id="mainTabs" role="tablist" aria-label="主分頁">
      <button type="button" class="main-tab active" id="mainTabIntro" role="tab" aria-selected="true" data-view="intro">① 理念</button>
      <button type="button" class="main-tab" id="mainTabSurvey" role="tab" aria-selected="false" data-view="survey">② 測評</button>
      <button type="button" class="main-tab" id="mainTabOverview" role="tab" aria-selected="false" data-view="overview">③ 報告</button>
      <button type="button" class="main-tab" id="mainTabMethodology" role="tab" aria-selected="false" data-view="methodology">④ 輔導員手冊</button>
    </nav>
    <p class="intro-benefit no-print" style="max-width:52rem;margin:0.35rem auto 0;font-size:0.76rem;color:#64748b;">
      進階：③ 報告內含「再想想看」「交叉風險」；④ 手冊含「負責人綜合研判」連結。
    </p>"""

if old_nav in text:
    text = text.replace(old_nav, new_nav)

intro_section = """
    <section id="view-intro" class="main-view" aria-labelledby="mainTabIntro">
      <h2>① 理念與說明 · 教牧／核心同工</h2>
      <p class="view-intro">本工具量<strong>負擔、節奏、界線、支持</strong>，不是 KPI 或人事考核。填答只留本機；AI 僅草稿，須 HITL。</p>
      <div class="usage-box" style="margin-top:1rem;">
        <h3>填答者三步走</h3>
        <ol class="list-compact">
          <li><strong>② 測評</strong>：A1–F5 共 35 題 Likert + 選填背景。</li>
          <li><strong>③ 報告</strong>：七維度 + A–F 範疇概覽 + 風險卡片。</li>
          <li><strong>帶出去</strong>：與問責同伴／導師談；可對照 <a href="12 Apostles Leadership Assessment.html">ALDA</a>、<a href="important-urgent-matrix.html">urgent</a>。</li>
        </ol>
      </div>
      <p class="next-step-hint"><button type="button" class="btn secondary" onclick="showMainView('survey')">進入測評 →</button></p>
    </section>
"""

methodology_section = """
    <section id="view-methodology" class="main-view" hidden aria-labelledby="mainTabMethodology">
      <h2>④ 輔導員手冊（評分解密）</h2>
      <p class="view-intro">七維度由 A1–F5 題目級映射 rollup（見 <code>pastoral_spiritual_health.js</code>）。綠 ≥4 · 黃 2.8–4 · 紅 &lt;2.8。</p>
      <div class="usage-box">
        <h3>怎麼帶？（約 45 分鐘）</h3>
        <ul>
          <li>先說明：這是<strong>自我照X光</strong>，不是考核。</li>
          <li>紅燈維度只選一項行動（休息、界線、問責）。</li>
          <li>交叉風險卡片亮起 → 宜暫緩擴張事工。</li>
          <li>負責人綜合研判僅限受託關懷者，勿公開排名。</li>
        </ul>
      </div>
      <p class="next-step-hint">
        <button type="button" class="btn secondary" onclick="showMainView('coordinator')">打開負責人綜合研判 →</button>
        · <button type="button" class="btn secondary" onclick="showMainView('risk')">交叉風險 →</button>
      </p>
    </section>
"""

if 'id="view-intro"' not in text:
    text = text.replace('<section id="view-profile"', intro_section + '\n    <section id="view-profile"', 1)

if 'id="view-methodology"' not in text:
    anchor = '<section id="view-coordinator"'
    if anchor in text:
        text = text.replace(anchor, methodology_section + '\n    ' + anchor, 1)

# showMainView: handle intro + methodology; default intro on load
old_show = """    function showMainView(name, skipScroll) {
      var viewProfile = document.getElementById("view-profile");
      var viewSurvey = document.getElementById("view-survey");
      var viewOverview = document.getElementById("view-overview");
      var viewReflect = document.getElementById("view-reflect");"""

new_show = """    function showMainView(name, skipScroll) {
      var viewIntro = document.getElementById("view-intro");
      var viewMethodology = document.getElementById("view-methodology");
      var viewProfile = document.getElementById("view-profile");
      var viewSurvey = document.getElementById("view-survey");
      var viewOverview = document.getElementById("view-overview");
      var viewReflect = document.getElementById("view-reflect");"""

if old_show in text:
    text = text.replace(old_show, new_show)

# Hide intro/methodology in view toggle block - find pattern where views get hidden
hide_patch_old = """      if (viewProfile) viewProfile.hidden = name !== "profile";
      if (viewSurvey) viewSurvey.hidden = name !== "survey";
      if (viewOverview) viewOverview.hidden = name !== "overview";
      if (viewReflect) viewReflect.hidden = name !== "reflect";"""
hide_patch_new = """      if (viewIntro) viewIntro.hidden = name !== "intro";
      if (viewMethodology) viewMethodology.hidden = name !== "methodology";
      if (viewProfile) viewProfile.hidden = name !== "profile" && name !== "survey";
      if (viewSurvey) viewSurvey.hidden = name !== "survey";
      if (viewOverview) viewOverview.hidden = name !== "overview" && name !== "reflect" && name !== "risk";
      if (viewReflect) viewReflect.hidden = name !== "reflect" && name !== "overview";
      if (name === "survey") { if (viewProfile) viewProfile.hidden = false; if (viewSurvey) viewSurvey.hidden = false; }"""

if hide_patch_old in text:
    text = text.replace(hide_patch_old, hide_patch_new)

# Tab button active states - find mainTabProfile block
tab_active_old = """      var tabProfile = document.getElementById("mainTabProfile");
      var tabSurvey = document.getElementById("mainTabSurvey");
      var tabOverview = document.getElementById("mainTabOverview");
      var tabReflect = document.getElementById("mainTabReflect");
      var tabRisk = document.getElementById("mainTabRisk");
      var tabCoordinator = document.getElementById("mainTabCoordinator");
      var tabs = [tabProfile, tabSurvey, tabOverview, tabReflect, tabRisk, tabCoordinator];"""
tab_active_new = """      var tabIntro = document.getElementById("mainTabIntro");
      var tabSurvey = document.getElementById("mainTabSurvey");
      var tabOverview = document.getElementById("mainTabOverview");
      var tabMethodology = document.getElementById("mainTabMethodology");
      var tabs = [tabIntro, tabSurvey, tabOverview, tabMethodology];"""

if tab_active_old in text:
    text = text.replace(tab_active_old, tab_active_new)

# Map tab active by view name
active_map_old = """      if (tabProfile) tabProfile.classList.toggle("active", name === "profile");
      if (tabSurvey) tabSurvey.classList.toggle("active", name === "survey");
      if (tabOverview) tabOverview.classList.toggle("active", name === "overview");
      if (tabReflect) tabReflect.classList.toggle("active", name === "reflect");
      if (tabRisk) tabRisk.classList.toggle("active", name === "risk");
      if (tabCoordinator) tabCoordinator.classList.toggle("active", name === "coordinator");"""
active_map_new = """      if (tabIntro) tabIntro.classList.toggle("active", name === "intro");
      if (tabSurvey) tabSurvey.classList.toggle("active", name === "survey" || name === "profile");
      if (tabOverview) tabOverview.classList.toggle("active", name === "overview" || name === "reflect" || name === "risk");
      if (tabMethodology) tabMethodology.classList.toggle("active", name === "methodology" || name === "coordinator");"""

if active_map_old in text:
    text = text.replace(active_map_old, active_map_new)

# Initial view: intro not profile
text = text.replace('showMainView("profile");', 'showMainView("intro");', 1)

# Hide profile section initially when intro is default
text = text.replace(
    '<section id="view-profile" class="main-view"',
    '<section id="view-profile" class="main-view" hidden',
    1,
)

# Add pack scripts before closing body if missing
if "pastoral_pack.js" not in text and "</body>" in text:
    scripts = """
<script src="js/spiritual_health_scoring.js"></script>
<script src="js/assessment_run_store.js"></script>
<script src="js/tool_packs/pastoral_pack.js"></script>
"""
    # only if pastoral_spiritual_health already loaded - find last script
    idx = text.rfind("<script")
    if idx > 0 and "pastoral_spiritual_health.js" in text:
        pass
    text = text.replace("</body>", scripts + "</body>")

HTML.write_text(text, encoding="utf-8")
print("Patched", HTML)
