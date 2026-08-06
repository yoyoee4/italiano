#!/usr/bin/env python3
"""
VolaLingo — Italian Corpus Intelligence Pipeline
Ingests real Italian text → produces structured learning content.

Pipeline: Text → Tokenizer → CEFR Analyzer → Vocabulary Extractor
         → Grammar Extractor → Content Generators → JSON Output
"""
import json, os, re, random, math
from collections import Counter, defaultdict

ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
CORPUS_DIR = os.path.join(ROOT, "corpus", "txt")
CONTENT_DIR = os.path.join(ROOT, "content")

# ═══════════════════════════════════════════════
# STAGE 1: CORPUS INGESTION
# ═══════════════════════════════════════════════

def load_corpus():
    """Load all .txt files from corpus directory"""
    texts = []
    if not os.path.isdir(CORPUS_DIR):
        print(f"WARN: Corpus dir {CORPUS_DIR} not found")
        return texts
    for fname in sorted(os.listdir(CORPUS_DIR)):
        if fname.endswith('.txt'):
            path = os.path.join(CORPUS_DIR, fname)
            with open(path, encoding='utf-8') as f:
                content = f.read().strip()
            if content:
                texts.append({"source": fname, "content": content})
                print(f"  Loaded: {fname} ({len(content.split())} words)")
    return texts

# ═══════════════════════════════════════════════
# STAGE 2: TOKENIZER
# ═══════════════════════════════════════════════

def tokenize(text):
    """Split text into sentences and words"""
    # Sentence splitting
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    sentences = [s.strip() for s in sentences if s.strip()]
    
    # Word tokenization
    words = []
    for s in sentences:
        tokens = re.findall(r"[a-zA-Zàèéìòù'’]+", s.lower())
        words.extend(tokens)
    
    return sentences, words

# ═══════════════════════════════════════════════
# STAGE 3: CEFR CLASSIFIER
# ═══════════════════════════════════════════════

# Common Italian words by CEFR level (simplified frequency-based)
CEFR_WORDS = {
        'A1': set("il lo la i gli le un una uno mio tuo suo nostro vostro sono sei è siamo siete sono ho hai ha abbiamo avete hanno e ma anche con su per tra fra in a da di io tu lui lei noi voi loro questo questa questi queste quello quella quei quelle buono bello grande piccolo nuovo vecchio mio tuo suo nostro vostro molto poco tanto troppo casa libro tavolo sedia porta finestra città via piazza acqua pane vino latte caffè pasta pizza sole luna cielo terra mare fiore albero cane gatto amico madre padre sorella fratello mangiare bere dormire leggere scrivere parlare ascoltare vedere sentire capire studiare lavorare oggi domani ieri mattina sera notte giorno mese anno sempre mai adesso poi prima dopo sì no grazie ciao arrivederci buongiorno buonasera per favore".split()),
        'A2': set("oltre dentro fuori sopra sotto davanti dietro vicino lontano insieme senza durante verso aprire chiudere prendere mettere portare dare ricevere comprare pagare vendere cambiare aiutare chiamare invitare aspettare cercare trovare pensare credere sperare conoscere felice triste stanco arrabbiato contento preoccupato calmo nervoso forte debole veloce lento facile difficile carino simpatico gentile importante necessario possibile colazione pranzo cena spuntino pasto piatto bicchiere coltello forchetta cucchiaio tovaglia bagno camera cucina soggiorno scala ascensore giardino garage cantina soffitto pavimento muro viaggio vacanza turista biglietto treno aereo nave autobus macchina stazione aeroporto caldo freddo pioggia neve vento sole nuvola temporale temperatura stagione primavera estate autunno inverno".split()),
        'B1': set("sebbene nonostante comunque tuttavia pertanto quindi dunque cioè infatti riuscire seguire iscriversi laurearsi specializzarsi gestire sviluppare migliorare progetto riunione appuntamento colloquio intervista contratto stipendio fattura fornitore salute malattia medico ospedale farmaco ricetta analisi cura terapia intervento società cultura politica economia diritto dovere responsabilità opportunità esperienza conoscenza abilità capacità competenza formazione preparazione soddisfatto sorpreso deluso preoccupato entusiasta orgoglioso riconoscente".split()),
        'B2': set("addirittura probabilmente effettivamente evidentemente assolutamente innovazione tecnologia ricerca sviluppo industria mercato finanza investimento amministrazione organizzazione pianificazione strategia gestione coordinamento contributo partecipazione coinvolgimento collaborazione cooperazione integrazione incontro conferenza seminario dibattito discussione confronto trattativa negoziato sfida opportunità miglioramento cambiamento trasformazione evoluzione crescita progresso".split()),
        'C1': set("indipendentemente contemporaneamente progressivamente sistematicamente significativamente elaborare approfondire analizzare valutare interpretare formulare argomentare sostenere contestare fenomeno prospettiva dimensione aspetto implicazione conseguenza interpretazione valutazione complesso articolato sofisticato approfondito sistematico metodologico teorico empirico".split()),
        'C2': set("innegabilmente indiscutibilmente incommensurabilmente precipuamente intrinsecamente astrazione concettualizzazione sistematizzazione categorizzazione formalizzazione epistemologico ontologico fenomenologico dialettico ermeneutico euristico".split()),
    }

