/* ═══════════════════════════════════════════════
   VolaLingo v3 — Full App Engine
   State, Navigation, Skill Tree, Flashcards,
   Practice, Speak, Simulate, SRS, XP, Streak,
   Paywall, TTS, Confetti
   ═══════════════════════════════════════════════ */

// ═══════════════════════════════════════
// STATE
// ═══════════════════════════════════════
const WORDS_PER_STAGE = 50;
const XP_PER_WORD = 10;
const XP_PER_PRACTICE = 15;
const XP_PER_SPEAK = 20;
const XP_PER_SIM = 25;
const SRS_INTERVALS = [0, 1, 3, 7, 14, 30]; // minutes for SRS (simplified: 1min=1day scaled)

let S = loadState();
let currentPage = 'tree';
let currentStage = null;
let currentMode = null;
let fcIndex = 0;
let fcFlipped = false;
let practiceQueue = [];
let practiceIdx = 0;
let practiceScore = 0;
let speakWord = null;
let simIdx = 0;
let simCorrect = 0;

function defaultState() {
  return {
    name: '',
    level: 'A1',
    xp: 0,
    streak: 0,
    lastDay: '',
    wordsLearned: [],   // word keys
    stageProgress: {},  // stageId -> { completed, bestScore }
    srs: {},            // wordKey -> { level, nextReview, correct, wrong }
    onboarding: true,
    isPremium: false,
    dailyCompleted: false,
    weeklyXP: [0,0,0,0,0,0,0],  // last 7 days
    totalPractice: 0,
    totalSpeak: 0,
    streakHistory: []  // array of date strings
  };
}

function loadState() {
  try { const s = JSON.parse(localStorage.getItem('vl3_state')); return s ? { ...defaultState(), ...s } : defaultState(); }
  catch { return defaultState(); }
}
function save() { localStorage.setItem('vl3_state', JSON.stringify(S)); }

// ═══════════════════════════════════════
// INIT
// ═══════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  // Premium activation
  const params = new URLSearchParams(location.search);
  if (params.get('activate') === 'premium') {
    S.isPremium = true;
    save();
    history.replaceState({}, '', location.pathname);
  }

  // Splash
  setTimeout(() => {
    document.getElementById('splashBar').style.width = '100%';
  }, 100);

  setTimeout(() => {
    const splash = document.getElementById('splash');
    splash.style.opacity = '0';
    setTimeout(() => {
      splash.style.display = 'none';
      if (S.name && !S.onboarding) {
        showApp();
      } else {
        document.getElementById('onboarding').style.display = 'block';
      }
    }, 400);
  }, 1800);

  // Sidebar overlay
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  overlay.id = 'sidebarOverlay';
  overlay.onclick = () => toggleSidebar(false);
  document.body.appendChild(overlay);

  // Register SW
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
});

// ═══════════════════════════════════════
// ONBOARDING
// ═══════════════════════════════════════
function selectOnbLevel(lvl) {
  document.querySelectorAll('.onb-lvl').forEach(b => b.classList.toggle('active', b.dataset.level === lvl));
}

function finishOnboarding() {
  const name = document.getElementById('onbName').value.trim() || 'Studente';
  const lvlEl = document.querySelector('.onb-lvl.active');
  S.name = name;
  S.level = lvlEl ? lvlEl.dataset.level : 'A1';
  S.onboarding = false;
  save();
  document.getElementById('onboarding').style.display = 'none';
  showApp();
}

// ═══════════════════════════════════════
// APP SHELL
// ═══════════════════════════════════════
function showApp() {
  document.getElementById('app').style.display = 'block';
  updateTopBar();
  updateSidebar();
  checkStreak();
  navigate('tree');
}

function toggleSidebar(forceState) {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const isOpen = sidebar.classList.contains('open');
  const shouldOpen = forceState !== undefined ? forceState : !isOpen;
  sidebar.classList.toggle('open', shouldOpen);
  overlay.classList.toggle('show', shouldOpen);
  document.getElementById('app').classList.toggle('sidebar-open', shouldOpen);
  // On desktop, no need to close
  if (window.innerWidth < 768) {
    document.getElementById('sidebarCloseBtn').style.display = shouldOpen ? 'block' : 'none';
  }
}

function updateTopBar() {
  document.getElementById('topStreak').textContent = S.streak;
  document.getElementById('topXP').textContent = S.xp;
  document.getElementById('sideStreak').textContent = S.streak;
  document.getElementById('sideXP').textContent = S.xp;
  document.getElementById('sidebarName').textContent = S.name || 'Studente';
  document.getElementById('sidebarLevel').textContent = S.level;
  document.getElementById('premiumBadge').style.display = S.isPremium ? 'flex' : 'none';
  document.getElementById('sidebarPremiumBtn').classList.toggle('hidden', S.isPremium);
}

function updateSidebar() {
  updateTopBar();
}

// ═══════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════
function navigate(page) {
  currentPage = page;
  // Update nav items
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.page === page);
  });

  const titles = {
    tree: '🗺️ מסלול', learn: '🃏 כרטיסיות', practice: '🎯 תרגול',
    speak: '🎙️ הקראה', simulate: '💬 סימולציה',
    srs: '🧠 חזרה מרווחת', stats: '📊 סטטיסטיקות'
  };
  document.getElementById('pageTitle').textContent = titles[page] || '';
  
  renderPage();
  toggleSidebar(false);
  document.getElementById('pageContainer').scrollTop = 0;
}

function renderPage() {
  const c = document.getElementById('pageContainer');
  switch (currentPage) {
    case 'tree': renderTree(c); break;
    case 'learn': renderLearn(c); break;
    case 'practice': renderPractice(c); break;
    case 'speak': renderSpeak(c); break;
    case 'simulate': renderSimulate(c); break;
    case 'srs': renderSRS(c); break;
    case 'stats': renderStats(c); break;
    default: renderTree(c);
  }
}

