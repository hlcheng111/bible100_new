import re

file_path = r'c:\Users\hlche\.cursor\bible100_new\languages\vi\OT\chapters\chapter1.html'
new_src = 'https://i.ibb.co/B2GnqWz/Cac-sach-tien-tri-trong-kinh-thanh.jpg'
image_name_part = 'Cac-sach-tien-tri-trong-kinh-thanh'

with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

found_and_replaced = False
for i, line in enumerate(lines):
    if image_name_part in line:
        print(f"Found '{image_name_part}' on line {i+1}")
        print(f"Original line: {line.strip()}")
        
        # Try to replace the src attribute in this line
        # This regex is more general and handles single or double quotes, and potential whitespace.
        new_line, count = re.subn(r'src\s*=\s*["\']?[^"\'>]*?{}[^"\'>]*?["\']?'.format(re.escape(image_name_part)), f'src="{new_src}"', line, flags=re.IGNORECASE)
        
        if count > 0:
            lines[i] = new_line
            print(f"Replaced src on line {i+1}")
            print(f"New line: {new_line.strip()}")
            found_and_replaced = True
            break # Stop after the first replacement

if found_and_replaced:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("File updated successfully.")
else:
    print(f"Did not find a replaceable src attribute containing '{image_name_part}'.")