// 手動修復2411鏈接的JavaScript代碼
function fix2411Link() {
    console.log('開始修復2411鏈接...');
    
    // 原始的有問題的鏈接
    const originalLink = "hymn_22/2411%20%20A%20City%20Radiant%20As%20A%20Bride%20%20_Dudley-Smith,%20Timothy%20%20%20%20623.&#27054;&#20809;&#20043;&#22478;&#24439;&#24447;&#26032;&#23142;.htm";
    
    // 修復後的鏈接
    const fixedLink = "hymn_22/2411  A City Radiant As A Bride  _Dudley-Smith, Timothy    623.榮光之城彷彿新婦.htm";
    
    // 查找所有包含2411的鏈接
    const links = document.querySelectorAll('a[href*="2411"]');
    console.log(`找到 ${links.length} 個2411鏈接`);
    
    let fixedCount = 0;
    links.forEach((link, index) => {
        const href = link.getAttribute('href');
        console.log(`鏈接 ${index + 1}:`, href);
        
        // 檢查是否包含City Radiant
        if (href && href.includes('City') && href.includes('Radiant')) {
            // 替換鏈接
            link.setAttribute('href', fixedLink);
            console.log(`已修復鏈接 ${index + 1}:`, fixedLink);
            fixedCount++;
        }
    });
    
    console.log(`總共修復了 ${fixedCount} 個2411鏈接`);
    return fixedCount;
}

// 如果是在iframe中，向父窗口發送消息
if (window.parent !== window) {
    // 執行修復
    const fixedCount = fix2411Link();
    
    // 通知父窗口修復完成
    window.parent.postMessage({
        type: 'linkFixed',
        count: fixedCount,
        message: `已修復 ${fixedCount} 個2411鏈接`
    }, '*');
} else {
    // 直接執行修復
    fix2411Link();
}

console.log('2411鏈接修復腳本已載入');



























