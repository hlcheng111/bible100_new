import re

file_path = r'c:\Users\hlche\.cursor\bible100_new\languages\vi\OT\chapters\chapter1.html'
new_src = 'https://i.ibb.co/B2GnqWz/Cac-sach-tien-tri-trong-kinh-thanh.jpg'
image_name_part = 'Cac-sach-tien-tri-trong-kinh-thanh'

with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

if image_name_part in content:
    print(f"Found '{image_name_part}' in the file.")
    # Use a non-greedy match to find the shortest string for the src
    # This is safer in case of multiple src attributes on one line
    new_content, count = re.subn(r'src="[^"]*?{}[^"]*?"'.format(re.escape(image_name_part)), f'src="{new_src}"', content)
    
    if count > 0:
        print(f"Replaced {count} occurrence(s) of the image src.")
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("File updated successfully.")
    else:
        print("Found the image name, but could not replace the src. The regex might not have matched.")
else:
    print(f"Did not find '{image_name_part}' in the file.")