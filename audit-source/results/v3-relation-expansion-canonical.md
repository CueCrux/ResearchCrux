# Retrieval Quality Audit v3 — Edge Case & Capability Probe Report

**Run ID:** e26bf4ed
**Started:** 2026-03-12T02:05:01.183Z
**Finished:** 2026-03-12T02:08:48.404Z
**Host:** unknown
**Corpus:** ~64 docs, 6 categories

## Mode: V1

### Relation-Bootstrapped Retrieval (8 docs, 1 query)

**Passed:** YES

| Metric | Value |
|--------|-------|
| avg_recall | 1 |
| amendment_found | true |
| relation_expansion_active | true |

#### Notes
- DETECTED: Relation expansion IS active — amendment found via supersedes edge

#### Query Details

**Query:** "What is the current data residency framework at Meridian? What are the geographic locality and sovereignty requirements?"
Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, retrieved_ids=v3-rel-orig,v3-rel-support1,v3-rel-support2,v3-rel-amend,v3-rel-noise4,v3-rel-noise3,v3-rel-noise1,v3-rel-noise2, fragility_score=1, distinct_domains=2, latency_ms=4661.416

### Format-Aware Ingestion Recall (18 docs, 3 queries)

**Passed:** YES

| Metric | Value |
|--------|-------|
| avg_citation_recall | 0.3333 |
| avg_retrieved_recall | 1 |
| query_count | 3 |
| tier1_pass | true |
| tier2_pass | true |
| tier1_recall | 1 |
| tier2_csv_recall | 0.6667 |
| tier2_json_recall | 0.3333 |
| tier3_yaml_recall | 0 |
| tier3_chat_recall | 0 |
| tier3_notes_recall | 0 |
| tier1_retrieved_recall | 1 |
| tier2_csv_retrieved_recall | 1 |
| tier2_json_retrieved_recall | 1 |

#### Format Recall Breakdown

| Format | Citation Recall | Retrieved Recall | Tier |
|--------|----------------|-----------------|------|
| text/markdown | 1.00 | 1.00 | 1 |
| application/json | 0.33 | 1.00 | 2 |
| application/x-yaml | 0.00 | 1.00 | 3 |
| text/csv | 0.67 | 1.00 | 2 |
| text/plain (chat) | 0.00 | 1.00 | 3 |
| text/plain (notes) | 0.00 | 1.00 | 3 |

#### Tier Assessment

| Tier | Scope | Status |
|------|-------|--------|
| 1 | Prose (markdown, PDF, DOCX) | PASS |
| 2 | Structured (CSV, XLSX, JSON) | PASS |
| 3 | Informal (YAML, chat, notes) | baseline |

#### Notes
- text/markdown: cited=3/3 (1.00), retrieved=3/3 (1.00)
- application/json: cited=1/3 (0.33), retrieved=3/3 (1.00)
- application/x-yaml: cited=0/3 (0.00), retrieved=3/3 (1.00)
- text/csv: cited=2/3 (0.67), retrieved=3/3 (1.00)
- text/plain (chat): cited=0/3 (0.00), retrieved=3/3 (1.00)
- text/plain (notes): cited=0/3 (0.00), retrieved=3/3 (1.00)
- Tier 1 (markdown): recall=1.00 PASS
- Tier 2 (csv=0.67, json=0.33): PASS
- Tier 3 baseline (yaml=0.00, chat=0.00, notes=0.00)
- Retrieved recall — markdown=1.00, csv=1.00, json=1.00

#### Query Details

**Query:** "What are the rate limiting rules for the payment service? What are the request limits and burst allowances?"
Metrics: expected_found=2, expected_total=6, precision=1, recall=0.333, retrieved_found=6, retrieved_recall=1, retrieved_ids=v3-fmt-a-md,v3-fmt-a-json,v3-fmt-a-notes,v3-fmt-a-csv,v3-fmt-a-chat,v3-fmt-a-yaml,v3-fmt-c-md,v3-fmt-c-csv,v3-fmt-c-chat,v3-fmt-c-yaml, fragility_score=1, distinct_domains=2, latency_ms=2489.467
- Missing expected docs: v3-fmt-a-yaml, v3-fmt-a-csv, v3-fmt-a-chat, v3-fmt-a-notes

**Query:** "What is the database backup schedule? How often are full backups and WAL archives taken?"
Metrics: expected_found=2, expected_total=6, precision=1, recall=0.333, retrieved_found=6, retrieved_recall=1, retrieved_ids=v3-fmt-b-md,v3-fmt-b-json,v3-fmt-b-csv,v3-fmt-b-chat,v3-fmt-b-notes,v3-fmt-b-yaml,v3-fmt-a-chat,v3-fmt-c-md,v3-fmt-a-md,v3-fmt-a-notes, fragility_score=1, distinct_domains=2, latency_ms=1807.657
- Missing expected docs: v3-fmt-b-json, v3-fmt-b-yaml, v3-fmt-b-chat, v3-fmt-b-notes