// ═══════════════════════════════════════
// STREAK & XP
// ═══════════════════════════════════════
function checkStreak() {
  const today = new Date().toISOString().slice(0, 10);
  if (S.lastDay === today) return; // Already active today
  
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (S.lastDay === yesterday) {
    // Continue streak
  } else if (S.lastDay && S.lastDay !== today) {
    // Streak broken
    S.streak = 0;
  }
  save();
}

function addXP(amount) {
  S.xp += amount;
  const dayIdx = new Date().getDay();
  S.weeklyXP[dayIdx] = (S.weeklyXP[dayIdx] || 0) + amount;
  save();
  updateTopBar();
  showXPPop(amount);
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
    updateTopBar();
  }
}

function showXPPop(amount) {
  const pop = document.createElement('div');
  pop.className = 'xp-pop';
  pop.textContent = `+${amount} XP ⚡`;
  document.body.appendChild(pop);
  setTimeout(() => pop.remove(), 1300);
}

// ═══════════════════════════════════════
// PAYWALL
// ═══════════════════════════════════════
function isStageLocked(stageId) {
  if (S.isPremium) return false;
  // Only first A1 stage is free
  return stageId !== 'A1_1';
}

function showPaywall() {
  document.getElementById('paywallModal').style.display = 'flex';
}
function closePaywall() {
  document.getElementById('paywallModal').style.display = 'none';
}

// ═══════════════════════════════════════
// SKILL TREE
// ═══════════════════════════════════════
function renderTree(container) {
  const levels = VLL_LEVELS;
  const flagMap = { A1: '🌱', A2: '🌿', B1: '🌳', B2: '🏔️', C1: '⭐', C2: '👑' };
  
  let html = '';
  levels.forEach(level => {
    const levelStages = level.stages;
    const completedInLevel = levelStages.filter(s => (S.stageProgress[s.id] || {}).completed).length;
    const pct = levelStages.length ? Math.round(completedInLevel / levelStages.length * 100) : 0;
    const isCurrentLevel = level.id === S.level;
    
    html += `<div class="level-section">
      <div class="level-header" onclick="toggleLevel('${level.id}')">
        <div class="level-header-left">
          <span class="level-flag">${flagMap[level.id] || '📘'}</span>
          <div class="level-info">
            <h2>${level.id} — ${level.nameHe}</h2>
            <span>${level.totalWords} מילים · ${levelStages.length} שלבים</span>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:.75rem;color:var(--text3)">${pct}%</span>
          <div class="level-progress-bar"><div class="level-progress-fill" style="width:${pct}%"></div></div>
        </div>
      </div>
      <div class="stages-grid" id="stages-${level.id}" style="display:${isCurrentLevel ? 'grid' : 'none'}">`;
    
    levelStages.forEach((stage, i) => {
      const prog = S.stageProgress[stage.id] || {};
      const isCompleted = prog.completed;
      const isCurrent = !isCompleted && isFirstUncompleted(level.id, i);
      const locked = isStageLocked(stage.id);
      const cls = isCompleted ? 'completed' : isCurrent ? 'current' : locked ? 'locked premium-lock' : '';
      
      html += `<div class="stage-node ${cls}" onclick="openStage('${stage.id}')">
        <span class="stage-num">${i + 1}</span>
        <span class="stage-label">${stage.name}</span>
      </div>`;
    });
    
    html += `</div></div>`;
  });
  
  container.innerHTML = html;
}

function isFirstUncompleted(levelId, stageIndex) {
  const level = VLL_LEVELS.find(l => l.id === levelId);
  if (!level) return false;
  for (let i = 0; i <= stageIndex; i++) {
    if (!(S.stageProgress[level.stages[i].id] || {}).completed) {
      return i === stageIndex;
    }
  }
  return false;
}

function toggleLevel(levelId) {
  const el = document.getElementById('stages-' + levelId);
  if (el) el.style.display = el.style.display === 'none' ? 'grid' : 'none';
}

function openStage(stageId) {
  if (isStageLocked(stageId)) {
    showPaywall();
    return;
  }
  currentStage = stageId;
  renderStageDetail();
}

function renderStageDetail() {
  const c = document.getElementById('pageContainer');
  const level = VLL_LEVELS.find(l => l.stages.some(s => s.id === currentStage));
  const stage = level.stages.find(s => s.id === currentStage);
  if (!stage) { navigate('tree'); return; }

  const prog = S.stageProgress[currentStage] || {};
  const wordCount = stage.words.length;
  const hasHebrewCount = stage.words.filter(w => (VLL_WORDS[w] || {}).he).length;

  let wordsHtml = '';
  stage.words.slice(0, 20).forEach(wk => {
    const w = VLL_WORDS[wk] || {};
    wordsHtml += `<span class="word-chip ${w.he ? 'has-he' : 'no-he'}">${w.it || wk}</span>`;
  });
  if (wordCount > 20) wordsHtml += `<span class="word-chip">+${wordCount - 20} עוד</span>`;

  c.innerHTML = `<div class="stage-detail">
    <div class="stage-header-bar">
      <button class="stage-back" onclick="navigate('tree')">→</button>
      <div class="stage-title">
        <h2>${level.id} שלב ${stage.num} — ${stage.name}</h2>
        <span>${wordCount} מילים · ${hasHebrewCount} עם תרגום</span>
      </div>
    </div>
    <div class="mode-cards">
      <div class="mode-card" onclick="startMode('learn')">
        <div class="mode-emoji">🃏</div>
        <div class="mode-name">למד</div>
        <div class="mode-sub">כרטיסיות עם הקראה</div>
      </div>
      <div class="mode-card" onclick="startMode('practice')">
        <div class="mode-emoji">🎯</div>
        <div class="mode-name">תרגל</div>
        <div class="mode-sub">בחירה מרובה</div>
      </div>
      <div class="mode-card" onclick="startMode('speak')">
        <div class="mode-emoji">🎙️</div>
        <div class="mode-name">דבר</div>
        <div class="mode-sub">הקראה וזיהוי</div>
      </div>
      <div class="mode-card" onclick="startMode('simulate')">
        <div class="mode-emoji">💬</div>
        <div class="mode-name">סימולציה</div>
        <div class="mode-sub">תרחיש חיי יומיום</div>
      </div>
    </div>
    <div class="words-preview">
      <div class="words-preview-title">מילים בשלב זה</div>
      ${wordsHtml}
    </div>
  </div>`;
}

