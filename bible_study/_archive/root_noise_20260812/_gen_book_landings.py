# -*- coding: utf-8 -*-
"""Generate OT/NT book landing pages. Run from bible_study/."""
import os

BASE = """<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} | {cat_name} - {testament}</title>
<style>
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{ font-family: "Microsoft YaHei", "Segoe UI", Tahoma, sans-serif; background: #f0f4f8; color: #333; font-size: 12px; line-height: 1.6; padding: 16px 20px 24px; max-width: 900px; margin: 0 auto; }}
.top-nav {{ background: #1a3a52; color: #fff; padding: 8px 12px; border-radius: 8px; margin-bottom: 16px; font-size: 11px; }}
.top-nav a {{ color: #a8d4ff; text-decoration: none; margin-right: 10px; }}
.header {{ background: linear-gradient(135deg, #0b5fa5 0%, #2aa5ff 100%); color: white; padding: 16px 20px; border-radius: 10px; margin-bottom: 16px; text-align: center; }}
.header h1 {{ font-size: 18px; margin: 0 0 6px 0; }}
.content {{ background: #fff; padding: 16px 20px; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid #2aa5ff; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }}
.content p {{ margin-bottom: 10px; }}
.ext {{ margin-top: 14px; padding-top: 12px; border-top: 1px solid #e0e8f0; font-size: 11px; color: #555; }}
.ext a {{ color: #0b5fa5; }}
</style>
</head>
<body>
<nav class="top-nav" aria-label="導航">
<a href="../../dashboard.html" target="contentFrame">📊 總覽</a>
<a href="../../commentaries/_landing.html" target="contentFrame">📖 聖經書卷</a>
<a href="../index.html" target="contentFrame">📕 舊約 39卷</a>
<a href="index.html" target="contentFrame">{cat_name}</a>
<a href="../../NT/index.html" target="contentFrame">📗 新約</a>
</nav>
<div class="header">
<h1>📕 {title} {en}</h1>
<p>{ch} 章 · {cat_name}</p>
</div>
<div class="content">
<p>{intro}</p>
<p><strong>站內綜合解讀：</strong><a href="../../comprehensive_exegesis_reader.html?book={book}" target="contentFrame">進入綜合解讀</a></p>
<p><strong>外站 · 章節連結：</strong><a href="https://cmcbiblereading.com/%E6%97%A7%E7%BA%A6%E7%BB%BC%E5%90%88%E8%A7%A3%E8%AF%BB/" target="_blank" rel="noopener">舊約綜合解讀 (cmcbiblereading.com)</a></p>
<p class="ext"><strong>無愧工人：</strong><a href="{wq}" target="_blank" rel="noopener">舊約精覽</a></p>
</div>
</body>
</html>
"""

NT_BASE = BASE.replace("#0b5fa5", "#1e7e34").replace("#2aa5ff", "#27ae60").replace("#1a3a52", "#1a4d2e").replace("#a8d4ff", "#a8e6cf").replace("📕", "📗").replace("舊約 39卷", "新約 27卷").replace("📗 新約", "📗 新約 27卷").replace("../index.html", "../index.html").replace("舊約綜合解讀", "新約綜合解讀").replace("https://cmcbiblereading.com/%E6%97%A7%E7%BA%A6%E7%BB%BC%E5%90%88%E8%A7%A3%E8%AF%BB/", "https://cmcbiblereading.com/%E6%96%B0%E7%BA%A6%E7%BB%BC%E5%90%88%E8%A7%A3%E8%AF%BB/").replace("無愧工人：</strong><a href=\"{wq}\"", "無愧工人：</strong><a href=\"http://www.xn--gmqq38aqncfyg.com/zh-tw/menu-ch-nt/\"")
# Fix NT: nav should have NT index, category link to same folder index, content link to NT commentary
NT_BASE = NT_BASE.replace('<a href="../index.html" target="contentFrame">📗 新約 27卷</a>', '<a href="../index.html" target="contentFrame">📗 新約 27卷</a>')

def write_ot(cat_dir, cat_name, books, wq):
    os.makedirs(cat_dir, exist_ok=True)
    for book, ch, en, intro in books:
        path = os.path.join(cat_dir, book + ".html")
        s = BASE.format(title=book, cat_name=cat_name, testament="舊約綜合解讀", en=en, ch=ch, book=book, intro=intro, wq=wq)
        with open(path, "w", encoding="utf-8") as f:
            f.write(s)

