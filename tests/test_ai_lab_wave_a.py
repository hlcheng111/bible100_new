# -*- coding: utf-8 -*-
"""AI Lab Wave a：導讀｜備課｜創作；營運降為行政捷徑。"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8", errors="replace")


def test_sidebar_three_task_zones():
    html = read("ai_tools/sidebar_lab.html")
    assert "sb-zone-guide" in html
    assert "sb-zone-prep" in html
    assert "sb-zone-create" in html
    assert "sb-zone-admin" in html
    assert "導讀 · 經文真相與釋經" in html
    assert "備課 · 課程與作業" in html
    assert "創作 · 媒體表達" in html
    assert "行政捷徑" in html
    assert "E · 營運與教會 CRM" not in html
    assert "A · 聖經神學 AI 導讀" not in html
    assert "volunteer_shift" not in html
    # 經典選單歸位＋易懂舊名
    assert "文字轉圖像" in html
    assert "文字轉語音" in html
    assert "文字轉音樂" in html
    assert "文字轉影片" in html
    assert "課程設計" in html
    assert "作業輔導" in html
    assert "AI 問答系統" in html
    assert "YouTube 嵌入工具" in html
    assert "全站工具說明" in html
    assert "functions/ai_core.html" in html
    assert "sb-path" in html


def test_landing_matches_wave_a():
    html = read("ai_tools/ai_lab_landing.html")
    assert "導讀｜備課｜創作" in html
    assert "導讀 · 經文真相與釋經" in html
    assert "備課 · 課程與作業" in html
    assert "創作 · 媒體表達" in html
    assert "行政捷徑" in html
    assert "E · 營運與教會 CRM" not in html
    assert "文字轉圖像" in html
    assert "課程設計" in html


def test_standalone_shell_top_nav():
    html = read("ai_tools/ai_lab.html")
    assert 'data-sb-focus="guide"' in html
    assert 'data-sb-focus="prep"' in html
    assert 'data-sb-focus="create"' in html


def test_index_v5_detects_new_zone_id():
    html = read("index_v5.html")
    assert "sb-zone-guide" in html


if __name__ == "__main__":
    fails = 0
    for name, fn in list(globals().items()):
        if name.startswith("test_") and callable(fn):
            try:
                fn()
                print("OK", name)
            except AssertionError as e:
                print("FAIL", name, e)
                fails += 1
    raise SystemExit(1 if fails else 0)
