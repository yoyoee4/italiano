/* ══════════════════════════════════════════════
   VolaLingo — Practice Exercises Module
   Word, Sentence, Quiz, Listening, Speaking logic
   Sprint C4A: Extracted from practice.js — Zero behavior change
   ══════════════════════════════════════════════ */

const PracticeExercises = (() => {

// ══════════════════════════════════════════════
// DEPENDENCIES (injected by PracticeCore)
// ══════════════════════════════════════════════
let _core = null;        // Reference to PracticeCore
let _state = null;
let _save = null;
let _toast = null;
let _APP_DATA = null;
let _APP_CONFIG = null;

// ══════════════════════════════════════════════
// INTERNAL STATE
// ══════════════════════════════════════════════
let _wordLessonState = null;    // { node, words, phase, wordIdx, renderFn }
let _sentenceQueue = [];
let _sentenceIdx = 0;
let _dialogueQueue = [];
let _dialogueIdx = 0;

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════
function init(coreModule) {
  _core = coreModule;
  _state = _core._state || coreModule.getState?.();
  _save = _core._save || coreModule.getSave?.();
  _toast = _core._toast || coreModule.getToast?.();
  _APP_DATA = _core._APP_DATA || coreModule.getAppData?.();
  _APP_CONFIG = _core._APP_CONFIG || coreModule.getAppConfig?.();

  console.log('📝 PracticeExercises module initialized');
  return api;
}

// ══════════════════════════════════════════════
// HELPERS (delegated to core)
// ══════════════════════════════════════════════
function getWordsForNode(node) { return _core.getWordsForNode(node); }
function getSentencesForNode(node) { return _core.getSentencesForNode(node); }
function getDistractors(words, correct, field) { return _core.getDistractors ? _core.getDistractors(words, correct, field) : _core.getDistractorsInternal(words, correct, field); }
function esc(s) { return _core.esc ? _core.esc(s) : String(s).replace(/'/g, "\\'").replace(/\"/g, '"').replace(/\n/g, ' '); }
function addXP(amount, source) { _core.addXP(amount, source); }
function useHeart() { return _core.useHeart(); }
function getHearts() { return _core.getHearts(); }
function trackWeakWord(word) { _core.trackWeakWord(word); }
function addCorrectWord(wordObj) { _core.addCorrectWord(wordObj); }
function addAnkiCard(word) { _core.addAnkiCard(word); }
function _emit(event, data) { _core._emit(event, data); }
function fuzzyMatch(a, b) { return window.fuzzyMatch ? window.fuzzyMatch(a, b) : 0; }
function speak(text, lang, rate) { window.speak ? window.speak(text, lang, rate) : null; }
function startListening(lang, cb) { window.startListening ? window.startListening(lang, cb) : cb(null); }
function stopListening() { window.stopListening ? window.stopListening() : null; }
function isListening() { return window.isListening ? window.isListening() : false; }
function confetti() { window.confetti ? window.confetti() : null; }
function goPage(page) { window.goPage ? window.goPage(page) : null; }
function getNodeProgress(id) { return _core.getNodeProgress(id); }
function addDaily() { _core.addDaily ? _core.addDaily() : null; }

// ══════════════════════════════════════════════
// WORD LESSON EXERCISE
// ══════════════════════════════════════════════
function startWordLesson(node, renderFn) {
  const words = node.words || getWordsForNode(node);
  if (words.length === 0) { _toast('אין מילים בנושא זה', 'error'); return null; }

  _wordLessonState = {
    node,
    words,
    phase: 0,
    wordIdx: 0,
    renderFn: renderFn
  };

  // Phase advances every 3 words: 0=listen&choose, 1=read&type, 2=hear&speak
  _wordLessonState.phase = 0;
  _wordLessonState.wordIdx = 0;
  _renderWordPhase();
  return _wordLessonState;
}

function _renderWordPhase() {
  if (!_wordLessonState) return;
  const { node, words, phase, wordIdx, renderFn } = _wordLessonState;
  const w = words[wordIdx];
  
  if (!w || wordIdx >= words.length) {
    _finishWordLesson(node, words);
    return;
  }

  // Delegate rendering to practice-ui
  if (renderFn) {
    renderFn('word', { node, word: w, phase, wordIdx, words });
  }
}

function answerWord(el, chosen, correct, nodeId, wordIdx, isImageMode) {
  if (!_wordLessonState) return;

  const isCorrect = chosen === correct;
  const options = el.parentElement.querySelectorAll('.quiz-option');
  options.forEach(o => {
    o.classList.add('disabled');
    if (o.textContent === correct) o.classList.add('reveal');
  });

  if (isCorrect) {
    el.classList.add('correct');
    // Use core's quizCombo tracking
    const session = _core.getSession();
    if (session) {
      session.combo = (session.combo || 0) + 1;
      if (session.combo > (session.maxCombo || 0)) session.maxCombo = session.combo;
    }
    addXP(10 + (session && session.combo > 3 ? session.combo * 2 : 0), 'word-lesson');
    
    if (!_state.wordsLearned.includes(_wordLessonState.words[wordIdx].target)) {
      _state.wordsLearned.push(_wordLessonState.words[wordIdx].target); _save();
    }
    addAnkiCard(_wordLessonState.words[wordIdx]);
    
    if (_wordLessonState.renderFn) {
      _wordLessonState.renderFn('feedback', { correct: true, word: _wordLessonState.words[wordIdx] });
    }
  } else {
    el.classList.add('wrong');
    if (session) session.combo = 0;
    trackWeakWord(_wordLessonState.words[wordIdx].target);
    
    if (!useHeart()) {
      _showOutOfHearts();
      return;
    }
    
    if (_wordLessonState.renderFn) {
      _wordLessonState.renderFn('feedback', { correct: false, word: _wordLessonState.words[wordIdx] });
    }
  }

  setTimeout(() => {
    _wordLessonState.wordIdx++;
    _wordLessonState.phase = Math.min(2, Math.floor(_wordLessonState.wordIdx / 3));
    _renderWordPhase();
  }, 1000);
}

function checkTyped(correct, nodeId, wordIdx) {
  if (!_wordLessonState) return;
  const input = document.getElementById('typeInput');
  if (!input) return;
  const answer = input.value.trim();
  const score = fuzzyMatch(answer, correct);
  const session = _core.getSession();

  if (score >= 80) {
    input.style.borderColor = 'var(--emerald)';
    input.style.color = 'var(--emerald-light)';
    addXP(15, 'word-typing');
    if (session) session.combo = (session.combo || 0) + 1;
  } else {
    input.style.borderColor = 'var(--red)';
    input.style.color = 'var(--red)';
    input.value = correct;
    if (session) session.combo = 0;
    trackWeakWord(correct);
    useHeart();
  }

  setTimeout(() => {
    _wordLessonState.wordIdx++;
    _wordLessonState.phase = Math.min(2, Math.floor(_wordLessonState.wordIdx / 3));
    _renderWordPhase();
  }, 1500);
}

function recordWord(correct, nodeId, wordIdx) {
  if (!_wordLessonState) return;
  const btn = document.getElementById('micBtn');
  if (isListening()) { stopListening(); return; }

  btn.classList.add('listening');
  startListening(_APP_CONFIG.targetLang, (results) => {
    btn.classList.remove('listening');
    const resultEl = document.getElementById('recordResult');
    if (!results) {
      resultEl.innerHTML = '<div class="sentence-result result-retry">🎤 לא נשמע דיבור — נסה שוב</div>';
      return;
    }
    const score = fuzzyMatch(results[0], correct);
    let cls = score >= 90 ? 'result-perfect' : score >= 60 ? 'result-good' : score >= 30 ? 'result-ok' : 'result-retry';
    let msg = score >= 90 ? '🎉 מושלם!' : score >= 60 ? '👍 טוב!' : score >= 30 ? '🤔 כמעט...' : '🔄 נסה שוב';
    const session = _core.getSession();

    resultEl.innerHTML = `
      <div class="sentence-result ${cls}">${msg} (${score}%)</div>
      <div class="sentence-heard">שמעתי: ${results[0]}</div>
    `;

    if (score >= 60) {
      addXP(20, 'word-speaking');
      if (session) session.combo = (session.combo || 0) + 1;
      if (!_state.wordsLearned.includes(correct)) { _state.wordsLearned.push(correct); _save(); }
    } else {
      if (session) session.combo = 0;
      trackWeakWord(correct);
    }

    setTimeout(() => {
      _wordLessonState.wordIdx++;
      _wordLessonState.phase = Math.min(2, Math.floor(_wordLessonState.wordIdx / 3));
      _renderWordPhase();
    }, 2000);
  });
}

function _finishWordLesson(node, words) {
  const learned = words.filter(w => _state.wordsLearned.includes(w.target)).length;
  const pct = Math.round(learned / words.length * 100);
  const session = _core.getSession();
  if (session) { session.score = pct; session.xpEarned += Math.ceil(pct/5); }

  // Delegate final render to UI
  if (_wordLessonState?.renderFn) {
    _wordLessonState.renderFn('complete', { node, words, learned, total: words.length, pct });
  }

  if (pct >= 80) confetti();
  window.SkillTree?.completeNode(node.id, pct);
  window.SkillTree?.render();
  addDaily();
  _core.endSession();
  _wordLessonState = null;
}

function _showOutOfHearts() {
  const container = document.getElementById('practiceContent') || document.getElementById('pageContent');
  if (!container) return;
  container.innerHTML = `
    <div style="text-align:center;padding:60px 20px">
      <div style="font-size:5rem;margin-bottom:16px">💔</div>
      <h2 style="font-weight:800">אזלו הלבבות!</h2>
      <p style="color:var(--text2);margin:8px 0 24px">חכה להתחדשות או קנה לבבות בחנות</p>
      <button class="btn btn-primary" style="margin-bottom:12px" onclick="goPage('shop')">🛒 חנות</button>
      <button class="btn btn-secondary btn-block" onclick="goPage('learn')">🗺️ חזרה למסלול</button>
    </div>
  `;
}

// ══════════════════════════════════════════════
// SENTENCE LESSON EXERCISE
// ══════════════════════════════════════════════
function startSentenceLesson(node, renderFn) {
  const sentences = node.sentences || getSentencesForNode(node);
  if (sentences.length === 0) { _toast('אין משפטים בנושא', 'error'); return; }

  _sentenceQueue = shuffle([...sentences]);
  _sentenceIdx = 0;
  _core.createSession({ type: 'sentence', node, sentences, totalQuestions: sentences.length });
  _renderSentence(renderFn);
}

function _renderSentence(renderFn) {
  if (_sentenceIdx >= _sentenceQueue.length) {
    _finishSentenceLesson(renderFn);
    return;
  }

  const s = _sentenceQueue[_sentenceIdx];
  const session = _core.getSession();
  if (session) session.currentIndex = _sentenceIdx + 1;

  if (renderFn) {
    renderFn('sentence', { 
      sentence: s, 
      index: _sentenceIdx, 
      total: _sentenceQueue.length,
      hasRecording: _state.sentencesPracticed && _state.sentencesPracticed[s.target]
    });
  }
}

function recordSentence(correct, renderFn) {
  const btn = document.getElementById('micBtn');
  if (isListening()) { stopListening(); return; }

  btn.classList.add('listening');
  startListening(_APP_CONFIG.targetLang, (results) => {
    btn.classList.remove('listening');
    const resultEl = document.getElementById('sentenceResult');
    if (!results) {
      resultEl.innerHTML = '<div class="sentence-result result-retry">🎤 לא נשמע — נסה שוב</div>';
      return;
    }

    const score = fuzzyMatch(results[0], correct);
    let cls = score >= 90 ? 'result-perfect' : score >= 60 ? 'result-good' : score >= 30 ? 'result-ok' : 'result-retry';
    let msg = score >= 90 ? '🎉 מושלם!' : score >= 60 ? '👍 טוב מאוד!' : score >= 30 ? '🤔 כמעט, נסה שוב' : '🔄 עוד פעם';
    const session = _core.getSession();

    resultEl.innerHTML = `
      <div class="sentence-result ${cls}">${msg} (${score}%)</div>
      <div class="sentence-heard">🎤 שמעתי: <em>${results[0]}</em></div>
      <div style="font-size:.75rem;color:var(--text3);margin-top:4px">✅ נכון: ${correct}</div>
    `;

    document.getElementById('step1')?.classList.add('done');
    document.getElementById('step2')?.classList.add('done');
    document.getElementById('step3')?.classList.add(score >= 30 ? 'done' : 'active');
    document.getElementById('step4')?.classList.add('active');

    if (score >= 60) {
      addXP(15, 'sentence-speaking');
      if (!_state.sentencesPracticed) _state.sentencesPracticed = {};
      _state.sentencesPracticed[correct] = { score, date: Date.now() };
      _save();
    } else {
      trackWeakWord(correct);
    }
  });
}

function nextSentence(renderFn) {
  _sentenceIdx++;
  _renderSentence(renderFn);
}

function _finishSentenceLesson(renderFn) {
  const session = _core.getSession();
  if (renderFn) {
    renderFn('complete', { type: 'sentence' });
  }
  addDaily();
  _core.endSession();
  _sentenceQueue = [];
  _sentenceIdx = 0;
}

// ══════════════════════════════════════════════
// QUIZ EXERCISE
// ══════════════════════════════════════════════
function startQuiz(questions, node, renderFn) {
  _core._quizQueue = questions;
  _core._quizIdx = 0;
  _core._quizScore = 0;
  _core._quizCombo = 0;
  _core._quizMaxCombo = 0;
  _core._quizNode = node;
  _core.createSession({ type: 'quiz', node, words: [], totalQuestions: questions.length });
  _renderQuizQuestion(renderFn);
}

function _renderQuizQuestion(renderFn) {
  const questions = _core._quizQueue;
  const idx = _core._quizIdx;
  const node = _core._quizNode;

  if (idx >= questions.length) {
    _finishQuiz(node, renderFn);
    return;
  }

  const q = questions[idx];
  const session = _core.getSession();
  if (session) { session.currentIndex = idx + 1; session.score = _core._quizScore; }

  if (renderFn) {
    renderFn('quiz', { question: q, index: idx, total: questions.length, node });
  }
}

function answerQuiz(el, chosen, correct, renderFn) {
  const isCorrect = chosen === correct;
  const options = el.parentElement.querySelectorAll('.quiz-option');
  options.forEach(o => {
    o.classList.add('disabled');
    if (o.textContent === correct) o.classList.add('reveal');
  });
  const session = _core.getSession();

  if (isCorrect) {
    el.classList.add('correct');
    _core._quizScore += 10 + (session && session.combo >= 3 ? session.combo * 2 : 0);
    session.combo = (session.combo || 0) + 1;
    if (session.combo > (session.maxCombo || 0)) session.maxCombo = session.combo;
    addXP(10, 'quiz');
    if (typeof Features !== 'undefined') Features.enhancedAnkiRate({front: correct}, 2);
  } else {
    el.classList.add('wrong');
    session.combo = 0;
    trackWeakWord(correct);
    const wordData = (_APP_DATA.words||[]).find(w => w.native === correct || w.target === correct);
    if (wordData) addAnkiCard(wordData);
    if (!_state.ankiSuccessCount) _state.ankiSuccessCount = {};
    _state.ankiSuccessCount[correct] = 0; _save();
    if (!useHeart()) {
      _showOutOfHearts();
      return;
    }
  }

  setTimeout(() => { 
    _core._quizIdx++; 
    _renderQuizQuestion(renderFn); 
  }, 1000);
}

function checkQuizTyped(correct, renderFn) {
  const input = document.getElementById('quizInput');
  if (!input) return;
  const score = fuzzyMatch(input.value.trim(), correct);
  const session = _core.getSession();

  if (score >= 70) {
    input.style.borderColor = 'var(--emerald)'; input.style.color = 'var(--emerald-light)';
    _core._quizScore += 15; 
    session.combo = (session.combo || 0) + 1;
    addXP(15, 'quiz-typing');
  } else {
    input.style.borderColor = 'var(--red)'; input.style.color = 'var(--red)';
    input.value = correct; 
    session.combo = 0; 
    trackWeakWord(correct); 
    useHeart();
  }

  setTimeout(() => { 
    _core._quizIdx++; 
    _renderQuizQuestion(renderFn); 
  }, 1500);
}

function _finishQuiz(node, renderFn) {
  const maxScore = _core._quizQueue.length * 15;
  const pct = Math.round(_core._quizScore / maxScore * 100);
  const session = _core.getSession();
  if (session) { session.score = pct; session.xpEarned += Math.ceil(pct/5); }

  if (renderFn) {
    renderFn('complete', { 
      type: 'quiz', 
      node, 
      score: _core._quizScore, 
      maxScore, 
      pct, 
      maxCombo: _core._quizMaxCombo,
      isMixed: node?.isMixed,
      isFull: node?.isFull
    });
  }

  if (pct >= 80) confetti();
  
  if (node && !node.isMixed) {
    window.SkillTree?.completeNode(node.id, pct);
  }
  
  _state.quizHistory.push({ nodeId: node.id, score: pct, date: Date.now() }); _save();
  addDaily();
  _core.endSession();
}

// ══════════════════════════════════════════════
// CILS EXAM EXERCISE
// ══════════════════════════════════════════════
function startCILSExam(level, questions, renderFn) {
  _core._quizQueue = questions;
  _core._quizIdx = 0;
  _core._quizScore = 0;
  _core._quizCombo = 0;
  _core._quizNode = { id: 'exam_' + level, name: 'CILS ' + level, icon: '📋', level };
  _core.createSession({ type: 'exam', node: _core._quizNode, totalQuestions: questions.length });
  _renderExamQuestion(level, renderFn);
}

function _renderExamQuestion(level, renderFn) {
  const questions = _core._quizQueue;
  const idx = _core._quizIdx;

  if (idx >= questions.length) {
    const pct = Math.round(_core._quizScore / (questions.length * 10) * 100);
    const prog = getNodeProgress('exam_' + level);
    if (pct >= 70 && prog.crown < 5) {
      _state.nodeProgress['exam_' + level] = { crown: prog.crown + 1, done: true, bestScore: pct };
      _save();
    }
    if (renderFn) {
      renderFn('complete', { type: 'exam', level, pct, passed: pct >= 70 });
    }
    if (pct >= 70) confetti();
    _core.endSession();
    return;
  }

  const q = questions[idx];
  const session = _core.getSession();
  if (session) session.currentIndex = idx + 1;

  if (renderFn) {
    renderFn('exam', { question: q, index: idx, total: questions.length, level });
  }
}

function answerCILS(el, chosen, correct, level, renderFn) {
  const isCorrect = chosen === correct;
  el.parentElement.querySelectorAll('.quiz-option').forEach(o => {
    o.classList.add('disabled');
    if (o.textContent === correct) o.classList.add('reveal');
  });
  if (isCorrect) { el.classList.add('correct'); _core._quizScore += 10; _core._quizCombo++; }
  else { el.classList.add('wrong'); _core._quizCombo = 0; }
  setTimeout(() => { _core._quizIdx++; _renderExamQuestion(level, renderFn); }, 1200);
}

function checkCILSTyped(correct, level, renderFn) {
  const input = document.getElementById('cilsInput');
  const score = fuzzyMatch(input.value.trim(), correct);
  if (score >= 70) { _core._quizScore += 10; _core._quizCombo++; input.style.borderColor='var(--emerald)'; }
  else { _core._quizCombo = 0; input.style.borderColor='var(--red)'; input.value = correct; }
  setTimeout(() => { _core._quizIdx++; _renderExamQuestion(level, renderFn); }, 1500);
}

// ══════════════════════════════════════════════
// WEAK WORDS QUIZ
// ══════════════════════════════════════════════
function startWeakQuiz(renderFn) {
  if (!_state.weakWords || _state.weakWords.length < 3) return;
  const weak = _state.weakWords.slice(0, 8);
  const words = weak.map(w => findWord(w.word)).filter(Boolean);
  if (words.length < 3) { _toast('אין מספיק מילים', 'error'); return; }

  const questions = [];
  words.forEach(w => {
    const distractors = getDistractors(_APP_DATA.words || [], w, 'native');
    questions.push({ type: 'choose', q: w.target, a: w.native, options: shuffle([w.native, ...distractors]).slice(0, 4), qLang: 'target' });
  });

  _core._quizNode = { id: 'weak_words', name: 'מילים חלשות', icon: '💪', level: _state.currentLevel || 'A1' };
  startQuiz(questions, _core._quizNode, renderFn);
}

function findWord(it) {
  return (_APP_DATA.words || []).find(w => w.target === it);
}

// ══════════════════════════════════════════════
// PUBLIC API
// ══════════════════════════════════════════════
const api = {
  init,
  // Word lesson
  startWordLesson,
  answerWord,
  checkTyped,
  recordWord,
  // Sentence lesson
  startSentenceLesson,
  recordSentence,
  nextSentence,
  // Quiz
  startQuiz,
  answerQuiz,
  checkQuizTyped,
  // CILS Exam
  startCILSExam,
  answerCILS,
  checkCILSTyped,
  // Weak words
  startWeakQuiz,
  // Internal access
  _wordLessonState: null,
  _sentenceQueue: [],
  _sentenceIdx: 0
};

return api;

})();

// Expose globally
window.PracticeExercises = PracticeExercises;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PracticeExercises;
}