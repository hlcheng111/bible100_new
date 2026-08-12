#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Extract ALDA questions array from HTML into alda_questions.js (one-time / regen)."""
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
HTML = REPO / "church_planning" / "12 Apostles Leadership Assessment.html"
OUT = REPO / "church_planning" / "js" / "tool_packs" / "alda_questions.js"

text = HTML.read_text(encoding="utf-8")
start = text.index("const questions = [")
end = text.index("];", start) + 2
questions_block = text[start : end].replace("const questions = ", "var ALDA_QUESTIONS = ", 1)

header = """/**
 * ALDA 16 題情境迫選題庫（SSOT）
 * 由 scripts/extract_alda_questions.py 自 12 Apostles Leadership Assessment.html 產生。
 * 手改題目請同步 HTML 與本檔，或重新執行 extract 腳本。
 */
(function (global) {
  "use strict";
"""

footer = """
  global.ALDA_QUESTIONS = ALDA_QUESTIONS;
})(typeof window !== "undefined" ? window : global);
"""

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(header + questions_block + ";\n" + footer, encoding="utf-8")
print("Wrote", OUT, "bytes", OUT.stat().st_size)
