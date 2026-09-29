#!/usr/bin/env node
/**
 * Regenerate js/config-embedded.js from config/*.json (file:// SSOT).
 * Usage: node scripts/generate_config_embedded.js
 */
"use strict";

const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const CONFIG_DIR = path.join(REPO, "config");
const OUT = path.join(REPO, "js", "config-embedded.js");

const SYNC_FILES = [
  "modules.json",
  "modes.json",
  "languages.json",
  "paths.json",
  "local-languages.json",
];

const embedded = {};
for (const name of SYNC_FILES) {
  const fp = path.join(CONFIG_DIR, name);
  if (fs.existsSync(fp)) {
    embedded[name] = JSON.parse(fs.readFileSync(fp, "utf8"));
  }
}

const body =
  "/* AUTO-GENERATED — DO NOT EDIT. Run: node scripts/generate_config_embedded.js */\n" +
  "(function (g) {\n" +
  "  g.BIBLE100_EMBEDDED_CONFIG = " +
  JSON.stringify(embedded) +
  ";\n" +
  "})(typeof window !== 'undefined' ? window : this);\n";

fs.writeFileSync(OUT, body, "utf8");
console.log("Wrote", OUT);
