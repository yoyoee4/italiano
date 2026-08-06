# Architecture Decisions Log

**All major technical decisions for VolaLingo**  
*Format: Date | Decision | Rationale | Alternatives Considered*

---

## 2026-08-05 | Modular Extraction Over Rewrite
**Decision**: Split `practice.js` (1,326 lines) into 6 modules instead of rewriting.
**Rationale**: 
- Zero regression risk — existing engine works
- Preserves all SRS, hearts, streak, Nona logic
- Incremental delivery, each phase testable
- Team velocity: extraction 1 week vs rewrite 4+ weeks
**Alternatives**: Full rewrite with React/Vue — rejected (overkill, PWA-native vanilla JS preferred)

---

## 2026-08-05 | Contract-Based Module APIs
**Decision**: Every module exposes a public `window.ModuleName` object with typed methods.
**Rationale**:
- Clear boundaries, testable in isolation
- Dependency injection via `init(dependencies)`
- Replaceable implementations (e.g., mock for tests)
- No implicit globals, explicit contracts
**Alternatives**: ES6 modules with imports — rejected (requires build step, breaks zero-config PWA)

---

## 2026-08-05 | Vanilla JS, No Build Step
**Decision**: Pure ES6 modules loaded via `<script type="module">`, no bundler/transpiler.
**Rationale**:
- Zero config, maximum portability
- Native PWA support (Service Worker caches modules directly)
- Instant local dev: `python3 -m http.server`
- No CI/CD complexity for builds
**Alternatives**: Vite/Webpack — rejected (adds complexity, not needed for vanilla JS)

---

## 2026-08-05 | Single Orchestrator Decision Engine
**Decision**: One `LearningOrchestrator` with 9-priority hierarchy replaces scattered logic.
**Rationale**:
- Unified intelligence — no conflicting signals from multiple modules
- Transparent priority system (debuggable, tunable)
- Single source for C5-C7 features (Daily Missions, Simulations, Speaking Coach)
- Profile snapshot captures all state for decisions
**Alternatives**: Multiple small decision modules — rejected (fragmented, hard to balance)

---

## 2026-08-05 | C4E QA Before New UI Features
**Decision**: Sprint C4E (Product Integration & QA) before C5 Daily Missions UI.
**Rationale**:
- Engines existed but didn't work as unified experience
- "Product debt" — features built on untested integration
- C4E 6-phase test suite catches cross-module bugs
- Benchmark document establishes competitive position
**Alternatives**: Build UI first, test later — rejected (user's explicit pivot)

---

## 2026-08-05 | Hebrew→Italian Native Content
**Decision**: All content created specifically for Hebrew speakers, not translated.
**Rationale**:
- Unique differentiator (benchmark: only app with this)
- Cultural context: Israeli moving to Italy needs
- Grammar explanations in Hebrew (subjunctive, gender, etc.)
- Nona personality speaks Hebrew-Italian mix
**Alternatives**: Translate existing English→Italian content — rejected (loses cultural nuance)

---

## 2026-08-05 | JSON Schema Draft-07 for Content Validation
**Decision**: All content follows strict JSON schemas with `node --check` validation.
**Rationale**:
- Catch errors at commit time, not runtime
- Enables AI-assisted content generation (schema-guided)
- Cross-reference integrity (exam tags, dictionary links)
- Documentation-as-code (schemas = spec)
**Alternatives**: TypeScript interfaces — rejected (requires build, no runtime validation)

---

## 2026-08-05 | GitHub Pages + Custom Domain
**Decision**: Deploy via `peaceiris/actions-gh-pages` to `italiano.tickerio.app`.
**Rationale**:
- Free, reliable, HTTPS automatic
- Custom domain support built-in
- No server maintenance
- peaceiris action simpler than official Pages actions
**Alternatives**: Netlify, Vercel, custom VPS — rejected (cost, complexity, vendor lock-in)

---

## 2026-08-05 | Service Worker v7 with Explicit Precache
**Decision**: All modules + content files listed in `PRECACHE_URLS` for offline-first.
**Rationale**:
- Predictable caching (no runtime surprises)
- Full offline support for all content
- Version bump on every deploy (cache busting)
- Stale-while-revalidate for content updates
**Alternatives**: Workbox auto-precache — rejected (less control, larger SW)

---

## 2026-08-05 | Nona Personality Engine (3 Modes)
**Decision**: Three distinct personalities (Sweet/Teacher/Strict) with adaptive switching.
**Rationale**:
- Emotional connection — "Italian Nonna" cultural archetype
- Different learners need different correction styles
- Mistake pattern detection enables targeted feedback
- Personality switching based on profile state (SRS overdue, streak, level)
**Alternatives**: Single adaptive coach — rejected (less personality, harder to tune)

---

## 2026-08-05 | Exam Tagging System (EXAM_TYPE_LEVEL_SECTION)
**Decision**: Standardized tag format for all exam-relevant content.
**Rationale**:
- Enables `Orchestrator.createExamSimulation()` to filter/balance
- Traceability: content item → exam section → official structure
- Extensible: new exams (AIL) add tags without code changes
- Recommendation engine uses tags for weak-area targeting
**Alternatives**: Separate exam content files — rejected (duplication, sync issues)

---

## 2026-08-05 | Exercise Registry Factory Pattern
**Decision**: Central `ExerciseRegistry` with `register(type, class)` and generator classes.
**Rationale**:
- Open/closed: add new exercise types without modifying core
- 28 generators follow single contract → consistent Exercise objects
- Sequencing engine builds pedagogically sound flows
- CEFR-aware difficulty progression
**Alternatives**: Hardcoded exercise logic in Practice Engine — rejected (C4A extracted to enable this)

---

## 2026-08-05 | Content-Exercise Bridge
**Decision**: `ContentExerciseBridge` maps APP_DATA to generators automatically.
**Rationale**:
- Words → vocab generators, sentences → sentence generators, etc.
- `createDailyFlowFromContent()` builds 10-min sessions automatically
- `createExamFlowFromContent()` balances CILS/CELI sections
- New content automatically available in exercises
**Alternatives**: Manual exercise creation per lesson — rejected (doesn't scale)

---

## 2026-08-05 | No Breaking Changes Policy
**Decision**: Evolution only — additive changes, feature flags for risky updates.
**Rationale**:
- Production app with users (even if beta)
- Small commits, each deployable
- QA gates prevent regression
- Rollback = `git revert` single commit
**Alternatives**: Major version breaks — rejected (user trust, migration cost)

---

## 2026-08-05 | Pricing Model Defined Early
**Decision**: Free base, Premium €9.99/mo, Exam Pro €14.99-19.99/mo.
**Rationale**:
- Guides feature prioritization (Exam Pro → exam features)
- Free tier must be viable (offline PWA, full content)
- Premium differentiators: simulations, speaking coach, sync
- Israeli market pricing research done
**Alternatives**: Freemium with ads — rejected (UX degradation, privacy)

---

## 🔗 Links
- [[VolaLingo]] | [[Architecture]] | [[Roadmap]]