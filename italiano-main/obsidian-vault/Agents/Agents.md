# Agent Roles & Prompts – VolaLingo Development

**Documented agent behaviors for consistent development**

---

## 🤖 Hermes Agent (Primary Development Agent)

### Role
Full-stack development orchestrator for VolaLingo. Manages code, architecture, content, testing, deployment, and documentation.

### Core Responsibilities
1. **Code Development**: Write, refactor, test vanilla JS modules
2. **Architecture Decisions**: Document in [[Decisions_Log]]
3. **Sprint Execution**: Follow sprint specs, update Obsidian vault
4. **Quality Gates**: Run tests, validate schemas, verify deployment
5. **Git Hygiene**: Small commits, meaningful messages, tag releases
6. **Documentation**: Keep Obsidian vault in sync with every change

### Operating Principles
- **Evolution, not rewrite** — additive changes only
- **Production verification** — test locally, verify deployed
- **Evidence-backed claims** — show tool output, not assertions
- **Concise Hebrew responses** — technical terms stay English
- **Finish one feature end-to-end** — no context switching
- **When tests fail**: STOP, full failure report grouped by category

### Sprint Workflow
```
1. Read Obsidian vault (Home, Phases Index, Decisions Index)
2. Execute sprint phases sequentially
3. After each phase: run QA gates
4. Update Obsidian vault (status, cards, ADRs, Lessons)
5. Commit with format: "type: description (Sprint XX)"
6. Push to GitHub
7. Verify deployment
```

### Quality Gates (Non-Negotiable)
- [ ] `node --check` on all modified JS files
- [ ] `node --check` on all content JSON files
- [ ] `node tests/c4e-integration.test.js` — all 6 phases PASS
- [ ] Local server: all modules 200 OK
- [ ] Service Worker caches all assets
- [ ] No console errors on user journey
- [ ] No secrets/API keys in code

### Communication Style
- Hebrew for explanations, English for code/JSON/technical terms
- Structured: key:value pairs, bullet lists, decision tables
- Honest about blockers — never fabricate results
- Ask clarifying questions when ambiguous

---

## 👵 Nona AI Coach (In-App Agent)

### Role
Adaptive Italian learning coach with 3 personalities. Integrated into Practice Engine, Orchestrator, and Speaking Coach.

### Personality Modes

| Mode | Trigger | Tone | Correction Style |
|------|---------|------|------------------|
| **Sweet Nonna** | A1 level, streak < 3, first session | Warm, affectionate | Gentle: "Quasi perfetto, tesoro!" |
| **Teacher Nonna** | Default, progressing learners | Clear, structured | Explanatory: "Ecco la regola..." |
| **Strict Nonna** | SRS overdue > 5, repeated mistakes | Firm, demanding | Direct: "Ancora! Finché non esce bene." |

### Capabilities
- **Mistake Pattern Detection**: gender, verb type, subjunctive, prepositions, agreement
- **Adaptive Recommendations**: SRS interleaving, difficulty ramping, personality switching
- **Cultural Context**: Tips from `content/culture/*.json`
- **Exam Coaching**: Personality-specific exam feedback
- **Speaking Feedback**: Real-time pronunciation analysis

### Integration Points
```javascript
// In exercises.js (Practice Engine)
Coach.getFeedback(mistake, personality) → { tip, encouragement }

// In orchestrator.js
Orchestrator.selectNonaPersonality() → 'sweet'|'teacher'|'strict'

// In speech-coach.js (C7)
SpeechCoachEngine.generateNonaFeedback(result, personality)
```

### Data Source
`content/nona-personality.json` — single source for all personality rules

---

## 🎯 Learning Orchestrator (In-App Decision Engine)

### Role
Single decision engine that prioritizes what the user needs next. Replaces fragmented logic across modules.

### Priority Hierarchy (9 Levels)
1. **Critical SRS Overdue** (100) — `srsOverdueCount > 0`
2. **Exam Prep** (85) — `daysUntilExam <= 30`
3. **SRS Due** (80) — `srsDueCount > 0`
4. **Speaking Practice** (75) — low attempts or low score
5. **Grammar Weakness** (70) — `weakGrammar.length > 0`
6. **Daily Mission** (60) — no sessions or low daily XP
7. **Weak Words Review** (55) — `weakWords.length > 0`
8. **Skill Tree Progress** (50) — next node available
9. **Variety/Exploration** (30) — fallback

### Public API (for C5-C7)
```javascript
createDailyMission()           → C5: Home screen mission card
createExamSimulation()         → C7: Full mock exam
createSimulation(scenario)     → C6: Restaurant, airport, hospital, job
createSpeakingCoachSession()   → C7: Pronunciation, fluency, exam focus
getRecommendations()           → C5: Home screen cards
decideNextAction()             → Debug: show priority decisions
buildSession(decisions)        → Practice Engine consumes
```

### Event Hooks
```javascript
onSessionComplete(session)     // Updates profile: SRS, weak words, XP
onExerciseComplete(ex, result) // Real-time: weak words, speaking stats
```

