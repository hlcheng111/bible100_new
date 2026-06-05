#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
根據 qna/data/links_merged.json 產生靜態 HTML 目錄：

四層結構（方案甲）：
  A/B/C 聖經書卷／神學教義／信徒教會難題
    → 網站名稱
      → 書卷（舊約/新約細分到創世記、出埃及記等）或 聖經背景或專題
        → 題目

輸出：
  qna/qna_list_auto.htm              全部來源
  qna/qna_list_chineseapologetics.htm 僅華人護教
  qna/qna_list_equiptoserve.htm       僅以斯拉百科（且只保留「聖經難題」相關連結）
"""

import json
import os
import re
import shutil
from urllib.parse import urlparse, urlunparse, quote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MERGED_PATH = os.path.join(ROOT, "qna", "data", "links_merged.json")
QNA02_TREE_PATH = os.path.join(ROOT, "qna", "data", "qna02_tree.json")
ABC_CONFIG_PATH = os.path.join(ROOT, "qna", "data", "qna_abc_config.json")
QNA_DIR = os.path.join(ROOT, "qna")
QNA_DATA_DIR = os.path.join(ROOT, "qna", "data")
OUT_PATH = os.path.join(QNA_DIR, "qna_list_auto.htm")
OUT_CHINESEAP = os.path.join(QNA_DIR, "qna_list_chineseapologetics.htm")
OUT_EQUIP = os.path.join(QNA_DIR, "qna_list_equiptoserve.htm")
OUT_LEVEL1 = os.path.join(QNA_DATA_DIR, "qna_level1.json")


# 搜尋時繁簡對照（繁體→簡體），用於關鍵字過濾與高亮，使輸入繁體可匹配簡體內容、反之亦然。
TRAD_SIMP_PAIRS = [
    ("聖", "圣"), ("經", "经"), ("創", "创"), ("記", "记"), ("亞", "亚"), ("馬", "马"),
    ("約", "约"), ("羅", "罗"), ("書", "书"), ("歷", "历"), ("傳", "传"), ("說", "说"),
    ("無", "无"), ("門", "门"), ("問", "问"), ("題", "题"), ("難", "难"), ("釋", "释"),
    ("義", "义"), ("與", "与"), ("國", "国"), ("爾", "尔"), ("來", "来"), ("時", "时"),
    ("們", "们"), ("這", "这"), ("為", "为"), ("會", "会"), ("於", "于"), ("論", "论"),
    ("見", "见"), ("從", "从"), ("個", "个"), ("樣", "样"), ("過", "过"), ("還", "还"),
    ("進", "进"), ("開", "开"), ("發", "发"), ("實", "实"), ("學", "学"), ("當", "当"),
    ("報", "报"), ("讀", "读"), ("話", "话"), ("認", "认"), ("許", "许"), ("護", "护"),
    ("導", "导"), ("聞", "闻"), ("關", "关"), ("耶穌", "耶稣"), ("穌", "苏"), ("舊", "旧"),
]

# 以斯拉站內「分類頁」標題（點入為該卷列表頁，非單篇原文）；這些集中到「各書卷（點入以斯拉站內）」。
EQUIP_CATEGORY_TITLES = {
    "創世記", "出埃及記", "利未記", "民數記", "申命記", "約書亞記", "士師記", "路得記",
    "利未記-民數記", "申命記-路得記", "約珥書-瑪拉基書",
    "聖經難題的解答", "介紹",
}

# 以斯拉辯道護教子節被解析成獨立來源時略過，只保留「以斯拉百科－辯道護教」重塑後的結構。
# 「以斯拉百科網」為 qna02 整站入口，僅有少量宗教衛道條目，合併後改由「以斯拉百科－辯道護教」顯示，故略過。
EQUIP_APOLOGETICS_SUBSOURCES_SKIP = {
    "意義與使命", "辯道學的意義", "辯道學的重要", "辯道學的任務",
    "辯道學的歷史", "辯道學的歷史 - 以斯拉百科網", "辯道學的重振",
    "以斯拉百科網",
    "辯道學的權威", "上帝的存在和啟示", "基督的奧祕", "基督的救恩",
    "福音的大能和明證", "辯道學目標與內容", "上帝默示的明證", "聖經的大能證明",
    "聖經的權威", "聖經超凡的感力", "聖經難題的解答", "基督教信仰與科學", "聖經與文化進步",
    "宗教衛道", "宗教基本槪念", "宗教基本概念", "宗教的啟示", "上帝觀念的起源", "世界和人類的起源",
    "人類宗教的起源", "人類宗教的認識", "人類宗教的真諦", "人類得救的真道",
    "儒教的認識", "儒教的批判", "道教的認識", "道教的批判", "佛教的認識", "禪宗的認識",
    "禪宗的批判", "印度教的認識", "印度教的批判", "回教的認識", "回教的批判",
    "弘揚聖道之最高目標",
    # 舊約/新約背景子節（合併進「以斯拉百科－舊約背景」「以斯拉百科－新約背景」後略過）
    "介紹", "近東與舊約", "沃土與文化發展", "族長與異族", "古埃及與亞瑪拿", "出埃及與漂流曠野",
    "應許地與士師", "統一與建國", "王國分裂與衰落", "亡國與被擄", "歸回與重建",
    "政治局勢", "福音書的研究", "羅馬帝國兩大家族", "三位猶太巡撫", "希羅宗教", "猶太教",
    "社群團體", "散居的猶太人", "猶太生活簡介", "新約正典及文獻", "耶穌生平",
}
EQUIP_OT_BACKGROUND_MERGE_SOURCES = [
    "近東與舊約", "沃土與文化發展", "族長與異族", "古埃及與亞瑪拿", "出埃及與漂流曠野",
    "應許地與士師", "統一與建國", "王國分裂與衰落", "亡國與被擄", "歸回與重建",
]
EQUIP_NT_BACKGROUND_MERGE_SOURCES = [
    "政治局勢", "福音書的研究", "羅馬帝國兩大家族", "三位猶太巡撫", "希羅宗教", "猶太教",
    "社群團體", "散居的猶太人", "猶太生活簡介", "新約正典及文獻", "耶穌生平",
]
# 辯道護教：合併進「以斯拉百科－辯道護教」後再略過（qna02 每子題為一頂層來源）
# 基要衛道（辯道）：辯道護教 > 基要衛道 > 子題
EQUIP_APOLOGETICS_BASE_MERGE_SOURCES = [
    "意義與使命", "辯道學的歷史", "辯道學的重振", "上帝的存在和啟示", "基督的奧祕", "基督的救恩",
    "福音的大能和明證", "辯道學目標與內容", "辯道學的權威", "上帝默示的明證", "聖經的大能證明",
    "聖經的權威", "聖經超凡的感力", "聖經難題的解答", "基督教信仰與科學", "聖經與文化進步", "聖經真理萬古常存",
]
# 宗教衛道（護教）：辯道護教 > 宗教衛道 > 子題
EQUIP_APOLOGETICS_MERGE_SOURCES = [
    "宗教基本概念", "宗教的啟示", "上帝觀念的起源", "世界和人類的起源", "人類宗教的起源",
    "人類宗教的認識", "人類宗教的真諦", "人類得救的真道", "儒教的認識", "儒教的批判",
    "道教的認識", "道教的批判", "佛教的認識", "禪宗的認識", "禪宗的批判",
    "印度教的認識", "印度教的批判", "回教的認識", "回教的批判", "弘揚聖道之最高目標",
]

# 以斯拉 辯道護教/舊約背景/新約背景 的 ??? 連結：True=保留 qna02 原始（會 404）；False=依麵包屑還原為兩段 URL（辯道護教-子題）
EQUIP_KEEP_ORIGINAL_URL_FOR_BREADCRUMB = False
# 若上述還原後仍 404，可設為 True，讓辯道護教下所有連結改為「辯道護教－介紹」頁
EQUIP_APOLOGETICS_FALLBACK_TO_INTRO = False

# 華人基督徒查經網站：書卷→目錄頁 index-T.htm
CCB_BASE = "https://www.ccbiblestudy.org/"
CCB_OT = [
    ("創世記", "01Gen"), ("出埃及記", "02Exo"), ("利未記", "03Lev"), ("民數記", "04Num"), ("申命記", "05Deut"),
    ("約書亞記", "06Josh"), ("士師記", "07Judg"), ("路得記", "08Ruth"), ("撒母耳記上", "09%201Sam"), ("撒母耳記下", "10%202Sam"),
    ("列王紀上", "11%201King"), ("列王紀下", "12%202King"), ("歷代志上", "13%201Chro"), ("歷代志下", "14%202Chro"),
    ("以斯拉記", "15Ezra"), ("尼希米記", "16Neh"), ("以斯帖記", "17Esth"), ("約伯記", "18Job"), ("詩篇", "19Psa"), ("箴言", "20Prov"),
    ("傳道書", "21Eccl"), ("雅歌", "22Song"), ("以賽亞書", "23Isa"), ("耶利米書", "24Jer"), ("耶利米哀歌", "25Lam"),
    ("以西結書", "26Ezek"), ("但以理書", "27Dan"), ("何西阿書", "28Hosea"), ("約珥書", "29Joel"), ("阿摩司書", "30Amos"),
    ("俄巴底亞書", "31Obad"), ("約拿書", "32Jonah"), ("彌迦書", "33Micah"), ("那鴻書", "34Nah"), ("哈巴谷書", "35Habak"),
    ("西番雅書", "36Zeph"), ("哈該書", "37Hagg"), ("撒迦利亞書", "38Zech"), ("瑪拉基書", "39Mal"),
]
CCB_NT = [
    ("馬太福音", "40Matt"), ("馬可福音", "41Mark"), ("路加福音", "42Luke"), ("約翰福音", "43John"), ("使徒行傳", "44Acts"),
    ("羅馬書", "45Rom"), ("哥林多前書", "46%201Cor"), ("哥林多後書", "47%202Cor"), ("加拉太書", "48Gal"), ("以弗所書", "49Eph"),
    ("腓立比書", "50Phil"), ("歌羅西書", "51Col"), ("帖撒羅尼迦前書", "52%201Thes"), ("帖撒羅尼迦後書", "53%202Thes"),
    ("提摩太前書", "54%201Tim"), ("提摩太後書", "55%202Tim"), ("提多書", "56Titus"), ("腓利門書", "57Philem"), ("希伯來書", "58Heb"),
    ("雅各書", "59James"), ("彼得前書", "60%201Pet"), ("彼得後書", "61%202Pet"), ("約翰壹書", "62%201John"), ("約翰貳書", "63%202John"), ("約翰叁書", "64%203John"),
    ("猶大書", "65Jude"), ("啟示錄", "66Rev"),
]
CCB_TOPICS = [
    ("67 父神", "67God"), ("68 耶穌基督", "68Christ"), ("69 聖靈", "69Spirit"), ("70 旨意與引導", "70GodsWill"), ("71 神對我們", "71GodToUs"),
    ("72 我們對神", "72UsToGod"), ("73 信望愛", "73FaithHopeLove"), ("74 與神聯合", "74Union"), ("75 敬拜與讚美", "75Worship"),
    ("76 禱告與祈求", "76Prayer"), ("77 讀經與查經", "77Study"), ("78 聖經總論", "78Bible"), ("79 福音與見證", "79Gospel"),
    ("80 救恩與信仰", "80Salvation"), ("81 教會真理", "81Church"), ("82 末世與永世", "82TheEnd"), ("83 靈界與靈戰", "83Spiritual"),
    ("84 一般真理", "84Truth"), ("85 真理的分辨", "85Discern"), ("86 靈魂體剖析", "86Human"), ("87 靈命追求", "87Life"),
    ("88 十字架與成聖", "88Cross"), ("89 品德與性格", "89Character"), ("90 個人生活", "90DailyWalk"), ("91 群體生活", "91Relationship"),
    ("92 教會生活", "92Meeting"), ("93 配搭與事奉", "93Service"), ("94 工人與領袖", "94Worker"), ("95 傳揚與牧養", "95Preach"),
    ("96 聖經著名人物", "96Person"), ("97 教會歷史", "97History"), ("98 特殊專題", "98Special"), ("99 聖經度量衡", "99Others"),
]


def build_ccbiblestudy_tree():
    """華人基督徒查經：舊約查經、新約查經、主題查經 → 書卷/分題 → 目錄頁連結（01index-T.htm 等）。路徑含空格由 encode_url_for_href 統一編碼。"""
    def idx(folder):
        m = re.match(r"^(\d{1,2})", folder.replace("%20", ""))
        return (m.group(1).zfill(2) if m else "00") + "index-T.htm"
    ot = {}
    for name, folder in CCB_OT:
        ot[name] = [{"title": name, "url": CCB_BASE + "Old Testament/" + folder + "/" + idx(folder)}]
    nt = {}
    for name, folder in CCB_NT:
        nt[name] = [{"title": name, "url": CCB_BASE + "New Testament/" + folder + "/" + idx(folder)}]
    topics = {}
    for name, folder in CCB_TOPICS:
        num = re.match(r"(\d+)", folder)
        idx_t = (num.group(1) + "index-T.htm") if num else folder + "index-T.htm"
        topics[name] = [{"title": name, "url": CCB_BASE + "Topics/" + folder + "/" + idx_t}]
    return {"舊約查經": ot, "新約查經": nt, "主題查經": topics}


# 僅對以下來源套用「舊約→新約」書卷排序；其餘來源保留爬取順序。
SOURCES_USE_CANONICAL_ORDER = (
    "以斯拉百科－申命記～路得記",
    "華人護教－聖經難題（錯誤/矛盾）解答",
)

# 書卷顯示順序（舊約→新約），僅用於 SOURCES_USE_CANONICAL_ORDER 的來源。
BOOK_DISPLAY_ORDER = [
    "舊約 / 創世記", "舊約 / 出埃及記", "舊約 / 利未記", "舊約 / 民數記", "舊約 / 申命記",
    "舊約 / 約書亞記", "舊約 / 士師記", "舊約 / 路得記", "舊約 / 撒母耳記", "舊約 / 列王記",
    "舊約 / 歷代志", "舊約 / 詩篇", "舊約 / 箴言", "舊約 / 傳道書", "舊約 / 以賽亞書",
    "舊約 / 耶利米書", "舊約 / 以西結書", "舊約 / 何西阿書", "舊約 / 約珥書", "舊約 / 但以理書", "舊約 / 瑪拉基書",
    "新約 / 馬太福音", "新約 / 馬可福音", "新約 / 路加福音", "新約 / 約翰福音", "新約 / 使徒行傳",
    "新約 / 羅馬書", "新約 / 哥林多前書", "新約 / 哥林多後書", "新約 / 加拉太書", "新約 / 以弗所書",
    "新約 / 腓立比書", "新約 / 歌羅西書", "新約 / 帖撒羅尼迦前書", "新約 / 帖撒羅尼迦後書",
    "新約 / 提摩太前書", "新約 / 提摩太後書", "新約 / 提多書", "新約 / 希伯來書", "新約 / 雅各書",
    "新約 / 彼得前書", "新約 / 彼得後書", "新約 / 約翰一書", "新約 / 約翰二書", "新約 / 約翰三書",
    "新約 / 猶大書", "新約 / 啟示錄",
]
# 非書卷區塊 key 排在最後
BOOK_ORDER_TAIL = [
    "聖經背景或專題", "生活问题", "神学问题", "教会问题", "目錄",
    "各書卷（點入以斯拉站內）", "以斯拉站內－舊約其他書卷", "以斯拉站內－新約其他書卷",
    "說明／其他入口", "未標經節／其他", "未標註經文／主題",
]

# 拆分 6 檔用：五經至詩歌書（創～雅歌）、先知書（賽～瑪）、新約福音書行傳、新約書信啟示錄
SPLIT_OT_LAW_TO_HOLY = {
    "創世記", "出埃及記", "利未記", "民數記", "申命記", "約書亞記", "士師記", "路得記",
    "撒母耳記", "列王記", "歷代志", "以斯拉記", "尼希米記", "以斯帖記", "約伯記",
    "詩篇", "箴言", "傳道書", "雅歌",
}
SPLIT_OT_PROPHETS = {
    "以賽亞書", "耶利米書", "耶利米哀歌", "以西結書", "但以理書", "何西阿書", "約珥書",
    "阿摩司書", "俄巴底亞書", "約拿書", "彌迦書", "那鴻書", "哈巴谷書", "西番雅書",
    "哈該書", "撒迦利亞書", "瑪拉基書",
}
SPLIT_NT_GOSPELS_ACTS = {"馬太福音", "馬可福音", "路加福音", "約翰福音", "使徒行傳"}
SPLIT_NT_EPISTLES_REV = {
    "羅馬書", "哥林多前書", "哥林多後書", "哥林多", "加拉太書", "以弗所書", "腓立比書", "歌羅西書",
    "帖撒羅尼迦前書", "帖撒羅尼迦後書", "帖撒羅尼迦", "提摩太前書", "提摩太後書", "提摩太", "提多書",
    "希伯來書", "雅各書", "彼得前書", "彼得後書", "彼得", "約翰一書", "約翰二書", "約翰三書",
    "約翰壹", "約翰貳", "約翰參", "猶大書", "啟示錄",
}
# 非書卷區塊歸屬：舊約背景等→五經至詩歌書；新約背景等→新約
SPLIT_NONBOOK_TO_OT_LAW = {"舊約背景", "各書卷（點入以斯拉站內）", "以斯拉站內－舊約其他書卷"}
SPLIT_NONBOOK_TO_NT = {"新約背景", "以斯拉站內－新約其他書卷"}

# 【最簡單改字】目錄上顯示的標題可依「網站」或「全站」替換，改完存檔、執行本腳本即可。
# 依網站：在 DISPLAY_LABEL_OVERRIDE_BY_SOURCE 指定「網站名」→「原分類標題」→「新顯示字」
# 全站：在 DISPLAY_LABEL_OVERRIDE 指定「原字」→「新字」（所有網站該分類都改）
DISPLAY_LABEL_OVERRIDE_BY_SOURCE = {
    "Reformed Answers－聖經與神學問答": {"未標註經文／主題": "聖經與神學問答"},
    "恩泉－信仰問題解答（一）遠志明等": {"未分類": "信仰問題"},
}
DISPLAY_LABEL_OVERRIDE = {
    # "未分類": "其他",
    # "未標註經文／主題": "其他",
}

# 全域導覽／首頁類標題（非單一難題），在 build_tree 時直接略過，避免充斥「首頁／登入／網站導覽」等。
GLOBAL_NAV_TITLES = {
    "index.php",
    "登入",
    "首頁",
    "網站導覽",
    "專題文章",
    "專欄作家",
    "最新作品",
    "投稿",
    "水深之聲",
    "水深嚴選",
    "作品集散地",
    "水深聽故事",
    "邀請卡",
    "桌布",
    "APP",
    # 以斯拉百科常見分類／索引頁
    "index",
    "介紹",
    "拼音排序",
    "筆劃排序",
    # 華人護教站內返回主頁
    "繁体",
    "简体",
    "回《穩如磐石的聖經》主頁",
    "回主頁",
}

# 粗略「書卷縮寫 → 分類名稱」對照，可依需要再補
BOOK_MAP = {
    "創": "舊約 / 創世記",
    "出": "舊約 / 出埃及記",
    "利": "舊約 / 利未記",
    "民": "舊約 / 民數記",
    "申": "舊約 / 申命記",
    "書": "舊約 / 約書亞記",
    "士": "舊約 / 士師記",
    "得": "舊約 / 路得記",
    "撒": "舊約 / 撒母耳記",
    "王": "舊約 / 列王記",
    "代": "舊約 / 歷代志",
    "詩": "舊約 / 詩篇",
    "箴": "舊約 / 箴言",
    "傳": "舊約 / 傳道書",
    "賽": "舊約 / 以賽亞書",
    "耶": "舊約 / 耶利米書",
    "結": "舊約 / 以西結書",
    "何": "舊約 / 何西阿書",
    "約珥": "舊約 / 約珥書",
    "但": "舊約 / 但以理書",
    "瑪": "舊約 / 瑪拉基書",
    "太": "新約 / 馬太福音",
    "可": "新約 / 馬可福音",
    "路": "新約 / 路加福音",
    "約": "新約 / 約翰福音",
    "徒": "新約 / 使徒行傳",
    "羅": "新約 / 羅馬書",
    "林前": "新約 / 哥林多前書",
    "林後": "新約 / 哥林多後書",
    "加": "新約 / 加拉太書",
    "弗": "新約 / 以弗所書",
    "腓": "新約 / 腓立比書",
    "西": "新約 / 歌羅西書",
    "帖前": "新約 / 帖撒羅尼迦前書",
    "帖後": "新約 / 帖撒羅尼迦後書",
    "提前": "新約 / 提摩太前書",
    "提後": "新約 / 提摩太後書",
    "多": "新約 / 提多書",
    "來": "新約 / 希伯來書",
    "雅": "新約 / 雅各書",
    "彼前": "新約 / 彼得前書",
    "彼後": "新約 / 彼得後書",
    "約壹": "新約 / 約翰一書",
    "約貳": "新約 / 約翰二書",
    "約參": "新約 / 約翰三書",
    "猶": "新約 / 猶大書",
    "啟": "新約 / 啟示錄",
}


def detect_book(title: str):
    """
    嘗試從標題抓出書卷代號，回傳 BOOK_MAP key。
    先看開頭「創1:2」「申 1:28」；若無則看括號內「(申1:28)」「（書2:4-5）」。
    """
    if not title:
        return None
    t = title.strip()
    long_keys = sorted([k for k in BOOK_MAP.keys() if len(k) > 1], key=len, reverse=True)
    for k in long_keys:
        if t.startswith(k):
            return k
    m = re.match(r"^([^\s0-9:：]{1,3})[0-9]", t)
    if m:
        key = m.group(1)
        if key in BOOK_MAP:
            return key
    # 括號內經節：如 (申1:28)、（書2:4-5）
    m2 = re.search(r"[（(]([^\s0-9:：)\s]{1,3})[\d:]", t)
    if m2:
        key = m2.group(1)
        if key in BOOK_MAP:
            return key
    return None


# 恩泉 陈终道等：依標題關鍵字推斷書卷（當 detect_book 無結果時）
# 格式: (keywords_tuple, "舊約/新約 + 書卷名")
_BOOK_KEYWORDS_OT = [
    (("神用六日", "创造", "生气", "夏娃", "蛇", "该隐", "挪亚", "亞當", "罗得", "犹大", "他玛", "雅各", "天使摔跤", "分别善恶树"), "舊約 / 創世記"),
    (("摩西", "耶和华何以要杀", "山羊羔", "母的奶", "苦水", "尘土", "法老"), "舊約 / 出埃及記"),
    (("割礼",), "舊約 / 創世記"),  # 創17
    (("巴兰", "咒诅以色列"), "舊約 / 民數記"),
    (("参孙", "参孫", "士師"), "舊約 / 士師記"),
    (("大卫犯罪", "大卫干罪", "扫罗", "交鬼", "恶魔从耶和华"), "舊約 / 撒母耳記"),
    (("以利亚", "亚哈", "建殿", "凿石", "先知.*咒杀"), "舊約 / 列王記"),
    (("诗篇", "咒诅", "禱告"), "舊約 / 詩篇"),
    (("愚昧人", "心居左", "鹰.*解法"), "舊約 / 傳道書"),
    (("地却永远长存", "永远长存"), "舊約 / 傳道書"),
    (("动物", "灵魂"), "聖經背景或專題"),
    (("波斯", "希腊", "魔君"), "舊約 / 但以理書"),
]
_BOOK_KEYWORDS_NT = [
    (("马太", "24章", "会意", "怀孕", "奶孩子", "尸首", "鹰", "珍珠", "狗", "外邦人", "葡萄园", "赏赐"), "新約 / 馬太福音"),
    (("路加", "财生", "亚伯拉罕", "阴间", "无水之地", "施洗约翰", "拉结"), "新約 / 路加福音"),
    (("约翰15", "枝子", "另外有羊", "罪已经定了"), "新約 / 約翰福音"),
    (("血", "勒死", "牲畜", "为死者施洗", "方言", "舌音", "圣灵行传"), "新約 / 使徒行傳"),
    (("女人.*讲道", "不信的丈夫", "妻子成为圣洁"), "新約 / 哥林多前書"),
    (("四百三十年", "两个耶路撒冷", "中保"), "新約 / 加拉太書"),
    (("金香炉", "故意犯罪", "懦弱无用", "小学"), "新約 / 希伯來書"),
    (("六六六", "两个见证人", "叶子", "医治万民", "新天地", "魔鬼.*龙", "启示录"), "新約 / 啟示錄"),
    (("基督下阴间", "死人.*福音", "乐园", "阴间", "天堂"), "聖經背景或專題"),
]


def detect_book_from_keywords(title: str, testament: str) -> str:
    """
    依標題關鍵字推斷書卷，用於恩泉 旧约/新约 細分到書卷。
    testament: "旧约" | "新约"
    """
    if not title:
        return "聖經背景或專題"
    t = title.strip()
    lists = _BOOK_KEYWORDS_OT if testament == "旧约" else _BOOK_KEYWORDS_NT
    for keywords, book_label in lists:
        for kw in keywords:
            if re.search(kw, t, re.IGNORECASE):
                return book_label
    return "聖經背景或專題"


# 以斯拉百科網 URL 路徑：聖經難題/(書卷簡稱)-N。解析器若產出 ??? 亂碼，用此表還原。
EQUIP_BOOK_SHORT = {
    "創世記": "創", "出埃及記": "出", "利未記": "利", "民數記": "民", "申命記": "申",
    "約書亞記": "書", "士師記": "士", "路得記": "得", "撒母耳記": "撒上", "撒母耳記上": "撒上", "撒母耳記下": "撒下",
    "列王記": "王上", "列王記上": "王上", "列王記下": "王下", "歷代志": "代上", "歷代志上": "代上", "歷代志下": "代下",
    "以斯拉記": "拉", "尼希米記": "尼", "以斯帖記": "斯", "約伯記": "伯", "詩篇": "詩", "箴言": "箴",
    "傳道書": "傳", "雅歌": "歌", "以賽亞書": "賽", "耶利米書": "耶", "耶利米哀歌": "哀",
    "以西結書": "結", "但以理書": "但", "何西阿書": "何", "約珥書": "珥", "阿摩司書": "摩",
    "俄巴底亞書": "俄", "約拿書": "拿", "彌迦書": "彌", "那鴻書": "鴻", "哈巴谷書": "哈",
    "西番雅書": "番", "哈該書": "該", "撒迦利亞書": "亞", "瑪拉基書": "瑪",
    "馬太福音": "太", "馬可福音": "可", "路加福音": "路", "約翰福音": "約", "使徒行傳": "徒",
    "羅馬書": "羅", "哥林多前書": "林前", "哥林多後書": "林後", "加拉太書": "加", "以弗所書": "弗",
    "腓立比書": "腓", "歌羅西書": "西", "帖撒羅尼迦前書": "帖前", "帖撒羅尼迦後書": "帖後",
    "提摩太前書": "提前", "提摩太後書": "提後", "提多書": "多", "腓利門書": "門", "希伯來書": "來",
    "雅各書": "雅", "彼得前書": "彼前", "彼得後書": "彼後", "約翰一書": "約壹", "約翰二書": "約貳", "約翰三書": "約參",
    "猶大書": "猶", "啟示錄": "啟",
}
def _normalize_breadcrumb(s: str) -> str:
    """去掉 RTL 等不可見字元，統一 ' > ' 分隔。"""
    if not s:
        return s
    s = s.replace("\u200f", "").strip()  # RTL mark
    return re.sub(r"\s*>\s*", " > ", s)


def fix_equiptoserve_url(url: str, book_label: str, section_breadcrumb: str = None) -> str:
    """若 url 為以斯拉百科且含 ??? 亂碼，還原為正確路徑：(1) 聖經難題 書卷-N；(2) 辯道護教/舊約/新約背景 索引頁（辯道護教-子題）。"""
    if not url or "equiptoserve.org/etspedia" not in url:
        return url
    base = "http://www.equiptoserve.org"
    # (1) 聖經難題：URL 尾 ???-N
    match = re.search(r"\?+-(\d+)(?:/)?$", url.strip("/"))
    if match:
        num = match.group(1)
        book_plain = (book_label or "").replace("舊約 / ", "").replace("新約 / ", "")
        short = EQUIP_BOOK_SHORT.get(book_label) or EQUIP_BOOK_SHORT.get(book_plain)
        # 新約難題 > 馬太福音：取最後一段為書卷
        if not short and " > " in (book_plain or ""):
            last_part = book_plain.split(" > ")[-1].strip()
            short = EQUIP_BOOK_SHORT.get(last_part)
        if short:
            path_suffix = f"{short}-{num}"
            return base + f"/etspedia/聖經難題/{path_suffix}"
        # 約珥書-瑪拉基書 整區合頁
        if "約珥書-瑪拉基書" in (book_label or "") or "約珥書-瑪拉基書" in (book_plain or ""):
            return base + "/etspedia/聖經難題/約珥書-瑪拉基書"
    # (2) 辯道護教/舊約背景/新約背景：依麵包屑還原為索引頁 URL（辯道護教-子題）
    breadcrumb = section_breadcrumb or book_label
    if not breadcrumb or not (url or "").strip():
        return url
    norm = _normalize_breadcrumb(breadcrumb)
    if "?" in (url or "") or (norm and " > " in norm):
        if EQUIP_KEEP_ORIGINAL_URL_FOR_BREADCRUMB:
            return url
        parts = [p.strip() for p in norm.split(" > ") if p.strip()] if norm else []
        if not parts:
            parts = [book_label] if book_label else []
        # 辯道護教：索引頁為 辯道護教-最末子題（站上認 辯道護教 非 辯道）
        if len(parts) >= 2 and parts[0] and ("辯道護教" in parts[0] or parts[0] == "辯道"):
            path_part = "辯道護教-" + parts[-1]
        # 聖經難題：站上 舊約難題/新約難題 皆用 聖經難題-書卷名（如 聖經難題-馬太福音）
        elif len(parts) >= 2 and parts[0] in ("新約難題", "舊約難題"):
            path_part = "聖經難題-" + parts[1]
        # 舊約背景/新約背景：站上為 大類-第二層（如 舊約背景-近東與舊約）
        elif len(parts) >= 2:
            path_part = parts[0] + "-" + parts[1]
        else:
            path_part = "-".join(parts) if parts else (book_label or "").replace(" > ", "-")
        if not path_part:
            return url
        if EQUIP_APOLOGETICS_FALLBACK_TO_INTRO and "辯道護教" in (path_part or ""):
            path_part = "辯道護教-介紹"
        return base + "/etspedia/" + path_part
    return url


def _collect_breadcrumb_items(node, prefix="", out=None):
    """遞迴收集所有 key 含 ' > ' 的 (breadcrumb, items) 列表。out = [(breadcrumb, [items with _breadcrumb]), ...]"""
    if out is None:
        out = []
    if isinstance(node, dict):
        for k, v in node.items():
            if isinstance(v, list):
                if " > " in _normalize_breadcrumb(k):
                    breadcrumb = _normalize_breadcrumb(k)
                    for it in v:
                        if isinstance(it, dict) and "url" in it:
                            it["_breadcrumb"] = breadcrumb
                    out.append((breadcrumb, v))
            else:
                _collect_breadcrumb_items(v, prefix + k + " ", out)
    return out


def _build_nested_from_breadcrumbs(pairs):
    """從 [(breadcrumb, items), ...] 建出巢狀 dict：辯道護教 > 基要衛道 > 辯道學之意義與使命 -> root[辯道護教][基要衛道][辯道學之意義與使命]=items。"""
    root = {}
    for breadcrumb, items in pairs:
        parts = [p.strip() for p in breadcrumb.split(" > ") if p.strip()]
        if not parts:
            continue
        cur = root
        for i, p in enumerate(parts[:-1]):
            cur = cur.setdefault(p, {})
        cur[parts[-1]] = items
    return root


def reshape_equip_apologetics(categories):
    """將 以斯拉百科－辯道護教 的 目錄 巢狀結構轉為 辯道護教 > 基要衛道/宗教衛道 > 子題。"""
    pairs = _collect_breadcrumb_items(categories)
    return _build_nested_from_breadcrumbs(pairs)


def reshape_equip_background(categories):
    """將 以斯拉百科－舊約背景/新約背景 的 舊約背景 > 近東與舊約 等轉為巢狀。"""
    pairs = _collect_breadcrumb_items(categories)
    return _build_nested_from_breadcrumbs(pairs)


def encode_url_for_href(url: str) -> str:
    """將 URL 中的非 ASCII 路徑做 percent-encode，避免 file:// 下亂碼或請求錯誤。"""
    try:
        p = urlparse(url)
        # path 可能含中文，需編碼
        new_path = quote(p.path, safe="/")
        return urlunparse((p.scheme, p.netloc, new_path, p.params, p.query, p.fragment))
    except Exception:
        return url


