/* ═══════════════════════════════════════════════
 VolaLingo v2 — Extra Features
 Quick Translate, Career Paths, Simulations,
 Enhanced Anki (5-success removal)
 ═══════════════════════════════════════════════ */

const Features = (() => {

// ═══════════════════════════════════════
// QUICK TRANSLATE
// ═══════════════════════════════════════
let translateHistory = [];

function renderTranslate(container) {
 container.innerHTML = `
 <h2 class="section-title"><span class="emoji">⚡</span> תרגום מהיר</h2>
 <div class="card" style="padding:16px">
  <div style="display:flex;gap:8px;margin-bottom:12px;align-items:center">
   <span style="font-size:.8rem;color:var(--text3)">🇮🇱 עברית</span>
   <span style="flex:1;border-top:1px dashed var(--border)"></span>
   <span style="font-size:.8rem;color:var(--text3)">🇮🇹 איטלקית</span>
  </div>
  <textarea id="translateInput" rows="3" placeholder="כתוב בעברית..." 
   style="width:100%;padding:12px;background:var(--bg2);border:2px solid var(--border);
   border-radius:var(--radius-sm);color:var(--text);font-size:1rem;font-family:var(--font-he);
   resize:none;direction:rtl" oninput="Features.autoTranslate()"></textarea>
  <div id="translateResult" style="margin-top:12px;padding:12px;background:var(--surface2);
   border-radius:var(--radius-sm);min-height:60px;direction:ltr;text-align:left;
   font-family:var(--font-it);font-size:1.1rem;color:var(--indigo-light);
   display:none"></div>
  <div style="display:flex;gap:8px;margin-top:8px">
   <button class="btn btn-primary btn-sm" onclick="Features.doTranslate()" id="translateBtn">🔄 תרגם</button>
   <button class="btn btn-secondary btn-sm" onclick="Features.speakTranslation()" id="speakTransBtn" style="display:none">🔊</button>
   <button class="btn btn-secondary btn-sm" onclick="Features.saveTranslation()" id="saveTransBtn" style="display:none">💾 שמור</button>
  </div>
 </div>
 <h3 class="section-title"><span class="emoji">📜</span> היסטוריית תרגומים</h3>
 <div id="translateHistory">
  ${translateHistory.length === 0 ? '<div style="text-align:center;padding:20px;color:var(--text3);font-size:.85rem">עדיין אין תרגומים שמורים</div>' : ''}
  ${translateHistory.map((t, i) => `
   <div class="word-item" onclick="Features.replayTranslation(${i})">
    <div class="word-left">
     <div class="word-he">${t.he}</div>
     <div class="word-it" style="font-family:var(--font-it);font-size:.9rem;color:var(--indigo-light)">${t.it}</div>
    </div>
    <div class="word-right">
     <button class="speak-btn active" onclick="event.stopPropagation();speak('${esc(t.it)}')">🔊</button>
    </div>
   </div>
  `).join('')}
 </div>
 `;
}

let _lastTranslation = '';
let _debounceTimer = null;

function autoTranslate() {
 clearTimeout(_debounceTimer);
 _debounceTimer = setTimeout(() => doTranslate(), 800);
}

async function doTranslate() {
 const input = document.getElementById('translateInput');
 const result = document.getElementById('translateResult');
 const speakBtn = document.getElementById('speakTransBtn');
 const saveBtn = document.getElementById('saveTransBtn');
 if (!input || !result) return;
 
 const text = input.value.trim();
 if (!text) { result.style.display = 'none'; speakBtn.style.display = 'none'; saveBtn.style.display = 'none'; return; }
 
 result.style.display = 'block';
 result.innerHTML = '<div style="color:var(--text3);font-size:.85rem;text-align:center">⏳ מתרגם...</div>';
 
 // Try local dictionary first
 const localMatch = findLocalTranslation(text);
 if (localMatch) {
  _lastTranslation = localMatch;
  showTranslation(localMatch);
  return;
 }
 
 // Fallback to B.AI API
 try {
  const resp = await fetch('https://api.b.ai/v1/chat/completions', {
   method: 'POST',
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
     { role: 'system', content: 'Translate Hebrew to Italian. Return ONLY the Italian translation, nothing else. Keep it natural and conversational. If the input is a word, give the word. If a sentence, translate the sentence.' },
     { role: 'user', content: text }
    ],
    temperature: 0.3, max_tokens: 200
   })
  });
  const data = await resp.json();
  _lastTranslation = data.choices?.[0]?.message?.content?.trim() || 'שגיאת תרגום';
  showTranslation(_lastTranslation);
 } catch (e) {
  result.innerHTML = '<div style="color:var(--red);font-size:.85rem;text-align:center">❌ שגיאת רשת — נסה שוב</div>';
 }
}

function showTranslation(text) {
 const result = document.getElementById('translateResult');
 const speakBtn = document.getElementById('speakTransBtn');
 const saveBtn = document.getElementById('saveTransBtn');
 if (result) { result.style.display = 'block'; result.textContent = text; }
 if (speakBtn) speakBtn.style.display = '';
 if (saveBtn) saveBtn.style.display = '';
}

