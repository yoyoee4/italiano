// ════════════════════════════════════════════════════════════════════
// VolaLingo — Analytics Module
// Tracks retention, completion rates, streaks, XP velocity, error trends
// ════════════════════════════════════════════════════════════════════
;(function(){
'use strict';

const Analytics = (function(){

  const STORAGE_KEY = 'vl_analytics';
  const SESSION_KEY = 'vl_session';

  // ── DATA MODEL ──
  function defaultData() {
    return {
      version: 2,
      firstVisit: Date.now(),
      totalSessions: 0,
      completedLessons: 0,
      startedLessons: 0,
      totalXP: 0,
      totalCoins: 0,
      totalMistakes: 0,
      totalCorrect: 0,
      daysActive: [],          // YYYY-MM-DD strings
      dailyXP: {},             // YYYY-MM-DD: XP
      dailySessions: {},       // YYYY-MM-DD: count
      dailyMistakes: {},       // YYYY-MM-DD: count
      dailyStreak: 0,         // computed on load
      lastSessionDate: '',
      lessonHistory: [],      // {type, score, xp, timestamp, duration}
      hoursActive: {},        // hour of day -> count (for peak usage)
      retention: {            // day-1, day-3, day-7, day-30
        day1: false,
        day3: false,
        day7: false,
        day30: false
      }
    };
  }

  let _data = null;
  let _sessionStart = Date.now();
  let _sessionMistakes = 0;
  let _sessionCorrect = 0;

  // ── INIT ──
  function init() {
    _data = load();
    _sessionStart = Date.now();
    _sessionMistakes = 0;
    _sessionCorrect = 0;
    trackDaily();
    checkRetention();
    return api;
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...defaultData(), ...JSON.parse(raw) } : defaultData();
    } catch(e) { return defaultData(); }
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(_data)); }
    catch(e) { /* storage full */ }
  }

  // ── DAILY TRACKING ──
  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function trackDaily() {
    const d = today();
    if (_data.lastSessionDate !== d) {
      _data.lastSessionDate = d;
      if (!_data.daysActive.includes(d)) {
        _data.daysActive.push(d);
      }
      if (!_data.dailyXP[d]) _data.dailyXP[d] = 0;
      if (!_data.dailySessions[d]) _data.dailySessions[d] = 0;
      if (!_data.dailyMistakes[d]) _data.dailyMistakes[d] = 0;
    }
    // Compute streak
    _data.dailyStreak = computeStreak();
  }

  function computeStreak() {
    const days = _data.daysActive.slice().sort().reverse();
    if (days.length === 0) return 0;
    let streak = 0;
    const todayDate = today();
    // Check if today is active
    if (days[0] === todayDate) {
      streak = 1;
    } else {
      // Check if yesterday was active (streak continues)
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (days[0] !== yesterday) return 0;
      streak = 1;
    }
    // Count consecutive days backwards
    for (let i = 1; i < days.length; i++) {
      const prev = new Date(Date.now() - (streak * 86400000)).toISOString().slice(0, 10);
      if (days[i] === prev) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  // ── RETENTION ──
  function checkRetention() {
    const daysSinceFirst = Math.floor((Date.now() - _data.firstVisit) / 86400000);
    if (daysSinceFirst >= 1 && _data.daysActive.length >= 2) _data.retention.day1 = true;
    if (daysSinceFirst >= 3 && getActiveDaysInPeriod(3) >= 2) _data.retention.day3 = true;
    if (daysSinceFirst >= 7 && getActiveDaysInPeriod(7) >= 4) _data.retention.day7 = true;
    if (daysSinceFirst >= 30 && getActiveDaysInPeriod(30) >= 15) _data.retention.day30 = true;
  }

  function getActiveDaysInPeriod(daysBack) {
    const cutoff = new Date(Date.now() - daysBack * 86400000).toISOString().slice(0, 10);
    return _data.daysActive.filter(d => d >= cutoff).length;
  }

  // ── TRACK EVENTS ──
  function trackLessonStart(type) {
    _data.totalSessions++;
    _data.startedLessons++;
    const d = today();
    if (_data.dailySessions[d] !== undefined) _data.dailySessions[d]++;
    save();
  }

  function trackLessonComplete(type, score, xp) {
    _data.completedLessons++;
    _data.totalXP += xp || 0;
    const d = today();
    if (_data.dailyXP[d] !== undefined) _data.dailyXP[d] += (xp || 0);
    
    _data.lessonHistory.push({
      type: type || 'unknown',
      score: score || 0,
      xp: xp || 0,
      timestamp: Date.now(),
      duration: Math.floor((Date.now() - _sessionStart) / 1000)
    });
    
    // Keep last 500 entries
    if (_data.lessonHistory.length > 500) {
      _data.lessonHistory = _data.lessonHistory.slice(-500);
    }
    
    trackDaily();
    checkRetention();
    save();
  }

  function trackAnswer(correct) {
    if (correct) {
      _sessionCorrect++;
      _data.totalCorrect++;
    } else {
      _sessionMistakes++;
      _data.totalMistakes++;
      const d = today();
      if (_data.dailyMistakes[d] !== undefined) _data.dailyMistakes[d]++;
    }
  }

  // ── COMPUTED STATS ──
  function getStats() {
    const d = today();
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    
    return {
      // Core KPIs
      totalSessions: _data.totalSessions,
      completionRate: _data.startedLessons > 0 
        ? Math.round((_data.completedLessons / _data.startedLessons) * 100) 
        : 0,
      dailyStreak: _data.dailyStreak,
      
      // XP
      totalXP: _data.totalXP,
      xpToday: _data.dailyXP[d] || 0,
      xpThisWeek: Object.entries(_data.dailyXP)
        .filter(([date]) => date >= weekAgo)
        .reduce((sum, [, xp]) => sum + xp, 0),
      
      // Mistakes
      accuracy: _data.totalCorrect + _data.totalMistakes > 0
        ? Math.round((_data.totalCorrect / (_data.totalCorrect + _data.totalMistakes)) * 100)
        : 0,
      mistakesToday: _data.dailyMistakes[d] || 0,
      
      // Engagement
      daysActive: _data.daysActive.length,
      daysSinceFirst: Math.floor((Date.now() - _data.firstVisit) / 86400000) + 1,
      avgSessionMinutes: _data.lessonHistory.length > 0
        ? Math.round(_data.lessonHistory.reduce((sum, l) => sum + l.duration, 0) / _data.lessonHistory.length / 60)
        : 0,
      
      // Retention
      retention: { ..._data.retention },
      
      // Time
      firstVisit: _data.firstVisit,
      lastSessionDate: _data.lastSessionDate,
      
      // Hourly breakdown (for peak usage analysis)
      peakHour: Object.entries(_data.hoursActive)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([h]) => `${h}:00`)
    };
  }

  // ── WEEKLY REPORT ──
  function getWeeklyReport() {
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const daily = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      daily.push({
        date,
        xp: _data.dailyXP[date] || 0,
        sessions: _data.dailySessions[date] || 0,
        mistakes: _data.dailyMistakes[date] || 0
      });
    }
    return {
      weekXP: Object.entries(_data.dailyXP)
        .filter(([date]) => date >= weekAgo)
        .reduce((sum, [, xp]) => sum + xp, 0),
      daily,
      streak: _data.dailyStreak,
      lessonsCompleted: _data.lessonHistory.filter(l => l.timestamp > Date.now() - 7 * 86400000).length
    };
  }

  // ── ERROR INTELLIGENCE INTEGRATION ──
  function getWeakAreas() {
    if (window.ErrorIntel) {
      const patterns = window.ErrorIntel.getWeakPatterns(2);
      return patterns.map(p => ({
        type: p.type,
        label: p.label,
        icon: p.icon,
        count: p.count
      }));
    }
    return [];
  }

  // ── PUBLIC API ──
  const api = {
    init,
    trackLessonStart,
    trackLessonComplete,
    trackAnswer,
    getStats,
    getWeeklyReport,
    getWeakAreas,
    today,
    version: '1.0'
  };

  if (typeof window !== 'undefined') {
    window.Analytics = api;
  }

  return api;

})();

// Export for Node tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Analytics;
}

})();
