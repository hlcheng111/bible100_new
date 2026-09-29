# -*- coding: utf-8 -*-
"""Insert concept image mounts into G planning tool Tab intro pages."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

TOOLS = {
    "Church_Governance_spiritual_health.html": ("spiritual", ""),
    "Church_Governance_pastoral_health.html": ("pastoral", ""),
    "shape-gifts-assessment.html": ("shape", ""),
    "ministry-competency-assessment.html": ("competency", ""),
    "alda-leadership-assessment.html": ("alda", ""),
    "Church_Governance_urgent_matrix.html": ("urgent", ""),
    "Church_Governance_PDCA_cycle.html": ("pdca", ""),
    "johari-window-assessment.html": ("johari", ""),
    "disc-profile-assessment.html": ("disc", ""),
    "mbti-self-awareness.html": ("mbti", ""),
    "Church_Governance_8020_focus.html": ("ministry8020", ""),
    "Church_Governance_SWOT_matrix.html": ("swot", ""),
    "Church_Governance_Culture_radar.html": ("culture", ""),
    "Church_Governance_SMART_goals.html": ("smart", ""),
    "Church_Governance_KPI_alignment.html": ("kpiokr", ""),
    "Church_Health_NCD_planning.html": ("ncd", ""),
    "planning/raci-reflection.html": ("raci", "../"),
}

MOUNT_TPL = '\n    <div class="acs-concept-mount" data-concept-tool="{tool}"{base}></div>\n'
SCRIPT = '<script src="js/planning_concept_images.js"></script>'
SCRIPT_RACI = '<script src="../js/planning_concept_images.js"></script>'


def insert_mount(text: str, tool: str, base: str) -> str:
    marker = f'data-concept-tool="{tool}"'
    if marker in text:
        return text
    base_attr = f' data-concept-base="{base}"' if base else ""
    mount = MOUNT_TPL.format(tool=tool, base=base_attr)
    # After first acs-quickstart block
    key = 'class="acs-quickstart"'
    idx = text.find(key)
    if idx == -1:
        key = "class='acs-quickstart'"
        idx = text.find(key)
    if idx == -1:
        print(f"  skip mount (no quickstart): {tool}")
        return text
    # find closing </div> of quickstart - first </div> after </ol> within reasonable window
    ol_end = text.find("</ol>", idx)
    if ol_end == -1:
        div_end = text.find("</div>", idx)
    else:
        div_end = text.find("</div>", ol_end)
    if div_end == -1:
        return text
    insert_at = div_end + len("</div>")
    return text[:insert_at] + mount + text[insert_at:]


def insert_script(text: str, raci: bool) -> str:
    tag = SCRIPT_RACI if raci else SCRIPT
    if "planning_concept_images.js" in text:
        return text
    if "</body>" in text:
        return text.replace("</body>", tag + "\n</body>", 1)
    return text + "\n" + tag


def main():
    for rel, (tool, base) in TOOLS.items():
        path = ROOT / rel
        if not path.exists():
            print(f"MISSING {rel}")
            continue
        text = path.read_text(encoding="utf-8")
        new = insert_mount(text, tool, base)
        new = insert_script(new, raci=rel.startswith("planning/"))
        if new != text:
            path.write_text(new, encoding="utf-8")
            print(f"PATCHED {rel} -> {tool}")
        else:
            print(f"UNCHANGED {rel}")


if __name__ == "__main__":
    main()
