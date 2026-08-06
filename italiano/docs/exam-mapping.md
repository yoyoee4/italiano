# VolaLingo — Exam Content Mapping

**Generated**: 2025-08-05  
**Purpose**: Map all content items to CILS/CELI/AIL exam requirements for intelligent recommendation engine.

---

## CILS Exam Structure Mapping

### CILS A1 (Total: 90 min)
| Section | Duration | Items | Our Content Coverage |
|---------|----------|-------|---------------------|
| **Ascolto** | 20 min | 15 | A1 dialogues, A1 listening exercises, vocabulary audio |
| **Lettura** | 30 min | 15 | A1 sentences, A1 phrases, A1 articles |
| **Scrittura** | 30 min | 1 task | A1 writing prompts (50-80 words): self-intro, simple message |
| **Parlato** | 10 min | 1 task | A1 speaking: self-intro, roleplay (cafe/restaurant) |

### CILS A2 (Total: 100 min)
| Section | Duration | Items | Our Content Coverage |
|---------|----------|-------|---------------------|
| **Ascolto** | 20 min | 15 | A2 dialogues, A2 listening, news snippets |
| **Lettura** | 30 min | 15 | A2 sentences, A2 articles, simple stories |
| **Scrittura** | 40 min | 2 tasks | A2 writing: short message + simple description (80-100 words) |
| **Parlato** | 10 min | 1 task | A2 speaking: transactional roleplay, picture description |

### CILS B1 (Total: 150 min)
| Section | Duration | Items | Our Content Coverage |
|---------|----------|-------|---------------------|
| **Ascolto** | 30 min | 20 | B1 dialogues, B1 news, podcast snippets |
| **Lettura** | 45 min | 20 | B1 articles, B1 stories, opinion texts |
| **Scrittura** | 60 min | 2 tasks | B1 writing: formal email + opinion essay (150-200 words) |
| **Parlato** | 15 min | 1 task | B1 speaking: express opinion, roleplay, picture description |

### CILS B2 (Total: 165 min)
| Section | Duration | Items | Our Content Coverage |
|---------|----------|-------|---------------------|
| **Ascolto** | 30 min | 20 | B2 news, lectures, interviews |
| **Lettura** | 50 min | 25 | B2 articles, literary texts, complex arguments |
| **Scrittura** | 70 min | 2 tasks | B2 writing: formal letter + argumentative essay (200-250 words) |
| **Parlato** | 15 min | 1 task | B2 speaking: presentation, debate, complex roleplay |

---

## Content-to-Exam Tagging System

Every content item gets `examTags` array:

```json
{
  "examTags": [
    "CILS_A1_LISTENING",
    "CILS_A1_SPEAKING",
    "CELI_A2_READING",
    "AIL_B1_WRITING"
  ]
}
```

### Tag Format: `EXAM_LEVEL_SECTION`

| Exam | Levels | Sections |
|------|--------|----------|
| CILS | A1, A2, B1, B2, C1, C2 | LISTENING, READING, WRITING, SPEAKING |
| CELI | A1, A2, B1, B2, C1, C2 | LISTENING, READING, WRITING, SPEAKING |
| AIL | A2, B1, B2, C1 | LISTENING, READING, WRITING, SPEAKING |

---

## Mapping Examples

### Vocabulary Items
```json
{
  "id": "it_food_caffe_001",
  "examTags": [
    "CILS_A1_LISTENING",
    "CILS_A1_SPEAKING",
    "CILS_A2_READING",
    "CELI_A1_SPEAKING"
  ]
}
```

### Grammar Topics
```json
{
  "id": "g3_passato_prossimo",
  "examTags": [
    "CILS_A2_READING",
    "CILS_A2_WRITING",
    "CILS_B1_WRITING",
    "CELI_A2_WRITING"
  ]
}
```

### Lessons
```json
{
  "id": "A1_food_basics",
  "examPractice": [
    "exam_CILS_A1_LISTENING_003",
    "exam_CILS_A1_SPEAKING_001"
  ]
}
```

### Culture Modules
```json
{
  "id": "culture_coffee",
  "examTags": [
    "CILS_A1_SPEAKING",
    "CILS_A2_READING",
    "CELI_A1_SPEAKING"
  ]
}
```

### Articles
```json
{
  "id": "art_A2_aperitivo_001",
  "examTags": [
    "CILS_A2_READING",
    "CILS_B1_READING",
    "CELI_A2_READING"
  ]
}
```

---

## Exam Recommendation Engine Logic

### Input: User Profile
```json
{
  "targetExam": "CILS",
  "targetLevel": "B1",
  "weakAreas": ["congiuntivo", "passato_prossimo", "vocabolario_cibo"],
  "completedLessons": ["A1_greetings", "A1_food", "A2_past_tenses"],
  "timeUntilExam": "30 days"
}
```

### Output: Study Plan
```json
{
  "recommendedLessons": [
    "B1_opinion",
    "B1_media",
    "B2_complex_grammar"
  ],
  "priorityExercises": [
    "congiuntivo practice (exam-style)",
    "passato_prossimo review (spaced repetition)",
    "food vocabulary flashcards (exam tagged)"
  ],
  "simulationSchedule": [
    { "day": 7, "exam": "CILS_B1_FULL_001" },
    { "day": 14, "exam": "CILS_B1_FULL_002" },
    { "day": 21, "exam": "CILS_B1_FULL_003" },
    { "day": 28, "exam": "CILS_B1_FULL_004" }
  ],
  "estimatedReadiness": "65%",
  "weakAreaPlan": {
    "congiuntivo": ["lesson B1_conditional", "exercises 15-20"],
    "passato_prossimo": ["review A2_past_tenses", "spaced repetition deck"],
    "vocabolario_cibo": ["A1_food flashcards", "A2_restaurant dialogue"]
  }
}
```

---

## Implementation Checklist

### Phase 9 Tasks
- [ ] Add `examTags` to all existing content items (words, sentences, phrases, dialogues, stories, grammar, culture, articles)
- [ ] Create exam question bank: 50+ questions per CILS level per section
- [ ] Build ExamRecommendationEngine class
- [ ] Integrate with Exam Center UI
- [ ] Add "Study These Before Simulation" panel
- [ ] Track user readiness per exam section
- [ ] Generate personalized study plans

### Content Tagging Priority
| Priority | Content Type | Count | Effort |
|----------|--------------|-------|--------|
| **High** | Vocabulary (A1-B1) | ~800 | Medium |
| **High** | Grammar topics | ~20 | Low |
| **High** | Lessons (curriculum) | ~20 | Low |
| **Medium** | Dialogues | ~20 | Low |
| **Medium** | Articles | ~15 | Low |
| **Medium** | Culture modules | ~15 | Low |
| **Low** | Stories/Songs | ~20 | Low |

---

## Quality Assurance

### Validation Rules
1. Every exam-tagged item must have valid CEFR level
2. Tags must match actual content difficulty
3. No orphan tags (exam sections that have no content)
4. Balanced coverage: each exam section has ≥20 tagged items per level
5. Cross-exam consistency: CILS B1 READING ≈ CELI B1 READING content

### Testing
- [ ] Run tag coverage report per exam/level/section
- [ ] Verify recommendation engine outputs valid study plans
- [ ] A/B test: tagged vs untagged content in Exam Center
- [ ] User feedback: "Did recommendations help?"

---

**Next**: Implement content tagging script + ExamRecommendationEngine