# -*- coding: utf-8 -*-
"""
教會事工 0＋A–H · 階段 0（頁→區對照）＋階段 1（全頁靜態掃描）

做什麼（全自動、只讀專案、不改任何頁面）：
  階段 0：從各區選單設定檔（cm_*_menu_ssot.js 等）讀出「哪一頁屬於哪一區」。
  階段 1：逐頁掃連結、腳本、語法、直寫資料、空殼、舊分區名……，給 ✅🟡❌⚪。

執行：
  python church_ministry/scripts/cm_zone_scan.py
產出：
  church_ministry/docs/ZONE_PAGE_MAP_V1.md       （階段 0）
  church_ministry/docs/ZONE_STATIC_SCAN_V1.md    （階段 1 報告）
  church_ministry/audit/zone_scan_data.json      （完整資料）
  church_ministry/audit/zone_scan_pages.csv      （Excel 可開）
  church_ministry/audit/zone_scan_dashboard.html （雙擊可看、可篩選）

注意：這是「靜態」掃描——查得出壞連結、語法錯、空殼；查不出好不好用。
      逐頁真的開起來操作，是階段 2。
"""
from __future__ import annotations

import csv
import html as html_mod
import json
import os
import re
import subprocess
import sys
import tempfile
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import unquote

HERE = Path(__file__).resolve().parent
DEFAULT_REPO = HERE.parent.parent

# ───────────────────────── 設定區（小白可改） ─────────────────────────
ZONE_ORDER = ["0", "a", "b", "c", "d", "e", "f", "g", "h"]
ZONE_LABELS = {
    "0": "0 CRM 旅程",
    "a": "A 敬拜音樂",
    "b": "B 牧養小組",
    "c": "C 聖經門訓",
    "d": "D 外展差傳",
    "e": "E 社會服務",
    "f": "F 樂以載道",
    "g": "G 規劃行政",
    "h": "H 出席系統",
    "?": "未歸區",
}
# 區 → 選單設定檔（現行唯一真相）
ZONE_SSOT = {
    "a": "js/cm_a_menu_ssot.js",
    "b": "js/cm_b_menu_ssot.js",
    "c": "js/cm_c_menu_ssot.js",
    "d": "js/cm_d_menu_ssot.js",
    "e": "js/cm_e_menu_ssot.js",
    "f": "js/cm_f_menu_ssot.js",
    "g": "js/g_do_admin_menu_ssot.js",
    "h": "js/cm_h_menu_ssot.js",
    "0": "church_ministry/js/crm_journey_registry.js",
}
# 0 區另外讀這個 HTML 側欄
ZONE0_SIDEBAR = "church_ministry/sidebar_crm_journey.html"
# 區入口頁（landing）
LANDING = {
    "worship.html": "a",
    "pastoral.html": "b",
    "education.html": "c",
    "outreach.html": "d",
    "social.html": "e",
    "hymns.html": "f",
    "planning.html": "g",
    "attendance.html": "h",
}
# 找不到選單歸屬時，依資料夾「推測」（報告會標明是推測）
FOLDER_GUESS = {
    "worship": "a", "fellowship": "b", "support": "b", "care": "b",
    "checkins": "h", "education": "c", "development": "c",
    "expansion": "d", "mission": "d", "volunteer": "e", "activity": "e",
    "finance": "g", "administration": "g", "admin": "g",
    "research": "g", "analytics": "g", "members": "0", "people": "0",
}
# 這些鍵若被頁面直接 setItem，視為「繞過橋接層」（P0）
BIZ_KEYS = {
    "memberSystemData", "churchMasterDatabase", "financeSystemData",
    "financialData", "visitationData", "bible100_smart_ministry_main",
    "smart_ministry_linking",
}
# 簡體專用字（出現太多代表可能混進簡體）
SIMPLIFIED = set(
    "这个们为时来发开关门问间现点样说机动实经过还应该与无种务数据书记录设计划产业专东两乐买亲价众传优会体国学长师讲课请让认读议报统备资页处联题节视"
)
SIMPLIFIED_THRESHOLD = 12
PLACEHOLDER_RE = re.compile(
    r"示意|規劃中|待接|待開發|即將推出|尚未實作|Coming soon|TODO|FIXME|Lorem ipsum|demo only|占位|佔位", re.I
)
STALE_ZONE_RE = re.compile(r"[EF][\.\s·]?\s*行政支援|5F\s*規劃")
SKIP_DIRS = {"_archive", "node_modules", ".git", "__pycache__"}
SHELL_OK = {
    "church_ministry/index.html",
    "church_ministry/index_worship_journey.html",
    "church_ministry/index_c_education_journey.html",
}

ISSUE_LABELS = {
    "js_syntax": ("P0", "JS 語法錯誤"),
    "script_missing": ("P0", "引用的腳本檔不存在"),
    "biz_direct_write": ("P0", "直接寫入正式資料（繞過橋接層）"),
    "link_broken": ("P1", "連結指向不存在的頁"),
    "iframe_missing": ("P1", "iframe 指向不存在的頁"),
    "case_mismatch": ("P1", "大小寫不符（本機可、雲端 Linux 會壞）"),
    "root_abs_link": ("P1", "用 / 開頭的絕對路徑（file:// 會壞）"),
    "file_abs_link": ("P1", "寫死 file:/// 路徑"),
    "dead_link": ("P2", "空連結（# 或 javascript:void）"),
    "placeholder_many": ("P2", "示意／規劃中字樣偏多"),
    "stale_zone_name": ("P2", "仍用舊分區名（E／F 行政支援、5F）"),
    "nested_shell": ("P2", "疑似殼中殼（頁內另有 contentFrame）"),
    "no_charset": ("P2", "缺 meta charset（file:// 可能亂碼）"),
    "simplified": ("P3", "簡體字偏多"),
    "dup_id": ("P3", "重複 id"),
    "no_title": ("P3", "沒有 title"),
    "orphan": ("P3", "從任何入口都走不到（疑似舊檔）"),
    "asset_missing": ("P3", "圖片／樣式檔不存在"),
    "placeholder_few": ("P3", "少量示意字樣"),
    "redirect_only": ("P3", "只做轉址"),
    "js_ext_syntax": ("P0", "外部腳本語法錯誤"),
}
STATUS_ICON = {"ok": "✅", "warn": "🟡", "bad": "❌", "stub": "⚪"}

