/* ═══════════════════════════════════════════════
   VolaLingo — Gamification Module
   Extracted from app.js — Zero behavior change
   ═══════════════════════════════════════════════ */

const Gamification = (() => {

// ═══════════════════════════════════════
// DEPENDENCIES (injected by app.js on init)
// ═══════════════════════════════════════
let _state = null;
let _save = null;
let _toast = null;
let _Events = null;
let _APP_DATA = null;

// ═══════════════════════════════════════
// CONSTANTS
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

const SHOP_ITEMS = [
  {id:'hearts_refill', name:'מילוי לבבות', icon:'❤️', desc:'5 לבבות מלאים', price:50},
  {id:'streak_freeze', name:'הקפאת רצף', icon:'🧊', desc:'שמור רצף ליום אחד', price:100},
  {id:'double_xp', name:'XP כפול', icon:'⚡', desc:'XP כפול לשעה', price:150},
];

const ACHIEVEMENTS = [
  {id:'first_word', name:'מילה ראשונה', icon:'🌱', condition:()=>_state?.wordsLearned?.length>=1},
  {id:'ten_words', name:'10 מילים', icon:'📝', condition:()=>_state?.wordsLearned?.length>=10},
  {id:'fifty_words', name:'50 מילים', icon:'📚', condition:()=>_state?.wordsLearned?.length>=50},
  {id:'hundred_words', name:'100 מילים!', icon:'🏆', condition:()=>_state?.wordsLearned?.length>=100},
  {id:'first_crown', name:'כתר ראשון', icon:'👑', condition:()=>Object.values(_state?.nodeProgress||{}).some(n=>n.crown>=1)},
  {id:'five_crowns', name:'5 כתרים', icon:'👑', condition:()=>Object.values(_state?.nodeProgress||{}).reduce((s,n)=>s+(n.crown||0),0)>=5},
  {id:'streak_3', name:'רצף 3 ימים', icon:'🔥', condition:()=>(_state?.streak||0)>=3},
  {id:'streak_7', name:'רצף שבוע!', icon:'🔥', condition:()=>(_state?.streak||0)>=7},
  {id:'streak_30', name:'רצף חודש!', icon:'💎', condition:()=>(_state?.streak||0)>=30},
  {id:'first_dialogue', name:'שיחה ראשונה', icon:'💬', condition:()=>Object.keys(_state?.dialoguesCompleted||{}).length>=1},
  {id:'singer', name:'זמר!', icon:'🎤', condition:()=>Object.keys(_state?.sentencesPracticed||{}).length>=10},
  {id:'quiz_master', name:'מלך חידונים', icon:'🧠', condition:()=>(_state?.quizHistory||[]).filter(q=>q.score>=80).length>=5},
];

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════
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

function getDaysSinceMonday() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon... 6=Sat
  const mondayOffset = day === 0 ? 6 : day - 1;
  return mondayOffset;
}

function generateBotXP(name, league, day) {
  const leagueIdx = getLeagueIndex(league);
  const tier = LEAGUE_RANKS[leagueIdx] || LEAGUE_RANKS[0];
  const baseMin = tier.botMin;
  const baseMax = tier.botMax;
  const dayFactor = (day + 1) / 7;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  const pseudoRand = ((hash % 100) + 100) / 200; // 0.5-1.0
  const baseXP = Math.floor(baseMin + (baseMax - baseMin) * pseudoRand);
  const dailyInc = (50 + (hash % 100)) * (day + 1);
  return Math.min(5000, baseXP + dailyInc);
}

// ═══════════════════════════════════════
// INIT
// ═══════════════════════════════════════
function init(dependencies) {
  _state = dependencies.state;
  _save = dependencies.save;
  _toast = dependencies.toast;
  _Events = dependencies.Events;
  _APP_DATA = dependencies.APP_DATA;
  
  // Ensure achievements exist in APP_DATA
  if (_APP_DATA) {
    _APP_DATA.achievements = ACHIEVEMENTS;
  }
  
  console.log('🎮 Gamification module initialized');
  return api;
}

// ═══════════════════════════════════════
// XP & COINS
// ═══════════════════════════════════════
function addXP(amount, source = 'unknown') {
  if (!_state) return;
  _state.xp += amount;
  _state.coins += Math.ceil(amount / 3);
  _state.leagueXP += amount;
  _save();
  _emit('xp:added', { amount, source, totalXP: _state.xp, totalCoins: _state.coins });
  _emit('state:changed', { xp: _state.xp, coins: _state.coins, leagueXP: _state.leagueXP });
}

function addCoins(amount) {
  if (!_state) return;
  _state.coins += amount;
  _save();
  _emit('coins:added', { amount, totalCoins: _state.coins });
}

function spendCoins(amount) {
  if (!_state || _state.coins < amount) return false;
  _state.coins -= amount;
  _save();
  _emit('coins:spent', { amount, totalCoins: _state.coins });
  return true;
}

function addDaily() {
  if (!_state || _state.dailyCompleted) return;
  _state.dailyCompleted = true;
  addXP(20, 'daily');
  if (_toast) _toast('✅ יומי הושלם! +20 XP', 'success');
  _emit('daily:completed', { xp: 20 });
}

// ═══════════════════════════════════════
// HEARTS
// ═══════════════════════════════════════
function getHearts() {
  if (!_state) return { count: 5, refillIn: 0 };
  const elapsed = Date.now() - _state.heartsRefill;
  const refilled = Math.floor(elapsed / (30 * 60 * 1000));
  if (refilled > 0 && _state.hearts < 5) {
    _state.hearts = Math.min(5, _state.hearts + refilled);
    _state.heartsRefill = Date.now();
    _save();
  }
  return { 
    count: _state.hearts, 
    refillIn: Math.max(0, 30 * 60 * 1000 - (Date.now() - _state.heartsRefill)) 
  };
}

function useHeart() {
  if (!_state) return false;
  const h = getHearts();
  if (h.count <= 0) {
    if (_toast) _toast('❤️ אזלו הלבבות! חכה או קנה בחנות', 'error');
    return false;
  }
  _state.hearts--;
  if (_state.hearts <= 0) _state.heartsRefill = Date.now();
  _save();
  _emit('hearts:changed', { count: _state.hearts });
  return true;
}

function refillHearts() {
  if (!_state) return;
  _state.hearts = 5;
  _state.heartsRefill = Date.now();
  _save();
  _emit('hearts:changed', { count: 5 });
}

// ═══════════════════════════════════════
// STREAK
// ═══════════════════════════════════════
function checkStreak() {
  if (!_state) return;
  const today = new Date().toISOString().slice(0, 10);
  if (_state.lastDay === today) return;
  
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (_state.lastDay === yesterday) {
    // Continue streak - no action needed
  } else if (_state.lastDay && _state.lastDay !== today) {
    // Streak broken (unless freeze)
    if (!_state.shopPurchases?.includes('streak_freeze_used_today')) {
      _state.streak = 0;
    }
  }
  
  // Increment if new day
  if (_state.lastDay !== today) {
    _state.streak++;
    _state.lastDay = today;
    _state.dailyCompleted = false;
    _state.dailyXP = 0;
    _save();
    _emit('streak:changed', { streak: _state.streak });
  }
  
  _emit('state:changed', { streak: _state.streak, dailyCompleted: _state.dailyCompleted });
}

function getStreak() {
  if (!_state) return 0;
  checkStreak();
  return _state.streak;
}

// ═══════════════════════════════════════
// LEAGUES
// ═══════════════════════════════════════
function initLeagueBotXP() {
  if (!_state) return;
  const leagueIdx = getLeagueIndex(_state.league);
  const tier = LEAGUE_RANKS[leagueIdx] || LEAGUE_RANKS[0];
  const daysSinceMonday = getDaysSinceMonday();
  _state.leagueBotXP = LEAGUE_BOT_NAMES.map(name => ({
    name,
    xp: generateBotXP(name, _state.league, daysSinceMonday)
  }));
  _save();
}

function checkLeagueReset() {
  if (!_state) return false;
  if (!_state.leagueStart) {
    _state.leagueStart = Date.now();
    _state.leagueSeason = 1;
    _save();
    return false;
  }
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const elapsed = now - _state.leagueStart;
  if (elapsed >= weekMs) {
    applyPromoRelegation();
    
    _state.leaguePositions.push({
      rank: _state.league,
      date: new Date().toISOString(),
      position: _getUserLeaguePosition()
    });
    
    _state.leagueXP = 0;
    _state.leagueSeason = (_state.leagueSeason || 0) + 1;
    _state.leagueStart = now;
    _state.leagueBotXP = null;
    _save();
    
    initLeagueBotXP();
    return true;
  }
  return false;
}

function _getUserLeaguePosition() {
  if (!_state || !_state.leagueBotXP) return 1;
  const bots = _state.leagueBotXP;
  const entries = [...bots, { name: _state.name || 'אני', xp: _state.leagueXP || 0, isMe: true }];
  entries.sort((a, b) => b.xp - a.xp);
  return entries.findIndex(e => e.isMe) + 1;
}

function applyPromoRelegation(position) {
  if (!_state) return;
  if (position === undefined) position = _getUserLeaguePosition() - 1;
  
  const leagueIdx = getLeagueIndex(_state.league);
  let newLeague = _state.league;
  
  if (position <= 2) {
    const next = getNextLeague(_state.league, 'up');
    if (next) {
      newLeague = next;
      if (_toast) _toast(`🎉 עלית לליגת ${LEAGUE_EMOJI_MAP[next] || ''} ${next}!`, 'success');
    }
  } else if (position >= 7) {
    const prev = getNextLeague(_state.league, 'down');
    if (prev) {
      newLeague = prev;
      if (_toast) _toast(`⬇️ ירדת לליגת ${LEAGUE_EMOJI_MAP[prev] || ''} ${prev}`, 'error');
    }
  }
  
  if (newLeague !== _state.league) {
    _state.league = newLeague;
    _save();
    _emit('league:changed', { league: newLeague, previousLeague: _state.league });
  }
}

function getLeagueInfo() {
  if (!_state) return null;
  checkLeagueReset();
  
  if (!_state.leagueBotXP) initLeagueBotXP();
  
  const bots = _state.leagueBotXP || [];
  const entries = [...bots, { name: _state.name || 'אני', xp: _state.leagueXP || 0, isMe: true }];
  entries.sort((a, b) => b.xp - a.xp);
  const userIndex = entries.findIndex(e => e.isMe);
  
  const leagueData = LEAGUE_RANKS[getLeagueIndex(_state.league)] || LEAGUE_RANKS[0];
  const countdown = getCountdown();
  const avgXP = Math.round(entries.reduce((s, e) => s + e.xp, 0) / entries.length);
  const maxXP = Math.max(...entries.map(e => e.xp), 1);
  
  return {
    league: _state.league,
    leagueEmoji: LEAGUE_EMOJI_MAP[_state.league],
    leagueNameEn: leagueData.nameEn,
    position: userIndex + 1,
    totalPlayers: entries.length,
    leagueXP: _state.leagueXP,
    entries: entries.map((e, i) => ({
      ...e,
      position: i + 1,
      isPromo: i < 3,
      isReleg: i >= entries.length - 2,
      xpPct: Math.round((e.xp / maxXP) * 100),
      medal: i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ''
    })),
    countdown,
    season: _state.leagueSeason,
    avgXP,
    promotionZone: 3,
    relegationZone: 2
  };
}

function getCountdown() {
  const now = new Date();
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + ((8 - now.getDay()) % 7 || 7));
  nextMonday.setHours(0, 0, 0, 0);
  if (nextMonday <= now) nextMonday.setDate(nextMonday.getDate() + 7);
  const diff = nextMonday - now;
  return {
    days: Math.floor(diff / (24 * 60 * 60 * 1000)),
    hours: Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)),
    diff
  };
}