function startMode(mode) {
  currentMode = mode;
  fcIndex = 0;
  fcFlipped = false;
  practiceIdx = 0;
  practiceScore = 0;
  simIdx = 0;
  simCorrect = 0;
  
  const c = document.getElementById('pageContainer');
  switch (mode) {
    case 'learn': renderLearnMode(c); break;
    case 'practice': initPractice(c); break;
    case 'speak': renderSpeakMode(c); break;
    case 'simulate': renderSimMode(c); break;
  }
}

// ═══════════════════════════════════════
// FLASHCARDS (LEARN MODE)
// ═══════════════════════════════════════
function renderLearnMode(container) {
  const stage = getStage(currentStage);
  if (!stage) { navigate('tree'); return; }
  
  const words = stage.words.map(k => VLL_WORDS[k]).filter(Boolean);
  const word = words[fcIndex];
  if (!word) return;

  const hasHebrew = !!word.he;
  const catNames = { grammar: 'דקדוק', pronouns: 'כינויים', adverbs: 'תוארי פועל', verbs: 'פעלים', adjectives: 'תוארים', general: 'כללי' };
  const mnemonic = generateMnemonic(word);

  container.innerHTML = `<div class="flashcard-area">
    <div class="back-row">
      <button class="back-btn" onclick="renderStageDetail()">→</button>
      <span class="back-text">חזרה לשלב</span>
    </div>
    <div class="flashcard-counter">${fcIndex + 1} / ${words.length}</div>
    <div class="flashcard ${fcFlipped ? 'flipped' : ''}" onclick="flipCard()">
      <div class="flashcard-inner">
        <div class="flashcard-face flashcard-front">
          <div class="fc-cat">${catNames[word.cat] || word.cat}</div>
          <div class="fc-italian">${word.it}</div>
          <button class="fc-play" onclick="event.stopPropagation(); speakText('${word.it}')" title="השמע">🔊</button>
          <div style="color:var(--text3);font-size:.8rem;margin-top:12px">לחץ לתרגום</div>
        </div>
        <div class="flashcard-face flashcard-back">
          <div class="fc-hebrew">${hasHebrew ? word.he : word.en || 'עדיין לא מתורגם'}</div>
          <div class="fc-english">${word.en ? word.en : ''}</div>
          ${mnemonic ? `<div class="fc-hint">💡 ${mnemonic}</div>` : ''}
        </div>
      </div>
    </div>
    ${fcFlipped ? `<div class="fc-nav">
      <button class="fc-btn fc-btn-didnt" onclick="rateWord(false)">❌ לא ידעתי</button>
      <button class="fc-btn fc-btn-knew" onclick="rateWord(true)">✅ ידעתי!</button>
    </div>` : ''}
  </div>`;
}

function flipCard() {
  fcFlipped = !fcFlipped;
  renderLearnMode(document.getElementById('pageContainer'));
}

function rateWord(knew) {
  const stage = getStage(currentStage);
  const words = stage.words.map(k => VLL_WORDS[k]).filter(Boolean);
  const word = words[fcIndex];
  if (!word) return;
  
  // Update SRS
  const key = word.it;
  if (!S.srs[key]) S.srs[key] = { level: 0, nextReview: 0, correct: 0, wrong: 0 };
  
  if (knew) {
    S.srs[key].level = Math.min(S.srs[key].level + 1, 5);
    S.srs[key].correct++;
    addXP(XP_PER_WORD);
    markTodayActive();
    if (!S.wordsLearned.includes(key)) S.wordsLearned.push(key);
  } else {
    S.srs[key].level = Math.max(S.srs[key].level - 1, 0);
    S.srs[key].wrong++;
  }
  S.srs[key].nextReview = Date.now() + SRS_INTERVALS[S.srs[key].level] * 60000;
  save();

  // Check if stage completed
  if (knew && !S.wordsLearned.includes(word.it)) {
    S.wordsLearned.push(word.it);
  }
  
  // Check stage progress
  const stageWords = stage.words;
  const learnedInStage = stageWords.filter(w => S.wordsLearned.includes(w)).length;
  if (learnedInStage >= stageWords.length) {
    if (!S.stageProgress[currentStage]) S.stageProgress[currentStage] = {};
    S.stageProgress[currentStage].completed = true;
    save();
    toast('🎉 השלב הושלם!', 'success');
    fireConfetti();
  }

  fcFlipped = false;
  fcIndex++;
  if (fcIndex >= words.length) {
    fcIndex = 0;
    toast('✨ סבב הושלם! מתחיל מחדש', 'success');
  }
  renderLearnMode(document.getElementById('pageContainer'));
}