HREF_RE = re.compile(r"""\b(href|src)\s*=\s*(["'])(.*?)\2""", re.I | re.S)
TAG_RE = re.compile(r"<(a|link|script|img|iframe|source|video|audio)\b([^>]*)>", re.I | re.S)
ATTR_RE = re.compile(r"""\b(href|src)\s*=\s*(["'])(.*?)\2""", re.I | re.S)
SCRIPT_RE = re.compile(r"<script\b([^>]*)>(.*?)</script>", re.I | re.S)
STYLE_RE = re.compile(r"<style\b[^>]*>.*?</style>", re.I | re.S)
COMMENT_RE = re.compile(r"<!--.*?-->", re.S)
TAG_STRIP_RE = re.compile(r"<[^>]+>")
JS_HTML_STR_RE = re.compile(r"""["']([^"'\s<>{}$`]+?\.html?)(?:[?#][^"']*)?["']""", re.I)
SETITEM_RE = re.compile(r"""localStorage\.setItem\(\s*["']([^"']+)["']""")
SETBRACKET_RE = re.compile(r"""localStorage\[\s*["']([^"']+)["']\s*\]\s*=[^=]""")
ID_RE = re.compile(r"""\bid\s*=\s*["']([^"'${}\s]+)["']""", re.I)


def rel_posix(p: Path, repo: Path) -> str:
    return p.resolve().relative_to(repo.resolve()).as_posix()


class FsCache:
    """大小寫精確的存在檢查（Windows 不分大小寫，雲端 Linux 分）。"""

    def __init__(self):
        self._ls: dict[str, set[str]] = {}

    def _names(self, d: Path) -> set[str]:
        k = str(d)
        if k not in self._ls:
            try:
                self._ls[k] = set(os.listdir(d))
            except OSError:
                self._ls[k] = set()
        return self._ls[k]

    def check(self, path: Path):
        """回傳 (exists, exact_case)。"""
        try:
            path = Path(os.path.normpath(path))
        except Exception:
            return False, False
        if not path.exists():
            return False, False
        if path.is_dir():
            idx = path / "index.html"
            if not idx.exists():
                return False, False
            path = idx
        parts = path.parts
        # 從磁碟代號之後逐層比對大小寫
        cur = Path(parts[0])
        exact = True
        for part in parts[1:]:
            names = self._names(cur)
            if part not in names:
                exact = False
            cur = cur / part
        return True, exact


def read_text(p: Path) -> str:
    try:
        data = p.read_bytes()
    except OSError:
        return ""
    try:
        return data.decode("utf-8")
    except UnicodeDecodeError:
        pass
    for enc in ("cp950", "gb18030"):  # 舊版 FrontPage 頁常見 Big5
        try:
            return data.decode(enc)
        except UnicodeDecodeError:
            continue
    return data.decode("utf-8", errors="replace")


def list_pages(cm: Path) -> list[Path]:
    out = []
    for p in sorted(cm.rglob("*.htm*")):
        if any(part in SKIP_DIRS for part in p.relative_to(cm).parts):
            continue
        out.append(p)
    return out


# ───────────────────────── 階段 0：頁→區 ─────────────────────────
def resolve_ref(ref: str, bases: list[Path], fs: FsCache):
    p = unquote(ref.split("#")[0].split("?")[0])
    if not p or p.startswith(("http", "//", "/")):
        return None
    for b in bases:
        ok, _ = fs.check(b / p)
        if ok:
            t = Path(os.path.normpath(b / p))
            if t.is_dir():
                t = t / "index.html"
            return t
    return None


def collect_zone_refs(repo: Path, fs: FsCache):
    """回傳 (zone→{頁路徑: True}, 懸空清單 [(zone, 字串)])。"""
    cm = repo / "church_ministry"
    bases = [cm, repo, repo / "church_planning", repo / "church_ministry" / "js"]
    zone_pages: dict[str, dict[Path, bool]] = defaultdict(dict)
    dangling: list[tuple[str, str, str]] = []
    for z, rel in ZONE_SSOT.items():
        src = repo / rel
        if not src.exists():
            dangling.append((z, rel, "選單設定檔不存在"))
            continue
        text = read_text(src)
        for m in JS_HTML_STR_RE.finditer(text):
            ref = m.group(1)
            if "/" not in ref and not ref.startswith("."):
                # 純檔名可能是示意文字，先在 cm 試
                pass
            t = resolve_ref(ref, bases, fs)
            if t is None:
                if "/" in ref:
                    dangling.append((z, ref, rel))
                continue
            zone_pages[z][t] = True
    # 0 區側欄 HTML
    s0 = repo / ZONE0_SIDEBAR
    if s0.exists():
        text = COMMENT_RE.sub("", read_text(s0))
        for m in HREF_RE.finditer(text):
            if m.group(1).lower() != "href":
                continue
            ref = m.group(3)
            if not re.search(r"\.html?($|[?#])", ref):
                continue
            t = resolve_ref(ref, [s0.parent, cm, repo], fs)
            if t is None:
                if "/" in ref and not ref.startswith("http"):
                    dangling.append(("0", ref, ZONE0_SIDEBAR))
                continue
            zone_pages["0"][t] = True
    return zone_pages, dangling