// ═══════════════════════════════════════
// SHOP
// ═══════════════════════════════════════
function getShopItems() {
  if (!_state) return SHOP_ITEMS.map(i => ({...i, owned: false, canAfford: false}));
  return SHOP_ITEMS.map(item => ({
    ...item,
    owned: _state.shopPurchases?.includes(item.id) || false,
    canAfford: _state.coins >= item.price
  }));
}

function buyItem(id) {
  if (!_state) return false;
  const item = SHOP_ITEMS.find(i => i.id === id);
  if (!item) return false;
  if (_state.coins < item.price) {
    if (_toast) _toast('אין מספיק מטבעות!', 'error');
    return false;
  }
  _state.coins -= item.price;
  _state.shopPurchases.push(id);
  
  // Apply effects
  if (id === 'hearts_refill') {
    refillHearts();
  } else if (id === 'streak_freeze') {
    _state.shopPurchases.push('streak_freeze_used_today');
  }
  // double_xp would be handled by addXP checking a flag
  
  _save();
  if (_toast) _toast('✅ נרכש בהצלחה!', 'success');
  _emit('shop:purchase', { itemId: id, price: item.price, coins: _state.coins });
  return true;
}

// ═══════════════════════════════════════
// ACHIEVEMENTS
// ═══════════════════════════════════════
function checkAchievements() {
  if (!_state || !_APP_DATA) return [];
  let newUnlocks = [];
  (_APP_DATA.achievements || []).forEach(a => {
    if (!_state.achievements.includes(a.id) && a.condition && a.condition()) {
      _state.achievements.push(a.id);
      newUnlocks.push(a);
    }
  });
  if (newUnlocks.length > 0) {
    _save();
    newUnlocks.forEach(a => {
      if (_toast) _toast(`🏆 הישג: ${a.icon} ${a.name}`, 'success');
      addXP(25, 'achievement:' + a.id);
      _emit('achievement:unlocked', { achievement: a });
    });
  }
  return newUnlocks;
}

