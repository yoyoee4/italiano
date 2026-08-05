# VolaLingo — Italian Learning Platform

> **VolaLingo** — אפליקציית הלימוד החכמה ביותר לאיטלקית לדוברי עברית. PWA מתקדם עם מנוע למידה אדפטיבי, הכנה למבחני CILS/CELI/AIL, מאמן AI אישי (נונה), וסימולציות חיים אמיתיות.

[![Version](https://img.shields.io/badge/version-0.9--beta-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()
[![PWA](https://img.shields.io/badge/PWA-ready-purple)]()
[![Offline](https://img.shields.io/badge/offline-full-orange)]()

---

## 🎯 Product Overview

VolaLingo is a **production-grade Italian learning platform** built specifically for Hebrew speakers. It combines:

- **Adaptive Learning Orchestrator** — Single decision engine that prioritizes what you need next (SRS, speaking, grammar, exam prep, daily missions)
- **CILS/CELI/AIL Exam Preparation** — Full mapping to official Italian certification exams with mock exams
- **Nona AI Coach** — Three personalities (Sweet/Teacher/Strict Nonna) with mistake pattern detection
- **Life Simulations** — Restaurant, airport, hospital, job interview scenarios
- **Full Offline PWA** — All content works without internet
- **Hebrew→Italian Native Content** — Unique content layer built for Hebrew speakers

### Target Audience
- Israelis moving to Italy 🇮🇹
- Students in Italian universities
- CILS/CELI/AIL exam candidates
- Italy enthusiasts & travelers

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        VolaLingo App                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Practice   │  │   Content    │  │  Gamification│           │
│  │    Engine    │  │  Intelligence│  │    System    │           │
│  │  (C4A+C4B)   │  │   (C6)       │  │  (XP/Streak) │           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
│         │                 │                 │                    │
│         └────────┬────────┴────────┬────────┘                    │
│                  ▼                 ▼                             │
│         ┌──────────────────────────────────┐                    │
│         │      Learning Orchestrator       │  ← Single Decision │
│         │         (C4D Sprint)             │     Engine         │
│         └──────────────┬───────────────────┘                    │
│                        ▼                                         │
│         ┌──────────────────────────────────┐                    │
│         │     Exercise Registry + Gen.     │  ← 30+ types,      │
│         │         (C4C Sprint)             │    28 generators   │
│         └──────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

### Sprint History
| Sprint | Focus | Status |
|--------|-------|--------|
| **C4A** | Practice Engine Extraction | ✅ Complete |
| **C4B** | UX Hardening (feedback, flow, mistakes, progress, mobile) | ✅ Complete |
| **C4C** | Exercise Registry + 28 Generators + Content Wiring | ✅ Complete |
| **C4D** | Learning Orchestrator (9-priority decision engine) | ✅ Complete |
| **C4E** | Product Integration & QA (automated test suite) | ✅ Complete |
| **C6** | Content Intelligence Layer (33 files) | ✅ Complete |

---

## ✨ Features

### Core Learning
- **Skill Tree A1→C2** — 56 lessons planned (6 implemented)
- **SRS/Anki Engine** — User-visible spaced repetition with adaptive scheduling
- **7+ Exercise Types** — Flashcard, multiple choice, typing, listening, speaking, dialogue, games
- **Daily Missions** — Orchestrator-generated personalized daily flow
- **Exam Simulations** — Full CILS/CELI/AIL mock exams

### Intelligence
- **Learning Orchestrator** — 9-priority decision engine (Critical SRS → Exam Prep → SRS Due → Speaking → Grammar → Daily Mission → Weak Words → Skill Tree → Variety)
- **Nona Personality Engine** — 3 modes with adaptive tone, mistake pattern detection (gender, verb, subjunctive, prepositions), SRS interleaving
- **Cross-module Linking** — Word mistake → SRS → appears in story → dialogue → simulation → exam → dictionary → Nona knows

### Content
- **Offline Dictionary** — 5000+ entries with grammar, conjugations, examples, culture notes
- **Cultural Modules** — Coffee (A1), Aperitivo (A2), 10 Regions (B1)
- **Graded Articles** — CEFR-graded with glossaries, comprehension questions, audio cues
- **Exam Mapping** — CILS/CELI/AIL structure with EXAM_LEVEL_SECTION tagging

### Technical
- **Full PWA** — Service worker, manifest, offline-first
- **Vanilla JS** — No frameworks, modular architecture
- **Zero Build Step** — Runs directly in browser

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Vanilla ES6+ Modules, CSS Custom Properties |
| **Storage** | IndexedDB (via localForage), localStorage |
| **PWA** | Service Worker (Workbox-style), Web App Manifest |
| **Audio** | Web Audio API (feedback sounds), Speech Synthesis |
| **Speech** | Web Speech API (recognition + synthesis) |
| **Testing** | Node.js native test runner (no framework) |
| **Deploy** | GitHub Pages + Custom Domain (`italiano.tickerio.app`) |

---

## 🚀 Quick Start

### Local Development
```bash
# Clone
git clone https://github.com/yoyoee4/italiano.git
cd italiano

# Serve (any static server)
python3 -m http.server 8081
# OR
npx serve .

# Open http://localhost:8081
```

### Requirements
- Modern browser with ES6 modules support
- HTTPS required for: Service Worker, Speech Recognition, PWA install
- Localhost works for development

---

## 📁 Project Structure

```
italiano/
├── index.html                 # Entry point
├── manifest.json              # PWA manifest
├── sw.js                      # Service Worker (v7)
├── CNAME                      # Custom domain config
├── .github/
│   └── workflows/
│       └── deploy.yml         # GitHub Pages deployment
├── css/
│   └── styles.css             # All styles (touch targets, animations)
├── js/
│   ├── app.js                 # Main app initialization
│   ├── content.js             # Content API
│   ├── skill-tree.js          # Skill tree logic
│   ├── trainer.js             # Legacy trainer
│   ├── games.js               # Game exercises
│   ├── speak.js               # Speech synthesis
│   ├── listening.js           # Listening exercises
│   ├── sentbuild.js           # Sentence builder
│   ├── stories.js             # Stories module
│   ├── bottom-nav.js          # Navigation
│   ├── features.js            # Feature flags
│   ├── core/
│   │   ├── content-loader.js  # Content loading
│   │   └── events.js          # Event bus
│   └── modules/
│       ├── coach.js           # Nona AI Coach
│       ├── gamification.js    # XP, streak, hearts, leagues
│       ├── exam.js            # Exam engine
│       ├── orchestrator.js    # Learning Orchestrator (C4D)
│       └── practice/
│           ├── practice-core.js       # Session lifecycle
│           ├── exercises.js           # Exercise logic
│           ├── anki-practice.js       # SRS reviews
│           ├── dialogue-practice.js   # Conversation practice
│           ├── practice-ui.js         # Rendering + feedback
│           ├── index.js               # Unified Contract API
│           ├── exercise-registry.js   # Registry + sequencing (C4C)
│           ├── generators/index.js    # 28 generators (C4C)
│           └── content-exercises.js   # Content→Exercise bridge (C4C)
├── content/                    # Content Intelligence Layer (C6)
│   ├── schema/
│   │   ├── content-item.schema.json
│   │   ├── lesson.schema.json
│   │   ├── exercise.schema.json
│   │   └── exam-question.schema.json
│   ├── curriculum/
│   │   ├── index.json
│   │   ├── A1/ (greetings, numbers, food)
│   │   ├── A2/ (past_tenses)
│   │   └── B1/ (opinion)
│   ├── dictionary/
│   │   ├── metadata.json
│   │   └── it-he.json
│   ├── culture/
│   │   ├── coffee.json
│   │   ├── aperitivo.json
│   │   └── regions.json
│   ├── articles/
│   │   ├── A1/cafe.md
│   │   ├── A2/aperitivo.md
│   │   └── B1/regions.md
│   ├── nona-personality.json
│   ├── words.json
│   ├── sentences.json
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
├── docs/
│   ├── architecture.md
│   ├── product-benchmark.json
│   ├── roadmap.md
│   ├── exam-system.md
│   └── content-system.md
└── tests/
    └── c4e-integration.test.js  # Automated integration test suite
```

---

## 🗺️ Roadmap

### ✅ Completed (Sprints C4A–C4E + C6)
- [x] Practice Engine modular extraction
- [x] UX hardening (5 phases)
- [x] Exercise Registry + 28 Generators
- [x] Content-Exercise Bridge
- [x] Learning Orchestrator (9-priority)
- [x] Product Integration QA (6 phases automated)
- [x] Content Intelligence Layer (33 files)

### 🔄 In Progress
- [ ] **C5** — Daily Missions UI (home screen integration)
- [ ] **C6** — Life Simulations UI (restaurant, airport, hospital, job interview)
- [ ] **C7** — AI Speaking Coach UI (3 Nona personalities + real-time feedback)

### 📅 Planned
- [ ] **C8** — Backend Sync (cloud backup, multi-device)
- [ ] **C9** — Beta Launch (public)
- [ ] **C10** — iOS/Android Apps (Capacitor/PWA wrapper)
- [ ] Content expansion: 56 lessons, 5000+ vocab, 200+ exam questions

---

## 🧪 Testing

```bash
# Run automated integration tests
node tests/c4e-integration.test.js

# Expected: All 6 phases PASS
# - Phase 1: Full User Journey
# - Phase 2: Cross-module Validation
# - Phase 3: Adaptive Intelligence
# - Phase 4: Performance Benchmarks
# - Phase 5: Content QA
# - Phase 6: Product Benchmark
```

### Quality Gates
- ✅ Zero console errors
- ✅ All modules load (200 OK)
- ✅ Service Worker caches all assets
- ✅ All content JSON valid (node --check)
- ✅ Offline-first PWA
- ✅ Performance: init <100ms, transitions <150ms, lesson <300ms

---

## 🌐 Deployment

### GitHub Pages (Current)
- **Workflow**: `.github/workflows/deploy.yml` (peaceiris/actions-gh-pages@v3)
- **Trigger**: Push to `main` or `master`
- **Custom Domain**: `italiano.tickerio.app`
- **Build**: None (static files only)

### DNS Setup for Custom Domain
```
Type: CNAME
Name: italiano
Value: yoyoee4.github.io
```

### Verify Deployment
```bash
curl -I https://italiano.tickerio.app/
# Should return 200 OK with service worker
```

---

## 📊 Product Benchmark

See [docs/product-benchmark.json](docs/product-benchmark.json) for full comparison.

### Unique Differentiators (vs Duolingo/Babbel/Busuu/Memrise/Mondly)
1. **Only** Hebrew→Italian native content
2. **Only** CILS/CELI/AIL exam preparation
3. **Only** Life simulations for Hebrew speakers
4. **Only** "Italian Nonna" personality coach
5. **Only** Unified adaptive orchestrator across all modules
6. **Only** Full offline PWA + full content

---

## 🤝 Contributing

This is an active development project. Current phase: **Sprint C5 (Daily Missions UI)**.

```bash
# Run tests before committing
node tests/c4e-integration.test.js

# Commit format
git commit -m "feat|fix|test|docs|ci: description (Sprint XX)"
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **Pedagogical sources**: OnlineItalianClub.com, One World Italiano, Alma Edizioni
- **Exam specs**: CILS (Università per Stranieri di Siena), CELI (Università per Stranieri di Perugia), AIL (Accademia Italiana di Lingua)
- **Icons**: Unicode emoji, Twemoji
- **Fonts**: Nunito, Inter (Google Fonts)

---

**Built with ❤️ for Hebrew speakers learning Italian**

*VolaLingo — לומדים איטלקית כמו שצריך* 🇮🇹