# Canonical Run: `e782fbd0`

| Field | Value |
|-------|-------|
| **Run ID** | `e782fbd0` |
| **Suite** | v3 |
| **Embedding** | OpenAI |
| **Date** | 2026-03-11 |
| **Duration** | 5m 10s |
| **Pass Rate** | **16/16** |
| **Source** | `AuditCrux/results/v3-canonical.json` |

## Results by Category

| Category | V1 | V3.1 | V4.1 | Key Metric |
|---|---|---|---|---|
| Supersession / Relation-bootstrapped Retrieval | PASS | PASS | PASS | recall=1 |
| Format-aware Retrieval | PASS | PASS | PASS | avg_recall=1 |
| Retrieval Lane Decomposition | PASS | PASS | PASS | bm25=1 |
| Temporal Reconstruction / Scale Degradation | PASS | PASS | PASS | — |
| Receipt Chain Verification | — | — | PASS | — |
| Fragility Calibration | PASS | PASS | PASS | fragility=1 |

## Detailed Metrics

### Supersession / Relation-bootstrapped Retrieval (V1)

> BASELINE: Relation expansion NOT active — amendment not found (expected)

| Metric | Value |
|---|---|
| `avg_recall` | 1 |
| `amendment_found` | false |
| `relation_expansion_active` | false |

<details><summary>1 queries</summary>

- **What is the current data residency framework at Meridian? What are the geographic locality and sove…**
  - expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=10112.514

</details>

### Format-aware Retrieval (V1)

> text/markdown: cited=3/3 (1.00), retrieved=3/3 (1.00) | application/json: cited=1/3 (0.33), retrieved=3/3 (1.00) | application/x-yaml: cited=0/3 (0.00), retrieved=3/3 (1.00) | text/csv: cited=2/3 (0.67), retrieved=3/3 (1.00) | text/plain (chat): cited=0/3 (0.00), retrieved=3/3 (1.00) | text/plain (notes): cited=0/3 (0.00), retrieved=3/3 (1.00) | Tier 1 (markdown): recall=1.00 PASS | Tier 2 (csv=0.67, json=0.33): PASS | Tier 3 baseline (yaml=0.00, chat=0.00, notes=0.00) | Retrieved recall — markdown=1.00, csv=1.00, json=1.00

| Metric | Value |
|---|---|
| `avg_citation_recall` | 0.333 |
| `avg_retrieved_recall` | 1 |
| `format_citation_recall` | {"text/markdown":1,"application/json":0.3333333333333333,"application/x-yaml":0,"text/csv":0.6666666666666666,"text/plain (chat)":0,"text/plain (notes)":0} |
| `format_retrieved_recall` | {"text/markdown":1,"application/json":1,"application/x-yaml":1,"text/csv":1,"text/plain (chat)":1,"text/plain (notes)":1} |
| `query_count` | 3 |
| `tier1_pass` | true |
| `tier2_pass` | true |
| `tier1_recall` | 1 |
| `tier2_csv_recall` | 0.667 |
| `tier2_json_recall` | 0.333 |
| `tier3_yaml_recall` | 0 |
| `tier3_chat_recall` | 0 |
| `tier3_notes_recall` | 0 |
| `tier1_retrieved_recall` | 1 |
| `tier2_csv_retrieved_recall` | 1 |
| `tier2_json_retrieved_recall` | 1 |

<details><summary>3 queries</summary>

- **What are the rate limiting rules for the payment service? What are the request limits and burst all…**
  - expected_found=2, expected_total=6, precision=1, recall=0.333, retrieved_found=6, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=7898.471
- **What is the database backup schedule? How often are full backups and WAL archives taken?**
  - expected_found=2, expected_total=6, precision=1, recall=0.333, retrieved_found=6, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=2990.463
- **What are the alerting threshold configurations? What latency and error rate thresholds trigger aler…**
  - expected_found=2, expected_total=6, precision=1, recall=0.333, retrieved_found=6, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=3212.725

</details>

### Retrieval Lane Decomposition (V1)

> BM25 (K-class): cited=2/2 (1.00), retrieved=2/2 (1.00) | Vector (V-class): cited=0/4 (0.00), retrieved=4/4 (1.00) | Hybrid (H-class): cited=4/4 (1.00), retrieved=4/4 (1.00) | Lane contribution (retrieved) — BM25: true, Vector: true, Hybrid: true | Lane contribution (cited) — BM25: true, Vector: true, Hybrid: true