function getAchievements() {
  if (!_APP_DATA) return [];
  return (_APP_DATA.achievements || []).map(a => ({
    ...a,
    unlocked: _state?.achievements?.includes(a.id) || false
  }));
}

// ═══════════════════════════════════════
// WEAK WORDS
// ═══════════════════════════════════════
function trackWeakWord(word) {
  if (!_state) return;
  const existing = _state.weakWords?.find(w => w.word === word);
  if (existing) {
    existing.misses++;
    existing.lastMiss = Date.now();
  } else {
    _state.weakWords = _state.weakWords || [];
    _state.weakWords.push({ word, misses: 1, lastMiss: Date.now() });
  }
  _state.weakWords.sort((a, b) => b.misses - a.misses);
  _state.weakWords = _state.weakWords.slice(0, 30);
  _save();
  _emit('weakWords:updated', { weakWords: _state.weakWords });
}

function getWeakWords() {
  return _state?.weakWords || [];
}

// ═══════════════════════════════════════
// CORRECT WORDS
// ═══════════════════════════════════════
function addCorrectWord(wordObj) {
  if (!_state || !wordObj || !wordObj.target) return;
  const existing = _state.correctWords?.find(w => w.target === wordObj.target);
  if (existing) {
    existing.count++;
    existing.lastCorrect = Date.now();
  } else {
    _state.correctWords = _state.correctWords || [];
    _state.correctWords.push({
      target: wordObj.target,
      native: wordObj.native || '',
      count: 1,
      lastCorrect: Date.now()
    });
  }
  _save();
  _emit('correctWords:added', { word: wordObj.target });
}