def modes_refs(repo: Path, fs: FsCache) -> set[Path]:
    out: set[Path] = set()
    for rel in ("config/modes.json", "config/modules.json"):
        text = read_text(repo / rel)
        for m in re.finditer(r"""["']((?:church_ministry|church_planning|hymn_management)/[^"'?#\s]+\.html?)""", text):
            ok, _ = fs.check(repo / m.group(1))
            if ok:
                out.add(Path(os.path.normpath(repo / m.group(1))))
    return out


def guess_zone(rel_cm: str) -> str:
    parts = rel_cm.split("/")
    name = parts[-1]
    if parts[0] == "_landing" and name in LANDING:
        return LANDING[name]
    if parts[0] == "workbenches":
        m = re.match(r"dept_([A-H])_", name)
        if m:
            return m.group(1).lower()
        return "?"
    if parts[0] == "modules" and len(parts) > 2:
        return FOLDER_GUESS.get(parts[1], "?")
    if parts[0] == "tools" and len(parts) > 2:
        return {"volunteer_shift": "e", "finance_reconciliation": "g",
                "visitation_followup": "b", "ministry_handover": "g"}.get(parts[1], "?")
    if parts[0] in FOLDER_GUESS:
        return FOLDER_GUESS[parts[0]]
    if name.startswith(("sidebar_crm", "guide_crm", "load_c")):
        return "0"
    return "?"


# ───────────────────────── 階段 1：單頁掃描 ─────────────────────────
def visible_text(raw: str) -> str:
    t = COMMENT_RE.sub(" ", raw)
    t = SCRIPT_RE.sub(" ", t)
    t = STYLE_RE.sub(" ", t)
    t = TAG_STRIP_RE.sub(" ", t)
    t = html_mod.unescape(t)
    return re.sub(r"\s+", " ", t).strip()


def is_template_ref(ref: str) -> bool:
    return any(x in ref for x in ("${", "{{", "<%", "{%", "+ ", "' +", '" +'))


def classify_ref(ref: str):
    r = ref.strip()
    if not r or r.startswith("#"):
        return "skip"
    low = r.lower()
    if low.startswith(("http://", "https://", "//", "mailto:", "tel:", "data:", "blob:", "about:")):
        return "external"
    if low.startswith("file:"):
        return "file_abs"
    if low.startswith("javascript:"):
        return "js_void"
    if is_template_ref(r):
        return "template"
    if r.startswith("/"):
        return "root_abs"
    return "relative"