**Query:** "What are the alerting threshold configurations? What latency and error rate thresholds trigger alerts?"
Metrics: expected_found=2, expected_total=6, precision=1, recall=0.333, retrieved_found=6, retrieved_recall=1, retrieved_ids=v3-fmt-c-md,v3-fmt-c-notes,v3-fmt-c-json,v3-fmt-c-chat,v3-fmt-c-csv,v3-fmt-c-yaml,v3-fmt-a-json,v3-fmt-a-chat,v3-fmt-a-md,v3-fmt-a-csv, fragility_score=1, distinct_domains=2, latency_ms=3489.557
- Missing expected docs: v3-fmt-c-json, v3-fmt-c-yaml, v3-fmt-c-chat, v3-fmt-c-notes

### BM25 vs Vector Decomposition (12 docs, 6 queries)

**Passed:** YES

| Metric | Value |
|--------|-------|
| combined_citation_recall | 0.6667 |
| combined_retrieved_recall | 1 |
| bm25_citation_recall | 1 |
| vector_citation_recall | 0 |
| hybrid_citation_recall | 1 |
| bm25_retrieved_recall | 1 |
| vector_retrieved_recall | 1 |
| hybrid_retrieved_recall | 1 |
| bm25_found | 2 |
| vector_found | 0 |
| hybrid_found | 4 |
| lane_bm25_retrieved | true |
| lane_vector_retrieved | true |
| lane_hybrid_retrieved | true |
| lane_bm25_cited | true |
| lane_vector_cited | true |
| lane_hybrid_cited | true |

#### Notes
- BM25 (K-class): cited=2/2 (1.00), retrieved=2/2 (1.00)
- Vector (V-class): cited=0/4 (0.00), retrieved=4/4 (1.00)
- Hybrid (H-class): cited=4/4 (1.00), retrieved=4/4 (1.00)
- Lane contribution (retrieved) — BM25: true, Vector: true, Hybrid: true
- Lane contribution (cited) — BM25: true, Vector: true, Hybrid: true

#### Query Details

**Query:** "What is the XK7-Bravo protocol for FIPS-140-3 HSM validation?"
Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, retrieved_ids=v3-bm25-k1,v3-vec-v1,v3-vec-v4,v3-hyb-h4,v3-hyb-h2,v3-bm25-k2,v3-vec-v2,v3-bm25-k3,v3-hyb-h3,v3-hyb-h1, fragility_score=1, distinct_domains=2, latency_ms=2660.753

**Query:** "What does runbook RB-2025-0417 say about ZetaQueue99thPctLatency alert response?"
Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, retrieved_ids=v3-bm25-k2,v3-hyb-h4,v3-vec-v4,v3-bm25-k1,v3-hyb-h2,v3-vec-v2,v3-vec-v1,v3-bm25-k3,v3-hyb-h3,v3-bm25-k4, fragility_score=1, distinct_domains=2, latency_ms=5160.516

**Query:** "What is the API key rotation policy at Meridian?"
Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v3-hyb-h1,v3-bm25-k3,v3-hyb-h3,v3-bm25-k1,v3-hyb-h2,v3-hyb-h4,v3-vec-v2,v3-vec-v1,v3-vec-v3,v3-bm25-k2, fragility_score=1, distinct_domains=2, latency_ms=2087.228
- Missing expected docs: v3-vec-v1

**Query:** "What is the incident response playbook and severity classification?"
Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v3-hyb-h2,v3-vec-v4,v3-vec-v2,v3-hyb-h4,v3-bm25-k1,v3-bm25-k2,v3-bm25-k4,v3-hyb-h3,v3-bm25-k3,v3-vec-v3, fragility_score=1, distinct_domains=2, latency_ms=3935.998
- Missing expected docs: v3-vec-v2

**Query:** "What is the database backup strategy and recovery objectives?"
Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v3-hyb-h3,v3-vec-v3,v3-vec-v2,v3-hyb-h1,v3-hyb-h2,v3-vec-v1,v3-bm25-k2,v3-vec-v4,v3-bm25-k4,v3-bm25-k3, fragility_score=1, distinct_domains=2, latency_ms=4372.981
- Missing expected docs: v3-vec-v3

**Query:** "What are the alerting threshold configurations for latency and error rates?"
Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v3-hyb-h4,v3-vec-v4,v3-hyb-h2,v3-bm25-k2,v3-vec-v2,v3-bm25-k3,v3-bm25-k1,v3-bm25-k4,v3-hyb-h3,v3-vec-v1, fragility_score=1, distinct_domains=2, latency_ms=4394.858
- Missing expected docs: v3-vec-v4

### Temporal Edge Cases (12 docs, DB checks)

**Passed:** YES

| Metric | Value |
|--------|-------|
| skipped | true |

#### Notes
- Skipped: V1 does not support living state

### Fragility Calibration (12 docs, 3 queries)

