# -*- coding: utf-8 -*-
"""
Generate 500 demo people records for Bible100 People database.
Run: python scripts/generate_people_demo.py
Output: data/people.json
"""
import json
import random
from datetime import datetime, timedelta
from pathlib import Path

REGIONS = ["台北", "新北", "桃園", "台中", "台南", "高雄", "其他"]
GENDERS = ["男", "女"]
AGE_GROUPS = ["青年", "壯年", "長者"]
TAGS_POOL = ["學員", "OT100", "NT100", "敬拜團隊", "小組長", "志工", "探訪", "兒童事工", "招待", "音控", "司琴", "主領"]
SURNAMES = ["王", "李", "張", "劉", "陳", "楊", "黃", "趙", "周", "吳", "徐", "孫", "馬", "朱", "胡", "郭", "何", "林", "高", "羅"]
GIVEN_M = ["志明", "建國", "大偉", "俊傑", "志偉", "家豪", "志豪", "俊宏", "志強", "文雄", "志遠", "俊賢", "志傑", "家偉", "志偉"]
GIVEN_F = ["美玲", "淑芬", "雅婷", "淑惠", "美惠", "雅惠", "淑娟", "美華", "雅玲", "淑玲", "美芳", "雅芳", "淑華", "美玲", "雅惠"]

def random_name():
    g = random.choice(GENDERS)
    s = random.choice(SURNAMES)
    gv = random.choice(GIVEN_F if g == "女" else GIVEN_M)
    return s + gv

def main():
    random.seed(42)
    people = []
    for i in range(500):
        gender = random.choice(GENDERS)
        region = random.choice(REGIONS)
        n_tags = random.randint(1, 3)
        tags = random.sample(TAGS_POOL, n_tags)
        attendance = random.randint(0, 52)
        days_ago = random.randint(0, 90) if attendance > 0 else random.randint(30, 365)
        last_att = (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d") if attendance > 0 else None
        age_group = random.choice(AGE_GROUPS)
        church = "示例教會" if region == "其他" else f"示例教會-{region}"
        people.append({
            "id": f"p{i+1:04d}",
            "name": random_name(),
            "gender": gender,
            "region": region,
            "age_group": age_group,
            "church": church,
            "language": "cn",
            "attendance_count": attendance,
            "last_attendance": last_att,
            "tags": tags,
            "notes": "",
            "created_at": "2025-03-06T00:00:00Z"
        })
    out = {
        "version": "1.0",
        "updated": datetime.now().strftime("%Y-%m-%d"),
        "people": people
    }
    p = Path(__file__).parent.parent / "data" / "people.json"
    p.parent.mkdir(parents=True, exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"Generated {len(people)} people -> {p}")

    # Generate progress.json for subset (OT100/NT100/T4)
    progress = []
    courses = ["OT100", "NT100", "T4"]
    for i, p in enumerate(people[:200]):
        for c in random.sample(courses, random.randint(1, 3)):
            progress.append({
                "person_id": p["id"],
                "course_id": c,
                "current_step": random.randint(0, 100),
                "last_updated": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
            })
    prog_path = Path(__file__).parent.parent / "data" / "progress.json"
    with open(prog_path, "w", encoding="utf-8") as f:
        json.dump({"version": "1.0", "updated": datetime.now().strftime("%Y-%m-%d"), "progress": progress}, f, ensure_ascii=False, indent=2)
    print(f"Generated {len(progress)} progress records -> {prog_path}")

if __name__ == "__main__":
    main()
