#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
split_qna02.py - 純 HTML 切分，無 JSON、無 URL 轉換

讀取 qna02.htm，依行數均分為 6 檔，產出 qna02_1.htm ~ qna02_6.htm。
不做 parse、JSON、URL 轉換，僅做字串切分。
"""
from pathlib import Path
import re


def find_body_boundaries(lines):
    """找出 <body> 與 </body> 的行號（0-based）。"""
    body_start = None
    body_end = None
    for i, line in enumerate(lines):
        if re.search(r'<body\s', line) or line.strip() == '<body>':
            body_start = i
        if '</body>' in line:
            body_end = i
            break
    return body_start, body_end


def split_qna02(src_path: Path, out_dir: Path, num_parts: int = 6):
    """
    將 qna02.htm 切分為 num_parts 個 HTML 檔。
    每個輸出檔為完整 HTML，僅 body 內容被均分。
    """
    content = src_path.read_text(encoding='utf-8')
    lines = content.splitlines(keepends=True)
    total = len(lines)

    body_start, body_end = find_body_boundaries(lines)
    if body_start is None or body_end is None:
        raise ValueError("無法找到 <body> 或 </body> 邊界")

    header = ''.join(lines[: body_start + 1])  # 含 <body> 該行
    # 若 header 無 <base target="main">，在 </head> 前加入，使連結在 main frame 開啟
    if 'target="main"' not in header and '<base' not in header.lower():
        header = header.replace('</head>', '<base target="main">\n</head>')
    body_lines = lines[body_start + 1 : body_end]
    footer = ''.join(lines[body_end :])  # 含 </body> 及之後

    n = len(body_lines)
    chunk_size = (n + num_parts - 1) // num_parts

    out_dir.mkdir(parents=True, exist_ok=True)

    for i in range(num_parts):
        start = i * chunk_size
        end = min((i + 1) * chunk_size, n)
        chunk = ''.join(body_lines[start:end])
        out_path = out_dir / f"qna02_{i + 1}.htm"
        out_path.write_text(header + chunk + footer, encoding='utf-8')
        print(f"  {out_path.name}: 行 {start + 1}–{end} (共 {end - start} 行)")


def main():
    base = Path(__file__).resolve().parent.parent
    src = base / "qna" / "qna02.htm"
    out_dir = base / "qna"

    if not src.exists():
        print(f"錯誤：找不到 {src}")
        return 1

    print(f"讀取 {src} ...")
    split_qna02(src, out_dir, num_parts=6)
    print("完成。")
    return 0


if __name__ == "__main__":
    exit(main())