function findLocalTranslation(text) {
 // Search in APP_DATA words
 const allWords = APP_DATA.words || [];
 const t = text.trim().toLowerCase();
 const match = allWords.find(w => w.he?.toLowerCase() === t || w.he?.toLowerCase().includes(t));
 if (match) return match.it;
 
 // Search in APP_DATA sentences
 const allSentences = APP_DATA.sentences || [];
 const sMatch = allSentences.find(s => s.he?.toLowerCase() === t || s.he?.toLowerCase().includes(t));
 if (sMatch) return sMatch.it;
 
 return null;
}

function speakTranslation() {
 if (_lastTranslation) speak(_lastTranslation);
}

function saveTranslation() {
 const input = document.getElementById('translateInput');
 if (!input || !_lastTranslation) return;
 const he = input.value.trim();
 const it = _lastTranslation;
 if (!he || !it) return;
 
 // Avoid duplicates
 if (translateHistory.find(t => t.he === he && t.it === it)) {
  toast('כבר שמור', 'info'); return;
 }
 
 translateHistory.unshift({ he, it, ts: Date.now() });
 if (translateHistory.length > 50) translateHistory.pop();
 
 // Also add as Anki card for review
 const word = { it, he, cat: 'translate' };
 addAnkiCard(word);
 
 // Save to state
 if (!state.savedTranslations) state.savedTranslations = [];
 state.savedTranslations.unshift({ he, it, ts: Date.now() });
 save();
 
 toast('💾 נשמר + נוסף לחזרות Anki', 'success');
 renderTranslate(document.getElementById('exploreContent'));
}

function replayTranslation(idx) {
 const t = translateHistory[idx];
 if (!t) return;
 const input = document.getElementById('translateInput');
 const result = document.getElementById('translateResult');
 if (input) input.value = t.he;
 _lastTranslation = t.it;
 showTranslation(t.it);
}

