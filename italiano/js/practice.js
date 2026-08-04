/* ═══════════════════════════════════════════════
   VolaLingo v2 — Practice Engine
   Quizzes, Anki SRS, Sentence Recording,
   Dialogues, CILS Exams
   ═══════════════════════════════════════════════ */

const Practice = (() => {

let currentQuiz = null;
let quizIdx = 0;
let quizScore = 0;
let quizCombo = 0;
let quizMaxCombo = 0;
let ankiQueue = [];
let ankiIdx = 0;
let ankiRevealed = false;
let sentenceQueue = [];
let sentenceIdx = 0;
let dialogueQueue = [];
let dialogueIdx = 0;

// ═══════════════════════════════════════
// WORD LESSON
// ═══════════════════════════════════════
function startWordLesson(node) {
  const words = node.words || getWordsForNode(node);
  
  if (words.length === 0) { toast('אין מילים בנושא זה', 'error'); return; }
  
  const container = document.getElementById('practiceContent');
  // Go to practice page first
  goPage('practice');
  
  // Scaffolding: Phase 1 = listen & choose, Phase 2 = read & type, Phase 3 = recall
  let phase = 0;
  let wordIdx = 0;
  
  function renderWordPhase() {
    const w = words[wordIdx];
    if (!w || wordIdx >= words.length) {
      // Lesson complete
      finishWordLesson(node, words);
      return;
    }
    
    let html = `
      <div style="text-align:center;margin-bottom:8px">
        <span style="font-size:.75rem;color:var(--text3)">מילה ${wordIdx + 1}/${words.length}</span>
      </div>
      <div class="progress-bar" style="margin-bottom:16px"><div class="progress-fill" style="width:${(wordIdx/words.length)*100}%"></div></div>
    `;
    
    if (phase === 0) {
      // Phase 0: Image mode → pick Italian word, or normal mode → pick Hebrew translation
      const isImageMode = !!w.img;
      if (isImageMode) {
        const options = shuffle([w.target, ...getDistractors(words, w, 'target')]).slice(0, 4);
        html += `
          <div class="card" style="text-align:center;padding:24px">
            <div style="font-size:4rem;margin-bottom:12px">${w.img}</div>
            <button class="speak-btn active" onclick="speak('${esc(w.target)}')" style="width:64px;height:64px;font-size:1.8rem;margin:0 auto 16px">🔊</button>
            <div style="font-size:.85rem;color:var(--text3)">Qual è la parola corretta?</div>
          </div>
          ${options.map(o => `
            <div class="quiz-option" onclick="Practice.answerWord(this,'${esc(o)}','${esc(w.target)}','${node.id}',${wordIdx},true)">${o}</div>
          `).join('')}
        `;
      } else {
        // Phase 1: Hear word, choose translation
        const options = shuffle([w.native, ...getDistractors(words, w, 'native')]).slice(0, 4);
        html += `
          <div class="card" style="text-align:center;padding:24px">
            <button class="speak-btn active" onclick="speak('${esc(w.target)}')" style="width:64px;height:64px;font-size:1.8rem;margin:0 auto 16px">🔊</button>
            <div style="font-family:var(--font-it);font-size:1.6rem;font-weight:700;margin-bottom:4px">${w.target}</div>
            <div style="font-size:.85rem;color:var(--text3)">מה התרגום?</div>
          </div>
          ${options.map(o => `
            <div class="quiz-option" onclick="Practice.answerWord(this,'${esc(o)}','${esc(w.native)}','${node.id}',${wordIdx})">${o}</div>
          `).join('')}
        `;
      }
    } else if (phase === 1) {
      // Phase 2: See Hebrew, type Italian
      html += `
        <div class="card" style="text-align:center;padding:24px">
          <div style="font-size:1.3rem;font-weight:700;margin-bottom:4px">${w.native}</div>
          <div style="font-size:.85rem;color:var(--text3)">כתוב ב${APP_CONFIG.targetName}</div>
        </div>
        <div style="padding:0 4px;margin-top:12px">
          <input type="text" id="typeInput" placeholder="כתוב כאן..." 
            style="width:100%;padding:14px;background:var(--surface);border:2px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:1.1rem;font-family:var(--font-it);text-align:center;direction:ltr"
            onkeydown="if(event.key==='Enter')Practice.checkTyped('${esc(w.target)}','${node.id}',${wordIdx})">
          <button class="btn btn-primary btn-block" style="margin-top:8px" onclick="Practice.checkTyped('${esc(w.target)}','${node.id}',${wordIdx})">בדוק →</button>
        </div>
      `;
    } else {
      // Phase 3: Hear only, speak it
      html += `
        <div class="card" style="text-align:center;padding:24px">
          <button class="speak-btn active" onclick="speak('${esc(w.target)}')" style="width:64px;height:64px;font-size:1.8rem;margin:0 auto 16px">🔊</button>
          <div style="font-size:.85rem;color:var(--text3)">הגה את המילה</div>
          <div style="font-size:.8rem;color:var(--text2);margin-top:4px">💡 רמז: ${w.native}</div>
        </div>
        <div class="record-flow">
          <button class="mic-btn" id="micBtn" onclick="Practice.recordWord('${esc(w.target)}','${node.id}',${wordIdx})">🎤</button>
          <div id="recordResult" style="text-align:center"></div>
        </div>
      `;
    }
    
    container.innerHTML = `
      <button class="back-btn" onclick="goPage('learn')">← חזרה</button>
      <div style="text-align:center;margin-bottom:12px">
        <span style="font-size:1.2rem">${node.icon}</span>
        <span style="font-weight:700;margin-right:6px">${node.name}</span>
      </div>
      ${html}
    `;
    
    if (phase === 0) speak(w.target);
  }
  
  // Store state for callbacks
  Practice._wordLesson = { node, words, phase, wordIdx, renderWordPhase };
  
  // Advance phase every 3 words
  phase = Math.min(2, Math.floor(0 / 3));
  wordIdx = 0;
  renderWordPhase();
}

function answerWord(el, chosen, correct, nodeId, wordIdx, isImageMode) {
  const lesson = Practice._wordLesson;
  if (!lesson) return;
  
  const isCorrect = chosen === correct;
  const options = el.parentElement.querySelectorAll('.quiz-option');
  options.forEach(o => {
    o.classList.add('disabled');
    if (o.textContent === correct) o.classList.add('reveal');
  });
  
  if (isCorrect) {
    el.classList.add('correct');
    quizCombo++;
    if (quizCombo > quizMaxCombo) quizMaxCombo = quizCombo;
    addXP(10 + (quizCombo > 3 ? quizCombo * 2 : 0));
    if (!state.wordsLearned.includes(lesson.words[wordIdx].target)) {
      state.wordsLearned.push(lesson.words[wordIdx].target); save();
    }
    // Add to Anki
    addAnkiCard(lesson.words[wordIdx]);
  } else {
    el.classList.add('wrong');
    quizCombo = 0;
    trackWeakWord(lesson.words[wordIdx].target);
    if (!useHeart()) {
      showOutOfHearts();
      return;
    }
  }
  
  setTimeout(() => {
    lesson.wordIdx++;
    lesson.phase = Math.min(2, Math.floor(lesson.wordIdx / 3));
    lesson.renderWordPhase();
  }, 1000);
}

function showOutOfHearts() {
  const container = document.getElementById('practiceContent') || document.getElementById('pageContent');
  if (!container) return;
  container.innerHTML = `
    <div style="text-align:center;padding:60px 20px">
      <div style="font-size:5rem;margin-bottom:16px">💔</div>
      <h2 style="font-weight:800">אזלו הלבבות!</h2>
      <p style="color:var(--text2);margin:8px 0 24px">חכה להתחדשות או קנה לבבות בחנות</p>
      <button class="btn btn-primary" style="margin-bottom:12px" onclick="goPage('shop')">🛒 חנות</button>
      <button class="btn btn-secondary btn-block" onclick="goPage('learn')">🗺️ חזרה למסלול</button>
    </div>
  `;
}

function checkTyped(correct, nodeId, wordIdx) {
  const input = document.getElementById('typeInput');
  if (!input) return;
  const answer = input.value.trim();
  const score = fuzzyMatch(answer, correct);
  
  if (score >= 80) {
    input.style.borderColor = 'var(--emerald)';
    input.style.color = 'var(--emerald-light)';
    addXP(15);
    quizCombo++;
  } else {
    input.style.borderColor = 'var(--red)';
    input.style.color = 'var(--red)';
    input.value = correct;
    quizCombo = 0;
    trackWeakWord(correct);
    useHeart();
  }
  
  const lesson = Practice._wordLesson;
  setTimeout(() => {
    lesson.wordIdx++;
    lesson.phase = Math.min(2, Math.floor(lesson.wordIdx / 3));
    lesson.renderWordPhase();
  }, 1500);
}

function recordWord(correct, nodeId, wordIdx) {
  const btn = document.getElementById('micBtn');
  if (isListening) { stopListening(); return; }
  
  btn.classList.add('listening');
  startListening(APP_CONFIG.targetLang, (results) => {
    btn.classList.remove('listening');
    const resultEl = document.getElementById('recordResult');
    if (!results) {
      resultEl.innerHTML = '<div class="sentence-result result-retry">🎤 לא נשמע דיבור — נסה שוב</div>';
      return;
    }
    const score = fuzzyMatch(results[0], correct);
    let cls = score >= 90 ? 'result-perfect' : score >= 60 ? 'result-good' : score >= 30 ? 'result-ok' : 'result-retry';
    let msg = score >= 90 ? '🎉 מושלם!' : score >= 60 ? '👍 טוב!' : score >= 30 ? '🤔 כמעט...' : '🔄 נסה שוב';
    
    resultEl.innerHTML = `
      <div class="sentence-result ${cls}">${msg} (${score}%)</div>
      <div class="sentence-heard">שמעתי: ${results[0]}</div>
    `;
    
    if (score >= 60) {
      addXP(20);
      quizCombo++;
      if (!state.wordsLearned.includes(correct)) { state.wordsLearned.push(correct); save(); }
    } else {
      quizCombo = 0;
      trackWeakWord(correct);
    }
    
    setTimeout(() => {
      const lesson = Practice._wordLesson;
      lesson.wordIdx++;
      lesson.phase = Math.min(2, Math.floor(lesson.wordIdx / 3));
      lesson.renderWordPhase();
    }, 2000);
  });
}

function finishWordLesson(node, words) {
  const learned = words.filter(w => state.wordsLearned.includes(w.target)).length;
  const pct = Math.round(learned / words.length * 100);
  const container = document.getElementById('practiceContent');
  
  container.innerHTML = `
    <div style="text-align:center;padding:40px 20px">
      <div style="font-size:4rem;margin-bottom:16px">${pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
      <h2 style="font-weight:800">${pct >= 80 ? 'מצוין!' : pct >= 50 ? 'כל הכבוד!' : 'המשך להתאמן!'}</h2>
      <p style="color:var(--text2);margin:8px 0">למדת ${learned}/${words.length} מילים חדשות</p>
      <div class="progress-bar" style="margin:16px auto;max-width:200px"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div style="margin:16px 0">
        <span class="coin-badge">+${Math.ceil(pct/5)} 💎</span>
      </div>
      <button class="btn btn-primary" onclick="SkillTree.completeNode('${node.id}',${pct});SkillTree.render()">המשך →</button>
    </div>
  `;
  
  if (pct >= 80) confetti();
  SkillTree.completeNode(node.id, pct);
  addDaily();
}

// ═══════════════════════════════════════
// SENTENCE LESSON (with recording)
// ═══════════════════════════════════════
function startSentenceLesson(node) {
  const sentences = node.sentences || getSentencesForNode(node);
  if (sentences.length === 0) { toast('אין משפטים בנושא', 'error'); return; }
  
  goPage('practice');
  sentenceQueue = shuffle([...sentences]);
  sentenceIdx = 0;
  renderSentence();
}

function renderSentence() {
  const container = document.getElementById('practiceContent');
  if (sentenceIdx >= sentenceQueue.length) {
    // Done
    container.innerHTML = `
      <div style="text-align:center;padding:40px 20px">
        <div style="font-size:4rem;margin-bottom:16px">🗣️</div>
        <h2 style="font-weight:800">סיימת את המשפטים!</h2>
        <button class="btn btn-primary" onclick="Practice.render()">המשך →</button>
      </div>
    `;
    addDaily(); return;
  }
  
  const s = sentenceQueue[sentenceIdx];
  const hasRecording = state.sentencesPracticed && state.sentencesPracticed[s.target];
  
  container.innerHTML = `
    <button class="back-btn" onclick="goPage('learn')">← חזרה</button>
    <div style="text-align:center;margin-bottom:8px">
      <span style="font-size:.75rem;color:var(--text3)">משפט ${sentenceIdx + 1}/${sentenceQueue.length}</span>
    </div>
    <div class="progress-bar" style="margin-bottom:16px"><div class="progress-fill" style="width:${(sentenceIdx/sentenceQueue.length)*100}%"></div></div>
    
    <div class="sentence-card">
      <div style="font-size:.7rem;color:var(--text3);margin-bottom:4px">${APP_CONFIG.targetFlag} ${APP_CONFIG.targetName}</div>
      <div class="sentence-it">${s.target}</div>
      <div style="font-size:.7rem;color:var(--text3);margin-top:12px;margin-bottom:4px">${APP_CONFIG.nativeFlag} ${APP_CONFIG.nativeName}</div>
      <div class="sentence-he">${s.native}</div>
    </div>
    
    <div class="record-flow">
      <div class="record-step ${true ? 'active' : ''}" id="step1">1️⃣ האזן 🐢</div>
      <div class="record-step" id="step2">2️⃣ האזן רגיל</div>
      <div class="record-step" id="step3">3️⃣ הקלט 🎤</div>
      <div class="record-step" id="step4">4️⃣ בדוק ציון</div>
    </div>
    
    <div style="display:flex;justify-content:center;gap:12px;margin:16px 0">
      <button class="btn btn-secondary btn-sm" onclick="speak('${esc(s.target)}',undefined,0.5)">🐢 איטי</button>
      <button class="btn btn-primary btn-sm" onclick="speak('${esc(s.target)}')">🔊 רגיל</button>
      <button class="mic-btn" id="micBtn" onclick="Practice.recordSentence('${esc(s.target)}')" style="width:48px;height:48px;font-size:1.2rem">🎤</button>
    </div>
    
    <div id="sentenceResult" style="text-align:center"></div>
    
    <div style="display:flex;gap:8px;margin-top:16px">
      <button class="btn btn-secondary btn-block" onclick="Practice.renderSentence()">🔄 עוד פעם</button>
      <button class="btn btn-primary btn-block" onclick="Practice.nextSentence()">הבא →</button>
    </div>
  `;
  
  // Auto-play slow
  speak(s.target, undefined, 0.5);
}

function recordSentence(correct) {
  const btn = document.getElementById('micBtn');
  if (isListening) { stopListening(); return; }
  
  btn.classList.add('listening');
  startListening(APP_CONFIG.targetLang, (results) => {
    btn.classList.remove('listening');
    const resultEl = document.getElementById('sentenceResult');
    if (!results) {
      resultEl.innerHTML = '<div class="sentence-result result-retry">🎤 לא נשמע — נסה שוב</div>';
      return;
    }
    
    const score = fuzzyMatch(results[0], correct);
    let cls = score >= 90 ? 'result-perfect' : score >= 60 ? 'result-good' : score >= 30 ? 'result-ok' : 'result-retry';
    let msg = score >= 90 ? '🎉 מושלם!' : score >= 60 ? '👍 טוב מאוד!' : score >= 30 ? '🤔 כמעט, נסה שוב' : '🔄 עוד פעם';
    
    resultEl.innerHTML = `
      <div class="sentence-result ${cls}">${msg} (${score}%)</div>
      <div class="sentence-heard">🎤 שמעתי: <em>${results[0]}</em></div>
      <div style="font-size:.75rem;color:var(--text3);margin-top:4px">✅ נכון: ${correct}</div>
    `;
    
    // Update steps
    document.getElementById('step1')?.classList.add('done');
    document.getElementById('step2')?.classList.add('done');
    document.getElementById('step3')?.classList.add(score >= 30 ? 'done' : 'active');
    document.getElementById('step4')?.classList.add('active');
    
    if (score >= 60) {
      addXP(15);
      if (!state.sentencesPracticed) state.sentencesPracticed = {};
      state.sentencesPracticed[correct] = { score, date: Date.now() };
      save();
    } else {
      trackWeakWord(correct);
    }
  });
}

function nextSentence() {
  sentenceIdx++;
  renderSentence();
}

// ═══════════════════════════════════════
// QUIZ
// ═══════════════════════════════════════
function startQuiz(node) {
  // Guard against re-triggering when called from within render()
  if (Practice._insideStartQuiz) return;
  Practice._insideStartQuiz = true;
  
  goPage('practice');
  Practice._quizNode = node; // ← fix: save node reference
 const words = node.words || getWordsForNode(node);
  if (words.length < 4) { toast('אין מספיק מילים לחידון', 'error'); Practice._insideStartQuiz = false; return; }
  
  // Mix question types
  currentQuiz = [];
  const shuffled = shuffle([...words]);
  
  // Type 1: IT→HE (choose)
  shuffled.slice(0, 3).forEach(w => {
    const distractors = getDistractors(words, w, 'native');
    currentQuiz.push({ type: 'choose', q: w.target, a: w.native, options: shuffle([w.native, ...distractors]).slice(0, 4), qLang: 'target' });
  });
  
  // Type 2: HE→IT (choose)
  shuffled.slice(3, 6).forEach(w => {
    const distractors = getDistractors(words, w, 'target');
    currentQuiz.push({ type: 'choose', q: w.native, a: w.target, options: shuffle([w.target, ...distractors]).slice(0, 4), qLang: 'native' });
  });
  
  // Type 3: type it
  if (shuffled.length > 6) {
    shuffled.slice(6, 8).forEach(w => {
      currentQuiz.push({ type: 'type', q: w.native, a: w.target, qLang: 'native' });
    });
  }
  
  quizIdx = 0; quizScore = 0; quizCombo = 0; quizMaxCombo = 0;
  renderQuizQuestion(node);
  Practice._insideStartQuiz = false;
}

function renderQuizQuestion(node) {
  const container = document.getElementById('practiceContent');
  if (quizIdx >= currentQuiz.length) {
    finishQuiz(node); return;
  }
  
  const q = currentQuiz[quizIdx];
  let html = `
    <div style="text-align:center;margin-bottom:8px">
      <span style="font-size:.75rem;color:var(--text3)">שאלה ${quizIdx + 1}/${currentQuiz.length}</span>
    </div>
    <div class="progress-bar" style="margin-bottom:4px"><div class="progress-fill" style="width:${(quizIdx/currentQuiz.length)*100}%"></div></div>
    ${quizCombo >= 3 ? `<div class="combo-display">🔥 x${quizCombo} <span class="combo-x">קומבו!</span></div>` : ''}
  `;
  
  if (q.type === 'choose') {
    html += `
      <div class="card" style="text-align:center;padding:24px">
        <div style="font-family:${q.qLang==='it'?'var(--font-it)':'var(--font-he)'};font-size:1.5rem;font-weight:700">${q.q}</div>
        ${q.qLang === 'target' ? `<button class="btn btn-sm btn-secondary" onclick="speak('${esc(q.q)}')" style="margin-top:8px">🔊</button>` : ''}
        <div style="font-size:.85rem;color:var(--text3);margin-top:8px">${q.qLang === 'target' ? 'מה התרגום?' : 'כתוב ב${APP_CONFIG.targetName}'}</div>
      </div>
      ${q.options.map(o => `
        <div class="quiz-option" onclick="Practice.answerQuiz(this,'${esc(o)}','${esc(q.a)}')">${o}</div>
      `).join('')}
    `;
  } else {
    html += `
      <div class="card" style="text-align:center;padding:24px">
        <div style="font-size:1.3rem;font-weight:700">${q.q}</div>
        <div style="font-size:.85rem;color:var(--text3);margin-top:8px">כתוב ב${APP_CONFIG.targetName}</div>
      </div>
      <div style="padding:0 4px;margin-top:12px">
        <input type="text" id="quizInput" placeholder="..." 
          style="width:100%;padding:14px;background:var(--surface);border:2px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:1.1rem;font-family:var(--font-it);text-align:center;direction:ltr"
          onkeydown="if(event.key==='Enter')Practice.checkQuizTyped('${esc(q.a)}')">
        <button class="btn btn-primary btn-block" style="margin-top:8px" onclick="Practice.checkQuizTyped('${esc(q.a)}')">בדוק</button>
      </div>
    `;
  }
  
  container.innerHTML = `
    <button class="back-btn" onclick="goPage('learn')">← חזרה</button>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <span>❤️ ${'❤️'.repeat(getHearts().count)}</span>
      <span style="font-size:.8rem;color:var(--text3)">🧠 ${node.icon} ${node.name}</span>
    </div>
    ${html}
  `;
}

function answerQuiz(el, chosen, correct) {
  const isCorrect = chosen === correct;
  const options = el.parentElement.querySelectorAll('.quiz-option');
  options.forEach(o => {
    o.classList.add('disabled');
    if (o.textContent === correct) o.classList.add('reveal');
  });
  
 if (isCorrect) {
 el.classList.add('correct');
 quizScore += 10 + (quizCombo >= 3 ? quizCombo * 2 : 0);
 quizCombo++;
 if (quizCombo > quizMaxCombo) quizMaxCombo = quizCombo;
 addXP(10);
 // Track success for Anki 5-success removal
 if (typeof Features !== 'undefined') Features.enhancedAnkiRate({front: correct}, 2);
 } else {
 el.classList.add('wrong');
 quizCombo = 0;
 trackWeakWord(correct);
 // Add to Anki automatically
 const wordData = (APP_DATA.words||[]).find(w => w.native === correct || w.target === correct);
 if (wordData) addAnkiCard(wordData);
 // Reset success count for this word
 if (!state.ankiSuccessCount) state.ankiSuccessCount = {};
 state.ankiSuccessCount[correct] = 0; save();
 if (!useHeart()) {
   showOutOfHearts();
   return;
   }
  }
  
  setTimeout(() => { quizIdx++; renderQuizQuestion(Practice._quizNode); }, 1000);
}

function checkQuizTyped(correct) {
  const input = document.getElementById('quizInput');
  if (!input) return;
  const score = fuzzyMatch(input.value.trim(), correct);
  
  if (score >= 70) {
    input.style.borderColor = 'var(--emerald)'; input.style.color = 'var(--emerald-light)';
    quizScore += 15; quizCombo++; addXP(15);
  } else {
    input.style.borderColor = 'var(--red)'; input.style.color = 'var(--red)';
    input.value = correct; quizCombo = 0; trackWeakWord(correct); useHeart();
  }
  
  setTimeout(() => { quizIdx++; renderQuizQuestion(Practice._quizNode); }, 1500);
}

function finishQuiz(node) {
  const maxScore = currentQuiz.length * 15;
  const pct = Math.round(quizScore / maxScore * 100);
  const container = document.getElementById('practiceContent');
  
  if (node && node.isMixed) {
    // Mixed practice completion — show "מלא הכול" options
    container.innerHTML = `
      <div style="text-align:center;padding:40px 20px">
        <div style="font-size:4rem;margin-bottom:16px">${pct >= 80 ? '🌟' : pct >= 50 ? '👍' : '💪'}</div>
        <h2 style="font-weight:800">${pct >= 80 ? 'מצוין!' : pct >= 50 ? 'כל הכבוד!' : 'המשך להתאמן!'}</h2>
        <p style="color:var(--text2);margin:8px 0">ציון: ${quizScore}/${maxScore} (${pct}%)</p>
        ${quizMaxCombo >= 3 ? `<p style="color:var(--orange)">🔥 קומבו מקסימלי: x${quizMaxCombo}</p>` : ''}
        <div style="margin:16px 0">
          <span class="coin-badge">+${Math.ceil(pct/5)} 💎</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:20px">
          <button class="btn btn-primary btn-block" onclick="Practice.startMixedPractice(false)">🎯 תרגול מעורב נוסף</button>
          ${!node.isFull ? `<button class="btn btn-primary btn-block" style="border-color:var(--emerald);color:var(--emerald);background:transparent" onclick="Practice.startMixedPractice(true)">📚 תרגול מלא — כל המילים</button>` : ''}
          <button class="btn btn-secondary btn-block" onclick="Practice.showPracticeMenu()">📋 תפריט נושאים</button>
        </div>
      </div>
    `;
    if (pct >= 80) confetti();
    state.quizHistory.push({ nodeId: node.id, score: pct, date: Date.now() }); save();
    addDaily();
    return;
  }
  
  // Regular topic quiz completion
  container.innerHTML = `
    <div style="text-align:center;padding:40px 20px">
      <div style="font-size:4rem;margin-bottom:16px">${pct >= 80 ? '🌟' : pct >= 50 ? '👍' : '💪'}</div>
      <h2 style="font-weight:800">${pct >= 80 ? 'מצוין!' : pct >= 50 ? 'כל הכבוד!' : 'המשך להתאמן!'}</h2>
      <p style="color:var(--text2);margin:8px 0">ציון: ${quizScore}/${maxScore} (${pct}%)</p>
      ${quizMaxCombo >= 3 ? `<p style="color:var(--orange)">🔥 קומבו מקסימלי: x${quizMaxCombo}</p>` : ''}
      <div style="margin:16px 0">
        <span class="coin-badge">+${Math.ceil(pct/5)} 💎</span>
      </div>
      <button class="btn btn-primary" onclick="SkillTree.completeNode('${node.id}',${pct});Practice.render()">המשך →</button>
    </div>
  `;
  
  if (pct >= 80) confetti();
  SkillTree.completeNode(node.id, pct);
  state.quizHistory.push({ nodeId: node.id, score: pct, date: Date.now() }); save();
  addDaily();
}

// ═══════════════════════════════════════
// DIALOGUES
// ═══════════════════════════════════════
function startDialogue(node) {
  const dialogues = APP_DATA.dialogues || [];
  const cat = node.category || node.id;
  const matching = dialogues.filter(d => d.cat === cat);
  if (matching.length === 0) { toast('אין שיחות בנושא', 'error'); return; }
  
  goPage('practice');
  const dlg = matching[0]; // take first matching
  dialogueQueue = dlg.lines || [];
  dialogueIdx = 0;
  Practice._dialogueNode = node;
  renderDialogueLine();
}

function renderDialogueLine() {
  const container = document.getElementById('practiceContent');
  if (dialogueIdx >= dialogueQueue.length) {
    // Dialogue complete
    const node = Practice._dialogueNode;
    container.innerHTML = `
      <div style="text-align:center;padding:40px 20px">
        <div style="font-size:4rem;margin-bottom:16px">💬</div>
        <h2 style="font-weight:800">סיימת את השיחה!</h2>
        <button class="btn btn-primary" onclick="Practice.render()">המשך →</button>
      </div>
    `;
    if (node) {
      if (!state.dialoguesCompleted) state.dialoguesCompleted = {};
      state.dialoguesCompleted[node.id] = { date: Date.now() }; save();
      SkillTree.completeNode(node.id, 80);
      addDaily();
    }
    return;
  }
  
  const line = dialogueQueue[dialogueIdx];
  const isYou = line.role === 'you';
  
  let html = `
    <button class="back-btn" onclick="goPage('learn')">← חזרה</button>
    <div class="dlg-progress">
      ${dialogueQueue.map((_, i) => `
        <div class="dlg-dot ${i < dialogueIdx ? 'done' : (i === dialogueIdx ? 'current' : '')}"></div>
      `).join('')}
    </div>
  `;
  
  // Show previous lines
  for (let i = 0; i < dialogueIdx; i++) {
    const l = dialogueQueue[i];
    html += `
      <div class="${l.role === 'you' ? 'dlg-you' : 'dlg-npc'}">
        <div class="dlg-role">${l.role === 'you' ? '👤 את/ה' : '🧑‍🏫 ' + l.name}</div>
        <div class="dlg-text-it">${l.target}</div>
        <div class="dlg-text-he">${l.native}</div>
      </div>
    `;
  }
  
  // Current line
  if (!isYou) {
    html += `
      <div class="dlg-npc">
        <div class="dlg-role">🧑‍🏫 ${line.name || 'NPC'}</div>
        <div class="dlg-text-it">${line.target}</div>
        <div class="dlg-text-he">${line.native}</div>
        <button class="btn btn-sm btn-secondary" onclick="speak('${esc(line.target)}')" style="margin-top:8px">🔊</button>
      </div>
      <div style="text-align:center;margin-top:16px">
        <button class="btn btn-primary" onclick="Practice.nextDialogueLine()">המשך →</button>
      </div>
    `;
  } else {
    // Your turn — choose or speak
    if (line.options) {
      html += `
        <div style="text-align:center;margin:16px 0;font-size:.85rem;color:var(--text3)">👤 בחר את התשובה שלך:</div>
        ${line.options.map(o => `
          <div class="quiz-option" onclick="Practice.answerDialogue(this,'${esc(o.target)}','${esc(line.target)}')">${o.target}<br><span style="font-size:.7rem;color:var(--text3)">${o.native}</span></div>
        `).join('')}
      `;
    } else {
      html += `
        <div style="text-align:center;margin:16px 0;font-size:.85rem;color:var(--text3)">👤 אמור: <strong style="color:var(--indigo-light)">${line.target}</strong></div>
        <div style="text-align:center">
          <button class="mic-btn" id="dlgMicBtn" onclick="Practice.recordDialogue('${esc(line.target)}')">🎤</button>
          <div id="dlgResult" style="margin-top:12px"></div>
        </div>
      `;
    }
  }
  
  container.innerHTML = html;
  if (!isYou && dialogueIdx === 0) speak(dialogueQueue[0].target);
}

function answerDialogue(el, chosen, correct) {
  const score = fuzzyMatch(chosen, correct);
  if (score >= 70) {
    el.classList.add('correct');
    addXP(10);
  } else {
    el.classList.add('wrong');
  }
  setTimeout(() => { dialogueIdx++; renderDialogueLine(); }, 1000);
}

function recordDialogue(correct) {
  const btn = document.getElementById('dlgMicBtn');
  if (isListening) { stopListening(); return; }
  btn.classList.add('listening');
  startListening(APP_CONFIG.targetLang, (results) => {
    btn.classList.remove('listening');
    const resultEl = document.getElementById('dlgResult');
    if (!results) { resultEl.innerHTML = '<span style="color:var(--text3)">לא נשמע</span>'; return; }
    const score = fuzzyMatch(results[0], correct);
    if (score >= 60) {
      resultEl.innerHTML = `<span style="color:var(--emerald)">✅ ${score}%</span>`;
      addXP(15);
      setTimeout(() => { dialogueIdx++; renderDialogueLine(); }, 1000);
    } else {
      resultEl.innerHTML = `<span style="color:var(--orange)">🔄 ${score}% — נסה שוב</span>`;
    }
  });
}

function nextDialogueLine() {
  dialogueIdx++;
  renderDialogueLine();
}

// ═══════════════════════════════════════
// ANKI SRS
// ═══════════════════════════════════════
function addAnkiCard(word) {
  if (!anki[word.target]) {
    anki[word.target] = {
      front: word.target, back: word.native, cat: word.cat,
      interval: 1, ease: 2.5, due: Date.now(),
      lapses: 0
    };
    saveAnki();
  }
}

function getAnkiDueCount() {
  const now = Date.now();
  return Object.values(anki).filter(c => c.due <= now).length;
}

function startAnki() {
  const now = Date.now();
  ankiQueue = Object.values(anki).filter(c => c.due <= now);
  if (ankiQueue.length === 0) {
    toast('✅ אין כרטיסים מחכים!', 'success'); return;
  }
  ankiQueue = shuffle(ankiQueue);
  ankiIdx = 0;
  goPage('practice');
  renderAnkiCard();
}

function renderAnkiCard() {
  const container = document.getElementById('practiceContent');
  if (ankiIdx >= ankiQueue.length) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px 20px">
        <div style="font-size:4rem;margin-bottom:16px">🧠</div>
        <h2 style="font-weight:800">סיימת את החזרות!</h2>
        <p style="color:var(--text2)">${ankiQueue.length} כרטיסים נבדקו</p>
        <button class="btn btn-primary" onclick="Practice.render()">המשך →</button>
      </div>
    `;
    addDaily(); addXP(ankiQueue.length * 5); return;
  }
  
  const card = ankiQueue[ankiIdx];
  ankiRevealed = false;
  
  container.innerHTML = `
    <button class="back-btn" onclick="goPage('learn')">← חזרה</button>
    <div style="text-align:center;margin-bottom:8px">
      <span style="font-size:.75rem;color:var(--text3)">כרטיס ${ankiIdx + 1}/${ankiQueue.length}</span>
    </div>
    <div class="progress-bar" style="margin-bottom:16px"><div class="progress-fill" style="width:${(ankiIdx/ankiQueue.length)*100}%"></div></div>
    
    <div class="anki-card" id="ankiCard" onclick="Practice.revealAnki()">
      <div class="anki-cat">${card.cat || ''}</div>
      <div class="anki-front">${card.front}</div>
      <button class="speak-btn" onclick="event.stopPropagation();speak('${esc(card.front)}')" style="margin:8px auto">🔊</button>
      <div class="anki-back" id="ankiBack">${card.back}</div>
      <div style="font-size:.7rem;color:var(--text3);margin-top:8px">לחץ להפוך</div>
    </div>
    
    <div class="anki-buttons" id="ankiButtons" style="display:none">
      <div class="anki-btn anki-btn-forgot" onclick="Practice.rateAnki(0)">שכחתי<span class="anki-btn-time">1m</span></div>
      <div class="anki-btn anki-btn-hard" onclick="Practice.rateAnki(1)">קשה<span class="anki-btn-time">6m</span></div>
      <div class="anki-btn anki-btn-good" onclick="Practice.rateAnki(2)">טוב<span class="anki-btn-time">1d</span></div>
      <div class="anki-btn anki-btn-easy" onclick="Practice.rateAnki(3)">קל<span class="anki-btn-time">3d</span></div>
    </div>
  `;
  
  speak(card.front);
}

function revealAnki() {
  if (ankiRevealed) return;
  ankiRevealed = true;
  document.getElementById('ankiCard').classList.add('revealed');
  document.getElementById('ankiButtons').style.display = 'grid';
}

function rateAnki(quality) {
  // SM-2 simplified
  const card = ankiQueue[ankiIdx];
  const c = anki[card.front];
  if (!c) { ankiIdx++; renderAnkiCard(); return; }
  
  if (quality === 0) { // forgot
    c.interval = 1; c.ease = Math.max(1.3, c.ease - 0.2); c.lapses++;
    c.due = Date.now() + 60000; // 1 min
  } else if (quality === 1) { // hard
    c.interval = Math.max(1, Math.round(c.interval * 1.2));
    c.ease = Math.max(1.3, c.ease - 0.15);
    c.due = Date.now() + c.interval * 3600000;
  } else if (quality === 2) { // good
    c.interval = Math.max(1, Math.round(c.interval * c.ease));
    c.due = Date.now() + c.interval * 86400000;
  } else { // easy
    c.interval = Math.max(1, Math.round(c.interval * c.ease * 1.3));
    c.ease += 0.15;
    c.due = Date.now() + c.interval * 86400000;
  }
  
  saveAnki();
  ankiIdx++;
  renderAnkiCard();
}

// ═══════════════════════════════════════
// CILS EXAM
// ═══════════════════════════════════════
function startCILSExam(level) {
  const examData = (APP_DATA.cilsExams || []).find(e => e.level === level);
  if (!examData) { toast('אין מבחן זמין לרמה זו', 'error'); return; }
  
  goPage('practice');
  const questions = examData.questions || [];
  quizIdx = 0; quizScore = 0; quizCombo = 0;
  currentQuiz = questions;
  Practice._quizNode = { id: 'exam_' + level, name: 'CILS ' + level, icon: '📋', level };
  
  renderExamQuestion(level);
}

function renderExamQuestion(level) {
  const container = document.getElementById('practiceContent');
  if (quizIdx >= currentQuiz.length) {
    const pct = Math.round(quizScore / (currentQuiz.length * 10) * 100);
    const prog = getNodeProgress('exam_' + level);
    if (pct >= 70 && prog.crown < 5) {
      state.nodeProgress['exam_' + level] = { crown: prog.crown + 1, done: true, bestScore: pct };
      save();
    }
    container.innerHTML = `
      <div style="text-align:center;padding:40px 20px">
        <div style="font-size:4rem;margin-bottom:16px">${pct >= 70 ? '🏆' : '📚'}</div>
        <h2 style="font-weight:800">${pct >= 70 ? 'עברת!' : 'כמעט...'}</h2>
        <p style="color:var(--text2)">CILS ${level}: ${pct}%</p>
        ${pct >= 70 ? '<p style="color:var(--emerald)">✅ מוכן לגשת למבחן!</p>' : '<p style="color:var(--orange)">חזור ותרגל עוד</p>'}
        <button class="btn btn-primary" onclick="SkillTree.render()">חזרה למסלול →</button>
      </div>
    `;
    if (pct >= 70) confetti();
    return;
  }
  
  const q = currentQuiz[quizIdx];
  container.innerHTML = `
    <button class="back-btn" onclick="SkillTree.render()">← חזרה</button>
    <div style="text-align:center;margin-bottom:8px;font-size:.8rem;color:var(--text3)">📋 CILS ${level} — שאלה ${quizIdx+1}/${currentQuiz.length}</div>
    <div class="progress-bar" style="margin-bottom:16px"><div class="progress-fill" style="width:${(quizIdx/currentQuiz.length)*100}%"></div></div>
    
    <div class="card" style="text-align:center;padding:20px">
      <div style="font-size:.7rem;color:var(--indigo-light);margin-bottom:8px">${q.section || 'חלק ' + (quizIdx+1)}</div>
      <div style="font-size:1rem;font-weight:600;line-height:1.6">${q.q}</div>
    </div>
    ${q.options ? q.options.map(o => `
      <div class="quiz-option" onclick="Practice.answerCILS(this,'${esc(o)}','${esc(q.a)}','${level}')">${o}</div>
    `).join('') : `
      <input type="text" id="cilsInput" placeholder="..." 
        style="width:100%;padding:14px;background:var(--surface);border:2px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:1rem;margin-top:12px;text-align:center;direction:ltr"
        onkeydown="if(event.key==='Enter')Practice.checkCILSTyped('${esc(q.a)}','${level}')">
      <button class="btn btn-primary btn-block" style="margin-top:8px" onclick="Practice.checkCILSTyped('${esc(q.a)}','${level}')">בדוק</button>
    `}
  `;
}

function answerCILS(el, chosen, correct, level) {
  const isCorrect = chosen === correct;
  el.parentElement.querySelectorAll('.quiz-option').forEach(o => {
    o.classList.add('disabled');
    if (o.textContent === correct) o.classList.add('reveal');
  });
  if (isCorrect) { el.classList.add('correct'); quizScore += 10; quizCombo++; }
  else { el.classList.add('wrong'); quizCombo = 0; }
  setTimeout(() => { quizIdx++; renderExamQuestion(level); }, 1200);
}

function checkCILSTyped(correct, level) {
  const input = document.getElementById('cilsInput');
  const score = fuzzyMatch(input.value.trim(), correct);
  if (score >= 70) { quizScore += 10; quizCombo++; input.style.borderColor='var(--emerald)'; }
  else { quizCombo = 0; input.style.borderColor='var(--red)'; input.value = correct; }
  setTimeout(() => { quizIdx++; renderExamQuestion(level); }, 1500);
}

// ═══════════════════════════════════════
// WEAK WORDS PRACTICE
// ═══════════════════════════════════════
function startWeakWords() {
  if (!state.weakWords || state.weakWords.length === 0) {
    toast('✅ אין מילים חלשות!', 'success'); return;
  }
  
  goPage('practice');
  const container = document.getElementById('practiceContent');
  const weak = state.weakWords.slice(0, 10);
  
  container.innerHTML = `
    <button class="back-btn" onclick="goPage('learn')">← חזרה</button>
    <h2 class="section-title"><span class="emoji">💪</span> מילים חלשות — אימון ממוקד</h2>
    <p style="font-size:.85rem;color:var(--text2);margin-bottom:16px">אלו המילים שטעית בהן הכי הרבה. תרגל אותן!</p>
    ${weak.map(w => {
      const wordData = findWord(w.word);
      if (!wordData) return '';
      return `
        <div class="word-item">
          <div class="word-left">
            <div class="word-it">${wordData.target}</div>
            <div class="word-he">${wordData.native}</div>
          </div>
          <div class="word-right">
            <span style="font-size:.7rem;color:var(--red)">❌ ${w.misses} טעויות</span>
            <button class="speak-btn" onclick="speak('${esc(wordData.target)}')">🔊</button>
          </div>
        </div>
      `;
    }).join('')}
    <button class="btn btn-primary btn-block" style="margin-top:16px" onclick="Practice.startWeakQuiz()">🧠 התחל חידון ממוקד</button>
  `;
}

function startWeakQuiz() {
  if (!state.weakWords || state.weakWords.length < 3) return;
  const weak = state.weakWords.slice(0, 8);
  const words = weak.map(w => findWord(w.word)).filter(Boolean);
  if (words.length < 3) { toast('אין מספיק מילים', 'error'); return; }
  
  currentQuiz = [];
  words.forEach(w => {
    const distractors = getDistractors(APP_DATA.words || [], w, 'native');
    currentQuiz.push({ type: 'choose', q: w.target, a: w.native, options: shuffle([w.native, ...distractors]).slice(0, 4), qLang: 'target' });
  });
  quizIdx = 0; quizScore = 0; quizCombo = 0;
  Practice._quizNode = { id: 'weak_words', name: 'מילים חלשות', icon: '💪', level: state.currentLevel || 'A1' };
  renderQuizQuestion(Practice._quizNode);
}

function findWord(it) {
  return (APP_DATA.words || []).find(w => w.target === it);
}

// ═══════════════════════════════════════
// MAIN RENDER — Immediate Mixed Practice
// ═══════════════════════════════════════
function render() {
  // Start mixed practice immediately — no menu
  startMixedPractice(false);
}

// ═══════════════════════════════════════
// MIXED PRACTICE — All Categories
// ═══════════════════════════════════════
function getWordsForLevel(level) {
  const levelOrder = ['A1','A2','B1','B2','C1','C2'];
  const maxIdx = levelOrder.indexOf(level);
  if (maxIdx === -1) return [];
  
  const nodes = (APP_DATA.skillTree || []).filter(n => {
    const idx = levelOrder.indexOf(n.level);
    return idx >= 0 && idx <= maxIdx;
  });
  
  let allWords = [];
  nodes.forEach(n => {
    const words = getWordsForNode(n);
    if (words.length > 0) allWords = allWords.concat(words);
  });
  
  // Deduplicate by target
  const seen = new Set();
  allWords = allWords.filter(w => {
    if (seen.has(w.target)) return false;
    seen.add(w.target);
    return true;
  });
  
  return shuffle(allWords);
}

function startMixedPractice(isFull) {
  const allWords = getWordsForLevel(state.level || 'A1');
  if (allWords.length < 4) {
    showPracticeMenu();
    return;
  }
  
  const count = isFull ? Math.min(allWords.length, 20) : Math.min(allWords.length, 8);
  const chosen = allWords.slice(0, count);
  
  const mixedNode = {
    id: isFull ? 'full_mixed_practice' : 'mixed_practice',
    name: isFull ? 'תרגול מלא' : 'תרגול מעורב',
    icon: '🎯',
    words: chosen,
    isMixed: true,
    isFull: isFull
  };
  
  // Call startQuiz directly without goPage to avoid re-triggering render()
  Practice._quizNode = mixedNode;
  const words = mixedNode.words || getWordsForNode(mixedNode);
  if (words.length < 4) { showPracticeMenu(); return; }
  
  // Build quiz questions directly
  currentQuiz = [];
  const shuffled = shuffle([...words]);
  
  // Type 1: IT→HE (choose)
  shuffled.slice(0, 3).forEach(w => {
    const distractors = getDistractors(words, w, 'native');
    currentQuiz.push({ type: 'choose', q: w.target, a: w.native, options: shuffle([w.native, ...distractors]).slice(0, 4), qLang: 'target' });
  });
  
  // Type 2: HE→IT (choose)
  shuffled.slice(3, 6).forEach(w => {
    const distractors = getDistractors(words, w, 'target');
    currentQuiz.push({ type: 'choose', q: w.native, a: w.target, options: shuffle([w.target, ...distractors]).slice(0, 4), qLang: 'native' });
  });
  
  // Type 3: type it
  if (shuffled.length > 6) {
    shuffled.slice(6, count).forEach(w => {
      currentQuiz.push({ type: 'type', q: w.native, a: w.target, qLang: 'native' });
    });
  }
  
  quizIdx = 0; quizScore = 0; quizCombo = 0; quizMaxCombo = 0;
  renderQuizQuestion(mixedNode);
}

// ═══════════════════════════════════════
// PRACTICE MENU — Old category picker
// ═══════════════════════════════════════
function showPracticeMenu() {
  const container = document.getElementById('practiceContent');
  const ankiDue = getAnkiDueCount();
  const weakCount = (state.weakWords || []).length;
  
  container.innerHTML = `
    <h2 class="section-title"><span class="emoji">🎯</span> תרגול</h2>
    <p style="font-size:.85rem;color:var(--text3);margin:-8px 0 12px">עבר לתפריט נושאים</p>
    
    ${ankiDue > 0 ? `
      <div class="card card-clickable" style="border-color:var(--indigo)" onclick="Practice.startAnki()">
        <div class="card-title">🧠 חזרות Anki</div>
        <div class="card-desc">${ankiDue} כרטיסים מחכים לחזרה</div>
        <button class="btn btn-primary btn-sm" style="margin-top:8px">התחל</button>
      </div>
    ` : ''}
    
    ${weakCount > 0 ? `
      <div class="card card-clickable" style="border-color:var(--red)" onclick="Practice.startMistakesReview()">
        <div class="card-title">💪 מילים חלשות</div>
        <div class="card-desc">${weakCount} מילים שטעית בהן — אימון ממוקד</div>
        <button class="btn btn-danger btn-sm" style="margin-top:8px">תרגל</button>
      </div>
    ` : ''}
    
    <h3 class="section-title"><span class="emoji">📝</span> בחר נושא לתרגול</h3>
    <div class="cat-grid">
      ${(APP_DATA.skillTree || []).slice(0, 12).map(n => {
        const prog = getNodeProgress(n.id);
        const unlocked = isUnlocked(n);
        return `
          <div class="cat-item ${!unlocked?'locked':''}" onclick="${unlocked ? `Practice.startQuiz(APP_DATA.skillTree.find(x=>x.id==='${n.id}'))` : ''}">
            <div class="cat-icon">${n.icon}</div>
            <div class="cat-name">${n.name}</div>
            <div class="cat-count">${prog.crown}/5 👑</div>
          </div>
        `;
      }).join('')}
    </div>
    
    <h3 class="section-title"><span class="emoji">🎤</span> תרגול הקלטה</h3>
    <div class="card card-clickable" onclick="Practice.startRandomSentences()">
      <div class="card-title">🗣️ משפטים אקראיים</div>
      <div class="card-desc">תרגל הגייה עם הקלטה וציון</div>
      <button class="btn btn-primary btn-sm" style="margin-top:8px">🎤 התחל</button>
    </div>
    <div class="card card-clickable" style="border-color:var(--indigo)" onclick="SentBuild.start()">
      <div class="card-title">🧩 בניית משפטים</div>
      <div class="card-desc">סדר את המילים במשפט הנכון — אתגר סדר מילים</div>
      <button class="btn btn-primary btn-sm" style="margin-top:8px">🧩 התחל</button>
    </div>
    <div class="card card-clickable" style="border-color:var(--indigo)" onclick="Listening.start('${state.level}')">
      <div class="card-title">🎧 הבנת הנשמע</div>
      <div class="card-desc">שמע משפט באיטלקית ובחר את התרגום הנכון בעברית</div>
      <button class="btn btn-primary btn-sm" style="margin-top:8px">🎧 התחל</button>
    </div>
    <div class="card card-clickable" style="border-color:var(--orange)" onclick="nav('exams')">
      <div class="card-title">📝 מבחנים רשמיים</div>
      <div class="card-desc">התכונן למבחני ההסמכה של AIL Firenze — DELI, DILI, DALI</div>
      <button class="btn btn-primary btn-sm" style="margin-top:8px">📝 פתח</button>
    </div>
    <div class="card card-clickable" onclick="nav('grammar')">
      <div class="card-title">📖 טיפים דקדוקיים</div>
      <div class="card-desc">35 טיפים דקדוקיים מאיטלקית ברמות A1 עד C2</div>
      <button class="btn btn-primary btn-sm" style="margin-top:8px">📖 פתח</button>
    </div>
  `;
}

function startRandomSentences() {
  const allSentences = APP_DATA.sentences || [];
  if (allSentences.length === 0) { toast('אין משפטים', 'error'); return; }
  sentenceQueue = shuffle([...allSentences]).slice(0, 10);
  sentenceIdx = 0;
  goPage('practice');
  renderSentence();
}

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════
function getWordsForNode(node) {
  var cat = node.category || node.id;
  // Try exact match first
  var found = (APP_DATA.words || []).filter(function(w) { return w.cat === cat; });
  if (found.length > 0) return found.slice(0, 8);
  // Try Hebrew category match via CATEGORY_MAP
  var heCat = window.CATEGORY_MAP && window.CATEGORY_MAP[cat];
  if (heCat) {
    found = (APP_DATA.words || []).filter(function(w) { return w.cat === heCat; });
    if (found.length > 0) return found.slice(0, 8);
  }
  // Try catAliases
  found = (APP_DATA.words || []).filter(function(w) { return w.catAliases && w.catAliases.indexOf(cat) !== -1; });
  if (found.length > 0) return found.slice(0, 8);
  // Try partial name match
  found = (APP_DATA.words || []).filter(function(w) { return node.name.indexOf(w.cat) !== -1 || w.cat.indexOf(node.name) !== -1; });
  return found.slice(0, 8);
}

function getSentencesForNode(node) {
  var cat = node.category || node.id;
  // Try exact match first
  var found = (APP_DATA.sentences || []).filter(function(s) { return s.cat === cat; });
  if (found.length > 0) return found.slice(0, 5);
  // Try Hebrew category match via CATEGORY_MAP
  var heCat = window.CATEGORY_MAP && window.CATEGORY_MAP[cat];
  if (heCat) {
    found = (APP_DATA.sentences || []).filter(function(s) { return s.cat === heCat; });
    if (found.length > 0) return found.slice(0, 5);
  }
  // Try catAliases
  found = (APP_DATA.sentences || []).filter(function(s) { return s.catAliases && s.catAliases.indexOf(cat) !== -1; });
  if (found.length > 0) return found.slice(0, 5);
  // Try partial name match
  found = (APP_DATA.sentences || []).filter(function(s) { return node.name.indexOf(s.cat) !== -1 || s.cat.indexOf(node.name) !== -1; });
  return found.slice(0, 5);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getDistractors(words, correct, field) {
  const others = words.filter(w => w[field] !== correct[field]);
  return shuffle([...others]).slice(0, 3).map(w => w[field]);
}

function esc(s) {
  return String(s).replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ');
}

function getNodeProgress(nodeId) {
  return state.nodeProgress[nodeId] || { crown: 0, done: false, bestScore: 0 };
}

function isUnlocked(node) {
 if (!node.prerequisite) return true;
 const prev = APP_DATA.skillTree.find(n => n.id === node.prerequisite);
 if (!prev) return true;
 return getNodeProgress(prev.id).crown >= 0; // all unlocked for beta
}

// ── EXPOSE ──
return {
  render, showPracticeMenu, startMixedPractice, getWordsForLevel,
  startWordLesson, startSentenceLesson, startQuiz, startDialogue,
  startAnki, startCILSExam, startMatchGame, renderMatchGame, handleMatchClick, startMistakesReview, startWeakWords, startRandomSentences,
  answerWord, checkTyped, recordWord, answerQuiz, checkQuizTyped,
  answerDialogue, recordDialogue, nextDialogueLine,
  revealAnki, rateAnki, getAnkiDueCount,
  answerCILS, checkCILSTyped, startWeakQuiz,
  nextSentence, renderSentence, recordSentence,
  _wordLesson: null, _quizNode: null, _dialogueNode: null, _insideStartQuiz: false
};

})();


// ═══════════════════════════════════════
// MATCH PAIRS GAME
// ═══════════════════════════════════════
let matchState = null;

function startMatchGame(node) {
  const container = document.getElementById('practiceContent');
  if (!container) return;
  
  const words = (node && node.words) ? node.words : shuffle(APP_DATA.words || []).slice(0, 5);
  if (words.length < 4) return toast('אין מספיק מילים לשלב זה', 'warning');
  
  const pool = words.slice(0, 4);
  const cards = [];
  pool.forEach(w => {
    cards.push({ id: w.target, text: w.target, type: 'target', w });
    cards.push({ id: w.target, text: w.native, type: 'native', w });
  });
  
  matchState = {
    cards: shuffle(cards),
    selected: null,
    matched: 0,
    total: pool.length,
    node: node
  };
  
  renderMatchGame();
}

function renderMatchGame() {
  const container = document.getElementById('practiceContent');
  if (!container) return;
  
  let html = `
    <button class="back-btn" onclick="nav('learn')">← סיום</button>
    <div style="text-align:center;margin-bottom:20px">
      <h2 style="font-size:1.4rem;font-weight:800">התאמת זוגות 🧩</h2>
      <p style="font-size:.85rem;color:var(--text2)">לחץ על מילה באיטלקית ואז על התרגום שלה</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:10px">
  `;
  
  matchState.cards.forEach((c, idx) => {
    const isMatched = c.matched ? 'opacity:0;pointer-events:none' : '';
    const isSelected = (matchState.selected === idx) ? 'border-color:var(--primary);background:var(--surface2)' : '';
    html += `
      <div class="card card-clickable" style="text-align:center;font-weight:700;${isMatched};${isSelected}"
        onclick="Practice.handleMatchClick(${idx})">
        ${c.text}
      </div>
    `;
  });
  
  html += `</div>`;
  container.innerHTML = html;
}

function handleMatchClick(idx) {
  const c = matchState.cards[idx];
  if (c.matched) return;
  
  if (matchState.selected === null) {
    matchState.selected = idx;
    if (c.type === 'target') speak(c.text);
    renderMatchGame();
  } else {
    const prev = matchState.cards[matchState.selected];
    if (matchState.selected === idx) {
      // deselect
      matchState.selected = null;
      renderMatchGame();
      return;
    }
    
    if (prev.id === c.id && prev.type !== c.type) {
      // Match!
      if (c.type === 'target') speak(c.text);
      else speak(prev.text);
      
      prev.matched = true;
      c.matched = true;
      matchState.matched++;
      matchState.selected = null;
      
      if (matchState.matched >= matchState.total) {
        addXP(20);
        confetti();
        setTimeout(() => nav('learn'), 1500);
      } else {
        renderMatchGame();
      }
    } else {
      // Wrong
      toast('טעות!', 'error');
      const h = getHearts();
      if (h.count > 0) useHeart();
      matchState.selected = null;
      renderMatchGame();
    }
  }
}

// ═══════════════════════════════════════
// PRACTICE MISTAKES (SRS)
// ═══════════════════════════════════════
function startMistakesReview() {
  const weak = state.weakWords || [];
  if (weak.length < 3) return toast('אין לך מספיק מילים חלשות כדי לתרגל! כל הכבוד!', 'success');
  
  // Convert weak words strings back to word objects
  const wordsToPractice = weak.map(hw => (APP_DATA.words||[]).find(w => w.native === hw)).filter(Boolean).slice(0, 5);
  if (wordsToPractice.length < 3) return toast('אין מספיק מילים לתרגול.', 'warning');
  
  startWordLesson({ id: 'mistakes', name: 'תרגול טעויות', icon: '❤️', words: wordsToPractice });
}
