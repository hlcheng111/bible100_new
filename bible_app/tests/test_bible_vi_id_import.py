#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Smoke test: vi_1934 / id_ayt in bible_reader.db match known verses."""
import json
import sqlite3
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB = ROOT / "app" / "assets" / "bible" / "bible_reader.db"
CLEAN = ROOT.parent / "data" / "bibles" / "clean"

GEN1_VI = "Ban đầu Đức Chúa Trời dựng nên trời đất."
JHN316_KJV_PREFIX = "For God so loved the world"


class TestBibleViId(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not DB.exists():
            raise unittest.SkipTest(f"missing {DB}")

    def _one(self, version, b, c, v):
        conn = sqlite3.connect(DB)
        row = conn.execute(
            "SELECT t FROM verses WHERE version=? AND b=? AND c=? AND v=?",
            (version, b, c, v),
        ).fetchone()
        conn.close()
        return row[0] if row else None

    def test_vi_gen1_1_matches_fhl(self):
        t = self._one("vi_1934", 1, 1, 1)
        self.assertEqual(t, GEN1_VI)

    def test_id_ayt_has_full_bible(self):
        conn = sqlite3.connect(DB)
        n = conn.execute(
            "SELECT COUNT(*) FROM verses WHERE version='id_ayt'"
        ).fetchone()[0]
        conn.close()
        self.assertGreaterEqual(n, 31000)

    def test_vi_has_full_bible(self):
        conn = sqlite3.connect(DB)
        n = conn.execute(
            "SELECT COUNT(*) FROM verses WHERE version='vi_1934'"
        ).fetchone()[0]
        conn.close()
        self.assertGreaterEqual(n, 31000)

    def test_books_json_has_vi_id_names(self):
        books_path = ROOT / "shell" / "data" / "books.json"
        data = json.loads(books_path.read_text(encoding="utf-8"))
        b1 = data["books"][0]
        self.assertIn("nameVi", b1)
        self.assertIn("nameId", b1)

    def test_clean_json_exists_if_fetched(self):
        vi = CLEAN / "越南聖經1934.json"
        if not vi.exists():
            self.skipTest("run fetch_helloao_bible.py first")
        raw = json.loads(vi.read_text(encoding="utf-8"))
        self.assertGreaterEqual(len(raw.get("data", [])), 31000)


if __name__ == "__main__":
    unittest.main()
