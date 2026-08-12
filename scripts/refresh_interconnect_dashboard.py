#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
刷新「全站互联路线图」仪表板上的自动状态区。

Run from bible100_new:
  python scripts/refresh_interconnect_dashboard.py

会执行 tier 1-5 验收，并写入 help/interconnect-roadmap.html 内
<!-- INTERCONNECT_STATUS_AUTO --> 区块（以及 config/interconnect_last_run.json）。
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
DASHBOARD = REPO / "help" / "interconnect-roadmap.html"
LAST_RUN = REPO / "config" / "interconnect_last_run.json"
ROADMAP = REPO / "config" / "interconnect_roadmap.json"

TIER_SCRIPTS: tuple[tuple[str, str, str], ...] = (
    ("1", "① 路标与三扇门", "tests/test_church_interconnect_smoke.py --tier 1"),
    ("2", "② 资料有没有通", "tests/test_church_interconnect_smoke.py --tier 2"),
    ("3", "③ 问卷与配搭工具", "tests/test_church_interconnect_smoke.py --tier 3"),
    ("4", "④ 圣经/AI/学校等馆区", "tests/test_church_interconnect_smoke.py --tier 4"),
    ("5", "⑤ 牧者看到的画面", "tests/test_church_interconnect_smoke.py --tier 5"),
)

EXTRA_CHECKS: tuple[tuple[str, str], ...] = (
    ("⑥ 全站连结有没有断", "scripts/check_phase_tool_and_nav_links.py"),
)


def run_step(label: str, cmd: str) -> dict:
    parts = cmd.split()
    proc = subprocess.run(
        [sys.executable] + parts,
        cwd=str(REPO),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    ok = proc.returncode == 0
    tail = (proc.stdout or proc.stderr or "").strip().splitlines()
    detail = tail[-1] if tail else ("OK" if ok else "FAIL")
    return {"label": label, "ok": ok, "detail": detail[:200]}


def build_status_html(results: list[dict], ts: str) -> str:
    rows = []
    all_ok = all(r["ok"] for r in results)
    badge = "体检全过" if all_ok else "有待修理"
    badge_cls = "ok" if all_ok else "fail"
    for r in results:
        cls = "ok" if r["ok"] else "fail"
        icon = "✅" if r["ok"] else "❌"
        rows.append(
            f'<li class="status-row {cls}">{icon} <strong>{r["label"]}</strong>'
            f' <span class="status-detail">{r["detail"]}</span></li>'
        )
    rows_html = "\n".join(rows)
    return f"""<!-- INTERCONNECT_STATUS_AUTO -->
  <section class="status-panel" id="interconnect-auto-status">
    <h2>🩺 全楼体检报告 <span class="badge {badge_cls}">{badge}</span></h2>
    <p class="status-meta">体检时间：<time datetime="{ts}">{ts}</time></p>
    <ul class="status-list">
{rows_html}
    </ul>
    <p class="status-hint">维护者刷新体检：在专案目录执行 <code>python scripts/refresh_interconnect_dashboard.py</code>（小白只看 ✅❌ 即可）</p>
  </section>
<!-- /INTERCONNECT_STATUS_AUTO -->"""


def patch_dashboard(html: str, block: str) -> str:
    pattern = re.compile(
        r"<!-- INTERCONNECT_STATUS_AUTO -->.*?<!-- /INTERCONNECT_STATUS_AUTO -->",
        re.S,
    )
    if not pattern.search(html):
        raise RuntimeError("interconnect-roadmap.html missing status markers")
    return pattern.sub(block, html, count=1)


def main() -> int:
    if not DASHBOARD.is_file():
        print("FAIL: missing", DASHBOARD, file=sys.stderr)
        return 1

    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    results: list[dict] = []
    for tid, label, cmd in TIER_SCRIPTS:
        results.append(run_step(f"Tier {tid} · {label}", cmd))
    for label, script in EXTRA_CHECKS:
        results.append(run_step(label, script))

    payload = {
        "updated_at": ts,
        "all_ok": all(r["ok"] for r in results),
        "results": results,
    }
    LAST_RUN.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    block = build_status_html(results, ts)
    html = DASHBOARD.read_text(encoding="utf-8")
    DASHBOARD.write_text(patch_dashboard(html, block), encoding="utf-8")

    print(f"OK: dashboard refreshed — {DASHBOARD.relative_to(REPO)}")
    print(f"    last_run -> {LAST_RUN.relative_to(REPO)}")
    if payload["all_ok"]:
        print("    all tiers green")
        return 0
    print("    some checks failed (status still written)", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
