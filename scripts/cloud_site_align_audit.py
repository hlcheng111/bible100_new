#!/usr/bin/env python3
"""Cloud vs local (SSOT) alignment audit for bible100.lovestoblog.com."""
from __future__ import annotations

import hashlib
import json
import re
import ssl
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CLOUD = "https://bible100.lovestoblog.com"
TIMEOUT = 25
UA = "Bible100CloudAlignAudit/1.0"

# Paths that must exist and match local (size or content hash prefix)
MUST_MATCH = [
    "index.html",
    "index_v5.html",
    "js/config-embedded.js",
    "js/index_v5_shell.js",
    "config/modes.json",
    "config/modules.json",
    "config/build_version.js",
    "church_ministry/sidebar_church_layout_v1.html",
    "church_ministry/_landing/gateway.html",
    "school_management/_landing/home.html",
    "ai_tools/_landing/home.html",
    "ai_tools/sidebar_lab.html",
    "bible_study/_landing/home.html",
    "languages/_landing/home.html",
    "languages/landP_kh.html",
    "languages/landP_lo.html",
    "languages/index_kh.html",
    "languages/index_lo.html",
    "languages/vi/OT/chapters/chapter1.html",
    "languages/vi/NT/chapters/chapter1.html",
    "languages/id/OT/chapters/chapter1.html",
    "languages/id/NT/chapters/chapter1.html",
    "languages/kh/OT/chapters/kh_OT_chapter01.html",
    "languages/lo/OT/chapters/lo_OT_chapter01.html",
    "hymn_management/index.html",
    "hymn_management/hymn/.htaccess",
    "qna/index.html",
    "nav_hub/dashboard.html",
    "smart_ministry/landing.html",
]

# Must return 404 (removed from canonical pack)
MUST_GONE = [
    "qna/qna_index_4layer.htm",
    "qna/qna_index_4layer_cloud.htm",
    "smart_ministry/ai_smart_ministry_overview.html",
    "hymn_management/temp_hymn.html",
    "hymn_management/temp_hymn_cloud.html",
]

# Key markers expected in index_v5 / config
INDEX_MARKERS = [
    "index_v5_shell.js",
    "config-embedded.js",
    "sidebarFrame",
    "contentFrame",
    "B100ShellContract",
]

MODES_MARKERS = [
    "material",
    "study",
    "congregation",
    "church_ministry",
    "ai_tools",
]

QNA_MARKERS = [
    "引導式目錄",
    "qna_nav_config",
]

KH_MARKERS = ["籌備中", "landP_kh"]
LO_MARKERS = ["籌備中", "landP_lo"]


@dataclass
class Row:
    path: str
    status: str  # PASS | FAIL | WARN
    detail: str


@dataclass
class Report:
    rows: list[Row] = field(default_factory=list)

    def add(self, path: str, status: str, detail: str) -> None:
        self.rows.append(Row(path, status, detail))

    def counts(self) -> dict[str, int]:
        c = {"PASS": 0, "FAIL": 0, "WARN": 0}
        for r in self.rows:
            c[r.status] = c.get(r.status, 0) + 1
        return c


def fetch(url: str) -> tuple[int, bytes, dict]:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT, context=ctx) as resp:
            return resp.status, resp.read(), dict(resp.headers)
    except urllib.error.HTTPError as e:
        body = e.read() if e.fp else b""
        return e.code, body, dict(e.headers or {})
    except Exception as e:
        return -1, str(e).encode(), {}


def md5(data: bytes) -> str:
    return hashlib.md5(data).hexdigest()


def norm_text(data: bytes) -> bytes:
    """Loose normalize for HTML/JS compare (line endings, trailing ws)."""
    try:
        t = data.decode("utf-8", errors="replace")
    except Exception:
        return data
    t = t.replace("\r\n", "\n").replace("\r", "\n")
    t = re.sub(r"[ \t]+\n", "\n", t)
    return t.encode("utf-8")


def local_bytes(rel: str) -> bytes | None:
    p = ROOT / rel.replace("/", "\\")
    if not p.is_file():
        return None
    return p.read_bytes()


def check_match(report: Report, rel: str) -> None:
    local = local_bytes(rel)
    if local is None:
        report.add(rel, "FAIL", "missing local SSOT file")
        return
    url = f"{CLOUD}/{rel.replace(chr(92), '/')}"
    code, remote, _ = fetch(url)
    if code != 200:
        report.add(rel, "FAIL", f"cloud HTTP {code}")
        return
    ls, rs = len(local), len(remote)
    lm, rm = md5(norm_text(local)), md5(norm_text(remote))
    if lm == rm:
        report.add(rel, "PASS", f"hash match ({ls} B)")
        return
    if ls == rs:
        report.add(rel, "WARN", f"size match but hash differs ({ls} B) — possible whitespace/encoding")
        return
    report.add(rel, "FAIL", f"size local={ls} cloud={rs}")


def check_gone(report: Report, rel: str) -> None:
    url = f"{CLOUD}/{rel}"
    code, _, _ = fetch(url)
    if code in (404, 410):
        report.add(rel, "PASS", f"gone (HTTP {code})")
    elif code == 200:
        report.add(rel, "FAIL", "still exists on cloud — should delete")
    else:
        report.add(rel, "WARN", f"HTTP {code} (expected 404)")


