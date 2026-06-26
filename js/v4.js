/* ═══════════════════════════════════════════════
   VolaLingo v4 — Duolingo-Style SPA
   Light theme, path view, lessons, bottom nav
   ═══════════════════════════════════════════════ */

// ═══════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════
const XP_PER_CORRECT = 10;
const XP_PER_LESSON_BONUS = 20;
const WORDS_PER_LESSON = 10;

// ═══ EMOJI MAP — for image questions ═══
const EMOJI_MAP = {
  ciao: "👋", buongiorno: "🌅", arrivederci: "👋",
  grazie: "🙏", prego: "🤝", scusi: "🙇", scusa: "🙇",
  sì: "✅", no: "❌", ok: "👌",
  uno: "1️⃣", due: "2️⃣", tre: "3️⃣", quattro: "4️⃣", cinque: "5️⃣",
  sei: "6️⃣", sette: "7️⃣", otto: "8️⃣", nove: "9️⃣", dieci: "🔟",
  rosso: "🔴", blu: "🔵", verde: "🟢", giallo: "🟡", bianco: "⚪",
  nero: "⚫", viola: "🟣", arancione: "🟠", rosa: "🩷", marrone: "🟤",
  casa: "🏠", letto: "🛏️", tavolo: "🪑", sedia: "🪑", porta: "🚪",
  finestra: "🪟", chiave: "🔑", luce: "💡", telefono: "📞",
  computer: "💻", televisione: "📺", libro: "📖", penna: "🖊️",
  orologio: "⌚", soldi: "💰", occhiali: "👓", cellulare: "📱",
  scarpe: "👟", vestito: "👗", cappotto: "🧥", borsa: "👜",
  ombrello: "☂️", macchina: "🚗", acqua: "💧", caffè: "☕",
  tè: "🫖", pane: "🍞", pasta: "🍝", pizza: "🍕", formaggio: "🧀",
  frutta: "🍎", mela: "🍎", banana: "🍌", arancia: "🍊",
  limone: "🍋", fragola: "🍓", uva: "🍇", pesca: "🍑",
  carne: "🥩", pollo: "🍗", pesce: "🐟", uovo: "🥚",
  torta: "🎂", cioccolato: "🍫", biscotto: "🍪", vino: "🍷",
  birra: "🍺", latte: "🥛", zucchero: "🍬", sale: "🧂",
  madre: "👩", padre: "👨", fratello: "👦", sorella: "👧",
  figlio: "👶", figlia: "👶", marito: "💍", moglie: "💍",
  nonno: "👴", nonna: "👵", zio: "👨", zia: "👩",
  bambino: "🧒", ragazzo: "🧑", ragazza: "👩", uomo: "👨",
  donna: "👩", amico: "🤝", famiglia: "👪",
  cane: "🐶", gatto: "🐱", uccello: "🐦", cavallo: "🐴",
  sole: "☀️", luna: "🌙", stella: "⭐", nuvola: "☁️",
  pioggia: "🌧️", neve: "❄️", vento: "💨", fuoco: "🔥",
  cuore: "❤️", fiore: "🌸", albero: "🌳", montagna: "⛰️",
  mare: "🌊", fiume: "🏞️", isola: "🏝️",
  ristorante: "🍽️", albergo: "🏨", banca: "🏦", ospedale: "🏥",
  scuola: "🏫", chiesa: "⛪", stadio: "🏟️",
  aereo: "✈️", treno: "🚂", nave: "🚢", bicicletta: "🚲",
  piazza: "🏛️", museo: "🏛️", teatro: "🎭", cinema: "🎬",
  musica: "🎵", canzone: "🎶", ballo: "💃",
  gatto: "🐱", cane: "🐶", topo: "🐭", coniglio: "🐰",
  orso: "🐻", leone: "🦁", tigre: "🐯", elefante: "🐘",
  festa: "🎉", regalo: "🎁", palloncino: "🎈", torta: "🎂",
  natale: "🎄", stella: "⭐", luna: "🌙",
  letto: "🛏️", cucina: "🍳", bagno: "🚿", specchio: "🪞",
  sapone: "🧼", spazzolino: "🪥", pettine: "🪮",
  chiave: "🔑", calendario: "📅", foto: "📸", quadro: "🖼️",
  pianta: "🌿",
  soldi: "💰", portafoglio: "👛", carta: "💳",
  mano: "✋", occhio: "👁️", naso: "👃", bocca: "👄",
  gamba: "🦵", piede: "🦶",
  gatto: "🐱", cane: "🐶",
  pane: "🍞", pizza: "🍕", pasta: "🍝",
  caffè: "☕", tè: "🫖", vino: "🍷", birra: "🍺",
  mela: "🍎", banana: "🍌", arancia: "🍊", limone: "🍋",
  fragola: "🍓", uva: "🍇", pesca: "🍑",
  casa: "🏠", strada: "🛣️", città: "🏙️",
  luna: "🌙", sole: "☀️", stella: "⭐", nuvola: "☁️",
  bambino: "👶", neonato: "👶",
  dottore: "🩺", infermiere: "💉",
  poliziotto: "👮", cuoco: "👨‍🍳", artista: "🎨",
  cantante: "🎤", attore: "🎭"
};

// ═══════════════════════════════════════
// STATE
// ═══════════════════════════════════════
let S = loadState();
let activeTab = 'home';
let inLesson = false;
let lessonWords = [];
let lessonIdx = 0;
let lessonCorrect = 0;
let lessonAnswered = false;

function defaultState() {
  return {
    name: '',
    level: 'A1',
    xp: 0,
    streak: 0,
    lastDay: '',
    wordsLearned: [],
    stageProgress: {},
    srs: {},
    onboarding: true,
    isPremium: false,
    weeklyXP: [0,0,0,0,0,0,0],
    totalPractice: 0,
    streakHistory: []
  };
}

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem('vl3_state'));
    return s ? { ...defaultState(), ...s } : defaultState();
  } catch {
    return defaultState();
  }
}

function save() {
  localStorage.setItem('vl3_state', JSON.stringify(S));
}

// ═══════════════════════════════════════
// DOM REFS
// ═══════════════════════════════════════
const $ = (id) => document.getElementById(id);
const app = $('app');
const pageContainer = $('pageContainer');
const splash = $('splash');
const onboarding = $('onboarding');
const bottomNav = $('bottomNav');
const topBar = $('topBar');

// ═══════════════════════════════════════
// STREAK & XP
// ═══════════════════════════════════════
function checkStreak() {
  const today = new Date().toISOString().slice(0, 10);
  if (S.lastDay === today) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (S.lastDay && S.lastDay !== yesterday && S.lastDay !== today) {
    S.streak = 0;
  }
  save();
}

function markTodayActive() {
  const today = new Date().toISOString().slice(0, 10);
  if (S.lastDay !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (S.lastDay === yesterday || S.streak === 0) {
      S.streak++;
    } else if (S.lastDay && S.lastDay !== yesterday) {
      S.streak = 1;
    } else {
      S.streak = 1;
    }
    S.lastDay = today;
    if (!S.streakHistory.includes(today)) {
      S.streakHistory.push(today);
      if (S.streakHistory.length > 60) S.streakHistory = S.streakHistory.slice(-60);
    }
    save();
  }
}