| Metric | Value |
|---|---|
| `combined_citation_recall` | 0.667 |
| `combined_retrieved_recall` | 1 |
| `bm25_citation_recall` | 1 |
| `vector_citation_recall` | 0 |
| `hybrid_citation_recall` | 1 |
| `bm25_retrieved_recall` | 1 |
| `vector_retrieved_recall` | 1 |
| `hybrid_retrieved_recall` | 1 |
| `bm25_found` | 2 |
| `vector_found` | 0 |
| `hybrid_found` | 4 |
| `lane_bm25_retrieved` | true |
| `lane_vector_retrieved` | true |
| `lane_hybrid_retrieved` | true |
| `lane_bm25_cited` | true |
| `lane_vector_cited` | true |
| `lane_hybrid_cited` | true |

<details><summary>6 queries</summary>

- **What is the XK7-Bravo protocol for FIPS-140-3 HSM validation?**
  - expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=3606.207
- **What does runbook RB-2025-0417 say about ZetaQueue99thPctLatency alert response?**
  - expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=4955.986
- **What is the API key rotation policy at Meridian?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=2167.984
- **What is the incident response playbook and severity classification?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=3799.916
- **What is the database backup strategy and recovery objectives?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=3136.467
- **What are the alerting threshold configurations for latency and error rates?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=3264.483

</details>

### Temporal Reconstruction / Scale Degradation (V1)

> Skipped: V1 does not support living state

| Metric | Value |
|---|---|
| `skipped` | true |

### Receipt Chain Verification (V4.1)

> Max verified depth: 50 | Latency slope: -0.04 ms/depth | Latency at depth 50: 2ms

| Metric | Value |
|---|---|
| `chains_intact` | 10 |
| `total_verified` | 10 |
| `max_verified_depth` | 50 |
| `latency_at_depth_50` | 2 |
| `latency_slope_per_depth` | -0.044 |
| `all_intact_at_20` | true |
| `depth_points` | [{"depth":5,"latency_ms":4,"chain_intact":true},{"depth":10,"latency_ms":3,"chain_intact":true},{"depth":15,"latency_ms":2,"chain_intact":true},{"depth":20,"latency_ms":3,"chain_intact":true},{"depth":25,"latency_ms":3,"chain_intact":true},{"depth":30,"latency_ms":3,"chain_intact":true},{"depth":35,"latency_ms":3,"chain_intact":true},{"depth":40,"latency_ms":3,"chain_intact":true},{"depth":45,"latency_ms":3,"chain_intact":true},{"depth":50,"latency_ms":2,"chain_intact":true}] |

### Fragility Calibration (V1)

> F1 (Maximum (2 docs, 2 domains)): fragility=1.000 range=[0.8,1] OK | F2 (Moderate (4 docs, 3 domains)): fragility=0.000 range=[0.3,0.7] OUT OF RANGE | F3 (Low (6 docs, 4 domains)): fragility=0.000 range=[0.1,0.5] OUT OF RANGE | Monotonic ordering: F1 > F2 >= F3 — CORRECT

| Metric | Value |
|---|---|
| `f1_fragility` | 1 |
| `f2_fragility` | 0 |
| `f3_fragility` | 0 |
| `monotonic_order` | true |
| `all_zero` | false |
| `calibration_points` | [{"scenario":"F1","expected_range":[0.8,1],"actual":1,"in_range":true},{"scenario":"F2","expected_range":[0.3,0.7],"actual":0,"in_range":false},{"scenario":"F3","expected_range":[0.1,0.5],"actual":0,"in_range":false}] |

<details><summary>3 queries</summary>

- **What are the encryption standards for operational zones?**
  - expected_found=2, expected_total=2, precision=1, recall=1, retrieved_found=2, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=2689.001
- **What are the network segmentation policies across operational zones?**
  - expected_found=2, expected_total=4, precision=0.667, recall=0.500, retrieved_found=4, retrieved_recall=1, fragility_score=0, distinct_domains=3, latency_ms=6484.422
- **What are the incident response runbooks for all operational zones?**
  - expected_found=3, expected_total=6, precision=1, recall=0.500, retrieved_found=6, retrieved_recall=1, fragility_score=0, distinct_domains=3, latency_ms=5568.919

</details>

### Supersession / Relation-bootstrapped Retrieval (V3.1)

> BASELINE: Relation expansion NOT active — amendment not found (expected)

| Metric | Value |
|---|---|
| `avg_recall` | 1 |
| `amendment_found` | false |
| `relation_expansion_active` | false |

<details><summary>1 queries</summary>

