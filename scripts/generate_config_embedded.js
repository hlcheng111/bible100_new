#!/usr/bin/env node
/**
 * SSOT mirror: config/*.json → js/config-embedded.js (file:// 專用)
 * Run after any change to config/modules.json, modes.json, etc.:
 *   node scripts/generate_config_embedded.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const configDir = path.join(__dirname, '..', 'config');
const outputFile = path.join(__dirname, '..', 'js', 'config-embedded.js');

const filesToEmbed = [
  'modules.json',
  'modes.json',
  'languages.json',
  'paths.json',
  'local-languages.json'
];

const payload = {};

filesToEmbed.forEach(function (file) {
  const filePath = path.join(configDir, file);
  if (!fs.existsSync(filePath)) {
    console.warn('[SSOT] Skip missing:', file);
    return;
  }
  const jsonContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  payload[file] = jsonContent;
  console.log('[SSOT] Embedded', file);
});

const header = '/* AUTO-GENERATED — DO NOT EDIT. Run: node scripts/generate_config_embedded.js */\n';
const body =
  '(function (g) {\n' +
  '  g.BIBLE100_EMBEDDED_CONFIG = ' +
  JSON.stringify(payload, null, 0) +
  ';\n' +
  "})(typeof window !== 'undefined' ? window : this);\n";

fs.writeFileSync(outputFile, header + body, 'utf8');
console.log('[SSOT] Wrote', outputFile, '—', Object.keys(payload).length, 'config files synchronized.');
