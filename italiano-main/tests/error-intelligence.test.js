// ════════════════════════════════════════════════════════════════════
// Error Intelligence — Test Suite
// ════════════════════════════════════════════════════════════════════

// Mock globals BEFORE requiring
global.window = {
  state: {},
  APP_DATA: {
    words: [
      { it: 'casa', he: 'בית', cat: 'house', gender: 'f' },
      { it: 'libro', he: 'ספר', cat: 'education', gender: 'm' },
      { it: 'tavolo', he: 'שולחן', cat: 'house', gender: 'm' },
      { it: 'sedia', he: 'כיסא', cat: 'house', gender: 'f' },
      { it: 'finestra', he: 'חלון', cat: 'house', gender: 'f' },
      { it: 'cane', he: 'כלב', cat: 'animals', gender: 'm' },
      { it: 'gatto', he: 'חתול', cat: 'animals', gender: 'm' },
      { it: 'acqua', he: 'מים', cat: 'food', gender: 'f' },
      { it: 'pane', he: 'לחם', cat: 'food', gender: 'm' },
      { it: 'vino', he: 'יין', cat: 'food', gender: 'm' },
    ]
  }
};
global.localStorage = {
  _data: {},
  getItem(k) { return this._data[k] || null; },
  setItem(k, v) { this._data[k] = v; },
  removeItem(k) { delete this._data[k]; }
};

// Mock Nona BEFORE loading module
global.window.Nona = { onWrong: function() {} };

const ErrorIntel = require('../js/modules/error-intelligence.js');

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) { passed++; console.log(`  ✅ ${name}`); }
  else { failed++; console.log(`  ❌ ${name}`); }
}

console.log('═'.repeat(50));
console.log('ERROR INTELLIGENCE — TEST SUITE');
console.log('═'.repeat(50));

const EI = ErrorIntel;

console.log('\n📋 Test 1: Initialization');
assert(typeof EI.init === 'function', 'init() exists');
assert(typeof EI.logMistake === 'function', 'logMistake() exists');
assert(typeof EI.getFrequentMistakes === 'function', 'getFrequentMistakes() exists');
assert(typeof EI.getNonaMessage === 'function', 'getNonaMessage() exists');
assert(typeof EI.getStats === 'function', 'getStats() exists');
assert(typeof EI.classifyError === 'function', 'classifyError() exists');
assert(typeof EI.getTargetedExercise === 'function', 'getTargetedExercise() exists');

console.log('\n📋 Test 2: Error Classification');
assert(EI.classifyError('casa', 'il casa', 'la casa') === 'gender', 'Gender error: il casa → la casa');
assert(EI.classifyError('cane', 'la cane', 'il cane') === 'gender', 'Gender error: la cane → il cane');
assert(EI.classifyError('parola', 'sbagliato', 'corretto') === 'vocabulary', 'Vocab error');

console.log('\n📋 Test 3: Logging Mistakes');
EI.init({});
assert(EI.logMistake('casa', 'il casa', 'la casa', 'article ex') === 'gender', 'Returns gender');
EI.logMistake('libro', 'la libro', 'il libro', 'reading');
EI.logMistake('tavolo', 'la tavolo', 'il tavolo', 'writing');
let stats = EI.getStats();
assert(stats.totalMistakes === 3, '3 total mistakes');
assert(stats.uniqueWords === 3, '3 unique words');

console.log('\n📋 Test 4: Frequent Mistakes');
assert(EI.getFrequentMistakes(1).length >= 3, 'Has frequent mistakes');
assert(EI.getFrequentMistakes(5).length === 0, 'No >=5 mistakes');

console.log('\n📋 Test 5: Weak Patterns');
EI.logMistake('sedia', 'il sedia', 'la sedia', 'x');
EI.logMistake('finestra', 'il finestra', 'la finestra', 'x');
let patterns = EI.getWeakPatterns(3);
assert(patterns.some(p => p.type === 'gender'), 'Gender is weak pattern');

console.log('\n📋 Test 6: Targeted Exercises');
let ex = EI.getTargetedExercise('gender', 'A1');
assert(ex !== null, 'Gender exercise generated');
if (ex) {
  assert(ex.prompt !== undefined, 'Has prompt');
  assert(ex.options !== undefined, 'Has options');
}

console.log('\n📋 Test 7: Nona Messages');
// Need 3+ mistakes on a specific word+type for message
for (let i = 0; i < 3; i++) {
  EI.logMistake('casa', 'il casa', 'la casa', 'ex');
}
let msg = EI.getNonaMessage();
assert(msg !== null, 'Nona message generated');
if (msg) assert(msg.length > 10, 'Has content');

console.log('\n📋 Test 8: Error Types');
assert(EI.ERROR_TYPES.GENDER !== undefined, 'GENDER defined');
assert(EI.ERROR_TYPES.PREPOSITION !== undefined, 'PREPOSITION defined');
assert(Object.keys(EI.ERROR_TYPES).length >= 8, '8+ error types');

console.log('\n📋 Test 9: Nona Hook');
assert(global.window.Nona.onWrong !== undefined, 'Nona hook exists');
assert(global.window.ErrorIntel !== undefined, 'window.ErrorIntel exists');

console.log('\n📋 Test 10: Clear & Reset');
EI.clearMistakes();
assert(EI.getStats().totalMistakes === 0, 'Clear resets data');

console.log(`\n${'═'.repeat(50)}`);
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log(`${'═'.repeat(50)}`);
process.exit(failed > 0 ? 1 : 0);
