/* ═══════════════════════════════════════════════
   VolaLingo — Exam Engine Module
   Extracted from exams.js — Zero behavior change
   ═══════════════════════════════════════════════ */

const ExamEngine = (() => {

// ═══════════════════════════════════════
// DEPENDENCIES (injected by app.js on init)
// ═══════════════════════════════════════
let _state = null;
let _save = null;
let _toast = null;
let _Events = null;
let _APP_DATA = null;

// ═══════════════════════════════════════
// INTERNAL STATE
// ═══════════════════════════════════════
let currentExam = null;
let currentSection = 0;
let currentQuestion = 0;
let answers = {};
let timer = null;
let timeRemaining = 0;
let sectionTimer = null;
let sectionTimeRemaining = 0;
let examActive = false;
let isQuickPractice = false;
let practiceLevel = null;
let practiceType = null;
let writingAnswers = {};

// ═══════════════════════════════════════
// EXAM DATA — REAL Italian Questions
// Based on AIL Firenze diploma analysis
// ═══════════════════════════════════════
const EXAM_DATA = {
  'deli-a2': {
    id: 'deli-a2',
    name: 'DELI-A2',
    fullName: 'Diploma Elementare di Lingua Italiana — A2',
    level: 'A2',
    icon: '🌱',
    duration: 105,
    description: 'מבחן ברמה בסיסית. מתאים ללומדים עם 80-120 שעות לימוד.',
    sections: [
      {
        id: 'reading',
        name: 'Comprensione scritta',
        heName: '📖 הבנת הנקרא',
        duration: 30,
        instructions: 'קרא את הטקסטים וענה על השאלות.',
        questions: [
          {
            id: 'delia2_r1',
            type: 'truefalse',
            text: 'Leggi il testo:<br><br><em>"Oggi molti italiani preferiscono fare la spesa al mercato rionale invece che al supermercato. Al mercato si trovano prodotti freschi come frutta, verdura, formaggi e salumi. Inoltre si può parlare direttamente con il venditore che spesso dà consigli su come preparare i prodotti. Secondo un\'indagine recente, il 65% degli italiani visita il mercato almeno una volta alla settimana."</em>',
            items: [
              { id: 'tf1', statement: 'Gli italiani preferiscono solo il supermercato per fare la spesa.', answer: false },
              { id: 'tf2', statement: 'Al mercato si possono trovare prodotti freschi.', answer: true },
              { id: 'tf3', statement: 'Il 65% degli italiani va al mercato una volta al mese.', answer: false },
              { id: 'tf4', statement: 'Al mercato si può parlare con il venditore.', answer: true },
              { id: 'tf5', statement: 'Il venditore a volte dà consigli su come preparare i prodotti.', answer: true }
            ]
          },
          {
            id: 'delia2_r2',
            type: 'truefalse',
            text: 'Leggi il testo:<br><br><em>"La Biblioteca Nazionale di Firenze si trova vicino alla stazione Santa Maria Novella. È aperta dal lunedì al venerdì dalle 8:30 alle 19:00 e il sabato dalle 8:30 alle 13:30. L\'ingresso è gratuito per tutti i cittadini dell\'Unione Europea. I turisti possono visitare le sale principali con un biglietto di 5 euro."</em>',
            items: [
              { id: 'tf6', statement: 'La biblioteca è aperta anche la domenica.', answer: false },
              { id: 'tf7', statement: 'L\'ingresso è gratuito per i cittadini UE.', answer: true },
              { id: 'tf8', statement: 'La biblioteca si trova vicino alla stazione.', answer: true },
              { id: 'tf9', statement: 'I turisti pagano 10 euro per visitare la biblioteca.', answer: false },
              { id: 'tf10', statement: 'Il sabato la biblioteca chiude alle 13:30.', answer: true }
            ]
          }
        ]
      },
      {
        id: 'writing',
        name: 'Espressione scritta',
        heName: '✍️ הבעה בכתב',
        duration: 20,
        instructions: 'בחר באחת מהנושאים וכתוב 30-40 מילים באיטלקית.',
        questions: [
          {
            id: 'delia2_w1',
            type: 'writing',
            prompt: 'Scrivi 30-40 parole su uno dei seguenti temi:',
            options: [
              'Il mio fine settimana ideale',
              'Una serata con gli amici',
              'Le mie vacanze preferite',
              'Una giornata tipica nella mia vita',
              'Il mio piatto italiano preferito'
            ],
            modelAnswer: 'Il mio fine settimana ideale inizia il sabato mattina. Mi sveglio tardi e faccio una colazione abbondante. Poi esco con gli amici per una passeggiata in centro. La domenica invece mi piace stare a casa a leggere un libro o guardare un film.'
          }
        ]
      },
      {
        id: 'grammar',
        name: 'Competenze morfosintattiche',
        heName: '📝 דקדוק',
        duration: 15,
        instructions: 'השלם את המשפטים עם הצורה הנכונה.',
        questions: [
          {
            id: 'delia2_g1',
            type: 'fill',
            text: 'Completa le frasi con la forma verbale corretta:',
            items: [
              { id: 'f1', sentence: 'Domani io (andare) _____ al mercato.', answer: 'vado', infinitive: 'andare' },
              { id: 'f2', sentence: 'Ieri noi (mangiare) _____ la pizza.', answer: 'abbiamo mangiato', infinitive: 'mangiare' },
              { id: 'f3', sentence: 'Quando (tu-tornare) _____ a casa?', answer: 'torni', infinitive: 'tornare' },
              { id: 'f4', sentence: 'Loro (essere) _____ molto felici.', answer: 'sono', infinitive: 'essere' },
              { id: 'f5', sentence: 'Io (volere) _____ un gelato.', answer: 'voglio', infinitive: 'volere' }
            ]
          }
        ]
      },
      {
        id: 'listening',
        name: 'Comprensione orale',
        heName: '🎧 הבנת הנשמע',
        duration: 20,
        instructions: 'הקשב לקטעי השמע וענה.',
        questions: [
          {
            id: 'delia2_l1',
            type: 'multiple',
            audio: 'audio/delilist1.mp3',
            text: 'Ascolta e scegli la risposta corretta:',
            question: 'Dove va Marco domani?',
            options: ['Al mare', 'Al lavoro', 'A scuola', 'Al mercato'],
            answer: 3
          }
        ]
      },
      {
        id: 'speaking',
        name: 'Espressione orale',
        heName: '🎤 הבעה בעל פה',
        duration: 20,
        instructions: 'תרגל דיבור על הנושאים.',
        questions: [
          {
            id: 'delia2_s1',
            type: 'speaking',
            prompt: 'Parla di te per 1-2 minuti:',
            topics: ['Presentati', 'La tua famiglia', 'Il tuo lavoro/studi', 'I tuoi hobby', 'Perché impari l\'italiano']
          }
        ]
      }
    ]
  },
  'dili-b1': {
    id: 'dili-b1',
    name: 'DILI-B1',
    fullName: 'Diploma Intermedio di Lingua Italiana — B1',
    level: 'B1',
    icon: '🌿',
    duration: 145,
    description: 'מבחן ברמה בינונית. מתאים ללומדים עם 200-300 שעות לימוד.',
    sections: [
      {
        id: 'reading',
        name: 'Comprensione scritta',
        heName: '📖 הבנת הנקרא',
        duration: 40,
        instructions: 'קרא את הטקסטים וענה.',
        questions: [
          {
            id: 'dilib1_r1',
            type: 'multiple',
            text: 'Leggi il testo:<br><br><em>"L\'istruzione in Italia è obbligatoria dai 6 ai 16 anni. La scuola primaria dura 5 anni, seguita dalla scuola secondaria di primo grado (3 anni) e secondo grado (5 anni). L\'esame di maturità alla fine della secondaria di secondo grado permette l\'accesso all\'università. Negli ultimi anni, il numero di studenti che scelgono percorsi tecnici e professionali è aumentato."</em>',
            question: 'Quanto dura la scuola primaria in Italia?',
            options: ['3 anni', '5 anni', '6 anni', '8 anni'],
            answer: 1
          }
        ]
      },
      {
        id: 'writing',
        name: 'Espressione scritta',
        heName: '✍️ הבעה בכתב',
        duration: 30,
        instructions: 'כתוב 50-70 מילים באיטלקית.',
        questions: [
          {
            id: 'dilib1_w1',
            type: 'writing',
            prompt: 'Scrivi 50-70 parole su uno dei seguenti temi:',
            options: [
              'I vantaggi e gli svantaggi della tecnologia',
              'Il mio lavoro ideale',
              'Una città che vorrei visitare',
              'L\'importanza delle lingue straniere',
              'Come è cambiata la mia vita negli ultimi anni'
            ],
            modelAnswer: 'La tecnologia ha cambiato radicalmente le nostre vite. Da un lato, ci permette di comunicare istantaneamente con persone in tutto il mondo e accedere a infinite informazioni. Dall\'altro, può creare dipendenza e isolamento sociale. Il mio lavoro ideale combinerebbe tecnologia e creatività, permettendomi di risolvere problemi reali. Credo che l\'equilibrio sia la chiave.'
          }
        ]
      },
      {
        id: 'grammar',
        name: 'Competenze morfosintattiche',
        heName: '📝 דקדוק',
        duration: 25,
        instructions: 'השלם עם הצורה הנכונה.',
        questions: [
          {
            id: 'dilib1_g1',
            type: 'fill',
            text: 'Completa con la forma verbale appropriata:',
            items: [
              { id: 'f1', sentence: 'Se io (avere) _____ tempo, (andare) _____ in Italia.', answer: 'avessi / andrei', infinitive: 'avere/andare' },
              { id: 'f2', sentence: 'Quando (loro-arrivare) _____ a Roma, visiteranno il Colosseo.', answer: 'arriveranno', infinitive: 'arrivare' },
              { id: 'f3', sentence: 'È importante che tu (studiare) _____ ogni giorno.', answer: 'studi', infinitive: 'studiare' },
              { id: 'f4', sentence: 'Non credo che lui (capire) _____ il problema.', answer: 'capisca', infinitive: 'capire' },
              { id: 'f5', sentence: 'Dopo (avere-mangiare) _____, siamo usciti.', answer: 'avere mangiato', infinitive: 'avere mangiato' }
            ]
          }
        ]
      },
      {
        id: 'listening',
        name: 'Comprensione orale',
        heName: '🎧 הבנת הנשמע',
        duration: 25,
        instructions: 'הקשב וענה.',
        questions: [
          {
            id: 'dilib1_l1',
            type: 'multiple',
            audio: 'audio/dililist1.mp3',
            text: 'Ascolta l\'annuncio:',
            question: 'A che ora parte il treno per Milano?',
            options: ['14:30', '15:00', '15:30', '16:00'],
            answer: 2
          }
        ]
      },
      {
        id: 'speaking',
        name: 'Espressione orale',
        heName: '🎤 הבעה בעל פה',
        duration: 25,
        instructions: 'תרגל דיבור.',
        questions: [
          {
            id: 'dilib1_s1',
            type: 'speaking',
            prompt: 'Esprimi la tua opinione su:',
            topics: ['Il lavoro da remoto', 'L\'ambiente e l\'inquinamento', 'I social media e i giovani', 'Il sistema sanitario italiano', 'Il turismo in Italia']
          }
        ]
      }
    ]
  },
  'dali-c1': {
    id: 'dali-c1',
    name: 'DALI-C1',
    fullName: 'Diploma Avanzato di Lingua Italiana — C1',
    level: 'C1',
    icon: '🌳',
    duration: 190,
    description: 'מבחן ברמה מתקדמת. מתאים ללומדים עם 400-500 שעות לימוד.',
    sections: [
      {
        id: 'reading',
        name: 'Comprensione scritta',
        heName: '📖 הבנת הנקרא',
        duration: 50,
        instructions: 'קרא טקסטים מורכבים וענה.',
        questions: [
          {
            id: 'dalic1_r1',
            type: 'multiple',
            text: 'Leggi il testo:<br><br><em>"La globalizzazione ha profondamente trasformato il mercato del lavoro negli ultimi decenni. Se da un lato ha creato nuove opportunità professionali e facilitato la circolazione dei talenti, dall\'altro ha accentuato le disuguaglianze e reso più precarie molte posizioni lavorative. Secondo un recente studio dell\'OCSE, i lavoratori con competenze digitali avanzate guadagnano in media il 25% in più rispetto a quelli che non possiedono tali competenze."</em>',
            question: 'Secondo lo studio OCSE citato, qual è il divario salariale tra lavoratori con e senza competenze digitali avanzate?',
            options: ['10%', '15%', '25%', '35%'],
            answer: 2
          }
        ]
      },
      {
        id: 'writing',
        name: 'Espressione scritta',
        heName: '✍️ הבעה בכתב',
        duration: 40,
        instructions: 'כתוב 100-120 מילים באיטלקית.',
        questions: [
          {
            id: 'dalic1_w1',
            type: 'writing',
            prompt: 'Scrivi 100-120 parole su uno dei seguenti temi:',
            options: [
              'L\'intelligenza artificiale e il futuro del lavoro',
              'Cambiamenti climatici e responsabilità individuale',
              'L\'identità culturale nell\'era globale',
              'Il ruolo dell\'Italia in Europa',
              'Etica e tecnologia biomedica'
            ],
            modelAnswer: 'La globalizzazione rappresenta sia un\'opportunità che una minaccia per le identità culturali. Da un lato, permette lo scambio e l\'arricchimento reciproco tra culture diverse. La cucina italiana, per esempio, si è diffusa in tutto il mondo, ma allo stesso tempo si è adattata ai gusti locali, creando nuove varianti. Dall\'altro lato, c\'è il rischio di omologazione culturale, dove le culture dominanti tendono a sovrastare quelle più piccole. Il vero multiculturalismo non significa fusione, ma convivenza rispettosa delle differenze.'
          }
        ]
      },
      {
        id: 'grammar',
        name: 'Competenze morfosintattiche',
        heName: '📝 דקדוק',
        duration: 30,
        instructions: 'השלם עם הצורה הנכונה.',
        questions: [
          {
            id: 'dalic1_g1',
            type: 'fill',
            text: 'Completa il testo con le parole appropriate.<br><br>"Se il governo _____(1) approvato la legge prima, molte _____(2) state le conseguenze positive per l\'ambiente. _____(3) non sia facile trovare un accordo, è fondamentale che tutte le parti _____(4) collaborino. I cittadini, dal canto loro, _____(5) pronti a fare la loro parte, come dimostrano i dati sul riciclo."',
            items: [
              { id: 'f1', sentence: '_____(1)', answer: 'avesse', infinitive: 'avere' },
              { id: 'f2', sentence: '_____(2)', answer: 'sarebbero', infinitive: 'essere' },
              { id: 'f3', sentence: '_____(3)', answer: 'Anche se', infinitive: '' },
              { id: 'f4', sentence: '_____(4)', answer: 'collaborino', infinitive: 'collaborare' },
              { id: 'f5', sentence: '_____(5)', answer: 'sarebbero', infinitive: 'essere' }
            ]
          }
        ]
      },
      {
        id: 'listening',
        name: 'Comprensione orale',
        heName: '🎧 הבנת הנשמע',
        duration: 35,
        instructions: 'הקשב להרצאה/ראיון וענה.',
        questions: [
          {
            id: 'dalic1_l1',
            type: 'multiple',
            audio: 'audio/dalilist1.mp3',
            text: 'Ascolta l\'intervista:',
            question: 'Qual è l\'opinione dell\'esperto sull\'IA nel lavoro?',
            options: ['Sostituirà tutti i lavori', 'Creerà nuovi lavori ma ne eliminerà altri', 'Non avrà impatto', 'Migliorerà solo i lavori creativi'],
            answer: 1
          }
        ]
      },
      {
        id: 'speaking',
        name: 'Espressione orale',
        heName: '🎤 הבעה בעל פה',
        duration: 35,
        instructions: 'תרגל דיבור מורכב.',
        questions: [
          {
            id: 'dalic1_s1',
            type: 'speaking',
            prompt: 'Argomenta a favore o contro:',
            topics: ['Reddito di base universale', 'Limitazione della libertà di espressione per sicurezza', 'Privatizzazione della sanità', 'Obbligo vaccinale', 'Intelligenza artificiale in medicina']
          }
        ]
      }
    ]
  },
  'celi-b2': {
    id: 'celi-b2',
    name: 'CELI 3',
    fullName: 'Certificato di Conoscenza della Lingua Italiana — Livello 3 (B2)',
    level: 'B2',
    icon: '🏛️',
    duration: 165,
    description: 'מבחן רשמי אוניברסיטה פרוג\'ה. רמה על-בינונית.',
    sections: [
      {
        id: 'reading',
        name: 'Comprensione della lettura',
        heName: '📖 הבנת הנקרא',
        duration: 45,
        instructions: 'קרא וענה.',
        questions: [
          {
            id: 'celib2_r1',
            type: 'matching',
            text: 'Abbina i titoli ai paragrafi:<br><br><strong>A.</strong> <em>L\'arte di vivere lentamente</em><br><strong>B.</strong> <em>Tecnologia e relazioni umane</em><br><strong>C.</strong> <em>Il cibo come cultura</em><br><strong>D.</strong> <em>Viaggiare per conoscere se stessi</em>',
            items: [
              { id: 'm1', text: '1. Mangiare insieme non è solo nutrirsi, ma condividere storie e tradizioni.', answer: 'C' },
              { id: 'm2', text: '2. Lo smartphone ci connette al mondo ma ci allontana da chi ci siede accanto.', answer: 'B' },
              { id: 'm3', text: '3. Camminare senza meta in una città sconosciuta insegna più di qualsiasi guida.', answer: 'D' },
              { id: 'm4', text: '4. Il caffè al bar, la passeggiata serale, il tempo per pensare: lusso raro.', answer: 'A' }
            ]
          }
        ]
      },
      {
        id: 'writing',
        name: 'Produzione scritta',
        heName: '✍️ הבעה בכתב',
        duration: 40,
        instructions: 'כתוב 90-110 מילים.',
        questions: [
          {
            id: 'celib2_w1',
            type: 'writing',
            prompt: 'Scrivi una lettera/email formale (90-110 parole):',
            options: [
              'Reclamo per un servizio scadente',
              'Candidatura per un lavoro',
              'Richiesta informazioni università',
              'Segnalazione problema condominiale',
              'Ringraziamento per ospitalità'
            ],
            modelAnswer: 'Gentile Direttore, Le scrivo per esprimere la mia insoddisfazione riguardo al servizio ricevuto presso il vostro hotel lo scorso weekend. Nonostante la prenotazione confermata, la camera non era pronta all\'arrivo e il personale non ha offerto alternative adeguate. Inoltre, il rumore dai lavori in corso ha reso impossibile il riposo. Chiedo un rimborso parziale o un soggiorno gratuito futuro. Cordiali saluti, Mario Rossi'
          }
        ]
      },
      {
        id: 'grammar',
        name: 'Competenza linguistica',
        heName: '📝 דקדוק ואוצר מילים',
        duration: 30,
        instructions: 'השלם/בחר את התשובה הנכונה.',
        questions: [
          {
            id: 'celib2_g1',
            type: 'multiple',
            text: 'Scegli la forma corretta:',
            items: [
              { id: 'm1', question: '_____ la sua disponibilità, non siamo riusciti a trovare un accordo.', options: ['Nonostante', 'Poiché', 'Perché', 'Quando'], answer: 0 },
              { id: 'm2', question: 'Se io _____ te, accetterei l\'offerta.', options: ['fossi', 'sono', 'ero', 'sarò'], answer: 0 },
              { id: 'm3', question: 'È arrivato il momento _____ una decisione.', options: ['di prendere', 'prendere', 'che prendere', 'prendendo'], answer: 0 },
              { id: 'm4', question: 'Non ricordo _____ ti ho detto ieri.', options: ['se', 'che', 'cosa', 'tutto'], answer: 2 },
              { id: 'm5', question: 'Loro insistono _____ partire domani.', options: ['per', 'a', 'di', 'in'], answer: 0 }
            ]
          }
        ]
      },
      {
        id: 'listening',
        name: 'Comprensione dell\'ascolto',
        heName: '🎧 הבנת הנשמע',
        duration: 25,
        instructions: 'הקשב וענה.',
        questions: [
          {
            id: 'celib2_l1',
            type: 'multiple',
            audio: 'audio/celilist1.mp3',
            text: 'Ascolta la conversazione:',
            question: 'Perché Maria non può venire alla festa?',
            options: ['Deve studiare', 'È malata', 'Deve lavorare', 'È in viaggio'],
            answer: 2
          }
        ]
      },
      {
        id: 'speaking',
        name: 'Produzione orale',
        heName: '🎤 הבעה בעל פה',
        duration: 25,
        instructions: 'תרגל דיבור.',
        questions: [
          {
            id: 'celib2_s1',
            type: 'speaking',
            prompt: 'Descrivi una situazione e proponi una soluzione:',
            topics: ['Problemi di vicinato', 'Organizzare un evento', 'Cambiare lavoro', 'Imparare una lingua', 'Viaggiare da solo']
          }
        ]
      }
    ]
  },
  'celi-c1': {
    id: 'celi-c1',
    name: 'CELI 4',
    fullName: 'Certificato di Conoscenza della Lingua Italiana — Livello 4 (C1)',
    level: 'C1',
    icon: '🎓',
    duration: 205,
    description: 'מבחן רשמי אוניברסיטה פרוג\'ה. רמה מתקדמת.',
    sections: [
      {
        id: 'reading',
        name: 'Comprensione della lettura',
        heName: '📖 הבנת הנקרא',
        duration: 50,
        instructions: 'קרא טקסט אקדמי/ספרותי.',
        questions: [
          {
            id: 'celic1_r1',
            type: 'multiple',
            text: 'Leggi il brano:<br><br><em>"L\'identità non è un dato immobile, ma un processo continuo di negoziazione tra ciò che siamo e ciò che vorremmo essere. Nella società liquida contemporanea, i punti di riferimento tradizionali — famiglia, lavoro, territorio — perdono stabilità. L\'individuo deve costantemente ricostruire la propria identità attraverso scelte che sono insieme libere e condizionate."</em>',
            question: 'Secondo il testo, l\'identità nella società contemporanea è:',
            options: ['Fissa e immutabile', 'Determinata solo dalla famiglia', 'Un processo continuo di negoziazione', 'Definita solo dal lavoro'],
            answer: 2
          }
        ]
      },
      {
        id: 'writing',
        name: 'Produzione scritta',
        heName: '✍️ הבעה בכתב',
        duration: 50,
        instructions: 'כתוב 150-180 מילים.',
        questions: [
          {
            id: 'celic1_w1',
            type: 'writing',
            prompt: 'Scrivi un saggio breve (150-180 parole):',
            options: [
              'La democrazia nell\'era digitale',
              'Bioetica e frontiere della scienza',
              'Il futuro delle città europee',
              'Memoria storica e identità collettiva',
              'Disuguaglianza globale e giustizia'
            ],
            modelAnswer: 'La democrazia nell\'era digitale affronta sfide senza precedenti. La velocità dell\'informazione ha reso il dibattito pubblico più accessibile ma anche più frammentato e polarizzato. Le bolle algoritmiche rafforzano le convinzioni preesistenti, mentre la disinformazione si diffonde più velocemente della verifica. Tuttavia, la tecnologia offre anche strumenti per una partecipazione più diretta: piattaforme di deliberazione, budget partecipativi, consultazioni online. La sfida non è rifiutare il digitale, ma progettare istituzioni che ne sfruttino il potenziale democratico mitigandone i rischi. Educazione civica digitale, trasparenza algoritmica e spazi di confronto protetti sono condizioni necessarie.'
          }
        ]
      },
      {
        id: 'grammar',
        name: 'Competenza linguistica',
        heName: '📝 דקדוק ואוצר מילים',
        duration: 35,
        instructions: 'השלם עם צורות מתקדמות.',
        questions: [
          {
            id: 'celic1_g1',
            type: 'fill',
            text: 'Completa con la forma verbale appropriata (condizionale, congiuntivo, infinito):',
            items: [
              { sentence: 'È probabile che loro (arrivare) _____ in ritardo a causa del traffico.', answer: 'arrivino', infinitive: 'arrivare' },
              { sentence: 'Avrei preferito che tu (dire) _____ la verità subito.', answer: 'avessi detto', infinitive: 'dire' },
              { sentence: 'Senza (sapere) _____ nuotare, non posso andare in barca.', answer: 'sapere', infinitive: 'sapere' },
              { sentence: 'Se (studiare) _____ di più, (passare) _____ l\'esame.', answer: 'avessi studiato / avrei passato', infinitive: 'studiare/passare' },
              { sentence: 'È essenziale che il documento (essere) _____ firmato entro domani.', answer: 'sia', infinitive: 'essere' }
            ]
          }
        ]
      },
      {
        id: 'listening',
        name: 'Comprensione dell\'ascolto',
        heName: '🎧 הבנת הנשמע',
        duration: 40,
        instructions: 'הקשב להרצאה אקדמית.',
        questions: [
          {
            id: 'celic1_l1',
            type: 'multiple',
            audio: 'audio/celilist2.mp3',
            text: 'Ascolta la conferenza:',
            question: 'Qual è la tesi principale del relatore?',
            options: ['L\'IA sostituirà l\'uomo', 'L\'IA e l\'uomo collaboreranno', 'L\'IA è pericolosa', 'L\'IA non funziona'],
            answer: 1
          }
        ]
      },
      {
        id: 'speaking',
        name: 'Produzione orale',
        heName: '🎤 הבעה בעל פה',
        duration: 30,
        instructions: 'תרגל דיבור אקדמי.',
        questions: [
          {
            id: 'celic1_s1',
            type: 'speaking',
            prompt: 'Presenta e argomenta una tesi:',
            topics: ['Etica dell\'intelligenza artificiale', 'Crisi climatica e giustizia intergenerazionale', 'Sovranità nazionale vs governance globale', 'Diritti digitali e privacy', 'Bioingegnerיה e limiti dell\'umano']
          }
        ]
      }
    ]
  }
};

// Quick Practice Questions per level
const QUICK_PRACTICE = {
  A1: {
    grammar: [
      { sentence: 'Io _____ (essere) italiano.', answer: 'sono', type: 'verb' },
      { sentence: 'Tu _____ (avere) 20 anni.', answer: 'hai', type: 'verb' },
      { sentence: 'Noi _____ (andare) a Roma.', answer: 'andiamo', type: 'verb' },
      { sentence: 'Il libro _____ (essere) sul tavolo.', answer: 'è', type: 'verb' },
      { sentence: 'Loro _____ (mangiare) la pizza.', answer: 'mangiano', type: 'verb' }
    ],
    vocab: [
      { it: 'Ciao', he: 'שלום' },
      { it: 'Grazie', he: 'תודה' },
      { it: 'Scusa', he: 'סליחה' },
      { it: 'Acqua', he: 'מים' },
      { it: 'Pane', he: 'לחם' }
    ]
  },
  A2: {
    grammar: [
      { sentence: 'Ieri io _____ (andare) al mare.', answer: 'sono andato/a', type: 'past' },
      { sentence: 'Quando _____ (tu-arrivare)?', answer: 'arrivi', type: 'present' },
      { sentence: 'Noi _____ (mangiare) la pasta.', answer: 'abbiamo mangiato', type: 'past' },
      { sentence: 'Loro _____ (essere) felici.', answer: 'sono', type: 'present' },
      { sentence: 'Se io _____ (avere) tempo, _____ (venire).', answer: 'avessi / verrei', type: 'conditional' }
    ],
    vocab: [
      { it: 'Stazione', he: 'תחנה' },
      { it: 'Biglietto', he: 'כרטיס' },
      { it: 'Albergo', he: 'מלון' },
      { it: 'Ristorante', he: 'מסעדה' },
      { it: 'Museo', he: 'מוזיאון' }
    ]
  },
  B1: {
    grammar: [
      { sentence: 'Se _____ (avere) soldi, _____ (comprare) casa.', answer: 'avessi / comprerei', type: 'conditional' },
      { sentence: 'È importante che tu _____ (studiare).', answer: 'studi', type: 'subjunctive' },
      { sentence: 'Dopo _____ (mangiare), siamo usciti.', answer: 'avere mangiato', type: 'infinitive' },
      { sentence: 'Non credo che lui _____ (venire).', answer: 'venga', type: 'subjunctive' },
      { sentence: 'Quando _____ (loro-tornare)?', answer: 'torneranno', type: 'future' }
    ],
    vocab: [
      { it: 'Appuntamento', he: 'פגישה' },
      { it: 'Contratto', he: 'חוזה' },
      { it: 'Università', he: 'אוניברסיטה' },
      { it: 'Esperienza', he: 'ניסיון' },
      { it: 'Problema', he: 'בעיה' }
    ]
  },
  B2: {
    grammar: [
      { sentence: 'Nonostante _____ (essere) stanco, ha continuato.', answer: 'fosse', type: 'subjunctive' },
      { sentence: 'Sarebbe meglio che tu _____ (andare) via.', answer: 'andassi', type: 'subjunctive' },
      { sentence: '_____ (finire) il lavoro, potrai uscire.', answer: 'Finito / Avendo finito', type: 'participle' },
      { sentence: 'Mi dispiace che loro _____ (non-capire).', answer: 'non capiscano', type: 'subjunctive' },
      { sentence: 'È come se io _____ (conoscere) lui da sempre.', answer: 'conoscessi', type: 'subjunctive' }
    ],
    vocab: [
      { it: 'Inquinamento', he: 'זיהום' },
      { it: 'Disuguaglianza', he: 'אי-שוויון' },
      { it: 'Sviluppo', he: 'פיתוח' },
      { it: 'Ricerca', he: 'מחקר' },
      { it: 'Soluzione', he: 'פתרון' }
    ]
  },
  C1: {
    grammar: [
      { sentence: 'Qualora _____ (piovere), l\'evento _____ (annullare).', answer: 'piovesse / sarebbe annullato', type: 'conditional' },
      { sentence: 'Benché _____ (essere) ricco, vive semplicemente.', answer: 'sia', type: 'subjunctive' },
      { sentence: 'È indispensabile che tutti _____ (collaborare).', answer: 'collaborino', type: 'subjunctive' },
      { sentence: 'Affinché _____ (capire), devo spiegare meglio.', answer: 'tu capisca / si capisca', type: 'subjunctive' },
      { sentence: 'Purché _____ (non-fare) rumore, puoi restare.', answer: 'non faccia', type: 'subjunctive' }
    ],
    vocab: [
      { it: 'Omologazione', he: 'הומוגניזציה/השוואה' },
      { it: 'Precarietà', he: 'ארעיות/חוסר ביטחון' },
      { it: 'Resilienza', he: 'חוסן' },
      { it: 'Interconnessione', he: 'התקשרות הדדית' },
      { it: 'Sostenibilità', he: 'קיימות' }
    ]
  }
};

const EXAM_LIST = [
  { id: 'deli-a2', name: 'DELI-A2', level: 'A2', icon: '🌱', duration: 105 },
  { id: 'dili-b1', name: 'DILI-B1', level: 'B1', icon: '🌿', duration: 145 },
  { id: 'dali-c1', name: 'DALI-C1', level: 'C1', icon: '🌳', duration: 190 },
  { id: 'celi-b2', name: 'CELI 3 (B2)', level: 'B2', icon: '🏛️', duration: 165 },
  { id: 'celi-c1', name: 'CELI 4 (C1)', level: 'C1', icon: '🎓', duration: 205 }
];

const LEVEL_COLORS = { A1: '#4ade80', A2: '#22d3ee', B1: '#7c5cfc', B2: '#f59e0b', C1: '#ef4444', C2: '#ec4899' };

// ═══════════════════════════════════════
// INIT
// ═══════════════════════════════════════
function init(dependencies) {
  _state = dependencies.state;
  _save = dependencies.save;
  _toast = dependencies.toast;
  _Events = dependencies.Events;
  _APP_DATA = dependencies.APP_DATA;
  
  console.log('📝 ExamEngine module initialized');
  return api;
}

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════
function _emit(event, data) {
  if (_Events) _Events.emit('exam:' + event, data);
  window.dispatchEvent(new CustomEvent('exam:' + event, { detail: data }));
}

function getExamHistory() {
  try {
    return JSON.parse(localStorage.getItem('vl_examHistory')) || {};
  } catch { return {}; }
}

function saveExamHistory(history) {
  localStorage.setItem('vl_examHistory', JSON.stringify(history));
}

function recordExamResult(examId, result) {
  const history = getExamHistory();
  if (!history[examId]) history[examId] = [];
  history[examId].push({
    ...result,
    date: new Date().toISOString()
  });
  saveExamHistory(history);
  
  // Also update state for streaks/xp
  if (_state && result.passed) {
    _state.quizHistory = _state.quizHistory || [];
    _state.quizHistory.push({
      exam: examId,
      score: result.score,
      date: new Date().toISOString()
    });
    _save();
  }
}

function clearTimers() {
  if (timer) { clearInterval(timer); timer = null; }
  if (sectionTimer) { clearInterval(sectionTimer); sectionTimer = null; }
}

function formatTime(ms) {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

// ═══════════════════════════════════════
// RENDER — Main Exam List View
// ═══════════════════════════════════════
function render() {
  const container = document.getElementById('examContent');
  if (!container) return;
  
  let activeLevel = 'all';
  
  function renderView() {
    const filtered = activeLevel === 'all'
      ? EXAM_LIST
      : EXAM_LIST.filter(e => e.level === activeLevel);
    
    const examHistory = getExamHistory();
    
    container.innerHTML = `
      <div class="exam-header">
        <h2 class="section-title"><span class="emoji">📝</span> מרכז מבחנים</h2>
        <p style="font-size:.85rem;color:var(--text2);margin-bottom:12px">התכונן למבחני ההסמכה האיטלקיים הרשמיים של AIL Firenze</p>
        
        <div class="exam-level-tabs" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
          ${['all','A1','A2','B1','B2','C1','C2'].map(l => `
            <button class="btn btn-sm ${activeLevel === l ? 'btn-primary' : 'btn-secondary'}" 
              onclick="ExamEngine.setActiveLevel('${l}')">
              ${l === 'all' ? 'הכל' : l}
            </button>
          `).join('')}
        </div>
      </div>
      
      <div class="exam-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">
        ${filtered.map(exam => {
          const examData = EXAM_DATA[exam.id];
          const hist = examHistory[exam.id];
          const best = hist ? Math.max(...hist.map(h => h.score)) : 0;
          const timesTaken = hist ? hist.length : 0;
          const passed = best >= 60;
          const levelColor = LEVEL_COLORS[exam.level] || '#7c5cfc';
          
          return `
          <div class="card exam-card" style="border-left:4px solid ${levelColor}" onclick="ExamEngine.start('${exam.id}')">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
              <div>
                <span style="font-size:2rem">${exam.icon}</span>
                <span style="font-size:.7rem;background:${levelColor};color:white;padding:2px 8px;border-radius:999px;margin-left:8px">${exam.level}</span>
              </div>
              ${passed ? '<span style="font-size:1.5rem">✅</span>' : ''}
            </div>
            <h3 style="font-weight:800;margin-bottom:4px">${exam.name}</h3>
            <p style="font-size:.8rem;color:var(--text2);margin-bottom:8px">${examData?.fullName || ''}</p>
            <div style="font-size:.75rem;color:var(--text3);margin-bottom:12px">
              ⏱️ ${exam.duration} דקות · ${examData?.sections?.length || 0} חלקים
            </div>
            ${timesTaken > 0 ? `
              <div style="display:flex;gap:16px;font-size:.75rem;color:var(--text2);margin-bottom:12px">
                <span>🏆 שיא: ${best}%</span>
                <span>🔄 ${timesTaken} פעמים</span>
              </div>
            ` : ''}
            <div style="display:flex;justify-content:space-between;align-items:center">
              <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();ExamEngine.start('${exam.id}')">
                ${timesTaken > 0 ? '🔁 נבחן שוב' : '🚀 התחל מבחן'}
              </button>
              <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();ExamEngine.startQuickPractice('${exam.level}')">
                🎯 תרגול מהיר
              </button>
            </div>
          </div>
          `;
        }).join('')}
        ${filtered.length === 0 ? '<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">📋</div><div style="color:var(--text3)">אין מבחנים ברמה זו</div></div>' : ''}
      </div>
      
      <div style="margin-top:24px">
        <h3 class="section-title"><span class="emoji">🎯</span> תרגול מהיר לפי רמה</h3>
        <p style="font-size:.8rem;color:var(--text2);margin-bottom:12px">תרגל 5 שאלות קצרות בכל נושא ובכל רמה</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px">
          ${['A1','A2','B1','B2','C1'].map(l => `
            <button class="btn btn-secondary" onclick="ExamEngine.startQuickPractice('${l}')" style="padding:12px">
              ${l} <span style="font-size:.7rem;color:var(--text2)">(${QUICK_PRACTICE[l]?.grammar?.length || 0} שאלות)</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  renderView();
  api.setActiveLevel = (level) => {
    activeLevel = level;
    renderView();
  };
  
  return true;
}

// ═══════════════════════════════════════
// START EXAM
// ═══════════════════════════════════════
function start(examId) {
  const exam = EXAM_DATA[examId];
  if (!exam) { if (_toast) _toast('מבחן לא נמצא', 'error'); return; }
  
  currentExam = exam;
  currentSection = 0;
  currentQuestion = 0;
  answers = {};
  writingAnswers = {};
  examActive = true;
  isQuickPractice = false;
  
  let totalMinutes = 0;
  exam.sections.forEach(s => totalMinutes += s.duration);
  timeRemaining = totalMinutes * 60 * 1000;
  
  showExamIntro();
}

function showExamIntro() {
  const container = document.getElementById('examContent');
  if (!container) return;
  
  const exam = currentExam;
  const totalMinutes = exam.sections.reduce((sum, s) => sum + s.duration, 0);
  
  container.innerHTML = `
    <div style="text-align:center;padding:24px 16px">
      <div style="font-size:3rem;margin-bottom:12px">${exam.icon}</div>
      <h2 style="font-weight:800;margin-bottom:4px">${exam.name}</h2>
      <p style="color:var(--text2);font-size:.9rem">${exam.fullName}</p>
      <p style="color:var(--text3);font-size:.8rem;margin-top:8px">${exam.description}</p>
      
      <div class="card" style="margin:24px 0;text-align:right">
        <div style="font-weight:700;margin-bottom:12px">📋 מבנה המבחן:</div>
        ${exam.sections.map(s => `
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
            <div>
              <div style="font-weight:600">${s.heName}</div>
              <div style="font-size:.7rem;color:var(--text3)">${s.instructions}</div>
            </div>
            <span style="font-size:.7rem;color:var(--text3);font-weight:600">${s.duration}′</span>
          </div>
        `).join('')}
      </div>
      
      <div class="card" style="margin-bottom:20px;background:var(--surface2);text-align:center">
        <div style="font-size:.85rem;color:var(--text2)">⏰ המבחן יכלול טיימר שיעבור אוטומטית לסעיף הבא</div>
        <div style="font-size:.75rem;color:var(--text3);margin-top:4px">סה״כ זמן: ${totalMinutes} דקות</div>
      </div>
      
      <div style="display:flex;gap:12px;justify-content:center">
        <button class="btn btn-secondary btn-sm" onclick="ExamEngine.render()">← חזור</button>
        <button class="btn btn-primary" onclick="ExamEngine.beginExam()">התחל מבחן 🚀</button>
      </div>
    </div>
  `;
}

function beginExam() {
  const container = document.getElementById('examContent');
  if (!container || !currentExam) return;
  
  startSectionTimer();
  startGlobalTimer();
  renderQuestion();
}

function startGlobalTimer() {
  clearTimers();
  timer = setInterval(() => {
    timeRemaining -= 1000;
    updateTimerDisplay();
    if (timeRemaining <= 0) {
      submitExam();
    }
  }, 1000);
}

function startSectionTimer() {
  if (!currentExam) return;
  const section = currentExam.sections[currentSection];
  sectionTimeRemaining = section.duration * 60 * 1000;
  
  sectionTimer = setInterval(() => {
    sectionTimeRemaining -= 1000;
    updateSectionTimerDisplay();
    if (sectionTimeRemaining <= 0) {
      submitSection();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const el = document.getElementById('examGlobalTimer');
  if (el) el.textContent = formatTime(timeRemaining);
}

function updateSectionTimerDisplay() {
  const el = document.getElementById('examSectionTimer');
  if (el) el.textContent = formatTime(sectionTimeRemaining);
}

function renderQuestion() {
  const container = document.getElementById('examContent');
  if (!container || !currentExam) return;
  
  const section = currentExam.sections[currentSection];
  const question = section.questions[currentQuestion];
  const totalQ = section.questions.length;
  const progress = ((currentQuestion) / totalQ) * 100;
  
  let questionHtml = '';
  
  if (question.type === 'truefalse') {
    questionHtml = `
      <div class="card" style="margin-bottom:16px">
        <div style="font-size:.85rem;color:var(--text2);margin-bottom:12px">${question.text}</div>
        ${question.items.map(item => `
          <label style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--surface2);border-radius:var(--radius);margin-bottom:8px;cursor:pointer">
            <input type="radio" name="q_${question.id}_${item.id}" value="true" 
              ${answers[`${question.id}_${item.id}`] === true ? 'checked' : ''}
              onchange="ExamEngine.answer('${question.id}_${item.id}', true)">
            <span style="flex:1;text-align:right">${item.statement}</span>
          </label>
          <label style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--surface2);border-radius:var(--radius);margin-bottom:8px;cursor:pointer">
            <input type="radio" name="q_${question.id}_${item.id}" value="false" 
              ${answers[`${question.id}_${item.id}`] === false ? 'checked' : ''}
              onchange="ExamEngine.answer('${question.id}_${item.id}', false)">
            <span style="flex:1;text-align:right">${item.statement} — לא נכון</span>
          </label>
        `).join('')}
      </div>
    `;
  } else if (question.type === 'multiple') {
    questionHtml = `
      <div class="card" style="margin-bottom:16px">
        <div style="font-size:.9rem;margin-bottom:12px">${question.text}</div>
        <div style="font-weight:700;margin-bottom:12px">${question.question}</div>
        ${question.options.map((opt, i) => `
          <label style="display:block;padding:14px;background:var(--surface2);border-radius:var(--radius);margin-bottom:8px;cursor:pointer;border:2px solid ${answers[question.id] === i ? 'var(--primary)' : 'transparent'}">
            <input type="radio" name="q_${question.id}" value="${i}" 
              ${answers[question.id] === i ? 'checked' : ''}
              onchange="ExamEngine.answer('${question.id}', ${i})" style="display:none">
            ${opt}
          </label>
        `).join('')}
      </div>
    `;
  } else if (question.type === 'fill') {
    questionHtml = `
      <div class="card" style="margin-bottom:16px">
        <div style="font-size:.9rem;margin-bottom:12px">${question.text}</div>
        ${question.items.map(item => `
          <div style="margin-bottom:16px">
            <div style="font-size:.9rem;margin-bottom:8px;direction:ltr">${item.sentence.replace('_____', '<input type="text" id="fill_${item.id}" placeholder="..." style="width:200px;padding:8px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);color:var(--text);font-family:var(--font-it)" oninput="ExamEngine.answer(\'fill_${item.id}\', this.value)">')}</div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (question.type === 'writing') {
    const saved = writingAnswers[question.id] || '';
    questionHtml = `
      <div class="card" style="margin-bottom:16px">
        <div style="font-size:.9rem;margin-bottom:8px">${question.prompt}</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-bottom:12px">
          ${question.options.map(opt => `
            <button type="button" class="btn btn-secondary btn-sm" onclick="ExamEngine.selectWritingTopic('${question.id}', '${opt.replace(/'/g, "\\'")}')">${opt}</button>
          `).join('')}
        </div>
        <textarea id="writing_${question.id}" rows="6" placeholder="כתוב כאן את התשובה שלך באיטלקית..." style="width:100%;padding:12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);color:var(--text);font-family:var(--font-he);resize:vertical" oninput="ExamEngine.answer('writing_${question.id}', this.value)">${saved}</textarea>
        <div style="font-size:.7rem;color:var(--text3);margin-top:8px;direction:ltr">${saved.length} תווים</div>
      </div>
    `;
  } else if (question.type === 'matching') {
    questionHtml = `
      <div class="card" style="margin-bottom:16px">
        <div style="font-size:.85rem;margin-bottom:12px">${question.text}</div>
        ${question.items.map(item => `
          <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--surface2);border-radius:var(--radius);margin-bottom:8px">
            <span style="flex:1;text-align:right">${item.text}</span>
            <select id="match_${item.id}" onchange="ExamEngine.matchSelect('${item.id}', this.value)" style="padding:8px 12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);color:var(--text);font-family:var(--font-he);min-width:100px">
              <option value="">בחר...</option>
              <option value="A" ${answers[`match_${item.id}`] === 'A' ? 'selected' : ''}>A</option>
              <option value="B" ${answers[`match_${item.id}`] === 'B' ? 'selected' : ''}>B</option>
              <option value="C" ${answers[`match_${item.id}`] === 'C' ? 'selected' : ''}>C</option>
              <option value="D" ${answers[`match_${item.id}`] === 'D' ? 'selected' : ''}>D</option>
            </select>
          </div>
        `).join('')}
      </div>
    `;
  } else if (question.type === 'speaking') {
    questionHtml = `
      <div class="card" style="margin-bottom:16px;text-align:center">
        <div style="font-size:3rem;margin-bottom:16px">🎤</div>
        <div style="font-size:1.1rem;font-weight:700;margin-bottom:8px">${question.prompt}</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:16px">
          ${question.topics.map(t => `<span class="btn btn-secondary btn-sm">${t}</span>`).join('')}
        </div>
        <button class="btn btn-primary" onclick="ExamEngine.answer('speaking_${question.id}', true)">✅ סיימתי לדבר</button>
        <div style="font-size:.75rem;color:var(--text3);margin-top:12px">דבר במשך 1-2 דקות, ואז לחץ לסיום</div>
      </div>
    `;
  }
  
  container.innerHTML = `
    <div class="exam-header" style="position:sticky;top:0;z-index:10;background:var(--bg);padding:12px 0;border-bottom:1px solid var(--border)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:1.5rem">${currentExam.icon}</span>
          <div>
            <div style="font-weight:800">${currentExam.name}</div>
            <div style="font-size:.7rem;color:var(--text2)">${currentExam.sections[currentSection].heName} · שאלה ${currentQuestion + 1}/${totalQ}</div>
          </div>
        </div>
        <div style="display:flex;gap:16px;font-size:.8rem;font-family:monospace">
          <span>⏱️ סעיף: <span id="examSectionTimer">${formatTime(sectionTimeRemaining)}</span></span>
          <span>🌐 כללי: <span id="examGlobalTimer">${formatTime(timeRemaining)}</span></span>
        </div>
      </div>
      <div class="progress-bar" style="height:4px"><div class="progress-fill" style="width:${progress}%"></div></div>
    </div>
    
    <div style="padding-bottom:100px">
      ${questionHtml}
      
      <div style="display:flex;gap:12px;justify-content:center;margin-top:24px;padding:0 16px">
        ${currentQuestion > 0 ? '<button class="btn btn-secondary" onclick="ExamEngine.prevQuestion()">← הקודמת</button>' : ''}
        <button class="btn btn-primary" onclick="ExamEngine.nextQuestion()">${currentQuestion < totalQ - 1 ? 'הבאה →' : 'סיים חלק ✓'}</button>
      </div>
    </div>
  `;
  
  // Restore fill inputs
  question.items?.forEach(item => {
    if (item.type === 'fill' || question.type === 'fill') {
      const el = document.getElementById(`fill_${item.id}`);
      if (el && answers[`fill_${item.id}`]) el.value = answers[`fill_${item.id}`];
    }
  });
}

function answer(key, value) {
  answers[key] = value;
}

function selectWritingTopic(examId, topic) {
  writingAnswers[examId] = topic + '\n\n';
  const ta = document.getElementById(`writing_${examId}`);
  if (ta) ta.value = writingAnswers[examId];
}

function matchSelect(key, value) {
  answers[key] = value;
}

function nextQuestion() {
  const section = currentExam.sections[currentSection];
  if (currentQuestion < section.questions.length - 1) {
    currentQuestion++;
    renderQuestion();
  } else {
    submitSection();
  }
}

function prevQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    renderQuestion();
  }
}

function submitSection() {
  clearTimers();
  currentSection++;
  currentQuestion = 0;
  
  if (currentSection >= currentExam.sections.length) {
    submitExam();
  } else {
    if (_toast) _toast('✅ עברת לסעיף הבא!', 'success');
    startSectionTimer();
    renderQuestion();
  }
}

function quitExam() {
  clearTimers();
  currentExam = null;
  examActive = false;
  render();
}

function submitExam() {
  clearTimers();
  
  if (!currentExam) return;
  
  let totalScore = 0;
  let totalQuestions = 0;
  const sectionResults = {};
  
  currentExam.sections.forEach(section => {
    let sectionScore = 0;
    let sectionTotal = 0;
    
    section.questions.forEach(q => {
      if (q.type === 'truefalse') {
        q.items.forEach(item => {
          sectionTotal++;
          if (answers[`${q.id}_${item.id}`] === item.answer) sectionScore++;
        });
      } else if (q.type === 'multiple') {
        sectionTotal++;
        if (answers[q.id] === q.answer) sectionScore++;
      } else if (q.type === 'fill') {
        q.items.forEach(item => {
          sectionTotal++;
          const userAns = (answers[`fill_${item.id}`] || '').toLowerCase().trim();
          const correctAns = item.answer.toLowerCase().trim();
          if (userAns === correctAns) sectionScore++;
        });
      } else if (q.type === 'matching') {
        q.items.forEach(item => {
          sectionTotal++;
          if (answers[`match_${item.id}`] === item.answer) sectionScore++;
        });
      } else if (q.type === 'writing' || q.type === 'speaking') {
        // Writing/speaking are self-assessed for now
        sectionTotal++;
        if (answers[`writing_${q.id}`] || answers[`speaking_${q.id}`]) sectionScore += 0.5; // Partial credit
      }
    });
    
    sectionResults[section.id] = {
      score: sectionTotal > 0 ? Math.round((sectionScore / sectionTotal) * 100) : 0,
      correct: sectionScore,
      total: sectionTotal
    };
    totalScore += sectionScore;
    totalQuestions += sectionTotal;
  });
  
  const overallPct = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
  const passed = overallPct >= 60;
  
  // Award XP
  if (passed && window.Gamification) {
    window.Gamification.addXP(Math.max(10, Math.round(overallPct / 2)), `exam:${currentExam.id}`);
  }
  
  // Record result
  recordExamResult(currentExam.id, {
    score: overallPct,
    passed,
    sections: sectionResults,
    duration: currentExam.duration
  });
  
  showResults(overallPct, passed, sectionResults);
}

function showResults(score, passed, sectionResults) {
  const container = document.getElementById('examContent');
  if (!container) return;
  
  const exam = currentExam;
  currentExam = null;
  examActive = false;
  
  container.innerHTML = `
    <div style="text-align:center;padding:24px 16px">
      <div style="font-size:4rem;margin-bottom:16px">${passed ? '🎉' : '📝'}</div>
      <h2 style="font-weight:800;margin-bottom:8px">${passed ? 'עברת את המבחן!' : 'לא עברת — נסה שוב'}</h2>
      <div style="font-size:3rem;font-weight:900;color:${passed ? 'var(--primary)' : 'var(--error)'};margin:16px 0">${score}%</div>
      <p style="color:var(--text2);margin-bottom:24px">${exam.name} — ${exam.fullName}</p>
      
      <div class="card" style="text-align:right;margin-bottom:24px">
        <div style="font-weight:700;margin-bottom:12px">📊 פירוט לפי חלקים:</div>
        ${Object.entries(sectionResults).map(([sectionId, res]) => {
          const section = exam.sections.find(s => s.id === sectionId);
          return `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span>${section?.heName || sectionId}</span><strong>${res.score}% (${res.correct}/${res.total})</strong></div>`;
        }).join('')}
      </div>
      
      ${passed && window.Gamification ? `
        <div class="card" style="background:linear-gradient(135deg,var(--primary),var(--indigo));color:white;margin-bottom:24px">
          <div style="font-weight:700">🏆 בונוס XP!</div>
          <div style="font-size:1.5rem;margin:8px 0">+${Math.max(10, Math.round(score / 2))} XP</div>
        </div>
      ` : ''}
      
      <div style="display:flex;gap:12px;justify-content:center">
        <button class="btn btn-primary" onclick="ExamEngine.render()">← לרשימת מבחנים</button>
        <button class="btn btn-secondary" onclick="ExamEngine.start('${exam.id}')">🔁 נסה שוב</button>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════
// QUICK PRACTICE
// ═══════════════════════════════════════
function startQuickPractice(level) {
  const practice = QUICK_PRACTICE[level];
  if (!practice) { if (_toast) _toast('סוג תרגול לא נמצא', 'error'); return; }
  
  currentExam = { id: `quick-${level}`, name: `תרגול מהיר ${level}`, icon: '🎯', sections: [] };
  practiceLevel = level;
  practiceType = 'mixed';
  examActive = true;
  isQuickPractice = true;
  currentSection = 0;
  currentQuestion = 0;
  answers = {};
  
  // Build mixed questions: 3 grammar + 2 vocab
  const questions = [
    ...practice.grammar.slice(0, 3).map((q, i) => ({
      id: `qp_${level}_g${i}`,
      type: 'fill',
      text: 'השלם את הפועל:',
      items: [{ id: `qp_${level}_g${i}`, sentence: q.sentence, answer: q.answer }]
    })),
    ...practice.vocab.slice(0, 2).map((v, i) => ({
      id: `qp_${level}_v${i}`,
      type: 'multiple',
      text: `איך אומרים "${v.he}" באיטלקית?`,
      question: '',
      options: [v.it, ...['Opzione A','Opzione B','Opzione C'].slice(0,3)],
      answer: 0
    }))
  ];
  
  currentExam.sections = [{ id: 'mixed', name: 'תרגול מעורב', heName: '🎯 תרגול מהיר', duration: 5, questions }];
  timeRemaining = 5 * 60 * 1000;
  
  beginExam();
}

// ═══════════════════════════════════════
// FORMATION EXERCISES (for conjugation practice)
// ═══════════════════════════════════════
let formationState = { verb: '', tense: '', pronouns: [], answers: {}, current: 0 };

function formationClick(pronoun, form) {
  formationState.answers[pronoun] = form;
  formationState.current = (formationState.current + 1) % formationState.pronouns.length;
  // Re-render would go here
}

function formationClear() {
  formationState.answers = {};
}

function formationSubmit() {
  // Check answers
}

// ═══════════════════════════════════════
// INSERT SENTENCE (for sentence builder integration)
// ═══════════════════════════════════════
function insertSentence(sentence) {
  // For integration with SentBuild
}

// ═══════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════
const api = {
  init,
  render,
  start,
  beginExam,
  answer,
  nextQuestion,
  prevQuestion,
  submitSection,
  quitExam,
  startQuickPractice,
  formationClick,
  formationClear,
  formationSubmit,
  matchSelect,
  insertSentence,
  showResults,
  // Expose data for external use
  EXAM_DATA,
  EXAM_LIST,
  QUICK_PRACTICE,
  LEVEL_COLORS,
  setActiveLevel: (level) => {} // Will be set by render()
};

// Backward compat
window.Exams = api;

return api;

})();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExamEngine;
}