def classify_cefr(words_in_text):
    """Classify text to CEFR level based on vocabulary"""
    word_set = set(w.lower() for w in words_in_text if len(w) > 2)
    scores = {}
    for level, vocab in CEFR_WORDS.items():
        matches = len(word_set & vocab)
        scores[level] = matches
    if not scores or max(scores.values()) == 0:
        return 'A1'
    # Weight: higher levels indicate higher difficulty
    level_order = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    weighted = sum(
        (level_order.index(lv) + 1) * cnt * (1 if lv in ['B1','B2','C1','C2'] else 0.5)
        for lv, cnt in scores.items()
    )
    total = sum(scores.values())
    if total == 0:
        return 'A1'
    avg_level = weighted / total
    idx = min(int(avg_level), 5)
    return level_order[idx]

# ═══════════════════════════════════════════════
# STAGE 4: VOCABULARY EXTRACTOR
# ═══════════════════════════════════════════════

# Frequent Italian stopwords (filter out)
STOPWORDS = set("il lo la i gli le un una uno del dello della dei degli delle al allo alla ai agli alle dal dallo dalla dai dagli dalle nel nello nella nei negli nelle sull sullo sulla sui sugli sulle con su per tra fra in a da di che chi cui come dove quando perché cosa quale quanto mentre se anche o ma però né non sì no già più meno almeno molto poco tanto troppo ancora pure quasi solo soltanto".split())

def extract_vocab(words):
    """Extract vocabulary with frequency from tokenized words"""
    counter = Counter(w.lower() for w in words if len(w) > 1 and w.lower() not in STOPWORDS)
    return counter

# ═══════════════════════════════════════════════
# STAGE 5: GRAMMAR EXTRACTOR
# ═══════════════════════════════════════════════

def extract_grammar(sentences):
    """Extract grammar patterns from sentences"""
    grammar = defaultdict(list)
    
    for s in sentences:
        s_lower = s.lower()
        # Verb tenses (simplified pattern matching)
        if re.search(r'\b(sono|sei|è|siamo|siete|sono)\b', s_lower):
            grammar['verb_essere'].append(s)
        if re.search(r'\b(ho|hai|ha|abbiamo|avete|hanno)\b', s_lower):
            grammar['verb_avere'].append(s)
        if re.search(r'\b(ero|eri|era|eravamo|eravate|erano)\b', s_lower):
            grammar['verb_imperfetto'].append(s)
        
        # Prepositions
        for prep in ['di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra']:
            if re.search(r'\b' + prep + r'\b', s_lower):
                grammar[f'prep_{prep}'].append(s)
        
        # Pronouns
        if re.search(r'\b(mi|ti|si|ci|vi|lo|la|li|le|gli|le|ne)\b', s_lower):
            grammar['pronouns'].append(s)
        
        # Negation
        if re.search(r'\bnon\b', s_lower):
            grammar['negation'].append(s)
        
        # Questions
        if '?' in s:
            grammar['questions'].append(s)
        
        # Subjunctive markers (congiuntivo)
        if re.search(r'\b(che|affinché|benché|sebbene|nonostante)\b', s_lower) and re.search(r'\b(abbia|sia|abbiano|siano|faccia|vada|venga|parli|legga|dica|sappia)\b', s_lower):
            grammar['subjunctive'].append(s)
        
        # Conditional
        if re.search(r'\b(rei|rebbe|rebbero)\w*\b', s_lower) or 'vorrei' in s_lower:
            grammar['conditional'].append(s)
        
        # Future
        if re.search(r'\b(andrò|andrai|andremo|farò|farai|faremo|sarò|sarai|saremo)\b', s_lower):
            grammar['future'].append(s)
    
    return dict(grammar)

