# 實用聖詩學 · 第一份架構說明

進度以 `MODULE_STATUS.md` 為準（本檔「階段 1」已過時）。  
狀態：架構稿。課文只先有奇異恩典一課草稿。  
日期：2026-10-02

本檔只描述疊加資料與現有路徑。不改十首分析，不改 111 科頁，不改 `disciplines_index.js` 裡的舊鏡用字。

已拍板：

- 舊鏡欄位保留（資料仍是「讀它、唱它…」）。畫面上改用兩到四字的正常用語，細字附英譯。
- P01–P15 另建，不覆蓋舊鏡。
- 《吃這餅》只做短課，不進 26 首核心。
- 矩陣只存兩張。覆蓋圖由這兩張算出來，不另存第三份。
- 26 首是深研範本，不是「最好的 26 首」。

---

## 0. 工程進度

| 階段 | 內容 | 狀態 |
|---|---|---|
| 0 審計 | 111 科、七門、舊鏡、十首軸線、曲庫與譜圖、工作台在哪 | 已完成（本對話） |
| 1 架構 | 本檔：名錄、兩張矩陣、課文骨架、版面、怎麼寫 26 課 | **現在這一步** |
| 2 空殼資料 | 疊加 JSON：26 首 + 6 短課 + P01–P15；分數先空著 | 未做 |
| 3 填分 | 只填有證據的 3／4 分；其餘留空，標缺失 | 未做 |
| 4 金樣一課 | 前言 + 奇異恩典一課，照版面做出來 | 未做 |
| 5 其餘 25 課、總結、附錄 | 一課一課寫，不一次生成 | 未做 |
| 6 短課 6 篇 | 各只補一個缺口 | 未做 |
| 7 課件包 | 投影、工作紙、資訊圖 | 未做 |
| 網站 Canvas | 等架構確認、金樣通過後才做 | 未做 |

現在停在階段 1。下一動要等你看完本檔。

---

## A. 現有系統（審計）

| 東西 | 在哪 | 現況 |
|---|---|---|
| 111 科 | `practical_hymnology/data/disciplines_index.js`（`count: 111`） | 中英標題、代碼、門、舊鏡都在。課題頁是骨架 |
| 課題頁 | `practical_hymnology/disciplines/*.html` | 不改 |
| 七門 | 同一檔 `gateways` | 見 E 節。頁面不改名 |
| 舊鏡 | 每科的 `lens` 欄 | 用字仍是「讀它」等。本階段不改這個檔 |
| 十首軸線 | `hymn_management/data/hymn_axes_seed.js` | 已有成品。不改 |
| 奇異恩典這一頁 | `practical_hymnology/hymn_amazing_grace.html` | 不改 |
| 研究入口 | `practical_hymnology/landing.html#research` | 不改 |
| 工作台 | `practical_hymnology/resource_selector.html` | 複製提問、Excel 採用後才上連結。不改 |
| 曲庫 | `hymn_management/hymn/hymn_most/` 等 `.htm` | 比較用。不改 |
| 譜圖 | `hymn_management/hymn/image_hymn/` | 有圖 ≠ 已核對。未核對不得寫拍號、調性、和弦 |
| 詞表 | `hymn_management/docs/CONTROLLED_VOCAB.md` | 找歌用。不是 111 科 |

路由是靜態檔，`file://` 沒有 `/topics/{id}`。第一階段的網址＝現有相對路徑。

---

## B. 舊鏡：資料不改，顯示改口語

儲存值保持原樣，避免改動 111 科頁。新畫面與本架構只用下表的顯示名（兩到四字），英譯用細字。

| 編號 | 顯示 | English | 檔案裡仍是 |
|---|---|---|---|
| L00 | 總論 | Overview | `00. 總論` |
| L01 | 讀譜 | Score Reading | `01. 讀它` |
| L01b | 樂理 | Music Basics | `01. 讀音`（只出現在 A01.2，與 L01 並存，本階段不合併） |
| L02 | 歌唱 | Singing | `02. 唱它` |
| L03 | 編配 | Arranging | `03. 編它` |
| L04 | 賞析 | Close Reading of Words | `04. 賞它` |
| L05 | 辨析 | Figures and Images | `05. 析它` |
| L06 | 翻譯 | Translation | `06. 譯它` |
| L07 | 溯源 | Scripture Roots | `07. 溯它` |
| L08 | 教義 | Doctrine | `08. 想它` |
| L09 | 禱告 | Prayer | `09. 禱它` |
| L10 | 崇拜 | Worship | `10. 拜它` |
| L11 | 事奉 | Ministry Practice | `11. 用它` |
| L12 | 傳揚 | Witness | `12. 傳它` |
| L13 | 沿革 | Historical Trail | `13. 追它` |
| L14 | 聆聽 | Other Traditions | `14. 聽它` |
| L15 | 生活 | Everyday Faith | `15. 活它` |
| L00b | 綜合 | Workshop | `00. 綜合實務` |

