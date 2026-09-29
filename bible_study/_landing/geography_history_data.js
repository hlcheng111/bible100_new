/**
 * 聖經地理歷史 · 連結 SSOT
 * embed:true → 侧栏/landing 经 geo_external_frame（右栏，autoload=1）
 * embed:false → 仅 ↗ 新分页（YouTube、圣光等）
 * local:true → 本站页（timeline_viewer 等）
 * door: place | map | timeline → 三扇門主路徑；more:true →「更多」
 */
window.GEOGRAPHY_HISTORY_DATA = {
  doors: [
    {
      id: 'place',
      title: '這卷發生在哪',
      desc: '查地名、背景與聖光地理索引。外站會新分頁開啟，看完可回來。',
      cta: '打開地名索引'
    },
    {
      id: 'map',
      title: '看總圖',
      desc: '先看一張總覽地圖，把人物行走的路線放進眼前。',
      cta: '打開聖經地圖'
    },
    {
      id: 'timeline',
      title: '看大故事時間',
      desc: '從創造到使徒時代，先抓「發生在什麼時候」。',
      cta: '打開時間軸'
    }
  ],
  categories: [
    {
      id: 'place',
      door: 'place',
      icon: '📍',
      nameZh: '這卷發生在哪',
      nameEn: 'Place',
      links: [
        { label: '地名索引（聖光）↗', url: 'https://biblegeography.holylight.org.tw/index/condensedbible_list', embed: false },
        { label: '地名搜尋（聖光）↗', url: 'https://biblegeography.holylight.org.tw/index/list_queries', embed: false },
        { label: '地理導讀（聖光）↗', url: 'https://biblegeography.holylight.org.tw/index/introduction_list', embed: false }
      ]
    },
    {
      id: 'map',
      door: 'map',
      icon: '🗺️',
      nameZh: '看總圖',
      nameEn: 'Map',
      links: [
        { label: '聖經地圖（耶穌基督後期聖徒教會）', url: 'https://www.churchofjesuschrist.org/study/scriptures/bible-maps/index?lang=yue', embed: true },
        { label: '聖經地圖集（cnbible）', url: 'https://cnbible.com/atlas/a.htm', embed: true },
        { label: '聖經地圖集（OpenBible）', url: 'https://www.openbible.info/geo/atlas/a', embed: true }
      ]
    },
    {
      id: 'timeline',
      door: 'timeline',
      icon: '📅',
      nameZh: '看大故事時間',
      nameEn: 'Timeline',
      links: [
        { label: '本站時間軸', url: 'timeline_viewer.html', local: true },
        { label: '聖經時間軸（bibleeveryone）', url: 'https://bibleeveryone.com/bible-timeline.php', embed: true },
        { label: '聖經時間軸（cnbible）', url: 'https://cnbible.com/timeline/', embed: true }
      ]
    },
    {
      id: 'bibleproject',
      icon: '📺',
      nameZh: '影音導覽',
      nameEn: 'Video',
      more: true,
      links: [
        { label: 'BibleProject 粵語 ↗', url: 'https://www.youtube.com/@BibleProjectCantonese', embed: false },
        { label: 'BibleProject 普通話 ↗', url: 'https://www.youtube.com/@BibleProjectMandarinSimplified', embed: false },
        { label: 'BibleProject 英語 ↗', url: 'https://www.youtube.com/@bibleproject', embed: false }
      ]
    },
    {
      id: 'archaeology',
      icon: '🏛️',
      nameZh: '考古學入門',
      nameEn: 'Archaeology',
      more: true,
      links: [
        { label: '考古學導讀', url: 'https://www.chineseapologetics.net/archaeology/book/main.htm', embed: true }
      ]
    }
  ]
};

/** 侧栏 / landing 共用：解析链接 href 与导航属性 */
window.GEOGRAPHY_HISTORY_linkAttrs = function (link, opts) {
  opts = opts || {};
  var prefix = opts.pathPrefix || '';
  if (link.local) {
    var localPath = String(link.url).replace(/^\.\.\//, '');
    return {
      href: prefix + localPath,
      nav: ' data-b100-nav="content"',
      rel: '',
      suffix: ''
    };
  }
  if (link.embed === false) {
    return {
      href: link.url,
      nav: '',
      rel: ' rel="noopener" target="_blank"',
      suffix: ''
    };
  }
  return {
    href: prefix + 'geo_external_frame.html?url=' + encodeURIComponent(link.url) + '&autoload=1',
    nav: ' data-b100-nav="content"',
    rel: '',
    suffix: ''
  };
};
