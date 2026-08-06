/* ══════════════════════════════════════════════
   VolaLingo — Exercise Generators
   Sprint C4C: Generators for each exercise type
   ══════════════════════════════════════════════ */

// ══════════════════════════════════════════════
// BASE GENERATOR CLASS
// ══════════════════════════════════════════════
class BaseExerciseGenerator {
  constructor(type) {
    this.type = type;
  }

  async generate(contentItem, config = {}) {
    throw new Error('generate() must be implemented by subclass');
  }

  // Helper: Create a basic exercise object
  createExercise(contentItem, exerciseData) {
    return {
      id: `${contentItem.id}_${this.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: this.type,
      contentId: contentItem.id,
      ...exerciseData
    };
  }

  // Helper: Create multiple choice options
  createMultipleChoiceOptions(correctAnswer, allAnswers, count = 4) {
    const options = [correctAnswer];
    const shuffled = [...allAnswers].filter(a => a !== correctAnswer).sort(() => Math.random() - 0.5);
    options.push(...shuffled.slice(0, count - 1));
    return this.shuffleArray(options);
  }

  // Helper: Shuffle array
  shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Helper: Get random items from array
  getRandomItems(array, count) {
    const shuffled = this.shuffleArray(array);
    return shuffled.slice(0, count);
  }
}

// ══════════════════════════════════════════════
// FLASHCARD GENERATOR
// ══════════════════════════════════════════════
class FlashcardGenerator extends BaseExerciseGenerator {
  constructor() {
    super('flashcard');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];

    for (let i = 0; i < count; i++) {
      const translations = contentItem.translations || {};
      const mainTranslation = translations.he || translations.en || Object.values(translations)[0];

      exercises.push(this.createExercise(contentItem, {
        prompt: contentItem.word || contentItem.id,
        answer: mainTranslation,
        direction: 'it-to-target',
        showAfterFlip: {
          translation: mainTranslation,
          example: contentItem.example || '',
          audio: contentItem.audio || null,
          cultureNote: contentItem.culture?.note || ''
        }
      }));
    }

    return exercises;
  }
}

// ══════════════════════════════════════════════
// MULTIPLE CHOICE GENERATOR
// ══════════════════════════════════════════════
class MultipleChoiceGenerator extends BaseExerciseGenerator {
  constructor() {
    super('multiple_choice');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];
    const allVocab = config.allVocab || [];

    for (let i = 0; i < count; i++) {
      const translations = contentItem.translations || {};
      const correct = translations.he || translations.en || Object.values(translations)[0];
      const distractors = allVocab
        .filter(v => v.id !== contentItem.id)
        .map(v => v.translations?.he || v.translations?.en || '')
        .filter(Boolean);

      const options = this.createMultipleChoiceOptions(correct, distractors, 4);

      exercises.push(this.createExercise(contentItem, {
        prompt: `מה הפירוש של "${contentItem.word || contentItem.id}"?`,
        question: contentItem.word || contentItem.id,
        options,
        correctAnswer: correct,
        explanation: contentItem.culture?.note || ''
      }));
    }

    return exercises;
  }
}

// ══════════════════════════════════════════════
// TYPING GENERATOR
// ══════════════════════════════════════════════
class TypingGenerator extends BaseExerciseGenerator {
  constructor() {
    super('typing');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];

    for (let i = 0; i < count; i++) {
      const translations = contentItem.translations || {};
      const correct = translations.he || translations.en || Object.values(translations)[0];

      exercises.push(this.createExercise(contentItem, {
        prompt: `כתוב את המילה בעברית: "${contentItem.word || contentItem.id}"`,
        question: contentItem.word || contentItem.id,
        correctAnswer: correct,
        acceptVariations: [correct.toLowerCase(), correct.trim()],
        showHint: contentItem.example || '',
        direction: 'it-to-target'
      }));
    }

    return exercises;
  }
}

// ══════════════════════════════════════════════
// IMAGE MATCH GENERATOR
// ══════════════════════════════════════════════
class ImageMatchGenerator extends BaseExerciseGenerator {
  constructor() {
    super('image_match');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];
    const allVocab = config.allVocab || [];

    for (let i = 0; i < count; i++) {
      const correctImage = contentItem.image || `https://example.com/images/${contentItem.id}.jpg`;
      const distractors = allVocab
        .filter(v => v.id !== contentItem.id && v.image)
        .map(v => v.image)
        .slice(0, 3);

      const options = this.shuffleArray([correctImage, ...distractors]);

      exercises.push(this.createExercise(contentItem, {
        prompt: `בחר את התמונה המתאימה ל-"${contentItem.word || contentItem.id}"`,
        question: contentItem.word || contentItem.id,
        images: options,
        correctImage,
        direction: 'target-to-image'
      }));
    }

    return exercises;
  }
}

