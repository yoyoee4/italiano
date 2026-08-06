# VolaLingo Roadmap

## Vision
Build the **best Italian learning app for Hebrew speakers** — combining adaptive intelligence, exam preparation, life simulations, and cultural depth in a single offline-first PWA.

---

## Sprint Timeline

### ✅ Completed

| Sprint | Duration | Focus | Deliverables |
|--------|----------|-------|--------------|
| **C4A** | 1 week | Practice Engine Extraction | 6 modular files, unified Contract API |
| **C4B** | 1 week | UX Hardening (5 phases) | Feedback animations, auto-focus, mistake explanations, progress viz, mobile touch targets |
| **C4C** | 1 week | Exercise Registry + Generators | Registry (30+ types), 28 generators, Content-Exercise Bridge |
| **C4D** | 1 week | Learning Orchestrator | 9-priority decision engine, unified API for C5-C7 |
| **C4E** | 1 week | Product Integration & QA | 6-phase automated test suite, benchmark document |
| **C6** | 2 weeks | Content Intelligence Layer | 33 files: schemas, curriculum, dictionary, culture, articles, Nona personality, exam mapping |

### 🔄 Active / Next

| Sprint | Target | Focus | Key Deliverables |
|--------|--------|-------|------------------|
| **C5** | 2 weeks | **Daily Missions UI** | Home screen integration, mission cards, streak visualization, Nona daily greeting |
| **C6** | 2 weeks | **Life Simulations UI** | Restaurant/airport/hospital/job interview scenarios, dialogue trees, cultural context |
| **C7** | 2 weeks | **AI Speaking Coach UI** | 3 Nona personalities, real-time pronunciation feedback, fluency scoring |

### 📅 Planned

| Sprint | Target | Focus |
|--------|--------|-------|
| **C8** | 3 weeks | **Backend Sync** — Cloud backup, multi-device sync, teacher dashboard |
| **C9** | 2 weeks | **Beta Launch** — Public beta, analytics, feedback loops |
| **C10** | 4 weeks | **Mobile Apps** — iOS/Android via Capacitor, App Store / Play Store |

---

## Milestone Gates

### M1: Learning Engine Complete (✅ Done)
- [x] Practice Engine modular
- [x] Exercise Registry + Generators
- [x] Orchestrator decision engine
- [x] All C4E QA gates pass

### M2: Product Experience Complete (C5-C7)
- [ ] Daily Missions UI integrated in home
- [ ] Life Simulations playable
- [ ] AI Speaking Coach functional
- [ ] All UI wired to Orchestrator APIs

### M3: Platform Ready (C8-C9)
- [ ] Backend sync operational
- [ ] Multi-device state sync
- [ ] Public beta with >100 users
- [ ] Day-1 Retention ≥40%, Lesson Completion ≥70%, 7-Day Streak ≥15%

### M4: Market Launch (C10+)
- [ ] iOS App Store
- [ ] Android Play Store
- [ ] Premium subscriptions active
- [ ] Content: 56 lessons, 5000+ vocab, 200+ exam questions

---

## KPIs (Key Performance Indicators)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Day-1 Retention** | ≥40% | Users returning day 1 |
| **Lesson Completion Rate** | ≥70% | Lessons finished / started |
| **7-Day Streak Rate** | ≥15% | Users with 7+ day streak |
| **Exam Readiness Score** | ≥80% | Mock exam pass rate |
| **App Load Time** | <2s | First paint on 3G |
| **Offline Usage** | >50% sessions | Sessions without network |

---

## Content Expansion Plan

### Curriculum (56 lessons across A1-C2)
| Level | Lessons | Hours | Status |
|-------|---------|-------|--------|
| A1 | 14 | 10h | 3 done (greetings, numbers, food) |
| A2 | 14 | 12h | 1 done (past_tenses) |
| B1 | 14 | 14h | 1 done (opinion) |
| B2 | 8 | 10h | Planned |
| C1 | 4 | 5h | Planned |
| C2 | 2 | 2h | Planned |

### Vocabulary Target: 5,000+ words
- Current: 926 (A1-A2)
- Need: +4,000 (B1-C2 + specialized)

### Exam Questions Target: 200+
- CILS: 50 per level × 4 levels × 4 sections = 800
- CELI: 50 per level × 4 levels × 4 sections = 800
- AIL: 30 per level × 3 levels × 4 sections = 360
- **MVP**: 50 per CILS level per section = 200

---

## Technical Debt & Quality

### Zero-Debt Policy (Enforced by C4E)
- ✅ No console errors
- ✅ All modules 200 OK
- ✅ All JSON valid (`node --check`)
- ✅ Service Worker caches all
- ✅ Offline-first verified
- ✅ Performance budgets met

### CI/CD Pipeline
- GitHub Actions → GitHub Pages
- Custom domain: `italiano.tickerio.app`
- Auto-deploy on push to `main`/`master`

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| GitHub Pages deployment fails | High | High | Manual repo creation, verify DNS |
| Speech API browser support | Medium | Medium | Fallback to synthesis only |
| Content creation bottleneck | High | High | Schema-driven, AI-assisted generation |
| Mobile Safari PWA limitations | Medium | Medium | Test early, native wrapper for C10 |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-08-05 | Modular extraction over rewrite | Preserve working engine, zero regression |
| 2026-08-05 | Contract-based module APIs | Clear boundaries, testable, replaceable |
| 2026-08-05 | Vanilla JS, no build step | Zero config, maximum portability, PWA-native |
| 2026-08-05 | Single Orchestrator decision engine | Unified intelligence, no conflicting signals |
| 2026-08-05 | C4E QA before new UI features | Prevent product debt, verify integration first |
| 2026-08-05 | Hebrew→Italian native content | Unique differentiator, underserved market |

---

*Roadmap updated: 2026-08-05 — Sprint C4E complete, entering C5*