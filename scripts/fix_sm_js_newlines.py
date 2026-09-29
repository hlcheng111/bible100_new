#!/usr/bin/env python3
"""Fix smart_ministry JS files saved with literal \\n instead of newlines."""
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
FILES = [
    REPO / "smart_ministry" / "js" / "matching_algorithm.js",
    REPO / "smart_ministry" / "js" / "database.js",
]

def main() -> int:
    for p in FILES:
        if not p.is_file():
            print("SKIP missing", p)
            continue
        t = p.read_text(encoding="utf-8")
        if t.count("\n") < 5 and "\\n" in t:
            t2 = t.replace("\\r\\n", "\n").replace("\\n", "\n").replace("\\t", "\t")
            p.write_text(t2, encoding="utf-8")
            print("FIXED", p.name, "->", t2.count("\n") + 1, "lines")
        else:
            print("OK", p.name)
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