**Passed:** YES

| Metric | Value |
|--------|-------|
| f1_fragility | 1 |
| f2_fragility | 0 |
| f3_fragility | 0 |
| monotonic_order | true |
| all_zero | false |

#### Fragility Calibration

| Scenario | Expected | Actual | In Range |
|----------|----------|--------|:--------:|
| F1 | [0.8, 1] | 1.000 | YES |
| F2 | [0.3, 0.7] | 0.000 | NO |
| F3 | [0.1, 0.5] | 0.000 | NO |

#### Notes
- F1 (Maximum (2 docs, 2 domains)): fragility=1.000 range=[0.8,1] OK
- F2 (Moderate (4 docs, 3 domains)): fragility=0.000 range=[0.3,0.7] OUT OF RANGE
- F3 (Low (6 docs, 4 domains)): fragility=0.000 range=[0.1,0.5] OUT OF RANGE
- Monotonic ordering: F1 > F2 >= F3 — CORRECT

#### Query Details

**Query:** "What are the encryption standards for operational zones?"
Metrics: expected_found=2, expected_total=2, precision=1, recall=1, retrieved_found=2, retrieved_recall=1, retrieved_ids=v3-frag-f1a,v3-frag-f1b,v3-frag-f3f,v3-frag-f2c,v3-frag-f2a,v3-frag-f3e,v3-frag-f2b,v3-frag-f3a,v3-frag-f3c,v3-frag-f2d, fragility_score=1, distinct_domains=2, latency_ms=3724.420

**Query:** "What are the network segmentation policies across operational zones?"
Metrics: expected_found=3, expected_total=4, precision=1, recall=0.750, retrieved_found=4, retrieved_recall=1, retrieved_ids=v3-frag-f2b,v3-frag-f2c,v3-frag-f2d,v3-frag-f2a,v3-frag-f3a,v3-frag-f3c,v3-frag-f3e,v3-frag-f3d,v3-frag-f3b,v3-frag-f3f, fragility_score=0, distinct_domains=3, latency_ms=4882.721
- Missing expected docs: v3-frag-f2d

**Query:** "What are the incident response runbooks for all operational zones?"
Metrics: expected_found=3, expected_total=6, precision=1, recall=0.500, retrieved_found=6, retrieved_recall=1, retrieved_ids=v3-frag-f3e,v3-frag-f3a,v3-frag-f3c,v3-frag-f3d,v3-frag-f3b,v3-frag-f2b,v3-frag-f2d,v3-frag-f2a,v3-frag-f3f,v3-frag-f2c, fragility_score=0, distinct_domains=3, latency_ms=5059.110
- Missing expected docs: v3-frag-f3a, v3-frag-f3d, v3-frag-f3f

## Mode: V4.1

### Receipt Chain Stress (2 docs, 50 queries)

**Passed:** YES

| Metric | Value |
|--------|-------|
| chains_intact | 10 |
| total_verified | 10 |
| max_verified_depth | 50 |
| latency_at_depth_50 | 3 |
| latency_slope_per_depth | 0 |
| all_intact_at_20 | true |

#### Receipt Chain Depth Curve

| Depth | Latency (ms) | Chain Intact |
|------:|-------------:|:------------:|
| 5 | 3 | YES |
| 10 | 2 | YES |
| 15 | 3 | YES |
| 20 | 2 | YES |
| 25 | 5 | YES |
| 30 | 3 | YES |
| 35 | 2 | YES |
| 40 | 3 | YES |
| 45 | 3 | YES |
| 50 | 3 | YES |

#### Notes
- Max verified depth: 50
- Latency slope: 0.00 ms/depth
- Latency at depth 50: 3ms

### Relation-Bootstrapped Retrieval (8 docs, 1 query)

**Passed:** YES

| Metric | Value |
|--------|-------|
| avg_recall | 1 |
| amendment_found | true |
| relation_expansion_active | true |

#### Notes
- DETECTED: Relation expansion IS active — amendment found via supersedes edge

#### Query Details

**Query:** "What is the current data residency framework at Meridian? What are the geographic locality and sovereignty requirements?"
Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, retrieved_ids=v3-rel-orig,v3-rel-support1,v3-rel-support2,v3-rel-amend,v3-rel-noise4,v3-rel-noise3,v3-rel-noise1,v3-rel-noise2, fragility_score=1, distinct_domains=2, latency_ms=3279.402

### Format-Aware Ingestion Recall (18 docs, 3 queries)

**Passed:** YES

| Metric | Value |
|--------|-------|
| avg_citation_recall | 0.3333 |
| avg_retrieved_recall | 1 |
| query_count | 3 |
| tier1_pass | true |
| tier2_pass | true |
| tier1_recall | 1 |
| tier2_csv_recall | 0.6667 |
| tier2_json_recall | 0.3333 |
| tier3_yaml_recall | 0 |
| tier3_chat_recall | 0 |
| tier3_notes_recall | 0 |
| tier1_retrieved_recall | 1 |
| tier2_csv_retrieved_recall | 1 |
| tier2_json_retrieved_recall | 1 |

