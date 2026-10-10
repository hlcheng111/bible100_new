/**
 * 聖詩影音庫 · IndexedDB 儲存與 JSON 契約（Phase B）
 * schema: bible100.yt_sacred_library @ 3
 * 本機優先；不上雲為預設。不接 YouTube Data API。
 */
(function (global) {
  "use strict";

  var DB_NAME = "bible100_yt_sacred_v3";
  var DB_VER = 1;
  var SCHEMA = "bible100.yt_sacred_library";
  var SCHEMA_VERSION = 3;
  var LS_SOURCES = "yt_sourceVideos";
  var LS_TRACKS = "yt_masterDatabase";
  var LS_VER = "yt_data_version";

  var _db = null;
  var _ready = null;

  function openDb() {
    if (_ready) return _ready;
    _ready = new Promise(function (resolve, reject) {
      if (!global.indexedDB) {
        reject(new Error("此瀏覽器不支援 IndexedDB"));
        return;
      }
      var req = indexedDB.open(DB_NAME, DB_VER);
      req.onupgradeneeded = function (ev) {
        var db = ev.target.result;
        if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta");
        if (!db.objectStoreNames.contains("sources")) {
          db.createObjectStore("sources", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("tracks")) {
          var ts = db.createObjectStore("tracks", { keyPath: "id" });
          ts.createIndex("videoId", "videoId", { unique: false });
          ts.createIndex("titleNorm", "titleNorm", { unique: false });
          ts.createIndex("hymn_id", "hymn_id", { unique: false });
          ts.createIndex("hymn_match_status", "hymn_match_status", { unique: false });
        }
      };
      req.onsuccess = function () {
        _db = req.result;
        resolve(_db);
      };
      req.onerror = function () {
        reject(req.error || new Error("IndexedDB open failed"));
      };
    });
    return _ready;
  }

  function txDone(tx) {
    return new Promise(function (resolve, reject) {
      tx.oncomplete = function () { resolve(); };
      tx.onerror = function () { reject(tx.error); };
      tx.onabort = function () { reject(tx.error || new Error("aborted")); };
    });
  }

  function getAll(storeName) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(storeName, "readonly");
        var req = tx.objectStore(storeName).getAll();
        req.onsuccess = function () { resolve(req.result || []); };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  function putAll(storeName, rows) {
    return openDb().then(function (db) {
      var tx = db.transaction(storeName, "readwrite");
      var store = tx.objectStore(storeName);
      store.clear();
      (rows || []).forEach(function (row) {
        if (row && row.id != null) store.put(row);
      });
      return txDone(tx);
    });
  }

  function setMeta(key, value) {
    return openDb().then(function (db) {
      var tx = db.transaction("meta", "readwrite");
      tx.objectStore("meta").put(value, key);
      return txDone(tx);
    });
  }

  function getMeta(key) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction("meta", "readonly");
        var req = tx.objectStore("meta").get(key);
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  /** chapter|ytdlp|import|url_stub|dictionary|memo|legacy */
  function normalizeSourceKind(t) {
    var s = String((t && t.source) || "").toLowerCase();
    var allowed = {
      chapter: 1, ytdlp: 1, import: 1, url_stub: 1,
      dictionary: 1, memo: 1, legacy: 1
    };
    if (allowed[s]) return s;
    return "legacy";
  }

  function isTrustedSource(source) {
    return source === "chapter" || source === "ytdlp" || source === "import";
  }

  function normalizeTrack(t) {
    t = t || {};
    var id = String(t.id || "");
    if (!id) id = "t_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
    var title = String(t.title || "");
    var normFn = (global.YtSacredMatch && global.YtSacredMatch.normalizeTitle) || function (s) {
      return String(s || "").toLowerCase().replace(/\s+/g, " ").trim();
    };
    var source = normalizeSourceKind(t);
    return {
      id: id,
      mainCategory: t.mainCategory || "音樂",
      subCategory: t.subCategory || "",
      styleCat: t.styleCat || "",
      title: title,
      artist: t.artist || "",
      videoTitle: t.videoTitle || "",
      videoId: t.videoId || "",
      time: t.time || "00:00",
      seconds: Number(t.seconds) || 0,
      isFav: !!t.isFav,
      timestamp: Number(t.timestamp) || Date.now(),
      titleNorm: t.titleNorm || normFn(title),
      hymn_id: t.hymn_id || null,
      hymn_label: t.hymn_label || null,
      hymn_path: t.hymn_path || null,
      hymn_match_status: t.hymn_match_status || (t.hymn_id ? "confirmed" : "none"),
      memoImage: t.memoImage ? 1 : 0,
      source: source
    };
  }

  function normalizeSource(s) {
    s = s || {};
    return {
      id: String(s.id || ""),
      title: s.title || "",
      author: s.author || "",
      url: s.url || "",
      mainCategory: s.mainCategory || "音樂",
      subCategory: s.subCategory || "",
      styleCat: s.styleCat || "",
      hasPlaylist: !!s.hasPlaylist,
      trackCount: Number(s.trackCount) || 0
    };
  }

  function readLegacyLocalStorage() {
    var sources = [];
    var tracks = [];
    try {
      sources = JSON.parse(localStorage.getItem(LS_SOURCES) || "null") || [];
      tracks = JSON.parse(localStorage.getItem(LS_TRACKS) || "null") || [];
    } catch (e) {
      sources = [];
      tracks = [];
    }
    return { sources: sources, tracks: tracks };
  }

  function clearLegacyLocalStorage() {
    try {
      localStorage.removeItem(LS_SOURCES);
      localStorage.removeItem(LS_TRACKS);
      localStorage.removeItem(LS_VER);
    } catch (e) {}
  }

  function loadAll() {
    return openDb().then(function () {
      return Promise.all([getAll("sources"), getAll("tracks"), getMeta("migrated")]).then(function (parts) {
        var sources = parts[0];
        var tracks = parts[1];
        var migrated = parts[2];
        if ((!sources.length && !tracks.length) || !migrated) {
          var legacy = readLegacyLocalStorage();
          if (legacy.sources.length || legacy.tracks.length) {
            sources = legacy.sources.map(normalizeSource).filter(function (s) { return s.id; });
            tracks = legacy.tracks.map(normalizeTrack);
            return putAll("sources", sources).then(function () {
              return putAll("tracks", tracks);
            }).then(function () {
              return setMeta("migrated", 1);
            }).then(function () {
              clearLegacyLocalStorage();
              return { sources: sources, tracks: tracks, migratedFrom: "localStorage" };
            });
          }
          return setMeta("migrated", 1).then(function () {
            return { sources: sources, tracks: tracks, migratedFrom: null };
          });
        }
        return {
          sources: sources.map(normalizeSource),
          tracks: tracks.map(normalizeTrack),
          migratedFrom: null
        };
      });
    });
  }

  function saveAll(sources, tracks) {
    var s = (sources || []).map(normalizeSource).filter(function (x) { return x.id; });
    var t = (tracks || []).map(normalizeTrack);
    return putAll("sources", s).then(function () {
      return putAll("tracks", t);
    }).then(function () {
      return setMeta("updated_at", Date.now());
    }).then(function () {
      return { sources: s, tracks: t };
    });
  }

  function buildExport(sources, tracks) {
    return {
      schema: SCHEMA,
      schema_version: SCHEMA_VERSION,
      exported_at: new Date().toISOString(),
      note: "本機聖詩影音知識庫。預設不上雲。不接 YouTube Data API。",
      sources: (sources || []).map(normalizeSource),
      tracks: (tracks || []).map(normalizeTrack)
    };
  }

  function parseImport(data) {
    if (!data || typeof data !== "object") throw new Error("不是 JSON 物件");
    var sources = data.sources || data.sourceVideos || [];
    var tracks = data.tracks || data.masterDatabase || [];
    if (!Array.isArray(sources) || !Array.isArray(tracks)) throw new Error("缺少 sources / tracks 陣列");
    return {
      schema: data.schema || SCHEMA,
      schema_version: Number(data.schema_version) || 0,
      sources: sources.map(normalizeSource).filter(function (s) { return s.id; }),
      tracks: tracks.map(function (t) {
        var copy = Object.assign({}, t || {});
        // 使用者主動匯入：檔內無 source → 標 import（可信）；有則保留
        if (!copy.source) copy.source = "import";
        return normalizeTrack(copy);
      })
    };
  }

  function downloadBlob(obj, filename) {
    var blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  /** 供找／研究頁讀「已確認」捷徑（輕接，不取代找詩；略過字典／舊示範） */
  function getConfirmedForHymnId(hymnId, tracks) {
    var id = String(hymnId || "");
    if (!id) return [];
    return (tracks || []).filter(function (t) {
      if (!t || t.hymn_match_status !== "confirmed" || String(t.hymn_id) !== id) return false;
      return isTrustedSource(normalizeSourceKind(t));
    });
  }

  /** hymn_id → 已確認可信曲目[]（給側欄「也可聽」） */
  function indexConfirmedByHymnId(tracks) {
    var map = {};
    (tracks || []).forEach(function (t) {
      if (!t || t.hymn_match_status !== "confirmed" || !t.hymn_id) return;
      if (!isTrustedSource(normalizeSourceKind(t))) return;
      if (!t.videoId) return;
      var id = String(t.hymn_id);
      if (!map[id]) map[id] = [];
      map[id].push(t);
    });
    return map;
  }

  function watchUrl(videoId, seconds) {
    var id = String(videoId || "").trim();
    if (!id) return "";
    var sec = Math.max(0, Math.floor(Number(seconds) || 0));
    return "https://www.youtube.com/watch?v=" + encodeURIComponent(id) + (sec ? "&t=" + sec + "s" : "");
  }

  function loadConfirmedIndex() {
    return loadAll().then(function (data) {
      return indexConfirmedByHymnId(data.tracks || []);
    }).catch(function () {
      return {};
    });
  }

  global.YtSacredStore = {
    SCHEMA: SCHEMA,
    SCHEMA_VERSION: SCHEMA_VERSION,
    openDb: openDb,
    loadAll: loadAll,
    saveAll: saveAll,
    normalizeTrack: normalizeTrack,
    normalizeSource: normalizeSource,
    normalizeSourceKind: normalizeSourceKind,
    isTrustedSource: isTrustedSource,
    buildExport: buildExport,
    parseImport: parseImport,
    downloadBlob: downloadBlob,
    getConfirmedForHymnId: getConfirmedForHymnId,
    indexConfirmedByHymnId: indexConfirmedByHymnId,
    loadConfirmedIndex: loadConfirmedIndex,
    watchUrl: watchUrl,
    clearLegacyLocalStorage: clearLegacyLocalStorage
  };
})(typeof window !== "undefined" ? window : this);
