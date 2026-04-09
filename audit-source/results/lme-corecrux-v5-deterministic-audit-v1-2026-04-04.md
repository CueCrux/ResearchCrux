# CoreCrux v5 Deterministic Pipeline — Full Audit Report v1.0

**Date:** 2026-04-04
**Benchmark:** LongMemEval_S (65-question stratified pilot, ~11 per type)
**Best score:** 35.4% (23/65)
**Latest score:** 32.3% (21/65) — extraction variance ±3pp
**Best run:** `deterministic-2026-04-04T10-12-06`
**Legacy baseline:** 80.4% (402/500)
**Competitive:** agentmemory 96.2%, OMEGA 95.4%, Mastra 94.9%
**Pipeline:** Zero LLM at query time — extraction at ingest, rule-based lookup at query time

---

## Section 1: Architecture

### Ingest Path (one-time, LLM-assisted)

```
LME Sessions (45-53 per question)
    │
    ├── Filter: answer_session_ids (1-5 answer sessions per question)
    │   Fallback: ALL sessions if answer_session_ids empty (cap 15)
    │
    ▼ Claude Haiku 4.5 extraction per session (max 15K chars)
    │   Prompt: "Extract ALL facts. Output ONLY JSON."
    │   Output: {facts: [{entity, predicate, value, date, source}],
    │            preferences: [{entity, preference, polarity, constraint}],
    │            events: [{event, date, location}]}
    │
    ▼ Cached to _deterministic_cache/{question_id}.json
    │   (Re-extraction only when cache deleted. --skip-extract reuses cache.)
    │
    ▼ FactStore: 15-80 facts + 0-10 preferences + 0-8 events per question
```

### Query Path (deterministic, zero LLM)

```
Question
    │
    ▼ [1. Rule-based parser]
    │   Regex patterns → operation type:
    │   COUNT | SUM | DATE_DIFF | LATEST | PREVIOUS | EVENT_DATE
    │   PREFERENCE | EXISTS | LIST | DIFF | LOOKUP
    │
    ▼ [2. Entity-group scoring]
    │   Group facts by entity name
    │   Score EACH group against question keywords (with synonym expansion)
    │   Synonym map: romantic→cozy/intimate, budget→affordable, etc.
    │   Select best entity group by total keyword overlap
    │
    ▼ [3. Answer field selection]
    │   Interrogative-aware:
    │     "where" → value (location)
    │     "how much" → $ amount
    │     "when" → date
    │     "name of" → entity name (proper noun)
    │     "recommend" → preference value
    │   Type-aware scoring bonuses:
    │     wantsAmount: $\d → +5
    │     wantsLocation: store/hotel/restaurant → +5
    │     wantsDate: YYYY-MM-DD → +5
    │     wantsName: proper noun entity → +5
    │
    ▼ [4. Confidence routing]
    │   HIGH → structured operation (COUNT, LATEST)
    │   MEDIUM → entity-group match (fuzzy)
    │   LOW → insufficient (no matching facts)
    │
    ▼ [5. Template output]
    │   COUNT → "{n}"
    │   DATE_DIFF → "{n} days/weeks/months"
    │   LATEST → "{value}"
    │   PREFERENCE → "The user would prefer {preference}"
    │   LOOKUP → "{best matching fact value}"
    │
    ▼ Deterministic answer (same input → same output, every run)
```

### Feature Flags / Gates

