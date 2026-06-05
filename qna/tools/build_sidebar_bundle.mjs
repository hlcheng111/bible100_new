/**
 * 合併 qna_data_*.json → data/qna_sidebar_bundle.js
 * 鍵名必須與 qna_nav_config.js 的 source.id 一致。
 * 執行：node qna/tools/build_sidebar_bundle.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const OUT_FILE = path.join(DATA_DIR, "qna_sidebar_bundle.js");
const EQ_TITLE_MAP_FILE = path.join(DATA_DIR, "equiptoserve_title_url_map.json");

/** @type {Record<string, string[]>} */
const NAV_SOURCE_FILES = {
  equiptoserve: ["qna_data_聖經難題_-_以斯拉百科網.json"],
  equiptoserve_deut_ruth: ["qna_data_以斯拉百科_申命記～路得記.json"],
  equiptoserve_ot_bg: ["qna_data_以斯拉百科_舊約背景.json"],
  equiptoserve_nt_bg: ["qna_data_以斯拉百科_新約背景.json"],
  chineseapologetics: ["qna_data_華人護教_聖經難題（錯誤_矛盾）解答.json"],
  defendinginerrancy: ["qna_data_Defending_Inerrancy_Bible_Difficulties.json"],
  biblequestions: ["qna_data_-_Bible_Questions!.json"],
  gotquestions: [
    "qna_data_GotQuestions_中文_好消息.json",
    "qna_data_GotQuestions_英文.json",
  ],
  christiananswers: [
    "qna_data_Christian_Answers_英文_精選.json",
    "qna_data_Christian_Answers_英文.json",
  ],
  christiananswers_zh_trad: ["qna_data_Christian_Answers_繁中_精選.json"],
  christiananswers_id: ["qna_data_Christian_Answers_印尼_精選.json"],
  wellsofgrace: ["qna_data_恩泉_聖經問題解答_陳終道.json"],
  wellsofgrace_archer: ["qna_data_恩泉_聖經難題彙編_Archer.json"],
  wellsofgrace_chen_book: ["qna_data_《圣经问题解答》_-_陈终道.json"],
  wellsofgrace_chen_ot: ["qna_data_-_旧约_-_陈终道.json"],
  wellsofgrace_chen_nt: ["qna_data_-_新约_-_陈终道.json"],
  wellsofgrace_su_nt: ["qna_data_恩泉_新約聖經難題_蘇佐揚.json"],
  wellsofgrace_su_reading: ["qna_data_恩泉_讀經深思系列_蘇佐揚.json"],
  wellsofgrace_li_ot: ["qna_data_恩泉_舊約聖經難題_李道生.json"],
  wellsofgrace_lv: ["qna_data_恩泉_聖經難題解答_呂鴻基.json"],
  wellsofgrace_wenti2: ["qna_data_恩泉_難題（卷二）.json"],
  ccbiblestudy: ["qna_data_華人基督徒查經網站_(_ccbiblestudy_).json"],
  equiptoserve_apologetics: ["qna_data_以斯拉百科_辯道護教.json"],
  reformedanswers: ["qna_data_Reformed_Answers_聖經與神學問答.json"],
  wellsofgrace_chen_theology: ["qna_data_第三部分：_神学问题_-_陈终道.json"],
  billygraham: ["qna_data_-_Billy_Graham_Answers.json"],
  logosbaptist: ["qna_data_證道浸信會_信仰難題解答.json"],
  wellsofgrace_chen_life: ["qna_data_第二部分：_生活问题_-_陈终道.json"],
  wellsofgrace_chen_church: ["qna_data_第四部分：_教会问题_-_陈终道.json"],
};

function cleanTitle(t) {
  if (!t || typeof t !== "string") return "";
  return t
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\?/g, "？")
    .replace(/Matthew\?/gi, "Matthew：")
    .trim();
}

/** @type {Record<string, {byCategory?: Record<string,string>, fallbacks?: string[]}>} */
let EQ_TITLE_MAP = {};
if (fs.existsSync(EQ_TITLE_MAP_FILE)) {
  try {
    const raw = JSON.parse(fs.readFileSync(EQ_TITLE_MAP_FILE, "utf8"));
    EQ_TITLE_MAP = raw.items || {};
  } catch {
    EQ_TITLE_MAP = {};
  }
}