#### Format Recall Breakdown

| Format | Citation Recall | Retrieved Recall | Tier |
|--------|----------------|-----------------|------|
| text/markdown | 1.00 | 1.00 | 1 |
| application/json | 0.33 | 1.00 | 2 |
| application/x-yaml | 0.00 | 1.00 | 3 |
| text/csv | 0.67 | 1.00 | 2 |
| text/plain (chat) | 0.00 | 1.00 | 3 |
| text/plain (notes) | 0.00 | 1.00 | 3 |

#### Tier Assessment

| Tier | Scope | Status |
|------|-------|--------|
| 1 | Prose (markdown, PDF, DOCX) | PASS |
| 2 | Structured (CSV, XLSX, JSON) | PASS |
| 3 | Informal (YAML, chat, notes) | baseline |

#### Notes
- text/markdown: cited=3/3 (1.00), retrieved=3/3 (1.00)
- application/json: cited=1/3 (0.33), retrieved=3/3 (1.00)
- application/x-yaml: cited=0/3 (0.00), retrieved=3/3 (1.00)
- text/csv: cited=2/3 (0.67), retrieved=3/3 (1.00)
- text/plain (chat): cited=0/3 (0.00), retrieved=3/3 (1.00)
- text/plain (notes): cited=0/3 (0.00), retrieved=3/3 (1.00)
- Tier 1 (markdown): recall=1.00 PASS
- Tier 2 (csv=0.67, json=0.33): PASS
- Tier 3 baseline (yaml=0.00, chat=0.00, notes=0.00)
- Retrieved recall — markdown=1.00, csv=1.00, json=1.00

#### Query Details

**Query:** "What are the rate limiting rules for the payment service? What are the request limits and burst allowances?"
Metrics: expected_found=2, expected_total=6, precision=1, recall=0.333, retrieved_found=6, retrieved_recall=1, retrieved_ids=v3-fmt-a-md,v3-fmt-a-json,v3-fmt-a-notes,v3-fmt-a-csv,v3-fmt-a-chat,v3-fmt-a-yaml,v3-fmt-c-md,v3-fmt-c-csv,v3-fmt-c-chat,v3-fmt-c-yaml, fragility_score=1, distinct_domains=2, latency_ms=1905.474
- Missing expected docs: v3-fmt-a-yaml, v3-fmt-a-csv, v3-fmt-a-chat, v3-fmt-a-notes

**Query:** "What is the database backup schedule? How often are full backups and WAL archives taken?"
Metrics: expected_found=2, expected_total=6, precision=1, recall=0.333, retrieved_found=6, retrieved_recall=1, retrieved_ids=v3-fmt-b-md,v3-fmt-b-json,v3-fmt-b-csv,v3-fmt-b-chat,v3-fmt-b-notes,v3-fmt-b-yaml,v3-fmt-a-chat,v3-fmt-c-md,v3-fmt-a-md,v3-fmt-a-notes, fragility_score=1, distinct_domains=2, latency_ms=1234.006
- Missing expected docs: v3-fmt-b-json, v3-fmt-b-yaml, v3-fmt-b-chat, v3-fmt-b-notes

**Query:** "What are the alerting threshold configurations? What latency and error rate thresholds trigger alerts?"
Metrics: expected_found=2, expected_total=6, precision=1, recall=0.333, retrieved_found=6, retrieved_recall=1, retrieved_ids=v3-fmt-c-md,v3-fmt-c-notes,v3-fmt-c-json,v3-fmt-c-chat,v3-fmt-c-csv,v3-fmt-c-yaml,v3-fmt-a-json,v3-fmt-a-chat,v3-fmt-a-md,v3-fmt-a-csv, fragility_score=1, distinct_domains=2, latency_ms=3067.978
- Missing expected docs: v3-fmt-c-json, v3-fmt-c-yaml, v3-fmt-c-chat, v3-fmt-c-notes

### BM25 vs Vector Decomposition (12 docs, 6 queries)

**Passed:** YES

| Metric | Value |
|--------|-------|
| combined_citation_recall | 0.6667 |
| combined_retrieved_recall | 1 |
| bm25_citation_recall | 1 |
| vector_citation_recall | 0 |
| hybrid_citation_recall | 1 |
| bm25_retrieved_recall | 1 |
| vector_retrieved_recall | 1 |
| hybrid_retrieved_recall | 1 |
| bm25_found | 2 |
| vector_found | 0 |
| hybrid_found | 4 |
| lane_bm25_retrieved | true |
| lane_vector_retrieved | true |
| lane_hybrid_retrieved | true |
| lane_bm25_cited | true |
| lane_vector_cited | true |
| lane_hybrid_cited | true |