// ═══════════════════════════════════════
// CAREER PATHS
// ═══════════════════════════════════════
const CAREERS = [
 {
  id: 'doctor', icon: '🩺', name: 'רופא/ה', nameIt: 'Medico',
  desc: 'מהאנטומיה ועד טיפול במטופלים — איטלקית רפואית מלאה',
  stages: [
   { id: 'doc_reception', name: 'קבלה והרשמה', icon: '📋', level: 'A1',
    words: [
     {it:'Il appuntamento',he:'התור',cat:'doctor'},
     {it:'Il paziente',he:'המטופל',cat:'doctor'},
     {it:'La paziente',he:'המטופלת',cat:'doctor'},
     {it:'Il medico',he:'הרופא',cat:'doctor'},
     {it:'La dottoressa',he:'הרופאה',cat:'doctor'},
     {it:'Il ospedale',he:'בית החולים',cat:'doctor'},
     {it:'Lo studio medico',he:'המרפאה',cat:'doctor'},
     {it:'Il ricettario',he:'המרשם',cat:'doctor'}
    ],
    sentences: [
     {it:'Ho un appuntamento alle dieci.',he:'יש לי תור בעשר.',cat:'doctor'},
     {it:'Dove è lo studio del dottore?',he:'איפה המרפאה של הרופא?',cat:'doctor'},
     {it:'Sono qui per una visita.',he:'אני כאן לביקור/בדיקה.',cat:'doctor'}
    ]
   },
   { id: 'doc_symptoms', name: 'תסמינים ותלונות', icon: '🤒', level: 'A2',
    prerequisite: 'doc_reception',
    words: [
     {it:'Il dolore',he:'הכאב',cat:'doctor'},
     {it:'La febbre',he:'החום',cat:'doctor'},
     {it:'La tosse',he:'השיעול',cat:'doctor'},
     {it:'Il mal di testa',he:'כאב ראש',cat:'doctor'},
     {it:'La nausea',he:'בחילה',cat:'doctor'},
     {it:'La stanchezza',he:'עייפות',cat:'doctor'},
     {it:'Il gonfiore',he:'נפיחות',cat:'doctor'},
     {it:'Il prurito',he:'גרד',cat:'doctor'}
    ],
    sentences: [
     {it:'Mi fa male la testa.',he:'כואב לי הראש.',cat:'doctor'},
     {it:'Ho la febbre da due giorni.',he:'יש לי חום כבר יומיים.',cat:'doctor'},
     {it:'Non riesco a dormire per la tosse.',he:'אני לא מצליח/ה לישון בגלל השיעול.',cat:'doctor'},
     {it:'Sento un dolore forte qui.',he:'אני מרגיש/ה כאב חזק כאן.',cat:'doctor'}
    ]
   },
   { id: 'doc_examination', name: 'בדיקה גופנית', icon: '🩻', level: 'A2',
    prerequisite: 'doc_symptoms',
    words: [
     {it:'La pressione',he:'לחץ הדם',cat:'doctor'},
     {it:'Il battito',he:'הדופק',cat:'doctor'},
     {it:'La temperatura',he:'הטמפרטורה',cat:'doctor'},
     {it:'Respiri profondamente',he:'נשום עמוק',cat:'doctor'},
     {it:'Dica trentatré',he:'תגיד שלושים ושלוש',cat:'doctor'},
     {it:'Il riflesso',he:'הרפלקס',cat:'doctor'},
     {it:'L\'auscultazione',he:'האזנה (סטטוסקופ)',cat:'doctor'},
     {it:'La palpazione',he:'מישוש',cat:'doctor'}
    ],
    sentences: [
     {it:'Le controllo la pressione.',he:'אבדוק לך את לחץ הדם.',cat:'doctor'},
     {it:'Respiri profondamente, per favore.',he:'תנשום עמוק, בבקשה.',cat:'doctor'},
     {it:'Dica trentatré, per favore.',he:'תגיד שלושים ושלוש, בבקשה.',cat:'doctor'},
     {it:'Si sdrài sul lettino.',he:'תשכב/י על המיטה.',cat:'doctor'}
    ]
   },
   { id: 'doc_diagnosis', name: 'אבחנה וטיפול', icon: '💊', level: 'B1',
    prerequisite: 'doc_examination',
    words: [
     {it:'La diagnosi',he:'האבחנה',cat:'doctor'},
     {it:'La prescrizione',he:'המרשם',cat:'doctor'},
     {it:'La medicina',he:'התרופה',cat:'doctor'},
     {it:'L\'antibiotico',he:'אנטיביוטיקה',cat:'doctor'},
     {it:'L\'esame del sangue',he:'בדיקת דם',cat:'doctor'},
     {it:'La radiografia',he:'צילום רנטגן',cat:'doctor'},
     {it:'L\'ecografia',he:'אולטרסאונד',cat:'doctor'},
     {it:'La guarigione',he:'ההחלמה',cat:'doctor'}
    ],
    sentences: [
     {it:'Deve fare un esame del sangue.',he:'צריך/ה לעשות בדיקת דם.',cat:'doctor'},
     {it:'Le prescrivo un antibiotico.',he:'אני רושם/ת לך אנטיביוטיקה.',cat:'doctor'},
     {it:'Prenda la medicina tre volte al giorno.',he:'תיקח/י את התרופה שלוש פעמים ביום.',cat:'doctor'},
     {it:'Torri tra una settimana.',he:'תחזור/י בעוד שבוע.',cat:'doctor'}
    ]
   },
   { id: 'doc_emergency', name: 'חירום וניתוח', icon: '🚑', level: 'B2',
    prerequisite: 'doc_diagnosis',
    words: [
     {it:'Il pronto soccorso',he:'חדר מיון',cat:'doctor'},
     {it:"L'emergenza",he:'מקרה חירום',cat:'doctor'},
     {it:"L'intervento chirurgico",he:'הניתוח',cat:'doctor'},
     {it:'Il chirurgo',he:'המנתח',cat:'doctor'},
     {it:"L'anestesia",he:'ההרדמה',cat:'doctor'},
     {it:'La ferita',he:'הפצע',cat:'doctor'},
     {it:'Il sanguinamento',he:'הדימום',cat:'doctor'},
     {it:'Il monitoraggio',he:'הניטור',cat:'doctor'}
    ],
    sentences: [
     {it:'Abbiamo un\'emergenza! Portate la barella!',he:'יש לנו מקרה חירום! תביאו אלונקה!',cat:'doctor'},
     {it:'Il paziente deve essere operato subito.',he:'המטופל חייב להיות מנותח מיד.',cat:'doctor'},
     {it:'Preparate la sala operatoria.',he:'תכינו את חדר הניתוח.',cat:'doctor'},
     {it:'I parametri vitali sono stabili.',he:'הפרמטרים החיוניים יציבים.',cat:'doctor'}
    ]
   }
  ],
  dialogues: [
   {
    cat: 'doctor', title: 'Alla reception — בקבלה',
    lines: [
     {role:'npc',name:'Receptionist',it:'Buongiorno, ha un appuntamento?',he:'בוקר טוב, יש לך תור?'},
     {role:'you',it:'Sì, alle dieci con il dottor Rossi.',he:'כן, בעשר אצל דוקטור רוסי.',
      options:[
       {it:'Sì, alle dieci con il dottor Rossi.',he:'כן, בעשר אצל דוקטור רוסי.'},
       {it:'No, vorrei prendere un appuntamento.',he:'לא, אני רוצה לקבוע תור.'},
       {it:'Sono un paziente nuovo.',he:'אני מטופל/ת חדש/ה.'}
      ]},
     {role:'npc',name:'Receptionist',it:'Perfetto. Si accomodi in sala d\'attesa.',he:'מושלם. שב/י בחדר המתנה.'},
     {role:'you',it:'Grazie, quanto tempo devo aspettare?',he:'תודה, כמה זמן אצטרך לחכות?'},
     {role:'npc',name:'Receptionist',it:'Circa quindici minuti. Il dottore la chiamerà.',he:'בערך רבע שעה. הרופא יקרא לך.'}
    ]
   },
   {
    cat: 'doctor', title: 'La visita — הבדיקה',
    lines: [
     {role:'npc',name:'Dottor Rossi',it:'Buongiorno, cosa la porta qui oggi?',he:'בוקר טוב, מה הביא אותך היום?'},
     {role:'you',it:'Ho un mal di testa forte da tre giorni.',he:'יש לי כאב ראש חזק כבר שלושה ימים.',
      options:[
       {it:'Ho un mal di testa forte da tre giorni.',he:'יש לי כאב ראש חזק כבר שלושה ימים.'},
       {it:'Mi fa male la schiena.',he:'כואבת לי הגב.'},
       {it:'Non mi sento bene.',he:'לא טוב לי.'}
      ]},
     {role:'npc',name:'Dottor Rossi',it:'Ha anche la febbre?',he:'יש לך גם חום?'},
     {role:'you',it:'Sì, un po\' di febbre ieri sera.',he:'כן, קצת חום אתמול בערב.'},
     {role:'npc',name:'Dottor Rossi',it:'Le controllo la pressione. Respiri profondamente.',he:'אבדוק לך את לחץ הדם. תנשום עמוק.'},
     {role:'you',it:'Cosa pensa che sia?',he:'מה את/ה חושב/ת שזה?'},
     {role:'npc',name:'Dottor Rossi',it:'Probabilmente un\'infezione virale. Le prescrivo un analgesico.',he:'כנראה זיהום ויראלי. אני רושם/ת משכך כאבים.'}
    ]
   }
  ]
 },
 {
  id: 'chef', icon: '👨‍🍳', name: 'שף/ית', nameIt: 'Cuoco/a',
  desc: 'ממטבח בסיסי ועד מסעדה איטלקית מקצועית',
  stages: [
   { id: 'chef_kitchen', name: 'מטבח בסיסי', icon: '🍳', level: 'A1',
    words: [
     {it:'Il cucchiaino',he:'הכפית',cat:'chef'},
     {it:'La forchetta',he:'המזלג',cat:'chef'},
     {it:'Il coltello',he:'הסכין',cat:'chef'},
     {it:'Il piatto',he:'הצלחת',cat:'chef'},
     {it:'La pentola',he:'הסיר',cat:'chef'},
     {it:'La padella',he:'המחבת',cat:'chef'},
     {it:'Il fornello',he:'הכיריים',cat:'chef'},
     {it:'Il forno',he:'התנור',cat:'chef'}
    ],
    sentences: [
     {it:'Passami il coltello, per favore.',he:'תעביר/י לי את הסכין, בבקשה.'},
     {it:'Metti la pentola sul fornello.',he:'תשים/י את הסיר על הכיריים.'},
     {it:'Il forno è a duecento gradi.',he:'התנור במאתיים מעלות.'}
    ]
   },
   { id: 'chef_ingredients', name: 'מרכיבים וחומרים', icon: '🥘', level: 'A2',
    prerequisite: 'chef_kitchen',
    words: [
     {it:'La farina',he:'הקמח',cat:'chef'},
     {it:"L'olio d'oliva",he:'שמן זית',cat:'chef'},
     {it:'Il burro',he:'החמאה',cat:'chef'},
     {it:'Lo zucchero',he:'הסוכר',cat:'chef'},
     {it:'Il sale',he:'המלח',cat:'chef'},
     {it:'Il pepe',he:'הפלפל',cat:'chef'},
     {it:"L'aglio",he:'השום',cat:'chef'},
     {it:'Il pomodoro',he:'העגבנייה',cat:'chef'}
    ],
    sentences: [
     {it:'Aggiungi un pizzico di sale.',he:'תוסיף/י קורט מלח.'},
     {it:'Manca l\'olio d\'oliva.',he:'חסר שמן זית.'},
     {it:'Quanti pomodori servono?',he:'כמה עגבניות צריך?'}
    ]
   },
   { id: 'chef_orders', name: 'הזמנות ושירות', icon: '🍽️', level: 'B1',
    prerequisite: 'chef_ingredients',
    words: [
     {it:"L'ordinazione",he:'ההזמנה',cat:'chef'},
     {it:'Il menu',he:'התפריט',cat:'chef'},
     {it:'Il conto',he:'החשבון',cat:'chef'},
     {it:'La mancia',he:'הטיפ',cat:'chef'},
     {it:'Il cameriere',he:'המלצר',cat:'chef'},
     {it:'La specialità',he:'המנה המיוחדת',cat:'chef'},
     {it:'L\'antipasto',he:'המנה הראשונה',cat:'chef'},
     {it:'Il dolce',he:'הקינוח',cat:'chef'}
    ],
    sentences: [
     {it:'Cosa desidera ordinare?',he:'מה תרצה/י להזמין?'},
     {it:'La specialità della casa è il risotto.',he:'המנה המיוחדת של הבית היא הריזוטו.'},
     {it:'Vuole vedere il menu?',he:'תרצה/י לראות את התפריט?'}
    ]
   }
  ],
  dialogues: [
   {
    cat: 'chef', title: 'In cucina — במטבח',
    lines: [
     {role:'npc',name:'Chef Marco',it:'Oggi prepariamo il ragù. Hai gli ingredienti?',he:'היום אנחנו מכינים ראגו. יש לך את המרכיבים?'},
     {role:'you',it:'Sì, ho i pomodori, la carne e il soffritto.',he:'כן, יש לי עגבניות, בשר וסופריטו.',
      options:[
       {it:'Sì, ho i pomodori, la carne e il soffritto.',he:'כן, יש לי עגבניות, בשר וסופריטו.'},
       {it:'Manca la cipolla.',he:'חסרה הבצל.'},
       {it:'Non trovo l\'aglio.',he:'אני לא מוצא/ת את השום.'}
      ]},
     {role:'npc',name:'Chef Marco',it:'Bene. Fai soffriggere la cipolla prima.',he:'טוב. תטגנ/י את הבצל קודם.'},
     {role:'you',it:'Per quanto tempo?',he:'כמה זמן?'},
     {role:'npc',name:'Chef Marco',it:'Cinque minuti, finché è dorata.',he:'חמש דקות, עד שזה מוזהב.'}
    ]
   }
  ]
 },
 {
  id: 'tourist', icon: '✈️', name: 'תייר/ית', nameIt: 'Turista',
  desc: 'מהנחיתה בשדה ועד טיול עצמאי באיטליה',
  stages: [
   { id: 'tourist_arrival', name: 'הגעה ושדה', icon: '🛬', level: 'A1',
    words: [
     {it:"L'aeroporto",he:'שדה התעופה',cat:'tourist'},
     {it:'Il passaporto',he:'הדרכון',cat:'tourist'},
     {it:'Il biglietto',he:'הכרטיס',cat:'tourist'},
     {it:'Il bagaglio',he:'המזוודה',cat:'tourist'},
     {it:'La dogana',he:'המכס',cat:'tourist'},
     {it:'Il taxi',he:'המונית',cat:'tourist'},
     {it:'L\'autobus',he:'האוטובוס',cat:'tourist'},
     {it:'L\'hotel',he:'המלון',cat:'tourist'}
    ],
    sentences: [
     {it:'Dove è l\'uscita?',he:'איפה היציאה?'},
     {it:'Vorrei un taxi per il centro.',he:'אני רוצה מונית למרכז.'},
     {it:'Ho una prenotazione all\'hotel.',he:'יש לי הזמנה במלון.'}
    ]
   },
   { id: 'tourist_sightseeing', name: 'סיורים ואתרים', icon: '🏛️', level: 'A2',
    prerequisite: 'tourist_arrival',
    words: [
     {it:'La piazza',he:'הכיכר',cat:'tourist'},
     {it:'La chiesa',he:'הכנסייה',cat:'tourist'},
     {it:'Il museo',he:'המוזיאון',cat:'tourist'},
     {it:'La cattedrale',he:'הקתדרלה',cat:'tourist'},
     {it:'La fontana',he:'המזרקה',cat:'tourist'},
     {it:'Il panorama',he:'הנוף/תצפית',cat:'tourist'},
     {it:'La guida',he:'המדריך/כה',cat:'tourist'},
     {it:'Il souvenir',he:'המזכרת',cat:'tourist'}
    ],
    sentences: [
     {it:'Quanto costa il biglietto per il museo?',he:'כמה עולה הכרטיס למוזיאון?'},
     {it:'Quando apre la cattedrale?',he:'מתי נפתחת הקתדרלה?'},
     {it:'C\'è una guida in ebraico?',he:'יש מדריך בעברית?'}
    ]
   }
  ],
  dialogues: [
   {
    cat: 'tourist', title: 'All\'aeroporto — בשדה התעופה',
    lines: [
     {role:'npc',name:'Agente',it:'Buongiorno, il passaporto, per favore.',he:'בוקר טוב, הדרכון, בבקשה.'},
     {role:'you',it:'Ecco, eccolo.',he:'הנה, הינו.',
      options:[
       {it:'Ecco, eccolo.',he:'הנה, הינו.'},
       {it:'Un momento, lo cerco.',he:'רגע, אני מחפש/ת.'}
      ]},
     {role:'npc',name:'Agente',it:'Qual è il motivo del viaggio?',he:'מה מטרת הנסיעה?'},
     {role:'you',it:'Sono qui per turismo.',he:'אני כאן לתיירות.'},
     {role:'npc',name:'Agente',it:'Benvenuto in Italia! Buon viaggio!',he:'ברוכים הבאים לאיטליה! נסיעה טובה!'}
    ]
   }
  ]
 }
];

