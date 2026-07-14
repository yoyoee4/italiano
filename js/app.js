/* ═══════════════════════════════════════════════
   VolaLingo v5 — App State & Core Engine
   ═══════════════════════════════════════════════ */

const APP_CONFIG = {
  targetLang: 'it-IT',
  targetName: 'איטלקית',
  targetFlag: '🇮🇹',
  nativeLang: 'he-IL',
  nativeName: 'עברית',
  nativeFlag: '🇮🇱',
  appName: 'VolaLingo'
};

// ═══════════════════════════════════════
// STATE
// ═══════════════════════════════════════
let state = loadState();
let anki = loadAnki();
let currentPage = 'learn';

function defaultState() {
  return {
    name: '',
    level: 'A1',
    xp: 0,
    coins: 0,
    streak: 0,
    lastDay: '',
    hearts: 5,
    heartsRefill: Date.now(),
    wordsLearned: [],
    correctWords: [], // {target, native, count, lastCorrect}
    sentencesPracticed: {},
    nodeProgress: {},
    quizHistory: [],
    dialoguesCompleted: {},
    achievements: [],
    weakWords: [],
    dailyCompleted: false,
    dailyXP: 0,
    dailyGoal: 30, // Default 30 XP
    league: 'ארד', // Bronze
    leagueXP: 0,
    leagueSeason: 1,
    leaguePositions: [],
    leagueStart: Date.now(),
    leagueBotXP: null,
    shopPurchases: [],
    onboarding: true,
    _lastNode: null
  };
}

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem('vl_state'));
    return s ? { ...defaultState(), ...s } : defaultState();
  } catch { return defaultState(); }
}

function save() { localStorage.setItem('vl_state', JSON.stringify(state)); }

function loadAnki() {
  try { return JSON.parse(localStorage.getItem('vl_anki')) || {}; }
  catch { return {}; }
}

function saveAnki() { localStorage.setItem('vl_anki', JSON.stringify(anki)); }

// ═══════════════════════════════════════
// INIT
// ═══════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  // Normalize word format - ensure target/native aliases exist
  if (APP_DATA && APP_DATA.words && APP_DATA.words.length > 0) {
    APP_DATA.words.forEach(function(w) {
      if (!w.target && w.it) w.target = w.it;
      if (!w.native && w.he) w.native = w.he;
    });
  }
  
  // Category mapping: skill tree English -> word Hebrew cats
  var CATEGORY_MAP = {
    'greetings': 'ברכות',
    'numbers': 'מספרים',
    'colors': 'צבעים',
    'family': 'משפחה',
    'verbs': 'פעלים',
    'time': 'זמן',
    'food': 'אוכל',
    'body': 'גוף',
    'adjectives': 'תכונות',
    'places': 'מקומות',
    'clothing': 'בגדים',
    'weather': 'טבע',
    'animals': 'חיות',
    'grammar': 'דקדוק',
    'travel': 'טיולים',
    'shopping': 'קניות',
    'health': 'בריאות',
    'emotions': 'רגשות',
    'work': 'עבודה',
    'media': 'בילוי',
    'culture': 'תרבות איטלקית',
    'art': 'אומנות',
    'education': 'חינוך',
    'science': 'טכנולוגיה',
    'politics': 'דעות',
    'finance': 'עסקים',
    'law': 'משפטים',
    'general': 'יומיום',
    'adverbs': 'זמן',
    'pronouns': 'היכרות',
    'transport': 'נסיעות'
  };

  // Also add catAliases to each word for flexible matching
  if (APP_DATA && APP_DATA.words) {
    APP_DATA.words.forEach(function(w) {
      // Find matching English category
      for (var eng in CATEGORY_MAP) {
        if (CATEGORY_MAP[eng] === w.cat) {
          w.catAliases = [w.cat, eng];
          break;
        }
      }
      if (!w.catAliases) w.catAliases = [w.cat];
    });
  }

  // Assign emoji to words without images - priority: WORD_EMOJI > CATEGORY_EMOJI
  if (window.EMOJI_MAP || window.WORD_EMOJI) {
    APP_DATA.words.forEach(function(w) {
      if (!w.img) {
        // First try word-specific emoji lookup (e.g. "pizza" → 🍕)
        var wordKey = (w.target || w.it || '').toLowerCase();
        if (window.WORD_EMOJI && WORD_EMOJI[wordKey]) {
          w.img = WORD_EMOJI[wordKey];
        }
        // Then try category-based lookup
        if (!w.img && window.EMOJI_MAP && EMOJI_MAP[w.cat]) {
          w.img = EMOJI_MAP[w.cat];
        }
      }
    });
    // Also for sentences
    if (APP_DATA.sentences) {
      APP_DATA.sentences.forEach(function(s) {
        if (!s.img && EMOJI_MAP[s.category || s.cat]) s.img = EMOJI_MAP[s.category || s.cat];
      });
    }
  }
  
  // Register SW
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
  
  // Splash → Login or App
    setTimeout(() => {
      document.getElementById('splash').style.opacity = '0';
      setTimeout(() => {
        document.getElementById('splash').style.display = 'none';
        showApp();
      }, 400);
    }, 800);
});