// ══════════════════════════════════════════════
// SENTENCE BUILDER GENERATOR
// ══════════════════════════════════════════════
class SentenceBuilderGenerator extends BaseExerciseGenerator {
  constructor() {
    super('sentence_builder');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];

    for (let i = 0; i < count; i++) {
      const sentence = contentItem.sentence || contentItem.text || '';
      const translation = contentItem.translation || '';
      const words = sentence.split(' ').filter(w => w.length > 0);

      exercises.push(this.createExercise(contentItem, {
        prompt: `בנה את המשפט: "${translation}"`,
        translation,
        words: this.shuffleArray(words),
        correctOrder: words,
        audio: contentItem.audio || null
      }));
    }

    return exercises;
  }
}

// ══════════════════════════════════════════════
// SENTENCE TRANSLATE GENERATOR
// ══════════════════════════════════════════════
class SentenceTranslateGenerator extends BaseExerciseGenerator {
  constructor() {
    super('sentence_translate');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];

    for (let i = 0; i < count; i++) {
      const sentence = contentItem.sentence || contentItem.text || '';
      const translation = contentItem.translation || contentItem.translations?.he || '';

      exercises.push(this.createExercise(contentItem, {
        prompt: `תרגם לעברית: "${sentence}"`,
        sourceText: sentence,
        targetLanguage: 'he',
        correctAnswer: translation,
        acceptVariations: [translation],
        showHint: contentItem.grammarNote || '',
        direction: 'it-to-target'
      }));
    }

    return exercises;
  }
}

// ══════════════════════════════════════════════
// SENTENCE ORDERING GENERATOR
// ══════════════════════════════════════════════
class SentenceOrderingGenerator extends BaseExerciseGenerator {
  constructor() {
    super('sentence_ordering');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];

    for (let i = 0; i < count; i++) {
      const sentence = contentItem.sentence || contentItem.text || '';
      const translation = contentItem.translation || '';
      const chunks = this.splitIntoChunks(sentence);

      exercises.push(this.createExercise(contentItem, {
        prompt: `סדר את המילים: "${translation}"`,
        translation,
        chunks: this.shuffleArray(chunks),
        correctOrder: chunks,
        audio: contentItem.audio || null
      }));
    }

    return exercises;
  }

  splitIntoChunks(sentence) {
    // Split by punctuation or logical phrases
    return sentence.split(/([,.!?;:])|\s+/).filter(Boolean);
  }
}

// ══════════════════════════════════════════════
// LISTENING RECOGNITION GENERATOR
// ══════════════════════════════════════════════
class ListeningRecognitionGenerator extends BaseExerciseGenerator {
  constructor() {
    super('listening_recognition');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];
    const allVocab = config.allVocab || [];

    for (let i = 0; i < count; i++) {
      const audio = contentItem.audio || `https://example.com/audio/${contentItem.id}.mp3`;
      const correct = contentItem.word || contentItem.id;
      const distractors = allVocab
        .filter(v => v.id !== contentItem.id)
        .map(v => v.word || v.id)
        .slice(0, 3);

      exercises.push(this.createExercise(contentItem, {
        prompt: 'הקשב ובחר את המילה ששמעת',
        audio,
        options: this.shuffleArray([correct, ...distractors]),
        correctAnswer: correct,
        showTextAfterAnswer: true
      }));
    }

    return exercises;
  }
}

// ══════════════════════════════════════════════
// LISTENING TRANSCRIBE GENERATOR
// ══════════════════════════════════════════════
class ListeningTranscribeGenerator extends BaseExerciseGenerator {
  constructor() {
    super('listening_transcribe');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];

