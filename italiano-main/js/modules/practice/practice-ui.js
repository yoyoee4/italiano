/* ══════════════════════════════════════════════
   VolaLingo — Practice UI Module
   Rendering, HTML generation for all practice types
   Sprint C4B: Enhanced UX - Feedback, animations, haptics
   ══════════════════════════════════════════════ */

const PracticeUI = (() => {

// ══════════════════════════════════════════════
// DEPENDENCIES
// ═══════════════════════════════════════════════
let _core = null;
let _exercises = null;
let _anki = null;
let _dialogue = null;
let _APP_CONFIG = null;

// ══════════════════════════════════════════════
// UX CONFIG
// ══════════════════════════════════════════════
const UX_CONFIG = {
  // Feedback timing
  feedbackDuration: 800,      // How long feedback shows before next question
  correctFlashDuration: 300,  // Green flash for correct
  wrongShakeDuration: 400,    // Shake animation for wrong
  
  // Haptic patterns (mobile)
  haptic: {
    correct: [10, 50, 10],      // Light double tap
    wrong: [50, 100, 50],       // Strong buzz
    milestone: [100, 50, 100],  // Celebration
    streak: [20, 50, 20, 50, 20] // Combo achieved
  },
  
  // Sound feedback
  sounds: {
    correct: 'correct',
    wrong: 'wrong',
    levelUp: 'levelup',
    streak: 'streak'
  },
  
  // Animation classes
  animations: {
    correct: 'answer-correct',
    wrong: 'answer-wrong',
    progressPulse: 'progress-pulse',
    comboBurst: 'combo-burst'
  }
};

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════
function init(coreModule, exercisesModule, ankiModule, dialogueModule) {
  _core = coreModule;
  _exercises = exercisesModule;
  _anki = ankiModule;
  _dialogue = dialogueModule;
  _APP_CONFIG = _core._APP_CONFIG;

  // Register render callback with core
  _core._renderCallback = render;

  console.log('🎨 PracticeUI module initialized (C4B UX enhanced)');
  return api;
}

// ══════════════════════════════════════════════
// FEEDBACK HELPERS
// ══════════════════════════════════════════════
function triggerHaptic(pattern) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

function playFeedbackSound(type) {
  // Use Web Audio API for instant feedback sounds
  // Fallback to simple beep if not available
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'correct') {
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1); // E6
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'wrong') {
      osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'streak') {
      // Rising arpeggio for combo
      [660, 880, 1320].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = freq;
        o.type = 'sine';
        g.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.08);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.2);
        o.start(ctx.currentTime + i * 0.08);
        o.stop(ctx.currentTime + i * 0.08 + 0.2);
      });
    }
  } catch (e) {
    // Silently fail - sound is enhancement only
  }
}

function showAnswerFeedback(element, isCorrect, onComplete) {
  if (!element) {
    onComplete?.();
    return;
  }
  
  const config = UX_CONFIG;
  
  if (isCorrect) {
    // Correct: green flash + haptic + sound
    element.classList.add(config.animations.correct);
    triggerHaptic(config.haptic.correct);
    playFeedbackSound('correct');
    
    // Add particle burst for extra delight
    createParticleBurst(element, '#10b981');
    
    setTimeout(() => {
      element.classList.remove(config.animations.correct);
      onComplete?.();
    }, config.correctFlashDuration);
  } else {
    // Wrong: shake + red flash + haptic + sound
    element.classList.add(config.animations.wrong);
    triggerHaptic(config.haptic.wrong);
    playFeedbackSound('wrong');
    
    setTimeout(() => {
      element.classList.remove(config.animations.wrong);
      onComplete?.();
    }, config.wrongShakeDuration);
  }
}

