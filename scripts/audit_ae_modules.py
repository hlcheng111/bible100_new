#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
A–F 教會事工模組 · 側欄連結與頁面靜態總檢（file:// 友善）

產出：
  church_ministry/audit/ae_audit_data.json
  church_ministry/audit/ae_module_audit_dashboard.html
  church_ministry/docs/AE_MODULE_AUDIT_REPORT.md

Run: python scripts/audit_ae_modules.py
"""
from __future__ import annotations

import json
import re
import sys
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from html import escape
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urlparse

REPO = Path(__file__).resolve().parent.parent
CM = REPO / "church_ministry"
AUDIT_DIR = CM / "audit"
LAYOUT_SIDEBAR = CM / "sidebar_church_layout_v1.html"
REGISTRY_JS = CM / "js" / "crm_journey_registry.js"

ZONE_ORDER = ("a", "b", "c", "d", "e", "f")
ZONE_LABELS = {
    "a": "A · 敬拜及音樂",
    "b": "B · 牧養及小組",
    "c": "C · 教育／門訓",
    "d": "D · 外展差傳",
    "e": "E · 社會服務",
    "f": "F · 行政支援",
}

PLACEHOLDER_SKIP_RE = re.compile(
    r"status-planned|status-draft|placeholder-text|\.placeholder\b",
    re.I,
)

# W0 手写覆盖：内容已按 W0/W1 标准重整
W0_PRODUCT_OVERRIDES: dict[str, tuple[str, str]] = {
    "_landing/worship.html": ("✅", "W0 敬拜导览：理念+三分法+16链+互联预告"),
    "modules/worship/worship-integrated.html": ("✅", "W0 主桌 + W1 lite 六项壳"),
    "modules/worship/choir-team.html": ("✅", "W0 诗班样板 + W1 memberId 对齐"),
    "modules/worship/pulpit-ministry.html": ("✅", "W1 六项 shell + memberId 桥接"),
    "modules/worship/sermon-notes-admin.html": ("✅", "W1 六项 shell"),
    "modules/worship/hospitality.html": ("✅", "W1 六项 shell"),
    "modules/worship/worship-team-management.html": ("✅", "W1 六项 shell"),
    "modules/worship/instrument-team.html": ("✅", "W1 六项 shell"),
    "modules/worship/congregational-songs.html": ("✅", "W1 六项 shell"),
    "modules/worship/sheet-music.html": ("✅", "W1 六项 shell"),
    "modules/worship/song-library.html": ("✅", "W1 六项 shell"),
    "modules/worship/worship-management.html": ("✅", "W1 六项 shell"),
    "modules/worship/worship-reports.html": ("✅", "W1 六项 shell"),
    "modules/worship/attendance-management.html": ("✅", "W1 六项 shell"),
    "modules/media/audio-team.html": ("✅", "W1 六项 shell（影音）"),
    "modules/media/live-streaming.html": ("✅", "W1 六项 shell（影音）"),
}
PLACEHOLDER_RE = re.compile(
    r"規劃中|待建|占位|佔位|Coming\s+soon|TODO|Under\s+construction|建設中|尚未建立",
    re.I,
)
REDIRECT_RE = re.compile(
    r"(?:window\.location|location\.)(?:href|replace)\s*=\s*['\"]([^'\"]+)['\"]"
    r"|http-equiv\s*=\s*['\"]refresh['\"]",
    re.I,
)
TITLE_RE = re.compile(r"<title[^>]*>([^<]+)</title>", re.I)
H1_RE = re.compile(r"<h1[^>]*>([^<]{3,120})", re.I)

AE_ZONE_HEAD = {
    "🎼 A.": "a",
    "👥 B.": "b",
    "🌾 B.": "b",
    "📚 C.": "c",
    "🌍 D.": "d",
    "🤝 E.": "e",
    "⚙️ F.": "f",
    "⚙️ 行政": "f",
}


@dataclass
class AuditRow:
    zone: str
    zone_label: str
    menu_label: str
    menu_group: str
    source: str
    href_raw: str
    path_rel: str
    nav_mode: str
    shell_target: str
    file_exists: bool
    file_size: int
    page_title: str
    page_h1: str
    has_form: bool
    has_button: bool
    has_storage_js: bool
    has_chart: bool
    placeholder_hit: bool
    redirect_hint: str
    content_verdict: str
    link_verdict: str
    action: str
    notes: str
    open_href: str
    in_registry: bool
    registry_label: str
    duplicate_title_of: str = ""
    product_verdict: str = ""
    product_comment: str = ""


def norm_path_key(p: str) -> str:
    p = unquote(str(p or "")).replace("\\", "/").split("?")[0].split("#")[0]
    p = re.sub(r"^\.\/+", "", p)
    p = re.sub(r"^\.\.\/+", "", p)
    if p.startswith("church_ministry/"):
        p = p[len("church_ministry/") :]
    return p.lower()


def strip_query(href: str) -> str:
    return unquote(href.split("?")[0].split("#")[0])


def parse_layout_sidebar() -> list[dict[str, str]]:
    text = LAYOUT_SIDEBAR.read_text(encoding="utf-8", errors="replace")
    rows: list[dict[str, str]] = []
    zone = ""
    zone_label = ""
    group = ""
    for line in text.splitlines():
        m = re.search(r"<h3[^>]*>([^<]+)</h3>", line)
        if m:
            head = m.group(1).strip()
            zone = ""
            zone_label = head
            for needle, zid in AE_ZONE_HEAD.items():
                if needle in head:
                    zone = zid
                    break
            if "行政支援" in head:
                zone = "f"
            elif "社會服務" in head:
                zone = "e"
            group = head
            continue
        sm = re.search(r"<summary>([^<]+)", line)
        if sm:
            group = re.sub(r"<[^>]+>", "", sm.group(1)).strip()
            continue
        am = re.search(
            r'<a\s+[^>]*class="[^"]*sidebar-item[^"]*"[^>]*>(.*?)</a>',
            line,
            re.I | re.S,
        )
        if not am:
            am = re.search(r'<a\s+[^>]*class="[^"]*sidebar-item[^"]*"[^>]*>', line, re.I)
        if not am:
            continue
        block = line
        href_m = re.search(r'href="([^"]*)"', block)
        onclick_m = re.search(r"onclick=\"([^\"]+)\"", block)
        label = re.sub(r"<[^>]+>", "", am.group(1) if am.lastindex else "").strip()
        if not label and "onclick" in block:
            label = re.sub(r"<[^>]+>", "", block).strip()[:80]
        href_raw = href_m.group(1) if href_m else "#"
        if zone not in ZONE_ORDER:
            continue
        if "長期計劃" in (zone_label or "") or "AI 決策" in (zone_label or ""):
            continue
        rows.append(
            {
                "zone": zone,
                "zone_label": ZONE_LABELS.get(zone, zone_label),
                "menu_label": label or "(無標籤)",
                "menu_group": group,
                "href_raw": href_raw,
                "onclick": onclick_m.group(1) if onclick_m else "",
                "source": "layout_v1",
            }
        )
    return rows


def parse_registry_subpages() -> dict[str, dict[str, str]]:
    text = REGISTRY_JS.read_text(encoding="utf-8", errors="replace")
    out: dict[str, dict[str, str]] = {}
    block_re = re.compile(
        r"\{\s*zone:\s*\"([a-f])\"[^}]*?path:\s*\"([^\"]+)\"[^}]*?label:\s*\"([^\"]+)\"",
        re.S,
    )
    for m in block_re.finditer(text):
        key = norm_path_key(m.group(2))
        out[key] = {"zone": m.group(1), "label": m.group(3), "path": m.group(2)}
    return out


def parse_registry_zones() -> list[dict[str, str]]:
    text = REGISTRY_JS.read_text(encoding="utf-8", errors="replace")
    rows: list[dict[str, str]] = []
    zone_blocks = re.split(r"\{\s*id:\s*\"([a-f])\"", text)
    for i in range(1, len(zone_blocks), 2):
        zid = zone_blocks[i]
        body = zone_blocks[i + 1]
        land = re.search(
            r'landing:\s*\{[^}]*path:\s*"([^"]+)"[^}]*label:\s*"([^"]+)"',
            body,
            re.S,
        )
        prim = re.search(
            r'primary:\s*\{[^}]*path:\s*"([^"]+)"[^}]*label:\s*"([^"]+)"',
            body,
            re.S,
        )
        if land:
            rows.append(
                {
                    "zone": zid,
                    "menu_label": land.group(2),
                    "menu_group": "CRM · 導覽",
                    "href_raw": land.group(1),
                    "source": "crm_registry_landing",
                }
            )
        if prim:
            rows.append(
                {
                    "zone": zid,
                    "menu_label": prim.group(2),
                    "menu_group": "CRM · 主桌",
                    "href_raw": prim.group(1),
                    "source": "crm_registry_primary",
                }
            )
    return rows


def parse_shell_nav(onclick: str) -> tuple[str, str]:
    sb = re.search(r"sidebarUrl:\s*'([^']+)'", onclick)
    cf = re.search(r"contentUrl:\s*'([^']+)'", onclick)
    return (
        sb.group(1) if sb else "",
        cf.group(1) if cf else "",
    )


def resolve_cm_path(href_raw: str, onclick: str) -> tuple[str, str, str]:
    """Returns path_rel (under church_ministry), nav_mode, shell_target."""
    if onclick and "bible100ShellNav" in onclick:
        sb, cf = parse_shell_nav(onclick)
        return norm_path_key(cf) or norm_path_key(sb), "shell_swap", f"{sb} | {cf}"
    if href_raw.startswith("#") or href_raw == "#":
        return "", "onclick_only", ""
    if re.match(r"^https?://", href_raw, re.I):
        return href_raw, "external", ""
    raw = strip_query(href_raw)
    if raw.startswith("../"):
        repo_rel = raw.replace("../", "", 1)
        if (REPO / repo_rel).is_file():
            return repo_rel, "cross_module", repo_rel
        return raw, "cross_module", raw
    return norm_path_key(raw), "content_iframe", ""


def analyze_page(path_rel: str) -> dict[str, Any]:
    if not path_rel or path_rel.startswith("http"):
        return {
            "file_exists": path_rel.startswith("http"),
            "file_size": 0,
            "page_title": "",
            "page_h1": "",
            "has_form": False,
            "has_button": False,
            "has_storage_js": False,
            "has_chart": False,
            "placeholder_hit": False,
            "redirect_hint": "",
        }
    fp = CM / path_rel
    if not fp.is_file():
        fp = REPO / path_rel
    if not fp.is_file():
        return {
            "file_exists": False,
            "file_size": 0,
            "page_title": "",
            "page_h1": "",
            "has_form": False,
            "has_button": False,
            "has_storage_js": False,
            "has_chart": False,
            "placeholder_hit": False,
            "redirect_hint": "",
        }
    text = fp.read_text(encoding="utf-8", errors="replace")
    head = text[:12000]
    # 排除 CSS 类名误触占位判定（如 status-planned）
    head_for_ph = PLACEHOLDER_SKIP_RE.sub("", head)
    tm = TITLE_RE.search(head)
    h1m = H1_RE.search(head)
    redir = ""
    rm = REDIRECT_RE.search(head)
    if rm:
        redir = rm.group(0)[:120]
    return {
        "file_exists": True,
        "file_size": fp.stat().st_size,
        "page_title": (tm.group(1).strip() if tm else ""),
        "page_h1": re.sub(r"<[^>]+>", "", h1m.group(1)).strip() if h1m else "",
        "has_form": "<form" in text.lower(),
        "has_button": "<button" in text.lower() or 'type="button"' in text.lower(),
        "has_storage_js": "localStorage" in text or "sessionStorage" in text,
        "has_chart": "chart.js" in text.lower() or "Chart(" in text,
        "placeholder_hit": bool(PLACEHOLDER_RE.search(head_for_ph)),
        "redirect_hint": redir,
    }


def content_verdict(
    exists: bool,
    size: int,
    placeholder: bool,
    has_form: bool,
    has_button: bool,
    has_storage: bool,
    title: str,
) -> str:
    if not exists:
        return "missing"
    if placeholder:
        return "placeholder"
    if size < 2500 and not has_form and not has_button:
        return "thin"
    if has_form or has_button or has_storage:
        return "functional"
    if size >= 8000:
        return "content_rich"
    return "basic"


def link_verdict(
    exists: bool,
    nav_mode: str,
    in_registry: bool,
    source: str,
    path_rel: str,
    layout_paths: set[str],
) -> str:
    if nav_mode == "shell_swap":
        return "shell_ok"
    if nav_mode == "cross_module":
        return "cross_module_ok"
    if nav_mode == "external":
        return "external"
    if not exists:
        return "broken"
    key = norm_path_key(path_rel)
    if source.startswith("crm") and key not in layout_paths:
        return "crm_only"
    return "ok"


def action_for(row: AuditRow) -> str:
    if row.link_verdict == "broken":
        return "修連結或補檔案"
    if row.link_verdict == "crm_only":
        return "對齊 layout 側欄"
    if row.content_verdict == "missing":
        return "新建頁"
    if row.content_verdict == "placeholder":
        return "補功能／去占位"
    if row.content_verdict == "thin":
        return "補內容與說明"
    if row.redirect_hint:
        return "查跳轉是否誤導"
    if row.duplicate_title_of:
        return "確認是否錯連同頁"
    if row.nav_mode == "shell_swap":
        return "預期換殼（標註即可）"
    return "可用／待 UI 統一"


def open_href_for(path_rel: str, nav_mode: str) -> str:
    """Relative URL from church_ministry/audit/ dashboard."""
    if nav_mode in ("shell_swap", "cross_module", "external"):
        if path_rel.startswith(("school_", "disciple_", "church_planning", "index_v5", "bible_study", "nav_hub", "ai_tools", "hymn_management")):
            return f"../../{path_rel}"
        if path_rel.startswith("../"):
            return path_rel.replace("../", "../../", 1)
        return f"../../{path_rel}" if path_rel and not path_rel.startswith("http") else path_rel
    if not path_rel:
        return "#"
    return f"../{path_rel}"


def product_verdict_for(row: AuditRow) -> tuple[str, str]:
    key = norm_path_key(row.path_rel)
    if key in W0_PRODUCT_OVERRIDES:
        return W0_PRODUCT_OVERRIDES[key]
    if row.link_verdict == "broken":
        return "⚠️", "连结目标缺失，需补档或修正 href"
    if row.nav_mode == "shell_swap":
        return "🔗", "跨模块换壳（学校／门训／规划），预期行为"
    if row.nav_mode in ("cross_module", "external"):
        return "🔗", "链出本模块，确认壳内导航是否正确"
    if row.content_verdict == "placeholder":
        return "🆕", "占位页，待补内容与功能"
    if row.content_verdict == "thin":
        return "⚠️", "页面过薄，建议补说明与可操作区"
    if row.content_verdict == "missing":
        return "⚠️", "档案不存在"
    if row.duplicate_title_of:
        return "⚠️", f"标题与 {row.duplicate_title_of} 重复，请点路径确认"
    if row.redirect_hint:
        return "⚠️", "页首含跳转脚本，实机可能非预期停留"
    if row.content_verdict in ("functional", "content_rich"):
        return "✅", "有表单／存储或丰富内容，可用"
    if row.link_verdict == "crm_only":
        return "⚠️", "仅 CRM registry，layout 侧栏未收录"
    return "✅", "基本可用，待 UI／内容统一"


def build_rows() -> list[AuditRow]:
    layout_entries = parse_layout_sidebar()
    registry_map = parse_registry_subpages()
    crm_entries = parse_registry_zones()
    layout_path_keys = {norm_path_key(resolve_cm_path(e["href_raw"], e.get("onclick", ""))[0]) for e in layout_entries}

    merged: list[dict[str, str]] = []
    seen: set[tuple[str, str, str]] = set()
    for e in layout_entries + crm_entries:
        key = (e["source"], e.get("zone", ""), e.get("href_raw", ""), e.get("menu_label", ""))
        if key in seen:
            continue
        seen.add(key)
        merged.append(e)

    rows: list[AuditRow] = []
    title_index: dict[str, str] = {}

    for e in merged:
        path_rel, nav_mode, shell_target = resolve_cm_path(
            e.get("href_raw", ""), e.get("onclick", "")
        )
        analysis = analyze_page(path_rel)
        key = norm_path_key(path_rel)
        reg = registry_map.get(key, {})
        in_reg = bool(reg)
        lv = link_verdict(
            analysis["file_exists"],
            nav_mode,
            in_reg,
            e["source"],
            path_rel,
            layout_path_keys,
        )
        cv = content_verdict(
            analysis["file_exists"],
            analysis["file_size"],
            analysis["placeholder_hit"],
            analysis["has_form"],
            analysis["has_button"],
            analysis["has_storage_js"],
            analysis["page_title"],
        )
        zone = e.get("zone") or reg.get("zone", "")
        row = AuditRow(
            zone=zone,
            zone_label=ZONE_LABELS.get(zone, e.get("zone_label", zone)),
            menu_label=e.get("menu_label", ""),
            menu_group=e.get("menu_group", ""),
            source=e.get("source", ""),
            href_raw=e.get("href_raw", ""),
            path_rel=path_rel,
            nav_mode=nav_mode,
            shell_target=shell_target,
            file_exists=analysis["file_exists"],
            file_size=analysis["file_size"],
            page_title=analysis["page_title"],
            page_h1=analysis["page_h1"],
            has_form=analysis["has_form"],
            has_button=analysis["has_button"],
            has_storage_js=analysis["has_storage_js"],
            has_chart=analysis["has_chart"],
            placeholder_hit=analysis["placeholder_hit"],
            redirect_hint=analysis["redirect_hint"],
            content_verdict=cv,
            link_verdict=lv,
            action="",
            notes="",
            open_href=open_href_for(path_rel, nav_mode),
            in_registry=in_reg,
            registry_label=reg.get("label", ""),
        )
        row.action = action_for(row)
        pv, pc = product_verdict_for(row)
        row.product_verdict = pv
        row.product_comment = pc
        rows.append(row)
        if analysis["page_title"] and path_rel:
            tkey = analysis["page_title"].lower()
            if tkey in title_index and title_index[tkey] != path_rel:
                row.duplicate_title_of = title_index[tkey]
                row.notes = f"標題與 {title_index[tkey]} 相同，請確認是否點錯頁"
            else:
                title_index[tkey] = path_rel

    rows.sort(
        key=lambda r: (
            ZONE_ORDER.index(r.zone) if r.zone in ZONE_ORDER else 9,
            r.menu_group,
            r.menu_label,
        )
    )
    return rows


def summary_stats(rows: list[AuditRow]) -> dict[str, int]:
    s: dict[str, int] = {}
    for r in rows:
        s["total"] = s.get("total", 0) + 1
        s[f"link_{r.link_verdict}"] = s.get(f"link_{r.link_verdict}", 0) + 1
        s[f"content_{r.content_verdict}"] = s.get(f"content_{r.content_verdict}", 0) + 1
        if r.duplicate_title_of:
            s["dup_title"] = s.get("dup_title", 0) + 1
        if r.redirect_hint:
            s["redirect"] = s.get("redirect", 0) + 1
        pv_key = r.product_verdict or "?"
        s[f"product_{pv_key}"] = s.get(f"product_{pv_key}", 0) + 1
    return s


def write_json(rows: list[AuditRow], stats: dict[str, int]) -> Path:
    AUDIT_DIR.mkdir(parents=True, exist_ok=True)
    out = AUDIT_DIR / "ae_audit_data.json"
    payload = {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "mode": "static_file_audit",
        "stats": stats,
        "rows": [asdict(r) for r in rows],
    }
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return out


def verdict_badge(verdict: str) -> str:
    colors = {
        "ok": "#059669",
        "broken": "#dc2626",
        "shell_ok": "#2563eb",
        "cross_module_ok": "#7c3aed",
        "crm_only": "#d97706",
        "external": "#64748b",
        "functional": "#059669",
        "content_rich": "#059669",
        "basic": "#ca8a04",
        "thin": "#ea580c",
        "placeholder": "#9333ea",
        "missing": "#dc2626",
    }
    c = colors.get(verdict, "#475569")
    return f'<span class="badge" style="background:{c}">{escape(verdict)}</span>'


def write_dashboard(rows: list[AuditRow], stats: dict[str, int]) -> Path:
    AUDIT_DIR.mkdir(parents=True, exist_ok=True)
    out = AUDIT_DIR / "ae_module_audit_dashboard.html"
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    body_rows = []
    for r in rows:
        path_cell = "—"
        if r.path_rel:
            path_cell = (
                f'<a href="{escape(r.open_href)}" target="_blank" rel="noopener" '
                f'title="{escape(r.path_rel)}"><code>{escape(r.path_rel)}</code></a>'
            )
        body_rows.append(
            f"<tr data-zone=\"{escape(r.zone)}\" data-link=\"{escape(r.link_verdict)}\" "
            f"data-content=\"{escape(r.content_verdict)}\" data-product=\"{escape(r.product_verdict)}\">"
            f"<td>{escape(r.zone_label)}</td>"
            f"<td>{escape(r.menu_group)}</td>"
            f"<td><strong>{escape(r.menu_label)}</strong>"
            f"<br><small class=\"muted\">{escape(r.source)}</small></td>"
            f"<td>{path_cell}"
            f"<br><small class=\"muted\">{escape(r.href_raw[:70])}</small></td>"
            f"<td><span title=\"{escape(r.product_comment)}\">{escape(r.product_verdict)}</span></td>"
            f"<td><small>{escape(r.product_comment[:80])}</small></td>"
            f"<td>{escape(r.nav_mode)}</td>"
            f"<td>{verdict_badge(r.link_verdict)}</td>"
            f"<td>{verdict_badge(r.content_verdict)}</td>"
            f"<td>{'✓' if r.file_exists else '✗'} · {r.file_size // 1024}KB</td>"
            f"<td><small>{escape(r.page_title[:60])}</small></td>"
            f"<td>{escape(r.action)}</td>"
            f"</tr>"
        )
    html = f"""<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>A–E 模組總檢儀表板 · Church Ministry</title>
  <style>
    body {{ font-family: "Microsoft JhengHei", "Segoe UI", sans-serif; margin: 0; background: #f1f5f9; color: #0f172a; font-size: 13px; }}
    header {{ background: linear-gradient(135deg, #1e3a5f, #0f172a); color: #fff; padding: 20px 24px; }}
    header h1 {{ margin: 0 0 6px; font-size: 1.25rem; }}
    header p {{ margin: 0; opacity: 0.9; font-size: 0.85rem; }}
    .wrap {{ padding: 16px 20px 40px; max-width: 1400px; margin: 0 auto; }}
    .cards {{ display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }}
    .card {{ background: #fff; border-radius: 10px; padding: 12px 16px; border: 1px solid #e2e8f0; min-width: 120px; }}
    .card strong {{ display: block; font-size: 1.4rem; color: #1d4ed8; }}
    .toolbar {{ display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; align-items: center; }}
    input, select {{ padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 12px; }}
    table {{ width: 100%; border-collapse: collapse; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,.06); }}
    th, td {{ border-bottom: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; vertical-align: top; }}
    th {{ background: #e0e7ff; font-size: 11px; }}
    tr:hover {{ background: #f8fafc; }}
    .badge {{ display: inline-block; color: #fff; font-size: 10px; padding: 2px 8px; border-radius: 999px; }}
    .muted {{ color: #64748b; }}
    .note {{ background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 14px; margin-bottom: 14px; line-height: 1.5; }}
    code {{ font-size: 11px; word-break: break-all; }}
  </style>
</head>
<body>
  <header>
    <h1>📋 教會事工 A–E 模組總檢儀表板</h1>
    <p>靜態 file:// 友善 · v2：✅/⚠️/🆕/🔗 产品判定 + 可点路径 · 更新 {escape(ts)}</p>
  </header>
  <div class="wrap">
    <div class="note">
      <strong>用法：</strong>由 <code>index_v5.html</code> 或 <code>church_ministry/index.html</code> 進入後，對照本表點「開頁」。
      連結為相對路徑，適用本機／手機靜態包。<strong>shell_swap</strong> 表示預期會換側欄（學校／門訓／規劃）。
      技術備案：<code>church_ministry/docs/AE_MODULE_AUDIT_REPORT.md</code>
    </div>
    <div class="note" style="background:#eff6ff;border-color:#93c5fd;">
      <strong>A 敬拜「全都變講壇」？</strong> 靜態總檢顯示 layout 側欄 16 條 href <em>各不相同</em>，檔案與 title 亦不同。
      若實機右欄仍停在 <code>pulpit-ministry.html</code>，屬 <strong>file:// 雙 iframe 殼</strong> 或側欄 <code>base target</code> 行為，下一波修導覽腳本（非改 href）。
    </div>
    <div class="cards" id="statCards"></div>
    <div class="toolbar">
      <label>區塊 <select id="fZone"><option value="">全部</option>
        <option value="a">A 敬拜</option><option value="b">B 牧養</option>
        <option value="c">C 教育</option><option value="d">D 外展</option><option value="e">E 行政</option>
      </select></label>
      <label>产品 <select id="fProduct"><option value="">全部</option>
        <option value="✅">✅</option><option value="⚠️">⚠️</option>
        <option value="🆕">🆕</option><option value="🔗">🔗</option>
      </select></label>
      <label>連結 <select id="fLink"><option value="">全部</option></select></label>
      <label>內容 <select id="fContent"><option value="">全部</option></select></label>
      <input type="search" id="fSearch" placeholder="搜尋標籤／路徑／標題…" style="min-width:220px">
    </div>
    <table>
      <thead>
        <tr>
          <th>區</th><th>側欄分組</th><th>選單</th><th>目標路徑（可点）</th>
          <th>判定</th><th>说明</th><th>導覽</th>
          <th>連結</th><th>內容</th><th>檔案</th><th>頁 title</th><th>建議</th>
        </tr>
      </thead>
      <tbody id="tbody">
        {''.join(body_rows)}
      </tbody>
    </table>
  </div>
  <script>
    const stats = {json.dumps(stats, ensure_ascii=False)};
    const cards = document.getElementById('statCards');
    const items = [
      ['總項', stats.total || 0],
      ['連結 broken', stats.link_broken || 0],
      ['占位/薄頁', (stats.content_placeholder||0) + (stats.content_thin||0)],
      ['✅ 可用', stats.get('product_✅', 0)],
      ['⚠️ 待修', stats.get('product_⚠️', 0)],
      ['🆕 新建', stats.get('product_🆕', 0)],
      ['🔗 互联', stats.get('product_🔗', 0)],
      ['標題重複', stats.dup_title || 0],
    ];
    items.forEach(([k,v]) => {{
      const d = document.createElement('div');
      d.className = 'card';
      d.innerHTML = '<strong>' + v + '</strong>' + k;
      cards.appendChild(d);
    }});
    const tbody = document.getElementById('tbody');
    const rows = () => Array.from(tbody.querySelectorAll('tr'));
    function fillSelect(id, attr) {{
      const sel = document.getElementById(id);
      const set = new Set(rows().map(r => r.dataset[attr]).filter(Boolean));
      Array.from(set).sort().forEach(v => {{
        const o = document.createElement('option');
        o.value = v; o.textContent = v; sel.appendChild(o);
      }});
    }}
    fillSelect('fLink', 'link');
    fillSelect('fContent', 'content');
    function applyFilter() {{
      const z = document.getElementById('fZone').value;
      const p = document.getElementById('fProduct').value;
      const l = document.getElementById('fLink').value;
      const c = document.getElementById('fContent').value;
      const q = document.getElementById('fSearch').value.toLowerCase();
      rows().forEach(tr => {{
        const txt = tr.textContent.toLowerCase();
        const ok = (!z || tr.dataset.zone === z) && (!p || tr.dataset.product === p) &&
          (!l || tr.dataset.link === l) &&
          (!c || tr.dataset.content === c) && (!q || txt.includes(q));
        tr.style.display = ok ? '' : 'none';
      }});
    }}
    ['fZone','fProduct','fLink','fContent','fSearch'].forEach(id =>
      document.getElementById(id).addEventListener(id === 'fSearch' ? 'input' : 'change', applyFilter));
  </script>
</body>
</html>"""
    out.write_text(html, encoding="utf-8")
    return out


def write_markdown(rows: list[AuditRow], stats: dict[str, int]) -> Path:
    doc = CM / "docs"
    doc.mkdir(parents=True, exist_ok=True)
    out = doc / "AE_MODULE_AUDIT_REPORT.md"
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    lines = [
        "# 教會事工 A–E 模組總檢報告（技術備案）",
        "",
        f"> 產生時間：{ts} · 模式：**靜態 file://** · 儀表板：`audit/ae_module_audit_dashboard.html`",
        "",
        "## 摘要",
        "",
        f"| 指標 | 數量 |",
        f"|------|------|",
    ]
    for k, v in sorted(stats.items()):
        lines.append(f"| {k} | {v} |")
    lines.extend(["", "## 逐頁表", ""])
    lines.append(
        "| 區 | 選單 | 路徑 | 判定 | 说明 | 連結 | 內容 | 檔案 | title | 建議 | 來源 |"
    )
    lines.append("|----|------|------|------|------|------|------|------|-------|------|------|")
    for r in rows:
        lines.append(
            f"| {r.zone_label} | {r.menu_label} | `{r.path_rel or '—'}` | "
            f"{r.product_verdict} | {r.product_comment[:50]} | "
            f"{r.link_verdict} | {r.content_verdict} | "
            f"{'Y' if r.file_exists else 'N'} {r.file_size}B | "
            f"{r.page_title[:40].replace('|', '/')} | {r.action} | {r.source} |"
        )
    lines.extend(
        [
            "",
            "## 判定說明",
            "",
            "- **product ✅/⚠️/🆕/🔗**：产品向总判定（W0 页手写覆盖）",
            "- **link ok**：側欄 href 可解析且檔案存在",
            "- **link broken**：檔案缺失",
            "- **shell_ok**：`bible100ShellNav` 換殼（學校／門訓／規劃）",
            "- **content thin/placeholder**：頁面過薄或占位，待重整",
            "- **duplicate title**：多個選單指向標題相同的不同檔，需人工點「開頁」確認",
            "",
            "重新產生：`python scripts/audit_ae_modules.py`",
            "",
        ]
    )
    out.write_text("\n".join(lines), encoding="utf-8")
    return out


def main() -> int:
    if not LAYOUT_SIDEBAR.is_file():
        print("FAIL: missing layout sidebar", file=sys.stderr)
        return 1
    rows = build_rows()
    stats = summary_stats(rows)
    j = write_json(rows, stats)
    h = write_dashboard(rows, stats)
    m = write_markdown(rows, stats)
    print(f"OK: {len(rows)} rows")
    print(f"  JSON       {j.relative_to(REPO)}")
    print(f"  Dashboard  {h.relative_to(REPO)}")
    print(f"  Markdown   {m.relative_to(REPO)}")
    print(f"  broken={stats.get('link_broken', 0)} thin+placeholder="
          f"{stats.get('content_thin', 0) + stats.get('content_placeholder', 0)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
