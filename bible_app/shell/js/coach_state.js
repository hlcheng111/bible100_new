/** 教練模組本機狀態：能量環、小隊留言（不取代 read_progress） */
(function (global) {
  var KEY = 'bible100_coach_state_v1';
  var SCHEMA = 1;

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function emptyDaily() {
    return {
      date: todayStr(),
      unit_key: '',
      ring: { started: false, read: false, reflect: false, shared: false },
    };
  }

  function defaults() {
    return {
      schema_version: SCHEMA,
      daily: emptyDaily(),
      squad: {
        name: '',
        goal: '',
        members: [],
        posts: [],
      },
      mentor: { last_week_review_at: '' },
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return defaults();
      var data = JSON.parse(raw);
      if (!data.schema_version) data = Object.assign(defaults(), data);
      if (!data.daily || data.daily.date !== todayStr()) {
        data.daily = emptyDaily();
      }
      if (!data.squad) data.squad = defaults().squad;
      if (!data.mentor) data.mentor = defaults().mentor;
      return data;
    } catch (e) {
      return defaults();
    }
  }

  function save(data) {
    data.schema_version = SCHEMA;
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function setRing(step, value) {
    var data = load();
    if (data.daily.ring[step] !== undefined) data.daily.ring[step] = !!value;
    save(data);
    return data.daily.ring;
  }

  function setDailyUnit(unitKey) {
    var data = load();
    data.daily.unit_key = unitKey || '';
    data.daily.ring.started = true;
    save(data);
    return data.daily;
  }

  function ringCount(ring) {
    ring = ring || load().daily.ring;
    var n = 0;
    if (ring.started) n += 1;
    if (ring.read) n += 1;
    if (ring.reflect) n += 1;
    if (ring.shared) n += 1;
    return n;
  }

  function addSquadPost(type, text, author) {
    var data = load();
    var post = {
      id: 'p' + Date.now(),
      type: type === 'prayer' ? 'prayer' : 'light',
      text: String(text || '').slice(0, 120),
      author: author || '',
      at: Date.now(),
    };
    data.squad.posts.unshift(post);
    if (data.squad.posts.length > 50) data.squad.posts.length = 50;
    save(data);
    return post;
  }

  function updateSquad(patch) {
    var data = load();
    patch = patch || {};
    if (patch.name != null) data.squad.name = String(patch.name).slice(0, 40);
    if (patch.goal != null) data.squad.goal = String(patch.goal).slice(0, 80);
    if (patch.members) data.squad.members = patch.members.slice(0, 6);
    save(data);
    return data.squad;
  }

  global.B100CoachState = {
    KEY: KEY,
    load: load,
    save: save,
    setRing: setRing,
    setDailyUnit: setDailyUnit,
    ringCount: ringCount,
    addSquadPost: addSquadPost,
    updateSquad: updateSquad,
    todayStr: todayStr,
  };
})(typeof window !== 'undefined' ? window : global);
