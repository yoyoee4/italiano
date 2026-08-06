// ════════════════════════════════════════════════════════════════════
// VolaLingo — Error Intelligence Module
// Tracks every user mistake → pattern recognition → personalized SRS → Nona coaching
// ════════════════════════════════════════════════════════════════════
;(function(){
'use strict';

const ErrorIntel = (function(){

  // ── STORAGE ──
  const STORAGE_KEY = 'volalingo_errors';
  const PATTERN_KEY = 'volalingo_error_patterns';

  // ── ERROR TYPE DEFINITIONS ──
  const ERROR_TYPES = {
    GENDER: {
      id: 'gender',
      label: 'טעות במגדר',
      icon: '♂️♀️',
      patterns: [
        { regex: /\b(il|lo|la|i|gli|le)\b.*\b(?:buono|bello|grande|piccolo|nuovo|vecchio)\b/i, label: 'article-adjective agreement' },
        { regex: /\bun\b\s+[a-z]*a\b/i, label: 'un + feminine noun' },
        { regex: /\buna\b\s+[a-z]*o\b/i, label: 'una + masculine noun' },
      ],
      remediation: 'content/articles/gender-errors.md',
      exercises: ['flashcard','multiple_choice','typing']
    },
    PREPOSITION: {
      id: 'preposition',
      label: 'טעות במילת יחס',
      icon: '🔗',
      patterns: [
        { regex: /\b( a | in | da | di | su | con | per | tra | fra )/i, label: 'preposition usage' },
        { regex: /\b(a il|a la|a i|a gli|a le)\b/i, label: 'missing articulated preposition' },
      ],
      remediation: 'content/articles/preposition-errors.md',
      exercises: ['multiple_choice','sentence_builder','typing']
    },
    VERB: {
      id: 'verb',
      label: 'טעות בהטיית פועל',
      icon: '🔤',
      patterns: [
        { regex: /\b(?:io|tu|lui|lei|noi|voi|loro)\s+\w+[ae]\b/i, label: 'verb conjugation' },
        { regex: /\b(?:sono|sei|è|siamo|siete|hanno)\b/i, label: 'essere/avere auxiliary' },
      ],
      remediation: 'content/articles/verb-errors.md',
      exercises: ['conjugation','multiple_choice','sentence_builder']
    },
    ARTICLE: {
      id: 'article',
      label: 'טעות בתמ"י',
      icon: '📰',
      patterns: [
        { regex: /\b(il|lo|la|i|gli|le)\b/i, label: 'definite article' },
        { regex: /\b(il|lo)\s+[aeiou]/i, label: 'il/lo before vowel' },
        { regex: /\bla\s+[a-z]*[aeiou]o\b/i, label: 'la before masculine' },
      ],
      remediation: 'content/articles/article-errors.md',
      exercises: ['multiple_choice','typing','fill_blank']
    },
    PRONOUN: {
      id: 'pronoun',
      label: 'טעות בכינוי',
      icon: '👤',
      patterns: [
        { regex: /\b(mi|ti|si|ci|vi|lo|la|li|le|gli|ne)\b/i, label: 'pronoun usage' },
        { regex: /gli\s+\w+/i, label: 'gli as article vs pronoun' },
      ],
      remediation: 'content/articles/pronoun-errors.md',
      exercises: ['multiple_choice','fill_blank']
    },
    WORD_ORDER: {
      id: 'word_order',
      label: 'סדר מילים',
      icon: '🔄',
      patterns: [
        { regex: /\b(?:non|già|sempre|mai|più)\s+\w+[aeiou]\b/i, label: 'adverb placement' },
      ],
      remediation: 'content/articles/word-order-errors.md',
      exercises: ['sentence_builder','ordering']
    },
    PLURAL: {
      id: 'plural',
      label: 'טעות ברבים',
      icon: '📚',
      patterns: [
        { regex: /\b(?:i|gli|le)\s+\w+[aeio]\b/i, label: 'plural formation' },
      ],
      remediation: 'content/articles/plural-errors.md',
      exercises: ['typing','multiple_choice']
    },
    SUBJUNCTIVE: {
      id: 'subjunctive',
      label: 'טעות בקוניונטיבו',
      icon: '🎭',
      patterns: [
        { regex: /\b(?:che|affinché|benche|sebbene|nonostante)\b/i, label: 'subjunctive trigger' },
      ],
      remediation: 'content/articles/subjunctive-errors.md',
      exercises: ['conjugation','multiple_choice','fill_blank']
    },
    VOCABULARY: {
      id: 'vocabulary',
      label: 'טעות באוצר מילים',
      icon: '📖',
      patterns: [
        { regex: /./, label: 'general vocabulary' },
      ],
      remediation: 'content/articles/vocabulary.md',
      exercises: ['flashcard','multiple_choice','typing']
    }
  };

  // ── ERROR LOG ──
  let _errors = [];         // Raw error log: [{word, type, context, timestamp, count}]
  let _patterns = {};       // Pattern frequency: {pattern_id: count}
  let _state = {};          // Reference to app state

  // ── INIT ──
  function init(appState) {
    _state = appState || {};
    _errors = loadErrors();
    _patterns = loadPatterns();
    return api;
  }

  function loadErrors() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch(e) { return []; }
  }

  function saveErrors() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_errors));
    } catch(e) { /* storage full */ }
  }

  function loadPatterns() {
    try {
      const raw = localStorage.getItem(PATTERN_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch(e) { return {}; }
  }

  function savePatterns() {
    try {
      localStorage.setItem(PATTERN_KEY, JSON.stringify(_patterns));
    } catch(e) { /* storage full */ }
  }

  // ── LOG A MISTAKE ──
  function logMistake(word, userAnswer, correctAnswer, context) {
    const errorType = classifyError(word, userAnswer, correctAnswer);
    
    // Add to error log
    _errors.push({
      word: word,
      userAnswer: userAnswer,
      correctAnswer: correctAnswer,
      type: errorType,
      context: context || '',
      timestamp: Date.now(),
      count: 1,
      remediated: false
    });
    
    // Update pattern frequency
    if (errorType) {
      _patterns[errorType] = (_patterns[errorType] || 0) + 1;
    }
    
    saveErrors();
    savePatterns();
    
    // Auto-create SRS card if this word is new
    if (window.AnkiPractice && word) {
      const existing = window.AnkiPractice.anki ? window.AnkiPractice.anki[word] : null;
      if (!existing && word.target) {
        window.AnkiPractice.addAnkiCard({target: word, native: correctAnswer || word});
      }
    }
    
    return errorType;
  }

  // ── CLASSIFY ERROR TYPE ──
  function classifyError(word, userAnswer, correctAnswer) {
    if (!userAnswer || !correctAnswer) return 'vocabulary';
    
    const ua = userAnswer.toLowerCase().trim();
    const ca = correctAnswer.toLowerCase().trim();
    
    // Gender error: wrong article for noun
    if ((ca.startsWith('il ') || ca.startsWith('la ') || ca.startsWith('l\'') || ca.startsWith('un ') || ca.startsWith('una ')) &&
        (ua.startsWith('il ') || ua.startsWith('la ') || ua.startsWith('l\'') || ua.startsWith('un ') || ua.startsWith('una '))) {
      if (ca[0] !== ua[0] || ca[1] !== ua[1]) {
        return 'gender';
      }
    }
    
    // Verb conjugation: known verb stems but different endings
    if (ca.length > 3 && ua.length > 3) {
      const caStem = ca.slice(0, -2);
      const uaStem = ua.slice(0, -2);
      if (caStem === uaStem && ca.slice(-2) !== ua.slice(-2)) {
        return 'verb';
      }
    }
    
    // Preposition error
    if (ca.startsWith('a ') || ca.startsWith('in ') || ca.startsWith('da ') || ca.startsWith('di ') || ca.startsWith('su ') || ca.startsWith('con ')) {
      return 'preposition';
    }
    
    // Article error
    if ((ca === 'il' || ca === 'lo' || ca === 'la' || ca === 'i' || ca === 'gli' || ca === 'le') &&
        ca !== ua) {
      return 'article';
    }
    
    // Default
    return 'vocabulary';
  }

  // ── GET FREQUENT MISTAKES ──
  function getFrequentMistakes(minCount = 2) {
    const freq = {};
    _errors.forEach(e => {
      const key = `${e.word}_${e.type}`;
      freq[key] = freq[key] || { word: e.word, type: e.type, count: 0, lastSeen: 0, context: e.context };
      freq[key].count++;
      freq[key].lastSeen = Math.max(freq[key].lastSeen, e.timestamp);
    });
    return Object.values(freq)
      .filter(f => f.count >= minCount)
      .sort((a, b) => b.count - a.count);
  }

  // ── GET WEAK PATTERNS ──
  function getWeakPatterns(threshold = 3) {
    return Object.entries(_patterns)
      .filter(([_, count]) => count >= threshold)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => {
        const info = Object.values(ERROR_TYPES).find(e => e.id === type);
        return { type, count, label: info ? info.label : type, icon: info ? info.icon : '❌' };
      });
  }

  // ── GENERATE TARGETED EXERCISE ──
  function getTargetedExercise(mistakeType, level = 'A1') {
    const typeInfo = Object.values(ERROR_TYPES).find(e => e.id === mistakeType);
    if (!typeInfo) return null;
    
    const exerciseType = typeInfo.exercises[Math.floor(Math.random() * typeInfo.exercises.length)];
    
    // Get relevant words from APP_DATA
    const words = (window.APP_DATA && window.APP_DATA.words) || [];
    const relevantWords = words.filter(w => (w.cat || '').toLowerCase().includes(mistakeType) || Math.random() > 0.8);
    const word = relevantWords.length > 0 ? relevantWords[Math.floor(Math.random() * relevantWords.length)] : null;
    
    if (!word) return null;
    
    // Generate exercise based on type
    switch (mistakeType) {
      case 'gender':
        return {
          type: 'multiple_choice',
          prompt: `Qual è l'articolo corretto per "${word.it}"?`,
          options: ['il', 'la', 'lo', 'l\'', 'i', 'gli', 'le'],
          correct: ['il','lo'].includes(word.gender || 'm') ? ['il','lo','l\''] : ['la','l\''],
          answer: word.gender === 'm' ? (word.it[0].match(/[aeiou]/) ? "l'" : 'il') : (word.it[0].match(/[aeiou]/) ? "l'" : 'la'),
          title: 'תרגול מגדר',
          icon: '♂️♀️'
        };
      case 'verb':
        return {
          type: 'conjugation',
          prompt: `Coniuga il verbo "${word.it}":`,
          options: ['io ___', 'tu ___', 'lui/lei ___'],
          answer: word.it,
          title: 'תרגול הטיות',
          icon: '🔤'
        };
      case 'preposition':
        return {
          type: 'multiple_choice',
          prompt: `Completa: "Vado ___ Roma"`,
          options: ['a', 'in', 'da', 'di'],
          correct: 0,
          answer: 'a',
          title: 'תרגול מילות יחס',
          icon: '🔗'
        };
      default:
        return {
          type: 'flashcard',
          prompt: word.it,
          answer: word.he || word.it,
          title: 'תרגול מילים',
          icon: '📖'
        };
    }
  }

  // ── GET NONA COACHING MESSAGE ──
  function getNonaMessage() {
    const frequent = getFrequentMistakes(3);
    if (frequent.length === 0) return null;
    
    const top = frequent[0];
    const typeInfo = Object.values(ERROR_TYPES).find(e => e.id === top.type);
    
    const messages = {
      gender: [
        `Tesoro, ho notato che confondi "${top.word}" con l'articolo sbagliato! In italiano si dice ${top.word.startsWith('a') ? "l'" : 'il/la'} ${top.word}. Ripetiamo insieme? 🤌`,
        `Mamma mia, ancora il genere! ${top.word} è ${top.word.match(/[aeiou]$/i) ? 'maschile' : 'femminile'}. Scrivilo 5 volte! ✍️`
      ],
      preposition: [
        `Attenzione! Con ${top.word} si usa la preposizione giusta. Ricorda: in italiano ogni verbo ha le sue preposizioni! 📚`,
        `Non ti preoccupare, le preposizioni sono difficili per tutti. Facciamo un esercizio insieme? 💪`
      ],
      verb: [
        `Il verbo ${top.word} si coniuga in modo particolare. Facciamo pratica insieme! 🎯`,
        `Bravo, ci sei quasi! Ricorda la coniugazione di ${top.word}. Riprova! 🔄`
      ],
      vocabulary: [
        `La parola "${top.word}" è importante. Mettiamo un cartoncino mentale! 🧠`,
        `Ah, ${top.word}! Parola bellissima. Ripetiamola insieme: ${top.word}! 🗣️`
      ]
    };
    
    const typeMessages = messages[top.type] || messages.vocabulary;
    return typeMessages[Math.floor(Math.random() * typeMessages.length)];
  }

  // ── STATS ──
  function getStats() {
    return {
      totalMistakes: _errors.length,
      uniqueWords: new Set(_errors.map(e => e.word)).size,
      patternCount: Object.keys(_patterns).length,
      topPatterns: getWeakPatterns(2),
      recentMistakes: _errors.slice(-10).reverse(),
      frequentMistakes: getFrequentMistakes(2)
    };
  }

  // ── CLEAR ──
  function clearMistakes() {
    _errors = [];
    _patterns = {};
    saveErrors();
    savePatterns();
  }

  // ── PUBLIC API ──
  const api = {
    init,
    logMistake,
    classifyError,
    getFrequentMistakes,
    getWeakPatterns,
    getTargetedExercise,
    getNonaMessage,
    getStats,
    clearMistakes,
    ERROR_TYPES,
    version: '1.0'
  };

  // Auto-init if window available
  if (typeof window !== 'undefined' && window.state) {
    init(window.state);
  }

  return api;

})();

// Expose globally
if (typeof window !== 'undefined') {
  window.ErrorIntel = ErrorIntel;

  // Integrate with Nona
  if (window.Nona && window.Nona.onWrong) {
    const originalOnWrong = window.Nona.onWrong;
    window.Nona.onWrong = function(answer, correct, word, context) {
      ErrorIntel.logMistake(word, answer, correct, context);
      if (originalOnWrong) originalOnWrong.call(this, answer, correct, word, context);
    };
  }
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorIntel;
}

})();
