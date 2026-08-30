/**
 * V1 越文詞／片語庫 + 主禱文已校 overlay。
 */
(function (global) {
  'use strict';

  var LEXICON = {
    'lạy': { zh: '崇敬／祈求', en: 'pray (reverent)', pos: 'verb' },
    'cha': { zh: '父', en: 'Father', pos: 'noun' },
    'chúng con': { zh: '我們（卑稱）', en: 'we / us (humble)', pos: 'pron' },
    'chúng tôi': { zh: '我們', en: 'we / us', pos: 'pron' },
    'ở': { zh: '在', en: 'at / in', pos: 'prep' },
    'trên': { zh: '上', en: 'on / above', pos: 'prep' },
    'trời': { zh: '天', en: 'heaven', pos: 'noun' },
    'nguyện': { zh: '祈願', en: 'pray / wish', pos: 'verb' },
    'danh': { zh: '名／聖名', en: 'name', pos: 'noun' },
    'cả sáng': { zh: '顯赫光耀', en: 'glorified', pos: 'adj' },
    'cả': { zh: '極／大', en: 'great', pos: 'adj' },
    'sáng': { zh: '光亮', en: 'bright', pos: 'adj' },
    'nước': { zh: '國／國家／水', en: 'kingdom / water', pos: 'noun' },
    'trị đến': { zh: '降臨統治', en: 'come to rule', pos: 'verb' },
    'trị': { zh: '治理', en: 'rule', pos: 'verb' },
    'đến': { zh: '來到', en: 'come', pos: 'verb' },
    'ý': { zh: '旨意', en: 'will', pos: 'noun' },
    'thể hiện': { zh: '實行／體現', en: 'be done', pos: 'verb' },
    'dưới': { zh: '下', en: 'under', pos: 'prep' },
    'đất': { zh: '地／人間', en: 'earth', pos: 'noun' },
    'cũng như': { zh: '如同', en: 'just as', pos: 'prep' },
    'xin': { zh: '請／祈求', en: 'please / pray', pos: 'verb' },
    'cho': { zh: '給／賜予', en: 'give', pos: 'verb' },
    'hôm nay': { zh: '今天', en: 'today', pos: 'adv' },
    'lương thực': { zh: '糧食', en: 'food / bread', pos: 'noun' },
    'hằng ngày': { zh: '每日', en: 'daily', pos: 'adj' },
    'và': { zh: '和／並且', en: 'and', pos: 'prep' },
    'tha': { zh: '寬赦', en: 'forgive', pos: 'verb' },
    'nợ': { zh: '罪債／債務', en: 'debt', pos: 'noun' },
    'là': { zh: '是', en: 'be', pos: 'verb' },
    'của': { zh: '的', en: 'of', pos: 'prep' },
    'người': { zh: '人／你', en: 'person / you', pos: 'noun' },
    'không': { zh: '不', en: 'not', pos: 'adv' },
    'được': { zh: '得／被', en: 'get / be', pos: 'verb' },
    'thánh': { zh: '聖', en: 'holy', pos: 'adj' },
    'hãy': { zh: '當／要', en: 'let / shall', pos: 'part' },
    'cầu nguyện': { zh: '禱告', en: 'pray', pos: 'verb' },
    'như vầy': { zh: '如此', en: 'like this', pos: 'adv' },
    'các': { zh: '眾／諸', en: 'plural marker', pos: 'part' },
    'ngươi': { zh: '你們', en: 'you (pl.)', pos: 'pron' },
    'vậy': { zh: '那麼', en: 'therefore', pos: 'adv' }
  };

  var OVERLAY = [
    {
      keys: ['lạy cha chúng con ở trên trời', 'lạy cha chúng con ở trên trời,'],
      verseId: 'MAT.6.9',
      translationZh: '我們在天上的父，',
      translationEn: 'Our Father in heaven,',
      notes: '祈禱呼語：Lạy 為敬語；Cha 是核心稱呼；ở trên trời 為位置修飾。',
      words: [
        { target: 'Lạy', zh: '崇敬／祈求', en: 'Pray', pos: 'verb' },
        { target: 'Cha', zh: '父', en: 'Father', pos: 'noun' },
        { target: 'chúng con', zh: '我們', en: 'Our / Us', pos: 'pron' },
        { target: 'ở', zh: '在', en: 'at / in', pos: 'prep' },
        { target: 'trên', zh: '上', en: 'on / above', pos: 'prep' },
        { target: 'trời', zh: '天', en: 'heaven', pos: 'noun' }
      ]
    },
    {
      keys: [
        'chúng con nguyện danh cha cả sáng, nước cha trị đến',
        'chúng con nguyện danh cha cả sáng, nước cha trị đến,',
        'nước cha trị đến',
        'nước cha trị đến,'
      ],
      verseId: 'MAT.6.10',
      translationZh: '願你的名被尊為聖，願你的國降臨，',
      translationEn: 'hallowed be your name, your kingdom come,',
      notes: '祈願式：cả sáng 為尊崇語；nước Cha 在祈禱文中取「國／天國」而非「水」。',
      words: [
        { target: 'chúng con', zh: '我們', en: 'we', pos: 'pron' },
        { target: 'nguyện', zh: '祈願', en: 'pray', pos: 'verb' },
        { target: 'danh', zh: '名', en: 'name', pos: 'noun' },
        { target: 'Cha', zh: '父', en: 'Father', pos: 'noun' },
        { target: 'cả sáng', zh: '顯赫光耀', en: 'glorified', pos: 'adj' },
        { target: 'nước', zh: '國／天國', en: 'kingdom', pos: 'noun' },
        { target: 'Cha', zh: '父', en: 'Father', pos: 'noun' },
        { target: 'trị đến', zh: '降臨統治', en: 'come to rule', pos: 'verb' }
      ]
    }
  ];

  global.B100InterlinearLexicon = {
    LEXICON: LEXICON,
    OVERLAY: OVERLAY,
    SAMPLE_TEXT:
      'Lạy Cha chúng con ở trên trời,\n' +
      'chúng con nguyện danh Cha cả sáng, nước Cha trị đến,'
  };
})(typeof window !== 'undefined' ? window : this);
