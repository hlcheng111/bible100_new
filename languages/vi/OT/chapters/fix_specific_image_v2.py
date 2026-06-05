import re

file_path = r'c:\Users\hlche\.cursor\bible100_new\languages\vi\OT\chapters\chapter1.html'
new_src = 'https://i.ibb.co/B2GnqWz/Cac-sach-tien-tri-trong-kinh-thanh.jpg'

with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# This is a bit of a guess. The VML shape seems to be the container.
# I'll find the shape with the title and then look for the image inside it.

# The user said the title is: ★Các sách tiên tri trong Kinh Thánh  聖經中的預言書
# Let's find the image that is near this text.

# Since searching for the text directly failed, let's try to find the image by its original source.
# The user mentioned the link is broken, so it might have an empty or incorrect src.
# Let's find all images and check their context.

# The search tool did not find the text, let's try to find it in the content read by python
if 'Các sách tiên tri trong Kinh Thánh' in content or '聖經中的預言書' in content:
    print("Found the text in the file content.")
    # The structure is likely complex. Let's find the image that is most likely the one to be replaced.
    # It's hard to pinpoint which image it is without more context from the file.
    # Let's try to find an image with an empty src attribute near the title.

    # A more robust way is to find the specific v:shape that contains the title, and then find the image within it.
    # The HTML is likely malformed, which is why the tools are failing.

    # Let's try a simpler approach. Let's find an image with a specific, likely unique, part of its existing (broken) src.
    # The user did not provide the broken src. 

    # Let's try to replace the first image with an empty src, if one exists.
    # This is a long shot.
    content = content.replace('src=""', 'src="' + new_src + '"', 1)

else:
    print("Did not find the text in the file content.")
    # The text is not in the file as plain text. It might be encoded or dynamically generated.
    # Let's try to find the image based on its properties. The user mentioned it's a black square.
    # This is not something I can easily identify.

    # Let's try to find the image by a part of the provided URL. Maybe the image name is in the file.
    if 'Cac-sach-tien-tri-trong-kinh-thanh' in content:
        print("Found the image name in the file content.")
        # Now, let's replace the src.
        content = re.sub(r'src="[^"]*Cac-sach-tien-tri-trong-kinh-thanh[^"]*"', f'src="{new_src}"', content)

# As a last resort, I will manually find the line and replace it.
# I will search for the title again, but this time I will read the file line by line.

lines = content.splitlines(True)
found = False
for i, line in enumerate(lines):
    if 'Các sách tiên tri trong Kinh Thánh' in line or '聖經中的預言書' in line:
        # Found the line with the title. Now look for the image in the next few lines.
        for j in range(i, i + 10):
            if '<img' in lines[j]:
                # This is likely the image. Let's replace its src.
                lines[j] = re.sub(r'src="[^"]*"', f'src="{new_src}"', lines[j])
                print(f"Replaced image src on line {j+1}")
                found = True
                break
    if found:
        break

if found:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("File updated.")
else:
    print("Could not find the image to replace.")