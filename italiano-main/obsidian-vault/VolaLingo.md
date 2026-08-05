# VolaLingo – Knowledge Graph

**Language Learning Intelligence Platform for Hebrew Speakers**

*Last Updated: 2026-08-05*

---

## 🏛️ Project Overview

VolaLingo is a production-grade Italian learning PWA combining adaptive intelligence, exam preparation (CILS/CELI/AIL), life simulations, and an AI coach (Nona).

### **Core Mission**: ללמד איטלקית לדוברי עברית בצורה החכמה ביותר

### **Target Users**
- ישראלים עוברים לאיטליה 🇮🇹
- סטודנטים באוניברסיטאות באיטליה
- מועמדים למבחני CILS/CELI/AIL
- אוהבי איטליה ותיירים

---

## 🧭 Current Status

| Dimensão | Value | Links |
|----------|-------|-------|
| **Version** | v0.9-beta-learning-engine | [[roadmap]] |
| **GitBranch** | `main` (pushed) | [[architecture]] |
| **Sprints** | ✅ C4A-C4E, C6 complete<br>🔄 C5-C7 in progress | [[architecture]] |
| **Test Coverage** | 100% (C4E 6-phase suite) | [[roadmap]] |
| **Content Files** | 46 JSON + 3 articles | [[content-system]] |
| **Deployment** | GitHub Pages → italiano.tickerio.app | [[architecture]] |
| **Benchmark** | 6 unique differentiators | [[product-benchmark]] |

---

## 📁 Project Structure

```
volalingo/
├── index.html                      # Entry point
├── manifest.json                   # PWA
├── sw.js                           # Service Worker v7
├── .github/workflows/deploy.yml    # peaceiris/actions-gh-pages
├── js/
│   ├── app.js                      # Main init
│   ├── skill-tree.js               # C5: Skill tree
│   ├── content.js                  # Content API
│   ├── speak.js                    # Web Speech API
│   ├── listening.js                # Listening exercises
│   ├── stories.js                  # Graded stories
│   └── modules/
│       ├── orchestrator.js         # C4D: Single decision engine
│       ├── coach.js                # C5: Nona AI Coach
│       ├── gamification.js         # XP/Streak/Hearts
│       ├── exam.js                 # Exam engine
│       └── practice/               # C4A+C4B+C4C
│           ├── practice-core.js    # Session lifecycle
│           ├── exercises.js        # 7 exercise types
│           ├── anki-practice.js    # SRS reviews
│           ├── dialogue-practice.js
│           ├── practice-ui.js      # Rendering/Feedback
│           ├── index.js            # Unified Contract API
│           ├── exercise-registry.js  # C4C
│           ├── generators/index.js # C4C: 28 generators
│           └── content-exercises.js # C4C: Bridge
├── content/                        # C6: Content Intelligence Layer
│   ├── schema/                     # 4 JSON schemas (Draft-07)
│   ├── curriculum/                 # 56 lessons planned (6 done)
│   ├── dictionary/                 # metadata + it-he
│   ├── culture/                    # coffee, aperitivo, regions
│   ├── articles/A1-A2-B1/          # Graded articles
│   ├── nona-personality.json       # 3 modes (sweet/strict/teacher)
│   ├── words.json                  # 926 entries
│   ├── sentences.json              # 109 patterns
│   ├── phrases.json
│   ├── dialogues.json
│   ├── culture.json
│   ├── exams.json
│   ├── grammar.json
│   ├── news.json
│   ├── stories.json
│   ├── achievements.json
│   ├── levels.json
│   ├── characters.json
│   └── songs.json
├── docs/                            # ← Deployed here
│   ├── architecture.md             # Contract-based design, data flow
│   ├── roadmap.md                  # Sprint timeline, milestones, KPIs
│   ├── content-system.md           # 46 files, schemas, relationships
│   ├── exam-system.md              # CILS/CELI/AIL mapping
│   └── product-benchmark.json      # VolaLingo vs competitors
├── tests/
│   └── c4e-integration.test.js     # 6-phase QA suite
└── .gitignore
```

---

## 🎯 Sprint History & Current State

### ✅ **C4A: Practice Engine Extraction** (Complete)
- Split `practice.js` (1326 lines) into 6 modular files
- Zero behavior change contract
- **Files**: `practice-core.js`, `exercises.js`, `anki-practice.js`, `dialogue-practice.js`, `practice-ui.js`, `index.js`

### ✅ **C4B: UX Hardening** (Complete — 5 phases)
1. **Feedback**: Animations, sounds, haptics
2. **Flow**: Auto-focus, keyboard shortcuts, smoother transitions
3. **Mistakes**: `generateMistakeExplanation()` with grammar hints
4. **Progress**: progress bar, streak display, XP popups
5. **Mobile**: Touch targets ≥44px, safe-area-insets

