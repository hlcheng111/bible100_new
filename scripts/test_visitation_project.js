/**
 * 自動驗證「探訪事工」Phase 1 產物：工作桌 HTML、專案計劃書、關鍵腳本可解析。
 * 執行：node scripts/test_visitation_project.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const desk = path.join(root, 'church_ministry', 'modules', 'support', 'visitation_index.html');
const planMd = path.join(root, 'church_ministry', 'projects', 'visitation_ministry', '整改工程計劃書.md');
const projectIndex = path.join(root, 'church_ministry', 'projects', 'visitation_ministry', 'index.html');
const sidebar = path.join(root, 'church_ministry', 'sidebar.html');
const landing = path.join(root, 'languages', 'landing_new_cn.html');
const indexCn = path.join(root, 'languages', 'index_cn.html');

function fail(msg) {
  console.error('[FAIL]', msg);
  process.exit(1);
}

function ok(msg) {
  console.log('[OK]', msg);
}

function assertFile(p, label) {
  if (!fs.existsSync(p)) fail('缺少檔案：' + label + ' → ' + p);
  ok('檔案存在：' + label);
}

assertFile(desk, 'visitation_index.html');
assertFile(planMd, '整改工程計劃書.md');
assertFile(projectIndex, '專案 index.html');

const html = fs.readFileSync(desk, 'utf8');
const markers = [
  ['STORAGE_KEY', 'visitation_demo_list_v1'],
  ['visitTable', 'id="visitTable"'],
  ['visitForm', 'id="visitForm"'],
  ['title', '牧養探訪工作桌'],
  ['計劃書連結', '整改工程計劃書.md'],
];
markers.forEach(function (m) {
  if (!html.includes(m[1])) fail('工作桌 HTML 缺少標記：' + m[0]);
  ok('工作桌 HTML 含：' + m[0]);
});

const scriptMatch = html.match(/<script>\s*([\s\S]*?)<\/script>/);
if (!scriptMatch) fail('工作桌缺少 <script> 區塊');
try {
  new Function(scriptMatch[1]);
  ok('內嵌腳本語法可解析（new Function）');
} catch (e) {
  fail('內嵌腳本語法錯誤：' + e.message);
}

const plan = fs.readFileSync(planMd, 'utf8');
if (!plan.includes('已定決議事項')) fail('計劃書應含「已定決議事項」');
if (!plan.includes('Phase 1')) fail('計劃書應含 Phase 分階段說明');
ok('計劃書內容結構就緒');

const sb = fs.readFileSync(sidebar, 'utf8');
if (!sb.includes('visitation_index.html')) fail('sidebar 應連結 visitation_index.html');
if (!sb.includes('visitation_ministry/index.html')) fail('sidebar 應連結探訪事工專案');
ok('church_ministry/sidebar.html 已掛載入口');

const land = fs.readFileSync(landing, 'utf8');
if (!land.includes('visitation_ministry/index.html')) fail('landing_new_cn 應含探訪事工專案連結');
if (!land.includes('visitation_index.html')) fail('landing_new_cn 應含探訪工作桌連結');
ok('languages/landing_new_cn.html 已掛載入口');

const icn = fs.readFileSync(indexCn, 'utf8');
if (!icn.includes('visitation_ministry/index.html')) fail('index_cn 應含探訪事工專案連結');
if (!icn.includes('visitation_index.html')) fail('index_cn 應含探訪工作桌連結');
ok('languages/index_cn.html 教會事工區已掛載入口');

console.log('');
console.log('探訪事工 Phase 1 自動驗證全部通過。');
