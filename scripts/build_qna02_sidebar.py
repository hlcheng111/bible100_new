#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_qna02_sidebar.py - 從 qna02.htm 解析出 5 層結構，產出可伸縮選單 HTML

結構：A 大類(★A 聖經書卷難題) → B 網站(來源) → C 舊約/新約/生活/辯道/護教 → D 書卷 → E 題目
"""
from pathlib import Path
import re
import json

# 舊約書卷列表（簡體/繁體）
OLD_TESTAMENT_BOOKS = {
    "创世记", "創世記", "出埃及记", "出埃及記", "利未记", "利未記",
    "民数记", "民數記", "申命记", "申命記", "约书亚记", "約書亞記",
    "士师记", "士師記", "路得记", "路得記", "撒母耳记上", "撒母耳記上",
    "撒母耳记下", "撒母耳記下", "列王记上", "列王記上", "列王记下", "列王記下",
    "历代志上", "歷代志上", "历代志下", "歷代志下", "以斯拉记", "以斯拉記",
    "尼希米记", "尼希米記", "以斯帖记", "以斯帖記", "约伯记", "約伯記",
    "诗篇", "詩篇", "箴言", "传道书", "傳道書", "雅歌",
    "以赛亚书", "以賽亞書", "耶利米书", "耶利米書", "耶利米哀歌",
    "以西结书", "以西結書", "但以理书", "但以理書", "何西阿书", "何西阿書",
    "约珥书", "約珥書", "阿摩司书", "阿摩司書", "俄巴底亚书", "俄巴底亞書",
    "约拿书", "約拿書", "弥迦书", "彌迦書", "那鸿书", "那鴻書",
    "哈巴谷书", "哈巴谷書", "西番雅书", "西番雅書", "哈该书", "哈該書",
    "撒迦利亚书", "撒迦利亞書", "玛拉基书", "瑪拉基書",
}

# 新約書卷列表
NEW_TESTAMENT_BOOKS = {
    "马太福音", "馬太福音", "马可福音", "馬可福音", "路加福音", "约翰福音", "約翰福音",
    "使徒行传", "使徒行傳", "罗马书", "羅馬書", "哥林多前书", "哥林多前書",
    "哥林多后书", "哥林多後書", "加拉太书", "加拉太書", "以弗所书", "以弗所書",
    "腓立比书", "腓立比書", "歌罗西书", "歌羅西書", "帖撒罗尼迦前书", "帖撒羅尼迦前書",
    "帖撒罗尼迦后书", "帖撒羅尼迦後書", "提摩太前书", "提摩太前書", "提摩太后书", "提摩太後書",
    "提多书", "提多書", "腓利门书", "腓利門書", "希伯来书", "希伯來書",
    "雅各书", "雅各書", "彼得前书", "彼得前書", "彼得后书", "彼得後書",
    "约翰一书", "約翰一書", "约翰二书", "約翰二書", "约翰三书", "約翰三書",
    "犹大书", "猶大書", "启示录", "啟示錄",
}


def infer_testament(book_name: str) -> str:
    """從書卷名推斷是舊約或新約。"""
    if book_name in OLD_TESTAMENT_BOOKS:
        return "舊約"
    elif book_name in NEW_TESTAMENT_BOOKS:
        return "新約"
    return ""


def strip_html(html: str) -> str:
    return re.sub(r'<[^>]+>', '', html).strip()


def extract_href_and_text(a_tag: str) -> tuple:
    """從 <a href="...">text</a> 提取 href 與 text。"""
    m = re.search(r'href=["\']([^"\']+)["\']', a_tag)
    href = m.group(1) if m else ''
    text = strip_html(a_tag)
    return href, text


def _find_headings(content: str) -> list:
    """掃描 content，回傳 (start_pos, level, text, href) 列表，用於後續依位置歸屬連結。"""
    headings = []
    # h2: 可能跨多行
    for m in re.finditer(r'<h2(?:\s[^>]*)?>([\s\S]*?)</h2>', content, re.I):
        text = strip_html(m.group(1))
        if text and len(text) < 200:
            headings.append((m.start(), "h2", text, None))
    # h3
    for m in re.finditer(r'<h3(?:\s[^>]*)?>([\s\S]*?)</h3>', content, re.I):
        text = strip_html(m.group(1))
        if text and len(text) < 80:
            headings.append((m.start(), "h3", text, None))
    # h4: 可能內含 <a>
    for m in re.finditer(r'<h4(?:\s[^>]*)?>([\s\S]*?)</h4>', content, re.I):
        chunk = m.group(1)
        a_match = re.search(r'<a\s[^>]*href=["\']([^"\']+)["\'][^>]*>([\s\S]*?)</a>', chunk)
        if a_match:
            href, text = a_match.group(1), strip_html(a_match.group(2))
        else:
            text = strip_html(chunk)
            href = None
        if text and len(text) < 100:
            headings.append((m.start(), "h4", text, href))
    headings.sort(key=lambda x: x[0])
    return headings


def _link_scope(headings: list, link_start: int) -> tuple:
    """依 link_start 位置，回傳 (source, sub, book) 即最後一個在 link_start 之前的 h2/h3/h4。
    如果沒有 h3，從 h4 的書卷名推斷舊約/新約。
    """
    source = sub = book = ""
    last_h2 = ""
    last_h3 = ""
    for pos, level, text, _ in headings:
        if pos >= link_start:
            break
        if level == "h2":
            source = text
            last_h2 = text
            sub = ""
            book = ""
            last_h3 = ""
        elif level == "h3":
            sub = text
            last_h3 = text
        elif level == "h4":
            book = text
            # 如果沒有 h3，從書卷名推斷舊約/新約
            if not last_h3:
                inferred = infer_testament(text)
                if inferred:
                    sub = inferred
    return source, sub, book


def parse_qna02(content: str) -> list:
    """
    解析 qna02 結構，回傳 list of dict（h2/h3/h4 + link）。
    連結改為在整份 content 上用跨行 regex 抓取，可處理跨行 <a>。
    """
    headings = _find_headings(content)
    result = []

    # 先輸出所有 h2/h3/h4（build_tree 需要依序建立結構）
    last_source = ""
    last_sub = ""
    for _pos, level, text, href in headings:
        if level == "h2":
            last_source = text
            last_sub = ""
            result.append({"level": "h2", "text": text, "source": text})
        elif level == "h3":
            last_sub = text
            result.append({"level": "h3", "text": text, "source": last_source, "sub": text})
        elif level == "h4":
            # 如果沒有 h3，從書卷名推斷舊約/新約
            sub = last_sub
            if not sub:
                inferred = infer_testament(text)
                if inferred:
                    sub = inferred
                    last_sub = sub  # 更新 last_sub，讓後續的 h4 也能使用
                    # 插入一個虛擬的 h3（如果還沒插入過）
                    # 檢查是否已經有這個 sub
                    if not any(it.get("level") == "h3" and it.get("source") == last_source and it.get("sub") == sub for it in result):
                        result.append({"level": "h3", "text": sub, "source": last_source, "sub": sub})
            result.append({"level": "h4", "text": text, "href": href or "", "source": last_source, "sub": sub, "book": text})

    # 在整份 content 上抓所有 https? 連結（跨行）
    for m in re.finditer(
        r'<a\s[^>]*href=["\'](https?://[^"\']+)["\'][^>]*>([\s\S]*?)</a>',
        content,
        re.I,
    ):
        href = m.group(1)
        text = strip_html(m.group(2))
        if not text or len(text) < 2 or len(text) > 200:
            continue
        # 略過純 URL 當成文字顯示的連結
        if text.startswith("http://") or text.startswith("https://"):
            continue
        source, sub, book = _link_scope(headings, m.start())
        if not source:
            continue
        result.append({
            "level": "link",
            "text": text,
            "href": href,
            "source": source,
            "book": book,
            "sub": sub,
        })

    return result


def load_abc_config() -> dict:
    """載入 A/B/C 分類配置。"""
    base = Path(__file__).resolve().parent.parent
    config_path = base / "qna" / "data" / "qna_abc_config.json"
    if config_path.exists():
        with open(config_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "top_level": {"A": "聖經書卷難題", "B": "神學教義難題", "C": "信徒教會難題"},
        "source_category_to_abc": {},
        "default_abc": "A"
    }


def get_abc_for_source(source_name: str, sub_name: str, abc_config: dict) -> str:
    """根據來源名稱和子分類決定 A/B/C。"""
    config = abc_config.get("source_category_to_abc", {})
    
    # 標準化來源名稱（處理 qna02.htm 中的格式）
    normalized = source_name.replace(" - ", "－").replace(" - ", "－")
    
    # 檢查完整來源名
    if normalized in config:
        v = config[normalized]
        if isinstance(v, dict):
            return v.get(sub_name, abc_config.get("default_abc", "A"))
        return v
    
    # 檢查部分匹配
    for key, value in config.items():
        # 處理「聖經難題 - 以斯拉百科網」→「以斯拉百科－聖經難題」
        if "以斯拉百科" in source_name:
            if "辯道護教" in source_name or "辯道護教" in key:
                if "辯道護教" in key:
                    if isinstance(value, dict):
                        return value.get(sub_name, "B")
                    return value if value == "B" else abc_config.get("default_abc", "A")
            elif "舊約背景" in source_name or "舊約背景" in key:
                if "舊約背景" in key:
                    return "A"
            elif "新約背景" in source_name or "新約背景" in key:
                if "新約背景" in key:
                    return "A"
            elif "聖經難題" in source_name:
                return "A"
        # 一般匹配
        if key in normalized or normalized in key:
            if isinstance(value, dict):
                return value.get(sub_name, abc_config.get("default_abc", "A"))
            return value
    
    return abc_config.get("default_abc", "A")


def build_tree(items: list, abc_config: dict) -> dict:
    """將扁平 list 轉為樹狀：ABC -> source -> sub -> book -> [links]。"""
    tree = {"A": {}, "B": {}, "C": {}}
    for it in items:
        if it["level"] == "h2":
            src = it["text"]
            sub = it.get("sub", "")
            abc = get_abc_for_source(src, sub, abc_config)
            if abc not in tree:
                tree[abc] = {}
            if src not in tree[abc]:
                tree[abc][src] = {"_subs": {}, "_books": {}, "_links": []}
        elif it["level"] == "h3":
            src = it.get("source", "")
            sub = it["text"]
            abc = get_abc_for_source(src, sub, abc_config)
            if abc in tree and src in tree[abc]:
                if sub and sub not in tree[abc][src]["_subs"]:
                    tree[abc][src]["_subs"][sub] = {"_books": {}, "_links": []}
        elif it["level"] == "h4":
            src = it.get("source", "")
            sub = it.get("sub", "")
            book = it["text"]
            abc = get_abc_for_source(src, sub, abc_config)
            if abc not in tree or src not in tree[abc]:
                continue
            if sub and sub in tree[abc][src]["_subs"]:
                if book not in tree[abc][src]["_subs"][sub]["_books"]:
                    tree[abc][src]["_subs"][sub]["_books"][book] = []
            else:
                if book not in tree[abc][src]["_books"]:
                    tree[abc][src]["_books"][book] = []
        elif it["level"] == "link":
            src = it.get("source", "")
            book = it.get("book", "")
            sub = it.get("sub", "")
            abc = get_abc_for_source(src, sub, abc_config)
            if abc not in tree or src not in tree[abc]:
                continue
            link = {"text": it["text"], "href": it["href"]}
            if sub and sub in tree[abc][src]["_subs"]:
                if book and book in tree[abc][src]["_subs"][sub]["_books"]:
                    tree[abc][src]["_subs"][sub]["_books"][book].append(link)
                else:
                    tree[abc][src]["_subs"][sub]["_links"].append(link)
            elif book and book in tree[abc][src]["_books"]:
                tree[abc][src]["_books"][book].append(link)
            else:
                tree[abc][src]["_links"].append(link)
    return tree


def render_html(tree: dict, abc_config: dict) -> str:
    """產出可伸縮 HTML，支援 A/B/C 三大分類。"""
    html_parts = ['''<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>5 層選單（A/B/C 分類）</title>
<base target="main">
<style>
body { margin: 0; padding: 8px; font-size: 10pt; font-family: Microsoft JhengHei, Arial, sans-serif; background: #f8f9fa; }
.qna-nav { list-style: none; padding-left: 0; margin: 0; }
.qna-nav ul { list-style: none; padding-left: 12px; margin: 2px 0; display: none; }
.qna-nav .open > ul { display: block; }
.qna-nav li { margin: 2px 0; }
.qna-nav .toggler { cursor: pointer; padding: 2px 4px; border-radius: 3px; }
.qna-nav .toggler:hover { background: #e0e0e0; }
.qna-nav .toggler::before { content: "▶ "; font-size: 8pt; color: #666; }
.qna-nav .open > .toggler::before { content: "▼ "; }
.qna-nav a { color: #467886; text-decoration: none; display: block; padding: 2px 4px; }
.qna-nav a:hover { background: #e8f4fc; text-decoration: underline; }
.lvl-abc { font-weight: bold; font-size: 1.1em; padding: 4px 0; }
.lvl-abc-a { color: #b22222; }  /* 紅色 - A 聖經書卷難題 */
.lvl-abc-b { color: #005c99; }  /* 藍色 - B 神學教義難題 */
.lvl-abc-c { color: #006400; }  /* 綠色 - C 信徒教會難題 */
.lvl-source { font-weight: bold; color: #333; font-size: 1.05em; }  /* 網站名稱 */
.lvl-sub { color: #666; font-weight: 500; }  /* 舊約/新約/分類 */
.lvl-book { color: #555; }  /* 書卷 */
.lvl-link { font-size: 9pt; color: #467886; }  /* 題目連結 */
</style>
</head>
<body>
<ul class="qna-nav" id="nav">''']

    def esc(s):
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")

    top_level = abc_config.get("top_level", {})
    abc_symbols = {"A": "★", "B": "◆", "C": "●"}
    
    # 依序輸出 A, B, C 三大分類
    for abc in ["A", "B", "C"]:
        if abc not in tree or not tree[abc]:
            continue
        abc_label = top_level.get(abc, f"{abc} 分類")
        symbol = abc_symbols.get(abc, "•")
        html_parts.append(f'<li><span class="toggler lvl-abc lvl-abc-{abc.lower()}">{symbol}{abc} {abc_label}</span><ul>')
        
        for src_name, src_node in tree[abc].items():
            if not src_name:
                continue
            # 網站名稱（粗體、較大字體）
            html_parts.append(f'<li><span class="toggler lvl-source" data-id="src-{hash(src_name) & 0x7FFFFFFF}">{esc(src_name)}</span><ul>')
            
            books = src_node.get("_books", {})
            subs = src_node.get("_subs", {})
            links_top = src_node.get("_links", [])

            # 子分類（舊約/新約等）
            for sub_name, sub_node in subs.items():
                html_parts.append(f'<li><span class="toggler lvl-sub">{esc(sub_name)}</span><ul>')
                # 書卷
                for book_name, book_links in sub_node.get("_books", {}).items():
                    if book_links:
                        html_parts.append(f'<li><span class="toggler lvl-book">{esc(book_name)}</span><ul>')
                        for lnk in book_links:
                            html_parts.append(f'<li class="lvl-link"><a href="{esc(lnk["href"])}">{esc(lnk["text"][:60])}{"…" if len(lnk["text"])>60 else ""}</a></li>')
                        html_parts.append('</ul></li>')
                # 子分類下的直接連結
                for lnk in sub_node.get("_links", []):
                    html_parts.append(f'<li class="lvl-link"><a href="{esc(lnk["href"])}">{esc(lnk["text"][:60])}{"…" if len(lnk["text"])>60 else ""}</a></li>')
                html_parts.append('</ul></li>')

            # 直接書卷（無子分類）
            for book_name, book_links in books.items():
                if book_links:
                    html_parts.append(f'<li><span class="toggler lvl-book">{esc(book_name)}</span><ul>')
                    for lnk in book_links:
                        html_parts.append(f'<li class="lvl-link"><a href="{esc(lnk["href"])}">{esc(lnk["text"][:60])}{"…" if len(lnk["text"])>60 else ""}</a></li>')
                    html_parts.append('</ul></li>')

            # 網站下的直接連結
            for lnk in links_top:
                html_parts.append(f'<li class="lvl-link"><a href="{esc(lnk["href"])}">{esc(lnk["text"][:60])}{"…" if len(lnk["text"])>60 else ""}</a></li>')

            html_parts.append('</ul></li>')  # 關閉網站層

        html_parts.append('</ul></li>')  # 關閉 A/B/C 層
    html_parts.append('''</ul>
<script>
(function(){
  // 為所有 toggler 添加點擊事件
  document.querySelectorAll(".qna-nav .toggler").forEach(function(el){
    el.onclick = function(){
      var li = this.parentElement;
      li.classList.toggle("open");
    };
  });
  // 預設所有項目都收合（不自動展開）
  // 用戶需要點擊 A/B/C 分類才會展開
})();
</script>
</body>
</html>''')
    return '\n'.join(html_parts)


def main():
    base = Path(__file__).resolve().parent.parent
    src = base / "qna" / "qna02.htm"
    out = base / "qna" / "qna02_sidebar.htm"

    if not src.exists():
        print(f"錯誤：找不到 {src}")
        return 1

    content = src.read_text(encoding='utf-8')
    abc_config = load_abc_config()
    items = parse_qna02(content)
    tree = build_tree(items, abc_config)
    html = render_html(tree, abc_config)
    out.write_text(html, encoding='utf-8')
    print(f"已產出 {out}")
    return 0


if __name__ == "__main__":
    exit(main())