function doLogin() {
  const name = document.getElementById('loginName').value.trim() || 'Studente';
  const level = document.getElementById('loginLevel').value || 'A1';
  state.name = name;
  state.level = level;
  state.onboarding = false;
  save();
  showApp();
}

function showApp() {
  // Ensure default user identity (skip-login mode)
  if (!state.name) { state.name = 'Aa'; state.level = 'A1'; state.onboarding = false; save(); }
  
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('appScreen').style.display = 'flex';
  
 // Update top bar
 const brandEl = document.querySelector('.nav-brand');
 if(brandEl) brandEl.innerHTML = `<span style="color:var(--indigo-light)">${APP_CONFIG.targetFlag}</span> ` + state.name;
try{var ts=document.getElementById('topStreak');if(ts){var tv=ts.querySelector('.val');if(tv)tv.textContent=state.streak;}}catch(e){}
  try{var dg=document.getElementById('topDailyGoal');if(dg){var dv=dg.querySelector('.val');if(dv)dv.textContent=state.dailyXP+'/'+state.dailyGoal;}}catch(e){}
try{var tc=document.getElementById('topCoins');if(tc){var cv=tc.querySelector('.val');if(cv)cv.textContent=state.coins;}}catch(e){}
 refreshHearts();
  
  // Check streak
  checkStreak();
  
  // Init Nona — automatic greetings, coaching, milestones
  if (window.Nona) {
    setTimeout(() => Nona.init(), 500);
  }
  
  // Navigate
  const urlPage = new URLSearchParams(location.search).get('page');
  goPage(urlPage || 'learn');
}

// ═══════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════
function goPage(page) {
  currentPage = page;
  
  // Update nav
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.page === page);
  });
  
  const content = document.getElementById('pageContent');
  
  switch(page) {
    case 'learn':
      content.innerHTML = '<div id="learnContent"></div>';
      SkillTree.render();
      break;
    case 'practice':
      content.innerHTML = '<div id="practiceContent"></div>';
      Practice.render();
      break;
    case 'league':
      content.innerHTML = '<div id="leagueContent"></div>';
      renderLeague();
      break;
 case 'explore':
 content.innerHTML = '<div id="exploreContent"></div>';
 Content.render();
 break;
case 'speak':
 content.innerHTML = '<div id="speakContent"></div>';
 Speak.render();
 break;
case 'games':
 content.innerHTML = '<div id="gameArea"></div>';
 Games.showMenu();
 break;
case 'sentbuild':
 content.innerHTML = '<div id="sentbuildContent"></div>';
 SentBuild.render();
 break;
case 'profile':
      content.innerHTML = '<div id="profileContent"></div>';
      renderProfile();
      break;
    case 'shop':
      content.innerHTML = '<div id="shopContent"></div>';
      renderShop();
      break;
    case 'grammar':
      content.innerHTML = '<div id="grammarContent"></div>';
      renderGrammar(APP_DATA.grammarTips);
      break;
    case 'listening':
      content.innerHTML = '<div id="listeningContent"></div>';
      Listening.render();
      break;
    case 'exams':
      content.innerHTML = '<div id="examContent"></div>';
      Exams.render();
      break;
    case 'trainer':
      content.innerHTML = '<div id="trainerContent"></div>';
      if (window.Trainer) Trainer.render();
      break;
    case 'stories':
      content.innerHTML = '<div id="storyContent"></div>';
      if (window.VolaStories) VolaStories.render();
      break;
    default:
      content.innerHTML = '<div id="learnContent"></div>';
      SkillTree.render();
}
// Notify Nona of page change
if (window.Nona) {
  setTimeout(() => Nona.onPageChange(page), 300);
}
}

// Alias for bottom nav buttons
function nav(page) { goPage(page); }

