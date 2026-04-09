# Retrieval Quality Audit Report

**Run ID:** a86b1733
**Started:** 2026-03-12T01:02:36.924Z
**Finished:** 2026-03-12T01:12:32.518Z
**Host:** unknown

## Mode: V1

### Supersession Accuracy

**Passed:** YES

| Metric | Value |
|--------|-------|
| recall | 1 |
| precision | 1 |
| ranking_accuracy | 1 |
| mises_accuracy | 1 |
| fragility_in_range | true |
| latency_ms | 3130.5159 |

#### Query Details

**Query:** "What is the current recommended approach for data pipeline configuration?"

Metrics: expected_found=2, expected_total=2, precision=1, recall=1, retrieved_found=2, retrieved_recall=1, retrieved_ids=audit-ss-b,audit-ss-a,audit-ss-c, ranking_correct=1, ranking_total=1, ranking_accuracy=1, mises_expected_found=2, mises_expected_total=2, mises_accuracy=1, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=3130.516

### Causal Chain Retrieval

**Passed:** YES

| Metric | Value |
|--------|-------|
| avg_recall | 1 |
| avg_precision | 0.7500 |
| causal_chain_query_recall | 1 |
| latency_ms | 2903.2903 |

#### Query Details

**Query:** "Why did the latency incident occur?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, retrieved_ids=audit-cc-c,audit-cc-a,audit-cc-b, ranking_correct=0, ranking_total=0, ranking_accuracy=1, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=3009.860

**Query:** "What caused the settlement processing outage and what was the root regulatory constraint?"

Metrics: expected_found=2, expected_total=2, precision=1, recall=1, retrieved_found=2, retrieved_recall=1, retrieved_ids=audit-cc-c,audit-cc-a,audit-cc-b, ranking_correct=0, ranking_total=0, ranking_accuracy=1, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=2796.720

### Corpus Degradation

**Passed:** YES

| Metric | Value |
|--------|-------|
| degradation_slope_per_1k | -0.0101 |
| baseline_precision5 | 0.5000 |
| final_precision5 | 0.4000 |
| baseline_recall5 | 0.9500 |
| final_recall5 | 0.7500 |
| baseline_fragility_probe | 1 |
| final_fragility_probe | 1 |

#### Degradation Curve

| Corpus Size | Precision@5 | Recall@5 | MiSES Jaccard | Fragility (light) | Fragility Probe (verified) | Latency P50 | Latency P95 |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 100 | 0.500 | 0.950 | 1.000 | 0.000 | 1.000 | 2985.102069ms | 3992.464201ms |
| 1000 | 0.500 | 0.950 | 1.000 | 0.000 | 1.000 | 2591.388194ms | 3430.588462ms |
| 5000 | 0.483 | 0.950 | 1.000 | 0.000 | 1.000 | 2571.496187ms | 3516.150967ms |
| 10000 | 0.400 | 0.750 | 1.000 | 0.000 | 1.000 | 2238.435296ms | 3103.718897ms |

#### Notes
- Degradation slope: -0.010101 precision@5 per 1K docs
- Precision@5: 0.500 (100 docs) → 0.400 (10000 docs)
- Fragility probe mean: 1.000 (100 docs) → 1.000 (10000 docs) — stable with scale

### Temporal Reconstruction

**Passed:** YES

| Metric | Value |
|--------|-------|
| skipped | true |

#### Notes
- Skipped: V1 does not support temporal reconstruction

## Mode: V3.1

### Supersession Accuracy

**Passed:** YES

| Metric | Value |
|--------|-------|
| recall | 1 |
| precision | 1 |
| ranking_accuracy | 1 |
| mises_accuracy | 1 |
| fragility_in_range | true |
| latency_ms | 1766.4951 |

#### Query Details

**Query:** "What is the current recommended approach for data pipeline configuration?"

Metrics: expected_found=2, expected_total=2, precision=1, recall=1, retrieved_found=2, retrieved_recall=1, retrieved_ids=audit-ss-b,audit-ss-a,audit-ss-c, ranking_correct=1, ranking_total=1, ranking_accuracy=1, mises_expected_found=2, mises_expected_total=2, mises_accuracy=1, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=1766.495

### Causal Chain Retrieval

**Passed:** YES

| Metric | Value |
|--------|-------|
| avg_recall | 1 |
| avg_precision | 0.7500 |
| causal_chain_query_recall | 1 |
| latency_ms | 2873.1637 |

#### Query Details

**Query:** "Why did the latency incident occur?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, retrieved_ids=audit-cc-c,audit-cc-a,audit-cc-b, ranking_correct=0, ranking_total=0, ranking_accuracy=1, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=2723.360

**Query:** "What caused the settlement processing outage and what was the root regulatory constraint?"

Metrics: expected_found=2, expected_total=2, precision=1, recall=1, retrieved_found=2, retrieved_recall=1, retrieved_ids=audit-cc-c,audit-cc-a,audit-cc-b, ranking_correct=0, ranking_total=0, ranking_accuracy=1, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=3022.968

### Corpus Degradation

**Passed:** YES

| Metric | Value |
|--------|-------|
| degradation_slope_per_1k | -0.0101 |
| baseline_precision5 | 0.5000 |
| final_precision5 | 0.4000 |
| baseline_recall5 | 0.9500 |
| final_recall5 | 0.7500 |
| baseline_fragility_probe | 1 |
| final_fragility_probe | 1 |

#### Degradation Curve

