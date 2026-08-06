# Sprint C7: AI Speaking Coach UI

**Status**: 🔄 Planned (After C6)  
**Target**: 2 weeks after C6 completion  
**Branch**: feature/c7-speaking-coach  

---

## 🎯 Goal
Activate `Orchestrator.createSpeakingCoachSession(focus)` with real-time pronunciation feedback, fluency scoring, and 3 Nona personalities. Build immersive speaking practice UI.

---

## 📦 Prerequisites (All ✅ Done)

- [x] `Orchestrator.createSpeakingCoachSession(focus)` returns valid session
- [x] `SpeakingPronunciationGenerator`, `SpeakingRepeatGenerator`, `SpeakingRoleplayGenerator` ready
- [x] Web Speech API integration in `js/speak.js` (synthesis + recognition)
- [x] `content/nona-personality.json` with 3 personalities + mistake patterns
- [x] Pronunciation scoring algorithm (confidence, phoneme matching)

---

## 🎯 Focus Modes

| Focus | ID | Description | Generators Used |
|-------|-----|-------------|-----------------|
| **Pronunciation** | `pronunciation` | Phoneme-level practice, minimal pairs | `SpeakingPronunciationGenerator` |
| **Fluency** | `fluency` | Connected speech, speed, pauses | `SpeakingRepeatGenerator`, `SpeakingRoleplayGenerator` |
| **Exam** | `exam` | CILS/CELI speaking tasks | `ExamSpeakingGenerator` + exam rubric |

---

## 🎨 UI Components

### 1. Speaking Coach Hub (Home Screen)
```html
<section id="speaking-coach" class="coach-hub">
  <header>
    <h2>מאמן דיבור AI</h2>
    <div class="personality-selector" id="personality-select">
      <button class="personality-btn active" data-personality="teacher">👩‍🏫 מורה</button>
      <button class="personality-btn" data-personality="sweet">👵 נונה מתוקה</button>
      <button class="personality-btn" data-personality="strict">👵 נונה קפדנית</button>
    </div>
  </header>
  
  <div class="focus-modes">
    <article class="focus-card" data-focus="pronunciation">
      <div class="focus-icon">🎯</div>
      <h3>הגייה</h3>
      <p>צלילים, זוגות מינימליים, אינטונציה</p>
      <div class="focus-stats">
        <span>⏱ 8 דק'</span>
        <span>📊 ציון הגייה</span>
      </div>
      <button class="btn-primary">התחל</button>
    </article>
    
    <article class="focus-card" data-focus="fluency">
      <div class="focus-icon">💬</div>
      <h3>שטף</h3>
      <p>דיבור רציף, מהירות, עצירות</p>
      <div class="focus-stats">
        <span>⏱ 10 דק'</span>
        <span>📊 ציון שטף</span>
      </div>
      <button class="btn-primary">התחל</button>
    </article>
    
    <article class="focus-card" data-focus="exam">
      <div class="focus-icon">📝</div>
      <h3>הכנה למבחן</h3>
      <p>משימות דיבור CILS/CELI/AIL</p>
      <div class="focus-stats">
        <span>⏱ 15 דק'</span>
        <span>📊 ניקוד רשמי</span>
      </div>
      <button class="btn-primary">התחל</button>
    </article>
  </div>
</section>
```

