/**
 * 聖經地理歷史 · 連結 SSOT
 * embed:true → 侧栏/landing 经 geo_external_frame（右栏，autoload=1）
 * embed:false → 仅 ↗ 新分页（YouTube、圣光等）
 */
window.GEOGRAPHY_HISTORY_DATA = {
  categories: [
    {
      id: 'timeline',
      icon: '📅',
      nameZh: '時間軸',
      nameEn: 'Timeline',
      links: [
        { label: 'Bible Timeline (共享)', url: 'https://bibleeveryone.com/bible-timeline.php', embed: true },
        { label: 'Bible Timeline (cnbible)', url: 'https://cnbible.com/timeline/', embed: true }
      ]
    },
    {
      id: 'place',
      icon: '📍',
      nameZh: '地理地名',
      nameEn: 'Place',
      links: [
        { label: 'Place Index (Holy Light) ↗', url: 'https://biblegeography.holylight.org.tw/index/condensedbible_list', embed: false },
        { label: 'Place Search (Holy Light) ↗', url: 'https://biblegeography.holylight.org.tw/index/list_queries', embed: false },
        { label: 'Geo Intro (Holy Light) ↗', url: 'https://biblegeography.holylight.org.tw/index/introduction_list', embed: false }
      ]
    },
    {
      id: 'map',
      icon: '🗺️',
      nameZh: '地圖',
      nameEn: 'Map',
      links: [
        { label: 'Bible Maps (LDS)', url: 'https://www.churchofjesuschrist.org/study/scriptures/bible-maps/index?lang=yue', embed: true },
        { label: 'Bible Atlas (cnbible)', url: 'https://cnbible.com/atlas/a.htm', embed: true },
        { label: 'Bible Atlas (OpenBible)', url: 'https://www.openbible.info/geo/atlas/a', embed: true }
      ]
    },
    {
      id: 'bibleproject',
      icon: '📺',
      nameZh: 'BibleProject YouTube',
      nameEn: 'Video',
      links: [
        { label: 'Cantonese ↗', url: 'https://www.youtube.com/@BibleProjectCantonese', embed: false },
        { label: 'Mandarin ↗', url: 'https://www.youtube.com/@BibleProjectMandarinSimplified', embed: false },
        { label: 'English ↗', url: 'https://www.youtube.com/@bibleproject', embed: false }
      ]
    },
    {
      id: 'archaeology',
      icon: '🏛️',
      nameZh: '考古學',
      nameEn: 'Archaeology',
      links: [
        { label: 'Archaeology Intro', url: 'https://www.chineseapologetics.net/archaeology/book/main.htm', embed: true }
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