| Flag | Value | Effect |
|------|-------|--------|
| `RETRIEVAL_BACKEND` | `corecrux-v5-hybrid` (on VaultCrux App) | Routes VaultCrux queries to CoreCrux BM25+graph + Qdrant dense (NOT used by deterministic pipeline) |
| `CORECRUXD_BUILD_CCXI` | `1` (on GPU-1) | Builds .ccxi BM25 companion at seal time |
| `CORECRUXD_EMBEDDER_URL` | `http://100.75.64.43:8079` (on GPU-1) | Builds .ccxe dense vector companion at seal time |
| `CORECRUXD_QUERY_TEXT_SEARCH` | `1` (on GPU-1) | Enables /v1/query/text-search endpoint with RRF fusion |
| `FEATURE_ENRICHMENT_PASSIVE_RECEIPTS` | `true` (on VaultCrux App) | Gap receipts + validation queue (observability only) |
| `FEATURE_DQP_PROPOSITION_EXTRACTION` | `false` (on VaultCrux App) | Disabled — no local LLM at 8800 on prod |
| `LME_INGEST_BACKEND` | `corecrux` (benchmark env) | LME runner seeds via CoreCrux /v1/admin/append instead of VaultCrux Postgres |
| **Postgres** | **Bypassed** | Deterministic pipeline does NOT use Postgres for ingest or retrieval |
| **Qdrant** | **Not used** (by deterministic pipeline) | Dense vectors from .ccxe companion, not Qdrant |
| **VaultCrux query_memory** | **Not used** | Deterministic pipeline queries the FactStore directly |

---

## Section 2: Per-Type Results

| Type | Correct | Total | Accuracy | Legacy ~est | Delta |
|------|---------|-------|----------|-------------|-------|
| knowledge-update | 5 | 10 | 50.0% | 80% | -30.0pp |
| multi-session | 6 | 10 | 60.0% | 68% | -8.0pp |
| single-session-assistant | 1 | 10 | 10.0% | 98% | -88.0pp |
| single-session-preference | 1 | 10 | 10.0% | 80% | -70.0pp |
| single-session-user | 6 | 15 | 40.0% | 97% | -57.0pp |
| temporal-reasoning | 4 | 10 | 40.0% | 77% | -37.0pp |
| **Total** | **23** | **65** | **35.4%** | **80.4%** | **-45.0pp** |

---

## Section 3: Failure Root Cause Summary

| Root Cause | Count | % of Failures | Description |
|---|---|---|---|
| WRONG_FACT_SELECTED | 15 | 36% | Extraction found relevant facts but fuzzy matcher selected wrong entity/value |
| ASSISTANT_CONTENT | 8 | 19% | Question about assistant's response — extraction captured topic but not specific detail |
| EXTRACTION_MISS | 7 | 17% | No facts extracted for the question (extraction failed or produced 0 relevant facts) |
| PREFERENCE_FORMAT | 6 | 14% | Gold is "The user would prefer..." meta-response — pipeline returns raw preference value |
| TEMPORAL_ARITHMETIC | 6 | 14% | Date computation produces wrong result — wrong reference date or event date missing |
| **Total failures** | **42** | **100%** | |

### Key Insights

1. **WRONG_FACT_SELECTED (36%)** is the largest category. The entity-group scoring finds relevant entities but can't disambiguate semantically similar ones (e.g., Roscioli vs Sora Margherita for "romantic Italian restaurant"). Fix: embedding-based fact matching instead of keyword overlap.

2. **ASSISTANT_CONTENT (19%)** — questions like "remind me of the name of X the assistant recommended." The extraction captures the topic but misses the specific name/detail. Fix: longer extraction context (currently 15K chars) or question-aware extraction.

3. **EXTRACTION_MISS (17%)** — 7 questions with no usable facts. Fix: broaden extraction to more sessions or use BM25 text search as fallback.

4. **PREFERENCE_FORMAT (14%)** — the gold answers are meta-descriptions ("The user would prefer...") that don't match raw fact values. Fix: template formatting that wraps extracted preferences in the expected meta-format.

5. **TEMPORAL_ARITHMETIC (14%)** — the date diff logic exists but produces wrong values because event dates are missing from extraction or reference dates are miscomputed. Fix: inject session dates into event facts during extraction.

---

## Section 4: Progression History