function createParticleBurst(element, color) {
  const rect = element.getBoundingClientRect();
  const container = document.getElementById('practiceContent') || document.body;
  
  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: fixed;
      left: ${rect.left + rect.width/2}px;
      top: ${rect.top + rect.height/2}px;
      width: 8px;
      height: 8px;
      background: ${color};
      border-radius: 50%;
      pointer-events: none;
      z-index: 1000;
      transform: translate(-50%, -50%);
    `;
    container.appendChild(particle);
    
    const angle = (i / 8) * Math.PI * 2;
    const distance = 60 + Math.random() * 40;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 40;
    
    particle.animate([
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
    ], {
      duration: 600,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }).onfinish = () => particle.remove();
  }
}

function showStreakFeedback(combo) {
  const config = UX_CONFIG;
  triggerHaptic(config.haptic.streak);
  playFeedbackSound('streak');
  
  // Show combo burst animation
  const comboEl = document.querySelector('.combo-display');
  if (comboEl) {
    comboEl.classList.add(config.animations.comboBurst);
    setTimeout(() => comboEl.classList.remove(config.animations.comboBurst), 500);
  }
}

function animateProgress(progressEl, newWidth) {
  if (!progressEl) return;
  progressEl.style.transition = 'width 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  progressEl.style.width = newWidth;
  
  // Pulse effect on progress update
  progressEl.classList.add('progress-pulse');
  setTimeout(() => progressEl.classList.remove('progress-pulse'), 500);
}

// ══════════════════════════════════════════════
// MAIN RENDER DISPATCHER
// ══════════════════════════════════════════════
function render(type, data) {
  const container = document.getElementById('practiceContent');
  if (!container) return;

  switch (type) {
    case 'word':
      container.innerHTML = renderWordPhase(data);
      break;
    case 'feedback':
      // Feedback is shown inline, don't replace whole container
      break;
    case 'complete':
      container.innerHTML = renderComplete(data);
      break;
    case 'sentence':
      container.innerHTML = renderSentence(data);
      break;
    case 'quiz':
      container.innerHTML = renderQuizQuestion(data);
      break;
    case 'exam':
      container.innerHTML = renderExamQuestion(data);
      break;
    case 'anki':
      container.innerHTML = renderAnkiCard(data);
      break;
    case 'anki-reveal':
      revealAnkiCard();
      break;
    case 'dialogue':
      container.innerHTML = renderDialogueLine(data);
      break;
    default:
      console.warn('PracticeUI: Unknown render type', type);
  }
}

function revealAnkiCard() {
  const card = document.getElementById('ankiCard');
  const buttons = document.getElementById('ankiButtons');
  if (card) card.classList.add('revealed');
  if (buttons) buttons.style.display = 'grid';
}

// ══════════════════════════════════════════════
// WORD LESSON RENDERING
// ══════════════════════════════════════════════
function renderWordPhase(data) {
  const { node, word, phase, wordIdx, words } = data;
  const isImageMode = !!word.img;

  let html = `
    <div style="text-align:center;margin-bottom:8px">
      <span style="font-size:.75rem;color:var(--text3)">מילה ${wordIdx + 1}/${words.length}</span>
    </div>
    <div class="progress-bar" style="margin-bottom:16px"><div class="progress-fill" style="width:${(wordIdx/words.length)*100}%"></div></div>
  `;

  if (phase === 0) {
    if (isImageMode) {
      const options = _getWordOptions(word, words, 'target', true);
      html += `
        <div class="card" style="text-align:center;padding:24px">
          <div style="font-size:4rem;margin-bottom:12px">${word.img}</div>
          <button class="speak-btn active" onclick="speak('${esc(word.target)}')" style="width:64px;height:64px;font-size:1.8rem;margin:0 auto 16px">🔊</button>
          <div style="font-size:.85rem;color:var(--text3)">Qual è la parola corretta?</div>
        </div>
        ${options.map(o => `
          <div class="quiz-option" onclick="PracticeExercises.answerWord(this,'${esc(o)}','${esc(word.target)}','${node.id}',${wordIdx},true)">${o}</div>
        `).join('')}
      `;
    } else {
      const options = _getWordOptions(word, words, 'native', false);
      html += `
        <div class="card" style="text-align:center;padding:24px">
          <button class="speak-btn active" onclick="speak('${esc(word.target)}')" style="width:64px;height:64px;font-size:1.8rem;margin:0 auto 16px">🔊</button>
          <div style="font-family:var(--font-it);font-size:1.6rem;font-weight:700;margin-bottom:4px">${word.target}</div>
          <div style="font-size:.85rem;color:var(--text3)">מה התרגום?</div>
        </div>
        ${options.map(o => `
          <div class="quiz-option" onclick="PracticeExercises.answerWord(this,'${esc(o)}','${esc(word.native)}','${node.id}',${wordIdx})">${o}</div>
        `).join('')}
      `;
    }
  } else if (phase === 1) {
    html += `
      <div class="card" style="text-align:center;padding:24px">
        <div style="font-size:1.3rem;font-weight:700;margin-bottom:4px">${word.native}</div>
        <div style="font-size:.85rem;color:var(--text3)">כתוב ב${_APP_CONFIG.targetName}</div>
      </div>
      <div style="padding:0 4px;margin-top:12px">
        <input type="text" id="typeInput" placeholder="כתוב כאן..."
          style="width:100%;padding:14px;background:var(--surface);border:2px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:1.1rem;font-family:var(--font-it);text-align:center;direction:ltr"
          onkeydown="if(event.key==='Enter')PracticeExercises.checkTyped('${esc(word.target)}','${node.id}',${wordIdx})">
        <button class="btn btn-primary btn-block" style="margin-top:8px" onclick="PracticeExercises.checkTyped('${esc(word.target)}','${node.id}',${wordIdx})">בדוק →</button>
      </div>
    `;
  } else {
    html += `
      <div class="card" style="text-align:center;padding:24px">
        <button class="speak-btn active" onclick="speak('${esc(word.target)}')" style="width:64px;height:64px;font-size:1.8rem;margin:0 auto 16px">🔊</button>
        <div style="font-size:.85rem;color:var(--text3)">הגה את המילה</div>
        <div style="font-size:.8rem;color:var(--text2);margin-top:4px">💡 רמז: ${word.native}</div>
      </div>
      <div class="record-flow">
        <button class="mic-btn" id="micBtn" onclick="PracticeExercises.recordWord('${esc(word.target)}','${node.id}',${wordIdx})">🎤</button>
        <div id="recordResult" style="text-align:center"></div>
      </div>
    `;
  }

  return `
    <button class="back-btn" onclick="goPage('learn')">← חזרה</button>
    <div style="text-align:center;margin-bottom:12px">
      <span style="font-size:1.2rem">${node.icon}</span>
      <span style="font-weight:700;margin-right:6px">${node.name}</span>
    </div>
    ${html}
  `;
}

function _getWordOptions(word, words, field, isImageMode) {
  const correct = isImageMode ? word.target : word.native;
  const distractors = _core.getDistractors(words, word, field);
  return shuffle([correct, ...distractors]).slice(0, 4);
}

function renderComplete(data) {
  if (data.type === 'word') {
    const { node, words, learned, total, pct } = data;
    return `
      <div style="text-align:center;padding:40px 20px">
        <div style="font-size:4rem;margin-bottom:16px">${pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
        <h2 style="font-weight:800">${pct >= 80 ? 'מצוין!' : pct >= 50 ? 'כל הכבוד!' : 'המשך להתאמן!'}</h2>
        <p style="color:var(--text2);margin:8px 0">למדת ${learned}/${total} מילים חדשות</p>
        <div class="progress-bar" style="margin:16px auto;max-width:200px"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div style="margin:16px 0"><span class="coin-badge">+${Math.ceil(pct/5)} 💎</span></div>
        <button class="btn btn-primary" onclick="SkillTree.completeNode('${node.id}',${pct});SkillTree.render()">המשך →</button>
      </div>
    `;
  }
  if (data.type === 'sentence') {
    return `
      <div style="text-align:center;padding:40px 20px">
        <div style="font-size:4rem;margin-bottom:16px">🗣️</div>
        <h2 style="font-weight:800">סיימת את המשפטים!</h2>
        <button class="btn btn-primary" onclick="PracticeCore.render()">המשך →</button>
      </div>
    `;
  }
  if (data.type === 'quiz') {
    const { node, score, maxScore, pct, maxCombo, isMixed, isFull } = data;
    if (isMixed) {
      return `
        <div style="text-align:center;padding:40px 20px">
          <div style="font-size:4rem;margin-bottom:16px">${pct >= 80 ? '🌟' : pct >= 50 ? '👍' : '💪'}</div>
          <h2 style="font-weight:800">${pct >= 80 ? 'מצוין!' : pct >= 50 ? 'כל הכבוד!' : 'המשך להתאמן!'}</h2>
          <p style="color:var(--text2);margin:8px 0">ציון: ${score}/${maxScore} (${pct}%)</p>
          ${maxCombo >= 3 ? `<p style="color:var(--orange)">🔥 קומבו מקסימלי: x${maxCombo}</p>` : ''}
          <div style="margin:16px 0"><span class="coin-badge">+${Math.ceil(pct/5)} 💎</span></div>
          <div style="display:flex;flex-direction:column;gap:10px;margin-top:20px">
            <button class="btn btn-primary btn-block" onclick="PracticeCore.startMixedPractice(false)">🎯 תרגול מעורב נוסף</button>
            ${!isFull ? `<button class="btn btn-primary btn-block" style="border-color:var(--emerald);color:var(--emerald);background:transparent" onclick="PracticeCore.startMixedPractice(true)">📚 תרגול מלא — כל המילים</button>` : ''}
            <button class="btn btn-secondary btn-block" onclick="PracticeCore.showPracticeMenu()">📋 תפריט נושאים</button>
          </div>
        </div>
      `;
    }
    return `
      <div style="text-align:center;padding:40px 20px">
        <div style="font-size:4rem;margin-bottom:16px">${pct >= 80 ? '🌟' : pct >= 50 ? '👍' : '💪'}</div>
        <h2 style="font-weight:800">${pct >= 80 ? 'מצוין!' : pct >= 50 ? 'כל הכבוד!' : 'המשך להתאמן!'}</h2>
        <p style="color:var(--text2);margin:8px 0">ציון: ${score}/${maxScore} (${pct}%)</p>
        ${maxCombo >= 3 ? `<p style="color:var(--orange)">🔥 קומבו מקסימלי: x${maxCombo}</p>` : ''}
        <div style="margin:16px 0"><span class="coin-badge">+${Math.ceil(pct/5)} 💎</span></div>
        <button class="btn btn-primary" onclick="SkillTree.completeNode('${node.id}',${pct});PracticeCore.render()">המשך →</button>
      </div>
    `;
  }
  if (data.type === 'exam') {
    const { level, pct, passed } = data;
    return `
      <div style="text-align:center;padding:40px 20px">
        <div style="font-size:4rem;margin-bottom:16px">${passed ? '🏆' : '📚'}</div>
        <h2 style="font-weight:800">${passed ? 'עברת!' : 'כמעט...'}</h2>
        <p style="color:var(--text2)">CILS ${level}: ${pct}%</p>
        ${passed ? '<p style="color:var(--emerald)">✅ מוכן לגשת למבחן!</p>' : '<p style="color:var(--orange)">חזור ותרגל עוד</p>'}
        <button class="btn btn-primary" onclick="SkillTree.render()">חזרה למסלול →</button>
      </div>
    `;
  }
  if (data.type === 'anki') {
    const { reviewed } = data;
    return `
      <div style="text-align:center;padding:40px 20px">
        <div style="font-size:4rem;margin-bottom:16px">🧠</div>
        <h2 style="font-weight:800">סיימת את החזרות!</h2>
        <p style="color:var(--text2)">${reviewed} כרטיסים נבדקו</p>
        <button class="btn btn-primary" onclick="PracticeCore.render()">המשך →</button>
      </div>
    `;
  }
  if (data.type === 'dialogue') {
    return `
      <div style="text-align:center;padding:40px 20px">
        <div style="font-size:4rem;margin-bottom:16px">💬</div>
        <h2 style="font-weight:800">סיימת את השיחה!</h2>
        <button class="btn btn-primary" onclick="PracticeCore.render()">המשך →</button>
      </div>
    `;
  }
  return '';
}

// ══════════════════════════════════════════════
// SENTENCE LESSON RENDERING
// ══════════════════════════════════════════════
function renderSentence(data) {
  const { sentence, index, total, hasRecording } = data;
  const s = sentence;

  return `
    <button class="back-btn" onclick="goPage('learn')">← חזרה</button>
    <div style="text-align:center;margin-bottom:8px">
      <span style="font-size:.75rem;color:var(--text3)">משפט ${index + 1}/${total}</span>
    </div>
    <div class="progress-bar" style="margin-bottom:16px"><div class="progress-fill" style="width:${(index/total)*100}%"></div></div>

    <div class="sentence-card">
      <div style="font-size:.7rem;color:var(--text3);margin-bottom:4px">${_APP_CONFIG.targetFlag} ${_APP_CONFIG.targetName}</div>
      <div class="sentence-it">${s.target}</div>
      <div style="font-size:.7rem;color:var(--text3);margin-top:12px;margin-bottom:4px">${_APP_CONFIG.nativeFlag} ${_APP_CONFIG.nativeName}</div>
      <div class="sentence-he">${s.native}</div>
    </div>

    <div class="record-flow">
      <div class="record-step active" id="step1">1️⃣ האזן 🐢</div>
      <div class="record-step" id="step2">2️⃣ האזן רגיל</div>
      <div class="record-step" id="step3">3️⃣ הקלט 🎤</div>
      <div class="record-step" id="step4">4️⃣ בדוק ציון</div>
    </div>

    <div style="display:flex;justify-content:center;gap:12px;margin:16px 0">
      <button class="btn btn-secondary btn-sm" onclick="speak('${esc(s.target)}',undefined,0.5)">🐢 איטי</button>
      <button class="btn btn-primary btn-sm" onclick="speak('${esc(s.target)}')">🔊 רגיל</button>
      <button class="mic-btn" id="micBtn" onclick="PracticeExercises.recordSentence('${esc(s.target)}')" style="width:48px;height:48px;font-size:1.2rem">🎤</button>
    </div>

    <div id="sentenceResult" style="text-align:center"></div>

    <div style="display:flex;gap:8px;margin-top:16px">
      <button class="btn btn-secondary btn-block" onclick="PracticeExercises.renderSentence()">🔄 עוד פעם</button>
      <button class="btn btn-primary btn-block" onclick="PracticeExercises.nextSentence()">הבא →</button>
    </div>
  `;
}

// ══════════════════════════════════════════════
// QUIZ RENDERING
// ══════════════════════════════════════════════
function renderQuizQuestion(data) {
  const { question, index, total, node } = data;
  const q = question;
  const hearts = _core.getHearts();
  const session = _core.getSession();
  const streak = session?.streak || 0;
  const combo = session?.combo || 0;

  let html = `
    <div style="text-align:center;margin-bottom:8px">
      <span style="font-size:.75rem;color:var(--text3)">שאלה ${index + 1}/${total}</span>
    </div>
    <div class="progress-bar" style="margin-bottom:4px">
      <div class="progress-fill ${session?.type === 'quiz' && streak > 0 ? 'streak' : ''}" style="width:${(index/total)*100}%"></div>
    </div>
    <div class="progress-labels">
      <div class="progress-label">
        <span class="value">${index + 1}</span>
        <span class="label">הנוכחית</span>
      </div>
      <div class="progress-label">
        <span class="value">${total}</span>
        <span class="label">סה"כ</span>
      </div>
      <div class="progress-label">
        <span class="value">${Math.round((index/total)*100)}%</span>
        <span class="label">התקדמות</span>
      </div>
    </div>
    ${combo >= 3 ? `<div class="combo-display combo-burst">🔥 x${combo} <span class="combo-x">קומבו!</span></div>` : ''}
    ${streak > 0 ? `<div class="streak-display"><span class="streak-flame">🔥</span><span class="streak-count">${streak}</span><span class="streak-label">רצף</span></div>` : ''}
  `;

  if (q.type === 'choose') {
    html += `
      <div class="card" style="text-align:center;padding:24px">
        <div style="font-family:${q.qLang==='it'?'var(--font-it)':'var(--font-he)'};font-size:1.5rem;font-weight:700">${q.q}</div>
        ${q.qLang === 'target' ? `<button class="btn btn-sm btn-secondary" onclick="speak('${esc(q.q)}')" style="margin-top:8px">🔊</button>` : ''}
        <div style="font-size:.85rem;color:var(--text3);margin-top:8px">${q.qLang === 'target' ? 'מה התרגום?' : 'כתוב ב${_APP_CONFIG.targetName}'}</div>
      </div>
      ${q.options.map((o, i) => `
        <div class="quiz-option" data-key="${i+1}" onclick="PracticeExercises.answerQuiz(this,'${esc(o)}','${esc(q.a)}')">
          <span class="option-key">${i+1}</span>${o}
        </div>
      `).join('')}
    `;
  } else {
    html += `
      <div class="card" style="text-align:center;padding:24px">
        <div style="font-size:1.3rem;font-weight:700">${q.q}</div>
        <div style="font-size:.85rem;color:var(--text3);margin-top:8px">כתוב ב${_APP_CONFIG.targetName}</div>
      </div>
      <div style="padding:0 4px;margin-top:12px">
        <input type="text" id="quizInput" placeholder="..." autofocus
          style="width:100%;padding:14px;background:var(--surface);border:2px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:1.1rem;font-family:var(--font-it);text-align:center;direction:ltr"
          onkeydown="if(event.key==='Enter')PracticeExercises.checkQuizTyped('${esc(q.a)}')">
        <button class="btn btn-primary btn-block" style="margin-top:8px" onclick="PracticeExercises.checkQuizTyped('${esc(q.a)}')">בדוק</button>
      </div>
    `;
  }

  return `
    <button class="back-btn" onclick="goPage('learn')">← חזרה</button>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <span>❤️ ${'❤️'.repeat(hearts.count)}</span>
      <span style="font-size:.8rem;color:var(--text3)">🧠 ${node.icon} ${node.name}</span>
    </div>
    ${html}
  `;
}

// ══════════════════════════════════════════════
// CILS EXAM RENDERING
// ══════════════════════════════════════════════
function renderExamQuestion(data) {
  const { question, index, total, level } = data;
  const q = question;

  return `
    <button class="back-btn" onclick="SkillTree.render()">← חזרה</button>
    <div style="text-align:center;margin-bottom:8px;font-size:.8rem;color:var(--text3)">📋 CILS ${level} — שאלה ${index+1}/${total}</div>
    <div class="progress-bar" style="margin-bottom:16px"><div class="progress-fill" style="width:${(index/total)*100}%"></div></div>

    <div class="card" style="text-align:center;padding:20px">
      <div style="font-size:.7rem;color:var(--indigo-light);margin-bottom:8px">${q.section || 'חלק ' + (index+1)}</div>
      <div style="font-size:1rem;font-weight:600;line-height:1.6">${q.q}</div>
    </div>
    ${q.options ? q.options.map(o => `
      <div class="quiz-option" onclick="PracticeExercises.answerCILS(this,'${esc(o)}','${esc(q.a)}','${level}')">${o}</div>
    `).join('') : `
      <input type="text" id="cilsInput" placeholder="..."
        style="width:100%;padding:14px;background:var(--surface);border:2px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:1rem;margin-top:12px;text-align:center;direction:ltr"
        onkeydown="if(event.key==='Enter')PracticeExercises.checkCILSTyped('${esc(q.a)}','${level}')">
      <button class="btn btn-primary btn-block" style="margin-top:8px" onclick="PracticeExercises.checkCILSTyped('${esc(q.a)}','${level}')">בדוק</button>
    `}
  `;
}

// ══════════════════════════════════════════════
// ANKI RENDERING
// ══════════════════════════════════════════════
function renderAnkiCard(data) {
  const { card, index, total } = data;

  return `
    <button class="back-btn" onclick="goPage('learn')">← חזרה</button>
    <div style="text-align:center;margin-bottom:8px">
      <span style="font-size:.75rem;color:var(--text3)">כרטיס ${index + 1}/${total}</span>
    </div>
    <div class="progress-bar" style="margin-bottom:16px"><div class="progress-fill" style="width:${(index/total)*100}%"></div></div>

    <div class="anki-card" id="ankiCard" onclick="AnkiPractice.revealAnki()">
      <div class="anki-cat">${card.cat || ''}</div>
      <div class="anki-front">${card.front}</div>
      <button class="speak-btn" onclick="event.stopPropagation();speak('${esc(card.front)}')" style="margin:8px auto">🔊</button>
      <div class="anki-back" id="ankiBack">${card.back}</div>
      <div style="font-size:.7rem;color:var(--text3);margin-top:8px">לחץ להפוך</div>
    </div>

    <div class="anki-buttons" id="ankiButtons" style="display:none">
      <div class="anki-btn anki-btn-forgot" onclick="AnkiPractice.rateAnki(0)">שכחתי<span class="anki-btn-time">1m</span></div>
      <div class="anki-btn anki-btn-hard" onclick="AnkiPractice.rateAnki(1)">קשה<span class="anki-btn-time">6m</span></div>
      <div class="anki-btn anki-btn-good" onclick="AnkiPractice.rateAnki(2)">טוב<span class="anki-btn-time">1d</span></div>
      <div class="anki-btn anki-btn-easy" onclick="AnkiPractice.rateAnki(3)">קל<span class="anki-btn-time">3d</span></div>
    </div>
  `;
}

// ══════════════════════════════════════════════
// DIALOGUE RENDERING
// ══════════════════════════════════════════════
function renderDialogueLine(data) {
  const { line, index, total, isYou, node } = data;

  let html = `
    <button class="back-btn" onclick="goPage('learn')">← חזרה</button>
    <div class="dlg-progress">
      ${Array.from({length: total}, (_, i) => `
        <div class="dlg-dot ${i < index ? 'done' : (i === index ? 'current' : '')}"></div>
      `).join('')}
    </div>
  `;

  // Show previous lines
  // Note: We'd need access to full queue for this - simplified for now
  if (!isYou) {
    html += `
      <div class="dlg-npc">
        <div class="dlg-role">🧑‍🏫 ${line.name || 'NPC'}</div>
        <div class="dlg-text-it">${line.target}</div>
        <div class="dlg-text-he">${line.native}</div>
        <button class="btn btn-sm btn-secondary" onclick="speak('${esc(line.target)}')" style="margin-top:8px">🔊</button>
      </div>
      <div style="text-align:center;margin-top:16px">
        <button class="btn btn-primary" onclick="DialoguePractice.nextDialogueLine()">המשך →</button>
      </div>
    `;
  } else if (line.options) {
    html += `
      <div style="text-align:center;margin:16px 0;font-size:.85rem;color:var(--text3)">👤 בחר את התשובה שלך:</div>
      ${line.options.map(o => `
        <div class="quiz-option" onclick="DialoguePractice.answerDialogue(this,'${esc(o.target)}','${esc(line.target)}')">${o.target}<br><span style="font-size:.7rem;color:var(--text3)">${o.native}</span></div>
      `).join('')}
    `;
  } else {
    html += `
      <div style="text-align:center;margin:16px 0;font-size:.85rem;color:var(--text3)">👤 אמור: <strong style="color:var(--indigo-light)">${line.target}</strong></div>
      <div style="text-align:center">
        <button class="mic-btn" id="dlgMicBtn" onclick="DialoguePractice.recordDialogue('${esc(line.target)}')">🎤</button>
        <div id="dlgResult" style="margin-top:12px"></div>
      </div>
    `;
  }

  return html;
}

// ══════════════════════════════════════════════
// PRACTICE MENU
// ══════════════════════════════════════════════
function renderPracticeMenu() {
  const container = document.getElementById('practiceContent');
  const ankiDue = _anki.getAnkiDueCount();
  const weakCount = (_core._state?.weakWords || []).length;

  container.innerHTML = `
    <h2 class="section-title"><span class="emoji">🎯</span> תרגול</h2>
    <p style="font-size:.85rem;color:var(--text3);margin:-8px 0 12px">עבר לתפריט נושאים</p>

    ${ankiDue > 0 ? `
      <div class="card card-clickable" style="border-color:var(--indigo)" onclick="AnkiPractice.startAnki()">
        <div class="card-title">🧠 חזרות Anki</div>
        <div class="card-desc">${ankiDue} כרטיסים מחכים לחזרה</div>
        <button class="btn btn-primary btn-sm" style="margin-top:8px">התחל</button>
      </div>
    ` : ''}

    ${weakCount > 0 ? `
      <div class="card card-clickable" style="border-color:var(--red)" onclick="PracticeCore.startMistakesReview()">
        <div class="card-title">💪 מילים חלשות</div>
        <div class="card-desc">${weakCount} מילים שטעית בהן — אימון ממוקד</div>
        <button class="btn btn-danger btn-sm" style="margin-top:8px">תרגל</button>
      </div>
    ` : ''}

    <h3 class="section-title"><span class="emoji">📝</span> בחר נושא לתרגול</h3>
    <div class="cat-grid">
      ${(_core._APP_DATA?.skillTree || []).slice(0, 12).map(n => {
        const prog = _core.getNodeProgress(n.id);
        const unlocked = _core.isUnlocked(n);
        return `
          <div class="cat-item ${!unlocked?'locked':''}" onclick="${unlocked ? `PracticeCore.startQuiz(_APP_DATA.skillTree.find(x=>x.id==='${n.id}'))` : ''}">
            <div class="cat-icon">${n.icon}</div>
            <div class="cat-name">${n.name}</div>
            <div class="cat-count">${prog.crown}/5 👑</div>
          </div>
        `;
      }).join('')}
    </div>

    <h3 class="section-title"><span class="emoji">🎤</span> תרגול הקלטה</h3>
    <div class="card card-clickable" onclick="PracticeCore.startRandomSentences()">
      <div class="card-title">🗣️ משפטים אקראיים</div>
      <div class="card-desc">תרגל הגייה עם הקלטה וציון</div>
      <button class="btn btn-primary btn-sm" style="margin-top:8px">🎤 התחל</button>
    </div>
    <div class="card card-clickable" style="border-color:var(--indigo)" onclick="SentBuild.start()">
      <div class="card-title">🧩 בניית משפטים</div>
      <div class="card-desc">סדר את המילים במשפט הנכון — אתגר סדר מילים</div>
      <button class="btn btn-primary btn-sm" style="margin-top:8px">🧩 התחל</button>
    </div>
    <div class="card card-clickable" style="border-color:var(--indigo)" onclick="Listening.start('${_core._state?.level}')">
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

// ══════════════════════════════════════════════
// MISTAKE EXPLANATION SYSTEM (C4B Phase 3)
// ══════════════════════════════════════════════
function generateMistakeExplanation(userAnswer, correctAnswer, question, context) {
  const wordData = context?.word || _APP_DATA.words?.find(w => w.target === correctAnswer || w.native === correctAnswer);
  
  let explanation = {
    userAnswer,
    correctAnswer,
    type: 'translation',
    grammarHint: null,
    relatedWords: [],
    memoryTip: null
  };
  
  if (!wordData) return explanation;
  
  // Determine mistake type
  const isHebrewToItalian = userAnswer && /[א-ת]/.test(userAnswer);
  const isItalianToHebrew = userAnswer && /[a-zA-Z]/.test(userAnswer) && !isHebrewToItalian;
  
  // Grammar hint based on word properties
  if (wordData.target && wordData.native) {
    explanation.type = isHebrewToItalian ? 'hebrew-to-italian' : 'italian-to-hebrew';
    
    // Add grammar hint
    if (wordData.gender || wordData.type) {
      const gender = wordData.gender || (wordData.target?.endsWith('o') || wordData.target?.endsWith('e') ? 'masculine' : 'feminine');
      const article = gender === 'feminine' ? 'la' : 'il';
      explanation.grammarHint = `${article} ${wordData.target} (${gender === 'feminine' ? 'נקבה' : 'זכר'})`;
    }
    
    // Verb conjugation hint
    if (wordData.type === 'verb' || wordData.target?.match(/(are|ere|ire)$/)) {
      explanation.grammarHint = `פועל: ${wordData.target} - נסה לזכור את ההטייה הנכונה`;
    }
    
    // Preposition hint
    if (wordData.target?.match(/^(a|da|di|in|con|su|per|tra|fra)$/)) {
      explanation.grammarHint = `מילת יחס: ${wordData.target} - ${wordData.native}`;
    }
  }
  
  // Related words (same category)
  if (wordData.cat && _APP_DATA.words) {
    const related = _APP_DATA.words
      .filter(w => w.cat === wordData.cat && w.target !== correctAnswer)
      .slice(0, 3)
      .map(w => ({ target: w.target, native: w.native }));
    explanation.relatedWords = related;
  }
  
  // Memory tip using Nona's personality
  const memoryTips = [
    `💡 נונה אומרת: תחשוב על "${correctAnswer}" כמו על "${wordData.native}" - הם חברים טובים!`,
    `🧠 טריק של נונה: תגיד "${correctAnswer}" שלוש פעמים בקול רם - זה נתפס במוח!`,
    `🤌 נונה זוכרת: במילה "${correctAnswer}" יש את הצליל "${correctAnswer.slice(0, 3)}" - תזכור את זה!`,
    `🇮🇹 טיפ איטלקי: כשאתה טועה ב-"${correctAnswer}", תחשוב על המילה העברית "${wordData.native}" ותדמיין את הסיטואציה`
  ];
  explanation.memoryTip = memoryTips[Math.floor(Math.random() * memoryTips.length)];
  
  return explanation;
}

function renderMistakeFeedback(data) {
  const { userAnswer, correctAnswer, question, context, explanation } = data;
  const exp = explanation || generateMistakeExplanation(userAnswer, correctAnswer, question, context);
  
  return `
    <div class="mistake-feedback" style="animation: slideInUp 0.3s ease;">
      <!-- Wrong answer highlight -->
      <div class="mistake-header" style="
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid var(--red);
        border-radius: var(--radius-sm);
        padding: 12px 16px;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 12px;
      ">
        <span style="font-size: 1.5rem;">❌</span>
        <div>
          <div style="font-weight: 700; color: var(--red);">התשובה שלך: <span style="text-decoration: line-through;">${esc(userAnswer)}</span></div>
          <div style="font-weight: 700; color: var(--emerald-light);">הנכונה: ${esc(correctAnswer)}</div>
        </div>
      </div>
      
      ${exp.grammarHint ? `
      <!-- Grammar hint -->
      <div class="grammar-hint" style="
        background: rgba(99, 102, 241, 0.1);
        border-left: 3px solid var(--indigo);
        border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
        padding: 10px 12px;
        margin-bottom: 12px;
        font-size: .85rem;
      ">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
          <span style="font-size: 1rem;">📚</span>
          <strong style="color: var(--indigo-light);">טיפ דקדוק:</strong>
        </div>
        <div style="color: var(--text2);">${esc(exp.grammarHint)}</div>
      </div>
      ` : ''}
      
      ${exp.relatedWords.length > 0 ? `
      <!-- Related words -->
      <div class="related-words" style="margin-bottom: 12px;">
        <div style="font-weight: 600; color: var(--text3); font-size: .75rem; margin-bottom: 8px; text-transform: uppercase;">מילים קשורות:</div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${exp.relatedWords.map(w => `
            <button class="related-word-btn" 
              onclick="speak('${esc(w.target)}')" 
              style="
                background: var(--surface2);
                border: 1px solid var(--border);
                border-radius: var(--radius-xs);
                padding: 6px 10px;
                font-size: .75rem;
                font-family: var(--font-it);
                color: var(--text);
                cursor: pointer;
                transition: all .2s;
              "
              onmouseover="this.style.borderColor='var(--indigo)'"
              onmouseout="this.style.borderColor='var(--border)'"
            >
              ${esc(w.target)} <span style="color: var(--text3); font-family: var(--font-he);">(${esc(w.native)})</span>
            </button>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      ${exp.memoryTip ? `
      <!-- Nona's memory tip -->
      <div class="nona-tip" style="
        background: linear-gradient(135deg, rgba(88, 204, 2, 0.1), rgba(16, 185, 129, 0.1));
        border: 1px solid rgba(88, 204, 2, 0.3);
        border-radius: var(--radius-sm);
        padding: 12px;
        position: relative;
        overflow: hidden;
      ">
        <div style="display: flex; align-items: flex-start; gap: 10px;">
          <div style="
            width: 32px; height: 32px; border-radius: 50%;
            background: linear-gradient(135deg, var(--primary), var(--primary-dim));
            display: flex; align-items: center; justify-content: center;
            font-size: 1rem; flex-shrink: 0;
          ">🤌</div>
          <div style="flex: 1; color: var(--text); line-height: 1.5;">
            <div style="font-weight: 700; color: var(--primary); margin-bottom: 4px;">הטיפ של נונה:</div>
            <div style="font-size: .85rem;">${esc(exp.memoryTip)}</div>
          </div>
        </div>
      </div>
      ` : ''}
      
      <!-- Action buttons -->
      <div style="display: flex; gap: 8px; margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border);">
        <button class="btn btn-secondary btn-sm" onclick="PracticeExercises.renderSentence?.() || PracticeCore.render()" style="flex: 1;">
          🔄 נסה שוב
        </button>
        <button class="btn btn-primary btn-sm" onclick="PracticeCore.startMixedPractice(false)" style="flex: 1;">
          ➡️ המשך
        </button>
      </div>
    </div>
  `;
}

// Add CSS animation for mistake feedback
const mistakeStyles = document.createElement('style');
mistakeStyles.textContent = `
@keyframes slideInUp {
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

.mistake-feedback {
  animation: slideInUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.related-word-btn:active {
  transform: scale(0.95);
  background: var(--indigo) !important;
  color: white !important;
  border-color: var(--indigo) !important;
}

.nona-tip::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 50 Q30 30 40 50 Q50 70 60 50 Q70 30 80 50' stroke='%2358cc02' stroke-width='0.5' fill='none' opacity='0.3'/%3E%3C/svg%3E");
  pointer-events: none;
}
`;
document.head.appendChild(mistakeStyles);

// ══════════════════════════════════════════════
// PUBLIC API
// ══════════════════════════════════════════════
const api = {
  init,
  render,
  renderPracticeMenu
};

return api;

})();

window.PracticeUI = PracticeUI;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PracticeUI;
}