    for (let i = 0; i < count; i++) {
      const audio = contentItem.audio || `https://example.com/audio/${contentItem.id}.mp3`;
      const correct = contentItem.sentence || contentItem.text || contentItem.word || '';

      exercises.push(this.createExercise(contentItem, {
        prompt: 'הקשב וכתוב את מה ששמעת',
        audio,
        correctAnswer: correct,
        acceptVariations: [correct.toLowerCase().trim(), correct.trim()],
        showHint: contentItem.translation || '',
        maxTypos: 2
      }));
    }

    return exercises;
  }
}

// ══════════════════════════════════════════════
// LISTENING MULTIPLE CHOICE GENERATOR
// ══════════════════════════════════════════════
class ListeningMultipleChoiceGenerator extends BaseExerciseGenerator {
  constructor() {
    super('listening_multiple_choice');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];
    const allDialogues = config.allDialogues || [];

    for (let i = 0; i < count; i++) {
      const audio = contentItem.audio || `https://example.com/audio/${contentItem.id}.mp3`;
      const question = contentItem.question || 'מה שמעת?';
      const correct = contentItem.correctAnswer || contentItem.answer || '';
      const distractors = allDialogues
        .filter(d => d.id !== contentItem.id)
        .map(d => d.answer || d.correctAnswer || '')
        .filter(Boolean)
        .slice(0, 3);

      exercises.push(this.createExercise(contentItem, {
        prompt: question,
        audio,
        options: this.createMultipleChoiceOptions(correct, distractors, 4),
        correctAnswer: correct,
        explanation: contentItem.explanation || ''
      }));
    }

    return exercises;
  }
}

// ══════════════════════════════════════════════
// SPEAKING PRONUNCIATION GENERATOR
// ══════════════════════════════════════════════
class SpeakingPronunciationGenerator extends BaseExerciseGenerator {
  constructor() {
    super('speaking_pronunciation');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];

    for (let i = 0; i < count; i++) {
      const word = contentItem.word || contentItem.id;
      const audio = contentItem.audio || `https://example.com/audio/${contentItem.id}.mp3`;

      exercises.push(this.createExercise(contentItem, {
        prompt: `חזור על המילה: "${word}"`,
        targetText: word,
        referenceAudio: audio,
        language: 'it-IT',
        minScore: 0.7,
        feedback: contentItem.pronunciationTip || ''
      }));
    }

    return exercises;
  }
}

// ══════════════════════════════════════════════
// SPEAKING REPEAT GENERATOR
// ══════════════════════════════════════════════
class SpeakingRepeatGenerator extends BaseExerciseGenerator {
  constructor() {
    super('speaking_repeat');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];

    for (let i = 0; i < count; i++) {
      const sentence = contentItem.sentence || contentItem.text || '';
      const audio = contentItem.audio || `https://example.com/audio/${contentItem.id}.mp3`;

      exercises.push(this.createExercise(contentItem, {
        prompt: `חזור על המשפט: "${sentence}"`,
        targetText: sentence,
        referenceAudio: audio,
        language: 'it-IT',
        minScore: 0.65,
        feedback: contentItem.grammarNote || ''
      }));
    }

    return exercises;
  }
}

// ══════════════════════════════════════════════
// SPEAKING ROLEPLAY GENERATOR
// ══════════════════════════════════════════════
class SpeakingRoleplayGenerator extends BaseExerciseGenerator {
  constructor() {
    super('speaking_roleplay');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];

    for (let i = 0; i < count; i++) {
      const scenario = contentItem.scenario || 'כללי';
      const userRole = contentItem.userRole || 'תייר';
      const prompt = contentItem.prompt || 'הגב באופן טבעי';

      exercises.push(this.createExercise(contentItem, {
        prompt: `${scenario}: ${prompt}`,
        scenario,
        userRole,
        expectedKeywords: contentItem.keywords || [],
        minDuration: 5, // seconds
        maxDuration: 30,
        language: 'it-IT',
        context: contentItem.context || ''
      }));
    }

    return exercises;
  }
}

// ══════════════════════════════════════════════
// WRITING TRANSLATE GENERATOR
// ══════════════════════════════════════════════
class WritingTranslateGenerator extends BaseExerciseGenerator {
  constructor() {
    super('writing_translate');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];

