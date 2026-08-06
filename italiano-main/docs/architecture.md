# VolaLingo Architecture

## System Overview

VolaLingo follows a **modular vanilla JavaScript architecture** with a **contract-based design** — each module exposes a well-defined public API, and modules communicate through an event bus and dependency injection.

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

## Module Contracts

Each module follows the **Contract Pattern** — a public API object with typed methods.

### Practice Engine Contract (C4A)
```javascript
window.Practice = {
  init(dependencies),           // Initialize with all deps
  startLesson(lessonId),        // Start a lesson session
  startExercise(type, config),  // Start specific exercise
  submitAnswer(answer),         // Submit user answer
  getSessionStats(),            // Get current session stats
  completeSession()             // End session, update state
}
```

### Learning Orchestrator Contract (C4D)
```javascript
window.Orchestrator = {
  init(),                              // Initialize with state
  getProfile(),                        // Get UserProfileSnapshot
  decideNextAction(),                  // Get prioritized decisions
  buildSession(decisions),             // Build session from decisions
  createDailyMission(),                // Generate daily mission
  createSimulation(scenario),          // Generate life simulation
  createExamSimulation(type, level),   // Generate exam mock
  createSpeakingCoachSession(focus),   // Generate speaking practice
  getRecommendations(),                // Get UI recommendations
  onSessionComplete(session),          // Hook: session finished
  onExerciseComplete(exercise, result) // Hook: exercise finished
}
```

### Exercise Registry Contract (C4C)
```javascript
window.ExerciseRegistry = {
  register(type, generatorClass),      // Register new exercise type
  get(type),                           // Get generator class
  getAllTypes(),                       // List all registered types
  generateExercises(content, config),  // Generate exercises from content
  createDailyFlow(profile, content),   // Generate 10-min daily flow
  createExamFlow(examType, level)      // Generate exam simulation
}
```

### Generator Contract (C4C)
```javascript
class Generator {
  generate(item, config) {             // Generate Exercise object
    return {
      type: 'flashcard',               // Exercise type identifier
      prompt: '...',                   // User-facing prompt
      expected: '...',                 // Correct answer
      validation: (input) => boolean,  // Answer validator
      meta: { ... }                    // Hints, audio, tags, etc.
    }
  }
}
```

## Data Flow

### User Journey (C4E Phase 1)
```
App Open
    ▼
Nona Greets (personality based on profile)
    ▼
Orchestrator.buildProfile() → UserProfileSnapshot
    ▼
Orchestrator.decideNextAction() → [Decision[]]
    ▼
Orchestrator.buildSession(decisions) → Session { warmup, core[], cooldown }
    ▼
Practice Engine executes session
    ▼
onExerciseComplete → SRS update, weak words, speaking stats
    ▼
onSessionComplete → XP, streak, daily goal, sessions today
    ▼
Orchestrator decides next action...
```

### Cross-Module Data Flow (C4E Phase 2)
```
Word Mistake (exercise)
    ▼
SRS.lapse() → due = now, interval reset
    ▼
WeakWords.add(wordId)
    ▼
Orchestrator.detectWeakWords() → Decision{type: 'srs_review', priority: 100}
    ▼
ExerciseRegistry.generateExercises(word) → [Exercise[]]
    ▼
Content links:
  - word → story (if tagged)
  - word → dialogue (if in dialogue)
  - word → simulation (scenario vocabulary)
  - word → exam (EXAM_LEVEL_SECTION tag)
  - word → dictionary (full entry)
  - Nona.mistakePattern(word) → tip
```

## Module Dependency Graph

```
index.html (load order)
│
├── js/core/content-loader.js     ──► Loads content/*.json
├── js/core/events.js             ──► Event bus (pub/sub)
│
├── js/modules/coach.js           ──► Nona AI Coach (needs: events)
├── js/modules/gamification.js    ──► XP/Streak/Hearts/Leagues (needs: events, state)
├── js/modules/exam.js            ──► Exam Engine (needs: content, events)
│
├── js/modules/practice/practice-core.js    ──► Session lifecycle (needs: state, gamification, events)
├── js/modules/practice/exercises.js        ──► Exercise logic (needs: coach, speak, events)
├── js/modules/practice/anki-practice.js    ──► SRS reviews (needs: state, events)
├── js/modules/practice/dialogue-practice.js──► Conversation (needs: state, events)
├── js/modules/practice/practice-ui.js      ──► Rendering + feedback (needs: events)
├── js/modules/practice/index.js            ──► Contract API (exports: Practice)
│
├── js/modules/practice/exercise-registry.js──► Registry (needs: generators, content)
├── js/modules/practice/generators/index.js ──► 28 generators (needs: registry)
├── js/modules/practice/content-exercises.js──► Content bridge (needs: registry, content)
│
├── js/modules/orchestrator.js    ──► Learning Orchestrator (needs: registry, generators, content, state)
│
├── js/app.js                     ──► Main init, wires Practice.init(orchestrator, ...)
├── js/skill-tree.js              ──► Skill tree logic
├── js/content.js                 ──► Content API
├── js/features.js                ──► Feature flags
├── js/games.js                   ──► Game exercises
├── js/speak.js                   ──► Speech synthesis
├── js/listening.js               ──► Listening exercises
├── js/sentbuild.js               ──► Sentence builder
├── js/stories.js                 ──► Stories module
└── js/bottom-nav.js              ──► Navigation
```

## State Management

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

### In-Memory State (Practice Session)
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

## Service Worker Strategy (sw.js v7)

### Cache Strategy
- **Static Assets** (HTML, CSS, JS, icons) → Cache First
- **Content JSON** → Stale While Revalidate
- **Audio/Images** → Cache First with fallback

### Precache Manifest (PRECACHE_URLS)
All modules + content files listed explicitly for offline-first.

## PWA Features
- **Manifest**: `manifest.json` with shortcuts, screenshots
- **Install Prompt**: Custom beforeinstallprompt handler
- **Offline Page**: Cached index.html serves offline
- **Background Sync**: Pending for future (state sync)

## Performance Budgets

| Metric | Target | Current |
|--------|--------|---------|
| App Load (First Paint) | < 2s | ~1.2s |
| Module Load (per module) | < 50ms | ~5-15ms |
| Orchestrator Init | < 100ms | 0.3-1ms |
| Decision Making | < 5ms | 0.05ms |
| Session Build | < 20ms | 0.1-0.15ms |
| Lesson Generation | < 300ms | ~50ms |
| Offline Switch | Instant | Instant |

## Future Extensibility Points

1. **New Exercise Types** → Register in `exercise-registry.js`
2. **New Generators** → Add to `generators/index.js`, register in registry
3. **New Orchestrator Priorities** → Extend `PRIORITY_CONFIG` in orchestrator
4. **New Nona Personalities** → Add to `nona-personality.json`
5. **New Exam Types** → Add to `exams.json` + exam mapping
6. **New Scenarios** → Add to orchestrator `createSimulation()`
7. **New Content** → Add to `content/` following schemas
8. **Backend Sync** → Implement `SyncEngine` module with IndexedDB queue

---

*Architecture designed for evolution, not rewrite. All contracts versioned implicitly through method signatures.*