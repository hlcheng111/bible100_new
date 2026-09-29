#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Scan + fix languages chapter image src paths for file:// and cloud."""
from __future__ import annotations

import re
import json
from pathlib import Path
from collections import Counter
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
LANG = ROOT / "languages"
REPORT = ROOT / "reports" / "material_image_path_fix_report.json"

IMG_ATTR_RE = re.compile(
    r"""(?P<prefix>(?:src|href)\s*=\s*["'])(?P<url>[^"']+)(?P<suffix>["'])""",
    re.I,
)

# Only rewrite image-like targets in src= (and occasional href to images)
IMG_EXT = re.compile(r"\.(?:png|jpe?g|gif|webp|bmp|svg)(?:\?|#|$)", re.I)


def is_img_url(url: str) -> bool:
    u = url.strip()
    if not u or u.startswith("data:"):
        return False
    if IMG_EXT.search(u):
        return True
    # FrontPage / OneDrive image folders without checking ext in path segment
    low = u.lower()
    return any(
        x in low
        for x in (
            "image_ot",
            "image_nt",
            "image_t4",
            "/images/",
            "/media/images/",
            "onedrive",
            "my webs",
            "my%20webs",
        )
    )


def classify(url: str) -> str:
    u = url.strip()
    low = u.lower().replace("\\", "/")
    if u.startswith(("http://", "https://", "//")):
        return "external"
    if "onedrive" in low or "my webs" in low or "my%20webs" in low:
        return "onedrive"
    if low.startswith("/languages/"):
        return "abs_languages"
    # Already correct shared path — do not reclassify as legacy
    if "/images/image_ot/" in low or "/images/image_nt/" in low or "/images/image_t4/" in low:
        return "other_rel"
    if "bible100_ot/image_ot" in low or "bible100_nt/image_nt" in low:
        return "onedrive"
    if "/image_ot/" in low:
        return "legacy_ot"
    if "/image_nt/" in low:
        return "legacy_nt"
    if "/image_t4/" in low:
        return "legacy_t4"
    if "cn/media/images/image_" in low:
        return "wrong_lang_media"
    return "other_rel"


def filename(url: str) -> str:
    path = unquote(url.split("?")[0].split("#")[0]).replace("\\", "/")
    return path.rstrip("/").split("/")[-1]


def track_from_url(url: str) -> str | None:
    low = unquote(url).lower().replace("\\", "/")
    if "image_ot" in low or "bible100_ot" in low:
        return "OT"
    if "image_nt" in low or "bible100_nt" in low:
        return "NT"
    if "image_t4" in low or "bible100_t4" in low:
        return "T4"
    return None


def rel_to_shared_images(html_path: Path, track: str, fname: str) -> str:
    """Resolve relative path from this HTML file to languages/images/image_XX/fname."""
    folder = {"OT": "image_OT", "NT": "image_NT", "T4": "image_T4"}[track]
    target = LANG / "images" / folder / fname
    return Path(os_path_rel(html_path.parent, target)).as_posix()


def rel_from_abs_languages(html_path: Path, url: str) -> str | None:
    """/languages/vi/media/images/x → relative from html file."""
    # url path after /languages/
    rest = url[len("/languages/") :]
    target = LANG / rest
    try:
        rel = Path(os_path_rel(html_path.parent, target)).as_posix()
        return rel
    except Exception:
        return None


def os_path_rel(from_dir: Path, to_file: Path) -> str:
    import os

    return os.path.relpath(to_file, start=from_dir)


def fix_url(html_path: Path, url: str) -> tuple[str, str]:
    """Return (new_url, reason) or (url, 'keep')."""
    u = url.strip()
    kind = classify(u)

    if kind == "external":
        if u.startswith("//"):
            return "https:" + u, "external_protocol"
        if u.startswith("http://"):
            return "https://" + u[len("http://") :], "external_http_to_https"
        return u, "keep_external"

    fname = filename(u)
    if not fname or fname in (".", ".."):
        return u, "keep"

    track = track_from_url(u)
    under_images_tree = "images" in html_path.parts and html_path.parts[html_path.parts.index("languages") + 1] == "images" if "languages" in html_path.parts else False

    if kind in ("onedrive", "legacy_ot", "legacy_nt", "legacy_t4"):
        if not track:
            parts = html_path.as_posix()
            if "/OT/" in parts:
                track = "OT"
            elif "/NT/" in parts:
                track = "NT"
            elif "/T4/" in parts:
                track = "T4"
        if track and IMG_EXT.search(fname):
            folder = {"OT": "image_OT", "NT": "image_NT", "T4": "image_T4"}[track]
            shared = LANG / "images" / folder / fname
            if shared.is_file():
                return rel_to_shared_images(html_path, track, fname), "to_shared_images"
            try:
                lang = html_path.relative_to(LANG).parts[0]
            except ValueError:
                lang = None
            if lang and lang not in ("images", "media", "scripts", "js"):
                for cand in (
                    LANG / lang / "media" / "images" / folder / fname,
                    LANG / lang / "media" / "images" / fname,
                    LANG / "media" / "images" / folder / fname,
                    LANG / "media" / "images" / "OT1_ref" / fname,
                ):
                    if cand.is_file():
                        return Path(os_path_rel(html_path.parent, cand)).as_posix(), "to_existing_media"
            return rel_to_shared_images(html_path, track, fname), "to_shared_images_assumed"

    if kind == "abs_languages":
        fixed = rel_from_abs_languages(html_path, u)
        if fixed:
            return fixed.replace("\\", "/"), "abs_to_rel"
        return u, "keep"

    if kind == "wrong_lang_media" and track:
        # Only when pointing at cn/media/... but file lives in shared images/
        return rel_to_shared_images(html_path, track, fname), "wrong_lang_to_shared"

    return u, "keep"


