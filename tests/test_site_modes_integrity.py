#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
P2 / Tier 4 · index_v5 全站 E 模块完整性

覆盖顶栏模式：圣经研读、AI Lab、营运自动化、学校管理、行政支援(E)、工具总览、nav_hub。
验证 modes.json 路由、manifest 落地页、壳层工具入口、主侧栏连结、Phase 4 data-b100-module 标签。

Run: python tests/test_site_modes_integrity.py
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
MODES_JSON = REPO / "config" / "modes.json"
MODULES_JSON = REPO / "config" / "modules.json"
MANIFEST = REPO / "config" / "module_manifest.json"
INDEX_V5 = REPO / "index_v5.html"

# index_v5 顶栏模式（E 模块焦点）
FOCUS_MODE_IDS = ("study", "ai", "school", "church")

E_ANCHOR_FILES: dict[str, tuple[str, ...]] = {
    "tools_overview": (
        "tools/tools-overview-sidebar.html",
        "tools/tools-dashboard.html",
        "help/tools-overview.html",
    ),
    "bible_study": (
        "bible_study/dashboard.html",
        "bible_study/sidebar.html",
        "bible_study/_landing/versions.html",
        "bible_study/_landing/geography_history.html",
    ),
    "ai_lab": (
        "ai_tools/ai_lab_landing.html",
        "ai_tools/sidebar_lab.html",
        "ai_tools/dashboard.html",
        "ai_tools/sidebar.html",
    ),
    "crm_automation": ("ai_tools/pages/crm_automation_console.html",),
    "school": (
        "school_management/index.html",
        "school_management/sidebar.html",
        "school_management/dashboard.html",
    ),
    "church_admin_e": (
        "church_ministry/_landing/gateway.html",
        "church_ministry/dashboard_church_layout_v1.html",
        "church_ministry/dashboard.html",
    ),
    "nav_hub": (
        "nav_hub/index.html",
        "nav_hub/sidebar.html",
        "nav_hub/dashboard.html",
    ),
}

# Phase 4 · 各模組 landing 須標 data-b100-module + data-b100-pattern
REQUIRED_MODULE_TAGS: tuple[tuple[str, str, str], ...] = (
    ("church_ministry/guide_crm_journey_hub.html", "church_ministry", "P-CRM-HUB"),
    ("church_ministry/dashboard.html", "church_ministry", "P-WORKBENCH"),
    ("bible_study/dashboard.html", "bible_study", "P-MOD-STANDALONE"),
    ("ai_tools/ai_lab_landing.html", "ai_tools", "P-MOD-STANDALONE"),
    ("school_management/index.html", "school_management", "P-MOD-STANDALONE"),
    ("nav_hub/index.html", "nav_hub", "P-MOD-STANDALONE"),
)

SIDEBAR_SCAN_FILES = (
    "bible_study/sidebar.html",
    "ai_tools/sidebar_lab.html",
    "ai_tools/sidebar.html",
    "school_management/sidebar.html",
    "tools/tools-overview-sidebar.html",
    "church_ministry/dashboard.html",
    "nav_hub/sidebar.html",
    "nav_hub/index.html",
    "nav_hub/dashboard.html",
    "nav_hub/documentation_center.html",
    "nav_hub/sitemap_navigation.html",
    "nav_hub/omni_entry.html",
)

HREF_RE = re.compile(r"""href\s*=\s*(["'])([^"'#?]+)\1""", re.I)
DATA_PATH_RE = re.compile(r"""data-b100-path\s*=\s*(["'])([^"']+)\1""", re.I)
SHELL_NAV_RE = re.compile(
    r"(sidebarUrl|contentUrl)\s*:\s*['\"]([^'\"]+)['\"]",
    re.I,
)

SKIP_PREFIXES = ("http://", "https://", "mailto:", "javascript:", "data:", "#")
SKIP_FRAGMENTS = ("${", "{{")

CHURCH_E_ADMIN_PATH = "church_ministry/dashboard_church_layout_v1_content.html"
CHURCH_E_SIDEBAR = "church_ministry/sidebar_church_layout_v1.html"


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def modules_by_id() -> dict[str, dict]:
    data = load_json(MODULES_JSON)
    return {m["id"]: m for m in data.get("modules", []) if m.get("id")}


def norm_target(raw: str) -> str | None:
    t = raw.strip()
    if not t or any(t.startswith(p) for p in SKIP_PREFIXES):
        return None
    if any(f in t for f in SKIP_FRAGMENTS):
        return None
    return t