// ═══════════════════════════════════════
// PRACTICE (Multiple Choice)
// ═══════════════════════════════════════
function renderPractice(container) {
  // If no stage selected, show SRS practice
  container.innerHTML = `<div class="empty-state">
    <div class="empty-icon">🎯</div>
    <div class="empty-text">בחר שלב מהמסלול כדי לתרגל<br>או השתמש בחזרה מרווחת</div>
  </div>`;
}

function initPractice(container) {
  const stage = getStage(currentStage);
  if (!stage) return;
  
  practiceQueue = stage.words.map(k => VLL_WORDS[k]).filter(w => w.he || w.en);
  if (practiceQueue.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">🎯</div><div class="empty-text">אין מילים מתורגמות בשלב זה עדיין</div></div>`;
    return;
  }
  // Shuffle
  practiceQueue = shuffle([...practiceQueue]);
  practiceIdx = 0;
  practiceScore = 0;
  renderPracticeQuestion(container);
}

function renderPracticeQuestion(container) {
  if (practiceIdx >= practiceQueue.length) {
    // Summary
    const pct = Math.round(practiceScore / practiceQueue.length * 100);
    if (pct >= 70) {
      if (!S.stageProgress[currentStage]) S.stageProgress[currentStage] = {};
      S.stageProgress[currentStage].bestScore = Math.max(S.stageProgress[currentStage].bestScore || 0, pct);
      if (pct >= 90) S.stageProgress[currentStage].completed = true;
      save();
      if (pct >= 90) fireConfetti();
    }
    addXP(practiceScore * XP_PER_PRACTICE);
    markTodayActive();
    S.totalPractice = (S.totalPractice || 0) + 1;
    save();
    
    container.innerHTML = `<div style="text-align:center;padding:40px 0">
      <div style="font-size:3rem;margin-bottom:16px">${pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : '💪'}</div>
      <div style="font-size:1.5rem;font-weight:800;color:var(--text)"> ${practiceScore} / ${practiceQueue.length}</div>
      <div style="color:var(--text3);margin:8px 0 20px">${pct}% נכונות</div>
      <button class="fc-btn fc-btn-next" onclick="renderStageDetail()" style="padding:12px 32px;border-radius:12px">חזרה לשלב</button>
    </div>`;
    return;
  }

  const word = practiceQueue[practiceIdx];
  const isHeToIt = Math.random() > 0.5;
  const question = isHeToIt ? (word.he || word.en) : word.it;
  const correctAnswer = isHeToIt ? word.it : (word.he || word.en);
  const qLang = isHeToIt ? 'he' : 'it';
  
  // Generate wrong options
  const options = [correctAnswer];
  const allWords = Object.values(VLL_WORDS).filter(w => w.he || w.en);
  const otherWords = allWords.filter(w => w.it !== word.it);
  const shuffled = shuffle([...otherWords]);
  for (let i = 0; i < 3 && i < shuffled.length; i++) {
    const opt = isHeToIt ? shuffled[i].it : (shuffled[i].he || shuffled[i].en);
    if (opt && opt !== correctAnswer) options.push(opt);
  }
  // Ensure 4 options
  while (options.length < 4) options.push('—');
  const shuffledOptions = shuffle(options);

  container.innerHTML = `<div class="practice-area">
    <div class="back-row">
      <button class="back-btn" onclick="renderStageDetail()">→</button>
      <span class="back-text">חזרה לשלב</span>
    </div>
    <div class="practice-progress"><div class="practice-progress-fill" style="width:${practiceIdx / practiceQueue.length * 100}%"></div></div>
    <div class="practice-question" style="font-family:${qLang === 'it' ? 'var(--font-it)' : 'var(--font-he)'}">${question}</div>
    <button class="practice-play" onclick="speakText('${word.it}')" title="השמע">🔊</button>
    <div class="practice-prompt">${isHeToIt ? 'מה התרגום לאיטלקית?' : 'מה התרגום לעברית?'}</div>
    <div class="practice-options" id="practiceOpts">
      ${shuffledOptions.map((opt, i) => `<button class="practice-option" onclick="checkPractice(this, '${escAttr(opt)}', '${escAttr(correctAnswer)}')">${opt}</button>`).join('')}
    </div>
    <div class="practice-feedback" id="practiceFeedback"></div>
  </div>`;
}

function checkPractice(btn, selected, correct) {
  const opts = document.querySelectorAll('.practice-option');
  opts.forEach(o => o.disabled = true);
  
  if (selected === correct) {
    btn.classList.add('correct');
    practiceScore++;
    document.getElementById('practiceFeedback').innerHTML = '<span style="color:var(--green)">✅ נכון!</span>';
  } else {
    btn.classList.add('wrong');
    opts.forEach(o => { if (o.textContent === correct) o.classList.add('correct'); });
    document.getElementById('practiceFeedback').innerHTML = `<span style="color:var(--red)">❌ התשובה: ${correct}</span>`;
  }
  
  setTimeout(() => {
    practiceIdx++;
    renderPracticeQuestion(document.getElementById('pageContainer'));
  }, 1200);
}

// ═══════════════════════════════════════
// SPEAK MODE
// ═══════════════════════════════════════
function renderSpeak(container) {
  container.innerHTML = `<div class="empty-state">
    <div class="empty-icon">🎙️</div>
    <div class="empty-text">בחר שלב מהמסלול כדי לתרגל הקראה</div>
  </div>`;
}

