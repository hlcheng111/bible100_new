/**
 * Automated TOC test: load tests/toc-test.html in JSDOM, run scripts, assert mini TOC exists.
 * Run from bible100_new: node tests/run-toc-jsdom.js
 * Requires: npm install jsdom
 */
var fs = require('fs');
var path = require('path');

var base = path.join(__dirname, '..');
var htmlPath = path.join(base, 'tests', 'toc-test.html');
var jsPath = path.join(base, 'js', 'toc-generator.js');

var html = fs.readFileSync(htmlPath, 'utf8');
var scriptContent = fs.readFileSync(jsPath, 'utf8');

try {
  var JSDOM = require('jsdom').JSDOM;
} catch (e) {
  console.error('Need jsdom. Run: npm init -y && npm install jsdom');
  process.exit(1);
}

var dom = new JSDOM(html, {
  runScripts: 'dangerously',
  resources: 'usable',
  url: 'file://' + path.join(base, 'tests', 'toc-test.html')
});

var window = dom.window;
var document = window.document;

var script = document.createElement('script');
script.textContent = scriptContent;
document.body.appendChild(script);

window.requestAnimationFrame = window.requestAnimationFrame || function (cb) { setTimeout(cb, 0); };
setTimeout(function () {
  var wrap = document.querySelector('.mini-toc-wrap');
  var items = document.querySelectorAll('.toc-item');
  var passEl = document.getElementById('toc-test-pass');

  var ok = (wrap && items.length >= 3) || (passEl && passEl.textContent === 'PASS');
  if (ok) {
    console.log('TOC test PASS: mini-toc-wrap present, ' + items.length + ' TOC items');
    process.exit(0);
  } else {
    console.error('TOC test FAIL: wrap=' + !!wrap + ' items=' + (items ? items.length : 0));
    process.exit(1);
  }
}, 100);
setTimeout(function () {
  console.error('TOC test TIMEOUT');
  process.exit(1);
}, 3000);
