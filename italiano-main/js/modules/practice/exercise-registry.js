/* ══════════════════════════════════════════════
   VolaLingo — Exercise Registry
   Sprint C4C: Central registry for all exercise types
   ══════════════════════════════════════════════ */

const ExerciseRegistry = (() => {

// ══════════════════════════════════════════════
// EXERCISE TYPE DEFINITIONS
// ══════════════════════════════════════════════
const EXERCISE_TYPES = {
  // Core vocabulary exercises
  FLASHCARD: 'flashcard',
  MULTIPLE_CHOICE: 'multiple_choice',
  TYPING: 'typing',
  IMAGE_MATCH: 'image_match',

  // Sentence exercises
  SENTENCE_BUILDER: 'sentence_builder',
  SENTENCE_TRANSLATE: 'sentence_translate',
  SENTENCE_ORDERING: 'sentence_ordering',

  // Listening exercises
  LISTENING_RECOGNITION: 'listening_recognition',
  LISTENING_TRANSCRIBE: 'listening_transcribe',
  LISTENING_MULTIPLE_CHOICE: 'listening_multiple_choice',

  // Speaking exercises
  SPEAKING_PRONUNCIATION: 'speaking_pronunciation',
  SPEAKING_REPEAT: 'speaking_repeat',
  SPEAKING_ROLEPLAY: 'speaking_roleplay',

  // Writing exercises
  WRITING_TRANSLATE: 'writing_translate',
  WRITING_FREEFORM: 'writing_freeform',
  WRITING_DICTATION: 'writing_dictation',

  // Dialogue exercises
  DIALOGUE_CHOICE: 'dialogue_choice',
  DIALOGUE_COMPLETE: 'dialogue_complete',
  DIALOGUE_ROLEPLAY: 'dialogue_roleplay',

  // Exam-style exercises
  EXAM_READING: 'exam_reading',
  EXAM_LISTENING: 'exam_listening',
  EXAM_WRITING: 'exam_writing',
  EXAM_SPEAKING: 'exam_speaking',
  EXAM_GRAMMAR: 'exam_grammar',
  EXAM_VOCABULARY: 'exam_vocabulary',

  // Game exercises
  GAME_MATCH: 'game_match',
  GAME_MEMORY: 'game_memory',
  GAME_TRIVIA: 'game_trivia',
  GAME_WORD_SEARCH: 'game_word_search',

  // Anki/SRS exercises
  ANKI_REVIEW: 'anki_review',
  ANKI_NEW_CARD: 'anki_new_card'
};

// ══════════════════════════════════════════════
// EXERCISE GENERATORS REGISTRY
// ══════════════════════════════════════════════
const generators = new Map();

function registerGenerator(type, generator) {
  if (!EXERCISE_TYPES[type]) {
    console.warn(`ExerciseRegistry: Unknown type "${type}"`);
  }
  generators.set(type, generator);
  console.log(`ExerciseRegistry: Registered generator for "${type}"`);
}

function getGenerator(type) {
  return generators.get(type);
}

// ══════════════════════════════════════════════
// EXERCISE METADATA
// ══════════════════════════════════════════════
const exerciseMetadata = new Map();

function registerMetadata(type, metadata) {
  exerciseMetadata.set(type, {
    type,
    skills: metadata.skills || ['reading'],
    difficulty: metadata.difficulty || 'medium',
    estimatedTime: metadata.estimatedTime || 30, // seconds
    xpBase: metadata.xpBase || 10,
    requiresAudio: metadata.requiresAudio || false,
    requiresMicrophone: metadata.requiresMicrophone || false,
    supportsOffline: metadata.supportsOffline !== false,
    ...metadata
  });
}

function getMetadata(type) {
  return exerciseMetadata.get(type);
}

function getAllMetadata() {
  return Array.from(exerciseMetadata.values());
}

// ══════════════════════════════════════════════
// EXERCISE GENERATION FROM CONTENT
// ══════════════════════════════════════════════
async function generateExercises(contentItem, config = {}) {
  const exercises = [];
  const requestedTypes = config.types || getDefaultTypesForContent(contentItem);
  const countPerType = config.countPerType || 1;

  for (const type of requestedTypes) {
    const generator = generators.get(type);
    if (generator) {
      try {
        const generated = await generator.generate(contentItem, { count: countPerType, ...config });
        if (Array.isArray(generated)) {
          exercises.push(...generated.map(e => ({ ...e, type })));
        } else if (generated) {
          exercises.push({ ...generated, type });
        }
      } catch (err) {
        console.error(`ExerciseRegistry: Generator for "${type}" failed:`, err);
      }
    }
  }

  // Shuffle for variety
  return shuffleArray(exercises);
}

function getDefaultTypesForContent(contentItem) {
  const typeMap = {
    vocabulary: [
      EXERCISE_TYPES.FLASHCARD,
      EXERCISE_TYPES.MULTIPLE_CHOICE,
      EXERCISE_TYPES.TYPING,
      EXERCISE_TYPES.IMAGE_MATCH,
      EXERCISE_TYPES.LISTENING_RECOGNITION,
      EXERCISE_TYPES.SPEAKING_PRONUNCIATION
    ],
    sentence: [
      EXERCISE_TYPES.SENTENCE_BUILDER,
      EXERCISE_TYPES.SENTENCE_TRANSLATE,
      EXERCISE_TYPES.SENTENCE_ORDERING,
      EXERCISE_TYPES.LISTENING_TRANSCRIBE,
      EXERCISE_TYPES.SPEAKING_REPEAT
    ],
    dialogue: [
      EXERCISE_TYPES.DIALOGUE_CHOICE,
      EXERCISE_TYPES.DIALOGUE_COMPLETE,
      EXERCISE_TYPES.DIALOGUE_ROLEPLAY,
      EXERCISE_TYPES.LISTENING_MULTIPLE_CHOICE
    ],
    grammar: [
      EXERCISE_TYPES.EXAM_GRAMMAR,
      EXERCISE_TYPES.MULTIPLE_CHOICE,
      EXERCISE_TYPES.TYPING
    ],
    culture: [
      EXERCISE_TYPES.EXAM_READING,
      EXERCISE_TYPES.MULTIPLE_CHOICE,
      EXERCISE_TYPES.GAME_TRIVIA
    ],
    article: [
      EXERCISE_TYPES.EXAM_READING,
      EXERCISE_TYPES.LISTENING_TRANSCRIBE,
      EXERCISE_TYPES.WRITING_FREEFORM
    ]
  };

  return typeMap[contentItem.contentType] || typeMap.vocabulary;
}

// ══════════════════════════════════════════════
// EXERCISE SEQUENCING FOR DAILY FLOW
// ══════════════════════════════════════════════
async function createDailyFlow(contentItems, options = {}) {
  const {
    targetDuration = 10 * 60, // 10 minutes in seconds
    maxExercises = 15,
    includeReview = true,
    reviewRatio = 0.3
  } = options;

  const flow = [];
  let totalTime = 0;

  // 1. Warm-up: Review (SRS due cards)
  if (includeReview) {
    const reviewCount = Math.floor(maxExercises * reviewRatio);
    // TODO: integrate with SRS engine
    // const reviewItems = SRS.getDueCards(reviewCount);
    // for (const item of reviewItems) { ... }
  }

  // 2. New content: progressive difficulty
  const newItems = contentItems.filter(item => !item.isReview).slice(0, maxExercises - flow.length);
  for (const item of newItems) {
    const exercises = generateExercises(item, { countPerType: 1 });
    for (const ex of exercises) {
      const meta = getMetadata(ex.type);
      if (totalTime + (meta?.estimatedTime || 30) > targetDuration) break;
      flow.push({ ...ex, contentId: item.id });
      totalTime += meta?.estimatedTime || 30;
    }
    if (flow.length >= maxExercises) break;
  }

  // 3. Cool-down: Gamified practice
  if (flow.length < maxExercises && totalTime < targetDuration) {
    const gameTypes = [EXERCISE_TYPES.GAME_MATCH, EXERCISE_TYPES.GAME_TRIVIA];
    const gameType = gameTypes[Math.floor(Math.random() * gameTypes.length)];
    const generator = generators.get(gameType);
    if (generator) {
      const gameEx = await generator.generate({ type: 'mixed' }, { count: 1 });
      if (gameEx) flow.push({ ...gameEx[0], type: gameType });
    }
  }

  return flow;
}

// ══════════════════════════════════════════════
// EXAM PREPARATION FLOW
// ══════════════════════════════════════════════
function createExamFlow(examType, level, contentItems) {
  const examTypeMap = {
    CILS: {
      A1: ['EXAM_VOCABULARY', 'EXAM_GRAMMAR', 'EXAM_LISTENING', 'EXAM_READING'],
      A2: ['EXAM_VOCABULARY', 'EXAM_GRAMMAR', 'EXAM_LISTENING', 'EXAM_READING', 'EXAM_WRITING'],
      B1: ['EXAM_VOCABULARY', 'EXAM_GRAMMAR', 'EXAM_LISTENING', 'EXAM_READING', 'EXAM_WRITING', 'EXAM_SPEAKING'],
      B2: ['EXAM_VOCABULARY', 'EXAM_GRAMMAR', 'EXAM_LISTENING', 'EXAM_READING', 'EXAM_WRITING', 'EXAM_SPEAKING'],
      C1: ['EXAM_VOCABULARY', 'EXAM_GRAMMAR', 'EXAM_LISTENING', 'EXAM_READING', 'EXAM_WRITING', 'EXAM_SPEAKING'],
      C2: ['EXAM_VOCABULARY', 'EXAM_GRAMMAR', 'EXAM_LISTENING', 'EXAM_READING', 'EXAM_WRITING', 'EXAM_SPEAKING']
    },
    CELI: {
      // Similar structure
    },
    AIL: {
      // Similar structure
    }
  };

  const sections = examTypeMap[examType]?.[level] || examTypeMap.CILS[level];
  const flow = [];

  for (const sectionType of sections) {
    const generator = generators.get(sectionType);
    if (generator) {
      const relevantContent = contentItems.filter(item => 
        item.examTags?.some(tag => tag.startsWith(`${examType}_${level}_`))
      );
      const exercises = generator.generate(relevantContent, { count: 5, examType, level });
      flow.push(...exercises.map(e => ({ ...e, type: sectionType, examSection: sectionType })));
    }
  }

  return flow;
}

// ══════════════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════════════
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ══════════════════════════════════════════════
// PUBLIC API
// ══════════════════════════════════════════════
const api = {
  // Types
  EXERCISE_TYPES,

  // Generator management
  registerGenerator,
  getGenerator,

  // Metadata
  registerMetadata,
  getMetadata,
  getAllMetadata,

  // Generation
  generateExercises,
  getDefaultTypesForContent,

  // Flows
  createDailyFlow,
  createExamFlow,

  // Utility
  shuffleArray
};

return api;

})();

// Expose globally
window.ExerciseRegistry = ExerciseRegistry;

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExerciseRegistry;
}