function renderSpeakMode(container) {
  const stage = getStage(currentStage);
  if (!stage) return;
  
  const words = stage.words.map(k => VLL_WORDS[k]).filter(w => w.he || w.en);
  if (words.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">🎙️</div><div class="empty-text">אין מילים מתורגמות להקראה</div></div>`;
    return;
  }
  
  speakWord = words[fcIndex % words.length];
  
  container.innerHTML = `<div class="speak-area">
    <div class="back-row">
      <button class="back-btn" onclick="renderStageDetail()">→</button>
      <span class="back-text">חזרה לשלב</span>
    </div>
    <div class="flashcard-counter">${(fcIndex % words.length) + 1} / ${words.length}</div>
    <div class="speak-word">${speakWord.it}</div>
    <div class="speak-meaning">${speakWord.he || speakWord.en || ''}</div>
    <button class="speak-big-btn" id="speakBtn" onclick="startSpeechRecognition()">🎙️</button>
    <div class="speak-status" id="speakStatus">לחץ ואמור את המילה באיטלקית</div>
    <div class="speak-result" id="speakResult"></div>
    <div class="speak-accuracy" id="speakAccuracy"></div>
    <div style="display:flex;gap:12px;margin-top:8px">
      <button class="fc-btn fc-btn-next" onclick="speakNextWord()" style="font-size:.8rem">הבא ➡️</button>
      <button class="fc-play" onclick="speakText('${speakWord.it}')" style="width:44px;height:44px;font-size:1rem">🔊</button>
    </div>
  </div>`;
}

function speakNextWord() {
  const stage = getStage(currentStage);
  const words = stage.words.map(k => VLL_WORDS[k]).filter(w => w.he || w.en);
  fcIndex = (fcIndex + 1) % words.length;
  renderSpeakMode(document.getElementById('pageContainer'));
}

function startSpeechRecognition() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    toast('הדפדפן לא תומך בזיהוי דיבור', 'error');
    return;
  }
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'it-IT';
  recognition.continuous = false;
  recognition.interimResults = false;
  
  const btn = document.getElementById('speakBtn');
  const status = document.getElementById('speakStatus');
  const result = document.getElementById('speakResult');
  const accuracy = document.getElementById('speakAccuracy');
  
  btn.classList.add('listening');
  status.textContent = '...מקשיב';
  
  recognition.onresult = (event) => {
    const spoken = event.results[0][0].transcript.toLowerCase().trim();
    const expected = speakWord.it.toLowerCase().trim();
    const match = spoken === expected || spoken.includes(expected) || expected.includes(spoken);
    const sim = similarity(spoken, expected);
    
    result.textContent = `"${spoken}"`;
    result.style.color = match || sim > 0.7 ? 'var(--green)' : 'var(--red)';
    accuracy.textContent = match ? '✅ מושלם!' : sim > 0.7 ? `🎯 קרוב! (${Math.round(sim*100)}%)` : `❌ נסה שוב`;
    accuracy.style.color = match ? 'var(--green)' : sim > 0.7 ? 'var(--orange)' : 'var(--red)';
    
    status.textContent = '';
    btn.classList.remove('listening');
    
    if (match || sim > 0.7) {
      addXP(XP_PER_SPEAK);
      markTodayActive();
      S.totalSpeak = (S.totalSpeak || 0) + 1;
      save();
    }
  };
  
  recognition.onerror = () => {
    btn.classList.remove('listening');
    status.textContent = 'שגיאה — נסה שוב';
  };
  
  recognition.onend = () => {
    btn.classList.remove('listening');
  };
  
  recognition.start();
  setTimeout(() => { try { recognition.stop(); } catch(e){} }, 5000);
}

// ═══════════════════════════════════════
// SIMULATE (Daily life scenarios)
// ═══════════════════════════════════════
function renderSimulate(container) {
  container.innerHTML = `<div class="empty-state">
    <div class="empty-icon">💬</div>
    <div class="empty-text">בחר שלב מהמסלול לסימולציה</div>
  </div>`;
}

function renderSimMode(container) {
  const stage = getStage(currentStage);
  if (!stage) return;
  
  const scenarios = generateScenarios(stage);
  if (scenarios.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">💬</div><div class="empty-text">אין תרחישים זמינים</div></div>`;
    return;
  }
  
  renderSimScenario(container, scenarios[simIdx % scenarios.length], scenarios);
}

function renderSimScenario(container, scenario, scenarios) {
  container.innerHTML = `<div class="sim-area">
    <div class="back-row">
      <button class="back-btn" onclick="renderStageDetail()">→</button>
      <span class="back-text">חזרה לשלב</span>
    </div>
    <div class="sim-scenario">
      <div class="sim-title">${scenario.icon} ${scenario.title}</div>
      <div class="sim-desc">${scenario.desc}</div>
      ${scenario.dialogue.map(d => `<div class="sim-bubble ${d.lang}">
        <div class="sim-bubble-label">${d.lang === 'it' ? '🇮🇹' : '🇮🇱'}</div>
        <div class="sim-bubble-text">${d.text}</div>
      </div>`).join('')}
    </div>
    <div style="margin-top:12px;color:var(--text3);font-size:.85rem;text-align:center">מה תגיד עכשיו?</div>
    <div class="sim-options" id="simOpts">
      ${scenario.options.map((opt, i) => `<button class="sim-option" onclick="checkSim(this, ${i}, ${scenario.correct})">${opt}</button>`).join('')}
    </div>
    <div style="text-align:center;margin-top:12px">
      <button class="fc-btn fc-btn-next" onclick="simNext()" style="font-size:.8rem">תרחיש הבא ➡️</button>
    </div>
  </div>`;
}

function checkSim(btn, idx, correct) {
  const opts = document.querySelectorAll('.sim-option');
  opts.forEach(o => o.onclick = null);
  if (idx === correct) {
    btn.classList.add('correct');
    simCorrect++;
    addXP(XP_PER_SIM);
    markTodayActive();
  } else {
    btn.classList.add('wrong');
    opts[correct].classList.add('correct');
  }
}

function simNext() {
  simIdx++;
  const stage = getStage(currentStage);
  const scenarios = generateScenarios(stage);
  renderSimScenario(document.getElementById('pageContainer'), scenarios[simIdx % scenarios.length], scenarios);
}