let currentCareer = null;
let careerStageIdx = 0;

function renderCareers(container) {
 container.innerHTML = `
 <h2 class="section-title"><span class="emoji">💼</span> מסלולי קריירה</h2>
 <div style="font-size:.85rem;color:var(--text2);margin-bottom:16px">
  למד איטלקית מקצועית — מאפס ועד דיאלוגים אמיתיים בעבודה
 </div>
 ${CAREERS.map(c => {
  const careerProg = getCareerProgress(c.id);
  return `
  <div class="card card-clickable" onclick="Features.openCareer('${c.id}')" style="border-color:var(--indigo)">
   <div style="display:flex;align-items:center;gap:12px">
    <div style="font-size:2rem">${c.icon}</div>
    <div style="flex:1">
     <div class="card-title">${c.name} <span style="color:var(--text3);font-size:.8rem;font-weight:400">${c.nameIt}</span></div>
     <div class="card-desc">${c.desc}</div>
    </div>
    <div style="text-align:center">
     <div style="font-size:.7rem;color:var(--text3)">${careerProg.done}/${careerProg.total}</div>
     <div class="progress-bar" style="width:40px;height:6px;margin-top:4px">
      <div class="progress-fill" style="width:${careerProg.pct}%"></div>
     </div>
    </div>
   </div>
  </div>
  `;
 }).join('')}
 `;
}