舊鏡回答：這一科平常從哪個動作學。新鏡回答：這一首深研課用哪幾面鏡子看。兩套都留。

---

## C. 新鏡 P01–P15（另建）

顯示名兩到四字。不出現「它」，也不把 Hymn 放進中文標題。

| 編號 | 中文 | English | 建議檔路徑（尚未建立） |
|---|---|---|---|
| P01 | 聖經 | Biblical Foundation | `prisms/p01-bible.html` |
| P02 | 神學 | Theology | `prisms/p02-theology.html` |
| P03 | 詩文 | Text and Poetry | `prisms/p03-text.html` |
| P04 | 音樂 | Music | `prisms/p04-music.html` |
| P05 | 曲調 | Tune | `prisms/p05-tune.html` |
| P06 | 詞曲 | Text and Tune | `prisms/p06-text-tune.html` |
| P07 | 歷史 | History | `prisms/p07-history.html` |
| P08 | 禮儀 | Liturgy and Worship | `prisms/p08-liturgy.html` |
| P09 | 會眾 | Church and Community | `prisms/p09-community.html` |
| P10 | 宣教 | Mission | `prisms/p10-mission.html` |
| P11 | 跨文化 | Translation and Culture | `prisms/p11-culture.html` |
| P12 | 牧養 | Life and Pastoral Care | `prisms/p12-pastoral.html` |
| P13 | 教育 | Education | `prisms/p13-education.html` |
| P14 | 公共 | Public Faith | `prisms/p14-public.html` |
| P15 | 創作 | Making and Practice | `prisms/p15-practice.html` |

每首核心課只勾真正照得到的鏡，不要求 15 面全勾。0 分不顯示。

---

## D. 七門（不改名）

來源：`disciplines_index.js` 的 `gateways`。

| 編號 | 代碼 | 中文 | English |
|---|---|---|---|
| G0 | intro | 導論 | Introduction |
| GA | A | 音樂 | Music |
| GB | B | 文字 | Words |
| GC | C | 信仰 | Faith |
| GD | D | 教會 | Church |
| GE | E | 世界人生 | World and Life |
| GF | F | 綜合 | Integration |

落地頁短標（「人生」「綜合」）只是按鈕上的簡稱，機器仍用上表。

---

## E. 111 科（統一名錄）

來源即現有 `disciplines_index.js`。中文是正式科名（本來就不是單字）。英文為細字對照。`id` 例：`ph_` + 檔名。路徑：`disciplines/{slug}.html`。本表不另造科目。

舊鏡欄寫顯示名，方便對照；檔內原字不改。

### 導論

| 代碼 | 中文 | English | 舊鏡 |
|---|---|---|---|
| 0.1 | 甚麼是實用聖詩學 | What Is Practical Hymnology? | 總論 |
| 0.2 | 一歌多學：學習地圖與十五稜鏡 | Learning Map and 15 Lenses | 總論 |
| 0.3 | 課程分級、教學法與評估 | Levels, Pedagogy and Assessment | 總論 |

### A · 音樂

| 代碼 | 中文 | English | 舊鏡 |
|---|---|---|---|
| A01.1 | 讀譜 | Score Reading | 讀譜 |
| A01.2 | 樂理 | Music Theory | 樂理 |
| A01.3 | 節奏 | Rhythm | 讀譜 |
| A01.4 | 音程 | Intervals | 讀譜 |
| A01.5 | 和聲 | Harmony | 讀譜 |
| A01.6 | 曲式 | Musical Form | 讀譜 |
| A02.1 | 聲樂 | Vocal Technique | 歌唱 |
| A02.2 | 合唱 | Choral Singing | 歌唱 |
| A02.3 | 指揮 | Conducting | 歌唱 |
| A03.1 | 鋼琴與風琴 | Piano and Organ | 編配 |
| A03.2 | 其他樂器 | Other Instruments | 編配 |
| A03.3 | 合奏與樂隊 | Ensemble and Band | 編配 |
| A04 | 編曲與配樂 | Arranging and Accompaniment | 編配 |
| A05.1 | 旋律與和聲寫作 | Melody and Harmony Writing | 編配 |
| A05.2 | 曲式設計 | Form Design | 編配 |
| A06.1 | 聖詩風格 | Hymn Styles | 讀譜 |
| A06.2 | 民族音樂 | Ethnomusicology | 聆聽 |
| A06.3 | 世界音樂 | World Music | 聆聽 |

