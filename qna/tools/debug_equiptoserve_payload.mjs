import fs from "fs";

const htmlPath = process.argv[2];
const needle = process.argv[3] || "";
const around = Number(process.argv[4] || 600);
if (!htmlPath) {
  console.log("usage: node tools/debug_equiptoserve_payload.mjs <html-file> [needle]");
  process.exit(1);
}

const s = fs.readFileSync(htmlPath, "utf8");
const re = /self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)<\/script>/g;
let decoded = "";
let m;
let chunks = 0;
while ((m = re.exec(s))) {
  const raw = m[1];
  decoded += JSON.parse('"' + raw.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"');
  chunks += 1;
}
if (!chunks) {
  console.log("no next payload found");
  process.exit(1);
}
console.log("chunks:", chunks);
console.log("decoded length:", decoded.length);
if (needle) {
  const idx = decoded.indexOf(needle);
  console.log("needle index:", idx);
  if (idx >= 0) {
    console.log(decoded.slice(Math.max(0, idx - around), idx + around));
  }
}
