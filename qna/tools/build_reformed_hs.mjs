import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(__dirname, "../_fetch/reformed_holy_spirit.html"), "utf8");

const block = html.match(/<ul class="searchResultList">([\s\S]*?)<\/ul>/);
if (!block) throw new Error("no searchResultList");
const ul = block[1];
const items = [];
const re = /<a href="(https:\/\/reformedanswers\.org\/answer\.asp\/file\/\d+)" class="searchResult">([^<]+)<\/a>/g;
let m;
while ((m = re.exec(ul)) !== null) {
  items.push({ title: m[2].trim(), url: m[1] });
}
fs.writeFileSync(path.join(__dirname, "../_fetch/reformed_hs_p1.json"), JSON.stringify(items, null, 2), "utf8");
console.log("Holy Spirit page 1:", items.length);
