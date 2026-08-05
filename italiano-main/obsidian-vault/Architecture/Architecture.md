# Architecture – VolaLingo

**Technical Architecture Document**  
*Contract-based, modular vanilla JS — designed for evolution, not rewrite*

---

## 🏗️ System Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                          VolaLingo App                                 │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐             │
│  │   Practice   │    │   Content    │    │  Gamification│             │
│  │    Engine    │    │  Intelligence│    │    System    │             │
│  │  (C4A+C4B)   │    │   (C6)       │    │  (XP/Streak) │             │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘             │
│         │                   │                   │                      │
│         └───────────────────┼───────────────────┘                      │
│                             ▼                                         │
│                  ┌─────────────────────┐                              │
│                  │  Learning Orchestrator│  ← Single Decision Engine  │
│                  │      (C4D Sprint)     │    9-priority hierarchy    │
│                  └──────────┬───────────┘                              │
│                             ▼                                         │
│                  ┌─────────────────────┐                              │
│                  │ Exercise Registry +  │  ← 30+ exercise types      │
│                  │     Generators       │     28 generator classes   │
│                  │      (C4C Sprint)    │                              │
│                  └─────────────────────┘                              │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Module Contracts (Public APIs)

### Practice Engine (C4A)
```javascript
window.Practice = {
  init(dependencies),           // Wire all deps once
  startLesson(lessonId),        // Start lesson session
  startExercise(type, config),  // Start specific exercise
  submitAnswer(answer),         // Submit user answer
  getSessionStats(),            // Current session stats
  completeSession()             // End session, persist state
}
```

### Learning Orchestrator (C4D)
```javascript
window.Orchestrator = {
  init(dependencies),                    // Wire registry, generators, content
  getProfile(),                          // → UserProfileSnapshot
  decideNextAction(),                    // → [Decision[]] prioritized
  buildSession(decisions),               // → Session {warmup, core[], cooldown}
  createDailyMission(),                  // C5: Daily mission
  createExamSimulation(type, level),     // C7: Exam mock
  createSimulation(scenario),            // C6: Life simulation
  createSpeakingCoachSession(focus),     // C7: Speaking coach
  getRecommendations(),                  // C5: Home screen cards
  onSessionComplete(session),            // Hook: Practice Engine calls
  onExerciseComplete(exercise, result)   // Hook: per exercise
}
```

### Exercise Registry (C4C)
```javascript
window.ExerciseRegistry = {
  register(type, generatorClass),      // Register new type
  get(type),                           // Get generator class
  getAllTypes(),                       // List all types
  generateExercises(content, config),  // Content → exercises
  createDailyFlow(profile, content),   // 10-min daily session
  createExamFlow(examType, level)      // Exam simulation
}
```

### Generator Contract (C4C)
```javascript
class Generator {
  generate(item, config) {             // → Exercise object
    return {
      type: 'flashcard',
      prompt: '...',
      expected: '...',
      validation: (input) => boolean,
      meta: { hint, audio, tags, difficulty }
    }
  }
}
```

---

## 🔄 Data Flow

### User Journey (C4E Phase 1)
```
App Open
    ▼
Nona Greets (personality from profile)
    ▼
Orchestrator.getProfile() → UserProfileSnapshot
    ▼
Orchestrator.decideNextAction() → [Decision[]]
    ▼
Orchestrator.buildSession(decisions) → Session
    ▼
Practice Engine executes session
    ▼
onExerciseComplete → SRS update, weak words, speaking stats
    ▼
onSessionComplete → XP, streak, daily goal, sessions today
    ▼
Orchestrator decides next action...
```

### Cross-Module Intelligence (C4E Phase 2)
```
Word Mistake (exercise)
    ▼
SRS.lapse() → due = now, interval reset
    ▼
WeakWords.add(wordId)
    ▼
Orchestrator.detectWeakWords() → Decision{srs_review, priority: 100}
    ▼
ExerciseRegistry.generateExercises(word) → [Exercise[]]
    ▼
Content Links:
  • word → story (if tagged)
  • word → dialogue (if in dialogue)
  • word → simulation (scenario vocabulary)
  • word → exam (EXAM_LEVEL_SECTION tag)
  • word → dictionary (full entry)
  • Nona.mistakePattern(word) → tip
```

---

## 📁 Module Dependency Graph (Load Order)

```
index.html
│
├── js/core/content-loader.js     ──► Loads content/*.json
├── js/core/events.js             ──► Event bus (pub/sub)
│
├── js/modules/coach.js           ──► Nona AI Coach (needs: events)
├── js/modules/gamification.js    ──► XP/Streak/Hearts/Leagues (needs: events, state)
├── js/modules/exam.js            ──► Exam Engine (needs: content, events)
│
├── js/modules/practice/practice-core.js       ──► Session lifecycle
├── js/modules/practice/exercises.js           ──► Exercise logic
├── js/modules/practice/anki-practice.js       ──► SRS reviews
├── js/modules/practice/dialogue-practice.js   ──► Conversation
├── js/modules/practice/practice-ui.js         ──► Rendering + feedback
├── js/modules/practice/index.js               ──► Contract API (exports: Practice)
│
├── js/modules/practice/exercise-registry.js   ──► Registry + sequencing
├── js/modules/practice/generators/index.js    ──► 28 generators
├── js/modules/practice/content-exercises.js   ──► Content→Exercise bridge
│
├── js/modules/orchestrator.js     ──► Learning Orchestrator (C4D)
│
├── js/app.js                      ──► Main init, wires Practice.init()
├── js/skill-tree.js               ──► Skill tree logic
├── js/content.js                  ──► Content API
├── js/features.js                 ──► Feature flags
├── js/games.js                    ──► Game exercises
├── js/speak.js                    ──► Speech synthesis
├── js/listening.js                ──► Listening exercises
├── js/sentbuild.js                ──► Sentence builder
├── js/stories.js                  ──► Stories module
└── js/bottom-nav.js               ──► Navigation
```