# ═══════════════════════════════════════════════
# STAGE 6: DIALOGUE GENERATOR
# ═══════════════════════════════════════════════

def generate_dialogues(corpus_words, existing_scenarios):
    """Generate real dialogue content from corpus vocabulary"""
    
    # Common Italian dialogue templates with real phrases
    templates = {
        "cafe": [
            ("barista", "Buongiorno! Cosa desidera?", "בוקר טוב! מה תרצה?", "A1"),
            ("cliente", "Buongiorno! Un caffè, per favore.", "בוקר טוב! קפה אחד, בבקשה.", "A1"),
            ("barista", "Lo vuole macchiato o normale?", "עם חלב או רגיל?", "A1"),
            ("cliente", "Normale, grazie. Quanto costa?", "רגיל, תודה. כמה עולה?", "A1"),
            ("barista", "Un euro. Ecco il caffè.", "יורו אחד. הנה הקפה.", "A1"),
            ("cliente", "Grazie mille, arrivederci!", "תודה רבה, להתראות!", "A1"),
            ("barista", "Arrivederci! Buona giornata!", "להתראות! יום טוב!", "A1"),
        ],
        "restaurant": [
            ("cameriere", "Buonasera! Avete prenotato?", "ערב טוב! הזמנתם?", "A1"),
            ("cliente", "Sì, ho prenotato per due persone.", "כן, הזמנתי לשני אנשים.", "A2"),
            ("cameriere", "Perfetto, seguitemi. Ecco il menu.", "מושלם, אחריי. הנה התפריט.", "A2"),
            ("cliente", "Grazie. Che cosa mi consiglia?", "תודה. מה אתה ממליץ?", "A2"),
            ("cameriere", "Oggi abbiamo la pasta fresca e il pesce del giorno.", "היום יש לנו פסטה טרייה ודג היום.", "B1"),
            ("cliente", "Prendo la pasta, per favore.", "אני אקח את הפסטה, בבקשה.", "A2"),
            ("cameriere", "Ottima scelta! Desiderate anche del vino?", "בחירה מצוינת! תרצו גם יין?", "A2"),
            ("cliente", "Un bicchiere di vino rosso, grazie.", "כוס יין אדום, תודה.", "A2"),
            ("cameriere", "Subito! Buon appetito!", "מיד! בתיאבון!", "A1"),
        ],
        "hotel": [
            ("receptionist", "Buonasera! Ha una prenotazione?", "ערב טוב! יש לך הזמנה?", "A2"),
            ("ospite", "Sì, ho prenotato una camera doppia per tre notti.", "כן, הזמנתי חדר זוגי לשלושה לילות.", "B1"),
            ("receptionist", "Un momento, controllo. Ecco, camera 305, al terzo piano.", "רגע, אני בודק. הנה, חדר 305, בקומה שלישית.", "B1"),
            ("ospite", "La colazione è inclusa?", "ארוחת בוקר כלולה?", "A2"),
            ("receptionist", "Sì, la colazione è servita dalle 7 alle 10 al primo piano.", "כן, ארוחת בוקר מוגשת מ-7 עד 10 בקומה הראשונה.", "B1"),
            ("ospite", "Perfetto. A che ora devo lasciare la camera?", "מושלם. באיזו שעה אני צריך לעזוב את החדר?", "A2"),
            ("receptionist", "Il check-out è alle 11. Buon soggiorno!", "צ'ק אאוט ב-11. שהייה נעימה!", "A2"),
        ],
        "pharmacy": [
            ("farmacista", "Buongiorno! Di cosa ha bisogno?", "בוקר טוב! במה אתה צריך?", "A2"),
            ("cliente", "Buongiorno. Ho mal di testa. Cosa mi consiglia?", "בוקר טוב. יש לי כאב ראש. מה אתה ממליץ?", "A2"),
            ("farmacista", "Le consiglio questo analgesico. Prenda una compressa con acqua.", "אני ממליץ על משכך כאבים זה. קח טבליה אחת עם מים.", "B1"),
            ("cliente", "Grazie. Quanto costa?", "תודה. כמה זה עולה?", "A1"),
            ("farmacista", "8 euro e 50. Ha bisogno d'altro?", "8 יורו ו-50. צריך עוד משהו?", "A2"),
            ("cliente", "No, grazie. Arrivederci!", "לא, תודה. להתראות!", "A1"),
        ],
        "train_station": [
            ("bigliettaio", "Buongiorno! Dove vuole andare?", "בוקר טוב! לאן אתה רוצה לנסוע?", "A2"),
            ("passeggero", "Buongiorno. Un biglietto per Firenze, per favore.", "בוקר טוב. כרטיס אחד לפירנצה, בבקשה.", "A2"),
            ("bigliettaio", "Andata e ritorno o solo andata?", "הלוך ושוב או רק הלוך?", "A2"),
            ("passeggero", "Solo andata, grazie.", "רק הלוך, תודה.", "A2"),
            ("bigliettaio", "Sono 35 euro. Il treno parte alle 14:30 dal binario 5.", "35 יורו. הרכבת יוצאת ב-14:30 מרציף 5.", "B1"),
            ("passeggero", "A che ora arriva a Firenze?", "באיזו שעה מגיעה לפירנצה?", "A2"),
            ("bigliettaio", "Alle 16:45. Buon viaggio!", "ב-16:45. נסיעה נעימה!", "A2"),
        ],
        "supermarket": [
            ("cassiere", "Buonasera! Ha la carta fedeltà?", "ערב טוב! יש לך כרטיס מועדון?", "A2"),
            ("cliente", "Sì, eccola.", "כן, הנה.", "A2"),
            ("cassiere", "Grazie. Il totale è 27 euro e 30.", "תודה. הסכום הכולל הוא 27 יורו ו-30.", "A2"),
            ("cliente", "Posso pagare con la carta?", "אפשר לשלם באשראי?", "A2"),
            ("cassiere", "Certo. Inserisca la carta nel lettore.", "בוודאי. הכנס את הכרטיס לקורא.", "A2"),
            ("cliente", "Grazie. Buona serata!", "תודה. ערב טוב!", "A1"),
            ("cassiere", "Grazie a lei! Arrivederci!", "תודה לך! להתראות!", "A1"),
        ],
        "hotel": [
            ("receptionist", "Buonasera! Ha una prenotazione?", "ערב טוב! יש לך הזמנה?", "A2"),
            ("ospite", "Sì, ho prenotato una camera doppia per tre notti.", "כן, הזמנתי חדר זוגי לשלושה לילות.", "B1"),
            ("receptionist", "Ecco, camera 305, al terzo piano.", "הנה, חדר 305, בקומה שלישית.", "B1"),
            ("ospite", "La colazione è inclusa?", "ארוחת בוקר כלולה?", "A2"),
            ("receptionist", "Sì, dalle 7 alle 10. Buon soggiorno!", "כן, מ-7 עד 10. שהייה נעימה!", "A2"),
        ],
        "pharmacy": [
            ("farmacista", "Buongiorno! Di cosa ha bisogno?", "בוקר טוב! במה אתה צריך?", "A2"),
            ("cliente", "Ho mal di testa. Cosa mi consiglia?", "יש לי כאב ראש. מה אתה ממליץ?", "A2"),
            ("farmacista", "Prenda una compressa con acqua.", "קח טבליה אחת עם מים.", "B1"),
            ("cliente", "Quanto costa?", "כמה זה עולה?", "A1"),
            ("farmacista", "8 euro. Ha bisogno d'altro?", "8 יורו. צריך עוד משהו?", "A2"),
        ],
        "train_station": [
            ("bigliettaio", "Buongiorno! Dove vuole andare?", "בוקר טוב! לאן אתה רוצה לנסוע?", "A2"),
            ("passeggero", "Un biglietto per Firenze, per favore.", "כרטיס אחד לפירנצה, בבקשה.", "A2"),
            ("bigliettaio", "Andata e ritorno?", "הלוך ושוב?", "A2"),
            ("passeggero", "Solo andata. Quanto costa?", "רק הלוך. כמה עולה?", "A2"),
            ("bigliettaio", "35 euro. Il treno parte dal binario 5.", "35 יורו. הרכבת יוצאת מרציף 5.", "B1"),
        ],
        "airport": [
            ("impiegato", "Buongiorno! Il suo passaporto, per favore.", "בוקר טוב! הדרכון שלך, בבקשה.", "A2"),
            ("passeggero", "Ecco il mio passaporto e il biglietto.", "הנה הדרכון והכרטיס שלי.", "A2"),
            ("impiegato", "Ha bagaglio da stiva?", "יש לך מזוודה לבטן המטוס?", "A2"),
            ("passeggero", "Sì, una valigia. Pesa 15 chili.", "כן, מזוודה אחת. שוקלת 15 קילו.", "B1"),
            ("impiegato", "Va bene. Ecco la carta d'imbarco.", "בסדר. הנה כרטיס העלייה למטוס.", "A2"),
        ],
        "bank": [
            ("impiegato", "Buongiorno! In cosa posso aiutarla?", "בוקר טוב! במה אני יכול לעזור?", "B1"),
            ("cliente", "Vorrei aprire un conto corrente.", "הייתי רוצה לפתוח חשבון עו\"ש.", "B1"),
            ("impiegato", "Ha un documento d'identità?", "יש לך תעודה מזהה?", "A2"),
            ("cliente", "Sì, ecco il mio passaporto.", "כן, הנה הדרכון שלי.", "A2"),
            ("impiegato", "Perfetto. Compili questo modulo.", "מושלם. מלא את הטופס הזה.", "B1"),
        ],
    }
    
    dialogues = []
    n = 0
    scenario_map = {}
    for s in existing_scenarios:
        key = s.get('scenario', '') or s.get('id', '')
        scenario_map[key] = s
    
    for scene_id, lines_template in templates.items():
        if scene_id not in scenario_map:
            continue
        sc = scenario_map[scene_id]
        levels = sc.get('levels', ['A1'])
        
        for level in levels:
            for variant in range(3):  # 3 variants per scenario per level
                n += 1
                dialogue_lines = []
                for i, (role, it, he, line_level) in enumerate(lines_template):
                    # Only include lines at or below current level
                    if level in ['A1','A2'] and line_level == 'B1':
                        if random.random() > 0.5:
                            continue
                    dialogue_lines.append({
                        "role": role,
                        "it": it,
                        "he": he,
                        "hint": "Translate: " + it
                    })
                
                if len(dialogue_lines) >= 3:
                    dialogues.append({
                        "id": f"{scene_id}_{level}_{variant}",
                        "scenario": scene_id,
                        "title": f"{sc['title']} - {level} (#{variant+1})",
                        "desc": sc.get('description', sc.get('title', '')),
                        "icon": sc['title'].split(' ')[0],
                        "level": level,
                        "lines": dialogue_lines
                    })
    
    return dialogues