def scan_page(path: Path, repo: Path, fs: FsCache, ctx: dict) -> dict:
    cm = repo / "church_ministry"
    raw = read_text(path)
    nocomment = COMMENT_RE.sub("", raw)
    rel = rel_posix(path, repo)
    issues: list[tuple[str, str, str]] = []  # (code, sev, detail)

    def add(code, detail=""):
        sev = ISSUE_LABELS[code][0]
        issues.append((code, sev, detail))

    title_m = re.search(r"<title[^>]*>(.*?)</title>", nocomment, re.I | re.S)
    title = re.sub(r"\s+", " ", html_mod.unescape(title_m.group(1))).strip() if title_m else ""
    if not title:
        add("no_title")
    if not re.search(r"<meta[^>]+charset", raw[:4000], re.I):
        add("no_charset")

    # 連結／資源
    targets_page: set[Path] = set()
    broken = []
    case_bad = []
    dead = 0
    for m in TAG_RE.finditer(nocomment):
        tag, attrs = m.group(1).lower(), m.group(2)
        am = ATTR_RE.search(attrs)
        if not am:
            if tag == "a":
                pass
            continue
        attr, ref = am.group(1).lower(), am.group(3)
        if tag == "link" and "stylesheet" not in attrs.lower():
            continue
        kind = classify_ref(ref)
        if tag == "a" and attr == "href" and kind in ("js_void",) or (
            tag == "a" and attr == "href" and ref.strip() in ("#", "")
        ):
            if not re.search(r"onclick|data-|role\s*=\s*[\"']button", attrs, re.I):
                dead += 1
            continue
        if kind in ("skip", "external", "template", "js_void"):
            continue
        if kind == "file_abs":
            add("file_abs_link", ref[:80])
            continue
        if kind == "root_abs":
            add("root_abs_link", ref[:80])
            continue
        p = unquote(ref.split("#")[0].split("?")[0])
        if not p:
            continue
        ok, exact = fs.check(path.parent / p)
        if not ok:
            if tag == "script":
                add("script_missing", ref[:80])
            elif tag == "iframe":
                add("iframe_missing", ref[:80])
            elif tag in ("img", "link", "source", "video", "audio"):
                add("asset_missing", ref[:80])
            else:
                broken.append(ref[:80])
            continue
        if not exact:
            case_bad.append(ref[:80])
        t = Path(os.path.normpath(path.parent / p))
        if t.is_dir():
            t = t / "index.html"
        if tag in ("a", "iframe") and re.search(r"\.html?$", t.name, re.I):
            targets_page.add(t)
    for b in broken[:12]:
        add("link_broken", b)
    for b in case_bad[:6]:
        add("case_mismatch", b)
    if dead:
        add("dead_link", f"{dead} 個")

    # JS 字串裡的頁面參照（只算入口，不算壞連結）
    for sm in SCRIPT_RE.finditer(nocomment):
        for m in JS_HTML_STR_RE.finditer(sm.group(2) or ""):
            t = resolve_ref(m.group(1), [path.parent, cm, repo], fs)
            if t is not None:
                targets_page.add(t)

    # 腳本語法
    scripts_inline = []
    ext_scripts = []
    for sm in SCRIPT_RE.finditer(nocomment):
        attrs, body = sm.group(1) or "", sm.group(2) or ""
        typ = re.search(r"""type\s*=\s*["']([^"']+)["']""", attrs, re.I)
        if typ and typ.group(1).lower() not in ("text/javascript", "application/javascript", "text/babel-skip"):
            continue
        srcm = re.search(r"""src\s*=\s*["']([^"']+)["']""", attrs, re.I)
        if srcm:
            ref = srcm.group(1)
            if classify_ref(ref) == "relative":
                p = unquote(ref.split("#")[0].split("?")[0])
                ok, _ = fs.check(path.parent / p)
                if ok:
                    ext_scripts.append(Path(os.path.normpath(path.parent / p)))
        elif body.strip():
            scripts_inline.append(body)

    # 直寫正式資料
    keys = set(SETITEM_RE.findall(nocomment)) | set(SETBRACKET_RE.findall(nocomment))
    biz = sorted(k for k in keys if k in BIZ_KEYS)
    if biz:
        add("biz_direct_write", ", ".join(biz))

    text = visible_text(raw)
    n_ph = len(PLACEHOLDER_RE.findall(text))
    if n_ph >= 3:
        add("placeholder_many", f"{n_ph} 處")
    elif n_ph:
        add("placeholder_few", f"{n_ph} 處")
    if STALE_ZONE_RE.search(text) or STALE_ZONE_RE.search(title):
        add("stale_zone_name", STALE_ZONE_RE.search(text + " " + title).group(0))
    simp = sum(1 for ch in text if ch in SIMPLIFIED)
    if simp >= SIMPLIFIED_THRESHOLD:
        add("simplified", f"{simp} 字")
    ids = ID_RE.findall(nocomment)
    dups = [k for k, v in Counter(ids).items() if v > 1]
    if dups:
        add("dup_id", ", ".join(dups[:5]))
    if rel not in {r for r in SHELL_OK} and re.search(
        r"""(?:name|id)\s*=\s*["']contentFrame["']""", nocomment
    ):
        add("nested_shell")

    script_chars = sum(len(b) for b in scripts_inline)
    meta_refresh = bool(re.search(r"http-equiv\s*=\s*[\"']refresh", raw, re.I))
    js_redirect = bool(re.search(r"location\.(?:replace|href)\s*[=(]", raw)) and script_chars < 1500
    redirect = (meta_refresh or js_redirect) and len(text) < 300
    # 轉址頁：目標頁必須存在
    if redirect:
        add("redirect_only")
        refs = [m.group(1) for m in JS_HTML_STR_RE.finditer(nocomment)]
        refs += re.findall(r"""http-equiv\s*=\s*["']refresh["'][^>]*url=([^"'>\s]+)""", nocomment, re.I)
        refs = [re.sub(r"^\s*\d+\s*;\s*url=", "", x, flags=re.I) for x in refs]
        for ref in refs:
            if classify_ref(ref) != "relative":
                continue
            if resolve_ref(ref, [path.parent, cm, repo], fs) is None:
                add("link_broken", f"轉址目標不存在 {ref[:70]}")
    # 靠本地腳本繪出內容的頁（文字少不等於空殼；階段 2 必須動態檢查）
    js_render = len(text) < 300 and bool(ext_scripts) and not redirect
    stub = len(text) < 300 and script_chars < 3000 and not ext_scripts and not redirect

    return {
        "path": rel,
        "title": title,
        "kb": round(len(raw.encode("utf-8")) / 1024, 1),
        "text_len": len(text),
        "script_chars": script_chars,
        "inline_scripts": scripts_inline,
        "ext_scripts": ext_scripts,
        "targets": targets_page,
        "issues": issues,
        "stub": stub,
        "js_render": js_render,
        "redirect": redirect,
        "bridge": "church_data_bridge" in raw or "ChurchDataBridge" in raw,
        "auth": "church_auth" in raw,
    }


