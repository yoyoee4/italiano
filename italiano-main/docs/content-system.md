# VolaLingo Content System

## Overview

The Content Intelligence Layer (Sprint C6) provides **structured, validated, cross-referenced content** that powers all learning activities. Every content item follows strict schemas and connects to exercises, exams, dictionary, culture, and the adaptive orchestrator.

---

## Content Architecture

```
content/
├── schema/                    # JSON Schemas (validation)
│   ├── content-item.schema.json
│   ├── lesson.schema.json
│   ├── exercise.schema.json
│   └── exam-question.schema.json
├── curriculum/                # Structured lessons A1→C2
│   ├── index.json             # 56 lessons mapping
│   ├── A1/ (greetings, numbers, food)
│   ├── A2/ (past_tenses)
│   └── B1/ (opinion)
├── dictionary/                # Offline dictionary
│   ├── metadata.json
│   └── it-he.json
├── culture/                   # Cultural modules
│   ├── coffee.json
│   ├── aperitivo.json
│   └── regions.json
├── articles/                  # Graded reading
│   ├── A1/cafe.md
│   ├── A2/aperitivo.md
│   └── B1/regions.md
├── nona-personality.json      # 3 Nona personalities
├── words.json                 # Core vocabulary
├── sentences.json             # Sentence patterns
├── phrases.json               # Useful phrases
├── dialogues.json             # Conversation scripts
├── culture.json               # Cultural facts
├── exams.json                 # Exam content
├── grammar.json               # Grammar rules
├── news.json                  # News snippets
├── stories.json               # Graded stories
├── achievements.json          # Gamification achievements
├── levels.json                # CEFR level definitions
├── characters.json            # Story characters
└── songs.json                 # Italian songs
```

---

## JSON Schemas

### content-item.schema.json
Base schema for all content items:
```json
{
  "$id": "content-item",
  "type": "object",
  "required": ["id", "cefr", "category", "tags", "hebrew", "italian", "audio"],
  "properties": {
    "id": { "type": "string", "pattern": "^[a-z-]+$" },
    "cefr": { "enum": ["A1", "A2", "B1", "B2", "C1", "C2"] },
    "category": { "enum": ["vocab", "grammar", "phrase", "dialogue", "culture"] },
    "tags": { "type": "array", "items": { "type": "string" } },
    "hebrew": { "type": "string" },
    "italian": { "type": "string" },
    "audio": { "type": "string", "format": "uri" },
    "grammar": { "type": "object" },
    "examples": { "type": "array" },
    "culture": { "type": "string" },
    "examTags": { "type": "array" },
    "srs": { "type": "object" }
  }
}
```

### lesson.schema.json
Structured lesson with exercises:
```json
{
  "$id": "lesson",
  "required": ["id", "title", "cefr", "order", "duration", "objectives", "content", "exercises"],
  "properties": {
    "content": {
      "words": { "type": "array" },
      "sentences": { "type": "array" },
      "dialogues": { "type": "array" },
      "grammar": { "type": "array" }
    },
    "exercises": {
      "type": "array",
      "items": { "$ref": "exercise.schema.json" }
    }
  }
}
```

### exercise.schema.json
Generated exercise format:
```json
{
  "$id": "exercise",
  "required": ["type", "prompt", "expected", "validation", "meta"],
  "properties": {
    "type": { "enum": ["flashcard", "multiple_choice", "typing", "listening_mc", "speaking_pronunciation", "exam_reading", ...] },
    "prompt": { "type": "string" },
    "expected": { "type": "string" },
    "validation": { "type": "object" },
    "meta": {
      "hint": { "type": "string" },
      "audio": { "type": "string" },
      "tags": { "type": "array" },
      "difficulty": { "type": "number", "minimum": 0, "maximum": 1 }
    }
  }
}
```

