/**
 * Bible100 Progress 學習進度載入
 * 讀取 data/progress.json 或 localStorage
 */
(function(global) {
  'use strict';
  var STORAGE_KEY = 'bible100_progress';
  function getDataPath() {
    if (typeof document !== 'undefined' && document.currentScript && document.currentScript.src) {
      var src = document.currentScript.src;
      var dir = src.replace(/\/[^/]+$/, '/');
      return dir + '../data/progress.json';
    }
    return 'data/progress.json';
  }

  function ProgressDB() {
    this._cache = null;
  }

  ProgressDB.prototype._load = function() {
    if (this._cache) return this._cache;
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var data = JSON.parse(raw);
        this._cache = data.progress || [];
        return this._cache;
      }
    } catch (e) {}
    this._cache = [];
    return this._cache;
  };

  ProgressDB.prototype.loadFromFile = function(callback) {
    var self = this;
    if (typeof fetch !== 'undefined') {
      var path = getDataPath();
      fetch(path).then(function(r) { return r.json(); }).then(function(data) {
        var list = data.progress || [];
        self._cache = list;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ progress: list }));
        if (callback) callback(list);
      }).catch(function() {
        self._load();
        if (callback) callback(self._cache);
      });
    } else {
      self._load();
      if (callback) callback(self._cache);
    }
  };

  ProgressDB.prototype.getByPerson = function(personId) {
    return this._load().filter(function(p) { return p.person_id === personId; });
  };

  ProgressDB.prototype.getByCourse = function(courseId) {
    return this._load().filter(function(p) { return p.course_id === courseId; });
  };

  global.ProgressDB = ProgressDB;
  global.progressDB = global.progressDB || new ProgressDB();
})(typeof window !== 'undefined' ? window : this);