---

## 🏃 Practice Engine (Core Learning Loop)

### Role
Executes learning sessions — handles exercise flow, answer validation, state updates.

### Contract API
```javascript
Practice.init(dependencies)    // Called once in app.js
Practice.startLesson(lessonId) // Lesson or orchestrated session
Practice.startExercise(type)   // Individual exercise
Practice.submitAnswer(answer)  // Validates, shows feedback
Practice.getSessionStats()     // Current: score, streak, xp
Practice.completeSession()     // Persists: SRS, XP, streak, weak words
```

### Dependencies Injected (20+)
- `state`, `save`, `toast`, `Events`
- `APP_DATA`, `ContentLoader`, `Gamification`
- `Coach`, `ExamEngine`, `speak`, `addXP`
- `confetti`, `fuzzyMatch`, `SpeechRecognition`
- `updateHearts`, `updateStreak`, `updateSRS`
- `getAnkiCards`

### Internal Modules
- `practice-core.js`: Session lifecycle
- `exercises.js`: 7 exercise types logic
- `anki-practice.js`: SRS reviews
- `dialogue-practice.js`: Conversations
- `practice-ui.js`: Rendering, animations, feedback
- `index.js`: Contract API + Registry/Generators integration

---

## 🧪 Test Agent (Automated QA)

### Role
Runs `tests/c4e-integration.test.js` — 6-phase integration suite.

### Phases
1. **Full User Journey** (47 assertions) — App open → home return
2. **Cross-Module Validation** (31) — All module integrations
3. **Adaptive Intelligence** (28) — Priority hierarchy, Nona switching
4. **Performance Benchmarks** (12) — <1ms decisions, <20ms sessions
5. **Content QA** (15) — 4 sample items validated
6. **Product Benchmark** (8) — Competitor comparison JSON

### Execution
```bash
node tests/c4e-integration.test.js
# Exit code 0 = all pass
# Exit code 1 = failures (categorized report required)
```

### Failure Protocol
When tests fail:
1. STOP development
2. Produce FULL failure report grouped by category
3. Fix root cause, not symptoms
4. Re-run full suite
5. Only then continue

---

## 📦 Content Agent (Content Intelligence)

### Role
Manages Content Intelligence Layer — schemas, validation, cross-references.

### Responsibilities
- Maintain 4 JSON schemas (`content/schema/`)
- Validate all 46 content files on commit
- Ensure exam tag coverage (`EXAM_TYPE_LEVEL_SECTION`)
- Maintain dictionary, culture, articles, Nona personality
- Run validation pipeline: `node --check content/**/*.json`

### Content Creation Rules
1. Follow schema exactly
2. Every item: CEFR, category, tags, Hebrew, Italian, audio
3. Add exam tags for exam-relevant content
4. Add culture tags for cultural content
5. Link to dictionary for vocab
6. Update curriculum index for new lessons

---

## 🚀 Deployment Agent (GitHub Pages)

### Role
Manages deployment to `italiano.tickerio.app` via GitHub Actions.

### Workflow
`.github/workflows/deploy.yml` using `peaceiris/actions-gh-pages@v3`

### Configuration
```yaml
trigger: push to main or master
publish_dir: .
publish_branch: gh-pages
custom_domain: italiano.tickerio.app
```

### Verification Checklist
- [ ] Workflow runs successfully (check Actions tab)
- [ ] `https://italiano.tickerio.app/` returns 200
- [ ] Service Worker registers (check DevTools)
- [ ] All modules load (Network tab)
- [ ] Custom domain shows green checkmark in Pages settings
- [ ] DNS CNAME: `italiano` → `yoyoee4.github.io`

---

## 📝 Documentation Agent (Obsidian Vault)

### Role
Keeps Obsidian vault in sync with every sprint completion.

### Vault Structure
```
obsidian-vault/
├── VolaLingo.md                    # Master index
├── Sprints/
│   ├── Sprint_C4A_Practice_Engine.md
│   ├── Sprint_C4B_UX_Hardening.md
│   ├── Sprint_C4C_Exercise_Registry.md
│   ├── Sprint_C4D_Learning_Orchestrator.md
│   ├── Sprint_C4E_Product_QA.md
│   ├── Sprint_C6_Content_Layer.md
│   ├── Sprint_C5_Daily_Missions.md
│   ├── Sprint_C6_Simulations.md
│   └── Sprint_C7_Speaking_Coach.md
├── Architecture/
│   └── Architecture.md
├── Content/
│   └── Content_System.md
├── Decisions/
│   └── Decisions_Log.md
└── Agents/
    └── Agents.md (this file)
```

### Sync Protocol
After every sprint completion:
1. Update sprint markdown with final status
2. Update `VolaLingo.md` status table
3. Update `Architecture.md` if contracts changed
4. Update `Content_System.md` if content changed
5. Add decision to `Decisions_Log.md` if major
6. Commit vault changes with code

---

## 🔗 Links
- [[VolaLingo]] | [[Architecture]] | [[Sprint_C4E_Product_QA]]