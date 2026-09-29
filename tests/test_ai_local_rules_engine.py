#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Bible100 AI Local Rules Engine Test
本地規則引擎的靜態檢查
"""

import os
import sys

def test_ai_local_rules_engine_exists():
    """檢查 ai_local_rules_engine.js 文件存在"""
    script_path = os.path.join(os.path.dirname(__file__), '..', 'js', 'ai_local_rules_engine.js')
    assert os.path.exists(script_path), f"ai_local_rules_engine.js 不存在於 {script_path}"
    print("✅ ai_local_rules_engine.js 文件存在")
    return script_path

def test_ai_local_rules_engine_content(script_path):
    """檢查腳本內容包含必要的規則包"""
    with open(script_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    required_packs = [
        'lesson_prep',
        'pastoral_followup',
        'qna_triage',
        'scripture_lookup'
    ]
    
    for pack in required_packs:
        assert pack in content, f"缺少規則包: {pack}"
        print(f"✅ 包含規則包: {pack}")
    
    return content

def test_lesson_prep_rules(content):
    """檢查 lesson_prep 規則包包含必要規則"""
    required_rules = [
        'LP-01',
        'LP-02',
        'LP-03',
        'LP-04',
        'LP-05',
        'LP-06'
    ]
    
    for rule in required_rules:
        assert rule in content, f"缺少 lesson_prep 規則: {rule}"
        print(f"✅ 包含 lesson_prep 規則: {rule}")

def test_pastoral_followup_rules(content):
    """檢查 pastoral_followup 規則包包含必要規則"""
    required_rules = [
        'PF-01',
        'PF-02',
        'PF-03',
        'PF-04',
        'PF-05'
    ]
    
    for rule in required_rules:
        assert rule in content, f"缺少 pastoral_followup 規則: {rule}"
        print(f"✅ 包含 pastoral_followup 規則: {rule}")

def test_qna_triage_rules(content):
    """檢查 qna_triage 規則包包含必要規則"""
    required_rules = [
        'QT-01',
        'QT-02',
        'QT-03'
    ]
    
    for rule in required_rules:
        assert rule in content, f"缺少 qna_triage 規則: {rule}"
        print(f"✅ 包含 qna_triage 規則: {rule}")

def test_scripture_lookup_rules(content):
    """檢查 scripture_lookup 規則包包含必要規則"""
    required_rules = [
        'SL-01',
        'SL-02'
    ]
    
    for rule in required_rules:
        assert rule in content, f"缺少 scripture_lookup 規則: {rule}"
        print(f"✅ 包含 scripture_lookup 規則: {rule}")

def test_ai_router_exists():
    """檢查 ai_router.js 文件存在"""
    script_path = os.path.join(os.path.dirname(__file__), '..', 'js', 'ai_router.js')
    assert os.path.exists(script_path), f"ai_router.js 不存在於 {script_path}"
    print("✅ ai_router.js 文件存在")
    return script_path

def test_ai_router_content(script_path):
    """檢查 ai_router.js 內容包含必要函數"""
    with open(script_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    required_functions = [
        'route',
        'isOnline',
        'hasApiKey',
        'callExternalLLM',
        'callOpenAI',
        'callAnthropic'
    ]
    
    for func in required_functions:
        assert func in content, f"缺少函數: {func}"
        print(f"✅ 包含函數: {func}")

def test_cloud_config_ai_settings():
    """檢查 cloud_config.js 包含 AI 配置"""
    script_path = os.path.join(os.path.dirname(__file__), '..', 'js', 'cloud_config.js')
    assert os.path.exists(script_path), f"cloud_config.js 不存在於 {script_path}"
    
    with open(script_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    required_keys = [
        'AI_PROVIDER',
        'AI_API_KEY',
        'AI_API_URL',
        'AI_MODEL'
    ]
    
    for key in required_keys:
        assert key in content, f"缺少 AI 配置鍵: {key}"
        print(f"✅ cloud_config.js 包含 AI 配置: {key}")

def run_all_tests():
    """執行所有測試"""
    print("=" * 60)
    print("Bible100 AI Local Rules Engine 測試")
    print("=" * 60)
    
    try:
        script_path = test_ai_local_rules_engine_exists()
        content = test_ai_local_rules_engine_content(script_path)
        test_lesson_prep_rules(content)
        test_pastoral_followup_rules(content)
        test_qna_triage_rules(content)
        test_scripture_lookup_rules(content)
        
        router_path = test_ai_router_exists()
        test_ai_router_content(router_path)
        
        test_cloud_config_ai_settings()
        
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
