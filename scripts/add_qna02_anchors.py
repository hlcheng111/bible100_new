#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
add_qna02_anchors.py - 在 qna02.htm 的 h2（來源）、h4（書卷）前加入錨點

供 QNA.html 選單「即點即到」：qna02_1.htm#創世記、qna02.htm#src-恩泉Archer 等。
"""
from pathlib import Path
import re


def strip_html(html: str) -> str:
    """移除 HTML 標籤，取得純文字。"""
    return re.sub(r'<[^>]+>', '', html).strip()


def sanitize_id(text: str) -> str:
    """將文字轉為合法 HTML id（字母、數字、連字號、底線）。"""
    # 保留中文、英文、數字
    s = re.sub(r'[^\w\u4e00-\u9fff\-]', '', text)
    return s[:50] if s else 'anchor'


def add_anchors(content: str) -> str:
    """
    在每個 <h2> 前加 <span id="src-xxx">，在每個 <h4> 前加 <span id="xxx">。
    重複 id 時加 -2, -3 ...
    """
    seen_h2 = {}
    seen_h4 = {}

    def repl_h2(m):
        full = m.group(0)
        inner = m.group(2)
        text = strip_html(inner)
        base_id = 'src-' + sanitize_id(text) if text else 'src-section'
        idx = seen_h2.get(base_id, 0) + 1
        seen_h2[base_id] = idx
        aid = base_id if idx == 1 else f'{base_id}-{idx}'
        return f'<span id="{aid}"></span>{full}'

    def repl_h4(m):
        full = m.group(0)
        inner = m.group(2)
        text = strip_html(inner)
        base_id = sanitize_id(text) if text else 'section'
        idx = seen_h4.get(base_id, 0) + 1
        seen_h4[base_id] = idx
        aid = base_id if idx == 1 else f'{base_id}-{idx}'
        return f'<span id="{aid}"></span>{full}'

    # 匹配 <h2 ...>...</h2> 和 <h4 ...>...</h4>（含屬性、多行）
    # 使用 DOTALL 讓 . 匹配換行，非貪婪
    content = re.sub(
        r'<(h2)(?:\s[^>]*)?>([\s\S]*?)</h2>',
        repl_h2,
        content,
        flags=re.IGNORECASE
    )
    content = re.sub(
        r'<(h4)(?:\s[^>]*)?>([\s\S]*?)</h4>',
        repl_h4,
        content,
        flags=re.IGNORECASE
    )
    return content


def main():
    base = Path(__file__).resolve().parent.parent
    src = base / "qna" / "qna02.htm"

    if not src.exists():
        print(f"錯誤：找不到 {src}")
        return 1

    content = src.read_text(encoding='utf-8')
    out = add_anchors(content)
    src.write_text(out, encoding='utf-8')
    print(f"已為 {src.name} 加入錨點。")
    return 0


if __name__ == "__main__":
    exit(main())
