/* ═══════════════════════════════════════════════
   VolaLingo v5 — Exam Simulation System
   Official Italian Certification Preparation
   AIL Firenze: DELI, DILI, DALI + CELI
   ═══════════════════════════════════════════════ */

window.Exams = (() => {

// ═══════════════════════════════════════
// STATE
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
        instructions: 'השלם את התרגילים הדקדוקיים.',
        questions: [
          {
            id: 'delia2_g1',
            type: 'cloze',
            text: 'Completa il testo con le parole della lista.<br><br>“Ciao Maria,<br>come stai? Io _____(1) bene, grazie. Oggi _____(2) una giornata molto bella. Il sole _____(3) caldo e il cielo è azzurro. _____(4) sera vado al cinema con Luca. Lui _____(5) un ragazzo simpatico e _____(6) molto. Domani _____(7) fare una gita al lago con la mia famiglia. _____(8) portare un pranzo al sacco.”',
            wordBank: ['sto', 'è', 'fa', 'Questa', 'è', 'ride', 'vogliamo', 'Dobbiamo', 'sono', 'faccio', 'quella', 'ha', 'canta', 'possiamo', 'andiamo'],
            blanks: [
              { index: 1, answer: 'sto' },
              { index: 2, answer: 'è' },
              { index: 3, answer: 'fa' },
              { index: 4, answer: 'Questa' },
              { index: 5, answer: 'è' },
              { index: 6, answer: 'ride' },
              { index: 7, answer: 'vogliamo' },
              { index: 8, answer: 'Dobbiamo' }
            ]
          },
          {
            id: 'delia2_g2',
            type: 'verbconjugation',
            text: 'Coniuga i verbi tra parentesi al tempo corretto (presente indicativo).',
            items: [
              { sentence: 'Io (parlare) _____ italiano molto bene.', answer: 'parlo', infinitive: 'parlare' },
              { sentence: 'Loro (lavorare) _____ in un ufficio a Roma.', answer: 'lavorano', infinitive: 'lavorare' },
              { sentence: 'Noi (mangiare) _____ sempre insieme la domenica.', answer: 'mangiamo', infinitive: 'mangiare' },
              { sentence: 'Tu (leggere) _____ molti libri di narrativa.', answer: 'leggi', infinitive: 'leggere' },
              { sentence: 'Marco (dormire) _____ fino a tardi il sabato.', answer: 'dorme', infinitive: 'dormire' },
              { sentence: 'Voi (partire) _____ per le vacanze domani.', answer: 'partite', infinitive: 'partire' },
              { sentence: 'Lei (aprire) _____ la finestra ogni mattina.', answer: 'apre', infinitive: 'aprire' }
            ]
          }
        ]
      },
      {
        id: 'listening',
        name: 'Comprensione auditiva',
        heName: '🎧 הבנת הנשמע',
        duration: 20,
        instructions: 'קרא את השאלות ובחר את התשובה הנכונה. (במבחן אמיתי היית שומע הקלטות)',
        questions: [
          {
            id: 'delia2_l1',
            type: 'mc',
            text: 'Dove si trova la persona che parla?<br><br><em>Audio: "Buongiorno, vorrei un caffè e un cornetto, per favore."</em>',
            options: ['Al ristorante', 'Al bar', 'In biblioteca', 'Al supermercato'],
            answer: 'Al bar',
            explanation: 'Al bar si ordinano caffè e cornetti.'
          },
          {
            id: 'delia2_l2',
            type: 'mc',
            text: 'Cosa dice l\'annuncio?<br><br><em>Audio: "Attenzione, il treno regionale 4523 per Bologna è in partenza dal binario 5."</em>',
            options: ['Il treno è in ritardo', 'Il treno parte dal binario 5', 'Il treno è cancellato', 'Il treno arriva a Milano'],
            answer: 'Il treno parte dal binario 5',
            explanation: 'L\'annuncio indica il binario di partenza.'
          },
          {
            id: 'delia2_l3',
            type: 'truefalse',
            text: 'Ascolta e indica se le affermazioni sono vere o false.<br><br><em>Audio: "La galleria degli Uffizi a Firenze è uno dei musei più famosi del mondo. Apre dal martedì alla domenica dalle 8:15 alle 18:50."</em>',
            items: [
              { id: 'l3_tf1', statement: 'Gli Uffizi sono a Firenze.', answer: true },
              { id: 'l3_tf2', statement: 'Il museo apre tutti i giorni.', answer: false },
              { id: 'l3_tf3', statement: 'Il museo chiude alle 18:50.', answer: true }
            ]
          }
        ]
      },
      {
        id: 'speaking',
        name: 'Espressione orale',
        heName: '🎤 הבעה בעל פה',
        duration: 20,
        instructions: 'התכונן לקטעי הדיבור הבאים. במבחן אמיתי, היית צריך לדבר עם בוחן.',
        questions: [
          {
            id: 'delia2_s1',
            type: 'speaking_prompt',
            prompt: 'Presentati. Parla di:',
            items: [
              'Il tuo nome e la tua nazionalità',
              'Dove vivi',
              'Cosa fai nella vita (studio/lavoro)',
              'Perché studi italiano'
            ],
            modelAnswer: 'Mi chiamo Marco, sono italiano ma vivo all\'estero. Studio economia all\'università e lavoro part-time in un ristorante. Studio italiano perché voglio parlare con la mia famiglia.'
          },
          {
            id: 'delia2_s2',
            type: 'speaking_prompt',
            prompt: 'Descrivi questa foto immaginaria: una persona in cucina che prepara la pasta. Parla di:',
            items: [
              'Cosa vedi nella foto',
              'Cosa sta facendo la persona',
              'Ti piace cucinare?',
              'Qual è il tuo piatto preferito?'
            ],
            modelAnswer: 'Nella foto vedo una donna in cucina. Sta preparando la pasta al pomodoro. La cucina è luminosa. Mi piace molto cucinare, soprattutto i dolci. Il mio piatto preferito è la carbonara.'
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
    icon: '🌳',
    duration: 160,
    description: 'מבחן ברמה בינונית. מתאים ללומדים עצמאיים.',
    sections: [
      {
        id: 'reading',
        name: 'Comprensione scritta',
        heName: '📖 הבנת הנקרא',
        duration: 30,
        instructions: 'קרא את הטקסטים ובחר את התשובה הנכונה.',
        questions: [
          {
            id: 'dilib1_r1',
            type: 'mc',
            text: 'Leggi il testo:<br><br><em>"Il turismo sostenibile sta diventando sempre più popolare in Italia. Secondo un rapporto dell\'ENIT, il 40% dei turisti stranieri sceglie destinazioni che rispettano l\'ambiente. Le regioni più apprezzate per il turismo verde sono la Toscana, l\'Umbria e le Marche. Queste regioni offrono percorsi naturalistici, agriturismi e prodotti tipici locali. Il turista sostenibile cerca esperienze autentiche, come partecipare alla vendemmia o imparare a fare il formaggio."</em><br><br>1. Secondo il testo, il turismo sostenibile:',
            options: ['È in declino in Italia', 'È sempre più popolare', 'Interessa solo gli italiani', 'È limitato alla Toscana'],
            answer: 'È sempre più popolare',
            explanation: 'Il testo dice "sta diventando sempre più popolare".'
          },
          {
            id: 'dilib1_r2',
            type: 'mc',
            text: '2. Quale percentuale di turisti sceglie destinazioni eco-sostenibili?',
            options: ['20%', '30%', '40%', '50%'],
            answer: '40%',
            explanation: 'Il rapporto ENIT indica il 40%.'
          },
          {
            id: 'dilib1_r3',
            type: 'mc',
            text: '3. Cosa cerca il turista sostenibile?',
            options: ['Grandi alberghi di lusso', 'Esperienze autentiche', 'Shopping nelle città', 'Spiagge affollate'],
            answer: 'Esperienze autentiche',
            explanation: 'Il testo menziona "esperienze autentiche".'
          },
          {
            id: 'dilib1_r4',
            type: 'mc',
            text: '4. Leggi il testo:<br><br><em>"La dieta mediterranea è stata riconosciuta dall\'UNESCO come patrimonio culturale immateriale dell\'umanità. Questa dieta, tipica dell\'Italia e di altri paesi del Mediterraneo, si basa sul consumo di olio d\'oliva, frutta, verdura, cereali e pesce. Recenti studi dimostrano che seguire la dieta mediterranea riduce il rischio di malattie cardiovascolari del 30%."</em><br><br>La dieta mediterranea è stata riconosciuta dall\'UNESCO perché:',
            options: ['È la dieta più seguita al mondo', 'È un patrimonio culturale immateriale', 'È stata inventata in Italia', 'È una dieta per dimagrire'],
            answer: 'È un patrimonio culturale immateriale',
            explanation: 'L\'UNESCO l\'ha riconosciuta come patrimonio culturale immateriale.'
          },
          {
            id: 'dilib1_r5',
            type: 'mc',
            text: '5. Secondo gli studi, la dieta mediterranea:',
            options: ['Aumenta il peso corporeo', 'Riduce il rischio di malattie cardiovascolari', 'È costosa da seguire', 'Richiede cibi importati'],
            answer: 'Riduce il rischio di malattie cardiovascolari',
            explanation: 'Gli studi mostrano una riduzione del 30% del rischio.'
          }
        ]
      },
      {
        id: 'writing',
        name: 'Espressione scritta',
        heName: '✍️ הבעה בכתב',
        duration: 60,
        instructions: 'בחר נושא אחד וכתוב חיבור של 120-160 מילים באיטלקית.',
        questions: [
          {
            id: 'dilib1_w1',
            type: 'writing',
            prompt: 'Scegli uno dei seguenti titoli e scrivi un testo di 120-160 parole:',
            options: [
              'Un\'esperienza che mi ha cambiato',
              'L\'importanza dell\'amicizia nella mia vita',
              'Il mio rapporto con la tecnologia',
              'Un viaggio che non dimenticherò mai',
              'La mia città ideale'
            ],
            modelAnswer: 'Un\'esperienza che mi ha cambiato è stato il mio primo viaggio all\'estero da solo. Avevo 18 anni e sono andato a Londra per studiare inglese per un mese. All\'inizio avevo paura di non riuscire a comunicare, ma dopo qualche giorno ho iniziato a sentirmi più sicuro. Ho conosciuto persone di tutto il mondo e ho imparato molto sulla loro cultura. Questa esperienza mi ha insegnato l\'importanza di uscire dalla propria zona di comfort.'
          }
        ]
      },
      {
        id: 'grammar',
        name: 'Lessico e strutture grammaticali',
        heName: '📝 דקדוק ואוצר מילים',
        duration: 30,
        instructions: 'השלם את התרגילים הבאים.',
        questions: [
          {
            id: 'dilib1_g1',
            type: 'mc',
            text: 'Scegli l\'opzione corretta per completare la frase:<br><br>Se _____ più tempo, viaggerei di più.',
            options: ['avrei', 'ho', 'avessi', 'avevo'],
            answer: 'avessi',
            explanation: 'Il periodo ipotetico di secondo tipo richiede il congiuntivo imperfetto.'
          },
          {
            id: 'dilib1_g2',
            type: 'mc',
            text: '_____ parlato con lui se lo avessi incontrato.',
            options: ['Avrei', 'Ho', 'Abbiamo', 'Avrò'],
            answer: 'Avrei',
            explanation: 'Condizionale passato per il periodo ipotetico di terzo tipo.'
          },
          {
            id: 'dilib1_g3',
            type: 'mc',
            text: 'Non penso che loro _____ già arrivati.',
            options: ['sono', 'erano', 'siano', 'saranno'],
            answer: 'siano',
            explanation: 'Dopo "penso che" si usa il congiuntivo.'
          },
          {
            id: 'dilib1_g4',
            type: 'mc',
            text: 'È il libro più interessante che io _____ mai letto.',
            options: ['ho', 'abbia', 'avevo', 'avrò'],
            answer: 'abbia',
            explanation: 'Superlativo relativo richiede il congiuntivo.'
          },
          {
            id: 'dilib1_g5',
            type: 'sentenceformation',
            text: 'Forma una frase corretta con queste parole:',
            words: ['Oggi', 'al cinema', 'vado', 'con i miei amici', 'un film', 'vedere'],
            answer: 'Oggi vado al cinema con i miei amici a vedere un film',
            acceptMultiple: true
          },
          {
            id: 'dilib1_g6',
            type: 'sentenceformation',
            text: 'Forma una frase corretta:',
            words: ['Se', 'tempo', 'avessi', 'farei', 'più', 'un viaggio'],
            answer: 'Se avessi più tempo farei un viaggio',
            acceptMultiple: true
          },
          {
            id: 'dilib1_g7',
            type: 'cloze',
            text: 'Completa con le parole della lista.<br><br>"La settimana scorsa io e i miei amici _____(1) organizzato una festa a sorpresa per il compleanno di Luca. _____(2) comprato torta, palloncini e regali. Quando lui _____(3) arrivato, _____(4) rimasto molto sorpreso. _____(5) abbiamo ballato e mangiato fino a tardi."',
            wordBank: ['abbiamo', 'abbiamo', 'è', 'è', 'Poi', 'avevamo', 'era', 'siamo', 'dopo', 'hanno'],
            blanks: [
              { index: 1, answer: 'abbiamo' },
              { index: 2, answer: 'Abbiamo' },
              { index: 3, answer: 'è' },
              { index: 4, answer: 'è' },
              { index: 5, answer: 'Poi' }
            ]
          },
          {
            id: 'dilib1_g8',
            type: 'verbconjugation',
            text: 'Coniuga i verbi al passato prossimo o all\'imperfetto.',
            items: [
              { sentence: 'Ieri io (andare) _____ al mare con gli amici.', answer: 'sono andato', infinitive: 'andare' },
              { sentence: 'Mentre (io-guardare) _____ la TV, è squillato il telefono.', answer: 'guardavo', infinitive: 'guardare' },
              { sentence: 'Loro (finire) _____ di lavorare alle sei.', answer: 'hanno finito', infinitive: 'finire' },
              { sentence: 'Da bambini noi (giocare) _____ sempre in cortile.', answer: 'giocavamo', infinitive: 'giocare' }
            ]
          }
        ]
      },
      {
        id: 'listening',
        name: 'Comprensione auditiva',
        heName: '🎧 הבנת הנשמע',
        duration: 40,
        instructions: 'קרא את השאלות ובחר את התשובה הנכונה.',
        questions: [
          {
            id: 'dilib1_l1',
            type: 'mc',
            text: 'Ascolta il dialogo. Dove lavora la donna?<br><br><em>Audio: "Lavoro in una scuola media, insegno matematica ai ragazzi di prima e seconda."</em>',
            options: ['In un ufficio', 'In una scuola', 'In un ospedale', 'In un ristorante'],
            answer: 'In una scuola',
            explanation: 'La donna dice "lavoro in una scuola media".'
          },
          {
            id: 'dilib1_l2',
            type: 'mc',
            text: 'Cosa pensa l\'uomo della nuova legge?<br><br><em>Audio: "Secondo me, questa nuova legge sul lavoro è un passo avanti. Finalmente ci saranno più tutele per i lavoratori part-time."</em>',
            options: ['È contraria alla legge', 'Pensa che sia un passo avanti', 'Non ha un\'opinione', 'La legge è troppo severa'],
            answer: 'Pensa che sia un passo avanti',
            explanation: 'Dice chiaramente "è un passo avanti".'
          },
          {
            id: 'dilib1_l3',
            type: 'mc',
            text: 'Cosa è successo a Marco?<br><br><em>Audio: "Marco ha avuto un incidente in macchina ieri sera. Niente di grave, per fortuna. È solo un po\' spaventato."</em>',
            options: ['Ha vinto la lotteria', 'Ha avuto un incidente', 'Ha comprato una macchina', 'È partito per le vacanze'],
            answer: 'Ha avuto un incidente',
            explanation: 'L\'audio dice chiaramente "ha avuto un incidente".'
          }
        ]
      },
      {
        id: 'speaking',
        name: 'Esame orale',
        heName: '🎤 הבעה בעל פה',
        duration: 30,
        instructions: 'התכונן לשאלות הבאות. במבחן אמיתי תדבר עם בוחן.',
        questions: [
          {
            id: 'dilib1_s1',
            type: 'speaking_prompt',
            prompt: 'Presentati e parla di:',
            items: [
              'Chi sei e cosa fai',
              'I tuoi hobby e interessi',
              'Perché studi italiano',
              'I tuoi progetti per il futuro'
            ],
            modelAnswer: 'Mi chiamo Anna, ho 25 anni e faccio la traduttrice. Nel tempo libero mi piace leggere romanzi e fare yoga. Studio italiano perché amo la cultura italiana e vorrei lavorare a Roma un giorno.'
          },
          {
            id: 'dilib1_s2',
            type: 'speaking_prompt',
            prompt: 'Leggi e commenta: "Vivere in città o in campagna? Argomenta la tua preferenza."',
            items: [
              'Dove preferisci vivere?',
              'Vantaggi e svantaggi della città',
              'Vantaggi e svantaggi della campagna',
              'La tua scelta personale'
            ],
            modelAnswer: 'Preferisco vivere in città perché ci sono più opportunità di lavoro e di svago. La città offre musei, teatri, ristoranti e una vita sociale più attiva. Tuttavia, la campagna ha i suoi vantaggi: aria pulita, tranquillità e contatto con la natura. Per ora scelgo la città, ma in futuro mi piacerebbe avere una casa in campagna per i weekend.'
          }
        ]
      }
    ]
  },

  'dili-b2': {
    id: 'dili-b2',
    name: 'DILI-B2',
    fullName: 'Diploma Intermedio di Lingua Italiana — B2',
    level: 'B2',
    icon: '🏛️',
    duration: 180,
    description: 'מבחן ברמה בינונית-גבוהה. למתקדמים עצמאיים.',
    sections: [
      {
        id: 'reading',
        name: 'Comprensione scritta',
        heName: '📖 הבנת הנקרא',
        duration: 40,
        instructions: 'קרא את הטקסט וענה על השאלות.',
        questions: [
          {
            id: 'dilib2_r1',
            type: 'mc',
            text: 'Leggi il testo:<br><br><em>"L\'arte della ceramica italiana ha una tradizione millenaria. Ogni regione ha sviluppato uno stile unico: la maiolica di Faenza, la porcellana di Capodimonte, il terracotta di Montelupo. Oggi, molti giovani artigiani stanno riscoprendo queste tecniche antiche, fondendole con design contemporaneo. A Bologna, un laboratorio chiamato "Ceramiche creative" offre corsi per principianti e professionisti, contribuendo a mantenere viva questa tradizione."</em><br><br>1. Il testo parla principalmente di:',
            options: ['Design moderno', 'Ceramica italiana tradizionale', 'Turismo in Italia', 'Scuole d\'arte'],
            answer: 'Ceramica italiana tradizionale',
            explanation: 'Il testo descrive la tradizione ceramica italiana.'
          },
          {
            id: 'dilib2_r2',
            type: 'mc',
            text: '2. Cosa stanno facendo molti giovani artigiani secondo il testo?',
            options: ['Abbandonano la ceramica', 'Mescolano tecniche antiche con design moderno', 'Copiano stili stranieri', 'Lavorano solo all\'estero'],
            answer: 'Mescolano tecniche antiche con design moderno',
            explanation: 'Il testo dice "fondendole con design contemporaneo".'
          },
          {
            id: 'dilib2_r3',
            type: 'matching',
            text: 'Abbina ogni descrizione al tipo di ceramica corrispondente:',
            leftItems: [
              { id: 'm1', text: 'Prodotta a Napoli, nota per la sua finezza' },
              { id: 'm2', text: 'Tipica di Faenza, decorata a mano' },
              { id: 'm3', text: 'Di Montelupo, colore caldo e terra' }
            ],
            rightItems: [
              { id: 'm1_ans', text: 'Porcellana di Capodimonte', matchId: 'm1' },
              { id: 'm2_ans', text: 'Maiolica di Faenza', matchId: 'm2' },
              { id: 'm3_ans', text: 'Terracotta di Montelupo', matchId: 'm3' }
            ]
          }
        ]
      },
      {
        id: 'writing',
        name: 'Espressione scritta',
        heName: '✍️ הבעה בכתב',
        duration: 70,
        instructions: 'בחר נושא אחד וכתוב חיבור של 150-200 מילים.',
        questions: [
          {
            id: 'dilib2_w1',
            type: 'writing',
            prompt: 'Scegli uno dei seguenti titoli e scrivi un testo di 150-200 parole:',
            options: [
              'Il valore del tempo per sé stessi',
              'Fine anno: bilanci e progetti',
              'Arte e artigianato nella società moderna',
              'La tecnologia ha migliorato le nostre vite?',
              'Il ruolo della musica nella nostra cultura'
            ],
            modelAnswer: 'Il valore del tempo per sé stessi è un tema molto attuale nella nostra società frenetica. Spesso siamo così impegnati tra lavoro, famiglia e impegni sociali che dimentichiamo l\'importanza di dedicare del tempo a noi stessi. Il tempo per sé stessi non è egoismo, ma una necessità per mantenere l\'equilibrio mentale e fisico. Che sia leggere un libro, fare una passeggiata o semplicemente non fare nulla, questi momenti ci aiutano a ricaricare le energie e a riflettere sulla nostra vita.'
          }
        ]
      },
      {
        id: 'grammar',
        name: 'Lessico e strutture grammaticali',
        heName: '📝 דקדוק',
        duration: 40,
        instructions: 'השלם את התרגילים הבאים.',
        questions: [
          {
            id: 'dilib2_g1',
            type: 'cloze',
            text: 'Completa il testo con le parole appropriate.<br><br>"La città di Venezia _____(1) famosa in tutto il mondo per i suoi canali e la sua storia. Ogni anno milioni di turisti _____(2) visitano per ammirare Piazza San Marco e il Ponte di Rialto. _____(3) degli ultimi anni, però, il turismo di massa _____(4) creato diversi problemi: l\'inquinamento, l\'aumento dei prezzi e la difficoltà per i residenti di _____(5) una vita normale."',
            wordBank: ['è', 'la', 'Negli', 'ha', 'fare', 'sono', 'ci', 'Nei', 'vive', 'hanno'],
            blanks: [
              { index: 1, answer: 'è' },
              { index: 2, answer: 'la' },
              { index: 3, answer: 'Negli' },
              { index: 4, answer: 'ha' },
              { index: 5, answer: 'fare' }
            ]
          },
          {
            id: 'dilib2_g2',
            type: 'verbconjugation',
            text: 'Coniuga i verbi al tempo e modo appropriati.',
            items: [
              { sentence: 'Prima di (partire) _____, devo fare le valigie.', answer: 'partire', infinitive: 'partire' },
              { sentence: 'Se (io-sapere) _____ la verità, ti avrei detto tutto.', answer: 'avessi saputo', infinitive: 'sapere' },
              { sentence: 'È importante che tu (studiare) _____ ogni giorno.', answer: 'studi', infinitive: 'studiare' },
              { sentence: 'Quando (loro-arrivare) _____ a Roma, visiteranno il Colosseo.', answer: 'arriveranno', infinitive: 'arrivare' },
              { sentence: 'Nonostante (piovvere) _____, siamo usciti lo stesso.', answer: 'piovesse', infinitive: 'piovere' }
            ]
          },
          {
            id: 'dilib2_g3',
            type: 'mc',
            text: 'Scegli l\'opzione corretta:<br><br>Il libro _____ mi hai prestato è molto interessante.',
            options: ['che', 'chi', 'cui', 'quale'],
            answer: 'che',
            explanation: '"Che" è il pronome relativo corretto per complemento oggetto.'
          },
          {
            id: 'dilib2_g4',
            type: 'mc',
            text: 'La casa _____ finestre danno sul mare è molto costosa.',
            options: ['di cui', 'che', 'le cui', 'della quale'],
            answer: 'le cui',
            explanation: '"Le cui" indica possesso (le finestre della casa).'
          },
          {
            id: 'dilib2_g5',
            type: 'mc',
            text: '_____ della crisi, l\'azienda ha continuato a crescere.',
            options: ['Nonostante', 'Sebbene', 'Malgrado', 'Benché'],
            answer: 'Nonostante',
            explanation: '"Nonostante" + sostantivo è la forma corretta.'
          }
        ]
      },
      {
        id: 'listening',
        name: 'Comprensione auditiva',
        heName: '🎧 הבנת הנשמע',
        duration: 40,
        instructions: 'קרא וענה על השאלות.',
        questions: [
          {
            id: 'dilib2_l1',
            type: 'mc',
            text: 'Cosa dice l\'intervistato riguardo al cambiamento climatico?<br><br><em>Audio: "Il cambiamento climatico è una delle sfide più urgenti del nostro tempo. Le temperature globali continuano ad aumentare e gli eventi meteorologici estremi sono sempre più frequenti. È necessario agire ora, riducendo le emissioni di CO2 e investendo nelle energie rinnovabili."</em>',
            options: ['Il clima non sta cambiando', 'Bisogna agire subito', 'Le energie rinnovabili sono costose', 'Il problema non è urgente'],
            answer: 'Bisogna agire subito',
            explanation: 'Dice "È necessario agire ora".'
          },
          {
            id: 'dilib2_l2',
            type: 'mc',
            text: 'Qual è l\'opinione della giornalista sull\'intelligenza artificiale?<br><br><em>Audio: "L\'intelligenza artificiale sta rivoluzionando molti settori, dalla medicina all\'industria. Tuttavia, dobbiamo essere consapevoli dei rischi etici che comporta, come la privacy e la perdita di posti di lavoro."</em>',
            options: ['È solo positiva', 'Ha aspetti positivi ma anche rischi', 'È pericolosa e va fermata', 'Non ha nessun impatto'],
            answer: 'Ha aspetti positivi ma anche rischi',
            explanation: 'Parla di rivoluzione ma anche di rischi etici.'
          }
        ]
      },
      {
        id: 'speaking',
        name: 'Esame orale',
        heName: '🎤 הבעה בעל פה',
        duration: 30,
        instructions: 'התכונן לנושאים הבאים לדיון בעל פה.',
        questions: [
          {
            id: 'dilib2_s1',
            type: 'speaking_prompt',
            prompt: 'Parla di un argomento a tua scelta tra questi:',
            items: [
              'I vantaggi e gli svantaggi dei social media',
              'L\'importanza della lettura nell\'era digitale',
              'Il ruolo dello sport nella società',
              'Come dovrebbe essere una città ideale'
            ],
            modelAnswer: 'Penso che i social media abbiano sia vantaggi che svantaggi. Da un lato ci permettono di rimanere in contatto con amici lontani e di accedere a informazioni in tempo reale. Dall\'altro lato, possono creare dipendenza e influenzare negativamente la nostra autostima, soprattutto nei giovani. È importante usarli con consapevolezza e moderazione.'
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
    icon: '🎓',
    duration: 240,
    description: 'מבחן ברמה מתקדמת. למשתמשים שוטפים בשפה.',
    sections: [
      {
        id: 'reading',
        name: 'Comprensione scritta',
        heName: '📖 הבנת הנקרא',
        duration: 45,
        instructions: 'קרא בעיון את הטקסטים וענה על השאלות.',
        questions: [
          {
            id: 'dalic1_r1',
            type: 'mc',
            text: 'Leggi il testo:<br><br><em>"La globalizzazione ha profondamente trasformato il mercato del lavoro negli ultimi decenni. Se da un lato ha creato nuove opportunità professionali e facilitato la circolazione dei talenti, dall\'altro ha accentuato le disuguaglianze e reso più precarie molte posizioni lavorative. Secondo un recente studio dell\'OCSE, i lavoratori con competenze digitali avanzate guadagnano in media il 25% in più rispetto a quelli che non possiedono tali competenze. Questo divario, noto come "digital divide", rappresenta una delle sfide principali per i governi contemporanei."</em><br><br>1. Secondo il testo, la globalizzazione ha:',
            options: ['Solo effetti positivi sul lavoro', 'Effetti contrastanti sul mercato del lavoro', 'Eliminato le disuguaglianze', 'Ridotto le opportunità professionali'],
            answer: 'Effetti contrastanti sul mercato del lavoro',
            explanation: 'Il testo menziona sia opportunità che problemi.'
          },
          {
            id: 'dalic1_r2',
            type: 'mc',
            text: '2. Cosa indica il termine "digital divide"?',
            options: ['La differenza di guadagno tra chi ha competenze digitali e chi no', 'La divisione geografica di internet', 'Un tipo di software aziendale', 'La separazione tra lavoro e tecnologia'],
            answer: 'La differenza di guadagno tra chi ha competenze digitali e chi no',
            explanation: 'Il testo lo definisce come divario di guadagno.'
          },
          {
            id: 'dalic1_r3',
            type: 'mc',
            text: '3. Quale percentuale di guadagno in più hanno i lavoratori con competenze digitali?',
            options: ['15%', '20%', '25%', '30%'],
            answer: '25%',
            explanation: 'Lo studio OCSE indica il 25%.'
          },
          {
            id: 'dalic1_r4',
            type: 'mc',
            text: 'Leggi il testo:<br><br><em>"Il fenomeno dello spopolamento delle aree interne italiane rappresenta una delle emergenze demografiche più significative del paese. Negli ultimi cinquant\'anni, oltre tremila comuni hanno perso più della metà della loro popolazione. Le cause principali includono la mancanza di servizi essenziali, le limitate opportunità di lavoro e l\'invecchiamento della popolazione. Diverse iniziative, come i progetti di "restanza" e il turismo lento, stanno cercando di invertire questa tendenza."</em><br><br>4. Qual è una delle cause dello spopolamento menzionata nel testo?',
            options: ['L\'eccesso di servizi', 'La mancanza di opportunità di lavoro', 'Il clima freddo', 'L\'eccessiva urbanizzazione'],
            answer: 'La mancanza di opportunità di lavoro',
            explanation: 'Il testo elenca "limitate opportunità di lavoro".'
          },
          {
            id: 'dalic1_r5',
            type: 'mc',
            text: '5. Cosa sono i progetti di "restanza"?',
            options: ['Progetti per spostare le persone in città', 'Iniziative per rimanere nelle aree interne', 'Programmi di pensionamento anticipato', 'Piani di costruzione di nuove autostrade'],
            answer: 'Iniziative per rimanere nelle aree interne',
            explanation: 'Il termine "restanza" suggerisce l\'idea di rimanere.'
          },
          {
            id: 'dalic1_r6',
            type: 'mc',
            text: '6. Quanti comuni hanno perso più della metà della popolazione?',
            options: ['Mille', 'Duemila', 'Tremila', 'Cinquemila'],
            answer: 'Tremila',
            explanation: 'Il testo dice "oltre tremila comuni".'
          }
        ]
      },
      {
        id: 'writing',
        name: 'Espressione scritta',
        heName: '✍️ הבעה בכתב',
        duration: 90,
        instructions: 'בחר משימה אחת וכתוב 200-250 מילים.',
        questions: [
          {
            id: 'dalic1_w1',
            type: 'writing',
            prompt: 'Scegli uno dei seguenti compiti:',
            options: [
              'Composizione: "Il ruolo della cultura nell\'integrazione europea"',
              'Rispondi a una lettera formale in cui un\'azienda ti chiede un parere sulla sostenibilità ambientale',
              'Scrivi un articolo di opinione sul tema "Tecnologia e privacy: fino a che punto?"'
            ],
            modelAnswer: 'Il ruolo della cultura nell\'integrazione europea è fondamentale ma spesso sottovalutato. L\'Unione Europea non è solo un progetto economico e politico, ma anche un\'entità culturale che unisce popoli con storie e tradizioni diverse. Programmi come Erasmus+ hanno permesso a milioni di giovani di conoscere altre culture europee, creando un senso di appartenenza comune. Tuttavia, c\'è ancora molto da fare per promuovere un dialogo culturale autentico che vada oltre gli stereotipi nazionali.'
          }
        ]
      },
      {
        id: 'grammar',
        name: 'Lessico e strutture grammaticali',
        heName: '📝 דקדוק מתקדם',
        duration: 45,
        instructions: 'השלם את התרגילים. שים לב לשימוש בזמנים ובמבנים תחביריים מורכבים.',
        questions: [
          {
            id: 'dalic1_g1',
            type: 'cloze',
            text: 'Completa il testo con le parole appropriate.<br><br>"Se il governo _____(1) approvato la legge prima, molte _____(2) state le conseguenze positive per l\'ambiente. _____(3) non sia facile trovare un accordo, è fondamentale che tutte le parti _____(4) collaborino. I cittadini, dal canto loro, _____(5) pronti a fare la loro parte, come dimostrano i dati sul riciclo."',
            wordBank: ['avesse', 'sarebbero', 'Benché', 'Inoltre', 'sembrano', 'potrebbero', 'Sebbene', 'erano', 'fossero', 'oltre'],
            blanks: [
              { index: 1, answer: 'avesse' },
              { index: 2, answer: 'sarebbero' },
              { index: 3, answer: 'Benché' },
              { index: 4, answer: 'Inoltre' },
              { index: 5, answer: 'sembrano' }
            ]
          },
          {
            id: 'dalic1_g2',
            type: 'verbconjugation',
            text: 'Coniuga i verbi al tempo e modo appropriati (congiuntivo, condizionale, forme implicite).',
            items: [
              { sentence: 'Benché (lui-avere) _____ studiato molto, non ha superato l\'esame.', answer: 'abbia', infinitive: 'avere' },
              { sentence: 'Senza il tuo aiuto, non (noi-finire) _____ mai il progetto in tempo.', answer: 'avremmo finito', infinitive: 'finire' },
              { sentence: 'Pur (essere) _____ stanco, ha continuato a lavorare fino a tardi.', answer: 'essendo', infinitive: 'essere' },
              { sentence: 'È probabile che loro (arrivare) _____ in ritardo a causa del traffico.', answer: 'arrivino', infinitive: 'arrivare' },
              { sentence: 'Vorrei che tu mi (dire) _____ la verità una volta per tutte.', answer: 'dicessi', infinitive: 'dire' }
            ]
          },
          {
            id: 'dalic1_g3',
            type: 'mc',
            text: 'Scegli l\'opzione corretta per completare la frase:<br><br>_____ il maltempo, la manifestazione si è svolta regolarmente.',
            options: ['Nonostante', 'Sebbene', 'Benché', 'Malgrado che'],
            answer: 'Nonostante',
            explanation: '"Nonostante" + sostantivo è corretto.'
          },
          {
            id: 'dalic1_g4',
            type: 'mc',
            text: 'È un problema _____ soluzione non è ancora stata trovata.',
            options: ['di cui', 'la cui', 'che', 'del quale'],
            answer: 'la cui',
            explanation: 'Pronome relativo possessivo concordato con "soluzione".'
          },
          {
            id: 'dalic1_g5',
            type: 'mc',
            text: '_____ tutto quello che hai fatto per me, ti sarò sempre grato.',
            options: ['A causa di', 'Per', 'Grazie a', 'Nonostante'],
            answer: 'Per',
            explanation: '"Per" introduce la causa in questa costruzione.'
          },
          {
            id: 'dalic1_g6',
            type: 'sentenceformation',
            text: 'Trasforma la frase mantenendo lo stesso significato:<br><br>"Il professore ha spiegato la lezione in modo così chiaro che tutti hanno capito."<br><br>Inizia con: "La lezione è stata spiegata..."',
            words: ['La lezione', 'stata', 'spiegata', 'dal professore', 'in modo così chiaro', 'che tutti hanno capito'],
            answer: 'La lezione è stata spiegata dal professore in modo così chiaro che tutti hanno capito',
            acceptMultiple: false
          }
        ]
      },
      {
        id: 'listening',
        name: 'Comprensione auditiva',
        heName: '🎧 הבנת הנשמע',
        duration: 60,
        instructions: 'קרא וענה על השאלות.',
        questions: [
          {
            id: 'dalic1_l1',
            type: 'mc',
            text: 'Ascolta l\'intervista. Cosa pensa l\'esperto del futuro dell\'istruzione?<br><br><em>Audio: "L\'istruzione del futuro sarà sempre più personalizzata. Con l\'aiuto dell\'intelligenza artificiale, ogni studente potrà seguire un percorso di apprendimento su misura, adattato ai propri ritmi e interessi. Tuttavia, il ruolo del docente rimarrà fondamentale come guida e mentore."</em>',
            options: ['L\'IA sostituirà completamente i docenti', 'L\'istruzione sarà personalizzata ma i docenti resteranno importanti', 'L\'istruzione non cambierà molto', 'Tutti gli studenti avranno lo stesso percorso'],
            answer: 'L\'istruzione sarà personalizzata ma i docenti resteranno importanti',
            explanation: 'Parla di personalizzazione ma sottolinea che il docente rimane fondamentale.'
          },
          {
            id: 'dalic1_l2',
            type: 'mc',
            text: 'Secondo l\'intervistato, qual è il principale problema delle città moderne?<br><br><em>Audio: "Le città moderne soffrono di un problema crescente di isolamento sociale. Nonostante la densità abitativa, le persone interagiscono sempre meno tra loro. Gli spazi pubblici vengono spesso progettati per il consumo piuttosto che per l\'incontro."</em>',
            options: ['L\'inquinamento atmosferico', 'L\'isolamento sociale', 'Il costo della vita', 'Il traffico'],
            answer: 'L\'isolamento sociale',
            explanation: 'Il testo dice "soffrono di isolamento sociale".'
          }
        ]
      },
      {
        id: 'speaking',
        name: 'Esame orale',
        heName: '🎤 הבעה בעל פה',
        duration: 35,
        instructions: 'התכונן לנושאים הבאים לדיון מתקדם.',
        questions: [
          {
            id: 'dalic1_s1',
            type: 'speaking_prompt',
            prompt: 'Prepara una presentazione su uno dei seguenti temi (3-4 minuti):',
            items: [
              'L\'impatto dell\'intelligenza artificiale sul mondo del lavoro',
              'Il ruolo dell\'Italia nella promozione del patrimonio culturale mondiale',
              'La sostenibilità ambientale: mito o realtà?',
              'Il fenomeno dell\'emigrazione giovanile dall\'Italia'
            ],
            modelAnswer: 'L\'impatto dell\'intelligenza artificiale sul mondo del lavoro è un tema complesso. Da un lato, l\'IA automatizza processi ripetitivi, aumentando l\'efficienza produttiva. Dall\'altro, solleva questioni etiche riguardanti la privacy, la responsabilità delle decisioni automatizzate e il futuro dell\'occupazione. Secondo molti esperti, l\'IA non eliminerà il lavoro umano ma lo trasformerà, richiedendo nuove competenze e una continua formazione.'
          }
        ]
      }
    ]
  },

  'dali-c2': {
    id: 'dali-c2',
    name: 'DALI-C2',
    fullName: 'Diploma Avanzato di Lingua Italiana — C2',
    level: 'C2',
    icon: '👑',
    duration: 280,
    description: 'מבחן ברמת שליטה מלאה. הרמה הגבוהה ביותר.',
    sections: [
      {
        id: 'reading',
        name: 'Comprensione scritta',
        heName: '📖 הבנת הנקרא',
        duration: 60,
        instructions: 'קרא בעיון את הטקסטים וענה על השאלות המורכבות.',
        questions: [
          {
            id: 'dalic2_r1',
            type: 'mc',
            text: 'Leggi il testo:<br><br><em>"Il concetto di "Soft Power", introdotto dal politologo Joseph Nye negli anni Novanta, descrive la capacità di un paese di influenzare gli altri attraverso l\'attrattiva culturale e i valori piuttosto che attraverso la coercizione militare o economica. L\'Italia possiede un formidabile soft power: la sua arte, la sua musica, la sua cucina e il suo stile di vita sono ammirati in tutto il mondo. Tuttavia, secondo un recente rapporto del "Soft Power 30", l\'Italia occupa solo l\'undicesima posizione nella classifica globale, preceduta da paesi come Francia, Regno Unito e Germania. Il rapporto sottolinea che, nonostante l\'enorme patrimonio culturale, l\'Italia fatica a tradurre questo potenziale in influenza politica concreta a causa di debolezze strutturali come l\'instabilità politica e la burocrazia inefficiente."</em><br><br>1. Cosa si intende per "Soft Power"?',
            options: ['La potenza militare di un paese', 'L\'influenza attraverso l\'attrattiva culturale e i valori', 'Il potere economico e finanziario', 'La capacità di imporre sanzioni internazionali'],
            answer: 'L\'influenza attraverso l\'attrattiva culturale e i valori',
            explanation: 'Il testo lo definisce come capacità di influenzare attraverso cultura e valori.'
          },
          {
            id: 'dalic2_r2',
            type: 'mc',
            text: '2. Quale posizione occupa l\'Italia nella classifica globale del Soft Power?',
            options: ['Sesta', 'Ottava', 'Undicesima', 'Quindicesima'],
            answer: 'Undicesima',
            explanation: 'Il rapporto "Soft Power 30" colloca l\'Italia all\'undicesimo posto.'
          },
          {
            id: 'dalic2_r3',
            type: 'mc',
            text: '3. Perché l\'Italia fatica a tradurre il suo potenziale culturale in influenza politica?',
            options: ['Perché la sua cultura non è apprezzata', 'A causa di instabilità politica e burocrazia inefficiente', 'Perché non ha abbastanza musei', 'A causa della barriera linguistica'],
            answer: 'A causa di instabilità politica e burocrazia inefficiente',
            explanation: 'Il testo menziona "debolezze strutturali come l\'instabilità politica e la burocrazia inefficiente".'
          },
          {
            id: 'dalic2_r4',
            type: 'cloze',
            text: 'Completa il testo inserendo le frasi appropriate nei vuoti (1-4). Scegli tra le opzioni nella lista.<br><br>"La biodiversità è fondamentale per l\'equilibrio del nostro pianeta. _____(1)_____. Purtroppo, negli ultimi decenni, il tasso di estinzione delle specie è aumentato in modo esponenziale. _____(2)_____. Le cause principali sono la distruzione degli habitat, l\'inquinamento e il cambiamento climatico. _____(3)_____. Tuttavia, esistono iniziative promettenti per invertire questa tendenza. _____(4)_____."',
            sentences: [
              { id: 's1', text: 'Ogni specie svolge un ruolo unico all\'interno del proprio ecosistema', gapIndex: 1 },
              { id: 's2', text: 'Si stima che ogni giorno scompaiano circa 150 specie animali e vegetali', gapIndex: 2 },
              { id: 's3', text: 'L\'attività umana è senza dubbio la principale responsabile di questa crisi ecologica', gapIndex: 3 },
              { id: 's4', text: 'Le aree protette e i programmi di conservazione stanno dando risultati incoraggianti in molte regioni del mondo', gapIndex: 4 }
            ],
            distractors: [
              'La biodiversità marina è particolarmente minacciata dal riscaldamento globale',
              'Molte specie sono state introdotte dall\'uomo in nuovi ambienti'
            ]
          }
        ]
      },
      {
        id: 'writing',
        name: 'Espressione scritta',
        heName: '✍️ הבעה בכתב',
        duration: 90,
        instructions: 'בחר משימה אחת וכתוב 250-300 מילים.',
        questions: [
          {
            id: 'dalic2_w1',
            type: 'writing',
            prompt: 'Scegli uno dei seguenti compiti:',
            options: [
              'Scrivi un articolo di giornale sul tema: "Il futuro del lavoro nell\'era dell\'automazione"',
              'Scrivi una lettera formale a un\'azienda di telecomunicazioni per contestare l\'aumento delle tariffe',
              'Scrivi un saggio breve: "La lingua come ponte tra culture: il ruolo dell\'italiano nel mondo"'
            ],
            modelAnswer: 'Il futuro del lavoro nell\'era dell\'automazione è un tema che suscita dibattiti accesi. Da un lato, l\'automazione promette di aumentare la produttività e ridurre i costi, eliminando i lavori ripetitivi e pericolosi. Dall\'altro, solleva interrogativi preoccupanti sulla disoccupazione tecnologica e sulla necessità di riconvertire intere categorie professionali. Secondo il World Economic Forum, entro il 2030 circa 85 milioni di posti di lavoro potrebbero essere sostituiti dall\'automazione, ma allo stesso tempo ne potrebbero nascere 97 milioni di nuovi. La sfida principale per i governi sarà quella di garantire una transizione giusta, investendo nell\'istruzione e nella formazione continua.'
          }
        ]
      },
      {
        id: 'grammar',
        name: 'Competenze morfosintattiche',
        heName: '📝 דקדוק מתקדם',
        duration: 90,
        instructions: 'השלם את התרגילים המורכבים. מבחן שליטה מלאה בדקדוק.',
        questions: [
          {
            id: 'dalic2_g1',
            type: 'cloze',
            text: 'Completa il testo con le parole appropriate.<br><br>"_____(1) numerosi studi lo confermino, non tutti sono convinti _____(2) l\'alimentazione vegana sia _____(3) salutare. _____(4) è vero che una dieta a base vegetale _____(5) ridurre il rischio di molte malattie, _____(6) è altrettanto importante assicurarsi di assumere _____(7) i nutrienti essenziali, _____(8) la vitamina B12 e il ferro."',
            wordBank: ['Sebbene', 'che', 'davvero', 'Da un lato', 'possa', 'dall\'altro', 'tutti', 'come', 'nonostante', 'per cui', 'sicuramente', 'invece', 'alcuni', 'tra cui'],
            blanks: [
              { index: 1, answer: 'Sebbene' },
              { index: 2, answer: 'che' },
              { index: 3, answer: 'davvero' },
              { index: 4, answer: 'Da un lato' },
              { index: 5, answer: 'possa' },
              { index: 6, answer: 'dall\'altro' },
              { index: 7, answer: 'tutti' },
              { index: 8, answer: 'come' }
            ]
          },
          {
            id: 'dalic2_g2',
            type: 'verbconjugation',
            text: 'Coniuga i verbi al tempo e modo appropriati (forme implicite ed esplicite, congiuntivi complessi).',
            items: [
              { sentence: 'Nonostante (lui-essere) _____ il candidato più qualificato, non è stato assunto.', answer: 'sia', infinitive: 'essere' },
              { sentence: 'Dopo (aver-finito) _____ gli studi, ha trascorso un anno all\'estero.', answer: 'aver finito', infinitive: 'finire' },
              { sentence: 'Pur (avere) _____ già avvertito, ha continuato a fumare.', answer: 'avendo', infinitive: 'avere' },
              { sentence: 'Se (loro-sapere) _____ la verità, non avrebbero mai accettato quell\'offerta.', answer: 'avessero saputo', infinitive: 'sapere' },
              { sentence: 'Temo che loro non (capire) _____ la gravità della situazione.', answer: 'abbiano capito', infinitive: 'capire' },
              { sentence: 'Per (essere) _____ assunto, devi superare il colloquio.', answer: 'essere', infinitive: 'essere' }
            ]
          },
          {
            id: 'dalic2_g3',
            type: 'sentenceformation',
            text: 'Riscrivi la frase mantenendo lo stesso significato:<br><br>"Nonostante la pioggia, abbiamo deciso di fare una passeggiata."<br><br>Inizia con: "Sebbene..."',
            words: ['Sebbene', 'piovesse', 'abbiamo deciso', 'di fare', 'una passeggiata'],
            answer: 'Sebbene piovesse abbiamo deciso di fare una passeggiata',
            acceptMultiple: false
          },
          {
            id: 'dalic2_g4',
            type: 'mc',
            text: 'Scegli l\'opzione corretta:<br><br>_____ il parlamento approvi la riforma, ci vorranno ancora mesi per la sua attuazione.',
            options: ['Anche se', 'Purché', 'Dopo che', 'Qualora'],
            answer: 'Anche se',
            explanation: '"Anche se" introduce una concessione corretta in questo contesto.'
          },
          {
            id: 'dalic2_g5',
            type: 'mc',
            text: 'Lo studio, _____ risultati sono stati pubblicati, ha suscitato molto interesse.',
            options: ['che i', 'i di cui', 'i cui', 'di cui i'],
            answer: 'i cui',
            explanation: 'Pronome relativo possessivo.'
          },
          {
            id: 'dalic2_g6',
            type: 'mc',
            text: '_____ la sua disponibilità, non siamo riusciti a trovare un accordo.',
            options: ['Nonostante', 'Malgrado', 'Sebbene', 'Anche se'],
            answer: 'Malgrado',
            explanation: '"Malgrado" + sostantivo, forma più formale di "nonostante".'
          }
        ]
      },
      {
        id: 'listening',
        name: 'Comprensione auditiva',
        heName: '🎧 הבנת הנשמע',
        duration: 40,
        instructions: 'קרא וענה על השאלות המורכבות.',
        questions: [
          {
            id: 'dalic2_l1',
            type: 'mc',
            text: 'Ascolta il notiziario radiofonico. Qual è la notizia principale?<br><br><em>Audio: "La Commissione Europea ha approvato oggi un pacchetto di incentivi da 2 miliardi di euro per la transizione energetica. I fondi saranno distribuiti tra i paesi membri in base ai loro piani nazionali per l\'energia rinnovabile. L\'Italia riceverà circa 300 milioni di euro, destinati principalmente alla riqualificazione energetica degli edifici pubblici."</em>',
            options: ['L\'Italia ha ricevuto 2 miliardi di euro', 'La Commissione Europea ha approvato incentivi per la transizione energetica', 'I fondi sono per la costruzione di nuove centrali', 'La riqualificazione riguarda solo gli edifici privati'],
            answer: 'La Commissione Europea ha approvato incentivi per la transizione energetica',
            explanation: 'La notizia principale è l\'approvazione del pacchetto di incentivi.'
          },
          {
            id: 'dalic2_l2',
            type: 'mc',
            text: 'Quanto riceverà l\'Italia e a cosa saranno destinati i fondi?',
            options: ['500 milioni per le scuole', '300 milioni per la riqualificazione energetica degli edifici pubblici', '200 milioni per i trasporti', '400 milioni per l\'industria'],
            answer: '300 milioni per la riqualificazione energetica degli edifici pubblici',
            explanation: 'Il testo specifica l\'importo e la destinazione.'
          },
          {
            id: 'dalic2_l3',
            type: 'mc',
            text: 'Cosa pensa il critico letterario intervistato della letteratura contemporanea?<br><br><em>Audio: "La letteratura contemporanea italiana sta attraversando un periodo di grande fermento. Nuove voci stanno emergendo, portando prospettive fresche e linguaggi innovativi. Tuttavia, rimane il problema della visibilità internazionale: pochi autori italiani vengono tradotti e distribuiti all\'estero rispetto ai colleghi francesi o tedeschi."</em>',
            options: ['La letteratura italiana è in declino', 'Ci sono nuove voci promettenti ma scarsa visibilità internazionale', 'Gli autori italiani sono molto tradotti', 'La letteratura contemporanea non interessa a nessuno'],
            answer: 'Ci sono nuove voci promettenti ma scarsa visibilità internazionale',
            explanation: 'Il critico riconosce il fermento ma sottolinea il problema della visibilità.'
          }
        ]
      },
      {
        id: 'speaking',
        name: 'Esame orale',
        heName: '🎤 הבעה בעל פה',
        duration: 30,
        instructions: 'התכונן לנושאים הבאים לדיון ברמת שפת אם.',
        questions: [
          {
            id: 'dalic2_s1',
            type: 'speaking_prompt',
            prompt: 'Sviluppa un dialogo o una presentazione su uno dei seguenti scenari:',
            items: [
              'Sei il moderatore di un dibattito sul tema "Libertà di espressione vs. responsabilità sociale"',
              'Presenta una relazione su "Il ruolo della cultura italiana nel mondo contemporaneo"',
              'Discuti il tema "Globalizzazione e identità culturale: opportunità o minaccia?"'
            ],
            modelAnswer: 'La globalizzazione rappresenta sia un\'opportunità che una minaccia per le identità culturali. Da un lato, permette lo scambio e l\'arricchimento reciproco tra culture diverse. La cucina italiana, per esempio, si è diffusa in tutto il mondo, ma allo stesso tempo si è adattata ai gusti locali, creando nuove varianti. Dall\'altro lato, c\'è il rischio di omologazione culturale, dove le culture dominanti tendono a sovrastare quelle più piccole. Il vero multiculturalismo non significa perdere la propria identità, ma imparare a convivere mantenendo le proprie specificità.'
          }
        ]
      }
    ]
  }
};

// Also define a quick-practice question bank for each skill type
const QUICK_PRACTICE = {
  mc: {
    name: 'שאלות אמריקאיות',
    icon: '🔤',
    questions: [
      { text: 'Scegli la forma corretta: "Io _____ italiano."', options: ['sono', 'ho', 'essere', 'sia'], answer: 'sono' },
      { text: '"Loro _____ a Roma da cinque anni."', options: ['vivono', 'vive', 'viviamo', 'vivete'], answer: 'vivono' },
      { text: '"_____ andato al mare ieri."', options: ['Ho', 'Sono', 'Ha', 'È'], answer: 'Sono' },
      { text: '"Non _____ cosa fare stasera."', options: ['so', 'sappio', 'saccio', 'sò'], answer: 'so' },
      { text: '"Maria _____ un libro molto interessante."', options: ['legge', 'leggi', 'leggono', 'leggiamo'], answer: 'legge' }
    ]
  },
  truefalse: {
    name: 'נכון/לא נכון',
    icon: '✓✗',
    questions: [
      { text: '"Roma è la capitale dell\'Italia."', answer: true },
      { text: '"Il Colosseo si trova a Milano."', answer: false },
      { text: '"La pizza è nata in Italia."', answer: true },
      { text: '"Il Monte Bianco è la montagna più alta d\'Europa."', answer: true },
      { text: '"Il caffè espresso è originario della Francia."', answer: false }
    ]
  },
  cloze: {
    name: 'השלמת טקסט',
    icon: '📝',
    questions: [
      { text: '"Ieri _____ (andare) al cinema con Maria."', answer: 'sono andato' },
      { text: '"Loro non _____ (avere) abbastanza tempo."', answer: 'hanno' },
      { text: '"Noi _____ (mangiare) sempre insieme."', answer: 'mangiamo' },
      { text: '"Tu _____ (leggere) molti libri."', answer: 'leggi' },
      { text: '"Lei _____ (parlare) tre lingue."', answer: 'parla' }
    ]
  },
  verb: {
    name: 'הטיית פעלים',
    icon: '🔤',
    questions: [
      { sentence: 'Io (parlare) _____ italiano.', answer: 'parlo', infinitive: 'parlare' },
      { sentence: 'Tu (leggere) _____ un libro.', answer: 'leggi', infinitive: 'leggere' },
      { sentence: 'Lui (dormire) _____ fino a tardi.', answer: 'dorme', infinitive: 'dormire' },
      { sentence: 'Noi (finire) _____ il lavoro.', answer: 'finiamo', infinitive: 'finire' },
      { sentence: 'Voi (partire) _____ domani.', answer: 'partite', infinitive: 'partire' }
    ]
  },
  sentence: {
    name: 'בניית משפטים',
    icon: '🧩',
    questions: [
      { words: ['Oggi', 'al mare', 'vado', 'con gli amici'], answer: 'Oggi vado al mare con gli amici' },
      { words: ['Mario', 'un libro', 'legge', 'interessante'], answer: 'Mario legge un libro interessante' },
      { words: ['La settimana', 'hanno visitato', 'scorsa', 'Roma'], answer: 'La settimana scorsa hanno visitato Roma' },
      { words: ['Non', 'piace', 'mi', 'la pizza'], answer: 'Non mi piace la pizza' },
      { words: ['Domani', 'inizierò', 'il corso', 'di italiano'], answer: 'Domani inizierò il corso di italiano' }
    ]
  },
  matching: {
    name: 'התאמה',
    icon: '🔗',
    questions: [
      { leftItems: [{ id:'ma1', text:'Firenze' }, { id:'ma2', text:'Venezia' }, { id:'ma3', text:'Pisa' }, { id:'ma4', text:'Roma' }],
        rightItems: [{ id:'ma1a', text:'La cupola del Brunelleschi', matchId:'ma1' }, { id:'ma2a', text:'Il Ponte di Rialto', matchId:'ma2' }, { id:'ma3a', text:'La Torre Pendente', matchId:'ma3' }, { id:'ma4a', text:'Il Colosseo', matchId:'ma4' }] }
    ]
  }
};

const EXAM_LIST = [
  { id: 'deli-a2', name: 'DELI-A2', level: 'A2', icon: '🌱', fullName: 'Elementare', duration: 105, description: 'מבחן ברמה בסיסית - 80-120 שעות לימוד' },
  { id: 'dili-b1', name: 'DILI-B1', level: 'B1', icon: '🌳', fullName: 'Intermedio 1', duration: 160, description: 'מבחן ברמה בינונית - שפה עצמאית' },
  { id: 'dili-b2', name: 'DILI-B2', level: 'B2', icon: '🏛️', fullName: 'Intermedio 2', duration: 180, description: 'מבחן ברמה בינונית-גבוהה' },
  { id: 'dali-c1', name: 'DALI-C1', level: 'C1', icon: '🎓', fullName: 'Avanzato 1', duration: 240, description: 'מבחן ברמה מתקדמת - שפה שוטפת' },
  { id: 'dali-c2', name: 'DALI-C2', level: 'C2', icon: '👑', fullName: 'Avanzato 2 — Padronanza', duration: 280, description: 'מבחן ברמת שליטה מלאה' }
];

const LEVEL_COLORS = { A1: '#4ade80', A2: '#22d3ee', B1: '#7c5cfc', B2: '#f59e0b', C1: '#ef4444', C2: '#ec4899' };

// ═══════════════════════════════════════
// RENDER — Exam Hub
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
      <div class="exam-container">
        <h2 class="section-title"><span class="emoji">📋</span> מבחני הסמכה רשמיים</h2>
        <p style="font-size:.85rem;color:var(--text2);margin-bottom:12px">התכונן למבחני ההסמכה האיטלקיים הרשמיים של AIL Firenze</p>
        
        <div class="exam-level-tabs">
          <button class="exam-level-tab ${activeLevel==='all'?'active':''}" data-level="all">הכול</button>
          ${['A2','B1','B2','C1','C2'].map(l => `
            <button class="exam-level-tab ${activeLevel===l?'active':''}" data-level="${l}" 
              style="${activeLevel===l ? 'border-color:'+(LEVEL_COLORS[l]||'#7c5cfc')+';color:'+(LEVEL_COLORS[l]||'#7c5cfc') : ''}">${l}</button>
          `).join('')}
        </div>
        
        <h3 class="section-title" style="font-size:.95rem"><span>📝</span> סימולציות מלאות</h3>
        <div class="exam-hub-grid">
          ${filtered.map(exam => {
            const hist = examHistory[exam.id];
            const best = hist ? Math.max(...hist.map(h => h.score)) : 0;
            const timesTaken = hist ? hist.length : 0;
            return `
              <div class="exam-card" onclick="Exams.start('${exam.id}')">
                <div class="exam-card-header">
                  <span class="exam-level-badge" style="background:${LEVEL_COLORS[exam.level]||'#7c5cfc'}">${exam.level}</span>
                  <span class="exam-card-icon">${exam.icon}</span>
                  <span class="exam-card-duration">⏱ ${exam.duration} דקות</span>
                </div>
                <div class="exam-card-title">${exam.name}</div>
                <div class="exam-card-subtitle">${exam.fullName}</div>
                <div class="exam-card-desc">${exam.description}</div>
                <div class="exam-card-sections">
                  ${['📖','✍️','📝','🎧','🎤'].map((icon,i) => `
                    <span class="exam-section-dot" title="${EXAM_DATA[exam.id]?.sections[i]?.name || ''}">${icon}</span>
                  `).join('')}
                </div>
                ${timesTaken > 0 ? `
                  <div class="exam-card-stats">
                    <span>🏆 ${best}%</span>
                    <span>🔄 ${timesTaken} פעמים</span>
                  </div>
                ` : `<div class="exam-card-stats"><span>⚡ לא ניסית עדיין</span></div>`}
                <button class="btn btn-primary btn-block btn-sm" style="margin-top:8px">🚀 התחל מבחן</button>
              </div>
            `;
          }).join('')}
          ${filtered.length === 0 ? '<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">📋</div><div style="color:var(--text3)">אין מבחנים ברמה זו</div></div>' : ''}
        </div>
        
        <h3 class="section-title" style="font-size:.95rem;margin-top:24px"><span>⚡</span> תרגול מהיר לפי נושא</h3>
        <p style="font-size:.8rem;color:var(--text2);margin-bottom:12px">תרגל 5 שאלות קצרות בכל נושא ובכל רמה</p>
        
        <div class="exam-quick-grid">
          ${Object.entries(QUICK_PRACTICE).map(([key, val]) => `
            <div class="exam-quick-card" onclick="Exams.startQuickPractice('${activeLevel==='all' ? 'A2' : activeLevel}', '${key}')">
              <div class="exam-quick-icon">${val.icon}</div>
              <div class="exam-quick-name">${val.name}</div>
            </div>
          `).join('')}
        </div>
        
        <div style="height:16px"></div>
      </div>
    `;

    // Attach level filter events
    container.querySelectorAll('.exam-level-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        activeLevel = tab.dataset.level;
        renderView();
      });
    });
  }

  renderView();
}

// ═══════════════════════════════════════
// START FULL EXAM
// ═══════════════════════════════════════
function start(examId) {
  const exam = EXAM_DATA[examId];
  if (!exam) { toast('מבחן לא נמצא', 'error'); return; }
  
  currentExam = exam;
  currentSection = 0;
  currentQuestion = 0;
  answers = {};
  writingAnswers = {};
  isQuickPractice = false;
  examActive = true;
  
  // Calculate total time
  let totalMinutes = 0;
  exam.sections.forEach(s => totalMinutes += s.duration);
  timeRemaining = totalMinutes * 60;
  
  showExamIntro();
}

function showExamIntro() {
  const container = document.getElementById('examContent');
  if (!container) return;
  
  const exam = currentExam;
  const totalMinutes = exam.sections.reduce((sum, s) => sum + s.duration, 0);
  
  container.innerHTML = `
    <div class="exam-container">
      <div style="text-align:center;padding:20px 0">
        <div style="font-size:4rem;margin-bottom:12px">${exam.icon}</div>
        <h2 style="font-weight:800;font-size:1.4rem">${exam.name}</h2>
        <p style="color:var(--text2);font-size:.9rem">${exam.fullName}</p>
        <div style="display:flex;gap:8px;justify-content:center;margin:12px 0;flex-wrap:wrap">
          <span class="level-badge">${exam.level}</span>
          <span class="coin-badge">⏱ ${totalMinutes} דקות</span>
        </div>
      </div>
      
      <div class="card" style="margin-bottom:16px">
        <h3 style="font-weight:700;margin-bottom:12px">📋 מבנה המבחן</h3>
        ${exam.sections.map((s, i) => `
          <div class="exam-section-info">
            <span class="exam-section-icon">${s.heName.split(' ')[0]}</span>
            <div style="flex:1">
              <div style="font-weight:600;font-size:.85rem">${s.heName}</div>
              <div style="font-size:.7rem;color:var(--text3)">${s.name} · ${s.duration} דקות · ${s.questions.length} שאלות</div>
            </div>
            <span style="font-size:.7rem;color:var(--text3);font-weight:600">${s.duration}′</span>
          </div>
        `).join('')}
      </div>
      
      <div class="card" style="margin-bottom:20px;background:var(--surface2);text-align:center">
        <div style="font-size:.85rem;color:var(--text2)">⏰ המבחן יכלול טיימר שיעבור אוטומטית לסעיף הבא</div>
      </div>
      
      <button class="btn btn-primary btn-block" onclick="Exams.beginExam()">🚀 התחל מבחן</button>
      <button class="btn btn-secondary btn-block" onclick="Exams.render()" style="margin-top:8px">← חזרה</button>
      <div style="height:20px"></div>
    </div>
  `;
}

function beginExam() {
  currentSection = 0;
  currentQuestion = 0;
  answers = {};
  startSection();
}

function startSection() {
  const exam = currentExam;
  if (!exam || currentSection >= exam.sections.length) {
    showResults();
    return;
  }
  
  const section = exam.sections[currentSection];
  currentQuestion = 0;
  sectionTimeRemaining = section.duration * 60;
  
  renderQuestion();
  startSectionTimer();
  startGlobalTimer();
}

function startSectionTimer() {
  if (sectionTimer) clearInterval(sectionTimer);
  
  sectionTimer = setInterval(() => {
    sectionTimeRemaining--;
    if (sectionTimeRemaining <= 0) {
      // Auto-advance to next section
      clearInterval(sectionTimer);
      submitSection();
    }
    updateTimerDisplay();
  }, 1000);
}

function startGlobalTimer() {
  if (timer) clearInterval(timer);
  
  timer = setInterval(() => {
    timeRemaining--;
    if (timeRemaining <= 0) {
      clearInterval(timer);
      clearInterval(sectionTimer);
      showResults();
    }
    updateGlobalTimerDisplay();
  }, 60000); // Update global timer every minute
}

function updateTimerDisplay() {
  const el = document.getElementById('examTimerDisplay');
  if (!el) return;
  
  const sectionMin = Math.floor(sectionTimeRemaining / 60);
  const sectionSec = sectionTimeRemaining % 60;
  const totalMin = Math.floor(timeRemaining / 60);
  
  el.innerHTML = `<span class="exam-timer-section">⏱ ${String(sectionMin).padStart(2,'0')}:${String(sectionSec).padStart(2,'0')}</span> | <span class="exam-timer-total">סה״כ ${totalMin} דק׳</span>`;
  
  if (sectionTimeRemaining <= 300 && sectionTimeRemaining > 0) {
    el.classList.add('exam-timer-warning');
  } else {
    el.classList.remove('exam-timer-warning');
  }
  
  if (sectionTimeRemaining <= 60 && sectionTimeRemaining > 0) {
    el.classList.add('exam-timer-critical');
  } else {
    el.classList.remove('exam-timer-critical');
  }
}

function updateGlobalTimerDisplay() {
  // Nothing extra needed, updateTimerDisplay handles both
}

function renderQuestion() {
  const container = document.getElementById('examContent');
  if (!container) return;
  
  const exam = currentExam;
  const section = exam.sections[currentSection];
  const q = section.questions[currentQuestion];
  if (!q) {
    submitSection();
    return;
  }
  
  const totalQ = section.questions.length;
  const progress = ((currentQuestion) / totalQ) * 100;
  const sectionProgress = ((currentSection) / exam.sections.length) * 100;
  
  let html = `
    <div class="exam-container exam-sim">
      <div class="exam-top-bar">
        <button class="back-btn" onclick="Exams.quitExam()">✕ יציאה</button>
        <div id="examTimerDisplay" class="exam-timer">⏱ ${Math.floor(sectionTimeRemaining/60)}:${String(sectionTimeRemaining%60).padStart(2,'0')}</div>
      </div>
      
      <div class="exam-section-header">
        <span class="exam-section-badge" style="background:${LEVEL_COLORS[exam.level]||'#7c5cfc'}">${section.heName.split(' ')[0]}</span>
        <div style="flex:1">
          <div class="exam-section-name">${section.heName}</div>
          <div style="font-size:.7rem;color:var(--text3)">${exam.name} · רמה ${exam.level}</div>
        </div>
        <div class="exam-q-counter">${currentQuestion+1}/${totalQ}</div>
      </div>
      
      <div class="exam-progress-wrap">
        <div class="exam-progress-bar">
          <div class="exam-progress-fill" style="width:${progress}%"></div>
        </div>
        <div class="exam-section-progress">
          <div class="exam-section-progress-fill" style="width:${sectionProgress}%"></div>
        </div>
      </div>
      
      <div class="exam-question-area">
  `;
  
  // Render question based on type
  html += renderQuestionByType(q, section.id);
  
  // Navigation buttons
  html += `
      </div>
      
      <div class="exam-nav-buttons">
        ${currentQuestion > 0 ? `<button class="btn btn-secondary" onclick="Exams.prevQuestion()">← הקודם</button>` : '<div></div>'}
        ${currentQuestion < totalQ - 1 
          ? `<button class="btn btn-primary" onclick="Exams.nextQuestion()">הבא →</button>`
          : `<button class="btn btn-success" onclick="Exams.submitSection()">✅ סיים סעיף</button>`
        }
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  
  // Post-render setup for certain question types
  if (q.type === 'sentenceformation' && q.words) {
    setupSentenceFormation(q);
  }
  if (q.type === 'matching') {
    setupMatching(q);
  }
  if (q.type === 'cloze' && q.sentences) {
    setupSentenceInsertionCloze(q);
  }
  
  // Restore answers if previously given
  restoreAnswerState(q, section.id);
}

function renderQuestionByType(q, sectionId) {
  const answerKey = `${sectionId}_${q.id}`;
  const savedAnswer = answers[answerKey];
  
  switch (q.type) {
    case 'mc':
      return renderMC(q, answerKey, savedAnswer);
    case 'truefalse':
      return renderTrueFalse(q, answerKey, savedAnswer);
    case 'cloze':
      if (q.sentences) {
        return renderSentenceInsertionCloze(q, answerKey);
      }
      return renderCloze(q, answerKey, savedAnswer);
    case 'verbconjugation':
      return renderVerbConjugation(q, answerKey, savedAnswer);
    case 'sentenceformation':
      return renderSentenceFormation(q, answerKey, savedAnswer);
    case 'matching':
      return renderMatching(q, answerKey);
    case 'writing':
      return renderWriting(q, answerKey);
    case 'speaking_prompt':
      return renderSpeakingPrompt(q);
    default:
      return `<div style="color:var(--text3);text-align:center">סוג שאלה לא נתמך: ${q.type}</div>`;
  }
}

function renderMC(q, answerKey, savedAnswer) {
  return `
    <div class="exam-question-text">${q.text}</div>
    <div class="exam-options">
      ${q.options.map((opt, i) => `
        <div class="exam-option ${savedAnswer === opt ? 'selected' : ''}" 
             onclick="Exams.answer('${answerKey}','${esc(opt)}',this)"
             data-answer="${esc(opt)}">
          <span class="exam-option-letter">${String.fromCharCode(97+i)})</span>
          <span>${opt}</span>
          ${savedAnswer === opt ? '<span class="exam-option-check">✓</span>' : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function renderTrueFalse(q, answerKey, savedAnswer) {
  return `
    <div class="exam-question-text">${q.text}</div>
    <div class="exam-tf-list">
      ${q.items.map((item, i) => {
        const itemKey = answerKey + '_' + item.id;
        const saved = answers[itemKey];
        return `
          <div class="exam-tf-item" data-item-id="${item.id}">
            <div class="exam-tf-statement">${i+1}. ${item.statement}</div>
            <div class="exam-tf-buttons">
              <div class="exam-tf-btn ${saved === true ? 'active-true' : ''}" 
                   onclick="Exams.answer('${itemKey}',true,this)">
                ✓ נכון
              </div>
              <div class="exam-tf-btn ${saved === false ? 'active-false' : ''}" 
                   onclick="Exams.answer('${itemKey}',false,this)">
                ✗ לא נכון
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderCloze(q, answerKey, savedAnswer) {
  let text = q.text;
  // Replace blanks with input fields
  q.blanks.forEach(blank => {
    const blankKey = answerKey + '_b' + blank.index;
    const saved = answers[blankKey] || '';
    // Match _____(N) pattern (5 underscores + number in parens)
    const re = new RegExp(`_{5}\\(${blank.index}\\)`, 'g');
    text = text.replace(re, `<span class="exam-cloze-slot"><input type="text" class="exam-cloze-input" data-blank="${blankKey}" value="${saved}" placeholder="___" onchange="Exams.answer('${blankKey}',this.value)"></span>`);
  });
  
  return `
    <div class="exam-question-text">${text}</div>
    ${q.wordBank ? `
      <div class="exam-wordbank">
        <div class="exam-wordbank-title">📚 מילים לבחירה:</div>
        <div class="exam-wordbank-words">
          ${q.wordBank.map(w => `<span class="exam-wordbank-word">${w}</span>`).join('')}
        </div>
      </div>
    ` : ''}
  `;
}

function renderVerbConjugation(q, answerKey, savedAnswer) {
  return `
    <div class="exam-question-text">${q.text}</div>
    <div class="exam-verb-list">
      ${q.items.map((item, i) => {
        const itemKey = answerKey + '_v' + i;
        const saved = answers[itemKey] || '';
        return `
          <div class="exam-verb-item">
            <div class="exam-verb-sentence">${item.sentence}</div>
            <div style="font-size:.7rem;color:var(--text3);margin:2px 0 4px">פעל: ${item.infinitive} | ${item.answer ? '✔' : ''}</div>
            <input type="text" class="exam-verb-input" data-verb="${itemKey}" value="${saved}" 
              placeholder="הטה את הפועל..." onchange="Exams.answer('${itemKey}',this.value)">
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderSentenceFormation(q, answerKey, savedAnswer) {
  return `
    <div class="exam-question-text">${q.text}</div>
    <div class="exam-formation-area" id="formationArea_${q.id}">
      <div class="exam-formation-answer" id="formationAnswer_${q.id}">
        <span class="sentbuild-placeholder">לחץ על המילים לבניית משפט...</span>
      </div>
      <div class="exam-formation-pool" id="formationPool_${q.id}">
        ${shuffleArr([...q.words]).map(w => `
          <span class="sentbuild-word" onclick="Exams.formationClick('${q.id}','${esc(w)}',this)">${w}</span>
        `).join('')}
      </div>
      <div class="exam-formation-actions" style="display:flex;gap:8px;margin-top:8px">
        <button class="btn btn-secondary btn-sm" onclick="Exams.formationClear('${q.id}')">🔄 נקה</button>
        <button class="btn btn-primary btn-sm" onclick="Exams.formationSubmit('${q.id}','${answerKey}')">בדוק →</button>
      </div>
      <div id="formationFeedback_${q.id}" style="margin-top:8px;font-size:.85rem;text-align:center"></div>
    </div>
  `;
}

function renderMatching(q, answerKey) {
  const shuffledLeft = shuffleArr([...q.leftItems]);
  const shuffledRight = shuffleArr([...q.rightItems]);
  
  return `
    <div class="exam-question-text">${q.text}</div>
    <div class="exam-matching" id="matchingArea_${q.id}">
      <div class="exam-matching-cols">
        <div class="exam-matching-col">
          <div class="exam-matching-col-header">פריטים</div>
          ${shuffledLeft.map(item => `
            <div class="exam-matching-item left" data-match-id="${item.id}" onclick="Exams.matchSelect('${q.id}','left','${item.id}')">
              ${item.text}
            </div>
          `).join('')}
        </div>
        <div class="exam-matching-col">
          <div class="exam-matching-col-header">תשובות</div>
          ${shuffledRight.map(item => `
            <div class="exam-matching-item right" data-match-id="${item.matchId}" onclick="Exams.matchSelect('${q.id}','right','${item.id}')">
              ${item.text}
            </div>
          `).join('')}
        </div>
      </div>
      <div id="matchingFeedback_${q.id}" style="margin-top:8px;font-size:.85rem;text-align:center"></div>
    </div>
  `;
}

function renderSentenceInsertionCloze(q, answerKey) {
  let text = q.text;
  const gaps = q.sentences.filter(s => s.gapIndex);
  
  gaps.forEach(s => {
    const gapKey = answerKey + '_gap' + s.gapIndex;
    const savedText = answers[gapKey] || '';
    // Match _____(N)_____ pattern
    const re = new RegExp(`_{5}\\(${s.gapIndex}\\)_{5}`, 'g');
    text = text.replace(re, `<span class="exam-cloze-gap" id="gap_${s.gapIndex}" data-gap="${gapKey}">${savedText ? savedText : '________'}</span>`);
  });
  
  const allOptions = shuffleArr([...q.sentences, ...(q.distractors || [])]);
  
  return `
    <div class="exam-question-text">${text}</div>
    <div class="exam-cloze-sentences">
      <div class="exam-wordbank-title">📝 בחר משפט עבור כל מקום:</div>
      ${allOptions.map((opt, i) => {
        const isUsed = answers[Object.keys(answers).find(k => k.startsWith(answerKey + '_gap') && answers[k] === opt.text)];
        return `
          <div class="exam-cloze-sentence-option ${isUsed ? 'used' : ''}" data-sentence-text="${esc(opt.text)}" onclick="Exams.insertSentence(this,'${answerKey}','${esc(opt.text)}')">
            ${opt.text}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderWriting(q, answerKey) {
  const saved = answers[answerKey] || '';
  return `
    <div class="exam-question-text">
      <strong>${q.prompt}</strong>
    </div>
    <div class="exam-writing-prompts">
      ${q.options.map(opt => `
        <div class="exam-writing-option" onclick="document.getElementById('writingArea_${q.id}').value='${esc(opt)}:'+document.getElementById('writingArea_${q.id}').value.substring(document.getElementById('writingArea_${q.id}').value.indexOf('\\n')+1)">
          📌 ${opt}
        </div>
      `).join('')}
    </div>
    <div class="exam-writing-area">
      <textarea class="exam-writing-textarea" id="writingArea_${q.id}" 
        placeholder="כתוב את התשובה שלך כאן באיטלקית..." 
        oninput="Exams.answer('${answerKey}',this.value);this.parentElement.querySelector('.word-count').textContent='מילים: '+this.value.trim().split(/\\s+/).filter(Boolean).length">${saved}</textarea>
      <div class="word-count" style="text-align:left;font-size:.75rem;color:var(--text3);margin-top:4px">מילים: ${saved ? saved.trim().split(/\s+/).filter(Boolean).length : 0}</div>
    </div>
    ${q.modelAnswer ? `
      <details style="margin-top:12px">
        <summary style="cursor:pointer;font-size:.8rem;color:var(--text2);font-weight:600">💡 ראה תשובה לדוגמה</summary>
        <div style="margin-top:8px;padding:12px;background:var(--surface2);border-radius:var(--radius-sm);font-size:.85rem;line-height:1.6;direction:ltr;text-align:left">${q.modelAnswer}</div>
      </details>
    ` : ''}
  `;
}

function renderSpeakingPrompt(q) {
  return `
    <div class="exam-question-text">
      <strong>${q.prompt}</strong>
    </div>
    <div class="exam-speaking-items">
      ${q.items.map(item => `
        <div class="exam-speaking-item">• ${item}</div>
      `).join('')}
    </div>
    ${q.modelAnswer ? `
      <details style="margin-top:16px">
        <summary style="cursor:pointer;font-size:.8rem;color:var(--text2);font-weight:600">💡 ראה תשובה לדוגמה</summary>
        <div style="margin-top:8px;padding:12px;background:var(--surface2);border-radius:var(--radius-sm);font-size:.85rem;line-height:1.6;direction:ltr;text-align:left">${q.modelAnswer}</div>
      </details>
    ` : ''}
    <div style="margin-top:16px;padding:12px;background:rgba(124,92,252,.1);border-radius:var(--radius-sm);text-align:center">
      <span style="font-size:.85rem;color:var(--text2)">🎤 במבחן האמיתי היית עונה בעל פה. כאן תוכל לקרוא את התשובה לדוגמה ולהתכונן.</span>
    </div>
  `;
}

// ═══════════════════════════════════════
// ANSWER HANDLING
// ═══════════════════════════════════════
function answer(key, value, el) {
  answers[key] = value;
  
  // UI feedback for clickable answers
  if (el) {
    const parent = el.closest('.exam-options');
    if (parent) {
      parent.querySelectorAll('.exam-option').forEach(o => o.classList.remove('selected'));
      el.classList.add('selected');
      el.querySelector('.exam-option-check')?.remove();
      const check = document.createElement('span');
      check.className = 'exam-option-check';
      check.textContent = '✓';
      el.appendChild(check);
    }
    
    const tfParent = el.closest('.exam-tf-buttons');
    if (tfParent) {
      tfParent.querySelectorAll('.exam-tf-btn').forEach(b => {
        b.classList.remove('active-true', 'active-false');
      });
      el.classList.add(value === true ? 'active-true' : 'active-false');
    }
  }
}

function matchSelect(qId, side, id) {
  const area = document.getElementById(`matchingArea_${qId}`);
  if (!area) return;
  
  // Store matching state on the element
  if (!area._matchState) {
    area._matchState = { leftSelected: null, rightSelected: null, matches: {}, totalPairs: 0 };
    // Count total pairs needed
    const matchingQ = findCurrentQuestion(qId);
    if (matchingQ && matchingQ.leftItems) {
      area._matchState.totalPairs = matchingQ.leftItems.length;
      area._matchState.matchData = matchingQ;
    }
  }
  
  const ms = area._matchState;
  
  if (side === 'left') {
    ms.leftSelected = id;
    area.querySelectorAll('.exam-matching-item.left').forEach(el => {
      el.classList.toggle('match-selected', el.dataset.matchId === id);
    });
  } else {
    ms.rightSelected = id;
    area.querySelectorAll('.exam-matching-item.right').forEach(el => {
      el.classList.toggle('match-selected', el.dataset.matchId === id);
    });
  }
  
  // If both sides selected, check match
  if (ms.leftSelected && ms.rightSelected) {
    const fb = document.getElementById(`matchingFeedback_${qId}`);
    
    const rightEl = area.querySelector(`.exam-matching-item.right[data-match-id="${ms.rightSelected}"]`);
    const leftEl = area.querySelector(`.exam-matching-item.left[data-match-id="${ms.leftSelected}"]`);
    
    if (rightEl && leftEl) {
      const rightMatchId = rightEl.dataset.matchId;
      const leftId = ms.leftSelected;
      
      if (rightMatchId === leftId) {
        // Correct match!
        leftEl.classList.add('match-correct');
        rightEl.classList.add('match-correct');
        leftEl.style.pointerEvents = 'none';
        rightEl.style.pointerEvents = 'none';
        ms.matches[leftId] = true;
        if (fb) fb.innerHTML = '<span style="color:var(--emerald)">✅ התאמה נכונה!</span>';
        
        // Save to answers
        const answerKey = `${qId}_match_count`;
        answers[answerKey] = Object.keys(ms.matches).length;
        
        // Check if all matched
        if (Object.keys(ms.matches).length >= ms.totalPairs) {
          if (fb) fb.innerHTML = '<span style="color:var(--emerald);font-weight:700">🎉 כל ההתאמות נכונות!</span>';
        }
      } else {
        // Wrong match
        leftEl.classList.add('match-wrong');
        rightEl.classList.add('match-wrong');
        setTimeout(() => {
          leftEl.classList.remove('match-wrong', 'match-selected');
          rightEl.classList.remove('match-wrong', 'match-selected');
        }, 800);
        if (fb) fb.innerHTML = '<span style="color:var(--red)">❌ התאמה לא נכונה, נסה שוב</span>';
      }
      
      ms.leftSelected = null;
      ms.rightSelected = null;
    }
  }
}

function findCurrentQuestion(qId) {
  const exam = currentExam;
  if (!exam) return null;
  const section = exam.sections[currentSection];
  if (!section) return null;
  return section.questions.find(q => {
    const key = `${section.id}_${q.id}`;
    return key === qId || q.id === qId.replace(section.id + '_', '');
  });
}

function formationClick(qId, word, el) {
  const answerArea = document.getElementById(`formationAnswer_${qId}`);
  const pool = document.getElementById(`formationPool_${qId}`);
  if (!answerArea || !pool) return;
  
  // Check if clicking a placed word in the answer area
  if (el.parentElement === answerArea) {
    // Remove from answer area, add back to pool
    el.remove();
    if (answerArea.children.length === 0) {
      answerArea.innerHTML = '<span class="sentbuild-placeholder">לחץ על המילים לבניית משפט...</span>';
    }
    pool.appendChild(el);
    el.classList.remove('placed');
    return;
  }
  
  // Move from pool to answer area
  if (el.parentElement === pool) {
    // Remove placeholder if exists
    const placeholder = answerArea.querySelector('.sentbuild-placeholder');
    if (placeholder) placeholder.remove();
    
    el.classList.add('placed');
    answerArea.appendChild(el);
  }
}

function formationClear(qId) {
  const answerArea = document.getElementById(`formationAnswer_${qId}`);
  const pool = document.getElementById(`formationPool_${qId}`);
  if (!answerArea || !pool) return;
  
  const words = answerArea.querySelectorAll('.sentbuild-word');
  words.forEach(w => {
    w.classList.remove('placed');
    pool.appendChild(w);
  });
  answerArea.innerHTML = '<span class="sentbuild-placeholder">לחץ על המילים לבניית משפט...</span>';
  document.getElementById(`formationFeedback_${qId}`).innerHTML = '';
}

function formationSubmit(qId, answerKey) {
  const answerArea = document.getElementById(`formationAnswer_${qId}`);
  const fb = document.getElementById(`formationFeedback_${qId}`);
  if (!answerArea || !fb) return;
  
  const words = answerArea.querySelectorAll('.sentbuild-word');
  const formed = Array.from(words).map(w => w.textContent).join(' ');
  
  if (formed.length < 3) {
    fb.innerHTML = '<span style="color:var(--orange)">בנה משפט שלם קודם</span>';
    return;
  }
  
  answers[answerKey] = formed;
  fb.innerHTML = `<span style="color:var(--text2)">✅ תשובתך נרשמה: <em>${formed}</em></span>`;
  
  // Mark words correct/incorrect based on fuzzy match
  // Get the correct answer from the question
  const exam = currentExam;
  const section = exam.sections[currentSection];
  const q = section.questions[currentQuestion];
  
  if (q && q.answer) {
    const score = fuzzyMatch(formed.toLowerCase(), q.answer.toLowerCase());
    if (score >= 70) {
      words.forEach(w => w.classList.add('correct'));
      fb.innerHTML = `<span style="color:var(--emerald)">✅ נכון! (${score}%)</span>`;
    } else {
      words.forEach(w => w.classList.add('incorrect'));
      fb.innerHTML = `<span style="color:var(--red)">❌ כדאי לנסות שוב (${score}%) — התשובה: ${q.answer}</span>`;
    }
  }
}

function insertSentence(el, answerKey, sentenceText) {
  // Find the next available gap
  const gaps = document.querySelectorAll('.exam-cloze-gap');
  let inserted = false;
  
  for (const gap of gaps) {
    const gapKey = gap.dataset.gap;
    if (!answers[gapKey] || answers[gapKey] === '') {
      answers[gapKey] = sentenceText;
      gap.textContent = sentenceText;
      gap.classList.add('filled');
      el.classList.add('used');
      inserted = true;
      break;
    }
  }
  
  if (!inserted) {
    toast('כל המקומות כבר מלאים!', 'warning');
  }
}

function restoreAnswerState(q, sectionId) {
  // Handled by the individual renderers checking answers
}

// ═══════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════
function nextQuestion() {
  const exam = currentExam;
  const section = exam.sections[currentSection];
  if (currentQuestion < section.questions.length - 1) {
    currentQuestion++;
    renderQuestion();
  }
}

function prevQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    renderQuestion();
  }
}

function submitSection() {
  if (sectionTimer) clearInterval(sectionTimer);
  
  const exam = currentExam;
  if (!exam) return;
  
  currentSection++;
  if (currentSection >= exam.sections.length) {
    // End of exam
    if (timer) clearInterval(timer);
    showResults();
  } else {
    // Auto-start next section
    startSection();
    toast(`✅ עברת לסעיף הבא!`, 'success');
  }
}

function quitExam() {
  if (timer) clearInterval(timer);
  if (sectionTimer) clearInterval(sectionTimer);
  timer = null;
  sectionTimer = null;
  examActive = false;
  currentExam = null;
  render();
}

// ═══════════════════════════════════════
// RESULTS
// ═══════════════════════════════════════
function showResults() {
  const container = document.getElementById('examContent');
  if (!container) return;
  
  const exam = currentExam;
  if (!exam) { render(); return; }
  
  // Calculate scores per section
  const sectionScores = exam.sections.map((section, sIdx) => {
    let correct = 0;
    let total = 0;
    
    section.questions.forEach(q => {
      const key = `${section.id}_${q.id}`;
      
      if (q.type === 'truefalse') {
        q.items.forEach(item => {
          total++;
          const itemKey = key + '_' + item.id;
          if (answers[itemKey] === item.answer) correct++;
        });
      } else if (q.type === 'mc') {
        total++;
        if (answers[key] === q.answer) correct++;
      } else if (q.type === 'cloze' && q.blanks) {
        q.blanks.forEach(blank => {
          total++;
          const blankKey = key + '_b' + blank.index;
          if (answers[blankKey] && answers[blankKey].toLowerCase().trim() === blank.answer.toLowerCase()) correct++;
        });
      } else if (q.type === 'verbconjugation') {
        q.items.forEach((item, i) => {
          total++;
          const itemKey = key + '_v' + i;
          const score = fuzzyMatch((answers[itemKey]||'').toLowerCase().trim(), item.answer.toLowerCase());
          if (score >= 70) correct++;
        });
      } else if (q.type === 'sentenceformation') {
        total++;
        if (answers[key]) {
          const score = fuzzyMatch(answers[key].toLowerCase(), q.answer.toLowerCase());
          if (score >= 60) correct++;
        }
      } else if (q.type === 'cloze' && q.sentences) {
        q.sentences.forEach(s => {
          total++;
          const gapKey = key + '_gap' + s.gapIndex;
          if (answers[gapKey] && answers[gapKey].toLowerCase().trim() === s.text.toLowerCase().trim()) correct++;
        });
      } else if (q.type === 'writing' || q.type === 'speaking_prompt') {
        // Writing/speaking prompts - count as attempted
        total++;
        if (answers[key] && answers[key].trim().length > 10) correct++;
      } else if (q.type === 'matching') {
        // Matching question - check how many pairs were matched correctly
        const matchKey = `${key}_match_count`;
        const matchedCount = answers[matchKey] || 0;
        const totalPairs = (q.leftItems || []).length;
        correct += matchedCount;
        total += totalPairs;
      }
    });
    
    return {
      id: section.id,
      heName: section.heName,
      correct,
      total,
      pct: total > 0 ? Math.round(correct / total * 100) : 0
    };
  });
  
  const totalCorrect = sectionScores.reduce((s, sec) => s + sec.correct, 0);
  const totalQuestions = sectionScores.reduce((s, sec) => s + sec.total, 0);
  const overallPct = totalQuestions > 0 ? Math.round(totalCorrect / totalQuestions * 100) : 0;
  
  // Save to exam history
  saveExamResult(exam.id, overallPct);
  
  const passed = overallPct >= 60;
  const level = exam.level;
  
  // Determine grade
  let grade, gradeEmoji;
  if (overallPct >= 90) { grade = 'A — Eccellente!'; gradeEmoji = '🌟'; }
  else if (overallPct >= 80) { grade = 'B — Molto buono!'; gradeEmoji = '🎉'; }
  else if (overallPct >= 70) { grade = 'C — Buono!'; gradeEmoji = '👍'; }
  else if (overallPct >= 60) { grade = 'D — Sufficiente'; gradeEmoji = '✅'; }
  else { grade = 'F — Insufficiente'; gradeEmoji = '💪'; }
  
  let html = `
    <div class="exam-container exam-results">
      <div class="exam-results-header">
        <div style="font-size:4rem;margin-bottom:12px">${passed ? '🎉' : '💪'}</div>
        <h2 style="font-weight:800;font-size:1.4rem">${passed ? 'סיימת את המבחן!' : 'המשך להתאמן!'}</h2>
        <p style="color:var(--text2);font-size:.9rem">${exam.name} — ${exam.fullName}</p>
        <div class="exam-results-grade">${gradeEmoji} ${grade}</div>
      </div>
      
      <div class="exam-results-score">
        <div class="exam-score-circle" style="background:conic-gradient(var(--emerald) 0% ${overallPct}%, var(--surface2) ${overallPct}% 100%)">
          <div class="exam-score-inner">
            <span class="exam-score-value">${overallPct}%</span>
            <span class="exam-score-label">${totalCorrect}/${totalQuestions}</span>
          </div>
        </div>
      </div>
      
      <div class="exam-results-sections">
        ${sectionScores.map(sec => `
          <div class="exam-result-section">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
              <span style="font-size:.85rem;font-weight:600">${sec.heName}</span>
              <span style="font-size:.8rem;color:${sec.pct >= 60 ? 'var(--emerald)' : 'var(--red)'};font-weight:700">${sec.correct}/${sec.total} (${sec.pct}%)</span>
            </div>
            <div class="exam-progress-bar">
              <div class="exam-progress-fill ${sec.pct >= 60 ? '' : 'exam-pct-low'}" style="width:${sec.pct}%"></div>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="exam-results-detail">
        <div class="exam-detail-item">
          <span class="exam-detail-label">⏱ זמן כולל</span>
          <span class="exam-detail-value">${Math.floor(exam.duration)} דקות</span>
        </div>
        <div class="exam-detail-item">
          <span class="exam-detail-label">📊 ציון כולל</span>
          <span class="exam-detail-value" style="color:${passed ? 'var(--emerald)' : 'var(--red)'}">${overallPct}% ${passed ? '✅' : '❌'}</span>
        </div>
        <div class="exam-detail-item">
          <span class="exam-detail-label">📝 רמה</span>
          <span class="exam-detail-value">${exam.level}</span>
        </div>
      </div>
      
      <div style="text-align:center;margin:16px 0">
        ${passed ? `<span style="font-size:.85rem;color:var(--emerald);font-weight:700">✅ מוכן לגשת למבחן האמיתי!</span>` 
                  : `<span style="font-size:.85rem;color:var(--orange);font-weight:700">💪 חזור ותרגל עוד — אתה בדרך הנכונה!</span>`}
      </div>
      
      <div class="exam-results-actions">
        <button class="btn btn-primary btn-block" onclick="Exams.start('${exam.id}')">🔄 נסה שוב</button>
        <button class="btn btn-secondary btn-block" onclick="Exams.render()" style="margin-top:8px">← חזרה למבחנים</button>
      </div>
      <div style="height:20px"></div>
    </div>
  `;
  
  container.innerHTML = html;
  
  if (passed) {
    addXP(Math.max(10, Math.round(overallPct / 2)));
    confetti();
  }
}

// ═══════════════════════════════════════
// QUICK PRACTICE
// ═══════════════════════════════════════
function startQuickPractice(level, type) {
  const practice = QUICK_PRACTICE[type];
  if (!practice) { toast('סוג תרגול לא נמצא', 'error'); return; }
  
  isQuickPractice = true;
  practiceLevel = level;
  practiceType = type;
  
  currentExam = {
    id: 'quick_' + type,
    name: 'תרגול מהיר',
    fullName: practice.name,
    level: level || 'A2',
    icon: practice.icon,
    duration: 5,
    sections: [{
      id: type,
      name: practice.name,
      heName: `⚡ ${practice.name}`,
      duration: 5,
      instructions: 'ענה על 5 שאלות קצרות.',
      questions: shuffleArr([...practice.questions]).slice(0, 5)
    }]
  };
  
  currentSection = 0;
  currentQuestion = 0;
  answers = {};
  sectionTimeRemaining = 300; // 5 min
  examActive = true;
  
  startSectionTimer();
  renderQuestion();
}

// ═══════════════════════════════════════
// HISTORY
// ═══════════════════════════════════════
function getExamHistory() {
  try {
    return JSON.parse(localStorage.getItem('vl_exam_history')) || {};
  } catch { return {}; }
}

function saveExamResult(examId, score) {
  const history = getExamHistory();
  if (!history[examId]) history[examId] = [];
  history[examId].push({ score, date: Date.now() });
  // Keep last 20
  if (history[examId].length > 20) history[examId] = history[examId].slice(-20);
  localStorage.setItem('vl_exam_history', JSON.stringify(history));
}

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════
function shuffleArr(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function esc(s) {
  return String(s).replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ');
}

function fuzzyMatch(a, b) {
  if (!a || !b) return 0;
  a = a.toLowerCase().trim();
  b = b.toLowerCase().trim();
  if (a === b) return 100;
  
  // Simple Levenshtein-based similarity
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 100;
  
  // Count matching chars in sequence
  let matches = 0;
  let ai = 0, bi = 0;
  while (ai < a.length && bi < b.length) {
    if (a[ai] === b[bi]) { matches++; ai++; bi++; }
    else if (a[ai] === ' ' || b[bi] === ' ') { ai += a[ai]===' '?1:0; bi += b[bi]===' '?1:0; }
    else { ai++; bi++; }
  }
  
  return Math.round((matches / maxLen) * 100);
}

// ═══════════════════════════════════════
// EXPOSE
// ═══════════════════════════════════════
return {
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
  showResults
};

})();
