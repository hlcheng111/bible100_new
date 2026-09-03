#!/usr/bin/env python3
"""Generate one_year_plan.json and three_year_plan.json for Bible Track."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "shell" / "data"
BOOKS = [
    (1, 50), (2, 40), (3, 27), (4, 36), (5, 34), (6, 24), (7, 21), (8, 4), (9, 31), (10, 24),
    (11, 22), (12, 25), (13, 29), (14, 36), (15, 10), (16, 13), (17, 10), (18, 42), (19, 150),
    (20, 31), (21, 12), (22, 8), (23, 66), (24, 52), (25, 5), (26, 48), (27, 12), (28, 14),
    (29, 3), (30, 9), (31, 1), (32, 4), (33, 7), (34, 3), (35, 3), (36, 3), (37, 2), (38, 14),
    (39, 4), (40, 28), (41, 16), (42, 24), (43, 21), (44, 28), (45, 16), (46, 16), (47, 13),
    (48, 6), (49, 6), (50, 4), (51, 4), (52, 5), (53, 3), (54, 6), (55, 4), (56, 3), (57, 1),
    (58, 13), (59, 5), (60, 5), (61, 3), (62, 5), (63, 1), (64, 1), (65, 1), (66, 22),
]

CAT_ZH = {
    "law": "律法", "history": "历史", "poetry": "诗歌", "major_prophet": "大先知",
    "minor_prophet": "小先知", "gospel": "福音", "nt_history": "使徒", "paul": "保罗书信",
    "general": "普通书信", "prophecy": "启示",
}
CAT_EN = {
    "law": "Law", "history": "History", "poetry": "Poetry", "major_prophet": "Major Prophets",
    "minor_prophet": "Minor Prophets", "gospel": "Gospels", "nt_history": "Acts", "paul": "Paul",
    "general": "General Epistles", "prophecy": "Revelation",
}
SEG_COLORS = {
    "psalm": "#fbbf24", "ot": "#818cf8", "nt": "#34d399",
}


def ot_category(book_id: int) -> str:
    if book_id <= 5:
        return "law"
    if book_id <= 17:
        return "history"
    if book_id <= 22:
        return "poetry"
    if book_id <= 27:
        return "major_prophet"
    return "minor_prophet"


def nt_category(book_id: int) -> str:
    if book_id <= 43:
        return "gospel"
    if book_id == 44:
        return "nt_history"
    if book_id <= 57:
        return "paul"
    if book_id <= 65:
        return "general"
    return "prophecy"


def build_chapter_queues():
    ot, nt = [], []
    for book_id, chapters in BOOKS:
        for ch in range(1, chapters + 1):
            if book_id == 19:
                continue
            item = {"bookId": book_id, "chapter": ch, "category": ot_category(book_id) if book_id <= 39 else nt_category(book_id)}
            if book_id <= 39:
                ot.append(item)
            else:
                nt.append(item)
    return ot, nt


def chapters_for_day(total: int, day: int, num_days: int) -> int:
    start = (total * (day - 1)) // num_days
    end = (total * day) // num_days
    return max(0, end - start)


def milestone(day: int, total_days: int) -> dict | None:
    if day % 30 != 0:
        return None
    month = day // 30
    labels = [
        ("立約之路", "Covenant Road"),
        ("天國之路", "Kingdom Road"),
        ("重建之路", "Restoration Road"),
    ]
    zh, en = labels[(month - 1) % 3]
    return {"badgeZh": f"{zh} · 第{month}月", "badgeEn": f"{en} · Month {month}", "emoji": "🏆"}


def make_plan(schema: str, name_zh: str, name_en: str, total_days: int, track_id: str, prefix: str):
    ot_q, nt_q = build_chapter_queues()
    ot_i, nt_i = 0, 0
    days = []
    for day in range(1, total_days + 1):
        segments = [{
            "kind": "psalm",
            "bookId": 19,
            "chapter": ((day - 1) % 150) + 1,
            "category": "poetry",
            "labelZh": f"诗 {(day - 1) % 150 + 1}",
            "labelEn": f"Ps {(day - 1) % 150 + 1}",
        }]
        ot_n = chapters_for_day(len(ot_q), day, total_days)
        for _ in range(ot_n):
            if ot_i < len(ot_q):
                c = ot_q[ot_i]
                ot_i += 1
                cat = c["category"]
                segments.append({
                    "kind": "ot",
                    "bookId": c["bookId"],
                    "chapter": c["chapter"],
                    "category": cat,
                    "labelZh": CAT_ZH.get(cat, cat),
                    "labelEn": CAT_EN.get(cat, cat),
                })
        nt_n = chapters_for_day(len(nt_q), day, total_days)
        for _ in range(nt_n):
            if nt_i < len(nt_q):
                c = nt_q[nt_i]
                nt_i += 1
                cat = c["category"]
                segments.append({
                    "kind": "nt",
                    "bookId": c["bookId"],
                    "chapter": c["chapter"],
                    "category": cat,
                    "labelZh": CAT_ZH.get(cat, cat),
                    "labelEn": CAT_EN.get(cat, cat),
                })
        primary = segments[1] if len(segments) > 1 else segments[0]
        ms = milestone(day, total_days)
        days.append({
            "day": day,
            "month": (day - 1) // 30 + 1,
            "titleZh": f"第 {day} 天",
            "titleEn": f"Day {day}",
            "segments": segments,
            "bookId": primary["bookId"],
            "chapter": primary["chapter"],
            "milestone": ms,
        })
    return {
        "version": "1.0",
        "schema": schema,
        "trackId": track_id,
        "progressPrefix": prefix,
        "nameZh": name_zh,
        "nameEn": name_en,
        "totalDays": total_days,
        "rulesZh": "每日：诗篇 1 篇 + 旧约（五类轮流）+ 新约（五类轮流）。读完当日全部段落 → 点「读完打卡」→ +1 金星。",
        "rulesEn": "Daily: 1 Psalm + OT (5 categories) + NT (5 categories). Mark done when finished → +1 star.",
        "days": days,
    }


def make_one_year_books():
    """365-day canonical read-through (Bible.com Books of the Bible style)."""
    books_meta = json.loads((DATA / "books.json").read_text(encoding="utf-8"))["books"]
    by_id = {b["id"]: b for b in books_meta}
    all_chapters = []
    for book_id, chapters in BOOKS:
        for ch in range(1, chapters + 1):
            all_chapters.append({"bookId": book_id, "chapter": ch})
    total = len(all_chapters)
    days = []
    for day in range(1, 366):
        start = (total * (day - 1)) // 365
        end = (total * day) // 365
        day_chs = all_chapters[start:end]
        segments = []
        for c in day_chs:
            b = by_id.get(c["bookId"], {})
            bid = c["bookId"]
            cat = ot_category(bid) if bid <= 39 else nt_category(bid)
            segments.append({
                "kind": "reading",
                "bookId": bid,
                "chapter": c["chapter"],
                "category": cat,
                "testament": "OT" if bid <= 39 else "NT",
                "labelZh": CAT_ZH.get(cat, b.get("nameZh", "")),
                "labelEn": CAT_EN.get(cat, b.get("nameEn", "")),
            })
        primary = day_chs[0] if day_chs else all_chapters[0]
        b0 = by_id.get(primary["bookId"], {})
        title_zh = f"第 {day} 天 · {b0.get('nameZh', '')} {primary['chapter']}"
        title_en = f"Day {day} · {b0.get('nameEn', '')} {primary['chapter']}"
        ms = milestone(day, 365)
        days.append({
            "day": day,
            "month": (day - 1) // 30 + 1,
            "titleZh": title_zh,
            "titleEn": title_en,
            "segments": segments,
            "bookId": primary["bookId"],
            "chapter": primary["chapter"],
            "milestone": ms,
        })
    return {
        "version": "2.0",
        "schema": "one_year_books",
        "trackId": "plan1y",
        "progressPrefix": "1y:",
        "nameZh": "一年读完圣经",
        "nameEn": "Read the Bible in One Year",
        "totalDays": 365,
        "rulesZh": "按六十六卷顺序，365 天读完全本（参考 Bible.com Books of the Bible）。每天若干章，读完当日全部段落 → 点「读完打卡」→ +1 金星。",
        "rulesEn": "Canonical order through all 66 books in 365 days (cf. Bible.com plan 13630). Mark done when finished → +1 star.",
        "days": days,
    }


def main():
    DATA.mkdir(parents=True, exist_ok=True)
    one = make_one_year_books()
    three = make_plan("three_year_bible", "三年读完圣经", "Read the Bible in Three Years", 1095, "plan3y", "3y:")
    (DATA / "one_year_plan.json").write_text(json.dumps(one, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    (DATA / "three_year_plan.json").write_text(json.dumps(three, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {DATA / 'one_year_plan.json'} ({len(one['days'])} days)")
    print(f"Wrote {DATA / 'three_year_plan.json'} ({len(three['days'])} days)")


if __name__ == "__main__":
    main()
