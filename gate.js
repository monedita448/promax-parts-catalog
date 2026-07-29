// Basic client-side password gate. This is NOT real security — anyone who
// views source can find the hash below and could brute-force a 3-digit
// code offline in seconds. It exists only to stop a casual visitor or a
// search-engine crawler from seeing the page, per explicit request.
// Change the password by generating a new SHA-256 hex hash and swapping
// the constant below (e.g. in Node: crypto.createHash('sha256').update("NEWPASS").digest('hex')).
(function () {
  var GATE_KEY = 'catalogGateUnlocked';
  var HASH_HEX = '5c3e9040008c91509e2d28e5308034b677d4e2cc0b386863d4883bdb747eba1c';

  function sha256Hex(text) {
    var enc = new TextEncoder().encode(text);
    return crypto.subtle.digest('SHA-256', enc).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return b.toString(16).padStart(2, '0');
      }).join('');
    });
  }

  function isUnlocked() {
    try { return localStorage.getItem(GATE_KEY) === 'yes'; } catch (e) { return false; }
  }

  function unlock() {
    try { localStorage.setItem(GATE_KEY, 'yes'); } catch (e) {}
    var overlay = document.getElementById('gateOverlay');
    if (overlay) overlay.remove();
    document.documentElement.style.overflow = '';
  }

  function showGate() {
    document.documentElement.style.overflow = 'hidden';
    var overlay = document.createElement('div');
    overlay.id = 'gateOverlay';
    overlay.innerHTML =
      '<div class="gate-card">' +
        '<p class="gate-label">Password</p>' +
        '<input type="password" id="gateInput" autocomplete="off" inputmode="numeric">' +
        '<button id="gateSubmit" type="button">Enter</button>' +
        '<p class="gate-error" id="gateError" style="display:none;">Incorrect password</p>' +
      '</div>';
    document.body.appendChild(overlay);

    var input = document.getElementById('gateInput');
    var errorEl = document.getElementById('gateError');

    function attempt() {
      if (!input.value) return;
      sha256Hex(input.value).then(function (hash) {
        if (hash === HASH_HEX) {
          unlock();
        } else {
          errorEl.style.display = 'block';
          input.value = '';
          input.focus();
        }
      });
    }

    document.getElementById('gateSubmit').addEventListener('click', attempt);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') attempt();
    });
    input.focus();
  }

  if (!isUnlocked()) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showGate);
    } else {
      showGate();
    }
  }
})();
