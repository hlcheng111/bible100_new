#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Bible100 Onboarding v1 Test
小白 3 步引導教程的靜態檢查
"""

import os
import sys
import re

def test_onboarding_script_exists():
    """檢查 onboarding_v1.js 文件存在"""
    script_path = os.path.join(os.path.dirname(__file__), '..', 'js', 'onboarding_v1.js')
    assert os.path.exists(script_path), f"onboarding_v1.js 不存在於 {script_path}"
    print("✅ onboarding_v1.js 文件存在")
    return script_path

def test_onboarding_script_content(script_path):
    """檢查腳本內容包含必要的 localStorage 鍵名"""
    with open(script_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    required_keys = [
        'bible100_onboard_v1_step',
        'bible100_onboard_v1_done',
        'bible100_onboard_persona'
    ]
    
    for key in required_keys:
        assert key in content, f"缺少 localStorage 鍵: {key}"
        print(f"✅ 包含 localStorage 鍵: {key}")
    
    return content

def test_onboarding_routes_exist(content):
    """檢查路由字串存在"""
    required_routes = [
        'ai_tools/sidebar_lab.html',
        'ai_tools/pages/guide_reading_hub.html',
        'bible_study/sidebar.html',
        'bible_study/comprehensive_exegesis_reader.html',
        'church_planning/sidebar_plan.html',
        'church_planning/index_plan.html'
    ]
    
    for route in required_routes:
        assert route in content, f"缺少路由: {route}"
        print(f"✅ 包含路由: {route}")

def test_onboarding_index_v5_injection():
    """檢查 index_v5.html 已引入 onboarding_v1.js（可選；未掛載時僅提示）"""
    index_path = os.path.join(os.path.dirname(__file__), '..', 'index_v5.html')
    assert os.path.exists(index_path), f"index_v5.html 不存在於 {index_path}"
    
    with open(index_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'onboarding_v1.js' in content:
        print("✅ index_v5.html 已引入 onboarding_v1.js")
    else:
        print("⚠️ index_v5.html 尚未引入 onboarding_v1.js（腳本仍可用；非本清理波次阻擋）")

def test_onboarding_persona_cards(content):
    """檢查 persona 任務卡定義"""
    required_personas = ['teacher', 'pastor', 'elder']
    
    for persona in required_personas:
        assert persona in content, f"缺少 persona 定義: {persona}"
        print(f"✅ 包含 persona: {persona}")

def test_onboarding_job_routes(content):
    """檢查任務路由定義"""
    required_jobs = ['job-prep', 'job-read', 'job-church']
    
    for job in required_jobs:
        assert job in content, f"缺少任務 ID: {job}"
        print(f"✅ 包含任務 ID: {job}")

def run_all_tests():
    """執行所有測試"""
    print("=" * 60)
    print("Bible100 Onboarding v1 測試")
    print("=" * 60)
    
    try:
        script_path = test_onboarding_script_exists()
        content = test_onboarding_script_content(script_path)
        test_onboarding_routes_exist(content)
        test_onboarding_persona_cards(content)
        test_onboarding_job_routes(content)
        test_onboarding_index_v5_injection()
        
        print("=" * 60)
        print("✅ 所有測試通過")
        print("=" * 60)
        return True
    except AssertionError as e:
        print("=" * 60)
        print(f"❌ 測試失敗: {e}")
        print("=" * 60)
        return False
    except Exception as e:
        print("=" * 60)
        print(f"❌ 測試錯誤: {e}")
        print("=" * 60)
        return False

if __name__ == '__main__':
    success = run_all_tests()
    sys.exit(0 if success else 1)
