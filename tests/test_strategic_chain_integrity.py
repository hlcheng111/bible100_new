#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
戰略活體鏈路鋼鐵對帳 — 四條跨頁 chain（NCD→SWOT→PDCA→8020→CRM 旗標）

Run: python tests/test_strategic_chain_integrity.py

鏈路：
  1 NCD minimum_factor → SWOT W ncd_locked
  2 SWOT WO + swot_contract → PDCA plan strategic_anchor_highlight
  3 KPI resource_stuck≥70 → 8020 forced_prune
  4 PDCA deming_alert → GovernanceCrmBridge recruitment_paused
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent

CHAIN_SCRIPT = r"""
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const repo = process.argv[1];
const sandbox = {
  console,
  Math,
  Date,
  JSON,
  localStorage: {
    _m: {},
    getItem(k) { return this._m[k] || null; },
    setItem(k, v) { this._m[k] = v; },
    removeItem(k) { delete this._m[k]; }
  }
};
sandbox.window = sandbox;
sandbox.global = sandbox;
vm.createContext(sandbox);
function load(rel) {
  vm.runInContext(fs.readFileSync(path.join(repo, rel), 'utf8'), sandbox);
}

load('church_planning/js/assessment_run_store.js');
load('church_planning/js/tool_packs/ncd_pack.js');
load('church_planning/js/tool_packs/swot_pack.js');
load('church_planning/js/tool_packs/pdca_pack.js');
load('church_planning/js/tool_packs/kpi_pack.js');
load('church_planning/js/eighty_twenty_engine.js');
load('church_planning/js/tool_packs/eightytwenty_pack.js');
load('church_planning/js/eighty_twenty_matrix_viz.js');
load('church_planning/js/governance_crm_bridge.js');

const Store = sandbox.AssessmentRunStore;
const Ncd = sandbox.NcdPack;
const Swot = sandbox.SwotPack;
const Pdca = sandbox.PdcaPack;
const Kpi = sandbox.KpiPack;
const E8020 = sandbox.EightytwentyPack;
const Gov = sandbox.GovernanceCrmBridge;
const Viz8020 = sandbox.EightyTwentyMatrixViz;

const ledger = [];

function row(id, upstream, downstream, field, pass, detail) {
  ledger.push({ id, upstream, downstream, field, pass: !!pass, detail: detail || '' });
  if (!pass) {
    console.error('FAIL chain', id, detail);
    process.exit(1);
  }
}

// --- Chain 1: NCD → SWOT W ---
const ncdBuilt = Ncd.buildDemoRun();
if (!ncdBuilt.ok) { console.error('FAIL ncd demo'); process.exit(1); }
ncdBuilt.run.is_demo = false;
Store.saveRun(ncdBuilt.run);
const ncdMin = ncdBuilt.run.derived.minimum_factor;
const swotChain = Swot.loadUpstreamChain();
row('C1-a', 'ncd', 'swot_pack', 'loadUpstreamChain.ncd_minimum.id', swotChain.ok && swotChain.ncd_minimum && swotChain.ncd_minimum.id === ncdMin.id, swotChain);

const swotPreview = Swot.buildNcdPreviewRun();
if (!swotPreview.ok) { console.error('FAIL swot preview'); process.exit(1); }
const wQuad = swotPreview.run.derived.quadrants && swotPreview.run.derived.quadrants.W;
row('C1-b', 'ncd', 'swot', 'quadrants.W.ncd_locked', wQuad && wQuad.ncd_locked === true, wQuad);

// --- Chain 2: SWOT WO → PDCA Plan anchor ---
const swotDemo = Swot.buildDemoRun();
if (!swotDemo.ok) { console.error('FAIL swot demo'); process.exit(1); }
swotDemo.run.is_demo = false;
Store.saveRun(swotDemo.run);
const matrix = swotDemo.run.derived.matrix_result;
row('C2-a', 'ncd+swot', 'swot', 'matrix_result.primary_strategy', matrix && matrix.primary_strategy === 'WO', matrix && matrix.primary_strategy);

const pdcaUpstream = Pdca.loadUpstreamChain();
row('C2-b', 'swot', 'pdca', 'loadUpstreamChain.pastoral_override', !!pdcaUpstream.pastoral_override || pdcaUpstream.swot_primary === 'WO', pdcaUpstream.swot_primary);

const pdcaAnswers = {};
Pdca.QUESTIONS.forEach(function(q) { pdcaAnswers[q.id] = q.phase === 'plan' ? 5 : q.phase === 'do' ? 2 : 3; });
const pdcaBuilt = Pdca.buildRun(pdcaAnswers, { season_focus: 'Q2 鏈路測試' });
if (!pdcaBuilt.ok) { console.error('FAIL pdca build'); process.exit(1); }
const anchor = pdcaBuilt.run.pdca_contract.plan_metrics;
row('C2-c', 'swot', 'pdca', 'plan_metrics.strategic_anchor_highlight', anchor.strategic_anchor_highlight === true && !!anchor.strategic_anchor, anchor.strategic_anchor_code);

Store.saveRun(pdcaBuilt.run);

// --- Chain 3: KPI stuck → 8020 forced_prune ---
const kpiAnswers = {
  kpi_kr1: 2, kpi_kr2: 2, kpi_kr3: 2,
  kpi_v1: 2, kpi_v2: 2, kpi_v3: 2,
  kpi_r1: 2, kpi_r2: 2, kpi_r3: 2,
  kpi_p1: 2, kpi_p2: 2, kpi_p3: 2
};
const kpiBuilt = Kpi.buildRun(kpiAnswers, { focus_label: '鏈路測試' });
if (!kpiBuilt.ok) { console.error('FAIL kpi build'); process.exit(1); }
kpiBuilt.run.is_demo = false;
Store.saveRun(kpiBuilt.run);
row('C3-a', 'kpi', 'kpi', 'derived.resource_stuck_rate>=70', kpiBuilt.run.derived.resource_stuck_rate >= 70, kpiBuilt.run.derived.resource_stuck_rate);

const rows8020 = [
  { name: '主日門訓', missionFit: 5, fruit: 4, adminBurden: 3, effortLoadIndex: 3 },
  { name: '週報行政', missionFit: 1, fruit: 1, adminBurden: 5, effortLoadIndex: 5 },
  { name: '社區探訪', missionFit: 4, fruit: 3, adminBurden: 2, effortLoadIndex: 2 }
];
const eBuilt = E8020.buildRun(rows8020, { church_name: '鏈路堂' });
if (!eBuilt.ok) { console.error('FAIL 8020 build', eBuilt.errors); process.exit(1); }
const forced = (eBuilt.run.derived.analysis.rows || []).filter(function(r) { return r.forced_prune; });
row('C3-b', 'kpi', '8020', 'analysis.rows[].forced_prune', forced.length >= 1, forced.length);

const vizHtml = Viz8020.renderMatrixBlock(eBuilt.run.derived, {});
row('C3-c', 'kpi', '8020_viz', '強制剪枝 HTML', vizHtml.indexOf('強制剪枝') >= 0, 'html');

const ncdReview = eBuilt.run.derived.analysis.ncd_priority_review;
row('C3-d', 'ncd', '8020', 'analysis.ncd_priority_review.label', ncdReview && ncdReview.label === ncdMin.label, ncdReview && ncdReview.label);

// --- Chain 4: PDCA → CRM bridge ---
Store.saveRun(eBuilt.run);
const gov = Gov.scanGovernanceFlags();
row('C4-a', 'pdca', 'crm_bridge', 'deming_alert', gov.deming_alert === true, gov.deming_delta);
row('C4-b', 'pdca', 'crm_bridge', 'recruitment_paused', gov.recruitment_paused === true, gov.governance_mode);
row('C4-c', '8020+kpi', 'crm_bridge', 'prune_ministries.length', gov.prune_ministries && gov.prune_ministries.length >= 1, gov.prune_ministries.length);

const banner = Gov.renderEntryBannerHtml(gov);
row('C4-d', 'governance', 'crm_banner', '事工禁食', banner.indexOf('事工禁食') >= 0, 'banner');

console.log(JSON.stringify({ ok: true, ledger: ledger, chains: 4, checks: ledger.length }));
"""

