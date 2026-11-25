/**
 * 批次檢查 JS 語法（只編譯、不執行）。
 * 用法：node _cm_js_syntax_batch.js <in.json> <out.json>
 * in.json  ＝ [{ "id": "...", "code": "..." }, ...]
 * out.json ＝ [{ "id": "...", "ok": true|false, "skipped": bool, "err": "..." }, ...]
 */
"use strict";
var fs = require("fs");
var vm = require("vm");

var items = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
var out = items.map(function (it) {
  var code = String(it.code || "");
  if (/^\s*(import|export)\s/m.test(code)) {
    return { id: it.id, ok: true, skipped: true, err: "" };
  }
  try {
    new vm.Script(code, { filename: String(it.id) });
    return { id: it.id, ok: true, skipped: false, err: "" };
  } catch (e) {
    return { id: it.id, ok: false, skipped: false, err: String(e && e.message ? e.message : e).slice(0, 200) };
  }
});
fs.writeFileSync(process.argv[3], JSON.stringify(out), "utf8");