#### Notes
- BM25 (K-class): cited=2/2 (1.00), retrieved=2/2 (1.00)
- Vector (V-class): cited=0/4 (0.00), retrieved=4/4 (1.00)
- Hybrid (H-class): cited=4/4 (1.00), retrieved=4/4 (1.00)
- Lane contribution (retrieved) — BM25: true, Vector: true, Hybrid: true
- Lane contribution (cited) — BM25: true, Vector: true, Hybrid: true

#### Query Details

**Query:** "What is the XK7-Bravo protocol for FIPS-140-3 HSM validation?"
Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, retrieved_ids=v3-bm25-k1,v3-vec-v1,v3-vec-v4,v3-hyb-h4,v3-hyb-h2,v3-bm25-k2,v3-vec-v2,v3-bm25-k3,v3-hyb-h3,v3-hyb-h1, fragility_score=1, distinct_domains=2, latency_ms=2206.612

**Query:** "What does runbook RB-2025-0417 say about ZetaQueue99thPctLatency alert response?"
Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, retrieved_ids=v3-bm25-k2,v3-hyb-h4,v3-vec-v4,v3-bm25-k1,v3-hyb-h2,v3-vec-v2,v3-vec-v1,v3-bm25-k3,v3-hyb-h3,v3-bm25-k4, fragility_score=1, distinct_domains=2, latency_ms=3896.545

**Query:** "What is the API key rotation policy at Meridian?"
Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v3-hyb-h1,v3-bm25-k3,v3-hyb-h3,v3-bm25-k1,v3-hyb-h2,v3-hyb-h4,v3-vec-v2,v3-vec-v1,v3-vec-v3,v3-bm25-k2, fragility_score=1, distinct_domains=2, latency_ms=1876.731
- Missing expected docs: v3-vec-v1

**Query:** "What is the incident response playbook and severity classification?"
Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v3-hyb-h2,v3-vec-v4,v3-vec-v2,v3-hyb-h4,v3-bm25-k1,v3-bm25-k2,v3-bm25-k4,v3-hyb-h3,v3-bm25-k3,v3-vec-v3, fragility_score=1, distinct_domains=2, latency_ms=3697.814
- Missing expected docs: v3-vec-v2

**Query:** "What is the database backup strategy and recovery objectives?"
Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v3-hyb-h3,v3-vec-v3,v3-vec-v2,v3-hyb-h1,v3-hyb-h2,v3-vec-v1,v3-bm25-k2,v3-vec-v4,v3-bm25-k4,v3-bm25-k3, fragility_score=1, distinct_domains=2, latency_ms=3201.642
- Missing expected docs: v3-vec-v3

**Query:** "What are the alerting threshold configurations for latency and error rates?"
Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v3-hyb-h4,v3-vec-v4,v3-hyb-h2,v3-bm25-k2,v3-vec-v2,v3-bm25-k3,v3-bm25-k1,v3-bm25-k4,v3-hyb-h3,v3-vec-v1, fragility_score=1, distinct_domains=2, latency_ms=2005.933
- Missing expected docs: v3-vec-v4

### Temporal Edge Cases (12 docs, DB checks)

**Passed:** YES

| Metric | Value |
|--------|-------|
| accuracy | 1 |
| correct | 12 |
| total | 12 |

#### Pattern Results

| Pattern | Correct | Total | Accuracy |
|---------|--------:|------:|---------:|
| patternA | 4 | 4 | 1.00 |
| patternB | 4 | 4 | 1.00 |
| patternC | 4 | 4 | 1.00 |

### Fragility Calibration (12 docs, 3 queries)

**Passed:** YES

| Metric | Value |
|--------|-------|
| f1_fragility | 1 |
| f2_fragility | 0 |
| f3_fragility | 0 |
| monotonic_order | true |
| all_zero | false |

#### Fragility Calibration

| Scenario | Expected | Actual | In Range |
|----------|----------|--------|:--------:|
| F1 | [0.8, 1] | 1.000 | YES |
| F2 | [0.3, 0.7] | 0.000 | NO |
| F3 | [0.1, 0.5] | 0.000 | NO |

#### Notes
- F1 (Maximum (2 docs, 2 domains)): fragility=1.000 range=[0.8,1] OK
- F2 (Moderate (4 docs, 3 domains)): fragility=0.000 range=[0.3,0.7] OUT OF RANGE
- F3 (Low (6 docs, 4 domains)): fragility=0.000 range=[0.1,0.5] OUT OF RANGE
- Monotonic ordering: F1 > F2 >= F3 — CORRECT

#### Query Details

**Query:** "What are the encryption standards for operational zones?"
Metrics: expected_found=2, expected_total=2, precision=1, recall=1, retrieved_found=2, retrieved_recall=1, retrieved_ids=v3-frag-f1a,v3-frag-f1b,v3-frag-f3f,v3-frag-f2c,v3-frag-f2a,v3-frag-f3e,v3-frag-f2b,v3-frag-f3a,v3-frag-f3c,v3-frag-f2d, fragility_score=1, distinct_domains=2, latency_ms=2642.608