def build_tree(items):
    """由 items 建出 {source_label: {book_label: [items...]}}"""
    tree = {}
    for it in items:
        title = (it.get("title") or "").strip()
        url = it.get("url") or ""
        if not title or not url:
            continue
        # 全站導覽／首頁／索引等非「單一難題」，直接略過
        if title in GLOBAL_NAV_TITLES:
            continue
        src = it.get("source_label") or it.get("source") or "其他來源"
        book_key = detect_book(title)
        if book_key:
            book_label = BOOK_MAP[book_key]
        else:
            book_label = "未標註經文／主題"
        tree.setdefault(src, {}).setdefault(book_label, []).append({"title": title, "url": url})
    return tree


def get_abc_for_source_category(source_label: str, category: str, abc_config: dict) -> str:
    """取得來源+分類對應的 A/B/C。"""
    m = abc_config.get("source_category_to_abc", {})
    v = m.get(source_label)
    if isinstance(v, dict):
        return v.get(category) or abc_config.get("default_abc", "A")
    if isinstance(v, str):
        return v
    return abc_config.get("default_abc", "A")


def build_abc_tree(qna02_tree: dict, merged_tree: dict, abc_config: dict) -> dict:
    """
    建出 A/B/C 四層結構：
    { "A": { "聖經書卷難題": { source: { book: [items] } } },
      "B": { ... }, "C": { ... } }
    """
    top = abc_config.get("top_level", {})
    out = {"A": {}, "B": {}, "C": {}}
    for letter, label in top.items():
        out[letter][label] = {}

    def add_items(letter: str, src: str, book: str, items: list):
        out[letter].setdefault(top[letter], {}).setdefault(src, {}).setdefault(book, []).extend(items)

    # 1. 處理 qna02_tree（恩泉陳終道等有 旧约/新约/生活问题/神学问题/教会问题）
    for src_label, categories in qna02_tree.items():
        if src_label in EQUIP_APOLOGETICS_SUBSOURCES_SKIP:
            continue
        for cat, items in categories.items():
            abc = get_abc_for_source_category(src_label, cat, abc_config)
            if not items:
                continue
            
            # 處理子分類結構（如「目錄」下有多個子分類）
            if isinstance(items, dict):
                # 以斯拉 辯道護教：扁平化，略過多餘的「辯道護教」層，直接以「辯道」「護教」為頂層
                if src_label == "以斯拉百科－辯道護教" and cat == "辯道護教" and isinstance(items, dict):
                    for sub_key, sub_data in items.items():
                        if sub_data:
                            out[abc].setdefault(top[abc], {}).setdefault(src_label, {})[sub_key] = sub_data
                    continue
                # 以斯拉 舊約背景 / 新約背景：單一頂層保留整顆巢狀
                if src_label in ("以斯拉百科－舊約背景", "以斯拉百科－新約背景") and cat in ("舊約背景", "新約背景"):
                    out[abc].setdefault(top[abc], {}).setdefault(src_label, {})[cat] = items
                    continue
                # 華人基督徒查經：舊約查經 / 新約查經 / 主題查經 三區保留巢狀（書卷→目錄頁）
                if ("ccbiblestudy" in src_label or "華人基督徒查經" in src_label) and cat in ("舊約查經", "新約查經", "主題查經"):
                    out[abc].setdefault(top[abc], {}).setdefault(src_label, {})[cat] = items
                    continue
                # 一般嵌套結構（如「聖經難題」的「新約難題」下有「馬太福音」等）
                for subcat_name, subcat_data in items.items():
                    if not subcat_data:
                        continue
                    # 如果 subcat_data 也是 dict，表示是嵌套結構（分類 > 子分類 > 題目）
                    if isinstance(subcat_data, dict):
                        # 嵌套結構：保持嵌套，讓 _render_tree_into_lines 處理
                        # 將分類名稱作為「書卷」層，子分類作為嵌套的 dict
                        out[abc].setdefault(top[abc], {}).setdefault(src_label, {}).setdefault(subcat_name, {}).update(subcat_data)
                    else:
                        # 普通子分類結構（如「以斯拉百科－辯道護教」的「目錄」下有「意義與使命」等）
                        # 子分類名稱作為「書卷」層
                        add_items(abc, src_label, subcat_name, subcat_data)
                continue
            
            # 處理列表結構（舊格式）
            if abc == "A" and cat in ("旧约", "新约"):
                # 細分到書卷
                by_book = {}
                for it in items:
                    bk = detect_book(it.get("title", ""))
                    if bk:
                        book_label = BOOK_MAP[bk]
                    else:
                        book_label = detect_book_from_keywords(it.get("title", ""), cat)
                    by_book.setdefault(book_label, []).append(it)
                for book_label, lst in by_book.items():
                    add_items(abc, src_label, book_label, lst)
            else:
                # B、C 或 A 非旧约/新约：分類名即書卷層
                add_items(abc, src_label, cat, items)

    # 2. 處理 merged_tree（來自 links_merged 的其它來源）
    sc_map = abc_config.get("source_category_to_abc", {})
    for src_label, books in merged_tree.items():
        if src_label in qna02_tree:
            continue
        abc = sc_map.get(src_label, abc_config.get("default_abc", "A"))
        if isinstance(abc, dict):
            abc = "A"
        for book_label, lst in books.items():
            add_items(abc, src_label, book_label, lst)

    return out


