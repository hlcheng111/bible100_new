#!/usr/bin/env python3
"""Fix b100-cm-desk-kit wrongly injected inside document.write / template-literal strings.

Broken pattern A (concat): kit sits between unfinished '</'+'script> and </body></html>'
Broken pattern B (template literal): kit sits inside printWindow.document.write(`...`)

After removing kit from JS strings, ensure MAIN page loads desk kit once before final </body>.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]  # church_ministry/
REPO = ROOT.parent
MARKER = "<!-- b100-cm-desk-kit -->"

BROKEN_CONCAT_RE = re.compile(
    r"(</'\s*\+\s*'script>|</\"\s*\+\s*\r?\n\s*\"script>)\r?\n"
    r"<!-- b100-cm-desk-kit -->\r?\n"
    r'<link rel="stylesheet" href="[^"]*cm_desk\.css"\s*/>\r?\n'
    r'<script src="[^"]*cm_desk_registry\.js"></script>\r?\n'
    r'<script src="[^"]*cm_desk_kit\.js"></script>\r?\n'
    r"</body></html>(['\"])",
    re.M,
)

KIT_BLOCK_RE = re.compile(
    r"\r?\n?<!-- b100-cm-desk-kit -->\r?\n"
    r'<link rel="stylesheet" href="[^"]*cm_desk\.css"\s*/>\r?\n'
    r'<script src="[^"]*cm_desk_registry\.js"></script>\r?\n'
    r'<script src="[^"]*cm_desk_kit\.js"></script>',
    re.M,
)

VERIFY_BROKEN_RE = re.compile(
    r"(?:</'\s*\+\s*'script>|</\"\s*\+\s*(?:\r?\n\s*)?\"script>)\r?\n"
    r"<!-- b100-cm-desk-kit -->"
)

KNOWN = [
    "modules/members/member-integrated.html",
    "modules/support/visitation_index.html",
    "modules/volunteer/volunteer-integrated.html",
    "modules/finance/finance-integrated.html",
    "modules/fellowship/small-groups-integrated.html",
    "modules/expansion/outreach-strategy.html",
    "tools/volunteer_shift/list.html",
    "modules/fellowship/visitation-reports.html",
    "modules/fellowship/groups-reports.html",
    "modules/finance/finance-reports.html",
]


def rel_prefix(html_path: Path) -> str:
    rel = html_path.resolve().relative_to(ROOT.resolve())
    depth = len(rel.parts) - 1
    return "../" * depth if depth > 0 else ""


def kit_snippet(prefix: str) -> str:
    return (
        f"{MARKER}\n"
        f'<link rel="stylesheet" href="{prefix}css/cm_desk.css" />\n'
        f'<script src="{prefix}js/cm_desk_registry.js"></script>\n'
        f'<script src="{prefix}js/cm_desk_kit.js"></script>\n'
    )


def page_has_main_kit(text: str) -> bool:
    last_body = text.rfind("</body>")
    if last_body < 0:
        return False
    window = text[max(0, last_body - 500) : last_body]
    return MARKER in window and "cm_desk_kit.js" in window


def ensure_main_kit(text: str, html_path: Path) -> tuple[str, bool]:
    if page_has_main_kit(text):
        return text, False
    last_body = text.rfind("</body>")
    if last_body < 0:
        return text, False
    return text[:last_body] + kit_snippet(rel_prefix(html_path)) + text[last_body:], True


def fix_concat(text: str) -> tuple[str, int]:
    def repl(m: re.Match) -> str:
        open_part = m.group(1)
        if '"script>' in open_part or open_part.startswith('</"'):
            return '</" +\n            "script></body></html>"'
        return "</' + 'script></body></html>'"

    return BROKEN_CONCAT_RE.subn(repl, text)


def kit_inside_template_write(text: str) -> bool:
    pos = 0
    while True:
        i = text.find("document.write(`", pos)
        if i < 0:
            return False
        j = text.find("`)", i + 16)
        if j < 0:
            return False
        if MARKER in text[i:j]:
            return True
        pos = j + 2


def fix_template_literal(text: str) -> tuple[str, int]:
    count = 0
    out: list[str] = []
    pos = 0
    while True:
        i = text.find("document.write(`", pos)
        if i < 0:
            out.append(text[pos:])
            break
        j = text.find("`)", i + 16)
        if j < 0:
            out.append(text[pos:])
            break
        region = text[i:j]
        if MARKER in region:
            new_region, n = KIT_BLOCK_RE.subn("", region)
            new_region = re.sub(r"\n{3,}", "\n\n", new_region)
            count += n
            region = new_region
        out.append(text[pos:i])
        out.append(region)
        pos = j
    return "".join(out), count


def fix_file(path: Path) -> dict:
    original = path.read_text(encoding="utf-8")
    text = original
    info = {
        "path": str(path.relative_to(REPO)).replace("\\", "/"),
        "concat": 0,
        "tl": 0,
        "main_kit": False,
        "changed": False,
    }
    text, n_concat = fix_concat(text)
    info["concat"] = n_concat
    text, n_tl = fix_template_literal(text)
    info["tl"] = n_tl
    if n_concat or n_tl:
        text, added = ensure_main_kit(text, path)
        info["main_kit"] = added
    info["changed"] = text != original
    if info["changed"]:
        path.write_text(text, encoding="utf-8", newline="\n")
    return info


def find_candidates(root: Path) -> list[Path]:
    hits = []
    for p in root.rglob("*.html"):
        try:
            t = p.read_text(encoding="utf-8")
        except OSError:
            continue
        if MARKER not in t:
            continue
        if VERIFY_BROKEN_RE.search(t) or kit_inside_template_write(t):
            hits.append(p)
    return sorted(hits)


def verify(root: Path) -> list[str]:
    bad = []
    for p in root.rglob("*.html"):
        try:
            t = p.read_text(encoding="utf-8")
        except OSError:
            continue
        if VERIFY_BROKEN_RE.search(t):
            bad.append(str(p.relative_to(REPO)).replace("\\", "/") + " [concat write break]")
        if kit_inside_template_write(t):
            bad.append(str(p.relative_to(REPO)).replace("\\", "/") + " [kit in document.write(`)]")
    return bad


def main() -> int:
    candidates: set[Path] = set(find_candidates(ROOT))
    for rel in KNOWN:
        p = ROOT / rel
        if p.exists():
            candidates.add(p)

    fixed = []
    for p in sorted(candidates):
        info = fix_file(p)
        if info["changed"]:
            fixed.append(info)
            print(
                f"FIXED {info['path']} "
                f"(concat={info['concat']}, tl={info['tl']}, main_kit_added={info['main_kit']})"
            )
        else:
            print(f"OK    {info['path']} (already clean)")

    print("\n--- verify ---")
    bad = verify(ROOT)
    if bad:
        print("STILL BROKEN:")
        for b in bad:
            print(" ", b)
        return 1
    print("OK: no unfinished script>+kit write breaks; no kit inside document.write(`)")
    print(f"\nFiles fixed this run: {len(fixed)}")
    for info in fixed:
        print(" -", info["path"])
    print("\nKnown targets (all clean):")
    for rel in KNOWN:
        print(" - church_ministry/" + rel)
    return 0


if __name__ == "__main__":
    sys.exit(main())