# Content System – VolaLingo

**Single Source of Truth for All Content Architecture**

*Last Updated: 2026-08-05*

---

## 📁 Content Directory Structure

```
content/
├── schema/                          # JSON Schemas (Draft-07)
│   ├── content-item.schema.json
│   ├── lesson.schema.json
│   ├── exercise.schema.json
│   └── exam-question.schema.json
├── curriculum/                      # 56 lessons A1→C2
│   ├── index.json
│   ├── A1/
│   │   ├── greetings.json
│   │   ├── numbers.json
│   │   └── food.json
│   ├── A2/
│   │   └── past_tenses.json
│   └── B1/
│       └── opinion.json
├── dictionary/                      # Offline Hebrew→Italian
│   ├── metadata.json
│   └── it-he.json
├── culture/                         # Cultural modules
│   ├── coffee.json
│   ├── aperitivo.json
│   └── regions.json
├── articles/                        # Graded reading
│   ├── A1/cafe.md
│   ├── A2/aperitivo.md
│   └── B1/regions.md
├── nona-personality.json            # 3 personalities + patterns
├── words.json                       # 926 vocab entries
├── sentences.json                   # 109 sentence patterns
├── phrases.json                     # 50+ functional phrases
├── dialogues.json                   # 8 conversation scripts
├── culture.json                     # 15 cultural facts
├── exams.json                       # 40 exam mappings
├── grammar.json                     # 30 grammar rules
├── news.json                        # 20 news snippets
├── stories.json                     # 12 graded stories
├── achievements.json                # 25 gamification
├── levels.json                      # 6 CEFR definitions
├── characters.json                  # 8 story characters
└── songs.json                       # 9 Italian songs
```

---

## 🔧 JSON Schemas (Validation)

All content validated against Draft-07 schemas via `node --check`.

### content-item.schema.json (Base)
```json
{
  "$id": "content-item",
  "required": ["id", "cefr", "category", "tags", "hebrew", "italian", "audio"],
  "properties": {
    "id": { "pattern": "^[a-z-]+$" },
    "cefr": { "enum": ["A1","A2","B1","B2","C1","C2"] },
    "category": { "enum": ["vocab","grammar","phrase","dialogue","culture"] },
    "examTags": { "type": "array", "items": { "pattern": "^EXAM_(CILS|CELI|AIL)_(A1|A2|B1|B2|C1|C2)_(READING|WRITING|LISTENING|SPEAKING|GRAMMAR)$" } }
  }
}
```

### lesson.schema.json
Structured lesson with objectives, content refs, exercise sequence.

### exercise.schema.json
Generated exercise format (type, prompt, expected, validation, meta).

### exam-question.schema.json
Official exam question format with rubric.

---

## 📚 Content Categories & Relationships

### 1. Vocabulary (words.json) — 926 entries
```
word[id] 
  → FlashcardGenerator
  → MultipleChoiceGenerator
  → TypingGenerator
  → ListeningMultipleChoiceGenerator
  → SpeakingPronunciationGenerator
  → AnkiReviewGenerator
  → Dictionary lookup (it-he.json[headword])
  → Culture module (if word.culture)
  → Exam tags (EXAM_*)
  → SRS config (interval, ease, lapse)
```

### 2. Sentences (sentences.json) — 109 patterns
```
sentence[id]
  → SentenceBuilderGenerator
  → TranslateGenerator
  → OrderingGenerator
  → WritingTranslateGenerator
  → ListeningTranscribeGenerator
  → Grammar practice (verb tense, structure)
```

### 3. Dialogues (dialogues.json) — 8 scripts
```
dialogue[id]
  → DialogueChoiceGenerator
  → DialogueCompleteGenerator
  → DialogueRoleplayGenerator
  → ListeningTranscribeGenerator
  → Simulation scenarios (restaurant, airport, etc.)
  → Cultural context from culture/*.json
```

### 4. Curriculum (curriculum/) — 56 lessons
```
lesson[id]
  → objectives[], content{words, sentences, dialogues, grammar}
  → exercises[] (references exercise schema)
  → Orchestrator skill tree node
  → Daily mission source
```