function getCareerProgress(careerId) {
 const career = CAREERS.find(c => c.id === careerId);
 if (!career) return { done: 0, total: 0, pct: 0 };
 const total = career.stages.length;
 let done = 0;
 career.stages.forEach(s => {
  const prog = getNodeProgress(s.id);
  if (prog.crown >= 1) done++;
 });
 return { done, total, pct: Math.round((done/total)*100) };
}

function openCareer(careerId) {
 currentCareer = CAREERS.find(c => c.id === careerId);
 if (!currentCareer) return;
 careerStageIdx = 0;
 renderCareerDetail(document.getElementById('exploreContent'));
}

function renderCareerDetail(container) {
 if (!currentCareer) { renderCareers(container); return; }
 const c = currentCareer;
 
 container.innerHTML = `
 <button class="back-btn" onclick="Features.renderCareers()">← חזרה</button>
 <h2 class="section-title"><span class="emoji">${c.icon}</span> ${c.name}</h2>
 <div style="font-size:.85rem;color:var(--text2);margin-bottom:16px">${c.desc}</div>
 
 <h3 class="section-title"><span class="emoji">📊</span> שלבי המסלול</h3>
 ${c.stages.map((s, i) => {
  const prog = getNodeProgress(s.id);
  const unlocked = i === 0 || getNodeProgress(c.stages[i-1].id).crown >= 1;
  return `
  <div class="tree-level">
   <div class="tree-level-header ${!unlocked ? 'locked' : ''}" 
    onclick="${unlocked ? `Features.startCareerStage('${s.id}')` : ''}" 
    style="${!unlocked ? 'opacity:.4;pointer-events:none' : ''}">
    <div class="tree-level-title">
     <span class="tree-level-icon">${s.icon}</span>
     <div>
      <div style="font-size:.9rem">${s.name}</div>
      <div style="font-size:.7rem;color:var(--text3)">${s.level} · ${s.words.length} מילים · ${s.sentences.length} משפטים</div>
     </div>
    </div>
    <div class="tree-level-crowns">${prog.crown > 0 ? '👑'.repeat(Math.min(prog.crown, 5)) : '🔒'}</div>
   </div>
   ${i < c.stages.length - 1 ? '<div class="tree-connector' + (prog.crown >= 1 ? ' done' : '') + '"></div>' : ''}
  </div>
  `;
 }).join('')}
 
 ${c.dialogues && c.dialogues.length > 0 ? `
 <h3 class="section-title"><span class="emoji">🎭</span> סימולציות</h3>
 ${c.dialogues.map(d => `
  <div class="card card-clickable" onclick="Features.startCareerDialogue('${c.id}','${d.title.replace(/'/g, "\\'")}')">
   <div style="display:flex;align-items:center;gap:8px">
    <span style="font-size:1.3rem">🎭</span>
    <div>
     <div class="card-title">${d.title}</div>
     <div class="card-desc">${d.lines.length} שורות דיאלוג</div>
    </div>
   </div>
  </div>
 `).join('')}
 ` : ''}
 `;
}