# 以斯拉「說明／其他入口」再分類：依標題判斷舊約/新約書卷入口。
EQUIP_OLD_TESTAMENT_KEYS = {"撒母耳記", "列王記", "歷代志", "以斯拉記", "約伯記", "詩篇", "雅歌", "以賽亞書", "耶利米哀歌", "以西結書", "何西阿書", "約珥書", "瑪拉基書"}
EQUIP_NEW_TESTAMENT_KEYS = {"馬太福音", "馬可福音", "路加福音", "約翰福音", "使徒行傳", "羅馬書", "哥林多", "加拉太書", "以弗所書", "腓立比書", "歌羅西書", "帖撒羅尼迦", "提摩太", "提多書", "希伯來書", "雅各書", "彼得", "約翰壹", "約翰貳", "約翰叁", "猶大書", "啟示錄"}


def _equip_old_or_new(title):
    if any(k in title for k in EQUIP_OLD_TESTAMENT_KEYS):
        return "以斯拉站內－舊約其他書卷"
    if any(k in title for k in EQUIP_NEW_TESTAMENT_KEYS):
        return "以斯拉站內－新約其他書卷"
    return "未標經節／其他"


def reshape_equiptoserve_tree(tree):
    """
    以斯拉目錄：分類頁→「各書卷（點入以斯拉站內）」；其餘依標題分「舊約/新約其他書卷」或「未標經節／其他」。
    """
    out = {}
    for src_label, books in tree.items():
        out[src_label] = {}
        unmarked = books.get("未標註經文／主題", [])
        category_items = [it for it in unmarked if it["title"] in EQUIP_CATEGORY_TITLES]
        rest = [it for it in unmarked if it["title"] not in EQUIP_CATEGORY_TITLES]
        for book_label, lst in books.items():
            if book_label == "未標註經文／主題":
                continue
            out[src_label][book_label] = lst
        if category_items:
            out[src_label]["各書卷（點入以斯拉站內）"] = category_items
        for it in rest:
            key = _equip_old_or_new(it["title"])
            out[src_label].setdefault(key, []).append(it)
        # 若某書卷區塊內全是分類頁（如 舊約/約珥書 只有「約珥書-瑪拉基書」），移入「各書卷」並刪該區塊
        for book_label in list(out[src_label].keys()):
            if book_label in ("各書卷（點入以斯拉站內）", "以斯拉站內－舊約其他書卷", "以斯拉站內－新約其他書卷", "未標經節／其他"):
                continue
            lst = out[src_label][book_label]
            if all(it["title"] in EQUIP_CATEGORY_TITLES for it in lst):
                out[src_label].setdefault("各書卷（點入以斯拉站內）", []).extend(lst)
                del out[src_label][book_label]
    return out


