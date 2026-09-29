#!/usr/bin/env python3
"""Build lectionary Year A/B/C with church seasons (Vanderbilt-style skeleton)."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "shell" / "data"
BOOKS = json.loads((DATA / "books.json").read_text(encoding="utf-8"))["books"]
BY_ID = {b["id"]: b for b in BOOKS}

SEASONS = [
    {"id": "advent", "nameZh": "將臨期", "nameEn": "Advent", "emoji": "🕯️", "months": [12, 1]},
    {"id": "christmas", "nameZh": "聖誕期", "nameEn": "Christmas", "emoji": "🎄", "months": [12, 1]},
    {"id": "epiphany", "nameZh": "顯現期", "nameEn": "Epiphany", "emoji": "⭐", "months": [1, 2]},
    {"id": "lent", "nameZh": "大齋期", "nameEn": "Lent", "emoji": "✝️", "months": [2, 3, 4]},
    {"id": "easter", "nameZh": "復活期", "nameEn": "Easter", "emoji": "🌅", "months": [3, 4, 5]},
    {"id": "pentecost", "nameZh": "五旬節", "nameEn": "Pentecost", "emoji": "🔥", "months": [5, 6]},
    {"id": "ordinary", "nameZh": "聖靈降臨後", "nameEn": "After Pentecost", "emoji": "🌿", "months": [6, 7, 8, 9, 10, 11]},
]

# Year A / B / C gospel emphasis (Matthew / Mark / Luke rotation simplified)
YEAR_GOSPELS = {"A": 40, "B": 41, "C": 42}

# Template readings per season (psalm, ot, gospel chapters) — expanded per week
SEASON_WEEKS = {
    "advent": [
        ((19, 80), (23, 2), (40, 24)),
        ((19, 85), (11, 1), (40, 3)),
        ((19, 126), (35, 1), (40, 11)),
        ((19, 89), (37, 2), (40, 1)),
    ],
    "christmas": [
        ((19, 96), (23, 9), (40, 1)),
        ((19, 98), (62, 1), (43, 1)),
    ],
    "epiphany": [
        ((19, 72), (60, 1), (40, 2)),
        ((19, 27), (49, 3), (40, 5)),
        ((19, 112), (58, 1), (40, 8)),
    ],
    "lent": [
        ((19, 51), (2, 20), (40, 4)),
        ((19, 32), (1, 12), (40, 6)),
        ((19, 130), (26, 36), (40, 21)),
        ((19, 22), (52, 13), (40, 27)),
        ((19, 31), (50, 4), (40, 26)),
    ],
    "easter": [
        ((19, 118), (24, 6), (43, 20)),
        ((19, 133), (45, 6), (43, 21)),
        ((19, 116), (44, 2), (43, 3)),
        ((19, 23), (46, 15), (43, 10)),
    ],
    "pentecost": [
        ((19, 104), (31, 31), (44, 2)),
        ((19, 8), (11, 4), (43, 15)),
    ],
    "ordinary": [
        ((19, 1), (1, 1), None),
        ((19, 19), (6, 1), None),
        ((19, 46), (9, 16), None),
        ((19, 89), (19, 23), None),
        ((19, 100), (20, 3), None),
        ((19, 23), (43, 1), None),
        ((19, 91), (50, 4), None),
        ((19, 121), (58, 11), None),
        ((19, 103), (59, 1), None),
        ((19, 150), (66, 21), None),
    ],
}


def seg(role: str, book_id: int, chapter: int) -> dict:
    b = BY_ID.get(book_id, {})
    label_zh = {"psalm": "詩篇", "ot": "舊約", "gospel": "福音"}.get(role, role)
    label_en = {"psalm": "Psalm", "ot": "OT", "gospel": "Gospel"}.get(role, role)
    return {
        "role": role,
        "kind": role,
        "bookId": book_id,
        "chapter": chapter,
        "labelZh": label_zh,
        "labelEn": label_en,
        "refZh": f"{b.get('nameZh', '')} {chapter}章",
        "refEn": f"{b.get('nameEn', '')} {chapter}",
    }


def build_year(year_id: str) -> dict:
    gospel_book = YEAR_GOSPELS[year_id]
    readings = []
    day_num = 0
    for si, season in enumerate(SEASONS):
        weeks = SEASON_WEEKS.get(season["id"], [])
        for wi, triple in enumerate(weeks):
            day_num += 1
            ps, ot, go = triple
            segments = [seg("psalm", ps[0], ps[1]), seg("ot", ot[0], ot[1])]
            if go:
                segments.append(seg("gospel", go[0], go[1]))
            else:
                segments.append(seg("gospel", gospel_book, min(wi + 1, 28)))
            month = season["months"][wi % len(season["months"])]
            readings.append({
                "day": day_num,
                "month": month,
                "seasonId": season["id"],
                "weekInSeason": wi + 1,
                "titleZh": f"{season['nameZh']} · 第{wi + 1}週",
                "titleEn": f"{season['nameEn']} · Week {wi + 1}",
                "segments": segments,
                "bookId": segments[-1]["bookId"],
                "chapter": segments[-1]["chapter"],
            })
    return {
        "id": year_id,
        "nameZh": {"A": "甲年", "B": "乙年", "C": "丙年"}[year_id],
        "nameEn": f"Year {year_id}",
        "gospelBookId": gospel_book,
        "totalDays": len(readings),
        "readings": readings,
    }


def main():
    out = {
        "version": "1.0",
        "schema": "lectionary_abc_v1",
        "trackId": "plan3y",
        "progressPrefix": "3y:",
        "nameZh": "三年教会年经课",
        "nameEn": "Three-Year Lectionary",
        "rulesZh": "① 选甲/乙/丙年 → ② 选教会节期 → ③ 点每日经课（诗+旧约+福音）→ 读完打卡",
        "rulesEn": "Pick Year A/B/C → season → daily readings → mark done",
        "seasons": SEASONS,
        "years": [build_year("A"), build_year("B"), build_year("C")],
    }
    path = DATA / "lectionary_plan.json"
    path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {path} (A={out['years'][0]['totalDays']} B={out['years'][1]['totalDays']} C={out['years'][2]['totalDays']} days/year)")


if __name__ == "__main__":
    main()