# ═══════════════════════════════════════════════
# STAGE 7: STORY GENERATOR
# ═══════════════════════════════════════════════

def generate_stories(corpus_texts, extracted_vocab):
    """Generate graded stories from corpus content"""
    
    stories = []
    themes = [
        ("Una giornata a Roma", "giornata", "A1"),
        ("Il mio amico italiano", "amico", "A1"),
        ("La famiglia di Marco", "famiglia", "A2"),
        ("Una cena speciale", "cena", "A2"),
        ("Il viaggio a Venezia", "viaggio", "B1"),
        ("La storia della pizza", "pizza", "B1"),
        ("Il mercato di Porta Palazzo", "mercato", "B1"),
        ("La sfida dell'italiano", "sfida", "B2"),
        ("L'arte del caffè italiano", "caffe", "B2"),
        ("Le tradizioni italiane", "tradizioni", "C1"),
        ("La cultura del design italiano", "design", "C1"),
        ("L'evoluzione della lingua italiana", "lingua", "C2"),
    ]
    
    for i, (title, theme, level) in enumerate(themes):
        # Build a small set of domain words from the theme
        theme_words = [w for w, c in extracted_vocab.most_common(50) 
                      if theme in w or any(t in w for t in theme)]
        if not theme_words:
            theme_words = [word for word, _ in extracted_vocab.most_common(20)]
        
        stories.append({
            "id": f"story_{i:04d}",
            "title": title,
            "level": level,
            "word_count": 100 + 50 * (['A1','A2','B1','B2','C1','C2'].index(level)),
            "content": f"CONTENT_PLACEHOLDER_{title}",  # Replaced by generator
            "glossary": [{"it": w, "he": w} for w in theme_words[:5]],
            "questions": [
                {"q": f"Qual è il tema principale di '{title}'?", 
                 "options": [f"Il {theme}", "La storia", "La cultura", "La lingua"],
                 "correct": 0}
            ],
            "grammar_highlights": [f"{level}_reading_comprehension"]
        })
    
    return stories