def _extract_first_book(book_label: str) -> str:
    """從書卷標籤取出第一個書名，供拆分過濾用。例：舊約/創世記→創世記；利未記-民數記→利未記。"""
    if not book_label:
        return ""
    # 舊約/新約 前綴
    for prefix in ("舊約 / ", "舊約/", "新約 / ", "新約/"):
        if book_label.startswith(prefix):
            rest = book_label[len(prefix):].strip()
            if "-" in rest:
                return rest.split("-")[0].strip()
            return rest
    # 複合鍵如 利未記-民數記、約珥書-瑪拉基書
    if "-" in book_label:
        return book_label.split("-")[0].strip()
    return book_label.strip()


def _book_belongs_to_split(book_label: str, split_type: str) -> bool:
    """判斷書卷標籤是否屬於指定拆分類型。"""
    first = _extract_first_book(book_label)
    if not first:
        return False
    if split_type == "OT_五經至詩歌書":
        if first in SPLIT_OT_LAW_TO_HOLY:
            return True
        if book_label in SPLIT_NONBOOK_TO_OT_LAW or first in SPLIT_NONBOOK_TO_OT_LAW:
            return True
        # 聖經背景、目錄等無法區分者歸五經至詩歌書
        if book_label in BOOK_ORDER_TAIL or first in ("聖經背景或專題", "目錄", "未標註經文／主題", "未標經節／其他", "說明／其他入口"):
            return True
        return False
    if split_type == "OT_先知書":
        return first in SPLIT_OT_PROPHETS
    if split_type == "NT_福音書行傳":
        if first in SPLIT_NT_GOSPELS_ACTS:
            return True
        if book_label in SPLIT_NONBOOK_TO_NT or first in SPLIT_NONBOOK_TO_NT:
            return True
        return False
    if split_type == "NT_書信啟示錄":
        if first in SPLIT_NT_EPISTLES_REV:
            return True
        if book_label in SPLIT_NONBOOK_TO_NT or first in SPLIT_NONBOOK_TO_NT:
            return True
        return False
    return False


