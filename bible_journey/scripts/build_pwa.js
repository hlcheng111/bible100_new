#!/usr/bin/env node
/**
 * PWA 建置：根路徑 + Service Worker（給 Vercel／Netlify／HTTPS 真機試用）
 * 用法：npm run build:pwa
 * 子路徑：BJ_BASE=/bible_journey/ npm run build:pwa
 */
import { execSync } from 'child_process';

process.env.PWA_BUILD = '1';
if (!process.env.BJ_BASE) {
  process.env.BJ_BASE = '/';
}

console.log(`[build:pwa] BJ_BASE=${process.env.BJ_BASE} PWA_BUILD=1`);
execSync('npm run build', { stdio: 'inherit', env: process.env });
