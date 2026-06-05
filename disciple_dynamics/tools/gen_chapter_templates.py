# -*- coding: utf-8 -*-
"""Generate chapter HTML templates for all Disciple Dynamics courses."""
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CHAPTER_TEMPLATE = '''<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{course_title_zh} 第{lesson_zh}課 {ch_title_zh} ch{ch:02d} {course_title_en} Lesson {ch} {ch_title_en}</title>
  <base target="_self">
  <style>
    body {{ font-family: "Microsoft YaHei", Arial, sans-serif; margin: 0; padding: 24px; background: #f6f7fb; color: #333; max-width: 900px; }}
    .breadcrumb {{ font-size: 0.85rem; color: #666; margin-bottom: 16px; }}
    .breadcrumb a {{ color: #40916c; }}
    h1 {{ color: #2d6a4f; margin-bottom: 4px; }}
    h1 .en {{ font-size: 0.85rem; color: #666; font-weight: normal; }}
    h2 {{ color: #40916c; margin-top: 20px; margin-bottom: 8px; font-size: 1rem; }}
    .card {{ background: white; padding: 16px; border-radius: 8px; margin: 12px 0; box-shadow: 0 1px 4px rgba(0,0,0,0.08); border-left: 4px solid #2d6a4f; }}
    a {{ color: #40916c; }}
    a:hover {{ text-decoration: underline; }}
    .pdf-link {{ display: inline-block; margin: 4px 8px 4px 0; padding: 8px 12px; background: #2d6a4f; color: white; text-decoration: none; border-radius: 6px; }}
    .pdf-link:hover {{ background: #40916c; }}
  </style>
</head>
<body>
  <p class="breadcrumb"><a href="{landing}.html">{course_title_zh} {course_title_en}</a> → ch{ch:02d}</p>
  <h1>第{lesson_zh}課 {ch_title_zh} <span class="en">Lesson {ch} {ch_title_en}</span></h1>
  <h2>本章內容 / Chapter Content</h2>
  <div class="card">
    <p>（此處日後可加入本課內文與圖片。）</p>
    <p><em>Course content and images can be added here.</em></p>
  </div>
  <h2>全書 PDF / Full Course PDF</h2>
  <div class="card">
    <a href="{pdf_href}" class="pdf-link" target="_blank" rel="noopener">下載 PDF / Download PDF</a>
  </div>
  <p class="breadcrumb">圖片資料夾：<code>{image_folder}</code></p>
</body>
</html>
'''

LESSON_ZH = ('一','二','三','四','五','六','七','八','九','十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十')

def num_to_zh(n):
    if 1 <= n <= 30: return LESSON_ZH[n-1]
    return str(n)

