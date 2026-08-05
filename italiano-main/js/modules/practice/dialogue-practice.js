/* ══════════════════════════════════════════════
   VolaLingo — Dialogue Practice Module
   Conversation/dialogue practice logic
   Sprint C4A: Extracted from practice.js — Zero behavior change
   ══════════════════════════════════════════════ */

const DialoguePractice = (() => {

// ══════════════════════════════════════════════
// DEPENDENCIES
// ══════════════════════════════════════════════
let _core = null;
let _state = null;
let _save = null;
let _toast = null;
let _APP_DATA = null;
let _APP_CONFIG = null;

// ══════════════════════════════════════════════
// INTERNAL STATE
// ══════════════════════════════════════════════
let _dialogueQueue = [];
let _dialogueIdx = 0;
let _dialogueNode = null;

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════
function init(coreModule) {
  _core = coreModule;
  _state = _core._state;
  _save = _core._save;
  _toast = _core._toast;
  _APP_DATA = _core._APP_DATA;
  _APP_CONFIG = _core._APP_CONFIG;

  console.log('💬 DialoguePractice module initialized');
  return api;
}

// ══════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════
function addXP(amount) { _core.addXP(amount, 'dialogue'); }
function speak(text) { window.speak ? window.speak(text) : null; }
function esc(s) { return String(s).replace(/'/g, "\\'").replace(/\"/g, '"').replace(/\n/g, ' '); }
function fuzzyMatch(a, b) { return window.fuzzyMatch ? window.fuzzyMatch(a, b) : 0; }
function startListening(lang, cb) { window.startListening ? window.startListening(lang, cb) : cb(null); }
function stopListening() { window.stopListening ? window.stopListening() : null; }
function isListening() { return window.isListening ? window.isListening() : false; }
function goPage(page) { window.goPage ? window.goPage(page) : null; }
function addDaily() { _core.addDaily ? _core.addDaily() : null; }
function getNodeProgress(id) { return _core.getNodeProgress(id); }

// ══════════════════════════════════════════════
// DIALOGUE FLOW
// ══════════════════════════════════════════════
function startDialogue(node, renderFn) {
  const dialogues = _APP_DATA.dialogues || [];
  const cat = node.category || node.id;
  const matching = dialogues.filter(d => d.cat === cat);
  if (matching.length === 0) { _toast('אין שיחות בנושא', 'error'); return; }

  goPage('practice');
  const dlg = matching[0];
  _dialogueQueue = dlg.lines || [];
  _dialogueIdx = 0;
  _dialogueNode = node;
  _core.createSession({ type: 'dialogue', node, totalQuestions: _dialogueQueue.length });
  _renderDialogueLine(renderFn);
}

function _renderDialogueLine(renderFn) {
  if (_dialogueIdx >= _dialogueQueue.length) {
    _finishDialogue(renderFn);
    return;
  }

  const line = _dialogueQueue[_dialogueIdx];
  const isYou = line.role === 'you';
  const session = _core.getSession();
  if (session) session.currentIndex = _dialogueIdx + 1;

  if (renderFn) {
    renderFn('dialogue', { 
      line, 
      index: _dialogueIdx, 
      total: _dialogueQueue.length,
      isYou,
      node: _dialogueNode
    });
  }

  if (!isYou && _dialogueIdx === 0) speak(_dialogueQueue[0].target);
}

function answerDialogue(el, chosen, correct, renderFn) {
  const score = fuzzyMatch(chosen, correct);
  if (score >= 70) {
    el.classList.add('correct');
    addXP(10);
  } else {
    el.classList.add('wrong');
  }
  setTimeout(() => { _dialogueIdx++; _renderDialogueLine(renderFn); }, 1000);
}

function recordDialogue(correct, renderFn) {
  const btn = document.getElementById('dlgMicBtn');
  if (isListening()) { stopListening(); return; }
  btn.classList.add('listening');
  startListening(_APP_CONFIG.targetLang, (results) => {
    btn.classList.remove('listening');
    const resultEl = document.getElementById('dlgResult');
    if (!results) { resultEl.innerHTML = '<span style="color:var(--text3)">לא נשמע</span>'; return; }
    const score = fuzzyMatch(results[0], correct);
    if (score >= 60) {
      resultEl.innerHTML = `<span style="color:var(--emerald)">✅ ${score}%</span>`;
      addXP(15);
      setTimeout(() => { _dialogueIdx++; _renderDialogueLine(renderFn); }, 1000);
    } else {
      resultEl.innerHTML = `<span style="color:var(--orange)">🔄 ${score}% — נסה שוב</span>`;
    }
  });
}

function nextDialogueLine(renderFn) {
  _dialogueIdx++;
  _renderDialogueLine(renderFn);
}

function _finishDialogue(renderFn) {
  const node = _dialogueNode;
  if (node) {
    if (!_state.dialoguesCompleted) _state.dialoguesCompleted = {};
    _state.dialoguesCompleted[node.id] = { date: Date.now() }; _save();
    window.SkillTree?.completeNode(node.id, 80);
  }
  addDaily();

  if (renderFn) {
    renderFn('complete', { type: 'dialogue', node: _dialogueNode });
  }

  _core.endSession();
  _dialogueQueue = [];
  _dialogueIdx = 0;
  _dialogueNode = null;
}

// ══════════════════════════════════════════════
// PUBLIC API
// ══════════════════════════════════════════════
const api = {
  init,
  startDialogue,
  answerDialogue,
  recordDialogue,
  nextDialogueLine,
  _dialogueQueue: [],
  _dialogueIdx: 0,
  _dialogueNode: null
};

return api;

})();

window.DialoguePractice = DialoguePractice;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DialoguePractice;
}