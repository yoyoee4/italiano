# VolaLingo — Content Inventory Audit
**Generated**: 2025-08-05  
**Source**: `/italiano/content/` (13 files)

---

## 1. Summary Statistics

| File | Items | Total Lines | Size | CEFR Levels |
|------|-------|-------------|------|-------------|
| `words.json` | ~1,200 | 4,631 | 76 KB | Implicit (A1-A2 mostly) |
| `sentences.json` | ~1,400 | 1,401 | 46 KB | A1 (≈60%), A2 (≈30%), B1+ (≈10%) |
| `phrases.json` | ~750 | 764 | 17 KB | Level 1-3 (maps to A1-A2) |
| `dialogues.json` | 12 dialogues | 373 | 10 KB | Levels 1-3 |
| `stories.json` | 8 stories | 517 | 17 KB | A2 (3), B1 (3), B2 (2) |
| `songs.json` | 10 songs | 317 | 8.8 KB | A2 (6), B1 (3), B2 (1) |
| `skill-tree.json` | 64 nodes | 659 | 12 KB | A1 (20), A2 (15), B1 (10), B2 (7), C1 (6), C2 (6) |
| `culture.json` | 15 items | 121 | 4.6 KB | N/A |
| `grammar.json` | 6 topics | 79 | 1.7 KB | A1 (2), A2 (1), B1 (1), B2 (1), C1 (1) |
| `exams.json` | 4 CILS levels | 131 | 2.1 KB | A1, A2, B1, B2 |
| `news.json` | 15 articles | 121 | 14 KB | B1 (5), B2 (7), C1 (3) |
| `achievements.json` | 12 achievements | 97 | 1.8 KB | N/A |
| `levels.json` | 5 app levels | 46 | 0.9 KB | N/A |
| `characters.json` | 5 characters | 41 | 0.9 KB | N/A |
| **TOTAL** | **~3,400+ items** | | **~200 KB** | |

---

## 2. CEFR Coverage Analysis

### Current Distribution
| Level | Vocabulary | Sentences | Phrases | Dialogues | Stories | Songs | News | Grammar | Skill Nodes |
|-------|------------|-----------|---------|-----------|---------|-------|------|---------|-------------|
| **A1** | ~60% | ~60% | Level 1 | Level 1 | 0 | 0 | 0 | 2 topics | 20 |
| **A2** | ~30% | ~30% | Level 2 | Level 2 | 3 | 6 | 5 | 1 topic | 15 |
| **B1** | ~8% | ~10% | Level 3 | Level 3 | 3 | 3 | 5 | 1 topic | 10 |
| **B2** | ~2% | ~2% | - | - | 2 | 1 | 7 | 1 topic | 7 |
| **C1** | 0% | 0% | - | - | 0 | 0 | 3 | 1 topic | 6 |
| **C2** | 0% | 0% | - | - | 0 | 0 | 0 | 0 topics | 6 |

### **Critical Gaps**
1. **C1/C2 Vocabulary**: No explicit C1/C2 words in `words.json`
2. **C1/C2 Sentences**: Zero sentences above B2
3. **C1/C2 Dialogues**: None
4. **C1/C2 Stories**: None
5. **C1/C2 Songs**: None
6. **Grammar**: Only 6 topics total — missing most CEFR grammar (subjunctive, conditional perfect, passive, gerundio, etc.)
7. **Exam Practice**: Only CILS structure defined, no actual practice items
8. **Writing**: No writing exercises content

---

## 3. Skill/Topic Coverage

### Current Categories (from words.json `cat` field)
| Category | Word Count | CEFR Focus |
|----------|------------|------------|
| ברכות (Greetings) | ~30 | A1 |
| מספרים (Numbers) | ~40 | A1 |
| זמן (Time) | ~60 | A1-A2 |
| משפחה (Family) | ~25 | A1 |
| אוכל (Food) | ~50 | A1-A2 |
| מקומות (Places) | ~30 | A1-A2 |
| גוף (Body) | ~25 | A1 |
| צבעים (Colors) | ~15 | A1 |
| פעלים (Verbs) | ~100 | A1-B1 |
| תארים (Adjectives) | ~40 | A1-A2 |
| בריאות (Health) | ~20 | A2 |
| תחבורה (Transport) | ~25 | A2 |
| קניות (Shopping) | ~20 | A2 |
| רגשות (Emotions) | ~20 | A2 |
| עבודה (Work) | ~30 | B1-B2 |
| טבע (Nature) | ~25 | B1 |
| טכנולוגיה (Technology) | ~15 | B2 |
| פוליטיקה (Politics) | ~10 | C1 |
| משפט (Legal) | ~10 | C1 |
| אקדמיה (Academic) | ~10 | C1 |

### **Missing High-Value Categories**
| Category | Priority | Notes |
|----------|----------|-------|
| **Travel/Transport details** | High | Train stations, airports, tickets, delays |
| **Medical emergencies** | High | Hospital, pharmacy, symptoms |
| **Bureaucracy** | High | Permesso di soggiorno, codice fiscale, anagrafe |
| **Housing/Renting** | High | Contracts, utilities, condominium |
| **Banking/Finance** | Medium | Accounts, transfers, taxes |
| **Professional/Workplace** | Medium | Meetings, emails, CV, interviews |
| **Academic/University** | Medium | Enrollment, exams, thesis |
| **Legal/Administrative** | Medium | Contracts, rights, police |
| **Digital/Tech** | Medium | Apps, SPID, PEC, digital signature |
| **Sustainability/Environment** | Low | Recycling, renewable energy |
| **Arts/Literature** | Low | Opera, cinema, books |