- **What is the current data residency framework at Meridian? What are the geographic locality and sove…**
  - expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=7626.293

</details>

### Format-aware Retrieval (V3.1)

> text/markdown: cited=3/3 (1.00), retrieved=3/3 (1.00) | application/json: cited=1/3 (0.33), retrieved=3/3 (1.00) | application/x-yaml: cited=0/3 (0.00), retrieved=3/3 (1.00) | text/csv: cited=2/3 (0.67), retrieved=3/3 (1.00) | text/plain (chat): cited=0/3 (0.00), retrieved=3/3 (1.00) | text/plain (notes): cited=0/3 (0.00), retrieved=3/3 (1.00) | Tier 1 (markdown): recall=1.00 PASS | Tier 2 (csv=0.67, json=0.33): PASS | Tier 3 baseline (yaml=0.00, chat=0.00, notes=0.00) | Retrieved recall — markdown=1.00, csv=1.00, json=1.00

| Metric | Value |
|---|---|
| `avg_citation_recall` | 0.333 |
| `avg_retrieved_recall` | 1 |
| `format_citation_recall` | {"text/markdown":1,"application/json":0.3333333333333333,"application/x-yaml":0,"text/csv":0.6666666666666666,"text/plain (chat)":0,"text/plain (notes)":0} |
| `format_retrieved_recall` | {"text/markdown":1,"application/json":1,"application/x-yaml":1,"text/csv":1,"text/plain (chat)":1,"text/plain (notes)":1} |
| `query_count` | 3 |
| `tier1_pass` | true |
| `tier2_pass` | true |
| `tier1_recall` | 1 |
| `tier2_csv_recall` | 0.667 |
| `tier2_json_recall` | 0.333 |
| `tier3_yaml_recall` | 0 |
| `tier3_chat_recall` | 0 |
| `tier3_notes_recall` | 0 |
| `tier1_retrieved_recall` | 1 |
| `tier2_csv_retrieved_recall` | 1 |
| `tier2_json_retrieved_recall` | 1 |

<details><summary>3 queries</summary>

- **What are the rate limiting rules for the payment service? What are the request limits and burst all…**
  - expected_found=2, expected_total=6, precision=1, recall=0.333, retrieved_found=6, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=5509.439
- **What is the database backup schedule? How often are full backups and WAL archives taken?**
  - expected_found=2, expected_total=6, precision=1, recall=0.333, retrieved_found=6, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=2031.398
- **What are the alerting threshold configurations? What latency and error rate thresholds trigger aler…**
  - expected_found=2, expected_total=6, precision=1, recall=0.333, retrieved_found=6, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=3541.446

</details>

### Retrieval Lane Decomposition (V3.1)

> BM25 (K-class): cited=2/2 (1.00), retrieved=2/2 (1.00) | Vector (V-class): cited=0/4 (0.00), retrieved=4/4 (1.00) | Hybrid (H-class): cited=4/4 (1.00), retrieved=4/4 (1.00) | Lane contribution (retrieved) — BM25: true, Vector: true, Hybrid: true | Lane contribution (cited) — BM25: true, Vector: true, Hybrid: true

| Metric | Value |
|---|---|
| `combined_citation_recall` | 0.667 |
| `combined_retrieved_recall` | 1 |
| `bm25_citation_recall` | 1 |
| `vector_citation_recall` | 0 |
| `hybrid_citation_recall` | 1 |
| `bm25_retrieved_recall` | 1 |
| `vector_retrieved_recall` | 1 |
| `hybrid_retrieved_recall` | 1 |
| `bm25_found` | 2 |
| `vector_found` | 0 |
| `hybrid_found` | 4 |
| `lane_bm25_retrieved` | true |
| `lane_vector_retrieved` | true |
| `lane_hybrid_retrieved` | true |
| `lane_bm25_cited` | true |
| `lane_vector_cited` | true |
| `lane_hybrid_cited` | true |

<details><summary>6 queries</summary>

- **What is the XK7-Bravo protocol for FIPS-140-3 HSM validation?**
  - expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=3818.635
- **What does runbook RB-2025-0417 say about ZetaQueue99thPctLatency alert response?**
  - expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=4690.003
- **What is the API key rotation policy at Meridian?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=5217.499
- **What is the incident response playbook and severity classification?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=4072.904
- **What is the database backup strategy and recovery objectives?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=3269.537
- **What are the alerting threshold configurations for latency and error rates?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=3046.665

</details>

### Temporal Reconstruction / Scale Degradation (V3.1)

