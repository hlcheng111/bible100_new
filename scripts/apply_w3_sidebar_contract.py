#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""H1a-e: 批量套用 W3 側欄契約（data-b100-nav、禁止 void/#/inline onclick）。"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

W3_SIDEBARS = [
    "church_ministry/sidebar_church_layout_v1.html",
    "church_ministry/sidebar_crm_journey.html",
    "church_ministry/sidebar_pastoral_journey.html",
    "church_ministry/sidebar_worship_journey.html",
    "church_ministry/congregation/sidebar.html",
    "school_management/sidebar.html",
    "smart_ministry/sidebar.html",
    "hymn_management/sidebar.html",
    "hymn_management/sidebar_playlist.html",
    "ai_tools/sidebar.html",
    "ai_tools/sidebar_lab.html",
    "church_planning/sidebar_plan.html",
    "disciple_dynamics/sidebar.html",
    "nav_hub/sidebar.html",
    "help/sidebar_help.html",
    "languages/my/sidebar.html",
]

SHELL_ONCLICK = re.compile(
    r"""\s*onclick\s*=\s*["']return\s+bible100ShellNav\s*\(\s*event\s*,\s*\{\s*"""
    r"""sidebarUrl\s*:\s*['"]([^'"]+)['"]\s*,\s*contentUrl\s*:\s*['"]([^'"]+)['"]\s*\}\s*\)\s*;?\s*["']""",
    re.I | re.S,
)

HREF_VOID = re.compile(
    r'href\s*=\s*["\'](?:javascript:void\s*\(\s*0\s*\)|#)["\']',
    re.I,
)


def js_prefix(sidebar_rel: str) -> str:
    depth = sidebar_rel.count("/")
    return "../" * depth + "js/"


def cm_extra(sidebar_rel: str) -> str:
    if sidebar_rel.startswith("church_ministry/") and "congregation/" not in sidebar_rel:
        depth = sidebar_rel.count("/")
        p = "../" * (depth - 1) if depth > 1 else ""
        return f'  <script src="{p}church_ministry/js/cm_shell_paths.js"></script>\n'
    return ""


def ensure_head_scripts(text: str, sidebar_rel: str) -> str:
    jp = js_prefix(sidebar_rel)
    need = [
        ("sidebar_shell_target_fallback.js", f'<script src="{jp}sidebar_shell_target_fallback.js"></script>'),
        ("shell_nav.js", f'<script src="{jp}shell_nav.js"></script>'),
        ("sidebar_behavior.js", f'<script src="{jp}sidebar_behavior.js"></script>'),
    ]
    if "sidebar_behavior.js" in text and "shell_nav.js" in text:
        pass
    else:
        inject = "".join(line + "\n" for _, line in need)
        cm = cm_extra(sidebar_rel)
        block = inject + cm
        if "</head>" in text:
            text = text.replace("</head>", block + "</head>", 1)
        elif "<body" in text:
            text = text.replace("<body", block + "<body", 1)

    if "<base " not in text.lower() and sidebar_rel != "church_ministry/congregation/sidebar.html":
        base = '  <base target="contentFrame">\n'
        if "</head>" in text and "<base" not in text:
            text = text.replace("</head>", base + "</head>", 1)
    return text


def site_root_to_href(sidebar_rel: str, site_path: str) -> str:
    """Site-root path → href relative to sidebar file."""
    site_path = site_path.replace("&amp;", "&")
    parts = sidebar_rel.split("/")[:-1]
    up = "../" * len(parts)
    return up + site_path


