#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const SRC = path.join(REPO, "ai_tools", "templates", "bible_prompts.json");
const OUT = path.join(REPO, "js", "ai_prompt_templates_embedded.js");

const data = JSON.parse(fs.readFileSync(SRC, "utf8"));
const body =
  "/* AUTO-GENERATED — DO NOT EDIT. Run: node scripts/generate_ai_prompt_embedded.js */\n" +
  "(function (g) {\n" +
  "  g.AI_PROMPT_TEMPLATES_EMBEDDED = " +
  JSON.stringify(data) +
  ";\n" +
  "})(typeof window !== 'undefined' ? window : this);\n";

fs.writeFileSync(OUT, body, "utf8");
console.log("Wrote", OUT);
