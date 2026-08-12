#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
掃描雲端部署：比對本機檔案與遠端 HTTP 是否 200。

用法：
  python scripts/check_cloud_deploy.py
  python scripts/check_cloud_deploy.py --url https://bible100.lovestoblog.com
  python scripts/check_cloud_deploy.py --tier p0_shell_boot
  python scripts/check_cloud_deploy.py --list-tier p0_shell_boot
  python scripts/check_cloud_deploy.py --estimate-size
  python scripts/check_cloud_deploy.py --report docs/deployment/cloud_check_latest.md

依賴：標準庫 only（urllib）。
"""
from __future__ import annotations

import argparse
import fnmatch
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Iterable

REPO = Path(__file__).resolve().parent.parent
TIERS_PATH = REPO / "config" / "cloud_deploy_tiers.json"
INDEX_V5 = REPO / "index_v5.html"
DEFAULT_URL = "https://bible100.lovestoblog.com"

SCRIPT_SRC_RE = re.compile(
    r'<script[^>]+src=["\']([^"\']+)["\']',
    re.IGNORECASE,
)
LINK_HREF_RE = re.compile(
    r'<link[^>]+href=["\']([^"\']+)["\']',
    re.IGNORECASE,
)


def load_tiers() -> dict:
    with TIERS_PATH.open(encoding="utf-8") as f:
        return json.load(f)


def is_remote_url(path: str) -> bool:
    p = path.strip().lower()
    return p.startswith("http://") or p.startswith("https://") or p.startswith("//")


def normalize_path(path: str) -> str:
    return path.replace("\\", "/").lstrip("/")


def parse_index_v5_assets() -> list[str]:
    if not INDEX_V5.is_file():
        return []
    text = INDEX_V5.read_text(encoding="utf-8", errors="replace")
    out: list[str] = []
    for pattern in (SCRIPT_SRC_RE, LINK_HREF_RE):
        for m in pattern.finditer(text):
            src = m.group(1).strip()
            if not src or src.startswith("data:") or is_remote_url(src):
                continue
            out.append(normalize_path(src.split("?")[0].split("#")[0]))
    return sorted(set(out))


def expand_globs(patterns: Iterable[str]) -> list[str]:
    found: list[str] = []
    for pat in patterns:
        pat = normalize_path(pat)
        if "*" not in pat:
            found.append(pat)
            continue
        # languages/cn/**/*.html → walk with fnmatch
        base = pat.split("*", 1)[0].rstrip("/")
        suffix = pat[pat.index("*") :]
        root = REPO / base if base else REPO
        if not root.is_dir():
            continue
        for dp, _, files in os.walk(root):
            rel_dir = Path(dp).relative_to(REPO).as_posix()
            for name in files:
                rel = f"{rel_dir}/{name}" if rel_dir != "." else name
                if fnmatch.fnmatch(rel.replace("\\", "/"), pat):
                    found.append(rel.replace("\\", "/"))
    return sorted(set(found))


def files_for_tier(tiers_doc: dict, tier_id: str | None) -> tuple[list[str], str]:
    tiers = tiers_doc.get("tiers", {})
    if tier_id:
        if tier_id not in tiers:
            raise SystemExit(f"未知 tier: {tier_id}（可用: {', '.join(tiers)}）")
        selected = {tier_id: tiers[tier_id]}
    else:
        selected = tiers

    paths: list[str] = []
    labels: list[str] = []
    for tid, spec in selected.items():
        labels.append(tid)
        for f in spec.get("files", []):
            paths.append(normalize_path(f))
        for g in spec.get("optional_globs", []):
            paths.extend(expand_globs([g]))
        for d in spec.get("directories", []):
            exclude = {e.lower() for e in spec.get("exclude_extensions", [])}
            root = REPO / d
            if not root.is_dir():
                continue
            for dp, dirnames, filenames in os.walk(root):
                dirnames[:] = [
                    x
                    for x in dirnames
                    if x not in {".git", "node_modules", "_archive", "backups"}
                ]
                for name in filenames:
                    ext = os.path.splitext(name)[1].lower()
                    if ext in exclude:
                        continue
                    rel = Path(dp, name).relative_to(REPO).as_posix()
                    paths.append(rel)

    # P0：合併 index_v5 直接引用的腳本
    if tier_id in (None, "p0_shell_boot"):
        paths.extend(parse_index_v5_assets())

    return sorted(set(paths)), ", ".join(labels)


def local_exists(rel: str) -> bool:
    return (REPO / rel).is_file()


def local_size(rel: str) -> int:
    p = REPO / rel
    return p.stat().st_size if p.is_file() else 0


def estimate_tier_sizes(tiers_doc: dict) -> None:
    print("本機 tier 體積估算（僅統計檔案存在者）：\n")
    for tid in tiers_doc.get("tiers", {}):
        files, _ = files_for_tier(tiers_doc, tid)
        total = 0
        n = 0
        for f in files:
            if local_exists(f):
                total += local_size(f)
                n += 1
        label = tiers_doc["tiers"][tid].get("label", tid)
        print(f"  {tid:22}  {total / 1024 / 1024:8.1f} MB  ({n} files)  {label}")
    print()


def http_check(url: str, timeout: float) -> tuple[int | None, str]:
    req = urllib.request.Request(
        url,
        method="HEAD",
        headers={"User-Agent": "Bible100-CloudDeployCheck/1.0"},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status, resp.geturl()
    except urllib.error.HTTPError as e:
        return e.code, str(e.reason)
    except Exception as e:  # noqa: BLE001
        return None, str(e)


def check_remote(
    base_url: str,
    files: list[str],
    timeout: float,
    workers: int,
) -> list[dict]:
    base = base_url.rstrip("/")

    def one(rel: str) -> dict:
        url = f"{base}/{rel}"
        status, detail = http_check(url, timeout)
        return {
            "path": rel,
            "url": url,
            "status": status,
            "detail": detail,
            "local": local_exists(rel),
            "local_bytes": local_size(rel) if local_exists(rel) else 0,
        }

    results: list[dict] = []
    w = max(1, min(workers, 16))
    with ThreadPoolExecutor(max_workers=w) as pool:
        futures = {pool.submit(one, rel): rel for rel in files}
        for fut in as_completed(futures):
            results.append(fut.result())
    results.sort(key=lambda r: r["path"])
    return results


def print_results(results: list[dict], show_ok: bool) -> int:
    missing_remote = [r for r in results if r["status"] != 200]
    missing_local = [r for r in results if not r["local"]]

    print(f"檢查 {len(results)} 個路徑\n")
    if missing_remote:
        print(f"=== 雲端缺失或非 200（{len(missing_remote)}）===\n")
        for r in missing_remote:
            loc = "本機有" if r["local"] else "本機無"
            print(f"  [{r['status']}] {r['path']}  ({loc})")
        print()
    else:
        print("雲端：所列檔案皆 HTTP 200\n")

    if missing_local:
        print(f"=== 本機不存在（{len(missing_local)}）===\n")
        for r in missing_local:
            print(f"  {r['path']}")
        print()

    if show_ok:
        print("=== 雲端 OK ===\n")
        for r in results:
            if r["status"] == 200:
                print(f"  200  {r['path']}")

    return len(missing_remote)


def write_report(path: Path, base_url: str, tier_label: str, results: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    missing = [r for r in results if r["status"] != 200]
    lines = [
        "# 雲端部署檢查報告",
        "",
        f"- 時間：{time.strftime('%Y-%m-%d %H:%M:%S')}",
        f"- URL：`{base_url}`",
        f"- Tier：`{tier_label}`",
        f"- 檢查數：{len(results)}",
        f"- 雲端問題：{len(missing)}",
        "",
    ]
    if missing:
        lines.append("## 雲端缺失（需上傳）\n")
        lines.append("| 狀態 | 路徑 | 本機 |")
        lines.append("|------|------|------|")
        for r in missing:
            loc = "有" if r["local"] else "無"
            lines.append(f"| {r['status']} | `{r['path']}` | {loc} |")
        lines.append("")
    else:
        lines.append("全部通過 HTTP 200。\n")
    path.write_text("\n".join(lines), encoding="utf-8")
    print(f"報告已寫入：{path}")


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    parser = argparse.ArgumentParser(description="Bible100 雲端部署檔案檢查")
    parser.add_argument("--url", default=DEFAULT_URL, help="雲端站點根 URL")
    parser.add_argument("--tier", default="p0_shell_boot", help="tier id；用 all 檢查全部 tier")
    parser.add_argument("--list-tier", metavar="TIER", help="列出 tier 內檔案路徑後結束")
    parser.add_argument("--estimate-size", action="store_true", help="估算各 tier 本機體積")
    parser.add_argument("--timeout", type=float, default=15.0)
    parser.add_argument("--workers", type=int, default=8, help="並行 HTTP 檢查數")
    parser.add_argument("--show-ok", action="store_true", help="也列出 200 的檔案")
    parser.add_argument("--report", metavar="PATH", help="寫入 Markdown 報告")
    args = parser.parse_args()

    tiers_doc = load_tiers()
    if args.estimate_size:
        estimate_tier_sizes(tiers_doc)
        return 0

    tier_arg = None if args.tier == "all" else args.tier
    if args.list_tier:
        files, _ = files_for_tier(tiers_doc, args.list_tier)
        for f in files:
            print(f)
        return 0

    files, tier_label = files_for_tier(tiers_doc, tier_arg)
    if not files:
        print("無檔案可檢查")
        return 1

    print(f"Base URL: {args.url}")
    print(f"Tier: {tier_label} ({len(files)} paths)\n")

    results = check_remote(args.url, files, args.timeout, args.workers)
    fail = print_results(results, args.show_ok)

    if args.report:
        write_report(Path(args.report), args.url, tier_label, results)

    return 1 if fail else 0


if __name__ == "__main__":
    raise SystemExit(main())
