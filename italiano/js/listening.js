/* ═══════════════════════════════════════════════
   VolaLingo — Listening Comprehension Practice
   Hear Italian sentences, pick Hebrew translation
   ═══════════════════════════════════════════════ */

const Listening = (() => {

  const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const TOTAL_QUESTIONS = 10;

  let state = {
    level: null,       // 'A1'|'A2'|'B1'|'B2'|'C1'|'random'
    questions: [],      // array of {sentence, options, correctIdx}
    currentIdx: 0,
    score: 0,           // number correct
    streak: 0,
    answered: false,    // whether current question has been answered
    correctAnswerIdx: -1,
    xpGained: 0,
    xpPerCorrect: 10,
  };

  function getXPForLevel(lv) {
    const map = { A1: 10, A2: 10, B1: 15, B2: 15, C1: 20 };
    return map[lv] || 10;
  }

  function getLevelSentences(lv) {
    if (lv === 'random') {
      return shuffle([...(APP_DATA.sentences || [])]);
    }
    return (APP_DATA.sentences || []).filter(s => s.level === lv);
  }

  function pickDistractors(correctSentence, level) {
    // Get all sentences from same level
    let pool = getLevelSentences(level === 'random' ? null : level);
    if (level === 'random') {
      pool = [...(APP_DATA.sentences || [])];
    } else {
      pool = getLevelSentences(level);
    }
    
    // Filter out the correct sentence
    let others = pool.filter(s => s.target !== correctSentence.target);
    
    // If not enough, pull from adjacent levels
    if (others.length < 3) {
      const allOthers = (APP_DATA.sentences || []).filter(s => s.target !== correctSentence.target);
      others = shuffle(allOthers);
    } else {
      others = shuffle(others);
    }
    
    return shuffle(others.slice(0, 3).map(s => s.native));
  }

  function generateQuestions(level) {
    const lv = level || 'A1';
    let pool = getLevelSentences(lv);
    
    if (pool.length === 0) {
      // Fallback to all sentences
      pool = [...(APP_DATA.sentences || [])];
    }
    if (pool.length === 0) return [];
    
    const shuffled = shuffle([...pool]);
    const count = Math.min(TOTAL_QUESTIONS, shuffled.length);
    const questions = [];
    
    for (let i = 0; i < count; i++) {
      const sentence = shuffled[i];
      const distractors = pickDistractors(sentence, lv);
      const options = shuffle([sentence.native, ...distractors]);
      const correctIdx = options.indexOf(sentence.native);
      questions.push({
        sentence: sentence,
        options: options,
        correctIdx: correctIdx
      });
    }
    
    return questions;
  }

  // ═══════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════

  function start(level) {
    state.level = level || 'A1';
    state.currentIdx = 0;
    state.score = 0;
    state.streak = 0;
    state.answered = false;
    state.correctAnswerIdx = -1;
    state.xpGained = 0;
    state.xpPerCorrect = getXPForLevel(state.level);
    
    state.questions = generateQuestions(state.level);
    
    if (state.questions.length === 0) {
      toast('אין משפטים ברמה זו', 'error');
      return;
    }
    
    goPage('listening');
    render();
  }

  function render() {
    const content = document.getElementById('pageContent');
    if (!content) return;
    
    // Check if we're done
    if (state.currentIdx >= state.questions.length) {
      renderSummary(content);
      return;
    }
    
    const q = state.questions[state.currentIdx];
    const pct = (state.currentIdx / state.questions.length) * 100;
    
    let optionsHtml = q.options.map((opt, idx) => {
      let cls = 'listening-option';
      if (state.answered) {
        cls += ' locked';
        if (idx === q.correctIdx) cls += ' correct';
        if (idx === state.correctAnswerIdx && idx !== q.correctIdx) cls += ' wrong';
      }
      return `<div class="${cls}" onclick="Listening.answer(${idx})">${esc(opt)}</div>`;
    }).join('');
    
    let nextBtn = '';
    if (state.answered) {
      // Show continue button only if wrong (on correct it auto-advances)
      if (state.correctAnswerIdx !== q.correctIdx) {
        nextBtn = `<button class="btn btn-primary btn-block listening-next-btn" onclick="Listening.nextQuestion()">המשך →</button>`;
      }
    }
    
    content.innerHTML = `
      <div class="listening-container">
        <button class="back-btn" onclick="nav('practice')">← חזרה</button>
        
        <div class="listening-level-tabs">
          ${LEVELS.map(l => `<div class="listening-tab ${state.level === l ? 'active' : ''}" onclick="Listening.selectLevel('${l}')">${l}</div>`).join('')}
          <div class="listening-tab ${state.level === 'random' ? 'active' : ''}" onclick="Listening.selectLevel('random')">אקראי</div>
        </div>
        
        <div class="listening-counter">שאלה ${state.currentIdx + 1}/${state.questions.length}</div>
        <div class="listening-progress"><div class="listening-progress-fill" style="width:${pct}%"></div></div>
        
        <div class="listening-play-btn" onclick="Listening.replayAudio()">
          🔊
        </div>
        
        ${optionsHtml}
        
        ${nextBtn}
        
        <div class="listening-score-display">
          ✅ ${state.score}/${state.currentIdx + (state.answered ? 1 : 0)} &middot; ${state.streak > 0 ? '🔥 ' + state.streak : ''}
        </div>
      </div>
    `;
    
    // Auto-play audio
    setTimeout(() => speak(q.sentence.target), 200);
  }

  function answer(idx) {
    if (state.answered) return;
    
    const q = state.questions[state.currentIdx];
    state.answered = true;
    state.correctAnswerIdx = idx;
    
    const isCorrect = idx === q.correctIdx;
    const xpAmount = state.xpPerCorrect;
    
    if (isCorrect) {
      state.score++;
      state.streak++;
      
      addXP(xpAmount);
      state.xpGained += xpAmount;
      
      // Streak bonus: 5 in a row → +10 bonus XP
      if (state.streak % 5 === 0 && state.streak > 0) {
        addXP(10);
        state.xpGained += 10;
        toast('🔥 רצף! +10 XP בונוס', 'success');
      }
      
      confetti();
      toast('מצוין!', 'success');
      
      render();
      
      // Auto-advance after 1.5s
      setTimeout(() => {
        if (state.currentIdx < state.questions.length) {
          nextQuestion();
        }
      }, 1500);
    } else {
      state.streak = 0;
      toast('לא נכון', 'error');
      render();
    }
  }

  function nextQuestion() {
    state.currentIdx++;
    state.answered = false;
    state.correctAnswerIdx = -1;
    
    if (state.currentIdx >= state.questions.length) {
      render();
    } else {
      render();
    }
  }

  function selectLevel(lv) {
    start(lv);
  }

  function replayAudio() {
    const q = state.questions[state.currentIdx];
    if (q) speak(q.sentence.target);
  }

  function renderSummary(content) {
    const total = state.questions.length;
    const pct = total > 0 ? Math.round((state.score / total) * 100) : 0;
    
    // Star rating
    let stars = 0;
    if (pct === 100) stars = 3;
    else if (pct >= 70) stars = 2;
    else if (pct >= 40) stars = 1;
    
    const starsHtml = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    
    const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪';
    const title = pct >= 80 ? 'מצוין!' : pct >= 50 ? 'כל הכבוד!' : 'המשך להתאמן!';
    
    content.innerHTML = `
      <div class="listening-container">
        <button class="back-btn" onclick="nav('practice')">← חזרה</button>
        
        <div class="listening-summary">
          <div class="listening-summary-emoji">${emoji}</div>
          <h2 class="listening-summary-title">${title}</h2>
          
          <div class="listening-stars">${starsHtml}</div>
          
          <div class="listening-score-box">
            <div class="listening-score-num">${state.score}/${total}</div>
            <div class="listening-score-label">תשובות נכונות</div>
          </div>
          
          <div class="listening-accuracy-box">
            <div class="listening-accuracy-num">${pct}%</div>
            <div class="listening-accuracy-label">דיוק</div>
          </div>
          
          <div class="listening-xp-earned">+${state.xpGained} XP</div>
          
          <div class="progress-bar" style="margin:16px auto;max-width:200px">
            <div class="progress-fill" style="width:${pct}%"></div>
          </div>
          
          <button class="btn btn-primary btn-block" onclick="Listening.start('${state.level}')">🔄 נסה שוב</button>
          <button class="btn btn-secondary btn-block" style="margin-top:8px" onclick="nav('practice')">🏋️ חזרה לתרגול</button>
        </div>
      </div>
    `;
  }

  // Helper esc function matching the one used elsewhere
  function esc(s) {
    return String(s).replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ');
  }

  // Inline shuffle
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  return {
    start,
    render,
    answer,
    nextQuestion,
    selectLevel,
    replayAudio
  };

})();
