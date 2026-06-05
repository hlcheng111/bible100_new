#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量翻译 my_OT_chapter02.html 中的中文内容为缅甸文/英文上下格式
"""

import re
import sys
import html
from pathlib import Path

# 设置输出编码
sys.stdout.reconfigure(encoding='utf-8')

# 基础翻译映射（示例，实际需要完整翻译）
translation_map = {
    "你是否已经在第一课的地图上找到每一步的位置？如果是，请打钩。": {
        "my": "ပထမသင်ခန်းစာ၏ မြေပုံပေါ်တွင် အဆင့်တိုင်း၏ တည်နေရာကို ရှာဖွေပြီးပြီလား။ ပြီးပါက ✔ ခံပေးပါ။",
        "en": "Have you found each step's location on the map from Lesson 1? If yes, please tick."
    },
    "步步向前": {
        "my": "အဆင့်ဆင့် ရှေ့သို့ လှမ်းခြင်း",
        "en": "Step by step forward"
    },
    "从这一课起，我们将进入": {
        "my": "ဤသင်ခန်းစာမှစ၍ ကျွန်ုပ်တို့သည်",
        "en": "From this lesson, we will enter"
    },
    "步的历史部分。由现在起，多数的": {
        "my": "အဆင့်၏ သမိုင်းအပိုင်းသို့ ဝင်ရောက်မည်။ ယခုမှစ၍ အများစုသော",
        "en": "steps' historical section. From now on, most"
    },
    "步": {
        "my": "အဆင့်",
        "en": "steps"
    },
    "都与地图有密切关系。因此，在导师教授时，请留心他站在地图的什么位置和他的动作。提示：学习时不用太紧张或过分用功，放松点，好好享受学习！留心观察导": {
        "my": "များသည် မြေပုံနှင့် နီးကပ်စွာ ဆက်စပ်နေသည်။ ထို့ကြောင့် ဆရာသင်ကြားသောအခါ သူသည် မြေပုံ၏ မည်သည့်နေရာတွင် ရပ်နေပြီး သူ၏ လှုပ်ရှားမှုကို သတိထားပါ။ အကြံပြုချက်: လေ့လာသောအခါ အလွန်အမင်း စိတ်မဖိစီးပါနှင့် သို့မဟုတ် အလွန်အမင်း အားစိုက်မထားပါနှင့်၊ အနည်းငယ် အနားယူပြီး လေ့လာမှုကို ကောင်းစွာ ခံစားပါ။ ဆရာ၏",
        "en": "are closely related to the map. Therefore, when the instructor teaches, pay attention to where he stands on the map and his actions. Tip: Don't be too tense or work too hard when studying, relax a bit, and enjoy learning! Observe the instructor's"
    },
    "师，模拟他的动作，之后要经常复习": {
        "my": "လှုပ်ရှားမှုကို သတိထားပြီး သူ၏ လှုပ်ရှားမှုကို အတုယူပါ၊ ထို့နောက် ပုံမှန် ပြန်လည် လေ့လာရမည်",
        "en": "actions, imitate his movements, and then regularly review"
    },
    "动作": {
        "my": "လှုပ်ရှားမှု",
        "en": "actions"
    },
    "和": {
        "my": "နှင့်",
        "en": "and"
    },
    "步名": {
        "my": "အဆင့်အမည်",
        "en": "step names"
    },
    "。": {
        "my": "။",
        "en": "."
    },
    "现在，就让我们就踏进本课程第二个令人兴奋的部分，愿神在你学习他的话语时赐你极大喜乐！": {
        "my": "ယခု ကျွန်ုပ်တို့သည် ဤသင်ခန်းစာ၏ ဒုတိယအပိုင်း စိတ်လှုပ်ရှားဖွယ်ရာ အပိုင်းသို့ ဝင်ရောက်ကြပါစို့၊ ဘုရားသခင်သည် သင်သည် သူ၏ နှုတ်ကပတ်တော်ကို လေ့လာသောအခါ သင်အား အလွန်ကြီးမားသော ဝမ်းမြောက်ခြင်းကို ပေးတော်မူပါစေသော်။",
        "en": "Now, let us step into the second exciting part of this course. May God give you great joy as you study His Word!"
    },
    "第十二步": {
        "my": "အဆင့် ၁၂",
        "en": "Step 12"
    },
    "四件大事": {
        "my": "ကြီးမားသော အဖြစ်အပျက် လေးခု",
        "en": "Four Great Events"
    },
    "动作：走到巴比伦附近，竖起四只手指": {
        "my": "လှုပ်ရှားမှု: ဗာဗုလုန်အနီးသို့ သွားပြီး လက်ချောင်း လေးချောင်း ထောင်ပါ",
        "en": "Action: Walk near Babylon and raise four fingers"
    },
    "我们要走到巴比伦附近的地方，然后右手竖起四只手指头，并说：": {
        "my": "ကျွန်ုပ်တို့သည် ဗာဗုလုန်အနီးရှိ နေရာသို့ သွားပြီး ထို့နောက် လက်ျာလက်ဖြင့် လက်ချောင်း လေးချောင်း ထောင်ပြီး ပြောရမည်:",
        "en": "We walk to a place near Babylon, then raise four fingers with the right hand and say:"
    },
    "四件大事": {
        "my": "ကြီးမားသော အဖြစ်အပျက် လေးခု",
        "en": "Four Great Events"
    },
    "。": {
        "my": "။",
        "en": "."
    },
    "为什么要走到巴比伦？因为这些事情都发生在当时的巴比伦或附近的地区。我": {
        "my": "ဗာဗုလုန်သို့ သွားရသည့် အကြောင်းရင်းမှာ အဘယ်နည်း။ အဘယ်ကြောင့်ဆိုသော် ဤအဖြစ်အပျက်များသည် ထိုအချိန်က ဗာဗုလုန် သို့မဟုတ် အနီးအနားရှိ ဒေသများတွင် ဖြစ်ပွားခဲ့သောကြောင့် ဖြစ်သည်။ ကျွန်ုပ်တို့သည်",
        "en": "Why go to Babylon? Because these events all happened in Babylon or nearby areas at that time. We"
    },
    "们从创世记开始，在头十一章，我们读到四件大事。这四件大事不单影响一个家庭、": {
        "my": "သည် ကမ္ဘာဦးကျမ်းမှ စတင်ပြီး ပထမ ၁၁ ခန်းတွင် ကြီးမားသော အဖြစ်အပျက် လေးခုကို ဖတ်ရှုရသည်။ ဤကြီးမားသော အဖြစ်အပျက် လေးခုသည် မိသားစု တစ်ခု၊",
        "en": "start from Genesis, and in the first eleven chapters, we read about four great events. These four great events do not just affect one family,"
    },
    "一个种族或一个国家，而是影响了全人类。这些事实解释了许多重大的问题：人怎么会出现在这世上？为何始祖会犯罪？罪的本质是什么？神如何看待罪人？为什么地上会有不同的民族和语言？": {
        "my": "လူမျိုးတစ်မျိုး သို့မဟုတ် နိုင်ငံတစ်နိုင်ငံကို သာမက လူသားအားလုံးကို ထိခိုက်စေသည်။ ဤအချက်အလက်များသည် အရေးကြီးသော မေးခွန်းများစွာကို ရှင်းလင်းပေးသည်: လူသည် ဤကမ္ဘာပေါ်တွင် မည်သို့ ပေါ်ပေါက်လာသနည်း။ အဘယ်ကြောင့် ရှေးဦးဘိုးဘေးများသည် အပြစ်ပြုခဲ့သနည်း။ အပြစ်၏ သဘောသဘာဝမှာ အဘယ်နည်း။ ဘုရားသခင်သည် အပြစ်သားများကို မည်သို့ ရှုမြင်သနည်း။ အဘယ်ကြောင့် မြေကြီးပေါ်တွင် ကွဲပြားသော လူမျိုးများနှင့် ဘာသာစကားများ ရှိသနည်း။",
        "en": "one race or one nation, but affect all humanity. These facts explain many important questions: How did humans appear on earth? Why did the first ancestors sin? What is the nature of sin? How does God view sinners? Why are there different nations and languages on earth?"
    }
}

def decode_html_entities(text):
    """解码HTML实体"""
    return html.unescape(text)

def encode_html_entities(text):
    """编码HTML实体"""
    return html.escape(text, quote=False)

def translate_text(text):
    """翻译文本为缅甸文/英文格式"""
    text = decode_html_entities(text.strip())
    
    # 查找完整匹配
    if text in translation_map:
        trans = translation_map[text]
        return f'<span style="font-family:\'Myanmar Text\',sans-serif;">{trans["my"]}</span><br><span style="color:#555;">{trans["en"]}</span>'
    
    # 如果没有完整匹配，尝试部分匹配
    for key, trans in translation_map.items():
        if key in text:
            # 简单替换（实际应该更智能）
            my_text = text.replace(key, trans["my"])
            en_text = text.replace(key, trans["en"])
            return f'<span style="font-family:\'Myanmar Text\',sans-serif;">{my_text}</span><br><span style="color:#555;">{en_text}</span>'
    
    # 如果没有找到翻译，返回占位符
    return f'<span style="font-family:\'Myanmar Text\',sans-serif;">[MY: {text}]</span><br><span style="color:#555;">[EN: {text}]</span>'

def process_html_file(file_path):
    """处理HTML文件，翻译中文内容"""
    print(f"正在读取文件: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 查找所有包含中文的span标签
    # 匹配 <span lang="ZH-CN"...>中文内容</span>
    pattern = r'<span\s+lang="ZH-CN"[^>]*>([^<]+)</span>'
    
    def replace_func(match):
        chinese_text = match.group(1)
        translated = translate_text(chinese_text)
        return translated
    
    # 替换所有匹配
    new_content = re.sub(pattern, replace_func, content)
    
    # 写回文件
    print(f"正在写入文件: {file_path}")
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("翻译完成！")

if __name__ == "__main__":
    file_path = Path(__file__).parent.parent / "languages" / "my" / "OT" / "chapters" / "my_OT_chapter02.html"
    
    if not file_path.exists():
        print(f"错误: 文件不存在: {file_path}")
        sys.exit(1)
    
    process_html_file(file_path)
