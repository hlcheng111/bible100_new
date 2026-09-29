from pathlib import Path

comp = Path(__file__).resolve().parent.parent / "church_planning" / "companion"
for p in comp.glob("*.html"):
    t = p.read_text(encoding="utf-8")
    n = t.replace('href="="../', 'href="../').replace("href='='../", "href='../")
    if n != t:
        p.write_text(n, encoding="utf-8")
        print("fixed", p.name)