def resolve_target(page_rel: str, target: str, *, root_relative: bool) -> Path:
    clean = target.split("?")[0].split("#")[0]
    if root_relative:
        return (REPO / clean).resolve()
    base = (REPO / page_rel).parent
    return (base / clean).resolve()


def collect_link_targets(page_rel: str, text: str) -> list[tuple[str, str, bool]]:
    out: list[tuple[str, str, bool]] = []
    for m in HREF_RE.finditer(text):
        tgt = norm_target(m.group(2))
        if tgt:
            out.append((tgt, "href", False))
    for m in DATA_PATH_RE.finditer(text):
        tgt = norm_target(m.group(2))
        if tgt:
            out.append((tgt, "data-b100-path", False))
    for key, val in SHELL_NAV_RE.findall(text):
        if val and not val.startswith("#"):
            out.append((val, f"shell:{key}", True))
    return out


def check_anchor_files(errors: list[str]) -> int:
    ok = 0
    for group, files in E_ANCHOR_FILES.items():
        for rel in files:
            if (REPO / rel).is_file():
                ok += 1
            else:
                errors.append(f"E anchor [{group}] missing file: {rel}")
    return ok


def check_manifest_modes(errors: list[str]) -> int:
    data = load_json(MANIFEST)
    ok = 0
    want = {"bible_study", "ai_tools", "school_management", "nav_hub"}
    for mod in data.get("modules", []):
        mid = mod.get("id")
        if mid not in want:
            continue
        for key in ("landing", "sidebar"):
            rel = mod.get(key)
            if not rel:
                continue
            if (REPO / rel).is_file():
                ok += 1
            else:
                errors.append(f"manifest {mid!r} missing {key}: {rel}")
        tests = mod.get("tests") or []
        if mid in ("bible_study", "ai_tools", "school_management"):
            if "tests/test_site_modes_integrity.py" not in tests:
                errors.append(f"manifest {mid!r} should list test_site_modes_integrity.py")
    return ok


def check_modes_routes(errors: list[str]) -> int:
    modes = load_json(MODES_JSON).get("modes", [])
    mod_map = modules_by_id()
    ok = 0

    for mode in modes:
        mid = mode.get("id")
        if mid not in FOCUS_MODE_IDS:
            continue

        default = mode.get("defaultEntry") or {}
        for key in ("path", "sidebar"):
            val = default.get(key)
            if not val or val in ("about:blank",):
                continue
            clean = val.split("?")[0]
            if not (REPO / clean).is_file():
                errors.append(f"modes {mid!r} defaultEntry.{key} missing: {val}")
            else:
                ok += 1

        for item in mode.get("secondaryNav") or []:
            if not isinstance(item, dict):
                continue
            if item.get("action") == "home" or item.get("type"):
                continue

            label = item.get("labelZh") or item.get("labelEn") or "?"
            path = item.get("path")
            sidebar = item.get("sidebar")
            module_id = item.get("moduleId")

            if module_id:
                ref = mod_map.get(module_id)
                if not ref:
                    errors.append(f"modes {mid!r} nav {label!r}: unknown moduleId {module_id!r}")
                    continue
                path = ref.get("path")
                sidebar = ref.get("sidebar") or sidebar
                ok += 1

            if path:
                clean = path.split("?")[0]
                if not (REPO / clean).is_file():
                    errors.append(f"modes {mid!r} nav {label!r}: missing path {path!r}")
                else:
                    ok += 1

            if sidebar and sidebar not in ("about:blank",):
                clean = sidebar.split("?")[0]
                if not (REPO / clean).is_file():
                    errors.append(f"modes {mid!r} nav {label!r}: missing sidebar {sidebar!r}")
                else:
                    ok += 1

        if mid == "church":
            admin = next(
                (
                    i
                    for i in mode.get("secondaryNav") or []
                    if isinstance(i, dict)
                    and CHURCH_E_ADMIN_PATH in str(i.get("path", ""))
                ),
                None,
            )
            if not admin:
                errors.append("church mode missing E admin nav item (dashboard_church_layout_v1.html)")
            elif CHURCH_E_SIDEBAR not in str(admin.get("sidebar", "")):
                errors.append("church E admin must use sidebar_church_layout_v1.html")

        if mid == "ai":
            smart = next(
                (
                    i
                    for i in mode.get("secondaryNav") or []
                    if isinstance(i, dict)
                    and "smart_ministry/" in str(i.get("path", ""))
                ),
                None,
            )
            if not smart:
                errors.append("ai mode missing smart_ministry secondaryNav item")
            elif "smart_ministry/sidebar.html" not in str(smart.get("sidebar", "")):
                errors.append("ai Smart nav must use smart_ministry/sidebar.html")
            else:
                ok += 1
            auto_on_ai = next(
                (
                    i
                    for i in mode.get("secondaryNav") or []
                    if isinstance(i, dict)
                    and "crm_automation_console" in str(i.get("path", ""))
                ),
                None,
            )
            if auto_on_ai:
                errors.append("ai mode must not host crm_automation_console (Wave c → church admin)")

        if mid == "church":
            prefill = next(
                (
                    i
                    for i in mode.get("secondaryNav") or []
                    if isinstance(i, dict)
                    and "crm_automation_console" in str(i.get("path", ""))
                ),
                None,
            )
            if not prefill:
                errors.append("church mode missing crm_automation_console (口述預填) secondaryNav")
            elif "sidebar_church_layout_v1" not in str(prefill.get("sidebar", "")):
                errors.append("church 口述預填 must keep admin sidebar_church_layout_v1")
            else:
                ok += 1

    return ok