    for (let i = 0; i < count; i++) {
      const source = contentItem.sentence || contentItem.text || '';
      const target = contentItem.translation || contentItem.translations?.he || '';

      exercises.push(this.createExercise(contentItem, {
        prompt: `תרגם לאיטלקית: "${target}"`,
        sourceText: target,
        targetLanguage: 'it',
        correctAnswer: source,
        acceptVariations: [source.toLowerCase().trim()],
        minLength: source.length * 0.5,
        maxLength: source.length * 1.5,
        showHint: contentItem.grammarNote || ''
      }));
    }

    return exercises;
  }
}

// ══════════════════════════════════════════════
// WRITING FREEFORM GENERATOR
// ══════════════════════════════════════════════
class WritingFreeformGenerator extends BaseExerciseGenerator {
  constructor() {
    super('writing_freeform');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];

    for (let i = 0; i < count; i++) {
      const prompt = contentItem.writingPrompt || contentItem.prompt || `כתוב משפט עם "${contentItem.word || contentItem.id}"`;
      const requiredWords = contentItem.requiredWords || [contentItem.word || contentItem.id].filter(Boolean);
      const minWords = contentItem.minWords || 5;

      exercises.push(this.createExercise(contentItem, {
        prompt,
        requiredWords,
        minWords,
        targetLanguage: 'it',
        suggestedGrammar: contentItem.grammarTags || [],
        evaluationCriteria: {
          grammar: 0.4,
          vocabulary: 0.3,
          coherence: 0.3
        }
      }));
    }

    return exercises;
  }
}

// ══════════════════════════════════════════════
// WRITING DICTATION GENERATOR
// ══════════════════════════════════════════════
class WritingDictationGenerator extends BaseExerciseGenerator {
  constructor() {
    super('writing_dictation');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];

    for (let i = 0; i < count; i++) {
      const audio = contentItem.audio || `https://example.com/audio/${contentItem.id}.mp3`;
      const correct = contentItem.sentence || contentItem.text || '';

      exercises.push(this.createExercise(contentItem, {
        prompt: 'הקשב וכתוב בדיוק את מה ששמעת',
        audio,
        correctAnswer: correct,
        acceptVariations: [correct.trim()],
        showPunctuation: true,
        showCapitalization: true,
        maxErrors: 3
      }));
    }

    return exercises;
  }
}

// ══════════════════════════════════════════════
// DIALOGUE CHOICE GENERATOR
// ══════════════════════════════════════════════
class DialogueChoiceGenerator extends BaseExerciseGenerator {
  constructor() {
    super('dialogue_choice');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];

    for (let i = 0; i < count; i++) {
      const context = contentItem.context || '';
      const speaker = contentItem.speaker || 'A';
      const correct = contentItem.correctResponse || '';
      const options = contentItem.options || [correct, 'אפשרות 2', 'אפשרות 3', 'אפשרות 4'];

      exercises.push(this.createExercise(contentItem, {
        prompt: `${context}\n${speaker}: ${contentItem.previousLine || ''}`,
        context,
        speaker,
        options: this.shuffleArray(options),
        correctAnswer: correct,
        audio: contentItem.audio || null,
        explanation: contentItem.explanation || ''
      }));
    }

    return exercises;
  }
}

// ══════════════════════════════════════════════
// DIALOGUE COMPLETE GENERATOR
// ══════════════════════════════════════════════
class DialogueCompleteGenerator extends BaseExerciseGenerator {
  constructor() {
    super('dialogue_complete');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];

    for (let i = 0; i < count; i++) {
      const partial = contentItem.partialDialogue || '';
      const missing = contentItem.missingPart || '';
      const context = contentItem.context || '';

      exercises.push(this.createExercise(contentItem, {
        prompt: `${context}\nהשלם את הדיאלוג:\n"${partial} ______"`,
        partialDialogue: partial,
        missingPart: missing,
        correctAnswer: missing,
        acceptVariations: [missing.toLowerCase().trim()],
        audio: contentItem.audio || null,
        hint: contentItem.hint || ''
      }));
    }

    return exercises;
  }
}

// ══════════════════════════════════════════════
// DIALOGUE ROLEPLAY GENERATOR
// ══════════════════════════════════════════════
class DialogueRoleplayGenerator extends BaseExerciseGenerator {
  constructor() {
    super('dialogue_roleplay');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];