### 2. Speaking Practice View
```html
<div id="speaking-view" class="speaking-container">
  <header class="speak-header">
    <button class="btn-back" id="speak-back">←</button>
    <h2 id="speak-title">תרגול הגייה</h2>
    <div class="speak-progress">
      <span id="speak-exercise">1/5</span>
      <div class="mic-status" id="mic-status">
        <span class="mic-icon">🎤</span>
        <span class="mic-state">לחץ לדבר</span>
      </div>
    </div>
  </header>
  
  <main class="speak-content">
    <!-- Prompt Card -->
    <div class="prompt-card" id="prompt-card">
      <div class="prompt-italian" id="prompt-italian">Ciao, come stai?</div>
      <div class="prompt-hebrew" id="prompt-hebrew">שלום, מה שלומך?</div>
      <button class="btn-play" id="play-model">🔊 שמע דוגמה</button>
    </div>
    
    <!-- Recording Area -->
    <div class="recording-area" id="recording-area">
      <button class="mic-btn" id="mic-btn" aria-label="Start recording">
        <svg class="mic-svg">...</svg>
        <span class="mic-label">הקש והחזק לדיבור</span>
      </button>
      <div class="waveform" id="waveform"></div>
      <div class="timer" id="timer">00:00</div>
    </div>
    
    <!-- Real-time Feedback -->
    <div class="feedback-panel" id="feedback-panel" hidden>
      <div class="score-circle" id="score-circle">
        <svg><circle cx="50" cy="50" r="45" stroke="#4ade80" stroke-width="8" fill="none" stroke-dasharray="283" stroke-dashoffset="0"/></svg>
        <span class="score-value" id="score-value">85%</span>
      </div>
      <div class="feedback-details" id="feedback-details">
        <div class="metric">
          <label>דיוק הגייה</label>
          <value id="pron-accuracy">88%</value>
        </div>
        <div class="metric">
          <label>אינטונציה</label>
          <value id="intonation">82%</value>
        </div>
        <div class="metric">
          <label>קצב</label>
          <value id="pace">90%</value>
        </div>
      </div>
      <div class="nona-feedback" id="nona-feedback">
        <span class="nona-avatar">👵</span>
        <p id="nona-text">Brava! Solo la 'gli' vuole più pratica.</p>
      </div>
      <div class="phoneme-breakdown" id="phoneme-breakdown">
        <!-- Per-phoneme scores -->
      </div>
    </div>
  </main>
  
  <footer class="speak-footer">
    <button class="btn-secondary" id="speak-retry">נסה שוב</button>
    <button class="btn-primary" id="speak-next">הבא</button>
  </footer>
</div>
```

---

## 🔧 Technical Implementation

### Speech Recognition Wrapper (js/modules/speech-coach.js - NEW)
```javascript
class SpeechCoachEngine {
  constructor(orchestrator, speak, nona, content) { ... }
  
  // Session Management
  startSession(focus, personality)           // Load exercises, init state
  getCurrentExercise()                       // Current speaking exercise
  
  // Recording & Analysis
  startRecording()                           // MediaRecorder + Web Audio
  stopRecording()                            // → AudioBlob
  analyzePronunciation(audioBlob, targetText) // → PronunciationResult
  
  // Pronunciation Analysis (Web Audio API)
  analyze(audioBlob, expectedText) {
    // 1. SpeechRecognition for transcript
    // 2. Web Audio: FFT → pitch, formants, duration
    // 3. Phoneme alignment (DTW against model)
    // 4. Score: accuracy, intonation, pace, fluency
    return {
      transcript: "ciao come stai",
      expected: "ciao come stai",
      scores: {
        overall: 0.85,
        accuracy: 0.88,      // Phoneme match
        intonation: 0.82,    // Pitch contour
        pace: 0.90,          // Speech rate
        fluency: 0.78        // Pauses, hesitations
      },
      phonemes: [
        { phoneme: "tʃ", expected: "tʃ", score: 0.95 },
        { phoneme: "a", expected: "a", score: 0.98 },
        { phoneme: "o", expected: "o", score: 0.92 },
        // ... per-phoneme breakdown
      ],
      mistakes: [
        { type: "phoneme", expected: "ʎ", actual: "li", position: 3 }
      ]
    }
  }
  
  // Nona Feedback Generation
  generateNonaFeedback(result, personality) {
    const patterns = Nona.detectMistakePatterns(result.mistakes);
    const tip = Nona.getTip(personality, patterns);
    const encouragement = Nona.getEncouragement(personality, result.scores.overall);
    return { tip, encouragement, personality };
  }
  
  // Session Completion
  completeSession() {
    // Aggregate scores, update SRS, weak words, speakingStats
    // Award XP, update streak
    return {
      avgScore: 0.83,
      exercisesCompleted: 5,
      xpEarned: 40,
      weakPhonemes: ['ʎ', 'ɲ', 'ts'],
      nonaSummary: "..."
    }
  }
}
```

### Pronunciation Scoring Algorithm
```javascript
function scorePronunciation(audioFeatures, expectedPhonemes) {
  // 1. Alignment: DTW (Dynamic Time Warping) user vs model
  // 2. Per-phoneme: spectral distance (MFCC + formants)
  // 3. Intonation: pitch contour correlation
  // 4. Pace: syllable/sec vs target (3.5-4.5 syll/sec Italian)
  // 5. Fluency: pause frequency, duration, filled pauses
  
  return {
    overall: weightedAvg(accuracy: 0.4, intonation: 0.2, pace: 0.2, fluency: 0.2),
    accuracy: phonemeMatchRate,
    intonation: pitchCorrelation,
    pace: 1 - abs(userRate - targetRate) / targetRate,
    fluency: 1 - (pauseCount * 0.1 + filledPauseCount * 0.15)
  }
}
```