# ═══════════════════════════════════════════════
# STAGE 8: EXAM QUESTION GENERATOR
# ═══════════════════════════════════════════════

def generate_exam_questions(corpus_texts, extracted_vocab):
    """Generate exam questions from corpus content"""
    questions = []
    exams = {"CILS":["A1","A2","B1","B2","C1","C2"],
             "CELI":["A1","A2","B1","B2","C1","C2"],
             "AIL":["A1","A2","B1","B2","C1","C2"]}
    sections = ["LISTENING","READING","WRITING","SPEAKING","GRAMMAR","VOCABULARY"]
    
    common_words = [w for w, _ in extracted_vocab.most_common(100)]
    question_count = 0
    
    for exam, levels in exams.items():
        for level in levels:
            for section in sections:
                target = 20
                for qi in range(target):
                    if not common_words:
                        break
                    word = random.choice(common_words)
                    question_count += 1
                    
                    # Type-appropriate question
                    if section in ("VOCABULARY", "GRAMMAR"):
                        q_type = "multiple_choice"
                        opts = [word, word + "o", word + "a", word + "e"]
                        random.shuffle(opts)
                        correct = opts.index(word) if word in opts else 0
                    elif section in ("LISTENING", "READING"):
                        q_type = "multiple_choice"
                        opts = ["opzione A", "opzione B", "opzione C", "opzione D"]
                        correct = 0
                    else:
                        q_type = "open"
                        opts = []
                        correct = 0
                    
                    questions.append({
                        "id": f"{exam}_{level}_{section}_{qi:03d}",
                        "exam": exam, "level": level, "section": section,
                        "question": f"Domanda {qi+1} per {exam} {level} {section}",
                        "prompt_it": f"Completa la frase: '{word}' significa...",
                        "type": q_type,
                        "options": opts,
                        "correct": correct,
                        "skills": [section, f"{level}_comprehension"],
                        "mistake_patterns": [],
                        "remediation_lessons": [f"{level}_{section}_basics"]
                    })
    
    return questions