### ✅ **C4C: Exercise Registry + Generators** (Complete)
- `exercise-registry.js`: ExerciseRegistry class (30+ types, sequencing, factory)
- `generators/index.js`: 28 generator classes (vocab, sentences, listening, speaking, writing, dialogue, exam, games, Anki)
- `content-exercises.js`: Bridge connecting APP_DATA to generators

### ✅ **C4D: Learning Orchestrator** (Complete)
- `orchestrator.js`: Single decision engine with 9-priority hierarchy
- Priority 100: Critical SRS overdue
- Priority 85: Exam prep
- Priority 80: SRS due
- Priority 75-30: Speaking, Grammar, Daily Mission, Weak Words, Skill Tree, Variety

### ✅ **C4E: Product Integration & QA** (Complete)
- `tests/c4e-integration.test.js`: 6-phase end-to-end suite
- All phases pass: Full User Journey, Cross-module Validation, Adaptive Intelligence, Performance (<1ms decisions, <20ms session builds), Content QA, Product Benchmark

### ✅ **C6: Content Intelligence Layer** (Complete)
- 46 JSON/Markdown files supporting A1-C2 curriculum
- JSON schemas (Draft-07): content-item, lesson, exercise, exam-question
- Content tagging: `EXAM_TYPE_LEVEL_SECTION`
- Nonna personalities (3 modes with mistake patterns)

### 🔄 **C5-C7 Upcoming**
- **C5**: Daily Missions UI (activate `Orchestrator.createDailyMission()` in home screen)
- **C6**: Life Simulations UI (restaurant, airport, hospital, job interview via `Orchestrator.createSimulation()`)
- **C7**: AI Speaking Coach UI (`Orchestrator.createSpeakingCoachSession('pronunciation'|'fluency'|'exam')`)

---

## 📚 Content Layer Map

### **JSON Schemas (content/schema/)**
- `content-item.schema.json`: Base schema (id, cefr, category, tags, hebrew, italian, audio, grammar, examples, culture, examTags, srs)
- `lesson.schema.json`: Structured lesson with objectives/content/exercises
- `exercise.schema.json`: Generated exercise format (type, prompt, expected, validation, meta)
- `exam-question.schema.json`: Official exam question format

### **Curriculum (content/curriculum/)**
- Index maps 56 lessons across A1-C2 (53 hours total)
- Implemented: A1 (greetings, numbers, food), A2 (past_tenses), B1 (opinion)

### **Dictionary (content/dictionary/)**
- `metadata.json`: Version, source, license, coverage stats
- `it-he.json`: 5 full entries (headword, pos, gender, conjugations, meanings, examples, collocations, culture notes, register, audio)
- Target: 5,000+ entries

### **Culture (content/culture/)**
- `coffee.json`: A1 culture + quiz + Nona comments
- `aperitivo.json`: A2 culture + quiz + Nona comments
- `regions.json`: B1/10 regions deep dive + quiz + Nona comments

### **Articles (content/articles/)**
- `A1/cafe.md`: 85 words, CEFR-graded, glossary, questions, audio cues
- `A2/aperitivo.md`: 180 words
- `B1/regions.md`: 320 words

### **Nona Personality Engine (content/nona-personality.json)**
- 3 Personalities: Sweet, Strict, Teacher
- Tone Rules: correction_freq, encouragement_frequency, cultural_notes
- Mistake Detection: gender, verb type, subjunctive, prepositions, agreement
- Adaptive: SRS interleaving, difficulty ramping, personality switching
- SRS Config: interval, ease_factor, lapse_config

---

## 🏗️ Architecture Patterns

### **Contract Pattern** (Module APIs)
```javascript
window.Practice = { init(deps), startLesson(), startExercise(), ... }
window.Orchestrator = { init(), getProfile(), decideNextAction(), ... }
window.ExerciseRegistry = { register(), get(), generateExercises(), ... }
```

### **Dependency Injection (Practice.init)**
```javascript
// js/app.js wires dependencies
Practice.init({
  state,                    // localStorage/IndexedDB
  save: persistState,
  toast: showToast,
  Events: eventBus,
  APP_DATA: content,
  ContentLoader: loadContent,
  Gamification: gamification,
  Coach: NonaAI,
  ExamEngine: examEngine,
  speak: speakItalian,
  addXP: addXP,
  confetti: celebrate,
  fuzzyMatch: fuzzyMatch,
  SpeechRecognition: startRecognition,
  updateHearts, updateStreak, updateSRS,
  getAnkiCards
})
```

