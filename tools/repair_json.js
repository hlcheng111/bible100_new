const fs = require('fs');
const path = require('path');

const biblesDir = 'c:/Users/hlche/.cursor/bible100_new/data/bibles';

function repairFile(filename) {
    const p = path.join(biblesDir, filename);
    if (!fs.existsSync(p)) return;
    
    let content = fs.readFileSync(p, 'utf8');
    
    // Check if it's corrupted with literal \n
    if (content.startsWith('{\\n') || content.startsWith('[\\n')) {
        console.log(`正在修復 ${filename}...`);
        
        // This regex specifically targets formatting escapes like \n, \r, \t, and \" that were accidentally unparsed
        // But we must be very careful not to accidentally unescape actual text content.
        // Actually, if the entire file was just dumped with repr() or double-escaped without outer quotes:
        let repaired = content
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');
            
        try {
            JSON.parse(repaired);
            fs.writeFileSync(p, repaired, 'utf8');
            console.log(`✅ 修復成功: ${filename}`);
        } catch (e) {
            console.error(`❌ 解析失敗 ${filename}:`, e.message);
            // If simple replace failed, maybe it's missing the outer quotes?
            try {
                const parsed = JSON.parse('"' + content.replace(/"/g, '\\"') + '"');
                JSON.parse(parsed); // Double parse
                // If this works, it means it was a double-stringified JSON missing outer quotes.
                fs.writeFileSync(p, parsed, 'utf8');
                console.log(`✅ 用進階方法修復成功: ${filename}`);
            } catch (e2) {
                console.error(`❌ 進階修復也失敗:`, e2.message);
            }
        }
    } else {
        console.log(`⚡ 檔案看似正常: ${filename}`);
    }
}

['kjv.json', 'niv.json', '和合本.json', '信望愛(和合本).json'].forEach(repairFile);
