/* ════════════════════════════════════════════════════════════════════
   VolaLingo — Learning Orchestrator
   Sprint C4D: Single decision engine for all learning flows
   ════════════════════════════════════════════════════════════════════ */

const LearningOrchestrator = (() => {

// ════════════════════════════════════════════════════════════════════
// DEPENDENCIES (injected at init)
// ════════════════════════════════════════════════════════════════════
let _state = null;           // app.js state
let _anki = null;            // AnkiPractice / SRS
let _skillTree = null;       // SkillTree
let _exerciseRegistry = null; // ExerciseRegistry
let _contentExercises = null; // ContentExercises
let _nona = null;            // Nona coach
let _gamification = null;    // Gamification
let _examEngine = null;      // ExamEngine
let _practice = null;        // Practice module
let _content = null;         // Content module
let _features = null;        // Features module

// ════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ════════════════════════════════════════════════════════════════════
const CONFIG = {
  // SRS thresholds
  srs: {
    dueThresholdHours: 24,
    weakThreshold: 0.6,      // accuracy below this = weak
    maxReviewPerSession: 15,
    maxNewPerSession: 10
  },
  // Skill tree
  skillTree: {
    masteryThreshold: 0.8,   // 80% = node mastered
    unlockLookahead: 2       // how many nodes ahead to unlock
  },
  // Speaking
  speaking: {
    weakThreshold: 0.65,
    minPronunciationScore: 0.7
  },
  // Grammar
  grammar: {
    weakThreshold: 0.6
  },
  // Exam
  exam: {
    daysBeforeExamToIntensify: 14,
    mockExamThreshold: 0.75
  },
  // Daily mission
  daily: {
    targetXP: 30,
    targetDurationMinutes: 10,
    maxNewContent: 3,
    reviewRatio: 0.4
  },
  // Session composition
  session: {
    warmupExercises: 2,
    coreExercises: 6,
    cooldownExercises: 1,
    maxTotalExercises: 12
  }
};

// ════════════════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════════════════
function init(dependencies) {
  _state = dependencies.state || window.state;
  _anki = dependencies.anki || window.anki || (window.AnkiPractice ? AnkiPractice : null);
  _skillTree = dependencies.skillTree || window.SkillTree;
  _exerciseRegistry = dependencies.exerciseRegistry || window.ExerciseRegistry;
  _contentExercises = dependencies.contentExercises || window.ContentExercises;
  _nona = dependencies.nona || window.Nona;
  _gamification = dependencies.gamification || window.Gamification;
  _examEngine = dependencies.examEngine || window.ExamEngine;
  _practice = dependencies.practice || window.Practice;
  _content = dependencies.content || window.Content;
  _features = dependencies.features || window.Features;

  console.log('🧠 LearningOrchestrator initialized');
  return api;
}

// ════════════════════════════════════════════════════════════════════
// CORE: BUILD USER PROFILE SNAPSHOT
// ════════════════════════════════════════════════════════════════════
function _buildUserProfile() {
  const state = _state || {};
  const anki = _anki || {};
  
  // SRS due count
  let srsDueCount = 0;
  let srsOverdueCount = 0;
  let weakWords = [];
  let speakingWeak = false;
  let grammarWeak = false;
  
  if (anki && typeof anki === 'object') {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    Object.values(anki).forEach(card => {
      if (card.dueDate && card.dueDate <= now) {
        srsDueCount++;
        if (card.dueDate < now - dayMs) srsOverdueCount++;
      }
      // Track weak words (low ease factor or many lapses)
      if (card.easeFactor && card.easeFactor < 2.0) {
        weakWords.push(card);
      }
      if (card.lapses && card.lapses > 2) {
        weakWords.push(card);
      }
    });
  }
  
  // Weak words from state
  if (state.weakWords && Array.isArray(state.weakWords)) {
    weakWords = [...weakWords, ...state.weakWords];
  }
  
  // Speaking weakness
  if (state.speakingStats) {
    const avgPronunciation = state.speakingStats.avgScore || 1;
    speakingWeak = avgPronunciation < CONFIG.speaking.minPronunciationScore;
  }
  
  // Grammar weakness (from quiz mistakes)
  if (state.grammarMistakes && Array.isArray(state.grammarMistakes)) {
    const recentMistakes = state.grammarMistakes.filter(m => 
      Date.now() - m.timestamp < 7 * 24 * 60 * 60 * 1000
    );
    grammarWeak = recentMistakes.length > 5;
  }
  
  // Current skill tree node
  let currentNode = null;
  let nextNode = null;
  let nodesMastered = 0;
  let nodesAvailable = [];
  
  if (_skillTree && state.currentNode) {
    currentNode = _skillTree.getNode(state.currentNode);
    if (currentNode) {
      nextNode = _skillTree.getNextNode(currentNode.id);
    }
    // Count mastered
    if (state.nodeProgress) {
      nodesMastered = Object.values(state.nodeProgress).filter(p => p >= CONFIG.skillTree.masteryThreshold).length;
    }
    // Available nodes
    if (_skillTree.getAvailableNodes) {
      nodesAvailable = _skillTree.getAvailableNodes(state);
    }
  }
  
  // Exam proximity
  let examSoon = false;
  let examType = null;
  let examLevel = null;
  if (state.examDate && state.examType) {
    const daysUntil = Math.ceil((new Date(state.examDate) - Date.now()) / (24 * 60 * 60 * 1000));
    examSoon = daysUntil <= CONFIG.exam.daysBeforeExamToIntensify;
    examType = state.examType;
    examLevel = state.examLevel;
  }
  
  // Daily progress
  const dailyXP = state.dailyXP || 0;
  const dailyGoal = state.dailyGoal || CONFIG.daily.targetXP;
  const dailyComplete = dailyXP >= dailyGoal;
  const streak = state.streak || 0;
  const lastDay = state.lastDay || '';
  const today = new Date().toISOString().split('T')[0];
  const streakActive = lastDay === today || lastDay === new Date(Date.now() - 24*60*60*1000).toISOString().split('T')[0];
  
  // Hearts
  const hearts = state.hearts || 5;
  const heartsLow = hearts <= 1;
  
  // League
  const league = state.league || 'ארד';
  const leagueXP = state.leagueXP || 0;
  
  return {
    // SRS
    srsDueCount,
    srsOverdueCount,
    weakWords: [...new Set(weakWords.map(w => w.id || w.word || w.target))].slice(0, 20),
    
    // Skills
    currentNode,
    nextNode,
    nodesMastered,
    nodesAvailable: nodesAvailable.slice(0, 5),
    
    // Weak areas
    speakingWeak,
    grammarWeak,
    weakWordsCount: weakWords.length,
    
    // Exam
    examSoon,
    examType,
    examLevel,
    daysUntilExam: examSoon ? Math.ceil((new Date(state.examDate) - Date.now()) / (24 * 60 * 60 * 1000)) : null,
    
    // Daily
    dailyXP,
    dailyGoal,
    dailyComplete,
    dailyProgress: Math.min(1, dailyXP / dailyGoal),
    streak,
    streakActive,
    
    // Health
    hearts,
    heartsLow,
    
    // League
    league,
    leagueXP,
    
    // Level
    level: state.level || 'A1',
    
    // Session history
    lastSessionType: state.lastSessionType,
    lastSessionScore: state.lastSessionScore,
    sessionsToday: state.sessionsToday || 0,
    
    // Time
    timeOfDay: new Date().getHours(),
    isWeekend: [0, 6].includes(new Date().getDay())
  };
}

// ════════════════════════════════════════════════════════════════════
// DECISION ENGINE: WHAT NEXT?
// ════════════════════════════════════════════════════════════════════
function decideNextAction(context = {}) {
  const profile = _buildUserProfile();
  const decisions = [];
  
  // ─────────────────────────────────────────
  // PRIORITY 1: CRITICAL — SRS Overdue
  // ─────────────────────────────────────────
  if (profile.srsOverdueCount > 0) {
    decisions.push({
      priority: 100,
      type: 'srs_review',
      reason: `יש ${profile.srsOverdueCount} כרטיסי SRS באיחור — חובה לחזור עליהם`,
      urgency: 'critical',
      payload: {
        exerciseType: 'anki_review',
        count: Math.min(profile.srsOverdueCount, CONFIG.srs.maxReviewPerSession),
        source: 'overdue'
      }
    });
  }
  
  // ─────────────────────────────────────────
  // PRIORITY 2: HIGH — SRS Due today
  // ─────────────────────────────────────────
  if (profile.srsDueCount > 0 && profile.srsOverdueCount === 0) {
    decisions.push({
      priority: 80,
      type: 'srs_review',
      reason: `יש ${profile.srsDueCount} כרטיסי SRS להיום`,
      urgency: 'high',
      payload: {
        exerciseType: 'anki_review',
        count: Math.min(profile.srsDueCount, CONFIG.srs.maxReviewPerSession),
        source: 'due'
      }
    });
  }
  
  // ─────────────────────────────────────────
  // PRIORITY 3: HIGH — Weak Speaking
  // ─────────────────────────────────────────
  if (profile.speakingWeak) {
    decisions.push({
      priority: 75,
      type: 'speaking_practice',
      reason: 'ההגייה צריכה שיפור — נתרגל דיבור',
      urgency: 'high',
      payload: {
        exerciseTypes: ['speaking_pronunciation', 'speaking_repeat'],
        focus: 'pronunciation',
        count: 3
      }
    });
  }
  
  // ─────────────────────────────────────────
  // PRIORITY 4: HIGH — Weak Grammar
  // ─────────────────────────────────────────
  if (profile.grammarWeak) {
    decisions.push({
      priority: 70,
      type: 'grammar_practice',
      reason: 'יש שגיאות דקדוק חוזרות — נתרגל דקדוק ממוקד',
      urgency: 'high',
      payload: {
        exerciseTypes: ['exam_grammar', 'sentence_builder', 'sentence_ordering'],
        focus: 'grammar',
        count: 4
      }
    });
  }
  
  // ─────────────────────────────────────────
  // PRIORITY 5: HIGH — Exam Coming Soon
  // ─────────────────────────────────────────
  if (profile.examSoon) {
    const examConfig = _getExamPrepConfig(profile.examType, profile.examLevel);
    decisions.push({
      priority: 85,
      type: 'exam_prep',
      reason: `בחינת ${profile.examType} ${profile.examLevel} בעוד ${profile.daysUntilExam} ימים — הכנה ממוקדת`,
      urgency: 'high',
      payload: {
        examType: profile.examType,
        level: profile.examLevel,
        daysLeft: profile.daysUntilExam,
        sections: examConfig.sections,
        mockExam: profile.daysUntilExam <= 3
      }
    });
  }
  
  // ─────────────────────────────────────────
  // PRIORITY 6: MEDIUM — Daily Mission Incomplete
  // ─────────────────────────────────────────
  if (!profile.dailyComplete && profile.sessionsToday === 0) {
    decisions.push({
      priority: 60,
      type: 'daily_mission',
      reason: 'משימה יומית לא הושלמה — נתחיל אותה',
      urgency: 'medium',
      payload: {
        targetXP: profile.dailyGoal - profile.dailyXP,
        remainingXP: profile.dailyGoal - profile.dailyXP
      }
    });
  }
  
  // ─────────────────────────────────────────
  // PRIORITY 7: MEDIUM — Weak Words Review
  // ─────────────────────────────────────────
  if (profile.weakWordsCount > 3) {
    decisions.push({
      priority: 55,
      type: 'weak_words_review',
      reason: `${profile.weakWordsCount} מילים חלשות זקוקות לחיזוק`,
      urgency: 'medium',
      payload: {
        exerciseTypes: ['multiple_choice', 'typing', 'flashcard'],
        wordIds: profile.weakWords,
        count: Math.min(profile.weakWordsCount, 8)
      }
    });
  }
  
  // ─────────────────────────────────────────
  // PRIORITY 8: MEDIUM — Skill Tree Progress
  // ─────────────────────────────────────────
  if (profile.currentNode && !profile.currentNode.mastered) {
    decisions.push({
      priority: 50,
      type: 'skill_tree_lesson',
      reason: `המשך שיעור: ${profile.currentNode.title || profile.currentNode.id}`,
      urgency: 'medium',
      payload: {
        nodeId: profile.currentNode.id,
        node: profile.currentNode
      }
    });
  } else if (profile.nextNode && profile.nodesAvailable.length > 0) {
    decisions.push({
      priority: 45,
      type: 'skill_tree_new',
      reason: `נושא חדש זמין: ${profile.nextNode.title || profile.nextNode.id}`,
      urgency: 'low',
      payload: {
        nodeId: profile.nextNode.id,
        node: profile.nextNode
      }
    });
  }
  
  // ─────────────────────────────────────────
  // PRIORITY 9: LOW — Maintenance / Variety
  // ─────────────────────────────────────────
  // Add variety if no high-priority items
  if (decisions.filter(d => d.urgency === 'critical' || d.urgency === 'high').length === 0) {
    // Mix in some fun/game content
    if (profile.isWeekend && Math.random() < 0.3) {
      decisions.push({
        priority: 30,
        type: 'game',
        reason: 'סוף שבוע — זמן למשחק!',
        urgency: 'low',
        payload: {
          exerciseTypes: ['game_match', 'game_memory', 'game_trivia'],
          count: 2
        }
      });
    }
    
    // Culture/article occasionally
    if (Math.random() < 0.2) {
      decisions.push({
        priority: 25,
        type: 'culture',
        reason: 'העשרה תרבותית',
        urgency: 'low',
        payload: {
          exerciseTypes: ['listening_multiple_choice', 'reading_comprehension'],
          count: 1
        }
      });
    }
  }
  
  // ─────────────────────────────────────────
  // SORT & RETURN TOP DECISIONS
  // ─────────────────────────────────────────
  decisions.sort((a, b) => b.priority - a.priority);
  
  // Return top 3 decisions for the session
  return decisions.slice(0, 3);
}

// ════════════════════════════════════════════════════════════════════
// EXAM PREP CONFIG
// ════════════════════════════════════════════════════════════════════
function _getExamPrepConfig(examType, level) {
  const configs = {
    CILS: {
      A1: { sections: ['reading', 'writing', 'listening', 'speaking', 'grammar'], weights: [0.2, 0.2, 0.2, 0.2, 0.2] },
      A2: { sections: ['reading', 'writing', 'listening', 'speaking', 'grammar'], weights: [0.2, 0.2, 0.2, 0.2, 0.2] },
      B1: { sections: ['reading', 'writing', 'listening', 'speaking', 'grammar', 'vocabulary'], weights: [0.18, 0.18, 0.18, 0.18, 0.14, 0.14] },
      B2: { sections: ['reading', 'writing', 'listening', 'speaking', 'grammar', 'vocabulary'], weights: [0.18, 0.18, 0.18, 0.18, 0.14, 0.14] },
      C1: { sections: ['reading', 'writing', 'listening', 'speaking', 'grammar', 'vocabulary'], weights: [0.18, 0.18, 0.18, 0.18, 0.14, 0.14] },
      C2: { sections: ['reading', 'writing', 'listening', 'speaking', 'grammar', 'vocabulary'], weights: [0.18, 0.18, 0.18, 0.18, 0.14, 0.14] }
    },
    CELI: {
      A1: { sections: ['reading', 'writing', 'listening', 'speaking', 'grammar'], weights: [0.2, 0.2, 0.2, 0.2, 0.2] },
      // ... similar structure
    },
    AIL: {
      // ...
    }
  };
  
  return configs[examType]?.[level] || { sections: ['reading', 'listening', 'grammar', 'vocabulary'], weights: [0.25, 0.25, 0.25, 0.25] };
}

// ════════════════════════════════════════════════════════════════════
// BUILD SESSION FROM DECISIONS
// ════════════════════════════════════════════════════════════════════
function buildSession(decisions, options = {}) {
  const profile = _buildUserProfile();
  const session = {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'orchestrated',
    timestamp: Date.now(),
    decisions: decisions,
    exercises: [],
    metadata: {
      profileSnapshot: {
        srsDue: profile.srsDueCount,
        srsOverdue: profile.srsOverdueCount,
        dailyProgress: profile.dailyProgress,
        streak: profile.streak,
        level: profile.level
      },
      targetXP: options.targetXP || CONFIG.daily.targetXP,
      targetDuration: options.targetDuration || CONFIG.daily.targetDurationMinutes * 60 * 1000
    }
  };
  
  let exerciseIndex = 0;
  
  for (const decision of decisions) {
    const exercisePlan = _planExercisesForDecision(decision, profile, exerciseIndex);
    session.exercises.push(...exercisePlan);
    exerciseIndex += exercisePlan.length;
    
    if (session.exercises.length >= CONFIG.session.maxTotalExercises) {
      break;
    }
  }
  
  // Ensure minimum session length
  if (session.exercises.length < CONFIG.session.warmupExercises + CONFIG.session.coreExercises) {
    const filler = _generateFillerExercises(profile, CONFIG.session.warmupExercises + CONFIG.session.coreExercises - session.exercises.length);
    session.exercises.push(...filler);
  }
  
  // Trim to max
  session.exercises = session.exercises.slice(0, CONFIG.session.maxTotalExercises);
  
  // Add Nona personality for session
  session.nonaPersonality = _selectNonaPersonality(profile, decisions);
  
  return session;
}

function _planExercisesForDecision(decision, profile, startIndex) {
  const exercises = [];
  const payload = decision.payload || {};
  const count = payload.count || 3;
  const exerciseTypes = payload.exerciseTypes || [payload.exerciseType];
  
  // Warmup (first 2 exercises)
  if (startIndex < CONFIG.session.warmupExercises) {
    exercises.push({
      type: exerciseTypes[0] || 'flashcard',
      role: 'warmup',
      config: _buildExerciseConfig(decision, profile, 'warmup'),
      decisionRef: decision.type
    });
    if (exercises.length >= count) return exercises;
  }
  
  // Core exercises
  for (let i = 0; i < count - exercises.length; i++) {
    const type = exerciseTypes[i % exerciseTypes.length];
    exercises.push({
      type,
      role: 'core',
      config: _buildExerciseConfig(decision, profile, 'core'),
      decisionRef: decision.type
    });
    if (exercises.length >= count) break;
  }
  
  // Cooldown (last exercise if space)
  if (startIndex + exercises.length >= CONFIG.session.warmupExercises + CONFIG.session.coreExercises) {
    exercises.push({
      type: 'game_match' || exerciseTypes[0],
      role: 'cooldown',
      config: _buildExerciseConfig(decision, profile, 'cooldown'),
      decisionRef: decision.type
    });
  }
  
  return exercises;
}

function _buildExerciseConfig(decision, profile, role) {
  const baseConfig = {
    allVocab: _contentExercises?.getContentCache?.()?.words?.map(w => _contentExercises.generateForWord(w.id, { count: 0 })[0]?.contentItem) || [],
    allSentences: [],
    allDialogues: [],
    userLevel: profile.level,
    examType: profile.examType,
    examLevel: profile.examLevel
  };
  
  switch (decision.type) {
    case 'srs_review':
      return { ...baseConfig, source: payload.source || 'due' };
    case 'speaking_practice':
      return { ...baseConfig, focus: 'pronunciation', minScore: CONFIG.speaking.minPronunciationScore };
    case 'grammar_practice':
      return { ...baseConfig, focus: 'grammar' };
    case 'exam_prep':
      return { ...baseConfig, examType: payload.examType, level: payload.level, sections: payload.sections };
    case 'weak_words_review':
      return { ...baseConfig, wordIds: payload.wordIds };
    case 'skill_tree_lesson':
    case 'skill_tree_new':
      return { ...baseConfig, nodeId: payload.nodeId };
    case 'daily_mission':
      return { ...baseConfig, targetXP: payload.targetXP };
    default:
      return baseConfig;
  }
}

function _generateFillerExercises(profile, count) {
  const exercises = [];
  const types = ['multiple_choice', 'flashcard', 'typing', 'sentence_builder'];
  
  for (let i = 0; i < count; i++) {
    exercises.push({
      type: types[i % types.length],
      role: 'filler',
      config: { userLevel: profile.level },
      decisionRef: 'filler'
    });
  }
  return exercises;
}

function _selectNonaPersonality(profile, decisions) {
  // Critical/High urgency → strict teacher
  const hasCritical = decisions.some(d => d.urgency === 'critical');
  const hasHigh = decisions.some(d => d.urgency === 'high');
  const streakHigh = profile.streak >= 7;
  const dailyComplete = profile.dailyComplete;
  
  if (hasCritical) return 'strict';
  if (hasHigh && !streakHigh) return 'teacher';
  if (streakHigh && dailyComplete) return 'sweet';
  if (profile.heartsLow) return 'strict';
  return 'teacher'; // default balanced
}

// ════════════════════════════════════════════════════════════════════
// PUBLIC API: DAILY MISSION
// ════════════════════════════════════════════════════════════════════
function createDailyMission(options = {}) {
  const decisions = decideNextAction({ context: 'daily_mission' });
  const session = buildSession(decisions, {
    targetXP: options.targetXP || CONFIG.daily.targetXP,
    targetDuration: options.targetDuration || CONFIG.daily.targetDurationMinutes * 60 * 1000
  });
  
  session.type = 'daily_mission';
  session.missionId = `daily_${new Date().toISOString().split('T')[0]}`;
  
  return session;
}

// ════════════════════════════════════════════════════════════════════
// PUBLIC API: EXAM SIMULATION
// ════════════════════════════════════════════════════════════════════
function createExamSimulation(examType, level, options = {}) {
  const profile = _buildUserProfile();
  const examConfig = _getExamPrepConfig(examType, level);
  
  const decisions = [{
    priority: 100,
    type: 'exam_simulation',
    reason: `סימולציית ${examType} ${level} מלאה`,
    urgency: 'critical',
    payload: {
      examType,
      level,
      sections: examConfig.sections,
      fullMock: true,
      timeLimit: options.timeLimit || 7200 // 2 hours default
    }
  }];
  
  const session = buildSession(decisions, {
    targetXP: 0, // Exam simulations don't give XP
    targetDuration: options.timeLimit || 7200 * 1000
  });
  
  session.type = 'exam_simulation';
  session.examType = examType;
  session.examLevel = level;
  
  return session;
}

// ════════════════════════════════════════════════════════════════════
// PUBLIC API: SIMULATION ENGINE (Sprint C6 prep)
// ════════════════════════════════════════════════════════════════════
function createSimulation(scenario, options = {}) {
  const scenarios = {
    restaurant: { name: 'מסעדה', level: 'A2', topics: ['food', 'polite_phrases', 'numbers'] },
    airport: { name: 'שדה תעופה', level: 'B1', topics: ['travel', 'directions', 'time'] },
    hospital: { name: 'בית חולים', level: 'B1', topics: ['body', 'health', 'emergency'] },
    coffee_shop: { name: 'בית קפה', level: 'A1', topics: ['food', 'greetings', 'numbers'] },
    apartment: { name: 'דירה', level: 'B2', topics: ['housing', 'contracts', 'complaints'] },
    police: { name: 'משטרה', level: 'B2', topics: ['emergency', 'documents', 'formal'] },
    university: { name: 'אוניברסיטה', level: 'C1', topics: ['academic', 'formal_writing', 'presentations'] },
    job_interview: { name: 'ראיון עבודה', level: 'C1', topics: ['professional', 'formal', 'cv'] },
    family_dinner: { name: 'ארוחה משפחתית', level: 'B1', topics: ['family', 'food', 'informal'] },
    italian_nonna: { name: 'נונה איטלקית', level: 'A2', topics: ['food', 'family', 'culture', 'dialect'] }
  };
  
  const scenarioConfig = scenarios[scenario] || scenarios.restaurant;
  
  const decisions = [{
    priority: 90,
    type: 'simulation',
    reason: `סימולציה: ${scenarioConfig.name}`,
    urgency: 'high',
    payload: {
      scenario,
      scenarioConfig,
      exerciseTypes: ['dialogue_roleplay', 'speaking_roleplay', 'listening_multiple_choice', 'writing_freeform'],
      immersionMode: true
    }
  }];
  
  const session = buildSession(decisions, {
    targetXP: options.targetXP || 50,
    targetDuration: options.duration || 15 * 60 * 1000
  });
  
  session.type = 'simulation';
  session.scenario = scenario;
  session.scenarioConfig = scenarioConfig;
  
  return session;
}

// ════════════════════════════════════════════════════════════════════
// PUBLIC API: AI SPEAKING COACH INTEGRATION (Sprint C7 prep)
// ════════════════════════════════════════════════════════════════════
function createSpeakingCoachSession(focus = 'general', options = {}) {
  const profile = _buildUserProfile();
  
  const focusConfigs = {
    pronunciation: { types: ['speaking_pronunciation', 'speaking_repeat'], intensity: 'high' },
    fluency: { types: ['speaking_roleplay', 'dialogue_roleplay'], intensity: 'medium' },
    exam: { types: ['exam_speaking', 'speaking_roleplay'], intensity: 'high' },
    conversation: { types: ['speaking_roleplay', 'dialogue_choice', 'dialogue_complete'], intensity: 'medium' },
    general: { types: ['speaking_pronunciation', 'speaking_repeat', 'speaking_roleplay'], intensity: 'balanced' }
  };
  
  const config = focusConfigs[focus] || focusConfigs.general;
  
  const decisions = [{
    priority: 80,
    type: 'speaking_coach',
    reason: `מאמן דיבור: ${focus}`,
    urgency: 'high',
    payload: {
      focus,
      exerciseTypes: config.types,
      intensity: config.intensity,
      minScore: CONFIG.speaking.minPronunciationScore,
      realTimeFeedback: true
    }
  }];
  
  const session = buildSession(decisions, {
    targetXP: options.targetXP || 40,
    targetDuration: options.duration || 10 * 60 * 1000
  });
  
  session.type = 'speaking_coach';
  session.focus = focus;
  
  return session;
}

// ════════════════════════════════════════════════════════════════════
// PUBLIC API: GET RECOMMENDATIONS (for UI)
// ════════════════════════════════════════════════════════════════════
function getRecommendations() {
  const profile = _buildUserProfile();
  const decisions = decideNextAction();
  
  return {
    profile,
    topDecisions: decisions,
    suggestedSession: buildSession(decisions.slice(0, 1)),
    dailyMission: !profile.dailyComplete ? createDailyMission() : null,
    quickActions: _generateQuickActions(profile)
  };
}

function _generateQuickActions(profile) {
  const actions = [];
  
  if (profile.srsDueCount > 0) {
    actions.push({ id: 'srs_review', label: `🔁 SRS (${profile.srsDueCount})`, priority: 'high' });
  }
  if (profile.weakWordsCount > 0) {
    actions.push({ id: 'weak_words', label: `💪 מילים חלשות (${profile.weakWordsCount})`, priority: 'high' });
  }
  if (profile.currentNode && !profile.currentNode.mastered) {
    actions.push({ id: 'continue_lesson', label: `📖 המשך: ${profile.currentNode.title}`, priority: 'medium' });
  }
  if (profile.nextNode) {
    actions.push({ id: 'new_lesson', label: `✨ חדש: ${profile.nextNode.title}`, priority: 'low' });
  }
  if (profile.examSoon) {
    actions.push({ id: 'exam_prep', label: `📝 הכנה ל-${profile.examType} ${profile.examLevel}`, priority: 'high' });
  }
  if (!profile.dailyComplete) {
    actions.push({ id: 'daily_mission', label: `🎯 משימה יומית (${profile.dailyXP}/${profile.dailyGoal} XP)`, priority: 'medium' });
  }
  
  actions.push({ id: 'simulation', label: '🎭 סימולציה', priority: 'low' });
  actions.push({ id: 'speaking_coach', label: '🗣️ מאמן דיבור', priority: 'low' });
  actions.push({ id: 'game', label: '🎮 משחק', priority: 'low' });
  
  return actions;
}

// ════════════════════════════════════════════════════════════════════
// EVENT HOOKS (called by other modules)
// ════════════════════════════════════════════════════════════════════
function onExerciseComplete(exercise, result) {
  // Update internal tracking
  // Could trigger re-orchestration mid-session
}

function onSessionComplete(session, summary) {
  // Update state
  if (_state) {
    _state.lastSessionType = session.type;
    _state.lastSessionScore = summary.score;
    _state.sessionsToday = (_state.sessionsToday || 0) + 1;
    _state.dailyXP = (_state.dailyXP || 0) + (summary.xpEarned || 0);
  }
}

function onLevelUp(newLevel) {
  // Recalibrate recommendations
}

function onStreakMilestone(streak) {
  // Trigger celebration
}

// ════════════════════════════════════════════════════════════════════
// PUBLIC API
// ════════════════════════════════════════════════════════════════════
const api = {
  init,
  decideNextAction,
  buildSession,
  createDailyMission,
  createExamSimulation,
  createSimulation,
  createSpeakingCoachSession,
  getRecommendations,
  getProfile: _buildUserProfile,
  
  // Event hooks
  onExerciseComplete,
  onSessionComplete,
  onLevelUp,
  onStreakMilestone,
  
  // Config access
  CONFIG
};

return api;

})();

// Expose globally
window.LearningOrchestrator = LearningOrchestrator;

// Auto-init when dependencies ready
if (typeof window.state !== 'undefined' && window.ExerciseRegistry) {
  LearningOrchestrator.init({
    state: window.state,
    anki: window.anki,
    skillTree: window.SkillTree,
    exerciseRegistry: window.ExerciseRegistry,
    contentExercises: window.ContentExercises,
    nona: window.Nona,
    gamification: window.Gamification,
    examEngine: window.ExamEngine,
    practice: window.Practice,
    content: window.Content,
    features: window.Features
  });
} else {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (window.ExerciseRegistry) {
        LearningOrchestrator.init({
          state: window.state,
          anki: window.anki,
          skillTree: window.SkillTree,
          exerciseRegistry: window.ExerciseRegistry,
          contentExercises: window.ContentExercises,
          nona: window.Nona,
          gamification: window.Gamification,
          examEngine: window.ExamEngine,
          practice: window.Practice,
          content: window.Content,
          features: window.Features
        });
      }
    }, 200);
  });
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LearningOrchestrator;
}