# History (remaining 11)
history_books = [
    ("士師記", "21", "Judges", "士師時代。"),
    ("路得記", "4", "Ruth", "救贖之愛。"),
    ("撒母耳記上", "31", "1 Samuel", "掃羅與大衛王朝。"),
    ("撒母耳記下", "24", "2 Samuel", "大衛王朝。"),
    ("列王紀上", "22", "1 Kings", "所羅門與南北國。"),
    ("列王紀下", "25", "2 Kings", "南北國至被擄。"),
    ("歷代志上", "29", "1 Chronicles", "王朝與聖殿。"),
    ("歷代志下", "36", "2 Chronicles", "王朝與聖殿。"),
    ("以斯拉記", "10", "Ezra", "歸回與重建。"),
    ("尼希米記", "13", "Nehemiah", "歸回與重建。"),
    ("以斯帖記", "10", "Esther", "以斯帖記。"),
]
for book, ch, en, intro in history_books:
    path = os.path.join("OT", "history", book + ".html")
    s = BASE.format(title=book, cat_name="歷史書", testament="舊約綜合解讀", en=en, ch=ch, book=book, intro=intro + "綜合解讀與章節請至下方外站連結選擇。", wq="http://www.xn--gmqq38aqncfyg.com/zh-tw/menu-ch-ot/menu-ch-ot4-2")
    with open(path, "w", encoding="utf-8") as f:
        f.write(s)

# Poetry
poetry_books = [
    ("約伯記", "42", "Job", "苦難與智慧。"),
    ("詩篇", "150", "Psalms", "敬拜與禱告。"),
    ("箴言", "31", "Proverbs", "智慧文學。"),
    ("傳道書", "12", "Ecclesiastes", "傳道書。"),
    ("雅歌", "8", "Song of Songs", "雅歌。"),
]
os.makedirs("OT/poetry", exist_ok=True)
for book, ch, en, intro in poetry_books:
    path = os.path.join("OT", "poetry", book + ".html")
    s = BASE.format(title=book, cat_name="詩歌智慧書", testament="舊約綜合解讀", en=en, ch=ch, book=book, intro=intro + "綜合解讀與章節請至下方外站連結選擇。", wq="http://www.xn--gmqq38aqncfyg.com/zh-tw/menu-ch-ot/")
    with open(path, "w", encoding="utf-8") as f:
        f.write(s)

# Major prophets
major_books = [
    ("以賽亞書", "66", "Isaiah", "以賽亞書。"),
    ("耶利米書", "52", "Jeremiah", "耶利米書。"),
    ("耶利米哀歌", "5", "Lamentations", "耶利米哀歌。"),
    ("以西結書", "48", "Ezekiel", "以西結書。"),
    ("但以理書", "12", "Daniel", "但以理書。"),
]
os.makedirs("OT/major_prophets", exist_ok=True)
for book, ch, en, intro in major_books:
    path = os.path.join("OT", "major_prophets", book + ".html")
    s = BASE.format(title=book, cat_name="大先知書", testament="舊約綜合解讀", en=en, ch=ch, book=book, intro=intro + "綜合解讀與章節請至下方外站連結選擇。", wq="http://www.xn--gmqq38aqncfyg.com/zh-tw/menu-ch-ot/")
    with open(path, "w", encoding="utf-8") as f:
        f.write(s)

# Minor prophets
minor_books = [
    ("何西阿書", "14", "Hosea", "何西阿書。"),
    ("約珥書", "3", "Joel", "約珥書。"),
    ("阿摩司書", "9", "Amos", "阿摩司書。"),
    ("俄巴底亞書", "1", "Obadiah", "俄巴底亞書。"),
    ("約拿書", "4", "Jonah", "約拿書。"),
    ("彌迦書", "7", "Micah", "彌迦書。"),
    ("那鴻書", "3", "Nahum", "那鴻書。"),
    ("哈巴谷書", "3", "Habakkuk", "哈巴谷書。"),
    ("西番雅書", "3", "Zephaniah", "西番雅書。"),
    ("哈該書", "2", "Haggai", "哈該書。"),
    ("撒迦利亞書", "14", "Zechariah", "撒迦利亞書。"),
    ("瑪拉基書", "4", "Malachi", "瑪拉基書。"),
]
os.makedirs("OT/minor_prophets", exist_ok=True)
for book, ch, en, intro in minor_books:
    path = os.path.join("OT", "minor_prophets", book + ".html")
    s = BASE.format(title=book, cat_name="小先知書", testament="舊約綜合解讀", en=en, ch=ch, book=book, intro=intro + "綜合解讀與章節請至下方外站連結選擇。", wq="http://www.xn--gmqq38aqncfyg.com/zh-tw/menu-ch-ot/")
    with open(path, "w", encoding="utf-8") as f:
        f.write(s)