// ═══════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════
function renderProfile() {
  const c = document.getElementById('profileContent');
  const totalCrowns = Object.values(state.nodeProgress).reduce((s,n) => s + (n.crown||0), 0);
  const maxCrowns = (APP_DATA.skillTree||[]).length * 5;
  const xpLevel = Math.floor(state.xp / 100) + 1;
  const xpInLevel = state.xp % 100;
  
  c.innerHTML = `
    <div style="text-align:center;padding:20px 0">
      <div style="font-size:4rem;margin-bottom:8px">${APP_CONFIG.targetFlag}</div>
      <h2 style="font-weight:800">${state.name}</h2>
      <div style="color:var(--text2);font-size:.9rem">${state.level} — רמה ${xpLevel}</div>
    </div>
    
    <div class="profile-stats">
      <div class="stat-card">
        <div class="stat-value">${state.streak}</div>
        <div class="stat-label">🔥 רצף</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${totalCrowns}</div>
        <div class="stat-label">👑 כתרים</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${state.wordsLearned.length}</div>
        <div class="stat-label">📝 מילים</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${state.coins}</div>
        <div class="stat-label">💎 מטבעות</div>
      </div>
    </div>
    
    <div class="progress-bar" style="margin:0 16px 8px"><div class="progress-fill" style="width:${xpInLevel}%"></div></div>
    <div style="text-align:center;font-size:.75rem;color:var(--text3);margin-bottom:16px">${xpInLevel}/100 XP לרמה הבאה</div>
    
    <h3 class="section-title"><span class="emoji">🏆</span> הישגים</h3>
    <div class="achievements-grid">
      ${APP_DATA.achievements ? APP_DATA.achievements.map(a => {
        const unlocked = state.achievements.includes(a.id);
        return `<div class="achievement ${unlocked?'unlocked':''}" title="${a.name}">
          <span style="font-size:1.5rem">${unlocked ? a.icon : '🔒'}</span>
          <div style="font-size:.7rem;margin-top:2px">${a.name}</div>
        </div>`;
      }).join('') : '<div style="color:var(--text3);text-align:center;padding:16px">המשך ללמוד לפתוח הישגים!</div>'}
    </div>
    
    <h3 class="section-title"><span class="emoji">📊</span> סטטיסטיקות</h3>
    <div class="card">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:.85rem">
        <div>📝 מילים נלמדו: <strong>${state.wordsLearned.length}</strong></div>
        <div>🎤 משפטים: <strong>${Object.keys(state.sentencesPracticed||{}).length}</strong></div>
        <div>💬 שיחות: <strong>${Object.keys(state.dialoguesCompleted||{}).length}</strong></div>
        <div>🧠 חידונים: <strong>${state.quizHistory.length}</strong></div>
        <div>👑 כתרים: <strong>${totalCrowns}/${maxCrowns}</strong></div>
        <div>💪 מילים חלשות: <strong>${state.weakWords.length}</strong></div>
      </div>
    </div>
    
    <h3 class="section-title"><span class="emoji">⚙️</span> הגדרות</h3>
    <div class="card">
      <div style="margin-bottom:12px">
        <label style="font-size:.85rem;color:var(--text2)">שם:</label>
        <input type="text" value="${state.name}" onchange="state.name=this.value;save();const b=document.querySelector('.nav-brand');if(b)b.innerHTML='<span style=color:var(--indigo-light)>${APP_CONFIG.targetFlag}</span> '+this.value" 
          style="width:100%;padding:8px;background:var(--surface);border:1px solid var(--border);border-radius:6px;color:var(--text);margin-top:4px">
      </div>
      <div style="margin-bottom:12px">
        <label style="font-size:.85rem;color:var(--text2)">רמה:</label>
        <select onchange="state.level=this.value;save()" style="width:100%;padding:8px;background:var(--surface);border:1px solid var(--border);border-radius:6px;color:var(--text);margin-top:4px">
          ${['A1','A2','B1','B2','C1'].map(l => `<option value="${l}" ${state.level===l?'selected':''}>${l}</option>`).join('')}
        </select>
      </div>
      <a href="/pricing.html" class="btn btn-primary btn-block" style="display:block;text-align:center;margin-bottom:12px;text-decoration:none">⭐ שדרג לפרימיום</a>
      <button class="btn btn-danger btn-block" onclick="if(confirm('לאפס הכל?')){localStorage.clear();location.reload()}">🗑️ איפוס מלא</button>
    </div>
    <div id="nona-settings"></div>
  `;
  // Render Nona settings
  setTimeout(() => {
    const ns = document.getElementById('nona-settings');
    if (ns && window.Nona) Nona.renderSettings(ns);
  }, 50);
}

// ═══════════════════════════════════════
// SHOP
// ═══════════════════════════════════════
function renderShop() {
  const c = document.getElementById('shopContent');
  const shopItems = [
    {id:'hearts_refill',name:'מילוי לבבות',icon:'❤️',desc:'5 לבבות מלאים',price:50},
    {id:'streak_freeze',name:'הקפאת רצף',icon:'🧊',desc:'שמור רצף ליום אחד',price:100},
    {id:'double_xp',name:'XP כפול',icon:'⚡',desc:'XP כפול לשעה',price:150},
    {id:'hint_pack',name:'חבילת רמזים',icon:'💡',desc:'5 רמזים לחידונים',price:30},
    {id:'skin_dark',name:'מצב כהה',icon:'🌙',desc:'ערכת נושא כהה',price:200},
    {id:'skin_flag',name:'סמל איטליה',icon:'🇮🇹',desc:'פרופיל עם דגל',price:80}
  ];
  
  c.innerHTML = `
    <h2 class="section-title"><span class="emoji">🛒</span> חנות</h2>
    <div style="text-align:center;margin-bottom:16px">
      <span class="coin-badge">💎 ${state.coins}</span>
    </div>
    ${shopItems.map(item => {
      const owned = state.shopPurchases.includes(item.id);
      return `
        <div class="card" style="display:flex;align-items:center;gap:12px">
          <span style="font-size:2rem">${item.icon}</span>
          <div style="flex:1">
            <div style="font-weight:700">${item.name}</div>
            <div style="font-size:.8rem;color:var(--text2)">${item.desc}</div>
          </div>
          <button class="btn btn-sm ${owned ? 'btn-secondary' : 'btn-primary'}" 
            onclick="${owned ? '' : `buyItem('${item.id}',${item.price})`}" 
            ${owned ? 'disabled' : ''}>
            ${owned ? '✓ נרכש' : `💎 ${item.price}`}
          </button>
        </div>
      `;
    }).join('')}
  `;
}

