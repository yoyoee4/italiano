# VolaLingo Quality Audit Report v2
**Date**: 2026-08-06  

## Content Quality (After Corpus Pipeline)

| File | Count | Quality | Notes |
|------|-------|---------|-------|
| **words.json** | 1,490 | ✅ Valid | Categories need refinement |
| **sentences.json** | 2,050 | ✅ Grammatical | Present tense, proper articles |
| **dialogues.json** | 21 | ✅ **Real Italian** | 118 lines, 0 placeholders |
| **stories.json** | 300 | ❌ Placeholder | Generator needs content |
| **articles.json** | 10 | ✅ **Real content** | 10 articles from corpus |
| **exams.json** | 2,160 | ✅ Structured | CILS/CELI/AIL tagged |
| **simulations.json** | 95 | ✅ Structured | 35 scenarios × levels |
| **culture.json** | 35 | ⚠️ Partial | Topic names exist |
| **dictionary/it-he.json** | 1,490 | ✅ Fixed | Context-aware examples |
| **nona-intelligence.json** | 3 | ✅ Complete | 3 personalities |

## Pipeline Status
✅ **Corpus Intelligence Pipeline** — `content/scripts/pipeline.py`  
  - Corpus directory: `corpus/txt/` (10 texts, 863 words)  
  - Stages: Tokenizer → CEFR → Vocab → Grammar → Dialogue → Story → Exam → Article  
  - Add a .txt file to corpus/txt/ → re-run pipeline → generates new content  

## Next: Error Intelligence
- Track user mistakes → SRS → personalized content
- Every 'gli' error triggers: exercise + story + dialogue + exam question
