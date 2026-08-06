/* ═══════════════════════════════════════════════
   VolaLingo v2 — Skill Tree
   Career path A1→C1, crowns, unlock logic, visual tree
   ═══════════════════════════════════════════════ */

const SkillTree = (() => {

// ── TREE STRUCTURE ──
// Defined in APP_DATA.skillTree (data.js)
// Each node: { id, level (A1-C1), name, icon, category, prerequisite, words }

function getNodeProgress(nodeId) {
  return state.nodeProgress[nodeId] || { crown: 0, done: false, bestScore: 0 };
}

function isUnlocked(node) {
  if (!node.prerequisite) return true;
  const prev = APP_DATA.skillTree.find(n => n.id === node.prerequisite);
  if (!prev) return true;
  const prog = getNodeProgress(prev.id);
  return prog.crown >= 1; // need at least crown 1 to unlock next
}

function isCurrent(node) {
  if (!isUnlocked(node)) return false;
  const prog = getNodeProgress(node.id);
  return prog.crown === 0; // unlocked but not started
}

function isDone(node) {
  return getNodeProgress(node.id).crown >= 5;
}

function getLevelColor(lv) {
  const colors = { A1: '#58cc02', A2: '#1cb0f6', B1: '#ce82ff' };
  return colors[lv] || '#58cc02';
}

function getLevelEmoji(lv) {
  const e = { A1: '🌱', A2: '🌿', B1: '🌳' };
  return e[lv] || '📘';
}

function getLevelHe(lv) {
  const h = { A1: 'מתחילים (רמת אפס)', A2: 'בסיסי', B1: 'בינוני (לקראת מבחן)' };
  return h[lv] || lv;
}

// ── RENDER TREE ──
function render() {
  const container = document.getElementById('learnContent');
  if (!container) return;

  const tree = APP_DATA.skillTree || [];
  const levels = ['A1', 'A2', 'B1'];
  
  // Group nodes by level
  const byLevel = {};
  levels.forEach(l => byLevel[l] = tree.filter(n => n.level === l));

  // Check if level is accessible
  function isLevelAccessible(lv) {
    if (lv === 'A1') return true;
    const prevLv = levels[levels.indexOf(lv) - 1];
    const prevNodes = byLevel[prevLv] || [];
    // At least 60% of previous level nodes need crown >= 1
    const done = prevNodes.filter(n => getNodeProgress(n.id).crown >= 1).length;
    return prevNodes.length === 0 || (done / prevNodes.length) >= 0.6;
  }

  // Load Daily Mission if available
  if (window.Orchestrator && !state.dailyComplete) {
    loadDailyMission();
  }

  let html = `
    <div style="text-align:center;margin-bottom:20px">
      <h2 style="font-size:1.3rem;font-weight:800">🗺️ מסלול הלמידה</h2>
      <p style="font-size:.85rem;color:var(--text2)">התקדם מרמת אפס ועד מעבר מבחן B1!</p>
    </div>
  `;

  levels.forEach(lv => {
    const nodes = byLevel[lv];
    if (!nodes || nodes.length === 0) return;
    const accessible = isLevelAccessible(lv);
    const totalCrowns = nodes.reduce((s, n) => s + getNodeProgress(n.id).crown, 0);
    const maxCrowns = nodes.length * 5;
    const pct = Math.round(totalCrowns / maxCrowns * 100);

    html += `
      <div class="tree-level" style="${!accessible ? 'opacity:.4;pointer-events:none' : ''}">
        <div class="tree-level-header" onclick="SkillTree.toggleLevel('${lv}')">
          <div class="tree-level-title">
            <span class="tree-level-icon">${getLevelEmoji(lv)}</span>
            <span>${lv} — ${getLevelHe(lv)}</span>
            <span style="color:${getLevelColor(lv)};font-size:.75rem">${accessible ? '' : '🔒'}</span>
          </div>
          <div class="tree-level-progress">
            <span class="tree-level-crowns">👑 ${totalCrowns}/${maxCrowns}</span>
            <span style="margin-right:8px;font-size:.7rem">${pct}%</span>
          </div>
        </div>
        <div class="progress-bar" style="margin:0 12px 8px"><div class="progress-fill" style="width:${pct}%;background:${getLevelColor(lv)}"></div></div>
        
        <div class="tree-nodes" id="treeNodes-${lv}">
    `;

    // Render nodes in pairs (zigzag pattern)
    nodes.forEach((node, i) => {
      const prog = getNodeProgress(node.id);
      const unlocked = isUnlocked(node);
      const done = prog.crown >= 5;
      const current = unlocked && prog.crown === 0;
      const statusClass = !unlocked ? 'locked' : (done ? 'gold' : (current ? 'current' : (prog.crown > 0 ? 'done' : '')));

      // Connector between nodes
      if (i > 0) {
        const prevDone = getNodeProgress(nodes[i - 1].id).crown >= 1;
        html += `<div class="tree-connector ${prevDone ? 'done' : ''}"></div>`;
      }
      
      const offsets = [0, 25, 40, 25, 0, -25, -40, -25];
      const offsetX = offsets[i % offsets.length];

      html += `
        <div class="tree-node ${statusClass}" onclick="SkillTree.openNode('${node.id}')" title="${node.name}" style="transform: translateX(${offsetX}px)">
          ${prog.crown > 0 ? `<div class="tree-crown">${prog.crown}</div>` : ''}
          <span class="node-icon">${node.icon}</span>
          <span class="node-label">${node.name}</span>
        </div>
      `;
    });

    html += `</div></div>`;
  });

  // Exam prep card
  html += `
    <div style="margin:24px 0 8px">
      <div class="exam-card" onclick="nav('exams')" style="display:flex;align-items:center;gap:14px;padding:18px">
        <div style="font-size:2.2rem;flex-shrink:0">📋</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:800;font-size:1rem;margin-bottom:2px">הכנה למבחן רשמי</div>
          <div style="font-size:.8rem;color:var(--text2)">5 סימולציות מלאות של AIL Firenze</div>
        </div>
        <div style="font-size:1.2rem;color:var(--text3)">←</div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// ── TOGGLE LEVEL EXPAND/COLLAPSE ──
function toggleLevel(lv) {
  const el = document.getElementById('treeNodes-' + lv);
  if (el) {
    el.style.display = el.style.display === 'none' ? 'flex' : 'none';
  }
}

// ── OPEN NODE (lesson) ──
function openNode(nodeId) {
  const node = APP_DATA.skillTree.find(n => n.id === nodeId);
  if (!node) return;
  
  state._lastNode = nodeId; save();
  const container = document.getElementById('learnContent');
  
  // Get words for this node
  const words = getNodeWords(node);
  const sentences = getNodeSentences(node);
  const prog = getNodeProgress(nodeId);

  let html = `
    <button class="back-btn" onclick="SkillTree.render()">← חזרה למסלול</button>
    
    <div style="text-align:center;margin-bottom:20px">
      <div style="font-size:3rem;margin-bottom:8px">${node.icon}</div>
      <h2 style="font-size:1.2rem;font-weight:800">${node.name}</h2>
      <div style="font-size:.85rem;color:var(--text2)">${node.level} — ${getLevelHe(node.level)}</div>
      <div style="margin-top:8px;display:flex;align-items:center;justify-content:center;gap:8px">
        <span class="level-badge" style="background:${getLevelColor(node.level)}">👑 ${prog.crown}/5</span>
      </div>
    </div>
  `;

  // Lesson modes
  html += `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px">
      <div class="card card-clickable" onclick="SkillTree.startLesson('${nodeId}','words')" style="text-align:center">
        <div style="font-size:2rem">📝</div>
        <div style="font-weight:700;font-size:.85rem;margin-top:4px">מילים</div>
        <div style="font-size:.7rem;color:var(--text3)">${words.length} מילים</div>
      </div>
      <div class="card card-clickable" onclick="SkillTree.startLesson('${nodeId}','sentences')" style="text-align:center">
        <div style="font-size:2rem">🎤</div>
        <div style="font-weight:700;font-size:.85rem;margin-top:4px">משפטים</div>
        <div style="font-size:.7rem;color:var(--text3)">${sentences.length} משפטים</div>
      </div>
      <div class="card card-clickable" onclick="SkillTree.startLesson('${nodeId}','quiz')" style="text-align:center">
        <div style="font-size:2rem">🧠</div>
        <div style="font-weight:700;font-size:.85rem;margin-top:4px">חידון</div>
        <div style="font-size:.7rem;color:var(--text3)">בדוק את עצמך</div>
      </div>
      
      <div class="card card-clickable" onclick="SkillTree.startLesson('${nodeId}','match')" style="text-align:center">
        <div style="font-size:2rem">🧩</div>
        <div style="font-weight:700;font-size:.85rem;margin-top:4px">זוגות</div>
        <div style="font-size:.7rem;color:var(--text3)">התאמת מילים</div>
      </div>
      <div class="card card-clickable" onclick="SkillTree.startLesson('${nodeId}','dialogue')" style="text-align:center">
        <div style="font-size:2rem">💬</div>
        <div style="font-weight:700;font-size:.85rem;margin-top:4px">שיחה</div>
        <div style="font-size:.7rem;color:var(--text3)">תרגל דיאלוג</div>
      </div>
    </div>
  `;

  // Word list preview
  html += `
    <h3 class="section-title"><span class="emoji">📝</span> מילים בנושא</h3>
  `;
  words.forEach(w => {
    const learned = state.wordsLearned.includes(w.target);
    html += `
      <div class="word-item" onclick="speak('${w.target.replace(/'/g, "\\'")}')">
        <div class="word-left">
          <div class="word-it">${w.target}</div>
          <div class="word-he">${w.native}</div>
        </div>
        <div class="word-right">
          ${learned ? '<div class="learned-badge">✓</div>' : ''}
          <button class="speak-btn" onclick="event.stopPropagation();speak('${w.target.replace(/'/g, "\\'")}')">🔊</button>
        </div>
      </div>
    `;
  });

  // Sentence list preview
  if (sentences.length > 0) {
    html += `<h3 class="section-title"><span class="emoji">🎤</span> משפטים</h3>`;
    sentences.forEach(s => {
      html += `
        <div class="card" onclick="speak('${s.target.replace(/'/g, "\\'")}')">
          <div style="font-family:var(--font-it);font-weight:600">${s.target}</div>
          <div style="font-size:.8rem;color:var(--text2);margin-top:4px">${s.native}</div>
        </div>
      `;
    });
  }

  // Grammar tip
  if (node.grammar) {
    html += `
      <h3 class="section-title"><span class="emoji">📖</span> דקדוק</h3>
      <div class="card" style="border-color:var(--indigo)">
        <div style="font-family:var(--font-it);font-weight:700;margin-bottom:6px">${node.grammar.title}</div>
        <div style="font-size:.85rem;color:var(--text2);line-height:1.6">${node.grammar.explanation}</div>
        ${node.grammar.examples ? node.grammar.examples.map(e => `
          <div style="margin-top:8px;padding:8px;background:var(--surface2);border-radius:6px">
            <div style="font-family:var(--font-it);font-weight:600">${e.target}</div>
            <div style="font-size:.8rem;color:var(--text3)">${e.native}</div>
          </div>
        `).join('') : ''}
      </div>
    `;
  }

  container.innerHTML = html;
}

// ── GET NODE DATA ──
function getNodeWords(node) {
  if (node.words) return node.words;
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
  found = (APP_DATA.words || []).filter(function(w) {
    return w.catAliases && w.catAliases.indexOf(cat) !== -1;
  });
  if (found.length > 0) return found.slice(0, 8);
  // Try partial name match
  found = (APP_DATA.words || []).filter(function(w) {
    return node.name.indexOf(w.cat) !== -1 || w.cat.indexOf(node.name) !== -1;
  });
  return found.slice(0, 8);
}

function getNodeSentences(node) {
  if (node.sentences) return node.sentences;
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
  found = (APP_DATA.sentences || []).filter(function(s) {
    return s.catAliases && s.catAliases.indexOf(cat) !== -1;
  });
  if (found.length > 0) return found.slice(0, 5);
  // Try partial name match
  found = (APP_DATA.sentences || []).filter(function(s) {
    return node.name.indexOf(s.cat) !== -1 || s.cat.indexOf(node.name) !== -1;
  });
  return found.slice(0, 5);
}

// ── START LESSON ──
function startLesson(nodeId, mode) {
  const node = APP_DATA.skillTree.find(n => n.id === nodeId);
  if (!node) return;
  
  if (mode === 'words') Practice.startWordLesson(node);
  else if (mode === 'sentences') Practice.startSentenceLesson(node);
  else if (mode === 'quiz') Practice.startQuiz(node);
  else if (mode === 'match') Practice.startMatchGame(node);
  else if (mode === 'dialogue') Practice.startDialogue(node);
}

// ── COMPLETE NODE (called by Practice after lesson) ──
function completeNode(nodeId, score) {
  const prog = getNodeProgress(nodeId);
  if (score >= 80) {
    if (prog.crown < 5) prog.crown++;
    prog.done = true;
    if (score > prog.bestScore) prog.bestScore = score;
  }
  state.nodeProgress[nodeId] = prog;
  save();
  
  if (prog.crown === 5) {
    confetti();
    toast(`👑 כתר מלא! ${APP_DATA.skillTree.find(n=>n.id===nodeId)?.name}`, 'success');
  }
  checkAchievements();
}

// ── CILS EXAM ──
function openExam(level) {
  Practice.startCILSExam(level);
}

// ── EXPOSE ──
return { render, toggleLevel, openNode, startLesson, completeNode, openExam, getNodeProgress, isUnlocked };

})();

// ═══════════════════════════════════════════════════════════════════
// DAILY MISSION LOADER (Sprint C5)
// ═══════════════════════════════════════════════════════════════════
async function loadDailyMission() {
  try {
    const recommendations = window.Orchestrator.getRecommendations();
    const mission = recommendations.dailyMission;
    const greeting = recommendations.profile && window.Nona ? window.Nona.getDailyGreeting(recommendations.profile) : null;
    
    if (!mission) return;
    
    // Render mission card at top of learn page
    const container = document.getElementById('learnContent');
    if (!container) return;
    
    const missionHtml = renderMissionCard(mission, greeting);
    container.insertAdjacentHTML('afterbegin', missionHtml);
    
    // Add event listener for start button
    const startBtn = document.getElementById('start-mission');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        // Navigate to practice page with daily mission
        window.goPage('practice');
        // Start the daily mission session
        setTimeout(() => {
          if (window.Practice && mission.exercises) {
            window.Practice.startLesson('daily_mission');
          }
        }, 100);
      });
    }
  } catch (e) {
    console.warn('loadDailyMission error:', e);
  }
}

function renderMissionCard(mission, greeting) {
  const streak = window.state?.streak || 0;
  const xpReward = mission.xpReward || 30;
  const exerciseCount = mission.exercises ? mission.exercises.reduce((sum, ex) => sum + (ex.count || 1), 0) : 5;
  const duration = mission.estimatedMinutes || 10;
  
  const objectivesHtml = mission.exercises ? mission.exercises.map(ex => {
    const icons = { flashcard: '📝', multiple_choice: '🧠', listening_mc: '🎧', speaking_pronunciation: '🗣️', dialogue_roleplay: '💬', writing_freeform: '✍️', exam_reading: '📖', exam_listening: '🎧', exam_speaking: '🗣️' };
    const icon = icons[ex.type] || '📋';
    const labels = { review: 'חזרה', new: 'חדש', weak_words: 'מילים חלשות', pronunciation: 'הגייה', fluency: 'שטף', exam_prep: 'מבחן' };
    const label = labels[ex.focus] || ex.focus;
    return `<div class="objective-item"><span class="objective-icon">${icon}</span><span>${ex.count || 1}x ${ex.type.replace(/_/g, ' ')}</span><span class="objective-focus">${label}</span></div>`;
  }).join('') : '<div class="objective-item">טוען...</div>';
  
  return `
      <section id="daily-mission" class="mission-card" style="animation: slideIn 0.4s ease">
        <header>
          <h2>🎯 המשימה היומית</h2>
          <span class="streak-badge">🔥 ${streak} ימים</span>
        </header>
        <div class="mission-content">
          ${greeting ? `<p class="nona-greeting">"${greeting.message}"</p>` : ''}
          <div class="mission-objectives">
            ${objectivesHtml}
          </div>
          <button class="btn btn-primary btn-block" id="start-mission" style="margin-top:16px;font-size:1rem;padding:14px">
            התחל משימה
          </button>
        </div>
        <footer class="mission-meta">
          <span>⏱ ${duration} דקות</span>
          <span>💎 +${xpReward} XP</span>
          <span>🎯 ${exerciseCount} תרגילים</span>
        </footer>
        ${renderStreakCalendar(streak)}
      </section>
    `;
  }

// Expose for use in app.js
window.SkillTree.loadDailyMission = loadDailyMission;

// ════════════════════════════════════════════════════════════════════
// STREAK CALENDAR (Sprint C5)
// ════════════════════════════════════════════════════════════════════
function renderStreakCalendar(streak) {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  
  // For Hebrew locale, we want Sunday first
  const dayLabels = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
  
  // Simulate completed days based on streak (in real app, this would come from state)
  // We'll show the last 'streak' days as completed
  const completedDays = new Set();
  for (let i = 0; i < streak; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (d.getMonth() === today.getMonth()) {
      completedDays.add(d.getDate());
    }
  }
  
  let html = `
    <div class="streak-calendar">
      <div class="streak-calendar-header">
        <h3 class="streak-calendar-title">📅 רצף חודשי</h3>
        <span style="font-size:.7rem;color:var(--text2)">${today.toLocaleDateString('he-IL', {month: 'long', year: 'numeric'})}</span>
      </div>
      <div class="streak-calendar-grid">
        ${dayLabels.map(d => `<div class="streak-day-header">${d}</div>`).join('')}
        ${' '.repeat(startDayOfWeek).split('').map(() => '<div class="streak-day empty"></div>').join('')}
        ${Array.from({length: daysInMonth}, (_, i) => i + 1).map(day => {
          const isToday = day === today.getDate();
          const isCompleted = completedDays.has(day);
          const classes = ['streak-day'];
          if (isToday) classes.push('today');
          if (isCompleted) classes.push('completed');
          return `<div class="${classes.join(' ')}" title="${isCompleted ? 'הושלם' : isToday ? 'היום' : ''}">
            <span class="streak-day-number">${day}</span>
            ${isCompleted ? '<span class="streak-day-icon">✓</span>' : ''}
          </div>`;
        }).join('')}
      </div>
    </div>
  `;
  
  return html;
}
