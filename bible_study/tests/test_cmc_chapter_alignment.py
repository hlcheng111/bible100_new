# -*- coding: utf-8 -*-
"""CMC_DIRECT_URLS 与 66 卷章数对齐检查（释经参读 cloud-only）。"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BRIDGE = ROOT / "bible_study" / "js" / "bible-bridge.js"

# 66 卷标准章数（与 comprehensive_exegesis_reader / BibleBridge.bookMap 一致）
BOOK_CHAPTERS = {
    "創世記": 50, "出埃及記": 40, "利未記": 27, "民數記": 36, "申命記": 34,
    "約書亞記": 24, "士師記": 21, "路得記": 4, "撒母耳記上": 31, "撒母耳記下": 24,
    "列王紀上": 22, "列王紀下": 25, "歷代志上": 29, "歷代志下": 36, "以斯拉記": 10,
    "尼希米記": 13, "以斯帖記": 10, "約伯記": 42, "詩篇": 150, "箴言": 31,
    "傳道書": 12, "雅歌": 8, "以賽亞書": 66, "耶利米書": 52, "耶利米哀歌": 5,
    "以西結書": 48, "但以理書": 12, "何西阿書": 14, "約珥書": 3, "阿摩司書": 9,
    "俄巴底亞書": 1, "約拿書": 4, "彌迦書": 7, "那鴻書": 3, "哈巴谷書": 3,
    "西番雅書": 3, "哈該書": 2, "撒迦利亞書": 14, "瑪拉基書": 4, "馬太福音": 28,
    "馬可福音": 16, "路加福音": 24, "約翰福音": 21, "使徒行傳": 28, "羅馬書": 16,
    "哥林多前書": 16, "哥林多後書": 13, "加拉太書": 6, "以弗所書": 6, "腓立比書": 4,
    "歌羅西書": 4, "帖撒羅尼迦前書": 5, "帖撒羅尼迦後書": 3, "提摩太前書": 6,
    "提摩太後書": 4, "提多書": 3, "腓利門書": 1, "希伯來書": 13, "雅各書": 5,
    "彼得前書": 5, "彼得後書": 3, "約翰一書": 5, "約翰二書": 1, "約翰三書": 1,
    "猶大書": 1, "啟示錄": 22,
}


def parse_cmc_direct_urls(text):
    """从 bible-bridge.js 提取 CMC_DIRECT_URLS：{ book: set(chapters) }。"""
    start = text.find("CMC_DIRECT_URLS:")
    if start < 0:
        raise AssertionError("CMC_DIRECT_URLS not found")
    chunk = text[start:]
    end = chunk.find("\n        },\n\n        getCMCDirectLink")
    if end < 0:
        end = chunk.find("getCMCDirectLink:")
    chunk = chunk[:end]

    books = {}
    current = None
    for line in chunk.splitlines():
        m_book = re.match(r'\s*"([^"]+)":\s*\{', line)
        if m_book:
            current = m_book.group(1)
            books[current] = set()
            continue
        m_ch = re.match(r"\s*(\d+):\s*\"https://", line)
        if m_ch and current:
            books[current].add(int(m_ch.group(1)))
    return books


def test_cmc_covers_all_books():
    text = BRIDGE.read_text(encoding="utf-8")
    cmc = parse_cmc_direct_urls(text)
    # 约翰短卷 CMC 表内常无独立键，走搜索 fallback 可接受
    optional_search = {"約翰一書", "約翰二書", "約翰三書"}
    missing_books = [b for b in BOOK_CHAPTERS if b not in cmc and b not in optional_search]
    assert not missing_books, "CMC 缺书卷: " + ", ".join(missing_books)


def test_cmc_chapter_counts_match():
    text = BRIDGE.read_text(encoding="utf-8")
    cmc = parse_cmc_direct_urls(text)
    gaps = []
    for book, max_ch in BOOK_CHAPTERS.items():
        if book not in cmc:
            gaps.append(f"{book}: 无 CMC 映射（将走搜索 fallback）")
            continue
        mapped = cmc[book]
        expected = set(range(1, max_ch + 1))
        missing = sorted(expected - mapped)
        extra = sorted(mapped - expected)
        if missing:
            gaps.append(f"{book}: 缺章 {missing[:8]}{'…' if len(missing) > 8 else ''} ({len(missing)}/{max_ch})")
        if extra:
            gaps.append(f"{book}: 多余章 {extra}")
    # 主卷缺章过多则失败；约翰短卷可无直链
    optional_search = {"約翰一書", "約翰二書", "約翰三書"}
    hard_fail = []
    for g in gaps:
        if any(b in g for b in optional_search):
            continue
        if "无 CMC" in g:
            hard_fail.append(g)
        elif "缺章" in g:
            m = re.search(r"\((\d+)/(\d+)\)", g)
            if m and int(m.group(1)) > 2:
                hard_fail.append(g)
    assert not hard_fail, "章数严重不对齐:\n" + "\n".join(hard_fail[:20])


def test_sample_direct_links_are_cmc():
    text = BRIDGE.read_text(encoding="utf-8")
    assert "cmcbiblereading.com" in text
    cmc = parse_cmc_direct_urls(text)
    assert cmc.get("創世記") and 1 in cmc["創世記"]
    assert cmc.get("馬太福音") and 1 in cmc.get("馬太福音", set())
    assert cmc.get("啟示錄") and 22 in cmc.get("啟示錄", set())


if __name__ == "__main__":
    test_cmc_covers_all_books()
    test_cmc_chapter_counts_match()
    test_sample_direct_links_are_cmc()
    text = BRIDGE.read_text(encoding="utf-8")
    cmc = parse_cmc_direct_urls(text)
    missing = [b for b in BOOK_CHAPTERS if b not in cmc]
    print("OK CMC alignment")
    print("  books mapped:", len(cmc), "/ 66")
    if missing:
        print("  fallback book count:", len(missing))
