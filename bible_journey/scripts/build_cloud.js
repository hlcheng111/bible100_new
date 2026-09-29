#!/usr/bin/env node
import { execSync } from 'child_process';

process.env.BJ_BASE = '/bible_journey/';
execSync('npm run build', { stdio: 'inherit', env: process.env });