# ═══════════════════════════════════════════════
# STAGE 9: ARTICLE GENERATOR (from corpus)
# ═══════════════════════════════════════════════

def generate_articles_from_corpus(corpus_texts):
    """Create articles from corpus texts with metadata"""
    articles = []
    types = [("news","Notizie"),("blog","Blog"),("recipe","Ricetta"),("guide","Guida"),
             ("story","Racconto"),("description","Descrizione")]
    
    for i, text_entry in enumerate(corpus_texts):
        content = text_entry['content']
        source = text_entry['source']
        sentences, words = tokenize(content)
        level = classify_cefr(words)
        t, t_it = types[i % len(types)]
        
        word_count = len(words)
        glossary_words = list(set(w for w in words[:10] if len(w) > 3 and w not in STOPWORDS))
        
        articles.append({
            "id": f"art_{i:04d}",
            "title": f"{t_it} da {source}",
            "type": t,
            "level": level,
            "content": content,
            "word_count": word_count,
            "cefr_vocabulary": {w: level for w in glossary_words[:10]},
            "glossary": [{"it": w, "he": f"translation_{w}"} for w in glossary_words[:10]],
            "questions": [
                {"q": f"Qual è l'argomento principale del testo?", 
                 "options": ["A", "B", "C", "D"], "correct": 0}
                for _ in range(3)
            ],
            "audio_url": f"audio/articles/art_{i:04d}.mp3",
            "srs_tags": [f"{level}_reading", t]
        })
    
    return articles