function generateScenarios(stage) {
  const words = stage.words.map(k => VLL_WORDS[k]).filter(w => w.he || w.en);
  if (words.length < 4) return [];
  
  const templates = [
    {
      icon: '☕', title: 'בבית קפה', desc: 'אתה מזמין קפה באיטליה',
      gen: (w) => {
        const w1 = w[0] || {}, w2 = w[1] || {}, w3 = w[2] || {}, w4 = w[3] || {};
        return {
          dialogue: [
            { lang: 'it', text: `Buongiorno! Un ${w1.it} per favore.` },
            { lang: 'he', text: `בוקר טוב! ${w1.he || w1.en || w1.it} אחד בבקשה.` },
            { lang: 'it', text: `Subito! Vuoi anche ${w2.it}?` },
            { lang: 'he', text: `מיד! תרצה גם ${w2.he || w2.en || w2.it}?` }
          ],
          options: [
            `Sì, grazie! ${w3.it} anche.`,
            `No, solo ${w4.it}.`,
            `Va bene, ${w2.it} per favore.`,
            `Non capisco.`
          ],
          correct: 2
        };
      }
    },
    {
      icon: '🏪', title: 'בחנות', desc: 'אתה קונה בסופרמרקט',
      gen: (w) => {
        const w1 = w[0] || {}, w2 = w[1] || {}, w3 = w[2] || {};
        return {
          dialogue: [
            { lang: 'it', text: `Cerco ${w1.it}.` },
            { lang: 'he', text: `אני מחפש ${w1.he || w1.en || w1.it}.` },
            { lang: 'it', text: `È laggiù, vicino a ${w2.it}.` },
            { lang: 'he', text: `זה שם, ליד ${w2.he || w2.en || w2.it}.` }
          ],
          options: [
            `Grazie! Dov'è ${w3.it}?`,
            `Quanto costa ${w1.it}?`,
            `Non voglio ${w2.it}.`,
            `Scusi, non parlo italiano.`
          ],
          correct: 1
        };
      }
    },
    {
      icon: '👋', title: 'פגישה חדשה', desc: 'מציגים את עצמכם',
      gen: (w) => {
        const w1 = w[0] || {}, w2 = w[1] || {}, w3 = w[2] || {};
        return {
          dialogue: [
            { lang: 'it', text: `Ciao! Mi chiamo ${w1.it}.` },
            { lang: 'he', text: `תודה! קוראים לי ${w1.he || w1.en || w1.it}.` },
            { lang: 'it', text: `Piacere! Io sono ${w2.it}.` },
            { lang: 'he', text: `נעים! אני ${w2.he || w2.en || w2.it}.` }
          ],
          options: [
            `Piacere, ${w3.it}!`,
            `Non mi piace ${w1.it}.`,
            `Addio!`,
            `Non parlo italiano.`
          ],
          correct: 0
        };
      }
    }
  ];
  
  return templates.map(t => ({ ...t, ...t.gen(shuffle([...words])) }));
}

// ═══════════════════════════════════════
// SPACED REPETITION (SRS)
// ═══════════════════════════════════════
function renderSRS(container) {
  const now = Date.now();
  const dueWords = Object.entries(S.srs)
    .filter(([k, v]) => v.nextReview <= now && v.level < 5)
    .sort((a, b) => a[1].nextReview - b[1].nextReview);
  
  const totalLearning = Object.keys(S.srs).length;
  const mastered = Object.values(S.srs).filter(v => v.level >= 5).length;
  const due = dueWords.length;
  
  let html = `<div class="srs-area">
    <div class="srs-summary">
      <div class="srs-stat"><div class="srs-stat-val">${totalLearning}</div><div class="srs-stat-label">בלמידה</div></div>
      <div class="srs-stat"><div class="srs-stat-val" style="color:var(--green)">${mastered}</div><div class="srs-stat-label">שולט</div></div>
      <div class="srs-stat"><div class="srs-stat-val" style="color:var(--orange)">${due}</div><div class="srs-stat-label">לחזרה</div></div>
    </div>`;
  
  if (dueWords.length === 0) {
    html += `<div class="srs-empty">
      <div style="font-size:3rem;margin-bottom:12px">${totalLearning === 0 ? '🧠' : '✅'}</div>
      <div>${totalLearning === 0 ? 'התחל ללמוד כרטיסיות כדי לראות מילים כאן' : 'אין מילים לחזרה עכשיו! חזור מאוחר יותר'}</div>
    </div>`;
  } else {
    html += `<div style="margin-bottom:12px"><button class="fc-btn fc-btn-next" onclick="startSRSReview()" style="width:100%;padding:14px;font-size:1rem">🧠 התחל חזרה (${due} מילים)</button></div>`;
    dueWords.slice(0, 20).forEach(([key, val]) => {
      const w = VLL_WORDS[key] || {};
      html += `<div class="srs-card">
        <div><div class="srs-card-word">${w.it || key}</div><div class="srs-card-heb">${w.he || w.en || ''}</div></div>
        <div class="srs-card-due">רמה ${val.level} · ${val.correct}✅ ${val.wrong}❌</div>
      </div>`;
    });
  }
  
  html += '</div>';
  container.innerHTML = html;
}

function startSRSReview() {
  const now = Date.now();
  const dueWords = Object.entries(S.srs)
    .filter(([k, v]) => v.nextReview <= now && v.level < 5)
    .map(([k]) => VLL_WORDS[k])
    .filter(Boolean);
  
  if (dueWords.length === 0) { toast('אין מילים לחזרה!', 'success'); return; }
  
  // Set up flashcard mode with SRS words
  currentStage = '__srs__';
  currentMode = 'srs-learn';
  fcIndex = 0;
  fcFlipped = false;
  
  // Temporarily override getStage for SRS
  renderSRSFlashcard(dueWords);
}