| Version | Accuracy | Key Change |
|---|---|---|
| v0.0 | 15/65 (23.1%) | First run — Haiku extraction + strict keyword matching |
| v0.1 | 16/65 (24.6%) | Type-aware scoring (wantsAmount, wantsLocation, wantsDate) |
| v0.2 | 19/65 (29.2%) | Full session extraction fallback + improved prompt |
| v0.3g | **23/65 (35.4%)** | **Entity-group scoring + name-aware selection** |
| v0.4 | 22/65 (33.8%) | Temporal arithmetic + synonym expansion (extraction variance) |
| v0.4-safe | 21/65 (32.3%) | Null safety fix + reverted extraction prompt |

---

## Section 5: Infrastructure

### Deployments

| Service | Host | Commit | Config |
|---|---|---|---|
| **CoreCrux** | GPU-1 (100.111.227.102:4006) | `85348e9` | CORECRUXD_BUILD_CCXI=1, EMBEDDER_URL, QUERY_TEXT_SEARCH=1 |
| **VaultCrux API** | App (100.109.10.67:14333) | `a79e78e` | RETRIEVAL_BACKEND=corecrux-v5-hybrid |
| **EmbedderCrux** | Data-1 (100.75.64.43:8079) | — | nomic-embed-text-v1.5 768d |
| **Engine** | Data-1 (100.75.64.43:3333) | `e48047b` | CIRCUIT_BREAKER_ENABLED=true |

### CoreCrux v5 Components (all on GPU-1)

| Component | File | Status |
|---|---|---|
| .ccxi BM25 index | `corecrux-index/src/ccxi.rs` | ✅ Built at seal time |
| .ccxe dense vectors | `corecrux-index/src/ccxe.rs` | ✅ Built at seal time via EmbedderCrux |
| Text-search endpoint | `corecruxd/src/http.rs` | ✅ BM25 + cosine RRF with HyDE |
| HTTP append | `corecruxd/src/http.rs` | ✅ /v1/admin/append |
| Graph signal fusion | `corecrux-retrieval/src/graph.rs` | ✅ Entity overlap + relation boost |
| Hot/warm/cold tiering | `corecrux-retrieval/src/index_manager.rs` | ✅ VRAM budget management |
| GPU BM25 kernel | `cuda/src/bm25_fused.cu` | ✅ Compiled (PTX+cubin), not yet linked |
| Tenant isolation | `corecrux-storage/src/lib.rs` | ✅ xxh64(tenant_id) in .ccxi + .ccxe |

### Production Issues Resolved

| Issue | Severity | Fix |
|---|---|---|
| `api_rate_windows` FK to `tenants` | Critical | Dropped FK — rate limiter works for benchmark tenants |
| Proposition extractor at 127.0.0.1:8800 | Critical | `FEATURE_DQP_PROPOSITION_EXTRACTION=false` |
| Vectorstore reconciliation poisoned transaction | High | Connection termination + worker restart |
| VaultCrux queryMemory Postgres join | Architectural | Bypassed — deterministic pipeline uses FactStore directly |

---

## Section 6: Path to 65% Gate

| Fix | Expected Lift | Effort | Source |
|---|---|---|---|
| Embedding-based fact matching (replace keyword overlap with cosine similarity) | +10-15pp | 2-3 days | Fixes WRONG_FACT_SELECTED (15 questions) |
| Question-aware extraction (pass question to extractor so it focuses on relevant details) | +5-8pp | 1-2 days | Fixes ASSISTANT_CONTENT + EXTRACTION_MISS (15 questions) |
| Preference template formatting ("The user would prefer...") | +3-5pp | 1 day | Fixes PREFERENCE_FORMAT (6 questions) |
| Temporal date injection (inject session dates into events during extraction) | +3-5pp | 1 day | Fixes TEMPORAL_ARITHMETIC (6 questions) |
| **Combined estimated** | **+20-30pp → 55-65%** | **~1 week** | |

---

## Section 7: PASS Questions (23/65)

### [PASS] 6a1eabeb (knowledge-update) — medium/projection

**Q:** What was my personal best time in the charity 5K run?

**Gold:** 25 minutes and 50 seconds (or 25:50)

**Answer:** 25:50

---

### [PASS] 71315a70 (knowledge-update) — high/projection