# OT poetry index, major_prophets index, minor_prophets index
for cat, cat_name, book_list, wq in [
    ("poetry", "詩歌智慧書", poetry_books, "http://www.xn--gmqq38aqncfyg.com/zh-tw/menu-ch-ot/"),
    ("major_prophets", "大先知書", major_books, "http://www.xn--gmqq38aqncfyg.com/zh-tw/menu-ch-ot/"),
    ("minor_prophets", "小先知書", minor_books, "http://www.xn--gmqq38aqncfyg.com/zh-tw/menu-ch-ot/"),
]:
    links = "".join('<a href="{}.html" target="contentFrame">{}</a>\n            '.format(b[0], b[0]) for b in book_list)
    idx = """<!DOCTYPE html>
<html lang="zh-TW">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>""" + cat_name + """ | 舊約綜合解讀</title>
<style>
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{ font-family: "Microsoft YaHei", "Segoe UI", Tahoma, sans-serif; background: #f0f4f8; color: #333; font-size: 12px; line-height: 1.6; padding: 16px 20px 24px; max-width: 900px; margin: 0 auto; }}
.top-nav {{ background: #1a3a52; color: #fff; padding: 8px 12px; border-radius: 8px; margin-bottom: 16px; font-size: 11px; }}
.top-nav a {{ color: #a8d4ff; text-decoration: none; margin-right: 10px; }}
.header {{ background: linear-gradient(135deg, #0b5fa5 0%, #2aa5ff 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center; }}
.header h1 {{ font-size: 20px; margin: 0 0 8px 0; }}
.intro {{ background: #fff; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #2aa5ff; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }}
.intro p {{ margin-bottom: 8px; }}
.intro h4 {{ font-size: 13px; color: #0b5fa5; margin: 12px 0 6px 0; }}
.book-list {{ display: flex; flex-wrap: wrap; gap: 6px 12px; margin-top: 12px; }}
.book-list a {{ display: inline-block; padding: 8px 14px; background: #e8f4fd; color: #0b5fa5; text-decoration: none; border-radius: 6px; font-size: 12px; }}
.book-list a:hover {{ background: #2aa5ff; color: #fff; }}
.ext {{ font-size: 11px; color: #555; margin-top: 12px; }}
.ext a {{ color: #0b5fa5; }}
</style>
</head>
<body>
<nav class="top-nav"><a href="../../dashboard.html" target="contentFrame">📊 總覽</a>
<a href="../../commentaries/_landing.html" target="contentFrame">📖 聖經書卷</a>
<a href="../index.html" target="contentFrame">📕 舊約 39卷</a>
<a href="../../NT/index.html" target="contentFrame">📗 新約 27卷</a>
</nav>
<div class="header"><h1>📕 """ + cat_name + """</h1><p>書卷 · 點選進入書卷 landing（含章節連結，暫指外站）</p></div>
<div class="intro">
<h4>書卷</h4>
<div class="book-list">
""" + links + """
</div>
<p class="ext">外站：<a href="https://cmcbiblereading.com/%E6%97%A7%E7%BA%A6%E7%BB%BC%E5%90%88%E8%A7%A3%E8%AF%BB/" target="_blank" rel="noopener">舊約綜合解讀 (cmcbiblereading.com)</a> · <a href=\"""" + wq + """\" target="_blank" rel="noopener">無愧工人 舊約精覽</a></p>
</div>
</body>
</html>
"""
    with open(os.path.join("OT", cat, "index.html"), "w", encoding="utf-8") as f:
        f.write(idx)