    for (let i = 0; i < count; i++) {
      const scenario = contentItem.scenario || '';
      const userRole = contentItem.userRole || '';
      const npcRole = contentItem.npcRole || '';
      const turns = contentItem.turns || [];

      exercises.push(this.createExercise(contentItem, {
        prompt: `${scenario}: אתה ${userRole}, דבר עם ${npcRole}`,
        scenario,
        userRole,
        npcRole,
        turns,
        language: 'it-IT',
        evaluationCriteria: {
          appropriateness: 0.4,
          grammar: 0.3,
          fluency: 0.3
        }
      }));
    }

    return exercises;
  }
}

// ══════════════════════════════════════════════
// EXAM GENERATORS (CILS/CELI/AIL)
// ══════════════════════════════════════════════
class ExamReadingGenerator extends BaseExerciseGenerator {
  constructor() {
    super('exam_reading');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];

    for (let i = 0; i < count; i++) {
      const text = contentItem.text || contentItem.article || '';
      const questions = contentItem.questions || [{
        question: 'מה הנושא המרכזי של הטקסט?',
        options: ['אפשרות א', 'אפשרות ב', 'אפשרות ג', 'אפשרות ד'],
        correct: 0
      }];

      exercises.push(this.createExercise(contentItem, {
        prompt: 'קרא את הטקסט וענה על השאלות',
        text,
        questions,
        examType: config.examType || 'CILS',
        level: config.level || 'B1',
        section: 'reading',
        timeLimit: 300 // 5 minutes
      }));
    }

    return exercises;
  }
}

class ExamListeningGenerator extends BaseExerciseGenerator {
  constructor() {
    super('exam_listening');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];

    for (let i = 0; i < count; i++) {
      const audio = contentItem.audio || '';
      const questions = contentItem.questions || [{
        question: 'מה שמעת?',
        options: ['אפשרות א', 'אפשרות ב', 'אפשרות ג', 'אפשרות ד'],
        correct: 0
      }];

      exercises.push(this.createExercise(contentItem, {
        prompt: 'הקשב וענה על השאלות',
        audio,
        questions,
        examType: config.examType || 'CILS',
        level: config.level || 'B1',
        section: 'listening',
        playsAllowed: 2
      }));
    }

    return exercises;
  }
}

class ExamWritingGenerator extends BaseExerciseGenerator {
  constructor() {
    super('exam_writing');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];

    for (let i = 0; i < count; i++) {
      const prompt = contentItem.writingPrompt || '';
      const wordCount = contentItem.wordCount || { min: 50, max: 100 };
      const criteria = contentItem.criteria || ['task completion', 'coherence', 'vocabulary', 'grammar'];

      exercises.push(this.createExercise(contentItem, {
        prompt,
        wordCount,
        criteria,
        examType: config.examType || 'CILS',
        level: config.level || 'B1',
        section: 'writing',
        timeLimit: 1200 // 20 minutes
      }));
    }

    return exercises;
  }
}

class ExamSpeakingGenerator extends BaseExerciseGenerator {
  constructor() {
    super('exam_speaking');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];

    for (let i = 0; i < count; i++) {
      const task = contentItem.task || '';
      const timePrep = contentItem.timePrep || 60;
      const timeSpeak = contentItem.timeSpeak || 60;

      exercises.push(this.createExercise(contentItem, {
        prompt: task,
        timePrep,
        timeSpeak,
        examType: config.examType || 'CILS',
        level: config.level || 'B1',
        section: 'speaking',
        evaluationCriteria: {
          fluency: 0.25,
          grammar: 0.25,
          vocabulary: 0.25,
          pronunciation: 0.25
        }
      }));
    }

    return exercises;
  }
}

class ExamGrammarGenerator extends BaseExerciseGenerator {
  constructor() {
    super('exam_grammar');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];

