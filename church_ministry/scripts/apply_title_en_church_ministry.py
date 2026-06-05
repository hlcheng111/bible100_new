# -*- coding: utf-8 -*-
"""為 church_ministry 下 *.html 的 <title> 附加英譯（若尚無 · 英文 片段）。"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

STEM_EN = {
    "dashboard": "Dashboard",
    "index": "Module Home",
    "sidebar": "Sidebar Navigation",
    "activities-overview": "Activities Overview",
    "community-overview": "Community Overview",
    "load_central_member_seed": "Load Member Seed Data",
    "custom-page-editor": "Custom Page Editor",
    "theme-settings": "Theme Settings",
    "admin_dashboard_demo": "Admin Dashboard Demo",
    "support": "Support",
    "media": "Media",
    "administration": "Administration",
}


def stem_to_english(stem: str) -> str:
    if stem in STEM_EN:
        return STEM_EN[stem]
    s = stem.replace("_", "-")
    parts = [p for p in s.split("-") if p]
    if not parts:
        return "Page"
    return " ".join((w[:1].upper() + w[1:]) if w else "" for w in parts)


def has_english_fragment(title: str) -> bool:
    """第二個「·」之後、| 之前，須以英文字母開頭（避免「中文·中文」被誤判已雙語）。"""
    t = title.strip()
    if "·" not in t:
        return False
    parts = [p.strip() for p in t.split("·")]
    if len(parts) < 2:
        return False
    second = parts[1]
    second = second.split("|")[0].strip()
    second = re.split(r"\s*[-－]\s*", second, maxsplit=1)[0].strip()
    return bool(re.match(r"^[A-Za-z]", second))


def patch_title(content: str, path: Path) -> tuple[str, bool]:
    stem = path.stem
    en = stem_to_english(stem)
    mo = re.search(r"<title([^>]*)>([^<]*)</title>", content, flags=re.I | re.DOTALL)
    if not mo:
        return content, False
    inner = mo.group(2).strip()
    if has_english_fragment(inner):
        return content, False
    base = re.sub(
        r"\s*[-|｜]\s*(教會事工平台|教會事工|Bible100).*$",
        "",
        inner,
        flags=re.I,
    ).strip()
    base = re.sub(r"\s*[-–—]\s*Church\s+Ministry\s*$", "", base, flags=re.I).strip()
    # 若仍含「中文·中文」結構，只取第一節為主標題，避免三個 ·
    if base.count("·") >= 1:
        base = base.split("·")[0].strip()
    if not base:
        base = en
    new_title = f"{base} · {en} | Church Ministry"
    new_content = (
        content[: mo.start()]
        + f"<title{mo.group(1)}>{new_title}</title>"
        + content[mo.end() :]
    )
    return new_content, True


def main():
    changed = 0
    for p in sorted(ROOT.rglob("*.html")):
        if "_archive" in str(p):
            continue
        try:
            raw = p.read_text(encoding="utf-8")
        except OSError:
            continue
        new_raw, did = patch_title(raw, p)
        if did:
            p.write_text(new_raw, encoding="utf-8")
            print("updated", p.relative_to(ROOT))
            changed += 1
    print("done, changed:", changed)


if __name__ == "__main__":
    main()
