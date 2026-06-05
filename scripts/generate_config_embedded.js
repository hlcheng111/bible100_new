#!/usr/bin/env node
/** Emit js/config-embedded.js for file:// (no fetch). Run: node scripts/generate_config_embedded.js */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const names = ['modules.json', 'modes.json', 'languages.json', 'paths.json', 'local-languages.json'];
const bag = {};
for (const n of names) {
  const p = path.join(root, 'config', n);
  if (fs.existsSync(p)) bag[n] = JSON.parse(fs.readFileSync(p, 'utf8'));
}
const out = `/* AUTO-GENERATED — run: node scripts/generate_config_embedded.js */\n(function (g) {\n  g.BIBLE100_EMBEDDED_CONFIG = ${JSON.stringify(bag)};\n})(typeof window !== 'undefined' ? window : this);\n`;
fs.writeFileSync(path.join(root, 'js', 'config-embedded.js'), out, 'utf8');
console.log('Wrote js/config-embedded.js');