### exam-question.schema.json
Official exam question format:
```json
{
  "$id": "exam-question",
  "required": ["examType", "level", "section", "questionId", "prompt", "expected", "rubric"],
  "properties": {
    "examType": { "enum": ["CILS", "CELI", "AIL"] },
    "section": { "enum": ["reading", "writing", "listening", "speaking", "grammar_vocab"] },
    "rubric": { "type": "object" }
  }
}
```

---

## Content Categories

### 1. Vocabulary (words.json)
- **926 entries** (A1-A2 complete, B1-C2 expanding)
- Fields: id, cefr, category, tags, hebrew, italian, audio, grammar, examples, culture, examTags, srs
- Grammar: gender, number, verb type, conjugation, irregular forms
- SRS: default interval, ease factor, lapse config

### 2. Sentences (sentences.json)
- **109 patterns** with slots for substitution
- Used for: sentence builder, translation, grammar practice
- Tags: grammar point, vocabulary used, CEFR

### 3. Dialogues (dialogues.json)
- **8 dialogues** (restaurant, hotel, directions, shopping, etc.)
- Each: turns with speaker, italian, hebrew, audio, cultural notes
- Used for: dialogue practice, listening, simulation scenarios

### 4. Phrases (phrases.json)
- **Functional phrases** by situation (greeting, apology, request, etc.)
- Quick reference for simulations

### 5. Curriculum (curriculum/)
- **56 lessons** across A1-C2 (6 implemented)
- Each lesson: objectives, content refs, exercise sequence, estimated time
- Index maps: level → lessons → content IDs

### 6. Dictionary (dictionary/)
- **5 full entries** (sample: ciao, buongiorno, grazie, prego, scusa)
- Fields: headword, pos, gender, conjugations, meanings, examples, collocations, culture, register, audio
- Metadata: version, source, license, coverage stats

### 7. Culture (culture/)
- **3 modules**: Coffee (A1), Aperitivo (A2), 10 Regions (B1)
- Each: concept, vocabulary, cultural notes, quiz, Nona comments, related words
- Deep cultural context, not just translations

### 8. Articles (articles/)
- **3 graded articles**: Cafe (A1, 85 words), Aperitivo (A2, 180 words), Regions (B1, 320 words)
- Each: CEFR metadata, glossary, comprehension questions, audio cues, cultural context
- Used for: reading practice, exam reading section

### 9. Nona Personality (nona-personality.json)
- **3 personalities**: Sweet, Strict, Teacher
- Each: tone rules, vocabulary, correction style, encouragement patterns
- Mistake detection: gender, verb type, subjunctive, prepositions, agreement
- Adaptive: SRS interleaving, difficulty ramping, personality switching

### 10. Exams (exams.json + exam-mapping.md)
- CILS/CELI/AIL structure definitions
- Section weights, timing, task types
- Tagging system: EXAM_TYPE_LEVEL_SECTION
- Recommendation engine logic

### 11. Grammar (grammar.json)
- Rule-based grammar explanations
- Linked to vocabulary and exercises
- CEFR-graded complexity

### 12. Stories (stories.json)
- Graded stories with branching
- Character-driven (from characters.json)
- Comprehension + production exercises

### 13. Songs (songs.json)
- 9 Italian songs with lyrics, translation, vocabulary
- Karaoke-style listening practice

---

## Cross-Reference System

### Content → Exercise (Generators)
```
words.json[id] 
    → FlashcardGenerator
    → MultipleChoiceGenerator
    → TypingGenerator
    → ListeningMultipleChoiceGenerator
    → SpeakingPronunciationGenerator
    → AnkiReviewGenerator

sentences.json[id]
    → SentenceBuilderGenerator
    → TranslateGenerator
    → OrderingGenerator
    → WritingTranslateGenerator

dialogues.json[id]
    → DialogueChoiceGenerator
    → DialogueCompleteGenerator
    → DialogueRoleplayGenerator
    → ListeningTranscribeGenerator
```