function normalizeTitleForLookup(s) {
  if (!s) return "";
  return s
    .replace(/\s+/g, "")
    .replace(/[（(][^)）]*[)）]/g, "")
    .replace(/[？?！!。．、,，.:：;；"'「」『』]/g, "")
    .trim();
}

/** 與 etspedia 抓下來的 title 鍵偶有不一致（別字／順序），多試幾個鍵 */
function equiptoserveMapKeysForTitle(title) {
  const base = normalizeTitleForLookup(title);
  if (!base) return [];
  const keys = new Set([base]);
  keys.add(base.replace(/事蹟/g, "迹事"));
  keys.add(base.replace(/迹事/g, "事蹟"));
  keys.add(base.replace(/甚麼/g, "什麼"));
  keys.add(base.replace(/什麼/g, "甚麼"));
  keys.add(base.replace(/那麼/g, "那麽"));
  keys.add(base.replace(/那麽/g, "那麼"));
  keys.add(base.replace(/有何事蹟發生/g, "有何事發生"));
  if (/墳墓裡聖經/.test(base)) keys.add(base.replace(/墳墓裡聖經/g, "墳墓裡那麽聖經"));
  keys.add(base.replace(/為/g, "爲"));
  keys.add(base.replace(/爲/g, "為"));
  // 舊 JSON 「甚麼事」↔ 站內 payload 偶寫成「甚麼迹事」
  if (/曾發生甚麼事$/.test(base)) keys.add(base.replace(/甚麼事$/, "甚麼迹事"));
  if (/^書亞/.test(base)) keys.add("約" + base);
  return [...keys].filter(Boolean);
}

function equiptoserveCategoryKeys(navId, groupName) {
  const tail = (groupName || "").split("·").slice(-1)[0].trim();
  if (navId === "equiptoserve_deut_ruth") return ["deuteronomy-ruth"];
  if (navId === "equiptoserve_ot_bg") return [];
  if (navId === "equiptoserve_nt_bg") return [];
  if (navId === "equiptoserve_apologetics") {
    const topic = tail.split(">").slice(-1)[0].trim();
    const apMap = {
      "辯道學之意義與使命": "meaning-and-mission-of-apologetics",
      "辯道學的重振": "revival-of-apologetics",
      "辯道學目標與內容": "goals-and-content-of-apologetics",
      "辯道學的權威": "authority-of-apologetics",
    };
    const keys = ["apologetics-and-defense-of-faith", "religious-apologetics"];
    if (apMap[topic]) keys.unshift(apMap[topic]);
    return keys;
  }
  // 以斯拉·聖經難題：以新站實際分類 slug（多為簡短書卷 slug）
  const bookSlugMap = {
    "創世記": "genesis",
    "出埃及記": "exodus",
    "利未記": "leviticus-numbers",
    "民數記": "leviticus-numbers",
    "申命記": "deuteronomy-ruth",
    "約書亞記": "deuteronomy-ruth",
    "士師記": "deuteronomy-ruth",
    "路得記": "deuteronomy-ruth",
    "撒母耳記上": "samuel",
    "撒母耳記下": "samuel",
    "列王紀上": "kings",
    "列王紀下": "kings",
    "歷代志上": "kings",
    "歷代志下": "kings",
    "以斯拉記": "kings",
    "尼希米記": "kings",
    "以斯帖記": "kings",
    "約伯記": "psalms-songofsolomon",
    "詩篇": "psalms-songofsolomon",
    "箴言": "psalms-songofsolomon",
    "傳道書": "psalms-songofsolomon",
    "雅歌": "psalms-songofsolomon",
    "以賽亞書": "isaiah-lamentations",
    "耶利米書": "isaiah-lamentations",
    "耶利米哀歌": "isaiah-lamentations",
    "以西結書": "ezekiel-hosea",
    "但以理書": "ezekiel-hosea",
    "何西阿書": "ezekiel-hosea",
    "約珥書": "joel-malachi",
    "阿摩司書": "joel-malachi",
    "俄巴底亞書": "joel-malachi",
    "約拿書": "joel-malachi",
    "彌迦書": "joel-malachi",
    "那鴻書": "joel-malachi",
    "哈巴谷書": "joel-malachi",
    "西番雅書": "joel-malachi",
    "哈該書": "joel-malachi",
    "撒迦利亞書": "joel-malachi",
    "瑪拉基書": "joel-malachi",
    "馬太福音": "matthew",
    "馬可福音": "mark",
    "路加福音": "luke",
    "約翰福音": "john",
    "使徒行傳": "acts",
    "羅馬書": "romans",
    "哥林多前書": "1-corinthians",
    "哥林多後書": "2-corinthians",
    "加拉太書": "galatians",
    "以弗所書": "ephesians",
    "腓立比書": "philippians",
    "歌羅西書": "colossians",
    "帖撒羅尼迦前書": "1-thessalonians",
    "帖撒羅尼迦後書": "2-thessalonians",
    "提摩太前書": "1-timothy",
    "提摩太後書": "2-timothy",
    "提多書": "titus",
    "腓利門書": "philemon",
    "希伯來書": "hebrews",
    "雅各書": "james",
    "彼得前書": "1-peter",
    "彼得後書": "2-peter",
    "約翰一書": "1-john",
    "約翰二書": "2-john",
    "約翰三書": "3-john",
    "猶大書": "jude",
    "啟示錄": "revelation",
  };
  return bookSlugMap[tail] ? [bookSlugMap[tail]] : [];
}

function pickEquiptoserveUrl(title, navId, groupName, originalUrl) {
  let rec = null;
  for (const key of equiptoserveMapKeysForTitle(title)) {
    rec = EQ_TITLE_MAP[key];
    if (rec) break;
  }
  if (!rec) return originalUrl;
  const catKeys = equiptoserveCategoryKeys(navId, groupName);
  // 映射來自站內分類頁真實 href，已含 leviticus-numbers 等合併路徑；禁止再用 BOOK_MAP 重寫以免 404。
  if (rec.byCategory && catKeys.length) {
    for (const k of catKeys) {
      if (rec.byCategory[k]) return rec.byCategory[k];
    }
  }
  if (rec.fallbacks && rec.fallbacks.length) return rec.fallbacks[0];
  return originalUrl;
}

const BOOK_MAP = {
  "創世記": ["old-testament-bible-questions", "genesis"],
  "出埃及記": ["old-testament-bible-questions", "exodus"],
  "利未記": ["old-testament-bible-questions", "leviticus"],
  "民數記": ["old-testament-bible-questions", "numbers"],
  "申命記": ["old-testament-bible-questions", "deuteronomy"],
  "約書亞記": ["old-testament-bible-questions", "joshua"],
  "士師記": ["old-testament-bible-questions", "judges"],
  "路得記": ["old-testament-bible-questions", "ruth"],
  "撒母耳記上": ["old-testament-bible-questions", "first-samuel"],
  "撒母耳記下": ["old-testament-bible-questions", "second-samuel"],
  "列王紀上": ["old-testament-bible-questions", "first-kings"],
  "列王紀下": ["old-testament-bible-questions", "second-kings"],
  "歷代志上": ["old-testament-bible-questions", "first-chronicles"],
  "歷代志下": ["old-testament-bible-questions", "second-chronicles"],
  "以斯拉記": ["old-testament-bible-questions", "ezra"],
  "尼希米記": ["old-testament-bible-questions", "nehemiah"],
  "以斯帖記": ["old-testament-bible-questions", "esther"],
  "約伯記": ["old-testament-bible-questions", "job"],
  "詩篇": ["old-testament-bible-questions", "psalms"],
  "箴言": ["old-testament-bible-questions", "proverbs"],
  "傳道書": ["old-testament-bible-questions", "ecclesiastes"],
  "雅歌": ["old-testament-bible-questions", "song-of-solomon"],
  "以賽亞書": ["old-testament-bible-questions", "isaiah"],
  "耶利米書": ["old-testament-bible-questions", "jeremiah"],
  "耶利米哀歌": ["old-testament-bible-questions", "lamentations"],
  "以西結書": ["old-testament-bible-questions", "ezekiel"],
  "但以理書": ["old-testament-bible-questions", "daniel"],
  "何西阿書": ["old-testament-bible-questions", "hosea"],
  "約珥書": ["old-testament-bible-questions", "joel"],
  "阿摩司書": ["old-testament-bible-questions", "amos"],
  "俄巴底亞書": ["old-testament-bible-questions", "obadiah"],
  "約拿書": ["old-testament-bible-questions", "jonah"],
  "彌迦書": ["old-testament-bible-questions", "micah"],
  "那鴻書": ["old-testament-bible-questions", "nahum"],
  "哈巴谷書": ["old-testament-bible-questions", "habakkuk"],
  "西番雅書": ["old-testament-bible-questions", "zephaniah"],
  "哈該書": ["old-testament-bible-questions", "haggai"],
  "撒迦利亞書": ["old-testament-bible-questions", "zechariah"],
  "瑪拉基書": ["old-testament-bible-questions", "malachi"],
  "馬太福音": ["new-testament-bible-questions", "matthew"],
  "馬可福音": ["new-testament-bible-questions", "mark"],
  "路加福音": ["new-testament-bible-questions", "luke"],
  "約翰福音": ["new-testament-bible-questions", "john"],
  "使徒行傳": ["new-testament-bible-questions", "acts"],
  "羅馬書": ["new-testament-bible-questions", "romans"],
  "哥林多前書": ["new-testament-bible-questions", "first-corinthians"],
  "哥林多後書": ["new-testament-bible-questions", "second-corinthians"],
  "加拉太書": ["new-testament-bible-questions", "galatians"],
  "以弗所書": ["new-testament-bible-questions", "ephesians"],
  "腓立比書": ["new-testament-bible-questions", "philippians"],
  "歌羅西書": ["new-testament-bible-questions", "colossians"],
  "帖撒羅尼迦前書": ["new-testament-bible-questions", "first-thessalonians"],
  "帖撒羅尼迦後書": ["new-testament-bible-questions", "second-thessalonians"],
  "提摩太前書": ["new-testament-bible-questions", "first-timothy"],
  "提摩太後書": ["new-testament-bible-questions", "second-timothy"],
  "提多書": ["new-testament-bible-questions", "titus"],
  "腓利門書": ["new-testament-bible-questions", "philemon"],
  "希伯來書": ["new-testament-bible-questions", "hebrews"],
  "雅各書": ["new-testament-bible-questions", "james"],
  "彼得前書": ["new-testament-bible-questions", "first-peter"],
  "彼得後書": ["new-testament-bible-questions", "second-peter"],
  "約翰一書": ["new-testament-bible-questions", "first-john"],
  "約翰二書": ["new-testament-bible-questions", "second-john"],
  "約翰三書": ["new-testament-bible-questions", "third-john"],
  "猶大書": ["new-testament-bible-questions", "jude"],
  "啟示錄": ["new-testament-bible-questions", "revelation"],
};

function dedupe(items) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    const key = `${it.title}@@${it.url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

function normalizeEquiptoserveUrl(url, groupName) {
  if (!url) return url;
  const fixed = url.replace(/^http:\/\//i, "https://");
  if (!/equiptoserve\.org\/etspedia\//i.test(fixed)) return fixed;
  if (/\/(old-testament-bible-questions|new-testament-bible-questions)\//i.test(fixed)) return fixed;
  if (/\/(舊約背景|新約背景|辯道護教)/.test(fixed)) return fixed;
  if (/%E8%81%96%E7%B6%93%E9%9B%A3%E9%A1%8C/i.test(fixed) || /聖經難題/.test(fixed)) {
    const mappedLegacy = BOOK_MAP[(groupName || "").split("·").slice(-1)[0].trim()];
    if (mappedLegacy) {
      return `https://www.equiptoserve.org/etspedia/${mappedLegacy[0]}/${mappedLegacy[1]}`;
    }
    return "https://www.equiptoserve.org/etspedia/";
  }
  const book = (groupName || "").split("·").slice(-1)[0].trim();
  const mapped = BOOK_MAP[book];
  if (mapped) {
    return `https://www.equiptoserve.org/etspedia/${mapped[0]}/${mapped[1]}`;
  }
  if (fixed.includes("/未分類")) return "https://www.equiptoserve.org/etspedia/";
  return fixed;
}

