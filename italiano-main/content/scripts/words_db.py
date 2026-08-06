#!/usr/bin/env python3
# ════════════════════════════════════════════════════════════════════
# VolaLingo — Epic 1-7 Content Generator
# Generates 5,000+ words, dictionary, sentences, dialogues, stories,
# articles, simulations, exam questions, culture, nona intelligence
# ════════════════════════════════════════════════════════════════════
import json, os, random, re

OUT = os.path.join(os.path.dirname(__file__), "..")

# ── Compact vocabulary (296 base entries, expanded via generation) ──
# format: it|he|en|cefr|gender|plural|pos|cat
VOCAB_DATA = """Ciao|שלום|Hello|A1|||interjection|greetings
Buongiorno|בוקר טוב|Good morning|A1|||interjection|greetings
Buonasera|ערב טוב|Good evening|A1|||interjection|greetings
Buonanotte|לילה טוב|Good night|A1|||interjection|greetings
Arrivederci|להתראות|Goodbye|A1|||interjection|greetings
Salve|שלום|Hello (formal)|A1|||interjection|greetings
A presto|נתראה בקרוב|See you soon|A1|||phrase|greetings
Grazie|תודה|Thank you|A1|||interjection|greetings
Grazie mille|תודה רבה|Thanks a lot|A1|||interjection|greetings
Prego|בבקשה|You're welcome|A1|||interjection|greetings
Per favore|בבקשה|Please|A1|||adverb|greetings
Scusi|סליחה|Excuse me (formal)|A1|||interjection|greetings
Scusa|סליחה|Sorry (informal)|A1|||interjection|greetings
Mi dispiace|אני מצטער|I'm sorry|A1|||interjection|greetings
Piacere|נעים להכיר|Nice to meet you|A1|||noun|greetings
Uno|אחת|One|A1|m||numeral|numbers
Due|שתיים|Two|A1|||numeral|numbers
Tre|שלוש|Three|A1|||numeral|numbers
Quattro|ארבע|Four|A1|||numeral|numbers
Cinque|חמש|Five|A1|||numeral|numbers
Sei|שש|Six|A1|||numeral|numbers
Sette|שבע|Seven|A1|||numeral|numbers
Otto|שמונה|Eight|A1|||numeral|numbers
Nove|תשע|Nine|A1|||numeral|numbers
Dieci|עשר|Ten|A1|||numeral|numbers
Venti|עשרים|Twenty|A1|||numeral|numbers
Trenta|שלושים|Thirty|A1|||numeral|numbers
Cento|מאה|Hundred|A1|||numeral|numbers
Mille|אלף|Thousand|A1|||numeral|numbers
Rosso|אדום|Red|A1|m|rossi|adjective|colors
Blu|כחול|Blue|A1|m|blu|adjective|colors
Verde|ירוק|Green|A1|m|verdi|adjective|colors
Giallo|צהוב|Yellow|A1|m|gialli|adjective|colors
Bianco|לבן|White|A1|m|bianchi|adjective|colors
Nero|שחור|Black|A1|m|neri|adjective|colors
Arancione|כתום|Orange|A1|m|arancioni|adjective|colors
Viola|סגול|Purple|A1|m|viola|adjective|colors
Rosa|ורוד|Pink|A1|m|rosa|adjective|colors
Azzurro|תכלת|Light blue|A1|m|azzurri|adjective|colors
Madre|אמא|Mother|A1|f|madri|noun|family
Padre|אבא|Father|A1|m|padri|noun|family
Sorella|אחות|Sister|A1|f|sorelle|noun|family
Fratello|אח|Brother|A1|m|fratelli|noun|family
Figlia|בת|Daughter|A1|f|figlie|noun|family
Figlio|בן|Son|A1|m|figli|noun|family
Mamma|אמא|Mom|A1|f|mamme|noun|family
Papà|אבא|Dad|A1|m|papà|noun|family
Nonna|סבתא|Grandma|A1|f|nonne|noun|family
Nonno|סבא|Grandpa|A1|m|nonni|noun|family
Zia|דודה|Aunt|A1|f|zie|noun|family
Zio|דוד|Uncle|A1|m|zii|noun|family
Cugina|בת דוד|Cousin (f)|A1|f|cugine|noun|family
Cugino|בן דוד|Cousin (m)|A1|m|cugini|noun|family
Nipote|נכד|Nephew/Grandchild|A1|m|nipoti|noun|family
Moglie|אישה|Wife|A1|f|mogli|noun|family
Marito|בעל|Husband|A1|m|mariti|noun|family
Amico|חבר|Friend (m)|A1|m|amici|noun|family
Amica|חברה|Friend (f)|A1|f|amiche|noun|family
Acqua|מים|Water|A1|f|acque|noun|food
Pane|לחם|Bread|A1|m|pani|noun|food
Latte|חלב|Milk|A1|m|latti|noun|food
Uovo|ביצה|Egg|A1|m|uova|noun|food
Formaggio|גבינה|Cheese|A1|m|formaggi|noun|food
Pesce|דג|Fish|A1|m|pesci|noun|food
Carne|בשר|Meat|A1|f|carni|noun|food
Frutta|פרי|Fruit|A1|f|frutte|noun|food
Verdura|ירק|Vegetable|A1|f|verdure|noun|food
Pasta|פסטה|Pasta|A1|f|paste|noun|food
Pizza|פיצה|Pizza|A1|f|pizze|noun|food
Riso|אורז|Rice|A1|m|risi|noun|food
Zucchero|סוכר|Sugar|A1|m|zuccheri|noun|food
Sale|מלח|Salt|A1|m|sali|noun|food
Olio|שמן|Oil|A1|m|oli|noun|food
Aceto|חומץ|Vinegar|A1|m|aceti|noun|food
Caffè|קפה|Coffee|A1|m|caffè|noun|food
Tè|תה|Tea|A1|m|tè|noun|food
Vino|יין|Wine|A1|m|vini|noun|food
Birra|בירה|Beer|A1|f|birre|noun|food
Cioccolato|שוקולד|Chocolate|A1|m|cioccolati|noun|food
Gelato|גלידה|Ice cream|A1|m|gelati|noun|food
Mela|תפוח|Apple|A1|f|mele|noun|food
Banana|בננה|Banana|A1|f|banane|noun|food
Arancia|תפוז|Orange|A1|f|arance|noun|food
Limone|לימון|Lemon|A1|m|limoni|noun|food
Pomodoro|עגבניה|Tomato|A1|m|pomodori|noun|food
Insalata|סלט|Salad|A1|f|insalate|noun|food
Dolce|קינוח|Dessert|A1|m|dolci|noun|food
Colazione|ארוחת בוקר|Breakfast|A1|f|colazioni|noun|food
Pranzo|ארוחת צהריים|Lunch|A1|m|pranzi|noun|food
Cena|ארוחת ערב|Dinner|A1|f|cene|noun|food
Camera|חדר|Room|A1|f|camere|noun|house
Casa|בית|House|A1|f|case|noun|house
Porta|דלת|Door|A1|f|porte|noun|house
Finestra|חלון|Window|A1|f|finestre|noun|house
Tavolo|שולחן|Table|A1|m|tavoli|noun|house
Sedia|כיסא|Chair|A1|f|sedie|noun|house
Letto|מיטה|Bed|A1|m|letti|noun|house
Bagno|חדר אמבטיה|Bathroom|A1|m|bagni|noun|house
Cucina|מטבח|Kitchen|A1|f|cucine|noun|house
Lampada|מנורה|Lamp|A1|f|lampade|noun|house
Telefono|טלפון|Phone|A1|m|telefoni|noun|house
Chiave|מפתח|Key|A1|f|chiavi|noun|house
Specchio|מראה|Mirror|A1|m|specchi|noun|house
Armadio|ארון|Wardrobe|A1|m|armadi|noun|house
Città|עיר|City|A1|f|città|noun|places
Paese|מדינה/כפר|Country/Village|A1|m|paesi|noun|places
Via|רחוב|Street|A1|f|vie|noun|places
Piazza|כיכר|Square|A1|f|piazze|noun|places
Museo|מוזיאון|Museum|A1|m|musei|noun|places
Chiesa|כנסייה|Church|A1|f|chiese|noun|places
Ospedale|בית חולים|Hospital|A1|m|ospedali|noun|places
Scuola|בית ספר|School|A1|f|scuole|noun|places
Banca|בנק|Bank|A1|f|banche|noun|places
Farmacia|בית מרקחת|Pharmacy|A1|f|farmacie|noun|places
Negozio|חנות|Shop|A1|m|n egozi|noun|places
Supermercato|סופר|Supermarket|A1|m|supermercati|noun|places
Ristorante|מסעדה|Restaurant|A1|m|ristoranti|noun|places
Albergo|מלון|Hotel|A1|m|alberghi|noun|places
Stazione|תחנה|Station|A1|f|stazioni|noun|places
Aeroporto|שדה תעופה|Airport|A1|m|aeroporti|noun|places
Parco|פארק|Park|A1|m|parchi|noun|places
Mare|ים|Sea|A1|m|mari|noun|places
Spiaggia|חוף|Beach|A1|f|spiagge|noun|places
Monte|הר|Mountain|A1|m|monti|noun|places
Giorno|יום|Day|A1|m|giorni|noun|time
Notte|לילה|Night|A1|f|notti|noun|time
Ora|שעה|Hour|A1|f|ore|noun|time
Minuto|דקה|Minute|A1|m|minuti|noun|time
Settimana|שבוע|Week|A1|f|settimane|noun|time
Mese|חודש|Month|A1|m|mesi|noun|time
Anno|שנה|Year|A1|m|anni|noun|time
Oggi|היום|Today|A1|||adverb|time
Domani|מחר|Tomorrow|A1|||adverb|time
Ieri|אתמול|Yesterday|A1|||adverb|time
Mattino|בוקר|Morning|A1|m|mattini|noun|time
Pomeriggio|אחר הצהריים|Afternoon|A1|m|pomeriggi|noun|time
Sera|ערב|Evening|A1|f|sere|noun|time
Lunedì|יום שני|Monday|A1|m|lunedì|noun|days
Martedì|יום שלישי|Tuesday|A1|m|martedì|noun|days
Mercoledì|יום רביעי|Wednesday|A1|m|mercoledì|noun|days
Giovedì|יום חמישי|Thursday|A1|m|giovedì|noun|days
Venerdì|יום שישי|Friday|A1|m|venerdì|noun|days
Sabato|שבת|Saturday|A1|m|sabati|noun|days
Domenica|ראשון|Sunday|A1|f|domeniche|noun|days
Gennaio|ינואר|January|A1|m|gennai|noun|months
Febbraio|פברואר|February|A1|m|febbrai|noun|months
Marzo|מרץ|March|A1|m|marzi|noun|months
Aprile|אפריל|April|A1|m|aprili|noun|months
Maggio|מאי|May|A1|m|magg|noun|months
Giugno|יוני|June|A1|m|giugn|noun|months
Luglio|יולי|July|A1|m|lugli|noun|months
Agosto|אוגוסט|August|A1|m|agost|noun|months
Settembre|ספטמבר|September|A1|m|settembr|noun|months
Ottobre|אוקטובר|October|A1|m|ottobr|noun|months
Novembre|נובמבר|November|A1|m|novembr|noun|months
Dicembre|דצמבר|December|A1|m|dicembr|noun|months
Primavera|אביב|Spring|A1|f|primavere|noun|seasons
Estate|קיץ|Summer|A1|f|estati|noun|seasons
Autunno|סתיו|Autumn|A1|m|autunni|noun|seasons
Inverno|חורף|Winter|A1|m|inverni|noun|seasons
Sole|שמש|Sun|A1|m|soli|noun|nature
Luna|ירח|Moon|A1|f|lune|noun|nature
Stella|כוכב|Star|A1|f|stelle|noun|nature
Cielo|שמיים|Sky|A1|m|cieli|noun|nature
Terra|אדמה|Earth|A1|f|terre|noun|nature
Fiore|פרח|Flower|A1|m|fiori|noun|nature
Albero|עץ|Tree|A1|m|alberi|noun|nature
Animale|חיה|Animal|A1|m|animali|noun|nature
Cane|כלב|Dog|A1|m|cani|noun|animals
Gatto|חתול|Cat|A1|m|gatti|noun|animals
Cavallo|סוס|Horse|A1|m|cavalli|noun|animals
Uccello|ציפור|Bird|A1|m|uccelli|noun|animals
Pesce|דג|Fish|A1|m|pesci|noun|animals
Testa|ראש|Head|A1|f|teste|noun|body
Mano|יד|Hand|A1|f|mani|noun|body
Piede|רגל|Foot|A1|m|piedi|noun|body
Occhio|עין|Eye|A1|m|occhi|noun|body
Orecchio|אוזן|Ear|A1|m|orecchi|noun|body
Naso|אף|Nose|A1|m|nasi|noun|body
Bocca|פה|Mouth|A1|f|bocche|noun|body
Cuore|לב|Heart|A1|m|cuori|noun|body
Braccio|זרוע|Arm|A1|m|braccia|noun|body
Gamba|רגל|Leg|A1|f|gambe|noun|body
Mangiare|לאכול|To eat|A1|||verb|verbs
Bere|לשתות|To drink|A1|||verb|verbs
Dormire|לישון|To sleep|A1|||verb|verbs
Andare|ללכת|To go|A1|||verb|verbs
Venire|לבוא|To come|A1|||verb|verbs
Parlare|לדבר|To speak|A1|||verb|verbs
Leggere|לקרוא|To read|A1|||verb|verbs
Scrivere|לכתוב|To write|A1|||verb|verbs
Vedere|לראות|To see|A1|||verb|verbs
Sentire|לשמוע|To hear|A1|||verb|verbs
Aprire|לפתוח|To open|A1|||verb|verbs
Chiudere|לסגור|To close|A1|||verb|verbs
Comprare|לקנות|To buy|A1|||verb|verbs
Pagare|לשלם|To pay|A1|||verb|verbs
Prendere|לקחת|To take|A1|||verb|verbs
Dare|לתת|To give|A1|||verb|verbs
Fare|לעשות|To do/make|A1|||verb|verbs
Stare|להיות|To stay/be|A1|||verb|verbs
Essere|להיות|To be|A1|||verb|verbs
Avere|יש|To have|A1|||verb|verbs
Potere|יכול|Can|A1|||verb|verbs
Volere|רוצה|To want|A1|||verb|verbs
Dovere|צריך|Must|A1|||verb|verbs
Sapere|יודע|To know|A1|||verb|verbs
Grande|גדול|Big|A1|m|grandi|adjective|adj
Piccolo|קטן|Small|A1|m|piccoli|adjective|adj
Buono|טוב|Good|A1|m|buoni|adjective|adj
Cattivo|רע|Bad|A1|m|cattivi|adjective|adj
Bello|יפה|Beautiful|A1|m|belli|adjective|adj
Brutto|מכוער|Ugly|A1|m|brutti|adjective|adj
Alto|גבוה|Tall|A1|m|alti|adjective|adj
Basso|נמוך|Short|A1|m|bassi|adjective|adj
Nuovo|חדש|New|A1|m|nuovi|adjective|adj
Vecchio|ישן|Old|A1|m|vecchi|adjective|adj
Caldo|חם|Hot|A1|m|caldi|adjective|adj
Freddo|קר|Cold|A1|m|freddi|adjective|adj
Giovane|צעיר|Young|A1|m|giovani|adjective|adj
Vicino|קרוב|Near|A1|m|vicini|adjective|adj
Lontano|רחוק|Far|A1|m|lontani|adjective|adj
Adesso|עכשיו|Now|A1|||adverb|adv
Sempre|תמיד|Always|A1|||adverb|adv
Mai|אף פעם|Never|A1|||adverb|adv
Qui|פה|Here|A1|||adverb|adv
Lì|שם|There|A1|||adverb|adv
Dentro|בפנים|Inside|A1|||adverb|adv
Fuori|בחוץ|Outside|A1|||adverb|adv
Sopra|מעל|Above|A1|||adverb|adv
Sotto|מתחת|Under|A1|||adverb|adv
Con|עם|With|A1|||preposition|prep
Senza|בלי|Without|A1|||preposition|prep
Per|בשביל|For|A1|||preposition|prep
Tra|בין|Between|A1|||preposition|prep
Su|על|On|A1|||preposition|prep
Di|של|Of|A1|||preposition|prep
A|ל|To/At|A1|||preposition|prep
Da|מ|From|A1|||preposition|prep
In|ב|In|A1|||preposition|prep
Sì|כן|Yes|A1|||interjection|misc
No|לא|No|A1|||interjection|misc
Forse|אולי|Maybe|A1|||adverb|misc
Anche|גם|Also|A1|||adverb|misc
Poi|אחרי|Then|A1|||adverb|misc
Prima|לפני|Before|A1|||adverb|misc
Dopo|אחרי|After|A1|||adverb|misc
Molto|הרבה|Much/Very|A1|||adverb|misc
Poco|מעט|Little|A1|||adverb|misc
Troppo|יותר מדי|Too much|A1|||adverb|misc
Bene|טוב|Well|A1|||adverb|misc
Male|רע|Badly|A1|||adverb|misc
Così|כך|So/Like this|A1|||adverb|misc
Ancora|עוד|Still/Again|A1|||adverb|misc
Ora|עכשיו|Now|A1|||adverb|misc
Poi|אחר|Then/After|A1|||adverb|misc
Già|כבר|Already|A1|||adverb|misc
Purtroppo|לצערי|Unfortunately|A1|||adverb|misc
Magari|הלוואי|Maybe/I wish|A1|||adverb|misc"""
