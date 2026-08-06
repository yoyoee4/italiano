# Sprint C4C: Exercise Registry + Generators + Content Wiring

**Status**: ✅ Complete  
**Date**: 2026-08-05  
**Commit**: 09485f5  
**Branch**: main → pushed to origin/main  

---

## 🎯 Goal
Build a central Exercise Registry with factory pattern, 28 generator classes, and bridge connecting existing content (APP_DATA) to generators.

---

## 📦 Deliverables

### 1. Exercise Registry (`js/modules/practice/exercise-registry.js`)

**Class**: `ExerciseRegistry`

```javascript
class ExerciseRegistry {
  register(type, generatorClass)     // Register new exercise type
  get(type)                          // Get generator class by type
  getAllTypes()                      // List all registered types
  generateExercises(content, config) // Generate exercises from content
  createDailyFlow(profile, content)  // Generate 10-min daily session
  createExamFlow(examType, level)    // Generate exam simulation
}
```

**Built-in Types Registered** (30+):
| Category | Types |
|----------|-------|
| Vocab | `flashcard`, `multiple_choice`, `typing`, `image_match` |
| Sentence | `sentence_builder`, `translate`, `ordering` |
| Listening | `listening_recognition`, `listening_transcribe`, `listening_mc` |
| Speaking | `speaking_pronunciation`, `speaking_repeat`, `speaking_roleplay` |
| Writing | `writing_translate`, `writing_freeform`, `writing_dictation` |
| Dialogue | `dialogue_choice`, `dialogue_complete`, `dialogue_roleplay` |
| Exam | `exam_reading`, `exam_listening`, `exam_writing`, `exam_speaking`, `exam_grammar`, `exam_vocabulary` |
| Games | `match_game`, `memory_game`, `trivia_game`, `word_search` |
| Anki | `anki_review`, `anki_new_card` |

**Sequencing Engine**:
- `getSequenceForLesson(lessonId, profile)` → ordered exercise types
- `getSequenceForExam(examType, level)` → balanced section order
- CEFR-aware difficulty progression

---

### 2. Generators (`js/modules/practice/generators/index.js`)

**28 Generator Classes** — each implements `generate(item, config)` → `Exercise` object:

| Generator | Input | Output Exercise Type |
|-----------|-------|---------------------|
| `FlashcardGenerator` | word | `flashcard` |
| `MultipleChoiceGenerator` | word | `multiple_choice` |
| `TypingGenerator` | word | `typing` |
| `ImageMatchGenerator` | word | `image_match` |
| `SentenceBuilderGenerator` | sentence | `sentence_builder` |
| `TranslateGenerator` | sentence | `translate` |
| `OrderingGenerator` | sentence | `ordering` |
| `ListeningRecognitionGenerator` | word | `listening_recognition` |
| `ListeningTranscribeGenerator` | word | `listening_transcribe` |
| `ListeningMultipleChoiceGenerator` | word | `listening_mc` |
| `SpeakingPronunciationGenerator` | word | `speaking_pronunciation` |
| `SpeakingRepeatGenerator` | sentence | `speaking_repeat` |
| `SpeakingRoleplayGenerator` | dialogue | `speaking_roleplay` |
| `WritingTranslateGenerator` | sentence | `writing_translate` |
| `WritingFreeformGenerator` | phrase | `writing_freeform` |
| `WritingDictationGenerator` | sentence | `writing_dictation` |
| `DialogueChoiceGenerator` | dialogue | `dialogue_choice` |
| `DialogueCompleteGenerator` | dialogue | `dialogue_complete` |
| `DialogueRoleplayGenerator` | dialogue | `dialogue_roleplay` |
| `ExamReadingGenerator` | text | `exam_reading` |
| `ExamListeningGenerator` | audio | `exam_listening` |
| `ExamWritingGenerator` | prompt | `exam_writing` |
| `ExamSpeakingGenerator` | prompt | `exam_speaking` |
| `ExamGrammarGenerator` | word/rule | `exam_grammar` |
| `ExamVocabularyGenerator` | word | `exam_vocabulary` |
| `MatchGameGenerator` | words[] | `match_game` |
| `MemoryGameGenerator` | words[] | `memory_game` |
| `TriviaGameGenerator` | culture item | `trivia_game` |
| `WordSearchGenerator` | words[] | `word_search` |
| `AnkiReviewGenerator` | srs card | `anki_review` |
| `AnkiNewCardGenerator` | word | `anki_new_card` |

**Exercise Object Contract**:
```javascript
{
  type: 'flashcard',
  prompt: 'Translate: ciao',
  expected: 'הלו',
  validation: { type: 'fuzzy', tolerance: 0.3 },
  meta: {
    hint: 'Casual greeting',
    audio: 'words/ciao.mp3',
    tags: ['greeting', 'A1'],
    difficulty: 0.1
  }
}
```

---

### 3. Content-Exercise Bridge (`js/modules/practice/content-exercises.js`)

**Class**: `ContentExerciseBridge`

```javascript
class ContentExerciseBridge {
  constructor(registry, contentLoader) { ... }
  
  // Map content types to appropriate generators
  generateExercisesForContent(contentItem, config)
  createDailyFlowFromContent(profile)
  createExamFlowFromContent(examType, level)
  getWeakWords(threshold)
  getExamPrepItems(examType, level)
}
```

**Content → Generator Mapping**:
| Content Source | Generator Categories |
|----------------|---------------------|
| `words.json` | Vocab + Listening + Speaking + Anki |
| `sentences.json` | Sentence + Writing + Listening |
| `dialogues.json` | Dialogue + Listening + Speaking |
| `phrases.json` | Vocab + Sentence + Writing |
| `culture/*.json` | Trivia + Reading |
| `articles/*.md` | Exam Reading |

---

## 🔧 Integration Updates

### Updated `js/modules/practice/index.js`
Added to Practice Contract API:
```javascript
getRegistry()                    // → ExerciseRegistry instance
getGenerators()                  // → Generators namespace
generateExercisesForContent()    // → Bridge method
createDailyFlow()                // → Bridge method
createExamFlow()                 // → Bridge method
```

### Updated `index.html`
Added script tags (load order):
```html
<script src="js/modules/practice/exercise-registry.js"></script>
<script src="js/modules/practice/generators/index.js"></script>
<script src="js/modules/practice/content-exercises.js"></script>
```

### Updated `sw.js`
Added to PRECACHE_URLS (v7):
- `js/modules/practice/exercise-registry.js`
- `js/modules/practice/generators/index.js`
- `js/modules/practice/content-exercises.js`

---

## ✅ QA Gates Passed

- [x] All 3 new modules load (200 OK)
- [x] `node --check` passes for all 3 files
- [x] ExerciseRegistry registers 30+ types
- [x] 28 generators instantiate without error
- [x] Content bridge maps all content types
- [x] `createDailyFlow()` returns valid session
- [x] `createExamFlow()` returns balanced sections

---

## 📊 Stats

| Metric | Value |
|--------|-------|
| Exercise Types Registered | 30+ |
| Generator Classes | 28 |
| Lines of Code | ~2,000 |
| Content Types Supported | 6 (words, sentences, dialogues, phrases, culture, articles) |

---

## 🔗 Links
- [[VolaLingo]] | [[Sprint_C4B_UX_Hardening]] | [[Sprint_C4D_Learning_Orchestrator]]
- Commit: https://github.com/yoyoee4/italiano/commit/09485f5