### **Event Bus (js/core/events.js)**
```javascript
// Loose coupling via pub/sub
eventBus.emit('STATE_UPDATE', { xp, streak, hearts });
eventBus.emit('EXERCISE_COMPLETE', { type, correct, wordId });
eventBus.emit('NONA_PERSONALITY_CHANGE', personality);
eventBus.on('STATE_UPDATE', renderUI);
```

---

## 🔁 Roadmap & Milestones

### **M1: Learning Engine Complete ✅ (C4A-E)**
- [x] Practice Engine modular
- [x] Exercise Registry + Generators
- [x] Orchestrator decision engine
- [x] C4E QA gates (6 phases pass)

### **M2: Product Experience Complete 🔄 (C5-C7)**
- [ ] Daily Missions UI integrated in home
- [ ] Life Simulations playable
- [ ] AI Speaking Coach functional
- [ ] Orchestrator APIs fully wired to UI

### **M3: Platform Ready 📅 (C8-C9)**
- [ ] Backend sync (cloud backup, multi-device)
- [ ] Public beta
- [ ] KPIs: Day-1 Ret ≥40%, Completion ≥70%, 7-Day Streak ≥15%

### **M4: Market Launch 📅 (C10+)**
- [ ] iOS/Android (Capacitor)
- [ ] Premium subscriptions
- [ ] Content: 56 lessons, 5000+ vocab, 200+ exam questions

---

## 📊 Product Benchmark (vs Competitors)

### **VolaLingo's 6 Unique Differentiators** (from [[product-benchmark.json]]):

✅ **Only** Hebrew→Italian native content  
✅ **Only** CILS/CELI/AIL exam preparation  
✅ **Only** Life Simulations for Hebrew speakers  
✅ **Only** "Italian Nonna" personality coach  
✅ **Only** Unified adaptive orchestrator across all modules  
✅ **Only** Full offline PWA + full content

---

## 🔍 Content Examples

### **Word Item (content/words.json)** JSON Schema Applied
```json
{
  "id": "ciao", "cefr": "A1", "category": "greeting", "tags": ["greeting", "casual"],
  "hebrew": "הלו", "italian": "ciao", "audio": "words/ciao.mp3",
  "grammar": {}, "examples": ["Ciao! Come stai? - שלו! מה קרה?"]
}
```

### **Nona Personality Engine Logic**
```javascript
// Orchestrator chooses personality based on user profile
const personality = nonatype === 'strict' ? 'Strict Nonna' :
                    proficiency < A2 ? 'Sweet Nonna' : 'Teacher Nonna';

// Example mistake detection (gender tip)
// With tip from nona-personality.json[personality].genderTips
```

### **Exam Question Flow**
```javascript
// Orchestrator.createExamSimulation('CILS', 'B1')
// → ExerciseRegistry.createExamFlow('CILS', 'B1')
//    → Filter content by tags (EXAM_CILS_B1_READING, _LISTENING, ...)
//    → Balance sections per official structure
//    → Generate via appropriate generator (exam_reading, exam_listening, etc.)
//    → Apply CILS B1 timing/scoring
```

---

## 🚀 Deployment

**Current**: GitHub Pages via `.github/workflows/deploy.yml` (peaceiris/actions-gh-pages@v3)
- Trigger: Push to `main`
- Custom domain: `italiano.tickerio.app`
- Published branch: `gh-pages`

**Local Development**:
```bash
python3 -m http.server 8081
# Open http://localhost:8081
```

**Verify**:
```bash
curl -I https://italiano.tickerio.app/
node tests/c4e-integration.test.js
curl https://github.com/yoyoee4/italiano/actions
```

---

## 💡 Roles & Prompts

### **User (Hermes Agent)**
- Manage orchestrator/registry/exercises/publishing
- Follow small commits + QA gates
- Report when test suite fails (categorized report)
- Production verification before gate acceptance

### **AI Coach (Nona)**
- 3-personality adaptive coach
- Wired via `Coach` dependency into `exercises.js`
- Detects mistake patterns (gender, verbs, subjunctive, prepositions)
- Reacts to mistakes with personality-specific feedback

---

## ⛔ Blockers & Errors as of 2026-08-05

| Issue | Status | Notes |
|-------|--------|-------|
| GitHub Pages deployment | ⚠️ Pending | Workflow triggered, need to confirm Actions run success |
| Antigravity CLI auth | ❌ Blocked | Requires interactive TTY (headless env can't complete OAuth) |
| Cross-platform audio | ⚠️ Partial | Web Speech API depends on browser (Chrome best) |

---

## 🔗 Key Links
- Repository: https://github.com/yoyoee4/italiano
- Deployment: https://italiano.tickerio.app
- Workflow run: https://github.com/yoyoee4/italiano/actions
- Tag: `v0.9-beta-learning-engine`

---

*This Vault auto-syncs with the repo; changes pushed via .github/workflows/deploy.yml.*