function renderSRSFlashcard(words) {
  const c = document.getElementById('pageContainer');
  if (fcIndex >= words.length) {
    toast('🎉 חזרה הושלמה!', 'success');
    navigate('srs');
    return;
  }
  
  const word = words[fcIndex];
  const mnemonic = generateMnemonic(word);
  
  c.innerHTML = `<div class="flashcard-area">
    <div class="back-row">
      <button class="back-btn" onclick="navigate('srs')">→</button>
      <span class="back-text">חזרה</span>
    </div>
    <div class="flashcard-counter">🧠 חזרה מרווחת ${fcIndex + 1} / ${words.length}</div>
    <div class="flashcard ${fcFlipped ? 'flipped' : ''}" onclick="flipSRSCard()">
      <div class="flashcard-inner">
        <div class="flashcard-face flashcard-front">
          <div class="fc-cat">🧠 SRS</div>
          <div class="fc-italian">${word.it}</div>
          <button class="fc-play" onclick="event.stopPropagation(); speakText('${word.it}')">🔊</button>
          <div style="color:var(--text3);font-size:.8rem;margin-top:12px">לחץ לתרגום</div>
        </div>
        <div class="flashcard-face flashcard-back">
          <div class="fc-hebrew">${word.he || word.en || ''}</div>
          <div class="fc-english">${word.en || ''}</div>
          ${mnemonic ? `<div class="fc-hint">💡 ${mnemonic}</div>` : ''}
        </div>
      </div>
    </div>
    ${fcFlipped ? `<div class="fc-nav">
      <button class="fc-btn fc-btn-didnt" onclick="rateSRSWord(false, _srsWords)">❌ לא ידעתי</button>
      <button class="fc-btn fc-btn-knew" onclick="rateSRSWord(true, _srsWords)">✅ ידעתי!</button>
    </div>` : ''}
  </div>`;
  
  window._srsWords = words;
}

function flipSRSCard() {
  fcFlipped = !fcFlipped;
  renderSRSFlashcard(window._srsWords);
}

function rateSRSWord(knew, words) {
  const word = words[fcIndex];
  if (!word) return;
  
  const key = word.it;
  if (S.srs[key]) {
    if (knew) {
      S.srs[key].level = Math.min(S.srs[key].level + 1, 5);
      S.srs[key].correct++;
      addXP(XP_PER_WORD);
    } else {
      S.srs[key].level = Math.max(S.srs[key].level - 1, 0);
      S.srs[key].wrong++;
    }
    S.srs[key].nextReview = Date.now() + SRS_INTERVALS[S.srs[key].level] * 60000;
    save();
  }
  markTodayActive();
  
  fcFlipped = false;
  fcIndex++;
  renderSRSFlashcard(words);
}

// ═══════════════════════════════════════
// STATS
// ═══════════════════════════════════════
function renderStats(container) {
  const totalWords = S.wordsLearned.length;
  const totalSRS = Object.keys(S.srs).length;
  const mastered = Object.values(S.srs).filter(v => v.level >= 5).length;
  const streak = S.streak;
  
  const levelNames = { A1: 'מתחילים', A2: 'בסיסי', B1: 'בינוני', B2: 'בינוני-גבוה', C1: 'מתקדם', C2: 'שליטה מלאה' };
  const nextXP = (Math.floor(S.xp / 100) + 1) * 100;
  const levelProgress = ((S.xp % 100) / 100) * 100;
  
  // Streak calendar
  const today = new Date();
  let calHtml = '';
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    const isActive = S.streakHistory.includes(ds);
    const isToday = i === 0;
    calHtml += `<div class="streak-dot ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}"></div>`;
  }
  
  container.innerHTML = `<div class="stats-area">
    <div class="stats-hero">
      <div class="stats-hero-name">${S.name || 'Studente'} 👋</div>
      <div class="stats-hero-sub">${levelNames[S.level] || S.level} · רמה ${S.level}</div>
      <div class="stats-hero-row">
        <div class="stats-hero-item"><div class="stats-hero-val" style="color:var(--orange)">🔥 ${streak}</div><div class="stats-hero-label">רצף</div></div>
        <div class="stats-hero-item"><div class="stats-hero-val" style="color:var(--accent)">⚡ ${S.xp}</div><div class="stats-hero-label">XP</div></div>
        <div class="stats-hero-item"><div class="stats-hero-val" style="color:var(--green)">📚 ${totalWords}</div><div class="stats-hero-label">מילים</div></div>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card-val">${totalSRS}</div>
        <div class="stat-card-label">ב-SRS</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-val" style="color:var(--green)">${mastered}</div>
        <div class="stat-card-label">שולט (5⭐)</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-val">${S.totalPractice || 0}</div>
        <div class="stat-card-label">תרגולים</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-val">${S.totalSpeak || 0}</div>
        <div class="stat-card-label">הקראות</div>
      </div>
    </div>
    <div class="streak-calendar">
      <div class="streak-calendar-title">🔥 לוח רצף (28 ימים)</div>
      <div class="streak-dots">${calHtml}</div>
    </div>
    <div style="background:var(--surface);border-radius:var(--radius);padding:16px;margin-bottom:16px">
      <div style="font-weight:700;font-size:.9rem;margin-bottom:8px">⚡ XP שבועי</div>
      <div style="display:flex;align-items:flex-end;gap:6px;height:80px">
        ${S.weeklyXP.map((xp, i) => {
          const max = Math.max(...S.weeklyXP, 1);
          const h = Math.round(xp / max * 60);
          const days = ['א','ב','ג','ד','ה','ו','ש'];
          return `<div style="flex:1;text-align:center">
            <div style="height:${h}px;background:var(--accent);border-radius:4px 4px 0 0;margin:0 auto;width:80%;max-width:28px"></div>
            <div style="font-size:.6rem;color:var(--text3);margin-top:4px">${days[i]}</div>
          </div>`;
        }).join('')}
      </div>
    </div>
    ${!S.isPremium ? `<button onclick="showPaywall()" class="premium-btn" style="width:100%;margin-top:8px">👑 שדרג ל-Premium — ₪29/חודש</button>` : ''}
  </div>`;
}

