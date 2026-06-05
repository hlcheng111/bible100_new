#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
自動將 qna02.htm 中的書卷名稱連結改為 H4 標籤。

規則：
- 識別指向 chapterXX.html（沒有 # 錨點）的連結
- 檢查連結文字是否為書卷名稱
- 將這些連結改為 <h4> 標籤

使用方式: python add_h4_tags_for_books.py
輸出: qna/qna02.htm（備份為 qna02.htm.bak）
"""

import os
import re
import html
from bs4 import BeautifulSoup

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QNA02_PATH = os.path.join(ROOT, "qna", "qna02.htm")
BACKUP_PATH = os.path.join(ROOT, "qna", "qna02.htm.bak")

# 書卷名稱列表（繁體和簡體）
BOOK_NAMES = [
    "創世記", "创世记",
    "出埃及記", "出埃及记",
    "利未記", "利未记",
    "民數記", "民数记",
    "申命記", "申命记",
    "約書亞記", "约书亚记",
    "士師記", "士师记",
    "路得記", "路得记",
    "撒母耳記", "撒母耳记",
    "列王記", "列王记",
    "歷代志", "历代志",
    "詩篇", "诗篇",
    "箴言",
    "傳道書", "传道书",
    "以賽亞書", "以赛亚书",
    "耶利米書", "耶利米书",
    "以西結書", "以西结书",
    "何西阿書", "何西阿书",
    "約珥書", "约珥书",
    "但以理書", "但以理书",
    "瑪拉基書", "玛拉基书",
    "馬太福音", "马太福音",
    "馬可福音", "马可福音",
    "路加福音",
    "約翰福音", "约翰福音",
    "使徒行傳", "使徒行传",
    "羅馬書", "罗马书",
    "哥林多前書", "哥林多前书",
    "哥林多後書", "哥林多后书",
    "加拉太書", "加拉太书",
    "以弗所書", "以弗所书",
    "腓立比書", "腓立比书",
    "歌羅西書", "歌罗西书",
    "帖撒羅尼迦前書", "帖撒罗尼迦前书",
    "帖撒羅尼迦後書", "帖撒罗尼迦后书",
    "提摩太前書", "提摩太前书",
    "提摩太後書", "提摩太后书",
    "提多書", "提多书",
    "希伯來書", "希伯来书",
    "雅各書", "雅各书",
    "彼得前書", "彼得前书",
    "彼得後書", "彼得后书",
    "約翰一書", "约翰一书",
    "約翰二書", "约翰二书",
    "約翰三書", "约翰三书",
    "猶大書", "犹大书",
    "啟示錄", "启示录",
]

def decode_entity_text(s):
    """解碼 HTML 實體"""
    if not s:
        return ""
    try:
        return html.unescape(s)
    except Exception:
        return s

def is_book_name(text):
    """檢查文字是否為書卷名稱"""
    if not text:
        return False
    text = decode_entity_text(text).strip()
    # 移除 HTML 標籤
    text = re.sub(r'<[^>]+>', '', text)
    text = text.strip()
    
    for book_name in BOOK_NAMES:
        if book_name in text or text == book_name:
            return True
    return False

def process_qna02():
    """處理 qna02.htm，將書卷名稱連結改為 H4 標籤"""
    
    # 讀取檔案
    with open(QNA02_PATH, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()
    
    # 備份原檔案
    with open(BACKUP_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"已備份原檔案至: {BACKUP_PATH}")
    
    # 使用 BeautifulSoup 解析
    soup = BeautifulSoup(content, "html.parser")
    
    # 統計
    changed_count = 0
    changed_books = []
    
    # 尋找所有連結
    for a in soup.find_all("a", href=True):
        href = a.get("href", "").strip()
        text = a.get_text(strip=True)
        
        # 檢查是否為書卷分類連結（指向 chapterXX.html，沒有 # 錨點）
        if "tochrist.org/book/download_books/sjnthb/chapter" in href:
            # 檢查是否為書卷分類連結（沒有 # 錨點，且檔名格式為 chapterXX.html）
            filename = href.split("/")[-1]
            is_book_link = "#" not in href and re.match(r'chapter\d+\.html$', filename)
            
            if is_book_link:
                # 檢查連結文字是否為書卷名稱
                if is_book_name(text):
                    # 檢查父標籤是否已經是 H4
                    parent = a.parent
                    if parent and parent.name == "h4":
                        continue  # 已經是 H4，跳過
                    
                    # 檢查是否在 <p> 標籤內
                    if parent and parent.name == "p":
                        # 檢查 <p> 標籤內是否只有這個連結（或只有連結和 <br>）
                        p_content = parent.decode_contents()
                        # 移除空白和 <br> 標籤
                        p_clean = re.sub(r'\s+', '', p_content)
                        p_clean = re.sub(r'<br\s*/?>', '', p_clean, flags=re.IGNORECASE)
                        a_clean = re.sub(r'\s+', '', str(a))
                        
                        # 如果 <p> 標籤內只有這個連結，將整個 <p> 改為 <h4>
                        if p_clean == a_clean or p_clean.startswith(a_clean):
                            # 創建新的 H4 標籤
                            new_h4 = soup.new_tag("h4")
                            new_h4.append(a.extract())  # 移動連結到 H4
                            parent.replace_with(new_h4)
                            changed_count += 1
                            changed_books.append(text)
                            print(f"  ✓ 將「{text}」改為 H4 標籤")
                        else:
                            # <p> 標籤內有其他內容，只將連結改為 H4
                            new_h4 = soup.new_tag("h4")
                            new_h4.append(a.extract())
                            parent.insert_before(new_h4)
                            changed_count += 1
                            changed_books.append(text)
                            print(f"  ✓ 將「{text}」改為 H4 標籤（保留 <p> 其他內容）")
                    else:
                        # 不在 <p> 標籤內，直接將連結改為 H4
                        new_h4 = soup.new_tag("h4")
                        new_h4.append(a.extract())
                        if parent:
                            parent.insert_before(new_h4)
                        else:
                            # 如果沒有父標籤，在連結位置插入
                            a.insert_before(new_h4)
                        changed_count += 1
                        changed_books.append(text)
                        print(f"  ✓ 將「{text}」改為 H4 標籤")
    
    # 寫回檔案
    with open(QNA02_PATH, "w", encoding="utf-8") as f:
        f.write(str(soup))
    
    print(f"\n完成！共修改 {changed_count} 個書卷名稱為 H4 標籤")
    if changed_books:
        print(f"修改的書卷：{', '.join(set(changed_books))}")
    print(f"\n原檔案已備份至: {BACKUP_PATH}")
    print(f"修改後的檔案: {QNA02_PATH}")
    print("\n請在 FrontPage 中檢查並手動調整格式。")

if __name__ == "__main__":
    if not os.path.exists(QNA02_PATH):
        print(f"錯誤：找不到檔案 {QNA02_PATH}")
        exit(1)
    
    print("開始處理 qna02.htm...")
    print("尋找書卷名稱連結並改為 H4 標籤...\n")
    
    try:
        process_qna02()
    except Exception as e:
        print(f"\n錯誤：{e}")
        import traceback
        traceback.print_exc()
        exit(1)
