/* ══════════════════════════════════════════════
   VolaLingo — Practice UI Module
   Rendering, HTML generation for all practice types
   Sprint C4A: Extracted from practice.js — Zero behavior change
   ══════════════════════════════════════════════ */

const PracticeUI = (() => {

// ══════════════════════════════════════════════
// DEPENDENCIES
// ══════════════════════════════════════════════
let _core = null;
let _exercises = null;
let _anki = null;
let _dialogue = null;
let _APP_CONFIG = null;

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

  console.log('🎨 PracticeUI module initialized');
  return api;
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

  let html = `
    <div style="text-align:center;margin-bottom:8px">
      <span style="font-size:.75rem;color:var(--text3)">שאלה ${index + 1}/${total}</span>
    </div>
    <div class="progress-bar" style="margin-bottom:4px"><div class="progress-fill" style="width:${(index/total)*100}%"></div></div>
    ${_core.getSession()?.combo >= 3 ? `<div class="combo-display">🔥 x${_core.getSession().combo} <span class="combo-x">קומבו!</span></div>` : ''}
  `;

  if (q.type === 'choose') {
    html += `
      <div class="card" style="text-align:center;padding:24px">
        <div style="font-family:${q.qLang==='it'?'var(--font-it)':'var(--font-he)'};font-size:1.5rem;font-weight:700">${q.q}</div>
        ${q.qLang === 'target' ? `<button class="btn btn-sm btn-secondary" onclick="speak('${esc(q.q)}')" style="margin-top:8px">🔊</button>` : ''}
        <div style="font-size:.85rem;color:var(--text3);margin-top:8px">${q.qLang === 'target' ? 'מה התרגום?' : 'כתוב ב${_APP_CONFIG.targetName}'}</div>
      </div>
      ${q.options.map(o => `
        <div class="quiz-option" onclick="PracticeExercises.answerQuiz(this,'${esc(o)}','${esc(q.a)}')">${o}</div>
      `).join('')}
    `;
  } else {
    html += `
      <div class="card" style="text-align:center;padding:24px">
        <div style="font-size:1.3rem;font-weight:700">${q.q}</div>
        <div style="font-size:.85rem;color:var(--text3);margin-top:8px">כתוב ב${_APP_CONFIG.targetName}</div>
      </div>
      <div style="padding:0 4px;margin-top:12px">
        <input type="text" id="quizInput" placeholder="..."
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
// HELPERS
// ══════════════════════════════════════════════
function esc(s) { return String(s).replace(/'/g, "\\'").replace(/\"/g, '"').replace(/\n/g, ' '); }
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

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