function buyItem(id, price) {
  if (state.coins < price) { toast('אין מספיק מטבעות!', 'error'); return; }
  state.coins -= price;
  state.shopPurchases.push(id);
  
  if (id === 'hearts_refill') { state.hearts = 5; state.heartsRefill = Date.now(); refreshHearts(); }
  save();
  toast('✅ נרכש בהצלחה!', 'success');
  renderShop();
}

// ═══════════════════════════════════════
// XP & COINS
// ═══════════════════════════════════════
function addXP(amount) {
  state.xp += amount;
  state.coins += Math.ceil(amount / 3);
  state.leagueXP += amount;
  save();
  try {
    var el = document.getElementById('topCoins');
    if (el) { var v = el.querySelector('.val'); if (v) v.textContent = state.coins; }
  } catch(e) {}
}

function addDaily() {
  if (!state.dailyCompleted) {
    state.dailyCompleted = true;
    addXP(20);
    toast('✅ יומי הושלם! +20 XP', 'success');
  }
}

// ═══════════════════════════════════════
// HEARTS
// ═══════════════════════════════════════
function getHearts() {
  // Auto-refill after 30 min
  const elapsed = Date.now() - state.heartsRefill;
  const refilled = Math.floor(elapsed / (30 * 60 * 1000));
  if (refilled > 0 && state.hearts < 5) {
    state.hearts = Math.min(5, state.hearts + refilled);
    state.heartsRefill = Date.now();
    save();
  }
  return { count: state.hearts, refillIn: Math.max(0, 30 * 60 * 1000 - (Date.now() - state.heartsRefill)) };
}

function useHeart() {
  const h = getHearts();
  if (h.count <= 0) {
    toast('❤️ אזלו הלבבות! חכה או קנה בחנות', 'error');
    return false;
  }
  state.hearts--;
  if (state.hearts <= 0) state.heartsRefill = Date.now();
  save();
  refreshHearts();
  return true;
}

function refreshHearts() {
  const h = getHearts();
  const el = document.getElementById('topHearts');
  if (el) {
    const val = el.querySelector('.val');
    if (val) val.textContent = h.count;
  }
}

// ═══════════════════════════════════════
// STREAK
// ═══════════════════════════════════════
function checkStreak() {
  const today = new Date().toISOString().slice(0, 10);
  if (state.lastDay === today) return; // already active today
  
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (state.lastDay === yesterday) {
    // Continue streak
  } else if (state.lastDay && state.lastDay !== today) {
    // Streak broken (unless freeze)
    if (!state.shopPurchases.includes('streak_freeze_used_today')) {
      state.streak = 0;
    }
  }
  
  // Increment if new day
  if (state.lastDay !== today) {
    state.streak++;
    state.lastDay = today;
    state.dailyCompleted = false;
    save();
  }
  
  try{var ts=document.getElementById('topStreak');if(ts){var tv=ts.querySelector('.val');if(tv)tv.textContent=state.streak;}}catch(e){}
  try{var dg=document.getElementById('topDailyGoal');if(dg){var dv=dg.querySelector('.val');if(dv)dv.textContent=state.dailyXP+'/'+state.dailyGoal;}}catch(e){}
}

// ═══════════════════════════════════════
// WEAK WORDS TRACKER
// ═══════════════════════════════════════
function trackWeakWord(word) {
  const existing = state.weakWords.find(w => w.word === word);
  if (existing) {
    existing.misses++;
    existing.lastMiss = Date.now();
  } else {
    state.weakWords.push({ word, misses: 1, lastMiss: Date.now() });
  }
  // Sort by misses desc, keep top 30
  state.weakWords.sort((a, b) => b.misses - a.misses);
  state.weakWords = state.weakWords.slice(0, 30);
  save();
}

// ═══════════════════════════════════════
// ACHIEVEMENTS
// ═══════════════════════════════════════
APP_DATA.achievements = [
  {id:'first_word',name:'מילה ראשונה',icon:'🌱',condition:()=>state.wordsLearned.length>=1},
  {id:'ten_words',name:'10 מילים',icon:'📝',condition:()=>state.wordsLearned.length>=10},
  {id:'fifty_words',name:'50 מילים',icon:'📚',condition:()=>state.wordsLearned.length>=50},
  {id:'hundred_words',name:'100 מילים!',icon:'🏆',condition:()=>state.wordsLearned.length>=100},
  {id:'first_crown',name:'כתר ראשון',icon:'👑',condition:()=>Object.values(state.nodeProgress).some(n=>n.crown>=1)},
  {id:'five_crowns',name:'5 כתרים',icon:'👑',condition:()=>Object.values(state.nodeProgress).reduce((s,n)=>s+(n.crown||0),0)>=5},
  {id:'streak_3',name:'רצף 3 ימים',icon:'🔥',condition:()=>state.streak>=3},
  {id:'streak_7',name:'רצף שבוע!',icon:'🔥',condition:()=>state.streak>=7},
  {id:'streak_30',name:'רצף חודש!',icon:'💎',condition:()=>state.streak>=30},
  {id:'first_dialogue',name:'שיחה ראשונה',icon:'💬',condition:()=>Object.keys(state.dialoguesCompleted).length>=1},
  {id:'singer',name:'זמר!',icon:'🎤',condition:()=>Object.keys(state.sentencesPracticed).length>=10},
  {id:'quiz_master',name:'מלך חידונים',icon:'🧠',condition:()=>state.quizHistory.filter(q=>q.score>=80).length>=5},
];

