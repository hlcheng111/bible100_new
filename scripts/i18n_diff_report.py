#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Bible100 i18n Difference Report
生成多語言版本差異報告
"""

import os
import sys
import json
import hashlib

def calculate_file_hash(file_path):
    """計算檔案的 SHA256 雜湊值"""
    sha256_hash = hashlib.sha256()
    with open(file_path, 'rb') as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def load_locale_manifest():
    """載入 locale_manifest.json"""
    manifest_path = os.path.join(os.path.dirname(__file__), '..', 'config', 'locale_manifest.json')
    if os.path.exists(manifest_path):
        with open(manifest_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"version": "1.0", "entries": []}

def save_locale_manifest(manifest):
    """保存 locale_manifest.json"""
    manifest_path = os.path.join(os.path.dirname(__file__), '..', 'config', 'locale_manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

def generate_diff_report(content_id=None):
    """生成差異報告"""
    manifest = load_locale_manifest()
    
    if content_id:
        # 報告特定內容 ID
        entries = [e for e in manifest.get("entries", []) if e.get("content_id") == content_id]
    else:
        # 報告所有內容
        entries = manifest.get("entries", [])
    
    print("=" * 60)
    print("Bible100 i18n Difference Report")
    print("=" * 60)
    
    if not entries:
        print("No entries found in locale_manifest.json")
        return
    
    for entry in entries:
        content_id = entry.get("content_id", "unknown")
        canonical_locale = entry.get("canonical_locale", "unknown")
        canonical_hash = entry.get("canonical_hash", "unknown")
        canonical_updated = entry.get("canonical_updated_at", "unknown")
        
        print(f"\nContent ID: {content_id}")
        print(f"Canonical: {canonical_locale}")
        print(f"Canonical Hash: {canonical_hash}")
        print(f"Canonical Updated: {canonical_updated}")
        
        locales = entry.get("locales", {})
        if not locales:
            print("  No locales tracked")
            continue
        
        print("\nLocale Status:")
        for locale, locale_data in locales.items():
            review_status = locale_data.get("review_status", "unknown")
            content_hash = locale_data.get("content_hash", "unknown")
            updated_at = locale_data.get("updated_at", "unknown")
            behind_canonical = locale_data.get("behind_canonical", False)
            behind_reason = locale_data.get("behind_reason", "")
            
            status_icon = "✅" if not behind_canonical else "⚠️"
            print(f"  {status_icon} {locale}:")
            print(f"    Status: {review_status}")
            print(f"    Hash: {content_hash}")
            print(f"    Updated: {updated_at}")
            if behind_canonical:
                print(f"    BEHIND CANONICAL: {behind_reason}")
    
    print("\n" + "=" * 60)

def main():
    if len(sys.argv) > 1:
        content_id = sys.argv[1]
        if content_id == "--all":
            content_id = None
    else:
        content_id = None
    
    generate_diff_report(content_id)

if __name__ == '__main__':
    main()
