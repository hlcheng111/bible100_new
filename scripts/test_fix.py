#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re
from urllib.parse import quote, unquote

line = '<a href="http://www.equiptoserve.org/etspedia/%C3%A8%C2%81%C2%96%C3%A7%C2%B6%C2%93%C3%A9%C2%9B%C2%A3%C3%A9%C2%A1%C2%8C/%C3%A5%C2%89%C2%B5-1" style="...">'
pattern = r'(href=["\'])(http://www\.equiptoserve\.org/etspedia/[^"\']+)(["\'])'
m = re.search(pattern, line, re.I)
if m:
    url = m.group(2)
    print('Matched URL:', url)
    parts = url.split('/')
    print('Parts:', parts)
    if len(parts) >= 5:
        part = parts[4]  # %C3%A8%C2%81%C2%96...
        print('Part to fix:', part)
        decoded_once = unquote(part, encoding='utf-8')
        print('Decoded once:', repr(decoded_once))
        if '%' in decoded_once:
            decoded_twice = unquote(decoded_once, encoding='utf-8')
            print('Decoded twice:', repr(decoded_twice))
            print('Fixed:', quote(decoded_twice, safe='-'))
else:
    print('No match')