### B · 文字

| 代碼 | 中文 | English | 舊鏡 |
|---|---|---|---|
| B01.1 | 文學賞析 | Literary Appreciation | 賞析 |
| B01.2 | 詩學與詩體 | Poetics and Poetic Forms | 賞析 |
| B01.3 | 修辭 | Rhetoric | 辨析 |
| B01.4 | 押韻與格律 | Rhyme and Meter | 賞析 |
| B01.5 | 象徵與隱喻 | Symbol and Metaphor | 辨析 |
| B01.6 | 敘事與抒情 | Narrative and Lyric | 賞析 |
| B02.1 | 歌詞寫作 | Lyric Writing | 賞析 |
| B02.2 | 填詞與曲詞配合 | Text-Tune Matching | 賞析 |
| B02.3 | 詩歌創作 | Hymn Writing | 賞析 |
| B03.1 | 詩歌翻譯 | Hymn Translation | 翻譯 |
| B03.2 | 本色化 | Indigenization | 翻譯 |
| B03.3 | 跨文化傳播 | Cross-Cultural Communication | 翻譯 |

### C · 信仰

| 代碼 | 中文 | English | 舊鏡 |
|---|---|---|---|
| C01.1 | 聖經背景 | Biblical Background | 溯源 |
| C01.2 | 聖經神學 | Biblical Theology | 溯源 |
| C01.3 | 聖經詩歌文學 | Biblical Poetry | 溯源 |
| C01.4 | 詩篇 | Psalms | 溯源 |
| C01.5 | 聖經釋義 | Exegesis | 溯源 |
| C01.6 | 經文互文 | Intertextuality | 溯源 |
| C02.1 | 神論 | Doctrine of God | 教義 |
| C02.2 | 基督論 | Christology | 教義 |
| C02.3 | 聖靈論 | Pneumatology | 教義 |
| C02.4 | 救恩論 | Soteriology | 教義 |
| C02.5 | 教會論 | Ecclesiology | 教義 |
| C02.6 | 末世論 | Eschatology | 教義 |
| C02.7 | 聖禮 | Sacraments | 教義 |
| C02.8 | 禱告 | Prayer | 禱告 |
| C02.9 | 恩典與信心 | Grace and Faith | 教義 |
| C03.1 | 信經研究 | Creeds | 教義 |
| C03.2 | 教義史 | History of Doctrine | 教義 |
| C03.3 | 詩歌與教義對話 | Hymn-Doctrine Dialogue | 教義 |
| C04.1 | 詩歌靈修法 | Hymn-Based Devotion | 禱告 |
| C04.2 | 詩歌與屬靈傳統 | Spiritual Traditions | 禱告 |
| C04.3 | 聖詩神學總論 | Theology of Hymnody | 教義 |

### D · 教會

