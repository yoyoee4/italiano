# VolaLingo Exam System

## Overview

VolaLingo provides **comprehensive preparation for official Italian certification exams**: CILS (Siena), CELI (Perugia), and AIL (Florence). The exam system is deeply integrated into the adaptive learning orchestrator.

---

## Supported Exams

### CILS — Certificazione di Italiano come Lingua Straniera
**Issuer**: Università per Stranieri di Siena  
**Levels**: A1, A2, B1, B2, C1, C2  
**Structure**: 4 sections (Reading, Writing, Listening, Speaking) + Grammar/Vocabulary

| Level | Duration | Sections | Pass Mark |
|-------|----------|----------|-----------|
| A1 | 2h | 4 + G/V | 60% each |
| A2 | 2h 30m | 4 + G/V | 60% each |
| B1 | 3h 30m | 4 + G/V | 60% each |
| B2 | 4h | 4 + G/V | 60% each |
| C1 | 5h | 4 + G/V | 60% each |
| C2 | 5h 30m | 4 + G/V | 60% each |

### CELI — Certificato di Conoscenza della Lingua Italiana
**Issuer**: Università per Stranieri di Perugia  
**Levels**: A1, A2, B1, B2, C1, C2  
**Structure**: Similar to CILS with different task types

### AIL — Accademia Italiana di Lingua
**Issuer**: Accademia Italiana di Lingua (Firenze)  
**Levels**: A1, A2, B1, B2, C1  
**Structure**: DELI (A1-A2), DILI (B1-B2), DALI (C1)

---

## Exam Mapping System

### Tagging Format
All content items tagged with: `EXAM_{TYPE}_{LEVEL}_{SECTION}`

Examples:
- `EXAM_CILS_B1_READING`
- `EXAM_CELI_A2_LISTENING`
- `EXAM_AIL_B2_WRITING`
- `EXAM_CILS_B1_GRAMMAR`

### Content-to-Exam Traceability
```
Content Item (word/sentence/dialogue)
    │
    ├─► EXAM_CILS_B1_READING
    ├─► EXAM_CELI_B1_LISTENING
    └─► EXAM_AIL_B1_WRITING
           │
           ▼
    Orchestrator.createExamSimulation('CILS', 'B1')
           │
           ▼
    Generates: 20 reading + 15 writing + 15 listening + 10 speaking
```

---

## Exam Engine (js/modules/exam.js)

### Public API
```javascript
ExamEngine = {
  init(contentLoader),           // Initialize with content
  getExamStructure(type, level), // Get official structure
  generateMockExam(type, level), // Generate full mock exam
  scoreExam(answers),            // Score submitted answers
  getWeakAreas(results),         // Identify weak sections
  recommendPrep(weakAreas)       // Get prep recommendations
}
```

### Mock Exam Generation
1. **Filter content** by exam tags
2. **Balance sections** per official structure
3. **Select generators** appropriate to section type
4. **Apply difficulty** calibration per level
5. **Add timing** per official limits

---

## Orchestrator Integration

### Exam Prep Priority (Priority 85)
```javascript
// In orchestrator.js PRIORITY_CONFIG
exam_prep: {
  base: 85,
  condition: (profile) => profile.examDate && 
    daysUntil(profile.examDate) <= 30,
  decay: (days) => days > 30 ? 0 : 85 - days
}
```

### Exam Proximity Behavior
| Days Until Exam | Behavior |
|-----------------|----------|
| > 30 | Normal learning, occasional exam questions |
| 15-30 | Exam prep priority 85, daily mock sections |
| 7-14 | Exam prep dominant, full mock exams weekly |
| 1-7 | Intensive prep, daily full mocks, weakness focus |
| Exam day | Light review only, confidence building |

### Exam Simulation API
```javascript
Orchestrator.createExamSimulation('CILS', 'B1')
// Returns:
{
  type: 'exam_simulation',
  examType: 'CILS',
  level: 'B1',
  exercises: [Exercise[], ...],  // 60 exercises total
  timeLimit: 210,  // minutes
  sections: {
    reading: 20,
    writing: 15,
    listening: 15,
    speaking: 10
  }
}
```

---

## Content Coverage Requirements

### Per Level Per Exam Type
| Section | A1 | A2 | B1 | B2 | C1 | C2 |
|---------|----|----|----|----|----|----|
| Reading | 20 | 25 | 30 | 35 | 40 | 45 |
| Writing | 10 | 12 | 15 | 18 | 20 | 22 |
| Listening | 15 | 18 | 20 | 22 | 25 | 28 |
| Speaking | 8 | 10 | 12 | 15 | 18 | 20 |
| Grammar/Vocab | 25 | 30 | 35 | 40 | 45 | 50 |

### Current Status
- **Content items tagged**: 156 (sample)
- **Exam questions generated**: Via generators (dynamic)
- **Mock exams tested**: CILS A1, B1; CELI A2

---

## Exam Preparation Features

### 1. Adaptive Mock Exams
- Full-length timed simulations
- Section-by-section practice
- Weakness-targeted mini-exams

### 2. Progress Tracking
```javascript
examProgress: {
  'CILS_B1': {
    reading: { attempted: 45, correct: 38, avgTime: 120 },
    writing: { attempted: 20, correct: 16, avgScore: 0.75 },
    listening: { attempted: 30, correct: 24, avgTime: 90 },
    speaking: { attempted: 15, correct: 12, avgScore: 0.80 },
    mockExams: 3,
    lastMock: '2026-01-15',
    readinessScore: 0.78
  }
}
```

### 3. Nona Exam Coaching
- **Strict Nonna**: "Ancora! This subjunctive is wrong. Again."
- **Teacher Nonna**: "Good effort. Let me explain the subjunctive rule..."
- **Sweet Nonna**: "Brava! Just one small thing on the congiuntivo..."

### 4. Official-Style Scoring
- Section scores (0-100)
- Pass/fail per section (60% threshold)
- Overall pass requires ALL sections ≥60%
- Certificate prediction

---

## Integration Points

### With Practice Engine
- Exam exercises use same generators
- SRS includes exam-tagged items
- Session structure: warmup → exam section → cooldown

### With Content Intelligence
- Dictionary entries tagged for exam
- Culture articles tagged for reading section
- Dialogues tagged for listening/speaking

### With Gamification
- Exam prep XP bonus (1.5x)
- "Exam Ready" achievement
- Streak protection during exam week

---

## Future Enhancements

1. **Official Past Papers** — License real past exams
2. **Examiner Simulation** — AI examiner for speaking
3. **Writing Evaluation** — AI scoring for writing tasks
4. **Exam Calendar** — Integration with official exam dates
5. **Teacher Dashboard** — For schools/tutors to monitor students

---

*Exam system designed per official CILS/CELI/AIL specifications. Updated: 2026-08-05*