def js_syntax_batch(items: list[dict], node: str | None):
    if not node or not items:
        return {}, bool(items) and not node
    with tempfile.TemporaryDirectory() as td:
        fin, fout = Path(td, "in.json"), Path(td, "out.json")
        fin.write_text(json.dumps(items, ensure_ascii=False), encoding="utf-8")
        helper = HERE / "_cm_js_syntax_batch.js"
        try:
            subprocess.run([node, str(helper), str(fin), str(fout)], check=True, timeout=300,
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            res = json.loads(fout.read_text(encoding="utf-8"))
        except Exception:
            return {}, True
    return {r["id"]: r for r in res}, False


def find_node():
    from shutil import which
    return which("node")


def status_of(rec: dict) -> str:
    sevs = {s for _, s, _ in rec["issues"]}
    if "P0" in sevs or "P1" in sevs:
        return "bad"
    if rec["stub"] or rec["redirect"]:
        return "stub"
    if "P2" in sevs:
        return "warn"
    return "ok"


def stale_docs(repo: Path) -> list[str]:
    """找出仍用舊分區口徑的文件／規則（供階段 0 報告）。"""
    hits = []
    pats = [
        (repo / "church_ministry" / "docs", "*.md"),
        (repo / ".cursor" / "rules", "*.mdc"),
        (repo / "scripts", "audit_ae_modules.py"),
    ]
    rx = re.compile(r"F\s*[·\s]?\s*行政支援|E\.\s*行政支援")
    for d, g in pats:
        if not d.exists():
            continue
        for p in sorted(d.glob(g)) if d.is_dir() else []:
            if p.name.startswith("ZONE_"):  # 本工具自己產的報告會引用舊名，不算
                continue
            t = read_text(p)
            if rx.search(t):
                hits.append(rel_posix(p, repo))
    return hits


# ───────────────────────── 主流程 ─────────────────────────
def scan(repo: Path = DEFAULT_REPO) -> dict:
    repo = Path(repo).resolve()
    cm = repo / "church_ministry"
    fs = FsCache()
    zone_pages, dangling = collect_zone_refs(repo, fs)
    modes = modes_refs(repo, fs)

    zones_of: dict[Path, list[str]] = defaultdict(list)
    # 主要歸屬：A–H 優先於 0（0 是跨區旅程地圖，常與各區重疊）
    for z in ZONE_ORDER[1:] + ["0"]:
        for t in zone_pages.get(z, {}):
            if z not in zones_of[t]:
                zones_of[t].append(z)

    pages = list_pages(cm)
    page_set = {Path(os.path.normpath(p)) for p in pages}
    # SSOT 指到、但不在 church_ministry 內的頁（如樂以載道、教會規劃）也納入
    external = sorted(t for t in zones_of if t not in page_set and t.exists()
                      and not any(part in SKIP_DIRS for part in t.parts))
    all_pages = pages + external

    records = []
    for p in all_pages:
        records.append(scan_page(p, repo, fs, {}))

    # 外部腳本（去重）＋內嵌腳本語法
    node = find_node()
    items = []
    ext_seen: dict[Path, str] = {}
    for rec in records:
        for i, code in enumerate(rec["inline_scripts"]):
            items.append({"id": f"{rec['path']}#inline{i}", "code": code})
        for sp in rec["ext_scripts"]:
            if sp not in ext_seen:
                ext_seen[sp] = f"EXT::{rel_posix(sp, repo)}"
                items.append({"id": ext_seen[sp], "code": read_text(sp)})
    # 共用腳本資料夾裡的「每一支」JS 都查（有些是動態載入，頁面掃不到）
    all_js_ids = {}
    for d in (repo / "js", cm / "js", repo / "church_planning" / "js"):
        if not d.exists():
            continue
        for sp in sorted(d.glob("*.js")):
            sid = f"ALLJS::{rel_posix(sp, repo)}"
            all_js_ids[sid] = rel_posix(sp, repo)
            items.append({"id": sid, "code": read_text(sp)})
    syn, syntax_unavailable = js_syntax_batch(items, node)
    js_syntax_errors = [{"path": rel, "err": syn[sid]["err"]} for sid, rel in all_js_ids.items()
                        if sid in syn and not syn[sid]["ok"]]
    for rec in records:
        for i, _ in enumerate(rec["inline_scripts"]):
            r = syn.get(f"{rec['path']}#inline{i}")
            if r and not r["ok"]:
                rec["issues"].append(("js_syntax", "P0", r["err"]))
        for sp in rec["ext_scripts"]:
            r = syn.get(ext_seen[sp])
            if r and not r["ok"]:
                rec["issues"].append(("js_ext_syntax", "P0", f"{rel_posix(sp, repo)}: {r['err']}"))

    # 入口（反向連結）
    by_path = {Path(os.path.normpath(repo / r["path"])): r for r in records}
    # 本地外部腳本裡寫的頁面參照，也算走得到的路
    ext_refs: dict[Path, set[Path]] = {}
    for sp in ext_seen:
        found: set[Path] = set()
        for m in JS_HTML_STR_RE.finditer(read_text(sp)):
            t = resolve_ref(m.group(1), [sp.parent, cm, repo], fs)
            if t is not None:
                found.add(t)
        ext_refs[sp] = found
    graph: dict[Path, set[Path]] = {}
    inbound: dict[Path, set[Path]] = defaultdict(set)
    for p, rec in by_path.items():
        out = set(rec["targets"])
        for sp in rec["ext_scripts"]:
            out |= ext_refs.get(sp, set())
        out.discard(p)
        graph[p] = out
        for t in out:
            inbound[t].add(p)
    # 從入口出發走一遍：走得到的才算「使用者找得到」
    roots = set(zones_of) | modes
    for p in by_path:
        rp = rel_posix(p, repo)
        n = p.name
        if rp in SHELL_OK or (p.parent == cm and n.startswith(("sidebar_", "index", "dashboard", "church_main_rail"))):
            roots.add(p)
        if "/_landing/" in rp:
            roots.add(p)
    reachable: set[Path] = set()
    stack = [p for p in roots if p in by_path]
    while stack:
        cur = stack.pop()
        if cur in reachable:
            continue
        reachable.add(cur)
        for t in graph.get(cur, ()):
            if t in by_path and t not in reachable:
                stack.append(t)
    for r in records:
        p = Path(os.path.normpath(repo / r["path"]))
        zs = zones_of.get(p)
        if zs:
            r["zones"], r["zone_basis"] = zs, "選單設定檔"
        else:
            rel_cm = rel_posix(p, cm) if str(p).startswith(str(cm)) else ""
            g = guess_zone(rel_cm) if rel_cm else "?"
            r["zones"] = [g]
            r["zone_basis"] = "資料夾推測" if g != "?" else "無法判定"
        r["inbound"] = len(inbound.get(p, ()))
        r["reachable"] = p in reachable
        exempt = "/_templates/" in r["path"] or "/docs/" in r["path"] or "/audit/" in r["path"] \
            or p.name.startswith(("guide_", "load_"))
        if not r["reachable"] and not exempt:
            r["issues"].append(("orphan", "P3", ""))
        r["status"] = status_of(r)
        # 單頁清除不可序列化欄位
        r["inline_scripts_n"] = len(r.pop("inline_scripts"))
        r["ext_scripts_n"] = len(r.pop("ext_scripts"))
        r.pop("targets")

    # 懸空選單項目
    result = {
        "repo": str(repo),
        "node_available": bool(node),
        "syntax_unavailable": syntax_unavailable,
        "pages": records,
        "dangling": [{"zone": z, "ref": ref, "from": src} for z, ref, src in dangling],
        "js_files_checked": len(all_js_ids),
        "js_syntax_errors": js_syntax_errors,
        "ssot_pages": {z: sorted(rel_posix(t, repo) for t in zone_pages.get(z, {})) for z in ZONE_ORDER},
        "stale_docs": stale_docs(repo),
        "external_pages": [rel_posix(t, repo) for t in external],
    }
    return result


# ───────────────────────── 報告輸出 ─────────────────────────
def zone_tag(rec) -> str:
    return rec["zones"][0] if rec["zones"] else "?"


def summarize(result: dict) -> dict:
    by_zone: dict[str, Counter] = defaultdict(Counter)
    sev: dict[str, Counter] = defaultdict(Counter)
    for r in result["pages"]:
        z = zone_tag(r)
        by_zone[z][r["status"]] += 1
        by_zone[z]["total"] += 1
        for code, s, _ in r["issues"]:
            sev[z][s] += 1
    return {"by_zone": by_zone, "sev": sev}


def issue_text(rec, maxn=4) -> str:
    parts = []
    seen = Counter()
    for code, sev, detail in rec["issues"]:
        seen[code] += 1
    shown = 0
    for code, sev, detail in rec["issues"]:
        if shown >= maxn:
            break
        n = seen.pop(code, 0)
        if n == 0:
            continue
        lab = ISSUE_LABELS[code][1]
        d = f"（{detail}）" if detail and n == 1 else (f"×{n}" if n > 1 else "")
        parts.append(f"{sev} {lab}{d}")
        shown += 1
    more = sum(seen.values())
    s = "；".join(parts)
    if more:
        s += f"；…另 {len(seen)} 類"
    return s


def write_zone_map(result: dict, out: Path):
    L = []
    L.append("# 教會事工 · 頁→區對照（階段 0）\n")
    L.append("> 自動產生：`python church_ministry/scripts/cm_zone_scan.py`　**勿手改**（改選單請改 `js/cm_*_menu_ssot.js`）。\n")
    L.append("## 1. 現行分區定義（單一真相）\n")
    L.append("| 區 | 現行區名 | 選單設定檔（單一真相） | 入口頁 | 選單登記頁數 |")
    L.append("|---|---|---|---|---|")
    land_rev = {v: k for k, v in LANDING.items()}
    for z in ZONE_ORDER:
        n = len(result["ssot_pages"].get(z, []))
        ssot = ZONE_SSOT.get(z, "—")
        land = f"`_landing/{land_rev[z]}`" if z in land_rev else "—"
        L.append(f"| {z.upper()} | {ZONE_LABELS[z]} | `{ssot}` | {land} | {n} |")
    L.append("")
    L.append("依據：`config/modes.json` 的 church.secondaryNav、`js/cm_a_g_menu_registry.js`。")
    L.append("F 樂以載道的頁面在 `hymn_management/`（獨立模組），本表只列選單登記到的入口。\n")

    L.append("## 2. 仍用舊口徑的文件（建議校正，勿影響現行判斷）\n")
    if result["stale_docs"]:
        for s in result["stale_docs"]:
            L.append(f"- `{s}`（提到「E／F 行政支援」，現行 F＝樂以載道、G＝規劃行政）")
    else:
        L.append("- 無")
    L.append("")

    L.append("## 3. 選單指向不存在的頁（懸空）\n")
    if result["dangling"]:
        L.append("| 區 | 選單裡的路徑 | 來源 |")
        L.append("|---|---|---|")
        for d in result["dangling"]:
            L.append(f"| {d['zone'].upper()} | `{d['ref']}` | `{d['from']}` |")
    else:
        L.append("- 無（所有選單項目都找得到檔案）")
    L.append("")

    pages_by_zone: dict[str, list] = defaultdict(list)
    for r in result["pages"]:
        for z in r["zones"]:
            pages_by_zone[z].append(r)
    L.append("## 4. 各區頁面（選單登記＝確定；資料夾推測＝待牧者確認）\n")
    for z in ZONE_ORDER + ["?"]:
        rows = sorted(pages_by_zone.get(z, []), key=lambda r: (r["zone_basis"], r["path"]))
        L.append(f"### {ZONE_LABELS[z]}（{len(rows)} 頁）\n")
        if not rows:
            L.append("（無）\n")
            continue
        L.append("| 頁面 | 歸屬依據 | 標題 |")
        L.append("|---|---|---|")
        for r in rows:
            L.append(f"| `{r['path']}` | {r['zone_basis']} | {r['title'][:40]} |")
        L.append("")
    out.write_text("\n".join(L), encoding="utf-8")


def write_scan_report(result: dict, out: Path, tests_note: str = ""):
    s = summarize(result)
    pages = result["pages"]
    total = len(pages)
    cnt = Counter(r["status"] for r in pages)
    L = []
    L.append("# 教會事工 0＋A–H · 全頁靜態掃描報告（階段 1）\n")
    L.append("> 自動產生（`cm_zone_scan.py`）。**靜態**＝只讀檔案，查連結、腳本、語法、空殼；**不代表好不好用**。逐頁實際操作是階段 2。\n")
    L.append(f"- 掃描頁數：**{total}**（含選單指到的他模組頁 {len(result['external_pages'])} 頁）")
    L.append(f"- 語法檢查：{'已執行（Node）' if result['node_available'] and not result['syntax_unavailable'] else '⚠ 未執行（找不到 Node）'}")
    L.append("- 圖例：✅ 無明顯問題　🟡 小問題　❌ 有 P0／P1　⚪ 空殼或只轉址\n")
    L.append("## 1. 總覽\n")
    L.append("```mermaid")
    L.append("pie title 全頁狀態")
    for k, name in (("ok", "可用"), ("warn", "小問題"), ("bad", "有硬傷"), ("stub", "空殼／轉址")):
        L.append(f'    "{name}" : {cnt.get(k, 0)}')
    L.append("```\n")
    L.append("| 區 | 頁數 | ✅ | 🟡 | ❌ | ⚪ | P0 | P1 | P2 | P3 |")
    L.append("|---|---|---|---|---|---|---|---|---|---|")
    for z in ZONE_ORDER + ["?"]:
        c = s["by_zone"].get(z)
        if not c:
            continue
        sv = s["sev"].get(z, Counter())
        L.append(f"| {ZONE_LABELS[z]} | {c['total']} | {c['ok']} | {c['warn']} | {c['bad']} | {c['stub']} | {sv['P0']} | {sv['P1']} | {sv['P2']} | {sv['P3']} |")
    L.append("")
    L.append("嚴重度：P0＝壞掉／繞過橋接層　P1＝連結斷、雲端會壞　P2＝困惑或不一致　P3＝小瑕疵。\n")

    codes = Counter()
    for r in pages:
        for code, _, _ in r["issues"]:
            codes[code] += 1
    L.append("## 2. 問題類型排行\n")
    L.append("| 問題 | 嚴重度 | 件數 | 涉及頁數 |")
    L.append("|---|---|---|---|")
    for code, n in sorted(codes.items(), key=lambda kv: (ISSUE_LABELS[kv[0]][0], -kv[1])):
        pg = sum(1 for r in pages if any(c == code for c, _, _ in r["issues"]))
        L.append(f"| {ISSUE_LABELS[code][1]} | {ISSUE_LABELS[code][0]} | {n} | {pg} |")
    L.append("")

    L.append(f"## 2b. 共用腳本語法檢查（`js/`、`church_ministry/js/`、`church_planning/js/` 共 {result.get('js_files_checked', 0)} 支）\n")
    if result.get("js_syntax_errors"):
        for e in result["js_syntax_errors"]:
            L.append(f"- ❌ `{e['path']}`：{e['err']}")
    else:
        L.append("- 全部通過")
    L.append("")
    L.append("## 3. 選單懸空項（選單有、檔案沒有）\n")
    if result["dangling"]:
        for d in result["dangling"]:
            L.append(f"- 區 {d['zone'].upper()}：`{d['ref']}`（來源 `{d['from']}`）")
    else:
        L.append("- 無")
    L.append("")

    def bad_table(rows):
        rows.sort(key=lambda r: (ZONE_ORDER.index(zone_tag(r)) if zone_tag(r) in ZONE_ORDER else 99, r["path"]))
        if not rows:
            L.append("- 無\n")
            return
        L.append("| 區 | 頁面 | 問題 |")
        L.append("|---|---|---|")
        for r in rows:
            L.append(f"| {zone_tag(r).upper()} | `{r['path']}` | {issue_text(r)} |")
        L.append("")

    bad = [r for r in pages if r["status"] == "bad"]
    bad_live = [r for r in bad if r.get("reachable")]
    bad_dead = [r for r in bad if not r.get("reachable")]
    L.append(f"## 4. 需優先處理：❌ 且使用者走得到（{len(bad_live)} 頁）\n")
    L.append("從選單、頂欄、側欄一路點得到的頁，壞了使用者會直接遇到。\n")
    bad_table(bad_live)
    L.append(f"## 4b. ❌ 但從任何入口都走不到（{len(bad_dead)} 頁，疑似舊檔）\n")
    L.append("建議由牧者決定：下架／改成只轉址／真的要用再修。不急。\n")
    bad_table(bad_dead)

    L.append("## 5. 空殼／只轉址頁（⚪）\n")
    stubs = [r for r in pages if r["status"] == "stub"]
    if stubs:
        L.append("| 區 | 頁面 | 文字量 | 備註 |")
        L.append("|---|---|---|---|")
        for r in stubs:
            note = "只轉址" if r["redirect"] else "幾乎沒有內容"
            L.append(f"| {zone_tag(r).upper()} | `{r['path']}` | {r['text_len']} 字 | {note} |")
    else:
        L.append("- 無")
    L.append("")

    L.append("## 5b. 靠腳本繪出內容的頁（靜態看不到畫面，階段 2 必須動態檢查）\n")
    jsr = Counter(zone_tag(r) for r in pages if r.get("js_render"))
    L.append("| 區 | 頁數 |")
    L.append("|---|---|")
    for z in ZONE_ORDER + ["?"]:
        if jsr.get(z):
            L.append(f"| {ZONE_LABELS[z]} | {jsr[z]} |")
    L.append("")
    L.append("## 6. 🟡 小問題（只列前 60 頁；完整見 CSV）\n")
    warn = [r for r in pages if r["status"] == "warn"]
    L.append("| 區 | 頁面 | 問題 |")
    L.append("|---|---|---|")
    for r in warn[:60]:
        L.append(f"| {zone_tag(r).upper()} | `{r['path']}` | {issue_text(r, 3)} |")
    if len(warn) > 60:
        L.append(f"| … | 另 {len(warn) - 60} 頁 | 見 `audit/zone_scan_pages.csv` |")
    L.append("")
    if tests_note:
        L.append("## 7. 自我測試\n")
        L.append(tests_note)
        L.append("")
    L.append("## 8. 下一步\n")
    L.append("1. 看 §4、§5，決定哪些要修、哪些該下架或標「示意」。")
    L.append("2. 階段 2：從 ❌ 最多的區開始，逐頁實際開起來操作。")
    L.append("3. 完整表：`church_ministry/audit/zone_scan_dashboard.html`（雙擊可開、可篩選）。")
    out.write_text("\n".join(L), encoding="utf-8")


def write_csv(result: dict, out: Path):
    with out.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["區", "歸屬依據", "頁面", "狀態", "P0", "P1", "P2", "P3", "問題", "標題", "KB", "文字量", "入口數", "用橋接層", "用權限", "靠腳本繪出", "走得到"])
        for r in sorted(result["pages"], key=lambda r: (ZONE_ORDER.index(zone_tag(r)) if zone_tag(r) in ZONE_ORDER else 99, r["path"])):
            sv = Counter(s for _, s, _ in r["issues"])
            w.writerow([ZONE_LABELS[zone_tag(r)], r["zone_basis"], r["path"], STATUS_ICON[r["status"]],
                        sv["P0"], sv["P1"], sv["P2"], sv["P3"], issue_text(r, 6), r["title"], r["kb"],
                        r["text_len"], r["inbound"], "是" if r["bridge"] else "", "是" if r["auth"] else "",
                        "是" if r.get("js_render") else "", "是" if r.get("reachable") else "否"])