| 代碼 | 中文 | English | 舊鏡 |
|---|---|---|---|
| D01.1 | 崇拜程序與禮儀 | Order of Worship and Liturgy | 崇拜 |
| D01.2 | 崇拜神學 | Theology of Worship | 崇拜 |
| D01.3 | 詩歌選擇 | Song Selection | 崇拜 |
| D01.4 | 領詩 | Song Leading | 事奉 |
| D01.5 | 會眾參與 | Congregational Participation | 崇拜 |
| D01.6 | 詩歌與講道 | Hymns and Preaching | 崇拜 |
| D01.7 | 詩歌與聖禮 | Hymns and Sacraments | 崇拜 |
| D01.8 | 詩歌與禱告 | Hymns and Prayer | 崇拜 |
| D01.9 | 節期與教會年曆 | Church Year and Festivals | 崇拜 |
| D02.1 | 詩班 | Choir Ministry | 事奉 |
| D02.2 | 敬拜團 | Worship Team | 事奉 |
| D02.3 | 樂隊與伴奏 | Band and Accompaniment | 事奉 |
| D02.4 | 音響與舞台技術 | Sound and Stage | 事奉 |
| D02.5 | 排練 | Rehearsal | 事奉 |
| D02.6 | 領袖培訓 | Leadership Training | 事奉 |
| D02.7 | 團隊合作 | Teamwork | 事奉 |
| D02.8 | 教會音樂行政 | Music Administration | 事奉 |
| D02.9 | 會眾音樂教育 | Congregational Music Education | 事奉 |
| D03.1 | 福音詩歌 | Gospel Songs | 傳揚 |
| D03.2 | 見證 | Testimony | 傳揚 |
| D03.3 | 佈道與音樂佈道 | Evangelism and Music Evangelism | 傳揚 |
| D03.4 | 宣教學 | Missiology | 傳揚 |
| D03.5 | 跨文化宣教 | Cross-Cultural Mission | 傳揚 |
| D03.6 | 本土詩歌與翻譯 | Indigenous Hymnody and Translation | 傳揚 |
| D04.1 | 詩集與詩歌本編輯 | Hymnal Editing | 事奉 |
| D04.2 | 版權與授權 | Copyright and Licensing | 事奉 |
| D04.3 | 科技與數碼聖詩 | Digital Hymnody | 事奉 |
| D04.4 | 多媒體與網絡敬拜 | Online Worship | 事奉 |

### E · 世界人生

| 代碼 | 中文 | English | 舊鏡 |
|---|---|---|---|
| E01.1 | 教會史 | Church History | 沿革 |
| E01.2 | 世界史 | World History | 沿革 |
| E01.3 | 音樂史 | Music History | 沿革 |
| E01.4 | 宣教史 | Mission History | 沿革 |
| E01.5 | 社會史 | Social History | 沿革 |
| E01.6 | 詩歌作為史料 | Hymns as Historical Sources | 沿革 |
| E02.1 | 華人詩歌 | Chinese Hymnody | 聆聽 |
| E02.2 | 亞洲教會 | Asian Churches | 聆聽 |
| E02.3 | 非洲教會 | African Churches | 聆聽 |
| E02.4 | 拉丁美洲教會 | Latin American Churches | 聆聽 |
| E02.5 | 歐美傳統 | European and American Traditions | 聆聽 |
| E02.6 | 民族音樂學 | Ethnomusicology | 聆聽 |
| E02.7 | 文化神學 | Theology of Culture | 聆聽 |
| E03.1 | 人生價值與課題 | Life Values and Life Issues | 生活 |
| E03.2 | 人際關係 | Relationships | 生活 |
| E03.3 | 婚姻與家庭 | Marriage and Family | 生活 |
| E03.4 | 工作與金錢 | Work and Money | 生活 |
| E03.5 | 老年與死亡 | Ageing and Death | 生活 |
| E03.6 | 苦難與盼望 | Suffering and Hope | 生活 |
| E03.7 | 情緒與壓力 | Emotion and Stress | 生活 |
| E03.8 | 饒恕與感恩 | Forgiveness and Gratitude | 生活 |
| E03.9 | 品格與領導 | Character and Leadership | 生活 |
| E03.10 | 時間管理 | Time Management | 生活 |
| E03.11 | 心理健康 | Mental Health and Pastoral Care | 生活 |
| E03.12 | 長者牧養 | Ministry with the Elderly | 生活 |

### F · 綜合

| 代碼 | 中文 | English | 舊鏡 |
|---|---|---|---|
| F01 | 一歌多學工作坊 | One-Song Workshop | 綜合 |
| F02 | 原創聖詩工作坊 | Hymn-Writing Workshop | 綜合 |
| F03 | 田野考察 | Field Study | 綜合 |
| F04 | 畢業製作 | Capstone | 綜合 |

手續課（用任何一首先練手法，不算「缺一首神學代表歌」）：D02.4、D02.5、D02.6、D02.7、D02.8、E03.10。覆蓋報告單獨標 `practice`。

---

## F. 26 首核心深研

`corpus_id` 來自 `hymn_axes_seed.js` 的，表示十首成品已在，深研課只連結、不改寫。沒有 `corpus_id` 的，中文題名標暫定，作者、調名、年代未核對前不得寫成事實。