def process_file(html_path: Path, dry_run: bool) -> dict:
    text = html_path.read_text(encoding="utf-8", errors="surrogateescape")
    changes = []

    def repl(m: re.Match) -> str:
        url = m.group("url")
        if not is_img_url(url) and classify(url) not in (
            "onedrive",
            "abs_languages",
            "legacy_ot",
            "legacy_nt",
            "legacy_t4",
            "wrong_lang_media",
            "external",
        ):
            return m.group(0)
        # For href, only rewrite if clearly image
        attr = m.group("prefix").lower()
        if attr.startswith("href") and not is_img_url(url) and classify(url) == "other_rel":
            return m.group(0)
        new, reason = fix_url(html_path, url)
        if new != url and reason != "keep":
            changes.append({"from": url, "to": new, "reason": reason})
            return m.group("prefix") + new + m.group("suffix")
        if reason == "external_protocol":
            changes.append({"from": url, "to": new, "reason": reason})
            return m.group("prefix") + new + m.group("suffix")
        return m.group(0)

    new_text = IMG_ATTR_RE.sub(repl, text)
    if changes and not dry_run:
        # Preserve odd FrontPage bytes; avoid surrogate crash on utf-8 write
        try:
            html_path.write_text(new_text, encoding="utf-8")
        except UnicodeEncodeError:
            html_path.write_bytes(new_text.encode("utf-8", errors="surrogateescape"))
    return {"file": str(html_path.relative_to(ROOT)).replace("\\", "/"), "n": len(changes), "changes": changes[:20]}


def ensure_rewriter_include(html_path: Path, dry_run: bool) -> bool:
    """Inject rewriter script before </body> if chapter has imgs and missing script."""
    text = html_path.read_text(encoding="utf-8", errors="surrogateescape")
    if "image_path_rewriter.js" in text:
        return False
    if "<img" not in text.lower():
        return False
    # only under languages/*/OT|NT|T4/chapters or advance
    rel = html_path.as_posix()
    if not re.search(r"/languages/[^/]+/(OT|NT|T4)/(chapters|advance)/", rel):
        return False
    snippet = (
        '\n<script src="../../../scripts/image_path_rewriter.js"></script>\n'
    )
    if re.search(r"</body>", text, re.I):
        new_text = re.sub(r"</body>", snippet + "</body>", text, count=1, flags=re.I)
    else:
        new_text = text + snippet
    if not dry_run:
        try:
            html_path.write_text(new_text, encoding="utf-8")
        except UnicodeEncodeError:
            html_path.write_bytes(new_text.encode("utf-8", errors="surrogateescape"))
    return True


def main():
    import argparse

    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--inject-rewriter", action="store_true")
    args = ap.parse_args()
    dry = not args.apply

    html_files = list(LANG.rglob("*.html"))
    # skip huge unrelated if any
    stats = Counter()
    file_reports = []
    injected = 0

    for hp in html_files:
        # skip archive-ish
        if "_archive" in hp.parts or "node_modules" in hp.parts:
            continue
        r = process_file(hp, dry_run=dry)
        if r["n"]:
            file_reports.append(r)
            stats["files_changed"] += 1
            stats["replacements"] += r["n"]
            for c in r["changes"]:
                stats[c["reason"]] += 1
        if args.apply and args.inject_rewriter:
            if ensure_rewriter_include(hp, dry_run=False):
                injected += 1

    REPORT.parent.mkdir(parents=True, exist_ok=True)
    out = {
        "dry_run": dry,
        "stats": dict(stats),
        "injected_rewriter": injected,
        "files": file_reports[:200],
        "files_total_with_changes": len(file_reports),
    }
    REPORT.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"dry_run": dry, "stats": dict(stats), "injected": injected, "report": str(REPORT)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
