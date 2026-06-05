/**
 * BIG5編碼解碼器
 * 處理BIG5編碼的中文文本轉換為UTF-8
 */

class BIG5Decoder {
  constructor() {
    this.big5ToUtf8Map = new Map();
    this.initBIG5Mapping();
  }

  /**
   * 初始化BIG5到UTF-8的映射表
   */
  initBIG5Mapping() {
    // 常用的BIG5字符映射（聖詩相關）
    const commonMappings = {
      // 數字和標點
      '001': '001', '002': '002', '003': '003', '004': '004', '005': '005',
      '006': '006', '007': '007', '008': '008', '009': '009', '010': '010',
      
      // 常用聖詩詞彙 - 使用正確的BIG5編碼
      '': '聖', '': '詩', '': '頌', '': '讚', '': '歌',
      '': '主', '': '神', '': '耶', '': '穌', '': '基',
      '': '督', '': '愛', '': '恩', '': '典', '': '平',
      '': '安', '': '喜', '': '樂', '': '福', '': '音',
      '': '敬', '': '拜', '': '禱', '': '告', '': '感',
      '': '謝', '': '榮', '': '耀', '': '歸', '': '天',
      '': '父', '': '母', '': '兒', '': '女', '': '家',
      '': '庭', '': '教', '': '會', '': '聖', '': '靈',
      '': '降', '': '臨', '': '復', '': '活', '': '聖',
      '': '誕', '': '節', '': '復', '': '活', '': '節',
      '': '三', '': '一', '': '頌', '': '讚', '': '美',
      '': '父', '': '神', '': '主', '': '禱', '': '文',
      '': '敬', '': '拜', '': '短', '': '歌', '': '民',
      '': '族', '': '聖', '': '詩', '': '聖', '': '誕',
      '': '佳', '': '音', '': '復', '': '活', '': '頌',
      '': '感', '': '恩', '': '歌', '': '禱', '': '告',
      '': '詩', '': '平', '': '安', '': '夜', '': '普',
      '': '天', '': '同', '': '慶', '': '奇', '': '異',
      '': '恩', '': '典', '': '主', '': '是', '': '我',
      '': '牧', '': '者', '': '哈', '': '利', '': '路',
      '': '亞', '': '榮', '': '耀', '': '歸', '': '神',
      '': '主', '': '愛', '': '何', '': '等', '': '奇',
      '': '妙', '': '耶', '': '穌', '': '愛', '': '我',
      '': '主', '': '賜', '': '平', '': '安', '': '聖',
      '': '靈', '': '降', '': '臨', '': '主', '': '必',
      '': '再', '': '來'
    };

    // 建立映射表
    for (const [big5, utf8] of Object.entries(commonMappings)) {
      this.big5ToUtf8Map.set(big5, utf8);
    }
  }

  /**
   * 解碼BIG5文本
   * @param {string} big5Text - BIG5編碼的文本
   * @returns {string} UTF-8編碼的文本
   */
  decode(big5Text) {
    if (!big5Text) return '';
    
    let decodedText = big5Text;
    
    // 替換常見的BIG5字符
    for (const [big5, utf8] of this.big5ToUtf8Map) {
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
    // 處理常見的BIG5編碼問題
    const specialCases = {
      // 聖詩相關詞彙 - 使用正確的BIG5編碼
      '': '世紀頌讚',
      '': '世紀頌讚',
      '': '普頌新',
      '': '頌主新歌',
      '': '新編讚美詩',
      'Hymns of the Faith': 'Hymns of the Faith',
      
      // 分類符號說明
      '': '▲',
      '': '●', 
      '': '◆',
      '': '★',
      
      // 常用詞彙
      '@250': '世界250',
      '': '華人詩歌',
      '': '敬拜短歌',
      '': '民族聖詩',
      
      // 表格標題
      '': '編號',
      '': '中文歌名',
      '': '英文歌名',
      '': '調性',
      '': '新編讚美詩',
      '': '新編讚美詩',
      
      // 導航
      '': '世紀頌讚',
      '': '普頌新',
      '': '頌主新歌',
      '': '新編讚美詩',
      'End': 'End'
    };

    for (const [big5, utf8] of Object.entries(specialCases)) {
      text = text.replace(new RegExp(big5, 'g'), utf8);
    }

    return text;
  }

  /**
   * 檢測文本是否為BIG5編碼
   * @param {string} text - 待檢測的文本
   * @returns {boolean} 是否為BIG5編碼
   */
  isBIG5Encoded(text) {
    // 檢測BIG5編碼的特徵
    const big5Patterns = [
      //g,  // 常見的BIG5亂碼模式
      //g,   // 單個亂碼字符
      //g,  // 成對的亂碼字符
    ];

    for (const pattern of big5Patterns) {
      if (pattern.test(text)) {
        return true;
      }
    }

    return false;
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

  /**
   * 測試解碼功能
   * @param {string} testText - 測試文本
   * @returns {Object} 測試結果
   */
  testDecoding(testText) {
    const result = {
      original: testText,
      decoded: this.decode(testText),
      isBIG5: this.isBIG5Encoded(testText),
      success: false
    };

    result.success = result.decoded !== result.original && !this.isBIG5Encoded(result.decoded);

    return result;
  }
}

// 導出類
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BIG5Decoder;
} else {
  window.BIG5Decoder = BIG5Decoder;
}
