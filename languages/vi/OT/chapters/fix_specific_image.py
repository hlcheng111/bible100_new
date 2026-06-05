import os
import re

def fix_specific_image():
    file_path = "c:\\Users\\hlche\\.cursor\\bible100_new\\languages\\vi\\OT\\chapters\\chapter1.html"
    heading_vi = "Các sách tiên tri trong Kinh Thánh"
    heading_zh = "聖經中的預言書"
    new_image_src = "https://i.ibb.co/B2GnqWz/Cac-sach-tien-tri-trong-kinh-thanh.jpg"

    lines = []
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
    except UnicodeDecodeError:
        with open(file_path, "r", encoding="latin-1") as f:
            lines = f.readlines()

    found_heading = False
    for i, line in enumerate(lines):
        if heading_vi in line or heading_zh in line:
            print(f"Found heading on line {i+1}")
            # Look for the image in the next few lines
            for j in range(i + 1, min(i + 5, len(lines))):
                if "<img" in lines[j]:
                    # Replace the src attribute
                    lines[j] = re.sub(r'src="[^"]*"', f'src="{new_image_src}"', lines[j])
                    print(f"Replaced image src on line {j+1}")
                    found_heading = True
                    break
            if found_heading:
                break
    
    if found_heading:
        with open(file_path, "w", encoding="utf-8") as f:
            f.writelines(lines)
        print("File updated successfully.")
    else:
        print("Could not find the heading or the image tag after it.")

if __name__ == "__main__":
    fix_specific_image()