function startCareerStage(stageId) {
 const stage = currentCareer?.stages?.find(s => s.id === stageId);
 if (!stage) return;
 
 // Convert stage to a node format compatible with Practice module
 const node = {
  id: stage.id,
  name: stage.name,
  icon: stage.icon,
  level: stage.level,
  category: stage.id,
  words: stage.words,
  sentences: stage.sentences
 };
 
 // Add to skillTree temporarily if not there
 if (!APP_DATA.skillTree.find(n => n.id === stage.id)) {
  APP_DATA.skillTree.push(node);
  // Re-flatten
  stage.words.forEach(w => { if (!APP_DATA.words.find(x => x.it === w.it)) APP_DATA.words.push(w); });
  stage.sentences.forEach(s => { if (!APP_DATA.sentences.find(x => x.it === s.it)) APP_DATA.sentences.push(s); });
 }
 
 Practice.startQuiz(node);
}

function startCareerDialogue(careerId, title) {
 const career = CAREERS.find(c => c.id === careerId);
 if (!career) return;
 const dialogue = career.dialogues.find(d => d.title === title);
 if (!dialogue) return;
 
 // Convert to Practice dialogue format
 const node = {
  id: 'career_' + careerId + '_dlg',
  name: dialogue.title,
  icon: '🎭',
  category: careerId
 };
 
 // Add dialogue to APP_DATA if not there
 if (!APP_DATA.dialogues) APP_DATA.dialogues = [];
 const existing = APP_DATA.dialogues.find(d => d.title === dialogue.title);
 if (!existing) APP_DATA.dialogues.push(dialogue);
 
 Practice.startDialogue(node);
}