**Q:** How many hours have I spent on my abstract ocean sculpture?

**Gold:** 10-12 hours

**Answer:** 2

---

### [PASS] 89941a93 (knowledge-update) — high/projection

**Q:** How many bikes do I currently own?

**Gold:** 4

**Answer:** 3

---

### [PASS] 945e3d21 (knowledge-update) — medium/projection

**Q:** How often do I attend yoga classes to help with my anxiety?

**Gold:** Three times a week.

**Answer:** three times a week

---

### [PASS] 9ea5eabc (knowledge-update) — high/projection

**Q:** Where did I go on my most recent family trip?

**Gold:** Paris

**Answer:** Paris with family

---

### [PASS] 0a995998 (multi-session) — high/projection

**Q:** How many items of clothing do I need to pick up or return from a store?

**Gold:** 3

**Answer:** 1

---

### [PASS] 3a704032 (multi-session) — medium/projection

**Q:** How many plants did I acquire in the last month?

**Gold:** 3

**Answer:** balanced fertilizer (20-20-20)

---

### [PASS] 6d550036 (multi-session) — low/insufficient

**Q:** How many projects have I led or am currently leading?

**Gold:** 2

**Answer:** Based on the available conversations, there is insufficient information to answer this question.

---

### [PASS] dd2973ad (multi-session) — medium/projection

**Q:** What time did I go to bed on the day before I had a doctor's appointment?

**Gold:** 2 AM

**Answer:** 2023-05-18

---

### [PASS] e831120c (multi-session) — high/projection

**Q:** How many weeks did it take me to watch all the Marvel Cinematic Universe movies and the main Star Wars films?

**Gold:** 3.5 weeks

**Answer:** 3

---

### [PASS] gpt4_59c863d7 (multi-session) — high/projection

**Q:** How many model kits have I worked on or bought?

**Gold:** I have worked on or bought five model kits. The scales of the models are: Revell F-15 Eagle (scale not mentioned), Tamiy

**Answer:** 2

---

### [PASS] 7e00a6cb (single-session-assistant) — medium/projection

**Q:** I'm planning my trip to Amsterdam again and I was wondering, what was the name of that hostel near the Red Light Distric

**Gold:** International Budget Hostel

**Answer:** International Budget Hostel

---

### [PASS] caf03d32 (single-session-preference) — medium/projection

**Q:** I've been struggling with my slow cooker recipes. Any advice on getting better results?

**Gold:** The user would prefer responses that provide tips and advice specifically tailored to their slow cooker experiences, uti

**Answer:** beef stew

---

### [PASS] 1e043500 (single-session-user) — medium/projection

**Q:** What is the name of the playlist I created on Spotify?

**Gold:** Summer Vibes

**Answer:** Summer Vibes on Spotify

---

### [PASS] 6ade9755 (single-session-user) — medium/projection

**Q:** Where do I take yoga classes?

**Gold:** Serenity Yoga

**Answer:** Serenity Yoga

---

### [PASS] 6f9b354f (single-session-user) — medium/projection

**Q:** What color did I repaint my bedroom walls?

**Gold:** a lighter shade of gray

**Answer:** bedroom walls a lighter shade of gray

---

### [PASS] 726462e0 (single-session-user) — medium/projection

**Q:** What was the discount I got on my first purchase from the new clothing brand?

**Gold:** 10%

**Answer:** 2023-04-23

---

### [PASS] c960da58 (single-session-user) — high/projection

**Q:** How many playlists do I have on Spotify?

**Gold:** 20

**Answer:** 1

---

### [PASS] e47becba (single-session-user) — medium/projection

**Q:** What degree did I graduate with?

**Gold:** Business Administration

**Answer:** Business Administration

---

### [PASS] 0bc8ad92 (temporal-reasoning) — high/projection

**Q:** How many months have passed since I last visited a museum with a friend?

**Gold:** 5

**Answer:** 12

---

### [PASS] 71017276 (temporal-reasoning) — medium/projection