**Query:** "What are the network segmentation policies across operational zones?"
Metrics: expected_found=3, expected_total=4, precision=1, recall=0.750, retrieved_found=4, retrieved_recall=1, retrieved_ids=v3-frag-f2b,v3-frag-f2c,v3-frag-f2d,v3-frag-f2a,v3-frag-f3a,v3-frag-f3c,v3-frag-f3e,v3-frag-f3d,v3-frag-f3b,v3-frag-f3f, fragility_score=0, distinct_domains=3, latency_ms=4033.243
- Missing expected docs: v3-frag-f2d

**Query:** "What are the incident response runbooks for all operational zones?"
Metrics: expected_found=3, expected_total=6, precision=1, recall=0.500, retrieved_found=6, retrieved_recall=1, retrieved_ids=v3-frag-f3e,v3-frag-f3a,v3-frag-f3c,v3-frag-f3d,v3-frag-f3b,v3-frag-f2b,v3-frag-f2d,v3-frag-f2a,v3-frag-f3f,v3-frag-f2c, fragility_score=0, distinct_domains=3, latency_ms=5274.014
- Missing expected docs: v3-frag-f3a, v3-frag-f3d, v3-frag-f3f

## Mode: V3.1

### Relation-Bootstrapped Retrieval (8 docs, 1 query)

**Passed:** YES

| Metric | Value |
|--------|-------|
| avg_recall | 1 |
| amendment_found | true |
| relation_expansion_active | true |

#### Notes
- DETECTED: Relation expansion IS active — amendment found via supersedes edge

#### Query Details

**Query:** "What is the current data residency framework at Meridian? What are the geographic locality and sovereignty requirements?"
Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, retrieved_ids=v3-rel-orig,v3-rel-support1,v3-rel-support2,v3-rel-amend,v3-rel-noise4,v3-rel-noise3,v3-rel-noise1,v3-rel-noise2, fragility_score=1, distinct_domains=2, latency_ms=4062.848

### Format-Aware Ingestion Recall (18 docs, 3 queries)

**Passed:** YES

| Metric | Value |
|--------|-------|
| avg_citation_recall | 0.3333 |
| avg_retrieved_recall | 1 |
| query_count | 3 |
| tier1_pass | true |
| tier2_pass | true |
| tier1_recall | 1 |
| tier2_csv_recall | 0.6667 |
| tier2_json_recall | 0.3333 |
| tier3_yaml_recall | 0 |
| tier3_chat_recall | 0 |
| tier3_notes_recall | 0 |
| tier1_retrieved_recall | 1 |
| tier2_csv_retrieved_recall | 1 |
| tier2_json_retrieved_recall | 1 |

#### Format Recall Breakdown

| Format | Citation Recall | Retrieved Recall | Tier |
|--------|----------------|-----------------|------|
| text/markdown | 1.00 | 1.00 | 1 |
| application/json | 0.33 | 1.00 | 2 |
| application/x-yaml | 0.00 | 1.00 | 3 |
| text/csv | 0.67 | 1.00 | 2 |
| text/plain (chat) | 0.00 | 1.00 | 3 |
| text/plain (notes) | 0.00 | 1.00 | 3 |

#### Tier Assessment

| Tier | Scope | Status |
|------|-------|--------|
| 1 | Prose (markdown, PDF, DOCX) | PASS |
| 2 | Structured (CSV, XLSX, JSON) | PASS |
| 3 | Informal (YAML, chat, notes) | baseline |

#### Notes
- text/markdown: cited=3/3 (1.00), retrieved=3/3 (1.00)
- application/json: cited=1/3 (0.33), retrieved=3/3 (1.00)
- application/x-yaml: cited=0/3 (0.00), retrieved=3/3 (1.00)
- text/csv: cited=2/3 (0.67), retrieved=3/3 (1.00)
- text/plain (chat): cited=0/3 (0.00), retrieved=3/3 (1.00)
- text/plain (notes): cited=0/3 (0.00), retrieved=3/3 (1.00)
- Tier 1 (markdown): recall=1.00 PASS
- Tier 2 (csv=0.67, json=0.33): PASS
- Tier 3 baseline (yaml=0.00, chat=0.00, notes=0.00)
- Retrieved recall — markdown=1.00, csv=1.00, json=1.00

#### Query Details

**Query:** "What are the rate limiting rules for the payment service? What are the request limits and burst allowances?"
Metrics: expected_found=2, expected_total=6, precision=1, recall=0.333, retrieved_found=6, retrieved_recall=1, retrieved_ids=v3-fmt-a-md,v3-fmt-a-json,v3-fmt-a-notes,v3-fmt-a-csv,v3-fmt-a-chat,v3-fmt-a-yaml,v3-fmt-c-md,v3-fmt-c-csv,v3-fmt-c-chat,v3-fmt-c-yaml, fragility_score=1, distinct_domains=2, latency_ms=2696.469
- Missing expected docs: v3-fmt-a-yaml, v3-fmt-a-csv, v3-fmt-a-chat, v3-fmt-a-notes