def filter_abc_tree_for_split(abc_tree: dict, split_type: str) -> dict:
    """
    依 split_type 過濾 abc_tree，產出用於單一拆分檔的樹。
    split_type: OT_五經至詩歌書 | OT_先知書 | NT_福音書行傳 | NT_書信啟示錄 | B | C
    """
    if split_type in ("B", "C"):
        return {split_type: abc_tree.get(split_type, {})}
    # A 區：只保留符合的書卷
    out = {"A": {}}
    if "A" not in abc_tree:
        return out
    for section_label, sources in abc_tree["A"].items():
        filtered_sources = {}
        for src_label, books in sources.items():
            filtered_books = {}
            for book_label, data in books.items():
                if _book_belongs_to_split(book_label, split_type):
                    filtered_books[book_label] = data
            if filtered_books:
                filtered_sources[src_label] = filtered_books
        if filtered_sources:
            out["A"][section_label] = filtered_sources
    return out


def sort_book_labels(labels, source_label):
    """套用舊約→新約書卷順序；非書卷區塊排最後。"""
    labels = list(labels)
    order_map = {k: i for i, k in enumerate(BOOK_DISPLAY_ORDER)}
    for i, k in enumerate(BOOK_ORDER_TAIL):
        order_map[k] = len(BOOK_DISPLAY_ORDER) + i
    return sorted(labels, key=lambda x: order_map.get(x, 9999))


def _escape(t):
    return t.replace('"', "&quot;")


def _display_label(label: str, src_label: str = None) -> str:
    """目錄上顯示的分類名：先依網站替換（DISPLAY_LABEL_OVERRIDE_BY_SOURCE），再依全站（DISPLAY_LABEL_OVERRIDE）。"""
    if src_label and src_label in DISPLAY_LABEL_OVERRIDE_BY_SOURCE:
        by_src = DISPLAY_LABEL_OVERRIDE_BY_SOURCE[src_label]
        if label in by_src:
            return by_src[label]
    return DISPLAY_LABEL_OVERRIDE.get(label, label)


def _link_item(it, lines, indent="      "):
    t = _escape(it.get("title", ""))
    url = it.get("url", "")
    u_enc = encode_url_for_href(url).replace('"', "&quot;")
    lines.append(
        '{indent}<li><a href="{url}" target="main" '
        'data-title="{title}" data-url="{url}" '
        'onclick="prepareClip(this);">{title}</a></li>'.format(url=u_enc, title=t, indent=indent)
    )


def _render_node(label, data, lines, src_label, indent_base="  ", sort_fn=None):
    """遞迴輸出 details（label）或 ul（list）；修復以斯拉 ??? URL 時用 _breadcrumb 或 label。"""
    if isinstance(data, list):
        lines.append(indent_base + "<ul style=\"margin-top:2px;margin-bottom:6px;\">")
        for it in data:
            it_fixed = dict(it)
            bc = it_fixed.pop("_breadcrumb", None)
            if "以斯拉" in src_label and ("?" in (it_fixed.get("url") or "") or ("辯道護教" in src_label and "辯道" in (it_fixed.get("url") or ""))):
                it_fixed["url"] = fix_equiptoserve_url(it_fixed["url"], label, section_breadcrumb=bc or label)
            _link_item(it_fixed, lines, indent=indent_base + "  ")
        lines.append(indent_base + "</ul>")
        return
    if isinstance(data, dict):
        sub_labels = list(data.keys())
        if sort_fn:
            sub_labels = sort_fn(sub_labels, src_label)
        for sub_label in sub_labels:
            sub_data = data.get(sub_label)
            if sub_data is None:
                continue
            lines.append(indent_base + '<details style="margin-left:10px;margin-bottom:4px;">')
            lines.append(indent_base + f'  <summary style="cursor:pointer;font-weight:bold;">{_escape(_display_label(sub_label, src_label))}</summary>')
            _render_node(sub_label, sub_data, lines, src_label, indent_base=indent_base + "  ", sort_fn=sort_fn)
            lines.append(indent_base + "</details>")
        return
    # fallback: empty
    lines.append(indent_base + "<ul></ul>")