function addXP(amount) {
  S.xp += amount;
  const dayIdx = new Date().getDay();
  S.weeklyXP[dayIdx] = (S.weeklyXP[dayIdx] || 0) + amount;
  save();
  showXPPopup(amount);
}

function showXPPopup(amount) {
  const pop = document.createElement('div');
  pop.className = 'xp-popup';
  pop.textContent = `+${amount} ⚡`;
  document.body.appendChild(pop);
  setTimeout(() => pop.remove(), 1200);
}

function isStageFree(stageId) {
  return true; // 🔓 All stages free
}

function isStageCompleted(stageId) {
  return !!(S.stageProgress[stageId] || {}).completed;
}

function getStageXpEarned(stageId) {
  return (S.stageProgress[stageId] || {}).xpEarned || 0;
}

function markStageProgress(stageId, score, total) {
  if (!S.stageProgress[stageId]) S.stageProgress[stageId] = { completed: false, bestScore: 0, xpEarned: 0 };
  const pct = Math.round(score / total * 100);
  if (pct > (S.stageProgress[stageId].bestScore || 0)) {
    S.stageProgress[stageId].bestScore = pct;
  }
  if (pct >= 70 && !S.stageProgress[stageId].completed) {
    S.stageProgress[stageId].completed = true;
  }
  save();
}

// ═══════════════════════════════════════
// TTS
// ═══════════════════════════════════════
function speakText(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'it-IT';
  utter.rate = 0.85;
  const voices = speechSynthesis.getVoices();
  const itVoice = voices.find(v => v.lang.startsWith('it'));
  if (itVoice) utter.voice = itVoice;
  speechSynthesis.speak(utter);
}

// Preload voices
if ('speechSynthesis' in window) {
  speechSynthesis.getVoices();
  speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
}

// ═══════════════════════════════════════
// UTILITY
// ═══════════════════════════════════════
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getStageById(id) {
  return STAGES.find(s => s.id === id) || null;
}

function getStagesForLevel(level) {
  return STAGES.filter(s => s.cefr === level);
}