| Metric | Value |
|---|---|
| `accuracy` | 1 |
| `correct` | 12 |
| `total` | 12 |
| `pattern_results` | {"patternA":{"correct":4,"total":4,"details":[]},"patternB":{"correct":4,"total":4,"details":[]},"patternC":{"correct":4,"total":4,"details":[]}} |

### Fragility Calibration (V3.1)

> F1 (Maximum (2 docs, 2 domains)): fragility=1.000 range=[0.8,1] OK | F2 (Moderate (4 docs, 3 domains)): fragility=0.000 range=[0.3,0.7] OUT OF RANGE | F3 (Low (6 docs, 4 domains)): fragility=0.000 range=[0.1,0.5] OUT OF RANGE | Monotonic ordering: F1 > F2 >= F3 — CORRECT

| Metric | Value |
|---|---|
| `f1_fragility` | 1 |
| `f2_fragility` | 0 |
| `f3_fragility` | 0 |
| `monotonic_order` | true |
| `all_zero` | false |
| `calibration_points` | [{"scenario":"F1","expected_range":[0.8,1],"actual":1,"in_range":true},{"scenario":"F2","expected_range":[0.3,0.7],"actual":0,"in_range":false},{"scenario":"F3","expected_range":[0.1,0.5],"actual":0,"in_range":false}] |

<details><summary>3 queries</summary>

- **What are the encryption standards for operational zones?**
  - expected_found=2, expected_total=2, precision=1, recall=1, retrieved_found=2, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=2982.398
- **What are the network segmentation policies across operational zones?**
  - expected_found=2, expected_total=4, precision=0.667, recall=0.500, retrieved_found=4, retrieved_recall=1, fragility_score=0, distinct_domains=3, latency_ms=6672.876
- **What are the incident response runbooks for all operational zones?**
  - expected_found=3, expected_total=6, precision=1, recall=0.500, retrieved_found=6, retrieved_recall=1, fragility_score=0, distinct_domains=3, latency_ms=5155.442

</details>

### Supersession / Relation-bootstrapped Retrieval (V4.1)

> BASELINE: Relation expansion NOT active — amendment not found (expected)

| Metric | Value |
|---|---|
| `avg_recall` | 1 |
| `amendment_found` | false |
| `relation_expansion_active` | false |

<details><summary>1 queries</summary>

- **What is the current data residency framework at Meridian? What are the geographic locality and sove…**
  - expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=5669.692

</details>

### Format-aware Retrieval (V4.1)

> text/markdown: cited=3/3 (1.00), retrieved=3/3 (1.00) | application/json: cited=1/3 (0.33), retrieved=3/3 (1.00) | application/x-yaml: cited=0/3 (0.00), retrieved=3/3 (1.00) | text/csv: cited=2/3 (0.67), retrieved=3/3 (1.00) | text/plain (chat): cited=0/3 (0.00), retrieved=3/3 (1.00) | text/plain (notes): cited=0/3 (0.00), retrieved=3/3 (1.00) | Tier 1 (markdown): recall=1.00 PASS | Tier 2 (csv=0.67, json=0.33): PASS | Tier 3 baseline (yaml=0.00, chat=0.00, notes=0.00) | Retrieved recall — markdown=1.00, csv=1.00, json=1.00

| Metric | Value |
|---|---|
| `avg_citation_recall` | 0.333 |
| `avg_retrieved_recall` | 1 |
| `format_citation_recall` | {"text/markdown":1,"application/json":0.3333333333333333,"application/x-yaml":0,"text/csv":0.6666666666666666,"text/plain (chat)":0,"text/plain (notes)":0} |
| `format_retrieved_recall` | {"text/markdown":1,"application/json":1,"application/x-yaml":1,"text/csv":1,"text/plain (chat)":1,"text/plain (notes)":1} |
| `query_count` | 3 |
| `tier1_pass` | true |
| `tier2_pass` | true |
| `tier1_recall` | 1 |
| `tier2_csv_recall` | 0.667 |
| `tier2_json_recall` | 0.333 |
| `tier3_yaml_recall` | 0 |
| `tier3_chat_recall` | 0 |
| `tier3_notes_recall` | 0 |
| `tier1_retrieved_recall` | 1 |
| `tier2_csv_retrieved_recall` | 1 |
| `tier2_json_retrieved_recall` | 1 |

<details><summary>3 queries</summary>

- **What are the rate limiting rules for the payment service? What are the request limits and burst all…**
  - expected_found=2, expected_total=6, precision=1, recall=0.333, retrieved_found=6, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=5101.236