function normalizeUrl(navId, url, groupName) {
  if (!url) return "";
  let v = url.trim().replace(/^http:\/\//i, "https://");
  if (navId.startsWith("equiptoserve")) v = normalizeEquiptoserveUrl(v, groupName);
  if (navId === "biblequestions") v = v.replace(/^https:\/\/www\.biblequestions\.org\/([a-z])\.html#(.+)$/i, "https://www.biblequestions.org/$1.html#$2");
  return v;
}

function isJunkTitle(title) {
  return (
    !title ||
    title.length > 500 ||
    /^https?:\/\//i.test(title) ||
    /^(home|homepage|welcome|字母排序|got questions)$/i.test(title.trim())
  );
}

function shouldKeep(navId, it) {
  const u = it.url.toLowerCase();
  const t = it.title.toLowerCase();
  if (!u.startsWith("http")) return false;
  if (u.includes("javascript:") || u.includes("mailto:")) return false;
  if (isJunkTitle(it.title)) return false;
  if (u.includes("/wp-login") || u.includes("/feed")) return false;
  if (navId === "gotquestions") {
    if (u.includes("gotquestions.org/content")) return false;
    if (u.includes("search") || u.includes("ask.html") || u.endsWith("/")) return false;
    return /gotquestions\.org\/(chinese\/chinese-.+\.html|[^/]+-question\.html)/i.test(u);
  }
  if (navId === "biblequestions") {
    if (u.endsWith(".pdf")) return false;
    return /biblequestions\.org\/bqar\d+\.html$/i.test(u);
  }
  if (navId.startsWith("christiananswers")) {
    if (u.includes("/comments/") || u.includes("multipurposeform")) return false;
    return (
      /christiananswers\.net\/q-[a-z0-9-]+\/[a-z0-9-]+\.html$/i.test(u) ||
      /christiananswers\.net\/(dictionary\/[a-z0-9-]+\.html|dinosaurs\/[a-z0-9-]+\.html)$/i.test(u) ||
      /christiananswers\.net\/(gospel|jesus|bible|creation|archaeology|hope|life|love)\/home\.html$/i.test(u) ||
      /christiananswers\.net\/(chinese\/trad|indonesian)\/(home|gospel\/home|jesus\/home|bible\/home)\.html$/i.test(u)
    );
  }
  if (navId === "equiptoserve_deut_ruth") {
    if (/^https:\/\/www\.equiptoserve\.org\/etspedia\/?$/i.test(u)) return false;
  }
  if (navId.startsWith("equiptoserve")) return u.includes("equiptoserve.org/etspedia/");
  if (navId === "reformedanswers") {
    if (u.endsWith(".pdf")) return false;
    return /reformedanswers\.org\/search\.asp\/st\/qna\/scat\//i.test(u) || /reformedanswers\.org\/search\.asp\/scat\/.+\/st\/qna/i.test(u);
  }
  if (navId.startsWith("wellsofgrace")) return !/\/(index|xu1)\.htm$/i.test(u) || /[?&]id=/.test(u);
  return true;
}

function loadJson(fname) {
  const p = path.join(DATA_DIR, fname);
  if (!fs.existsSync(p)) {
    console.warn("skip missing:", fname);
    return null;
  }
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function flattenData(navId, doc, groupPrefix) {
  const groups = [];
  const subs = doc.subcategories || {};
  const prefix = groupPrefix ? groupPrefix + " · " : "";

  for (const [gName, items] of Object.entries(subs)) {
    if (navId === "equiptoserve_deut_ruth") {
      if (!/(申命記|約書亞記|士師記|路得記)/.test(gName)) continue;
    }
    const fullGroupName = prefix + gName;
    let list = (items || [])
      .map((it) => ({
        title: navId === "ccbiblestudy" ? `${cleanTitle(it.title)}（章節目錄）` : cleanTitle(it.title),
        url: normalizeUrl(navId, it.url || "", fullGroupName),
      }))
      .map((it) => {
        if (navId.startsWith("equiptoserve")) {
          return { ...it, url: pickEquiptoserveUrl(it.title, navId, fullGroupName, it.url) };
        }
        return it;
      })
      .filter((it) => it.url && it.title && shouldKeep(navId, it));
    list = dedupe(list);
    if (!list.length) {
      list = (items || [])
        .map((it) => ({
          title: cleanTitle(it.title) || "進入原站目錄",
          url: normalizeUrl(navId, it.url || "", prefix + gName),
        }))
        .map((it) => ({
          title: /^https?:\/\//i.test(it.title) ? "進入原站目錄" : it.title,
          url: it.url,
        }))
        .filter((it) => it.url && it.title)
        .slice(0, 20);
    }

    if (!list.length) continue;

    groups.push({
      name: prefix + gName,
      items: list,
    });
  }
  return groups;
}

const bundle = {};

for (const [navId, files] of Object.entries(NAV_SOURCE_FILES)) {
  const allGroups = [];
  for (const f of files) {
    const doc = loadJson(f);
    if (!doc) continue;
    const short =
      doc.sourceLabel || f.replace(/^qna_data_/, "").replace(/\.json$/, "");
    const groups = flattenData(navId, doc, files.length > 1 ? short : "");
    allGroups.push(...groups);
  }
  if (allGroups.length) {
    bundle[navId] = { groups: allGroups };
  }
}

const header = `/** 自動生成：node tools/build_sidebar_bundle.mjs — 勿手改內容 */\n`;
const body = `window.QNA_SIDEBAR_BUNDLE = ${JSON.stringify(bundle)};\n`;

fs.writeFileSync(OUT_FILE, header + body, "utf8");
console.log("Wrote", OUT_FILE);
console.log("sources:", Object.keys(bundle).join(", "));
console.log("approx KB:", Math.round(fs.statSync(OUT_FILE).size / 1024));