| 課 | 中文 | English | 定位 | corpus_id | 譜 |
|---|---|---|---|---|---|
| 01 | 普天之下萬民萬族 | All People That on Earth Do Dwell | 詩篇怎樣變成會眾的歌 | `hymn_most_0001` | 圖在，未整首核對 |
| 02 | 主耶和華，求祢引領 | Guide Me, O Thou Great Jehovah | 聖經敘事變成路上的歌 | `hymn_00_0001` | 未核對 |
| 03 | 奇異恩典 | Amazing Grace | 恩典、見證、跨文化 | `hymn_most_0121` | NEW BRITAIN 圖在，未整首核對 |
| 04 | 怎能如此 | And Can It Be | 十架與稱義 | `hymn_most_0122` | 未核對 |
| 05 | 平安夜 | Silent Night | 降生與全球記憶 | `hymn_most_0025` | 未核對 |
| 06 | 索塞克斯聖誕頌 | On Christmas Night | 同一節期的民謠唱法 | `hymn_00_0004` | 未核對 |
| 07 | 大秦景教三威蒙度讚 | Jingjiao Hymn of the Three Majesties | 漢語禮文與本色起點 | `hymn_chi_0001` | 無現代五線譜是事實，不是漏核對 |
| 08 | 祂是主 | He Is Lord | 短頌怎樣承載宣認 | `hymn_pwc_0001` | 未核對 |
| 09 | 咱著對主唱歌 | Cantemos al Señor | 語言本身就是敬拜文化 | `hymn_world_0001` | 未核對 |
| 10 | 輕輕觸摸大地 | Touch the Earth Lightly | 創造與公共責任 | `hymn_22_0001` | 未核對；版權多半仍在，待核 |
| 11 | （暫定）懇求以馬內利 | O Come, O Come, Emmanuel | 將臨與等候 | 曲庫有詞頁，id 待對上 | NOT VERIFIED |
| 12 | （暫定，未定中文題） | Of the Father's Love Begotten | 古代拉丁詩歌 | 未綁曲庫 | NOT VERIFIED |
| 13 | 堅固保障 | A Mighty Fortress Is Our God | 路德聖詠與改教 | 曲庫有詞頁與 Ein feste Burg 圖 | 圖在，未整首核對 |
| 14 | （暫定）神聖的愛 | Love Divine, All Loves Excelling | 成聖；與課 04 的稱義分開 | 未綁 | NOT VERIFIED |
| 15 | （暫定）主是我牧者 | The Lord's My Shepherd | 詩篇 23，對照課 01 | 曲庫有詞頁 | NOT VERIFIED |
| 16 | （暫定）與主同住 | Abide with Me | 哀歌、臨終、喪禮 | 曲庫有詞頁 | 譜圖未對上 |
| 17 | （暫定，未定中文題） | Were You There | 靈歌與受難記憶 | 曲庫有相近頁，id 待對上 | NOT VERIFIED |
| 18 | （暫定，未定中文題） | Let All Mortal Flesh Keep Silence | 古代禮儀裡的聖餐 | 未綁 | NOT VERIFIED |
| 19 | （暫定）聖哉三一 | Holy, Holy, Holy! Lord God Almighty | 三一，兼教格律與曲調 | 曲庫有詞頁（NICAEA） | NOT VERIFIED |
| 20 | （暫定，未定中文題） | Christ the Lord Is Risen Today | 復活日 | 未綁 | NOT VERIFIED |
| 21 | （暫定）求聖靈垂聽 | Spirit Divine, Attend Our Prayers | 聖靈，歌詞本身是禱告 | 譜圖檔名已見 | 圖在，未整首核對 |
| 22 | Jesu, tawa pano | Jesu, tawa pano | 非洲會眾歌 | 詞頁與譜圖已見 `1721 SS264` | 圖在，未整首核對 |
| 23 | （暫定）祢真偉大 | How Great Thou Art | 翻譯鏈與華人教會怎麼接一首譯詩 | 未綁 | NOT VERIFIED；版權待核 |
| 24 | （暫定）我在這裡 | Here I Am, Lord | 蒙召與差遣 | 未綁 | NOT VERIFIED；版權待核 |
| 25 | （暫定，未定中文題） | Lift Every Voice and Sing | 群體記憶與公義 | 未綁 | NOT VERIFIED |
| 26 | 華語新歌（空位） | Chinese Contemporary Worship Slot | 敬拜團、數碼譜、版權 | 無 | 未指定歌曲前，禁止打 3 或 4 分 |