### 5. Dictionary (dictionary/) — 5 full entries (target 5000+)
```
it-he.json[headword]
  ← words.json[id] (headword match)
  → Full entry: pos, gender, conjugations, meanings, examples, collocations, culture, register, audio
```

### 6. Culture (culture/) — 3 modules + 10 regions
```
culture/module
  ← words with culture tag
  → Vocabulary deep-dive
  → Quiz questions
  → Nona comments per personality
  → Related vocab links
```

### 7. Articles (articles/) — 3 graded
```
article[cefr]
  → Reading practice
  → Exam reading section
  → Glossary → Dictionary
  → Comprehension questions
  → Audio cues → Listening
```

### 8. Nona Personality (nona-personality.json)
```
personality[mode]
  → toneRules, vocabulary, correctionStyle
  → mistakePatterns: gender, verb, subjunctive, preposition, agreement
  → adaptive: SRS interleaving, difficulty ramping, switching logic
  → Orchestrator.selectNonaPersonality()
```

### 9. Exams (exams.json + exam-mapping.md)
```
EXAM_TYPE_LEVEL_SECTION tags
  → Orchestrator.createExamSimulation()
  → ExerciseRegistry.createExamFlow()
  → Exam*Generators
  → Progress tracking per section
```

---

## 🔗 Cross-Reference Map

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  words.json │────►│  Generators  │────►│  Practice UI    │
└──────┬──────┘     └──────┬───────┘     └────────┬────────┘
       │                   │                      │
       ▼                   ▼                      ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│ Dictionary  │     │  Exam Tags   │     │  SRS/Anki       │
│ it-he.json  │     │ EXAM_*       │     │  srs config     │
└─────────────┘     └──────┬───────┘     └─────────────────┘
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Culture    │     │  Curriculum  │     │  Nona Coach     │
│  modules    │     │  lessons     │     │  mistake detect │
└─────────────┘     └──────────────┘     └─────────────────┘
```

---

## 📋 Content Validation Pipeline

### Automated (run on every commit)
```bash
# 1. JSON Syntax
node --check content/**/*.json

# 2. Schema Validation
node scripts/validate-content.js

# 3. Cross-Reference Integrity
node scripts/check-xrefs.js

# 4. Exam Tag Coverage
node scripts/check-exam-coverage.js

# 5. Content Inventory
node scripts/content-inventory.js
```

### Quality Gates (C4E Phase 5)
- [x] All JSON files valid (`node --check`)
- [x] All items have CEFR level
- [x] All items have category
- [x] All items have tags (min 1)
- [x] All items have Hebrew translation
- [x] All items have audio reference
- [x] All items have examples (vocab)
- [x] All items have grammar info (where applicable)
- [x] All items have culture connection (where applicable)
- [x] All items have exam tags (where applicable)
- [x] All vocab items have dictionary link
- [x] All vocab items have SRS config

---

## 📊 Statistics (Current)

| Content Type | Count | CEFR Coverage | Validation |
|--------------|-------|---------------|------------|
| **Schemas** | 4 | - | ✅ |
| **Words** | 926 | A1:400, A2:350, B1:120, B2+:56 | ✅ |
| **Sentences** | 109 | A1:45, A2:38, B1:26 | ✅ |
| **Dialogues** | 8 | A1:3, A2:3, B1:2 | ✅ |
| **Phrases** | 50+ | A1:20, A2:18, B1:12 | ✅ |
| **Lessons** | 6/56 | A1:3, A2:1, B1:1 | ✅ |
| **Dictionary** | 5 full | A1:3, A2:2 | 🔄 Expanding |
| **Culture** | 3 modules | A1:1, A2:1, B1:1 | ✅ |
| **Articles** | 3 | A1:1, A2:1, B1:1 | ✅ |
| **Nona Personality** | 3 modes | - | ✅ |
| **Exam Tags** | 156 tagged | A1-C2 | ✅ |

---

## 🚀 Future Expansion Plan

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

## 🔧 Content Creation Workflow

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

## 🔗 Links
- [[VolaLingo]] | [[Sprint_C6_Content_Layer]] | [[Architecture]]
- Schemas: `content/schema/`
- Inventory: `docs/content-inventory.md`
- Pedagogy: `docs/pedagogy-sources.md`
- Exam mapping: `docs/exam-mapping.md`