function checkAchievements() {
  let newUnlocks = [];
  (APP_DATA.achievements||[]).forEach(a => {
    if (!state.achievements.includes(a.id) && a.condition && a.condition()) {
      state.achievements.push(a.id);
      newUnlocks.push(a);
    }
  });
  if (newUnlocks.length > 0) {
    save();
    newUnlocks.forEach(a => {
      toast(`🏆 הישג: ${a.icon} ${a.name}`, 'success');
      addXP(25);
    });
  }
}

// ═══════════════════════════════════════
// CORRECT WORDS TRACKER
// ═══════════════════════════════════════
function addCorrectWord(wordObj) {
  if (!wordObj || !wordObj.target) return;
  var existing = state.correctWords.find(function(w) { return w.target === wordObj.target; });
  if (existing) {
    existing.count++;
    existing.lastCorrect = Date.now();
  } else {
    state.correctWords.push({target: wordObj.target, native: wordObj.native || '', count: 1, lastCorrect: Date.now()});
  }
  save();
}

function renderCorrectWords(container) {
  if (!container) container = document.getElementById('pageContent');
  var words = state.correctWords || [];
  words.sort(function(a, b) { return b.count - a.count; });
  
  var html = '<h3 class="section-title"><span class="emoji">✅</span> מילים שידעתי נכון</h3>';
  
  if (words.length === 0) {
    html += '<div class="empty-state"><div class="empty-icon">📝</div><div class="empty-text">עדיין לא צברת מילים נכונות</div><div class="empty-sub">תתאמן ותראה כאן את ההתקדמות שלך!</div></div>';
    container.innerHTML += html;
    return;
  }
  
  html += '<div style="font-size:.8rem;color:var(--text3);margin-bottom:8px">סך הכל ' + words.length + ' מילים ידועות</div>';
  html += '<div class="correct-words-list">';
  
  words.forEach(function(w) {
    html += '<div class="correct-word-item">';
    html += '  <div class="correct-word-left">';
    html += '    <div class="correct-word-it">' + escHtml(w.target) + '</div>';
    html += '    <div class="correct-word-he">' + escHtml(w.native) + '</div>';
    html += '  </div>';
    html += '  <div class="correct-word-right">';
    html += '    <div class="correct-word-count">' + w.count + 'x</div>';
    html += '    <button class="speak-btn" onclick="event.stopPropagation();speak(\'' + escAttr(w.target) + '\')">🔊</button>';
    html += '  </div>';
    html += '</div>';
  });
  
  html += '</div>';
  container.innerHTML += html;
}

// ═══════════════════════════════════════
// SPEECH (Web Speech API)
// ═══════════════════════════════════════
let isListening = false;
let speechSupported = 'speechSynthesis' in window;
let recognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

function speak(text, rate = 1) {
  if (!speechSupported) return;
  const tLang = APP_CONFIG.targetLang;
  
  try {
    if (!speechSynthesis.getVoices().some(v => v.lang.startsWith(tLang.split('-')[0]))) {
      return toast(`קול עבור ${APP_CONFIG.targetName} עדיין בטעינה... אנא המתן שניות ספורות`, 'warning');
    }
    
    const u = new SpeechSynthesisUtterance(text);
    u.lang = tLang;
    u.rate = rate;
    u.pitch = 1;
    
    // Try to find Italian voice
    const voices = speechSynthesis.getVoices();
    const itVoice = voices.find(v => v.lang.startsWith(tLang.split('-')[0]));
    if (itVoice) u.voice = itVoice;
    
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } catch(e) {
    console.warn('speak() error:', e);
  }
}

// Load voices
if (speechSupported) {
  speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
}

function startListening(langCode, cb) {
  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
    toast('הדפדפן שלך אינו תומך בזיהוי קולי 😔', 'error'); return;
  }
  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = new Rec();
  recognition.lang = langCode || APP_CONFIG.targetLang;recognition.interimResults = false;
  recognition.maxAlternatives = 3;
  
  recognition.onresult = (event) => {
    isListening = false;
    const results = [];
    for (let i = 0; i < event.results[0].length; i++) {
      results.push(event.results[0][i].transcript);
    }
    cb(results);
  };
  
  recognition.onerror = (event) => {
    isListening = false;
    console.warn('Speech recognition error:', event.error);
    cb(null);
  };
  
  recognition.onend = () => { isListening = false; };
  
  isListening = true;
  recognition.start();
}

function stopListening() {
  isListening = false;
  // Recognition will auto-stop
}

// ═══════════════════════════════════════
// FUZZY MATCH (Levenshtein-based)
// ═══════════════════════════════════════
function fuzzyMatch(a, b) {
  if (!a || !b) return 0;
  a = a.toLowerCase().replace(/[^\w\sàèéìòù]/g, '').trim();
  b = b.toLowerCase().replace(/[^\w\sàèéìòù]/g, '').trim();
  if (a === b) return 100;
  
  const len = Math.max(a.length, b.length);
  if (len === 0) return 100;
  
  const dist = levenshtein(a, b);
  return Math.max(0, Math.round((1 - dist / len) * 100));
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({length: m + 1}, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1] 
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[m][n];
}

