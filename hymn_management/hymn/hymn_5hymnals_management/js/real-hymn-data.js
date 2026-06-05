/**
 * 真實聖詩數據 - 直接從 default_simple_sort_fixed.html 提取
 * 包含完整的超連結和真實歌名
 */

const REAL_HYMN_DATA = {
  // 從HTML表格中提取的真實聖詩數據，包含超連結
  hymns: [
    {
      number: '1282',
      title_zh: '我父是万有',
      title_en: 'A Child Of The King',
      author: 'Buell, Hattie',
      category: 'world_famous',
      symbol: '▲',
      link: 'hymn_00/LX1282%20%20%20%20A%20Child%20Of%20The%20King%20%20_Buell%20%20%20532&#25105;&#29238;&#26159;&#19975;&#26377;.htm'
    },
    {
      number: '2411',
      title_zh: '榮光之城彷如新婦',
      title_en: 'A City Radiant As A Bride',
      author: 'Dudley-Smith, Timothy',
      category: 'chinese',
      symbol: '●',
      link: 'hymn_22/2411%20%20A%20City%20Radiant%20As%20A%20Bride%20%20_Dudley-Smith,%20Timothy%20%20%20%20623.&#27054;&#20809;&#20043;&#22478;&#24439;&#24447;&#26032;&#23142;.htm'
    },
    {
      number: '2506',
      title_zh: '內省修身主前靜默',
      title_en: 'A Gain We Keep This Solemn Fast',
      author: 'Gregory I, Pope',
      category: 'ethnic',
      symbol: '★',
      link: 'hymn_22/2506%20%20A%20Gain%20We%20Keep%20This%20Solemn%20Fast%20%20_Gregory%20the%20Great%20%20208.&#20839;&#30465;&#20462;&#36523;&#20027;&#21069;&#38748;&#40664;.htm'
    },
    {
      number: '1283',
      title_zh: '燦爛經卷',
      title_en: 'A Glory Gilds The Sacred Page',
      author: 'Cowper, William',
      category: 'world_famous',
      symbol: '▲',
      link: 'hymn_00/LX1283%20%20%20%20A%20Glory%20Gilds%20The%20Sacred%20Page%20%20_Cowper%20%20%20240&#28799;&#28866;&#32463;&#21367;.htm'
    },
    {
      number: '1284',
      title_zh: '新生聖嬰',
      title_en: 'A Great And Mighty Wonder',
      author: 'Germanus I, Saint',
      category: 'world_famous',
      symbol: '▲',
      link: 'hymn_00/LX1284%20%20%20%20A%20Great%20And%20Mighty%20Wonder_Germanus,%20%20-ES%20IST%20EIN%20ROS%20%20096&#26032;&#29983;&#22307;&#23156;.htm'
    },
    {
      number: '0208',
      title_zh: '高唱榮耀之歌',
      title_en: 'A Hymn of Glory Let Us Sing!',
      author: 'Bede, Saint',
      category: 'world_famous',
      symbol: '▲',
      link: 'hymn_00/0208%200258%20A%20Hymn%20of%20Glory%20Let%20Us%20Sing!%20&#39640;&#21809;&#27054;&#32768;&#20043;&#27468;%20%20%20DEO%20GRACIAS.htm'
    },
    {
      number: '1499',
      title_zh: '歡欣向主稱頌',
      title_en: 'A Hymn of Joy We Sing',
      author: 'Traditional',
      category: 'chinese',
      symbol: '●',
      link: 'hymn_00/1499%20GP392%20A%20Hymn%20of%20Joy%20We%20Sing%20%20&#27426;&#27427;&#21521;&#20027;&#31216;&#39042;.htm'
    },
    {
      number: '1431',
      title_zh: '昨日，今日，到永遠',
      title_en: 'YESTERDAY TODAY FOREVER',
      author: 'A B.Simpson',
      category: 'worship',
      symbol: '◆',
      link: 'hymn_00/1431%20YESTERDAY%20TOAY%20FOREVER%20&#26152;&#26085;&#65292;&#20170;&#26085;&#65292;&#21040;&#27704;&#36960;%20(A%20B.Simpson).htm'
    },
    {
      number: '1206',
      title_zh: '切莫順從誘惑',
      title_en: 'Yield Not to Temptation',
      author: 'Palmer, Horatio R.',
      category: 'world_famous',
      symbol: '▲',
      link: 'hymn_00/1206%20Yield%20Not%20to%20Temptation%20&#20999;&#33707;&#38918;&#24478;&#35480;&#24785;.htm'
    },
    {
      number: '1185',
      title_zh: 'You Are Mine',
      title_en: 'You Are Mine',
      author: 'Haas, David',
      category: 'worship',
      symbol: '◆',
      link: 'hymn_00/1185%20You%20Are%20Mine%20%20_David%20Haas%20%20SE%20Samonte.htm'
    },
    {
      number: '1186',
      title_zh: '祢是我一切',
      title_en: 'You are My All in All',
      author: 'Traditional',
      category: 'chinese',
      symbol: '●',
      link: 'hymn_00/1186%20You%20are%20My%20All%20in%20Al%20%20%20&#31074;&#26159;&#25105;&#19968;&#20999;l.htm'
    }
  ],

  // 詩集統計
  hymnalStats: {
    all: { count: 3195, name: '全部詩集' },
    century_praise: { count: 573, name: '世紀頌讚' },
    universal_praise: { count: 1122, name: '普頌新' },
    lord_new_songs: { count: 400, name: '頌主新歌' },
    new_hymnal: { count: 600, name: '新編讚美詩' },
    hymns_faith: { count: 500, name: 'Hymns of the Faith' }
  },

  // 分類統計
  categoryStats: {
    world_famous: { count: 250, name: '世界250名聖詩', symbol: '▲' },
    chinese: { count: 800, name: '華人詩歌', symbol: '●' },
    worship: { count: 600, name: '敬拜短歌', symbol: '◆' },
    ethnic: { count: 200, name: '民族聖詩', symbol: '★' }
  }
};

// 導出數據
if (typeof module !== 'undefined' && module.exports) {
  module.exports = REAL_HYMN_DATA;
} else {
  window.REAL_HYMN_DATA = REAL_HYMN_DATA;
}