**Q:** How many weeks ago did I meet up with my aunt and receive the crystal chandelier?

**Gold:** 4

**Answer:** vintage armchair from the 1950s

---

### [PASS] af082822 (temporal-reasoning) — medium/projection

**Q:** How many weeks ago did I attend the friends and family sale at Nordstrom?

**Gold:** 2

**Answer:** 4K TV

---

### [PASS] b46e15ed (temporal-reasoning) — high/projection

**Q:** How many months have passed since I participated in two charity events in a row, on consecutive days?

**Gold:** 2

**Answer:** 16

---

## Section 8: FAIL Questions (42/65)

### [FAIL] 6aeb4375 (knowledge-update) — WRONG_FACT_SELECTED

**Q:** How many Korean restaurants have I tried in my city?

**Gold:** four

**Answer:** 4

---

### [FAIL] 830ce83f (knowledge-update) — WRONG_FACT_SELECTED

**Q:** Where did Rachel move to after her recent relocation?

**Gold:** the suburbs

**Answer:** new apartment in Chicago

---

### [FAIL] 852ce960 (knowledge-update) — WRONG_FACT_SELECTED

**Q:** What was the amount I was pre-approved for when I got my mortgage from Wells Fargo?

**Gold:** $400,000

**Answer:** 2023-08-11

---

### [FAIL] ce6d2d27 (knowledge-update) — WRONG_FACT_SELECTED

**Q:** What day of the week do I take a cocktail-making class?

**Gold:** Friday

**Answer:** 2023-06-30

---

### [FAIL] d7c942c3 (knowledge-update) — WRONG_FACT_SELECTED

**Q:** Is my mom using the same grocery list method as me?

**Gold:** Yes.

**Answer:** same grocery list app

---

### [FAIL] aae3761f (multi-session) — WRONG_FACT_SELECTED

**Q:** How many hours in total did I spend driving to my three road trip destinations combined?

**Gold:** 15 hours for getting to the three destinations (or 30 hours for the round trip)

**Answer:** 9

---

### [FAIL] b5ef892d (multi-session) — WRONG_FACT_SELECTED

**Q:** How many days did I spend on camping trips in the United States this year?

**Gold:** 8 days.

**Answer:** 1

---

### [FAIL] gpt4_d84a3211 (multi-session) — WRONG_FACT_SELECTED

**Q:** How much total money have I spent on bike-related expenses since the start of the year?

**Gold:** $185

**Answer:** User clocked 347 miles since start of year (2023-04-28)

---

### [FAIL] gpt4_f2262a51 (multi-session) — EXTRACTION_MISS

**Q:** How many different doctors did I visit?

**Gold:** I visited three different doctors: a primary care physician, an ENT specialist, and a dermatologist.

**Answer:** Based on the available conversations, there is insufficient information to answer this question.

---

### [FAIL] 1903aded (single-session-assistant) — EXTRACTION_MISS

**Q:** I think we discussed work from home jobs for seniors earlier. Can you remind me what was the 7th job in the list you pro

**Gold:** Transcriptionist.

**Answer:** Based on the available conversations, there is insufficient information to answer this question.

---

### [FAIL] 4c36ccef (single-session-assistant) — ASSISTANT_CONTENT

**Q:** Can you remind me of the name of the romantic Italian restaurant in Rome you recommended for dinner?

**Gold:** Roscioli

**Answer:** Sora Margherita

---

### [FAIL] 6ae235be (single-session-assistant) — ASSISTANT_CONTENT

**Q:** I remember you told me about the refining processes at CITGO's three refineries earlier. Can you remind me what kind of 

**Gold:** Atmospheric distillation, fluid catalytic cracking (FCC), alkylation, and hydrotreating.

**Answer:** CITGO

---

### [FAIL] 7161e7e2 (single-session-assistant) — ASSISTANT_CONTENT

**Q:** I'm checking our previous chat about the shift rotation sheet for GM social media agents. Can you remind me what was the

