/**
 * Billy Graham Answers：Topics 階層（官方篩選網址）+ sitemap 題目連結（上限，備查）。
 * 產物：qna_billy_menu.js
 */
import fs from "fs";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function get(url) {
  return new Promise((res, rej) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; Bible100QnA/1.0)" } }, (r) => {
      let d = "";
      r.on("data", (c) => (d += c));
      r.on("end", () => res(d));
    }).on("error", rej);
  });
}

function billyFilterUrl(lvl0, lvl1) {
  const p = new URLSearchParams();
  p.set("answer[sortBy]", "answer:publicationDate:desc");
  p.set("answer[hierarchicalMenu][topics.lvl0][0]", lvl0);
  if (lvl1) p.set("answer[hierarchicalMenu][topics.lvl0][1]", lvl1);
  return `https://billygraham.org/answers?${p.toString()}`;
}

function slugToTitle(url) {
  const u = url.replace(/\/$/, "");
  const seg = u.split("/").pop() || "";
  if (!seg) return url;
  return seg
    .split("-")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ""))
    .join(" ")
    .trim();
}

/** 與官網 Topics 對應；無細分子項時僅提供「瀏覽此主題」一鍵。 */
const BILLY_TOPICS = [
  {
    topic: "Christian Living",
    children: [
      "Anger",
      "Baptism",
      "Bible Study",
      "Church",
      "Discipleship",
      "Evangelism",
      "Fasting",
      "God's Will",
      "Gossip",
      "Integrity",
      "Money",
      "Prayer",
      "Pride",
      "Relationships",
      "Spiritual Growth",
      "Stewardship",
      "Troubled Heart",
      "Worship",
    ],
  },
  { topic: "Christianity", children: [] },
  { topic: "Crisis Situations", children: [] },
  { topic: "Culture", children: [] },
  { topic: "Leadership", children: [] },
  { topic: "Lifestyle", children: [] },
  { topic: "Relationships", children: [] },
  { topic: "Religion", children: [] },
];

const SITEMAP_CAP = 400;

const topicNav = BILLY_TOPICS.map(({ topic, children }) => ({
  topic,
  l0Url: billyFilterUrl(topic, null),
  items:
    children.length > 0
      ? children.map((c) => ({
          title: c,
          url: billyFilterUrl(topic, c),
        }))
      : [{ title: `Browse · ${topic}`, url: billyFilterUrl(topic, null) }],
}));

const indexXml = await get("https://billygraham.org/sitemap/answers.xml");
const sm = [...indexXml.matchAll(/<loc>(https:\/\/billygraham\.org\/sitemap\/answers\/\d+\.xml)<\/loc>/g)].map((m) => m[1]);
const urls = [];
for (const loc of sm) {
  const xml = await get(loc);
  const locs = [...xml.matchAll(/<loc>(https:\/\/billygraham\.org\/answers\/[^<]+)<\/loc>/g)].map((m) => m[1]);
  urls.push(...locs);
  if (urls.length >= SITEMAP_CAP) break;
}
const flat = urls.slice(0, SITEMAP_CAP).map((url) => ({ title: slugToTitle(url), url }));

const body = `// Auto-built: topic filters (hierarchicalMenu) + sitemap sample (cap ${SITEMAP_CAP}).
window.billyTopicNav = ${JSON.stringify(topicNav)};
window.billyAnswersMenu = ${JSON.stringify(flat)};
`;
fs.writeFileSync(path.join(__dirname, "../qna_billy_menu.js"), body, "utf8");
console.log("billy topics:", topicNav.length, "sitemap items:", flat.length);
