# Sprint C6: Life Simulations UI

**Status**: 🔄 Planned (After C5)  
**Target**: 2 weeks after C5 completion  
**Branch**: feature/c6-simulations  

---

## 🎯 Goal
Activate `Orchestrator.createSimulation(scenario)` for real-life scenarios. Build immersive dialogue trees with cultural context, branching paths, and Nona coaching.

---

## 📦 Prerequisites (All ✅ Done)

- [x] `Orchestrator.createSimulation(scenario)` returns valid simulation object
- [x] `DialogueChoiceGenerator`, `DialogueCompleteGenerator`, `DialogueRoleplayGenerator` ready
- [x] `content/dialogues.json` has 8 dialogues (restaurant, hotel, directions, shopping, etc.)
- [x] `content/culture/` modules provide cultural context
- [x] Nona personality engine with cultural comments

---

## 🎭 Scenarios to Implement

| Scenario | ID | Setting | Key Vocabulary | Cultural Notes |
|----------|-----|---------|----------------|----------------|
| **Restaurant** | `restaurant` | Trattoria in Roma | Menu, ordering, dietary, bill | Coperto, service charge, pagare al tavolo |
| **Airport** | `airport` | Fiumicino/Malpensa | Check-in, security, gate, delays | Carta d'imbarco, controllo sicurezza |
| **Hospital** | `hospital` | Pronto Soccorso | Symptoms, prescription, insurance | Tessera sanitaria, ricetta medica |
| **Job Interview** | `job_interview` | Ufficio HR Milano | CV, strengths, salary, contract | Contratto, TFR, ferie |

---

## 🎨 UI Components

### 1. Simulation Selector (Home Screen)
```html
<section id="simulations" class="simulation-grid">
  <h2>סימולציות חיים</h2>
  <div class="simulation-cards">
    <article class="sim-card" data-scenario="restaurant">
      <div class="sim-icon">🍝</div>
      <h3>מסעדה</h3>
      <p>הזמנה, חשבון, תפריט</p>
      <span class="sim-level">A1-A2</span>
      <button class="btn-secondary">התחל</button>
    </article>
    <article class="sim-card" data-scenario="airport">
      <div class="sim-icon">✈️</div>
      <h3>שדה תעופה</h3>
      <p>צ'ק-אין, ביטחון, שער</p>
      <span class="sim-level">A2-B1</span>
      <button class="btn-secondary">התחל</button>
    </article>
    <article class="sim-card" data-scenario="hospital">
      <div class="sim-icon">🏥</div>
      <h3>בית חולים</h3>
      <p>תסמינים, מרשם, ביטוח</p>
      <span class="sim-level">B1-B2</span>
      <button class="btn-secondary">התחל</button>
    </article>
    <article class="sim-card" data-scenario="job_interview">
      <div class="sim-icon">💼</div>
      <h3>ראיון עבודה</h3>
      <p>קורות חיים, שכר, חוזה</p>
      <span class="sim-level">B2-C1</span>
      <button class="btn-secondary">התחל</button>
    </article>
  </div>
</section>
```

### 2. Simulation View (Full Screen)
```html
<div id="simulation-view" class="simulation-container">
  <header class="sim-header">
    <button class="btn-back" id="sim-back">←</button>
    <h2 id="sim-title">מסעדה ברומא</h2>
    <div class="sim-progress">
      <span id="sim-step">2/6</span>
      <div class="progress-bar"><div class="progress-fill"></div></div>
    </div>
  </header>
  
  <main class="sim-content">
    <!-- Dynamic: dialogue, choices, cultural tips -->
    <div class="dialogue-scene">
      <div class="speaker nona" id="nona-bubble"></div>
      <div class="speaker italian" id="italian-speaker"></div>
      <div class="choices" id="choice-buttons"></div>
    </div>
    
    <aside class="cultural-sidebar" id="cultural-tip">
      <h4>💡 טיפ תרבותי</h4>
      <p id="cultural-text"></p>
    </aside>
  </main>
  
  <footer class="sim-footer">
    <button class="btn-hint" id="sim-hint">רמז</button>
    <button class="btn-dictionary" id="sim-dict">מילון</button>
    <button class="btn-primary" id="sim-continue">המשך</button>
  </footer>
</div>
```