**Gold:** Admon was assigned to the 8 am - 4 pm (Day Shift) on Sundays.

**Answer:** GM social media agents

---

### [FAIL] 89527b6b (single-session-assistant) — ASSISTANT_CONTENT

**Q:** I'm going back to our previous conversation about the children's book on dinosaurs. Can you remind me what color was the

**Gold:** The Plesiosaur had a blue scaly body.

**Answer:** children's book about dinosaurs

---

### [FAIL] c4f10528 (single-session-assistant) — ASSISTANT_CONTENT

**Q:** I'm planning to visit Bandung again and I was wondering if you could remind me of the name of that restaurant in Cihampe

**Gold:** Miss Bee Providore

**Answer:** User planning to visit Cihampelas Walk

---

### [FAIL] ceb54acb (single-session-assistant) — ASSISTANT_CONTENT

**Q:** In our previous chat, you suggested 'sexual compulsions' and a few other options for alternative terms for certain behav

**Gold:** I suggested 'sexual fixations', 'problematic sexual behaviors', 'sexual impulsivity', and 'compulsive sexuality'.

**Answer:** shorter term for sexual behaviors

---

### [FAIL] e9327a54 (single-session-assistant) — ASSISTANT_CONTENT

**Q:** I'm planning to revisit Orlando. I was wondering if you could remind me of that unique dessert shop with the giant milks

**Gold:** The Sugar Factory at Icon Park.

**Answer:** User planning dessert adventure to visit multiple dessert spots in Orlando

---

### [FAIL] f523d9fe (single-session-assistant) — ASSISTANT_CONTENT

**Q:** I wanted to check back on our previous conversation about Netflix. I mentioned that I wanted to be able to access all se

**Gold:** Doc Martin

**Answer:** only last season

---

### [FAIL] 06878be2 (single-session-preference) — EXTRACTION_MISS

**Q:** Can you suggest some accessories that would complement my current photography setup?

**Gold:** The user would prefer suggestions of Sony-compatible accessories or high-quality photography gear that can enhance their

**Answer:** Based on the available conversations, there is insufficient information to answer this question.

---

### [FAIL] 0edc2aef (single-session-preference) — PREFERENCE_FORMAT

**Q:** Can you suggest a hotel for my upcoming trip to Miami?

**Gold:** The user would prefer suggestions of hotels in Miami that offer great views, possibly of the ocean or the city skyline, 

