/* ═══════════════════════════════════════════════
   VolaLingo v5 — Personal Trainer
   Unified practice combining words, sentences,
   listening, and grammar questions in one session
   ═══════════════════════════════════════════════ */

window.Trainer = (function() {
  'use strict';

  // ── Private state ──
  var tState = {
    modes: { words: true, sentences: true, listening: true, grammar: true },
    sessionSize: 10,
    level: 'random',
    questions: [],
    currentIdx: 0,
    correct: 0,
    total: 0,
    streak: 0,
    maxStreak: 0,
    answered: false,
    sessionXP: 0,
    isActive: false,
    mistakes: []
  };

  // ── Grammar tips that include MC questions ──
  var grammarQuizBank = null;

  function ensureGrammarBank() {
    if (grammarQuizBank) return;
    grammarQuizBank = [];
    var tips = APP_DATA.grammarTips || [];
    tips.forEach(function(tip) {
      // Generate a simple comprehension question from each tip
      if (tip.examples && tip.examples.length > 0) {
        var q = {
          id: tip.id,
          title: tip.title,
          explanation: tip.explanation,
          level: tip.level,
          icon: tip.icon,
          question: 'למה מתייחס הכלל?',
          correct: tip.title,
          distractors: getGrammarDistractors(tip.title, tips)
        };
        grammarQuizBank.push(q);
      }
    });
  }

  function getGrammarDistractors(correct, allTips) {
    var others = allTips.filter(function(t) { return t.title !== correct; });
    shuffle(others);
    return others.slice(0, 3).map(function(t) { return t.title; });
  }

  // ── Generate questions ──
  function generateQuestions() {
    var qs = [];
    var activeModes = [];
    if (tState.modes.words) activeModes.push('words');
    if (tState.modes.sentences) activeModes.push('sentences');
    if (tState.modes.listening) activeModes.push('listening');
    if (tState.modes.grammar) activeModes.push('grammar');

    if (activeModes.length === 0) {
      toast('בחר לפחות מצב תרגול אחד!', 'error');
      return [];
    }

    // Get words for level
    var words = getLevelData('words', tState.level);
    if (words.length < 4) {
      toast('אין מספיק מילים לרמה זו', 'error');
      return [];
    }

    // Get sentences
    var sentences = getLevelData('sentences', tState.level);
    // Get grammar
    ensureGrammarBank();
    var grammarQs = grammarQuizBank.filter(function(q) {
      return tState.level === 'random' || q.level === tState.level;
    });

    // Calculate per-mode counts
    var perMode = Math.ceil(tState.sessionSize / activeModes.length);

    for (var m = 0; m < activeModes.length; m++) {
      var mode = activeModes[m];
      for (var i = 0; i < perMode && qs.length < tState.sessionSize; i++) {
        var q = null;
        switch (mode) {
          case 'words':
            q = generateWordQuestion(words);
            break;
          case 'sentences':
            q = generateSentenceQuestion(sentences);
            break;
          case 'listening':
            q = generateListeningQuestion(words, sentences);
            break;
          case 'grammar':
            q = generateGrammarQuestion(grammarQs);
            break;
        }
        if (q) qs.push(q);
      }
    }

    // Fill remaining slots with words if we have room
    while (qs.length < tState.sessionSize) {
      var filler = generateWordQuestion(words);
      if (filler) qs.push(filler);
      else break;
    }

    shuffle(qs);
    return qs.slice(0, tState.sessionSize);
  }

  function getLevelData(type, level) {
    if (type === 'words') {
      var all = APP_DATA.words || [];
      if (level === 'random') return shuffle(all.slice());
      return all.filter(function(w) { return w.level === level; });
    }
    if (type === 'sentences') {
      var all = APP_DATA.sentences || [];
      if (level === 'random') return shuffle(all.slice());
      return all.filter(function(s) { return s.level === level; });
    }
    return [];
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function getDistractors(correct, pool, field, count) {
    var others = pool.filter(function(item) {
      return item[field] !== correct[field];
    });
    shuffle(others);
    return others.slice(0, count || 3);
  }

  // ── Word MC question ──
  function generateWordQuestion(words) {
    var word = pickRandom(words);
    if (!word) return null;
    // BIAS: 80% Hebrew → Italian (show Hebrew, pick Italian), 20% Italian → Hebrew (review)
    var isReverse = Math.random() < 0.8;
    // When isReverse=true: Hebrew prompt → pick Italian answer (PRIMARY - learning mode)
    // When isReverse=false: Italian prompt → pick Hebrew translation (review mode)
    var correctField = isReverse ? 'target' : 'native';
    var distractField = isReverse ? 'target' : 'native';
    var correctAnswer = word[correctField];
    var promptLabel = isReverse ? 'בחר את המילה באיטלקית:' : 'בחר את התרגום לעברית:';

    // Ensure we have a valid answer - skip words with empty native/target
    if (!correctAnswer || correctAnswer.trim() === '') return null;

    var distractors = getDistractors(word, words, distractField, 3);
    // Ensure we have enough distractors to make 4 options
    var optPool = [correctAnswer];
    if (distractors && distractors.length > 0) {
      distractors.slice(0, 3).forEach(function(d) {
        var val = d[distractField];
        if (val && val.trim() !== '' && optPool.indexOf(val) === -1) {
          optPool.push(val);
        }
      });
    }
    // Fallback: pad with dummy options if still too few
    while (optPool.length < 2) { optPool.push('—'); }
    var options = shuffle(optPool).slice(0, 4);

    return {
      type: 'word',
      isReverse: isReverse,
      prompt: isReverse ? word.native : word.target,
      targetLang: word.target,
      nativeLang: word.native,
      correct: correctAnswer,
      options: options.map(function(o) { return { text: o, correct: o === correctAnswer }; }),
      wordObj: word,
      img: word.img || null,
      promptLabel: promptLabel
    };
  }

  // ── Sentence question ──
  function generateSentenceQuestion(sentences) {
    if (!sentences || sentences.length === 0) return null;
    var sent = pickRandom(sentences);
    if (!sent) return null;

    // Show Italian sentence, pick Hebrew translation
    var distractors = getDistractors(sent, sentences, 'native', 3);
    var options = shuffle([sent.native].concat(distractors.map(function(d) { return d.native; }))).slice(0, 4);

    return {
      type: 'sentence',
      prompt: sent.target,
      targetLang: sent.target,
      nativeLang: sent.native,
      correct: sent.native,
      options: options.map(function(o) { return { text: o, correct: o === sent.native }; }),
      wordObj: { target: sent.target, native: sent.native }
    };
  }

  // ── Listening question ──
  function generateListeningQuestion(words, sentences) {
    // Mix: 70% words, 30% sentences
    var source;
    if (sentences.length > 0 && Math.random() < 0.3) {
      source = pickRandom(sentences);
    } else {
      source = pickRandom(words);
    }
    if (!source) return null;

    var pool = words.length > 0 ? words : (APP_DATA.words || []);
    var distractors = getDistractors(source, pool, 'native', 3);
    var options = shuffle([source.native].concat(distractors.map(function(d) { return d.native; }))).slice(0, 4);

    return {
      type: 'listening',
      prompt: '🔊 האזן ותרגם',
      targetLang: source.target,
      nativeLang: source.native,
      correct: source.native,
      options: options.map(function(o) { return { text: o, correct: o === source.native }; }),
      wordObj: { target: source.target, native: source.native },
      autoSpeak: true
    };
  }

  // ── Grammar question ──
  function generateGrammarQuestion(grammarQs) {
    if (!grammarQs || grammarQs.length === 0) return null;
    var q = pickRandom(grammarQs);
    if (!q) return null;

    var distractors = q.distractors || [];
    var allOpts = shuffle([q.correct].concat(distractors.slice(0, 3)));
    var options = allOpts.map(function(o) { return { text: o, correct: o === q.correct }; });
    // Ensure at least 2 options
    while (options.length < 2) {
      options.push({ text: '—', correct: false });
    }

    return {
      type: 'grammar',
      prompt: q.icon + ' ' + q.title,
      explanation: q.explanation,
      correct: q.correct,
      options: options,
      wordObj: null
    };
  }

  // ── Render hub page ──
  function render() {
    var container = document.getElementById('trainerContent');
    if (!container) return;

    if (tState.isActive) {
      renderQuestion(container);
      return;
    }

    var levelOptions = ['A1', 'A2', 'B1', 'B2', 'C1', 'random'];
    var levelLabels = { A1: 'A1 מתחילים', A2: 'A2 בסיסי', B1: 'B1 בינוני', B2: 'B2 עצמאי', C1: 'C1 מתקדם', random: '🎲 אקראי' };

    var html = '';
    html += '<div class="trainer-hub">';

    // Title
    html += '<h2 class="section-title"><span class="emoji">🏋️</span> מאמן אישי</h2>';
    html += '<p style="font-size:.85rem;color:var(--text2);margin-bottom:16px">תרגול משולב של מילים, משפטים, האזנה ודקדוק בסשן אחד</p>';

    // ── Session Settings ──
    html += '<div class="trainer-settings">';

    // Session size
    html += '<div class="trainer-setting-row">';
    html += '  <label class="trainer-label">מספר שאלות:</label>';
    html += '  <div class="trainer-size-select">';
    [5, 10, 15, 20].forEach(function(n) {
      var active = tState.sessionSize === n ? ' active' : '';
      html += '    <button class="trainer-pill' + active + '" onclick="Trainer.setSize(' + n + ');Trainer.render()">' + n + '</button>';
    });
    html += '  </div>';
    html += '</div>';

    // Mode toggles
    html += '<div class="trainer-setting-row">';
    html += '  <label class="trainer-label">מצבי תרגול:</label>';
    html += '  <div class="trainer-mode-toggles">';
    var modes = [
      { key: 'words', label: 'מילים', icon: '📝' },
      { key: 'sentences', label: 'משפטים', icon: '🧩' },
      { key: 'listening', label: 'האזנה', icon: '🔊' },
      { key: 'grammar', label: 'דקדוק', icon: '📖' }
    ];
    modes.forEach(function(m) {
      var active = tState.modes[m.key] ? ' active' : '';
      html += '    <button class="trainer-pill' + active + '" onclick="Trainer.toggleMode(\'' + m.key + '\');Trainer.render()">' + m.icon + ' ' + m.label + '</button>';
    });
    html += '  </div>';
    html += '</div>';

    // Level select
    html += '<div class="trainer-setting-row">';
    html += '  <label class="trainer-label">רמה:</label>';
    html += '  <div class="trainer-level-select">';
    levelOptions.forEach(function(l) {
      var active = tState.level === l ? ' active' : '';
      html += '    <button class="trainer-pill' + active + '" onclick="Trainer.setLevel(\'' + l + '\');Trainer.render()">' + levelLabels[l] + '</button>';
    });
    html += '  </div>';
    html += '</div>';

    html += '</div>'; // settings

    // ── Start button ──
    html += '<button class="btn btn-primary btn-block" style="font-size:1.1rem;padding:16px;margin:20px 0" onclick="Trainer.start()">🚀 התחל אימון!</button>';

    // ── Stats ──
    var cw = state.correctWords || [];
    var totalCorrect = cw.reduce(function(s, w) { return s + w.count; }, 0);
    html += '<div class="trainer-stats-row">';
    html += '  <div class="trainer-stat"><div class="trainer-stat-val">' + cw.length + '</div><div class="trainer-stat-label">מילים ידועות</div></div>';
    html += '  <div class="trainer-stat"><div class="trainer-stat-val">' + totalCorrect + '</div><div class="trainer-stat-label">תשובות נכונות</div></div>';
    html += '  <div class="trainer-stat"><div class="trainer-stat-val">' + state.streak + '</div><div class="trainer-stat-label">🔥 רצף יומי</div></div>';
    html += '</div>';

    html += '</div>'; // hub

    container.innerHTML = html;

    // ── Correct words list ──
    renderCorrectWords(container);
  }

  // ── Render question ──
  function renderQuestion(container) {
    if (!container) container = document.getElementById('trainerContent');
    if (!container) return;

    var q = tState.questions[tState.currentIdx];
    if (!q) {
      finishSession(container);
      return;
    }

    var progress = ((tState.currentIdx) / tState.total * 100);
    var comboDisplay = tState.streak >= 3 ? '<div class="combo-display">🔥 רצף x' + tState.streak + ' <span class="combo-x">x' + (1 + Math.floor(tState.streak / 3) * 0.5) + '</span></div>' : '';

    var html = '';
    html += '<div class="trainer-session">';

    // Top bar
    html += '<div class="trainer-top-bar">';
    html += '  <button class="back-btn" onclick="Trainer.quit()">← יציאה</button>';
    html += '  <div class="trainer-counter">' + (tState.currentIdx + 1) + '/' + tState.total + '</div>';
    html += '  <div class="trainer-score">✅ ' + tState.correct + '</div>';
    html += '</div>';

    // Progress bar
    html += '<div class="progress-bar" style="margin-bottom:12px"><div class="progress-fill" style="width:' + progress + '%"></div></div>';

    html += comboDisplay;

    // Question type badge
    var typeLabels = { word: '📝 מילה', sentence: '🧩 משפט', listening: '🔊 האזנה', grammar: '📖 דקדוק' };
    html += '<div class="trainer-type-badge">' + (typeLabels[q.type] || '📝') + '</div>';

    // Question content
    html += '<div class="trainer-question-card">';

    if (q.type === 'listening') {
      html += '<div class="trainer-listening-area">';
      html += '  <button class="speak-btn active" style="width:72px;height:72px;font-size:2rem;margin:0 auto 12px" onclick="speak(\'' + escAttr(q.targetLang) + '\')">🔊</button>';
      html += '  <div style="font-size:1rem;color:var(--text3)">מה התרגום?</div>';
      html += '</div>';
    } else if (q.type === 'grammar') {
      html += '<div class="trainer-grammar-prompt">';
      html += '  <div style="font-size:1.1rem;font-weight:700;margin-bottom:4px">' + escHtml(q.prompt) + '</div>';
      if (q.explanation) {
        html += '  <div class="trainer-grammar-exp">' + escHtml(q.explanation) + '</div>';
      }
      html += '  <div style="font-size:.85rem;color:var(--text3);margin-top:8px">בחר את התשובה הנכונה:</div>';
      html += '</div>';
    } else {
      html += '<div style="text-align:center;padding:8px 0">';
      if (q.type === 'sentence') {
        html += '  <div style="font-family:var(--font-it);font-size:1.3rem;font-weight:700;line-height:1.5;margin-bottom:8px;direction:ltr">' + escHtml(q.prompt) + '</div>';
        html += '  <button class="speak-btn active" style="margin:0 auto" onclick="speak(\'' + escAttr(q.targetLang) + '\')">🔊</button>';
      } else {
        // Show emoji if available, PLUS always show prompt text
        if (q.img) {
          html += '  <div style="font-size:3rem;margin-bottom:4px">' + escHtml(q.img) + '</div>';
        }
        html += '  <div style="font-family:var(--font-it);font-size:1.8rem;font-weight:700;margin-bottom:8px;direction:ltr">' + escHtml(q.prompt) + '</div>';
        html += '  <button class="speak-btn active" style="margin:0 auto" onclick="speak(\'' + escAttr(q.targetLang) + '\')">🔊</button>';
      }
      html += '  <div style="font-size:.8rem;color:var(--text3);margin-top:8px">' + (q.promptLabel || 'בחר את התרגום הנכון:') + '</div>';
      html += '</div>';
    }

    // Options
    html += '<div class="trainer-options' + (tState.answered ? ' disabled' : '') + '">';
    q.options.forEach(function(opt, idx) {
      var cls = 'trainer-option';
      if (tState.answered) {
        cls += ' disabled';
        if (opt.correct) cls += ' reveal';
        if (tState.selectedAnswer === idx && !opt.correct) cls += ' wrong';
      }
      html += '  <div class="' + cls + '" onclick="Trainer.answer(' + idx + ')">';
      html += '    <span class="trainer-opt-letter">' + String.fromCharCode(65 + idx) + '</span>';
      html += '    <span class="trainer-opt-text">' + escHtml(opt.text) + '</span>';
      html += '    ' + (tState.answered && opt.correct ? '✅' : '') + '';
      html += '    ' + (tState.answered && tState.selectedAnswer === idx && !opt.correct ? '❌' : '') + '';
      html += '  </div>';
    });
    html += '</div>';

    // Feedback
    if (tState.answered) {
      var feedbackCls = tState.lastCorrect ? 'trainer-feedback correct' : 'trainer-feedback wrong';
      var feedbackIcon = tState.lastCorrect ? '✅' : '❌';
      var feedbackText = tState.lastCorrect ? 'תשובה נכונה! כל הכבוד!' : 'טעות! התשובה הנכונה: ' + escHtml(q.correct);
      html += '<div class="' + feedbackCls + '">' + feedbackIcon + ' ' + feedbackText + '</div>';

      // Next button
      var isLast = tState.currentIdx >= tState.total - 1;
      var nextLabel = isLast ? '📊 סיים וצפה בתוצאות' : '➡️ המשך';
      html += '<button class="btn btn-primary btn-block" style="margin-top:12px" onclick="Trainer.next()">' + nextLabel + '</button>';
    }

    html += '</div>'; // question card
    html += '</div>'; // session

    container.innerHTML = html;

    // Auto-speak for listening questions
    if (!tState.answered && q.type === 'listening') {
      setTimeout(function() {
        speak(q.targetLang);
      }, 300);
    }
  }

  // ── Handle answer ──
  function answer(idx) {
    if (tState.answered) return;
    var q = tState.questions[tState.currentIdx];
    if (!q) return;

    tState.answered = true;
    tState.selectedAnswer = idx;
    var isCorrect = q.options[idx] && q.options[idx].correct;

    if (isCorrect) {
      tState.correct++;
      tState.streak++;
      if (tState.streak > tState.maxStreak) tState.maxStreak = tState.streak;

      // XP: 10 base + streak bonus
      var xpGain = 10;
      if (tState.streak >= 3) xpGain += Math.floor(tState.streak / 3) * 5;
      tState.sessionXP += xpGain;
      addXP(xpGain);

      // Add to correct words
      if (q.wordObj) addCorrectWord(q.wordObj);

      // Auto-speak the Italian
      if (q.targetLang) {
        speak(q.targetLang);
      }

      // Mark word as learned
      if (q.wordObj && q.wordObj.target) {
        if (!state.wordsLearned.includes(q.wordObj.target)) {
          state.wordsLearned.push(q.wordObj.target);
          save();
        }
      }
    } else {
      tState.streak = 0;
      // Track mistake
      if (q.wordObj) {
        tState.mistakes.push({ target: q.wordObj.target, native: q.wordObj.native, correct: q.correct });
      }
    }

    tState.lastCorrect = isCorrect;
    save();
    render();
  }

  // ── Next question ──
  function next() {
    tState.currentIdx++;
    tState.answered = false;
    tState.selectedAnswer = -1;
    tState.lastCorrect = false;
    if (tState.currentIdx >= tState.total) {
      tState.isActive = false;
    }
    render();
  }

  // ── Start session ──
  function start() {
    var qs = generateQuestions();
    if (qs.length === 0) return;

    tState.questions = qs;
    tState.currentIdx = 0;
    tState.correct = 0;
    tState.total = qs.length;
    tState.streak = 0;
    tState.maxStreak = 0;
    tState.answered = false;
    tState.selectedAnswer = -1;
    tState.lastCorrect = false;
    tState.sessionXP = 0;
    tState.isActive = true;
    tState.mistakes = [];

    // Navigate to trainer page
    goPage('trainer');
  }

  // ── Finish session ──
  function finishSession(container) {
    if (!container) container = document.getElementById('trainerContent');
    if (!container) return;

    var pct = tState.total > 0 ? Math.round(tState.correct / tState.total * 100) : 0;
    var grade = pct >= 90 ? '👑 מצוין!' : pct >= 70 ? '🌟 טוב מאוד!' : pct >= 50 ? '👍 טוב' : '💪 כדאי לחזור';

    var html = '';
    html += '<div class="trainer-summary">';
    html += '  <h2 class="section-title" style="justify-content:center">📊 סיכום אימון</h2>';

    // Score circle
    html += '<div class="trainer-score-circle">';
    html += '  <div class="trainer-score-circle-inner">';
    html += '    <div class="trainer-score-pct">' + pct + '%</div>';
    html += '    <div class="trainer-score-grade">' + grade + '</div>';
    html += '  </div>';
    html += '</div>';

    // Stats grid
    html += '<div class="trainer-summary-stats">';
    html += '  <div class="trainer-summary-stat"><span>✅ נכון:</span> <strong>' + tState.correct + '/' + tState.total + '</strong></div>';
    html += '  <div class="trainer-summary-stat"><span>🔥 רצף מקס:</span> <strong>' + tState.maxStreak + '</strong></div>';
    html += '  <div class="trainer-summary-stat"><span>⚡ XP:</span> <strong>+' + tState.sessionXP + '</strong></div>';
    html += '  <div class="trainer-summary-stat"><span>📝 טעויות:</span> <strong>' + tState.mistakes.length + ' טעויות</strong></div>';
    html += '</div>';

    // Mistakes review
    if (tState.mistakes.length > 0) {
      html += '<h3 class="section-title" style="margin-top:20px"><span class="emoji">📝</span> מילים לטעון מחדש</h3>';
      html += '<div class="trainer-mistakes-list">';
      tState.mistakes.forEach(function(m) {
        html += '<div class="trainer-mistake-item">';
        html += '  <div class="word-it">' + escHtml(m.target) + '</div>';
        html += '  <div class="word-he">' + escHtml(m.native) + '</div>';
        html += '  <button class="speak-btn" onclick="event.stopPropagation();speak(\'' + escAttr(m.target) + '\')">🔊</button>';
        html += '</div>';
      });
      html += '</div>';
    }

    // Buttons
    html += '<div style="display:flex;gap:8px;margin-top:16px">';
    html += '  <button class="btn btn-primary" style="flex:1" onclick="Trainer.start()">🔄 אימון נוסף</button>';
    html += '  <button class="btn btn-secondary" style="flex:1" onclick="Trainer.render();goPage(\'trainer\')">🏠 חזרה</button>';
    html += '</div>';

    html += '</div>';

    container.innerHTML = html;

    // Confetti for good scores
    if (pct >= 80) confetti();
  }

  // ── Quit session ──
  function quit() {
    tState.isActive = false;
    tState.answered = false;
    render();
  }

  // ── Setters ──
  function setSize(n) {
    tState.sessionSize = n;
  }

  function setLevel(l) {
    tState.level = l;
  }

  function toggleMode(mode) {
    if (Object.keys(tState.modes).length === 1 && tState.modes[mode]) {
      toast('יש להשאיר לפחות מצב אחד פעיל', 'warning');
      return;
    }
    tState.modes[mode] = !tState.modes[mode];
  }

  // ── Esc helpers ──
  function escHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function escAttr(s) {
    return String(s || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  // ── Public API ──
  return {
    render: render,
    start: start,
    answer: answer,
    next: next,
    quit: quit,
    setSize: setSize,
    setLevel: setLevel,
    toggleMode: toggleMode
  };
})();