---

## 💾 State Management

### Global State (localStorage + IndexedDB)
```javascript
{
  // User Profile
  level: 'A1',
  xp: 1250,
  streak: 7,
  hearts: 5,
  lastDay: '2026-01-15',
  dailyXP: 30,
  dailyGoal: 30,
  sessionsToday: 2,
  
  // SRS
  srs: { [wordId]: { due, interval, ease, lapses, reviews } },
  
  // Skill Tree
  skillTree: { [nodeId]: { status: 'locked'|'available'|'learning'|'mastered', progress: 0-100 } },
  
  // Weak Words
  weakWords: ['wordId1', 'wordId2', ...],
  
  // Speaking
  speakingStats: { avgScore: 0.85, attempts: 42 },
  
  // Exam
  examDate: '2026-06-15',
  examType: 'CILS',
  examLevel: 'B1',
  
  // Nona
  nonaPersonality: 'teacher',
  nonaSettings: { correctionFrequency: 'medium', language: 'he' }
}
```

### In-Memory Session State
```javascript
{
  sessionId: 'uuid',
  lessonId: 'A1-greetings',
  type: 'orchestrated',
  exercises: [Exercise, ...],
  currentIndex: 0,
  score: 0,
  xpEarned: 0,
  streak: 0,
  nonaPersonality: 'strict'
}
```

---

## 🔌 Event Bus (js/core/events.js)

```javascript
// Pub/Sub for loose coupling
eventBus.emit('STATE_UPDATE', { xp, streak, hearts });
eventBus.emit('EXERCISE_COMPLETE', { type, correct, wordId });
eventBus.emit('NONA_PERSONALITY_CHANGE', personality);
eventBus.emit('SRS_UPDATE', { wordId, due, interval });
eventBus.emit('WEAK_WORD_ADDED', wordId);
eventBus.emit('STREAK_CHANGED', { streak, isNewRecord });
eventBus.emit('LEVEL_UP', { newLevel, xp });

// Subscribers
eventBus.on('STATE_UPDATE', renderUI);
eventBus.on('EXERCISE_COMPLETE', Orchestrator.onExerciseComplete);
eventBus.on('SRS_UPDATE', persistSRS);
```

---

## 🌐 Service Worker (sw.js v7)

### Cache Strategy
| Asset Type | Strategy |
|------------|----------|
| Static (HTML, CSS, JS, icons) | Cache First |
| Content JSON | Stale While Revalidate |
| Audio/Images | Cache First + fallback |

### Precache Manifest (PRECACHE_URLS)
All 22 modules + content files listed explicitly for offline-first.

---

## 📱 PWA Features

- **Manifest**: `manifest.json` with shortcuts, screenshots
- **Install Prompt**: Custom `beforeinstallprompt` handler
- **Offline Page**: Cached `index.html` serves offline
- **Background Sync**: Pending (future: state sync)

---

## ⚡ Performance Budgets

| Metric | Target | Current |
|--------|--------|---------|
| App Load (First Paint) | < 2s | ~1.2s |
| Module Load (per module) | < 50ms | ~5-15ms |
| Orchestrator Init | < 100ms | 0.3-1ms |
| Decision Making | < 5ms | 0.05ms |
| Session Build | < 20ms | 0.1-0.15ms |
| Lesson Generation | < 300ms | ~50ms |
| Offline Switch | Instant | Instant |

---

## 🔮 Future Extensibility Points

1. **New Exercise Types** → Register in `exercise-registry.js`
2. **New Generators** → Add to `generators/index.js`, register in registry
3. **New Orchestrator Priorities** → Extend `PRIORITY_CONFIG` in orchestrator
4. **New Nona Personalities** → Add to `nona-personality.json`
5. **New Exam Types** → Add to `exams.json` + exam mapping
6. **New Scenarios** → Add to orchestrator `createSimulation()`
7. **New Content** → Add to `content/` following schemas
8. **Backend Sync** → Implement `SyncEngine` module with IndexedDB queue

---

## 🧪 Testing Strategy

### Unit Tests (per module)
- `node --check` syntax validation
- Contract API method existence
- Input/output validation

### Integration Tests (`tests/c4e-integration.test.js`)
- Phase 1: Full User Journey (47 assertions)
- Phase 2: Cross-Module Validation (31 assertions)
- Phase 3: Adaptive Intelligence (28 assertions)
- Phase 4: Performance Benchmarks (12 assertions)
- Phase 5: Content QA (15 assertions)
- Phase 6: Product Benchmark (8 assertions)

**Total**: 141 assertions — all passing

---

## 🚀 Deployment

### GitHub Pages
- **Workflow**: `.github/workflows/deploy.yml` (peaceiris/actions-gh-pages@v3)
- **Trigger**: Push to `main` or `master`
- **Custom Domain**: `italiano.tickerio.app`
- **Published Branch**: `gh-pages`
- **Build**: None (static files only)

### Local Development
```bash
python3 -m http.server 8081
# Open http://localhost:8081
```

---

## 🏷️ Versioning

- **Semantic Tags**: `v0.9-beta-learning-engine` (current)
- **Contract Stability**: Implicit via method signatures
- **Breaking Changes**: Avoided — evolution only

---

## 🔗 Links
- [[VolaLingo]] | [[Sprint_C4A_Practice_Engine]] | [[Sprint_C4D_Learning_Orchestrator]]
- Module files: `js/modules/`
- Tests: `tests/c4e-integration.test.js`
- Deploy: `.github/workflows/deploy.yml`