#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fix_equiptoserve_urls.py - 修復 qna02.htm 中以斯拉百科連結的 URL 編碼問題

問題：href 中直接寫了未編碼的中文字（如 èç¶é£é¡/åµ-1），導致雙重編碼。
解決：將 href 中的中文字正確編碼為 URL 格式。
"""
from pathlib import Path
import re
from urllib.parse import quote, unquote


def fix_equiptoserve_urls(content: str) -> str:
    """
    修復 equiptoserve.org/etspedia/ 連結的 URL 編碼。
    處理：未編碼中文字、雙重編碼、問號亂碼。
    """
    def repl(m):
        full_match = m.group(0)
        url = m.group(2)  # http://www.equiptoserve.org/etspedia/...
        
        # 分割 URL
        parts = url.split('/')
        if len(parts) < 4:
            return full_match
        
        base = '/'.join(parts[:4])  # http://www.equiptoserve.org/etspedia
        path_parts = parts[4:]
        
        # 處理每個路徑段
        fixed_parts = []
        for part in path_parts:
            if not part:
                continue
            
            # 情況1：雙重編碼（%C3%A8 這種）
            if '%' in part:
                # 檢查是否為雙重編碼：解碼一次後如果還有 % 或包含亂碼字符
                try:
                    decoded_once = unquote(part, encoding='utf-8')
                    # 如果解碼後還有 %，可能是雙重編碼
                    if '%' in decoded_once:
                        decoded_twice = unquote(decoded_once, encoding='utf-8')
                        # 重新編碼為正確格式
                        fixed_parts.append(quote(decoded_twice, safe='-'))
                        continue
                    # 如果解碼後是亂碼（包含非中文字符的奇怪字符），可能是 Latin-1 誤解
                    if re.search(r'[^\x00-\x7F\u4e00-\u9fff]', decoded_once):
                        # 嘗試用 Latin-1 解碼再轉 UTF-8
                        try:
                            decoded_latin = unquote(part, encoding='latin-1')
                            decoded_str = decoded_latin.encode('latin-1').decode('utf-8')
                            fixed_parts.append(quote(decoded_str, safe='-'))
                            continue
                        except:
                            pass
                    # 如果已經是正確編碼（如 %E8%81%96），保持原樣
                    if re.match(r'^%[0-9A-Fa-f]{2}(%[0-9A-Fa-f]{2})*$', part):
                        fixed_parts.append(part)
                    else:
                        fixed_parts.append(quote(decoded_once, safe='-'))
                    continue
                except Exception as e:
                    # 如果解碼失敗，保持原樣
                    fixed_parts.append(part)
            
            # 情況2：問號亂碼（????）- 跳過，無法修復
            if '?' in part and len(set(part)) <= 2:  # 只有 ? 和少數字符
                continue
            
            # 情況3：未編碼的中文字或亂碼
            if re.search(r'[^\x00-\x7F]', part):
                fixed_parts.append(quote(part, safe='-'))
            else:
                # ASCII 字符，保持原樣
                fixed_parts.append(part)
        
        fixed_path = '/'.join(fixed_parts)
        fixed_url = base + ('/' + fixed_path if fixed_path else '')
        return full_match.replace(url, fixed_url)
    
    # 匹配所有 equiptoserve.org/etspedia/ 的連結
    pattern = r'(href=["\'])(http://www\.equiptoserve\.org/etspedia/[^"\']+)(["\'])'
    content = re.sub(pattern, repl, content, flags=re.I)
    
    return content


def main():
    base = Path(__file__).resolve().parent.parent
    src = base / "qna" / "qna02.htm"
    
    if not src.exists():
        print(f"錯誤：找不到 {src}")
        return 1
    
    print(f"讀取 {src} ...")
    content = src.read_text(encoding='utf-8')
    
    # 備份
    backup = src.with_suffix('.htm.bak')
    if not backup.exists():
        backup.write_text(content, encoding='utf-8')
        print(f"已備份至 {backup}")
    
    # 修復
    fixed = fix_equiptoserve_urls(content)
    
    if fixed != content:
        src.write_text(fixed, encoding='utf-8')
        print(f"已修復 {src}")
        print("請檢查連結是否正確，如有問題可用備份還原。")
    else:
        print("未發現需要修復的連結。")
    
    return 0


if __name__ == "__main__":
    exit(main())
