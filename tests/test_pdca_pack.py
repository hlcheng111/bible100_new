#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""pdca_pack.js · 教牧體感 · Deming Delta · 活體 SWOT 鏈路契約。"""
from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
HTML = REPO / "church_planning" / "Church_Governance_PDCA_cycle.html"
PACK = REPO / "church_planning" / "js" / "tool_packs" / "pdca_pack.js"
DESK = REPO / "church_planning" / "js" / "pdca_pastoral_desk_content.js"
INTRO_MIN_CHARS = 800
DESK_MIN_CHARS = 2800

FORBIDDEN_UI = (
    "ACS 四 Tab",
    "CTA-OS",
    "Church_Governance_PDCA_cycle",
    "pdca_contract JSON",
)

REQUIRED_UI = (
    "神國管家",
    "恩跡年表儀表盤",
    "聖靈的修剪",
    "長執同工們，辛苦了",
    "哥林多前書 4:2",
    "路加福音 14:31",
)

TEST_SCRIPT = r"""
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const repo = process.argv[1];
const sandbox = { console, Math, Date, JSON, requestAnimationFrame: null, localStorage: { _m: {}, getItem(k){ return this._m[k]||null; }, setItem(k,v){ this._m[k]=v; } } };
sandbox.window = sandbox;
sandbox.global = sandbox;
vm.createContext(sandbox);
function load(rel) { vm.runInContext(fs.readFileSync(path.join(repo, rel), 'utf8'), sandbox); }
load('church_planning/js/assessment_run_store.js');
load('church_planning/js/tool_packs/ncd_pack.js');
load('church_planning/js/tool_packs/swot_pack.js');
load('church_planning/js/tool_packs/pdca_pack.js');
load('church_planning/js/pdca_cycle_viz.js');
const Pack = sandbox.PdcaPack;
const Store = sandbox.AssessmentRunStore;
const swotDemo = sandbox.SwotPack.buildDemoRun();
if (swotDemo.ok) Store.saveRun(swotDemo.run);
const demo = Pack.buildDemoRun();
if (!demo.ok) { console.error('FAIL demo', demo.errors); process.exit(1); }
const dc = demo.run.pdca_contract.check_variance;
if (dc.Delta_variance !== 2.8) { console.error('FAIL demo delta', dc.Delta_variance); process.exit(1); }
if (!dc.deming_alert) { console.error('FAIL deming_alert'); process.exit(1); }
const html = sandbox.PdcaCycleViz.renderMatrixBlock(demo.run.derived, { animate: true });
if (html.indexOf('pdca-speedo') < 0) { console.error('FAIL speedo'); process.exit(1); }
if (html.indexOf('警報') < 0) { console.error('FAIL alert banner'); process.exit(1); }
const answers = {};
Pack.QUESTIONS.forEach(q => { answers[q.id] = q.phase === 'plan' ? 5 : q.phase === 'do' ? 2 : 3; });
const built = Pack.buildRun(answers, { season_focus: 'Q2' });
if (!built.ok) { console.error('FAIL build'); process.exit(1); }
const c = built.run.pdca_contract;
if (!c.plan_metrics || !c.do_progress || !c.check_variance) { console.error('FAIL contract'); process.exit(1); }
if (!c.upstream_refs || !c.upstream_refs.live_chain) { console.error('FAIL upstream'); process.exit(1); }
const ws = Pack.mergeWorkshop({
  cycle: {
    ministryContext: '門訓',
    planProblem: '破口',
    planRows: [{ action: '雙週跟進', ownerRole: '牧者', eta: 'Q2' }],
    doRows: [{ status: 'partial', actualNote: '延遲' }],
    doProgressNotes: '需調整',
    doTrafficLight: 'yellow',
    checkOutcome: '觀察', checkEvidence: '數據', checkGap: '落差',
    actKeep: '保留', actAdjust: '調整', actStop: '', actOwner: '長執', actDueDate: '8週'
  },
  seasonLine: '測試季',
  likertSel: '3'
});
if (!ws.ok || !ws.run.pdca_contract.workshop_notes) { console.error('FAIL mergeWorkshop'); process.exit(1); }
if (ws.run.pdca_contract.workshop_notes.schema !== 'workshop_notes_v1') { console.error('FAIL workshop schema'); process.exit(1); }
const viz = sandbox.PdcaCycleViz.renderWorkshopNotesBlock(ws.run.pdca_contract.workshop_notes);
if (viz.indexOf('質性工作坊') < 0) { console.error('FAIL workshop viz'); process.exit(1); }
console.log(JSON.stringify({ ok: true, demoDelta: dc.Delta_variance }));
"""


def main() -> int:
    if not HTML.is_file():
        sys.exit("FAIL: Church_Governance_PDCA_cycle.html missing")
    html = HTML.read_text(encoding="utf-8")
    desk = DESK.read_text(encoding="utf-8") if DESK.is_file() else ""

    if 'data-strategic-default="intro"' not in html:
        sys.exit("FAIL: default tab must be intro")
    for bad in FORBIDDEN_UI:
        if bad in html:
            sys.exit(f"FAIL: forbidden UI text: {bad}")
    for good in REQUIRED_UI:
        if good not in html and good not in desk:
            sys.exit(f"FAIL: missing pastoral UI: {good}")
    if "cta_os_bridge.js" in html or "CTAOSBridge.initPage" in html:
        sys.exit("FAIL: CTA-OS bridge must not load on pastoral PDCA page")

    intro = re.search(
        r'id="pdca-tab-intro-content"[^>]*>(.*?)</div>\s*</section>',
        html,
        re.S,
    )
    if not intro or len(intro.group(1)) < INTRO_MIN_CHARS:
        sys.exit("FAIL: Tab1 pastoral intro too short")

    desk_block = re.search(r"var DESK_BODY_HTML\s*=\s*(.*?);\s*function applyDeskState", desk, re.S)
    if desk_block:
        raw = desk_block.group(1)
        desk_text = re.sub(r"\s*\+\s*", "", raw)
        desk_text = re.sub(r"^['\"]|['\"]$", "", desk_text)
        desk_text = desk_text.replace("\\'", "'").replace('\\"', '"')
        desk_len = len(desk_text)
    else:
        desk_len = 0
    if desk_len < DESK_MIN_CHARS:
        sys.exit(f"FAIL: Tab4 desk template too short ({desk_len} < {DESK_MIN_CHARS})")

    if "pdca-quick-survey-wrap" not in html:
        sys.exit("FAIL: Tab2 quick survey missing")

    proc = subprocess.run(
        ["node", "-e", TEST_SCRIPT, str(REPO)],
        cwd=str(REPO),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=30,
    )
    if proc.returncode != 0:
        print("FAIL:", proc.stderr or proc.stdout, file=sys.stderr)
        return 1
    print("OK: PDCA pastoral UI + demo Delta 2.8 + speedometer + live SWOT chain")
    return 0


if __name__ == "__main__":
    sys.exit(main())
