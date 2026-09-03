#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Bible100 Content Schema Validator
驗證內容 JSON 檔是否符合 Schema
"""

import os
import sys
import json
import jsonschema
from jsonschema import validate, ValidationError

def load_schema(schema_path):
    """載入 Schema 檔案"""
    with open(schema_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def validate_json_file(json_path, schema):
    """驗證 JSON 檔案"""
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    try:
        validate(instance=data, schema=schema)
        return True, None
    except ValidationError as e:
        return False, str(e)

def find_json_files(directory, pattern="*.json"):
    """查找目錄下的 JSON 檔案"""
    json_files = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.json'):
                json_files.append(os.path.join(root, file))
    return json_files

def main():
    if len(sys.argv) < 2:
        print("Usage: python validate_content_schema.py <json_file_or_directory>")
        print("Example: python validate_content_schema.py languages/content")
        sys.exit(1)
    
    target = sys.argv[1]
    schemas_dir = os.path.join(os.path.dirname(__file__), '..', 'schemas')
    
    # 載入所有 Schema
    schemas = {}
    for schema_file in os.listdir(schemas_dir):
        if schema_file.endswith('.schema.json'):
            schema_path = os.path.join(schemas_dir, schema_file)
            schema_name = schema_file.replace('.schema.json', '')
            schemas[schema_name] = load_schema(schema_path)
            print(f"Loaded schema: {schema_name}")
    
    # 查找要驗證的檔案
    if os.path.isfile(target):
        json_files = [target]
    elif os.path.isdir(target):
        json_files = find_json_files(target)
    else:
        print(f"Error: {target} is not a file or directory")
        sys.exit(1)
    
    print(f"\nValidating {len(json_files)} JSON files...")
    
    passed = 0
    failed = 0
    
    for json_file in json_files:
        print(f"\nValidating: {json_file}")
        
        with open(json_file, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError as e:
                print(f"  ❌ Invalid JSON: {e}")
                failed += 1
                continue
        
        # 檢查是否有 schema_id
        schema_id = data.get('schema_id') if isinstance(data, dict) else None
        
        if schema_id:
            schema_name = schema_id.replace('bible100.', '').replace('.v1', '')
            if schema_name in schemas:
                is_valid, error = validate_json_file(json_file, schemas[schema_name])
                if is_valid:
                    print(f"  ✅ Valid (schema: {schema_name})")
                    passed += 1
                else:
                    print(f"  ❌ Invalid (schema: {schema_name}): {error}")
                    failed += 1
            else:
                print(f"  ⚠️  Unknown schema_id: {schema_id}")
                failed += 1
        else:
            print(f"  ⚠️  No schema_id found, skipping validation")
    
    print(f"\n{'='*60}")
    print(f"Validation complete: {passed} passed, {failed} failed")
    print(f"{'='*60}")
    
    sys.exit(0 if failed == 0 else 1)

if __name__ == '__main__':
    main()