- **What is the database backup schedule? How often are full backups and WAL archives taken?**
  - expected_found=2, expected_total=6, precision=1, recall=0.333, retrieved_found=6, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=1753.134
- **What are the alerting threshold configurations? What latency and error rate thresholds trigger aler…**
  - expected_found=2, expected_total=6, precision=1, recall=0.333, retrieved_found=6, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=3725.094

</details>

### Retrieval Lane Decomposition (V4.1)

> BM25 (K-class): cited=2/2 (1.00), retrieved=2/2 (1.00) | Vector (V-class): cited=0/4 (0.00), retrieved=4/4 (1.00) | Hybrid (H-class): cited=4/4 (1.00), retrieved=4/4 (1.00) | Lane contribution (retrieved) — BM25: true, Vector: true, Hybrid: true | Lane contribution (cited) — BM25: true, Vector: true, Hybrid: true

| Metric | Value |
|---|---|
| `combined_citation_recall` | 0.667 |
| `combined_retrieved_recall` | 1 |
| `bm25_citation_recall` | 1 |
| `vector_citation_recall` | 0 |
| `hybrid_citation_recall` | 1 |
| `bm25_retrieved_recall` | 1 |
| `vector_retrieved_recall` | 1 |
| `hybrid_retrieved_recall` | 1 |
| `bm25_found` | 2 |
| `vector_found` | 0 |
| `hybrid_found` | 4 |
| `lane_bm25_retrieved` | true |
| `lane_vector_retrieved` | true |
| `lane_hybrid_retrieved` | true |
| `lane_bm25_cited` | true |
| `lane_vector_cited` | true |
| `lane_hybrid_cited` | true |

<details><summary>6 queries</summary>

- **What is the XK7-Bravo protocol for FIPS-140-3 HSM validation?**
  - expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=2368.243
- **What does runbook RB-2025-0417 say about ZetaQueue99thPctLatency alert response?**
  - expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=5977.473
- **What is the API key rotation policy at Meridian?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=4915.570
- **What is the incident response playbook and severity classification?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=4354.498
- **What is the database backup strategy and recovery objectives?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=4239.153
- **What are the alerting threshold configurations for latency and error rates?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=3339.080

</details>

### Temporal Reconstruction / Scale Degradation (V4.1)

| Metric | Value |
|---|---|
| `accuracy` | 1 |
| `correct` | 12 |
| `total` | 12 |
| `pattern_results` | {"patternA":{"correct":4,"total":4,"details":[]},"patternB":{"correct":4,"total":4,"details":[]},"patternC":{"correct":4,"total":4,"details":[]}} |

### Fragility Calibration (V4.1)

> F1 (Maximum (2 docs, 2 domains)): fragility=1.000 range=[0.8,1] OK | F2 (Moderate (4 docs, 3 domains)): fragility=0.000 range=[0.3,0.7] OUT OF RANGE | F3 (Low (6 docs, 4 domains)): fragility=0.000 range=[0.1,0.5] OUT OF RANGE | Monotonic ordering: F1 > F2 >= F3 — CORRECT

| Metric | Value |
|---|---|
| `f1_fragility` | 1 |
| `f2_fragility` | 0 |
| `f3_fragility` | 0 |
| `monotonic_order` | true |
| `all_zero` | false |
| `calibration_points` | [{"scenario":"F1","expected_range":[0.8,1],"actual":1,"in_range":true},{"scenario":"F2","expected_range":[0.3,0.7],"actual":0,"in_range":false},{"scenario":"F3","expected_range":[0.1,0.5],"actual":0,"in_range":false}] |

<details><summary>3 queries</summary>

- **What are the encryption standards for operational zones?**
  - expected_found=2, expected_total=2, precision=1, recall=1, retrieved_found=2, retrieved_recall=1, fragility_score=1, distinct_domains=2, latency_ms=4677.228
- **What are the network segmentation policies across operational zones?**
  - expected_found=2, expected_total=4, precision=0.667, recall=0.500, retrieved_found=4, retrieved_recall=1, fragility_score=0, distinct_domains=3, latency_ms=6235.367
- **What are the incident response runbooks for all operational zones?**
  - expected_found=3, expected_total=6, precision=1, recall=0.500, retrieved_found=6, retrieved_recall=1, fragility_score=0, distinct_domains=3, latency_ms=6697.535

</details>

---

*Generated from [AuditCrux](https://github.com/CueCrux/AuditCrux) canonical results.*