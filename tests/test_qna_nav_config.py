# -*- coding: utf-8 -*-
"""qna_nav_config.js must stay aligned with bundle keys and product policy."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
NAV = ROOT / "qna" / "qna_nav_config.js"


def test_hub_category_retired():
    text = NAV.read_text(encoding="utf-8")
    assert "多站導覽（試）" not in text
    assert '"HUB"' not in text
    assert "hub_ca_teens" not in text
    assert "hub_etspedia" not in text
    # canonical sources kept
    assert "equiptoserve_etspedia" in text
    assert "reformedanswers" in text
    assert "billygraham" in text
    assert "christiananswers" in text


def test_layer1_has_five_categories():
    text = NAV.read_text(encoding="utf-8")
    ids = re.findall(r'"id":\s*"(A(?:_OT|_NT)?|B|C)"', text)
    assert "A" in ids and "A_OT" in ids and "A_NT" in ids and "B" in ids and "C" in ids


if __name__ == "__main__":
    test_hub_category_retired()
    test_layer1_has_five_categories()
    print("OK test_qna_nav_config")