def write_dashboard(result: dict, out: Path):
    rows = []
    for r in result["pages"]:
        sv = Counter(s for _, s, _ in r["issues"])
        rows.append({
            "zone": ZONE_LABELS[zone_tag(r)], "basis": r["zone_basis"], "path": r["path"],
            "status": STATUS_ICON[r["status"]], "p0": sv["P0"], "p1": sv["P1"], "p2": sv["P2"], "p3": sv["P3"],
            "issues": issue_text(r, 6), "title": r["title"],
        })
    data = json.dumps(rows, ensure_ascii=False).replace("</", "<\\/")
    zones = [ZONE_LABELS[z] for z in ZONE_ORDER + ["?"]]
    page = f"""<!DOCTYPE html>
<html lang="zh-Hant"><head><meta charset="UTF-8"><title>教會事工 0＋A–H · 全頁靜態掃描</title>
<style>
body{{font-family:"Microsoft JhengHei",sans-serif;margin:16px;color:#1e293b}}
h1{{font-size:1.2rem}} .bar{{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}}
select,input{{padding:6px;border:1px solid #cbd5e1;border-radius:6px}}
table{{border-collapse:collapse;width:100%;font-size:13px}}
th,td{{border:1px solid #e2e8f0;padding:5px 8px;text-align:left;vertical-align:top}}
th{{background:#f1f5f9;position:sticky;top:0}}
.s{{font-size:16px}} code{{font-size:12px}}
</style></head><body>
<h1>教會事工 0＋A–H · 全頁靜態掃描（階段 1）</h1>
<p>✅ 無明顯問題　🟡 小問題　❌ 有 P0／P1　⚪ 空殼或只轉址。靜態掃描不代表好不好用。</p>
<div class="bar">
<select id="z"><option value="">全部區</option>{"".join(f'<option>{html_mod.escape(z)}</option>' for z in zones)}</select>
<select id="s"><option value="">全部狀態</option><option>❌</option><option>🟡</option><option>⚪</option><option>✅</option></select>
<input id="q" placeholder="搜尋頁面／標題／問題" size="32">
<span id="n"></span></div>
<table><thead><tr><th>區</th><th>狀態</th><th>頁面</th><th>P0</th><th>P1</th><th>P2</th><th>P3</th><th>問題</th><th>依據</th></tr></thead><tbody id="b"></tbody></table>
<script>
var D={data};
function esc(s){{return String(s).replace(/[&<>]/g,function(c){{return{{"&":"&amp;","<":"&lt;",">":"&gt;"}}[c]}})}}
function render(){{
 var z=document.getElementById('z').value,s=document.getElementById('s').value,q=document.getElementById('q').value.toLowerCase();
 var rows=D.filter(function(r){{return (!z||r.zone===z)&&(!s||r.status===s)&&(!q||(r.path+r.title+r.issues).toLowerCase().indexOf(q)>=0)}});
 document.getElementById('n').textContent=rows.length+' / '+D.length+' 頁';
 document.getElementById('b').innerHTML=rows.map(function(r){{return '<tr><td>'+esc(r.zone)+'</td><td class="s">'+r.status+'</td><td><code>'+esc(r.path)+'</code><br>'+esc(r.title)+'</td><td>'+r.p0+'</td><td>'+r.p1+'</td><td>'+r.p2+'</td><td>'+r.p3+'</td><td>'+esc(r.issues)+'</td><td>'+esc(r.basis)+'</td></tr>'}}).join('');
}}
['z','s','q'].forEach(function(i){{document.getElementById(i).addEventListener('input',render)}});render();
</script></body></html>"""
    out.write_text(page, encoding="utf-8")


