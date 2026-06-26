/* ═══════════════════════════════════════════════
   VolaLingo v2 — App Engine
   State, Navigation, Speech, Hearts, Coins,
   Anki, Achievements, Toast, Confetti
   ═══════════════════════════════════════════════ */

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
    sentencesPracticed: {},
    nodeProgress: {},
    quizHistory: [],
    dialoguesCompleted: {},
    achievements: [],
    weakWords: [],
    dailyCompleted: false,
    shopPurchases: [],
    onboarding: true,
    _lastNode: null,
    isPremium: false
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
  // Check for premium activation
  const urlParams = new URLSearchParams(location.search);
  if (urlParams.get('activate') === 'premium') {
    Paywall.activatePremium();
    history.replaceState({}, '', location.pathname);
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
      if (state.name && !state.onboarding) {
        showApp();
      } else {
        document.getElementById('loginScreen').style.display = 'flex';
      }
    }, 400);
  }, 1200);
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
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('appScreen').style.display = 'flex';
  
 // Update top bar
 const brandEl = document.querySelector('.nav-brand');
 if(brandEl) brandEl.innerHTML = '<span style="color:var(--indigo-light)">🇮🇹</span> ' + state.name;
 document.getElementById('topStreak').querySelector('.val').textContent = state.streak;
 document.getElementById('topCoins').querySelector('.val').textContent = state.coins;
 refreshHearts();
  
  // Check streak
  checkStreak();
  
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
case 'profile':
      content.innerHTML = '<div id="profileContent"></div>';
      renderProfile();
      break;
    case 'shop':
      content.innerHTML = '<div id="shopContent"></div>';
      renderShop();
      break;
    default:
      content.innerHTML = '<div id="learnContent"></div>';
      SkillTree.render();
  }
}

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
      <div style="font-size:4rem;margin-bottom:8px">🇮🇹</div>
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
        <input type="text" value="${state.name}" onchange="state.name=this.value;save();const b=document.querySelector('.nav-brand');if(b)b.innerHTML='<span style=color:var(--indigo-light)>🇮🇹</span> '+this.value" 
          style="width:100%;padding:8px;background:var(--surface);border:1px solid var(--border);border-radius:6px;color:var(--text);margin-top:4px">
      </div>
      <div style="margin-bottom:12px">
        <label style="font-size:.85rem;color:var(--text2)">רמה:</label>
        <select onchange="state.level=this.value;save()" style="width:100%;padding:8px;background:var(--surface);border:1px solid var(--border);border-radius:6px;color:var(--text);margin-top:4px">
          ${['A1','A2','B1','B2','C1'].map(l => `<option value="${l}" ${state.level===l?'selected':''}>${l}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-danger btn-block" onclick="if(confirm('לאפס הכל?')){localStorage.clear();location.reload()}">🗑️ איפוס מלא</button>
    </div>
  `;
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
  save();
  document.getElementById('topCoins').querySelector('.val').textContent = state.coins;
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
  document.getElementById('topHearts').querySelector('.val').textContent = h.count;
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
  
  document.getElementById('topStreak').querySelector('.val').textContent = state.streak;
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
// SPEECH (Web Speech API)
// ═══════════════════════════════════════
let isListening = false;
let speechSupported = 'speechSynthesis' in window;
let recognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

function speak(text, lang = 'it-IT', rate = 1) {
  if (!speechSupported) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = rate;
  u.pitch = 1;
  
  // Try to find Italian voice
  const voices = speechSynthesis.getVoices();
  const itVoice = voices.find(v => v.lang.startsWith('it'));
  if (itVoice) u.voice = itVoice;
  
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

// Load voices
if (speechSupported) {
  speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
}

function startListening(lang, callback) {
  if (!recognitionSupported) {
    toast('🎤 דפדפן לא תומך בהקלטה', 'error');
    callback(null);
    return;
  }
  
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SR();
  recognition.lang = lang;
  recognition.interimResults = false;
  recognition.maxAlternatives = 3;
  
  recognition.onresult = (event) => {
    isListening = false;
    const results = [];
    for (let i = 0; i < event.results[0].length; i++) {
      results.push(event.results[0][i].transcript);
    }
    callback(results);
  };
  
  recognition.onerror = (event) => {
    isListening = false;
    console.warn('Speech recognition error:', event.error);
    callback(null);
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