    for (let i = 0; i < count; i++) {
      const sentence = contentItem.sentence || '';
      const gap = contentItem.gap || '';
      const options = contentItem.options || [gap, 'distractor1', 'distractor2', 'distractor3'];

      exercises.push(this.createExercise(contentItem, {
        prompt: `השלם את המשפט: "${sentence.replace('____', '_____')}"`,
        sentence,
        gap,
        options: this.shuffleArray(options),
        correctAnswer: gap,
        grammarTopic: contentItem.grammarTopic || '',
        examType: config.examType || 'CILS',
        level: config.level || 'B1',
        section: 'grammar'
      }));
    }

    return exercises;
  }
}

class ExamVocabularyGenerator extends BaseExerciseGenerator {
  constructor() {
    super('exam_vocabulary');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];

    for (let i = 0; i < count; i++) {
      const context = contentItem.context || '';
      const target = contentItem.targetWord || '';
      const options = contentItem.options || [target, 'distractor1', 'distractor2', 'distractor3'];

      exercises.push(this.createExercise(contentItem, {
        prompt: `${context}\nבחר את המילה המתאימה:`,
        context,
        targetWord: target,
        options: this.shuffleArray(options),
        correctAnswer: target,
        examType: config.examType || 'CILS',
        level: config.level || 'B1',
        section: 'vocabulary'
      }));
    }

    return exercises;
  }
}

// ══════════════════════════════════════════════
// GAME GENERATORS
// ══════════════════════════════════════════════
class GameMatchGenerator extends BaseExerciseGenerator {
  constructor() {
    super('game_match');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];
    const allVocab = config.allVocab || [];

    for (let i = 0; i < count; i++) {
      const pairs = allVocab.slice(0, 8).map(v => ({
        italian: v.word || v.id,
        translation: v.translations?.he || v.translations?.en || ''
      }));

      exercises.push(this.createExercise(contentItem, {
        prompt: 'התאם כל מילה לפירושה',
        pairs: this.shuffleArray(pairs),
        gameType: 'match',
        timeLimit: 60
      }));
    }

    return exercises;
  }
}

class GameMemoryGenerator extends BaseExerciseGenerator {
  constructor() {
    super('game_memory');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];
    const allVocab = config.allVocab || [];

    for (let i = 0; i < count; i++) {
      const cards = allVocab.slice(0, 6).flatMap(v => [
        { id: `${v.id}_it`, content: v.word || v.id, type: 'italian', pairId: v.id },
        { id: `${v.id}_he`, content: v.translations?.he || v.translations?.en || '', type: 'translation', pairId: v.id }
      ]);

      exercises.push(this.createExercise(contentItem, {
        prompt: 'מצא זוגות תואמים',
        cards: this.shuffleArray(cards),
        gameType: 'memory',
        timeLimit: 120
      }));
    }

    return exercises;
  }
}

class GameTriviaGenerator extends BaseExerciseGenerator {
  constructor() {
    super('game_trivia');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];

    for (let i = 0; i < count; i++) {
      const questions = contentItem.triviaQuestions || [
        {
          question: 'מהי בירת איטליה?',
          options: ['רומא', 'מילאנו', 'נאפולי', 'טורינו'],
          correct: 0,
          category: 'geography'
        },
        {
          question: 'איזה יין מפורסם מגיע מטוסקנה?',
          options: ['קיאנטי', 'ברולו', 'פרוסקו', 'לאמברוסקו'],
          correct: 0,
          category: 'culture'
        }
      ];

      exercises.push(this.createExercise(contentItem, {
        prompt: 'טריוויה איטלקית',
        questions: this.shuffleArray(questions),
        gameType: 'trivia',
        timePerQuestion: 15
      }));
    }

    return exercises;
  }
}

class GameWordSearchGenerator extends BaseExerciseGenerator {
  constructor() {
    super('game_word_search');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];
    const allVocab = config.allVocab || [];

    for (let i = 0; i < count; i++) {
      const words = allVocab.slice(0, 10).map(v => v.word || v.id).filter(w => w.length >= 3);
      const grid = this.generateWordSearchGrid(words);

      exercises.push(this.createExercise(contentItem, {
        prompt: 'מצא את המילים החבויות',
        grid,
        words,
        gameType: 'word_search',
        timeLimit: 180
      }));
    }

    return exercises;
  }

  generateWordSearchGrid(words) {
    const size = 12;
    const grid = Array(size).fill(null).map(() => Array(size).fill(''));
    
    // Simple placement - just return empty grid for now
    // Real implementation would place words in grid
    return grid.map(row => row.map(() => String.fromCharCode(97 + Math.floor(Math.random() * 26))));
  }
}