課 07 的英文不用 “Xi'an Stele”。碑與這首敦煌禮文不是同一件文物，副標等核對再寫。

課 26 的 id 固定為 `lab_zh_contemporary_slot`。你指定一首授權清楚的歌之前，它只佔教室名額。

---

## G. 六首短課（不進 26）

每首只補一個缺口。不做十五鏡矩陣，不做十二段深研。課題頁可以點名它們。

| 編號 | 中文 | English | 只負責 |
|---|---|---|---|
| S1 | 吃這餅 | Eat This Bread | 泰澤式反覆。聖餐神學以課 18 為深研 |
| S2 | 四十天 | Lord, Who Throughout These Forty Days | 大齋與禁食。譜圖已見，仍須核對 |
| S3 | （暫定）我靈鎮靜 | Be Thou My Vision | 另一種禱告傳統 |
| S4 | （暫定）宣教舊詩 | From Greenland's Icy Mountains | 十九世紀宣教詩的批判閱讀 |
| S5 | （暫定）聖靈彷彿鴿 | Come, Holy Spirit, Dove Divine | 洗禮。不併進聖餐 |
| S6 | 兒童詩（空位） | Children's Hymn Slot | 會眾音樂教育。未指定前不打 3／4 分 |

---

## H. 兩張矩陣（只存這兩張）

疊加檔（尚未建立）：`practical_hymnology/data/lab_overlay.json`  
只新增這個檔。不寫回 `disciplines_index.js`。

### 矩陣 1 · 聖詩 × 課題 `hymn_topic`

| 欄 | 意思 |
|---|---|
| hymn_id | 課 01–26 或 S1–S6 |
| topic_id | 現有 `ph_…` |
| level | 0–4 |
| note | 一句證據；沒有證據不要填 3 或 4 |
| lesson_id | 深研只指向該首的那一份課，不按課題另開十二段 |

0 不顯示。1 只可點名。2 可補充。3 明確案例。4 這一首就是這一科的課本。同一首只寫一份深研；課題頁用連結指過去。

### 矩陣 2 · 聖詩 × 新鏡 `hymn_prism`

| 欄 | 意思 |
|---|---|
| hymn_id | 僅課 01–26（短課不填這張） |
| prism_id | P01–P15 |
| level | 0–4 |
| note | 為何這面鏡子照得到 |

### 算出來的報告（不存成第三份表）

- 一個課題有哪些歌、各是幾分（課題 → 多首，視角分開，不併成一篇）
- 111 科裡誰有 3 或 4、誰只有 1、誰是手續課、誰是 MISSING
- MISSING 只列出，不自動加歌

---

## I. 一本書怎麼排（26 課 + 前言 + 總結 + 附錄）

不是 111 篇長文，也不是 26×15 篇。

| 部分 | 篇數 | 做什麼 |
|---|---|---|
| 前言 | 1 | 這門課是什麼、兩套鏡怎麼並用、0–4 分、什麼叫深研、譜未核對就不寫音樂事實、版權、AI 四種用法 |
| 正文 | 26 | 每首一份深研。十二段見下 |
| 總結 | 1 | 怎麼讀覆蓋：哪些科已有課本、哪些仍空、空位不自動補歌、手續課怎麼練 |
| 附錄 | 4 則 | 甲、111 科對照（本檔 E 節）。乙、六首短課。丙、譜與版權狀態用語。丁、來源四類（原始、聖詩學工具書、學術、合法媒體） |

寫作順序（確認本檔之後）：

1. 前言定稿（短，給學生看，不寫工程過程）。
2. 金樣只寫課 03 奇異恩典。十二段齊，譜上沒有的不寫。
3. 你點頭後，再寫課 01、04、05、10（詩篇、十架、聖誕、大地），用來試五種不同實驗室。
4. 其餘核心課一周一首的節奏，不一次叫 AI 寫完。
5. 總結等矩陣有真實分數再寫，避免空口說「已覆蓋」。
6. 短課放在附錄乙，各一篇，不擴成實驗室。

每一份深研固定十二段，中英小標都要：

1. 歌詞 Lyrics  
2. 樂譜 Score（未核對則這段只寫「譜未核對」）  
3. 聖經 Biblical Relationship  
4. 歷史 History  
5. 神學 Theology  
6. 音樂 Music（同上，未核對不寫拍號、調性、和弦）  
7. 詞曲 Text and Tune  
8. 崇拜 Worship and Liturgy  
9. 比較 Comparative Hymn（只對一首，說明差在哪）  
10. 活動 Student Activity  
11. 研究題 Research Question  
12. 來源 Sources  

