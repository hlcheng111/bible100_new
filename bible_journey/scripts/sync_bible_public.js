#!/usr/bin/env node
/** 將 src/data/bible 同步到 public/data/bible（供 fetch / 靜態部署） */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, '..', 'src', 'data', 'bible');
const dest = path.join(__dirname, '..', 'public', 'data', 'bible');

if (!fs.existsSync(src)) {
  console.error('Missing', src, '— run npm run export:bible first');
  process.exit(1);
}

fs.mkdirSync(dest, { recursive: true });
let n = 0;
for (const name of fs.readdirSync(src)) {
  if (!name.endsWith('.json')) continue;
  fs.copyFileSync(path.join(src, name), path.join(dest, name));
  n++;
}
console.log(`Synced ${n} files → public/data/bible/`);
