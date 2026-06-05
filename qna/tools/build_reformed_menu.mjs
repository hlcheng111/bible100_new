/**
 * 自 reformedanswers.org/topics.asp 解析「大類→子類」，再抓取各子類 search 首頁試題連結。
 * 輸出 _fetch/reformed_menu_full.json（blocks 格式，與繁中／印尼導覽相同）。
 */
import fs from "fs";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../_fetch/reformed_menu_full.json");

function get(url) {
  return new Promise((res, rej) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; Bible100QnA/1.0)" } }, (r) => {
        let d = "";
        r.on("data", (c) => (d += c));
        r.on("end", () => res(d));
      })
      .on("error", rej);
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseTopicsNav(html) {
  const start = html.indexOf('id="navMenuTopics"');
  const end = html.indexOf("<!-- begin langs -->", start);
  if (start < 0 || end < 0) throw new Error("navMenuTopics 區塊未找到");
  const chunk = html.slice(start, end);
  const groups = [];
  const blockRe =
    /<li id="link(\d+)t"[^>]*>[\s\S]*?<a href="(https:\/\/reformedanswers\.org\/search\.asp\/st\/qna\/scat\/[^"]+)">([^<]*)<\/a>[\s\S]*?<li id="menu\1"[^>]*>[\s\S]*?<ul>([\s\S]*?)<\/ul>/g;
  let m;
  while ((m = blockRe.exec(chunk)) !== null) {
    const parentText = m[3].replace(/\s+/g, " ").trim().replace(/&amp;/g, "&");
    const inner = m[4];
    const children = [];
    const childRe =
      /<li><a href="(https:\/\/reformedanswers\.org\/search\.asp\/st\/qna\/scat\/[^"]+)">([^<]*)<\/a><\/li>/g;
    let cm;
    while ((cm = childRe.exec(inner)) !== null) {
      children.push({
        searchUrl: cm[1],
        label: cm[2].replace(/&amp;/g, "&").trim(),
      });
    }
    groups.push({ parentText, children });
  }
  return groups;
}

function parseSearchResults(html) {
  const items = [];
  const re =
    /<a href="(https:\/\/reformedanswers\.org\/answer\.asp\/file\/\d+)" class="searchResult">([^<]+)<\/a>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    items.push({ title: m[2].trim(), url: m[1] });
  }
  return items;
}

const MAX_PER_CAT = 50;

async function main() {
  const topicsHtml = await get("https://reformedanswers.org/topics.asp");
  const groups = parseTopicsNav(topicsHtml);
  const blocks = [];
  for (const g of groups) {
    for (const ch of g.children) {
      await sleep(400);
      const searchHtml = await get(ch.searchUrl);
      const items = parseSearchResults(searchHtml).slice(0, MAX_PER_CAT);
      blocks.push({
        topic: `${g.parentText} · ${ch.label}`,
        l2Url: ch.searchUrl,
        items,
      });
    }
  }
  fs.writeFileSync(OUT, JSON.stringify({ blocks }), "utf8");
  const nItems = blocks.reduce((a, b) => a + b.items.length, 0);
  console.log("reformed blocks:", blocks.length, "items:", nItems);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
