/**
 * ALDA 16 題情境迫選題庫（SSOT）
 * 由 scripts/extract_alda_questions.py 自 12 Apostles Leadership Assessment.html 產生。
 * 手改題目請同步 HTML 與本檔，或重新執行 extract 腳本。
 */
(function (global) {
  "use strict";
var ALDA_QUESTIONS = [
            {
                id: 1,
                expertLabel: "【實務危機】主日崇拜前一小時，音響及直播網絡系統完全崩盤，同工與義工一團慌亂。你的第一直覺反應是：",
                expertCode: "Q1-CRISIS-C1_vs_O1",
                options: [
                    { id: "A", text: "迅速站出來代表團隊決策，調度備用人力，宣告應變流程，帶領大家冷靜應對。", group: "C", apostle: "彼得", weight: 2, diagnostic: "彼得: 推進者/開路先鋒" },
                    { id: "B", text: "立刻按預備 SOP 指引，逐一檢查物理接線與設備，確保排除故障的每一步都在安全規程內。", group: "O", apostle: "腓力", weight: 2, diagnostic: "腓力: 精細化運營" },
                    { id: "C", text: "冷靜站在一旁，快速評估此次崩盤的技術原因與系統漏洞，準備會後撰寫優化防護報告。", group: "S", apostle: "馬太", weight: 2, diagnostic: "馬太: 數字化技術" },
                    { id: "D", text: "優先安撫現場那幾位急得快哭的年輕同工，拍拍他們的肩膀，帶領他們做簡短禱告穩定心神。", group: "C", apostle: "約翰", weight: 2, diagnostic: "約翰: 情感凝聚" }
                ]
            },
            {
                id: 2,
                expertLabel: "【事奉與安息】近期事工事奉排山倒海，你已經精疲力竭、家庭關係也受到張力。你如何面對這種真實的倦怠？",
                expertCode: "Q2-REST-C2_vs_S1",
                options: [
                    { id: "A", text: "這是不斷突破戰功與信心跨越的時刻，我會靠著意志力硬撐下去，不能讓事工進度受挫。", group: "C", apostle: "雅各", weight: 2, diagnostic: "雅各: 變革推手" },
                    { id: "B", text: "立刻向執事會主席呈報，調配同工資源，建立合理的 AB 角替補制度，將流程機制常態化。", group: "O", apostle: "安得烈", weight: 2, diagnostic: "安得烈: 資源鏈接" },
                    { id: "C", text: "保持極高理智，暫時抽離日常服事。我認為，精疲力竭代表我們現有的團隊管理體系出現了崩潰徵兆，應進行全面架構重整。", group: "S", apostle: "多馬", weight: 2, diagnostic: "多馬: 批判風控" },
                    { id: "D", text: "私下找幾位關係深厚、生命成熟的執事和牧者傾訴，尋求陪伴、醫治與代禱，不自己硬扛。", group: "C", apostle: "約翰", weight: 2, diagnostic: "約翰: 文化凝聚" }
                ]
            },
            {
                id: 3,
                expertLabel: "【屬靈真實度暗查】在執事團隊日常靈修分享時，面對大家都在談論「得勝與恩典」，你對自己的內心真實狀態如何表達？",
                expertCode: "Q3-VALIDITY-SD_FLAG",
                options: [
                    { id: "A", text: "（即便內心正處於低谷、軟弱，但在眾人面前）我依然會分享正面的、神學標準的屬靈話語，避免散播負能量、影響士氣。", group: "C", apostle: "彼得", weight: 1, isSD: true, diagnostic: "屬靈面具/假大空標記(SD)" },
                    { id: "B", text: "我會坦承分享自己最近在家庭、事奉中的焦慮與心靈疲憊，哪怕這可能讓我顯得不夠「屬靈成熟」。", group: "C", apostle: "約翰", weight: 2, diagnostic: "約翰: 誠實真實性" },
                    { id: "C", text: "我一般不參與情感層面的靈修互動。我更傾向於在會議中，通過實實在在的行政交付和合規操作來表達我對上帝的委身。", group: "O", apostle: "巴多羅買", weight: 2, diagnostic: "巴多羅買: 嚴謹執行" },
                    { id: "D", text: "不主動發言，但我會認真傾聽並觀察每個人，從心理健康或小組動力學的角度，評估目前團隊成員的內耗狀態。", group: "S", apostle: "小雅各", weight: 2, diagnostic: "小雅各: 默默支持" }
                ]
            },
            {
                id: 4,
                expertLabel: "【團隊決策衝突】執事會正在辯論是否要引入全新的「Church OS 智能管理系統」。多數同工因不熟悉而反對，你通常如何表態？",
                expertCode: "Q4-DECISION-C1_vs_S2",
                options: [
                    { id: "A", text: "只要這個系統能有效釋放同工的生產力，提升牧養效率，應由主席強行通過，先實施後優化。", group: "C", apostle: "彼得", weight: 2, diagnostic: "彼得: 強勢推進" },
                    { id: "B", text: "反對盲目上線。我們必須先調研所有分堂的基礎網絡、硬件配備，編製詳細的成本與效益評估預算表。", group: "O", apostle: "腓力", weight: 2, diagnostic: "腓力: 精細運營" },
                    { id: "C", text: "非常支持。這可以幫我們建立起『單一事實來源（SSOT）』，所有流程 and 數據實現無縫追溯，避免人治弊病。", group: "S", apostle: "馬太", weight: 2, diagnostic: "馬太: 數字系統" },
                    { id: "D", text: "高度關注新系統的安全、合規與保密性，確保會友個人敏感隱私數據在權限上不被任何第三方濫用。", group: "O", apostle: "巴多羅買", weight: 2, diagnostic: "巴多羅買: 制度守護" }
                ]
            },
            {
                id: 5,
                expertLabel: "【金錢與奉獻治理】面對教會大筆資金儲蓄的使用，你的核心審計觀點是：",
                expertCode: "Q5-MONEY-C2_vs_F1",
                options: [
                    { id: "A", text: "資金應優先向一線最困難的宣教禾場、貧窮會友救援傾斜。多餘的資金沉澱，其實代表我們缺乏國度野心與冒險精神。", group: "C", apostle: "雅各", weight: 2, diagnostic: "雅各: 擴展意圖" },
                    { id: "B", text: "必須在銀行中保留至少 6 個月以上的運營安全準備金。任何一筆開支，財務回報率（ROI）及合規性是一票否決項。", group: "F", apostle: "猶大", weight: 2, diagnostic: "猶大: 精明CFO (高ROI偏好)" },
                    { id: "C", text: "必須聘請外部專業會計師事務所，每年進行無死角外部審計。所有賬目聯簽流程必須數字化、透明化。", group: "O", apostle: "巴多羅買", weight: 2, diagnostic: "巴多羅買: 完全合規" },
                    { id: "D", text: "資金的多寡是次要的，重要的是神託付給我們的使命。我認為，要不斷推動具有社會影響力的事工，款項自然會跟上。", group: "F", apostle: "西門", weight: 2, diagnostic: "西門: 激情先鋒" }
                ]
            },
            {
                id: 6,
                expertLabel: "【權力與順服】當執事會做出的某項重大決議與你本人的神學觀念或服事方向有嚴重衝突時，你會：",
                expertCode: "Q6-POWER-C2_vs_O2",
                options: [
                    { id: "A", text: "在會議上強烈辯論，甚至不惜挑戰主席的權威。如果投票結果依然不能說服我，我保留不執行或退出該項目的權利。", group: "C", apostle: "雅各", weight: 2, diagnostic: "雅各: 鐵血變革" },
                    { id: "B", text: "雖然心存疑惑，但只要程序合規、符合教會既定章程制度，我會克制個人偏好，百分之百順服、默默執行。", group: "O", apostle: "巴多羅買", weight: 2, diagnostic: "巴多羅買: 章程秩序" },
                    { id: "C", text: "直接對其背後的決策邏輯和數據基礎提出實質質疑。除非團隊能拿出令人信服、客觀嚴密的論據支持其決議。", group: "S", apostle: "多馬", weight: 2, diagnostic: "多馬: 實證理性" },
                    { id: "D", text: "主動擔任橋樑，在私下推動各派同工餐敘與溝通，幫助大家建立情感和解，避免因理念衝突發展為派系鬥爭。", group: "C", apostle: "約翰", weight: 2, diagnostic: "約翰: 關係凝聚" }
                ]
            },
            {
                id: 7,
                expertLabel: "【金錢交叉驗證】某位富有的會友提出：願意大手筆資助教會，但條件是資助項目由他個人全權主導、不受執事會審查。此時你傾向：",
                expertCode: "Q7-CROSS_CHECK-MONEY_GOV",
                options: [
                    { id: "A", text: "堅決拒絕。這是對教會合規章程與核心治理架構的嚴重破壞。凡不接受執事會雙軌聯簽和預算審查的資金，一分都不能要。", group: "O", apostle: "巴多羅買", weight: 2, diagnostic: "巴多羅買: 嚴格合規守門人" },
                    { id: "B", text: "靈活應對。這筆資金可以極大地推動我們當前卡關的宣教項目，我們可以成立專項管理小組由他主導，先拿到資源再說。", group: "F", apostle: "猶大", weight: 2, diagnostic: "猶大: 靈活效率(有道德邊緣傾向)" },
                    { id: "C", text: "先在會友中做一次無記名民意調研，看看基層會友對此事的接受度如何，根據調研反饋再做合理解決。", group: "F", apostle: "達太", weight: 2, diagnostic: "達太: 基層調研" },
                    { id: "D", text: "相信神的供應不止於此。我會勸勉這位富有會友，引導他看到“完全奉獻”的屬靈益處，而不是利用資金控制教會。", group: "C", apostle: "約翰", weight: 2, diagnostic: "約翰: 精神感召" }
                ]
            },
            {
                id: 8,
                expertLabel: "【事工失誤處理】由你督導的一名年輕義工在主日事奉中，因為個人疏忽導致財務賬目嚴重混亂。你會採取什麼手段？",
                expertCode: "Q8-FAILURE-O2_vs_C1",
                options: [
                    { id: "A", text: "依規公開通報，暫停其服事資格三個月。教會財務是聖潔且嚴肅的，必須有清晰的責任邊界與懲戒機制。", group: "O", apostle: "巴多羅買", weight: 2, diagnostic: "巴多羅買: 法治原則" },
                    { id: "B", text: "主動承擔督導不力的責任。私下與其喝咖啡，聆聽他的真實生活狀況、是否遇到試煉，並幫助他挽回屬靈生命狀態。", group: "C", apostle: "約翰", weight: 2, diagnostic: "約翰: 牧養關懷第一" },
                    { id: "C", text: "分析是否是因為我們現有的記賬工具或技術流程不夠簡便、沒有做自動校對，並著手開發升級自動記賬系統。", group: "S", apostle: "馬太", weight: 2, diagnostic: "馬太: 系統優化" },
                    { id: "D", text: "默默幫他把賬目補齊、抹平，並在後期親自頂替他的部分實務工作，不給他過多的心理壓力和指責。", group: "S", apostle: "小雅各", weight: 2, diagnostic: "小雅各: 默默補台" }
                ]
            },
            {
                id: 9,
                expertLabel: "【對外溝通風格】在向全教會會友推動一個具有一定爭議的、跨宗派的「社會邊緣群體關懷計劃」時，你如何溝通？",
                expertCode: "Q9-COMM-F2_vs_S2",
                options: [
                    { id: "A", text: "在大堂崇拜中，激情澎湃地宣講國度胸懷、末世危機，燃起大家打破常規的宣教熱血和地推激情。", group: "F", apostle: "西門", weight: 2, diagnostic: "西門: 激情地推" },
                    { id: "B", text: "準備內容豐富、邏輯閉環的項目書（Whitepaper），展示詳細的項目演進、可行性邊界、神學立場論據。", group: "S", apostle: "馬太", weight: 2, diagnostic: "馬太: 白皮書邏輯" },
                    { id: "C", text: "主動與各核心團契小組長、資新執事、地方意見領領袖私下逐一咖啡約談，聽取各方偏見與擔憂，為新政吹風。", group: "O", apostle: "安得烈", weight: 2, diagnostic: "安得烈: 資源外交" },
                    { id: "D", text: "設計結構精確、包含 1-5 分 Likert 量表的全教會問卷，全面收集基層會友的偏好，確保決策的科學下情上達。", group: "F", apostle: "達太", weight: 2, diagnostic: "達太: 問卷調研" }
                ]
            },
            {
                id: 10,
                expertLabel: "【面對中傷與毀謗】教會有部分匿名會友，在社交網絡和匿名信中，對你的執事服事作風和家庭生活，進行了毫無根據的惡意中傷和毀謗。你會：",
                expertCode: "Q10-CRITICISM-S2_vs_O2",
                options: [
                    { id: "A", text: "不予理會。我相信真金不怕火煉，我的服事成果和上帝的眼目是我唯一的辯護，我會繼續默默堅守崗位。", group: "S", apostle: "小雅各", weight: 2, diagnostic: "小雅各: 默默守護" },
                    { id: "B", text: "要求執事會法律合規小組介入，發布官方合規聲明，警告匿名造謠者其行為已違背教會紀律，甚至觸犯世俗法律。", group: "O", apostle: "巴多羅買", weight: 2, diagnostic: "巴多羅買: 合規捍衛" },
                    { id: "C", text: "內省自己的生命，主動向同工袒露此事對我情感帶來的巨大痛楚，尋求牧者的生命遮蓋，不陷入自證清白。", group: "C", apostle: "約翰", weight: 2, diagnostic: "約翰: 情感誠實" },
                    { id: "D", text: "直接調取近幾年的服事數據、績效報表和奉獻記錄，用無法駁倒的客觀財務與事工成果，在會議上進行回擊與澄清。", group: "S", apostle: "多馬", weight: 2, diagnostic: "多馬: 數據辯護" }
                ]
            },
            {
                id: 11,
                expertLabel: "【屬靈品格暗查】在你的整個教會服事生涯中，你如何看待自己的「私心與驕傲」？",
                expertCode: "Q11-VALIDITY-SD_PRIDE",
                options: [
                    { id: "A", text: "自從我全然委身、經歷十字架的對付後，在教會的服事中，我已經完全沒有私心、也沒有驕傲。我唯一的動機就是榮耀神。", group: "C", apostle: "彼得", weight: 1, isSD: true, diagnostic: "宗教完美主義(SD)" },
                    { id: "B", text: "我承認，即便在最聖潔的服事中，我內心深處依然常常隱藏著追求權力、掌聲、或尋求掌控感的幽暗動機。這是我天天需要悔改之處。", group: "C", apostle: "約翰", weight: 2, diagnostic: "約翰: 真實悔改" },
                    { id: "C", text: "與其討論這些抽象的道德內省，我更相信通過健全的權力制衡制度、預算透明流程，可以有效防止任何人的私慾膨脹。", group: "O", apostle: "巴多羅買", weight: 2, diagnostic: "巴多羅買: 制度制衡" },
                    { id: "D", text: "我經常會因為團隊其他同工的不盡職、或決策愚蠢，而產生嚴重的憤怒與內心高傲。這是我需要面對的真實脾氣。", group: "S", apostle: "多馬", weight: 2, diagnostic: "多馬: 客觀自省" }
                ]
            },
            {
                id: 12,
                expertLabel: "【治理效能瓶頸】執事會議上，大家連續幾個月在討論同一個小組分裂問題，反覆爭論細節，毫無實質推進。此時你最容易：",
                expertCode: "Q12-BURNOUT-C1_vs_S2",
                options: [
                    { id: "A", text: "感到極度沮喪和憤怒。這簡真是在浪費生命，我會拍案而起，要求主席立刻中斷扯皮、強行指派專人解決。", group: "C", apostle: "彼得", weight: 2, diagnostic: "彼得: 行動意志" },
                    { id: "B", text: "提議對爭論雙方建立標準的 RACI 職責矩陣，限期兩週進行客觀指標審查，以避免大會淪為情感宣洩場所。", group: "S", apostle: "馬太", weight: 2, diagnostic: "馬太: 規範架構" },
                    { id: "C", text: "保持沉默，在心中做最壞的推演：如果該小組最終分裂，對整個教會的社群網絡與財務貢獻會造成什麼樣的破壞。", group: "S", apostle: "多馬", weight: 2, diagnostic: "多馬: 悲觀防禦" },
                    { id: "D", text: "在會後主動與衝突雙方的小組長吃夜宵，用溫和的牧養態度解開他們心裡的結，從關係層面消解衝突。", group: "C", apostle: "約翰", weight: 2, diagnostic: "約翰: 關係彌合" }
                ]
            },
            {
                id: 13,
                expertLabel: "【宣教與外部鏈接】當教會決定在海外開展一個全新的植堂/差傳計劃時，你認為最關鍵的啟點是：",
                expertCode: "Q13-EXTERNAL-O2_vs_F2",
                options: [
                    { id: "A", text: "先派出一線探路先鋒，與當地政府、跨宗派機構、及地緣領袖建立深度的人脈資源和同盟鏈接。", group: "O", apostle: "安得烈", weight: 2, diagnostic: "安得烈: 開拓鏈接" },
                    { id: "B", text: "利用大數據和多媒體平台，將這一異象快速推廣到線上社交網絡，喚醒有激情的跨國青年信徒委身參與。", group: "F", apostle: "西門", weight: 2, diagnostic: "西門: 熱血動員" },
                    { id: "C", text: "嚴格評估海外當地的稅務法律、教派准入資格與合規邊界，確保植堂在世俗行政上不留後患。", group: "O", apostle: "巴多羅買", weight: 2, diagnostic: "巴多羅買: 法治安全" },
                    { id: "D", text: "默默在後台建立線上捐款通道、多語言神學培訓資料庫與遠程協同工具，為一線提供紮實的後盾支持。", group: "S", apostle: "小雅各", weight: 2, diagnostic: "小雅各: 默默支持" }
                ]
            },
            {
                id: 14,
                expertLabel: "【宣教狂熱 vs 日常守成】部分激進同工強烈要求，停辦所有日常的內部團契、將全部資源和預算投入到街頭外展中。你會如何：",
                expertCode: "Q14-STABILITY-F2_vs_O2",
                options: [
                    { id: "A", text: "高度贊同。日常團契常淪為自娛自樂，我們必須以激進的天國熱情，投入到最前沿的戰場中去。", group: "F", apostle: "西門", weight: 2, diagnostic: "西門: 激進開拓" },
                    { id: "B", text: "堅決反對。這會造成極大的預算赤字，且日常團契是教會的基本營盤，日常守成運營才是組織基業長青的保障。", group: "O", apostle: "腓力", weight: 2, diagnostic: "腓力: 保守守成" },
                    { id: "C", text: "引導團隊回歸理智，調取過去街頭外展的『會友轉化率』與『新朋友流失率』等歷史數據，用客觀事實評估。 ", group: "S", apostle: "多馬", weight: 2, diagnostic: "多馬: 客觀求證" },
                    { id: "D", text: "關心那些因為不習慣街頭外展而被邊緣化的弱勢會友、長者會友，確保他們在這次爭辯中，不感到被教會遺棄。", group: "C", apostle: "約翰", weight: 2, diagnostic: "約翰: 長者群眾關懷" }
                ]
            },
            {
                id: 15,
                expertLabel: "【偏見診斷交叉核對】在執事大會後，有會友在網上指責你「不公平、有地域偏見或階層偏見」。你的真實反應是：",
                expertCode: "Q15-VALIDITY-BIAS_CHECK",
                options: [
                    { id: "A", text: "我承認我自己確實存在盲點，過去的成長背景 and 職場經驗讓我潛意識裡可能帶著某些偏見，我願意認真悔改並道歉。", group: "O", apostle: "巴多羅買", weight: 2, diagnostic: "巴多羅買: 自省偏見調適" },
                    { id: "B", text: "我不為自己辯護，但我會立刻推動建立一個透明的『會友反饋申訴渠道』，確保任何會友都能平等得到合規審理。", group: "F", apostle: "達太", weight: 2, diagnostic: "達太: 基層申訴渠道" },
                    { id: "C", text: "我問心無愧。我是在按著真理行事，那些指責大多是因為他們對神學架構缺乏深刻認識，我不會因此受到任何干擾。", group: "C", apostle: "雅各", weight: 1, isSD: true, diagnostic: "防禦心理面具(SD)" },
                    { id: "D", text: "我會感到深深的情感挫敗，甚至想暫停一切服事，隱退到安靜處去，不希望自己的名字和榮譽受到污染。", group: "S", apostle: "小雅各", weight: 2, diagnostic: "小雅各: 敏感退卻" }
                ]
            },
            {
                id: 16,
                expertLabel: "【國度異象 vs 財務效益】教會的青年咖啡館事工連續兩年嚴重虧損。從財務管理角度，你認為應當：",
                expertCode: "Q16-FINANCE-F1_vs_F2",
                options: [
                    { id: "A", text: "立刻止損、關停項目，將虧損資金轉移到其他更有效益的傳統事工上。這才是對神家資產盡忠職守的 CFO 態度。", group: "F", apostle: "猶大", weight: 2, diagnostic: "猶大: 精明ROI核查" },
                    { id: "B", text: "不予關停。因為這個咖啡館是我們接觸不信主的先鋒外展地標，其『生命轉化』等隱形國度效益無法用金錢 ROI 衡量。", group: "F", apostle: "西門", weight: 2, diagnostic: "西門: 先驅異象優先" },
                    { id: "C", text: "對咖啡館的經營模式進行數字化轉型，開發自動化的咖啡機和義工自助系統，壓縮運營成本，使其走上自給自足的軌道。", group: "S", apostle: "馬太", weight: 2, diagnostic: "馬太: 技術優化" },
                    { id: "D", text: "尋求與外部富有或有商業才幹的會友/機構聯姻，通過融資、技術入股等方式將此項目盤活，分散教會風險。", group: "O", apostle: "安得烈", weight: 2, diagnostic: "安得烈: 外部併購重組" }
                ]
            }
        ];

  global.ALDA_QUESTIONS = ALDA_QUESTIONS;
})(typeof window !== "undefined" ? window : global);
