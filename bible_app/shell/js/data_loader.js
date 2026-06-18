/** fetch JSON with file:// fallback via data_bundle.js */
(function (global) {
  function prefix() {
    var p = (location.pathname || '').replace(/\\/g, '/');
    return p.indexOf('/pages/') >= 0 ? '../data/' : 'data/';
  }

  function fromBundle(key) {
    if (!global.B100_DATA || !global.B100_DATA[key]) {
      return Promise.reject(new Error('no bundle'));
    }
    return Promise.resolve(global.B100_DATA[key]);
  }

  function loadJson(fileName, bundleKey) {
    var url = prefix() + fileName;
    return fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('fetch');
        return r.json();
      })
      .catch(function () {
        return fromBundle(bundleKey);
      });
  }

  global.B100DataLoader = {
    thirtyDay: function () { return loadJson('thirty_day_plan.json', 'thirtyDay'); },
    golden: function () { return loadJson('golden_verses_100.json', 'golden'); },
    thematic: function () { return loadJson('thematic_readings.json', 'thematic'); },
    books: function () { return loadJson('books.json', 'books'); },
    sample: function () { return loadJson('sample_bible.json', 'sample'); },
  };
})(window);
