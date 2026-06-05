import ast
import json
import os
import glob

bibles_dir = "c:/Users/hlche/.cursor/bible100_new/data/bibles/"

for filepath in glob.glob(bibles_dir + "*.json"):
    filename = os.path.basename(filepath)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if content.startswith('{\\n') or content.startswith('[\\n'):
            print(f"嘗試用 Python AST 修復 {filename}...")
            # evaluate the string literal back into a proper python string
            # Wait, if it's missing quotes, ast.literal_eval will fail
            # Let's wrap it in triple quotes to make it a valid python string literal
            # BUT wait, if it contains explicit \n it means it was the content of a repr().
            # If it was output via print(repr(string)), we can strip any surrounding quotes if they exist.
            # actually if it's `{\n` without quotes, ast.literal_eval will say syntax error.
            # To fix it, we can use ast.literal_eval('"""' + content.replace('"""', '\\"\\"\\"') + '"""')
            # But wait, literal_eval on """{\n""" evaluates \n back to actual newline!
            fixed_str = content.encode('utf-8').decode('unicode_escape')
            
            # verify it parses as JSON
            try:
                # The unicode escape might decode \u2028 etc. Let's see if it works.
                data = json.loads(fixed_str)
                with open(filepath, 'w', encoding='utf-8') as out:
                    # write it back cleanly
                    json.dump(data, out, ensure_ascii=False, separators=(',', ':'))
                print(f"✅ 修復成功 (Unicode Escape): {filename}")
            except Exception as e:
                print(f"❌ JSON 解析失敗 {filename}: {e}")
        else:
            # Let's verify it actually is valid JSON now
            try:
                json.loads(content)
                print(f"⚡ {filename} 已經是合法的 JSON。")
            except Exception as e:
                print(f"⚠️ {filename} 是損壞的 JSON: {e}")
                # Maybe my JS script broke it, let's try to restore it from the git repo or just use unicode_escape
                pass
                
    except Exception as e:
        print(f"讀取 {filename} 時出錯: {e}")