def run(repo: Path = DEFAULT_REPO, out_docs: Path | None = None, out_audit: Path | None = None,
        tests_note: str = "") -> dict:
    repo = Path(repo)
    out_docs = Path(out_docs) if out_docs else repo / "church_ministry" / "docs"
    out_audit = Path(out_audit) if out_audit else repo / "church_ministry" / "audit"
    out_docs.mkdir(parents=True, exist_ok=True)
    out_audit.mkdir(parents=True, exist_ok=True)
    result = scan(repo)
    write_zone_map(result, out_docs / "ZONE_PAGE_MAP_V1.md")
    write_scan_report(result, out_docs / "ZONE_STATIC_SCAN_V1.md", tests_note)
    slim = json.loads(json.dumps(result, ensure_ascii=False, default=str))
    (out_audit / "zone_scan_data.json").write_text(json.dumps(slim, ensure_ascii=False, indent=1), encoding="utf-8")
    write_csv(result, out_audit / "zone_scan_pages.csv")
    write_dashboard(result, out_audit / "zone_scan_dashboard.html")
    return result


if __name__ == "__main__":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    note = ""
    if "--note" in sys.argv:
        note = Path(sys.argv[sys.argv.index("--note") + 1]).read_text(encoding="utf-8")
    res = run(DEFAULT_REPO, tests_note=note)
    c = Counter(r["status"] for r in res["pages"])
    print(f"pages={len(res['pages'])} ok={c['ok']} warn={c['warn']} bad={c['bad']} stub={c['stub']} "
          f"dangling={len(res['dangling'])} node={res['node_available']}")