# (subdir, landing_slug, course_title_zh, course_title_en, pdf_path, image_folder, chapters[(zh, en), ...])
COURSES = [
    ('c', 'doctrine_heresy', '防備辯駁異端', 'Guard Against Heresies', '../disciple_d%20text/教義02%20防備辯駁異端%20garh_Z_full.pdf', 'c/image_doctrine', [
        ('真理的準繩','Standard of Truth'),('耶穌是基督','Jesus is the Christ'),('聖經的警告',"Bible's Warnings"),('異端的特徵','Characteristics of Heresy'),
        ('異端的成因和入侵','Causes and Invasion of Heresy'),('呼喊（常受主）派','Shouting Sect'),('東方閃電（一）','Eastern Lightning (1)'),('東方閃電（二）','Eastern Lightning (2)'),
        ('摩門教','Mormonism'),('韓國異端（一）','Korean Cults (1)'),('韓國異端（二）','Korean Cults (2)'),('總結','Summary'),
    ]),
    ('d', 'christian_family', '基督化家庭', 'Christian Family', '../disciple_d%20text/基督徒生活01%20基督化家庭%20CH_Z_full.pdf', 'd/image_christian-family', [
        ('一切從家庭開始','It All Starts with the Family'),('基督徒的婚姻觀','Christian View of Marriage'),('離開與連合','Leave and Cleave'),('擇偶的預備','Preparation for Marriage'),
        ('從相識到相許','From Meeting to Engagement'),('夫妻相愛之道','Husband and Wife Love'),('夫妻溝通之道','Marital Communication'),('婚姻中的磨煉與成長','Trials and Growth in Marriage'),
        ('基督徒父母','Christian Parents'),('基督徒兒女','Christian Children'),('基督工人之家','Christian Worker Home'),('單身、離婚及再婚','Singleness Divorce Remarriage'),
    ]),
    ('d', 'servant_quality', '僕人的素質', 'Servant Quality', '../disciple_d%20text/基督徒生活02%20僕人的素質%20SF_Z_full.pdf', 'd/image_servant-quality', [
        ('恩典為本','Grace-Based'),('靈修和獨處','Devotion and Solitude'),('讀經操練','Bible Reading'),('禱告操練','Prayer'),('禁食操練','Fasting'),('敬拜操練','Worship'),
        ('披戴基督','Put on Christ'),('持守貞潔','Chastity'),('持守謙卑','Humility'),('持守誠信','Integrity'),('持守知足','Contentment'),('持守仁愛','Love'),
    ]),
    ('d', 'spiritual_warfare', '戰勝屬靈爭鬥', 'Spiritual Warfare', '../disciple_d%20text/基督徒生活03%20戰勝屬靈爭鬥%20RSC_Z_full.pdf', 'd/image_spiritual-warfare', [
        ('簡介四種世界觀','Four Worldviews'),('信徒的聖經世界觀','Biblical Worldview'),('信徒的權利','Believer Rights'),('信徒在基督裡的身份','Identity in Christ'),
        ('戰勝屬靈仇敵','Overcome Spiritual Enemies'),('屬靈爭戰得勝之道（上）','Way of Victory (1)'),('屬靈爭戰得勝之道（下）','Way of Victory (2)'),('不畏被拒，克服焦慮','Rejection and Anxiety'),
        ('走出靈性低潮','Out of Spiritual Low'),('主内得自由第一至二步','Freedom Steps 1-2'),('主内得自由第三步','Freedom Step 3'),('主内得自由第四至七步','Freedom Steps 4-7'),
    ]),
    ('d', 'james', '雅各書', 'James', '../disciple_d%20text/基督徒生活04%20雅各書%20JAS_Z_full.pdf', 'd/image_james', [
        ('作者與讀者','Author and Readers'),('忍受試煉的人有福了','Blessed in Trial'),('當試探按響門鈴時','When Temptation Knocks'),('行道三部曲','Doers of the Word'),
        ('公平待人不偏心','No Favoritism'),('真信心的特質','Genuine Faith'),('制伏舌頭','Tame the Tongue'),('追求屬天的智慧','Heavenly Wisdom'),
        ('降服在神面前','Submit to God'),('警告為富不仁者','Warning to the Rich'),('在患難中要忍耐','Patience in Suffering'),('禱告與勸勉','Prayer and Exhortation'),
    ]),
    ('e', 'church_management', '教會管理實務', 'Church Management Practice', '../disciple_d%20text/教會01%20教會管理實務%20PCM_Z_full.pdf', 'e/image_church', [
        ('教會的管理模式','Church Management Model'),('教會的規章制度','Church Bylaws'),('領袖的資格、跌倒與恢復','Leaders Qualification Fall Restoration'),('以恩賜為本的人事搭配','Gift-Based Staffing'),
        ('人才的培養、發揮與安排','Training and Deployment'),('敬拜、講道、培訓、宣教','Worship Preaching Training Mission'),('接待、團契、關懷、慈惠','Hospitality Fellowship Care Mercy'),
        ('輔導事工','Counseling Ministry'),('如何開拓、建立教會','Church Planting'),('教會的財物管理','Church Finance'),('婚喪節慶','Weddings Funerals Festivals'),('文字事工與圖事','Publication Ministry'),
    ]),
    ('e', 'corinthians1', '哥林多前書', '1 Corinthians', '../disciple_d%20text/教會02%20哥林多前書%20COR1_Z_full.pdf', 'e/image_church', [
        ('保羅與哥林多教會','Paul and Corinth'),('教會的黨派紛爭（一）','Factions (1)'),('教會的黨派紛爭（二）','Factions (2)'),('教會的混亂問題','Disorder'),
        ('婚姻的問題','Marriage'),('自由與責任（一）- 祭物和偶像','Freedom and Responsibility (1)'),('自由與責任（二）- 僕人與領袖','Freedom and Responsibility (2)'),
        ('敬拜的問題（一）- 蒙頭與聖餐','Worship (1)'),('敬拜的問題（二）- 恩賜','Worship (2)'),('敬拜的問題（三）- 愛','Worship (3)'),('敬拜的問題（四）- 講道與方言','Worship (4)'),('復活的問題','Resurrection'),
    ]),
    ('e', 'church_history_1', '教會歷史精覽上冊', 'Church History Overview Vol.1', '../disciple_d%20text/教會03%20教會歷史精覽上冊%20CHST1_Z_full.pdf', 'e/image_church', [
        ('第1-6步 耶路撒冷至中國','Steps 1-6 Jerusalem to China'),('第7-12步 使徒去至教會增長','Steps 7-12'),('第13-16步 看見十字架至君士坦丁堡','Steps 13-16'),('第17-23步 開大會至退隱沙漠','Steps 17-23'),
        ('第24-28步 羅馬失陷至第一次扣中國門','Steps 24-28'),('第29-32步 伊斯蘭興起至去北方','Steps 29-32'),('第33-36步 大分裂至君士坦丁堡失陷','Steps 33-36'),('第37-41步 病態教會至拉回正路','Steps 37-41'),
        ('第42-46步 戰爭至禁教','Steps 42-46'),('第47-52步 逃往美洲至去亞洲','Steps 47-52'),
    ]),
    ('e', 'church_history_2', '教會歷史精覽下冊', 'Church History Overview Vol.2', '../disciple_d%20text/教會04%20教會歷史精覽下冊%20CHST2_Z_full.pdf', 'e/image_church', [
        ('第53步 第四次叩門','Step 53'),('第54-57步 還是叩不開至傳教士來了','Steps 54-57'),('第58-61步 行醫至不安好心','Steps 58-61'),('第62-64步 砍下來至帝國變民國','Steps 62-64'),
        ('第65-67步 在口岸生根至脫去洋服','Steps 65-67'),('第68-70步 靈火燃燒至國共內戰','Steps 68-70'),
    ]),
    ('e', 'church_faces_1', '教會面面觀（上）', 'Church in Perspective Vol.1', '../disciple_d%20text/教會05%20教會面面觀%20A%20CF1_Z_full.pdf', 'e/image_church', [
        ('基督是教會的頭','Christ the Head'),('恩賜、才幹','Gifts and Talents'),('肢體合一','Body Unity'),('身體的健康和保養','Body Health'),('神是我們的父','God Our Father'),('新郎與新婦','Bridegroom and Bride'),
        ('弟兄姊妹一家人','Brothers and Sisters'),('最大的是愛','Greatest is Love'),('祭司的國度（一）','Priestly Kingdom (1)'),('祭司的國度（二）','Priestly Kingdom (2)'),('屬靈的軍隊（一）','Spiritual Army (1)'),('屬靈的軍隊（二）','Spiritual Army (2)'),
    ]),
    ('e', 'church_faces_2', '教會面面觀（下）', 'Church in Perspective Vol.2', '../disciple_d%20text/教會06%20教會面面觀%20B%20CF2_Z_full.pdf', 'e/image_church', [
        ('神的羊群 - 牧者活道','Sheep and Shepherd'),('神的羊群 - 牧者行道','Shepherd Walking the Word'),('餵養神的羊群','Feed the Sheep'),('牧者主持喪禮婚禮','Pastor Funerals Weddings'),
        ('神的房屋（一）','God House (1)'),('神的房屋（二）','God House (2)'),('管家與財務','Steward and Finance'),('神的殿 - 聖潔','Temple Holiness'),
        ('教會的紀律','Church Discipline'),('神的殿 - 敬拜','Temple Worship'),('葡萄樹與枝子','Vine and Branches'),
    ]),
    ('e', 'nehemiah', '尼希米記', 'Nehemiah', '../disciple_d%20text/教會07%20尼希米記%20--%20重建與更新%20NEH_Z_full.pdf', 'e/image_church', [
        ('概論','Introduction'),('重建始於禱告','Rebuild Begins with Prayer'),('回歸準備重建','Return and Prepare'),('齊心協力建城牆','Build the Wall'),
        ('重建中的外患內憂','External and Internal Trials'),('領袖遭遇危機','Leader in Crisis'),('領袖事工原則','Leadership Principles'),('更新始於聖道','Renewal from the Word'),
        ('委身誓守律法','Commit to the Law'),('投身振興聖城','Revive the City'),('城牆奉獻典禮','Dedication'),('鞏固更新成果','Consolidate Renewal'),
    ]),
    ('f', 'bss1', '查經技巧（上）', 'Bible Study Skills Part 1', '../disciple_d%20text/研經、講道01%20查經技巧%20A%20%20%20BSS1_Z_full.pdf', 'f/image_preaching', [
        ('人人樂查經','Everyone Can Study'),('查經的四個步驟','Four Steps'),('重複','Repetition'),('類比','Analogy'),('對比','Contrast'),('先因後果','Cause and Effect'),
        ('先果後因','Effect and Cause'),('目的','Purpose'),('條件','Condition'),('問答','Question and Answer'),('普遍到細節','General to Particular'),('細節到普遍','Particular to General'),
        ('遞進','Progression'),('應用問題','Application'),
    ]),
    ('f', 'bss2', '查經技巧（下）', 'Bible Study Skills Part 2', '../disciple_d%20text/研經、講道02%20查經技巧%20B%20BSS2_Z_full.pdf', 'f/image_preaching', [
        ('分段','Outline'),('觀察上下文','Observe Context'),('觀察敘述','Observe Narrative'),('引言','Introduction'),('發展（一）','Development (1)'),('發展（二）','Development (2)'),
        ('結論','Conclusion'),('引言、發展、結論','Intro Development Conclusion'),('提問','Questions'),('主題與要點','Theme and Points'),('大綱與中心思想','Outline and Main Idea'),('思想','Reflection'),
    ]),
    ('f', 'preaching_intro', '講道入門', 'Introduction to Preaching', '../disciple_d%20text/研經、講道03%20講道入門%20HOMn_Z_full.pdf', 'f/image_preaching', [
        ('正確心態看講道','Right Attitude'),('挑選經文按需要','Choose Text'),('深入研經拆結構','Exegesis'),('寫大綱中心思想','Outline and Main Idea'),('通用原則共通處','General Principles'),
        ('設定主題定方向','Set Theme'),('四大元素建大綱','Four Elements'),('易明易記加例證','Illustrations'),('充實應用提建議','Application'),('完美終結需結論','Conclusion'),
        ('吸引會眾設引言','Introduction'),('敘事文體的釋經','Narrative Exegesis'),('敘事文體的解經講道','Narrative Preaching'),('個人預備不可少','Personal Preparation'),('傳情達意要真誠','Sincerity'),
    ]),
    ('g', 'barnabas_1', '巴拿巴手冊（一）屬靈同伴', 'Barnabas Vol.1 Spiritual Companion', '../disciple_d%20text/巴拿巴手冊01%20屬靈同伴%20PC1_Z_full.pdf', 'g/image_barnabas', [
        ('第一冊 屬靈同伴','Book 1 Spiritual Companion'),('第二冊 發揮屬靈同伴的作用','Book 2 Role of Companion'),('第三冊 師徒傳承中的「保羅」角色','Book 3 Paul Role'),('第四冊 師徒傳承中的「提摩太」角色','Book 4 Timothy Role'),('第五冊 和睦之道','Book 5 Way of Peace'),
    ]),
    ('g', 'barnabas_2', '巴拿巴手冊（二）發揮屬靈同伴的作用', 'Barnabas Vol.2 Role of Companion', '../disciple_d%20text/巴拿巴手冊02%20屬靈同伴%20PC2_Z_full.pdf', 'g/image_barnabas', [
        ('專題 屬靈同伴的作用','Topic Role of Companion'),('教導 勿彼此嫉妒等','Teaching'),('人物查經 迦勒與約書亞等','Character Study'),('建立 彼此負責的實際方法','Building Accountability'),
    ]),
    ('g', 'barnabas_3', '巴拿巴手冊（三）師徒傳承中的「保羅」角色', 'Barnabas Vol.3 Paul Role', '../disciple_d%20text/巴拿巴手冊03%20師徒傳承中的「保羅」角色%20PC3_Z_full.pdf', 'g/image_barnabas', [
        ('專題 師徒傳承與屬靈同伴','Topic Mentoring'),('教導 當師傅的異象等','Teaching'),('人物查經 摩西、耶穌','Character Study'),('建立 師徒關係的困難與解決','Building'),
    ]),
    ('g', 'barnabas_4', '巴拿巴手冊（四）師徒傳承中的「提摩太」角色', 'Barnabas Vol.4 Timothy Role', '../disciple_d%20text/巴拿巴手冊04%20師徒傳承中的「提摩太」角色%20PC4_Z_full.pdf', 'g/image_barnabas', [
        ('專題 提摩太與保羅角色','Topic Timothy and Paul'),('教導 找保羅的好處等','Teaching'),('人物查經 以利亞與以利沙、尼哥底母','Character Study'),('建立 作基督門徒之路等','Building'),
    ]),
    ('g', 'barnabas_5', '巴拿巴手冊（五）和睦之道', 'Barnabas Vol.5 Way of Peace', '../disciple_d%20text/巴拿巴手冊05%20和睦之道%20PC5_Z_full.pdf', 'g/image_barnabas', [
        ('第一課 目標受阻生衝突','Lesson 1 Conflict'),('第二課 不逃避也不攻擊','Lesson 2 No Flight or Fight'),('第三課 同根生要榮耀神','Lesson 3 Glorify God'),('第四課 換角度又除樑木','Lesson 4 Remove the Plank'),('第五課 溫柔挽回管舌頭','Lesson 5 Gentle Restoration'),('第六課 和好計畫交給主','Lesson 6 Reconciliation'),
    ]),
]

