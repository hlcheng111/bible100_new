/**
 * 簡化版BIG5解碼器
 * 專門處理聖詩HTML文件的BIG5編碼問題
 */

class SimpleBIG5Decoder {
  constructor() {
    this.encodingMap = new Map();
    this.initEncodingMap();
  }

  /**
   * 初始化編碼映射表
   */
  initEncodingMap() {
    // 聖詩相關的BIG5編碼映射
    const mappings = {
      // 詩集名稱
      '': '世紀頌讚',
      '': '普頌新', 
      '': '頌主新歌',
      '': '新編讚美詩',
      'Hymns of the Faith': 'Hymns of the Faith',
      
      // 分類符號
      '': '▲',
      '': '●',
      '': '◆', 
      '': '★',
      
      // 常用聖詩詞彙
      '': '聖詩',
      '': '頌讚',
      '': '讚美',
      '': '敬拜',
      '': '禱告',
      '': '感恩',
      '': '榮耀',
      '': '平安',
      '': '喜樂',
      '': '恩典',
      '': '主愛',
      '': '耶穌',
      '': '基督',
      '': '聖靈',
      '': '天父',
      '': '救主',
      '': '牧者',
      '': '君王',
      '': '救贖',
      '': '復活',
      '': '聖誕',
      '': '復活節',
      '': '三一頌',
      '': '主禱文',
      '': '敬拜短歌',
      '': '民族聖詩',
      '': '華人詩歌',
      '': '世界名詩',
      
      // 表格標題
      '': '編號',
      '': '中文歌名',
      '': '英文歌名',
      '': '調性',
      '': '拍子',
      '': '作者',
      '': '作曲',
      '': '作詞',
      
      // 導航文字
      '': '首頁',
      '': '上一頁',
      '': '下一頁',
      '': '返回',
      '': '結束'
    };

    // 建立映射表
    for (const [big5, utf8] of Object.entries(mappings)) {
      this.encodingMap.set(big5, utf8);
    }
  }

  /**
   * 解碼文本
   * @param {string} text - 待解碼的文本
   * @returns {string} 解碼後的文本
   */
  decode(text) {
    if (!text) return '';
    
    let decodedText = text;
    
    // 應用映射表
    for (const [big5, utf8] of this.encodingMap) {
      decodedText = decodedText.replace(new RegExp(big5, 'g'), utf8);
    }
    
    // 處理特殊情況
    decodedText = this.handleSpecialCases(decodedText);
    
    return decodedText;
  }

  /**
   * 處理特殊情況
   * @param {string} text - 待處理的文本
   * @returns {string} 處理後的文本
   */
  handleSpecialCases(text) {
    // 處理重複字符問題
    text = text.replace(/(.)\1{10,}/g, '$1'); // 移除重複10次以上的字符
    
    // 處理常見的BIG5亂碼模式
    const patterns = [
      // 處理常見的亂碼模式
      { pattern: /[^\x00-\x7F\u4e00-\u9fff]/g, replacement: '' }, // 移除非ASCII和非中文字符
      { pattern: /\s+/g, replacement: ' ' }, // 合併多個空格
      { pattern: /^\s+|\s+$/g, replacement: '' } // 移除首尾空格
    ];

    patterns.forEach(({ pattern, replacement }) => {
      text = text.replace(pattern, replacement);
    });

    return text;
  }

  /**
   * 測試解碼功能
   * @param {string} testText - 測試文本
   * @returns {Object} 測試結果
   */
  testDecoding(testText) {
    const result = {
      original: testText,
      decoded: this.decode(testText),
      success: false,
      hasChanges: false
    };

    result.hasChanges = result.decoded !== result.original;
    result.success = result.hasChanges && result.decoded.length > 0;

    return result;
  }

  /**
   * 批量解碼HTML內容
   * @param {string} htmlContent - HTML內容
   * @returns {string} 解碼後的HTML內容
   */
  decodeHTML(htmlContent) {
    if (!htmlContent) return '';

    let decodedHTML = htmlContent;

    // 解碼整個HTML內容
    decodedHTML = this.decode(decodedHTML);

    // 特別處理HTML標籤中的文本
    decodedHTML = this.decodeHTMLText(decodedHTML);

    return decodedHTML;
  }

  /**
   * 解碼HTML標籤中的文本
   * @param {string} html - HTML內容
   * @returns {string} 解碼後的HTML
   */
  decodeHTMLText(html) {
    // 處理title標籤
    html = html.replace(/<title>(.*?)<\/title>/gi, (match, title) => {
      return `<title>${this.decode(title)}</title>`;
    });

    // 處理a標籤的文本
    html = html.replace(/<a[^>]*>(.*?)<\/a>/gi, (match, text) => {
      return match.replace(text, this.decode(text));
    });

    // 處理td標籤的文本
    html = html.replace(/<td[^>]*>(.*?)<\/td>/gi, (match, text) => {
      return match.replace(text, this.decode(text));
    });

    // 處理span標籤的文本
    html = html.replace(/<span[^>]*>(.*?)<\/span>/gi, (match, text) => {
      return match.replace(text, this.decode(text));
    });

    return html;
  }
}

// 導出類
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SimpleBIG5Decoder;
} else {
  window.SimpleBIG5Decoder = SimpleBIG5Decoder;
}



























