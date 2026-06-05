// 為 default_simple_sort_fixed.html 添加錨點
// 這樣斷鏈頁面的鏈接就能正確跳轉到對應的行

const fs = require('fs');
const path = require('path');

function addAnchorsToSourceFile() {
    const sourceFile = 'default_simple_sort_fixed.html';
    const outputFile = 'default_simple_sort_fixed_with_anchors.html';
    
    try {
        console.log('🚀 開始為源文件添加錨點...');
        
        // 讀取源文件
        let content = fs.readFileSync(sourceFile, 'utf8');
        console.log(`✅ 成功讀取源文件: ${sourceFile}`);
        
        // 為每個表格行添加ID錨點
        let rowIndex = 0;
        content = content.replace(/<tr([^>]*)>/g, (match, attributes) => {
            rowIndex++;
            return `<tr id="row-${rowIndex}"${attributes}>`;
        });
        
        console.log(`✅ 為 ${rowIndex} 個表格行添加了錨點`);
        
        // 保存修改後的文件
        fs.writeFileSync(outputFile, content, 'utf8');
        console.log(`✅ 帶錨點的文件已保存: ${outputFile}`);
        
        return outputFile;
        
    } catch (error) {
        console.error(`❌ 處理失敗: ${error.message}`);
        return null;
    }
}

// 執行函數
if (require.main === module) {
    addAnchorsToSourceFile();
}

module.exports = { addAnchorsToSourceFile };