def _render_tree_into_lines(tree: dict, lines: list, sort_fn=None):
    """將 { source: { book: [items] } } 或 { source: { category: { subcategory: [items] } } } 渲染為 HTML，每個 details 內含 summary + ul。"""
    for src_label, books in tree.items():
        # 網站名稱用 details 包裝，預設收合（第二層）
        lines.append('<details style="margin-bottom:8px;">')
        lines.append(f'  <summary style="cursor:pointer;font-weight:bold;color:#c33;font-size:1.05em;padding:4px 0;border-bottom:1px solid #ddd;">{_escape(src_label)}</summary>')
        book_labels = list(books.keys())
        if sort_fn:
            book_labels = sort_fn(book_labels, src_label)
        for book_label in book_labels:
            book_data = books.get(book_label)
            if not book_data:
                continue
            # 處理嵌套結構：dict 可為 2 層（新約難題 > 馬太福音）或 3 層（辯道護教 > 基要衛道 > 子題）
            if isinstance(book_data, dict):
                lines.append('  <details style="margin-left:0;margin-bottom:4px;">')
                lines.append(f'    <summary style="cursor:pointer;font-weight:bold;">{_escape(_display_label(book_label, src_label))}</summary>')
                _render_node(book_label, book_data, lines, src_label, indent_base="    ", sort_fn=sort_fn)
                lines.append("  </details>")
            else:
                # 舊格式：book_data 是 list
                lst = book_data if isinstance(book_data, list) else []
                if not lst:
                    continue
                lines.append('  <details style="margin-left:0;margin-bottom:4px;">')
                lines.append(f'    <summary style="cursor:pointer;font-weight:bold;">{_escape(_display_label(book_label, src_label))}</summary>')
                lines.append("    <ul style=\"margin-top:2px;margin-bottom:6px;\">")
                for it in lst:
                    it_fixed = dict(it)
                    if "以斯拉" in src_label and ("?" in (it_fixed.get("url") or "") or ("辯道護教" in src_label and "辯道" in (it_fixed.get("url") or ""))):
                        it_fixed["url"] = fix_equiptoserve_url(it_fixed["url"], book_label)
                    _link_item(it_fixed, lines, indent="      ")
                lines.append("    </ul>")
                lines.append("  </details>")
        lines.append("</details>")  # 關閉網站名稱的 details


def write_list_html(tree, out_path, page_title="聖經難題目錄", use_abc=False, abc_tree=None, back_link_href=None):
    """將 tree 寫成靜態 HTML；書卷用 <details> 可開合，點題目右欄顯示原文並填入 AI 提問框。"""
    import time
    lines = []
    lines.append("<!-- 建於 {} | 輸出檔: {} -->".format(
        time.strftime("%Y-%m-%d %H:%M:%S"), os.path.abspath(out_path)))
    lines.append("<html><head>")
    lines.append('<meta http-equiv="Content-Type" content="text/html; charset=utf-8">')
    lines.append('<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">')
    lines.append('<meta http-equiv="Pragma" content="no-cache">')
    lines.append('<link rel="File-List" href="qna_list_auto.files/filelist.xml">' if "全部" in page_title else "")
    lines.append(f"<title>{page_title}</title>")
    lines.append("</head>")
    lines.append('<body style="font-size:10pt;font-family:Microsoft JhengHei,Arial;">')
    if back_link_href:
        lines.append(f'<p style="margin:0 0 6px 0;"><a href="{_escape(back_link_href)}" style="font-size:9pt;">← 返回選單</a></p>')
    lines.append(f"<h3>{page_title}</h3>")
    if "全部" in page_title:
        lines.append('<p style="font-size:9pt;color:#066;margin-top:2px;">↓ 四層結構：<b>A 聖經書卷</b>／<b>B 神學教義</b>／<b>C 信徒教會</b> → 網站 → 書卷 → 題目。建於 {}。</p>'.format(time.strftime("%Y-%m-%d %H:%M")))
    lines.append('<div style="margin:4px 0;font-size:9pt;">')
    lines.append('  <label for="qnaSearch"><b>搜尋</b>（輸入關鍵字過濾題目／書卷）：</label>')
    lines.append('  <input type="text" id="qnaSearch" placeholder="輸入關鍵字…" style="width:100%;margin-top:2px;padding:4px;box-sizing:border-box;">')
    lines.append('  <div id="qnaSearchResult" style="display:none;margin-top:4px;font-size:9pt;color:#066;"></div>')
    lines.append("</div>")
    lines.append('<div id="clip" style="margin:4px 0;padding:6px;background:#f0f8ff;border:1px solid #b0d0e0;font-size:9pt;color:#333;">')
    lines.append('  <b>AI 提問文字</b>（點下方任一題目後，此框會自動填入；<b>Ctrl+A 全選 → Ctrl+C 複製</b>即可貼到 Copilot/ChatGPT）： <a href="../help/ai-chooser.html" target="_blank" rel="noopener">選 AI 平台→新頁開啟</a>')
    lines.append('  <textarea id="clipText" rows="3" style="width:100%;font-size:9pt;margin-top:4px;box-sizing:border-box;"></textarea>')
    lines.append("</div>")
    lines.append("<p style=\"font-size:9pt;color:#555;margin-top:4px;\">以下為<b>四層結構（可點擊展開/收合）</b>：A 聖經書卷 → 網站 → 書卷 → 題目。</p>")
    lines.append("<hr>")

    if use_abc and abc_tree:
        top_order = ["A", "B", "C"]
        letter_colors = {"A": "#b22222", "B": "#005c99", "C": "#006400"}
        letter_icons = {"A": "★", "B": "◆", "C": "●"}
        for letter in top_order:
            if letter not in abc_tree:
                continue
            section = abc_tree[letter]
            for section_label, sources in section.items():
                if not sources:
                    continue
                color = letter_colors.get(letter, "#a00")
                icon = letter_icons.get(letter, "")
                icon_span = f'<span style="margin-right:4px;">{icon}</span>' if icon else ""
                # A/B/C 分類用 details，預設收合（第一層）；加 id 供 QNA.html 用 hash 捲動
                lines.append(f'<details id="qna-abc-{letter}" style="margin-bottom:8px;">')
                lines.append(
                    f'  <summary style="cursor:pointer;font-weight:bold;font-size:1.1em;color:{color};padding:4px 0;">'
                    f'{icon_span}{letter} {_escape(section_label)}</summary>'
                )
                _render_tree_into_lines(sources, lines, sort_fn=sort_book_labels)
                lines.append('</details>')  # 關閉 A/B/C 分類
    else:
        _render_tree_into_lines(tree, lines, sort_fn=sort_book_labels)

    _t2s_js = json.dumps(dict(TRAD_SIMP_PAIRS), ensure_ascii=False)
    _s2t_js = json.dumps(dict((s, t) for t, s in TRAD_SIMP_PAIRS), ensure_ascii=False)
    lines.append((
        """
<script type="text/javascript">
function prepareClip(a) {
  var t = a.getAttribute("data-title") || a.textContent || "";
  var u = a.getAttribute("data-url") || a.href || "";
  var txt = "請根據以下聖經／神學難題詳細解答：\\n\\n"
          + "題目：" + t + "\\n"
          + "原文網址：" + u + "\\n";
  var ta = document.getElementById("clipText");
  if (ta) {
    ta.value = txt;
    ta.focus();
    ta.select();
  }
  var clip = document.getElementById("clip");
  if (clip) clip.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
function escapeHtml(s) {
  var d = document.createElement("span");
  d.textContent = s;
  return d.innerHTML;
}
var tradToSimp = __T2S__;
var simpToTrad = __S2T__;
function expandForMatch(q) {
  var out = [q];
  var s = "", t = "";
  for (var i = 0; i < q.length; i++) {
    s += tradToSimp[q[i]] || q[i];
    t += simpToTrad[q[i]] || q[i];
  }
  if (s !== q) out.push(s);
  if (t !== q) out.push(t);
  return out;
}
function textMatches(text, variants) {
  if (!text) return false;
  var lower = text.toLowerCase();
  for (var v = 0; v < variants.length; v++) {
    if (variants[v] && lower.indexOf(variants[v].toLowerCase()) >= 0) return true;
  }
  return false;
}
function buildMatchRegex(variants) {
  if (!variants || variants.length === 0) return null;
  try {
    var esc = function(s) { return s.replace(/[.*+?^${}()|[\\\\]\\\\]/g, "\\\\$&"); };
    var parts = [];
    for (var v = 0; v < variants.length; v++) {
      if (variants[v]) parts.push(esc(variants[v]));
    }
    if (parts.length === 0) return null;
    return new RegExp(parts.join("|"), "gi");
  } catch (e) { return null; }
}
function highlightText(text, variants) {
  if (!text) return "";
  var safe = escapeHtml(text);
  if (!variants || variants.length === 0) return safe;
  var re = buildMatchRegex(variants);
  if (!re) return safe;
  return safe.replace(re, function(m) {
    return "<span style=\\"background:#ffeb3b;color:#000;font-weight:bold;\\">" + escapeHtml(m) + "</span>";
  });
}
function onQnaSearch() {
  var inp = document.getElementById("qnaSearch");
  var q = (inp && inp.value ? inp.value : "").replace(/\\s+/g, " ").trim();
  var qVariants = q ? expandForMatch(q) : [];
  var details = document.querySelectorAll("body details");
  var resultArea = document.getElementById("qnaSearchResult");
  if (!q) {
    for (var i = 0; i < details.length; i++) {
      details[i].style.display = "";
      details[i].open = false;
      var sum = details[i].querySelector("summary");
      if (sum) sum.innerHTML = escapeHtml(sum._plainText || sum.textContent || "");
      var as = details[i].querySelectorAll("a[data-title]");
      for (var k = 0; k < as.length; k++) {
        var ax = as[k];
        ax.style.display = "";
        var li = ax.parentElement;
        if (li && li.tagName === "LI") li.style.display = "";
        if (ax.getAttribute("data-title")) ax.innerHTML = escapeHtml(ax.getAttribute("data-title"));
      }
    }
    if (resultArea) resultArea.style.display = "none";
    return;
  }
  var visible = 0;
  var resultLinks = [];
  for (var i = 0; i < details.length; i++) {
    var d = details[i];
    var sum = d.querySelector("summary");
    var sumText = sum ? (sum._plainText || (sum._plainText = sum.textContent)) : "";
    var links = d.querySelectorAll("a[data-title]");
    var anyMatch = textMatches(sumText, qVariants);
    if (!anyMatch) {
      for (var j = 0; j < links.length; j++) {
        if (textMatches(links[j].getAttribute("data-title") || "", qVariants)) { anyMatch = true; break; }
      }
    }
    d.style.display = anyMatch ? "" : "none";
    if (anyMatch) {
      visible++;
      d.open = true;
      if (sum) sum.innerHTML = highlightText(sumText, qVariants);
      var summaryMatch = textMatches(sumText, qVariants);
      var firstHref = "";
      for (var j = 0; j < links.length; j++) {
        var a = links[j];
        var t = a.getAttribute("data-title");
        if (!t) continue;
        if (!firstHref) firstHref = a.getAttribute("href") || "";
        var titleMatch = textMatches(t, qVariants);
        var li = a.parentElement;
        if (li && li.tagName === "LI") li.style.display = titleMatch ? "" : "none";
        a.style.display = titleMatch ? "" : "none";
        a.innerHTML = highlightText(t, qVariants);
        if (titleMatch) {
          var href = a.getAttribute("href");
          if (href) resultLinks.push({ href: href, title: t, titleHtml: highlightText(t, qVariants) });
        }
      }
      if (summaryMatch && firstHref && sumText) {
        resultLinks.unshift({ href: firstHref, title: sumText, titleHtml: highlightText(sumText, qVariants) });
      }
    }
  }
  if (resultArea) {
    resultArea.style.display = "block";
    if (!visible) {
      resultArea.innerHTML = "無符合「" + escapeHtml(q) + "」的結果，請改其他關鍵字。";
    } else if (resultLinks.length === 0) {
      resultArea.innerHTML = "有 " + visible + " 個書卷／區塊提及「" + escapeHtml(q) + "」，但無題目標題符合。請在下方展開區塊中瀏覽。";
    } else {
      var ul = "<p style=\\"margin:0 0 4px 0;font-weight:bold;\\">書卷／題目含「" + escapeHtml(q) + "」者共 " + resultLinks.length + " 則（先列書卷，再列題目）。點下列連結→右欄開啟：</p>";
      ul += "<ul id=\\"qnaSearchResultList\\" style=\\"margin:0;padding-left:18px;max-height:280px;overflow-y:auto;\\">";
      for (var k = 0; k < resultLinks.length; k++) {
        var it = resultLinks[k];
        ul += "<li><a href=\\"" + escapeHtml(it.href) + "\\" target=\\"main\\" data-title=\\"" + escapeHtml(it.title) + "\\" onclick=\\"prepareClip(this);\\">" + it.titleHtml + "</a></li>";
      }
      ul += "</ul>";
      resultArea.innerHTML = ul;
    }
    var firstLink = null;
    for (var i = 0; i < details.length; i++) {
      if (details[i].style.display === "none") continue;
      var as = details[i].querySelectorAll("a[data-title]");
      for (var j = 0; j < as.length; j++) {
        if (as[j].style.display !== "none") { firstLink = as[j]; break; }
      }
      if (firstLink) break;
    }
    if (firstLink) firstLink.scrollIntoView({ behavior: "smooth", block: "nearest" });
    else resultArea.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}
function runSearch() { try { onQnaSearch(); } catch (e) { console.error("QNA search error", e); } }
function initQnaSearch() {
  var isLocal = /^file:\\/\\//i.test(location.href) || /localhost|127\\.0\\.0\\.1/i.test(location.hostname || "");
  if (!isLocal) {
    try { document.querySelectorAll("a[target=\\"main\\"]").forEach(function(a){ a.setAttribute("target", "_blank"); }); } catch(e) {}
  }
  var qnaSearchEl = document.getElementById("qnaSearch");
  if (qnaSearchEl && !qnaSearchEl._qnaSearchBound) {
    qnaSearchEl._qnaSearchBound = true;
    qnaSearchEl.addEventListener("input", runSearch);
    qnaSearchEl.addEventListener("keyup", runSearch);
  }
  var hash = (location.hash || "").replace(/^#/, "");
  if (hash === "A" || hash === "B" || hash === "C") {
    var el = document.getElementById("qna-abc-" + hash);
    if (el) { el.open = true; el.scrollIntoView({ behavior: "smooth", block: "start" }); }
  }
  var details = document.querySelectorAll("body details");
  var chunk = 40;
  function fillPlainText(from) {
    var to = Math.min(from + chunk, details.length);
    for (var i = from; i < to; i++) {
      var sum = details[i].querySelector("summary");
      if (sum) sum._plainText = sum.textContent;
    }
    if (to < details.length) setTimeout(function() { fillPlainText(to); }, 0);
  }
  if (details.length > 0) setTimeout(function() { fillPlainText(0); }, 0);
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initQnaSearch);
} else {
  initQnaSearch();
}
</script>
"""
    ).replace("__T2S__", _t2s_js).replace("__S2T__", _s2t_js))
    lines.append("</body></html>")

    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


