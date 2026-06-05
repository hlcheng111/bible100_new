#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
全站 HTML 自動盤點（不含 languages/ 時使用 _inventory_html_exclude_languages.txt）。
產出 CSV + Markdown 摘要，供《整全改良計劃書》引用。
"""
from __future__ import annotations

import csv
import re
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote

REPO_ROOT = Path(__file__).resolve().parent.parent
INVENTORY = REPO_ROOT / "_inventory_html_exclude_languages.txt"
MAX_HTML_READ = 800_000  # 跳過過大檔（例外記錄）
MAX_LINKS_PER_FILE = 400

TITLE_RE = re.compile(rb"<title[^>]*>(.*?)</title>", re.I | re.DOTALL)
CHARSET_RE = re.compile(
    rb'<meta\s+[^>]*charset\s*=\s*["\']?([^"\'\s>]+)', re.I
)
H1_RE = re.compile(rb"<h1\b", re.I)
HREF_RE = re.compile(
    rb"""href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))""", re.I
)

SUSPICIOUS_NAME_PATTERNS = (
    "test",
    "temp",
    "cache",
    "_bak",
    ".bak",
    "複製",
    "copy",
    "404",
    "FINAL_TEST",
    "SOLUTION",
    "B_test",
    "grok",
)


def is_suspicious_path(rel: str) -> list[str]:
    low = rel.replace("\\", "/").lower()
    reasons = []
    for p in SUSPICIOUS_NAME_PATTERNS:
        if p.lower() in low:
            reasons.append(p)
    # tests/ or test/ folder
    if "/tests/" in f"/{low}/" or low.startswith("test/"):
        reasons.append("tests_dir")
    return list(dict.fromkeys(reasons))


def module_of(rel: str) -> str:
    parts = rel.replace("\\", "/").strip("/").split("/")
    return parts[0] if parts else "(root)"


def read_raw(path: Path) -> bytes | None:
    try:
        data = path.read_bytes()
        if len(data) > MAX_HTML_READ:
            return None
        return data
    except OSError:
        return None


def extract_title(raw: bytes) -> str:
    m = TITLE_RE.search(raw[:200_000])
    if not m:
        return ""
    try:
        t = m.group(1).decode("utf-8", errors="replace")
    except Exception:
        return ""
    return re.sub(r"\s+", " ", t).strip()


def extract_charset(raw: bytes) -> str:
    head = raw[:8000]
    m = CHARSET_RE.search(head)
    if m:
        try:
            return m.group(1).decode("ascii", errors="replace").strip()
        except Exception:
            pass
    if b"charset=utf-8" in head.lower() or b'charset="utf-8"' in head.lower():
        return "utf-8"
    return ""


def count_h1(raw: bytes) -> int:
    return len(H1_RE.findall(raw[:MAX_HTML_READ]))


def collect_hrefs(raw: bytes) -> list[str]:
    out = []
    seen: set[str] = set()
    for m in HREF_RE.finditer(raw[:MAX_HTML_READ]):
        h = m.group(1) or m.group(2) or m.group(3)
        if not h:
            continue
        try:
            s = h.decode("utf-8", errors="replace").strip()
        except Exception:
            continue
        s = unquote(s)
        if s and s not in seen:
            seen.add(s)
            out.append(s)
        if len(out) >= MAX_LINKS_PER_FILE:
            break
    return out


def resolve_internal(target_root: Path, base_file: Path, href: str) -> Path | None:
    h = href.strip().split("#")[0].split("?")[0]
    if not h or h.startswith("#"):
        return None
    low = h.lower()
    if low.startswith(("http://", "https://", "mailto:", "javascript:", "data:")):
        return None
    try:
        # relative to base_file parent
        p = (base_file.parent / h).resolve()
    except (OSError, ValueError):
        return None
    try:
        p.relative_to(target_root.resolve())
    except ValueError:
        return None
    return p


def main() -> int:
    if not INVENTORY.is_file():
        print(f"Missing inventory: {INVENTORY}", file=sys.stderr)
        return 1

    rel_paths = []
    for line in INVENTORY.read_text(encoding="utf-8", errors="replace").splitlines():
        line = line.strip().lstrip("\ufeff")
        if line and not line.startswith("#"):
            rel_paths.append(line.replace("/", "\\"))

    rows = []
    title_counts: dict[str, list[str]] = defaultdict(list)
    broken_by_file: list[tuple[str, str, str]] = []

    for rel in rel_paths:
        path = REPO_ROOT / rel
        exists = path.is_file()
        susp = is_suspicious_path(rel)
        mod = module_of(rel)

        if not exists:
            rows.append(
                {
                    "path": rel.replace("\\", "/"),
                    "module": mod,
                    "exists": "0",
                    "size": "",
                    "title": "",
                    "charset_meta": "",
                    "h1_count": "",
                    "suspicious": "|".join(susp),
                    "broken_internal_links": "",
                    "notes": "FILE_MISSING",
                }
            )
            continue

        sz = path.stat().st_size
        raw = read_raw(path)
        if raw is None:
            rows.append(
                {
                    "path": rel.replace("\\", "/"),
                    "module": mod,
                    "exists": "1",
                    "size": str(sz),
                    "title": "",
                    "charset_meta": "",
                    "h1_count": "",
                    "suspicious": "|".join(susp),
                    "broken_internal_links": "",
                    "notes": "SKIP_TOO_LARGE_OR_READ_ERROR",
                }
            )
            continue

        title = extract_title(raw)
        if title:
            title_counts[title].append(rel.replace("\\", "/"))

        cs = extract_charset(raw)
        h1c = count_h1(raw)

        broken = []
        for href in collect_hrefs(raw):
            tgt = resolve_internal(REPO_ROOT, path, href)
            if tgt is None:
                continue
            # only .html .htm .json common targets — allow dirs with /
            if tgt.suffix.lower() not in (
                ".html",
                ".htm",
                "",
                ".css",
                ".js",
                ".json",
            ):
                if not tgt.suffix:
                    pass
                else:
                    continue
            if not tgt.is_file():
                # might be SPA fragment; only count obvious missing html/json
                if tgt.suffix.lower() in (".html", ".htm", ".json"):
                    broken.append(href.split("/")[-1][:80])

        bstr = str(len(broken)) if broken else "0"
        notes = ""
        if not title:
            notes = "EMPTY_TITLE"
        if h1c == 0 and "sidebar" not in rel.lower() and "component" not in rel.lower():
            notes = (notes + ";NO_H1").strip(";")
        if h1c > 1:
            notes = (notes + ";MULTI_H1").strip(";")
        if broken:
            notes = (notes + ";BROKEN_LINKS").strip(";")
            for b in broken[:15]:
                broken_by_file.append((rel.replace("\\", "/"), b, ""))

        rows.append(
            {
                "path": rel.replace("\\", "/"),
                "module": mod,
                "exists": "1",
                "size": str(sz),
                "title": title[:200],
                "charset_meta": cs,
                "h1_count": str(h1c),
                "suspicious": "|".join(susp),
                "broken_internal_links": bstr,
                "notes": notes,
            }
        )

    # reports dir
    report_dir = REPO_ROOT / "docs" / "reports"
    report_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    csv_path = report_dir / f"site_full_audit_{ts}.csv"
    md_path = report_dir / "SITE_FULL_AUDIT_LATEST.md"

    fieldnames = list(rows[0].keys()) if rows else []
    with csv_path.open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)

    # duplicate titles
    dup_titles = {t: ps for t, ps in title_counts.items() if len(ps) > 1 and t}

    missing = [r for r in rows if r.get("notes") == "FILE_MISSING"]
    empty_title = [r for r in rows if "EMPTY_TITLE" in r.get("notes", "")]
    broken_rows = [r for r in rows if r.get("broken_internal_links") not in ("", "0")]
    susp_rows = [r for r in rows if r.get("suspicious")]

    # Module aggregates
    by_mod = defaultdict(
        lambda: {"n": 0, "missing": 0, "empty_title": 0, "broken": 0, "susp": 0}
    )
    for r in rows:
        m = r["module"]
        by_mod[m]["n"] += 1
        if r["notes"] == "FILE_MISSING":
            by_mod[m]["missing"] += 1
        if "EMPTY_TITLE" in r.get("notes", ""):
            by_mod[m]["empty_title"] += 1
        if r.get("broken_internal_links") not in ("", "0"):
            by_mod[m]["broken"] += 1
        if r.get("suspicious"):
            by_mod[m]["susp"] += 1

    lines = []
    lines.append("# 全站 HTML 自動盤點報告（排除 languages/）\n")
    lines.append(f"- **產生時間（UTC）**: {ts}\n")
    lines.append(f"- **盤點筆數**: {len(rows)}（清單來源: `_inventory_html_exclude_languages.txt`）\n")
    lines.append(f"- **機器可讀 CSV**: `{csv_path.relative_to(REPO_ROOT).as_posix()}`\n")
    lines.append("\n## 摘要\n\n")
    lines.append(f"| 指標 | 數量 |\n|------|------|\n")
    lines.append(f"| 清單路徑 | {len(rows)} |\n")
    lines.append(f"| 檔案不存在（清單與碟不一致） | {len(missing)} |\n")
    lines.append(f"| 空 &lt;title&gt; | {len(empty_title)} |\n")
    lines.append(f"| 偵測到站內可能失效連結（html/htm/json） | {len(broken_rows)} 個檔案 |\n")
    lines.append(f"| 檔名／路徑疑似測試或暫存 | {len(susp_rows)} |\n")
    lines.append(f"| 重複 &lt;title&gt;（完全相同字串） | {len(dup_titles)} 組 |\n")
    lines.append("\n## 按模組統計（抽樣目視優先：missing／empty_title／broken 高者）\n\n")
    lines.append("| 模組 | 頁數 | 缺檔 | 空title | 疑似壞連結檔數 | 疑似測試名 |\n")
    lines.append("|------|------|------|---------|---------------|------------|\n")
    for m in sorted(by_mod.keys(), key=lambda x: (-by_mod[x]["missing"], -by_mod[x]["broken"], x)):
        s = by_mod[m]
        lines.append(
            f"| {m} | {s['n']} | {s['missing']} | {s['empty_title']} | {s['broken']} | {s['susp']} |\n"
        )

    lines.append("\n## 清單與實際檔案不一致（應修清單或補檔）\n\n")
    if missing:
        for r in missing[:80]:
            lines.append(f"- `{r['path']}`\n")
        if len(missing) > 80:
            lines.append(f"\n… 其餘 {len(missing) - 80} 筆見 CSV `notes=FILE_MISSING`\n")
    else:
        lines.append("*無*\n")

    lines.append("\n## 重複 title（節錄最多 25 組）\n\n")
    for i, (t, ps) in enumerate(sorted(dup_titles.items(), key=lambda x: -len(x[1]))):
        if i >= 25:
            break
        lines.append(f"- **{t[:120]}** — {len(ps)} 頁，例如: `{ps[0]}` …\n")

    lines.append("\n## 模組抽樣目視建議（每模組至少打開）\n\n")
    lines.append("優先順序：儀表板 `dashboard.html`、側欄 `sidebar.html`、本表 **broken** 或 **empty_title** 最高之前 3 筆內容頁。\n\n")
    for m in sorted(by_mod.keys()):
        mod_files = [r["path"] for r in rows if r["module"] == m and r["exists"] == "1"]
        dash = [p for p in mod_files if p.endswith("dashboard.html")]
        side = [p for p in mod_files if "sidebar" in p.lower()]
        pri = [
            r["path"]
            for r in rows
            if r["module"] == m
            and r["exists"] == "1"
            and (r.get("broken_internal_links") not in ("", "0") or "EMPTY_TITLE" in r.get("notes", ""))
        ][:5]
        lines.append(f"### `{m}/`\n")
        if dash:
            lines.append(f"- **Dashboard**: `{dash[0]}`\n")
        if side:
            lines.append(f"- **Sidebar**: `{side[0]}`\n")
        if pri:
            lines.append("- **盤點優先內容頁**:\n")
            for p in pri:
                lines.append(f"  - `{p}`\n")
        if not dash and not side and mod_files:
            lines.append(f"- **任選一頁**: `{mod_files[0]}`\n")

    lines.append(
        "\n---\n\n*連結檢查僅解析相對路徑之 .html/.htm/.json；動態或根路徑誤判可能發生，需人眼複核。*\n"
    )

    md_path.write_text("".join(lines), encoding="utf-8")

    # Symlink-like: also write without timestamp pointer in README one-liner
    import shutil

    latest_csv = report_dir / "site_full_audit_latest.csv"
    shutil.copy2(csv_path, latest_csv)

    print(f"Wrote {csv_path}")
    print(f"Wrote {md_path}")
    print(f"Summary: missing={len(missing)} empty_title={len(empty_title)} broken_link_files={len(broken_rows)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