RECONCILIATION_HEADER = """
=== 戰略活體鏈路對帳表 ===
 id     | upstream      | downstream    | contract field
--------+---------------+---------------+----------------------------------
 C1-a   | ncd           | swot_pack     | loadUpstreamChain.ncd_minimum
 C1-b   | ncd           | swot          | quadrants.W.ncd_locked
 C2-a   | ncd+swot      | swot          | matrix_result.primary_strategy=WO
 C2-b   | swot          | pdca          | loadUpstreamChain.pastoral_override
 C2-c   | swot          | pdca          | plan_metrics.strategic_anchor_highlight
 C3-a   | kpi           | kpi           | resource_stuck_rate>=70
 C3-b   | kpi           | 8020          | rows[].forced_prune
 C3-c   | kpi           | 8020_viz      | 強制剪枝 HTML
 C3-d   | ncd           | 8020          | ncd_priority_review
 C4-a   | pdca          | crm_bridge    | deming_alert
 C4-b   | pdca          | crm_bridge    | recruitment_paused / fasting
 C4-c   | 8020+kpi      | crm_bridge    | prune_ministries
 C4-d   | governance    | crm_banner    | 事工禁食文案
"""


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass
    proc = subprocess.run(
        ["node", "-e", CHAIN_SCRIPT, str(REPO)],
        cwd=str(REPO),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if proc.returncode != 0:
        print(RECONCILIATION_HEADER)
        print(proc.stderr or proc.stdout, file=sys.stderr)
        print("RESULT: FAIL — strategic chain integrity broken", file=sys.stderr)
        return 1

    try:
        payload = json.loads((proc.stdout or "").strip().splitlines()[-1])
    except (json.JSONDecodeError, IndexError):
        print(proc.stdout, file=sys.stderr)
        print("RESULT: FAIL — invalid chain test output", file=sys.stderr)
        return 1

    print(RECONCILIATION_HEADER.strip())
    for item in payload.get("ledger", []):
        mark = "OK" if item.get("pass") else "FAIL"
        print(
            f" {mark}  {item.get('id')}: {item.get('upstream')} → {item.get('downstream')} "
            f"({item.get('field')})"
        )
    print()
    print(
        f"RESULT: OK — {payload.get('checks', 0)} chain checks green "
        f"({payload.get('chains', 4)} links NCD→SWOT→PDCA→8020→CRM)."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