**Query:** "What is the database backup schedule? How often are full backups and WAL archives taken?"
Metrics: expected_found=2, expected_total=6, precision=1, recall=0.333, retrieved_found=6, retrieved_recall=1, retrieved_ids=v3-fmt-b-md,v3-fmt-b-json,v3-fmt-b-csv,v3-fmt-b-chat,v3-fmt-b-notes,v3-fmt-b-yaml,v3-fmt-a-chat,v3-fmt-c-md,v3-fmt-a-md,v3-fmt-a-notes, fragility_score=1, distinct_domains=2, latency_ms=1272.135
- Missing expected docs: v3-fmt-b-json, v3-fmt-b-yaml, v3-fmt-b-chat, v3-fmt-b-notes

**Query:** "What are the alerting threshold configurations? What latency and error rate thresholds trigger alerts?"
Metrics: expected_found=2, expected_total=6, precision=1, recall=0.333, retrieved_found=6, retrieved_recall=1, retrieved_ids=v3-fmt-c-md,v3-fmt-c-notes,v3-fmt-c-json,v3-fmt-c-chat,v3-fmt-c-csv,v3-fmt-c-yaml,v3-fmt-a-json,v3-fmt-a-chat,v3-fmt-a-md,v3-fmt-a-csv, fragility_score=1, distinct_domains=2, latency_ms=2953.010
- Missing expected docs: v3-fmt-c-json, v3-fmt-c-yaml, v3-fmt-c-chat, v3-fmt-c-notes

### BM25 vs Vector Decomposition (12 docs, 6 queries)

**Passed:** YES

| Metric | Value |
|--------|-------|
| combined_citation_recall | 0.6667 |
| combined_retrieved_recall | 1 |
| bm25_citation_recall | 1 |
| vector_citation_recall | 0 |
| hybrid_citation_recall | 1 |
| bm25_retrieved_recall | 1 |
| vector_retrieved_recall | 1 |
| hybrid_retrieved_recall | 1 |
| bm25_found | 2 |
| vector_found | 0 |
| hybrid_found | 4 |
| lane_bm25_retrieved | true |
| lane_vector_retrieved | true |
| lane_hybrid_retrieved | true |
| lane_bm25_cited | true |
| lane_vector_cited | true |
| lane_hybrid_cited | true |

#### Notes
- BM25 (K-class): cited=2/2 (1.00), retrieved=2/2 (1.00)
- Vector (V-class): cited=0/4 (0.00), retrieved=4/4 (1.00)
- Hybrid (H-class): cited=4/4 (1.00), retrieved=4/4 (1.00)
- Lane contribution (retrieved) — BM25: true, Vector: true, Hybrid: true
- Lane contribution (cited) — BM25: true, Vector: true, Hybrid: true

#### Query Details

**Query:** "What is the XK7-Bravo protocol for FIPS-140-3 HSM validation?"
Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, retrieved_ids=v3-bm25-k1,v3-vec-v1,v3-vec-v4,v3-hyb-h4,v3-hyb-h2,v3-bm25-k2,v3-vec-v2,v3-bm25-k3,v3-hyb-h3,v3-hyb-h1, fragility_score=1, distinct_domains=2, latency_ms=2115.735

**Query:** "What does runbook RB-2025-0417 say about ZetaQueue99thPctLatency alert response?"
Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, retrieved_ids=v3-bm25-k2,v3-hyb-h4,v3-vec-v4,v3-bm25-k1,v3-hyb-h2,v3-vec-v2,v3-vec-v1,v3-bm25-k3,v3-hyb-h3,v3-bm25-k4, fragility_score=1, distinct_domains=2, latency_ms=4913.982

**Query:** "What is the API key rotation policy at Meridian?"
Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v3-hyb-h1,v3-bm25-k3,v3-hyb-h3,v3-bm25-k1,v3-hyb-h2,v3-hyb-h4,v3-vec-v2,v3-vec-v1,v3-vec-v3,v3-bm25-k2, fragility_score=1, distinct_domains=2, latency_ms=2888.388
- Missing expected docs: v3-vec-v1

**Query:** "What is the incident response playbook and severity classification?"
Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v3-hyb-h2,v3-vec-v4,v3-vec-v2,v3-hyb-h4,v3-bm25-k1,v3-bm25-k2,v3-bm25-k4,v3-hyb-h3,v3-bm25-k3,v3-vec-v3, fragility_score=1, distinct_domains=2, latency_ms=3295.186
- Missing expected docs: v3-vec-v2