def convert_shell_onclick(text: str, sidebar_rel: str) -> str:
    def repl(m: re.Match) -> str:
        sidebar_url = m.group(1).replace("&amp;", "&")
        content_url = m.group(2).replace("&amp;", "&")
        href = site_root_to_href(sidebar_rel, content_url)
        return (
            f' href="{href}" data-b100-nav="module" '
            f'data-b100-sidebar="{sidebar_url}" data-b100-content="{content_url}"'
        )

    # href="#" or void before onclick
    text = re.sub(
        r'href\s*=\s*["\'](?:javascript:void\s*\(\s*0\s*\)|#)["\']'
        r"(\s[^>]*?)"
        + SHELL_ONCLICK.pattern
        + r"\s*",
        lambda m: repl(m) + " ",
        text,
        flags=re.I | re.S,
    )
    # void(0) immediately before onclick on same tag
    text = re.sub(
        r'href\s*=\s*["\']javascript:void\s*\(\s*0\s*\)["\'](\s[^>]*?)'
        + SHELL_ONCLICK.pattern,
        lambda m: repl(m),
        text,
        flags=re.I | re.S,
    )
    # remaining standalone onclick on tags
    def tag_repl(match: re.Match) -> str:
        full = match.group(0)
        sm = SHELL_ONCLICK.search(full)
        if not sm:
            return full
        sidebar_url = sm.group(1).replace("&amp;", "&")
        content_url = sm.group(2).replace("&amp;", "&")
        href = site_root_to_href(sidebar_rel, content_url)
        full = SHELL_ONCLICK.sub("", full)
        full = re.sub(r'href\s*=\s*["\'][^"\']*["\']', f'href="{href}"', full, count=1)
        if "data-b100-nav" not in full:
            full = full.replace(
                f'href="{href}"',
                f'href="{href}" data-b100-nav="module" '
                f'data-b100-sidebar="{sidebar_url}" data-b100-content="{content_url}"',
                1,
            )
        return full

    text = re.sub(r"<a\b[^>]*onclick\s*=[^>]*bible100ShellNav[^>]*>", tag_repl, text, flags=re.I)
    return text


def tag_content_links(text: str) -> str:
    def fix_a(m: re.Match) -> str:
        tag = m.group(0)
        if "data-b100-nav" in tag or "data-b100-shell-nav" in tag:
            return tag
        if "onclick" in tag.lower():
            return tag
        if 'target="_top"' in tag or 'target="_parent"' in tag or 'target="_blank"' in tag:
            return tag
        href_m = re.search(r'href\s*=\s*["\']([^"\']+)["\']', tag, re.I)
        if not href_m:
            return tag
        href = href_m.group(1)
        if not href or href.startswith(("#", "http", "javascript:", "mailto:", "tel:")):
            return tag
        if "data-b100-nav=" in tag:
            return tag
        # insert after href
        return re.sub(
            r'(href\s*=\s*["\'][^"\']+["\'])',
            r'\1 data-b100-nav="content"',
            tag,
            count=1,
        )

    return re.sub(r"<a\b[^>]+>", fix_a, text, flags=re.I)


def normalize_shell_nav_alias(text: str) -> str:
    return text.replace('data-b100-shell-nav="content"', 'data-b100-nav="content"')


def patch_worship_js_links(text: str) -> str:
    """Inject data-b100-nav on dynamically created anchors in worship journey."""
    if "worship-journey-nav" not in text:
        return text
    text = text.replace(
        "a.href = st.path;",
        'a.href = st.path; a.setAttribute("data-b100-nav", "content");',
    )
    text = text.replace(
        "start.href = route.start;",
        'start.href = route.start; start.setAttribute("data-b100-nav", "content");',
    )
    return text


def patch_pastoral_js_links(text: str) -> str:
    if "pastoral-journey-nav" not in text:
        return text
    text = text.replace(
        "start.href = route.start +",
        'start.setAttribute("data-b100-nav", "content"); start.href = route.start +',
    )
    return text


def process_file(rel: str) -> list[str]:
    path = ROOT / rel
    if not path.is_file():
        return [f"SKIP missing {rel}"]
    orig = path.read_text(encoding="utf-8", errors="replace")
    text = orig
    text = normalize_shell_nav_alias(text)
    text = convert_shell_onclick(text, rel)
    text = tag_content_links(text)
    text = patch_worship_js_links(text)
    text = patch_pastoral_js_links(text)
    text = ensure_head_scripts(text, rel)

    # strip remaining forbidden onclick shell nav
    text = re.sub(
        r'\s*onclick\s*=\s*["\']return\s+bible100ShellNav[^"\']*["\']',
        "",
        text,
        flags=re.I,
    )
    # void href without nav → try to remove
    text = re.sub(
        r'href\s*=\s*["\']javascript:void\s*\(\s*0\s*\)["\']',
        'href="dashboard.html" data-b100-nav="content"',
        text,
        flags=re.I,
    )
    text = re.sub(r'href\s*=\s*["\']#["\']', 'href="dashboard.html" data-b100-nav="content"', text)

    if text != orig:
        path.write_text(text, encoding="utf-8")
        return [f"UPDATED {rel}"]
    return [f"UNCHANGED {rel}"]


def main() -> int:
    logs: list[str] = []
    for rel in W3_SIDEBARS:
        logs.extend(process_file(rel))
    for line in logs:
        print(line)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