### Integration in js/app.js
```javascript
// Initialize Speech Coach
SpeechCoachEngine.init({
  orchestrator: Orchestrator,
  speak: speakItalian,
  recognition: startSpeechRecognition,
  nona: Coach,
  content: APP_DATA
});

// Home screen: click focus card
document.querySelectorAll('.focus-card').forEach(card => {
  card.addEventListener('click', () => {
    const focus = card.dataset.focus;
    const personality = document.querySelector('.personality-btn.active').dataset.personality;
    const session = Orchestrator.createSpeakingCoachSession(focus);
    SpeechCoachEngine.startSession(session, personality);
    showView('speaking-view');
  });
});

// Personality selector
document.getElementById('personality-select').addEventListener('click', (e) => {
  if (e.target.matches('.personality-btn')) {
    document.querySelectorAll('.personality-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
  }
});

// Recording: hold to record
const micBtn = document.getElementById('mic-btn');
let mediaRecorder, audioChunks = [];

micBtn.addEventListener('mousedown', startRecording);
micBtn.addEventListener('mouseup', stopRecording);
micBtn.addEventListener('touchstart', startRecording);
micBtn.addEventListener('touchend', stopRecording);

async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];
  mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
  mediaRecorder.start();
  // Visual: waveform animation, timer start
}

async function stopRecording() {
  mediaRecorder.stop();
  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    const result = await SpeechCoachEngine.analyzePronunciation(audioBlob, currentPrompt);
    renderFeedback(result);
  };
}
```

---

## 🎯 Nona Personality Feedback Examples

| Situation | Sweet Nonna | Teacher Nonna | Strict Nonna |
|-----------|-------------|---------------|--------------|
| **Perfect (95%+)** | "Perfetto, tesoro! 💖" | "Eccellente! Pronuncia impeccabile." | "Accettabile. Ma non montarti la testa." |
| **Good (80-94%)** | "Brava! Quasi perfetto." | "Buon lavoro. La 'gli' va migliorata." | "Sufficiente. Ripeti la frase." |
| **Needs work (60-79%)** | "Dai, ci sei quasi! Riprova?" | "Attento alla 'gli' /ʎ/. Ecco come: ..." | "Sbagliato. Ancora. Finché non esce bene." |
| **Poor (<60%)** | "Non preoccuparti, impariamo insieme!" | "La pronuncia di 'gn' /ɲ/ richiede pratica. Guarda la lingua." | "Inaccettabile. Da capo. 10 volte." |

---

## 🎯 Acceptance Criteria

| Criteria | Test |
|----------|------|
| 3 focus modes selectable | Visual + unit test |
| 3 personalities switchable | Visual + unit test |
| Recording works (hold mic) | Integration test |
| Pronunciation analysis returns scores | Unit test (mock audio) |
| Phoneme breakdown displayed | Visual check |
| Nona feedback matches personality | Unit test |
| Session completion updates speakingStats | Integration test |
| Weak phonemes added to Orchestrator | Integration test |
| Offline: model audio cached | SW test |
| Mic permission handled gracefully | Integration test |

---

## 📅 Timeline

| Week | Focus |
|------|-------|
| 1 | SpeechCoachEngine, recording UI, pronunciation analysis, 1 focus mode |
| 2 | All 3 focus modes, Nona feedback, phoneme breakdown, exam mode, QA |

---

## 🔗 Dependencies

| Depends On | Status |
|------------|--------|
| `Orchestrator.createSpeakingCoachSession()` | ✅ C4D |
| `SpeakingPronunciationGenerator` | ✅ C4C |
| `SpeakingRepeatGenerator` | ✅ C4C |
| `SpeakingRoleplayGenerator` | ✅ C4C |
| `ExamSpeakingGenerator` | ✅ C4C |
| `js/speak.js` (Web Speech API) | ✅ Existing |
| `content/nona-personality.json` | ✅ C6 |
| Web Audio API (FFT, MediaRecorder) | Browser native |

---

## 🔗 Links
- [[VolaLingo]] | [[Sprint_C6_Simulations]] | [[Sprint_C8_Backend_Sync]]
- Orchestrator API: [[Sprint_C4D_Learning_Orchestrator]]
- Speaking generators: [[Sprint_C4C_Exercise_Registry]]
- Nona personality: [[Sprint_C6_Content_Layer#Phase-8-Nona-Personality-Engine]]