// ═══════════════════════════════════════
// TOAST
// ═══════════════════════════════════════
function toast(msg, type = 'info') {
  const el = document.getElementById('toast');
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  el.appendChild(t);
  
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, 2500);
}

// ═══════════════════════════════════════
// CONFETTI
// ═══════════════════════════════════════
function confetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = 'block';
  
  const particles = [];
  const colors = ['#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#a855f7'];
  
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 100,
      w: 6 + Math.random() * 6,
      h: 4 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 10,
      opacity: 1
    });
  }
  
  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.rot += p.rotV;
      if (frame > 40) p.opacity -= 0.02;
      
      if (p.opacity > 0 && p.y < canvas.height + 20) {
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();
      }
    });
    
    frame++;
    if (alive && frame < 120) {
      requestAnimationFrame(animate);
    } else {
      canvas.style.display = 'none';
    }
  }
  animate();
}

// ═══════════════════════════════════════
// UTILS
// ═══════════════════════════════════════
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getNodeProgress(nodeId) {
  return state.nodeProgress[nodeId] || { crown: 0, done: false, bestScore: 0 };
}

function isUnlocked(node) {
  if (!node.prerequisite) return true;
  const prev = APP_DATA.skillTree.find(n => n.id === node.prerequisite);
  if (!prev) return true;
  return getNodeProgress(prev.id).crown >= 1;
}

// ═══════════════════════════════════════
// GRAMMAR TIPS
// ═══════════════════════════════════════
function renderGrammar(tips) {
  const c = document.getElementById('grammarContent');
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const levelColors = { A1: '#4ade80', A2: '#22d3ee', B1: '#7c5cfc', B2: '#f59e0b', C1: '#ef4444', C2: '#ec4899' };
  let activeLevel = 'הכול';

  function renderView() {
    const filtered = activeLevel === 'הכול' ? tips : tips.filter(t => t.level === activeLevel);
    c.innerHTML = `
      <div class="grammar-container">
        <h2 class="section-title"><span class="emoji">📖</span> טיפים דקדוקיים</h2>
        <div class="grammar-level-tabs">
          <button class="grammar-tab ${activeLevel === 'הכול' ? 'active' : ''}" data-level="הכול">הכול</button>
          ${levels.map(l => `
            <button class="grammar-tab ${activeLevel === l ? 'active' : ''}" 
              data-level="${l}" 
              style="${activeLevel === l ? `border-color:${levelColors[l]};color:${levelColors[l]}` : ''}">${l}</button>
          `).join('')}
        </div>
        <div class="grammar-tips-list">
          ${filtered.map(tip => renderGrammarTip(tip)).join('')}
          ${filtered.length === 0 ? '<div class="empty-state"><div class="empty-icon">📚</div><div class="empty-text">אין טיפים ברמה זו</div></div>' : ''}
        </div>
      </div>
    `;

    // Add click handlers for tabs
    c.querySelectorAll('.grammar-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        activeLevel = tab.dataset.level;
        renderView();
      });
    });

    // Add click handlers for tip cards
    c.querySelectorAll('.grammar-tip-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Don't toggle if clicking the listen button
        if (e.target.closest('.listen-btn')) return;
        card.classList.toggle('expanded');
        const arrow = card.querySelector('.expand-arrow');
        if (arrow) arrow.textContent = card.classList.contains('expanded') ? '▲' : '▼';
      });
    });
  }

  renderView();
}

function renderGrammarTip(tip) {
  const levelColors = { A1: '#4ade80', A2: '#22d3ee', B1: '#7c5cfc', B2: '#f59e0b', C1: '#ef4444', C2: '#ec4899' };
  const color = levelColors[tip.level] || '#7c5cfc';

  return `
    <div class="grammar-tip-card" style="border-right: 3px solid ${color};">
      <div class="header">
        <span class="grammar-level-badge" style="background:${color}">${tip.level}</span>
        <span class="grammar-tip-icon">${tip.icon}</span>
        <span class="grammar-tip-title">${tip.title}</span>
        <span class="expand-arrow">▼</span>
      </div>
      <div class="body">
        <p class="grammar-explanation">${tip.explanation}</p>
        <div class="grammar-examples">
          ${tip.examples.map(ex => `
            <div class="grammar-example-row">
              <span class="grammar-example-it">${escHtml(ex.it)}</span>
              <span class="grammar-example-he">${ex.he}</span>
            </div>
          `).join('')}
        </div>
        <button class="listen-btn" onclick="event.stopPropagation();speakGrammarExamples('${escAttr(tip.id)}')">🔊 האזן לדוגמאות</button>
      </div>
    </div>
  `;
}

