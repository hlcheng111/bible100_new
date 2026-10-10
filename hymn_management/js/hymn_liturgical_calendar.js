/* Western church year → CONTROLLED_VOCAB season codes. file:// 可載。 */
(function (root) {
  "use strict";

  function ymd(dt) {
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  }

  function addDays(dt, n) {
    var d = ymd(dt);
    d.setDate(d.getDate() + n);
    return d;
  }

  function easterGregorian(year) {
    var a = year % 19;
    var b = Math.floor(year / 100);
    var c = year % 100;
    var d = Math.floor(b / 4);
    var e = b % 4;
    var f = Math.floor((b + 8) / 25);
    var g = Math.floor((b - f + 1) / 3);
    var h = (19 * a + b - d - g + 15) % 30;
    var i = Math.floor(c / 4);
    var k = c % 4;
    var l = (32 + 2 * e + 2 * i - h - k) % 7;
    var m = Math.floor((a + 11 * h + 22 * l) / 451);
    var month = Math.floor((h + l - 7 * m + 114) / 31);
    var day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  }

  function adventOne(year) {
    var d = new Date(year, 10, 30);
    var w = d.getDay();
    if (w <= 3) d.setDate(30 - w);
    else d.setDate(30 + (7 - w));
    return ymd(d);
  }

  function seasonOf(date) {
    var dt = ymd(date || new Date());
    var y = dt.getFullYear();
    var easter = easterGregorian(y);
    var ash = addDays(easter, -46);
    var palm = addDays(easter, -7);
    var goodFri = addDays(easter, -2);
    var pentecost = addDays(easter, 49);
    var trinity = addDays(easter, 56);
    var adv = adventOne(y);
    var christmas = new Date(y, 11, 25);
    var epiphany = new Date(y, 0, 6);
    var t = dt.getTime();

    function onDay(a) {
      return t === ymd(a).getTime();
    }
    function between(a, b) {
      return t >= ymd(a).getTime() && t <= ymd(b).getTime();
    }

    if (onDay(goodFri)) return { code: "good_friday", zh: "耶穌受難日", easter: easter };
    if (between(palm, addDays(easter, -1))) return { code: "holy_week", zh: "受難週", easter: easter };
    if (onDay(easter) || between(easter, addDays(pentecost, -1))) {
      return { code: "easter", zh: "復活節期", easter: easter };
    }
    if (onDay(pentecost) || between(pentecost, addDays(pentecost, 6))) {
      return { code: "pentecost", zh: "聖靈降臨", easter: easter };
    }
    if (onDay(trinity)) return { code: "trinity_sunday", zh: "三一主日", easter: easter };
    if (between(ash, addDays(palm, -1))) return { code: "lent", zh: "預苦期", easter: easter };
    if (between(new Date(y, 11, 24), new Date(y, 11, 31)) || between(new Date(y, 0, 1), addDays(epiphany, -1))) {
      return { code: "christmas", zh: "聖誕", easter: easter };
    }
    if (between(epiphany, addDays(ash, -1))) return { code: "epiphany", zh: "主顯節期", easter: easter };
    if (between(adv, new Date(y, 11, 23))) return { code: "advent", zh: "將臨期", easter: easter };
    return { code: "ordinary", zh: "常年期", easter: easter };
  }

  function matchCodes(code) {
    if (code === "good_friday") return ["good_friday", "holy_week"];
    if (code === "holy_week") return ["holy_week", "good_friday"];
    if (code === "lent") return ["lent", "good_friday"];
    if (code === "easter") return ["easter"];
    if (code === "pentecost") return ["pentecost"];
    if (code === "advent") return ["advent"];
    if (code === "christmas") return ["christmas"];
    if (code === "epiphany") return ["epiphany"];
    if (code === "trinity_sunday") return ["trinity_sunday"];
    return [];
  }

  root.B100LiturgicalYear = {
    easterGregorian: easterGregorian,
    adventOne: adventOne,
    seasonOf: seasonOf,
    matchCodes: matchCodes
  };
})(typeof window !== "undefined" ? window : globalThis);