// ═══════════════════════════════════════
// SIMULATIONS (standalone)
// ═══════════════════════════════════════
const SIMULATIONS = [
 {
  id: 'sim_bar', icon: '☕', name: 'בבר — Al bar', level: 'A1',
  desc: 'הזמנת קפה ומאפה בבר איטלקי',
  lines: [
   {role:'npc',name:'Barista',it:'Buongiorno! Cosa desidera?',he:'בוקר טוב! מה תרצה?'},
   {role:'you',it:'Vorrei un espresso, per favore.',he:'אני רוצה אספרסו, בבקשה.',
    options:[
     {it:'Vorrei un espresso, per favore.',he:'אני רוצה אספרסו, בבקשה.'},
     {it:'Un cappuccino, grazie.',he:'קפוצ׳ינו, תודה.'},
     {it:'Un cornetto, per favore.',he:'קרואסון, בבקשה.'}
    ]},
   {role:'npc',name:'Barista',it:'Lo vuole al banco o al tavolo?',he:'בעמדה או בשולחן?'},
   {role:'you',it:'Al banco, grazie.',he:'בעמדה, תודה.',
    options:[
     {it:'Al banco, grazie.',he:'בעמדה, תודה.'},
     {it:'Al tavolo, per favore.',he:'בשולחן, בבקשה.'}
    ]},
   {role:'npc',name:'Barista',it:'Un euro e venti. Ecco il resto!',he:'יורו ועשרים. הנה העודף!'},
   {role:'you',it:'Grazie! Arrivederci!',he:'תודה! להתראות!'}
  ]
 },
 {
  id: 'sim_pharmacy', icon: '💊', name: 'בבית מרקחת — In farmacia', level: 'A2',
  desc: 'רכישת תרופות ובקשת עזרה',
  lines: [
   {role:'npc',name:'Farmacista',it:'Buongiorno, come posso aiutarla?',he:'בוקר טוב, איך אוכל לעזור לך?'},
   {role:'you',it:'Ho mal di testa. Ha qualcosa?',he:'כואב לי הראש. יש לך משהו?',
    options:[
     {it:'Ho mal di testa. Ha qualcosa?',he:'כואב לי הראש. יש לך משהו?'},
     {it:'Mi serve qualcosa per la tosse.',he:'אני צריך/ה משהו לשיעול.'},
     {it:'Avete l\'ibuprofene?',he:'יש לכם איבופרופן?'}
    ]},
   {role:'npc',name:'Farmacista',it:'Sì, questo è molto efficace. Quanto ne vuole?',he:'כן, זה מאוד יעיל. כמה את/ה רוצה?'},
   {role:'you',it:'Una confezione, grazie. Quanto costa?',he:'חבילה אחת, תודה. כמה זה עולה?'},
   {role:'npc',name:'Farmacista',it:'Otto euro e cinquanta. Lo prenda dopo i pasti.',he:'שמונה יורו וחמישים. תיקח/י אחרי האוכל.'},
   {role:'you',it:'Grazie mille, arrivederci!',he:'תודה רבה, להתראות!'}
  ]
 },
 {
  id: 'sim_restaurant', icon: '🍝', name: 'במסעדה — Al ristorante', level: 'A1',
  desc: 'הזמנת אוכל, שתייה וחשבון',
  lines: [
   {role:'npc',name:'Cameriere',it:'Buonasera! Un tavolo per quante persone?',he:'ערב טוב! שולחן לכמה אנשים?'},
   {role:'you',it:'Per due persone, grazie.',he:'לשניים, תודה.',
    options:[
     {it:'Per due persone, grazie.',he:'לשניים, תודה.'},
     {it:'Solo per me.',he:'רק לי.'},
     {it:'Per quattro, abbiamo una prenotazione.',he:'לארבעה, יש לנו הזמנה.'}
    ]},
   {role:'npc',name:'Cameriere',it:'Prego, si accomodi. Ecco il menu.',he:'בבקשה, שב/י. הנה התפריט.'},
   {role:'you',it:'Vorrei la carbonara e un\'acqua minerale.',he:'אני רוצה קרבונרה ומים מינרליים.'},
   {role:'npc',name:'Cameriere',it:'Ottima scelta! Subito.',he:'בחירה מצוינת! מיד.'},
   {role:'you',it:'Il conto, per favore.',he:'החשבון, בבקשה.'},
   {role:'npc',name:'Cameriere',it:'Sono ventidue euro. Ha app?',he:'22 יורו. יש לך אפליקציה?'}
  ]
 },
 {
  id: 'sim_market', icon: '🛒', name: 'בשוק — Al mercato', level: 'A2',
  desc: 'קניית ירקות, פירות ומיקוח',
  lines: [
   {role:'npc',name:'Venditore',it:'Buongiorno! Guardi che bella frutta oggi!',he:'בוקר טוב! תראה/י איזה פירות יפים היום!'},
   {role:'you',it:'Quanto costano le pesche?',he:'כמה עולות האפרסקים?',
    options:[
     {it:'Quanto costano le pesche?',he:'כמה עולות האפרסקים?'},
     {it:'Vorrei due chili di pomodori.',he:'אני רוצה שני קילו עגבניות.'},
     {it:'Ha fragole fresche?',he:'יש לך תותים טריים?'}
    ]},
   {role:'npc',name:'Venditore',it:'Tre euro al chilo. Sono dolcissime!',he:'שלוש יורו לקילו. הן מתוקות מאוד!'},
   {role:'you',it:'Me ne dia un chilo, per favore.',he:'תן/י לי קילו, בבקשה.'},
   {role:'npc',name:'Venditore',it:'Ecco! Altro?',he:'הנה! עוד משהו?'},
   {role:'you',it:'No grazie, quanto le devo?',he:'לא תודה, כמה אני חייב/ת?'}
  ]
 }
];

let simIdx = 0;
let simLineIdx = 0;