def _source_id_from_label(label: str) -> str:
    """將來源標籤轉為安全的檔案名（用於 qna_data_{id}.json）。"""
    if not label:
        return "unknown"
    # 移除或替換不適合檔名的字元
    s = re.sub(r'[\\/:*?"<>|－—–\s]+', '_', label.strip())
    s = re.sub(r'_+', '_', s).strip('_')
    # 若為純中文等，取前 20 字並補 hash 避免衝突
    if len(s) > 40:
        s = s[:40]
    return s or "source"


def _get_homepage_for_source(label: str, sources_list: list) -> str:
    """從 links_merged.sources 取得該來源的首頁 URL。"""
    for s in (sources_list or []):
        if s.get("label") == label:
            return s.get("url", "")
    # 部分來源在 qna_nav_config 有 landing
    NAV_LANDING = {
        "以斯拉百科網": "http://www.equiptoserve.org/etspedia/",
        "華人護教": "https://www.chineseapologetics.net/",
        "恩泉－陳終道等": "https://wellsofgrace.com/messages/chen/bible_qna/xu1.htm",
        "GotQuestions.org": "https://www.gotquestions.org/content.html",
        "Christian Answers": "https://christiananswers.net/",
        "Solutions To Bible Errors": "https://defendinginerrancy.com/bible-difficulties/",
        "葛培理福音協會": "https://billygraham.org/answers",
        "證道浸信會": "https://www.logosbaptist.org/",
        "Reformed Answers": "https://reformedanswers.org/",
    }
    for k, v in NAV_LANDING.items():
        if k in label:
            return v
    return ""


def _flatten_to_subcategories(data) -> dict:
    """將巢狀 { book: [items] } 或 { cat: { sub: [items] } } 壓平為 { subcategory: [items] }。"""
    out = {}
    if isinstance(data, list):
        return {"": data}  # 無子分類
    if isinstance(data, dict):
        for k, v in data.items():
            if isinstance(v, list):
                out[k] = v
            elif isinstance(v, dict):
                # 遞迴壓平，鍵名用 "父 > 子" 連接
                for sk, sv in _flatten_to_subcategories(v).items():
                    key = f"{k} > {sk}" if sk else k
                    out[key] = sv
    return out


def write_progressive_json(abc_tree: dict, abc_config: dict, merged_data: dict):
    """
    產出分層載入用 JSON：
    - qna_level1.json: 頂層分類 A/B/C + 來源清單（含 homepage, dataFile）
    - qna_data_{source_id}.json: 各來源的子分類 → 題目
    """
    os.makedirs(QNA_DATA_DIR, exist_ok=True)
    sources_list = merged_data.get("sources", [])

    categories = []
    for letter, label in abc_config.get("top_level", {}).items():
        categories.append({"id": letter, "label": label})

    sources_out = []
    seen_ids = set()

    for letter in ["A", "B", "C"]:
        if letter not in abc_tree:
            continue
        section = abc_tree[letter]
        for section_label, sources in section.items():
            if not sources:
                continue
            for src_label, books in sources.items():
                src_id = _source_id_from_label(src_label)
                if src_id in seen_ids:
                    # 同一來源可能出現在多個分類，用 letter 區分
                    src_id = f"{src_id}_{letter}"
                seen_ids.add(src_id)

                homepage = _get_homepage_for_source(src_label, sources_list)
                data_file = f"qna_data_{src_id}.json"

                sources_out.append({
                    "id": src_id,
                    "label": src_label,
                    "category": letter,
                    "homepage": homepage,
                    "dataFile": data_file,
                })

                # 產出 qna_data_{id}.json
                subcats = _flatten_to_subcategories(books)
                # 過濾空列表
                subcats = {k: v for k, v in subcats.items() if v and isinstance(v, list)}
                # 每個 item 只保留 title, url；以斯拉百科含 ? 亂碼的 URL 需修復
                clean_subcats = {}
                for sub_name, items in subcats.items():
                    clean_items = []
                    for it in items:
                        if isinstance(it, dict) and it.get("url"):
                            url = it.get("url", "")
                            # 以斯拉百科：修復含 ? 亂碼，或錯誤的 新約難題-/舊約難題- 前綴（應為 聖經難題-）
                            if "以斯拉" in src_label and "equiptoserve.org/etspedia" in url:
                                if "?" in url or url.count("新約難題-") or url.count("舊約難題-") or ("辯道護教" in src_label and "辯道" in url):
                                    url = fix_equiptoserve_url(url, sub_name, section_breadcrumb=sub_name)
                            clean_items.append({
                                "title": it.get("title", ""),
                                "url": url,
                            })
                    if clean_items:
                        clean_subcats[sub_name] = clean_items

                data_path = os.path.join(QNA_DATA_DIR, data_file)
                with open(data_path, "w", encoding="utf-8") as f:
                    json.dump({
                        "sourceId": src_id,
                        "sourceLabel": src_label,
                        "subcategories": clean_subcats,
                    }, f, ensure_ascii=False, indent=2)

    level1 = {
        "categories": categories,
        "sources": sources_out,
    }
    with open(OUT_LEVEL1, "w", encoding="utf-8") as f:
        json.dump(level1, f, ensure_ascii=False, indent=2)

    # 產出 embed 版供 file:// 使用（fetch 在 file:// 下會失敗）
    embed_path = os.path.join(QNA_DATA_DIR, "qna_level1_embed.js")
    with open(embed_path, "w", encoding="utf-8") as f:
        f.write("var QNA_LEVEL1_DATA = ")
        json.dump(level1, f, ensure_ascii=False)
        f.write(";\n")
    print("Created", OUT_LEVEL1, embed_path, "and", len(sources_out), "qna_data_*.json files")


