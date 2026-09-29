#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""cloud_deploy manifest 與 check_cloud_deploy 腳本煙霧測試。"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
TIERS = REPO / "config" / "cloud_deploy_tiers.json"
SCRIPT = REPO / "scripts" / "check_cloud_deploy.py"


def test_tiers_json_valid():
    data = json.loads(TIERS.read_text(encoding="utf-8"))
    assert "tiers" in data
    assert "p0_shell_boot" in data["tiers"]
    files = data["tiers"]["p0_shell_boot"].get("files", [])
    assert "index_v5.html" in files
    assert "js/index_v5_shell.js" in files
    assert "config/modes.json" in files


def test_p0_files_exist_locally():
    data = json.loads(TIERS.read_text(encoding="utf-8"))
    missing = []
    for rel in data["tiers"]["p0_shell_boot"]["files"]:
        if not (REPO / rel).is_file():
            missing.append(rel)
    assert not missing, "P0 本機缺失: " + ", ".join(missing)


def test_list_tier_runs():
    proc = subprocess.run(
        [sys.executable, str(SCRIPT), "--list-tier", "p0_shell_boot"],
        cwd=REPO,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=60,
    )
    assert proc.returncode == 0, proc.stderr or proc.stdout
    assert "index_v5.html" in proc.stdout
    assert "js/shell_nav.js" in proc.stdout


def test_estimate_size_runs():
    proc = subprocess.run(
        [sys.executable, str(SCRIPT), "--estimate-size"],
        cwd=REPO,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=120,
    )
    assert proc.returncode == 0, proc.stderr or proc.stdout
    assert "p0_shell_boot" in proc.stdout


if __name__ == "__main__":
    test_tiers_json_valid()
    test_p0_files_exist_locally()
    test_list_tier_runs()
    test_estimate_size_runs()
    print("test_cloud_deploy_checker: OK")
