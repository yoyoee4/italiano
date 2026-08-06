# Sprint C5: Daily Missions UI

**Status**: 🔄 Planned (Next)  
**Target**: 2 weeks after C4E completion  
**Branch**: feature/c5-daily-missions  

---

## 🎯 Goal
Activate `Orchestrator.createDailyMission()` in the home screen. Build mission card UI with streak visualization, Nona daily greeting, and recovery logic.

---

## 📦 Prerequisites (All ✅ Done)

- [x] `Orchestrator.createDailyMission()` returns valid mission object
- [x] `Orchestrator.getRecommendations()` returns UI cards
- [x] `Practice.startLesson()` accepts daily mission lessonId
- [x] Gamification system (XP, streak, hearts) working
- [x] Nona personality engine integrated

---

## 🎨 UI Components to Build

### 1. Home Screen Mission Card
```html
<!-- New section in index.html home view -->
<section id="daily-mission" class="mission-card">
  <header>
    <h2>המשימה היומית</h2>
    <span class="streak-badge">🔥 7 ימים</span>
  </header>
  <div class="mission-content">
    <p class="nona-greeting" id="nona-greeting"></p>
    <div class="mission-objectives">
      <!-- Dynamic from Orchestrator.createDailyMission() -->
    </div>
    <button class="btn-primary" id="start-mission">התחל משימה</button>
  </div>
  <footer class="mission-meta">
    <span>⏱ 10 דקות</span>
    <span>💎 +30 XP</span>
    <span>🎯 5 תרגילים</span>
  </footer>
</section>
```

### 2. Mission Objectives Display
```javascript
// From Orchestrator.createDailyMission()
{
  type: 'daily_mission',
  lessonId: 'A1-greetings',
  exercises: [
    { type: 'flashcard', count: 3, focus: 'review' },
    { type: 'multiple_choice', count: 2, focus: 'new' },
    { type: 'listening_mc', count: 1, focus: 'weak_words' },
    { type: 'speaking_pronunciation', count: 1, focus: 'pronunciation' }
  ],
  estimatedMinutes: 10,
  xpReward: 30,
  nonaPersonality: 'sweet',
  culturalNote: 'Il caffè italiano...'
}
```

### 3. Streak Visualization
- **Fire animation** for current streak
- **Recovery UI** when streak broken (Nona encouragement)
- **Weekly calendar view** with completion dots
- **Streak freeze** indicator (premium feature)

### 4. Nona Daily Greeting
```javascript
// Called on home screen load
Nona.getDailyGreeting(profile) → {
  message: "בוקר טוב! היום נלמד לברך באיטלקית ☕",
  personality: "sweet",
  culturalTip: "באיטליה שותים קפוצ'ינו רק בבוקר!",
  audio: "nona/greeting_morning.mp3"
}
```

---

## 🔧 Technical Implementation

### State Updates (js/app.js)
```javascript
// On app init / daily reset
async function loadDailyMission() {
  const mission = Orchestrator.createDailyMission();
  const greeting = Nona.getDailyGreeting(Orchestrator.getProfile());
  
  renderMissionCard(mission);
  renderNonaGreeting(greeting);
  renderStreakCalendar(Orchestrator.getProfile().streak);
}

// Hook: after Practice.completeSession()
Practice.on('sessionComplete', (session) => {
  if (session.type === 'daily_mission') {
    // Update mission card → completed state
    // Trigger confetti + XP popup
    // Update streak display
  }
});
```

### New CSS (css/styles.css additions)
```css
.mission-card {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 20px;
  margin: 16px;
  box-shadow: var(--shadow-lg);
  border-left: 4px solid var(--accent-primary);
}

.streak-badge {
  background: linear-gradient(45deg, #ff6b35, #f7931e);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  animation: pulse 2s infinite;
}

.nona-greeting {
  font-style: italic;
  color: var(--text-secondary);
  margin: 12px 0;
  line-height: 1.5;
}

.mission-objectives {
  display: grid;
  gap: 8px;
  margin: 16px 0;
}

.objective-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--surface);
  border-radius: 8px;
}

.objective-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}
```

---

## 🎯 Acceptance Criteria

| Criteria | Test |
|----------|------|
| Mission card renders on home | Visual + DOM check |
| `createDailyMission()` called on load | Console log + Network |
| Mission exercises match Orchestrator output | Unit test |
| Nona greeting shows personality | Visual check |
| Streak displays correctly | Visual + localStorage |
| "התחל משימה" starts Practice session | Integration test |
| Session completion updates streak/XP | Integration test |
| Mobile touch targets ≥44px | CSS audit |
| Offline: mission cached in SW | Service worker test |

---

## 🔗 Dependencies

| Depends On | Status |
|------------|--------|
| `Orchestrator.createDailyMission()` | ✅ C4D |
| `Orchestrator.getRecommendations()` | ✅ C4D |
| `Practice.startLesson()` | ✅ C4A |
| `Gamification` (XP/streak/hearts) | ✅ Existing |
| `Nona.getDailyGreeting()` | ✅ C6 |
| `content/nona-personality.json` | ✅ C6 |

---

## 📅 Timeline

| Week | Focus |
|------|-------|
| 1 | Home screen mission card, Nona greeting, streak UI |
| 2 | Practice integration, completion flow, offline caching, QA |

---

## 🔗 Links
- [[VolaLingo]] | [[Sprint_C4E_Product_QA]] | [[Sprint_C6_Simulations]]
- Orchestrator API: [[Sprint_C4D_Learning_Orchestrator]]
- Nona personality: [[Sprint_C6_Content_Layer#Phase-8-Nona-Personality-Engine]]