### Content → Exam (Tags)
```
contentItem.examTags = ["EXAM_CILS_B1_READING", "EXAM_CELI_B1_LISTENING"]
    → Orchestrator.createExamSimulation('CILS', 'B1')
        → Filters content by tags
        → Balances sections per official structure
        → Generates exercises via appropriate generators
```

### Content → Dictionary
```
words.json[id] 
    → dictionary/it-he.json[headword]
        → Full entry with grammar, conjugations, examples, culture
```

### Content → Culture
```
words.json[id].culture = "coffee"
    → culture/coffee.json
        → Deep dive, quiz, Nona comments
```

### Content → Nona
```
mistake on word[gender] = feminine
    → Nona.detectMistakePattern('gender')
        → Returns tip from nona-personality.json[personality].genderTips
```

---

## Validation Pipeline

### Automated Checks (run on every commit)
```bash
# Schema validation
node --check content/**/*.json

# Content inventory
node scripts/validate-content.js

# Cross-reference integrity
node scripts/check-xrefs.js

# Exam tag coverage
node scripts/check-exam-coverage.js
```

### Quality Gates (C4E Phase 5)
- ✅ All JSON files valid (`node --check`)
- ✅ All items have CEFR level
- ✅ All items have category
- ✅ All items have tags
- ✅ All items have Hebrew translation
- ✅ All items have audio reference
- ✅ All items have example
- ✅ All items have grammar info (where applicable)
- ✅ All items have culture connection (where applicable)
- ✅ All items have exam tags (where applicable)
- ✅ All items have dictionary link (vocab)
- ✅ All items have SRS config (vocab)

---

## Content Generation Workflow

### Manual (Current)
1. Create content following schema
2. Add to appropriate JSON file
3. Run validation: `node --check content/file.json`
4. Add exam tags for exam-relevant items
5. Add culture tags for culturally-relevant items
6. Update curriculum index if new lesson
7. Commit

### AI-Assisted (Planned)
```
Prompt → AI Generator → Schema Validation → Human Review → Commit
```

### Content Sources
- **Primary**: OnlineItalianClub.com (free, CC-BY)
- **Secondary**: One World Italiano, Alma Edizioni
- **Exam Specs**: Official CILS/CELI/AIL syllabi
- **Cultural**: Native Italian consultants, regional tourism boards

---

## Statistics (Current)

| Content Type | Count | CEFR Coverage |
|--------------|-------|---------------|
| Words | 926 | A1: 400, A2: 350, B1: 120, B2+: 56 |
| Sentences | 109 | A1: 45, A2: 38, B1: 26 |
| Dialogues | 8 | A1: 3, A2: 3, B1: 2 |
| Phrases | 50+ | A1: 20, A2: 18, B1: 12 |
| Lessons | 6/56 | A1: 3, A2: 1, B1: 1 |
| Dictionary Entries | 5 (sample) | A1: 3, A2: 2 |
| Culture Modules | 3 | A1: 1, A2: 1, B1: 1 |
| Articles | 3 | A1: 1, A2: 1, B1: 1 |
| Exam Questions | Dynamic | All levels via generators |

---

## Future Expansion

### Phase 1: Curriculum Completion (C5-C7)
- 50 more lessons (A1-C2)
- 3,000 more vocabulary items
- 100 more sentences
- 12 more dialogues

### Phase 2: Exam Depth (C7-C8)
- 200+ exam questions per exam type per level
- Past paper integration (licensed)
- Writing/speaking evaluation rubrics

### Phase 3: Cultural Depth (C8+)
- 20 culture modules (all regions, holidays, customs)
- Video content integration
- Native speaker interviews

### Phase 4: Multi-Language (C10+)
- Schema supports `sourceLanguage` field
- Spanish→Italian, English→Italian, French→Italian
- Same architecture, new content packs

---

*Content system designed for scale, validation, and cross-module intelligence. Updated: 2026-08-05*