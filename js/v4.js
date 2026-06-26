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
  if (S.isPremium) return true;
  return stageId === 'A1-1';
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
    </div>
  `;
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
  pageContainer.innerHTML = html;
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
