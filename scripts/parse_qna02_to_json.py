#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
從 qna/qna02.htm 解析出「來源 → 主題（旧约/新约等 或 目錄）→ 題目」三層結構，
輸出 JSON 供 build_qna_list.py 合併。

- 恩泉陳終道：依 xu1 / index1~5 辨識，產出 旧约／新约／生活问题／神学问题。
- 其餘來源（如 Christian Answers 中文）：凡 <h1>/<h2>/<h3> 標題 + 後續 <a> 連結列表，
  會解析為「來源 → 目錄 → 題目」；標題文字須與 links_merged 的 label 一致（如 Christian Answers 中文）。

使用方式: python parse_qna02_to_json.py
輸出: qna/data/qna02_tree.json
"""
import html
import json
import os
import re
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QNA02_PATH = os.path.join(ROOT, "qna", "qna02.htm")
OUT_PATH = os.path.join(ROOT, "qna", "data", "qna02_tree.json")
MERGED_PATH = os.path.join(ROOT, "qna", "data", "links_merged.json")

# 用來記錄已見過的 h1/h2/h3 標題（除錯觀察用）
SEEN_HEADINGS = set()

# 已知 qna02 內來源 URL 對應的 source_label（與 links_merged 一致）
SOURCE_URL_LABELS = {
    "wellsofgrace.com/messages/chen/bible_qna/xu1.htm": "恩泉－聖經問題解答 陳終道",
    "wellsofgrace.com/messages/chen/bible_qna/index1.htm": "恩泉－聖經問題解答 陳終道",
    "wellsofgrace.com/messages/chen/bible_qna/index2.htm": "恩泉－聖經問題解答 陳終道",
    "wellsofgrace.com/messages/chen/bible_qna/index3.htm": "恩泉－聖經問題解答 陳終道",
    "wellsofgrace.com/messages/chen/bible_qna/index4.htm": "恩泉－聖經問題解答 陳終道",
}

# index N 對應主題名（與 qna02 內標題一致）
INDEX_CATEGORY = {
    "index1.htm": "旧约",
    "index2.htm": "新约",
    "index3.htm": "生活问题",
    "index4.htm": "神学问题",
}
# 教會問題若在 qna02 有單獨 index 可再補
INDEX_CATEGORY["index5.htm"] = "教会问题"


def normalize_url(url):
    if not url:
        return ""
    url = url.strip().replace("https://", "").replace("http://", "").split("?")[0].rstrip("/")
    return url


def decode_entity_text(s):
    if not s:
        return ""
    try:
        return html.unescape(s)
    except Exception:
        return s


def map_heading_to_label(heading_text, allowed_labels):
    """將 qna02 裡的 h1/h2/h3 標題儘量對應到 links_merged.json 內既有的 label。

    著重你列出的幾個大來源：
    - 恩泉－聖經難題彙編 Archer
    - 新約聖經難題／讀經深思系列（蘇佐揚）
    - 舊約聖經問題總解（李道生）
    - 聖經難題解答（呂鴻基）
    - 信仰問題解答（一／二）
    - 以斯拉百科網（多個分類）
    - GotQuestions.org
    - Christian Answers 中文
    """
    if not heading_text:
        return None
    text = heading_text.strip()
    if not text:
        return None

    # 先解碼 HTML 實體（如 &#22307; = 聖）
    text = decode_entity_text(text)
    
    # 1. 先嘗試完全比對
    if text in allowed_labels:
        return text

    # 移除空白和一些標點符號做關鍵字比對
    t = text.replace(" ", "").replace("－", "-").replace("—", "-").replace("–", "-")
    t_lower = t.lower()

    # 2. 恩泉相關來源
    # 恩泉－聖經難題彙編 Archer
    if ("聖經難題彙編" in t or "圣经难题汇编" in t or "bible difficulties" in t_lower) and ("archer" in t_lower or "阿徹" in t or "阿彻" in t):
        cand = "恩泉－聖經難題彙編 Archer"
        if cand in allowed_labels:
            return cand
    # 也嘗試 "恩泉－Archer 聖經難題"
    if ("archer" in t_lower or "阿徹" in t or "阿彻" in t) and ("聖經難題" in t or "圣经难题" in t):
        for cand in ["恩泉－聖經難題彙編 Archer", "恩泉－Archer 聖經難題"]:
            if cand in allowed_labels:
                return cand

    # 新約聖經難題 ‑ 蘇佐揚
    if ("新約聖經難題" in t or "新约圣经难题" in t or "新約聖經問題" in t) and ("蘇佐揚" in t or "苏佐扬" in t):
        cand = "恩泉－新約聖經難題 蘇佐揚"
        if cand in allowed_labels:
            return cand

    # 讀經深思系列 ‑ 蘇佐揚
    if ("讀經深思系列" in t or "读经深思系列" in t or "讀經深思" in t) and ("蘇佐揚" in t or "苏佐扬" in t):
        cand = "恩泉－讀經深思系列 蘇佐揚"
        if cand in allowed_labels:
            return cand

    # 舊約聖經問題總解(下) ‑ 李道生
    if (("舊約聖經問題總解" in t or "旧约圣经问题总解" in t or "舊約聖經問題" in t) and ("李道生" in t)):
        cand = "恩泉－舊約聖經難題 李道生"
        if cand in allowed_labels:
            return cand

    # 聖經難題解答 ‑ 呂鴻基
    if ("聖經難題解答" in t or "圣经难题解答" in t) and ("呂鴻基" in t or "吕鸿基" in t):
        cand = "恩泉－聖經難題解答 呂鴻基"
        if cand in allowed_labels:
            return cand

    # 信仰問題解答（一）遠志明等
    if ("信仰問題解答（一）" in t or "信仰问题解答（一）" in t or "信仰問題解答一" in t):
        cand = "恩泉－信仰問題解答（一）遠志明等"
        if cand in allowed_labels:
            return cand
        # 也嘗試 "恩泉－難題（卷一）"
        cand2 = "恩泉－難題（卷一）"
        if cand2 in allowed_labels:
            return cand2

    # 信仰問題解答（二）馮秉誠等
    if ("信仰問題解答（二）" in t or "信仰问题解答（二）" in t or "信仰問題解答二" in t):
        cand = "恩泉－難題（卷二）"
        if cand in allowed_labels:
            return cand

    # 3. 以斯拉百科網相關
    if ("以斯拉百科" in t or "以斯拉百科網" in t or "equiptoserve" in t_lower or "etspedia" in t_lower):
        # 以斯拉百科－申命記～路得記
        if ("申命記" in t or "路得記" in t or "申命記～路得記" in t):
            cand = "以斯拉百科－申命記～路得記"
            if cand in allowed_labels:
                return cand
        # 以斯拉百科－辯道護教
        if ("辯道護教" in t or "辩道护教" in t or "護教" in t):
            cand = "以斯拉百科－辯道護教"
            if cand in allowed_labels:
                return cand
        # 以斯拉百科－舊約背景
        if ("舊約背景" in t or "旧约背景" in t):
            cand = "以斯拉百科－舊約背景"
            if cand in allowed_labels:
                return cand
        # 以斯拉百科－新約背景
        if ("新約背景" in t or "新约背景" in t):
            cand = "以斯拉百科－新約背景"
            if cand in allowed_labels:
                return cand
        # 以斯拉百科－聖經難題（通用）
        if ("聖經難題" in t or "圣经难题" in t):
            # 優先嘗試具體分類，如果沒有則嘗試通用
            for cand in ["以斯拉百科－申命記～路得記", "以斯拉百科－辯道護教", "以斯拉百科－舊約背景", "以斯拉百科－新約背景"]:
                if cand in allowed_labels:
                    return cand

    # 4. 其他來源
    # 路加54－福音常遇難題
    if ("路加54" in t or "luke54" in t_lower) and ("福音常遇難題" in t or "福音常遇难题" in t):
        cand = "路加54－福音常遇難題等"
        if cand in allowed_labels:
            return cand

    # 華人護教－聖經難題（錯誤/矛盾）解答
    if ("華人護教" in t or "华人护教" in t or "chineseapologetics" in t_lower):
        cand = "華人護教－聖經難題（錯誤/矛盾）解答"
        if cand in allowed_labels:
            return cand

    # 證道浸信會－信仰難題解答
    if ("證道浸信會" in t or "证道浸信会" in t or "logosbaptist" in t_lower):
        cand = "證道浸信會－信仰難題解答"
        if cand in allowed_labels:
            return cand

    # 5. 英文站台
    if "gotquestions" in t_lower or "got questions" in t_lower:
        if "中文" in t or "chinese" in t_lower:
            cand = "GotQuestions 中文－好消息"
            if cand in allowed_labels:
                return cand
        else:
            cand = "GotQuestions 英文"
            if cand in allowed_labels:
                return cand

    if "christian answers" in t_lower:
        if "中文" in t or "chinese" in t_lower:
            cand = "Christian Answers 中文"
            if cand in allowed_labels:
                return cand
        else:
            cand = "Christian Answers 英文"
            if cand in allowed_labels:
                return cand

    # Defending Inerrancy / Solutions To Bible ?Errors?
    t_lower_nospace = t_lower.replace("\n", " ").replace(" ", "")
    if "solutionstobible" in t_lower_nospace or "bible?errors" in t_lower_nospace or "defendinginerrancy" in t_lower_nospace:
        cand = "Defending Inerrancy－Bible Difficulties"
        if cand in allowed_labels:
            return cand

    # 找不到合適的就放棄，避免誤歸類
    return None


class Qna02Parser(HTMLParser):
    """解析 qna02.htm：追蹤當前來源、當前主題，收集題目連結。"""
    def __init__(self):
        super().__init__()
        self.tree = {}   # { source_label: { book_label: [ {title, url}, ... ] } }
        self.current_source = None
        self.current_category = None
        self.in_a = False
        self.a_href = ""
        self.a_text = []
        self.last_h2_href = ""
        self.last_h2_text = ""

    def handle_starttag(self, tag, attrs):
        attrs_d = dict(attrs)
        if tag == "a" and attrs_d.get("href"):
            self.in_a = True
            self.a_href = attrs_d.get("href", "").strip()
            self.a_text = []
        else:
            self.in_a = False

    def handle_endtag(self, tag):
        if tag == "a" and self.in_a:
            href = normalize_url(self.a_href)
            text = decode_entity_text("".join(self.a_text)).strip()
            # 判定：是否為「來源」入口（xu1.htm）
            for key, label in SOURCE_URL_LABELS.items():
                if key in href and "xu1" in href:
                    self.current_source = label
                    self.current_category = None
                    break
            # 判定：是否為主題（index1~5）
            for idx, cat in INDEX_CATEGORY.items():
                if idx in href and ("index" in href and "bibleqa" not in href):
                    if self.current_source:
                        self.current_category = cat
                        self.tree.setdefault(self.current_source, {}).setdefault(cat, [])
                    break
            else:
                # 題目連結：bibleqa*.htm 或同目錄下明確題目
                if self.current_source and self.current_category and text and len(text) > 2:
                    if "bibleqa" in href or ("wellsofgrace.com/messages/chen/bible_qna" in href and "index" not in href and "xu1" not in href):
                        if "回" not in text and "首頁" not in text and "更多" not in text and "返回" not in text:
                            full_url = self.a_href if self.a_href.startswith("http") else "https://wellsofgrace.com/messages/chen/bible_qna/" + self.a_href.lstrip("/")
                            self.tree[self.current_source][self.current_category].append({
                                "title": text[:200],
                                "url": full_url.strip(),
                            })
            self.in_a = False
            self.a_href = ""
            self.a_text = []

    def handle_data(self, data):
        if self.in_a:
            self.a_text.append(data)


# 通用區塊：標題下連結歸到此分類名（三層選單第二層）
GENERIC_CATEGORY = "目錄"

# 書卷名稱對照表（用於識別書卷分類）
# 同時支援繁體和簡體
BOOK_NAMES_MAP = {
    "創世記": "舊約 / 創世記",
    "创世记": "舊約 / 創世記",
    "出埃及記": "舊約 / 出埃及記",
    "出埃及记": "舊約 / 出埃及記",
    "利未記": "舊約 / 利未記",
    "利未记": "舊約 / 利未記",
    "民數記": "舊約 / 民數記",
    "民数记": "舊約 / 民數記",
    "申命記": "舊約 / 申命記",
    "申命记": "舊約 / 申命記",
    "約書亞記": "舊約 / 約書亞記",
    "约书亚记": "舊約 / 約書亞記",
    "士師記": "舊約 / 士師記",
    "士师记": "舊約 / 士師記",
    "路得記": "舊約 / 路得記",
    "路得记": "舊約 / 路得記",
    "撒母耳記": "舊約 / 撒母耳記",
    "撒母耳记": "舊約 / 撒母耳記",
    "列王記": "舊約 / 列王記",
    "列王记": "舊約 / 列王記",
    "歷代志": "舊約 / 歷代志",
    "历代志": "舊約 / 歷代志",
    "詩篇": "舊約 / 詩篇",
    "诗篇": "舊約 / 詩篇",
    "箴言": "舊約 / 箴言",
    "传道书": "舊約 / 傳道書",
    "傳道書": "舊約 / 傳道書",
    "以賽亞書": "舊約 / 以賽亞書",
    "以赛亚书": "舊約 / 以賽亞書",
    "耶利米書": "舊約 / 耶利米書",
    "耶利米书": "舊約 / 耶利米書",
    "以西結書": "舊約 / 以西結書",
    "以西结书": "舊約 / 以西結書",
    "何西阿書": "舊約 / 何西阿書",
    "何西阿书": "舊約 / 何西阿書",
    "約珥書": "舊約 / 約珥書",
    "约珥书": "舊約 / 約珥書",
    "但以理書": "舊約 / 但以理書",
    "但以理书": "舊約 / 但以理書",
    "瑪拉基書": "舊約 / 瑪拉基書",
    "玛拉基书": "舊約 / 瑪拉基書",
    "馬太福音": "新約 / 馬太福音",
    "马太福音": "新約 / 馬太福音",
    "馬可福音": "新約 / 馬可福音",
    "马可福音": "新約 / 馬可福音",
    "路加福音": "新約 / 路加福音",
    "約翰福音": "新約 / 約翰福音",
    "约翰福音": "新約 / 約翰福音",
    "使徒行傳": "新約 / 使徒行傳",
    "使徒行传": "新約 / 使徒行傳",
    "羅馬書": "新約 / 羅馬書",
    "罗马书": "新約 / 羅馬書",
    "哥林多前書": "新約 / 哥林多前書",
    "哥林多前书": "新約 / 哥林多前書",
    "哥林多後書": "新約 / 哥林多後書",
    "哥林多后书": "新約 / 哥林多後書",
    "加拉太書": "新約 / 加拉太書",
    "加拉太书": "新約 / 加拉太書",
    "以弗所書": "新約 / 以弗所書",
    "以弗所书": "新約 / 以弗所書",
    "腓立比書": "新約 / 腓立比書",
    "腓立比书": "新約 / 腓立比書",
    "歌羅西書": "新約 / 歌羅西書",
    "歌罗西书": "新約 / 歌羅西書",
    "帖撒羅尼迦前書": "新約 / 帖撒羅尼迦前書",
    "帖撒罗尼迦前书": "新約 / 帖撒羅尼迦前書",
    "帖撒羅尼迦後書": "新約 / 帖撒羅尼迦後書",
    "帖撒罗尼迦后书": "新約 / 帖撒羅尼迦後書",
    "提摩太前書": "新約 / 提摩太前書",
    "提摩太前书": "新約 / 提摩太前書",
    "提摩太後書": "新約 / 提摩太後書",
    "提摩太后书": "新約 / 提摩太後書",
    "提多書": "新約 / 提多書",
    "提多书": "新約 / 提多書",
    "希伯來書": "新約 / 希伯來書",
    "希伯来书": "新約 / 希伯來書",
    "雅各書": "新約 / 雅各書",
    "雅各书": "新約 / 雅各書",
    "彼得前書": "新約 / 彼得前書",
    "彼得前书": "新約 / 彼得前書",
    "彼得後書": "新約 / 彼得後書",
    "彼得后书": "新約 / 彼得後書",
    "約翰一書": "新約 / 約翰一書",
    "约翰一书": "新約 / 約翰一書",
    "約翰二書": "新約 / 約翰二書",
    "约翰二书": "新約 / 約翰二書",
    "約翰三書": "新約 / 約翰三書",
    "约翰三书": "新約 / 約翰三書",
    "猶大書": "新約 / 猶大書",
    "犹大书": "新約 / 猶大書",
    "啟示錄": "新約 / 啟示錄",
    "启示录": "新約 / 啟示錄",
}

def _detect_book_name_from_title(title):
    """從標題識別書卷名稱，返回分類名稱（如「舊約 / 創世記」）。"""
    if not title:
        return None
    t = title.strip()
    # 直接匹配書卷名稱
    if t in BOOK_NAMES_MAP:
        return BOOK_NAMES_MAP[t]
    # 檢查是否包含書卷名稱（如「創世記問題」）
    for book_name, category in BOOK_NAMES_MAP.items():
        if book_name in t:
            return category
    return None


def _is_chen_section(href):
    if not href:
        return False
    h = href.lower()
    if "xu1" in h and "chen" in h:
        return True
    for idx in INDEX_CATEGORY:
        if idx in h and "bibleqa" not in h:
            return True
    return False


# 通用區塊中略過「純導覽」連結（整則標題為此才略過，避免「xxx首頁」被誤殺）
SKIP_NAV_TITLES = ("回网站首页", "回网站", "返回", "回目录", "更多", "首頁")


def _collect_links_from_tag(tag):
    """從一顆節點內擷取所有 http(s) 連結，回傳 [(title, url), ...]。"""
    out = []
    for a in tag.find_all("a", href=True):
        href = (a.get("href") or "").strip()
        if not href.startswith("http"):
            continue
        text = (a.get_text() or "").strip()
        text = decode_entity_text(text)
        if not text or len(text) < 2:
            continue
        if text in SKIP_NAV_TITLES:
            continue
        out.append((text[:200], href))
    return out


def _allowed_generic_labels():
    """僅解析標題與 links_merged 的 label 一致的區塊，避免整份 qna02 每個 h2 都成來源。"""
    if not os.path.isfile(MERGED_PATH):
        return set()
    try:
        with open(MERGED_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        return { (s.get("label") or "").strip() for s in (data.get("sources") or []) if (s.get("label") or "").strip() }
    except Exception:
        return set()


def parse_with_bs4(path):
    """BeautifulSoup：恩泉陳終道（xu1/index1~5）+ 通用「標題 + 連結列表」區塊（僅 label 在白名單）。
    
    支援多層分類結構（如：以斯拉百科－辯道護教 > 基要衛道 > 意義與使命）。
    """
    try:
        from bs4 import BeautifulSoup
    except ImportError:
        return None
    allowed = _allowed_generic_labels()
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        raw = f.read()
    soup = BeautifulSoup(raw, "html.parser")
    tree = {}
    current_source = None
    current_category = None  # 書卷分類（如「舊約 / 創世記」）
    current_subcategory = None  # 子分類（如「意義與使命」）
    generic_section = None  # 當前通用區塊標題（須在 allowed 內）
    parent_subcategory_link = None  # 父分類連結（用於識別子分類）

    for tag in soup.find_all(["h1", "h2", "h3", "h4", "p", "div", "ul", "li"]):
        if tag.name in ("h1", "h2", "h3", "h4"):
            a = tag.find("a", href=True)
            href = (a.get("href") or "").strip() if a else ""
            # 獲取標題文字（包括內部所有文字，不只看直接文字）
            heading_text = decode_entity_text(tag.get_text(separator=" ", strip=True)).strip()[:200]
            
            # 根據標籤層級識別分類結構（使用者約定）：
            # H2 = 大網站（第一層，沿用舊結構）
            # H3 = 網站名稱 (A)
            # H4 = 其下分類/書卷 (B)；若尾為 " - 以斯拉百科網" 則取前面為分類名
            # 其餘 = 難題題目
            
            if tag.name == "h2":
                # GotQuestions 英文：若已是本區且此 h2 為「Questions about X - Got Questions」，依連結設 current_category
                if generic_section == "GotQuestions 英文" and href and "gotquestions.org/content_" in href:
                    gq_cat = None
                    if "content_God.html" in href:
                        gq_cat = "關於上帝的問題"
                    elif "content_Jesus-Christ" in href or "content_Christ" in href:
                        gq_cat = "關於耶穌基督的問題"
                    elif "content_Holy-Spirit" in href:
                        gq_cat = "關於聖靈的問題"
                    elif "content_salvation" in href:
                        gq_cat = "關於救贖的問題"
                    elif "content_Bible" in href:
                        gq_cat = "關於聖經的問題"
                    elif "new-believer" in href:
                        gq_cat = "新基督徒的重要問題"
                    elif "content_church" in href:
                        gq_cat = "關於教會的問題"
                    elif "content_end-times" in href:
                        gq_cat = "關於末世的問題"
                    elif "content_angels_demons" in href:
                        gq_cat = "關於天使與惡魔的問題"
                    elif "content_humanity" in href:
                        gq_cat = "關於人性的疑問"
                    elif "content_theology" in href:
                        gq_cat = "關於神學的問題"
                    elif "content_apologetics" in href:
                        gq_cat = "關於護教學的問題"
                    elif "content_worldview" in href:
                        gq_cat = "關於世界觀的問題"
                    elif "content_Spiritual" in href or "content_spiritual" in href:
                        gq_cat = "關於屬靈生活的問題"
                    elif "content_prayer" in href or "content_Prayer" in href:
                        gq_cat = "關於禱告的問題"
                    elif "content_sin" in href or "content_Sin" in href:
                        gq_cat = "關於罪的問題"
                    elif "content_eternity" in href or "content_Eternity" in href:
                        gq_cat = "關於永恆的問題"
                    elif "content_relationship" in href or "content_Relationships" in href:
                        gq_cat = "關於關係的問題"
                    elif "content_family" in href or "content_Family" in href:
                        gq_cat = "關於家庭的問題"
                    elif "content_creation" in href or "content_Creation" in href:
                        gq_cat = "關於創造的問題"
                    elif "content_cults" in href or "content_Cults" in href:
                        gq_cat = "關於邪教與宗教的問題"
                    elif "content_false" in href or "content_False" in href:
                        gq_cat = "關於錯誤信念的問題"
                    elif "content_Christianity" in href or "content_christianity" in href:
                        gq_cat = "關於基督教的問題"
                    elif "content_history" in href or "content_Christian" in href:
                        gq_cat = "關於基督教歷史的問題"
                    elif "content_place" in href or "content_Place" in href:
                        gq_cat = "關於聖經中的地方"
                    elif "content_people" in href or "content_People" in href:
                        gq_cat = "關於聖經人物的問題"
                    elif "content_health" in href or "content_Health" in href:
                        gq_cat = "關於健康的問題"
                    elif "content_life" in href or "content_Life" in href:
                        gq_cat = "關於生命的問題"
                    elif "content_topical" in href or "content_Topical" in href:
                        gq_cat = "主題聖經問題"
                    elif "content_Books" in href or "content_books" in href:
                        gq_cat = "關於聖經書卷的問題"
                    elif "content_Catholicism" in href or "content_catholicism" in href:
                        gq_cat = "關於天主教的問題"
                    elif "content_Judaism" in href or "content_judaism" in href:
                        gq_cat = "關於猶太教的問題"
                    elif "content_Islam" in href or "content_islam" in href:
                        gq_cat = "關於伊斯蘭教的問題"
                    elif "content_GotQuestions" in href or "GotQuestions" in href:
                        gq_cat = "關於 GotQuestions.org 的問題"
                    if gq_cat:
                        current_category = gq_cat
                        current_subcategory = None
                        tree.setdefault(generic_section, {}).setdefault(GENERIC_CATEGORY, {})
                        if current_category not in tree[generic_section][GENERIC_CATEGORY]:
                            tree[generic_section][GENERIC_CATEGORY][current_category] = []
                    continue
                # H2：大網站（第一層）
                # 聖經難題 - 以斯拉百科網：作為頂層來源
                if "聖經難題" in heading_text and ("以斯拉百科網" in heading_text or "以斯拉百科网" in heading_text):
                    generic_section = "聖經難題 - 以斯拉百科網"
                    current_category = None
                    current_subcategory = None
                    parent_subcategory_link = None
                    tree.setdefault(generic_section, {}).setdefault(GENERIC_CATEGORY, {})
                    SEEN_HEADINGS.add((heading_text[:50], generic_section))
                    continue
                label = map_heading_to_label(heading_text, allowed)
                if label:
                    generic_section = label
                    current_category = None
                    current_subcategory = None
                    parent_subcategory_link = None
                    tree.setdefault(generic_section, {}).setdefault(GENERIC_CATEGORY, {})
                    SEEN_HEADINGS.add((heading_text[:50], label))
                else:
                    generic_section = heading_text.strip()
                    current_category = None
                    current_subcategory = None
                    tree.setdefault(generic_section, {}).setdefault(GENERIC_CATEGORY, {})
                continue
            
            elif tag.name == "h3":
                # GotQuestions 英文：H3 為主題分類（關於上帝的問題、關於耶穌基督的問題等），不另開 section
                if generic_section == "GotQuestions 英文" and href and "gotquestions.org" in href:
                    # 取第一個連結文字或標題前半作為分類名（如「關於上帝的問題」）
                    raw = heading_text.strip()
                    cat_name = raw.split("|")[0].strip() if "|" in raw else raw[:50].strip()
                    if not cat_name and a:
                        cat_name = decode_entity_text((a.get_text() or "").strip())[:50]
                    if cat_name and len(cat_name) > 1:
                        current_category = cat_name
                        current_subcategory = None
                        tree.setdefault(generic_section, {}).setdefault(GENERIC_CATEGORY, {})
                        if current_category not in tree[generic_section][GENERIC_CATEGORY]:
                            tree[generic_section][GENERIC_CATEGORY][current_category] = []
                    SEEN_HEADINGS.add((heading_text[:50], generic_section))
                    continue
                # 恩泉－新約聖經難題 蘇佐揚：H3 為書卷分類（如「马太福音 - 苏佐扬」），提取書卷名作為分類
                raw = heading_text.strip()
                if generic_section == "恩泉－新約聖經難題 蘇佐揚" and (" - 苏佐扬" in raw or " - 蘇佐揚" in raw):
                    book_name = raw.split(" - ")[0].strip()
                    if book_name and len(book_name) > 1:
                        current_category = book_name
                        current_subcategory = None
                        tree.setdefault(generic_section, {}).setdefault(GENERIC_CATEGORY, {})
                        if current_category not in tree[generic_section][GENERIC_CATEGORY]:
                            tree[generic_section][GENERIC_CATEGORY][current_category] = []
                    SEEN_HEADINGS.add((heading_text[:50], generic_section))
                    continue
                # H3：網站名稱 (A)。若為 "XXX - 以斯拉百科網" 則網站=以斯拉百科，分類=XXX
                if " - 以斯拉百科網" in raw or " - 以斯拉百科网" in raw:
                    cat_part = raw.split(" - ")[0].strip()
                    # 聖經難題 - 以斯拉百科網：H3「新約難題 - 以斯拉百科網」作為分類，「馬太福音 - 以斯拉百科網」作為子分類
                    if generic_section == "聖經難題 - 以斯拉百科網":
                        if cat_part == "新約難題" or cat_part == "新约难题":
                            current_category = "新約難題"
                            current_subcategory = None
                            tree.setdefault(generic_section, {}).setdefault(GENERIC_CATEGORY, {})
                            if current_category not in tree[generic_section][GENERIC_CATEGORY]:
                                tree[generic_section][GENERIC_CATEGORY][current_category] = {}
                            SEEN_HEADINGS.add((heading_text[:50], generic_section))
                            continue
                        elif current_category == "新約難題":
                            # 書卷名（如「馬太福音」）作為「新約難題」下的子分類
                            current_subcategory = cat_part if len(cat_part) > 1 else None
                            if current_subcategory:
                                if GENERIC_CATEGORY not in tree[generic_section]:
                                    tree[generic_section][GENERIC_CATEGORY] = {}
                                if current_category not in tree[generic_section][GENERIC_CATEGORY]:
                                    tree[generic_section][GENERIC_CATEGORY][current_category] = {}
                                if current_subcategory not in tree[generic_section][GENERIC_CATEGORY][current_category]:
                                    tree[generic_section][GENERIC_CATEGORY][current_category][current_subcategory] = []
                            SEEN_HEADINGS.add((heading_text[:50], generic_section))
                            continue
                        else:
                            # 其他分類（如「舊約難題」）作為平級分類
                            current_category = cat_part if len(cat_part) > 1 else None
                            current_subcategory = None
                            tree.setdefault(generic_section, {}).setdefault(GENERIC_CATEGORY, {})
                            if current_category and current_category not in tree[generic_section][GENERIC_CATEGORY]:
                                tree[generic_section][GENERIC_CATEGORY][current_category] = []
                            SEEN_HEADINGS.add((heading_text[:50], generic_section))
                            continue
                    # 其他以斯拉百科網來源：網站統一為「以斯拉百科網」；分類為 XXX
                    generic_section = "以斯拉百科網"
                    current_category = cat_part if len(cat_part) > 1 else None
                    current_subcategory = None
                    tree.setdefault(generic_section, {}).setdefault(GENERIC_CATEGORY, {})
                    if current_category and current_category not in tree[generic_section][GENERIC_CATEGORY]:
                        tree[generic_section][GENERIC_CATEGORY][current_category] = []
                    SEEN_HEADINGS.add((heading_text[:50], generic_section))
                    continue
                label = map_heading_to_label(raw, allowed)
                if label:
                    generic_section = label
                else:
                    generic_section = raw
                current_category = None
                current_subcategory = None
                parent_subcategory_link = None
                tree.setdefault(generic_section, {}).setdefault(GENERIC_CATEGORY, {})
                SEEN_HEADINGS.add((heading_text[:50], generic_section))
                continue
            
            elif tag.name == "h4":
                # H4：其下分類 (B)。若尾為 " - 以斯拉百科網" 則取前面為分類名
                if generic_section:
                    raw = heading_text.strip()
                    # 移除尾綴 " - 以斯拉百科網"
                    if " - 以斯拉百科網" in raw or " - 以斯拉百科网" in raw:
                        raw = raw.split(" - ")[0].strip()
                    # 移除 " - Solutions To Bible ?Errors?" 等網站名尾綴
                    if " - " in raw and ("Solutions To" in raw or "Bible ?Errors" in raw or "defendinginerrancy" in raw.lower()):
                        raw = raw.split(" - ")[0].strip()
                    cat_name = raw
                    book_name = _detect_book_name_from_title(cat_name)
                    if book_name:
                        current_category = book_name
                    else:
                        current_category = cat_name if len(cat_name) > 1 else "未標註經文／主題"
                    current_subcategory = None
                    if GENERIC_CATEGORY not in tree[generic_section]:
                        tree[generic_section][GENERIC_CATEGORY] = {}
                    if current_category not in tree[generic_section][GENERIC_CATEGORY]:
                        tree[generic_section][GENERIC_CATEGORY][current_category] = []
                continue
            
            # 處理 H1（保留舊邏輯以兼容現有結構）
            elif tag.name == "h1":
                # 恩泉陳終道：xu1 或 index1~5
                if a and _is_chen_section(href):
                    generic_section = None
                    current_subcategory = None
                    parent_subcategory_link = None
                    if "xu1" in href and "chen" in href:
                        current_source = "恩泉－聖經問題解答 陳終道"
                        current_category = None
                    else:
                        for idx, cat in INDEX_CATEGORY.items():
                            if idx in href and "bibleqa" not in href:
                                if current_source:
                                    current_category = cat
                                    tree.setdefault(current_source, {}).setdefault(cat, [])
                                break
                    continue

                # 通用區塊：標題盡量對應到 links_merged 的某個 label
                label = map_heading_to_label(heading_text, allowed)
                if label:
                    # 檢查是否為子分類連結（在 `<ul type="square">` 內的 `<h2><a>`）
                    parent_ul = tag.find_parent("ul", type="square")
                    if parent_ul and a:
                        # 這是子分類標題（如「意義與使命」、「辯道學的歷史」）
                        if generic_section:
                            subcat_name = heading_text.strip()
                            # 移除「以斯拉百科網」等後綴
                            if " - " in subcat_name:
                                subcat_name = subcat_name.split(" - ")[0].strip()
                            if subcat_name and len(subcat_name) > 2:
                                current_subcategory = subcat_name
                                parent_subcategory_link = href
                                # 確保子分類存在
                                if GENERIC_CATEGORY not in tree[generic_section]:
                                    tree[generic_section][GENERIC_CATEGORY] = {}
                                if current_subcategory not in tree[generic_section][GENERIC_CATEGORY]:
                                    tree[generic_section][GENERIC_CATEGORY][current_subcategory] = []
                                continue
                    else:
                        # 這是主分類標題
                        generic_section = label
                        current_category = None  # 重置書卷分類
                        current_subcategory = None
                        parent_subcategory_link = None
                        tree.setdefault(generic_section, {}).setdefault(GENERIC_CATEGORY, {})
                        # 記錄找到的標題（除錯用）
                        SEEN_HEADINGS.add((heading_text[:50], label))
                else:
                    # 檢查是否為子分類標題（在 `<h1 class="etspediaPageTitle1">` 中，包含 " > " 分隔符）
                    if tag.name == "h1" and tag.get("class") and "etspediaPageTitle1" in tag.get("class", []):
                        if " > " in heading_text and "以斯拉百科網" in heading_text:
                            # 提取子分類名稱（如「辯道護教 > 基要衛道 > 辯道學之意義與使命」中的「辯道學之意義與使命」）
                            parts = heading_text.split(" > ")
                            if len(parts) >= 3:
                                subcat_name = parts[-1].strip()
                                if " - " in subcat_name:
                                    subcat_name = subcat_name.split(" - ")[0].strip()
                                if generic_section and subcat_name and len(subcat_name) > 2:
                                    # 設置父分類名稱，但不立即設置 current_subcategory（因為後面會有更細的 h2）
                                    # 這裡先記錄，但實際的子分類會在 <ul class="topics"> 內的 <h2> 中設置
                                    pass
            continue

        # 檢查 `<p>` 中的子分類連結（如「基要衛道 - 以斯拉百科網」）
        if tag.name == "p" and generic_section:
            full_text = decode_entity_text(tag.get_text(separator=" ", strip=True))
            # 恩泉－新約聖經難題 蘇佐揚：<p> 內為 "马可福音 - 苏佐扬" 等書卷標題
            if generic_section == "恩泉－新約聖經難題 蘇佐揚" and (" - 苏佐扬" in full_text or " - 蘇佐揚" in full_text):
                book_name = full_text.split(" - ")[0].strip()
                if book_name and len(book_name) > 1 and len(book_name) <= 30:
                    current_category = book_name
                    current_subcategory = None
                    if GENERIC_CATEGORY not in tree[generic_section]:
                        tree[generic_section][GENERIC_CATEGORY] = {}
                    if current_category not in tree[generic_section][GENERIC_CATEGORY]:
                        tree[generic_section][GENERIC_CATEGORY][current_category] = []
            # 恩泉－舊約聖經難題 李道生：<p> 內第一個指向 old2-li/htm/chapterXX.html（無 #）的連結文字為書卷/分類名
            elif generic_section == "恩泉－舊約聖經難題 李道生" and "old2-li" in str(tag):
                for first_a in tag.find_all("a", href=True):
                    h = (first_a.get("href") or "").strip()
                    if "old2-li/htm/chapter" in h and "#" not in h:
                        book_name = decode_entity_text(first_a.get_text()).strip()
                        if book_name and len(book_name) <= 30:
                            current_category = book_name
                            current_subcategory = None
                            if GENERIC_CATEGORY not in tree[generic_section]:
                                tree[generic_section][GENERIC_CATEGORY] = {}
                            if current_category not in tree[generic_section][GENERIC_CATEGORY]:
                                tree[generic_section][GENERIC_CATEGORY][current_category] = []
                        break
            # Defending Inerrancy：<p> 內為 "MATTHEW  - Solutions To Bible ?Errors?" 等書卷標題
            elif "defendinginerrancy.com" in str(tag) and " - " in full_text and ("Solutions To" in full_text or "Bible" in full_text):
                # 取 "XXX  - " 的 XXX 作為書卷/分類名
                parts = full_text.split(" - ", 1)
                if parts:
                    cat_name = parts[0].strip()
                    if cat_name and len(cat_name) <= 30:
                        current_category = cat_name
                        if GENERIC_CATEGORY not in tree[generic_section]:
                            tree[generic_section][GENERIC_CATEGORY] = {}
                        if current_category not in tree[generic_section][GENERIC_CATEGORY]:
                            tree[generic_section][GENERIC_CATEGORY][current_category] = []
            for a in tag.find_all("a", href=True):
                href = (a.get("href") or "").strip()
                text = decode_entity_text(a.get_text()).strip()
                if "equiptoserve.org/etspedia" in href and "基要衛道" in text:
                    # 這是子分類入口，但不改變 current_subcategory，因為後面會有更細的分類
                    continue

        # 處理 `<ul class="topics">`：這是以斯拉百科的題目列表結構
        if tag.name == "ul" and tag.get("class") and "topics" in tag.get("class", []):
            if generic_section:
                if GENERIC_CATEGORY not in tree[generic_section]:
                    tree[generic_section][GENERIC_CATEGORY] = {}
                # 遍歷 <ul class="topics"> 內的所有子元素
                for child in tag.children:
                    if hasattr(child, 'name'):
                        # 處理 <h2> 子分類標題
                        if child.name == "h2":
                            heading_text = decode_entity_text(child.get_text(separator=" ", strip=True)).strip()
                            if heading_text and len(heading_text) > 2:
                                current_subcategory = heading_text
                                if current_subcategory not in tree[generic_section][GENERIC_CATEGORY]:
                                    tree[generic_section][GENERIC_CATEGORY][current_subcategory] = []
                        # 處理 <li> 題目連結
                        elif child.name == "li":
                            for a in child.find_all("a", href=True):
                                href = (a.get("href") or "").strip()
                                if not href.startswith("http"):
                                    continue
                                text = decode_entity_text(a.get_text()).strip()
                                if not text or len(text) < 3:
                                    continue
                                # 過濾導覽連結和分類標題連結（這些是分類頁，不是題目）
                                skip_patterns = ["回网站", "返回", "回目录", "更多", "首頁", "返回網站", "以斯拉百科網", "基要衛道", 
                                                "意義與使命", "辯道學的歷史", "辯道學的重振", "上帝的存在和啟示", "基督的起源", "基督的救恩"]
                                if text in SKIP_NAV_TITLES or any(pattern in text for pattern in skip_patterns):
                                    continue
                                # 過濾分類頁連結（URL 中沒有具體題目路徑，只有分類頁）
                                # 分類頁 URL 通常以分類名稱結尾，而題目 URL 通常有具體路徑
                                if "/etspedia/" in href and not any(x in href for x in ["/", "?", "#"]) and len(href.split("/")) <= 5:
                                    # 可能是分類頁，跳過
                                    continue
                                # 歸類到當前子分類
                                if current_subcategory:
                                    if current_subcategory not in tree[generic_section][GENERIC_CATEGORY]:
                                        tree[generic_section][GENERIC_CATEGORY][current_subcategory] = []
                                    tree[generic_section][GENERIC_CATEGORY][current_subcategory].append({"title": text[:200], "url": href})
                                else:
                                    # 沒有子分類，歸類到「未分類」
                                    if "未分類" not in tree[generic_section][GENERIC_CATEGORY]:
                                        tree[generic_section][GENERIC_CATEGORY]["未分類"] = []
                                    tree[generic_section][GENERIC_CATEGORY]["未分類"].append({"title": text[:200], "url": href})
            continue

        if tag.name in ("p", "div", "ul", "li"):
            if generic_section:
                # GotQuestions 英文：<li> 內若有 <h3> 含 gotquestions 連結，先設 current_category 再收集連結
                if tag.name == "li" and generic_section == "GotQuestions 英文":
                    h3 = tag.find("h3")
                    if h3:
                        a = h3.find("a", href=True)
                        if a and "gotquestions.org" in (a.get("href") or ""):
                            # 優先用連結文字（如「關於上帝的問題」），避免帶「上帝的本質 |...」後綴
                            cat_name = decode_entity_text((a.get_text() or "").strip())[:50]
                            if not cat_name or len(cat_name) < 2:
                                raw = decode_entity_text(h3.get_text(separator=" ", strip=True)).strip()
                                cat_name = (raw.split("|")[0].strip() if "|" in raw else raw[:50]).strip()
                            if cat_name and len(cat_name) > 1:
                                current_category = cat_name
                                tree.setdefault(generic_section, {}).setdefault(GENERIC_CATEGORY, {})
                                if current_category not in tree[generic_section][GENERIC_CATEGORY]:
                                    tree[generic_section][GENERIC_CATEGORY][current_category] = []
                # 跳過已經處理過的 <ul class="topics">
                if tag.name == "ul" and tag.get("class") and "topics" in tag.get("class", []):
                    continue
                # 跳過在 <ul class="topics"> 內的 <li>（已經在上面處理過了）
                if tag.name == "li" and tag.find_parent("ul", class_="topics"):
                    continue
                # 不在 topics 列表內，使用舊邏輯（但只處理非以斯拉百科的來源，或非 topics 結構的連結）
                # 對於以斯拉百科，只處理 topics 內的連結，避免重複收集
                if "equiptoserve.org" not in str(tag) or tag.find_parent("ul", class_="topics") is None:
                    # 檢查是否為書卷分類連結（如「創世記」、「出埃及記」）
                    # 這些連結通常指向 chapterXX.html（沒有 # 錨點），且標題是書卷名稱
                    for a in tag.find_all("a", href=True):
                        href = (a.get("href") or "").strip()
                        title = decode_entity_text(a.get_text()).strip()
                        if not title or len(title) < 2:
                            continue
                        # 過濾導覽連結
                        skip_patterns = ["回网站", "返回", "回目录", "更多", "首頁", "返回網站", "以斯拉百科網", "基要衛道",
                                        "意義與使命", "辯道學的歷史", "辯道學的重振", "上帝的存在和啟示", "基督的起源", "基督的救恩"]
                        if title in SKIP_NAV_TITLES or any(pattern in title for pattern in skip_patterns):
                            continue
                        # 恩泉－舊約聖經難題 李道生：略過 index 與「李道生」連結；書卷連結已在 <p> 設 current_category
                        if generic_section == "恩泉－舊約聖經難題 李道生":
                            if "old2-li" not in href:
                                continue
                            if "old2-li/index" in href or title.strip() == "李道生":
                                continue
                            if "old2-li/htm/chapter" in href and "#" in href:
                                if current_category:
                                    if GENERIC_CATEGORY not in tree[generic_section]:
                                        tree[generic_section][GENERIC_CATEGORY] = {}
                                    if current_category not in tree[generic_section][GENERIC_CATEGORY]:
                                        tree[generic_section][GENERIC_CATEGORY][current_category] = []
                                    tree[generic_section][GENERIC_CATEGORY][current_category].append({"title": title[:200], "url": href})
                                continue
                            if "old2-li/htm/chapter" in href and "#" not in href:
                                current_category = title.strip() if title.strip() and len(title.strip()) <= 30 else current_category
                                if current_category:
                                    if GENERIC_CATEGORY not in tree[generic_section]:
                                        tree[generic_section][GENERIC_CATEGORY] = {}
                                    if current_category not in tree[generic_section][GENERIC_CATEGORY]:
                                        tree[generic_section][GENERIC_CATEGORY][current_category] = []
                                    tree[generic_section][GENERIC_CATEGORY][current_category].append({"title": title[:200], "url": href})
                                continue
                        
                        # 檢查是否為書卷分類連結（指向 chapterXX.html，沒有 # 錨點）
                        # 且標題是書卷名稱（如「創世記」、「出埃及記」）
                        # 注意：chapterXX.html 是書卷分類，chapterXX.XX.html#XX 是具體題目
                        if "tochrist.org/book/download_books/sjnthb/chapter" in href:
                            # 檢查是否為書卷分類連結（如 chapter06.html，沒有小數點和 #）
                            filename = href.split("/")[-1]
                            is_book_link = "#" not in href and "." not in filename.replace(".html", "")
                            if is_book_link:
                                # 這是書卷分類連結，檢查標題是否為書卷名稱
                                book_name = _detect_book_name_from_title(title)
                                if book_name:
                                    # 這是書卷分類，設置為當前分類
                                    current_category = book_name
                                    if GENERIC_CATEGORY not in tree[generic_section]:
                                        tree[generic_section][GENERIC_CATEGORY] = {}
                                    if current_category not in tree[generic_section][GENERIC_CATEGORY]:
                                        tree[generic_section][GENERIC_CATEGORY][current_category] = []
                                    # 書卷分類連結本身也加入（作為分類入口）
                                    tree[generic_section][GENERIC_CATEGORY][current_category].append({"title": title, "url": href})
                                    continue
                            else:
                                # 這是具體題目連結（如 chapter06.1.html#10），歸類到當前分類
                                if current_category:
                                    if GENERIC_CATEGORY not in tree[generic_section]:
                                        tree[generic_section][GENERIC_CATEGORY] = {}
                                    if current_category not in tree[generic_section][GENERIC_CATEGORY]:
                                        tree[generic_section][GENERIC_CATEGORY][current_category] = []
                                    tree[generic_section][GENERIC_CATEGORY][current_category].append({"title": title, "url": href})
                                    continue
                        
                        # 這是題目連結，歸類到當前分類
                        if current_category:
                            if GENERIC_CATEGORY not in tree[generic_section]:
                                tree[generic_section][GENERIC_CATEGORY] = {}
                            # 聖經難題 - 以斯拉百科網：如果 current_category 是 dict（如「新約難題」）且有 current_subcategory，歸類到子分類
                            if current_subcategory and current_category in tree[generic_section][GENERIC_CATEGORY] and isinstance(tree[generic_section][GENERIC_CATEGORY][current_category], dict):
                                if current_subcategory not in tree[generic_section][GENERIC_CATEGORY][current_category]:
                                    tree[generic_section][GENERIC_CATEGORY][current_category][current_subcategory] = []
                                tree[generic_section][GENERIC_CATEGORY][current_category][current_subcategory].append({"title": title, "url": href})
                            else:
                                # 如果 current_category 不存在或不是 dict，初始化為 list
                                if current_category not in tree[generic_section][GENERIC_CATEGORY]:
                                    tree[generic_section][GENERIC_CATEGORY][current_category] = []
                                # 如果已經是 dict 但沒有 current_subcategory，歸類到「未分類」子分類
                                if isinstance(tree[generic_section][GENERIC_CATEGORY][current_category], dict):
                                    if "未分類" not in tree[generic_section][GENERIC_CATEGORY][current_category]:
                                        tree[generic_section][GENERIC_CATEGORY][current_category]["未分類"] = []
                                    tree[generic_section][GENERIC_CATEGORY][current_category]["未分類"].append({"title": title, "url": href})
                                else:
                                    tree[generic_section][GENERIC_CATEGORY][current_category].append({"title": title, "url": href})
                        elif current_subcategory:
                            if GENERIC_CATEGORY not in tree[generic_section]:
                                tree[generic_section][GENERIC_CATEGORY] = {}
                            if current_subcategory not in tree[generic_section][GENERIC_CATEGORY]:
                                tree[generic_section][GENERIC_CATEGORY][current_subcategory] = []
                            tree[generic_section][GENERIC_CATEGORY][current_subcategory].append({"title": title, "url": href})
                        else:
                            # 如果沒有分類結構，使用舊的扁平結構
                            if GENERIC_CATEGORY not in tree[generic_section]:
                                tree[generic_section][GENERIC_CATEGORY] = []
                            if isinstance(tree[generic_section][GENERIC_CATEGORY], list):
                                tree[generic_section][GENERIC_CATEGORY].append({"title": title, "url": href})
                            else:
                                # 如果已經是字典，歸類到「未分類」
                                if "未分類" not in tree[generic_section][GENERIC_CATEGORY]:
                                    tree[generic_section][GENERIC_CATEGORY]["未分類"] = []
                                tree[generic_section][GENERIC_CATEGORY]["未分類"].append({"title": title, "url": href})
                else:
                    # 不在 topics 列表內，使用舊邏輯
                    for title, url in _collect_links_from_tag(tag):
                        # 過濾導覽連結
                        if title in SKIP_NAV_TITLES or any(nav in title for nav in ["回网站", "返回", "回目录", "更多", "首頁", "返回網站"]):
                            continue
                        # 如果當前有子分類，歸類到子分類；否則歸類到「目錄」
                        if current_subcategory:
                            if GENERIC_CATEGORY not in tree[generic_section]:
                                tree[generic_section][GENERIC_CATEGORY] = {}
                            if current_subcategory not in tree[generic_section][GENERIC_CATEGORY]:
                                tree[generic_section][GENERIC_CATEGORY][current_subcategory] = []
                            tree[generic_section][GENERIC_CATEGORY][current_subcategory].append({"title": title, "url": url})
                        else:
                            # 如果沒有子分類結構，使用舊的扁平結構
                            if GENERIC_CATEGORY not in tree[generic_section]:
                                tree[generic_section][GENERIC_CATEGORY] = []
                            if isinstance(tree[generic_section][GENERIC_CATEGORY], list):
                                tree[generic_section][GENERIC_CATEGORY].append({"title": title, "url": url})
                            else:
                                # 如果已經是字典，歸類到「未分類」
                                if "未分類" not in tree[generic_section][GENERIC_CATEGORY]:
                                    tree[generic_section][GENERIC_CATEGORY]["未分類"] = []
                                tree[generic_section][GENERIC_CATEGORY]["未分類"].append({"title": title, "url": url})
            elif current_source and current_category:
                # 恩泉陳終道：只收集 bibleqa 連結
                for a in tag.find_all("a", href=True):
                    href = (a.get("href") or "").strip()
                    text = (a.get_text() or "").strip()
                    text = decode_entity_text(text)
                    if not text or len(text) < 3:
                        continue
                    if "回网站" in text or "返回" in text or "回目录" in text or "更多" in text or "首頁" in text:
                        continue
                    if "bibleqa" in href or ("/bible_qna/" in href and "index" not in href and "xu1" not in href):
                        full_url = href if href.startswith("http") else "https://wellsofgrace.com/messages/chen/bible_qna/" + href.lstrip("/")
                        tree[current_source][current_category].append({"title": text[:200], "url": full_url})
    return tree


def parse_fallback(path):
    """無 BeautifulSoup 時用 HTMLParser 簡單掃描。"""
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        raw = f.read()
    p = Qna02Parser()
    p.feed(raw)
    return p.tree


def main():
    if not os.path.isfile(QNA02_PATH):
        print(f"找不到 {QNA02_PATH}，跳過解析。")
        return
    tree = parse_with_bs4(QNA02_PATH)
    if tree is None:
        tree = parse_fallback(QNA02_PATH)
    # 移除空主題
    for src in list(tree.keys()):
        tree[src] = {k: v for k, v in tree[src].items() if v}
    
    # 合併重複的來源（如「以斯拉百科－辯道護教」可能出現兩次）
    merged_tree = {}
    for src_label, categories in tree.items():
        if src_label not in merged_tree:
            merged_tree[src_label] = {}
        for cat, items in categories.items():
            if cat not in merged_tree[src_label]:
                merged_tree[src_label][cat] = items if isinstance(items, dict) else []
            else:
                # 合併分類
                if isinstance(items, dict) and isinstance(merged_tree[src_label][cat], dict):
                    # 兩個都是字典（子分類結構），合併子分類
                    for subcat, subcat_items in items.items():
                        if subcat not in merged_tree[src_label][cat]:
                            merged_tree[src_label][cat][subcat] = []
                        # 去重：檢查 URL 是否已存在
                        existing_urls = {it.get("url") for it in merged_tree[src_label][cat][subcat]}
                        for it in subcat_items:
                            if it.get("url") not in existing_urls:
                                merged_tree[src_label][cat][subcat].append(it)
                elif isinstance(items, list) and isinstance(merged_tree[src_label][cat], list):
                    # 兩個都是列表，合併並去重
                    existing_urls = {it.get("url") for it in merged_tree[src_label][cat]}
                    for it in items:
                        if it.get("url") not in existing_urls:
                            merged_tree[src_label][cat].append(it)
                elif isinstance(items, dict):
                    # items 是字典，merged 是列表，轉換 merged 為字典並將列表歸類到「未分類」
                    old_list = merged_tree[src_label][cat]
                    merged_tree[src_label][cat] = items
                    if "未分類" not in merged_tree[src_label][cat]:
                        merged_tree[src_label][cat]["未分類"] = []
                    existing_urls = {it.get("url") for it in merged_tree[src_label][cat]["未分類"]}
                    for it in old_list:
                        if it.get("url") not in existing_urls:
                            merged_tree[src_label][cat]["未分類"].append(it)
                elif isinstance(merged_tree[src_label][cat], dict):
                    # merged 是字典，items 是列表，將 items 歸類到「未分類」
                    if "未分類" not in merged_tree[src_label][cat]:
                        merged_tree[src_label][cat]["未分類"] = []
                    existing_urls = {it.get("url") for it in merged_tree[src_label][cat]["未分類"]}
                    for it in items:
                        if it.get("url") not in existing_urls:
                            merged_tree[src_label][cat]["未分類"].append(it)
    
    # 清理「未分類」：如果「未分類」中的題目已經在其他子分類中，則移除
    for src_label, categories in merged_tree.items():
        for cat, items in categories.items():
            if isinstance(items, dict) and "未分類" in items:
                # 收集所有子分類的 URL
                all_urls = set()
                for subcat, subcat_data in items.items():
                    if subcat != "未分類":
                        # 處理嵌套結構：如果 subcat_data 是 dict（如「新約難題」下有「馬太福音」等）
                        if isinstance(subcat_data, dict):
                            for subsubcat_name, subsubcat_items in subcat_data.items():
                                if subsubcat_items and isinstance(subsubcat_items, list):
                                    all_urls.update(it.get("url") for it in subsubcat_items if isinstance(it, dict))
                        elif isinstance(subcat_data, list):
                            all_urls.update(it.get("url") for it in subcat_data if isinstance(it, dict))
                # 從「未分類」中移除已存在的題目
                items["未分類"] = [it for it in items["未分類"] if it.get("url") not in all_urls]
                # 如果「未分類」為空，刪除它
                if not items["未分類"]:
                    del items["未分類"]
    
    tree = merged_tree
    
    if not tree:
        print("qna02 未解析出任何來源/主題，請檢查 qna02.htm 結構。")
        return
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump({"tree": tree}, f, ensure_ascii=False, indent=2)
    total = sum(len(it) if isinstance(it, list) else sum(len(v) for v in it.values()) for books in tree.values() for it in books.values())
    try:
        print(f"已寫入 {OUT_PATH}，來源數 {len(tree)}，題目總數 {total}。")
        if SEEN_HEADINGS:
            print(f"\n已識別的標題對應（前10個）：")
            for heading, label in list(SEEN_HEADINGS)[:10]:
                print(f"  '{heading[:40]}...' -> {label}")
    except UnicodeEncodeError:
        # Windows console 編碼問題，改用英文輸出
        print(f"Written to {OUT_PATH}, sources: {len(tree)}, total items: {total}.")
        if SEEN_HEADINGS:
            print(f"\nRecognized headings (first 10):")
            for heading, label in list(SEEN_HEADINGS)[:10]:
                print(f"  '{heading[:40]}...' -> {label}")


if __name__ == "__main__":
    main()