function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escAttr(s) {
  return String(s).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function speakGrammarExamples(tipId) {
  const tip = (APP_DATA.grammarTips || []).find(t => t.id === tipId);
  if (!tip) return;
  // Speak all Italian examples in sequence
  const texts = tip.examples.map(ex => ex.it);
  const fullText = texts.join('. ');
  speak(fullText);
}

// ═══════════════════════════════════════
// LEAGUES — Weekly Competitive System
// ═══════════════════════════════════════

const LEAGUE_RANKS = [
  { key: 'ארד',    emoji: '🟤', nameEn: 'Bronze',   xpRequired: 50,   botMin: 500,  botMax: 1500 },
  { key: 'כסף',    emoji: '🪙', nameEn: 'Silver',   xpRequired: null, botMin: 800,  botMax: 2000 },
  { key: 'זהב',    emoji: '🥇', nameEn: 'Gold',      xpRequired: null, botMin: 1000, botMax: 2500 },
  { key: 'ספיר',    emoji: '💎', nameEn: 'Sapphire',  xpRequired: null, botMin: 1200, botMax: 2800 },
  { key: 'אודם',    emoji: '🔴', nameEn: 'Ruby',      xpRequired: null, botMin: 1500, botMax: 3000 },
  { key: 'ברקת',    emoji: '🟢', nameEn: 'Emerald',   xpRequired: null, botMin: 1800, botMax: 3200 },
  { key: 'יהלום',   emoji: '💠', nameEn: 'Diamond',   xpRequired: null, botMin: 2000, botMax: 3500 }
];

const LEAGUE_BOT_NAMES = ['Marco','Sofia','Luca','Giulia','Alessandro','Francesca','Matteo','Chiara'];

const LEAGUE_EMOJI_MAP = {
  'ארד': '🟤', 'כסף': '🪙', 'זהב': '🥇',
  'ספיר': '💎', 'אודם': '🔴', 'ברקת': '🟢', 'יהלום': '💠'
};

function getLeagueIndex(rank) {
  return LEAGUE_RANKS.findIndex(l => l.key === rank);
}

function getNextLeague(current, direction) {
  const idx = getLeagueIndex(current);
  if (direction === 'up') {
    if (idx >= LEAGUE_RANKS.length - 1) return null;
    return LEAGUE_RANKS[idx + 1].key;
  } else {
    if (idx <= 0) return null;
    return LEAGUE_RANKS[idx - 1].key;
  }
}

function initLeagueBotXP() {
  const leagueIdx = getLeagueIndex(state.league);
  const tier = LEAGUE_RANKS[leagueIdx] || LEAGUE_RANKS[0];
  const daysSinceMonday = getDaysSinceMonday();
  state.leagueBotXP = LEAGUE_BOT_NAMES.map(name => ({
    name,
    xp: generateBotXP(name, state.league, daysSinceMonday)
  }));
  save();
}

function getDaysSinceMonday() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon... 6=Sat
  // Days since last Monday
  const mondayOffset = day === 0 ? 6 : day - 1; // Sunday -> 6 days since Monday
  return mondayOffset;
}

function generateBotXP(name, league, day) {
  const leagueIdx = getLeagueIndex(league);
  const tier = LEAGUE_RANKS[leagueIdx] || LEAGUE_RANKS[0];
  // Base XP range for this league
  const baseMin = tier.botMin;
  const baseMax = tier.botMax;
  // Distribute XP across the week
  // Day 0 = Monday, Day 6 = Sunday
  const dayFactor = (day + 1) / 7; // 0.14 to 1.0
  // Random seed using name hash for consistency throughout the day
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  const pseudoRand = ((hash % 100) + 100) / 200; // 0.5-1.0 range
  const baseXP = Math.floor(baseMin + (baseMax - baseMin) * pseudoRand);
  // Daily increment: 50-150 per day
  const dailyInc = (50 + (hash % 100)) * (day + 1);
  const total = Math.min(5000, baseXP + dailyInc);
  return total;
}

function checkLeagueReset() {
  if (!state.leagueStart) {
    state.leagueStart = Date.now();
    state.leagueSeason = 1;
    save();
    return false;
  }
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const elapsed = now - state.leagueStart;
  if (elapsed >= weekMs) {
    // Apply promotion/relegation based on current position
    // Build leaderboard to find user's position
    const bots = state.leagueBotXP || (initLeagueBotXP(), state.leagueBotXP);
    const entries = [
      ...bots,
      { name: state.name || 'אני', xp: state.leagueXP || 0, isMe: true }
    ];
    entries.sort((a, b) => b.xp - a.xp);
    const userIndex = entries.findIndex(e => e.isMe);
    
    applyPromoRelegation(userIndex);
    
    // Save history
    state.leaguePositions.push({
      rank: state.league,
      date: new Date().toISOString(),
      position: userIndex + 1
    });
    
    // Reset for new week
    state.leagueXP = 0;
    state.leagueSeason = (state.leagueSeason || 0) + 1;
    state.leagueStart = now;
    state.leagueBotXP = null;
    save();
    
    // Re-init bots for new league
    initLeagueBotXP();
    
    return true;
  }
  return false;
}

function applyPromoRelegation(position) {
  // position = 0-indexed in 9-person group (0=top)
  const leagueIdx = getLeagueIndex(state.league);
  let newLeague = state.league;
  
  if (position <= 2) {
    // Top 3: promote (unless Diamond)
    const next = getNextLeague(state.league, 'up');
    if (next) {
      newLeague = next;
      toast(`🎉 עלית לליגת ${LEAGUE_EMOJI_MAP[next] || ''} ${next}!`, 'success');
    }
  } else if (position >= 7) {
    // Bottom 2: relegate (unless Bronze)
    const prev = getNextLeague(state.league, 'down');
    if (prev) {
      newLeague = prev;
      toast(`⬇️ ירדת לליגת ${LEAGUE_EMOJI_MAP[prev] || ''} ${prev}`, 'error');
    }
  }
  // Middle 4: stay (position 3-6)
  
  state.league = newLeague;
  save();
}

