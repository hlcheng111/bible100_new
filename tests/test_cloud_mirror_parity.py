"""Static checks: cloud mirror (bible100_new_2) parity with canonical repo."""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MIRROR = Path(os.environ.get("B100_CLOUD_MIRROR", r"C:\Users\hlche\.cursor\bible100_new_2"))

CRITICAL = [
    "index.html",
    "index_v5.html",
    "js/config-embedded.js",
    "config/modes.json",
    "church_ministry/sidebar_church_layout_v1.html",
    "ai_tools/_landing/home.html",
    "languages/vi/OT/chapters/chapter1.html",
    "languages/id/OT/chapters/chapter1.html",
    "languages/landP_kh.html",
    "languages/kh/OT/chapters/kh_OT_chapter01.html",
    "hymn_management/hymn/.htaccess",
    "qna/index.html",
]

STALE_IN_MIRROR = [
    "qna/qna_index_4layer.htm",
    "qna/qna_index_4layer_cloud.htm",
    "smart_ministry/ai_smart_ministry_overview.html",
]


def _sig(path: Path) -> tuple[int, int] | None:
    if not path.is_file():
        return None
    st = path.stat()
    return st.st_size, int(st.st_mtime)


def test_cloud_mirror_parity() -> None:
    mirror = DEFAULT_MIRROR
    if not mirror.is_dir():
        print(f"SKIP: mirror not found: {mirror}")
        return

    failures: list[str] = []
    for rel in CRITICAL:
        src = ROOT / rel.replace("/", os.sep)
        dst = mirror / rel.replace("/", os.sep)
        ss, ds = _sig(src), _sig(dst)
        if ss is None:
            failures.append(f"missing source: {rel}")
            continue
        if ds is None:
            failures.append(f"missing mirror: {rel}")
            continue
        if ss[0] != ds[0]:
            failures.append(f"size mismatch: {rel} ({ss[0]} vs {ds[0]})")

    for rel in STALE_IN_MIRROR:
        if (mirror / rel.replace("/", os.sep)).is_file():
            failures.append(f"stale file in mirror (remove): {rel}")

    manifest = mirror / ".cloud_mirror_sync.json"
    if manifest.is_file():
        data = json.loads(manifest.read_text(encoding="utf-8-sig"))
        assert data.get("source_root"), "manifest missing source_root"

    if failures:
        raise AssertionError("Cloud mirror parity failed:\n" + "\n".join(failures))


if __name__ == "__main__":
    try:
        test_cloud_mirror_parity()
        print("PASS: cloud mirror parity")
    except AssertionError as e:
        print(e, file=sys.stderr)
        sys.exit(1)