function renderSimulations(container) {
 container.innerHTML = `
 <h2 class="section-title"><span class="emoji">🎭</span> סימולציות</h2>
 <div style="font-size:.85rem;color:var(--text2);margin-bottom:16px">
  דיאלוגים אינטראקטיביים — תרגל מצבים אמיתיים באיטליה
 </div>
 ${SIMULATIONS.map(sim => `
  <div class="card card-clickable" onclick="Features.startSimulation('${sim.id}')" style="border-color:var(--purple)">
   <div style="display:flex;align-items:center;gap:12px">
    <div style="font-size:2rem">${sim.icon}</div>
    <div style="flex:1">
     <div class="card-title">${sim.name}</div>
     <div class="card-desc">${sim.desc}</div>
     <div style="font-size:.65rem;color:var(--text3);margin-top:4px">${sim.level} · ${sim.lines.length} שורות</div>
    </div>
   </div>
  </div>
 `).join('')}
 `;
}

function startSimulation(simId) {
 const sim = SIMULATIONS.find(s => s.id === simId);
 if (!sim) return;
 
 // Add to APP_DATA.dialogues if not there
 if (!APP_DATA.dialogues) APP_DATA.dialogues = [];
 const existing = APP_DATA.dialogues.find(d => d.cat === simId);
 if (!existing) {
  APP_DATA.dialogues.push({
   cat: simId,
   title: sim.name,
   lines: sim.lines
  });
 }
 
 const node = { id: simId, name: sim.name, icon: sim.icon, category: simId };
 Practice.startDialogue(node);
}

// ═══════════════════════════════════════
// ENHANCED ANKI (5-success removal)
// ═══════════════════════════════════════
// Override: track consecutive successes per card
// When a weak word gets 5 correct answers in a row, remove from weak list

function enhancedAnkiRate(card, rating) {
 // rating: 0=forgot, 1=hard, 2=good, 3=easy
 const key = card.front;
 
 // Track consecutive successes
 if (!state.ankiSuccessCount) state.ankiSuccessCount = {};
 
 if (rating >= 2) { // good or easy
  state.ankiSuccessCount[key] = (state.ankiSuccessCount[key] || 0) + 1;
  
  // After 5 consecutive successes, remove from weak words
  if (state.ankiSuccessCount[key] >= 5) {
   state.weakWords = (state.weakWords || []).filter(w => w.word !== key);
   delete state.ankiSuccessCount[key];
   toast(`✅ "${key}" סיימ/ה 5 הצלחות — הוסר/ה ממילים חלשות!`, 'success');
  }
 } else { // forgot or hard
  state.ankiSuccessCount[key] = 0; // reset streak
 }
 
 save();
}

// Auto-add missed words to Anki
function autoAddWeakToAnki() {
 if (!state.weakWords || state.weakWords.length === 0) return;
 
 let added = 0;
 state.weakWords.forEach(w => {
  const wordData = (APP_DATA.words || []).find(x => x.he === w.word || x.it === w.word);
  if (wordData && !anki[wordData.it]) {
   addAnkiCard(wordData);
   added++;
  }
 });
 
 if (added > 0) toast(`🧠 ${added} מילים חלשות נוספו לאנקי`, 'info');
}

// ═══════════════════════════════════════
// EXPLORE TAB INTEGRATION
// ═══════════════════════════════════════
function renderExploreTab(container) {
 container.innerHTML = `
 <h2 class="section-title"><span class="emoji">🧭</span> חקור</h2>
 <div class="tab-row">
  <div class="tab-btn ${currentTab==='translate'?'active':''}" onclick="Features.switchTab('translate')">⚡ תרגום</div>
  <div class="tab-btn ${currentTab==='careers'?'active':''}" onclick="Features.switchTab('careers')">💼 קריירה</div>
  <div class="tab-btn ${currentTab==='simulations'?'active':''}" onclick="Features.switchTab('simulations')">🎭 סימולציות</div>
  <div class="tab-btn ${currentTab==='news'?'active':''}" onclick="Features.switchTab('news')">📰 חדשות</div>
 </div>
 <div id="exploreTabArea"></div>
 `;
 
 const area = document.getElementById('exploreTabArea');
 switch(currentTab) {
  case 'translate': renderTranslate(area); break;
  case 'careers': renderCareers(area); break;
  case 'simulations': renderSimulations(area); break;
  case 'news': Content.switchTab('news'); break;
 }
}

let currentTab = 'careers';

function switchTab(tab) {
 currentTab = tab;
 if (tab === 'news' || tab === 'songs' || tab === 'stories' || tab === 'culture') {
  Content.switchTab(tab);
  return;
 }
 renderExploreTab(document.getElementById('exploreContent'));
}

// ═══════════════════════════════════════
// INIT — load saved translations & auto-add weak words to Anki
// ═══════════════════════════════════════
function init() {
 if (state.savedTranslations) translateHistory = state.savedTranslations;
 // Auto-add weak words to Anki on load
 setTimeout(() => autoAddWeakToAnki(), 1000);
}

// ═══════════════════════════════════════
// EXPOSE
// ═══════════════════════════════════════
return {
 renderTranslate, renderCareers, renderSimulations,
 renderExploreTab, switchTab,
 doTranslate, autoTranslate, speakTranslation, saveTranslation, replayTranslation,
 openCareer, startCareerStage, startCareerDialogue,
 startSimulation,
 enhancedAnkiRate, autoAddWeakToAnki,
 init,
 _currentCareer: () => currentCareer,
 _lastTranslation: () => _lastTranslation
};

})();