def main():
    if not os.path.isfile(MERGED_PATH):
        raise SystemExit(f"找不到 {MERGED_PATH}，請先執行 crawl_qna_list.py 產生 links_merged.json")

    with open(MERGED_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    items = data.get("items", [])

    # 以斯拉百科：只保留「聖經難題」相關連結（排除聖經地理、聖經人物、辯道護教等導覽）
    equiptoserve_label = "以斯拉百科－申命記～路得記"
    items_equip = [
        it for it in items
        if (it.get("source_label") == equiptoserve_label or (it.get("source") or "").lower() == "equiptoserve")
        and "聖經難題" in (it.get("url") or "")
    ]
    items_chineseap = [it for it in items if "chineseapologetics" in (it.get("source") or "").lower() or "華人護教" in (it.get("source_label") or "")]
    items_all = items

    tree_merged = build_tree(items_all)
    qna02_tree = {}
    if os.path.isfile(QNA02_TREE_PATH):
        with open(QNA02_TREE_PATH, "r", encoding="utf-8") as f:
            qna02_data = json.load(f)
        qna02_tree = qna02_data.get("tree", {})
        for src_label, books in qna02_tree.items():
            if books:
                tree_merged[src_label] = books

        # 以斯拉 辯道護教：合併 基要衛道（辯道）＋宗教衛道（護教） 全部分題
        apol_pairs = []
        if "以斯拉百科－辯道護教" in qna02_tree and qna02_tree["以斯拉百科－辯道護教"]:
            _collect_breadcrumb_items(qna02_tree["以斯拉百科－辯道護教"], out=apol_pairs)
        for src in EQUIP_APOLOGETICS_BASE_MERGE_SOURCES:
            if src in qna02_tree and qna02_tree[src]:
                _collect_breadcrumb_items(qna02_tree[src], out=apol_pairs)
        for src in EQUIP_APOLOGETICS_MERGE_SOURCES:
            if src in qna02_tree and qna02_tree[src]:
                _collect_breadcrumb_items(qna02_tree[src], out=apol_pairs)
        if apol_pairs:
            nested = _build_nested_from_breadcrumbs(apol_pairs)
            # 麵包屑為「辯道護教 > 基要衛道/宗教衛道 > 子題」→ 改為「辯道護教」下分「辯道」「護教」
            # 頂層鍵可能為 "辯道護教" 或 "辯道護教\u200f"（RTL），取唯一一鍵
            top_key = None
            for k in nested:
                if k and "辯道護教" in k:
                    top_key = k
                    break
            if top_key and len(nested) == 1:
                inner = nested[top_key]
                # 第二層：基要衛道→辯道，宗教衛道→護教（取內容 dict，鍵名可能含不可見字元）
                part_apol = {}
                part_religion = {}
                for k, v in (inner or {}).items():
                    if not isinstance(v, dict):
                        continue
                    if "宗教" in (k or ""):
                        part_religion.update(v)
                    else:
                        part_apol.update(v)
                renamed = {
                    "辯道": part_apol or inner.get("基要衛道", {}),
                    "護教": part_religion or inner.get("宗教衛道", {}),
                }
                qna02_tree["以斯拉百科－辯道護教"] = {"辯道護教": renamed}
            else:
                qna02_tree["以斯拉百科－辯道護教"] = {"辯道護教": nested}
        # 舊約背景：從子節來源（近東與舊約、沃土與文化發展等）合併麵包屑題目
        merge_pairs = []
        for src in EQUIP_OT_BACKGROUND_MERGE_SOURCES:
            if src in qna02_tree and qna02_tree[src]:
                _collect_breadcrumb_items(qna02_tree[src], out=merge_pairs)
        if merge_pairs:
            qna02_tree["以斯拉百科－舊約背景"] = _build_nested_from_breadcrumbs(merge_pairs)
        elif "以斯拉百科－舊約背景" in qna02_tree and qna02_tree["以斯拉百科－舊約背景"]:
            nested = reshape_equip_background(qna02_tree["以斯拉百科－舊約背景"])
            if nested:
                qna02_tree["以斯拉百科－舊約背景"] = nested
        # 新約背景：從子節來源合併
        merge_pairs_nt = []
        for src in EQUIP_NT_BACKGROUND_MERGE_SOURCES:
            if src in qna02_tree and qna02_tree[src]:
                _collect_breadcrumb_items(qna02_tree[src], out=merge_pairs_nt)
        if merge_pairs_nt:
            qna02_tree["以斯拉百科－新約背景"] = _build_nested_from_breadcrumbs(merge_pairs_nt)
        elif "以斯拉百科－新約背景" in qna02_tree and qna02_tree["以斯拉百科－新約背景"]:
            nested = reshape_equip_background(qna02_tree["以斯拉百科－新約背景"])
            if nested:
                qna02_tree["以斯拉百科－新約背景"] = nested

        # 華人基督徒查經：改為三區（舊約查經、新約查經、主題查經）＋書卷→ index-T.htm
        for key in list(qna02_tree.keys()):
            if "ccbiblestudy" in key.lower() or "華人基督徒查經" in key:
                qna02_tree[key] = build_ccbiblestudy_tree()
                break

    abc_config = {"top_level": {"A": "聖經書卷難題", "B": "神學教義難題", "C": "信徒教會難題"}, "source_category_to_abc": {}, "default_abc": "A"}
    if os.path.isfile(ABC_CONFIG_PATH):
        with open(ABC_CONFIG_PATH, "r", encoding="utf-8") as f:
            abc_config = json.load(f)

    abc_tree = build_abc_tree(qna02_tree, tree_merged, abc_config)

    tree_chineseap = build_tree(items_chineseap)
    tree_equip = build_tree(items_equip)
    tree_equip = reshape_equiptoserve_tree(tree_equip)

    os.makedirs(QNA_DIR, exist_ok=True)
    out_abs = os.path.abspath(OUT_PATH)
    write_list_html(None, OUT_PATH, "聖經難題目錄（全部來源）", use_abc=True, abc_tree=abc_tree)
    write_list_html(tree_chineseap, OUT_CHINESEAP, "聖經難題目錄－華人護教")
    write_list_html(tree_equip, OUT_EQUIP, "聖經難題目錄－以斯拉百科")

    # 分層載入用 JSON（qna_level1.json + qna_data_*.json）
    write_progressive_json(abc_tree, abc_config, data)

    def _count_abc_items(books):
        if isinstance(books, list):
            return len(books)
        if isinstance(books, dict):
            return sum(_count_abc_items(v) for v in books.values())
        return 0
    total_items = sum(_count_abc_items(books) for section in abc_tree.values() for _label, srcs in section.items() for _src, books in srcs.items())
    print("Created", OUT_PATH, "ABC structure, ~", total_items, "items")

    # 6 檔拆分：五經至詩歌書、先知書、新約福音書行傳、新約書信啟示錄、神學、信徒教會
    SPLIT_CONFIG = [
        ("OT_五經至詩歌書", "qna_OT_五經至詩歌書.htm", "聖經難題－五經至詩歌書"),
        ("OT_先知書", "qna_OT_先知書.htm", "聖經難題－先知書"),
        ("NT_福音書行傳", "qna_NT_福音書行傳.htm", "聖經難題－新約福音書行傳"),
        ("NT_書信啟示錄", "qna_NT_書信啟示錄.htm", "聖經難題－新約書信啟示錄"),
        ("B", "qna_B.htm", "聖經難題－神學教義"),
        ("C", "qna_C.htm", "聖經難題－信徒教會"),
    ]
    for split_type, filename, page_title in SPLIT_CONFIG:
        filtered = filter_abc_tree_for_split(abc_tree, split_type)
        out_split = os.path.join(QNA_DIR, filename)
        write_list_html(None, out_split, page_title, use_abc=True, abc_tree=filtered, back_link_href="qna_split_index.htm")
        n = sum(_count_abc_items(books) for section in filtered.values() for _label, srcs in section.items() for _src, books in srcs.items())
        print("  Split:", filename, "~", n, "items", flush=True)

    # 雲端用：複製為 ASCII 檔名，避免主機對中文檔名 404
    ascii_copies = [
        ("qna_OT_五經至詩歌書.htm", "qna_OT_1.htm"),
        ("qna_OT_先知書.htm", "qna_OT_2.htm"),
        ("qna_NT_福音書行傳.htm", "qna_NT_1.htm"),
        ("qna_NT_書信啟示錄.htm", "qna_NT_2.htm"),
    ]
    for src_name, ascii_name in ascii_copies:
        src_path = os.path.join(QNA_DIR, src_name)
        dst_path = os.path.join(QNA_DIR, ascii_name)
        if os.path.isfile(src_path):
            shutil.copy2(src_path, dst_path)
            print("  Cloud copy:", ascii_name, flush=True)

    print("Open:", "file:///" + out_abs.replace("\\", "/"))


if __name__ == "__main__":
    main()

