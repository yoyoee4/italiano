/* ══════════════════════════════════════════════
   VolaLingo — Practice Core Module
   Session management, XP/Hearts/SRS, core flow
   Sprint C4A: Extracted from practice.js — Zero behavior change
   ══════════════════════════════════════════════ */

const PracticeCore = (() => {

// ══════════════════════════════════════════════
// DEPENDENCIES (injected by app.js on init)
// ══════════════════════════════════════════════
let _state = null;
let _save = null;
let _toast = null;
let _Events = null;
let _APP_DATA = null;
let _APP_CONFIG = null;

// ══════════════════════════════════════════════
// INTERNAL STATE
// ══════════════════════════════════════════════
let _session = null;        // Active session object
let _quizQueue = null;      // Current quiz questions
let _quizIdx = 0;           // Current question index
let _quizScore = 0;         // Score accumulator
let _quizCombo = 0;         // Current combo
let _quizMaxCombo = 0;      // Max combo in session
let _ankiQueue = [];        // Anki review queue
let _ankiIdx = 0;
let _ankiRevealed = false;
let _sentenceQueue = [];    // Sentence practice queue
let _sentenceIdx = 0;
let _dialogueQueue = [];    // Dialogue practice queue
let _dialogueIdx = 0;

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════
function init(dependencies) {
  _state = dependencies.state;
  _save = dependencies.save;
  _toast = dependencies.toast;
  _Events = dependencies.Events;
  _APP_DATA = dependencies.APP_DATA;
  _APP_CONFIG = dependencies.APP_CONFIG;

  console.log('🎯 PracticeCore module initialized');
  return api;
}

// ══════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════
function getWordsForNode(node) {
  var cat = node.category || node.id;
  var found = (_APP_DATA.words || []).filter(function(w) { return w.cat === cat; });
  if (found.length > 0) return found.slice(0, 8);
  var heCat = window.CATEGORY_MAP && window.CATEGORY_MAP[cat];
  if (heCat) {
    found = (_APP_DATA.words || []).filter(function(w) { return w.cat === heCat; });
    if (found.length > 0) return found.slice(0, 8);
  }
  found = (_APP_DATA.words || []).filter(function(w) { return w.catAliases && w.catAliases.indexOf(cat) !== -1; });
  if (found.length > 0) return found.slice(0, 8);
  found = (_APP_DATA.words || []).filter(function(w) { return node.name.indexOf(w.cat) !== -1 || w.cat.indexOf(node.name) !== -1; });
  return found.slice(0, 8);
}

function getSentencesForNode(node) {
  var cat = node.category || node.id;
  var found = (_APP_DATA.sentences || []).filter(function(s) { return s.cat === cat; });
  if (found.length > 0) return found.slice(0, 5);
  var heCat = window.CATEGORY_MAP && window.CATEGORY_MAP[cat];
  if (heCat) {
    found = (_APP_DATA.sentences || []).filter(function(s) { return s.cat === heCat; });
    if (found.length > 0) return found.slice(0, 5);
  }
  found = (_APP_DATA.sentences || []).filter(function(s) { return s.catAliases && s.catAliases.indexOf(cat) !== -1; });
  if (found.length > 0) return found.slice(0, 5);
  found = (_APP_DATA.sentences || []).filter(function(s) { return node.name.indexOf(s.cat) !== -1 || s.cat.indexOf(node.name) !== -1; });
  return found.slice(0, 5);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getDistractors(words, correct, field) {
  const others = words.filter(w => w[field] !== correct[field]);
  return shuffle([...others]).slice(0, 3).map(w => w[field]);
}

function esc(s) {
  return String(s).replace(/'/g, "\\'").replace(/\"/g, '"').replace(/\n/g, ' ');
}

function getNodeProgress(nodeId) {
  return _state.nodeProgress[nodeId] || { crown: 0, done: false, bestScore: 0 };
}

function isUnlocked(node) {
  if (!node.prerequisite) return true;
  const prev = _APP_DATA.skillTree.find(n => n.id === node.prerequisite);
  if (!prev) return true;
  return getNodeProgress(prev.id).crown >= 0;
}

function _emit(event, data) {
  if (_Events) _Events.emit(event, data);
  window.dispatchEvent(new CustomEvent('practice:' + event, { detail: data }));
}

// ══════════════════════════════════════════════
// SESSION MANAGEMENT
// ══════════════════════════════════════════════
function createSession(config) {
  _session = {
    type: config.type || 'mixed',      // 'word', 'sentence', 'quiz', 'dialogue', 'anki', 'mixed'
    node: config.node || null,
    words: config.words || [],
    sentences: config.sentences || [],
    totalQuestions: config.totalQuestions || 8,
    currentIndex: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    xpEarned: 0,
    startedAt: Date.now(),
    mistakes: [],
    correctWords: []
  };
  _quizIdx = 0;
  _quizScore = 0;
  _quizCombo = 0;
  _quizMaxCombo = 0;
  return _session;
}

function getSession() {
  return _session;
}

function endSession() {
  if (!_session) return null;
  const summary = {
    type: _session.type,
    nodeId: _session.node?.id,
    totalQuestions: _session.totalQuestions,
    answered: _session.currentIndex,
    score: _session.score,
    maxCombo: _session.maxCombo,
    xpEarned: _session.xpEarned,
    duration: Date.now() - _session.startedAt,
    mistakes: _session.mistakes,
    correctWords: _session.correctWords
  };
  _session = null;
  return summary;
}

// ══════════════════════════════════════════════
// XP / HEARTS / SRS HELPERS
// ══════════════════════════════════════════════
function addXP(amount, source = 'practice') {
  if (!_state) return;
  _state.xp += amount;
  _state.coins += Math.ceil(amount / 3);
  _state.leagueXP += amount;
  _save();
  _emit('xp:added', { amount, source, totalXP: _state.xp, totalCoins: _state.coins });
}

function useHeart() {
  if (!_state) return false;
  const h = getHearts();
  if (h.count <= 0) {
    if (_toast) _toast('❤️ אזלו הלבבות! חכה או קנה בחנות', 'error');
    return false;
  }
  _state.hearts--;
  if (_state.hearts <= 0) _state.heartsRefill = Date.now();
  _save();
  _emit('hearts:changed', { count: _state.hearts });
  return true;
}

function getHearts() {
  if (!_state) return { count: 5, refillIn: 0 };
  const elapsed = Date.now() - _state.heartsRefill;
  const refilled = Math.floor(elapsed / (30 * 60 * 1000));
  if (refilled > 0 && _state.hearts < 5) {
    _state.hearts = Math.min(5, _state.hearts + refilled);
    _state.heartsRefill = Date.now();
    _save();
  }
  return { 
    count: _state.hearts, 
    refillIn: Math.max(0, 30 * 60 * 1000 - (Date.now() - _state.heartsRefill)) 
  };
}

function trackWeakWord(word) {
  if (!_state) return;
  const existing = _state.weakWords?.find(w => w.word === word);
  if (existing) {
    existing.misses++;
    existing.lastMiss = Date.now();
  } else {
    _state.weakWords = _state.weakWords || [];
    _state.weakWords.push({ word, misses: 1, lastMiss: Date.now() });
  }
  _state.weakWords.sort((a, b) => b.misses - a.misses);
  _state.weakWords = _state.weakWords.slice(0, 30);
  _save();
  _emit('weakWords:updated', { weakWords: _state.weakWords });
}

function addCorrectWord(wordObj) {
  if (!_state || !wordObj || !wordObj.target) return;
  const existing = _state.correctWords?.find(w => w.target === wordObj.target);
  if (existing) {
    existing.count++;
    existing.lastCorrect = Date.now();
  } else {
    _state.correctWords = _state.correctWords || [];
    _state.correctWords.push({
      target: wordObj.target,
      native: wordObj.native || '',
      count: 1,
      lastCorrect: Date.now()
    });
  }
  _save();
  _emit('correctWords:added', { word: wordObj.target });
}

function addAnkiCard(word) {
  if (!anki[word.target]) {
    anki[word.target] = {
      front: word.target, back: word.native, cat: word.cat,
      interval: 1, ease: 2.5, due: Date.now(),
      lapses: 0
    };
    saveAnki();
  }
}

function getAnkiDueCount() {
  const now = Date.now();
  return Object.values(anki).filter(c => c.due <= now).length;
}

// ══════════════════════════════════════════════
// ENTRY POINTS (called from SkillTree, Features, etc.)
// ══════════════════════════════════════════════
function startWordLesson(node) {
  const words = node.words || getWordsForNode(node);
  if (words.length === 0) { _toast('אין מילים בנושא זה', 'error'); return; }

  goPage('practice');
  createSession({ type: 'word', node, words, totalQuestions: words.length });
  _renderWordPhase();
}

function startSentenceLesson(node) {
  const sentences = node.sentences || getSentencesForNode(node);
  if (sentences.length === 0) { _toast('אין משפטים בנושא', 'error'); return; }

  goPage('practice');
  _sentenceQueue = shuffle([...sentences]);
  _sentenceIdx = 0;
  createSession({ type: 'sentence', node, sentences, totalQuestions: sentences.length });
  _renderSentence();
}

function startQuiz(node) {
  if (PracticeCore._insideStartQuiz) return;
  PracticeCore._insideStartQuiz = true;

  goPage('practice');
  PracticeCore._quizNode = node;
  const words = node.words || getWordsForNode(node);
  if (words.length < 4) { _toast('אין מספיק מילים לחידון', 'error'); PracticeCore._insideStartQuiz = false; return; }

  _buildQuizQuestions(words);
  _quizIdx = 0; _quizScore = 0; _quizCombo = 0; _quizMaxCombo = 0;
  createSession({ type: 'quiz', node, words, totalQuestions: _quizQueue.length });
  _renderQuizQuestion(node);
  PracticeCore._insideStartQuiz = false;
}

function startDialogue(node) {
  const dialogues = _APP_DATA.dialogues || [];
  const cat = node.category || node.id;
  const matching = dialogues.filter(d => d.cat === cat);
  if (matching.length === 0) { _toast('אין שיחות בנושא', 'error'); return; }

  goPage('practice');
  const dlg = matching[0];
  _dialogueQueue = dlg.lines || [];
  _dialogueIdx = 0;
  PracticeCore._dialogueNode = node;
  createSession({ type: 'dialogue', node, totalQuestions: _dialogueQueue.length });
  _renderDialogueLine();
}

function startAnki() {
  const now = Date.now();
  _ankiQueue = Object.values(anki).filter(c => c.due <= now);
  if (_ankiQueue.length === 0) {
    _toast('✅ אין כרטיסים מחכים!', 'success'); return;
  }
  _ankiQueue = shuffle(_ankiQueue);
  _ankiIdx = 0;
  goPage('practice');
  createSession({ type: 'anki', totalQuestions: _ankiQueue.length });
  _renderAnkiCard();
}

function startCILSExam(level) {
  const examData = (_APP_DATA.cilsExams || []).find(e => e.level === level);
  if (!examData) { _toast('אין מבחן זמין לרמה זו', 'error'); return; }

  goPage('practice');
  const questions = examData.questions || [];
  _quizIdx = 0; _quizScore = 0; _quizCombo = 0;
  _quizQueue = questions;
  PracticeCore._quizNode = { id: 'exam_' + level, name: 'CILS ' + level, icon: '📋', level };
  createSession({ type: 'exam', node: PracticeCore._quizNode, totalQuestions: questions.length });
  _renderExamQuestion(level);
}

function startWeakWords() {
  if (!_state.weakWords || _state.weakWords.length === 0) {
    _toast('✅ אין מילים חלשות!', 'success'); return;
  }

  goPage('practice');
  const container = document.getElementById('practiceContent');
  const weak = _state.weakWords.slice(0, 10);

  container.innerHTML = `
    <button class="back-btn" onclick="goPage('learn')">← חזרה</button>
    <h2 class="section-title"><span class="emoji">💪</span> מילים חלשות — אימון ממוקד</h2>
    <p style="font-size:.85rem;color:var(--text2);margin-bottom:16px">אלו המילים שטעית בהן הכי הרבה. תרגל אותן!</p>
    ${weak.map(w => {
      const wordData = findWord(w.word);
      if (!wordData) return '';
      return `
        <div class="word-item">
          <div class="word-left">
            <div class="word-it">${wordData.target}</div>
            <div class="word-he">${wordData.native}</div>
          </div>
          <div class="word-right">
            <span style="font-size:.7rem;color:var(--red)">❌ ${w.misses} טעויות</span>
            <button class="speak-btn" onclick="speak('${esc(wordData.target)}')">🔊</button>
          </div>
        </div>
      `;
    }).join('')}
    <button class="btn btn-primary btn-block" style="margin-top:16px" onclick="PracticeCore.startWeakQuiz()">🧠 התחל חידון ממוקד</button>
  `;
}

function startWeakQuiz() {
  if (!_state.weakWords || _state.weakWords.length < 3) return;
  const weak = _state.weakWords.slice(0, 8);
  const words = weak.map(w => findWord(w.word)).filter(Boolean);
  if (words.length < 3) { _toast('אין מספיק מילים', 'error'); return; }

  _buildQuizQuestions(words);
  _quizIdx = 0; _quizScore = 0; _quizCombo = 0;
  PracticeCore._quizNode = { id: 'weak_words', name: 'מילים חלשות', icon: '💪', level: _state.currentLevel || 'A1' };
  createSession({ type: 'quiz', node: PracticeCore._quizNode, words, totalQuestions: _quizQueue.length });
  _renderQuizQuestion(PracticeCore._quizNode);
}

function findWord(it) {
  return (_APP_DATA.words || []).find(w => w.target === it);
}

// ══════════════════════════════════════════════
// MIXED PRACTICE (main entry from Practice.render())
// ══════════════════════════════════════════════
function render() {
  startMixedPractice(false);
}

function getWordsForLevel(level) {
  const levelOrder = ['A1','A2','B1','B2','C1','C2'];
  const maxIdx = levelOrder.indexOf(level);
  if (maxIdx === -1) return [];

  const nodes = (_APP_DATA.skillTree || []).filter(n => {
    const idx = levelOrder.indexOf(n.level);
    return idx >= 0 && idx <= maxIdx;
  });

  let allWords = [];
  nodes.forEach(n => {
    const words = getWordsForNode(n);
    if (words.length > 0) allWords = allWords.concat(words);
  });

  const seen = new Set();
  allWords = allWords.filter(w => {
    if (seen.has(w.target)) return false;
    seen.add(w.target);
    return true;
  });

  return shuffle(allWords);
}

function startMixedPractice(isFull) {
  const allWords = getWordsForLevel(_state.level || 'A1');
  if (allWords.length < 4) {
    showPracticeMenu();
    return;
  }

  const count = isFull ? Math.min(allWords.length, 20) : Math.min(allWords.length, 8);
  const chosen = allWords.slice(0, count);

  const mixedNode = {
    id: isFull ? 'full_mixed_practice' : 'mixed_practice',
    name: isFull ? 'תרגול מלא' : 'תרגול מעורב',
    icon: '🎯',
    words: chosen,
    isMixed: true,
    isFull: isFull
  };

  PracticeCore._quizNode = mixedNode;
  const words = mixedNode.words || getWordsForNode(mixedNode);
  if (words.length < 4) { showPracticeMenu(); return; }

  _buildQuizQuestions(words);
  _quizIdx = 0; _quizScore = 0; _quizCombo = 0; _quizMaxCombo = 0;
  createSession({ type: 'quiz', node: mixedNode, words, totalQuestions: _quizQueue.length, isMixed: true, isFull: isFull });
  _renderQuizQuestion(mixedNode);
}

function _buildQuizQuestions(words) {
  _quizQueue = [];
  const shuffled = shuffle([...words]);

  shuffled.slice(0, 3).forEach(w => {
    const distractors = getDistractors(words, w, 'native');
    _quizQueue.push({ type: 'choose', q: w.target, a: w.native, options: shuffle([w.native, ...distractors]).slice(0, 4), qLang: 'target' });
  });

  shuffled.slice(3, 6).forEach(w => {
    const distractors = getDistractors(words, w, 'target');
    _quizQueue.push({ type: 'choose', q: w.native, a: w.target, options: shuffle([w.target, ...distractors]).slice(0, 4), qLang: 'native' });
  });

  if (shuffled.length > 6) {
    shuffled.slice(6, 8).forEach(w => {
      _quizQueue.push({ type: 'type', q: w.native, a: w.target, qLang: 'native' });
    });
  }
}

// ══════════════════════════════════════════════
// PRACTICE MENU (fallback when not enough words)
// ══════════════════════════════════════════════
function showPracticeMenu() {
  const container = document.getElementById('practiceContent');
  const ankiDue = getAnkiDueCount();
  const weakCount = (_state.weakWords || []).length;

  container.innerHTML = `
    <h2 class="section-title"><span class="emoji">🎯</span> תרגול</h2>
    <p style="font-size:.85rem;color:var(--text3);margin:-8px 0 12px">עבר לתפריט נושאים</p>

    ${ankiDue > 0 ? `
      <div class="card card-clickable" style="border-color:var(--indigo)" onclick="PracticeCore.startAnki()">
        <div class="card-title">🧠 חזרות Anki</div>
        <div class="card-desc">${ankiDue} כרטיסים מחכים לחזרה</div>
        <button class="btn btn-primary btn-sm" style="margin-top:8px">התחל</button>
      </div>
    ` : ''}

    ${weakCount > 0 ? `
      <div class="card card-clickable" style="border-color:var(--red)" onclick="PracticeCore.startMistakesReview()">
        <div class="card-title">💪 מילים חלשות</div>
        <div class="card-desc">${weakCount} מילים שטעית בהן — אימון ממוקד</div>
        <button class="btn btn-danger btn-sm" style="margin-top:8px">תרגל</button>
      </div>
    ` : ''}

    <h3 class="section-title"><span class="emoji">📝</span> בחר נושא לתרגול</h3>
    <div class="cat-grid">
      ${(_APP_DATA.skillTree || []).slice(0, 12).map(n => {
        const prog = getNodeProgress(n.id);
        const unlocked = isUnlocked(n);
        return `
          <div class="cat-item ${!unlocked?'locked':''}" onclick="${unlocked ? `PracticeCore.startQuiz(_APP_DATA.skillTree.find(x=>x.id==='${n.id}'))` : ''}">
            <div class="cat-icon">${n.icon}</div>
            <div class="cat-name">${n.name}</div>
            <div class="cat-count">${prog.crown}/5 👑</div>
          </div>
        `;
      }).join('')}
    </div>

    <h3 class="section-title"><span class="emoji">🎤</span> תרגול הקלטה</h3>
    <div class="card card-clickable" onclick="PracticeCore.startRandomSentences()">
      <div class="card-title">🗣️ משפטים אקראיים</div>
      <div class="card-desc">תרגל הגייה עם הקלטה וציון</div>
      <button class="btn btn-primary btn-sm" style="margin-top:8px">🎤 התחל</button>
    </div>
    <div class="card card-clickable" style="border-color:var(--indigo)" onclick="SentBuild.start()">
      <div class="card-title">🧩 בניית משפטים</div>
      <div class="card-desc">סדר את המילים במשפט הנכון — אתגר סדר מילים</div>
      <button class="btn btn-primary btn-sm" style="margin-top:8px">🧩 התחל</button>
    </div>
    <div class="card card-clickable" style="border-color:var(--indigo)" onclick="Listening.start('${_state.level}')">
      <div class="card-title">🎧 הבנת הנשמע</div>
      <div class="card-desc">שמע משפט באיטלקית ובחר את התרגום הנכון בעברית</div>
      <button class="btn btn-primary btn-sm" style="margin-top:8px">🎧 התחל</button>
    </div>
    <div class="card card-clickable" style="border-color:var(--orange)" onclick="nav('exams')">
      <div class="card-title">📝 מבחנים רשמיים</div>
      <div class="card-desc">התכונן למבחני ההסמכה של AIL Firenze — DELI, DILI, DALI</div>
      <button class="btn btn-primary btn-sm" style="margin-top:8px">📝 פתח</button>
    </div>
    <div class="card card-clickable" onclick="nav('grammar')">
      <div class="card-title">📖 טיפים דקדוקיים</div>
      <div class="card-desc">35 טיפים דקדוקיים מאיטלקית ברמות A1 עד C2</div>
      <button class="btn btn-primary btn-sm" style="margin-top:8px">📖 פתח</button>
    </div>
  `;
}

function startRandomSentences() {
  const allSentences = _APP_DATA.sentences || [];
  if (allSentences.length === 0) { _toast('אין משפטים', 'error'); return; }
  _sentenceQueue = shuffle([...allSentences]).slice(0, 10);
  _sentenceIdx = 0;
  goPage('practice');
  createSession({ type: 'sentence', totalQuestions: _sentenceQueue.length });
  _renderSentence();
}

function startMistakesReview() {
  const weak = _state.weakWords || [];
  if (weak.length < 3) return _toast('אין לך מספיק מילים חלשות כדי לתרגל! כל הכבוד!', 'success');

  const wordsToPractice = weak.map(hw => (_APP_DATA.words||[]).find(w => w.native === hw)).filter(Boolean).slice(0, 5);
  if (wordsToPractice.length < 3) return _toast('אין מספיק מילים לתרגול.', 'warning');

  startWordLesson({ id: 'mistakes', name: 'תרגול טעויות', icon: '❤️', words: wordsToPractice });
}

// ══════════════════════════════════════════════
// PUBLIC API
// ══════════════════════════════════════════════
const api = {
  init,
  // Session management
  createSession,
  getSession,
  endSession,
  // Entry points
  startWordLesson,
  startSentenceLesson,
  startQuiz,
  startDialogue,
  startAnki,
  startCILSExam,
  startWeakWords,
  startWeakQuiz,
  startMixedPractice,
  render,
  showPracticeMenu,
  startRandomSentences,
  startMistakesReview,
  // Helpers
  getWordsForNode,
  getSentencesForNode,
  getWordsForLevel,
  getAnkiDueCount,
  getNodeProgress,
  isUnlocked,
  // Internal state access (for other practice modules)
  _session: null,
  _quizNode: null,
  _dialogueNode: null,
  _wordLesson: null,
  _insideStartQuiz: false
};

return api;

})();

// Expose globally
window.PracticeCore = PracticeCore;

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PracticeCore;
}