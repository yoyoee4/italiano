# Sprint C4A: Practice Engine Extraction

**Status**: ✅ Complete  
**Date**: 2026-08-05  
**Commit**: 8489e25  
**Branch**: main → pushed to origin/main  

---

## 🎯 Goal
Extract monolithic `practice.js` (1,326 lines) into modular architecture while preserving 100% backward compatibility.

---

## 📦 Deliverables

### Created Modules (`js/modules/practice/`)
| File | Lines | Responsibility |
|------|-------|----------------|
| `practice-core.js` | 610 | Session lifecycle, XP/Hearts/SRS orchestration |
| `exercises.js` | 592 | Word/Sentence/Quiz/Listening/Speaking logic |
| `anki-practice.js` | 171 | SRS review session |
| `dialogue-practice.js` | 172 | Conversation practice |
| `practice-ui.js` | 553 | HTML rendering, mistake explanations, animations |
| `index.js` | 203 | Unified Contract API entry point |

### Updated Files
- `index.html`: Replaced `practice.js` with 5 module scripts + `practice/index.js`
- `js/app.js`: Added `Practice.init()` call with all dependencies
- `sw.js`: Bumped cache to v7, added 5 practice module URLs to PRECACHE_URLS

---

## 🔗 Contract API (Preserved)

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

---

## ✅ QA Gates Passed

- [x] All 6 practice modules load (200 OK)
- [x] Content files load (200 OK)
- [x] Service Worker v7 active
- [x] Practice.init wired with all deps
- [x] window.Practice backward compatible
- [x] Contract API exposes 5 methods
- [x] Syntax validation: `node --check` passes

---

## 📝 Notes
- Zero behavior change — pure extraction
- Dependency injection pattern used
- Event bus (`js/core/events.js`) for loose coupling
- All existing features preserved: SRS, hearts, streak, XP, Nona coach

---

## 🔗 Links
- [[VolaLingo]] | [[Architecture]] | [[Sprint_C4B_UX_Hardening]]
- Commit: https://github.com/yoyoee4/italiano/commit/8489e25