### 3. Dialogue Tree Structure
```javascript
// From Orchestrator.createSimulation('restaurant')
{
  type: 'simulation',
  scenario: 'restaurant',
  cefr: 'A1-A2',
  estimatedMinutes: 15,
  culturalContext: 'content/culture/coffee.json + aperitivo.json',
  dialogueTree: [
    {
      id: 'enter',
      speaker: 'waiter',
      italian: 'Buonasera! Un tavolo per due?',
      hebrew: 'ערב טוב! שולחן לשניים?',
      choices: [
        { id: 'yes', text: 'Sì, per favore', hebrew: 'כן, בבקשה', next: 'menu' },
        { id: 'no', text: 'No, solo un caffè', hebrew: 'לא, רק קפה', next: 'coffee' }
      ],
      culturalTip: 'Italians say "Buonasera" after ~5pm',
      nonaComment: { sweet: '...', teacher: '...', strict: '...' }
    },
    {
      id: 'menu',
      speaker: 'waiter',
      italian: 'Ecco il menu. Cosa desidera?',
      hebrew: 'הנה התפריט. מה תרצה?',
      choices: [
        { id: 'pasta', text: 'Prendo la pasta', hebrew: 'אקח פסטה', next: 'water' },
        { id: 'pizza', text: 'Vorrei la pizza', hebrew: 'הייתי רוצה פיצה', next: 'water' }
      ],
      // ... branching continues
    }
  ],
  completion: {
    xpReward: 50,
    badge: 'sim_restaurant',
    culturalInsight: 'Il conto si paga al tavolo, non alla cassa'
  }
}
```

---

## 🔧 Technical Implementation

### State Machine (js/modules/simulation.js - NEW)
```javascript
class SimulationEngine {
  constructor(orchestrator, practice, nona, content) { ... }
  
  start(scenario)                    // Load simulation, init state
  getCurrentNode()                   // Current dialogue node
  selectChoice(choiceId)             // User choice → next node
  getCulturalTip(nodeId)             // From culture/ + nona-personality
  complete()                         // Award XP, badge, update profile
  
  // Branching logic
  evaluateBranch(currentNode, choice) // Handle conditional branches
  injectWeakWords()                  // Orchestrator adds weak vocab
  injectExamPrep()                   // If exam near, add exam-style Qs
}
```

### Integration in js/app.js
```javascript
// Initialize Simulation Engine
SimulationEngine.init({
  orchestrator: Orchestrator,
  practice: Practice,
  nona: Coach,
  content: APP_DATA,
  contentLoader: ContentLoader
});

// Home screen: click simulation card
document.querySelectorAll('.sim-card').forEach(card => {
  card.addEventListener('click', () => {
    const scenario = card.dataset.scenario;
    const sim = Orchestrator.createSimulation(scenario);
    SimulationEngine.start(sim);
    showView('simulation-view');
  });
});

// Simulation view events
document.getElementById('choice-buttons').addEventListener('click', (e) => {
  if (e.target.matches('.choice-btn')) {
    SimulationEngine.selectChoice(e.target.dataset.choiceId);
    renderCurrentNode();
  }
});
```

---

## 🎯 Acceptance Criteria

| Criteria | Test |
|----------|------|
| 4 scenarios selectable from home | Visual + DOM |
| Each scenario loads dialogue tree | Unit test |
| Choices branch correctly | Integration test |
| Cultural tips show per node | Visual check |
| Nona comments match personality | Unit test |
| Weak words injected from Orchestrator | Integration test |
| Completion awards XP/badge | Integration test |
| Progress bar updates | Visual check |
| Back button returns to home | Integration test |
| Offline: simulations cached | SW test |

---

## 📅 Timeline

| Week | Focus |
|------|-------|
| 1 | SimulationEngine class, dialogue tree rendering, 2 scenarios |
| 2 | Remaining 2 scenarios, cultural sidebar, Nona integration, QA |

---

## 🔗 Links
- [[VolaLingo]] | [[Sprint_C5_Daily_Missions]] | [[Sprint_C7_Speaking_Coach]]
- Orchestrator API: [[Sprint_C4D_Learning_Orchestrator]]
- Dialogue generators: [[Sprint_C4C_Exercise_Registry]]
- Culture modules: [[Sprint_C6_Content_Layer#Phase-6-Culture-Modules]]