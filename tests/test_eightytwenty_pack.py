#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""eightytwenty_pack.js + Church_Governance_8020_focus.html 烟测。"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
HTML = REPO / "church_planning" / "Church_Governance_8020_focus.html"

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
load('church_planning/js/eighty_twenty_engine.js');
load('church_planning/js/assessment_run_store.js');
load('church_planning/js/tool_packs/eightytwenty_pack.js');
const Pack = sandbox.EightytwentyPack;
const Store = sandbox.AssessmentRunStore;
if (!Pack) { console.error('FAIL no pack'); process.exit(1); }
const demo = Pack.buildDemoRun();
if (!demo.ok) { console.error('FAIL demo', demo.errors); process.exit(1); }
if (!demo.run.derived.analysis || !demo.run.derived.analysis.rows.length) { console.error('FAIL analysis'); process.exit(1); }
if (demo.run.derived.prune_count < 1) { console.error('FAIL prune'); process.exit(1); }
Store.saveRun(demo.run);
const latest = Store.loadLatest('ministry8020');
if (!latest || latest.tool_id !== 'ministry8020') { console.error('FAIL latest'); process.exit(1); }
const chain = Pack.loadUpstreamChain();
if (!chain || typeof chain.ok !== 'boolean') { console.error('FAIL chain'); process.exit(1); }
console.log(JSON.stringify({ ok: true, prune: demo.run.derived.prune_count, impact: demo.run.derived.impact_ratio }));
"""


def main() -> int:
    html = HTML.read_text(encoding="utf-8")
    for needle in (
        "eightytwenty_pack.js",
        "eightytwenty_acs_shell.js",
        "loadDemoReport",
        "acs-pastoral-hero",
        "strategic_acs_unified_boot.js",
        "資源聚焦儀",
    ):
        if needle not in html:
            print("FAIL missing in html:", needle, file=sys.stderr)
            return 1
    for forbidden in ("CTA-OS", "cta-os-tool-report"):
        if forbidden in html:
            print("FAIL forbidden:", forbidden, file=sys.stderr)
            return 1
    old = (REPO / "church_planning" / "ministry-8020-planning.html").read_text(encoding="utf-8")
    if "Church_Governance_8020_focus.html" not in old:
        print("FAIL redirect shell", file=sys.stderr)
        return 1
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
    print("OK eightytwenty_pack", proc.stdout.strip())
    return 0


if __name__ == "__main__":
    sys.exit(main())