def check_markers(report: Report, rel: str, markers: list[str], label: str) -> None:
    local = local_bytes(rel)
    url = f"{CLOUD}/{rel}"
    code, remote, _ = fetch(url)
    if code != 200:
        report.add(label, "FAIL", f"cloud HTTP {code}")
        return
    try:
        lt = (local or b"").decode("utf-8", errors="replace")
        rt = remote.decode("utf-8", errors="replace")
    except Exception:
        report.add(label, "FAIL", "decode error")
        return
    missing_cloud = [m for m in markers if m not in rt]
    missing_local = [m for m in markers if m not in lt]
    if missing_local:
        report.add(label, "WARN", f"markers missing in local: {missing_local}")
    if missing_cloud:
        report.add(label, "FAIL", f"cloud missing markers: {missing_cloud}")
    else:
        report.add(label, "PASS", f"markers OK ({len(markers)} checks)")


def check_build_version(report: Report) -> None:
    local = local_bytes("config/build_version.js")
    if not local:
        report.add("build_version", "FAIL", "no local file")
        return
    m = re.search(r'BIBLE100_BUILD_VERSION\s*=\s*"([^"]+)"', local.decode("utf-8", errors="replace"))
    local_v = m.group(1) if m else "?"
    code, remote, _ = fetch(f"{CLOUD}/config/build_version.js")
    if code != 200:
        report.add("build_version", "FAIL", f"cloud HTTP {code}")
        return
    rm = re.search(r'BIBLE100_BUILD_VERSION\s*=\s*"([^"]+)"', remote.decode("utf-8", errors="replace"))
    cloud_v = rm.group(1) if rm else "?"
    if local_v == cloud_v:
        report.add("build_version", "PASS", f"version {local_v}")
    else:
        report.add("build_version", "WARN", f"local={local_v} cloud={cloud_v}")


def check_modes_topbar(report: Report) -> None:
    code, remote, _ = fetch(f"{CLOUD}/config/modes.json")
    if code != 200:
        report.add("modes.json cloud", "FAIL", f"HTTP {code}")
        return
    try:
        cloud_modes = json.loads(remote.decode("utf-8-sig"))
        local_modes = json.loads(local_bytes("config/modes.json").decode("utf-8-sig"))
    except Exception as e:
        report.add("modes.json", "FAIL", str(e))
        return
    c_ids = [m["id"] for m in cloud_modes.get("modes", [])]
    l_ids = [m["id"] for m in local_modes.get("modes", [])]
    if c_ids == l_ids:
        report.add("modes.json ids", "PASS", f"{len(c_ids)} modes: {', '.join(c_ids)}")
    else:
        report.add("modes.json ids", "FAIL", f"local={l_ids} cloud={c_ids}")


def check_entry_urls(report: Report) -> None:
    for path in [
        "/",
        "/?i=1",
        "/index_v5.html",
        "/index_v5.html?v=20260807_2301",
    ]:
        code, body, _ = fetch(f"{CLOUD}{path}")
        if code != 200:
            report.add(f"entry {path}", "FAIL", f"HTTP {code}")
            continue
        text = body.decode("utf-8", errors="replace")[:8000]
        if "index_v5" in text or "location" in text.lower() or "sidebarFrame" in text:
            report.add(f"entry {path}", "PASS", f"HTTP 200 ({len(body)} B)")
        else:
            report.add(f"entry {path}", "WARN", f"HTTP 200 but unexpected body ({len(body)} B)")


def main() -> int:
    report = Report()
    print(f"=== Cloud align audit ===")
    print(f"Local SSOT: {ROOT}")
    print(f"Cloud:      {CLOUD}")
    print()

    check_entry_urls(report)
    check_build_version(report)
    check_modes_topbar(report)
    check_markers(report, "index_v5.html", INDEX_MARKERS, "index_v5 shell markers")
    check_markers(report, "qna/index.html", QNA_MARKERS, "qna new index markers")
    check_markers(report, "languages/landP_kh.html", KH_MARKERS, "kh placeholder")
    check_markers(report, "languages/landP_lo.html", LO_MARKERS, "lo placeholder")

    for rel in MUST_GONE:
        check_gone(report, rel)

    for rel in MUST_MATCH:
        check_match(report, rel)

    c = report.counts()
    fails = [r for r in report.rows if r.status == "FAIL"]
    warns = [r for r in report.rows if r.status == "WARN"]

    print("-- Results --")
    for r in report.rows:
        color = {"PASS": "", "WARN": "?", "FAIL": "!"}.get(r.status, "")
        print(f"[{r.status}] {r.path}: {r.detail}")

    print()
    print(f"SUMMARY: PASS={c['PASS']} WARN={c['WARN']} FAIL={c['FAIL']}")

    out = ROOT / "docs" / "reports" / "CLOUD_SITE_ALIGN_LATEST.txt"
    out.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        f"Cloud: {CLOUD}",
        f"Local: {ROOT}",
        f"PASS={c['PASS']} WARN={c['WARN']} FAIL={c['FAIL']}",
        "",
    ]
    for r in report.rows:
        lines.append(f"[{r.status}] {r.path}: {r.detail}")
    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"Report: {out}")

    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
