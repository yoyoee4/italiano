/* ═══════════════════════════════════════════════
 VolaLingo — Games Module
 Memory Match, Word Scramble, Speed Tap,
 Hangman, Listening Quiz, Free Speech,
 + Extended Simulations per level
 ═══════════════════════════════════════════════ */

const Games = (() => {

// ═══════════════════════════════════════
// 1. MEMORY MATCH — flip cards, match IT↔HE
// ═══════════════════════════════════════
let memCards = [], memFlipped = [], memMatched = 0, memMoves = 0, memTimer = null, memTime = 0;

function startMemory(level) {
 const words = getWordsForLevel(level || 'A1').slice(0, 6); // 6 pairs = 12 cards
 if (words.length < 4) { toast('אין מספיק מילים למשחק זה', 'error'); return; }
 
 memCards = [];
 memFlipped = [];
 memMatched = 0;
 memMoves = 0;
 memTime = 0;
 clearInterval(memTimer);
 
 words.forEach(w => {
  memCards.push({ id: w.target + '_it', pair: w.native, type: 'it', text: w.target, matched: false });
  memCards.push({ id: w.native + '_he', pair: w.target, type: 'he', text: w.native, matched: false });
 });
 
 shuffle(memCards);
 memTimer = setInterval(() => { memTime++; updateMemTimer(); }, 1000);
 renderMemory();
}

function renderMemory() {
 const area = document.getElementById('gameArea');
 if (!area) return;
 
 area.innerHTML = `
 <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
  <button class="back-btn" onclick="Games.showMenu()">← חזרה</button>
  <div style="display:flex;gap:16px;font-size:.85rem">
   <span id="memTimerDisplay">⏱️ 0:00</span>
   <span>🔄 ${memMoves}</span>
   <span>✅ ${memMatched}/${memCards.length/2}</span>
  </div>
 </div>
 <div class="memory-grid">
  ${memCards.map((c, i) => `
   <div class="mem-card ${c.matched ? 'matched' : ''} ${memFlipped.includes(i) ? 'flipped' : ''}" 
    onclick="Games.memFlip(${i})">
    <div class="mem-card-inner">
     <div class="mem-card-front">❓</div>
     <div class="mem-card-back ${c.type === 'it' ? 'mem-it' : 'mem-he'}">
      ${c.type === 'it' ? '🇮🇹 ' : '🇮🇱 '}${c.text}
     </div>
    </div>
   </div>
  `).join('')}
 </div>
 `;
}

function memFlip(idx) {
 if (memFlipped.length >= 2) return;
 if (memFlipped.includes(idx)) return;
 if (memCards[idx].matched) return;
 
 memFlipped.push(idx);
 renderMemory();
 
 if (memFlipped.length === 2) {
  memMoves++;
  const [a, b] = memFlipped;
  
  if (memCards[a].text === memCards[b].pair) {
   // Match!
   memCards[a].matched = true;
   memCards[b].matched = true;
   memMatched++;
   memFlipped = [];
   addXP(5);
   
   setTimeout(() => {
    renderMemory();
    if (memMatched === memCards.length / 2) {
     clearInterval(memTimer);
     const bonus = Math.max(0, 50 - memMoves) * 2;
     addXP(bonus);
     toast(`🎉 מצוין! ${memMoves} מהלכים ב-${formatTime(memTime)} +${bonus} XP`, 'success');
    }
   }, 500);
  } else {
   // No match — flip back
   setTimeout(() => { memFlipped = []; renderMemory(); }, 900);
  }
 }
}

function updateMemTimer() {
 const el = document.getElementById('memTimerDisplay');
 if (el) el.textContent = '⏱️ ' + formatTime(memTime);
}

// ═══════════════════════════════════════
// 2. WORD SCRAMBLE — unscramble Italian words
// ═══════════════════════════════════════
let scramWord = null, scramTiles = [], scramPlaced = [];

function startScramble(level) {
 const words = getWordsForLevel(level || 'A1');
 scramWord = words[Math.floor(Math.random() * words.length)];
 
 // Scramble the Italian word
 const letters = scramWord.target.replace(/[']/g, '').split('');
 do { shuffle(letters); } while (letters.join('') === scramWord.target.replace(/[']/g, ''));
 
 scramTiles = letters.map((l, i) => ({ letter: l, id: i, used: false }));
 scramPlaced = [];
 renderScramble();
}

function renderScramble() {
 const area = document.getElementById('gameArea');
 if (!area) return;
 
 area.innerHTML = `
 <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
  <button class="back-btn" onclick="Games.showMenu()">← חזרה</button>
  <span style="font-size:.85rem;color:var(--text3)">🧩 פענח את המילה</span>
 </div>
 
 <div class="card" style="text-align:center;padding:20px;margin-bottom:16px">
  <div style="font-size:.8rem;color:var(--text3);margin-bottom:8px">🇮🇱 רמז:</div>
  <div style="font-size:1.2rem;font-weight:600;color:var(--emerald-light)">${scramWord.native}</div>
  <button class="btn btn-sm btn-secondary" onclick="speak('${esc(scramWord.target)}')" style="margin-top:8px">🔊 האזן</button>
 </div>
 
 <div class="scramble-answer" id="scrambleAnswer">
  ${scramPlaced.map((t, i) => `
   <div class="scramble-tile placed" onclick="Games.scramRemove(${i})">${t.letter}</div>
  `).join('')}
  ${Array(scramTiles.filter(t=>!t.used).length).fill('<div class="scramble-tile empty"></div>').join('')}
 </div>
 
 <div class="scramble-pool">
  ${scramTiles.map((t, i) => `
   <div class="scramble-tile ${t.used ? 'used' : ''}" onclick="Games.scramPlace(${i})">${t.letter}</div>
  `).join('')}
 </div>
 
 <div style="display:flex;gap:8px;justify-content:center;margin-top:16px">
  <button class="btn btn-primary btn-sm" onclick="Games.scramCheck()">בדוק ✓</button>
  <button class="btn btn-secondary btn-sm" onclick="Games.scramSkip()">דלג →</button>
 </div>
 `;
}

function scramPlace(tileIdx) {
 if (scramTiles[tileIdx].used) return;
 scramTiles[tileIdx].used = true;
 scramPlaced.push(scramTiles[tileIdx]);
 renderScramble();
}

function scramRemove(placedIdx) {
 const tile = scramPlaced[placedIdx];
 // Find original tile and unuse it
 const origIdx = scramTiles.findIndex(t => t.id === tile.id);
 if (origIdx >= 0) scramTiles[origIdx].used = false;
 scramPlaced.splice(placedIdx, 1);
 renderScramble();
}

function scramCheck() {
 const answer = scramPlaced.map(t => t.letter).join('');
 const correct = scramWord.target.replace(/[']/g, '');
 
 if (answer === correct) {
  addXP(15);
  toast(`✅ ${scramWord.target} — נכון! +15 XP`, 'success');
  speak(scramWord.target);
  setTimeout(() => startScramble(), 1500);
 } else {
  toast('❌ לא נכון — נסה שוב', 'error');
 }
}

function scramSkip() {
 toast(`התשובה: ${scramWord.target}`, 'info');
 setTimeout(() => startScramble(), 1500);
}

// ═══════════════════════════════════════
// 3. SPEED TAP — tap the correct translation fast
// ═══════════════════════════════════════
let speedWords = [], speedIdx = 0, speedScore = 0, speedTime = 15, speedTimer = null, speedActive = false;

function startSpeedTap(level) {
 speedWords = shuffle(getWordsForLevel(level || 'A1')).slice(0, 10);
 speedIdx = 0; speedScore = 0; speedTime = 15; speedActive = true;
 clearInterval(speedTimer);
 
 speedTimer = setInterval(() => {
  speedTime--;
  const el = document.getElementById('speedTimer');
  if (el) el.textContent = speedTime + 's';
  if (speedTime <= 0) { speedActive = false; clearInterval(speedTimer); endSpeedTap(); }
 }, 1000);
 
 renderSpeedTap();
}

function renderSpeedTap() {
 if (!speedActive || speedIdx >= speedWords.length) { endSpeedTap(); return; }
 const area = document.getElementById('gameArea');
 if (!area) return;
 
 const w = speedWords[speedIdx];
 const distractors = getDistractors(APP_DATA.words, w.native, 'native').slice(0, 3);
 const options = shuffle([w, ...distractors]);
 
 area.innerHTML = `
 <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
  <button class="back-btn" onclick="Games.endSpeedTap()">← חזרה</button>
  <div style="display:flex;gap:12px;font-size:.85rem">
   <span id="speedTimer" style="color:var(--orange);font-weight:700">${speedTime}s</span>
   <span style="color:var(--emerald)">✅ ${speedScore}</span>
  </div>
 </div>
 
 <div class="card" style="text-align:center;padding:24px;margin-bottom:16px">
  <div style="font-size:.8rem;color:var(--text3);margin-bottom:8px">🇮🇹 מה התרגום?</div>
  <div style="font-size:1.8rem;font-family:var(--font-it);font-weight:700;color:var(--indigo-light)">${w.target}</div>
  <button class="btn btn-sm btn-secondary" onclick="speak('${esc(w.target)}')" style="margin-top:8px">🔊</button>
 </div>
 
 <div class="speed-options">
  ${options.map(o => `
   <button class="btn speed-opt" onclick="Games.speedAnswer('${esc(o.native)}','${esc(w.native)}')">${o.native}</button>
  `).join('')}
 </div>
 
 <div class="progress-bar" style="margin-top:12px"><div class="progress-fill" style="width:${(speedIdx/speedWords.length)*100}%"></div></div>
 `;
}

function speedAnswer(chosen, correct) {
 if (chosen === correct) {
  speedScore += 10;
  addXP(5);
  speedTime = Math.min(speedTime + 2, 20); // bonus time
 } else {
  speedTime = Math.max(speedTime - 3, 1); // penalty
 }
 speedIdx++;
 renderSpeedTap();
}

function endSpeedTap() {
 speedActive = false;
 clearInterval(speedTimer);
 const area = document.getElementById('gameArea');
 if (!area) return;
 
 area.innerHTML = `
 <div class="card" style="text-align:center;padding:32px">
  <div style="font-size:3rem;margin-bottom:12px">⚡</div>
  <div style="font-size:1.4rem;font-weight:700">Speed Tap</div>
  <div style="font-size:1.1rem;color:var(--emerald);margin-top:8px">✅ ${speedScore} נקודות</div>
  <div style="font-size:.85rem;color:var(--text3);margin-top:8px">${speedIdx}/${speedWords.length} מילים</div>
  <div style="display:flex;gap:8px;justify-content:center;margin-top:16px">
   <button class="btn btn-primary btn-sm" onclick="Games.startSpeedTap()">🔄 שוב</button>
   <button class="btn btn-secondary btn-sm" onclick="Games.showMenu()">חזרה</button>
  </div>
 </div>
 `;
}

// ═══════════════════════════════════════
// 4. HANGMAN — guess the Italian word letter by letter
// ═══════════════════════════════════════
let hangWord = null, hangGuessed = [], hangWrong = 0, hangMax = 6;

function startHangman(level) {
 const words = getWordsForLevel(level || 'A1');
 hangWord = words[Math.floor(Math.random() * words.length)];
 hangGuessed = [];
 hangWrong = 0;
 renderHangman();
}

function renderHangman() {
 const area = document.getElementById('gameArea');
 if (!area) return;
 
 const word = hangWord.target.replace(/[']/g, '');
 const revealed = word.split('').map(l => hangGuessed.includes(l) ? l : '_').join(' ');
 const won = word.split('').every(l => hangGuessed.includes(l));
 const lost = hangWrong >= hangMax;
 
 // Italian alphabet (no j,k,w,x,y commonly)
 const alphabet = 'abcdefghilmnopqrstuvz'.split('');
 
 area.innerHTML = `
 <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
  <button class="back-btn" onclick="Games.showMenu()">← חזרה</button>
  <div style="display:flex;gap:8px;font-size:.85rem">
   <span style="color:var(--red)">❌ ${hangWrong}/${hangMax}</span>
  </div>
 </div>
 
 <div class="card" style="text-align:center;padding:20px;margin-bottom:16px">
  <div style="font-size:.8rem;color:var(--text3);margin-bottom:8px">🇮🇱 רמז:</div>
  <div style="font-size:1.1rem;color:var(--emerald-light)">${hangWord.native}</div>
 </div>
 
 <div style="text-align:center;margin-bottom:16px">
  <div style="font-family:var(--font-it);font-size:1.8rem;letter-spacing:4px;font-weight:700;color:${won ? 'var(--emerald)' : lost ? 'var(--red)' : 'var(--indigo-light)'}">
   ${revealed}
  </div>
  ${hangWord.target.includes("'") ? `<div style="font-size:.75rem;color:var(--text3);margin-top:4px">(יש אפוסטרוף במילה)</div>` : ''}
 </div>
 
 ${won ? `
  <div class="card" style="text-align:center;padding:20px;border-color:var(--emerald)">
   <div style="font-size:2rem">🎉</div>
   <div style="font-weight:700;color:var(--emerald)">${hangWord.target}</div>
   <button class="btn btn-primary btn-sm" onclick="Games.startHangman()" style="margin-top:12px">🔄 הבא</button>
  </div>
 ` : lost ? `
  <div class="card" style="text-align:center;padding:20px;border-color:var(--red)">
   <div style="font-size:2rem">😵</div>
   <div style="color:var(--red)">התשובה: <strong style="font-family:var(--font-it)">${hangWord.target}</strong></div>
   <button class="btn btn-primary btn-sm" onclick="Games.startHangman()" style="margin-top:12px">🔄 נסה שוב</button>
  </div>
 ` : `
  <div class="hangman-keys">
   ${alphabet.map(l => `
    <button class="hang-key ${hangGuessed.includes(l) ? (word.includes(l) ? 'correct' : 'wrong') : ''}" 
     onclick="Games.hangGuess('${l}')" ${hangGuessed.includes(l) ? 'disabled' : ''}>${l}</button>
   `).join('')}
  </div>
 `}
 `;
}

function hangGuess(letter) {
 if (hangGuessed.includes(letter)) return;
 hangGuessed.push(letter);
 
 const word = hangWord.target.replace(/[']/g, '');
 if (!word.includes(letter)) {
  hangWrong++;
  // Track as weak word
  trackWeakWord(hangWord.native);
 } else {
  addXP(3);
 }
 
 renderHangman();
}

// ═══════════════════════════════════════
// 5. LISTENING QUIZ — hear word, pick translation
// ═══════════════════════════════════════
let listenWords = [], listenIdx = 0, listenScore = 0;

function startListening(level) {
 listenWords = shuffle(getWordsForLevel(level || 'A1')).slice(0, 8);
 listenIdx = 0; listenScore = 0;
 renderListening();
}

function renderListening() {
 if (listenIdx >= listenWords.length) { endListening(); return; }
 const area = document.getElementById('gameArea');
 if (!area) return;
 
 const w = listenWords[listenIdx];
 const distractors = getDistractors(APP_DATA.words, w.native, 'native').slice(0, 3);
 const options = shuffle([w, ...distractors]);
 
 area.innerHTML = `
 <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
  <button class="back-btn" onclick="Games.showMenu()">← חזרה</button>
  <span style="font-size:.85rem;color:var(--text3)">🎧 ${listenIdx+1}/${listenWords.length}</span>
 </div>
 
 <div class="card" style="text-align:center;padding:32px;margin-bottom:16px">
  <div style="font-size:.8rem;color:var(--text3);margin-bottom:12px">🎧 האזן ובחר את התרגום</div>
  <button class="btn btn-primary" onclick="speak('${esc(w.target)}')" style="font-size:2rem;padding:16px 24px;border-radius:50%">🔊</button>
  <div style="font-size:.75rem;color:var(--text3);margin-top:8px">לחץ שוב להאזנה נוספת</div>
 </div>
 
 <div class="speed-options">
  ${options.map((o, i) => `
   <button class="btn speed-opt" onclick="Games.listenAnswer('${esc(o.native)}','${esc(w.native)}')">${o.native}</button>
  `).join('')}
 </div>
 `;
 
 // Auto-play the audio
 setTimeout(() => speak(w.target), 400);
}

function listenAnswer(chosen, correct) {
 if (chosen === correct) {
  listenScore++;
  addXP(8);
  toast('✅ נכון!', 'success');
 } else {
  toast('❌ התשובה: ' + correct, 'error');
  trackWeakWord(correct);
 }
 listenIdx++;
 setTimeout(() => renderListening(), 800);
}

function endListening() {
 const area = document.getElementById('gameArea');
 area.innerHTML = `
 <div class="card" style="text-align:center;padding:32px">
  <div style="font-size:3rem;margin-bottom:12px">🎧</div>
  <div style="font-size:1.4rem;font-weight:700">Listening Quiz</div>
  <div style="font-size:1.1rem;color:var(--emerald);margin-top:8px">✅ ${listenScore}/${listenWords.length}</div>
  <div style="display:flex;gap:8px;justify-content:center;margin-top:16px">
   <button class="btn btn-primary btn-sm" onclick="Games.startListening()">🔄 שוב</button>
   <button class="btn btn-secondary btn-sm" onclick="Games.showMenu()">חזרה</button>
  </div>
 </div>
 `;
}

// ═══════════════════════════════════════
// 6. FREE SPEECH — record yourself saying sentences
// ═══════════════════════════════════════
let speechSentences = [], speechIdx = 0, speechRecording = false, speechMediaRec = null, speechChunks = [];

function startFreeSpeech(level) {
 speechSentences = shuffle(getSentencesForLevel(level || 'A1')).slice(0, 5);
 speechIdx = 0;
 renderFreeSpeech();
}

function renderFreeSpeech() {
 if (speechIdx >= speechSentenses.length) { endFreeSpeech(); return; }
 const area = document.getElementById('gameArea');
 if (!area) return;
 
 const s = speechSentenses[speechIdx];
 
 area.innerHTML = `
 <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
  <button class="back-btn" onclick="Games.showMenu()">← חזרה</button>
  <span style="font-size:.85rem;color:var(--text3)">🎤 ${speechIdx+1}/${speechSentenses.length}</span>
 </div>
 
 <div class="sentence-card">
  <div style="font-size:.7rem;color:var(--text3);margin-bottom:4px">🇮🇱 תרגם לאיטלקית:</div>
  <div class="sentence-he">${s.native}</div>
  <button class="btn btn-sm btn-secondary" onclick="Games.speechHint()" style="margin-top:8px">💡 רמז</button>
  <div id="speechHint" style="display:none;margin-top:8px">
   <div style="font-size:.7rem;color:var(--text3);margin-bottom:4px">🇮🇹 המשפט:</div>
   <div class="sentence-it">${s.target}</div>
   <button class="btn btn-sm btn-secondary" onclick="speak('${esc(s.target)}')" style="margin-top:4px">🔊 האזן</button>
  </div>
 </div>
 
 <div style="text-align:center;margin:24px 0">
  <button id="speechRecBtn" class="rec-btn ${speechRecording ? 'recording' : ''}" 
   onclick="Games.speechToggleRecord()">
   ${speechRecording ? '⏹️' : '🎤'}
  </button>
  <div style="font-size:.75rem;color:var(--text3);margin-top:8px">
   ${speechRecording ? '🔴 מקליט... לחץ לעצירה' : 'לחץ להקלטה'}
  </div>
 </div>
 
 <div id="speechPlayback" style="display:none;text-align:center;margin:12px 0">
  <audio id="speechAudio" controls style="width:100%"></audio>
 </div>
 
 <div style="display:flex;gap:8px;justify-content:center">
  <button class="btn btn-primary btn-sm" onclick="Games.speechNext()">הבא →</button>
  <button class="btn btn-secondary btn-sm" onclick="Games.startFreeSpeech()">🔄 חדש</button>
 </div>
 `;
}

function speechHint() {
 const el = document.getElementById('speechHint');
 if (el) el.style.display = 'block';
}

function speechToggleRecord() {
 if (speechRecording) {
  // Stop recording
  speechRecording = false;
  if (speechMediaRec && speechMediaRec.state === 'recording') {
   speechMediaRec.stop();
  }
 } else {
  // Start recording
  speechRecording = true;
  speechChunks = [];
  
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
   speechMediaRec = new MediaRecorder(stream);
   speechMediaRec.ondataavailable = e => { if (e.data.size > 0) speechChunks.push(e.data); };
   speechMediaRec.onstop = () => {
    stream.getTracks().forEach(t => t.stop());
    const blob = new Blob(speechChunks, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);
    const audio = document.getElementById('speechAudio');
    const pb = document.getElementById('speechPlayback');
    if (audio && pb) {
     audio.src = url;
     pb.style.display = 'block';
    }
    addXP(10);
    toast('🎤 הוקלט! שמע את עצמך + השווה', 'success');
   };
   speechMediaRec.start();
   renderFreeSpeech();
  }).catch(err => {
   speechRecording = false;
   toast('❌ מיקרופון לא זמין', 'error');
   renderFreeSpeech();
  });
  
  renderFreeSpeech();
 }
}

function speechNext() {
 speechIdx++;
 speechRecording = false;
 if (speechMediaRec && speechMediaRec.state === 'recording') speechMediaRec.stop();
 renderFreeSpeech();
}

function endFreeSpeech() {
 const area = document.getElementById('gameArea');
 area.innerHTML = `
 <div class="card" style="text-align:center;padding:32px">
  <div style="font-size:3rem;margin-bottom:12px">🎤</div>
  <div style="font-size:1.4rem;font-weight:700">Free Speech</div>
  <div style="font-size:1.1rem;color:var(--emerald);margin-top:8px">✅ ${speechSentenses.length} משפטים הוקלטו</div>
  <div style="display:flex;gap:8px;justify-content:center;margin-top:16px">
   <button class="btn btn-primary btn-sm" onclick="Games.startFreeSpeech()">🔄 שוב</button>
   <button class="btn btn-secondary btn-sm" onclick="Games.showMenu()">חזרה</button>
  </div>
 </div>
 `;
}

// ═══════════════════════════════════════
// 7. WORD BUILD — build words from syllables
// ═══════════════════════════════════════
let buildWord = null, buildSyllables = [], buildPlaced = [];

function startWordBuild(level) {
 const words = getWordsForLevel(level || 'A1').filter(w => w.target.length >= 4);
 buildWord = words[Math.floor(Math.random() * words.length)];
 
 // Split into syllables (simple: 2-3 char chunks)
 const it = buildWord.target;
 const mid = Math.ceil(it.length / 2);
 buildSyllables = shuffle([
  { syl: it.substring(0, mid), id: 0, used: false },
  { syl: it.substring(mid), id: 1, used: false }
 ]);
 // For longer words, split into 3
 if (it.length > 6) {
  const t1 = Math.ceil(it.length / 3);
  const t2 = t1 * 2;
  buildSyllables = shuffle([
   { syl: it.substring(0, t1), id: 0, used: false },
   { syl: it.substring(t1, t2), id: 1, used: false },
   { syl: it.substring(t2), id: 2, used: false }
  ]);
 }
 buildPlaced = [];
 renderWordBuild();
}

function renderWordBuild() {
 const area = document.getElementById('gameArea');
 if (!area) return;
 
 area.innerHTML = `
 <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
  <button class="back-btn" onclick="Games.showMenu()">← חזרה</button>
  <span style="font-size:.85rem;color:var(--text3)">🧱 בנה מילה</span>
 </div>
 
 <div class="card" style="text-align:center;padding:20px;margin-bottom:16px">
  <div style="font-size:.8rem;color:var(--text3);margin-bottom:8px">🇮🇱 בנה באיטלקית:</div>
  <div style="font-size:1.2rem;font-weight:600;color:var(--emerald-light)">${buildWord.native}</div>
 </div>
 
 <div style="display:flex;justify-content:center;gap:8px;margin:16px 0;min-height:48px">
  ${buildPlaced.map((s, i) => `
   <div class="build-syl placed" onclick="Games.buildRemove(${i})">${s.syl}</div>
  `).join('')}
 </div>
 
 <div style="display:flex;justify-content:center;gap:8px;margin:16px 0">
  ${buildSyllables.map((s, i) => `
   <div class="build-syl ${s.used ? 'used' : ''}" onclick="Games.buildPlace(${i})">${s.syl}</div>
  `).join('')}
 </div>
 
 <div style="display:flex;gap:8px;justify-content:center;margin-top:16px">
  <button class="btn btn-primary btn-sm" onclick="Games.buildCheck()">בדוק ✓</button>
  <button class="btn btn-secondary btn-sm" onclick="Games.startWordBuild()">דלג →</button>
 </div>
 `;
}

function buildPlace(idx) {
 if (buildSyllables[idx].used) return;
 buildSyllables[idx].used = true;
 buildPlaced.push(buildSyllables[idx]);
 renderWordBuild();
}

function buildRemove(idx) {
 const syl = buildPlaced[idx];
 const origIdx = buildSyllables.findIndex(s => s.id === syl.id);
 if (origIdx >= 0) buildSyllables[origIdx].used = false;
 buildPlaced.splice(idx, 1);
 renderWordBuild();
}

function buildCheck() {
 const answer = buildPlaced.map(s => s.syl).join('');
 if (answer === buildWord.target) {
  addXP(12);
  toast(`✅ ${buildWord.target} — מעולה! +12 XP`, 'success');
  speak(buildWord.target);
  setTimeout(() => startWordBuild(), 1500);
 } else {
  toast('❌ לא נכון — נסה שוב', 'error');
 }
}

// ═══════════════════════════════════════
// EXTENDED SIMULATIONS PER LEVEL
// ═══════════════════════════════════════
const LEVEL_SIMS = {
 A1: [
  {
   id: 'a1_greetings', icon: '👋', name: 'הכרות — Saluti', 
   lines: [
    {role:'npc',name:'Marco',it:'Ciao! Come ti chiami?',he:'היי! איך קוראים לך?'},
    {role:'you',it:'Mi chiamo... e tu?',he:'קוראים לי... ולך?',
     options:[
      {it:'Mi chiamo... e tu?',he:'קוראים לי... ולך?'},
      {it:'Piacere! Io sono...',he:'נעים! אני...'}
     ]},
    {role:'npc',name:'Marco',it:'Io sono Marco. Piacere!',he:'אני מרקו. נעים!'},
    {role:'you',it:'Di dove sei?',he:'מאיפה את?'},
    {role:'npc',name:'Marco',it:'Sono di Roma. E tu?',he:'אני מרומא. ואת?'},
    {role:'you',it:'Sono di Israele.',he:'אני מישראל.'}
   ]
  },
  {
   id: 'a1_numbers', icon: '🔢', name: 'מספרים — Numeri',
   lines: [
    {role:'npc',name:'Cassiere',it:'Sono otto euro e cinquanta.',he:'זה שמונה יורו וחמישים.'},
    {role:'you',it:'Ecco dieci euro.',he:'הנה עשר יורו.',
     options:[
      {it:'Ecco dieci euro.',he:'הנה עשר יורו.'},
      {it:'Ha il resto?',he:'יש לך עודף?'},
      {it:'Posso pagare con la carta?',he:'אפשר לשלם בכרטיס?'}
     ]},
    {role:'npc',name:'Cassiere',it:'Sì, il resto è un euro e cinquanta. Grazie!',he:'כן, העודף הוא יורו וחמישים. תודה!'}
   ]
  },
  {
   id: 'a1_time', icon: '🕐', name: 'שעה — Che ore sono?',
   lines: [
    {role:'npc',name:'Signora',it:'Scusi, che ore sono?',he:'סליחה, מה השעה?'},
    {role:'you',it:'Sono le tre e mezza.',he:'שלוש וחצי.',
     options:[
      {it:'Sono le tre e mezza.',he:'שלוש וחצי.'},
      {it:'Sono le quattro meno un quarto.',he:'רבע לארבע.'},
      {it:'Non lo so, mi dispiace.',he:'אני לא יודע/ת, סליחה.'}
     ]},
    {role:'npc',name:'Signora',it:'Grazie mille!',he:'תודה רבה!'}
   ]
  }
 ],
 A2: [
  {
   id: 'a2_train', icon: '🚂', name: 'ברכבת — In treno',
   lines: [
    {role:'npc',name:'Biglietteria',it:'Buongiorno, dove vuole andare?',he:'בוקר טוב, לאן תרצה/י לנסוע?'},
    {role:'you',it:'Vorrei un biglietto per Firenze, per favore.',he:'אני רוצה כרטיס לפירנצה, בבקשה.',
     options:[
      {it:'Vorrei un biglietto per Firenze, per favore.',he:'אני רוצה כרטיס לפירנצה, בבקשה.'},
      {it:'Un andata e ritorno, per favore.',he:'הלוך ושוב, בבקשה.'},
      {it:'Qual è il prossimo treno?',he:'מתי הרכבת הבאה?'}
     ]},
    {role:'npc',name:'Biglietteria',it:'Andata e ritorno?',he:'הלוך ושוב?'},
    {role:'you',it:'Sì, solo andata.',he:'כן, רק הלוך.'},
    {role:'npc',name:'Biglietteria',it:'Il prossimo parte alle quattordici e trenta. Binario tre.',he:'הבאה יוצאת בשתיים וחצי. רציף שלוש.'}
   ]
  },
  {
   id: 'a2_hotel', icon: '🏨', name: 'במלון — In hotel',
   lines: [
    {role:'npc',name:'Receptionist',it:'Benvenuto! Ha una prenotazione?',he:'ברוך הבא! יש לך הזמנה?'},
    {role:'you',it:'Sì, a nome Cohen.',he:'כן, על שם כהן.',
     options:[
      {it:'Sì, a nome Cohen.',he:'כן, על שם כהן.'},
      {it:'No, avete una stanza libera?',he:'לא, יש לכם חדר פנוי?'}
     ]},
    {role:'npc',name:'Receptionist',it:'Perfetto! Camera duecentoquattordici, al secondo piano.',he:'מושלם! חדר 214, בקומה השנייה.'},
    {role:'you',it:'La colazione è inclusa?',he:'ארוחת בוקר כלולה?'},
    {role:'npc',name:'Receptionist',it:'Sì, dalle sette alle dieci. Buon soggiorno!',he:'כן, משבע עד עשר. שהייה נעימה!'}
   ]
  },
  {
   id: 'a2_directions', icon: '🗺️', name: 'הוראות — Indicazioni',
   lines: [
    {role:'npc',name:'Passante',it:'Scusi, sa dov\'è la stazione?',he:'סליחה, את/ה יודע/ת איפה התחנה?'},
    {role:'you',it:'Sì, vai dritto e poi a destra.',he:'כן, לך ישר ואז ימינה.',
     options:[
      {it:'Sì, vai dritto e poi a destra.',he:'כן, לך ישר ואז ימינה.'},
      {it:'Mi dispiace, non sono di qui.',he:'סליחה, אני לא מכאן.'},
      {it:'È vicino alla piazza.',he:'זה קרוב לכיכר.'}
     ]},
    {role:'npc',name:'Passante',it:'Grazie! È lontano?',he:'תודה! זה רחוק?'},
    {role:'you',it:'Circa cinque minuti a piedi.',he:'בערך חמש דקות הליכה.'}
   ]
  }
 ],
 B1: [
  {
   id: 'b1_work', icon: '💼', name: 'ראיון עבודה — Colloquio',
   lines: [
    {role:'npc',name:'Direttore',it:'Buongiorno, si accomodi. Parli un po\' di lei.',he:'בוקר טוב, שב/י. ספר/י קצת על עצמך.'},
    {role:'you',it:'Ho laureato in economia e ho tre anni di esperienza.',he:'יש לי תואר בכלכלה ושלוש שנות ניסיון.',
     options:[
      {it:'Ho laureato in economia e ho tre anni di esperienza.',he:'יש לי תואר בכלכלה ושלוש שנות ניסיון.'},
      {it:'Lavoro in questo campo da cinque anni.',he:'אני עובד/ת בתחום זה חמש שנים.'}
     ]},
    {role:'npc',name:'Direttore',it:'Perché vuole lavorare con noi?',he:'למה את/ה רוצה לעבוד אצלנו?'},
    {role:'you',it:'Ammiro la vostra azienda e voglio crescere professionalmente.',he:'אני מעריך/ה את החברה שלכם ורוצה לצמוח מקצועית.'},
    {role:'npc',name:'Direttore',it:'Ottima risposta. La contatteremo presto.',he:'תשובה מצוינת. ניצור איתך קשר בקרוב.'}
   ]
  },
  {
   id: 'b1_phone', icon: '📱', name: 'שיחת טלפון — Al telefono',
   lines: [
    {role:'npc',name:'Segreteria',it:'Pronto, ufficio del dottor Bianchi.',he:'הלו, משרד דוקטור ביאנקי.'},
    {role:'you',it:'Buongiorno, vorrei fissare un appuntamento.',he:'בוקר טוב, אני רוצה לקבוע תור.',
     options:[
      {it:'Buongiorno, vorrei fissare un appuntamento.',he:'בוקר טוב, אני רוצה לקבוע תור.'},
      {it:'Può passarmi il dottore?',he:'אפשר להעביר לרופא?'}
     ]},
    {role:'npc',name:'Segreteria',it:'Certamente. Quando preferisce?',he:'בוודאי. מתי מועדף עליך?'},
    {role:'you',it:'Domani pomeriggio, se possibile.',he:'מחר אחה"צ, אם אפשר.'},
    {role:'npc',name:'Segreteria',it:'Va bene, alle sedici. Il nome?',he:'בסדר, בארבע. השם?'}
   ]
  },
  {
   id: 'b1_complaint', icon: '😤', name: 'תלונה — Reclamo',
   lines: [
    {role:'npc',name:'Cameriere',it:'Tutto bene?',he:'הכל בסדר?'},
    {role:'you',it:'No, il cibo è freddo e ho aspettato troppo.',he:'לא, האוכל קר וחיכיתי יותר מדי.',
     options:[
      {it:'No, il cibo è freddo e ho aspettato troppo.',he:'לא, האוכל קר וחיכיתי יותר מדי.'},
      {it:'Vorrei parlare con il responsabile.',he:'אני רוצה לדבר עם האחראי.'}
     ]},
    {role:'npc',name:'Cameriere',it:'Mi scusi, porto subito un piatto nuovo.',he:'סליחה, אני מביא מיד צלחת חדשה.'},
    {role:'you',it:'Grazie. E vorrei anche il conto.',he:'תודה. ואני רוצה גם את החשבון.'}
   ]
  }
 ],
 B2: [
  {
   id: 'b2_debate', icon: '🗣️', name: 'דיון — Dibattito',
   lines: [
    {role:'npc',name:'Professoressa',it:'Qual è la Sua opinione su questo tema?',he:'מה דעתך על נושא זה?'},
    {role:'you',it:'Secondo me, è una questione complessa che richiede un\'analisi approfondita.',he:'לדעתי, זו שאלה מורכבת שדורשת ניתוח מעמיק.',
     options:[
      {it:'Secondo me, è una questione complessa che richiede un\'analisi approfondita.',he:'לדעתי, זו שאלה מורכבת שדורשת ניתוח מעמיק.'},
      {it:'Penso che ci siano pro e contro.',he:'אני חושב/ת שיש יתרונות וחסרונות.'}
     ]},
    {role:'npc',name:'Professoressa',it:'Può sviluppare questo punto?',he:'את/ה יכול/ה לפתח נקודה זו?'},
    {role:'you',it:'Certamente. Da un lato... dall\'altro...',he:'בוודאי. מצד אחד... מצד שני...'}
   ]
  },
  {
   id: 'b2_rental', icon: '🏠', name: 'שכירות — Affittare',
   lines: [
    {role:'npc',name:'Proprietario',it:'L\'appartamento ha due camere e un bagno.',he:'לדירה יש שני חדרים וחדר אמבטיה.'},
    {role:'you',it:'Quanto costa l\'affitto mensile?',he:'כמה עולה השכירות החודשית?',
     options:[
      {it:'Quanto costa l\'affitto mensile?',he:'כמה עולה השכירות החודשית?'},
      {it:'Le spese condominiali sono incluse?',he:'הוצאות הבניין כלולות?'}
     ]},
    {role:'npc',name:'Proprietario',it:'Ottocento euro, spese escluse.',he:'שמונה מאות יורו, ללא הוצאות.'},
    {role:'you',it:'È possibile negoziare il prezzo?',he:'אפשר לנהל משא ומתן על המחיר?'},
    {role:'npc',name:'Proprietario',it:'Forse. Serve una caparra di due mesi.',he:'אולי. צריך פיקדון של חודשיים.'}
   ]
  }
 ],
 C1: [
  {
   id: 'c1_university', icon: '🎓', name: 'אוניברסיטה — Università',
   lines: [
    {role:'npc',name:'Professore',it:'La Sua tesi è molto interessante. Quali sono le fonti principali?',he:'התזה שלך מעניינת מאוד. מה המקורות העיקריים?'},
    {role:'you',it:'Ho consultato principalmente archivi storici e studi accademici recenti.',he:'הסתמכתי בעיקר על ארכיונים היסטוריים ומחקרים אקדמיים עדכניים.',
     options:[
      {it:'Ho consultato principalmente archivi storici e studi accademici recenti.',he:'הסתמכתי בעיקר על ארכיונים היסטוריים ומחקרים אקדמיים עדכניים.'},
      {it:'La bibliografia comprende oltre cinquanta riferimenti.',he:'הביבליוגרפיה כוללת מעל חמישים מקורות.'}
     ]},
    {role:'npc',name:'Professore',it:'Ottimo. Ma dovrebbe approfondire il capitolo terzo.',he:'מצוין. אבל כדאי להעמיק בפרק השלישי.'},
    {role:'you',it:'Ha ragione, ci lavorerò. Grazie per il consiglio.',he:'צודק/ת, אעבוד על זה. תודה על העצה.'}
   ]
  },
  {
   id: 'c1_literary', icon: '📚', name: 'ספרות — Letteratura',
   lines: [
    {role:'npc',name:'Critico',it:'Come interpreta il simbolismo in quest\'opera?',he:'איך את/ה מפרש/ת את הסימבוליזם ביצירה זו?'},
    {role:'you',it:'Ritengo che l\'autore utilizzi la metafora per rappresentare il conflitto interiore.',he:'אני סבור/ה שהמחבר משתמש במטאפורה כדי לייצג את הקונפליקט הפנימי.',
     options:[
      {it:'Ritengo che l\'autoreutilizzi la metafora per rappresentare il conflitto interiore.',he:'אני סבור/ה שהמחבר משתמש במטאפורה כדי לייצג את הקונפליקט הפנימי.'},
      {it:'È un\'allegoria della società italiana del dopoguerra.',he:'זו אלגוריה של החברה האיטלקית שאחרי המלחמה.'}
     ]},
    {role:'npc',name:'Critico',it:'Interessante prospettiva. E il finale?',he:'פרספקטיבה מעניינת. והסיום?'},
    {role:'you',it:'Il finale aperto lascia spazio all\'interpretazione del lettore.',he:'הסיום הפתוח משאיר מרחב לפרשנות הקורא.'}
   ]
  }
 ]
};

function getLevelSims(level) {
 return LEVEL_SIMS[level] || LEVEL_SIMS.A1;
}

// ═══════════════════════════════════════
// GAMES MENU
// ═══════════════════════════════════════
const ALL_GAMES = [
 { id: 'memory', icon: '🃏', name: 'Memory Match', desc: 'הפוך כרטיסים ומצא זוגות IT↔HE', fn: 'startMemory', color: 'var(--purple)' },
 { id: 'scramble', icon: '🧩', name: 'Word Scramble', desc: 'סדר מחדש את האותיות למילה הנכונה', fn: 'startScramble', color: 'var(--orange)' },
 { id: 'speed', icon: '⚡', name: 'Speed Tap', desc: 'תרגם מהר כמה שאתה יכול — הזמן רץ!', fn: 'startSpeedTap', color: 'var(--red)' },
 { id: 'hangman', icon: '💀', name: 'Hangman', desc: 'נחש אות אחר אות — אל תיתפס!', fn: 'startHangman', color: 'var(--pink)' },
 { id: 'listening', icon: '🎧', name: 'Listening Quiz', desc: 'האזן למילה ובחר את התרגום', fn: 'startListening', color: 'var(--blue)' },
 { id: 'speech', icon: '🎤', name: 'Free Speech', desc: 'תרגם משפטים והקלט את עצמך', fn: 'startFreeSpeech', color: 'var(--emerald)' },
 { id: 'build', icon: '🧱', name: 'Word Build', desc: 'הרכב מילים מהברות', fn: 'startWordBuild', color: 'var(--indigo)' }
];

function showMenu() {
 const area = document.getElementById('gameArea');
 if (!area) return;
 
 const userLevel = state.level || 'A1';
 const levelSims = getLevelSims(userLevel);
 
 area.innerHTML = `
 <h2 class="section-title"><span class="emoji">🎮</span> משחקים</h2>
 <div style="font-size:.85rem;color:var(--text2);margin-bottom:16px">למד בכיף — משחקי זיכרון, מילים, דיבור ועוד</div>
 
 <h3 class="section-title" style="font-size:.9rem"><span class="emoji">🎯</span> משחקי מילים</h3>
 ${ALL_GAMES.map(g => `
  <div class="card card-clickable" style="margin-bottom:8px;border-color:${g.color}" onclick="Games.${g.fn}()">
   <div style="display:flex;align-items:center;gap:12px">
    <div style="font-size:1.8rem">${g.icon}</div>
    <div>
     <div class="card-title">${g.name}</div>
     <div class="card-desc">${g.desc}</div>
    </div>
   </div>
  </div>
 `).join('')}
 
 <h3 class="section-title" style="font-size:.9rem;margin-top:20px"><span class="emoji">🎭</span> סימולציות — רמה ${userLevel}</h3>
 ${levelSims.map(s => `
  <div class="card card-clickable" style="margin-bottom:8px;border-color:var(--purple)" 
   onclick="Games.startLevelSim('${s.id}')">
   <div style="display:flex;align-items:center;gap:12px">
    <div style="font-size:1.8rem">${s.icon}</div>
    <div>
     <div class="card-title">${s.name}</div>
     <div class="card-desc">${s.lines.length} שורות דיאלוג</div>
    </div>
   </div>
  </div>
 `).join('')}
 
 ${['A1','A2','B1','B2','C1'].filter(l => l !== userLevel && LEVEL_SIMS[l]).map(l => `
  <h3 class="section-title" style="font-size:.9rem;margin-top:20px"><span class="emoji">🎭</span> סימולציות — רמה ${l}</h3>
  ${(LEVEL_SIMS[l]||[]).map(s => `
   <div class="card card-clickable" style="margin-bottom:8px;border-color:var(--purple);opacity:.7" 
    onclick="Games.startLevelSim('${s.id}','${l}')">
    <div style="display:flex;align-items:center;gap:12px">
     <div style="font-size:1.8rem">${s.icon}</div>
     <div>
      <div class="card-title">${s.name}</div>
      <div class="card-desc">${s.lines.length} שורות · ${l}</div>
     </div>
    </div>
   </div>
  `).join('')}
 `).join('')}
 
 <h3 class="section-title" style="font-size:.9rem;margin-top:24px"><span class="emoji">🧭</span> עוד כלים</h3>
 <div class="card card-clickable" style="margin-bottom:8px;border-color:var(--indigo)" onclick="goPage('explore');setTimeout(()=>Features.switchTab('translate'),200)">
  <div style="display:flex;align-items:center;gap:12px">
   <div style="font-size:1.8rem">⚡</div>
   <div><div class="card-title">תרגום מהיר</div><div class="card-desc">עברית → איטלקית</div></div>
  </div>
 </div>
 <div class="card card-clickable" style="margin-bottom:8px;border-color:var(--emerald)" onclick="goPage('explore');setTimeout(()=>Features.switchTab('careers'),200)">
  <div style="display:flex;align-items:center;gap:12px">
   <div style="font-size:1.8rem">💼</div>
   <div><div class="card-title">מסלולי קריירה</div><div class="card-desc">רופא, שף, תייר</div></div>
  </div>
 </div>
 `;
}

function startLevelSim(simId, level) {
 // Find the sim across all levels
 let sim = null;
 for (const lv of Object.values(LEVEL_SIMS)) {
  sim = lv.find(s => s.id === simId);
  if (sim) break;
 }
 if (!sim) return;
 
 // Add to APP_DATA.dialogues
 if (!APP_DATA.dialogues) APP_DATA.dialogues = [];
 if (!APP_DATA.dialogues.find(d => d.cat === simId)) {
  APP_DATA.dialogues.push({ cat: simId, title: sim.name, lines: sim.lines });
 }
 
 const node = { id: simId, name: sim.name, icon: sim.icon, category: simId };
 Practice.startDialogue(node);
}

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════
function getWordsForLevel(level) {
 const allWords = APP_DATA.words || [];
 // Simple heuristic: shorter words = A1, longer = higher level
 const levelMap = { A1: 7, A2: 10, B1: 14, B2: 20, C1: 99 };
 const maxLen = levelMap[level] || 7;
 return shuffle(allWords.filter(w => w.target.replace(/[']/g,'').length <= maxLen));
}

function getSentencesForLevel(level) {
 const all = APP_DATA.sentences || [];
 return shuffle(all.filter(s => s.target && s.native));
}

function shuffle(arr) {
 const a = [...arr];
 for (let i = a.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [a[i], a[j]] = [a[j], a[i]];
 }
 return a;
}

function formatTime(s) {
 return Math.floor(s/60) + ':' + String(s%60).padStart(2, '0');
}

function getDistractors(words, correct, field) {
 return shuffle(words.filter(w => w[field] !== correct)).slice(0, 3);
}

function esc(s) { return String(s||'').replace(/'/g, "\\'").replace(/"/g, '&quot;'); }

// ═══════════════════════════════════════
// EXPOSE
// ═══════════════════════════════════════
return {
 showMenu,
 // Memory
 startMemory, memFlip,
 // Scramble
 startScramble, scramPlace, scramRemove, scramCheck, scramSkip,
 // Speed
 startSpeedTap, speedAnswer, endSpeedTap,
 // Hangman
 startHangman, hangGuess,
 // Listening
 startListening, listenAnswer,
 // Free Speech
 startFreeSpeech, speechHint, speechToggleRecord, speechNext,
 // Word Build
 startWordBuild, buildPlace, buildRemove, buildCheck,
 // Level Sims
 startLevelSim, getLevelSims,
 LEVEL_SIMS, ALL_GAMES
};

})();
