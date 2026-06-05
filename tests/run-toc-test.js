/**
 * Automated TOC test: parse JS for syntax errors and verify required files exist.
 * For full DOM test, open tests/toc-test.html in a browser.
 */
var fs = require('fs');
var path = require('path');

var root = path.join(__dirname, '..');
var errors = [];

// 1. Required files exist
var files = [
  'js/toc-generator.js',
  'js/toc-styles.css',
  'languages/cn/js/toc-generator.js',
  'languages/cn/js/toc-styles.css',
  'languages/en/js/toc-generator.js',
  'languages/en/js/toc-styles.css',
  'languages/js/toc-generator.js',
  'languages/js/toc-styles.css',
  'tests/toc-test.html'
];
files.forEach(function (f) {
  var p = path.join(root, f);
  if (!fs.existsSync(p)) {
    errors.push('Missing: ' + f);
  }
});

// 2. toc-generator.js is valid JavaScript (parse only)
var mainScript = path.join(root, 'js/toc-generator.js');
try {
  var code = fs.readFileSync(mainScript, 'utf8');
  new Function(code);
} catch (e) {
  errors.push('js/toc-generator.js parse error: ' + e.message);
}

if (errors.length) {
  console.error('TOC tests failed:');
  errors.forEach(function (e) { console.error('  ' + e); });
  process.exit(1);
}
console.log('TOC automated checks passed (files exist, JS valid).');
console.log('For full DOM test, open tests/toc-test.html in a browser.');
