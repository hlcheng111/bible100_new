/**
 * 聖經地理歷史 · 連結 SSOT
 * label = 側欄顯示（英簡）；embed:false = 不進側欄 iframe（如 YouTube）
 * sidebar:false = 整類不顯示於側欄（仍可在 landing 頁保留）
 * 2026-08-08：已 HTTP 探測；移除 Bible Mapper（空載）、YouTube／超時站（不可 iframe）
 */
window.GEOGRAPHY_HISTORY_DATA = {
  categories: [
    {
      id: 'timeline',
      name: 'Timeline',
      links: [
        { label: 'Bible Timeline (共享)', url: 'https://bibleeveryone.com/bible-timeline.php', embed: true },
        { label: 'Bible Timeline (cnbible)', url: 'https://cnbible.com/timeline/', embed: true }
      ]
    },
    {
      id: 'place',
      name: 'Place',
      links: [
        { label: 'Place Index (Holy Light)', url: 'https://biblegeography.holylight.org.tw/index/condensedbible_list', embed: true },
        { label: 'Place Search (Holy Light)', url: 'https://biblegeography.holylight.org.tw/index/list_queries', embed: true },
        { label: 'Geo Intro (Holy Light)', url: 'https://biblegeography.holylight.org.tw/index/introduction_list', embed: true, note: '若 iframe 404 请用新分页开启（部分路径禁止嵌入）' }
      ]
    },
    {
      id: 'map',
      name: 'Map',
      links: [
        { label: 'Bible Maps (LDS)', url: 'https://www.churchofjesuschrist.org/study/scriptures/bible-maps/index?lang=yue', embed: true },
        { label: 'Bible Atlas (cnbible)', url: 'https://cnbible.com/atlas/a.htm', embed: true },
        { label: 'Bible Atlas (OpenBible)', url: 'https://www.openbible.info/geo/atlas/a', embed: true }
      ]
    },
    {
      id: 'local',
      name: 'Local',
      links: [
        { label: 'Site Timeline', url: 'timeline_viewer.html', local: true }
      ]
    },
    {
      id: 'bibleproject',
      name: 'BibleProject',
      sidebar: false,
      links: [
        { label: 'Cantonese', url: 'https://www.youtube.com/@BibleProjectCantonese', embed: false },
        { label: 'Mandarin', url: 'https://www.youtube.com/@BibleProjectMandarinSimplified', embed: false },
        { label: 'English', url: 'https://www.youtube.com/@bibleproject', embed: false }
      ]
    },
    {
      id: 'archaeology',
      name: 'Archaeology',
      sidebar: false,
      links: [
        { label: 'Archaeology Intro (offline)', url: 'https://www.chineseapologetics.net/archaeology/book/main.htm', embed: false }
      ]
    }
  ]
};
