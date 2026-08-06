/* ═══════════════════════════════════════════════
   VolaLingo v5 — Stories
   Reading comprehension with MC questions
   Duolingo-level interactive stories
   ═══════════════════════════════════════════════ */

window.VolaStories = (() => {
  'use strict';

  const STORIES = [
    {
      id: 'cafe',
      level: 'A1',
      title: '☕ Al Caffè',
      icon: '☕',
      lines: [
        { it: 'Marco entra in un caffè a Roma.', he: 'מרקו נכנס לבית קפה ברומא.' },
        { it: '"Buongiorno!" dice il barista.', he: '"בוקר טוב!" אומר הבריסטה.' },
        { it: '"Buongiorno! Vorrei un caffè, per favore."', he: '"בוקר טוב! הייתי רוצה קפה, בבקשה."' },
        { it: '"Certo. Lo vuoi macchiato o normale?"', he: '"בוודאי. אתה רוצה אותו מוכתם (בחלב) או רגיל?"' },
        { it: '"Normale, grazie."', he: '"רגיל, תודה."' },
        { it: 'Il barista prepara il caffè.', he: 'הבריסטה מכין את הקפה.' },
        { it: '"Ecco! Sono 1,50 euro."', he: '"הנה! זה 1.50 יורו."' },
        { it: 'Marco paga e beve il caffè.', he: 'מרקו משלם ושותה את הקפה.' },
        { it: '"Buona giornata!" dice Marco.', he: '"יום טוב!" אומר מרקו.' },
        { it: '"Arrivederci!" risponde il barista.', he: '"להתראות!" עונה הבריסטה.' },
      ],
      questions: [
        { q: 'Dove entra Marco?', he: 'לאן מרקו נכנס?', options: ['In un ristorante', 'In un caffè a Roma', 'In un museo', 'In una biblioteca'], correct: 1 },
        { q: 'Cosa ordina Marco?', he: 'מה מרקו מזמין?', options: ['Un tè', 'Una pizza', 'Un caffè', 'Un vino'], correct: 2 },
        { q: 'Quanto costa il caffè?', he: 'כמה עולה הקפה?', options: ['50 centesimi', '1,50 euro', '2 euro', '5 euro'], correct: 1 },
        { q: 'Cosa dice Marco quando esce?', he: 'מה מרקו אומר כשהוא יוצא?', options: ['Buonasera', 'Buona giornata', 'Arrivederci', 'Grazie'], correct: 1 },
      ]
    },
    {
      id: 'famiglia',
      level: 'A1',
      title: '👨‍👩‍👧‍👦 La Famiglia Bianchi',
      icon: '👨‍👩‍👧‍👦',
      lines: [
        { it: 'La famiglia Bianchi vive a Napoli.', he: 'משפחת ביאנקי גרה בנאפולי.' },
        { it: 'Il papà si chiama Antonio e ha 45 anni.', he: 'אבא קוראים לו אנטוניו והוא בן 45.' },
        { it: 'La mamma si chiama Maria e ha 42 anni.', he: 'אמא קוראים לה מריה והיא בת 42.' },
        { it: 'Hanno due figli: Luca e Sofia.', he: 'יש להם שני ילדים: לוקה וסופיה.' },
        { it: 'Luca ha 10 anni e Sofia ha 7 anni.', he: 'לוקה בן 10 וסופיה בת 7.' },
        { it: 'La nonna abita con loro.', he: 'סבתא גרה איתם.' },
        { it: 'La nonna si chiama Rosa e ha 75 anni.', he: 'לסבתא קוראים רוזה והיא בת 75.' },
        { it: 'La domenica tutta la famiglia mangia insieme.', he: 'ביום ראשון כל המשפחה אוכלת יחד.' },
        { it: 'La nonna prepara sempre la pasta fatta in casa.', he: 'סבתא תמיד מכינה פסטה ביתית.' },
        { it: 'Tutti dicono: "Che buona, nonna!"', he: 'כולם אומרים: "כמה טעים, סבתא!"' },
      ],
      questions: [
        { q: 'Dove vive la famiglia Bianchi?', he: 'איפה גרה משפחת ביאנקי?', options: ['A Roma', 'A Milano', 'A Napoli', 'A Firenze'], correct: 2 },
        { q: 'Quanti figli hanno Antonio e Maria?', he: 'כמה ילדים יש לאנטוניו ומריה?', options: ['Uno', 'Due', 'Tre', 'Quattro'], correct: 1 },
        { q: 'Come si chiama la nonna?', he: 'איך קוראים לסבתא?', options: ['Maria', 'Sofia', 'Rosa', 'Anna'], correct: 2 },
        { q: 'Cosa prepara la nonna la domenica?', he: 'מה סבתא מכינה ביום ראשון?', options: ['La pizza', 'La pasta fatta in casa', 'Il dolce', 'Il caffè'], correct: 1 },
        { q: 'Quanti anni ha la nonna?', he: 'בת כמה הסבתא?', options: ['65', '70', '75', '80'], correct: 2 },
      ]
    },
    {
      id: 'scuola',
      level: 'A1',
      title: '📚 A Scuola',
      icon: '📚',
      lines: [
        { it: 'Oggi è lunedì. Luca va a scuola.', he: 'היום יום שני. לוקה הולך לבית הספר.' },
        { it: 'La sua scuola è vicino a casa.', he: 'בית הספר שלו קרוב לבית.' },
        { it: 'Luca cammina per 5 minuti.', he: 'לוקה הולך 5 דקות.' },
        { it: 'In classe c\'è la maestra Chiara.', he: 'בכיתה יש את המורה קיארה.' },
        { it: '"Buongiorno, maestra!" dicono gli studenti.', he: '"בוקר טוב, מורה!" אומרים התלמידים.' },
        { it: 'Oggi studiano matematica e italiano.', he: 'היום לומדים מתמטיקה ואיטלקית.' },
        { it: 'Luca ama la matematica.', he: 'לוקה אוהב מתמטיקה.' },
        { it: 'Sofia invece preferisce l\'italiano.', he: 'סופיה לעומת זאת מעדיפה איטלקית.' },
        { it: 'A mezzogiorno mangiano la pizza alla mensa.', he: 'בצהריים הם אוכלים פיצה בקפיטריה.' },
        { it: 'La scuola finisce alle quattro.', he: 'בית הספר מסתיים בארבע.' },
      ],
      questions: [
        { q: 'Che giorno è?', he: 'איזה יום היום?', options: ['Martedì', 'Lunedì', 'Domenica', 'Venerdì'], correct: 1 },
        { q: 'Quanto tempo cammina Luca?', he: 'כמה זמן לוקה הולך?', options: ['10 minuti', '5 minuti', '15 minuti', '2 minuti'], correct: 1 },
        { q: 'Quali materie studiano oggi?', he: 'אילו מקצועות לומדים היום?', options: ['Storia e geografia', 'Matematica e italiano', 'Scienze e arte', 'Inglese e musica'], correct: 1 },
        { q: 'A che ora finisce la scuola?', he: 'באיזו שעה מסתיים בית הספר?', options: ['Alle due', 'Alle tre', 'Alle quattro', 'Alle cinque'], correct: 2 },
      ]
    },
    {
      id: 'pizza',
      level: 'A1',
      title: '🍕 La Pizza Napoletana',
      icon: '🍕',
      lines: [
        { it: 'Marco e i suoi amici vanno in una pizzeria.', he: 'מרקו וחבריו הולכים לפיצריה.' },
        { it: 'La pizzeria si chiama "Da Gennaro".', he: 'הפיצריה נקראת "אצל ג\'נארו".' },
        { it: 'Il pizzaiolo si chiama Gennaro.', he: 'הפיצאיולו (אופה הפיצה) נקרא ג\'נארו.' },
        { it: '"Buonasera! Cosa desiderate?"', he: '"ערב טוב! מה אתם רוצים?"' },
        { it: 'Marco ordina una Margherita.', he: 'מרקו מזמין מרגריטה.' },
        { it: 'Sofia ordina una Marinara.', he: 'סופיה מזמינה מרינארה.' },
        { it: 'La pizza Margherita ha pomodoro, mozzarella e basilico.', he: 'לפיצה מרגריטה יש עגבנייה, מוצרלה ובזיליקום.' },
        { it: 'La pizza è molto buona!', he: 'הפיצה מאוד טעימה!' },
        { it: 'Marco dice: "È la migliore pizza di Napoli!"', he: 'מרקו אומר: "זו הפיצה הכי טובה בנאפולי!"' },
        { it: 'Alla fine, Gennaro porta il conto: 30 euro.', he: 'בסוף, ג\'נארו מביא את החשבון: 30 יורו.' },
      ],
      questions: [
        { q: 'Come si chiama la pizzeria?', he: 'איך קוראים לפיצריה?', options: ['Da Marco', 'Da Gennaro', 'Da Napoli', 'Pizza Roma'], correct: 1 },
        { q: 'Cosa ordina Marco?', he: 'מה מרקו מזמין?', options: ['Una Marinara', 'Una Margherita', 'Una Capricciosa', 'Una Quattro Formaggi'], correct: 1 },
        { q: 'Quanto costa la pizza?', he: 'כמה עולה הפיצה?', options: ['20 euro', '30 euro in totale', '15 euro', '25 euro'], correct: 1 },
        { q: 'Quali ingredienti ha la Margherita?', he: 'מה יש בפיצה מרגריטה?', options: ['Pomodoro, mozzarella e basilico', 'Pomodoro e olive', 'Mozzarella e funghi', 'Pomodoro, prosciutto e mozzarella'], correct: 0 },
      ]
    },
    {
      id: 'mercato',
      level: 'A2',
      title: '🛒 Al Mercato',
      icon: '🛒',
      lines: [
        { it: 'Ogni sabato Maria va al mercato di Napoli.', he: 'כל שבת מריה הולכת לשוק של נאפולי.' },
        { it: 'Il mercato è molto grande e colorato.', he: 'השוק מאוד גדול וצבעוני.' },
        { it: 'Ci sono frutta, verdura, pesce e formaggi.', he: 'יש פירות, ירקות, דגים וגבינות.' },
        { it: '"Quanto costano le mele?" chiede Maria.', he: '"כמה עולות התפוחים?" שואלת מריה.' },
        { it: '"2 euro al chilo!" risponde il venditore.', he: '"2 יורו לקילו!" עונה המוכר.' },
        { it: 'Maria compra anche i pomodori per la salsa.', he: 'מריה קונה גם עגבניות לרוטב.' },
        { it: 'Poi compra il parmigiano fresco.', he: 'אחר כך היא קונה פרמזן טרי.' },
        { it: '"Quanto costa il pesce oggi?"', he: '"כמה עולה הדג היום?"' },
        { it: '"Il salmone è 15 euro al chilo."', he: '"הסלמון 15 יורו לקילו."' },
        { it: 'Maria spende 35 euro in totale.', he: 'מריה מוציאה 35 יורו בסך הכל.' },
      ],
      questions: [
        { q: 'Quando va Maria al mercato?', he: 'מתי מריה הולכת לשוק?', options: ['La domenica', 'Il sabato', 'Il lunedì', 'Il venerdì'], correct: 1 },
        { q: 'Quanto costano le mele?', he: 'כמה עולים התפוחים?', options: ['1 euro al chilo', '2 euro al chilo', '3 euro al chilo', '4 euro al chilo'], correct: 1 },
        { q: 'Cosa compra Maria per la salsa?', he: 'מה מריה קונה לרוטב?', options: ['Le cipolle', 'I pomodori', 'Il basilico', 'L\'olio'], correct: 1 },
        { q: 'Quanto spende Maria in totale?', he: 'כמה מריה מוציאה בסך הכל?', options: ['25 euro', '30 euro', '35 euro', '40 euro'], correct: 2 },
      ]
    },
    {
      id: 'treno',
      level: 'A2',
      title: '🚂 In Treno per Firenze',
      icon: '🚂',
      lines: [
        { it: 'Sofia prende il treno per Firenze.', he: 'סופיה עולה על הרכבת לפירנצה.' },
        { it: 'Il biglietto costa 25 euro.', he: 'הכרטיס עולה 25 יורו.' },
        { it: 'Il treno parte alle 9:30.', he: 'הרכבת יוצאת ב-9:30.' },
        { it: 'Sofia trova un posto vicino al finestrino.', he: 'סופיה מוצאת מקום ליד החלון.' },
        { it: 'Il viaggio dura 3 ore.', he: 'הנסיעה אורכת 3 שעות.' },
        { it: 'Durante il viaggio, Sofia legge un libro.', he: 'במהלך הנסיעה, סופיה קוראת ספר.' },
        { it: 'Il controllore chiede il biglietto.', he: 'הכרטיסן מבקש את הכרטיס.' },
        { it: '"Tutto a posto, signorina!" dice il controllore.', he: '"הכל בסדר, גברת!" אומר הכרטיסן.' },
        { it: 'A Firenze, Sofia visita il Duomo.', he: 'בפירנצה, סופיה מבקרת בדואומו.' },
        { it: 'La città è bellissima!', he: 'העיר יפה מאוד!' },
      ],
      questions: [
        { q: 'Quanto costa il biglietto?', he: 'כמה עולה הכרטיס?', options: ['15 euro', '20 euro', '25 euro', '30 euro'], correct: 2 },
        { q: 'A che ora parte il treno?', he: 'באיזו שעה הרכבת יוצאת?', options: ['Alle 8:30', 'Alle 9:00', 'Alle 9:30', 'Alle 10:00'], correct: 2 },
        { q: 'Quanto dura il viaggio?', he: 'כמה אורכת הנסיעה?', options: ['2 ore', '3 ore', '4 ore', '5 ore'], correct: 1 },
        { q: 'Cosa fa Sofia durante il viaggio?', he: 'מה סופיה עושה במהלך הנסיעה?', options: ['Ascolta musica', 'Dorme', 'Legge un libro', 'Mangia'], correct: 2 },
        { q: 'Cosa visita Sofia a Firenze?', he: 'מה סופיה מבקרת בפירנצה?', options: ['Il museo', 'Il Duomo', 'Il ponte', 'Il giardino'], correct: 1 },
      ]
    },
    {
      id: 'compl',
      level: 'A2',
      title: '🎂 Il Compleanno di Luca',
      icon: '🎂',
      lines: [
        { it: 'Oggi è il compleanno di Luca: ha 11 anni!', he: 'היום יום ההולדת של לוקה: הוא בן 11!' },
        { it: 'Maria prepara una torta al cioccolato.', he: 'מריה מכינה עוגת שוקולד.' },
        { it: 'Antonio compra un pallone da calcio.', he: 'אנטוניו קונה כדור רגל.' },
        { it: 'La nonna Rosa regala un libro di fiabe.', he: 'סבתא רוזה נותנת ספר אגדות.' },
        { it: 'Arrivano gli amici di Luca.', he: 'מגיעים החברים של לוקה.' },
        { it: 'Giocano tutti insieme in giardino.', he: 'כולם משחקים יחד בגינה.' },
        { it: 'La mamma serve la pizza e la torta.', he: 'אמא מגישה פיצה ועוגה.' },
        { it: 'Luca soffia le candeline e fa un desiderio.', he: 'לוקה מכבה את הנרות ומביע משאלה.' },
        { it: 'Tutti cantano "Tanti auguri a te!"', he: 'כולם שרים "יום הולדת שמח!"' },
        { it: 'Luca dice: "Grazie a tutti! È il miglior compleanno!"', he: 'לוקה אומר: "תודה לכולם! זה יום ההולדת הכי טוב!"' },
      ],
      questions: [
        { q: 'Quanti anni compie Luca?', he: 'בן כמה לוקה?', options: ['10', '11', '12', '13'], correct: 1 },
        { q: 'Cosa regala la nonna a Luca?', he: 'מה סבתא נותנת ללוקה?', options: ['Un pallone', 'Un libro di fiabe', 'Una bicicletta', 'Un videogioco'], correct: 1 },
        { q: 'Cosa prepara Maria?', he: 'מה מריה מכינה?', options: ['La pizza', 'La pasta', 'Una torta al cioccolato', 'Il gelato'], correct: 2 },
        { q: 'Cosa fa Luca dopo la torta?', he: 'מה לוקה עושה אחרי העוגה?', options: ['Apre i regali', 'Soffia le candeline', 'Gioca a calcio', 'Va a dormire'], correct: 1 },
      ]
    },
    {
      id: 'cucina',
      level: 'A2',
      title: '👩‍🍳 La Pasta della Nonna',
      icon: '👩‍🍳',
      lines: [
        { it: 'La nonna Rosa insegna a Sofia a fare la pasta.', he: 'סבתא רוזה מלמדת את סופיה להכין פסטה.' },
        { it: 'Prendono farina, uova e un pizzico di sale.', he: 'הן לוקחות קמח, ביצים וקורט מלח.' },
        { it: '"Prima si forma una fontana con la farina."', he: '"קודם יוצרים מזרקה עם הקמח."' },
        { it: 'Sofia rompe le uova al centro.', he: 'סופיה שוברת את הביצים במרכז.' },
        { it: 'Impastano per 10 minuti.', he: 'הן לשות 10 דקות.' },
        { it: '"L\'impasto deve essere liscio ed elastico."', he: '"הבצק צריך להיות חלק וגמיש."' },
        { it: 'Poi stendono la pasta con il mattarello.', he: 'אחר כך מרדדות את הבצק בעזרת מערוך.' },
        { it: 'Tagliano le tagliatelle a mano.', he: 'הן חותכות טליאטלה ביד.' },
        { it: 'Cuciono la pasta per 3 minuti in acqua bollente.', he: 'מבשלות את הפסטה 3 דקות במים רותחים.' },
        { it: '"Mamma mia, che buona!" dice Sofia.', he: '"מדהים, כמה טעים!" אומרת סופיה.' },
      ],
      questions: [
        { q: 'Quali ingredienti servono per la pasta?', he: 'אילו מרכיבים צריכים לפסטה?', options: ['Farina, uova, sale', 'Farina, acqua, olio', 'Uova, latte, zucchero', 'Farina, uova, lievito'], correct: 0 },
        { q: 'Quanto tempo impastano?', he: 'כמה זמן הן לשות?', options: ['5 minuti', '10 minuti', '15 minuti', '20 minuti'], correct: 1 },
        { q: 'Con cosa stendono la pasta?', he: 'במה מרדדות את הבצק?', options: ['Con le mani', 'Con il mattarello', 'Con la macchina', 'Con un bicchiere'], correct: 1 },
        { q: 'Quanto tempo cuoce la pasta?', he: 'כמה זמן הפסטה מתבשלת?', options: ['1 minuto', '2 minuti', '3 minuti', '5 minuti'], correct: 2 },
      ]
    },
    {
      id: 'mare',
      level: 'A2',
      title: '🌊 Una Giornata al Mare',
      icon: '🌊',
      lines: [
        { it: 'È luglio e fa molto caldo a Napoli.', he: 'יולי וחם מאוד בנאפולי.' },
        { it: 'La famiglia Bianchi va al mare.', he: 'משפחת ביאנקי הולכת לים.' },
        { it: 'Prendono l\'ombrellone, gli asciugamani e il pranzo.', he: 'הם לוקחים שמשייה, מגבות וארוחת צהריים.' },
        { it: 'La spiaggia è molto affollata.', he: 'החוף מאוד עמוס.' },
        { it: 'Luca e Sofia corrono in acqua.', he: 'לוקה וסופיה רצים למים.' },
        { it: 'L\'acqua è fresca e pulita.', he: 'המים צוננים ונקיים.' },
        { it: 'Antonio legge il giornale sotto l\'ombrellone.', he: 'אנטוניו קורא עיתון תחת השמשייה.' },
        { it: 'Maria prepara i panini per tutti.', he: 'מריה מכינה כריכים לכולם.' },
        { it: 'Nel pomeriggio giocano a pallone sulla spiaggia.', he: 'אחר הצהריים הם משחקים בכדור על החוף.' },
        { it: 'Tornano a casa alle 7 di sera, stanchi ma felici.', he: 'הם חוזרים הביתה ב-7 בערב, עייפים אבל שמחים.' },
      ],
      questions: [
        { q: 'In che mese succede la storia?', he: 'באיזה חודש קורה הסיפור?', options: ['Giugno', 'Luglio', 'Agosto', 'Settembre'], correct: 1 },
        { q: 'Com\'è l\'acqua?', he: 'איך המים?', options: ['Calda e sporca', 'Fresca e pulita', 'Fredda e torbida', 'Calda e pulita'], correct: 1 },
        { q: 'Cosa fa Antonio?', he: 'מה אנטוניו עושה?', options: ['Nuota', 'Dorme', 'Legge il giornale', 'Gioca a pallone'], correct: 2 },
        { q: 'A che ora tornano a casa?', he: 'באיזו שעה הם חוזרים הביתה?', options: ['Alle 5', 'Alle 6', 'Alle 7', 'Alle 8'], correct: 2 },
      ]
    },
    {
      id: 'festa',
      level: 'B1',
      title: '🎪 La Festa di San Gennaro',
      icon: '🎪',
      lines: [
        { it: 'A Napoli, il 19 settembre si festeggia San Gennaro.', he: 'בנאפולי, ב-19 בספטמבר חוגגים את סן ג\'נארו.' },
        { it: 'È il santo patrono della città.', he: 'הוא הפטרון של העיר.' },
        { it: 'Tutta la città è in festa.', he: 'כל העיר בחגיגה.' },
        { it: 'Le strade sono decorate con bandiere e luci.', he: 'הרחובות מקושטים בדגלים ובאורות.' },
        { it: 'C\'è musica dal vivo in ogni piazza.', he: 'יש מוזיקה חיה בכל כיכר.' },
        { it: 'I venditori ambulanti offrono cibo tipico.', he: 'רוכלים מציעים אוכל טיפוסי.' },
        { it: 'Marco assaggia zeppole, taralli e panini col polpo.', he: 'מרקו טועם זפולה, טארלי וסנדוויצ\'ים עם תמנון.' },
        { it: 'La sera, i fuochi d\'artificio illuminano il cielo.', he: 'בערב, זיקוקים מאירים את השמיים.' },
        { it: 'Tutti ballano e cantano per le strade.', he: 'כולם רוקדים ושרים ברחובות.' },
        { it: '"Napoli è bellissima!" dice Marco emozionato.', he: '"נאפולי יפה מאוד!" אומר מרקו נרגש.' },
      ],
      questions: [
        { q: 'Quando si festeggia San Gennaro?', he: 'מתי חוגגים את סן ג\'נארו?', options: ['Il 19 agosto', 'Il 19 settembre', 'Il 15 settembre', 'Il 25 settembre'], correct: 1 },
        { q: 'Cosa c\'è nelle piazze durante la festa?', he: 'מה יש בכיכרות במהלך החגיגה?', options: ['Teatro', 'Musica dal vivo', 'Cinema', 'Mostre'], correct: 1 },
        { q: 'Quale cibo assaggia Marco?', he: 'איזה אוכל מרקו טועם?', options: ['Pizza e pasta', 'Zeppole, taralli e panini col polpo', 'Gelato e dolci', 'Panini e patatine'], correct: 1 },
        { q: 'Cosa illumina il cielo la sera?', he: 'מה מאיר את השמיים בערב?', options: ['Le stelle', 'I fuochi d\'artificio', 'La luna', 'Le lanterne'], correct: 1 },
      ]
    },
    {
      id: 'viaggio_roma',
      level: 'B1',
      title: '🏛️ Un Giorno a Roma',
      icon: '🏛️',
      lines: [
        { it: 'Marco visita Roma per la prima volta.', he: 'מרקו מבקר ברומא בפעם הראשונה.' },
        { it: 'La mattina presto va al Colosseo.', he: 'בבוקר מוקדם הוא הולך לקולוסיאום.' },
        { it: '"È incredibile!" esclama davanti all\'antico anfiteatro.', he: '"זה מדהים!" הוא קורא מול האמפיתיאטרון העתיק.' },
        { it: 'Poi cammina fino al Foro Romano.', he: 'אחר כך הוא הולך ברגל לפורום רומאנום.' },
        { it: 'Il sole è forte ma Marco è affascinato.', he: 'השמש חזקה אך מרקו מרותק.' },
        { it: 'A mezzogiorno mangia un gelato vicino alla Fontana di Trevi.', he: 'בצהריים הוא אוכל גלידה ליד מזרקת טרווי.' },
        { it: 'Lancia una moneta nella fontana per tornare un giorno.', he: 'הוא זורק מטבע למזרקה כדי לחזור יום אחד.' },
        { it: 'Nel pomeriggio visita i Musei Vaticani.', he: 'אחר הצהריים הוא מבקר במוזיאוני הוותיקן.' },
        { it: '"La Cappella Sistina è un capolavoro!" pensa.', he: '"הקפלה הסיסטינית היא יצירת מופת!" הוא חושב.' },
        { it: 'La sera, Marco è stanco ma felice.', he: 'בערב, מרקו עייף אבל שמח.' },
      ],
      questions: [
        { q: 'Cosa visita Marco la mattina?', he: 'מה מרקו מבקר בבוקר?', options: ['Il Vaticano', 'Il Colosseo', 'Il Foro Romano', 'La Fontana di Trevi'], correct: 1 },
        { q: 'Cosa mangia Marco a mezzogiorno?', he: 'מה מרקו אוכל בצהריים?', options: ['Una pizza', 'Un gelato', 'La pasta', 'Un panino'], correct: 1 },
        { q: 'Perché lancia una moneta nella fontana?', he: 'למה הוא זורק מטבע למזרקה?', options: ['Per fare un desiderio', 'Per tornare un giorno a Roma', 'Per portafortuna', 'Per vedere l\'acqua'], correct: 1 },
        { q: 'Cosa pensa Marco della Cappella Sistina?', he: 'מה מרקו חושב על הקפלה הסיסטינית?', options: ['È piccola', 'È un capolavoro', 'È noiosa', 'È vecchia'], correct: 1 },
      ]
    },
    {
      id: 'lavoro',
      level: 'B1',
      title: '💼 Il Primo Giorno di Lavoro',
      icon: '💼',
      lines: [
        { it: 'Sofia ha trovato lavoro in un ristorante.', he: 'סופיה מצאה עבודה במסעדה.' },
        { it: 'È il suo primo giorno e lei è un po\' nervosa.', he: 'זה היום הראשון שלה והיא קצת לחוצה.' },
        { it: 'Il ristorante si chiama "Il Gatto Goloso".', he: 'המסעדה נקראת "החתול החמדן".' },
        { it: 'Il proprietario, il signor Rossi, è molto gentile.', he: 'הבעלים, מר רוסי, מאוד נחמד.' },
        { it: '"Non preoccuparti, ti insegneremo tutto!"', he: '"אל תדאגי, נלמד אותך הכל!"' },
        { it: 'Sofia impara a prendere gli ordini dei clienti.', he: 'סופיה לומדת לקחת הזמנות מלקוחות.' },
        { it: 'Il primo cliente ordina spaghetti alle vongole.', he: 'הלקוח הראשון מזמין ספגטי וונגולה.' },
        { it: 'Sofia scrive l\'ordine correttamente.', he: 'סופיה כותבת את ההזמנה נכון.' },
        { it: 'Alla fine del turno, ha servito 15 tavoli.', he: 'בסוף המשמרת, היא שירתה 15 שולחנות.' },
        { it: 'Il signor Rossi dice: "Brava Sofia! Tornerai domani?"', he: 'מר רוסי אומר: "כל הכבוד סופיה! תחזרי מחר?"' },
      ],
      questions: [
        { q: 'Come si chiama il ristorante?', he: 'איך קוראים למסעדה?', options: ['La Bella Napoli', 'Il Gatto Goloso', 'Da Gennaro', 'Roma Antica'], correct: 1 },
        { q: 'Come si chiama il proprietario?', he: 'איך קוראים לבעלים?', options: ['Il signor Bianchi', 'Il signor Rossi', 'Gennaro', 'Marco'], correct: 1 },
        { q: 'Cosa ordina il primo cliente?', he: 'מה הלקוח הראשון מזמין?', options: ['Pizza margherita', 'Spaghetti alle vongole', 'Insalata mista', 'Bistecca'], correct: 1 },
        { q: 'Quanti tavoli serve Sofia?', he: 'כמה שולחנות סופיה שירתה?', options: ['10', '12', '15', '20'], correct: 2 },
      ]
    },
    {
      id: 'incontro',
      level: 'B1',
      title: '🤝 L\'Incontro',
      icon: '🤝',
      lines: [
        { it: 'Marco e Sofia si incontrano al parco.', he: 'מרקו וסופיה נפגשים בפארק.' },
        { it: 'Marco è nervoso ma felice.', he: 'מרקו לחוץ אבל שמח.' },
        { it: '"Ciao Sofia! Come stai?" chiede Marco.', he: '"היי סופיה! מה שלומך?" שואל מרקו.' },
        { it: '"Bene, grazie! E tu?" risponde Sofia.', he: '"בסדר, תודה! ואתה?" עונה סופיה.' },
        { it: 'Camminano insieme nel parco.', he: 'הם הולכים יחד בפארק.' },
        { it: 'Parlano della musica che piace a entrambi.', he: 'הם מדברים על מוזיקה ששניהם אוהבים.' },
        { it: 'Marco dice: "Mi piace il jazz, e a te?"', he: 'מרקו אומר: "אני אוהב ג\'אז, ואת?"' },
        { it: '"Anche a me! Soprattutto il jazz italiano."', he: '"גם אני! בעיקר ג\'אז איטלקי."' },
        { it: 'Dopo un\'ora, decidono di prendere un caffè insieme.', he: 'אחרי שעה, הם מחליטים לקחת קפה יחד.' },
        { it: 'Marco pensa: "Che bella giornata!"', he: 'מרקו חושב: "איזה יום יפה!"' },
      ],
      questions: [
        { q: 'Dove si incontrano Marco e Sofia?', he: 'איפה מרקו וסופיה נפגשים?', options: ['Al bar', 'Al parco', 'Al ristorante', 'Al cinema'], correct: 1 },
        { q: 'Di cosa parlano?', he: 'על מה הם מדברים?', options: ['Di sport', 'Di musica', 'Di viaggi', 'Di lavoro'], correct: 1 },
        { q: 'Quale musica piace a Marco?', he: 'איזו מוזיקה מרקו אוהב?', options: ['Il rock', 'Il jazz', 'La musica classica', 'Il pop'], correct: 1 },
        { q: 'Cosa fanno dopo un\'ora?', he: 'מה הם עושים אחרי שעה?', options: ['Vanno a casa', 'Prendono un caffè insieme', 'Vanno al cinema', 'Si salutano'], correct: 1 },
      ]
    },
    {
      id: 'teatro',
      level: 'B1',
      title: '🎭 La Scala di Milano',
      icon: '🎭',
      lines: [
        { it: 'La nonna Rosa ha un sogno: vedere un\'opera alla Scala.', he: 'לסבתא רוזה יש חלום: לראות אופרה בלה סקאלה.' },
        { it: 'Per il suo compleanno, i figli le regalano due biglietti.', he: 'ליום ההולדת שלה, הילדים קונים לה שני כרטיסים.' },
        { it: 'La nonna porta Sofia con sé.', he: 'סבתא לוקחת את סופיה איתה.' },
        { it: 'Indossano i vestiti migliori.', he: 'הן לובשות את הבגדים הכי יפים.' },
        { it: 'La Scala è magnifica, tutta oro e velluto rosso.', he: 'לה סקאלה מרהיבה, כולה זהב וקטיפה אדומה.' },
        { it: 'L\'opera è "La Traviata" di Verdi.', he: 'האופרה היא "לה טרוויאטה" של ורדי.' },
        { it: 'La musica è commovente.', he: 'המוזיקה מרגשת.' },
        { it: 'Sofia piange un po\' alla scena finale.', he: 'סופיה בוכה קצת בסצנה האחרונה.' },
        { it: 'Alla fine, tutto il pubblico applaude per 5 minuti.', he: 'בסוף, כל הקהל מוחא כפיים 5 דקות.' },
        { it: '"Grazie, famiglia mia! È stato il regalo più bello!"', he: '"תודה, משפחה שלי! זו הייתה המתנה הכי יפה!"' },
      ],
      questions: [
        { q: 'Qual è il sogno della nonna Rosa?', he: 'מה החלום של סבתא רוזה?', options: ['Andare a Roma', 'Vedere un\'opera alla Scala', 'Viaggiare in tutto il mondo', 'Imparare a cucinare'], correct: 1 },
        { q: 'Chi accompagna la nonna?', he: 'מי מלווה את סבתא?', options: ['Marco', 'Luca', 'Sofia', 'Antonio'], correct: 2 },
        { q: 'Quale opera vedono?', he: 'איזו אופרה הן רואות?', options: ['Il Barbiere di Siviglia', 'La Traviata', 'Rigoletto', 'La Bohème'], correct: 1 },
        { q: 'Per quanto tempo applaude il pubblico?', he: 'כמה זמן הקהל מוחא כפיים?', options: ['2 minuti', '3 minuti', '5 minuti', '10 minuti'], correct: 2 },
      ]
    },
    {
      id: 'ricetta',
      level: 'B2',
      title: '📝 La Ricetta Segreta',
      icon: '📝',
      lines: [
        { it: 'Gennaro, il pizzaiolo, ha una ricetta segreta.', he: 'ג\'נארו, אופה הפיצה, יש לו מתכון סודי.' },
        { it: 'Suo nonno gliel\'ha insegnata 50 anni fa.', he: 'סבא שלו לימד אותו את זה לפני 50 שנה.' },
        { it: 'L\'impasto della pizza richiede 24 ore di lievitazione.', he: 'בצק הפיצה דורש 24 שעות התפחה.' },
        { it: 'Gennaro usa farina tipo 00, acqua, lievito, sale e olio.', he: 'ג\'נארו משתמש בקמח מסוג 00, מים, שמרים, מלח ושמן.' },
        { it: 'Il segreto è la temperatura del forno: 485 gradi.', he: 'הסוד הוא טמפרטורת התנור: 485 מעלות.' },
        { it: 'Un giorno, un giornalista del "New York Times" viene a provare la pizza.', he: 'יום אחד, כתב מה"ניו יורק טיימס" בא לטעום את הפיצה.' },
        { it: 'Il giornalista mangia due pizze intere.', he: 'הכתב אוכל שתי פיצות שלמות.' },
        { it: '"È la pizza più buona del mondo!" scrive sul giornale.', he: '"זו הפיצה הכי טובה בעולם!" הוא כותב בעיתון.' },
        { it: 'Da quel giorno, la pizzeria di Gennaro è piena di turisti.', he: 'מהיום ההוא, הפיצריה של ג\'נארו מלאה בתיירים.' },
        { it: 'Gennaro sorride: "Il segreto rimane in famiglia!"', he: 'ג\'נארו מחייך: "הסוד נשאר במשפחה!"' },
      ],
      questions: [
        { q: 'Chi ha insegnato la ricetta a Gennaro?', he: 'מי לימד את ג\'נארו את המתכון?', options: ['Suo padre', 'Suo nonno', 'Sua madre', 'Un amico'], correct: 1 },
        { q: 'Quanto tempo lievita l\'impasto?', he: 'כמה זמן הבצק תופח?', options: ['12 ore', '24 ore', '48 ore', '6 ore'], correct: 1 },
        { q: 'Qual è la temperatura segreta del forno?', he: 'מה הטמפרטורה הסודית של התנור?', options: ['350 gradi', '400 gradi', '485 gradi', '500 gradi'], correct: 2 },
        { q: 'Cosa succede dopo l\'articolo del giornale?', he: 'מה קורה אחרי הכתבה בעיתון?', options: ['Niente', 'Arrivano molti turisti', 'Gennaro chiude', 'Il prezzo aumenta'], correct: 1 },
      ]
    },
    {
      id: 'arte',
      level: 'B2',
      title: '🎨 Alla Galleria degli Uffizi',
      icon: '🎨',
      lines: [
        { it: 'Sofia visita la Galleria degli Uffizi a Firenze.', he: 'סופיה מבקרת בגלריית אופיצי בפירנצה.' },
        { it: 'La galleria contiene opere di artisti famosi.', he: 'הגלריה מכילה יצירות של אמנים מפורסמים.' },
        { it: 'Sofia si ferma davanti alla "Nascita di Venere" di Botticelli.', he: 'סופיה עוצרת מול "הולדת ונוס" של בוטיצ\'לי.' },
        { it: '"Che meraviglia!" sussurra emozionata.', he: '"איזה פלא!" היא לוחשת נרגשת.' },
        { it: 'Poi osserva i dipinti di Leonardo da Vinci.', he: 'אחר כך היא מתבוננת בציורים של לאונרדו דה וינצ\'י.' },
        { it: 'Una guida spiega che "L\'Annunciazione" è del 1472.', he: 'מדריכה מסבירה ש"הבשורה" היא משנת 1472.' },
        { it: 'Sofia immagina di vivere nel Rinascimento.', he: 'סופיה מדמיינת שהיא חיה בתקופת הרנסנס.' },
        { it: 'Dopo due ore, si siede nel caffè del museo.', he: 'אחרי שעתיים, היא יושבת בבית הקפה של המוזיאון.' },
        { it: 'Scrive una cartolina alla nonna Rosa.', he: 'היא כותבת גלויה לסבתא רוזה.' },
        { it: '"L\'arte italiana è la più bella del mondo!" scrive.', he: '"האמנות האיטלקית היא הכי יפה בעולם!" היא כותבת.' },
      ],
      questions: [
        { q: 'Quale museo visita Sofia?', he: 'באיזה מוזיאון סופיה מבקרת?', options: ['Il Museo Vaticano', 'La Galleria degli Uffizi', 'Il Museo Egizio', 'La Pinacoteca di Brera'], correct: 1 },
        { q: 'Quale opera di Botticelli vede?', he: 'איזו יצירה של בוטיצ\'לי היא רואה?', options: ['La Primavera', 'La Nascita di Venere', 'Venere e Marte', 'Madonna del Magnificat'], correct: 1 },
        { q: 'In che anno è stata dipinta "L\'Annunciazione"?', he: 'באיזו שנה צוירה "הבשורה"?', options: ['1450', '1472', '1485', '1500'], correct: 1 },
        { q: 'Cosa scrive Sofia alla fine?', he: 'מה סופיה כותבת בסוף?', options: ['Una lettera', 'Una cartolina alla nonna', 'Un messaggio', 'Un diario'], correct: 1 },
      ]
    },
    {
      id: 'intervista',
      level: 'B2',
      title: '🎤 Un\'Intervista Importante',
      icon: '🎤',
      lines: [
        { it: 'Marco ha un colloquio di lavoro importante.', he: 'למרקו יש ראיון עבודה חשוב.' },
        { it: 'L\'azienda è una startup di moda a Milano.', he: 'החברה היא סטארט-אפ אופנה במילאנו.' },
        { it: 'Marco si prepara per una settimana.', he: 'מרקו מתכונן שבוע.' },
        { it: 'Il giorno del colloquio, indossa un vestito elegante.', he: 'ביום הראיון, הוא לובש חליפה אלגנטית.' },
        { it: 'Il direttore delle risorse umane fa molte domande.', he: 'מנהל משאבי האנוש שואל שאלות רבות.' },
        { it: '"Perché vuole lavorare nella moda?" chiede.', he: '"למה אתה רוצה לעבוד באופנה?" הוא שואל.' },
        { it: 'Marco racconta della sua passione per il design.', he: 'מרקו מספר על התשוקה שלו לעיצוב.' },
        { it: 'Mostra il suo portfolio di progetti.', he: 'הוא מציג את תיק העבודות שלו.' },
        { it: 'Il direttore è impressionato.', he: 'המנהל מתרשם.' },
        { it: '"Benvenuto in squadra, Marco!" dice alla fine.', he: '"ברוך הבא לצוות, מרקו!" הוא אומר בסוף.' },
      ],
      questions: [
        { q: 'Dove si trova l\'azienda?', he: 'איפה החברה נמצאת?', options: ['A Roma', 'A Milano', 'A Napoli', 'A Firenze'], correct: 1 },
        { q: 'Per quanto tempo si prepara Marco?', he: 'כמה זמן מרקו מתכונן?', options: ['Un giorno', 'Una settimana', 'Un mese', 'Tre giorni'], correct: 1 },
        { q: 'Cosa mostra Marco durante il colloquio?', he: 'מה מרקו מציג במהלך הראיון?', options: ['Il suo curriculum', 'Il suo portfolio', 'I suoi diplomi', 'Le sue referenze'], correct: 1 },
        { q: 'Qual è la reazione del direttore?', he: 'מהי תגובת המנהל?', options: ['È dubbioso', 'È impressionato', 'È annoiato', 'È arrabbiato'], correct: 1 },
      ]
    },
    {
      id: 'bicicletta',
      level: 'B2',
      title: '🚲 Gita in Bicicletta',
      icon: '🚲',
      lines: [
        { it: 'Marco e Luca decidono di fare una gita in bicicletta.', he: 'מרקו ולוקה מחליטים לצאת לטיול אופניים.' },
        { it: 'Percorrono la pista ciclabile che costeggia il mare.', he: 'הם רוכבים על שביל האופניים שליד הים.' },
        { it: 'Il cielo è azzurro e non c\'è una nuvola.', he: 'השמיים כחולים ואין ענן אחד.' },
        { it: 'Dopo 20 chilometri, si fermano in un piccolo paese.', he: 'אחרי 20 קילומטר, הם עוצרים בכפר קטן.' },
        { it: 'Il paese si chiama Positano ed è famoso per le sue spiagge.', he: 'הכפר נקרא פוזיטאנו ומפורסם בחופים שלו.' },
        { it: 'Bevono un limoncello fresco in un bar sulla piazza.', he: 'הם שותים לימונצ\'לו קריר בבר בכיכר.' },
        { it: 'Luca vede un negozio di ceramiche dipinte a mano.', he: 'לוקה רואה חנות קרמיקה מצוירת ביד.' },
        { it: 'Compra un piccolo piatto per la nonna.', he: 'הוא קונה צלחת קטנה לסבתא.' },
        { it: 'Tornano a Napoli nel tardo pomeriggio.', he: 'הם חוזרים לנאפולי אחר הצהריים מאוחר.' },
        { it: '"Che giornata fantastica!" dice Luca.', he: '"איזה יום נפלא!" אומר לוקה.' },
      ],
      questions: [
        { q: 'Dove fanno la gita Marco e Luca?', he: 'איפה מרקו ולוקה יוצאים לטיול?', options: ['In montagna', 'In bicicletta vicino al mare', 'A piedi in città', 'In macchina in campagna'], correct: 1 },
        { q: 'Quanti chilometri percorrono prima di fermarsi?', he: 'כמה קילומטר הם רוכבים לפני שעוצרים?', options: ['10 km', '15 km', '20 km', '30 km'], correct: 2 },
        { q: 'Come si chiama il paese dove si fermano?', he: 'איך קוראים לכפר שבו הם עוצרים?', options: ['Amalfi', 'Positano', 'Ravello', 'Sorrento'], correct: 1 },
        { q: 'Cosa compra Luca al negozio?', he: 'מה לוקה קונה בחנות?', options: ['Una ceramica', 'Un magnete', 'Una cartolina', 'Un piatto per la nonna'], correct: 3 },
      ]
    },
    {
      id: 'negozio',
      level: 'B2',
      title: '🛍️ Lo Shopping a Milano',
      icon: '🛍️',
      lines: [
        { it: 'Sofia va a fare shopping a Milano.', he: 'סופיה הולכת לקניות במילאנו.' },
        { it: 'La Galleria Vittorio Emanuele II è piena di negozi eleganti.', he: 'גלריה ויטוריו עמנואלה מלאה בחנויות אלגנטיות.' },
        { it: 'Sofia entra in una boutique di moda.', he: 'סופיה נכנסת לבוטיק אופנה.' },
        { it: 'La commessa chiede: "Posso aiutarla, signorina?"', he: 'המוכרת שואלת: "אפשר לעזור לך, גברת?"' },
        { it: '"Cerco un vestito per una cena formale."', he: '"אני מחפשת שמלה לארוחת ערב רשמית."' },
        { it: 'Prova tre vestiti diversi.', he: 'היא מנסה שלוש שמלות שונות.' },
        { it: 'Il vestito rosso le sta benissimo!', he: 'השמלה האדומה יושבת עליה מושלם!' },
        { it: '"Quanto costa?" chiede Sofia.', he: '"כמה זה עולה?" שואלת סופיה.' },
        { it: '"280 euro, signorina. Ma oggi c\'è il 20% di sconto."', he: '"280 יורו, גברת. אבל היום יש 20% הנחה."' },
        { it: 'Sofia compra il vestito e torna a casa felice.', he: 'סופיה קונה את השמלה וחוזרת הביתה שמחה.' },
      ],
      questions: [
        { q: 'Dove fa shopping Sofia?', he: 'איפה סופיה עושה קניות?', options: ['A Roma', 'A Napoli', 'A Milano', 'A Firenze'], correct: 2 },
        { q: 'Quanti vestiti prova Sofia?', he: 'כמה שמלות סופיה מנסה?', options: ['Due', 'Tre', 'Quattro', 'Cinque'], correct: 1 },
        { q: 'Quanto costa il vestito senza sconto?', he: 'כמה עולה השמלה בלי הנחה?', options: ['200 euro', '250 euro', '280 euro', '320 euro'], correct: 2 },
        { q: 'Che sconto c\'è oggi?', he: 'איזו הנחה יש היום?', options: ['10%', '15%', '20%', '30%'], correct: 2 },
      ]
    },
    {
      id: 'futuro',
      level: 'B2',
      title: '🔮 Sogni per il Futuro',
      icon: '🔮',
      lines: [
        { it: 'La famiglia Bianchi cena insieme la domenica sera.', he: 'משפחת ביאנקי סועדת יחד בערב ראשון.' },
        { it: 'Antonio chiede ai figli: "Cosa volete fare da grandi?"', he: 'אנטוניו שואל את הילדים: "מה אתם רוצים להיות כשתהיו גדולים?"' },
        { it: 'Luca risponde: "Voglio fare il calciatore!"', he: 'לוקה עונה: "אני רוצה להיות כדורגלן!"' },
        { it: 'Sofia dice: "Io voglio aprire un ristorante italiano."', he: 'סופיה אומרת: "אני רוצה לפתוח מסעדה איטלקית."' },
        { it: 'Maria sorride: "Il ristorante più buono di Napoli!"', he: 'מריה מחייכת: "המסעדה הכי טעימה בנאפולי!"' },
        { it: 'La nonna Rosa dice: "Io voglio vedere i miei nipoti felici."', he: 'סבתא רוזה אומרת: "אני רוצה לראות את הנכדים שלי שמחים."' },
        { it: 'Antonio prende la mano di Maria.', he: 'אנטוניו לוקח את היד של מריה.' },
        { it: '"Il mio sogno è vedere la nostra famiglia unita e felice."', he: '"החלום שלי הוא לראות את המשפחה שלנו מאוחדת ומאושרת."' },
        { it: 'Tutti brindano con un bicchiere di vino.', he: 'כולם מרימים כוסית יין.' },
        { it: '"Alla famiglia! Cin cin!"', he: '"למשפחה! לחיים!"' },
      ],
      questions: [
        { q: 'Cosa vuole fare Luca da grande?', he: 'מה לוקה רוצה להיות כשיהיה גדול?', options: ['Il cuoco', 'Il calciatore', 'Il dottore', 'L\'insegnante'], correct: 1 },
        { q: 'Cosa vuole aprire Sofia?', he: 'מה סופיה רוצה לפתוח?', options: ['Una pasticceria', 'Un ristorante italiano', 'Un negozio di moda', 'Un bar'], correct: 1 },
        { q: 'Qual è il sogno della nonna?', he: 'מה החלום של סבתא?', options: ['Viaggiare', 'Vedere i nipoti felici', 'Andare in pensione', 'Comprare una casa'], correct: 1 },
        { q: 'Come brindano alla fine?', he: 'איך הם מרימים כוסית בסוף?', options: ['Alla salute', 'Alla famiglia', 'Al futuro', 'A Napoli'], correct: 1 },
      ]
    },
  ];

  // ═══ STATE ═══
  let currentStory = null;
  let currentLine = 0;
  let currentQuestion = 0;
  let correctCount = 0;
  let answeredQuestions = {};
  let phase = 'list'; // 'list' | 'reading' | 'quiz' | 'results'

  // ═══ RENDER ═══
  function render() {
    const container = document.getElementById('storyContent');
    if (!container) return;

    if (phase === 'list') renderList(container);
    else if (phase === 'reading') renderReading(container);
    else if (phase === 'quiz') renderQuiz(container);
    else if (phase === 'results') renderResults(container);
  }

  function renderList(container) {
    let html = '<h2 class="section-title"><span class="emoji">📖</span> סיפורים באיטלקית</h2>';
    html += '<p style="font-size:.85rem;color:var(--text2);margin-bottom:16px">קרא סיפורים קצרים באיטלקית וענה על שאלות הבנה. מתאים לכל הרמות!</p>';

    // Filter by level
    const levels = ['A1', 'A2', 'B1', 'B2'];
    levels.forEach(level => {
      const stories = STORIES.filter(s => s.level === level);
      if (stories.length === 0) return;
      
      const levelNames = { A1: '🌱 מתחילים', A2: '☀️ בסיסי', B1: '🌳 בינוני', B2: '🏛️ מתקדם' };
      const levelColors = { A1: '#58cc02', A2: '#1cb0f6', B1: '#ff9600', B2: '#ce82ff' };
      
      html += `<h3 style="color:${levelColors[level]};margin:24px 0 8px;font-size:.95rem">${levelNames[level]}</h3>`;
      html += '<div class="story-grid">';
      
      stories.forEach(s => {
        const progress = getStoryProgress(s.id);
        const progressBar = progress > 0 ? 
          `<div class="progress-bar" style="height:4px;margin-top:8px"><div class="progress-fill" style="width:${progress}%;background:${levelColors[level]}"></div></div>` :
          '';
        
        html += `
          <div class="card story-card" onclick="VolaStories.open('${s.id}')" style="cursor:pointer;padding:16px;text-align:center;">
            <div style="font-size:2.5rem;margin-bottom:8px">${s.icon}</div>
            <div style="font-weight:700;font-size:.9rem">${s.title}</div>
            <div style="font-size:.75rem;color:var(--text3);margin-top:4px">${s.questions.length} שאלות</div>
            ${progressBar}
          </div>
        `;
      });
      
      html += '</div>';
    });
    
    if (STORIES.length === 0) {
      html += '<div class="card" style="padding:24px;text-align:center;color:var(--text2)">📚 בקרוב יהיו סיפורים נוספים!</div>';
    }

    html += `
      <style>
        .story-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        .story-card { transition:transform 0.15s; }
        .story-card:active { transform:scale(0.97); }
        .story-reader { max-width:500px; margin:0 auto; }
        .story-line { font-family:var(--font-it); font-size:1.15rem; font-weight:700; line-height:1.7; padding:12px; border-radius:12px; margin-bottom:8px; transition:all 0.3s; }
        .story-line.active { background:var(--primary-light); }
        .story-line.he { font-family:var(--font-he); font-size:.9rem; color:var(--text2); font-weight:500; }
        .story-nav { display:flex; justify-content:space-between; align-items:center; margin-top:16px; }
        .story-counter { font-size:.8rem; color:var(--text3); }
      </style>`;
    
    container.innerHTML = html;
  }

  function renderReading(container) {
    const story = currentStory;
    if (!story) { phase = 'list'; render(); return; }
    
    const lines = story.lines.slice(0, currentLine + 2);
    const totalLines = story.lines.length;
    const isComplete = currentLine >= totalLines - 1;
    
    let html = `<div class="story-reader">`;
    html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
      <button class="back-btn" onclick="VolaStories.close()">← חזרה</button>
      <span style="font-size:.8rem;color:var(--text3)">${story.icon} ${story.title}</span>
      <span class="story-counter">${Math.min(currentLine + 1, totalLines)}/${totalLines}</span>
      <button onclick="VolaStories.speakAll()" style="background:none;border:none;font-size:1rem;cursor:pointer;padding:0;margin-left:auto" title="השמע הכל">🔊</button>
    </div>`;
    
    // Progress bar
    html += `<div class="progress-bar" style="margin-bottom:16px"><div class="progress-fill" style="width:${(currentLine + 1) / totalLines * 100}%"></div></div>`;
    
    // Lines
    lines.forEach((line, idx) => {
      const isActive = idx <= currentLine;
      const spk = isActive ? `<button onclick="VolaStories.speakLine(${idx})" style="background:none;border:none;font-size:1.1rem;cursor:pointer;padding:0 4px;vertical-align:middle" title="השמע">🔊</button>` : '';
      html += `<div class="story-line ${isActive ? 'active' : ''}" style="${!isActive ? 'opacity:0.3' : ''}">
        <div style="display:flex;align-items:center;gap:6px">${spk}<span style="vertical-align:middle;flex:1">${escHtml(line.it)}</span></div>
        <div class="story-line he">${escHtml(line.he)}</div>
      </div>`;
    });
    
    // Action button
    html += `<div class="story-nav">
      <div></div>`;
    if (isComplete) {
      html += `<button class="btn btn-primary" onclick="VolaStories.startQuiz()" style="font-size:.9rem;padding:10px 20px">📝 התחל שאלות!</button>`;
    } else {
      html += `<button class="btn btn-primary" onclick="VolaStories.nextLine()" style="font-size:.9rem;padding:10px 20px">➡️ המשך</button>`;
    }
    html += `</div></div>`;
    
    container.innerHTML = html;
  }

  function renderQuiz(container) {
    const story = currentStory;
    if (!story) { phase = 'list'; render(); return; }
    
    const q = story.questions[currentQuestion];
    if (!q) { phase = 'results'; render(); return; }
    
    const progress = (currentQuestion / story.questions.length) * 100;
    const hasAnswered = answeredQuestions[currentQuestion] !== undefined;
    
    let html = `<div class="story-reader">`;
    html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
      <button class="back-btn" onclick="VolaStories.quit()">← יציאה</button>
      <span style="font-size:.8rem;color:var(--text3)">📝 ${story.title}</span>
      <span class="story-counter">${currentQuestion + 1}/${story.questions.length}</span>
    </div>`;
    
    html += `<div class="progress-bar" style="margin-bottom:16px"><div class="progress-fill" style="width:${progress}%"></div></div>`;
    
    // Question card
    html += `<div class="card" style="padding:20px;text-align:center">`;
    html += `<div style="font-size:1.1rem;font-weight:700;margin-bottom:4px;direction:ltr">${escHtml(q.q)}</div>`;
    html += `<div style="font-size:.8rem;color:var(--text3);margin-bottom:16px">${escHtml(q.he)}</div>`;
    
    // Options
    q.options.forEach((opt, idx) => {
      let cls = 'quiz-option';
      if (hasAnswered) {
        cls += ' disabled';
        if (idx === q.correct) cls += ' correct';
        if (idx === answeredQuestions[currentQuestion] && idx !== q.correct) cls += ' wrong';
      }
      html += `<div class="${cls}" onclick="${hasAnswered ? '' : `VolaStories.answer(${idx})`}">
        <span style="font-weight:700">${String.fromCharCode(65 + idx)}.</span> ${escHtml(opt)}
        ${hasAnswered && idx === q.correct ? ' ✅' : ''}
        ${hasAnswered && idx === answeredQuestions[currentQuestion] && idx !== q.correct ? ' ❌' : ''}
      </div>`;
    });
    
    html += `</div>`;
    
    // Next button
    if (hasAnswered) {
      const isLast = currentQuestion >= story.questions.length - 1;
      html += `<button class="btn btn-primary btn-block" style="margin-top:12px" onclick="VolaStories.nextQuestion()">
        ${isLast ? '📊 צפה בתוצאות' : '➡️ המשך'}
      </button>`;
    }
    
    html += `</div>`;
    container.innerHTML = html;
    
    // Auto-scroll
    container.scrollTop = 0;
  }

  function renderResults(container) {
    const story = currentStory;
    if (!story) { phase = 'list'; render(); return; }
    
    const total = story.questions.length;
    const pct = total > 0 ? Math.round(correctCount / total * 100) : 0;
    const emoji = pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '💪';
    const msg = pct >= 80 ? 'Perfetto! נונה גאה בך!' : pct >= 50 ? 'Bravo! עוד קצת!' : 'Dai dai! נסה שוב!';
    
    let html = `<div class="story-reader" style="text-align:center">`;
    html += `<div style="font-size:4rem;margin:24px 0">${emoji}</div>`;
    html += `<h2 style="font-weight:800">${msg}</h2>`;
    html += `<div style="font-size:2rem;font-weight:800;color:var(--primary);margin:16px 0">${correctCount}/${total}</div>`;
    
    // Funny score bar
    const barColor = pct >= 80 ? 'var(--primary)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)';
    html += `<div class="progress-bar" style="height:12px;max-width:200px;margin:0 auto;border-radius:10px">
      <div class="progress-fill" style="width:${pct}%;background:${barColor};border-radius:10px"></div>
    </div>`;
    
    // Review wrong answers
    if (pct < 100) {
      html += '<h3 style="margin-top:24px;font-size:.9rem">📝 תשובות שטעית:</h3>';
      story.questions.forEach((q, idx) => {
        const userAnswer = answeredQuestions[idx];
        if (userAnswer !== q.correct && userAnswer !== undefined) {
          html += `<div class="card" style="padding:12px;margin-top:8px;text-align:right;font-size:.85rem">
            <div><strong>${escHtml(q.q)}</strong></div>
            <div style="color:var(--danger)">❌ ענית: ${escHtml(q.options[userAnswer])}</div>
            <div style="color:var(--primary)">✅ תשובה: ${escHtml(q.options[q.correct])}</div>
          </div>`;
        }
      });
    }
    
    // Save progress
    saveStoryProgress(story.id, pct);
    
    html += `<div style="display:flex;gap:8px;margin-top:20px">
      <button class="btn btn-primary btn-block" onclick="VolaStories.close()" style="flex:1">📚 עוד סיפורים</button>
      <button class="btn btn-outline btn-block" onclick="VolaStories.retry()" style="flex:1">🔄 נסה שוב</button>
    </div>`;
    
    html += `</div>`;
    container.innerHTML = html;
  }

  // ═══ ACTIONS ═══
  function open(storyId) {
    const story = STORIES.find(s => s.id === storyId);
    if (!story) return;
    currentStory = story;
    currentLine = 0;
    phase = 'reading';
    render();
  }

  function nextLine() {
    if (!currentStory) return;
    if (currentLine < currentStory.lines.length - 1) {
      currentLine++;
      render();
    }
  }

  function startQuiz() {
    currentQuestion = 0;
    correctCount = 0;
    answeredQuestions = {};
    phase = 'quiz';
    render();
  }

  function answer(idx) {
    if (!currentStory) return;
    const q = currentStory.questions[currentQuestion];
    if (!q) return;
    if (answeredQuestions[currentQuestion] !== undefined) return;
    
    answeredQuestions[currentQuestion] = idx;
    if (idx === q.correct) correctCount++;
    render();
  }

  function nextQuestion() {
    currentQuestion++;
    if (currentQuestion >= currentStory.questions.length) {
      phase = 'results';
    } else {
      // Still more questions
    }
    render();
  }

  function close() {
    currentStory = null;
    phase = 'list';
    render();
  }

  function quit() {
    // Go to results if some questions answered
    if (Object.keys(answeredQuestions).length > 0) {
      phase = 'results';
    } else {
      phase = 'list';
    }
    render();
  }

  function retry() {
    currentQuestion = 0;
    correctCount = 0;
    answeredQuestions = {};
    phase = 'quiz';
    render();
  }

  // ═══ PROGRESS STORAGE ═══
  function getStoryProgress(storyId) {
    try {
      const data = JSON.parse(localStorage.getItem('vl_story_progress')) || {};
      return data[storyId] || 0;
    } catch { return 0; }
  }

  function saveStoryProgress(storyId, pct) {
    try {
      const data = JSON.parse(localStorage.getItem('vl_story_progress')) || {};
      data[storyId] = Math.max(data[storyId] || 0, pct);
      localStorage.setItem('vl_story_progress', JSON.stringify(data));
    } catch {}
  }

  // ═══ HELPERS ═══
  function escHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function speakLine(idx) {
    if (!currentStory || !currentStory.lines[idx]) return;
    var text = currentStory.lines[idx].it;
    if (typeof window.speak === 'function') {
      window.speak(text);
    }
  }

  function speakAll() {
    if (!currentStory) return;
    var revealed = Math.min(currentLine + 2, currentStory.lines.length);
    var i = 0;
    function playNext() {
      if (i < revealed) {
        if (typeof window.speak === 'function') {
          window.speak(currentStory.lines[i].it);
        }
        i++;
        setTimeout(playNext, 1500);
      }
    }
    playNext();
  }

  return { render, open, nextLine, startQuiz, answer, nextQuestion, close, quit, retry, speakLine, speakAll };
})();