**Query:** "What is the database backup strategy and recovery objectives?"
Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v3-hyb-h3,v3-vec-v3,v3-vec-v2,v3-hyb-h1,v3-hyb-h2,v3-vec-v1,v3-bm25-k2,v3-vec-v4,v3-bm25-k4,v3-bm25-k3, fragility_score=1, distinct_domains=2, latency_ms=3588.511
- Missing expected docs: v3-vec-v3

**Query:** "What are the alerting threshold configurations for latency and error rates?"
Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v3-hyb-h4,v3-vec-v4,v3-hyb-h2,v3-bm25-k2,v3-vec-v2,v3-bm25-k3,v3-bm25-k1,v3-bm25-k4,v3-hyb-h3,v3-vec-v1, fragility_score=1, distinct_domains=2, latency_ms=2129.827
- Missing expected docs: v3-vec-v4

### Temporal Edge Cases (12 docs, DB checks)

**Passed:** YES

| Metric | Value |
|--------|-------|
| accuracy | 1 |
| correct | 12 |
| total | 12 |

#### Pattern Results

| Pattern | Correct | Total | Accuracy |
|---------|--------:|------:|---------:|
| patternA | 4 | 4 | 1.00 |
| patternB | 4 | 4 | 1.00 |
| patternC | 4 | 4 | 1.00 |

### Fragility Calibration (12 docs, 3 queries)

**Passed:** YES

| Metric | Value |
|--------|-------|
| f1_fragility | 1 |
| f2_fragility | 0 |
| f3_fragility | 0 |
| monotonic_order | true |
| all_zero | false |

#### Fragility Calibration

| Scenario | Expected | Actual | In Range |
|----------|----------|--------|:--------:|
| F1 | [0.8, 1] | 1.000 | YES |
| F2 | [0.3, 0.7] | 0.000 | NO |
| F3 | [0.1, 0.5] | 0.000 | NO |

#### Notes
- F1 (Maximum (2 docs, 2 domains)): fragility=1.000 range=[0.8,1] OK
- F2 (Moderate (4 docs, 3 domains)): fragility=0.000 range=[0.3,0.7] OUT OF RANGE
- F3 (Low (6 docs, 4 domains)): fragility=0.000 range=[0.1,0.5] OUT OF RANGE
- Monotonic ordering: F1 > F2 >= F3 — CORRECT

#### Query Details

**Query:** "What are the encryption standards for operational zones?"
Metrics: expected_found=2, expected_total=2, precision=1, recall=1, retrieved_found=2, retrieved_recall=1, retrieved_ids=v3-frag-f1a,v3-frag-f1b,v3-frag-f3f,v3-frag-f2c,v3-frag-f2a,v3-frag-f3e,v3-frag-f2b,v3-frag-f3a,v3-frag-f3c,v3-frag-f2d, fragility_score=1, distinct_domains=2, latency_ms=2771.383

**Query:** "What are the network segmentation policies across operational zones?"
Metrics: expected_found=3, expected_total=4, precision=1, recall=0.750, retrieved_found=4, retrieved_recall=1, retrieved_ids=v3-frag-f2b,v3-frag-f2c,v3-frag-f2d,v3-frag-f2a,v3-frag-f3a,v3-frag-f3c,v3-frag-f3e,v3-frag-f3d,v3-frag-f3b,v3-frag-f3f, fragility_score=0, distinct_domains=3, latency_ms=5020.661
- Missing expected docs: v3-frag-f2d

**Query:** "What are the incident response runbooks for all operational zones?"
Metrics: expected_found=3, expected_total=6, precision=1, recall=0.500, retrieved_found=6, retrieved_recall=1, retrieved_ids=v3-frag-f3e,v3-frag-f3a,v3-frag-f3c,v3-frag-f3d,v3-frag-f3b,v3-frag-f2b,v3-frag-f2d,v3-frag-f2a,v3-frag-f3f,v3-frag-f2c, fragility_score=0, distinct_domains=3, latency_ms=6153.239
- Missing expected docs: v3-frag-f3a, v3-frag-f3d, v3-frag-f3f

## Summary

| Category | Mode | Passed |
|----------|------|:------:|
| Relation-Bootstrapped Retrieval | V1 | YES |
| Format-Aware Ingestion Recall | V1 | YES |
| BM25 vs Vector Decomposition | V1 | YES |
| Temporal Edge Cases | V1 | YES |
| Receipt Chain Stress | V4.1 | YES |
| Fragility Calibration | V1 | YES |
| Relation-Bootstrapped Retrieval | V3.1 | YES |
| Format-Aware Ingestion Recall | V3.1 | YES |
| BM25 vs Vector Decomposition | V3.1 | YES |
| Temporal Edge Cases | V3.1 | YES |
| Fragility Calibration | V3.1 | YES |
| Relation-Bootstrapped Retrieval | V4.1 | YES |
| Format-Aware Ingestion Recall | V4.1 | YES |
| BM25 vs Vector Decomposition | V4.1 | YES |
| Temporal Edge Cases | V4.1 | YES |
| Fragility Calibration | V4.1 | YES |
