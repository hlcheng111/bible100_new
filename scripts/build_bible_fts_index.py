#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""BS-W5：離線建置聖經 FTS 詞彙統計（可選；執行時亦可在 browser 建索引）。"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "bible_study" / "data" / "fts_manifest.json"

REG_PATH = ROOT / "bible_study" / "js" / "bible_version_registry.js"
TOKEN_RE = re.compile(r"[\u4e00-\u9fff]|[a-zA-Z]{2,}")


def parse_registry_keys() -> list[str]:
    text = REG_PATH.read_text(encoding="utf-8")
    return re.findall(r"key: '(\w+)'", text.split("bibles:")[1].split("],")[0])


def tokenize(text: str) -> set[str]:
    tokens: set[str] = set()
    for m in TOKEN_RE.finditer(text.lower()):
        tok = m.group(0)
        tokens.add(tok)
        if len(tok) >= 2 and all("\u4e00" <= c <= "\u9fff" for c in tok):
            for i in range(len(tok) - 1):
                tokens.add(tok[i : i + 2])
    return tokens


def load_rows(path: Path) -> list[dict]:
    raw = json.loads(path.read_text(encoding="utf-8-sig"))
    if isinstance(raw, list):
        return raw
    if isinstance(raw, dict):
        if isinstance(raw.get("Bible", {}).get("data"), list):
            return raw["Bible"]["data"]
        if isinstance(raw.get("data"), list):
            return raw["data"]
    return []


def resolve_json(version_key: str) -> Path | None:
    """Best-effort path from registry comment patterns."""
    candidates = [
        ROOT / "data" / "bibles" / "clean" / f"{version_key}.json",
        ROOT / "data" / "bibles" / "clean" / "KJV.json",
        ROOT / "data" / "bibles" / "clean" / "NIV.json",
        ROOT / "data" / "bibles" / "clean" / "信望爱(和合本).json",
        ROOT / "data" / "bibles" / "clean" / "和合本修訂版.json",
    ]
    key_map = {
        "faith": "信望爱(和合本).json",
        "cuv": "和合本修訂版.json",
        "cuvr": "和合本修訂版.json",
        "luzhen": "吕振中.json",
        "kjv": "KJV.json",
        "niv": "NIV.json",
        "vi1934": "越南聖經1934.json",
        "id_ayt": "印尼AYT.json",
    }
    name = key_map.get(version_key)
    if name:
        p = ROOT / "data" / "bibles" / "clean" / name
        if p.is_file():
            return p
    for p in candidates:
        if p.is_file():
            return p
    return None


def main() -> int:
    manifest = {"schemaVersion": 1, "updated": "2026-07-26", "versions": {}}
    keys = [k for k in parse_registry_keys() if k in ("faith", "cuv", "cuvr", "luzhen", "kjv", "niv", "vi1934", "id_ayt")]
    for key in keys:
        path = resolve_json(key)
        if not path:
            manifest["versions"][key] = {"status": "missing", "path": None, "verses": 0, "vocab": 0}
            continue
        rows = load_rows(path)
        vocab: set[str] = set()
        for row in rows[:50000]:
            text = (
                row.get("Scripture")
                or row.get("scripture")
                or row.get("Text")
                or row.get("text")
                or row.get("t")
                or ""
            )
            if text:
                vocab |= tokenize(str(text))
        manifest["versions"][key] = {
            "status": "ok",
            "path": str(path.relative_to(ROOT)).replace("\\", "/"),
            "verses": len(rows),
            "vocab": len(vocab),
        }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Wrote", OUT)
    return 0


if __name__ == "__main__":
    sys.exit(main())