| Corpus Size | Precision@5 | Recall@5 | MiSES Jaccard | Fragility (light) | Fragility Probe (verified) | Latency P50 | Latency P95 |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 100 | 0.500 | 0.950 | 1.000 | 0.000 | 1.000 | 2743.536451ms | 3916.550987ms |
| 1000 | 0.500 | 0.950 | 1.000 | 0.000 | 1.000 | 2439.751601ms | 3058.00771ms |
| 5000 | 0.483 | 0.950 | 1.000 | 0.000 | 1.000 | 2460.32912ms | 3116.19518ms |
| 10000 | 0.400 | 0.750 | 1.000 | 0.000 | 1.000 | 2517.811562ms | 3081.461843ms |

#### Notes
- Degradation slope: -0.010101 precision@5 per 1K docs
- Precision@5: 0.500 (100 docs) → 0.400 (10000 docs)
- Fragility probe mean: 1.000 (100 docs) → 1.000 (10000 docs) — stable with scale

### Temporal Reconstruction

**Passed:** YES

| Metric | Value |
|--------|-------|
| reconstruction_accuracy | 1 |
| correct | 54 |
| total | 54 |
| receipts_generated | 3 |
| chains_verified | 3 |
| chains_intact | 3 |
| receipts_signed | 0 |
| db_chain_intact | true |
| knowledge_cursor_present | 3 |

#### Notes
- V3.1 and V4.1 produce identical Cat 4 results: both query artifact_living_state directly. V4.1 differentiation will come from decision_causal_chain projection and temporal reconstruction API when deployed.

## Mode: V4.1

### Supersession Accuracy

**Passed:** YES

| Metric | Value |
|--------|-------|
| recall | 1 |
| precision | 1 |
| ranking_accuracy | 1 |
| mises_accuracy | 1 |
| fragility_in_range | true |
| latency_ms | 1856.9154 |

#### Query Details

**Query:** "What is the current recommended approach for data pipeline configuration?"

Metrics: expected_found=2, expected_total=2, precision=1, recall=1, retrieved_found=2, retrieved_recall=1, retrieved_ids=audit-ss-b,audit-ss-a,audit-ss-c, ranking_correct=1, ranking_total=1, ranking_accuracy=1, mises_expected_found=2, mises_expected_total=2, mises_accuracy=1, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=1856.915

### Causal Chain Retrieval

**Passed:** YES

| Metric | Value |
|--------|-------|
| avg_recall | 1 |
| avg_precision | 0.7500 |
| causal_chain_query_recall | 1 |
| latency_ms | 3725.7563 |

#### Query Details

**Query:** "Why did the latency incident occur?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, retrieved_ids=audit-cc-c,audit-cc-a,audit-cc-b, ranking_correct=0, ranking_total=0, ranking_accuracy=1, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=2395.363

**Query:** "What caused the settlement processing outage and what was the root regulatory constraint?"

Metrics: expected_found=2, expected_total=2, precision=1, recall=1, retrieved_found=2, retrieved_recall=1, retrieved_ids=audit-cc-c,audit-cc-a,audit-cc-b, ranking_correct=0, ranking_total=0, ranking_accuracy=1, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=5056.150

### Corpus Degradation

**Passed:** YES

| Metric | Value |
|--------|-------|
| degradation_slope_per_1k | -0.0101 |
| baseline_precision5 | 0.5000 |
| final_precision5 | 0.4000 |
| baseline_recall5 | 0.9500 |
| final_recall5 | 0.7500 |
| baseline_fragility_probe | 1 |
| final_fragility_probe | 1 |

#### Degradation Curve

| Corpus Size | Precision@5 | Recall@5 | MiSES Jaccard | Fragility (light) | Fragility Probe (verified) | Latency P50 | Latency P95 |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 100 | 0.500 | 0.950 | 1.000 | 0.000 | 1.000 | 2722.593014ms | 3613.04493ms |
| 1000 | 0.500 | 0.950 | 1.000 | 0.000 | 1.000 | 2656.568739ms | 4802.890542ms |
| 5000 | 0.483 | 0.950 | 1.000 | 0.000 | 1.000 | 2826.368937ms | 4281.999506ms |
| 10000 | 0.400 | 0.750 | 1.000 | 0.000 | 1.000 | 2887.961697ms | 5471.130688ms |

#### Notes
- Degradation slope: -0.010101 precision@5 per 1K docs
- Precision@5: 0.500 (100 docs) → 0.400 (10000 docs)
- Fragility probe mean: 1.000 (100 docs) → 1.000 (10000 docs) — stable with scale

### Temporal Reconstruction

**Passed:** YES

| Metric | Value |
|--------|-------|
| reconstruction_accuracy | 1 |
| correct | 54 |
| total | 54 |
| receipts_generated | 3 |
| chains_verified | 3 |
| chains_intact | 3 |
| receipts_signed | 0 |
| db_chain_intact | true |
| knowledge_cursor_present | 3 |

#### Notes
- knowledge_state_cursor present in 3/3 receipts (CoreCrux event lineage active)
- Temporal reconstruction endpoint not yet deployed (404) — Cat 4 uses artifact_living_state DB query as proxy

## Cross-Mode Comparison

| Finding | Value |
|---------|-------|
| supersession improvement v41 vs v1 | recall 1.000 → 1.000, ranking 1.000 → 1.000 |
| causal completeness improvement | avg_recall 1.000 → 1.000 |
| degradation slope v1 | -0.010101010101010098 |
| degradation slope v41 | -0.010101010101010098 |
