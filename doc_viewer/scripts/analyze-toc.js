const fs = require('fs');
const html = fs.readFileSync('hymnology_practical/hyH00《 實用聖詩學 》(鄭翰龍)  V.11  (2023) v2.htm', 'utf8');
const anchors = new Set();
const re = /name=["']([^"']+)["']/gi;
let m;
while ((m = re.exec(html)) !== null) {
  anchors.add(m[1]);
}
const arr = Array.from(anchors);
const toc195 = arr.filter(a => a.startsWith('_Toc195')).length;
const toc984 = arr.filter(a => a.startsWith('_Toc984')).length;
const h01 = arr.filter(a => a.includes('H01') || a.includes('_H01')).length;
console.log('_Toc195 count:', toc195);
console.log('_Toc984 count:', toc984);
console.log('H01-related:', h01);
console.log('Sample _Toc984:', arr.filter(a => a.startsWith('_Toc984')).slice(0,8));
console.log('Sample _H01:', arr.filter(a => a.includes('H01')).slice(0,5));