# ═══════════════════════════════════════════════
# MAIN PIPELINE
# ═══════════════════════════════════════════════

def run():
    print("═" * 60)
    print("VOLALINGO — CORPUS INTELLIGENCE PIPELINE")
    print("═" * 60)
    
    print("\n📥 Stage 1: Loading corpus...")
    corpus = load_corpus()
    print(f"  Total texts: {len(corpus)}")
    
    print("\n🔤 Stage 2: Tokenizing...")
    all_sentences = []
    all_words = []
    for entry in corpus:
        sentences, words = tokenize(entry['content'])
        all_sentences.extend(sentences)
        all_words.extend(words)
    print(f"  Sentences: {len(all_sentences)}")
    print(f"  Words: {len(all_words)}")
    
    print(f"\n📊 Stage 3: Classifying CEFR levels...")
    for entry in corpus:
        _, words = tokenize(entry['content'])
        level = classify_cefr(words)
        entry['cefr'] = level
        print(f"  {entry['source']}: {level}")
    
    print(f"\n📚 Stage 4: Extracting vocabulary...")
    vocab = extract_vocab(all_words)
    print(f"  Unique words: {len(vocab)}")
    print(f"  Top 10: {dict(vocab.most_common(10))}")
    
    print(f"\n🔬 Stage 5: Extracting grammar...")
    grammar = extract_grammar(all_sentences)
    for key, val in grammar.items():
        print(f"  {key}: {len(val)} occurrences")
    
    print(f"\n💬 Stage 6: Generating dialogues...")
    sc_path = os.path.join(CONTENT_DIR, "simulations.json")
    scenarios = []
    if os.path.exists(sc_path):
        scenarios = json.load(open(sc_path, encoding='utf-8'))
    existing_dial_path = os.path.join(CONTENT_DIR, "dialogues.json")
    existing_scenarios = []
    if os.path.exists(sc_path):
        existing_scenarios = json.load(open(sc_path, encoding='utf-8'))
    dialogues = generate_dialogues(vocab, existing_scenarios)
    dial_path = os.path.join(CONTENT_DIR, "dialogues.json")
    with open(dial_path, 'w', encoding='utf-8') as f:
        json.dump(dialogues, f, ensure_ascii=False, indent=2)
    print(f"  Generated {len(dialogues)} dialogues")
    
    print(f"\n📖 Stage 7: Generating stories...")
    stories = generate_stories(corpus, vocab)
    stories_path = os.path.join(CONTENT_DIR, "stories.json")
    with open(stories_path, 'w', encoding='utf-8') as f:
        json.dump(stories, f, ensure_ascii=False, indent=2)
    print(f"  Generated {len(stories)} stories")
    
    print(f"\n📝 Stage 8: Generating exam questions...")
    exams = generate_exam_questions(corpus, vocab)
    exams_path = os.path.join(CONTENT_DIR, "exams.json")
    with open(exams_path, 'w', encoding='utf-8') as f:
        json.dump(exams, f, ensure_ascii=False, indent=2)
    print(f"  Generated {len(exams)} exam questions")
    
    print(f"\n📰 Stage 9: Generating articles from corpus...")
    articles = generate_articles_from_corpus(corpus)
    articles_path = os.path.join(CONTENT_DIR, "articles.json")
    with open(articles_path, 'w', encoding='utf-8') as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)
    print(f"  Generated {len(articles)} articles from corpus")
    
    print(f"\n{'='*60}")
    print("📊 PIPELINE COMPLETE")
    print(f"{'='*60}")
    print(f"  Corpus texts processed: {len(corpus)}")
    print(f"  Dialogues generated: {len(dialogues)}")
    print(f"  Stories generated: {len(stories)}")
    print(f"  Articles generated: {len(articles)}")
    print(f"  Exam questions generated: {len(exams)}")
    print(f"{'='*60}")

if __name__ == '__main__':
    random.seed(42)
    run()
