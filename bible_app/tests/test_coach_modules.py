#!/usr/bin/env python3
"""教練模組 Sprint 0–5 靜態檢查"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SHELL = ROOT / "shell"


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def test_sprint0_core_and_nav():
    nav = read(SHELL / "js" / "shell_nav.js")
    idx = read(ROOT / "index.html")
    assert "coach_kernel.js" in read(SHELL / "pages" / "today.html")
    assert "B100CoachKernel" in read(SHELL / "js" / "coach_kernel.js")
    assert "B100CoachState" in read(SHELL / "js" / "coach_state.js")
    assert "B100CoachI18n" in read(SHELL / "js" / "coach_i18n.js")
    assert "resolveToday" in read(SHELL / "js" / "coach_kernel.js")
    assert "此功能籌備中" not in nav
    assert "feature-pending" not in idx
    assert "coach-modules.css" in read(SHELL / "pages" / "today.html")


def test_sprint1_today():
    today = read(SHELL / "pages" / "today.html")
    hub = read(SHELL / "js" / "today_hub.js")
    assert "todayStartBtn" in today
    assert "coachRing" in today
    assert "B100TodayHub" in hub
    assert "bible-read-plain" in today


def test_sprint2_read_done():
    rd = read(SHELL / "pages" / "read-done.html")
    coach = read(SHELL / "js" / "read_done_coach.js")
    assert "coachReflect" in rd
    assert "B100ReadDoneCoach" in coach
    assert "setRing('read'" in coach
    assert "link_qna" in coach


def test_sprint3_qna():
    html = read(SHELL / "pages" / "ai-qna.html")
    js = read(SHELL / "js" / "qna_hub.js")
    faq = read(SHELL / "data" / "coach_faq.json")
    assert "qnaFaq" in html
    assert "generateQnaPrompt" in read(SHELL / "js" / "prompt_guardrails.js")
    assert "qZh" in faq and "qEn" in faq and "qVi" in faq and "qId" in faq
    assert "openai" not in js.lower() and "api key" not in js.lower()


def test_sprint4_squad():
    html = read(SHELL / "pages" / "pacing.html")
    js = read(SHELL / "js" / "squad_lite.js")
    assert "squadPosts" in html
    assert "addSquadPost" in js
    assert "排行榜" not in js


def test_sprint5_mentor():
    html = read(SHELL / "pages" / "ai-tutor.html")
    js = read(SHELL / "js" / "mentor_hub.js")
    assert "mentorReview" in html
    assert "weekStats" in js
    assert "MBTI" not in js and "DISC" not in js


def test_i18n_four_locales():
    i18n = read(SHELL / "js" / "coach_i18n.js")
    for loc in ("zh-Hant", "en", "vi", "id"):
        assert loc in i18n
    assert "today_title" in i18n


def test_landing_quickstart_today():
  landing = read(SHELL / "js" / "landing_tracks.js")
  assert "today.html" in landing


def main() -> int:
    tests = [
        test_sprint0_core_and_nav,
        test_sprint1_today,
        test_sprint2_read_done,
        test_sprint3_qna,
        test_sprint4_squad,
        test_sprint5_mentor,
        test_i18n_four_locales,
        test_landing_quickstart_today,
    ]
    failed = 0
    for fn in tests:
        try:
            fn()
            print(f"OK  {fn.__name__}")
        except AssertionError as e:
            failed += 1
            print(f"FAIL {fn.__name__}: {e}")
    if failed:
        print(f"\n{failed} failed")
        return 1
    print(f"\nAll {len(tests)} coach checks passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
