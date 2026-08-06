// ══════════════════════════════════════
// Analytics — Test Suite
// ══════════════════════════════════════

global.localStorage = {
  _data: {},
  getItem(k) { return this._data[k] || null; },
  setItem(k, v) { this._data[k] = v; },
  removeItem(k) { delete this._data[k]; }
};
global.window = {};

const Analytics = require('../js/modules/analytics.js');

let passed = 0, failed = 0;
function assert(cond, name) { 
  if (cond) { passed++; console.log(`  ✅ ${name}`); }
  else { failed++; console.log(`  ❌ ${name}`); }
}

console.log('═'.repeat(50));
console.log('ANALYTICS — TEST SUITE');
console.log('═'.repeat(50));

// Test 1: Init
Analytics.init();
assert(typeof Analytics.getStats === 'function', 'getStats() exists');
assert(typeof Analytics.trackLessonStart === 'function', 'trackLessonStart() exists');
assert(typeof Analytics.trackLessonComplete === 'function', 'trackLessonComplete() exists');
assert(typeof Analytics.trackAnswer === 'function', 'trackAnswer() exists');

// Test 2: Track sessions
Analytics.trackLessonStart('daily_mission');
Analytics.trackAnswer(true);
Analytics.trackAnswer(false);
Analytics.trackAnswer(true);
Analytics.trackLessonComplete('daily_mission', 0.75, 30);

let stats = Analytics.getStats();
assert(stats.totalSessions === 1, '1 session tracked');
assert(stats.totalXP >= 30, 'XP tracked');
assert(stats.completionRate >= 0, 'Completion rate computed');

// Test 3: Streak computation
assert(typeof stats.dailyStreak === 'number', 'Streak is number');

// Test 4: Weekly report
const week = Analytics.getWeeklyReport();
assert(week.weekXP >= 0, 'Week XP computed');
assert(Array.isArray(week.daily), 'Daily breakdown is array');
assert(week.daily.length === 7, '7 days in weekly report');

// Test 5: Multiple sessions
Analytics.trackLessonStart('vocab');
Analytics.trackLessonComplete('vocab', 1.0, 15);
Analytics.trackLessonStart('exam');
Analytics.trackLessonComplete('exam', 0.9, 50);

stats = Analytics.getStats();
assert(stats.totalSessions === 3, '3 total sessions');
assert(stats.totalXP >= 95, 'Total XP reflects all sessions');

// Test 6: Today tracking
assert(Analytics.today().length === 10, 'today() returns YYYY-MM-DD');

// Test 7: Completion rate
assert(stats.completionRate === 100, '100% completion (all started = completed)');

// Test 8: Hour tracking
const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
assert(typeof stats.lastSessionDate === 'string', 'Last session date tracked');

console.log(`\n${'═'.repeat(50)}`);
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log(`${'═'.repeat(50)}`);
process.exit(failed > 0 ? 1 : 0);
