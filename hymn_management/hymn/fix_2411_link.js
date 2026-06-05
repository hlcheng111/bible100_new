// 修復2411鏈接的腳本
// 將錯誤的鏈接替換為正確的文件名

const fs = require('fs');
const path = require('path');

// 配置
const SOURCE_FILE = 'default_simple_sort_fixed.html';
const OUTPUT_FILE = 'default_simple_sort_fixed_FIXED_2411.html';

// 實際的文件名（從文件系統獲取）
const ACTUAL_2411_FILE = '2411  A City Radiant As A Bride  _Dudley-Smith, Timothy    623. 榮光之城彷彿新婦 .htm';
const ACTUAL_2411_PATH = `hymn_22/${ACTUAL_2411_FILE}`;

function fix2411Link() {
    try {
        console.log('🚀 開始修復2411鏈接...');
        
        // 讀取源文件
        let content = fs.readFileSync(SOURCE_FILE, 'utf8');
        console.log(`✅ 成功讀取源文件: ${SOURCE_FILE}`);
        
        // 查找2411的鏈接（更寬鬆的匹配）
        const oldLinkPattern = /hymn_22\/2411[^"]*\.htm/g;
        
        // 替換為正確的文件名
        const newLink = ACTUAL_2411_PATH;
        
        // 進行替換
        const beforeReplace = content;
        content = content.replace(oldLinkPattern, newLink);
        
        // 檢查是否進行了替換
        if (content !== beforeReplace) {
            console.log('✅ 成功修復2411鏈接');
            
            // 保存修復後的文件
            fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
            console.log(`✅ 修復後的文件已保存: ${OUTPUT_FILE}`);
            
            return true;
        } else {
            console.log('ℹ️ 沒有找到需要修復的2411鏈接');
            return false;
        }
        
    } catch (error) {
        console.error(`❌ 修復失敗: ${error.message}`);
        return false;
    }
}

// 執行修復
if (require.main === module) {
    fix2411Link();
}

module.exports = { fix2411Link };