function toast(msg, type) {
  let t = $('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.display = 'block';
  t.style.background = type === 'error' ? '#ff4b4b' : '#333';
  setTimeout(() => { t.style.display = 'none'; }, 2500);
}

function fireConfetti() {
  let canvas = $('confettiCanvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'confettiCanvas';
    document.body.appendChild(canvas);
  }
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#58cc02', '#1cb0f6', '#ff9600', '#ff4b4b', '#ce82ff', '#ffc800'];
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 80,
      w: 5 + Math.random() * 5,
      h: 3 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 3,
      rot: Math.random() * 360,
      rv: (Math.random() - 0.5) * 10
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
      p.rot += p.rv;
      if (p.y < canvas.height + 20) alive = true;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    frame++;
    if (alive && frame < 120) requestAnimationFrame(animate);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  animate();
}

// ═══════════════════════════════════════
// RENDER TOP BAR
// ═══════════════════════════════════════
function renderTopBar(mode, lessonProgress) {
  if (!topBar) return;
  const xpLevel = Math.floor(S.xp / 100) + 1;
  const xpInLevel = S.xp % 100;

  if (mode === 'lesson') {
    topBar.innerHTML = `
      <div class="top-bar-lesson">
        <button class="back-btn" onclick="exitLesson()">✕</button>
        <div class="lesson-progress-bar">
          <div class="lesson-progress-fill" style="width:${lessonProgress || 0}%"></div>
        </div>
        <div class="lesson-progress-text">${Math.round(lessonProgress || 0)}%</div>
      </div>
    `;
    return;
  }

  topBar.innerHTML = `
    <div class="top-bar-home">
      <div class="top-bar-left">
        <div class="streak-display">
          <span class="streak-icon">🔥</span>
          <span>${S.streak}</span>
        </div>
      </div>
      <div class="top-bar-right">
        <div class="xp-display">
          <span class="xp-icon">⚡</span>
          <span>${S.xp}</span>
          <div class="xp-bar">
            <div class="xp-bar-fill" style="width:${xpInLevel}%"></div>
          </div>
        </div>
        ${S.isPremium ? '<span class="premium-badge">👑</span>' : ''}
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════
// RENDER BOTTOM NAV
// ═══════════════════════════════════════
function renderBottomNav() {
  if (!bottomNav) return;
  const tabs = [
    { id: 'home', icon: '🗺️', label: 'בית' },
    { id: 'practice', icon: '🎯', label: 'תרגול' },
    { id: 'leaderboard', icon: '🏆', label: 'דירוג' },
    { id: 'profile', icon: '👤', label: 'פרופיל' }
  ];

  bottomNav.innerHTML = `
    <div class="bottom-nav-inner">
      ${tabs.map(t => `
        <button class="nav-tab ${activeTab === t.id ? 'active' : ''}" onclick="switchTab('${t.id}')">
          <span class="tab-icon">${t.icon}</span>
          <span class="tab-label">${t.label}</span>
        </button>
      `).join('')}
    </div>
  `;
}

// ═══════════════════════════════════════
// TAB SWITCHING
// ═══════════════════════════════════════
function switchTab(tab) {
  if (inLesson) return;
  activeTab = tab;
  renderBottomNav();
  renderPage();
}

// ═══════════════════════════════════════
// RENDER PAGES
// ═══════════════════════════════════════
function renderPage() {
  renderTopBar('home');
  switch (activeTab) {
    case 'home': renderHome(); break;
    case 'practice': renderPracticeTab(); break;
    case 'leaderboard': renderLeaderboard(); break;
    case 'profile': renderProfile(); break;
  }
}

// ═══════════════════════════════════════
// HOME — PATH VIEW
// ═══════════════════════════════════════
function renderHome() {
  pageContainer.innerHTML = '';
  pageContainer.style.overflowY = 'auto';
  document.body.classList.remove('lesson-active');

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const levelIcons = { A1: '🌱', A2: '☀️', B1: '⚡', B2: '🔥', C1: '🧠', C2: '👑' };
  const levelNames = { A1: 'בסיסי', A2: 'יום-יום', B1: 'בינוני', B2: 'עליון', C1: 'מתקדם', C2: 'שליטה' };

  let html = `<div class="path-container">
    <div class="path-header">
      <h1>🗺️ מסלול הלימוד</h1>
      <p>${S.name ? S.name + ' · ' : ''}רמת ${S.level}</p>
    </div>
    <div class="path-scroll">`;

  let totalCompleted = 0;
  let firstUncompleted = null;
  let foundUncompleted = false;

  // First pass: find first uncompleted
  for (const stage of STAGES) {
    if (!isStageCompleted(stage.id)) {
      firstUncompleted = stage;
      break;
    }
  }

  let currentLevel = '';
  let completedConnectors = 0;

  for (let i = 0; i < STAGES.length; i++) {
    const stage = STAGES[i];
    const completed = isStageCompleted(stage.id);
    const isCurrent = stage.id === (firstUncompleted ? firstUncompleted.id : STAGES[0].id);
    const locked = !isStageFree(stage.id) && !completed;
    const isFree = isStageFree(stage.id);
    const pct = completed ? 100 : (S.stageProgress[stage.id] || {}).bestScore || 0;
    const xpEarned = getStageXpEarned(stage.id);

    // Level divider
    const stageLevel = stage.cefr;
    if (stageLevel !== currentLevel) {
      currentLevel = stageLevel;
      const lvlDef = LEVELS[stageLevel] || {};
      html += `<div class="level-divider">
        <div class="level-divider-line"></div>
        <div class="level-divider-label">
          <span class="lvl-icon">${levelIcons[stageLevel] || '📘'}</span>
          ${stageLevel} — ${levelNames[stageLevel] || stageLevel}
        </div>
        <div class="level-divider-line"></div>
      </div>`;
    }

    if (completed) totalCompleted++;

    const nodeClass = completed ? 'completed' : isCurrent ? 'current' : locked ? 'locked' : '';

    html += `
      <div class="stage-node" onclick="openStage('${stage.id}')">
        <div class="node-circle ${nodeClass}">
          <span class="node-number">${stage.num}</span>
          ${stage.icon || '📖'}
          ${locked ? '<span class="lock-icon">🔒</span>' : ''}
        </div>
        <div class="node-label ${nodeClass}">${stage.name}</div>
        <div class="node-sub">${stage.wordCount} מילים ${completed ? '✅' : ''}</div>
      </div>
    `;

    // Connector line between nodes (not after last)
    if (i < STAGES.length - 1) {
      const connClass = completed ? 'completed' : '';
      html += `<div class="node-connector ${connClass}"></div>`;
    }
  }

  html += `
      </div>
    </div>
  `;

  pageContainer.innerHTML = html;
}

// ═══════════════════════════════════════
// OPEN STAGE / START LESSON
// ═══════════════════════════════════════
function openStage(stageId) {
  if (inLesson) return;

  if (!isStageFree(stageId) && !isStageCompleted(stageId)) {
    showPaywall();
    return;
  }

  startLesson(stageId);
}

function startLesson(stageId) {
  const stage = getStageById(stageId);
  if (!stage) return;

  // Pick WORDS_PER_LESSON random words from the stage
  const shuffled = shuffle(stage.words);
  lessonWords = shuffled.slice(0, Math.min(WORDS_PER_LESSON, shuffled.length));
  lessonIdx = 0;
  lessonCorrect = 0;
  lessonAnswered = false;
  inLesson = true;
  document.body.classList.add('lesson-active');
  bottomNav.style.display = 'none';

  renderLesson();
}

function exitLesson() {
  inLesson = false;
  document.body.classList.remove('lesson-active');
  bottomNav.style.display = 'block';
  pageContainer.style.overflowY = 'auto';
  renderPage();
}

// ═══════════════════════════════════════
// LESSON
// ═══════════════════════════════════════
function renderLesson() {
  if (lessonIdx >= lessonWords.length) {
    renderLessonComplete();
    return;
  }

  const word = lessonWords[lessonIdx];
  const progress = (lessonIdx / lessonWords.length) * 100;
  renderTopBar('lesson', progress);
  pageContainer.style.overflowY = 'hidden';

  const isHeToIt = Math.random() > 0.5;

  // ═══ EMOJI QUESTION? ═══
  var useEmoji = false;
  var emojiIcon = '';
  if (!isHeToIt) {
    // Italian→Hebrew direction: possibly show emoji instead
    var itKey = word.it.toLowerCase().replace(/[àáâãäå]/g,'a').replace(/[èéêë]/g,'e').replace(/[ìíîï]/g,'i').replace(/[òóôõö]/g,'o').replace(/[ùúûü]/g,'u').replace(/[^a-z]/g,'');
    if (EMOJI_MAP[itKey]) {
      useEmoji = Math.random() < 0.3; // 30% chance
      emojiIcon = EMOJI_MAP[itKey];
    }
  }

  const question = isHeToIt ? (word.he || word.en) : word.it;
  const correctAnswer = isHeToIt ? word.it : (word.he || word.en);

  // Generate wrong options from other words in the same stage
  const wrongPool = lessonWords.filter(w => {
    const wrongAnswer = isHeToIt ? w.it : (w.he || w.en);
    return wrongAnswer !== correctAnswer && wrongAnswer;
  });

  // Also grab from all words if needed
  let options = [correctAnswer];
  const shuffledPool = shuffle([...wrongPool]);
  for (let i = 0; i < shuffledPool.length && options.length < 4; i++) {
    const opt = isHeToIt ? shuffledPool[i].it : (shuffledPool[i].he || shuffledPool[i].en);
    if (opt && !options.includes(opt)) options.push(opt);
  }

  // If still need more, grab from other stages
  if (options.length < 4) {
    const extra = shuffle(STAGES.flatMap(s => s.words));
    for (const w of extra) {
      const opt = isHeToIt ? w.it : (w.he || w.en);
      if (opt && !options.includes(opt)) {
        options.push(opt);
        if (options.length >= 4) break;
      }
    }
  }

  // Pad with placeholders
  while (options.length < 4) options.push('—');

  const shuffledOptions = shuffle(options);

  pageContainer.innerHTML = `
    <div class="lesson-container">
      <div class="lesson-question-area">
        ${isHeToIt ? `
          <div class="lesson-question-label">מה התרגום לאיטלקית?</div>
          <div class="lesson-word-display">${question}</div>
        ` : useEmoji ? `
          <div class="lesson-question-label">מה האיטלקית לתמונה?</div>
          <div class="lesson-emoji-display">${emojiIcon}</div>
          <button class="lesson-speak-btn" onclick="speakText('${word.it.replace(/'/g, "\\'")}')">🔊</button>
        ` : `
          <div class="lesson-question-label">מה הפירוש של המילה?</div>
          <div class="lesson-word-display">${question}</div>
          <button class="lesson-speak-btn" onclick="speakText('${word.it.replace(/'/g, "\\'")}')">🔊</button>
        `}
      </div>
      <div class="lesson-options" id="lessonOpts">
        ${shuffledOptions.map((opt, i) => `
          <button class="option-btn" onclick="answerLesson(this, '${escAttr(opt)}', '${escAttr(correctAnswer)}')" data-opt="${i}">
            ${opt}
          </button>
        `).join('')}
      </div>
      <div class="lesson-feedback" id="lessonFeedback"></div>
    </div>
  `;
}

function answerLesson(btn, selected, correct) {
  if (lessonAnswered) return;
  lessonAnswered = true;

  const opts = document.querySelectorAll('.option-btn');
  opts.forEach(o => o.classList.add('disabled'));

  const feedback = $('lessonFeedback');

  if (selected === correct) {
    btn.classList.add('correct');
    lessonCorrect++;
    feedback.innerHTML = `<div class="fb-correct">✅ נכון!</div>`;
    addXP(XP_PER_CORRECT);
    markTodayActive();
  } else {
    btn.classList.add('wrong');
    // Show correct answer
    opts.forEach(o => {
      if (o.textContent === correct) o.classList.add('reveal-correct');
    });
    feedback.innerHTML = `
      <div class="fb-wrong">❌ לא נכון</div>
      <div class="fb-correct-answer">התשובה הנכונה: ${correct}</div>
    `;
  }

  // Add "המשך" button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'lesson-next-btn';
  nextBtn.textContent = selected === correct ? 'המשך →' : 'המשך →';
  nextBtn.onclick = () => {
    lessonAnswered = false;
    lessonIdx++;
    renderLesson();
  };

  // Insert after feedback
  feedback.after(nextBtn);
}

function renderLessonComplete() {
  const total = lessonWords.length;
  const pct = Math.round(lessonCorrect / total * 100);
  const bonus = lessonCorrect === total ? XP_PER_LESSON_BONUS : 0;
  const totalXp = lessonCorrect * XP_PER_CORRECT + bonus;

  renderTopBar('lesson', 100);
  pageContainer.style.overflowY = 'hidden';

  // Get current stage ID from lesson words
  const stageId = STAGES.find(s => s.words.some(w => w.it === lessonWords[0]?.it))?.id;
  if (stageId) {
    markStageProgress(stageId, lessonCorrect, total);
  }

  markTodayActive();

  if (pct >= 70) fireConfetti();

  let icon = '🏆';
  let title = 'מצוין!';
  let sub = `ענית נכון על ${lessonCorrect} מתוך ${total}`;
  if (pct >= 90) { icon = '🌟'; title = 'מושלם!'; }
  else if (pct >= 70) { icon = '🎉'; title = 'כל הכבוד!'; }
  else if (pct >= 50) { icon = '💪'; title = 'תרגל עוד!'; }
  else { icon = '📚'; title = 'נסה שוב!'; }

  pageContainer.innerHTML = `
    <div class="lesson-complete">
      <div class="celebrate-icon">${icon}</div>
      <div class="complete-title">${title}</div>
      <div class="complete-sub">${sub}</div>
      <div class="xp-earned">
        <span class="xp-icon">⚡</span>
        <span>+${totalXp} XP</span>
      </div>
      <button class="continue-btn" onclick="exitLesson()">המשך 🗺️</button>
    </div>
  `;

  if (bonus > 0) {
    setTimeout(() => showXPPopup(`+${bonus} בונוס! 🎯`), 500);
  }
}

// ═══════════════════════════════════════
// PRACTICE TAB
// ═══════════════════════════════════════
function renderPracticeTab() {
  pageContainer.innerHTML = `
    <div class="practice-tab-container">
      <h2>🎯 תרגול מהיר</h2>
      <p>בחר סוג תרגול והתחל לחזק את המילים שלך</p>

      <div class="practice-card" onclick="startQuickPractice()">
        <div class="card-icon green">🎲</div>
        <div class="card-info">
          <div class="card-title">תרגול אקראי</div>
          <div class="card-desc">10 שאלות מכל השלבים שלמדת</div>
        </div>
        <span class="card-arrow">❮</span>
      </div>

      <div class="practice-card" onclick="startSRSReview()">
        <div class="card-icon blue">🧠</div>
        <div class="card-info">
          <div class="card-title">חזרה מרווחת</div>
          <div class="card-desc">מילים שצריכות חזרה לפי SRS</div>
        </div>
        <span class="card-arrow">❮</span>
      </div>

      <div class="practice-card" onclick="startWeakWords()">
        <div class="card-icon orange">📝</div>
        <div class="card-info">
          <div class="card-title">מילים חלשות</div>
          <div class="card-desc">מילים שטעית בהן בעבר</div>
        </div>
        <span class="card-arrow">❮</span>
      </div>

      <!-- SITUATIONS -->
      <div class="practice-card" onclick="showSituations()">
        <div class="card-icon red">🏪</div>
        <div class="card-info">
          <div class="card-title">סיטואציות יומיומיות</div>
          <div class="card-desc">מילים וביטויים למצבים אמיתיים</div>
        </div>
        <span class="card-arrow">❮</span>
      </div>

      <!-- CONVERSATIONS -->
      <div class="practice-card" onclick="showConversations()">
        <div class="card-icon purple">💬</div>
        <div class="card-info">
          <div class="card-title">שיחות</div>
          <div class="card-desc">דיאלוגים באיטלקית עם תרגום</div>
        </div>
        <span class="card-arrow">❮</span>
      </div>
    </div>
  `;
}

function startQuickPractice() {
  // Pick from words the user has learned
  const learnedWords = S.wordsLearned;
  if (learnedWords.length === 0) {
    toast('למד לפחות מילה אחת קודם!', 'error');
    return;
  }

  const pool = [];
  for (const stage of STAGES) {
    for (const w of stage.words) {
      if (learnedWords.includes(w.it) || learnedWords.includes(w.en)) {
        pool.push(w);
      }
    }
  }

  if (pool.length === 0) {
    toast('אין מילים לתרגול. למד שלב קודם!', 'error');
    return;
  }

  const shuffled = shuffle(pool);
  lessonWords = shuffled.slice(0, Math.min(WORDS_PER_LESSON, shuffled.length));
  lessonIdx = 0;
  lessonCorrect = 0;
  lessonAnswered = false;
  inLesson = true;
  document.body.classList.add('lesson-active');
  bottomNav.style.display = 'none';
  renderLesson();
}

function startSRSReview() {
  const now = Date.now();
  const dueEntries = Object.entries(S.srs).filter(([k, v]) => v.nextReview <= now && v.level < 5);
  if (dueEntries.length === 0) {
    toast('אין מילים לחזרה! 🎉', 'error');
    return;
  }

  const pool = [];
  for (const stage of STAGES) {
    for (const w of stage.words) {
      if (dueEntries.some(([k]) => k === w.it || k === w.en)) {
        pool.push(w);
        break;
      }
    }
  }

  if (pool.length === 0) {
    toast('לא נמצאו מילים לחזרה', 'error');
    return;
  }

  const shuffled = shuffle(pool);
  lessonWords = shuffled.slice(0, Math.min(WORDS_PER_LESSON, shuffled.length));
  lessonIdx = 0;
  lessonCorrect = 0;
  lessonAnswered = false;
  inLesson = true;
  document.body.classList.add('lesson-active');
  bottomNav.style.display = 'none';
  renderLesson();
}

function startWeakWords() {
  const wrongWords = Object.entries(S.srs).filter(([k, v]) => v.wrong > v.correct);
  if (wrongWords.length === 0) {
    toast('אין מילים חלשות! כל הכבוד 🎉', 'error');
    return;
  }

  const pool = [];
  for (const stage of STAGES) {
    for (const w of stage.words) {
      if (wrongWords.some(([k]) => k === w.it || k === w.en)) {
        pool.push(w);
        break;
      }
    }
  }

  if (pool.length === 0) {
    toast('לא נמצאו מילים חלשות', 'error');
    return;
  }

  const shuffled = shuffle(pool);
  lessonWords = shuffled.slice(0, Math.min(WORDS_PER_LESSON, shuffled.length));
  lessonIdx = 0;
  lessonCorrect = 0;
  lessonAnswered = false;
  inLesson = true;
  document.body.classList.add('lesson-active');
  bottomNav.style.display = 'none';
  renderLesson();
}

// ═══════════════════════════════════════
// LEADERBOARD
// ═══════════════════════════════════════
function renderLeaderboard() {
  pageContainer.innerHTML = `
    <div class="leaderboard-container">
      <h2>🏆 לוח מובילים</h2>
      <p class="lb-sub">תחרות ידידותית — מי ילמד הכי הרבה?</p>

      <div class="lb-card">
        <div class="lb-icon">👑</div>
        <div class="lb-title">${S.name || 'את/ה'} 🥇</div>
        <div class="lb-desc">⚡ ${S.xp} XP · רצף ${S.streak} ימים</div>
      </div>

      <div class="lb-card" style="opacity:0.7">
        <div class="lb-icon">🌍</div>
        <div class="lb-title">משתמשים אחרים</div>
        <div class="lb-desc">הלוח המובילים יהיה זמין בגרסה הבאה!</div>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════
function renderProfile() {
  const totalWords = S.wordsLearned.length;
  const totalSRS = Object.keys(S.srs).length;
  const mastered = Object.values(S.srs).filter(v => v.level >= 5).length;
  const levelNames = { A1: 'מתחילים', A2: 'בסיסי', B1: 'בינוני', B2: 'בינוני-גבוה', C1: 'מתקדם', C2: 'שליטה מלאה' };
  const completedStages = STAGES.filter(s => isStageCompleted(s.id)).length;
  const days = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

  // Streak calendar (last 28 days)
  const today = new Date();
  let calHtml = '';
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    const isActive = S.streakHistory.includes(ds);
    const isToday = i === 0;
    calHtml += `<div class="streak-dot ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}">${d.getDate()}</div>`;
  }

  // Weekly XP chart
  const maxXp = Math.max(...S.weeklyXP, 1);
  let chartHtml = '';
  S.weeklyXP.forEach((xp, i) => {
    const h = Math.max(4, Math.round(xp / maxXp * 44));
    chartHtml += `<div class="xp-week-bar">
      <div class="bar" style="height:${h}px"></div>
      <div class="day-label">${days[i]}</div>
    </div>`;
  });

  pageContainer.innerHTML = `
    <div class="profile-container">
      <div class="profile-header">
        <div class="profile-avatar">🇮🇹</div>
        <div class="profile-name">${S.name || 'Studente'}</div>
        <div class="profile-level-badge">רמת ${S.level}</div>
        <div class="profile-stats">
          <div class="profile-stat">
            <div class="stat-val" style="color:var(--orange)">🔥${S.streak}</div>
            <div class="stat-lbl">רצף</div>
          </div>
          <div class="profile-stat">
            <div class="stat-val" style="color:var(--green)">⚡${S.xp}</div>
            <div class="stat-lbl">XP</div>
          </div>
          <div class="profile-stat">
            <div class="stat-val" style="color:var(--blue)">📚${totalWords}</div>
            <div class="stat-lbl">מילים</div>
          </div>
        </div>
      </div>

      <div class="profile-section">
        <div class="section-title">📊 סטטיסטיקות</div>
        <div style="display:flex;justify-content:space-around;text-align:center">
          <div><div style="font-size:20px;font-weight:800">${completedStages}</div><div style="font-size:11px;color:var(--text2)">שלבים</div></div>
          <div><div style="font-size:20px;font-weight:800">${totalSRS}</div><div style="font-size:11px;color:var(--text2)">ב-SRS</div></div>
          <div><div style="font-size:20px;font-weight:800;color:var(--green)">${mastered}</div><div style="font-size:11px;color:var(--text2)">שולט</div></div>
        </div>
      </div>

      <div class="profile-section">
        <div class="section-title">🔥 רצף יומי — 28 ימים</div>
        <div class="streak-calendar">${calHtml}</div>
      </div>

      <div class="profile-section">
        <div class="section-title">⚡ XP שבועי</div>
        <div class="xp-week-chart">${chartHtml}</div>
      </div>

      ${!S.isPremium ? `
        <button class="profile-premium-btn" onclick="showPaywall()">👑 שדרג ל-Premium — רק ${PREMIUM_PRICE}</button>
      ` : `
        <div style="text-align:center;padding:16px;background:#fff;border-radius:var(--radius);box-shadow:var(--shadow)">
          <span style="font-size:24px">👑</span>
          <div style="font-weight:800;font-size:16px;margin-top:4px">משתמש Premium</div>
        </div>
      `}

      <!-- ═══ ADMIN PANEL ═══ -->
      <div class="profile-section" style="margin-top:20px;border:2px solid #ff960040;background:#fff8f0">
        <div class="section-title" style="color:var(--orange)">🛠️ פאנל אדמין</div>

        <div style="font-size:13px;color:#666;margin-bottom:12px">משתמש נוכחי: <strong>${escHtml(S.name || 'לא הוזן')}</strong></div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;color:#555;margin-bottom:12px;direction:ltr">
          <div>רמה: <strong>${S.level}</strong></div>
          <div>XP: <strong>${S.xp}</strong></div>
          <div>רצף: <strong>${S.streak} ימים</strong></div>
          <div>שלבים הושלמו: <strong>${completedStages}/${STAGES.length}</strong></div>
          <div>מילים ב-SRS: <strong>${totalSRS}</strong></div>
          <div>שולט: <strong>${mastered}</strong></div>
          <div>Premium: <strong>${S.isPremium ? '✅' : '❌'}</strong></div>
          <div>Onboarding: <strong>${S.onboarding ? '❌ לא' : '✅ הושלם'}</strong></div>
        </div>

        <!-- Stage breakdown by level -->
        <div style="font-weight:700;font-size:13px;margin:8px 0 4px">התקדמות לפי רמה:</div>
        <div style="font-size:12px;color:#555">
          ${['A1','A2','B1','B2','C1','C2'].map(function(lvl) {
            var total = STAGES.filter(function(s) { return s.cefr === lvl; }).length;
            var done = STAGES.filter(function(s) { return s.cefr === lvl && isStageCompleted(s.id); }).length;
            var pct = total > 0 ? Math.round(done/total*100) : 0;
            var barWidth = pct;
            return '<div style="margin-bottom:4px">' +
              '<div style="display:flex;justify-content:space-between;margin-bottom:2px">' +
                '<span>' + lvl + '</span>' +
                '<span>' + done + '/' + total + ' (' + pct + '%)</span>' +
              '</div>' +
              '<div style="background:#eee;border-radius:4px;height:6px;overflow:hidden">' +
                '<div style="background:#58cc02;height:100%;width:' + barWidth + '%;border-radius:4px;transition:width 0.3s"></div>' +
              '</div>' +
            '</div>';
          }).join('')}
        </div>

        <!-- Recent activity -->
        <div style="font-weight:700;font-size:13px;margin:12px 0 4px">פעילות אחרונה:</div>
        <div style="font-size:12px;color:#555">
          <div>נוצר: <strong>${S.lastDay ? S.lastDay : 'עדיין לא'}</strong></div>
          <div>יומן XP שבועי: <strong>[${S.weeklyXP.join(', ')}]</strong></div>
          <div>היסטוריית רצף: <strong>${(S.streakHistory || []).length} ימים</strong></div>
        </div>

        <!-- Copy data for backup -->
        <button class="profile-premium-btn" onclick="copyUserData()" style="background:var(--blue);margin-top:12px">📋 העתק נתוני משתמש</button>
      </div>
    </div>
  `;
}

function copyUserData() {
  var data = {
    name: S.name,
    level: S.level,
    xp: S.xp,
    streak: S.streak,
    lastDay: S.lastDay,
    completedStages: STAGES.filter(function(s) { return isStageCompleted(s.id); }).length,
    totalStages: STAGES.length,
    srsCount: Object.keys(S.srs).length,
    weeklyXP: S.weeklyXP,
    streakHistory: S.streakHistory,
    exportedAt: new Date().toISOString()
  };
  var text = JSON.stringify(data, null, 2);
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function() {
      toast('📋 נתונים הועתקו!', 'ok');
    }).catch(function() {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); toast('📋 הועתק!', 'ok'); } catch(e) { toast('❌ לא הצליח להעתיק', 'error'); }
  document.body.removeChild(ta);
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ═══════════════════════════════════════
// PAYWALL
// ═══════════════════════════════════════
function showPaywall() {
  if (S.isPremium) return;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card">
      <button class="modal-close" onclick="closePaywall()">✕</button>
      <div class="paywall-icon">👑</div>
      <div class="paywall-title">VolaLingo Premium</div>
      <div class="paywall-desc">גישה לכל 10,000 המילים!</div>
      <div class="paywall-features">
        <div class="paywall-feature"><span class="check">✅</span> 10,000 מילים במקום 50</div>
        <div class="paywall-feature"><span class="check">✅</span> כל השלבים A1 עד C2</div>
        <div class="paywall-feature"><span class="check">✅</span> חזרה מרווחת מתקדמת</div>
        <div class="paywall-feature"><span class="check">✅</span> תרגול מילים חלשות</div>
        <div class="paywall-feature"><span class="check">✅</span> ללא פרסומות</div>
      </div>
      <div class="paywall-price">
        <span class="amount">${PREMIUM_PRICE}</span>
      </div>
      <a href="${PAYPAL_URL}" target="_blank" class="paywall-btn">שדרג עכשיו 💎</a>
      <div class="paywall-hint">אחרי התשלום, הזן: ?activate=premium</div>
    </div>
  `;
  overlay.id = 'paywallOverlay';
  overlay.onclick = (e) => { if (e.target === overlay) closePaywall(); };
  document.body.appendChild(overlay);
}

function closePaywall() {
  const el = $('paywallOverlay');
  if (el) el.remove();
}

// ═══════════════════════════════════════
// ONBOARDING
// ═══════════════════════════════════════
function selectOnbLevel(lvl) {
  document.querySelectorAll('.onb-lvl').forEach(b => b.classList.toggle('active', b.dataset.level === lvl));
}

function finishOnboarding() {
  const name = ($('onbName')?.value || '').trim() || 'Studente';
  const lvlEl = document.querySelector('.onb-lvl.active');
  S.name = name;
  S.level = lvlEl ? lvlEl.dataset.level : 'A1';
  S.onboarding = false;
  save();
  onboarding.style.display = 'none';
  showApp();
}

// ═══════════════════════════════════════
// APP INIT
// ═══════════════════════════════════════
function showApp() {
  app.style.display = 'flex';
  renderBottomNav();
  checkStreak();
  renderPage();
}

// ═══════════════════════════════════════
// INIT
// ═══════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  // Premium activation via URL
  const params = new URLSearchParams(location.search);
  if (params.get('activate') === 'premium') {
    S.isPremium = true;
    save();
    history.replaceState({}, '', location.pathname);
  }

  // Splash animation
  setTimeout(() => {
    const bar = document.querySelector('.splash-bar');
    if (bar) bar.style.width = '100%';
  }, 100);

  setTimeout(() => {
    if (splash) {
      splash.style.opacity = '0';
      setTimeout(() => {
        splash.style.display = 'none';
        if (S.name && !S.onboarding) {
          showApp();
        } else {
          onboarding.style.display = 'block';
        }
      }, 400);
    }
  }, 1800);
});

// ═══════════════════════════════════════
// ESCAPE ATTRIBUTE HELPER
// ═══════════════════════════════════════
function escAttr(str) {
  return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// ═══════════════════════════════════════
// SITUATIONS
// ═══════════════════════════════════════
function showSituations() {
  activeTab = 'practice';
  renderBottomNav();
  renderTopBar('home');
  pageContainer.style.overflowY = 'auto';
  document.body.classList.remove('lesson-active');

  var html = '<div class="practice-tab-container">' +
    '<h2>🏪 סיטואציות יומיומיות</h2>' +
    '<p>למד מילים וביטויים שימושיים למצבים אמיתיים</p>';

  for (var i = 0; i < SITUATIONS.length; i++) {
    var s = SITUATIONS[i];
    html += '<div class="practice-card" onclick="openSituation(\'' + s.id + '\')">' +
      '<div class="card-icon" style="background:' + s.color + '20;color:' + s.color + '">' + s.icon + '</div>' +
      '<div class="card-info">' +
        '<div class="card-title">' + s.name + '</div>' +
        '<div class="card-desc">' + (s.words ? s.words.length : 0) + ' מילים · ' + (s.phrases ? s.phrases.length : 0) + ' משפטים</div>' +
      '</div>' +
      '<span class="card-arrow">❮</span>' +
    '</div>';
  }

  html += '</div>';
  pageContainer.innerHTML = html;
}

function openSituation(id) {
  var sit = SITUATIONS.find(function(s) { return s.id === id; });
  if (!sit) return;

  renderTopBar('home');
  pageContainer.style.overflowY = 'auto';

  var html = '<div class="practice-tab-container">' +
    '<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">' +
      '<button class="back-btn" onclick="showSituations()" style="background:none;border:none;font-size:24px;cursor:pointer;padding:0">❯</button>' +
      '<h2 style="margin:0">' + sit.icon + ' ' + sit.name + '</h2>' +
    '</div>';

  // Vocabulary section
  html += '<div class="profile-section" style="margin-top:16px">' +
    '<div class="section-title">📖 מילים שימושיות</div>';

  for (var i = 0; i < sit.words.length; i++) {
    var w = sit.words[i];
    html += '<div class="situation-word-card" style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#fff;border-radius:12px;margin-bottom:6px;box-shadow:0 1px 3px rgba(0,0,0,0.06);direction:ltr">' +
      '<div style="display:flex;align-items:center;gap:8px">' +
        '<button class="lesson-speak-btn" onclick="speakText(\'' + escAttr(w.it) + '\')">🔊</button>' +
        '<span style="font-weight:700;font-size:17px;color:#333">' + w.it + '</span>' +
      '</div>' +
      '<span style="color:#888;font-size:15px">' + (w.he || '') + '</span>' +
    '</div>';
  }

  html += '</div>';

  // Phrases section
  if (sit.phrases && sit.phrases.length > 0) {
    html += '<div class="profile-section" style="margin-top:16px">' +
      '<div class="section-title">💬 משפטים שימושיים</div>';

    for (var i = 0; i < sit.phrases.length; i++) {
      var p = sit.phrases[i];
      html += '<div class="phrase-card" style="padding:12px 14px;background:#fff;border-radius:12px;margin-bottom:8px;box-shadow:0 1px 3px rgba(0,0,0,0.06);direction:ltr">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
          '<button class="lesson-speak-btn" onclick="speakText(\'' + escAttr(p.it) + '\')">🔊</button>' +
          '<span style="font-weight:700;font-size:17px;color:#333">' + p.it + '</span>' +
        '</div>' +
        '<div style="color:#888;font-size:14px;padding-right:36px">' + (p.he || '') + '</div>' +
      '</div>';
    }

    html += '</div>';
  }

  html += '</div>';
  pageContainer.innerHTML = html;
}

// ═══════════════════════════════════════
// CONVERSATIONS
// ═══════════════════════════════════════
function showConversations() {
  activeTab = 'practice';
  renderBottomNav();
  renderTopBar('home');
  pageContainer.style.overflowY = 'auto';
  document.body.classList.remove('lesson-active');

  var html = '<div class="practice-tab-container">' +
    '<h2>💬 שיחות</h2>' +
    '<p>דיאלוגים קצרים באיטלקית עם תרגום לעברית</p>';

  for (var i = 0; i < CONVERSATIONS.length; i++) {
    var c = CONVERSATIONS[i];
    html += '<div class="practice-card" onclick="openConversation(\'' + c.id + '\')">' +
      '<div class="card-icon" style="background:#ce82ff20;color:#ce82ff">' + c.icon + '</div>' +
      '<div class="card-info">' +
        '<div class="card-title">' + c.name + '</div>' +
        '<div class="card-desc">' + c.lines.length + ' שורות</div>' +
      '</div>' +
      '<span class="card-arrow">❮</span>' +
    '</div>';
  }

  html += '</div>';
  pageContainer.innerHTML = html;
}

function openConversation(id) {
  var conv = CONVERSATIONS.find(function(c) { return c.id === id; });
  if (!conv) return;

  renderTopBar('home');
  pageContainer.style.overflowY = 'auto';

  var html = '<div class="practice-tab-container">' +
    '<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">' +
      '<button class="back-btn" onclick="showConversations()" style="background:none;border:none;font-size:24px;cursor:pointer;padding:0">❯</button>' +
      '<h2 style="margin:0">' + conv.icon + ' ' + conv.name + '</h2>' +
    '</div>';

  for (var i = 0; i < conv.lines.length; i++) {
    var line = conv.lines[i];
    var isA = line.speaker === 'A';
    var align = isA ? 'flex-start' : 'flex-end';
    var bg = isA ? '#f0f7ff' : '#f0fdf4';
    var borderColor = isA ? '#1cb0f6' : '#58cc02';
    var speakerLabel = isA ? '👤 א' : '👤 ב';

    html += '<div style="display:flex;flex-direction:column;align-items:' + align + ';margin-bottom:8px">' +
      '<div style="font-size:12px;color:#888;margin-bottom:2px;padding:0 4px">' + speakerLabel + '</div>' +
      '<div style="background:' + bg + ';border-right:3px solid ' + borderColor + ';border-radius:12px;padding:10px 14px;max-width:85%;box-shadow:0 1px 2px rgba(0,0,0,0.05);direction:ltr">' +
        '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">' +
          '<button class="lesson-speak-btn" onclick="speakText(\'' + escAttr(line.it) + '\')" style="font-size:14px;width:28px;height:28px">🔊</button>' +
          '<span style="font-weight:700;font-size:16px;color:#333">' + line.it + '</span>' +
        '</div>' +
        '<div style="color:#888;font-size:14px">' + line.he + '</div>' +
      '</div>' +
    '</div>';
  }

  html += '</div>';

  // Practice button
  html += '<div style="text-align:center;margin:20px 0 30px">' +
    '<button class="paywall-btn" onclick="startConversationPractice(\'' + conv.id + '\')" style="background:linear-gradient(135deg,#58cc02,#46a302);font-size:18px;padding:14px 32px">' +
      '🎭 תרגל את השיחה</button>' +
    '<p style="font-size:13px;color:#999;margin-top:8px">תתאמן על השיחה — אתה מדבר, האפליקציה עונה</p>' +
  '</div>';

  html += '</div>';
  pageContainer.innerHTML = html;
}

// ═══════════════════════════════════════
// CONVERSATION PRACTICE
// ═══════════════════════════════════════
var convPractice = null;

function startConversationPractice(id) {
  var conv = CONVERSATIONS.find(function(c) { return c.id === id; });
  if (!conv) return;

  // State
  convPractice = {
    conv: conv,
    role: 'A', // default
    step: 0,
    score: 0,
    total: 0,
    answered: false
  };

  renderTopBar('home');
  pageContainer.style.overflowY = 'hidden';

  // Role picker
  var userLines = conv.lines.filter(function(l) { return l.speaker === 'A'; });
  var botLines = conv.lines.filter(function(l) { return l.speaker === 'B'; });

  pageContainer.innerHTML = '' +
    '<div class="practice-tab-container" style="text-align:center">' +
      '<h2>🎭 ' + conv.icon + ' ' + conv.name + '</h2>' +
      '<p style="margin-bottom:20px">בחר איזה צד אתה רוצה לשחק:</p>' +

      '<div class="practice-card" onclick="selectConvRole(\'' + conv.id + '\',\'A\')" style="cursor:pointer;text-align:right">' +
        '<div class="card-icon" style="background:#1cb0f620;color:#1cb0f6">👤</div>' +
        '<div class="card-info">' +
          '<div class="card-title">דובר א (' + userLines.length + ' משפטים)</div>' +
          '<div class="card-desc">אתה מתחיל את השיחה</div>' +
        '</div>' +
        '<span class="card-arrow">❮</span>' +
      '</div>' +

      '<div class="practice-card" onclick="selectConvRole(\'' + conv.id + '\',\'B\')" style="cursor:pointer;text-align:right">' +
        '<div class="card-icon" style="background:#58cc0220;color:#58cc02">👤</div>' +
        '<div class="card-info">' +
          '<div class="card-title">דובר ב (' + botLines.length + ' משפטים)</div>' +
          '<div class="card-desc">האפליקציה מתחילה, אתה עונה</div>' +
        '</div>' +
        '<span class="card-arrow">❮</span>' +
      '</div>' +
    '</div>';
}

function selectConvRole(id, role) {
  convPractice.role = role;
  convPractice.step = 0;
  convPractice.score = 0;
  convPractice.total = 0;
  convPractice.answered = false;

  // Find lines where user speaks
  var userLines = [];
  for (var i = 0; i < convPractice.conv.lines.length; i++) {
    if (convPractice.conv.lines[i].speaker === role) {
      userLines.push(i);
    }
  }
  convPractice.userLineIndices = userLines;
  convPractice.total = userLines.length;

  conversationPracticeStep();
}

function conversationPracticeStep() {
  var cp = convPractice;
  if (!cp) return;

  // If done
  if (cp.step >= cp.total) {
    var pct = cp.total > 0 ? Math.round(cp.score / cp.total * 100) : 0;
    var icon = pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '📚';
    var title = pct >= 80 ? 'מצוין!' : pct >= 50 ? 'כמעט!' : 'תרגל עוד';

    renderTopBar('home');
    pageContainer.style.overflowY = 'hidden';

    pageContainer.innerHTML = '' +
      '<div class="lesson-complete">' +
        '<div class="celebrate-icon">' + icon + '</div>' +
        '<div class="complete-title">' + title + '</div>' +
        '<div class="complete-sub">ענית נכון על ' + cp.score + ' מתוך ' + cp.total + '</div>' +
        '<div class="xp-earned"><span class="xp-icon">⚡</span><span>+' + (cp.score * 10) + ' XP</span></div>' +
        '<button class="continue-btn" onclick="exitConversationPractice()">סיים 🗺️</button>' +
        '<button class="continue-btn" onclick="startConversationPractice(\'' + cp.conv.id + '\')" style="background:var(--green);margin-top:8px">🔄 תרגל שוב</button>' +
      '</div>';

    if (cp.score > 0) addXP(cp.score * 10);
    return;
  }

  var lineIdx = cp.userLineIndices[cp.step];
  var userLine = cp.conv.lines[lineIdx];

  // Find the bot line before this (context)
  var contextLines = [];
  var startIdx = Math.max(0, lineIdx - 3);
  for (var i = startIdx; i < lineIdx; i++) {
    contextLines.push(cp.conv.lines[i]);
  }

  renderTopBar('home');
  pageContainer.style.overflowY = 'hidden';

  var html = '<div class="lesson-container">' +
    '<div style="padding:16px;max-width:480px;margin:0 auto;width:100%;box-sizing:border-box">';

  // Context bubbles
  for (var i = 0; i < contextLines.length; i++) {
    var cl = contextLines[i];
    var isA = cl.speaker === 'A';
    var align = isA ? 'flex-start' : 'flex-end';
    var bg = isA ? '#f0f7ff' : '#f0fdf4';
    html += '<div style="display:flex;flex-direction:column;align-items:' + align + ';margin-bottom:6px">' +
      '<div style="background:' + bg + ';border-radius:12px;padding:8px 12px;max-width:80%;direction:ltr;font-size:14px;color:#555">' +
        '<span style="font-size:12px;color:#888;display:block;margin-bottom:2px">' + (isA ? '👤 א' : '👤 ב') + '</span>' +
        cl.it +
      '</div>' +
    '</div>';
  }

  // Prompt for user
  html += '' +
    '<div style="margin:16px 0 8px;text-align:center">' +
      '<div style="font-size:14px;font-weight:700;color:var(--green);margin-bottom:4px">🎯 תורך לדבר!</div>' +
      '<div style="font-size:13px;color:#999">' + (userLine.he || '') + '</div>' +
    '</div>' +

    '<div style="display:flex;gap:8px;flex-direction:column">' +
      '<input id="convInput" type="text" placeholder="הקלד באיטלקית..." style="direction:ltr;text-align:left;width:100%;padding:12px 14px;font-size:16px;border:2px solid #e0e0e0;border-radius:12px;outline:none;box-sizing:border-box;font-family:Nunito,sans-serif" onkeydown="if(event.key===\'Enter\')checkConvAnswer()" autocomplete="off" autocapitalize="off" spellcheck="false">' +
      '<button class="paywall-btn" onclick="checkConvAnswer()" style="background:var(--green);padding:12px;font-size:16px">בדוק →</button>' +
    '</div>' +

    '<div id="convFeedback" style="margin-top:12px"></div>' +
  '</div></div>';

  pageContainer.innerHTML = html;

  // Focus input
  setTimeout(function() {
    var inp = document.getElementById('convInput');
    if (inp) inp.focus();
  }, 300);
}

function checkConvAnswer() {
  if (convPractice.answered) return;
  convPractice.answered = true;

  var input = document.getElementById('convInput');
  var userAnswer = input ? normalizeText(input.value) : '';
  var lineIdx = convPractice.userLineIndices[convPractice.step];
  var expected = normalizeText(convPractice.conv.lines[lineIdx].it);

  var feedback = document.getElementById('convFeedback');
  if (!feedback) return;

  var isCorrect = false;
  if (userAnswer === expected) {
    isCorrect = true;
  } else {
    // Check word overlap
    var userWords = userAnswer.split(/\\s+/).filter(Boolean);
    var expWords = expected.split(/\\s+/).filter(Boolean);
    var matchCount = 0;
    for (var i = 0; i < userWords.length; i++) {
      if (expWords.indexOf(userWords[i]) !== -1) matchCount++;
    }
    var overlap = expWords.length > 0 ? matchCount / expWords.length : 0;
    isCorrect = overlap >= 0.6 || userAnswer === expected;
  }

  if (isCorrect) {
    convPractice.score++;
    feedback.innerHTML = '<div class="fb-correct">✅ נכון! (' + convPractice.conv.lines[lineIdx].it + ')</div>';
    addXP(10);
  } else {
    feedback.innerHTML = '' +
      '<div class="fb-wrong">❌ לא נכון</div>' +
      '<div class="fb-correct-answer">התשובה הנכונה: ' + convPractice.conv.lines[lineIdx].it + '</div>';
  }

  // Next button
  var nextBtn = document.createElement('button');
  nextBtn.className = 'lesson-next-btn';
  nextBtn.textContent = convPractice.step + 1 >= convPractice.total ? 'סיים ✅' : 'המשך →';
  nextBtn.style.marginTop = '12px';
  nextBtn.onclick = function() {
    convPractice.step++;
    convPractice.answered = false;
    conversationPracticeStep();
  };
  feedback.after(nextBtn);

  input.disabled = true;
}

function exitConversationPractice() {
  convPractice = null;
  showConversations();
}

function normalizeText(s) {
  return String(s).toLowerCase().trim()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[^a-z0-9\\s]/g, '')
    .replace(/\\s+/g, ' ')
    .trim();
}

// ═══════════════════════════════════════
// EXPOSE GLOBALLY
// ═══════════════════════════════════════
window.switchTab = switchTab;
window.openStage = openStage;
window.exitLesson = exitLesson;
window.answerLesson = answerLesson;
window.speakText = speakText;
window.selectOnbLevel = selectOnbLevel;
window.finishOnboarding = finishOnboarding;
window.showPaywall = showPaywall;
window.closePaywall = closePaywall;
window.startQuickPractice = startQuickPractice;
window.startSRSReview = startSRSReview;
window.startWeakWords = startWeakWords;
window.showSituations = showSituations;
window.openSituation = openSituation;
window.showConversations = showConversations;
window.openConversation = openConversation;
window.startConversationPractice = startConversationPractice;
window.selectConvRole = selectConvRole;
window.checkConvAnswer = checkConvAnswer;
window.exitConversationPractice = exitConversationPractice;
window.copyUserData = copyUserData;