function getCorrectWords() {
  const words = _state?.correctWords || [];
  return [...words].sort((a, b) => b.count - a.count);
}

// ═══════════════════════════════════════
// EVENT SYSTEM
// ═══════════════════════════════════════
function _emit(event, data) {
  if (_Events) _Events.emit(event, data);
  // Also emit on window for backward compat
  window.dispatchEvent(new CustomEvent('gamification:' + event, { detail: data }));
}

function on(event, callback) {
  if (_Events) return _Events.on('gamification:' + event, callback);
  // Fallback
  return window.addEventListener('gamification:' + event, e => callback(e.detail));
}

// ═══════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════
const api = {
  init,
  // XP & Coins
  addXP,
  addCoins,
  spendCoins,
  addDaily,
  // Hearts
  getHearts,
  useHeart,
  refillHearts,
  // Streak
  checkStreak,
  getStreak,
  // Leagues
  getLeagueInfo,
  checkLeagueReset,
  getLeagueIndex,
  getNextLeague,
  LEAGUE_RANKS,
  LEAGUE_EMOJI_MAP,
  // Shop
  getShopItems,
  buyItem,
  // Achievements
  checkAchievements,
  getAchievements,
  // Weak Words
  trackWeakWord,
  getWeakWords,
  // Correct Words
  addCorrectWord,
  getCorrectWords,
  // Events
  on,
  emit: _emit,
  // Constants
  SHOP_ITEMS,
  ACHIEVEMENTS
};

return api;

})();

// Expose globally
window.Gamification = Gamification;

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Gamification;
}