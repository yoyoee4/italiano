/* ═══════════════════════════════════════════════
   Nona — הסבתא האיטלקייה 🧓🇮🇹
   Duolingo-style mascot that coaches, encourages,
   nags, and guides the user from start to finish
   ═══════════════════════════════════════════════ */

const Nona = (() => {

// ═══════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════
const CONFIG = {
  enabled: true,           // Can be toggled in settings
  coachMode: false,        // Coaching mode OFF by default (less annoying)
  nagEnabled: false,       // No nagging by default (user can enable in settings)
  nagInterval: 30 * 60 * 1000, // 30 minutes if enabled
  msgChance: {
    correct: 0.01,         // Only 1% chance on correct answers
    wrong: 0.02,           // Only 2% chance on wrong answers
    encourage: 0.01,       // Only 1% chance for encouragement
  },
  imagePath: '/assets/nona_icon_small.png',
  imagePathLarge: '/assets/nona_icon_large.png',
  imagePathChar: '/assets/nona_char_large.png',
};

// ═══════════════════════════════════════
// MESSAGES
// ═══════════════════════════════════════

const GOOD_JOB = [
  'Brava! 🎉 תשובה נכונה!',
  'Perfetto! 🤌 בדיוק!',
  'Che bella! יופי של תשובה!',
  'Forza! ככה לומדים! 🏆',
  'Dai dai! רואה איך את מתקדמת?',
  'Bellissimo! 😍 תשובה מושלמת!',
  'Progresso! לאט אבל בטוח!',
  'Hai studiato, eh? 🤌 רואים שהתאמנת!',
  'Magnifico! 🤌 תביא לי כוס קיאנטי!',
  'Perfetto! נונה שמה ♥ על התרגול!',
];

const STREAK = [
  '${days} ימים ברציפות?! 🎉 Mammina mia, את מכורהה!',
  '${days} ימים! נונה לא הפסיקה ככה אפילו כשהכנתי פסטה! 🤌',
  'Streak של ${days} ימים! נונה גאה, נונה בוכה, נונה מכינה רביולי!',
  'Già ${days} giorni di fila! באיטלקית זה נשמע אפילו יותר מרשים!',
  '${days} ימים! Dai che נונה תספר לחברות שלה במילאנו!',
];

const NAG = [
  'Ehi, איפה היית? נונה חיכתה! 🧓⏰',
  'Ciao? לא בא לך ללמוד היום?',
  'Dai, יאללה, תפתח! La nonna non aspetta!',
  'Mamma mia, ימים בלי איטלקית? נונה עצובה... 😢',
  'Forza, apri l\'app! נונה הכינה קפה! ☕',
  'Vieni qui! Ancora una lezione!',
  'Ancora! עוד פעם! נונה לא מוותרת!',
];

const WRONG = [
  'Ahi ahi ahi... 🤌 לא בדיוק. נונה אומרת riprova! (נסי שוב!)',
  'Mamma mia che disastro! 😱 לא נורא, נונה גם טעתה בדיאלקט של סיציליה!',
  'Vabbè, זה קורה. נונה אומרת: sbagliando s\'impara! (טועים ולומדים!)',
  'Eh già, קשה, הא? נונה יודעת. אבל תמשיכי, che domani farà bello!',
  'Macché! לא ככה. נונה זוכרת שבנאפולי אומרים את זה אחרת...',
  'Dai, לא נורא. נונה תעזור לך! Riprova, per favore! 🤌',
  'Oh, Madonna! 🤌 טעות קטנה. אל תדאג, נונה אוהבת אותך בכל זאת!',
  'Santo cielo! 😅 אפילו הקיסר הרומי טעה לפעמים. Continua!',
  'Vabbuò... (זה בנפוליטנית ל"נו, בסדר"). נסה שוב, tesoro!',
  'Accidenti! נונה חשבה שאתה יודע. אבל לא נורא, riprova!',
];

const ENCOURAGE = [
  'Niente paura! נונה פה לעזור! 🤌 Insieme נלמד!',
  'Coraggio! אל תוותר! נונה לא ויתרה עליך!',
  'Dai dai dai! Forza! Ancora uno!',
  'Piano piano... לאט לאט. נונה יודעת שזה עובד! 🐌',
  'Remember, Roma לא נבנתה ביום אחד! Neanche l\'italiano!',
  'Un passo alla volta! צעד אחר צעד, נונה בת 78 ויודעת!',
  'Senti, נונה אומרת לך: תלמד חצי שעה ביום, בעוד חודש תדבר!',
  'Non mollare! אל תרפה! נונה לא מרימה ידיים!',
  'Ci vuole pazienza! צריך סבלנות. נונה מבוגרת, היא יודעת! 🤌',
  'Dài, che ce la fai! נונה מאמינה בך!',
];

const GREETINGS = [
  'Buongiorno! ☀️ נונה קמה לבדוק מה שלומך!',
  'Ciao bellissima/o! 🤌 נונה התגעגעה!',
  'Salve! נונה פה. Francese? No, איטלקייה אמיתית!',
  'Ehilà! איזה כיף שאתה פה! 🏠🇮🇹',
];

const MILESTONE = [
  '${num} מילים?! Sant\'Iddio! 🤯 נונה צריכה לשבת!',
  '${num} XP! Mamma mia, תראה איזה גאון! נונה גאה!',
  'רמה חדשה?! Auguri! 🎉 נונה תביא לך פניני מהגינה שלה!',
  '${num} ימים רצוף?! Porca miseria, נונה לא האמינה שתגיע/י רחוק כל כך!',
  'איזה יופי! נונה תכין לך טירמיסו מיוחד! 🤌🍰',
];

const SAD = [
  'אה, נונה קצת עצובה היום... 😔 תעשה תרגול אחד, בבקשה?',
  'Mamma mia, נונה בודדה פה. איפה כולם?',
  'פעם באיטליה, היינו יושבים כולם יחיד. נונה מתגעגעת... 🍝',
  'נונה חושבת על הנכדים. גם את/ה מתגעגע/ת למישהו?',
  'Basta! מספיק עצב. נונה רוצה שתלמד/י, זה ישמח את כולנו! 🤌',
];

const CHRISTMAS = [
  'Buon Natale! 🎄🌟 נונה אפתה פאנטונה במיוחד בשבילך!',
  'חג שמח! באיטליה קוראים לזה Natale! נונה אוהבת חגים!',
  'Auguri di Buon Natale! נונה תיתן לך מתנה: درس איטלקית חינם! 🤌',
];

// ═══════════════════════════════════════
// COACHING MESSAGES
// ═══════════════════════════════════════

const COACH_START = [
  'Benvenuto! 🤌 נונה פה כדי לאמן אותך באיטלקית! בוא נתחיל!',
  'Ciao! אני נונה, בת 78 מפירנצה! אלמד אותך איטלקית כמו שצריך! 🧓🇮🇹',
  'Pronto? נונה מוכנה! בוא תראה מה יש לנו היום! Dai!',
  'Buongiorno! ☕ נונה שתתה קפה ומוכנה ללמד! Iniziamo?',
];

const COACH_REVIEW = [
  'Prima di continuare, בוא נחזור על מה שלמדת אתמול! 📚',
  'נונה רוצה לראות שאתה זוכר... Ripetiamo! 🤌',
  'Ricordi? נונה בטוחה שאתה זוכר יותר ממה שאתה חושב!',
];

const COACH_LESSON_START = [
  'שיעור חדש! נונה מתרגשת! 🤩',
  'Ecco! הנה משהו חדש ללמוד! נונה אוהבת ללמד!',
  'Attento! זה קצת קשה, אבל נונה פה לעזור!',
  'Dai, apri le orecchie! תפתח אוזניים, נונה מלמדת! 👂',
];

const COACH_ENCOURAGE_MISTAKE = [
  'זה בסדר לטעות! נונה טעתה 100 פעמים לפני שלמדה! 🤌',
  'Non preoccuparti! אל תדאג, נונה פה לתקן אותך!',
  'Sbagliando s\'impara! טועים ולומדים! זה המוטו של נונה!',
  'Vedi? טעית, אבל עכשיו תלמד ולעולם לא תשכח!',
  'Dai, che ce la fai! תנסה שוב, נונה מאמינה בך!',
];

const COACH_HINT = [
  'רוצה רמז? נונה נותנת רמזים כמו שהיא נותנת מתכונים! 🤌',
  'Ecco un indizio... הנה רמז קטן!',
  'Senti... נונה זוכרת שברומא אומרים את זה ככה...',
];

const COACH_LESSON_END = [
  'Bravo! סיימת את השיעור! נונה גאה! 🎉',
  'Perfetto! שיעור מושלם! נונה תכין פסטה לכבודך! 🍝',
  'Che bello! תראה איך התקדמת! נונה כמעט בוכה! 😢✨',
  'Fantastico! עוד שיעור ככה ותדבר כמו איטלקי אמיתי!',
];

const COACH_DAILY_COMPLETE = [
  '🎉🎉🎉 סיימת את המטרה היומית! נונה חוגגת!',
  'Obiettivo completato! נונה תשלח לך גלויה מפירנצה! 📮',
  'מטרה יומית הושלמה? נונה קונה לך ג\'לאטו! 🍨',
  'Dai che sei fortissimo! סיימת להיום! נונה הולכת לבשל!',
];

const COACH_SIMULATION_START = [
  'אימון! 🤩 נונה מוכנה! תתחיל לענות!',
  'Dai! בוא נתאמן על מילים ומשפטים!',
  'תרגול משולב! מילים, משפטים, האזנה!',
  'Pronto? נונה הכינה שאלות! 🎯',
];

const COACH_REPEAT = [
  'Ripeti dopo di me! תחזור אחרי נונה!',
  'Sentiamo! נונה רוצה לשמוע! Prova a dirlo!',
  'Ad alta voce! בקול רם! נונה לא שומעת טוב! 🤌',
];

// ═══════════════════════════════════════
// STATE
// ═══════════════════════════════════════
let _visible = false;
let _hasVisited = false;
let _currentMood = 'happy';
let _dismissTimer = null;
let _nagInterval = null;
let _initialized = false;
let _hookInterval = null;
let _coachState = 'idle';
let _lastCoachMsg = '';
let _lastMsgTime = 0;
const MSG_COOLDOWN = 120 * 1000; // 2 minutes between messages

// ═══════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════
function isEnabled() {
  try {
    const s = JSON.parse(localStorage.getItem('vl_nona_settings'));
    return s ? s.enabled !== false : true;
  } catch { return true; }
}

function isCoachEnabled() {
  try {
    const s = JSON.parse(localStorage.getItem('vl_nona_settings'));
    return s ? s.coachMode !== false : true;
  } catch { return true; }
}

function getSettings() {
  try {
    return JSON.parse(localStorage.getItem('vl_nona_settings')) || { enabled: true, coachMode: false, nagEnabled: false };
  } catch { return { enabled: true, coachMode: false, nagEnabled: false }; }
}

function saveSettings(s) {
  localStorage.setItem('vl_nona_settings', JSON.stringify(s));
}

// ═══════════════════════════════════════
// MESSAGE HELPERS
// ═══════════════════════════════════════
function pick(arr, ...args) {
  let msg = arr[Math.floor(Math.random() * arr.length)];
  if (args.length) {
    args.forEach((val, i) => {
      msg = msg.replace(`\${${i === 0 ? 'num' : i === 1 ? 'days' : 'name'}}`, val);
    });
  }
  return msg;
}

function streakMsg(days) { return pick(STREAK).replace(/\${days}/g, days); }
function goodJob() { return pick(GOOD_JOB); }
function nagMsg() { return pick(NAG); }
function wrongMsg() { return pick(WRONG); }
function encourage() { return pick(ENCOURAGE); }
function greeting() { return pick(GREETINGS); }
function milestoneMsg(num) { return pick(MILESTONE).replace(/\${num}/g, num); }
function sadMsg() { return pick(SAD); }

// Coach messages
function coachStart() { return pick(COACH_START); }
function coachReview() { return pick(COACH_REVIEW); }
function coachLessonStart() { return pick(COACH_LESSON_START); }
function coachEncourageMistake() { return pick(COACH_ENCOURAGE_MISTAKE); }
function coachHint() { return pick(COACH_HINT); }
function coachLessonEnd() { return pick(COACH_LESSON_END); }
function coachDailyComplete() { return pick(COACH_DAILY_COMPLETE); }
function coachSimulationStart() { return pick(COACH_SIMULATION_START); }
function coachRepeat() { return pick(COACH_REPEAT); }

// ═══════════════════════════════════════
// CSS
// ═══════════════════════════════════════
function injectCSS() {
  if (document.getElementById('nona-css')) return;
  const css = document.createElement('style');
  css.id = 'nona-css';
  css.textContent = `
/* ── NONA ── */
#nona-container {
  position: fixed;
  bottom: 80px;
  right: 8px;
  z-index: 199;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  pointer-events: none;
  transition: all 0.3s ease;
  transform-origin: bottom right;
}
[dir=rtl] #nona-container, body[dir=rtl] #nona-container {
  right: auto;
  left: 8px;
  align-items: flex-start;
}

#nona-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #58cc02, #46a302);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 3px 12px rgba(88,204,2,.35);
  transition: all 0.3s ease;
  border: 2px solid #fff;
  animation: nona-bounce 2s ease-in-out infinite;
  overflow: hidden;
  padding: 2px;
}
#nona-icon img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}
#nona-icon:active {
  transform: scale(0.85);
}

@keyframes nona-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

#nona-icon.has-msg {
  animation: nona-wiggle 0.5s ease-in-out;
}

@keyframes nona-wiggle {
  0%, 100% { transform: rotate(0); }
  15% { transform: rotate(-12deg); }
  30% { transform: rotate(12deg); }
  50% { transform: rotate(-8deg); }
  70% { transform: rotate(8deg); }
  85% { transform: rotate(-4deg); }
}

/* Speech Bubble */
#nona-bubble {
  position: fixed;
  bottom: 138px;
  right: 8px;
  max-width: 290px;
  background: #ffffff;
  border: 2px solid #58cc02;
  border-radius: 16px 16px 4px 16px;
  padding: 12px 16px;
  font-family: 'Nunito', 'Heebo', sans-serif;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #1f1f1f;
  box-shadow: 0 4px 20px rgba(0,0,0,.12);
  pointer-events: auto;
  animation: nona-bubble-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 210;
}
[dir=rtl] #nona-bubble, body[dir=rtl] #nona-bubble {
  right: auto;
  left: 8px;
  border-radius: 16px 16px 16px 4px;
}

@keyframes nona-bubble-in {
  from { opacity: 0; transform: scale(0.5) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

#nona-bubble .nona-name {
  font-weight: 800;
  color: #58cc02;
  font-size: 0.75rem;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}
#nona-bubble .nona-name img {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  object-fit: cover;
}
#nona-bubble .nona-text {
  font-weight: 600;
}
#nona-bubble .nona-actions {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
}
#nona-bubble .nona-actions button {
  background: #58cc02;
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 6px 14px;
  font-family: 'Nunito', 'Heebo', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.15s;
}
#nona-bubble .nona-actions button:active {
  transform: scale(0.95);
}
#nona-bubble .nona-actions button.nona-btn-secondary {
  background: #f0f0f0;
  color: #555;
}
#nona-bubble .nona-close {
  position: absolute;
  top: -8px;
  left: -8px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #ff4b4b;
  color: #fff;
  border: 2px solid #fff;
  font-size: 0.6rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  box-shadow: 0 2px 6px rgba(0,0,0,.15);
}
[dir=rtl] #nona-bubble .nona-close, body[dir=rtl] #nona-bubble .nona-close {
  left: auto;
  right: -8px;
}

/* Full-screen takeover */
#nona-takeover {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(247,247,247,0.97);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  animation: nona-takeover-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(4px);
}
@keyframes nona-takeover-in {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

#nona-takeover .nona-take-avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #58cc02;
  box-shadow: 0 4px 20px rgba(88,204,2,.3);
  animation: nona-take-bounce 1.5s ease-in-out infinite;
}
#nona-takeover .nona-take-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
@keyframes nona-take-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

#nona-takeover .nona-take-text {
  font-family: 'Nunito', 'Heebo', sans-serif;
  font-size: 1.3rem;
  font-weight: 800;
  color: #1f1f1f;
  text-align: center;
  max-width: 320px;
  line-height: 1.5;
  padding: 0 24px;
}
#nona-takeover .nona-take-sub {
  font-size: 0.9rem;
  color: #777;
  text-align: center;
  max-width: 300px;
  padding: 0 20px;
  line-height: 1.5;
}
#nona-takeover .nona-take-btn {
  background: #58cc02;
  color: #fff;
  border: none;
  border-radius: 16px;
  padding: 14px 36px;
  font-family: 'Nunito', 'Heebo', sans-serif;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 0 #46a302;
  transition: all 0.1s;
  margin-top: 8px;
}
#nona-takeover .nona-take-btn:active {
  transform: translateY(3px);
  box-shadow: 0 1px 0 #46a302;
}
#nona-takeover .nona-take-btn-small {
  background: transparent;
  color: #777;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 8px 20px;
  font-family: 'Nunito', 'Heebo', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
#nona-takeover .nona-take-btn-small:active {
  transform: scale(0.95);
}

/* Confetti */
.nona-confetti {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 499;
  overflow: hidden;
}
.nona-confetti-piece {
  position: absolute;
  width: 10px;
  height: 10px;
  opacity: 0;
  animation: nona-confetti-fall 2.5s ease-in forwards;
}
@keyframes nona-confetti-fall {
  0% { opacity: 1; transform: translateY(-10px) rotate(0deg) scale(1); }
  100% { opacity: 0; transform: translateY(100vh) rotate(720deg) scale(0.5); }
}

/* Hide when disabled */
body.nona-disabled #nona-container {
  display: none !important;
}
`;
  document.head.appendChild(css);
}

// ═══════════════════════════════════════
// CORE FUNCTIONS
// ═══════════════════════════════════════

function buildContainer() {
  let container = document.getElementById('nona-container');
  if (container) return container;
  
  injectCSS();
  
  // Apply disabled class if needed
  if (!isEnabled()) {
    document.body.classList.add('nona-disabled');
  }
  
  container = document.createElement('div');
  container.id = 'nona-container';
  container.innerHTML = `
    <div id="nona-icon" onclick="Nona.click()">
      <img src="${CONFIG.imagePath}" alt="נונה" onerror="this.parentElement.textContent='🧓'">
    </div>
  `;
  document.body.appendChild(container);
  return container;
}

function say(text, duration = 6000, actions = null) {
  if (!isEnabled()) return;
  // Cooldown: only speak once every 2 minutes
  const now = Date.now();
  if (now - _lastMsgTime < MSG_COOLDOWN && !actions) return;
  _lastMsgTime = now;
  buildContainer();
  
  const oldBubble = document.getElementById('nona-bubble');
  if (oldBubble) oldBubble.remove();
  
  clearTimeout(_dismissTimer);
  
  const icon = document.getElementById('nona-icon');
  if (icon) {
    icon.classList.add('has-msg');
    setTimeout(() => icon.classList.remove('has-msg'), 500);
  }
  
  const bubble = document.createElement('div');
  bubble.id = 'nona-bubble';
  
  let actionsHtml = '';
  if (actions && actions.length) {
    actionsHtml = '<div class="nona-actions">' + 
      actions.map(a => `<button onclick="${a.onclick}" class="${a.secondary ? 'nona-btn-secondary' : ''}">${a.label}</button>`).join('') +
    '</div>';
  }
  
  bubble.innerHTML = `
    <div class="nona-close" onclick="Nona.dismiss()">✕</div>
    <div class="nona-name"><img src="${CONFIG.imagePath}" alt="">נונה</div>
    <div class="nona-text">${text}</div>
    ${actionsHtml}
  `;
  document.body.appendChild(bubble);
  
  _visible = true;
  
  if (duration > 0) {
    _dismissTimer = setTimeout(() => {
      const b = document.getElementById('nona-bubble');
      if (b) b.remove();
      _visible = false;
    }, duration);
  }
}

function dismiss() {
  const bubble = document.getElementById('nona-bubble');
  if (bubble) bubble.remove();
  const takeover = document.getElementById('nona-takeover');
  if (takeover) takeover.remove();
  const confetti = document.querySelector('.nona-confetti');
  if (confetti) confetti.remove();
  _visible = false;
  clearTimeout(_dismissTimer);
}

function click() {
  const bubble = document.getElementById('nona-bubble');
  if (bubble) {
    bubble.remove();
    _visible = false;
    clearTimeout(_dismissTimer);
    setTimeout(() => say(encourage()), 300);
  } else {
    say(greeting());
  }
}

function celebrate(title, subtitle = '') {
  if (!isEnabled()) return;
  dismiss();
  
  // Confetti
  const confetti = document.createElement('div');
  confetti.className = 'nona-confetti';
  const colors = ['#58cc02', '#ffc800', '#1cb0f6', '#ff4b4b', '#ce82ff', '#ff9600'];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'nona-confetti-piece';
    const left = Math.random() * 100;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 6 + Math.random() * 10;
    const delay = Math.random() * 1.5;
    piece.style.cssText = `left:${left}%;width:${size}px;height:${size}px;background:${color};border-radius:${Math.random() > 0.5 ? '50%' : '2px'};animation-delay:${delay}s`;
    confetti.appendChild(piece);
  }
  document.body.appendChild(confetti);
  
  // Takeover
  const takeover = document.createElement('div');
  takeover.id = 'nona-takeover';
  takeover.innerHTML = `
    <div class="nona-take-avatar"><img src="${CONFIG.imagePathLarge}" alt="נונה"></div>
    <div class="nona-take-text">${title}</div>
    ${subtitle ? `<div class="nona-take-sub">${subtitle}</div>` : ''}
    <button class="nona-take-btn" onclick="Nona.dismiss()">🤌 Grazie, Nona!</button>
    <button class="nona-take-btn-small" onclick="Nona.click()">🧓 תגידי עוד משהו, נונה</button>
  `;
  document.body.appendChild(takeover);
  
  _visible = true;
  setTimeout(() => {
    const c = document.querySelector('.nona-confetti');
    if (c) c.remove();
  }, 4000);
}

function fire(msg, duration = 5000) {
  say(msg, duration);
}

// ═══════════════════════════════════════
// COACHING FUNCTIONS
// ═══════════════════════════════════════

function coachNotify(type, ...args) {
  if (!isEnabled() || !isCoachEnabled()) return;
  clearTimeout(_dismissTimer);
  
  let msg = '';
  let actions = null;
  
  switch(type) {
    case 'start':
      msg = coachStart();
      actions = [
        { label: 'Dai! בוא נתחיל!', onclick: 'document.querySelector(\'.nav-item[data-page=learn]\')?.click()' },
        { label: 'עוד רגע...', onclick: 'Nona.dismiss()', secondary: true },
      ];
      break;
    case 'lesson_start':
      msg = coachLessonStart();
      break;
    case 'review':
      msg = coachReview();
      break;
    case 'correct':
      msg = goodJob();
      break;
    case 'wrong':
      msg = wrongMsg();
      setTimeout(() => say(coachEncourageMistake(), 5000), 1500);
      return; // already called say
    case 'mistake_encourage':
      msg = coachEncourageMistake();
      break;
    case 'hint':
      msg = coachHint();
      break;
    case 'lesson_end':
      msg = coachLessonEnd();
      actions = [
        { label: '🔄 המשך לתרגול', onclick: 'document.querySelector(\'.nav-item[data-page=practice]\')?.click()' },
        { label: '🤌 תודה נונה', onclick: 'Nona.dismiss()', secondary: true },
      ];
      break;
    case 'daily_complete':
      msg = coachDailyComplete();
      break;
    case 'simulation':
      msg = coachSimulationStart();
      actions = [
        { label: '🎤 בוא נתחיל', onclick: 'Nona.dismiss()' },
        { label: 'אחר כך', onclick: 'Nona.dismiss()', secondary: true },
      ];
      break;
    case 'repeat':
      msg = coachRepeat();
      break;
    default:
      msg = encourage();
  }
  
  if (msg) {
    say(msg, msg.length > 80 ? 8000 : 6000, actions);
  }
}

// ═══════════════════════════════════════
// EVENT TRIGGERS
// ═══════════════════════════════════════

function onCorrect() {
  if (Math.random() < CONFIG.msgChance.correct) {
    setTimeout(() => coachNotify('correct'), 500);
  }
}

function onWrong() {
  if (Math.random() < CONFIG.msgChance.wrong) {
    setTimeout(() => coachNotify('wrong'), 300);
  }
}

function onMilestone(type, value) {
  if (!isEnabled()) return;
  switch(type) {
    case 'words':
      celebrate(`🎉 ${value} מילים!`, pick(MILESTONE).replace(/\${num}/g, value));
      break;
    case 'xp':
      celebrate(`🌟 ${value} XP!`, pick(MILESTONE).replace(/\${num}/g, value));
      break;
    case 'streak':
      const sMsg = streakMsg(value);
      const firstLine = sMsg.split('.')[0];
      celebrate(`🔥 ${firstLine}`, sMsg);
      break;
    case 'level':
      celebrate(`📈 רמה חדשה: ${value}!`, 'נונה תכין טירמיסו מיוחד!');
      break;
    case 'lesson_complete':
      coachNotify('lesson_end');
      break;
    case 'daily_complete':
      coachNotify('daily_complete');
      break;
  }
}

function onPageChange(page) {
  if (!isEnabled() || !isCoachEnabled()) return;
  
  // Only coach on page change if enough time passed
  const now = Date.now();
  if (now - _lastMsgTime < MSG_COOLDOWN * 2) return;
  
  // Coach messages based on page
  switch(page) {
    case 'learn':
      setTimeout(() => coachNotify('lesson_start'), 1000);
      break;
    case 'practice':
      setTimeout(() => coachNotify('repeat'), 800);
      break;
    case 'trainer':
      // Only coach for trainer if user isn't already in a session
      if (!document.querySelector('.trainer-session')) {
        setTimeout(() => coachNotify('simulation'), 800);
      }
      break;
    case 'sentbuild':
      setTimeout(() => say('Costruisci frasi! נונה אוהבת לראות איך בונים משפטים! ✨', 5000), 800);
      break;
  }
}

function onVisit() {
  if (!isEnabled()) return;
  
  // Wait for the app to actually be showing (not login/splash)
  var appScreen = document.getElementById('appScreen');
  if (!appScreen || appScreen.style.display === 'none') {
    // Retry in 2 seconds
    setTimeout(onVisit, 2000);
    return;
  }
  
  // First visit always gets a warm welcome!
  if (!_hasVisited) {
    _hasVisited = true;
    setTimeout(() => {
      if (isCoachEnabled()) coachNotify('start');
      else {
        // Just a simple greeting without coaching
        say(greeting(), 5000);
      }
    }, 1500);
    if (CONFIG.nagEnabled) startNagTimer();
    return;
  }
  
  // Subsequent visits: skip if coach message was already shown
  if (_lastMsgTime > 0 && Date.now() - _lastMsgTime < MSG_COOLDOWN * 2) {
    if (CONFIG.nagEnabled) startNagTimer();
    return;
  }
  
  if (state && state.streak > 2) {
    setTimeout(() => {
      const msg = streakMsg(state.streak);
      say(msg, 6000);
    }, 1500);
  } else {
    setTimeout(() => {
      if (isCoachEnabled()) coachNotify('start');
    }, 1500);
  }
  
  if (CONFIG.nagEnabled) {
    startNagTimer();
  }
}

function startNagTimer() {
  stopNagTimer();
  
  if (!isEnabled() || !CONFIG.nagEnabled) return;
  
  if (state && state.streak > 0) {
    _nagInterval = setTimeout(() => {
      if (!document.getElementById('nona-bubble') && !document.getElementById('nona-takeover')) {
        say(nagMsg(), 6000);
      }
    }, CONFIG.nagInterval);
  }
}

function stopNagTimer() {
  clearTimeout(_nagInterval);
}

function resetNagTimer() {
  stopNagTimer();
  startNagTimer();
}

// ═══════════════════════════════════════
// HOOK INTO APP EVENTS
// ═══════════════════════════════════════

function hook() {
  // Poll for quiz state
  let lastWrongCount = 0;
  let lastCorrectAnswer = false;
  
  _hookInterval = setInterval(() => {
    const quizOptions = document.querySelectorAll('.quiz-option.correct');
    const wrongOptions = document.querySelectorAll('.quiz-option.wrong');
    
    if (wrongOptions.length > lastWrongCount && wrongOptions.length > 0) {
      onWrong();
    }
    
    if (quizOptions.length > 0 && lastCorrectAnswer !== true) {
      const newCorrect = Array.from(quizOptions).some(el => {
        return !el.dataset.nonaNotified;
      });
      if (newCorrect) {
        onCorrect();
        quizOptions.forEach(el => el.dataset.nonaNotified = '1');
      }
    }
    
    lastWrongCount = wrongOptions.length;
    lastCorrectAnswer = quizOptions.length > 0;
  }, 1000);
}

// ═══════════════════════════════════════
// UPDATE PROFILE SETTINGS
// ═══════════════════════════════════════
function renderSettings(container) {
  const s = getSettings();
  const section = document.createElement('div');
  section.innerHTML = `
    <h3 class="section-title"><span class="emoji">🧓</span> נונה — הסבתא האיטלקייה</h3>
    <div class="card" style="padding:16px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
        <img src="${CONFIG.imagePath}" alt="נונה" style="width:48px;height:48px;border-radius:50%;border:2px solid #58cc02">
        <div style="flex:1">
          <div style="font-weight:700;font-size:.9rem">נונה 🧓</div>
          <div style="font-size:.75rem;color:var(--text3)">מאמנת אישית מאיטליה 🤌</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <label style="display:flex;align-items:center;gap:8px;font-size:.85rem;cursor:pointer">
          <input type="checkbox" ${s.enabled !== false ? 'checked' : ''} 
            onchange="Nona.toggleEnabled(this.checked)">
          <span>הצג את נונה באימון</span>
        </label>
        <label style="display:flex;align-items:center;gap:8px;font-size:.85rem;cursor:pointer">
          <input type="checkbox" ${s.coachMode === true ? 'checked' : ''} 
            onchange="Nona.toggleCoach(this.checked)"
            ${s.enabled === false ? 'disabled' : ''}>
          <span>🤌 מצב מאמנת — הנחייה לאורך הלמידה</span>
        </label>
        <label style="display:flex;align-items:center;gap:8px;font-size:.85rem;cursor:pointer">
          <input type="checkbox" ${s.nagEnabled === true ? 'checked' : ''} 
            onchange="Nona.toggleNag(this.checked)"
            ${s.enabled === false ? 'disabled' : ''}>
          <span>⏰ תזכורות — נונה תזכיר לתרגל</span>
        </label>
      </div>
    </div>
  `;
  container.appendChild(section);
}

function toggleEnabled(enabled) {
  const s = getSettings();
  s.enabled = enabled;
  saveSettings(s);
  
  if (enabled) {
    document.body.classList.remove('nona-disabled');
    buildContainer();
    resetNagTimer();
  } else {
    document.body.classList.add('nona-disabled');
    dismiss();
    stopNagTimer();
  }
  
  // Update coach checkbox state
  const coachCheck = document.querySelector('#nona-settings input:last-child');
  if (coachCheck) {
    coachCheck.disabled = !enabled;
  }
}

function toggleCoach(enabled) {
  const s = getSettings();
  s.coachMode = enabled;
  saveSettings(s);
}

function toggleNag(enabled) {
  const s = getSettings();
  s.nagEnabled = enabled;
  CONFIG.nagEnabled = enabled;
  saveSettings(s);
  if (enabled) {
    startNagTimer();
  } else {
    stopNagTimer();
  }
}

function stopHook() {
  if (_hookInterval) {
    clearInterval(_hookInterval);
    _hookInterval = null;
  }
}

// ═══════════════════════════════════════
// INIT
// ═══════════════════════════════════════
function init() {
  if (_initialized) return;
  _initialized = true;
  buildContainer();
  hook();
  
  setTimeout(() => onVisit(), 2000);
  
  console.log('🧓 Nona pronta! (נונה מוכנה!)');
}

// ═══════════════════════════════════════
// DAILY GREETING (Sprint C5)
// ═══════════════════════════════════════
function getDailyGreeting(profile) {
  const hour = new Date().getHours();
  const streak = profile?.streak || 0;
  const level = profile?.level || 'A1';
  const weakWordsCount = profile?.weakWordsCount || 0;
  const srsOverdueCount = profile?.srsOverdueCount || 0;
  const daysUntilExam = profile?.daysUntilExam || null;
  
  // Time-based greeting
  let timeGreeting = '';
  if (hour < 12) timeGreeting = 'בוקר טוב! ☀️';
  else if (hour < 18) timeGreeting = 'צהריים טובים! 🌤️';
  else timeGreeting = 'ערב טוב! 🌙';
  
  // Personality-based message
  let message = '';
  let personality = 'sweet';
  let culturalTip = '';
  
  if (srsOverdueCount > 5 || streak === 0) {
      personality = 'strict';
      message = `${timeGreeting} נונה רואה שיש מילים שמחכות לחזרה! היום נתמקד בחיזוק היסודות. 🤌`;
      culturalTip = "באיטליה אומרים: 'Chi ben comincia è a metà dell'opera' (מי שמתחיל טוב - חצי עבודה נעשתה)";
    } else if (daysUntilExam !== null && daysUntilExam <= 30) {
      personality = 'teacher';
      message = `${timeGreeting} המבחן מתקרב (${daysUntilExam} ימים)! נונה הכינה תוכנית הכנה מיוחדת. 📝`;
      culturalTip = 'למבחני CILS/CELI: תרגל גם כתיבה וגם דיבור - שני החלקים שווים במשקל!';
    } else if (level === 'A1' && streak < 3) {
      personality = 'sweet';
      message = `${timeGreeting} ברוכה הבאה, קארה! היום נלמד מילים ראשונות באיטלקית! 🌱`;
      culturalTip = 'באיטליה מברכים "Buongiorno" עד הצהריים, ואז "Buonasera" - לעולם לא "Ciao" לזרים!';
    } else if (weakWordsCount > 5) {
      personality = 'teacher';
      message = `${timeGreeting} נונה שמה לב שיש ${weakWordsCount} מילים שצריכות חיזוק. היום נתמקד בהן! 💪`;
      culturalTip = "שיטה של נונה: כתוב כל מילה 3 פעמים, תגיד בקול, תשתמש במשפט!";
    } else if (streak >= 7) {
      personality = 'sweet';
      message = `${timeGreeting} ${streak} ימים ברציפות?! 🎉 נונה גאה בך! היום נעשה משהו כיף!`;
      culturalTip = 'בימי שישי באיטליה: אפריטיבו עם חברים! "Aperitivo" זה לא רק משקה - זה מנהג חברתי!';
    } else {
      personality = 'sweet';
      const starters = [
        'היום נלמד לברך כמו איטלקי אמיתי! ☕',
        'נונה הכינה הפתעה - מילים חדשות וטעימות! 🍝',
        'בוא נמשיך מהמקום שהפסקנו אתמול! 📖',
        'יש לי סיפור קטן מפירנצה לספר לך היום... 🏛️',
        'נתאמן על משפטים שימושיים לטיול הבא! ✈️'
      ];
      message = `${timeGreeting} ${starters[Math.floor(Math.random() * starters.length)]}`;
      culturalTip = 'מילה יומית: "Allora" (אז / נו / טוב) - המילה הכי שימושית באיטלקית!';
    }
  
  return {
    message,
    personality,
    culturalTip,
    audio: `nona/greeting_${personality}.mp3`
  };
}

// ═══════════════════════════════════════
// EXPOSE
// ═══════════════════════════════════════
return {
  init, stopHook, say, dismiss, click, celebrate, fire,
  onCorrect, onWrong, onMilestone, onVisit, onPageChange,
  coachNotify, resetNagTimer, stopNagTimer,
  toggleEnabled, toggleCoach, toggleNag, getSettings, renderSettings,
  getDailyGreeting,
  CONFIG,
  _goodJob: goodJob, _nag: nagMsg, _wrong: wrongMsg,
  _encourage: encourage, _greeting: greeting,
  _streak: streakMsg, _milestone: milestoneMsg,
};

})();
