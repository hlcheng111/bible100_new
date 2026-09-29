#!/usr/bin/env python3
"""Static checks for bible_app shell standalone / bridge."""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SHELL = ROOT / "shell"


def main() -> int:
    errors = []
    bat = ROOT / "打開聖經跑道.bat"
    if bat.exists():
        text = bat.read_text(encoding="utf-8", errors="replace")
        if "bible_app/" not in text and "ENTRY_URL" not in text:
            errors.append("bat must open /bible_app/ module entry (ENTRY_URL)")
        if "open_shell_browser.ps1" not in text:
            errors.append("bat must open browser via open_shell_browser.ps1 (--app)")
        if "wait_server_probe.ps1" not in text:
            errors.append("bat must probe server via wait_server_probe.ps1")
        if "REPO_ROOT" not in text:
            errors.append("bat must serve from repo root (REPO_ROOT)")
    else:
        errors.append("missing 打開聖經跑道.bat")

    for name in ("bridge.js", "nav_matrix.js", "shell_boot.js", "shell_base.js", "shell_nav.js",
                 "locale_pick.js", "page_links.js", "frame_sync.js", "shell_asset_v.js", "page_boot.js"):
        if not (SHELL / "js" / name).exists():
            errors.append(f"missing shell/js/{name}")

    t30 = (SHELL / "js" / "track_30day.js").read_text(encoding="utf-8")
    if "B100PageLinks" not in t30 or "bookChapterRef" not in t30:
        errors.append("track_30day.js must use B100PageLinks and bookChapterRef")

    core = (SHELL / "js" / "bible_reader_core.js").read_text(encoding="utf-8")
    if "getViewMode" not in core:
        errors.append("bible_reader_core missing single-lang getViewMode")
    if "showDbAlert" not in core:
        errors.append("bible_reader_core missing showDbAlert for sample mode")

    supply = SHELL / "pages" / "supply" / "prompt.html"
    if not supply.exists():
        errors.append("missing supply/prompt.html")

    golden = ROOT / "shell" / "data" / "golden_verses_100.json"
    if golden.exists():
        import json
        data = json.loads(golden.read_text(encoding="utf-8"))
        n = len(data.get("verses", []))
        if n != 100:
            errors.append(f"golden verses expected 100, got {n}")
        for v in data.get("verses", []):
            for key in ("refVi", "refId", "tagVi", "tagId"):
                if not v.get(key):
                    errors.append(f"golden {v.get('id')} missing {key}")
                    break

    tg = SHELL / "js" / "track_golden.js"
    if tg.exists():
        gt = tg.read_text(encoding="utf-8")
        if "btn-track" not in gt or "pickRef" not in gt:
            errors.append("track_golden.js must have btn-track and pickRef")

    theme = SHELL / "js" / "track_theme.js"
    if theme.exists():
        tt = theme.read_text(encoding="utf-8")
        if "portalTitle" not in tt or "applyStaticUi" not in tt:
            errors.append("track_theme.js must have 4-locale applyStaticUi")

    index = SHELL / "index.html"
    if index.exists():
        text = index.read_text(encoding="utf-8")
        if "contentFrame" not in text:
            errors.append("index.html must have contentFrame iframe shell")
        if "shell_nav.js" not in text:
            errors.append("index.html must load shell_nav.js")
        if "shell_entry.js" in text:
            errors.append("index.html should not use redirect-only shell_entry")
        if 'content="0;url=index.html"' in text:
            errors.append("index.html meta refresh to index.html breaks /shell URL")
        if "B100_SHELL_ROOT" not in text:
            errors.append("index.html must set B100_SHELL_ROOT before assets")
        if "idx + '/shell/'.length" in text:
            errors.append("index.html must not use broken shell root slice (shellindex bug)")
        if "p.slice(0, idx) + '/shell/'" not in text:
            errors.append("index.html must use p.slice(0, idx) + '/shell/' for root")
        if "b100ShellAsset" not in text:
            errors.append("index.html must load assets via b100ShellAsset (absolute shell paths)")
        if "/shell\\/index$/i.test(tail)" not in text:
            errors.append("index.html must redirect /shell/index -> index.html")
        if 'data-group="bibleView"' not in text:
            errors.append("index.html must have bibleView single/dual toggle")

    core = (SHELL / "js" / "bible_reader_core.js").read_text(encoding="utf-8")
    if "br-focus" not in core:
        errors.append("bible_reader_core missing verse focus")

    nav = (SHELL / "js" / "shell_nav.js").read_text(encoding="utf-8")
    if "lastFrame" not in nav or "bibleView" not in nav:
        errors.append("shell_nav must support lastFrame resume and bibleView")
    if "STATE_SCHEMA" not in nav or "isValidResume" not in nav:
        errors.append("shell_nav must validate lastFrame (isValidResume)")
    if "cacheBustQs" not in nav:
        errors.append("shell_nav must cache-bust iframe reloads")

    index = SHELL / "index.html"
    if index.exists():
        text = index.read_text(encoding="utf-8")
        if "shell_asset_v.js" not in text and "20260618" not in text:
            errors.append("index.html must cache-bust shell scripts")

    app_index = ROOT / "index.html"
    if app_index.exists():
        t = app_index.read_text(encoding="utf-8")
        if "shell/index.html" not in t:
            errors.append("bible_app/index.html must redirect to shell/index.html (relative)")
    bridge = SHELL / "js" / "bridge.js"
    if bridge.exists():
        bt = bridge.read_text(encoding="utf-8")
        if "loadReadDoneTools" not in bt:
            errors.append("bridge.js must loadReadDoneTools (supply first, hub after probe)")
        if "isRepoRootServe()" not in bt or "useHub = !!hub" in bt:
            if "useHub = !!hub" in bt:
                errors.append("bridge.js must not useHub without probe")
    deploy = ROOT / "scripts" / "package_shell_deploy.ps1"
    if not deploy.exists():
        errors.append("missing scripts/package_shell_deploy.ps1")
    order = ROOT / "docs" / "IMPLEMENTATION_ORDER_ENTRY_I18N.md"
    if not order.exists():
        errors.append("missing docs/IMPLEMENTATION_ORDER_ENTRY_I18N.md")
    legacy = ROOT / "打開聖經跑道_僅bible_app.bat"
    if not legacy.exists():
        errors.append("missing 打開聖經跑道_僅bible_app.bat (Plan A rollback)")
    guide = ROOT / "docs" / "EMERGENCY_ROLLBACK.md"
    if not guide.exists():
        errors.append("missing docs/EMERGENCY_ROLLBACK.md")

    serve_cfg = ROOT.parent / "serve.json"
    if serve_cfg.exists():
        import json
        cfg = json.loads(serve_cfg.read_text(encoding="utf-8"))
        redirects = cfg.get("redirects") or []
        dest_ok = any(
            "/bible_app/shell/index.html" in str(r.get("destination", ""))
            for r in redirects
        )
        if not dest_ok:
            errors.append("serve.json must redirect to shell/index.html")
        app_entry = any(
            str(r.get("source", "")) in ("/bible_app", "/bible_app/")
            for r in redirects
        )
        if not app_entry:
            errors.append("repo serve.json must redirect /bible_app -> shell/index.html")
        if cfg.get("cleanUrls") is not False:
            errors.append("serve.json must set cleanUrls:false (avoid /shell <-> index.html redirect loop)")
        shell_index_redirect = any(
            str(r.get("source", "")).endswith("/shell/index")
            and "/index.html" in str(r.get("destination", ""))
            for r in redirects
        )
        if not shell_index_redirect:
            errors.append("repo serve.json must redirect /bible_app/shell/index -> index.html")

    app_serve = ROOT / "serve.json"
    if not app_serve.exists():
        errors.append("missing bible_app/serve.json (rollback serve config)")
    else:
        import json
        acfg = json.loads(app_serve.read_text(encoding="utf-8"))
        if acfg.get("cleanUrls") is not False:
            errors.append("bible_app/serve.json must set cleanUrls:false")

    if errors:
        print("FAIL:", errors)
        return 1
    print("OK shell standalone checks")
    return 0


if __name__ == "__main__":
    sys.exit(main())