def check_module_tags(errors: list[str]) -> int:
    ok = 0
    for rel, module_id, pattern in REQUIRED_MODULE_TAGS:
        path = REPO / rel
        if not path.is_file():
            errors.append(f"module tag page missing: {rel}")
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        mod_needle = f'data-b100-module="{module_id}"'
        pat_needle = f'data-b100-pattern="{pattern}"'
        if mod_needle not in text:
            errors.append(f"{rel} missing {mod_needle}")
        else:
            ok += 1
        if pat_needle not in text:
            errors.append(f"{rel} missing {pat_needle}")
        else:
            ok += 1
    return ok


def check_index_v5_tools_entry(errors: list[str]) -> None:
    if not INDEX_V5.is_file():
        errors.append("missing index_v5.html")
        return
    text = INDEX_V5.read_text(encoding="utf-8", errors="replace")
    for needle in (
        "function openToolsOverview",
        "btnToolsOverviewTop",
        "tools/tools-overview-sidebar.html",
        "tools/tools-dashboard.html",
    ):
        if needle not in text:
            errors.append(f"index_v5.html missing tools entry: {needle!r}")


def scan_primary_sidebars(errors: list[str]) -> tuple[int, int]:
    ok = 0
    scanned = 0
    missing: list[tuple[str, str, str]] = []

    for rel in SIDEBAR_SCAN_FILES:
        path = REPO / rel
        if not path.is_file():
            missing.append((rel, rel, "scan file missing"))
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        seen: set[tuple[str, str]] = set()
        for tgt, kind, root_rel in collect_link_targets(rel, text):
            key = (tgt.split("?")[0].split("#")[0], kind)
            if key in seen:
                continue
            seen.add(key)
            scanned += 1
            resolved = resolve_target(rel, tgt, root_relative=root_rel)
            try:
                resolved.relative_to(REPO.resolve())
            except ValueError:
                missing.append((rel, tgt, f"{kind}: outside repo"))
                continue
            if resolved.is_file() or resolved.is_dir():
                ok += 1
            else:
                missing.append((rel, tgt, kind))

    for src, tgt, why in sorted(missing, key=lambda x: (x[0], x[1]))[:80]:
        errors.append(f"sidebar link {src} -> {tgt} ({why})")
    if len(missing) > 80:
        errors.append(f"sidebar link scan: ... and {len(missing) - 80} more missing")

    return ok, scanned


def main() -> int:
    errors: list[str] = []

    if not MODES_JSON.is_file():
        print("FAIL: missing config/modes.json", file=sys.stderr)
        return 1

    n_anchors = check_anchor_files(errors)
    check_manifest_modes(errors)
    n_routes = check_modes_routes(errors)
    n_tags = check_module_tags(errors)
    check_index_v5_tools_entry(errors)
    n_links_ok, n_links_scanned = scan_primary_sidebars(errors)

    if errors:
        print("FAIL: site modes integrity (tier 4)", file=sys.stderr)
        for e in errors[:60]:
            print(f"  · {e}", file=sys.stderr)
        if len(errors) > 60:
            print(f"  · ... and {len(errors) - 60} more", file=sys.stderr)
        return 1

    print(
        "OK: site modes integrity — "
        f"{n_anchors} E anchors, {n_routes} mode routes, "
        f"{n_tags} module tags, "
        f"{n_links_ok}/{n_links_scanned} sidebar/nav_hub targets, "
        f"modes {', '.join(FOCUS_MODE_IDS)} + nav_hub + tools overview locked."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
