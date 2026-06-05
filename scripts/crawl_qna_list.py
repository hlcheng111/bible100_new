# -*- coding: utf-8 -*-
"""
聖經/神學難題 Q&A 列表爬蟲
只抓「列表頁/目錄頁」的連結與標題，不抓正文。
輸出 JSON 供前端 sidebar 使用；正文由前端以 iframe 顯示原站（合法引用）。
使用方式:
  python crawl_qna_list.py [列表頁URL]
  不帶參數時使用預設列表頁。
"""
import json
import os
import re
import sys
import time
from urllib.parse import urljoin, urlparse

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("請先安裝: pip install requests beautifulsoup4")
    sys.exit(1)

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
REQUEST_DELAY = 1.5  # 秒，避免對目標站造成負擔
OUTPUT_DIR = "qna/data"


def fetch_list_page(url):
    """抓取單一列表頁，只取 HTML。"""
    headers = {"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8"}
    try:
        r = requests.get(url, headers=headers, timeout=15)
        r.raise_for_status()
        r.encoding = r.apparent_encoding or "utf-8"
        return r.text
    except Exception as e:
        print(f"抓取失敗 {url}: {e}")
        return None


def extract_links_from_html(html, base_url, same_host_only=True):
    """
    從 HTML 擷取連結與標題。
    - 只保留 href 有效的 <a>。
    - 可選只保留同網域連結。
    """
    soup = BeautifulSoup(html, "html.parser")
    parsed_base = urlparse(base_url)
    base_netloc = parsed_base.netloc
    items = []
    seen = set()

    for a in soup.find_all("a", href=True):
        href = (a.get("href") or "").strip()
        if not href or href.startswith("#") or href.lower().startswith(("javascript:", "mailto:", "tel:")):
            continue
        full_url = urljoin(base_url, href)
        raw = (a.get_text() or "").strip()
        title = re.sub(r"\s+", " ", raw).strip() if raw else ""
        if len(title) < 2 or not re.search(r"[\u4e00-\u9fff\w]", title):
            title = full_url.rstrip("/").split("/")[-1].replace(".htm", "").replace(".html", "") or full_url[:80]
        if not title:
            continue
        if same_host_only:
            if urlparse(full_url).netloc != base_netloc:
                continue
        key = (full_url, title)
        if key in seen:
            continue
        seen.add(key)
        items.append({"title": title[:200], "url": full_url})

    return items


def crawl_one_list(list_url, output_filename=None):
    """抓取一個列表頁並寫入 JSON。"""
    print(f"正在抓取列表: {list_url}")
    html = fetch_list_page(list_url)
    if not html:
        return None
    time.sleep(REQUEST_DELAY)

    items = extract_links_from_html(html, list_url)
    parsed = urlparse(list_url)
    source = parsed.netloc.replace("www.", "").split(".")[0]

    data = {
        "source": source,
        "list_url": list_url,
        "crawled_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "count": len(items),
        "items": items,
    }

    if not output_filename:
        safe = re.sub(r"[^\w\-]", "_", source)
        output_filename = f"{OUTPUT_DIR}/links_{safe}.json"

    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    outdir = os.path.join(root, OUTPUT_DIR)
    os.makedirs(outdir, exist_ok=True)
    outpath = os.path.join(root, output_filename)
    with open(outpath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"已寫入 {len(items)} 筆連結 -> {outpath}")
    return data


# 內建預設（當無 sources_config.json 時使用）
DEFAULT_LIST_URLS = [
    "https://wellsofgrace.com/bible/qna/bible_wenti/archer/index.htm",
    "https://wellsofgrace.com/bible/qna/nanti-su/index.html",
]


def load_list_pages_from_config():
    """從 qna/data/sources_config.json 讀取列表頁；失敗則回傳 None。"""
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    config_path = os.path.join(root, OUTPUT_DIR, "sources_config.json")
    if not os.path.isfile(config_path):
        return None
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            cfg = json.load(f)
        pages = cfg.get("list_pages") or []
        return [(p.get("url"), p.get("label_zh") or p.get("label_en") or "") for p in pages if p.get("url")]
    except Exception as e:
        print(f"讀取 sources_config 失敗: {e}")
        return None


if __name__ == "__main__":
    list_pages = load_list_pages_from_config()
    if list_pages is None:
        list_pages = [(u, "") for u in DEFAULT_LIST_URLS]

    limit = None
    for a in sys.argv[1:]:
        if a.startswith("--limit=") and a[8:].isdigit():
            limit = int(a[8:])
            break
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if limit is not None:
        list_pages = list_pages[:limit]
        print("Limit: first", limit, "list page(s)")

    if len(args) == 1 and args[0].startswith("http"):
        crawl_one_list(args[0])
    else:
        all_items = []
        source_labels = []
        for url, label in list_pages:
            data = crawl_one_list(url)
            if data:
                for it in data["items"]:
                    it["source"] = data.get("source", "")
                    it["source_label"] = label or data.get("source", "")
                all_items.extend(data["items"])
                source_labels.append({"url": url, "label": label or data.get("source", "")})
            time.sleep(REQUEST_DELAY)
        if all_items:
            root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            os.makedirs(os.path.join(root, OUTPUT_DIR), exist_ok=True)
            merge_path = os.path.join(root, OUTPUT_DIR, "links_merged.json")
            payload = {
                "sources": source_labels,
                "count": len(all_items),
                "items": all_items,
                "categories": None,
            }
            with open(merge_path, "w", encoding="utf-8") as f:
                json.dump(payload, f, ensure_ascii=False, indent=2)
            print(f"已合併寫入 {len(all_items)} 筆 -> {merge_path}")
