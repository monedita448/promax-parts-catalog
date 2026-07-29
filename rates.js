// Shared USD -> COP rate fetching + caching. Used by both the catalog
// (per-product COP equivalents) and calculadora.html, so both surfaces
// always agree on the same cached rate.
var RATES = (function () {
  var STORAGE_KEY = 'copUsdRate';
  var API_URL = 'https://open.er-api.com/v6/latest/USD';

  function isSameDay(ts) {
    if (!ts) return false;
    var a = new Date(ts), b = new Date();
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
  }

  function readCache() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function writeCache(rate, timestamp) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ rate: rate, timestamp: timestamp }));
    } catch (e) {}
  }

  // callback(state) where state = { rate, timestamp, offline, ok }
  function ensureRate(force, callback) {
    var cached = readCache();
    if (!force && cached && isSameDay(cached.timestamp)) {
      callback({ rate: cached.rate, timestamp: cached.timestamp, offline: false, ok: true });
      return;
    }

    fetch(API_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('bad response');
        return res.json();
      })
      .then(function (data) {
        var rate = data && data.rates && data.rates.COP;
        if (!rate) throw new Error('no rate in response');
        var now = Date.now();
        writeCache(rate, now);
        callback({ rate: rate, timestamp: now, offline: false, ok: true });
      })
      .catch(function () {
        var c = readCache();
        if (c) {
          callback({ rate: c.rate, timestamp: c.timestamp, offline: true, ok: true });
        } else {
          callback({ rate: null, timestamp: null, offline: true, ok: false });
        }
      });
  }

  return { ensureRate: ensureRate, readCache: readCache, isSameDay: isSameDay };
})();