---

## 4. Content Quality Issues

### Duplicates / Near-Duplicates
- **Greetings**: Multiple overlaps between `words.json` (30 items), `phrases.json` (intro section), `sentences.json`
- **Numbers**: `words.json` has 0-1000, `phrases.json` may repeat
- **Time expressions**: Scattered across words, phrases, sentences

### Inconsistent Schema
| File | ID Field | Level Field | Category Field | Translations |
|------|----------|-------------|----------------|--------------|
| `words.json` | ❌ | ❌ | `cat` (HE) | `it`, `he` only |
| `sentences.json` | ❌ | ✅ (`level`) | `cat` (EN) | `target`, `native`, `en` |
| `phrases.json` | ❌ | ✅ (`level` 1-3) | `cat` (HE) | `it`, `he` |
| `dialogues.json` | ✅ | ✅ (`level` 1-3) | — | `it`, `he`, `hint` |
| `stories.json` | ✅ | ✅ | — | `it`, `he`, `en` |
| `songs.json` | ✅ | ✅ | — | `it`, `he` |
| `news.json` | ✅ | ✅ | — | `it`, `he`, `source` |
| `culture.json` | ❌ | ❌ | — | `title`, `desc` (HE) |
| `grammar.json` | ✅ | ✅ | — | `explanation` (EN), `examples` (it/he) |

### Weak Areas
1. **No audio references** — `img` field exists in some words but no audio URLs
2. **No gender/plural info** — Critical for Italian nouns
3. **No verb conjugation tables** — Only infinitive in words
4. **No related words** — No synonyms, antonyms, word families
5. **No frequency data** — Can't prioritize high-frequency vocabulary
6. **No example sentences per word** — Only standalone sentences file
7. **Culture content is shallow** — 15 items, no exercises attached
8. **Grammar is minimal** — 6 topics vs ~50 needed for A1-C2
9. **Exam practice missing** — Structure defined but zero practice questions

---

## 5. Expansion Requirements for C6

### To reach "Duolingo + Italian Teacher + CILS Academy" parity:

| Content Type | Current | Target (A1-C2) | Gap |
|--------------|---------|----------------|-----|
| **Vocabulary items** | ~1,200 | ~5,000 | 3,800 |
| **Sentences** | ~1,400 | ~5,000 | 3,600 |
| **Grammar topics** | 6 | ~50 | 44 |
| **Dialogues** | 12 | ~100 | 88 |
| **Stories** | 8 | ~50 | 42 |
| **Songs** | 10 | ~30 | 20 |
| **News/Articles** | 15 | ~200 | 185 |
| **Culture modules** | 15 | ~50 | 35 |
| **Exam practice sets** | 0 | ~200 | 200 |
| **Writing prompts** | 0 | ~100 | 100 |
| **Dictionary entries** | 0 | ~3,000 | 3,000 |

---

## 6. Recommended Content Architecture (Post-C6)

```
/content/
├── schema/
│   ├── content-item.schema.json
│   ├── lesson.schema.json
│   ├── exercise.schema.json
│   └── exam-question.schema.json
├── curriculum/
│   ├── A1/
│   ├── A2/
│   ├── B1/
│   ├── B2/
│   ├── C1/
│   └── C2/
├── dictionary/
│   ├── it-he.json
│   ├── it-en.json
│   └── metadata.json
├── culture/
│   ├── food/
│   ├── regions/
│   ├── holidays/
│   ├── coffee/
│   ├── daily-life/
│   └── history/
├── grammar/
│   ├── A1/
│   ├── A2/
│   ├── B1/
│   ├── B2/
│   ├── C1/
│   └── C2/
├── exercises/
│   ├── vocabulary/
│   ├── listening/
│   ├── speaking/
│   ├── reading/
│   ├── writing/
│   ├── sentence-builder/
│   ├── translation/
│   ├── picture/
│   ├── dialogue/
│   └── exam/
├── exam/
│   ├── CILS/
│   ├── CELI/
│   └── AIL/
└── media/
    ├── audio/
    └── images/
```

---

## 7. Priority Recommendations

### **Immediate (Week 1-2)**
1. ✅ Create JSON Schemas for all content types
2. ✅ Add CEFR level, gender, plural, frequency to `words.json`
3. ✅ Expand grammar to 20+ topics (cover A1-B1)
4. ✅ Create curriculum structure A1-B1

### **Short-term (Week 3-4)**
5. ✅ Build dictionary engine with offline support
6. ✅ Add exam practice questions (CILS A1-B1)
7. ✅ Create writing prompts per CEFR level
8. ✅ Expand culture with exercises

### **Medium-term (Month 2)**
9. ✅ Full A1-C2 curriculum with 100+ units
10. ✅ Article/reading system with CEFR tagging
11. ✅ Nona integration with content intelligence
12. ✅ Exam recommendation engine

---

## 8. Validation Checklist (Before C6 Commit)

- [ ] All existing features work (Learn, Practice, Nona, Exam, XP, SRS, Offline)
- [ ] New content loads without breaking current code
- [ ] Dictionary works offline
- [ ] CEFR filtering works on all content
- [ ] Exam recommendations appear in Exam Center
- [ ] No console errors
- [ ] Mobile touch targets ≥44px maintained
- [ ] Animations/transitions smooth

---

**Next Step**: Create `/content/schema/` files (Phase 1) then begin curriculum structure (Phase 3).