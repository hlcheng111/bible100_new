#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""NCD 八維雷達硬化與 ncd_contract 契約。"""
from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
HTML = REPO / "church_planning" / "Church_Health_NCD_planning.html"
VIZ = REPO / "church_planning" / "js" / "ncd_health_viz.js"
PACK = REPO / "church_planning" / "js" / "tool_packs" / "ncd_pack.js"

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
load('church_planning/js/cta_os_runtime.js');
load('church_planning/js/assessment_run_store.js');
load('church_planning/js/tool_packs/ncd_pack.js');
load('church_planning/js/ncd_health_viz.js');
const Pack = sandbox.NcdPack;
const Viz = sandbox.NcdHealthViz;
if (!Pack || !Viz) { console.error('FAIL modules'); process.exit(1); }
const demo = Pack.buildDemoRun();
if (!demo.ok) { console.error('FAIL demo', demo.errors); process.exit(1); }
const run = demo.run;
const d = run.derived;
if (!d.ncd_contract || !d.ncd_contract.minimum_factor) { console.error('FAIL contract'); process.exit(1); }
if (d.minimum_factor.id !== 'passion') { console.error('FAIL min factor', d.minimum_factor.id); process.exit(1); }
if (Number(d.dim_scores.functional) < 4 || Number(d.dim_scores.passion) > 2.5) {
  console.error('FAIL demo scores', d.dim_scores); process.exit(1);
}
const html = Viz.renderHealthBlock(d);
if (html.indexOf('ncd-health-radar-svg') < 0) { console.error('FAIL svg'); process.exit(1); }
console.log(JSON.stringify({ ok: true, min: d.minimum_factor.label, passion: d.dim_scores.passion }));
"""


def main() -> int:
    html = HTML.read_text(encoding="utf-8")
    viz = VIZ.read_text(encoding="utf-8")
    pack = PACK.read_text(encoding="utf-8")

    if "堂會體質健康自我體檢表" not in html or "data-acs-hardcoded" not in html:
        sys.exit("FAIL: Tab intro not fully hardened")
    if "重燃禱告祭壇" not in html or "崗位重組" not in html:
        sys.exit("FAIL: Tab coaching guides missing")
    if "ncd_health_viz.js" not in html:
        sys.exit("FAIL: missing ncd_health_viz.js")
    if "renderHealthBlock" not in viz:
        sys.exit("FAIL: ncd_health_viz incomplete")
    if "buildNcdContract" not in pack or "ncd_contract" not in pack:
        sys.exit("FAIL: ncd_pack contract missing")
    if "loadDemoReport" not in html:
        sys.exit("FAIL: loadDemoReport not exposed")
    if re.search(r"matching_demo", html):
        sys.exit("FAIL: matching_demo dead link")

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
    print("OK: NCD health radar + ncd_contract (demo min factor = passion)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
