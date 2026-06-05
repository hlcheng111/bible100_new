/**
 * 聖經地理歷史 - 連結配置
 * 統一編輯：在此檔案增減類別與連結，geography_history.html 會自動渲染
 * 未來可擴充為多個 Editor 共用此格式
 */
window.GEOGRAPHY_HISTORY_DATA = {
  categories: [
    {
      id: 'timeline',
      name: '📅 時間軸 Timeline',
      links: [
        { name: '聖經書卷時間軸', url: 'https://bibleeveryone.com/bible-timeline.php' },
        { name: 'Bible Timeline', url: 'https://cnbible.com/timeline/' }
      ]
    },
    {
      id: 'place',
      name: '📍 地理地名 Place',
      links: [
        { name: '聖經地名簡介', url: 'https://biblegeography.holylight.org.tw/index/condensedbible_list' },
        { name: '聖地列表查詢', url: 'https://biblegeography.holylight.org.tw/index/list_queries' },
        { name: '聖經地理概論', url: 'https://biblegeography.holylight.org.tw/index/introduction_list?type_id=all' }
      ]
    },
    {
      id: 'map',
      name: '🗺️ 地圖 Map',
      links: [
        { name: '聖經地圖索引', url: 'https://www.churchofjesuschrist.org/study/scriptures/bible-maps/index?lang=yue' },
        { name: 'Atlas', url: 'https://cnbible.com/atlas/a.htm' },
        { name: 'Bible Mapper Atlas', url: 'https://biblemapper.com/blog/chronolist/' },
        { name: 'Bible Atlas (OpenBible)', url: 'https://www.openbible.info/geo/atlas/a' }
      ]
    },
    {
      id: 'bibleproject',
      name: '📺 BibleProject YouTube',
      links: [
        { name: '粵語 Cantonese', url: 'https://www.youtube.com/@BibleProjectCantonese' },
        { name: '普通話 Mandarin', url: 'https://www.youtube.com/@BibleProjectMandarinSimplified' },
        { name: 'English', url: 'https://www.youtube.com/@bibleproject' },
        { name: '越南語 Tiếng Việt', url: 'https://www.youtube.com/@BibleProjectVietnamese' },
        { name: '印尼語 Bahasa Indonesia', url: 'https://www.youtube.com/@BibleProjectIndonesian' },
        { name: '緬甸語 ဗမာ', url: 'https://www.youtube.com/@BibleProjectBurmese' }
      ]
    },
    {
      id: 'archaeology',
      name: '🏛️ 考古學 Archaeology',
      links: [
        { name: '《聖經考古學導論》張逸萍', url: 'https://www.chineseapologetics.net/archaeology/book/main.htm' },
        { name: '聖經考古 - 陳崇基牧師', url: 'https://www.youtube.com/@marksir7' },
        { name: '小璟聊考古', url: 'https://www.youtube.com/watch?v=q7-fg7jjdGA&list=PLr2i6FIhRWWTAvX20BOpVE-oP6Z-BTIou' },
        { name: '【考古新知】以斯拉培訓網絡', url: 'https://www.youtube.com/watch?v=XAEjwQ8R9kQ&list=PLeItXR-tiU6xSPSZAYyCuIrzdRwCRLGnp' }
      ]
    },
    {
      id: 'local',
      name: '📅 本站時間軸',
      links: [
        { name: '歷史時間軸', url: '../timeline_viewer.html', local: true }
      ]
    }
  ]
};