def toc_block(landing, chapters):
    lines = ['  <h2>目錄 / Table of Contents</h2>', '  <div class="card">', '    <ul class="toc-list" style="list-style:none; padding-left:0;">']
    for i, (ch_zh, ch_en) in enumerate(chapters, 1):
        lines.append('      <li><a href="{}_ch{:02d}.html">ch{:02d} 第{}課 {} <small>Lesson {} {}</small></a></li>'.format(
            landing, i, i, num_to_zh(i), ch_zh, i, ch_en))
    lines.extend(['    </ul>', '  </div>'])
    return '\n'.join(lines)

def main():
    for (subdir, landing, title_zh, title_en, pdf_href, image_folder, chapters) in COURSES:
        out_dir = os.path.join(BASE, subdir)
        os.makedirs(out_dir, exist_ok=True)
        for i, (ch_zh, ch_en) in enumerate(chapters, 1):
            lesson_zh = num_to_zh(i)
            content = CHAPTER_TEMPLATE.format(
                course_title_zh=title_zh, course_title_en=title_en,
                lesson_zh=lesson_zh, ch=i, ch_title_zh=ch_zh, ch_title_en=ch_en,
                landing=landing, pdf_href=pdf_href, image_folder=image_folder
            )
            path = os.path.join(out_dir, '{}_ch{:02d}.html'.format(landing, i))
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            print('Wrote', path)
    # Update landing pages with TOC
    import re
    for (subdir, landing, title_zh, title_en, pdf_href, image_folder, chapters) in COURSES:
        landing_path = os.path.join(BASE, subdir, landing + '.html')
        if not os.path.exists(landing_path):
            continue
        with open(landing_path, 'r', encoding='utf-8') as f:
            content = f.read()
        toc = toc_block(landing, chapters)
        # Insert TOC before 簡介 if not already present
        if '目錄 / Table of Contents' in content:
            continue
        old = '  <h2>簡介 / Introduction</h2>\n  <div class="card">\n    <p>（此處日後可加入課程簡介與圖片。）</p>'
        new = toc + '\n  <h2>簡介 / Introduction</h2>\n  <div class="card">\n    <p>（此處日後可加入課程簡介與圖片。）</p>'
        if old in content:
            content = content.replace(old, new, 1)
            with open(landing_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print('Updated TOC:', landing_path)
    print('Done.')

if __name__ == '__main__':
    main()
