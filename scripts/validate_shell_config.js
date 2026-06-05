#!/usr/bin/env node
/** Validate shell config + index_v5.html config-driven nav. */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
let failed = 0;

function fail(msg) {
  console.error('FAIL:', msg);
  failed++;
}

function ok(msg) {
  console.log('OK:', msg);
}

['modes.json', 'modules.json'].forEach(function (name) {
  const p = path.join(root, 'config', name);
  try {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (name === 'modes.json') {
      if (!Array.isArray(data.modes) || !data.modes.length) fail('modes.json: modes[] empty');
      else {
        const ids = data.modes.map(function (m) { return m.id; });
        const required = ['material', 'study', 'qna', 'church', 'school', 'ai'];
        required.forEach(function (id) {
          if (ids.indexOf(id) < 0) fail('modes.json missing mode: ' + id);
        });
        ok('modes.json parse (' + data.modes.length + ' modes)');
      }
    }
    if (name === 'modules.json') {
      if (!Array.isArray(data.modules) || !data.modules.length) fail('modules.json: modules[] empty');
      else ok('modules.json parse (' + data.modules.length + ' modules)');
    }
  } catch (e) {
    fail(name + ' parse: ' + e.message);
  }
});

const htmlPath = path.join(root, 'index_v5.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const legacyPatterns = [
  /selectedMode\s*===\s*['"]study['"]/,
  /selectedMode\s*===\s*['"]church['"]/,
  /selectedMode\s*===\s*['"]school['"]/,
  /selectedMode\s*===\s*['"]ai['"]/,
  /selectedMode\s*===\s*['"]qna['"]/,
  /var\s+langMap\s*=/,
  /if\s*\(\s*mode\s*===\s*['"]study['"]\s*\)/,
  /else\s+if\s*\(\s*mode\s*===\s*['"]church['"]\s*\)/,
  /else\s+if\s*\(\s*mode\s*===\s*['"]school['"]\s*\)/,
  /else\s+if\s*\(\s*mode\s*===\s*['"]ai['"]\s*\)/
];

legacyPatterns.forEach(function (re) {
  if (re.test(html)) fail('index_v5.html legacy pattern: ' + re);
});

if (!html.includes('modeButtonsHost')) fail('index_v5.html missing modeButtonsHost');
if (!html.includes('Bible100Shell.loadMode')) fail('index_v5.html missing Bible100Shell.loadMode');
if (!html.includes('renderModeButtonsFromConfig')) fail('index_v5.html missing renderModeButtonsFromConfig');
if (!html.includes('loadSecondaryNavItem')) fail('index_v5.html missing loadSecondaryNavItem delegation');

if (!failed) ok('index_v5.html no legacy secondary-nav / applyMode branches');

process.exit(failed ? 1 : 0);
