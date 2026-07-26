#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""修復 apply_w3_sidebar_contract 產生的 broken module 連結。"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

BROKEN = re.compile(
    r'<a\s+([^>]*?)data-b100-nav="module"\s+data-b100-sidebar="\s+class="([^"]*)"([^>]*?)'
    r'data-b100-content="([^"]*)"([^>]*)>',
    re.I | re.S,
)

# contentUrl → (sidebarUrl, href relative from church_ministry/)
CM_MODULE_FIXES = {
    "church_planning/index_plan.html": (
        "church_planning/sidebar_plan.html",
        "../church_planning/index_plan.html",
    ),
    "church_planning/assessment-os-hub.html": (
        "church_planning/sidebar_plan.html",
        "../church_planning/assessment-os-hub.html",
    ),
    "smart_ministry/landing.html": (
        "smart_ministry/sidebar.html",
        "../smart_ministry/landing.html",
    ),
    "church_ministry/_landing/worship.html": (
        "church_ministry/sidebar_worship_journey.html",
        "_landing/worship.html",
    ),
    "church_ministry/modules/education/education-integrated.html?crm_from=sidebar&role=teacher#tab-roster": (
        "church_ministry/sidebar_c_education_journey.html",
        "modules/education/education-integrated.html?crm_from=sidebar&role=teacher#tab-roster",
    ),
    "bible_study/dashboard.html?lang=CN": (
        "bible_study/sidebar.html",
        "../bible_study/comprehensive_exegesis_reader.html?book=創世記&chapter=1&lang=CN",
    ),
    "school_management/dashboard.html": (
        "school_management/sidebar.html",
        "../school_management/dashboard.html",
    ),
    "ai_tools/ai_lab_landing.html": (
        "ai_tools/sidebar_lab.html",
        "../ai_tools/ai_lab_landing.html",
    ),
}

# When data-b100-content wrongly equals sidebar path
SIDEBAR_TO_CONTENT = {
    "church_planning/sidebar_plan.html": CM_MODULE_FIXES["church_planning/index_plan.html"],
    "smart_ministry/sidebar.html": CM_MODULE_FIXES["smart_ministry/landing.html"],
    "church_ministry/sidebar_worship_journey.html": CM_MODULE_FIXES["church_ministry/_landing/worship.html"],
    "church_ministry/sidebar_c_education_journey.html": CM_MODULE_FIXES[
        "church_ministry/modules/education/education-integrated.html?crm_from=sidebar&role=teacher#tab-roster"
    ],
    "bible_study/sidebar.html": CM_MODULE_FIXES["bible_study/dashboard.html?lang=CN"],
    "school_management/sidebar.html": CM_MODULE_FIXES["school_management/dashboard.html"],
    "ai_tools/sidebar_lab.html": CM_MODULE_FIXES["ai_tools/ai_lab_landing.html"],
}


def fix_content_key(raw: str) -> tuple[str, str] | None:
    raw = raw.replace("&amp;", "&").strip()
    if raw in SIDEBAR_TO_CONTENT:
        sb, href = SIDEBAR_TO_CONTENT[raw]
        return sb, href
    for key, (sb, href) in CM_MODULE_FIXES.items():
        if raw == key or raw.endswith("/" + key.split("/")[-1]):
            return sb, href
    return None


