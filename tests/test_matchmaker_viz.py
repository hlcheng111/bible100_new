#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""職位媒合中心硬化與跨頁契約。"""
from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
HTML = REPO / "church_planning" / "ministry-position-matchmaker.html"
CORE = REPO / "church_planning" / "js" / "matchmaker_core.js"
VIZ = REPO / "church_planning" / "js" / "matchmaker_viz.js"

TEST_SCRIPT = r"""
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const repo = process.argv[1];
const sandbox = { console, Math, Date, JSON, localStorage: { _m: {}, getItem(k){ return this._m[k]||null; }, setItem(k,v){ this._m[k]=v; } } };
sandbox.window = sandbox;
sandbox.global = sandbox;
vm.createContext(sandbox);
function load(rel) { vm.runInContext(fs.readFileSync(path.join(repo, rel), 'utf8'), sandbox); }
load('church_planning/js/assessment_run_store.js');
load('church_planning/js/ministry_path_bridge.js');
load('church_planning/js/matchmaker_core.js');
load('church_planning/js/matchmaker_viz.js');
const MC = sandbox.MatchmakerCore;
const MV = sandbox.MatchmakerViz;
if (!MC || !MV) { console.error('FAIL modules'); process.exit(1); }
const demo = MC.buildDemoTalentBundle();
const fit = MC.analyzeFit('pioneer', demo.person);
if (!fit.axes || fit.axes.length < 6) { console.error('FAIL axes'); process.exit(1); }
const contract = MC.buildMatchContract(demo, fit);
if (!contract.person_vector) { console.error('FAIL contract'); process.exit(1); }
const html = MV.renderOverlayBlock(fit, demo);
if (html.indexOf('matchmaker-overlay-svg') < 0) { console.error('FAIL svg'); process.exit(1); }
console.log(JSON.stringify({ ok: true, pct: fit.overall_pct }));
"""


def main() -> int:
    html = HTML.read_text(encoding="utf-8")
    core = CORE.read_text(encoding="utf-8")
    viz = VIZ.read_text(encoding="utf-8")

    if "神國核心事職戰略藍圖" not in html or "開荒先鋒" not in html:
        sys.exit("FAIL: Tab intro blueprint missing")
    if "師徒制" not in html or "崗位微調" not in html:
        sys.exit("FAIL: Tab coaching guides missing")
    if "matchmaker_core.js" not in html or "matchmaker_viz.js" not in html:
        sys.exit("FAIL: missing matchmaker scripts")
    if "ROLE_BLUEPRINTS" not in core or "buildMatchContract" not in core:
        sys.exit("FAIL: matchmaker_core incomplete")
    if "renderOverlayBlock" not in viz:
        sys.exit("FAIL: matchmaker_viz incomplete")
    if "window.loadDemoReport" not in html:
        sys.exit("FAIL: loadDemoReport not on window")
    if re.search(r"\bglobal\.MinistryPathBridge", html):
        sys.exit("FAIL: global.MinistryPathBridge in page")
    if re.search(r"matching_demo", html):
        sys.exit("FAIL: matching_demo dead link")

    proc = subprocess.run(
        ["node", "-e", TEST_SCRIPT, str(REPO)],
        cwd=str(REPO),
        capture_output=True,
        text=True,
        timeout=30,
    )
    if proc.returncode != 0:
        print("FAIL:", proc.stderr or proc.stdout, file=sys.stderr)
        return 1
    print("OK: matchmaker overlay + cross-page contract")
    return 0


if __name__ == "__main__":
    sys.exit(main())
