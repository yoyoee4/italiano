// ═══════════════════════════════════════════════════
// VolaLingo — Speak Practice Module
// Voice recording + phrase practice with speech recognition
// ═══════════════════════════════════════════════════

const Speak = (() => {
 let currentPhraseIdx = 0;
 let currentLevel = 'A1';
 let isRecording = false;
 let recognition = null;
 let recordings = JSON.parse(localStorage.getItem('vl_recordings') || '[]');
 let phraseBook = [];
 let mode = 'phrases'; // 'phrases' | 'dictation' | 'free'

 // ── Build phrase list from PHRASES in data.js ──
 function buildPhrases(level) {
  if (typeof PHRASES === 'undefined') return [];
  return PHRASES.filter(p => !level || p.level === level);
 }

 // ── Render main page ──
 function render() {
  const c = document.getElementById('speakContent');
  if (!c) return;

  phraseBook = buildPhrases(currentLevel);
  if (phraseBook.length === 0 && typeof PHRASES !== 'undefined') {
   phraseBook = PHRASES.slice(0, 20);
  }
  if (currentPhraseIdx >= phraseBook.length) currentPhraseIdx = 0;

  c.innerHTML = `
   <div class="speak-page">
    <div class="speak-header">
     <h2 class="speak-title">🎙️ תרגול הקלטה</h2>
     <p class="speak-subtitle">חזור על המשפטים ושפר את ההגייה</p>
    </div>

    <div class="speak-modes">
     <button class="speak-mode-btn ${mode==='phrases'?'active':''}" onclick="Speak.setMode('phrases')">🗣️ משפטים</button>
     <button class="speak-mode-btn ${mode==='dictation'?'active':''}" onclick="Speak.setMode('dictation')">✍️ הכתבה</button>
     <button class="speak-mode-btn ${mode==='free'?'active':''}" onclick="Speak.setMode('free')">💡 חופשי</button>
    </div>

    <div class="speak-level-tabs">
     ${['A1','A2','B1','B2','C1'].map(l => `
      <button class="speak-level-btn ${currentLevel===l?'active':''}" onclick="Speak.setLevel('${l}')">${l}</button>
     `).join('')}
    </div>

    <div id="speakMainContent"></div>

    <div class="speak-stats">
     <div class="speak-stat">
      <span class="speak-stat-num">${recordings.length}</span>
      <span class="speak-stat-label">הקלטות</span>
     </div>
     <div class="speak-stat">
      <span class="speak-stat-num">${phraseBook.length}</span>
      <span class="speak-stat-label">משפטים</span>
     </div>
     <div class="speak-stat">
      <span class="speak-stat-num">${currentLevel}</span>
      <span class="speak-stat-label">רמה</span>
     </div>
    </div>
   </div>
  `;

  renderContent();
 }

 // ── Render content based on mode ──
 function renderContent() {
  const mc = document.getElementById('speakMainContent');
  if (!mc) return;

  switch(mode) {
   case 'phrases': renderPhrases(mc); break;
   case 'dictation': renderDictation(mc); break;
   case 'free': renderFree(mc); break;
  }
 }

 // ── PHRASES MODE ──
 function renderPhrases(mc) {
  const p = phraseBook[currentPhraseIdx] || phraseBook[0];
  if (!p) {
   mc.innerHTML = '<div class="speak-empty">אין משפטים לרמה זו 🤷</div>';
   return;
  }

  mc.innerHTML = `
   <div class="speak-card">
    <div class="speak-card-counter">${currentPhraseIdx + 1} / ${phraseBook.length}</div>
    <div class="speak-phrase-it" id="speakPhraseIt">${p.target}</div>
    <div class="speak-phrase-he">${p.native}</div>
    <button class="speak-hear-btn" onclick="Speak.hearPhrase()">🔊 שמע</button>
    
    <div class="speak-wave-container" id="speakWaveContainer">
     <div class="speak-wave" id="speakWave"></div>
    </div>

    <div class="speak-result" id="speakResult"></div>

    <div class="speak-actions">
     <button class="speak-record-btn" id="speakRecordBtn" onclick="Speak.toggleRecord()">
      🎙️ הקלט
     </button>
    </div>

    <div class="speak-nav-btns">
     <button class="speak-nav-btn" onclick="Speak.prevPhrase()" ${currentPhraseIdx===0?'disabled':''}>⬅️</button>
     <button class="speak-nav-btn" onclick="Speak.nextPhrase()">➡️</button>
    </div>
   </div>
  `;

  // Animate wave placeholder
  startWaveAnimation();
 }

 // ── DICTATION MODE ──
 function renderDictation(mc) {
  const p = phraseBook[currentPhraseIdx] || phraseBook[0];
  if (!p) {
   mc.innerHTML = '<div class="speak-empty">אין משפטים לרמה זו 🤷</div>';
   return;
  }

  mc.innerHTML = `
   <div class="speak-card">
    <div class="speak-card-counter">${currentPhraseIdx + 1} / ${phraseBook.length}</div>
    <div class="speak-dictation-he">${p.native}</div>
    <button class="speak-hear-btn" onclick="Speak.hearPhrase()">🔊 שמע את המשפט</button>
    
    <div class="speak-dictation-input">
     <input type="text" id="dictationInput" class="speak-input" placeholder="כתוב מה ששמעת באיטלקית..." autocomplete="off" autocapitalize="off">
     <button class="speak-check-btn" onclick="Speak.checkDictation()">✅ בדוק</button>
    </div>

    <div class="speak-result" id="speakResult"></div>

    <div class="speak-nav-btns">
     <button class="speak-nav-btn" onclick="Speak.prevPhrase()" ${currentPhraseIdx===0?'disabled':''}>⬅️</button>
     <button class="speak-nav-btn" onclick="Speak.nextPhrase()">➡️</button>
    </div>
   </div>
  `;

  // Auto-focus input
  setTimeout(() => {
   const inp = document.getElementById('dictationInput');
   if (inp) inp.focus();
  }, 300);
 }

 // ── FREE MODE ──
 function renderFree(mc) {
  mc.innerHTML = `
   <div class="speak-card speak-card-free">
    <div class="speak-free-label">🎙️ דבר איטלקית בחופשיות</div>
    <p class="speak-free-hint">לחץ על הכפתור ודבר — המערכת תנסה לזהות את מה שאמרת</p>
    
    <div class="speak-wave-container" id="speakWaveContainer">
     <div class="speak-wave" id="speakWave"></div>
    </div>

    <div class="speak-free-result" id="speakFreeResult"></div>

    <div class="speak-actions">
     <button class="speak-record-btn speak-record-btn-lg" id="speakRecordBtn" onclick="Speak.toggleRecord()">
      🎙️ הקלט
     </button>
    </div>
   </div>
  `;
  startWaveAnimation();
 }

 // ── Hear phrase via speechSynthesis ──
 function hearPhrase() {
  const p = phraseBook[currentPhraseIdx];
  if (!p) return;
  if (typeof speak === 'function') {
   speak(p.target);
  } else if ('speechSynthesis' in window) {
   const u = new SpeechSynthesisUtterance(p.target);
   u.lang = 'it-IT';
   u.rate = 0.85;
   speechSynthesis.speak(u);
  }
 }

 // ── Toggle recording ──
 function toggleRecord() {
  if (isRecording) {
   stopRecording();
  } else {
   startRecording();
  }
 }

 function startRecording() {
  isRecording = true;
  const btn = document.getElementById('speakRecordBtn');
  if (btn) {
   btn.classList.add('recording');
   btn.innerHTML = '⏹️ עצור';
  }

  // Try Web Speech API
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition && mode !== 'free') {
   recognition = new SpeechRecognition();
   recognition.lang = 'it-IT';
   recognition.interimResults = false;
   recognition.maxAlternatives = 3;

   recognition.onresult = (event) => {
    const results = [];
    for (let i = 0; i < event.results[0].length; i++) {
     results.push(event.results[0][i].transcript);
    }
    handleRecognitionResult(results);
   };

   recognition.onerror = (event) => {
    showResult('❌ שגיאה בזיהוי: ' + event.error, 'error');
    stopRecording();
   };

   recognition.onend = () => {
    if (isRecording) stopRecording();
   };

   try {
    recognition.start();
   } catch(e) {
    showResult('❌ לא ניתן להפעיל זיהוי קול', 'error');
    stopRecording();
   }
  } else if (SpeechRecognition && mode === 'free') {
   recognition = new SpeechRecognition();
   recognition.lang = 'it-IT';
   recognition.interimResults = true;
   recognition.continuous = true;

   recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
     transcript += event.results[i][0].transcript;
    }
    const freeResult = document.getElementById('speakFreeResult');
    if (freeResult) {
     freeResult.innerHTML = `<div class="speak-transcript">🗣️ ${transcript}</div>`;
    }
   };

   recognition.onerror = () => stopRecording();
   recognition.onend = () => { if (isRecording) stopRecording(); };

   try { recognition.start(); } catch(e) { stopRecording(); }
  } else {
   // Fallback — no speech recognition, just simulate
   showResult('⚠️ הדפדפן לא תומך בזיהוי קול — נסה Chrome', 'warn');
   // Still allow manual practice
   setTimeout(() => stopRecording(), 3000);
  }
 }

 function stopRecording() {
  isRecording = false;
  if (recognition) {
   try { recognition.stop(); } catch(e) {}
   recognition = null;
  }
  const btn = document.getElementById('speakRecordBtn');
  if (btn) {
   btn.classList.remove('recording');
   btn.innerHTML = '🎙️ הקלט';
  }

  // Save recording entry
  const p = phraseBook[currentPhraseIdx];
  if (p) {
   recordings.push({
    phrase: p.target,
    level: p.level,
    timestamp: Date.now()
   });
   if (recordings.length > 200) recordings = recordings.slice(-200);
   localStorage.setItem('vl_recordings', JSON.stringify(recordings));
  }
 }

 // ── Handle recognition result ──
 function handleRecognitionResult(alternatives) {
  const p = phraseBook[currentPhraseIdx];
  if (!p) return;

  const expected = p.target.toLowerCase().replace(/[.,!?;:]/g, '').trim();
  const best = alternatives[0]?.toLowerCase().replace(/[.,!?;:]/g, '').trim() || '';

  // Calculate match
  const expectedWords = expected.split(/\s+/);
  const spokenWords = best.split(/\s+/);
  let matchCount = 0;
  expectedWords.forEach(w => {
   if (spokenWords.includes(w)) matchCount++;
  });
  const accuracy = Math.round((matchCount / expectedWords.length) * 100);

  let emoji, cls;
  if (accuracy >= 90) { emoji = '🌟'; cls = 'perfect'; }
  else if (accuracy >= 70) { emoji = '👍'; cls = 'good'; }
  else if (accuracy >= 50) { emoji = '🤔'; cls = 'okay'; }
  else { emoji = '🔄'; cls = 'try-again'; }

  showResult(`
   <div class="speak-score speak-score-${cls}">
    <div class="speak-score-emoji">${emoji}</div>
    <div class="speak-score-pct">${accuracy}%</div>
    <div class="speak-score-label">${accuracy >= 70 ? 'מצוין!' : accuracy >= 50 ? 'לא רע, נסה שוב' : 'נסה שוב'}</div>
   </div>
   <div class="speak-compare">
    <div class="speak-compare-row"><span class="speak-compare-label">ציפית:</span> ${p.target}</div>
    <div class="speak-compare-row"><span class="speak-compare-label">אמרת:</span> ${alternatives[0] || '—'}</div>
   </div>
  `, cls);

  // Add XP for good attempts
  if (accuracy >= 70 && typeof state !== 'undefined') {
   state.xp = (state.xp || 0) + 5;
   if (typeof saveState === 'function') saveState();
  }
 }

 // ── Check dictation ──
 function checkDictation() {
  const p = phraseBook[currentPhraseIdx];
  if (!p) return;
  const input = document.getElementById('dictationInput');
  if (!input) return;

  const expected = p.target.toLowerCase().replace(/[.,!?;:]/g, '').trim();
  const typed = input.value.toLowerCase().replace(/[.,!?;:]/g, '').trim();

  const expectedWords = expected.split(/\s+/);
  const typedWords = typed.split(/\s+/);
  let matchCount = 0;
  expectedWords.forEach(w => {
   if (typedWords.includes(w)) matchCount++;
  });
  const accuracy = Math.round((matchCount / expectedWords.length) * 100);

  let emoji, cls;
  if (accuracy >= 90) { emoji = '🌟'; cls = 'perfect'; }
  else if (accuracy >= 70) { emoji = '👍'; cls = 'good'; }
  else if (accuracy >= 50) { emoji = '🤔'; cls = 'okay'; }
  else { emoji = '🔄'; cls = 'try-again'; }

  showResult(`
   <div class="speak-score speak-score-${cls}">
    <div class="speak-score-emoji">${emoji}</div>
    <div class="speak-score-pct">${accuracy}%</div>
   </div>
   <div class="speak-answer-reveal">
    <strong>התשובה:</strong> ${p.target}
   </div>
  `, cls);

  if (accuracy >= 70 && typeof state !== 'undefined') {
   state.xp = (state.xp || 0) + 5;
   if (typeof saveState === 'function') saveState();
  }
 }

 // ── Show result ──
 function showResult(html, cls) {
  const r = document.getElementById('speakResult') || document.getElementById('speakFreeResult');
  if (r) {
   r.innerHTML = html;
   r.className = `speak-result speak-result-${cls || ''}`;
  }
 }

 // ── Navigation ──
 function nextPhrase() {
  if (currentPhraseIdx < phraseBook.length - 1) {
   currentPhraseIdx++;
   renderContent();
  }
 }

 function prevPhrase() {
  if (currentPhraseIdx > 0) {
   currentPhraseIdx--;
   renderContent();
  }
 }

 // ── Set mode/level ──
 function setMode(m) {
  mode = m;
  render();
 }

 function setLevel(l) {
  currentLevel = l;
  currentPhraseIdx = 0;
  render();
 }

 // ── Wave animation (CSS-only placeholder) ──
 function startWaveAnimation() {
  const wave = document.getElementById('speakWave');
  if (!wave) return;
  let bars = '';
  for (let i = 0; i < 30; i++) {
   const h = 8 + Math.random() * 24;
   const delay = (i * 0.05).toFixed(2);
   bars += `<div class="speak-wave-bar" style="height:${h}px;animation-delay:${delay}s"></div>`;
  }
  wave.innerHTML = bars;
 }

 // ── Public API ──
 return {
  render,
  hearPhrase,
  toggleRecord,
  nextPhrase,
  prevPhrase,
  setMode,
  setLevel,
  checkDictation
 };
})();