print("OT book landings done.")
# NT
NT_CMCB = "https://cmcbiblereading.com/%E6%96%B0%E7%BA%A6%E7%BB%BC%E5%90%88%E8%A7%A3%E8%AF%BB/"
NT_WQ = "http://www.xn--gmqq38aqncfyg.com/zh-tw/menu-ch-nt/"
nt_template = """<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} | {cat_name} - 新約綜合解讀</title>
<style>
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{ font-family: "Microsoft YaHei", "Segoe UI", Tahoma, sans-serif; background: #f0f4f8; color: #333; font-size: 12px; line-height: 1.6; padding: 16px 20px 24px; max-width: 900px; margin: 0 auto; }}
.top-nav {{ background: #1a4d2e; color: #fff; padding: 8px 12px; border-radius: 8px; margin-bottom: 16px; font-size: 11px; }}
.top-nav a {{ color: #a8e6cf; text-decoration: none; margin-right: 10px; }}
.header {{ background: linear-gradient(135deg, #1e7e34 0%, #27ae60 100%); color: white; padding: 16px 20px; border-radius: 10px; margin-bottom: 16px; text-align: center; }}
.header h1 {{ font-size: 18px; margin: 0 0 6px 0; }}
.content {{ background: #fff; padding: 16px 20px; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid #27ae60; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }}
.content p {{ margin-bottom: 10px; }}
.ext {{ margin-top: 14px; padding-top: 12px; border-top: 1px solid #e0e8f0; font-size: 11px; color: #555; }}
.ext a {{ color: #1e7e34; }}
</style>
</head>
<body>
<nav class="top-nav">
<a href="../../dashboard.html" target="contentFrame">📊 總覽</a>
<a href="../../commentaries/_landing.html" target="contentFrame">📖 聖經書卷</a>
<a href="../index.html" target="contentFrame">📗 新約 27卷</a>
<a href="index.html" target="contentFrame">{cat_name}</a>
<a href="../../OT/index.html" target="contentFrame">📕 舊約</a>
</nav>
<div class="header"><h1>📗 {title} {en}</h1><p>{ch} 章 · {cat_name}</p></div>
<div class="content">
<p>{intro}</p>
<p><strong>站內綜合解讀：</strong><a href="../../comprehensive_exegesis_reader.html?book={book}" target="contentFrame">進入綜合解讀</a></p>
<p><strong>外站 · 章節連結：</strong><a href="{nt_cmcb}" target="_blank" rel="noopener">新約綜合解讀 (cmcbiblereading.com)</a></p>
<p class="ext"><strong>無愧工人：</strong><a href="{nt_wq}" target="_blank" rel="noopener">新約精覽</a></p>
</div>
</body>
</html>
"""
nt_cats = [
    ("gospels", "福音書", [
        ("馬太福音", "28", "Matthew", "馬太福音。"),
        ("馬可福音", "16", "Mark", "馬可福音。"),
        ("路加福音", "24", "Luke", "路加福音。"),
        ("約翰福音", "21", "John", "約翰福音。"),
    ]),
    ("history", "歷史書", [("使徒行傳", "28", "Acts", "使徒行傳。")]),
    ("paul_letters", "保羅書信", [
        ("羅馬書", "16", "Romans", "羅馬書。"),
        ("哥林多前書", "16", "1 Corinthians", "哥林多前書。"),
        ("哥林多後書", "13", "2 Corinthians", "哥林多後書。"),
        ("加拉太書", "6", "Galatians", "加拉太書。"),
        ("以弗所書", "6", "Ephesians", "以弗所書。"),
        ("腓立比書", "4", "Philippians", "腓立比書。"),
        ("歌羅西書", "4", "Colossians", "歌羅西書。"),
        ("帖撒羅尼迦前書", "5", "1 Thessalonians", "帖撒羅尼迦前書。"),
        ("帖撒羅尼迦後書", "3", "2 Thessalonians", "帖撒羅尼迦後書。"),
        ("提摩太前書", "6", "1 Timothy", "提摩太前書。"),
        ("提摩太後書", "4", "2 Timothy", "提摩太後書。"),
        ("提多書", "3", "Titus", "提多書。"),
        ("腓利門書", "1", "Philemon", "腓利門書。"),
    ]),
    ("general_letters", "一般書信", [
        ("希伯來書", "13", "Hebrews", "希伯來書。"),
        ("雅各書", "5", "James", "雅各書。"),
        ("彼得前書", "5", "1 Peter", "彼得前書。"),
        ("彼得後書", "3", "2 Peter", "彼得後書。"),
        ("約翰一書", "5", "1 John", "約翰一書。"),
        ("約翰二書", "1", "2 John", "約翰二書。"),
        ("約翰三書", "1", "3 John", "約翰三書。"),
        ("猶大書", "1", "Jude", "猶大書。"),
    ]),
    ("revelation", "啟示錄", [("啟示錄", "22", "Revelation", "啟示錄。")]),
]
for cat_dir, cat_name, books in nt_cats:
    os.makedirs(os.path.join("NT", cat_dir), exist_ok=True)
    for book, ch, en, intro in books:
        path = os.path.join("NT", cat_dir, book + ".html")
        s = nt_template.format(title=book, cat_name=cat_name, en=en, ch=ch, book=book, intro=intro + "綜合解讀與章節請至下方外站連結選擇。", nt_cmcb=NT_CMCB, nt_wq=NT_WQ)
        with open(path, "w", encoding="utf-8") as f:
            f.write(s)
print("NT book landings done.")