// ═══════════════════════════════════════
// TTS (Text-to-Speech)
// ═══════════════════════════════════════
function speakText(text) {
  if (!('speechSynthesis' in window)) {
    // Fallback: no TTS available
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'it-IT';
  utter.rate = 0.85;
  utter.pitch = 1;
  
  // Try to find Italian voice
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
// MNEMONICS
// ═══════════════════════════════════════
function generateMnemonic(word) {
  if (!word.he && !word.en) return '';
  const it = word.it.toLowerCase();
  const heb = word.he || '';
  
  // Simple association hints based on word sounds
  const hints = {
    'casa': 'בית — קאזה, כמו "קזינו" = בית',
    'amico': 'חבר — אמיקו, כמו "אמיקו" = ידיד',
    'tempo': 'זמן — טמפו, כמו קצב מוזיקלי',
    'vita': 'חיים — ויטה, כמו "ויטמין" = כוח חיים',
    'donna': 'אישה — דונה, כמו "מדונה"',
    'uomo': 'איש — אואומו',
    'notte': 'לילה — נוטה, כמו "נוקטורן" = לילי',
    'giorno': "יום — ג'ורנו, כמו \"ג'ורנליסט\"",
    'acqua': 'מים — אקווה, כמו "אקווריום"',
    'fuoco': 'אש — פואוקו, כמו "פוקו"',
    'libro': 'ספר — ליברו, כמו "ליברריה"',
    'scuola': 'בית ספר — סקולה',
    'cibo': "אוכל — צ'יבו",
    'strada': 'רחוב — סטראדה, כמו "סטראדה"',
    'famiglia': 'משפחה — פמיליה, כמו "פמיליארי"',
    'molto': 'הרבה — מולטו',
    'bello': 'יפה — בלו',
    'nuovo': 'חדש — נואובו, כמו "נואובו"',
    'grande': 'גדול — גרנדה, כמו "גרנד"',
    'piccolo': 'קטן — פיקולו, כמו הכלי נגינה',
    'amore': 'אהבה — אמורה, כמו "אמור"',
    'cuore': 'לב — קואורה',
    'luna': 'ירח — לונה, כמו "לונארי"',
    'sole': 'שמש — סולה',
    'testa': 'ראש — טסטה',
    'mano': 'יד — מאנו',
    'occhio': 'עין — אוקיו',
    'bocca': 'פה — בוקה, כמו "בוקה לבוקה"',
    'figlio': 'בן — פיליו',
    'madre': 'אם — מאדרה',
    'padre': 'אב — פאדרה',
    'fratello': 'אח — פראטלו',
    'sorella': 'אחות — סורלה',
    'pasta': 'פסטה — כמו שאתה מכיר!',
    'pizza': 'פיצה — מילה בינלאומית!',
    'ciao': "צ'או — ברכת שלום ופרידה",
    'grazie': 'תודה — גראצייה',
    'per favore': 'בבקשה — פר פבורה',
    'scusi': 'סליחה — סקוזי',
  };
  
  if (hints[it]) return hints[it];
  
  // Auto-generate simple hint
  if (heb) return `${heb} ← ${it}`;
  return '';
}

// ═══════════════════════════════════════
// LEARN & PRACTICE (standalone pages)
// ═══════════════════════════════════════
function renderLearn(container) {
  if (!currentStage || currentStage === '__srs__') {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-icon">🃏</div>
      <div class="empty-text">בחר שלב מהמסלול כדי ללמוד<br>או התחל חזרה מרווחת</div>
      <button class="fc-btn fc-btn-next" onclick="navigate('tree')" style="margin-top:16px">למסלול 🗺️</button>
    </div>`;
    return;
  }
  renderLearnMode(container);
}

// ═══════════════════════════════════════
// UTILITY
// ═══════════════════════════════════════
function getStage(stageId) {
  for (const level of VLL_LEVELS) {
    const found = level.stages.find(s => s.id === stageId);
    if (found) return found;
  }
  return null;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function escAttr(str) {
  return String(str).replace(/'/g, "\\'").replace(/"/g, '"');
}

function similarity(a, b) {
  if (a === b) return 1;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1;
  return (longer.length - editDistance(longer, shorter)) / longer.length;
}

function editDistance(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(
        dp[i-1][j] + 1,
        dp[i][j-1] + 1,
        dp[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1)
      );
  return dp[m][n];
}

function toast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (type ? ' ' + type : '');
  t.style.display = 'block';
  setTimeout(() => { t.style.display = 'none'; }, 2500);
}

// ═══════════════════════════════════════
// CONFETTI
// ═══════════════════════════════════════
function fireConfetti() {
  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const particles = [];
  const colors = ['#5c6ef2', '#38c972', '#f0a030', '#f04848', '#ffc107', '#7c8cf7'];
  
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 100,
      w: 6 + Math.random() * 6,
      h: 4 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - .5) * 4,
      vy: 2 + Math.random() * 4,
      rot: Math.random() * 360,
      rv: (Math.random() - .5) * 10
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
    if (alive && frame < 150) requestAnimationFrame(animate);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  animate();
}
