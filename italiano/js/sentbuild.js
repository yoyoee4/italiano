/* ═══════════════════════════════════════════════
   VolaLingo v5 — Sentence Builder
   Duolingo-style word ordering practice
   ═══════════════════════════════════════════════ */

const SentBuild = (() => {

  let currentLevel = 'A1';
  let sentences = [];
  let sentenceIdx = 0;
  let totalSentences = 10;
  let currentSentence = null;
  let poolWords = [];       // scrambled words in pool
  let answerWords = [];     // words placed by user
  let attemptCount = 0;
  let correctCount = 0;
  let streakCount = 0;
  let isAnswered = false;
  let sessionScore = 0;

  // ═══════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════

  function start(level) {
    currentLevel = level || state.level || 'A1';
    sentences = getSentencesForLevel(currentLevel);
    if (sentences.length === 0) {
      toast('אין משפטים זמינים לרמה זו', 'error');
      return;
    }
    shuffle(sentences);
    sentenceIdx = 0;
    totalSentences = Math.min(10, sentences.length);
    correctCount = 0;
    streakCount = 0;
    sessionScore = 0;
    goPage('sentbuild');
  }

  function render() {
    const content = document.getElementById('pageContent');
    if (!content) return;

    // Filter sentences by level
    const levelSentences = getSentencesForLevel(currentLevel);
    if (levelSentences.length === 0) {
      content.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🧩</div>
          <div class="empty-text">אין משפטים זמינים</div>
          <div class="empty-sub">לא נמצאו משפטים לרמה ${currentLevel}</div>
          <button class="btn btn-primary" style="margin-top:16px" onclick="Practice.render()">חזרה לתרגול</button>
        </div>
      `;
      return;
    }

    // Initialize session if needed
    if (sentences.length === 0) {
      sentences = shuffle([...levelSentences]);
      sentenceIdx = 0;
      totalSentences = Math.min(10, sentences.length);
      correctCount = 0;
      streakCount = 0;
      sessionScore = 0;
    }

    if (sentenceIdx >= totalSentences) {
      renderSummary(content);
      return;
    }

    currentSentence = sentences[sentenceIdx];
    if (!currentSentence) {
      renderSummary(content);
      return;
    }

    // Reset state for this sentence
    const words = currentSentence.target.split(/\s+/).filter(w => w);
    if (words.length < 2) {
      sentenceIdx++;
      render();
      return;
    }

    poolWords = shuffle([...words]);
    answerWords = [];
    attemptCount = 0;
    isAnswered = false;

    renderSentenceContent(content);
  }

  function placeWord(idx) {
    if (isAnswered) return;
    if (idx < 0 || idx >= poolWords.length) return;
    const word = poolWords.splice(idx, 1)[0];
    answerWords.push(word);
    renderSentenceContent(document.getElementById('pageContent'));
  }

  function removeWord(idx) {
    if (isAnswered) return;
    if (idx < 0 || idx >= answerWords.length) return;
    const word = answerWords.splice(idx, 1)[0];
    poolWords.push(word);
    renderSentenceContent(document.getElementById('pageContent'));
  }

  function checkAnswer() {
    if (isAnswered) return;
    if (!currentSentence) return;

    const correctWords = currentSentence.target.split(/\s+/).filter(w => w);
    
    // Compare word by word
    let allCorrect = true;
    const wordResults = [];
    for (let i = 0; i < correctWords.length; i++) {
      if (i < answerWords.length && answerWords[i] === correctWords[i]) {
        wordResults.push(true);
      } else {
        wordResults.push(false);
        allCorrect = false;
      }
    }

    attemptCount++;
    isAnswered = true;

    const content = document.getElementById('pageContent');
    renderSentenceContent(content, wordResults);

    if (allCorrect && answerWords.length === correctWords.length) {
      // Correct!
      let xpGain = 0;
      if (attemptCount === 1) {
        xpGain = 10;
        streakCount++;
        if (streakCount >= 3) {
          xpGain += 5; // Streak bonus
          toast('🔥 רצף! +5 XP בונוס', 'success');
        }
      } else if (attemptCount === 2) {
        xpGain = 5;
        streakCount = 0;
      } else {
        xpGain = 2;
        streakCount = 0;
      }

      addXP(xpGain);
      sessionScore += xpGain;
      correctCount++;
      toast('מצוין! 🎉 +' + xpGain + ' XP', 'success');
      confetti();

      // Track in practice history
      if (!state.sentencesPracticed) state.sentencesPracticed = {};
      state.sentencesPracticed[currentSentence.target] = { score: 100, date: Date.now(), attempts: attemptCount };
      save();

      // Auto-advance after 1.5s
      setTimeout(() => {
        sentenceIdx++;
        render();
      }, 1500);
    } else {
      // Wrong
      streakCount = 0;
      toast('נסה שוב! 🔄', 'error');
      
      // Show retry button
      const retryBtn = document.createElement('button');
      retryBtn.className = 'btn btn-primary btn-block';
      retryBtn.style.marginTop = '12px';
      retryBtn.textContent = '🔄 נסה שוב';
      retryBtn.onclick = () => {
        // Reset words back to pool
        poolWords = shuffle(currentSentence.target.split(/\s+/).filter(w => w));
        answerWords = [];
        isAnswered = false;
        renderSentenceContent(document.getElementById('pageContent'));
      };

      const actionsEl = content.querySelector('.sentbuild-actions');
      if (actionsEl) {
        actionsEl.innerHTML = '';
        actionsEl.appendChild(retryBtn);
      }

      // Also add a skip button
      const skipBtn = document.createElement('button');
      skipBtn.className = 'btn btn-secondary btn-block';
      skipBtn.style.marginTop = '8px';
      skipBtn.textContent = '⏭️ דלג';
      skipBtn.onclick = () => {
        sentenceIdx++;
        render();
      };
      if (actionsEl) actionsEl.appendChild(skipBtn);
    }
  }

  function skip() {
    sentenceIdx++;
    render();
  }

  function selectLevel(lv) {
    currentLevel = lv;
    sentences = [];
    sentenceIdx = 0;
    render();
  }

  // ═══════════════════════════════════════
  // INTERNAL HELPERS
  // ═══════════════════════════════════════

  function getSentencesForLevel(level) {
    return (APP_DATA.sentences || []).filter(s => s.level === level);
  }

  function renderSentenceContent(content, wordResults) {
    if (!content) return;
    if (!currentSentence) {
      renderSummary(content);
      return;
    }

    const correctWords = currentSentence.target.split(/\s+/).filter(w => w);

    let html = `
      <div class="sentbuild-container">
        <button class="back-btn" onclick="Practice.render()">← חזרה</button>

        <div class="sentbuild-level-tabs">
          ${['A1','A2','B1','B2','C1'].map(lv => `
            <div class="sentbuild-level-tab ${lv === currentLevel ? 'active' : ''}" 
                 onclick="SentBuild.selectLevel('${lv}')">${lv}</div>
          `).join('')}
        </div>

        <div class="sentbuild-counter">🧩 משפט ${Math.min(sentenceIdx + 1, totalSentences)}/${totalSentences}</div>

        <div class="sentbuild-hint">
          <div class="sentbuild-hint-label">${APP_CONFIG.nativeFlag} תרגום:</div>
          <div class="sentbuild-hint-text">${currentSentence.native}</div>
          ${currentSentence.en ? `<div class="sentbuild-hint-en">${currentSentence.en}</div>` : ''}
        </div>

        <div class="sentbuild-answer" id="sentbuildAnswer">
          ${answerWords.length === 0 ? '<div class="sentbuild-placeholder">לחץ על מילים כדי לבנות את המשפט</div>' : ''}
          ${answerWords.map((w, i) => {
            let cls = 'sentbuild-word placed';
            if (wordResults) {
              cls += wordResults[i] ? ' correct' : ' incorrect';
            }
            return `<div class="${cls}" onclick="SentBuild.removeWord(${i})">${w}</div>`;
          }).join('')}
        </div>

        <div class="sentbuild-pool" id="sentbuildPool">
          ${poolWords.map((w, i) => `
            <div class="sentbuild-word" onclick="SentBuild.placeWord(${i})">${w}</div>
          `).join('')}
        </div>

        <div class="sentbuild-actions">
          ${!isAnswered ? `
            <button class="btn btn-primary btn-block" onclick="SentBuild.checkAnswer()" 
              ${answerWords.length === 0 ? 'disabled' : ''}>
              ✅ בדוק
            </button>
          ` : ''}
        </div>

        ${wordResults && !wordResults.every(Boolean) ? `
          <div class="sentbuild-hint correct-order">
            <div class="sentbuild-hint-label">✅ הסדר הנכון:</div>
            <div class="sentbuild-hint-text" style="direction:ltr;text-align:left">${correctWords.join(' ')}</div>
          </div>
        ` : ''}
      </div>
    `;

    content.innerHTML = html;
  }

  function renderSummary(content) {
    const pct = Math.round((correctCount / totalSentences) * 100);
    let emoji = '🧩';
    let msg = 'היי, התחלת מצוין!';
    if (pct >= 90) { emoji = '🏆'; msg = 'מושלם! שליטה מוחלטת!'; }
    else if (pct >= 70) { emoji = '🌟'; msg = 'כל הכבוד! תוצאה מצוינת!'; }
    else if (pct >= 50) { emoji = '👍'; msg = 'יפה! המשך להתאמן!'; }
    else { emoji = '💪'; msg = 'המשך לתרגל, תתפתח!'; }

    content.innerHTML = `
      <div class="sentbuild-container" style="text-align:center;padding-top:40px">
        <button class="back-btn" onclick="Practice.render()">← חזרה</button>
        
        <div style="font-size:4rem;margin-bottom:16px">${emoji}</div>
        <h2 style="font-weight:800;font-size:1.5rem">${msg}</h2>
        
        <div class="sentbuild-score" style="margin:20px auto;max-width:240px">
          <div class="sentbuild-score-pct">${pct}%</div>
          <div class="sentbuild-score-detail">${correctCount}/${totalSentences} משפטים נכונים</div>
          <div class="sentbuild-score-xp">+${sessionScore} XP</div>
          <div class="progress-bar" style="margin:12px 0"><div class="progress-fill" style="width:${pct}%"></div></div>
        </div>
        
        <div style="display:flex;gap:8px;margin-top:20px">
          <button class="btn btn-primary btn-block" onclick="SentBuild.start('${currentLevel}')">🔄 עוד פעם</button>
          <button class="btn btn-secondary btn-block" onclick="Practice.render()">🏋️ תרגול</button>
        </div>
      </div>
    `;

    if (pct >= 70) confetti();
  }

  // Reuse the global shuffle
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ═══════════════════════════════════════
  // EXPOSE PUBLIC API
  // ═══════════════════════════════════════

  return {
    start,
    render,
    placeWord,
    removeWord,
    checkAnswer,
    skip,
    selectLevel
  };

})();
