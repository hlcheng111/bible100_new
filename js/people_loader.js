/**
 * Bible100 People 邏輯中心
 * 跨模組共用人員資料，與 SchoolMasterDatabase、SmartMinistryDatabase 共存
 * 支援 JSON 檔案或 localStorage
 */
(function(global) {
  'use strict';

  var STORAGE_KEY = 'bible100_people';
  var MS_KEY = 'memberSystemData';

  /** file:// 時 fallback：從 memberSystemData 轉為 people 格式 */
  function tryMemberSystemDataFallback() {
    try {
      var raw = localStorage.getItem(MS_KEY);
      if (!raw) return [];
      var d = JSON.parse(raw);
      var members = d.members || [];
      return members.map(function (m) {
        return {
          id: m.id || m.externalId || ('m' + m.id),
          name: m.name || '',
          church: m.church || '',
          region: m.region || '',
          gender: m.gender || '',
          tags: m.gifts ? [m.gifts] : [],
          attendance_count: m.attendance_count || 0,
          last_attendance: m.membershipDate || '',
          created_at: m.membershipDate || ''
        };
      });
    } catch (e) {
      return [];
    }
  }

  /** 依腳本位置推算 data 路徑，支援子路徑部署（如 github.io/專案名/） */
  function getDataPath() {
    if (typeof document !== 'undefined' && document.currentScript && document.currentScript.src) {
      var src = document.currentScript.src;
      var dir = src.replace(/\/[^/]+$/, '/');
      return dir + '../data/people.json';
    }
    return 'data/people.json';
  }

  function PeopleDB() {
    this._cache = null;
  }

  PeopleDB.prototype._load = function() {
    if (this._cache) return this._cache;
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        var data = JSON.parse(raw);
        this._cache = data.people || [];
        return this._cache;
      } catch (e) {
        console.warn('PeopleDB: localStorage parse error', e);
      }
    }
    this._cache = [];
    return this._cache;
  };

  PeopleDB.prototype._save = function(people) {
    this._cache = people;
    var data = { version: '1.0', updated: new Date().toISOString(), people: people };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  PeopleDB.prototype.loadFromFile = function(callback) {
    var self = this;
    if (typeof fetch !== 'undefined') {
      var path = (typeof window !== 'undefined' && (window.BIBLE100_DATA_URL || (window.parent && window.parent !== window && window.parent.BIBLE100_DATA_URL)))
        ? (window.BIBLE100_DATA_URL || window.parent.BIBLE100_DATA_URL) : getDataPath();
      fetch(path).then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + path);
        return r.json();
      }).then(function(data) {
        var list = data.people || [];
        self._cache = list;
        self._save(list);
        if (callback) callback(list);
      }).catch(function(err) {
        console.warn('PeopleDB 載入失敗（file:// 或網路不可用）:', path, err);
        var cached = self._load();
        if (cached.length > 0) {
          if (callback) callback(cached);
          return;
        }
        var fallback = tryMemberSystemDataFallback();
        if (fallback.length > 0) {
          self._cache = fallback;
          self._save(fallback);
          if (callback) callback(fallback);
          return;
        }
        if (callback) callback([]);
      });
    } else {
      self._load();
      if (callback) callback(self._cache);
    }
  };

  PeopleDB.prototype.list = function() {
    return this._load().slice();
  };

  PeopleDB.prototype.get = function(id) {
    return this._load().find(function(p) { return p.id === id; }) || null;
  };

  PeopleDB.prototype.search = function(term) {
    if (!term) return this.list();
    term = String(term).toLowerCase();
    return this._load().filter(function(p) {
      return (p.name && p.name.toLowerCase().indexOf(term) >= 0) ||
             (p.church && p.church.toLowerCase().indexOf(term) >= 0) ||
             (p.tags && p.tags.some(function(t) { return t.toLowerCase().indexOf(term) >= 0; }));
    });
  };

  PeopleDB.prototype.add = function(person) {
    var list = this._load();
    person.id = person.id || 'p' + Date.now();
    person.created_at = person.created_at || new Date().toISOString();
    list.push(person);
    this._save(list);
    return person.id;
  };

  PeopleDB.prototype.update = function(id, updates) {
    var list = this._load();
    var idx = list.findIndex(function(p) { return p.id === id; });
    if (idx < 0) return false;
    for (var k in updates) if (updates.hasOwnProperty(k)) list[idx][k] = updates[k];
    this._save(list);
    return true;
  };

  PeopleDB.prototype.remove = function(id) {
    var list = this._load().filter(function(p) { return p.id !== id; });
    this._save(list);
    return true;
  };

  global.PeopleDB = PeopleDB;
  global.peopleDB = global.peopleDB || new PeopleDB();

})(typeof window !== 'undefined' ? window : this);