課件包（教師頁、學生頁、投影、圖、工作紙、答案、AI 練習）是後續。第一份架構只規定：這些東西挂在同一 `lesson_id` 下，不各寫一套神學。

AI 不是第 112 科。每課底部四個動作：提問、核對、比較、交回。交回的文字要人看過才算教材。工作台現成的「複製提問 → 你採用連結」繼續用，不另做一個 AI 後台。

---

## J. 版面（不要深黑）

沿用現有樂以載道的紙色，不另起深色皮膚。

| 用途 | 色 |
|---|---|
| 頁底 | `#f8f6f0`，可帶一點 `#fff7ed` |
| 正文 | `#1c1917`（暖褐，不是純黑 `#000`） |
| 次文、英譯細字 | `#57534e` |
| 卡片 | 白底，邊 `#e7e5e4`，圓角 |
| 強調 | `#8b5a2b` |
| 連結 | `#0b5fa5` |
| 重點線 | `#d4af37` |
| 未完成、待核對 | 淺灰底 `#fafaf9`，虛線邊，不要黑底白字 |

一課的畫面，由上到下：

1. 麵包屑：樂以載道 → 深研 → 課號。  
2. 課號 + 中文題。英文題用細字，不做成第二個大標。  
3. 一行定位（中文），下面一行英文細字。  
4. 十二段用淺金小標跳轉，不要左側一條黑欄。  
5. 每段一張白紙卡片。  
6. 譜的狀態用小徽章：已核對公開、已授權、只可外連、未核對。未核對用灰，不用紅底黑字。  
7. 底部 AI：四個文字按鈕。提問稿用米色框，不用工作台那種大塊黑底。

前言、總結、附錄同一套版，不另做封面風。

---

## K. 譜與版權

| 狀態 | 可以做 | 不可以做 |
|---|---|---|
| VERIFIED_PUBLIC | 顯示已核對的譜 | 仍不可編造譜上沒有的和弦 |
| VERIFIED_LICENSED | 在授權範圍內顯示 | 不可裁出授權以外的整首 |
| SCORE_REFERENCE_ONLY | 連到合法出處；詞、歷史、崇拜可寫 | 不可貼整譜 |
| NOT_VERIFIED | 標「譜未核對」 | 不可寫拍號、調性、和弦、分句音樂分析 |

作者、年份、調名、格律，種子檔沒有的，架構裡寫 UNKNOWN，不補想像。

---

## L. 遷移

只加 `lab_overlay.json`（下一階段）。  
`disciplines_index.js`、十首種子、課題 html、曲庫 htm、工作台：都不改。  
新鏡頁與深研頁以後是新檔，舊頁用連結接出去。

---

## M. 風險

- 中文題名若先寫死，會和詩集用字衝突。所以 11–25 課標暫定。  
- 課 26、短課 S6 在指定歌曲前參加覆蓋計算，會製造假覆蓋。計算時排除空位。  
- A01.2 的舊鏡字是「讀音」，其餘讀譜科是「讀它」。本階段只在顯示層分開，不改資料。  
- 一次生成 26 課會注水。金樣只有課 03。

---

## N. 仍待你看的（不是拦路，是寫課之前）

- 課 12、17、18、20、25 的中文題，要以你認定的詩集為準，本檔不代定。  
- 課 26 哪一首華語新歌，等你指定且授權清楚。  
- 金樣是否就用奇異恩典。建議是，因為十首裡它已有獨立頁可連結。

---

## O. 決策標記

| 項 | 標記 |
|---|---|
| 111 科位置與雙語名 | READY |
| 七門名稱 | READY |
| 舊鏡儲存值 | READY（不改） |
| 舊鏡顯示用詞、P01–P15 | READY（本檔；尚未寫進 JSON） |
| 26 首名單與十首 corpus_id | READY |
| 16 首裡多數的調名、年代、授權、中文題 | NEEDS VERIFICATION |
| 課 26、兒童詩 | MISSING（故意空位） |
| 《吃這餅》同時當核心又當短課 | CONFLICT（已解：只做短課） |
| 景教英文若寫成西安碑 | CONFLICT（本檔不採用） |
| 是否開始寫 overlay JSON 與奇異恩典金樣 | HUMAN DECISION（看完本檔再說） |
