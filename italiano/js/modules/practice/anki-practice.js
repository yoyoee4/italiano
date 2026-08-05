/* ══════════════════════════════════════════════
   VolaLingo — Anki Practice Module
   SRS review logic
   Sprint C4A: Extracted from practice.js — Zero behavior change
   ══════════════════════════════════════════════ */

const AnkiPractice = (() => {

// ══════════════════════════════════════════════
// DEPENDENCIES
// ══════════════════════════════════════════════
let _core = null;
let _state = null;
let _save = null;
let _toast = null;
let _APP_CONFIG = null;

// ══════════════════════════════════════════════
// INTERNAL STATE
// ══════════════════════════════════════════════
let _ankiQueue = [];
let _ankiIdx = 0;
let _ankiRevealed = false;

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════
function init(coreModule) {
  _core = coreModule;
  _state = _core._state;
  _save = _core._save;
  _toast = _core._toast;
  _APP_CONFIG = _core._APP_CONFIG;

  console.log('🧠 AnkiPractice module initialized');
  return api;
}

// ══════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════
function addXP(amount) { _core.addXP(amount, 'anki'); }
function addDaily() { _core.addDaily ? _core.addDaily() : null; }
function esc(s) { return String(s).replace(/'/g, "\\'").replace(/\"/g, '"').replace(/\n/g, ' '); }
function speak(text) { window.speak ? window.speak(text) : null; }
function shuffle(arr) { 
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function saveAnki() { window.saveAnki ? window.saveAnki() : null; }

// ══════════════════════════════════════════════
// ANKI REVIEW FLOW
// ══════════════════════════════════════════════
function startAnki(renderFn) {
  const now = Date.now();
  _ankiQueue = Object.values(anki).filter(c => c.due <= now);
  if (_ankiQueue.length === 0) {
    _toast('✅ אין כרטיסים מחכים!', 'success'); return;
  }
  _ankiQueue = shuffle(_ankiQueue);
  _ankiIdx = 0;
  _ankiRevealed = false;
  _core.createSession({ type: 'anki', totalQuestions: _ankiQueue.length });
  goPage('practice');
  _renderAnkiCard(renderFn);
}

function _renderAnkiCard(renderFn) {
  if (_ankiIdx >= _ankiQueue.length) {
    _finishAnki(renderFn);
    return;
  }

  const card = _ankiQueue[_ankiIdx];
  _ankiRevealed = false;
  const session = _core.getSession();
  if (session) session.currentIndex = _ankiIdx + 1;

  if (renderFn) {
    renderFn('anki', { 
      card, 
      index: _ankiIdx, 
      total: _ankiQueue.length,
      revealed: false
    });
  }

  speak(card.front);
}

function revealAnki(renderFn) {
  if (_ankiRevealed) return;
  _ankiRevealed = true;
  if (renderFn) {
    renderFn('anki-reveal', { index: _ankiIdx });
  }
}

function rateAnki(quality, renderFn) {
  const card = _ankiQueue[_ankiIdx];
  const c = anki[card.front];
  if (!c) { _ankiIdx++; _renderAnkiCard(renderFn); return; }

  // SM-2 simplified
  if (quality === 0) { // forgot
    c.interval = 1; c.ease = Math.max(1.3, c.ease - 0.2); c.lapses++;
    c.due = Date.now() + 60000; // 1 min
  } else if (quality === 1) { // hard
    c.interval = Math.max(1, Math.round(c.interval * 1.2));
    c.ease = Math.max(1.3, c.ease - 0.15);
    c.due = Date.now() + c.interval * 3600000; // hours
  } else if (quality === 2) { // good
    c.interval = Math.max(1, Math.round(c.interval * c.ease));
    c.due = Date.now() + c.interval * 86400000; // days
  } else { // easy
    c.interval = Math.max(1, Math.round(c.interval * c.ease * 1.3));
    c.ease += 0.15;
    c.due = Date.now() + c.interval * 86400000; // days
  }

  saveAnki();
  _ankiIdx++;
  _renderAnkiCard(renderFn);
}

function _finishAnki(renderFn) {
  const session = _core.getSession();
  if (session) session.xpEarned += _ankiQueue.length * 5;
  addXP(_ankiQueue.length * 5);
  addDaily();

  if (renderFn) {
    renderFn('complete', { type: 'anki', reviewed: _ankiQueue.length });
  }

  _core.endSession();
  _ankiQueue = [];
  _ankiIdx = 0;
}

function getAnkiDueCount() {
  const now = Date.now();
  return Object.values(anki).filter(c => c.due <= now).length;
}

// ══════════════════════════════════════════════
// PUBLIC API
// ══════════════════════════════════════════════
const api = {
  init,
  startAnki,
  revealAnki,
  rateAnki,
  getAnkiDueCount,
  _ankiQueue: [],
  _ankiIdx: 0,
  _ankiRevealed: false
};

return api;

})();

window.AnkiPractice = AnkiPractice;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnkiPractice;
}