function getCountdown() {
  const now = new Date();
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + ((8 - now.getDay()) % 7 || 7));
  nextMonday.setHours(0, 0, 0, 0);
  if (nextMonday <= now) nextMonday.setDate(nextMonday.getDate() + 7);
  const diff = nextMonday - now;
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  return { days, hours, diff };
}

function renderLeague() {
  const container = document.getElementById('leagueContent');
  if (!container) return;
  
  // Check for weekly reset
  checkLeagueReset();
  
  // Ensure bot XP exists
  if (!state.leagueBotXP) {
    initLeagueBotXP();
  }
  
  // Build leaderboard
  const bots = state.leagueBotXP || [];
  const userEntry = { name: state.name || 'אני', xp: state.leagueXP || 0, isMe: true };
  const entries = [...bots, userEntry];
  entries.sort((a, b) => b.xp - a.xp);
  const userIndex = entries.findIndex(e => e.isMe);
  
  const leagueData = LEAGUE_RANKS[getLeagueIndex(state.league)] || LEAGUE_RANKS[0];
  const countdown = getCountdown();
  const avgXP = Math.round(entries.reduce((s, e) => s + e.xp, 0) / entries.length);
  const maxXP = Math.max(...entries.map(e => e.xp), 1);
  
  let html = `
    <div class="league-container">
      <!-- Rank Badge -->
      <div class="league-rank-badge">
        <div class="league-rank-emoji">${LEAGUE_EMOJI_MAP[state.league] || '🟤'}</div>
        <div class="league-rank-name">ליגת ${state.league}</div>
        <div class="league-rank-sub">${leagueData.nameEn}</div>
      </div>
      
      <!-- Position overview -->
      <div class="league-position-bar">
        <div class="league-pos-text">מקום #${userIndex + 1} מתוך ${entries.length}</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${((entries.length - userIndex) / entries.length) * 100}%"></div>
        </div>
      </div>
      
      <!-- Promotion / Relegation Zones -->
      <div class="league-zones">
        <div class="league-zone league-zone-up">
          <span>🟢 אזור עלייה</span>
          <span>3 הראשונים עולים</span>
        </div>
        <div class="league-zone league-zone-down">
          <span>🔴 אזור ירידה</span>
          <span>2 האחרונים יורדים</span>
        </div>
      </div>
      
      <!-- Leaderboard -->
      <div class="league-table">`;
  
  entries.forEach((entry, idx) => {
    const isUser = entry.isMe;
    const isPromo = idx < 3;
    const isReleg = idx >= entries.length - 2;
    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '';
    const rowClass = 'league-row' +
      (isUser ? ' user' : '') +
      (isPromo ? ' promotion' : '') +
      (isReleg && !isPromo ? ' relegation' : '');
    const xpPct = Math.round((entry.xp / maxXP) * 100);
    
    html += `
        <div class="${rowClass}">
          <div class="league-pos">${idx + 1}</div>
          <div class="league-medal">${medal}</div>
          <div class="league-avatar">${isUser ? '👤' : '🤖'}</div>
          <div class="league-name">${entry.name}</div>
          <div class="league-xp-bar-wrap">
            <div class="league-xp-bar">
              <div class="league-xp-fill" style="width:${xpPct}%"></div>
            </div>
          </div>
          <div class="league-xp-num">${entry.xp.toLocaleString()}</div>
        </div>`;
  });
  
  // Bottom info section
  html += `
      </div>
      
      <div class="league-info">
        <div class="league-countdown">
          <span class="league-clock-emoji">⏰</span>
          <span>השבוע הבא בעוד <strong>${countdown.days} ימים ${countdown.hours} שעות</strong></span>
        </div>
        <div class="league-details">
          <div class="league-detail-item">
            <span class="league-detail-label">🏆 עונה</span>
            <span class="league-detail-val">#${state.leagueSeason}</span>
          </div>
          <div class="league-detail-item">
            <span class="league-detail-label">👥 משתמשים בליגה</span>
            <span class="league-detail-val">${entries.length}</span>
          </div>
          <div class="league-detail-item">
            <span class="league-detail-label">📊 XP ממוצע</span>
            <span class="league-detail-val">${avgXP.toLocaleString()}</span>
          </div>
          <div class="league-detail-item">
            <span class="league-detail-label">🏅 השיא שלך</span>
            <span class="league-detail-val">${state.leagueXP.toLocaleString()} XP</span>
          </div>
        </div>
        <div class="league-season-hint">
          ליגה חדשה מתחילה בכל יום שני בחצות
        </div>
      </div>
    </div>`;
  
  container.innerHTML = html;
}

// Export for other modules if needed
window.LEAGUE_RANKS = LEAGUE_RANKS;
window.LEAGUE_EMOJI_MAP = LEAGUE_EMOJI_MAP;