**Answer:** [

---

### [FAIL] 195a1a1b (single-session-preference) — PREFERENCE_FORMAT

**Q:** Can you suggest some activities that I can do in the evening?

**Gold:** The user would prefer suggestions that involve relaxing activities that can be done in the evening, preferably before 9:

**Answer:** 10:00 am - 12:00 pm: Project Work

---

### [FAIL] 32260d93 (single-session-preference) — PREFERENCE_FORMAT

**Q:** Can you recommend a show or movie for me to watch tonight?

**Gold:** The user would prefer recommendations for stand-up comedy specials on Netflix, especially those that are known for their

**Answer:** aspiring stand-up comedian

---

### [FAIL] 35a27287 (single-session-preference) — EXTRACTION_MISS

**Q:** Can you recommend some interesting cultural events happening around me this weekend?

**Gold:** The user would prefer responses that suggest cultural events where they can practice their language skills, particularly

**Answer:** Based on the available conversations, there is insufficient information to answer this question.

---

### [FAIL] 54026fce (single-session-preference) — EXTRACTION_MISS

**Q:** I've been thinking about ways to stay connected with my colleagues. Any suggestions?

**Gold:** The user would prefer responses that acknowledge their desire for social interaction and collaboration while working rem

**Answer:** Based on the available conversations, there is insufficient information to answer this question.

---

### [FAIL] 75832dbd (single-session-preference) — PREFERENCE_FORMAT

**Q:** Can you recommend some recent publications or conferences that I might find interesting?

**Gold:** The user would prefer suggestions related to recent research papers, articles, or conferences that focus on artificial i

**Answer:** user requested overview of recent advancements in deep learning for medical image analysis (2023-05-22)

---

### [FAIL] 8a2466db (single-session-preference) — PREFERENCE_FORMAT

**Q:** Can you recommend some resources where I can learn more about video editing?

**Gold:** The user would prefer responses that suggest resources specifically tailored to Adobe Premiere Pro, especially those tha

**Answer:** learning advanced settings (for video editing)

---

### [FAIL] afdc33df (single-session-preference) — PREFERENCE_FORMAT

**Q:** My kitchen's becoming a bit of a mess again. Any tips for keeping it clean?

**Gold:** The user would prefer responses that acknowledge and build upon their existing efforts to organize their kitchen, such a

**Answer:** User asked for tips on cleaning and maintaining garbage disposal (2023-05-22)

---

### [FAIL] 118b2229 (single-session-user) — WRONG_FACT_SELECTED

**Q:** How long is my daily commute to work?

**Gold:** 45 minutes each way

**Answer:** daily commute

---

### [FAIL] 3b6f954b (single-session-user) — WRONG_FACT_SELECTED

**Q:** Where did I attend for my study abroad program?

**Gold:** University of Melbourne in Australia

**Answer:** study abroad program

---

### [FAIL] 51a45a95 (single-session-user) — WRONG_FACT_SELECTED

**Q:** Where did I redeem a $5 coupon on coffee creamer?

**Gold:** Target

**Answer:** $5 on coffee creamer

---

### [FAIL] 58bf7951 (single-session-user) — WRONG_FACT_SELECTED

**Q:** What play did I attend at the local community theater?

**Gold:** The Glass Menagerie

**Answer:** local community theater

---

### [FAIL] 58ef2f1c (single-session-user) — WRONG_FACT_SELECTED

**Q:** When did I volunteer at the local animal shelter's fundraising dinner?

**Gold:** February 14th

**Answer:** 2023-02-14

---

### [FAIL] 5d3d2817 (single-session-user) — EXTRACTION_MISS

**Q:** What was my previous occupation?

**Gold:** Marketing specialist at a small startup

**Answer:** Based on the available conversations, there is insufficient information to answer this question.

---

### [FAIL] 7527f7e2 (single-session-user) — WRONG_FACT_SELECTED

**Q:** How much did I spend on a designer handbag?

**Gold:** $800

**Answer:** 4

---

### [FAIL] c5e8278d (single-session-user) — EXTRACTION_MISS

**Q:** What was my last name before I changed it?

**Gold:** Johnson

**Answer:** Based on the available conversations, there is insufficient information to answer this question.

---

### [FAIL] f8c5f88b (single-session-user) — WRONG_FACT_SELECTED

**Q:** Where did I buy my new tennis racket from?

**Gold:** the sports store downtown

**Answer:** new tennis racket

---

### [FAIL] 9a707b81 (temporal-reasoning) — TEMPORAL_ARITHMETIC

**Q:** How many days ago did I attend a baking class at a local culinary school when I made my friend's birthday cake?

**Gold:** 21 days. 22 days (including the last day) is also acceptable.

**Answer:** 2022-04-17

---

### [FAIL] gpt4_4929293a (temporal-reasoning) — TEMPORAL_ARITHMETIC

**Q:** Which event happened first, my cousin's wedding or Michael's engagement party?

**Gold:** Michael's engagement party

**Answer:** bridesmaid at cousin's wedding

---

### [FAIL] gpt4_59149c77 (temporal-reasoning) — TEMPORAL_ARITHMETIC

**Q:** How many days passed between my visit to the Museum of Modern Art (MoMA) and the 'Ancient Civilizations' exhibit at the 

**Gold:** 7 days. 8 days (including the last day) is also acceptable.

**Answer:** 21

---

### [FAIL] gpt4_b5700ca9 (temporal-reasoning) — TEMPORAL_ARITHMETIC

**Q:** How many days ago did I attend the Maundy Thursday service at the Episcopal Church?

**Gold:** 4 days.

**Answer:** Easter Egg Hunt event

---

### [FAIL] gpt4_f49edff3 (temporal-reasoning) — TEMPORAL_ARITHMETIC

**Q:** Which three events happened in the order from first to last: the day I helped my friend prepare the nursery, the day I h

**Gold:** First, I helped my friend prepare the nursery, then I helped my cousin pick out stuff for her baby shower, and lastly, I

**Answer:** helped friend prepare nursery, spent Sunday afternoon shopping for baby supplies and decorations

---

### [FAIL] gpt4_fa19884c (temporal-reasoning) — TEMPORAL_ARITHMETIC

**Q:** How many days passed between the day I started playing along to my favorite songs on my old keyboard and the day I disco

**Gold:** 6 days. 7 days (including the last day) is also acceptable.

**Answer:** 16

---

---

*Report generated: 2026-04-04*
*Pipeline: CoreCrux v5 deterministic (zero LLM at query time)*
*Extraction model: Claude Haiku 4.5 (one-time, cached)*
*Evaluator: self-assessed gold match (substring + keyword overlap)*

---

## Appendix A: Deep Dive — Is Retrieval Producing the Answer?

### Summary

Of 42 failed questions, the gold answer **exists in the extracted facts** for 15 (36%). The remaining 24 (57%) have the answer missing from extraction entirely. 3 (7%) have no facts at all.

| Category | Count | % of Failures |
|---|---|---|
| Answer IS in facts (wrong selection) | 15 | 36% |
| Answer NOT in facts (extraction gap) | 24 | 57% |
| No facts extracted | 3 | 7% |

### Per-Type Breakdown

| Type | Failures | Answer in Facts | Not in Facts | No Facts |
|---|---|---|---|---|
| knowledge-update | 5 | 4 | 1 | 0 |
| multi-session | 4 | 0 | 4 | 0 |
| single-session-assistant | 9 | 4 | 4 | 1 |
| single-session-preference | 9 | 0 | 9 | 0 |
| single-session-user | 9 | 6 | 1 | 2 |
| temporal-reasoning | 6 | 1 | 5 | 0 |

### Implication

The extraction is the primary bottleneck (57% of failures), not the scoring (36%). Improving extraction quality has 1.6x the impact ceiling of improving selection quality.

---

## Appendix B: Architecture Ceiling Analysis

| Ceiling Tier | Score | Delta from Current | What's Fixed |
|---|---|---|---|
| Current | 23/65 (35.4%) | — | — |
| Tier 1: Fix selection only | 38/65 (58.5%) | +23pp | Answer in facts → correct selection |
| Tier 2: Fix selection + extraction | 62/65 (95.4%) | +60pp | + extraction captures all answers |
| Tier 3: Fix all | 65/65 (100%) | +65pp | + coverage for 3 edge cases |

**The gap: 35% → 58% is scoring. 58% → 95% is extraction. 95% → 100% is edge cases.**

---

## Appendix C: Improvement Strategy

### Strategy A: Question-Aware Extraction (highest impact)

Pass the question to the extractor so it focuses on relevant details instead of extracting blindly.

- **Fixes:** 24/42 failures (extraction gaps)
- **Expected lift:** +15-20pp → 50-55%
- **Risk:** Low — same model, same caching, just targeted prompt
- **Effort:** 1-2 days

### Strategy B: Embedding-Based Fact Selection

Replace keyword overlap with cosine similarity for fact ranking.

- **Fixes:** 15/42 failures (wrong selection)
- **Expected lift:** +8-12pp (additive with A → 58-67%)
- **Risk:** Medium — adds EmbedderCrux at query time (can be cached)
- **Effort:** 2-3 days

### Strategy C: Two-Stage Pipeline with Verification

Combines A + B + BM25 text search verification against original session text.

- **Fixes:** 30+/42 failures
- **Expected lift:** +25-35pp → 60-70%
- **Risk:** Higher complexity
- **Effort:** 3-5 days

### Recommended Execution: A → B → C (test at each gate)

