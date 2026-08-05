/* ══════════════════════════════════════════════
   VolaLingo — Content-to-Exercise Wiring
   Sprint C4C: Connect APP_DATA content to Exercise Generators
   ══════════════════════════════════════════════ */

const ContentExercises = (() => {

let _registry = null;
let _contentCache = {
  words: null,
  sentences: null,
  dialogues: null,
  phrases: null,
  stories: null,
  songs: null,
  culture: null,
  exams: null
};

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════
function init() {
  _registry = window.ExerciseRegistry;
  _loadContentCache();
  console.log('🔗 ContentExercises wiring initialized');
  return api;
}

function _loadContentCache() {
  if (window.APP_DATA) {
    _contentCache.words = APP_DATA.words || [];
    _contentCache.sentences = APP_DATA.sentences || [];
    _contentCache.dialogues = APP_DATA.dialogues || [];
    _contentCache.phrases = APP_DATA.phrases || [];
    _contentCache.stories = APP_DATA.stories || [];
    _contentCache.songs = APP_DATA.songs || [];
    _contentCache.culture = APP_DATA.culture || [];
    _contentCache.exams = APP_DATA.exams || [];
  }
  
  // Also load from content.js if available
  if (window.Content && Content.getWords) {
    _contentCache.words = Content.getWords() || _contentCache.words;
  }
  if (window.Content && Content.getSentences) {
    _contentCache.sentences = Content.getSentences() || _contentCache.sentences;
  }
  if (window.Content && Content.getDialogues) {
    _contentCache.dialogues = Content.getDialogues() || _contentCache.dialogues;
  }
}

// ══════════════════════════════════════════════
// CONTENT NORMALIZATION
// ══════════════════════════════════════════════
function _normalizeWord(word) {
  // Ensure standard fields for generators
  return {
    id: word.id || word.it || word.target || `word_${Math.random().toString(36).substr(2,9)}`,
    word: word.it || word.target || '',
    translations: {
      he: word.he || word.native || '',
      en: word.en || ''
    },
    category: word.cat || word.category || 'כללי',
    level: word.level || 'A1',
    example: word.example || word.sentence || '',
    audio: word.audio || '',
    image: word.image || '',
    grammar: word.grammar || {},
    culture: word.culture || { note: '' }
  };
}

function _normalizeSentence(sentence) {
  return {
    id: sentence.id || sentence.it || sentence.target || `sent_${Math.random().toString(36).substr(2,9)}`,
    sentence: sentence.it || sentence.target || '',
    text: sentence.it || sentence.target || '',
    translation: sentence.he || sentence.native || '',
    translations: { he: sentence.he || sentence.native || '' },
    level: sentence.level || 'A1',
    category: sentence.cat || sentence.category || 'כללי',
    audio: sentence.audio || '',
    grammarNote: sentence.grammarNote || sentence.grammar || ''
  };
}

function _normalizeDialogue(dialogue) {
  return {
    id: dialogue.id || `dlg_${Math.random().toString(36).substr(2,9)}`,
    context: dialogue.context || '',
    speaker: dialogue.speaker || 'A',
    previousLine: dialogue.previousLine || '',
    correctResponse: dialogue.correctResponse || dialogue.response || '',
    options: dialogue.options || [dialogue.correctResponse || dialogue.response || ''],
    audio: dialogue.audio || '',
    explanation: dialogue.explanation || '',
    scenario: dialogue.scenario || '',
    userRole: dialogue.userRole || '',
    npcRole: dialogue.npcRole || '',
    turns: dialogue.turns || [],
    keywords: dialogue.keywords || []
  };
}

function _normalizePhrase(phrase) {
  return {
    id: phrase.id || phrase.it || `phrase_${Math.random().toString(36).substr(2,9)}`,
    word: phrase.it || phrase.target || '',
    sentence: phrase.it || phrase.target || '',
    text: phrase.it || phrase.target || '',
    translation: phrase.he || phrase.native || '',
    translations: { he: phrase.he || phrase.native || '' },
    level: phrase.level || 'A1',
    category: phrase.cat || phrase.category || 'ביטויים',
    audio: phrase.audio || ''
  };
}

// ══════════════════════════════════════════════
// PUBLIC API: GENERATE EXERCISES FROM CONTENT
// ══════════════════════════════════════════════

// Generate exercises for a specific word
function generateForWord(wordId, config = {}) {
  const word = _contentCache.words.find(w => 
    (w.id === wordId) || (w.it === wordId) || (w.target === wordId)
  );
  if (!word) {
    console.warn('Word not found:', wordId);
    return [];
  }
  const normalized = _normalizeWord(word);
  return _registry.generateExercises(normalized, { 
    ...config, 
    allVocab: _contentCache.words.map(_normalizeWord) 
  });
}

// Generate exercises for a specific sentence
function generateForSentence(sentenceId, config = {}) {
  const sentence = _contentCache.sentences.find(s => 
    (s.id === sentenceId) || (s.it === sentenceId) || (s.target === sentenceId)
  );
  if (!sentence) {
    console.warn('Sentence not found:', sentenceId);
    return [];
  }
  const normalized = _normalizeSentence(sentence);
  return _registry.generateExercises(normalized, { 
    ...config, 
    allVocab: _contentCache.words.map(_normalizeWord),
    allSentences: _contentCache.sentences.map(_normalizeSentence),
    allDialogues: _contentCache.dialogues.map(_normalizeDialogue)
  });
}

// Generate exercises for a dialogue
function generateForDialogue(dialogueId, config = {}) {
  const dialogue = _contentCache.dialogues.find(d => d.id === dialogueId);
  if (!dialogue) {
    console.warn('Dialogue not found:', dialogueId);
    return [];
  }
  const normalized = _normalizeDialogue(dialogue);
  return _registry.generateExercises(normalized, { 
    ...config, 
    allDialogues: _contentCache.dialogues.map(_normalizeDialogue) 
  });
}

// Generate exercises for a phrase
function generateForPhrase(phraseId, config = {}) {
  const phrase = _contentCache.phrases.find(p => 
    (p.id === phraseId) || (p.it === phraseId) || (p.target === phraseId)
  );
  if (!phrase) {
    console.warn('Phrase not found:', phraseId);
    return [];
  }
  const normalized = _normalizePhrase(phrase);
  return _registry.generateExercises(normalized, { 
    ...config, 
    allVocab: _contentCache.words.map(_normalizeWord) 
  });
}

// Generate daily flow from skill tree node
function generateDailyFlowFromNode(nodeId, config = {}) {
  // Get words for this node
  const words = getWordsForNode(nodeId);
  const sentences = getSentencesForNode(nodeId);
  
  const contentItems = [
    ...words.map(_normalizeWord),
    ...sentences.map(_normalizeSentence)
  ];
  
  return _registry.createDailyFlow(contentItems, config);
}

// Generate exam flow
function generateExamFlow(examType, level, config = {}) {
  // Filter content by level
  const words = _contentCache.words
    .filter(w => w.level === level)
    .map(_normalizeWord);
  const sentences = _contentCache.sentences
    .filter(s => s.level === level)
    .map(_normalizeSentence);
  const dialogues = _contentCache.dialogues
    .filter(d => d.level === level)
    .map(_normalizeDialogue);
  
  const contentItems = [...words, ...sentences, ...dialogues];
  
  return _registry.createExamFlow(examType, level, contentItems, config);
}

// ══════════════════════════════════════════════
// HELPER: GET CONTENT BY NODE/LEVEL
// ══════════════════════════════════════════════
function getWordsForNode(nodeId) {
  // Use skill tree to find words for node
  if (window.SkillTree && SkillTree.getNode) {
    const node = SkillTree.getNode(nodeId);
    if (node && node.words) {
      return _contentCache.words.filter(w => node.words.includes(w.it || w.target));
    }
  }
  // Fallback: filter by category matching node
  const node = window.SkillTree?.getNode?.(nodeId);
  if (node) {
    const categoryMap = {
      'greetings': 'ברכות', 'numbers': 'מספרים', 'colors': 'צבעים',
      'family': 'משפחה', 'verbs': 'פעלים', 'time': 'זמן',
      'food': 'אוכל', 'body': 'גוף', 'adjectives': 'תכונות',
      'places': 'מקומות', 'clothing': 'בגדים', 'weather': 'טבע',
      'animals': 'חיות', 'grammar': 'דקדוק', 'travel': 'טיולים',
      'shopping': 'קניות'
    };
    const cat = categoryMap[node.id] || node.id;
    return _contentCache.words.filter(w => w.cat === cat);
  }
  return _contentCache.words.slice(0, 20); // Default
}

function getSentencesForNode(nodeId) {
  if (window.SkillTree && SkillTree.getNode) {
    const node = SkillTree.getNode(nodeId);
    if (node && node.sentences) {
      return _contentCache.sentences.filter(s => node.sentences.includes(s.it || s.target));
    }
  }
  return _contentCache.sentences.slice(0, 10);
}

function getContentByLevel(level) {
  return {
    words: _contentCache.words.filter(w => w.level === level).map(_normalizeWord),
    sentences: _contentCache.sentences.filter(s => s.level === level).map(_normalizeSentence),
    dialogues: _contentCache.dialogues.filter(d => d.level === level).map(_normalizeDialogue),
    phrases: _contentCache.phrases.filter(p => p.level === level).map(_normalizePhrase)
  };
}

// ══════════════════════════════════════════════
// PUBLIC API
// ══════════════════════════════════════════════
const api = {
  init,
  generateForWord,
  generateForSentence,
  generateForDialogue,
  generateForPhrase,
  generateDailyFlowFromNode,
  generateExamFlow,
  getWordsForNode,
  getSentencesForNode,
  getContentByLevel,
  getContentCache: () => _contentCache
};

return api;

})();

// Expose globally
window.ContentExercises = ContentExercises;

// Auto-init when Practice is ready
if (typeof window.Practice !== 'undefined' && window.ExerciseRegistry) {
  ContentExercises.init();
} else {
  // Wait for modules to load
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (window.ExerciseRegistry) {
        ContentExercises.init();
      }
    }, 100);
  });
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContentExercises;
}