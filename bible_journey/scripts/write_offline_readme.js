#!/usr/bin/env node
/** 寫入 dist 封測溫馨提示（ZIP · 中／英／越／印尼） */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, '..', 'dist');
const version = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')).version;

const body = `聖經跑道 / Bible Journey · 離線試用包 v${version}
============================================================

【繁體中文】怎麼打開試用
1. 解壓縮「整個資料夾」（不要只複製 index.html）
2. 用 Chrome 或 Edge 開啟資料夾裡的 index.html
   （可雙擊；若白畫面：右鍵 → 開啟方式 → Chrome）
3. 頂欄可切換 中 / EN / VI / ID 語言
4. 建議路徑：首頁「開始今天」→ 或 ≡「想換一條路線」先開選單再讀
5. 讀完可打卡；≡ 裡有「想問的話／本週回顧」
6. 完全離線可讀經與打卡；若點外部助手，需自行連網

【Android 手機／平板】
- 把 ZIP 傳到手機 → 解壓 → 用 Chrome 開啟 index.html
- iPhone／iPad：此 ZIP 常白屏，請改用 HTTPS 測試網址（PWA）

【回報】請回覆：國家／語言、裝置、卡住步驟、痛點或 wishlist


------------------------------------------------------------
【English】How to open & try
1. Unzip the WHOLE folder (do not copy only index.html)
2. Open index.html with Chrome or Edge
3. Use the top bar to switch 中 / EN / VI / ID
4. Suggested path: Home → Start today, or ≡ → pick a track list first
5. After reading, check in; ≡ has Ask / This week’s review
6. Reading works offline; external AI needs your own internet

【Android phone / tablet】
- Transfer ZIP → unzip → open index.html in Chrome
- iPhone / iPad: this ZIP often fails — use an HTTPS test link (PWA) instead

【Feedback】Country/language, device, where you got stuck, pain points / wishlist


------------------------------------------------------------
【Tiếng Việt】Cách mở để dùng thử
1. Giải nén CẢ thư mục (đừng chỉ copy file index.html)
2. Mở index.html bằng Chrome hoặc Edge
3. Đổi ngôn ngữ 中 / EN / VI / ID trên thanh trên
4. Gợi ý: Trang chủ → Bắt đầu hôm nay, hoặc ≡ → chọn lộ trình (danh sách trước)
5. Sau khi đọc có thể check-in; trong ≡ có Hỏi đáp / Nhìn lại tuần
6. Đọc ngoại tuyến được; trợ lý ngoài cần có mạng

【Android】Gửi ZIP → giải nén → mở index.html bằng Chrome
【iPhone】ZIP dễ lỗi — dùng link HTTPS (PWA)

【Phản hồi】Quốc gia/ngôn ngữ, thiết bị, chỗ bị kẹt, điểm đau / wishlist


------------------------------------------------------------
【Bahasa Indonesia】Cara membuka & mencoba
1. Ekstrak SELURUH folder (jangan hanya salin index.html)
2. Buka index.html dengan Chrome atau Edge
3. Ganti bahasa 中 / EN / VI / ID di bilah atas
4. Saran: Beranda → Mulai hari ini, atau ≡ → pilih jalur (lihat daftar dulu)
5. Setelah baca, check-in; di ≡ ada Tanya / Tinjauan minggu
6. Baca bisa offline; asisten luar perlu internet sendiri

【Android】Kirim ZIP → ekstrak → buka index.html di Chrome
【iPhone】ZIP sering gagal — gunakan tautan HTTPS (PWA)

【Masukan】Negara/bahasa, perangkat, langkah yang macet, pain point / wishlist
`;

if (!fs.existsSync(dist)) {
  console.error('dist/ not found — run npm run build first');
  process.exit(1);
}

const mainName = '請先看我_HOW_TO_OPEN_4LANG.txt';
fs.writeFileSync(path.join(dist, mainName), body, 'utf8');
fs.writeFileSync(path.join(dist, '請先看我.txt'), body, 'utf8');
fs.writeFileSync(path.join(dist, 'README_OFFLINE.txt'), body, 'utf8');
console.log(`OK wrote dist/${mainName} (+ 請先看我.txt, README_OFFLINE.txt)`);