def fix_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8", errors="replace")
    orig = text

    def repl(m: re.Match) -> str:
        pre, class_attr, mid, content_raw, tail = m.groups()
        fixed = fix_content_key(content_raw)
        if not fixed:
            return m.group(0)
        sidebar_url, href = fixed
        # preserve i18n attrs from mid+tail
        extra = (mid + tail).replace('""', '"')
        extra = re.sub(r'data-b100-content="[^"]*"', "", extra)
        return (
            f'<a href="{href}" data-b100-nav="module" '
            f'data-b100-sidebar="{sidebar_url}" '
            f'data-b100-content="{content_raw if content_raw in CM_MODULE_FIXES else sidebar_url.replace("sidebar", "index")}" '
            f'class="{class_attr.strip()}"{extra}>'
        )

    # simpler: fix known broken pattern in church layout
    text = BROKEN.sub(repl, text)

    # Fix data-b100-content for known pairs
    for content, (sidebar, href) in CM_MODULE_FIXES.items():
        text = text.replace(
            f'data-b100-content="{content.split("/")[0]}/sidebar',
            f'data-b100-content="{content}"',
        )

    # Second pass: manual replacements for church layout broken tags
    replacements = [
        (
            'href="../church_planning/sidebar_plan.html" data-b100-nav="module" data-b100-sidebar=" class="sidebar-item sidebar-item-primary" style="margin-bottom:8px;background:#eef2ff;border-color:#4338ca;font-weight:700;"\n       data-i18n="cm.sb.back_plan" data-i18n-bridge="1"" data-b100-content="church_planning/sidebar_plan.html"',
            'href="../church_planning/index_plan.html" data-b100-nav="module" data-b100-sidebar="church_planning/sidebar_plan.html" data-b100-content="church_planning/index_plan.html" class="sidebar-item sidebar-item-primary" style="margin-bottom:8px;background:#eef2ff;border-color:#4338ca;font-weight:700;" data-i18n="cm.sb.back_plan" data-i18n-bridge="1"',
        ),
        (
            'data-b100-content="church_planning/sidebar_plan.html"',
            'data-b100-content="church_planning/index_plan.html" data-b100-sidebar="church_planning/sidebar_plan.html"',
        ),
    ]
    # Don't double-apply sidebar - use targeted fixes per file

    if "sidebar_church_layout_v1" in str(path):
        fixes = [
            (
                r'<a\s+href="\.\./church_planning/sidebar_plan\.html"\s+data-b100-nav="module"\s+data-b100-sidebar="\s+class="sidebar-item sidebar-item-primary"[^>]*data-i18n="cm\.sb\.back_plan"[^>]*data-b100-content="church_planning/sidebar_plan\.html"\s*>',
                '<a href="../church_planning/index_plan.html" data-b100-nav="module" data-b100-sidebar="church_planning/sidebar_plan.html" data-b100-content="church_planning/index_plan.html" class="sidebar-item sidebar-item-primary" style="margin-bottom:8px;background:#eef2ff;border-color:#4338ca;font-weight:700;" data-i18n="cm.sb.back_plan" data-i18n-bridge="1">',
            ),
            (
                r'<a\s+href="\.\./church_planning/sidebar_plan\.html"\s+data-b100-nav="module"\s+data-b100-sidebar="\s+class="sidebar-item sidebar-item-primary"[^>]*data-i18n="cm\.sb\.plan\.back"[^>]*data-b100-content="church_planning/sidebar_plan\.html"\s*>',
                '<a href="../church_planning/index_plan.html" data-b100-nav="module" data-b100-sidebar="church_planning/sidebar_plan.html" data-b100-content="church_planning/index_plan.html" class="sidebar-item sidebar-item-primary" data-i18n="cm.sb.plan.back" data-i18n-bridge="1">',
            ),
            (
                r'<a\s+href="\.\./church_planning/sidebar_plan\.html"\s+data-b100-nav="module"\s+data-b100-sidebar="\s+class="sidebar-item"[^>]*data-i18n="cm\.sb\.plan\.health"[^>]*data-b100-content="church_planning/sidebar_plan\.html"\s*>',
                '<a href="../church_planning/assessment-os-hub.html" data-b100-nav="module" data-b100-sidebar="church_planning/sidebar_plan.html" data-b100-content="church_planning/assessment-os-hub.html" class="sidebar-item" data-i18n="cm.sb.plan.health" data-i18n-bridge="1">',
            ),
            (
                r'<a\s+href="\.\./smart_ministry/sidebar\.html"\s+data-b100-nav="module"\s+data-b100-sidebar="\s+class="sidebar-item"[^>]*data-i18n="cm\.sb\.f\.smart"[^>]*data-b100-content="smart_ministry/sidebar\.html"\s*>',
                '<a href="../smart_ministry/landing.html" data-b100-nav="module" data-b100-sidebar="smart_ministry/sidebar.html" data-b100-content="smart_ministry/landing.html" class="sidebar-item" data-i18n="cm.sb.f.smart" data-i18n-bridge="1">',
            ),
            (
                r'<a\s+href="\.\./church_planning/sidebar_plan\.html"\s+data-b100-nav="module"\s+data-b100-sidebar="\s+class="sidebar-item"[^>]*data-i18n="cm\.sb\.meta\.plan"[^>]*data-b100-content="church_planning/sidebar_plan\.html"\s*>',
                '<a href="../church_planning/index_plan.html" data-b100-nav="module" data-b100-sidebar="church_planning/sidebar_plan.html" data-b100-content="church_planning/index_plan.html" class="sidebar-item" data-i18n="cm.sb.meta.plan" data-i18n-bridge="1">',
            ),
            (
                r'<a\s+href="\.\./church_ministry/sidebar_worship_journey\.html"\s+data-b100-nav="module"\s+data-b100-sidebar="\s+class="sidebar-item"[^>]*data-i18n="cm\.sb\.meta\.worship"[^>]*data-b100-content="church_ministry/sidebar_worship_journey\.html"\s*>',
                '<a href="sidebar_worship_journey.html" data-b100-nav="module" data-b100-sidebar="church_ministry/sidebar_worship_journey.html" data-b100-content="church_ministry/_landing/worship.html" class="sidebar-item" data-i18n="cm.sb.meta.worship" data-i18n-bridge="1">',
            ),
            (
                r'<a\s+href="\.\./church_ministry/sidebar_c_education_journey\.html"\s+data-b100-nav="module"\s+data-b100-sidebar="\s+class="sidebar-item"[^>]*data-i18n="cm\.sb\.meta\.ss"[^>]*data-b100-content="church_ministry/sidebar_c_education_journey\.html"\s*>',
                '<a href="sidebar_c_education_journey.html" data-b100-nav="module" data-b100-sidebar="church_ministry/sidebar_c_education_journey.html" data-b100-content="church_ministry/modules/education/education-integrated.html?crm_from=sidebar&amp;role=teacher#tab-roster" class="sidebar-item" data-i18n="cm.sb.meta.ss" data-i18n-bridge="1">',
            ),
            (
                r'<a\s+href="\.\./bible_study/sidebar\.html"\s+data-b100-nav="module"\s+data-b100-sidebar="\s+class="sidebar-item"[^>]*data-i18n="cm\.sb\.meta\.bible"[^>]*data-b100-content="bible_study/sidebar\.html"\s*>',
                '<a href="../bible_study/comprehensive_exegesis_reader.html?book=創世記&amp;chapter=1&amp;lang=CN" data-b100-nav="module" data-b100-sidebar="bible_study/sidebar.html" data-b100-content="bible_study/comprehensive_exegesis_reader.html?book=創世記&amp;chapter=1&amp;lang=CN" class="sidebar-item" data-i18n="cm.sb.meta.bible" data-i18n-bridge="1">',
            ),
            (
                r'<a\s+href="\.\./school_management/sidebar\.html"\s+data-b100-nav="module"\s+data-b100-sidebar="\s+class="sidebar-item"[^>]*data-i18n="cm\.sb\.meta\.school"[^>]*data-b100-content="school_management/sidebar\.html"\s*>',
                '<a href="../school_management/dashboard.html" data-b100-nav="module" data-b100-sidebar="school_management/sidebar.html" data-b100-content="school_management/dashboard.html" class="sidebar-item" data-i18n="cm.sb.meta.school" data-i18n-bridge="1">',
            ),
            (
                r'<a\s+href="\.\./ai_tools/sidebar_lab\.html"\s+data-b100-nav="module"\s+data-b100-sidebar="\s+class="sidebar-item"[^>]*data-i18n="cm\.sb\.meta\.ai"[^>]*data-b100-content="ai_tools/sidebar_lab\.html"\s*>',
                '<a href="../ai_tools/ai_lab_landing.html" data-b100-nav="module" data-b100-sidebar="ai_tools/sidebar_lab.html" data-b100-content="ai_tools/ai_lab_landing.html" class="sidebar-item" data-i18n="cm.sb.meta.ai" data-i18n-bridge="1">',
            ),
            (
                r'<a\s+href="\.\./smart_ministry/sidebar\.html"\s+data-b100-nav="module"\s+data-b100-sidebar="\s+class="sidebar-item"[^>]*data-i18n="cm\.sb\.meta\.smart"[^>]*data-b100-content="smart_ministry/sidebar\.html"\s*>',
                '<a href="../smart_ministry/landing.html" data-b100-nav="module" data-b100-sidebar="smart_ministry/sidebar.html" data-b100-content="smart_ministry/landing.html" class="sidebar-item" data-i18n="cm.sb.meta.smart" data-i18n-bridge="1">',
            ),
        ]
        for pat, rep in fixes:
            text = re.sub(pat, rep, text, flags=re.S)

    # Generic: any remaining broken sidebar attr
    text = re.sub(
        r'data-b100-sidebar="\s+class="([^"]*)"',
        r'class="\1" data-b100-sidebar="MISSING"',
        text,
    )

    if text != orig:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> int:
    n = 0
    for path in ROOT.rglob("sidebar*.html"):
        if fix_file(path):
            print("FIXED", path.relative_to(ROOT))
            n += 1
    print("done", n)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
