#!/usr/bin/env python3
"""Expand golden_verses_100.json to 100 verses + 8 theme groups."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "shell" / "data"
BOOKS = json.loads((DATA / "books.json").read_text(encoding="utf-8"))["books"]
BOOK_BY_ID = {b["id"]: b for b in BOOKS}

THEME_GROUPS = [
    {"id": "creation", "nameZh": "創造與開始", "nameEn": "Creation", "emoji": "🌍", "color": "#4ecdc4"},
    {"id": "covenant", "nameZh": "律法與約", "nameEn": "Law & Covenant", "emoji": "📜", "color": "#818cf8"},
    {"id": "worship", "nameZh": "詩歌與敬拜", "nameEn": "Psalms & Worship", "emoji": "🎵", "color": "#f472b6"},
    {"id": "wisdom", "nameZh": "智慧與人生", "nameEn": "Wisdom", "emoji": "💡", "color": "#fbbf24"},
    {"id": "prophets", "nameZh": "先知與盼望", "nameEn": "Prophets", "emoji": "🔥", "color": "#f97316"},
    {"id": "jesus", "nameZh": "耶穌與福音", "nameEn": "Jesus & Gospel", "emoji": "✝️", "color": "#ef4444"},
    {"id": "church", "nameZh": "教會與生命", "nameEn": "Church & Life", "emoji": "⛪", "color": "#6366f1"},
    {"id": "promises", "nameZh": "應許與平安", "nameEn": "Promises", "emoji": "💚", "color": "#34d399"},
]

# (bookId, chapter, verse, tagZh, tagEn, groupId) — fills toward 100 iconic verses
EXTRA = [
    (3, 19, 18, "要圣洁", "Be holy", "covenant"),
    (4, 6, 24, "祭司祝福", "Priestly blessing", "covenant"),
    (5, 6, 5, "尽心爱神", "Love the Lord", "covenant"),
    (7, 1, 9, "我必与你同", "I will be with you", "covenant"),
    (8, 1, 16, "你的神是我神", "Your God my God", "creation"),
    (10, 7, 12, "神看内心", "God looks at heart", "creation"),
    (11, 3, 16, "智慧首要", "Wisdom first", "wisdom"),
    (12, 6, 16, "我当行何事", "What shall I do", "prophets"),
    (13, 16, 11, "你当寻求", "Seek the Lord", "worship"),
    (14, 7, 14, "若我的民", "If my people", "prophets"),
    (15, 4, 14, "因你助我", "You help me", "worship"),
    (16, 8, 6, "耶和华为战", "The Lord fights", "covenant"),
    (17, 19, 16, "我知所信", "I know whom I trust", "promises"),
    (18, 46, 1, "神是避难所", "God our refuge", "promises"),
    (19, 91, 1, "住隐密处", "Secret place", "promises"),
    (19, 119, 105, "你的话", "Your word", "worship"),
    (20, 3, 5, "倚靠耶和华", "Trust in the Lord", "wisdom"),
    (21, 3, 1, "凡事都有期", "A time for everything", "wisdom"),
    (22, 53, 6, "我们都如羊", "All we like sheep", "prophets"),
    (23, 40, 31, "但等候耶和华", "Wait for the Lord", "prophets"),
    (24, 29, 11, "我知道我向", "Plans for you", "promises"),
    (25, 3, 22, "因他的慈", "Because of mercy", "prophets"),
    (26, 36, 26, "赐新心", "New heart", "prophets"),
    (27, 3, 16, "知道所信", "Know whom I believe", "promises"),
    (28, 6, 8, "行公义", "Do justly", "prophets"),
    (29, 2, 28, "必赐下灵", "Pour out Spirit", "prophets"),
    (30, 3, 17, "你施恩", "You show grace", "worship"),
    (31, 3, 16, "神爱世人", "God so loved", "jesus"),
    (32, 2, 13, "投深水中", "Deep waters", "prophets"),
    (33, 3, 17, "你的神", "The Lord your God", "covenant"),
    (34, 3, 17, "以赛亚", "The Lord is King", "prophets"),
    (35, 3, 17, "耶和华", "The Lord in midst", "prophets"),
    (36, 3, 17, "耶和华", "The Lord is good", "prophets"),
    (37, 4, 6, "万民归我", "Many peoples", "prophets"),
    (38, 9, 9, "王来到", "King comes", "jesus"),
    (39, 3, 10, "万军之耶和华", "Lord of hosts", "worship"),
    (41, 10, 45, "服事人", "Serve others", "jesus"),
    (42, 2, 14, "好信息", "Good news", "jesus"),
    (44, 1, 8, "圣灵能力", "Power of Spirit", "church"),
    (47, 5, 17, "若人在基督", "In Christ new", "church"),
    (48, 2, 20, "不再是我", "Not I but Christ", "church"),
    (52, 4, 13, "靠主得力", "Strength in Christ", "promises"),
    (53, 4, 13, "靠那加力", "Through Christ", "promises"),
    (54, 4, 12, "当竭力", "Fight the fight", "church"),
    (55, 1, 7, "神赐平安", "God of peace", "promises"),
    (56, 2, 8, "恩上加恩", "Grace upon grace", "jesus"),
    (57, 1, 24, "保守你", "Keep you", "promises"),
    (60, 1, 3, "活盼望", "Living hope", "promises"),
    (61, 3, 9, "主看为迟", "Not slow", "promises"),
    (62, 4, 8, "神就是爱", "God is love", "church"),
    (63, 1, 9, "神爱我们", "God loved us", "church"),
    (64, 1, 4, "爱在完美", "Love perfected", "church"),
    (65, 1, 25, "能保守", "Able to keep", "promises"),
    (66, 21, 4, "将一切都新", "All things new", "promises"),
    (1, 15, 6, "信而算义", "Believed God", "creation"),
    (2, 15, 13, "出埃及", "Redemption", "covenant"),
    (6, 24, 15, "今日选谁", "Choose today", "covenant"),
    (9, 16, 7, "别随世界", "Not like world", "wisdom"),
    (19, 27, 1, "耶和华是我的", "The Lord is my light", "worship"),
    (19, 37, 4, "以耶和华为乐", "Delight in Lord", "worship"),
    (40, 11, 28, "到我这里", "Come to me", "jesus"),
    (43, 14, 6, "道路真理", "Way truth life", "jesus"),
    (43, 15, 5, "我是葡萄树", "I am the vine", "jesus"),
    (45, 8, 28, "万事互相", "All things work", "promises"),
    (46, 15, 58, "务要坚固", "Stand firm", "church"),
    (49, 2, 8, "本乎恩", "By grace", "church"),
    (50, 4, 13, "靠主", "Through Christ", "promises"),
    (58, 12, 1, "脱缠累", "Run the race", "church"),
    (59, 4, 8, "亲近神", "Draw near", "church"),
    (1, 28, 15, "与神同在", "God with you", "promises"),
    (23, 9, 6, "有一婴孩", "Unto us a child", "jesus"),
    (33, 3, 16, "以马内利", "God with us", "jesus"),
    (40, 6, 33, "先求国", "Seek first kingdom", "jesus"),
    (43, 3, 16, "神爱世人", "God so loved", "jesus"),
    (45, 12, 1, "将身体献上", "Living sacrifice", "church"),
    (46, 13, 4, "爱是恒久", "Love is patient", "church"),
    (50, 4, 6, "不要忧虑", "Do not worry", "promises"),
    (19, 46, 1, "神是帮助", "God is help", "promises"),
    (19, 121, 1, "向山举目", "Lift eyes hills", "promises"),
    (19, 139, 14, "我要称谢", "Fearfully made", "worship"),
    (20, 16, 3, "心中所念", "Commit works", "wisdom"),
    (24, 33, 3, "呼求名", "Call upon name", "worship"),
    (32, 4, 2, "向海投网", "Cast into sea", "prophets"),
    (38, 13, 1, "刺他", "Pierced for us", "jesus"),
    (44, 2, 38, "当悔改", "Repent", "church"),
    (45, 5, 1, "因信称义", "Justified by faith", "church"),
    (48, 5, 22, "圣灵果子", "Fruit of Spirit", "church"),
    (49, 6, 10, "靠能力", "Power at work", "church"),
    (52, 1, 5, "主的日子", "Day of the Lord", "promises"),
    (60, 2, 9, "你们是族", "Royal priesthood", "church"),
    (61, 1, 3, "一切所需", "All things needed", "promises"),
    (66, 3, 20, "站在门外", "Stand at door", "promises"),
    (66, 22, 17, "圣灵与 bride", "Spirit and bride", "promises"),
    (19, 1, 1, "有福的人", "Blessed man", "worship"),
    (19, 100, 1, "向耶和華", "Make a joyful", "worship"),
    (19, 103, 1, "称颂神", "Bless the Lord", "worship"),
    (20, 1, 7, "敬畏耶和华", "Fear of Lord", "wisdom"),
    (20, 22, 6, "训练孩童", "Train child", "wisdom"),
    (21, 12, 13, "敬畏神", "Fear God", "wisdom"),
    (25, 3, 23, "全新每晨", "New every morning", "promises"),
    (26, 37, 26, "新心新灵", "New heart spirit", "prophets"),
    (28, 6, 8, "行公义", "Do justice", "prophets"),
    (34, 1, 17, "救恩", "Salvation", "prophets"),
    (35, 3, 17, "耶和华", "Lord in midst", "prophets"),
    (36, 3, 17, "耶和华", "Lord is good", "prophets"),
    (37, 2, 4, "末后殿", "Later house", "prophets"),
    (38, 4, 6, "不是倚靠", "Not by might", "prophets"),
    (39, 3, 10, "万军之", "Lord of hosts", "worship"),
    (40, 5, 9, "使人和好", "Peacemakers", "jesus"),
    (41, 16, 15, "传福音", "Preach gospel", "jesus"),
    (42, 15, 7, "找着", "Found the lost", "jesus"),
    (47, 4, 18, "不丧胆", "Not lose heart", "church"),
    (48, 6, 9, "不要疲倦", "Do not grow weary", "church"),
    (52, 5, 16, "常常喜乐", "Rejoice always", "church"),
    (53, 2, 13, "安慰劝勉", "Encourage one another", "church"),
    (54, 6, 12, "打那好仗", "Fight good fight", "church"),
    (55, 4, 7, "赐平安", "God of peace", "promises"),
    (56, 13, 8, "耶稣 Christ", "Jesus Christ same", "jesus"),
    (57, 1, 24, "保守你", "Keep you faultless", "promises"),
    (60, 5, 7, "交托", "Cast anxiety", "promises"),
    (61, 5, 7, "彼此相爱", "Love one another", "church"),
    (62, 3, 1, "看何等的", "See what love", "church"),
    (63, 4, 19, "都属爱", "We love because", "church"),
    (64, 4, 18, "爱里没有", "No fear in love", "church"),
    (65, 1, 25, "能保守", "Keep from falling", "promises"),
    (66, 1, 3, "念那书", "Read aloud", "promises"),
]

GROUP_BY_BOOK = {
    **{i: "creation" for i in range(1, 6)},
    **{i: "covenant" for i in range(6, 18)},
    **{i: "worship" for i in [19]},
    **{i: "wisdom" for i in [20, 21, 22]},
    **{i: "prophets" for i in range(23, 40)},
    **{i: "jesus" for i in range(40, 44)},
    **{i: "church" for i in range(44, 66)},
    66: "promises",
}


def ref_short(book_id: int, ch: int, v: int) -> tuple[str, str]:
    b = BOOK_BY_ID[book_id]
    zh = re.sub(r"記$", "", b["nameZh"][:2]) if len(b["nameZh"]) > 2 else b["nameZh"][:2]
    ref_zh = f"{zh} {ch}:{v}"
    ref_en = f"{b['nameEn'][:3]} {ch}:{v}"
    ref_vi = f"{b.get('nameVi', b['nameEn'])} {ch}:{v}"
    ref_id = f"{b.get('nameId', b['nameEn'])} {ch}:{v}"
    return ref_zh, ref_en, ref_vi, ref_id


def verse_key(v: dict) -> tuple:
    return (v["bookId"], v["chapter"], v["verse"])


def assign_group(v: dict) -> str:
    if v.get("groupId"):
        return v["groupId"]
    return GROUP_BY_BOOK.get(v["bookId"], "promises")


def main():
    path = DATA / "golden_verses_100.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    existing = data.get("verses", [])
    seen = {verse_key(v) for v in existing}
    next_id = len(existing) + 1

    for book_id, ch, v, tag_zh, tag_en, group_id in EXTRA:
        if len(existing) >= 100:
            break
        key = (book_id, ch, v)
        if key in seen:
            continue
        ref_zh, ref_en, ref_vi, ref_id = ref_short(book_id, ch, v)
        existing.append({
            "id": f"gv{next_id:02d}",
            "bookId": book_id,
            "chapter": ch,
            "verse": v,
            "refZh": ref_zh,
            "refEn": ref_en,
            "tagZh": tag_zh,
            "tagEn": tag_en,
            "refVi": ref_vi,
            "refId": ref_id,
            "tagVi": tag_zh,
            "tagId": tag_en,
            "groupId": group_id,
        })
        seen.add(key)
        next_id += 1

    for v in existing:
        v["groupId"] = assign_group(v)

    group_ids = {g["id"] for g in THEME_GROUPS}
    for g in THEME_GROUPS:
        g["verseIds"] = [v["id"] for v in existing if v.get("groupId") in group_ids and v["groupId"] == g["id"]]

    out = {
        "version": "2.0",
        "schema": "golden_verses",
        "nameZh": "100 金句選",
        "nameEn": "100 Golden Verses",
        "nameVi": "100 câu vàng",
        "nameId": "100 ayat emas",
        "targetCount": 100,
        "themeGroups": THEME_GROUPS,
        "verses": existing[:100],
    }
    path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {path} ({len(out['verses'])} verses, {len(THEME_GROUPS)} groups)")


if __name__ == "__main__":
    main()
