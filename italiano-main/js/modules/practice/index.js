/* ══════════════════════════════════════════════
   VolaLingo — Practice Module (Unified Entry Point)
   Sprint C4A: Clean Contract for all practice functionality
   ══════════════════════════════════════════════ */

const Practice = (() => {

// ══════════════════════════════════════════════
// MODULE REFERENCES
// ══════════════════════════════════════════════
let _core = null;
let _exercises = null;
let _anki = null;
let _dialogue = null;
let _ui = null;

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════
function init(dependencies) {
  // Initialize core first
  _core = PracticeCore;
  _core.init(dependencies);

  // Initialize sub-modules with core reference
  _exercises = PracticeExercises;
  _exercises.init(_core);

  _anki = AnkiPractice;
  _anki.init(_core);

  _dialogue = DialoguePractice;
  _dialogue.init(_core);

  _ui = PracticeUI;
  _ui.init(_core, _exercises, _anki, _dialogue);

  console.log('🎯 Practice module (unified) initialized');
  return api;
}

// ══════════════════════════════════════════════
// BACKWARD COMPATIBILITY ALIASES
// ══════════════════════════════════════════════
// These ensure existing inline onclick handlers still work
function _createCompatAliases() {
  // Delegate to core
  window.PracticeCore = _core;
  window.PracticeExercises = _exercises;
  window.AnkiPractice = _anki;
  window.DialoguePractice = _dialogue;
  window.PracticeUI = _ui;

  // Legacy window.Practice.* methods that inline onclick handlers call
  return {
    // Word lesson
    startWordLesson: (node) => _core.startWordLesson(node),
    answerWord: (el, chosen, correct, nodeId, wordIdx, isImageMode) => _exercises.answerWord(el, chosen, correct, nodeId, wordIdx, isImageMode),
    checkTyped: (correct, nodeId, wordIdx) => _exercises.checkTyped(correct, nodeId, wordIdx),
    recordWord: (correct, nodeId, wordIdx) => _exercises.recordWord(correct, nodeId, wordIdx),

    // Sentence lesson
    startSentenceLesson: (node) => _core.startSentenceLesson(node),
    renderSentence: () => _exercises.renderSentence(),
    recordSentence: (correct) => _exercises.recordSentence(correct),
    nextSentence: () => _exercises.nextSentence(),

    // Quiz
    startQuiz: (node) => _core.startQuiz(node),
    answerQuiz: (el, chosen, correct) => _exercises.answerQuiz(el, chosen, correct),
    checkQuizTyped: (correct) => _exercises.checkQuizTyped(correct),

    // Dialogue
    startDialogue: (node) => _core.startDialogue(node),
    answerDialogue: (el, chosen, correct) => _dialogue.answerDialogue(el, chosen, correct),
    recordDialogue: (correct) => _dialogue.recordDialogue(correct),
    nextDialogueLine: () => _dialogue.nextDialogueLine(),

    // Anki
    startAnki: () => _core.startAnki(),
    revealAnki: () => _anki.revealAnki(),
    rateAnki: (quality) => _anki.rateAnki(quality),
    getAnkiDueCount: () => _anki.getAnkiDueCount(),

    // CILS Exam
    startCILSExam: (level) => _core.startCILSExam(level),
    answerCILS: (el, chosen, correct, level) => _exercises.answerCILS(el, chosen, correct, level),
    checkCILSTyped: (correct, level) => _exercises.checkCILSTyped(correct, level),

    // Weak words
    startWeakWords: () => _core.startWeakWords(),
    startWeakQuiz: () => _exercises.startWeakQuiz(),

    // Mixed practice
    startMixedPractice: (isFull) => _core.startMixedPractice(isFull),
    render: () => _core.render(),
    showPracticeMenu: () => _core.showPracticeMenu(),
    startRandomSentences: () => _core.startRandomSentences(),
    startMistakesReview: () => _core.startMistakesReview(),

    // Helpers
    getWordsForNode: (node) => _core.getWordsForNode(node),
    getSentencesForNode: (node) => _core.getSentencesForNode(node),
    getWordsForLevel: (level) => _core.getWordsForLevel(level),
    getNodeProgress: (id) => _core.getNodeProgress(id),
    isUnlocked: (node) => _core.isUnlocked(node),

    // Internal state access (for backward compat)
    _wordLesson: _core._wordLesson,
    _quizNode: _core._quizNode,
    _dialogueNode: _core._dialogueNode,
    _insideStartQuiz: _core._insideStartQuiz
  };
}

// ══════════════════════════════════════════════
// CLEAN CONTRACT (new API for future features like AI Speaking Coach)
// ══════════════════════════════════════════════
const contract = {
  // Start a practice session
  // config: { type: 'word'|'sentence'|'quiz'|'dialogue'|'anki'|'exam'|'mixed', node?, words?, sentences?, totalQuestions? }
  startLesson(config) {
    switch (config.type) {
      case 'word': return _core.startWordLesson(config.node);
      case 'sentence': return _core.startSentenceLesson(config.node);
      case 'quiz': return _core.startQuiz(config.node);
      case 'dialogue': return _core.startDialogue(config.node);
      case 'anki': return _core.startAnki();
      case 'exam': return _core.startCILSExam(config.level);
      case 'mixed': return _core.startMixedPractice(config.isFull);
      default: return _core.startMixedPractice(false);
    }
  },

  // Start a specific exercise within a session
  // type: 'word'|'sentence'|'quiz'|'listening'|'speaking'
  startExercise(type, data) {
    // This is for future AI Speaking Coach integration
    // For now, delegates to appropriate method
    console.log('Practice.startExercise:', type, data);
  },

  // Submit an answer for the current exercise
  // answer: string (user's answer)
  // returns: { correct: boolean, score: number, feedback: string, xp: number }
  submitAnswer(answer) {
    // Future: unified answer handling for AI Speaking Coach
    console.log('Practice.submitAnswer:', answer);
  },

  // Get current session statistics
  getSessionStats() {
    const session = _core.getSession();
    return session ? {
      type: session.type,
      currentIndex: session.currentIndex,
      totalQuestions: session.totalQuestions,
      score: session.score,
      combo: session.combo,
      maxCombo: session.maxCombo,
      xpEarned: session.xpEarned,
      duration: Date.now() - session.startedAt
    } : null;
  },

  // Complete the current session
  // returns: session summary
  completeSession() {
    return _core.endSession();
  },

  // Practice menu
  showMenu() {
    _core.showPracticeMenu();
  }
};

// ══════════════════════════════════════════════
// PUBLIC API
// ══════════════════════════════════════════════
const compat = _createCompatAliases();
const api = {
  // Init
  init,
  
  // Clean Contract (NEW)
  ...contract,
  
  // Backward Compatibility (LEGACY - for inline onclick handlers)
  ...compat
};

return api;

})();

// Expose globally
window.Practice = Practice;

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Practice;
}