// ══════════════════════════════════════════════
// ANKI GENERATORS
// ══════════════════════════════════════════════
class AnkiReviewGenerator extends BaseExerciseGenerator {
  constructor() {
    super('anki_review');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];

    for (let i = 0; i < count; i++) {
      const card = contentItem.card || contentItem;
      const translations = card.translations || {};
      const answer = translations.he || translations.en || '';

      exercises.push(this.createExercise(contentItem, {
        prompt: `זכור: "${card.word || card.id}"`,
        front: card.word || card.id,
        back: answer,
        example: card.example || '',
        audio: card.audio || null,
        cultureNote: card.culture?.note || '',
        dueDate: card.dueDate || Date.now(),
        interval: card.interval || 1,
        easeFactor: card.easeFactor || 2.5
      }));
    }

    return exercises;
  }
}

class AnkiNewCardGenerator extends BaseExerciseGenerator {
  constructor() {
    super('anki_new_card');
  }

  async generate(contentItem, config = {}) {
    const count = config.count || 1;
    const exercises = [];

    for (let i = 0; i < count; i++) {
      const translations = contentItem.translations || {};
      const answer = translations.he || translations.en || '';

      exercises.push(this.createExercise(contentItem, {
        prompt: `מילה חדשה: "${contentItem.word || contentItem.id}"`,
        front: contentItem.word || contentItem.id,
        back: answer,
        example: contentItem.example || '',
        audio: contentItem.audio || null,
        cultureNote: contentItem.culture?.note || '',
        learningSteps: [1, 10] // minutes
      }));
    }

    return exercises;
  }
}

// ══════════════════════════════════════════════
// REGISTER ALL GENERATORS
// ══════════════════════════════════════════════
const generators = {
  // Core vocabulary
  flashcard: new FlashcardGenerator(),
  multiple_choice: new MultipleChoiceGenerator(),
  typing: new TypingGenerator(),
  image_match: new ImageMatchGenerator(),

  // Sentence
  sentence_builder: new SentenceBuilderGenerator(),
  sentence_translate: new SentenceTranslateGenerator(),
  sentence_ordering: new SentenceOrderingGenerator(),

  // Listening
  listening_recognition: new ListeningRecognitionGenerator(),
  listening_transcribe: new ListeningTranscribeGenerator(),
  listening_multiple_choice: new ListeningMultipleChoiceGenerator(),

  // Speaking
  speaking_pronunciation: new SpeakingPronunciationGenerator(),
  speaking_repeat: new SpeakingRepeatGenerator(),
  speaking_roleplay: new SpeakingRoleplayGenerator(),

  // Writing
  writing_translate: new WritingTranslateGenerator(),
  writing_freeform: new WritingFreeformGenerator(),
  writing_dictation: new WritingDictationGenerator(),

  // Dialogue
  dialogue_choice: new DialogueChoiceGenerator(),
  dialogue_complete: new DialogueCompleteGenerator(),
  dialogue_roleplay: new DialogueRoleplayGenerator(),

  // Exam
  exam_reading: new ExamReadingGenerator(),
  exam_listening: new ExamListeningGenerator(),
  exam_writing: new ExamWritingGenerator(),
  exam_speaking: new ExamSpeakingGenerator(),
  exam_grammar: new ExamGrammarGenerator(),
  exam_vocabulary: new ExamVocabularyGenerator(),

  // Games
  game_match: new GameMatchGenerator(),
  game_memory: new GameMemoryGenerator(),
  game_trivia: new GameTriviaGenerator(),
  game_word_search: new GameWordSearchGenerator(),

  // Anki
  anki_review: new AnkiReviewGenerator(),
  anki_new_card: new AnkiNewCardGenerator()
};

// Register with ExerciseRegistry
if (typeof ExerciseRegistry !== 'undefined') {
  for (const [type, generator] of Object.entries(generators)) {
    ExerciseRegistry.registerGenerator(type, generator);
  }
  console.log('🎯 All exercise generators registered with ExerciseRegistry');
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = generators;
}

// Expose globally
window.ExerciseGenerators = generators;