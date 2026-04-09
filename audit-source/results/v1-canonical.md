# Retrieval Quality Audit Report

**Run ID:** 110ada93
**Started:** 2026-03-10T14:41:55.073Z
**Finished:** 2026-03-10T14:51:13.521Z
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
| latency_ms | 2019.4950 |

#### Query Details

**Query:** "What is the current recommended approach for data pipeline configuration?"

Metrics: expected_found=2, expected_total=2, precision=1, recall=1, ranking_correct=1, ranking_total=1, ranking_accuracy=1, mises_expected_found=2, mises_expected_total=2, mises_accuracy=1, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=2019.495

### Causal Chain Retrieval

**Passed:** YES

| Metric | Value |
|--------|-------|
| avg_recall | 1 |
| avg_precision | 0.7500 |
| causal_chain_query_recall | 1 |
| latency_ms | 2410.0884 |

#### Query Details

**Query:** "Why did the latency incident occur?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, ranking_correct=0, ranking_total=0, ranking_accuracy=1, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=2587.189

**Query:** "What caused the settlement processing outage and what was the root regulatory constraint?"

Metrics: expected_found=2, expected_total=2, precision=1, recall=1, ranking_correct=0, ranking_total=0, ranking_accuracy=1, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=2232.988

### Corpus Degradation

**Passed:** YES

| Metric | Value |
|--------|-------|
| degradation_slope_per_1k | -0.0202 |
| baseline_precision5 | 0.5000 |
| final_precision5 | 0.3000 |
| baseline_recall5 | 0.9500 |
| final_recall5 | 0.5500 |
| baseline_fragility_probe | 1 |
| final_fragility_probe | 1 |

#### Degradation Curve

| Corpus Size | Precision@5 | Recall@5 | MiSES Jaccard | Fragility (light) | Fragility Probe (verified) | Latency P50 | Latency P95 |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 100 | 0.500 | 0.950 | 1.000 | 0.000 | 1.000 | 2498.257137ms | 4805.556921ms |
| 1000 | 0.500 | 0.950 | 1.000 | 0.000 | 0.750 | 2483.863899ms | 3617.845344ms |
| 5000 | 0.400 | 0.750 | 1.000 | 0.000 | 1.000 | 1944.157871ms | 2816.664689ms |
| 10000 | 0.300 | 0.550 | 1.000 | 0.000 | 1.000 | 1980.239969ms | 3788.017856ms |

#### Notes
- Degradation slope: -0.020202 precision@5 per 1K docs
- Precision@5: 0.500 (100 docs) → 0.300 (10000 docs)
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
| latency_ms | 1858.1297 |

#### Query Details

**Query:** "What is the current recommended approach for data pipeline configuration?"

Metrics: expected_found=2, expected_total=2, precision=1, recall=1, ranking_correct=1, ranking_total=1, ranking_accuracy=1, mises_expected_found=2, mises_expected_total=2, mises_accuracy=1, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=1858.130

### Causal Chain Retrieval

**Passed:** YES

| Metric | Value |
|--------|-------|
| avg_recall | 1 |
| avg_precision | 0.7500 |
| causal_chain_query_recall | 1 |
| latency_ms | 2210.8379 |

#### Query Details

**Query:** "Why did the latency incident occur?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, ranking_correct=0, ranking_total=0, ranking_accuracy=1, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=2053.859

**Query:** "What caused the settlement processing outage and what was the root regulatory constraint?"

Metrics: expected_found=2, expected_total=2, precision=1, recall=1, ranking_correct=0, ranking_total=0, ranking_accuracy=1, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=2367.817

### Corpus Degradation

**Passed:** YES

| Metric | Value |
|--------|-------|
| degradation_slope_per_1k | -0.0202 |
| baseline_precision5 | 0.5000 |
| final_precision5 | 0.3000 |
| baseline_recall5 | 0.9500 |
| final_recall5 | 0.5500 |
| baseline_fragility_probe | 1 |
| final_fragility_probe | 1 |

#### Degradation Curve

| Corpus Size | Precision@5 | Recall@5 | MiSES Jaccard | Fragility (light) | Fragility Probe (verified) | Latency P50 | Latency P95 |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 100 | 0.500 | 0.950 | 1.000 | 0.000 | 1.000 | 2713.010983ms | 4402.311979ms |
| 1000 | 0.500 | 0.950 | 1.000 | 0.000 | 0.750 | 2580.367745ms | 3519.171915ms |
| 5000 | 0.400 | 0.750 | 1.000 | 0.000 | 1.000 | 2834.797781ms | 3589.87266ms |
| 10000 | 0.300 | 0.550 | 1.000 | 0.000 | 1.000 | 2332.070214ms | 3454.067153ms |

#### Notes
- Degradation slope: -0.020202 precision@5 per 1K docs
- Precision@5: 0.500 (100 docs) → 0.300 (10000 docs)
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
| latency_ms | 2171.3425 |

#### Query Details

**Query:** "What is the current recommended approach for data pipeline configuration?"

Metrics: expected_found=2, expected_total=2, precision=1, recall=1, ranking_correct=1, ranking_total=1, ranking_accuracy=1, mises_expected_found=2, mises_expected_total=2, mises_accuracy=1, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=2171.343

### Causal Chain Retrieval

**Passed:** YES

| Metric | Value |
|--------|-------|
| avg_recall | 1 |
| avg_precision | 0.7500 |
| causal_chain_query_recall | 1 |
| latency_ms | 2527.2215 |

#### Query Details

**Query:** "Why did the latency incident occur?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, ranking_correct=0, ranking_total=0, ranking_accuracy=1, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=2288.059

**Query:** "What caused the settlement processing outage and what was the root regulatory constraint?"

Metrics: expected_found=2, expected_total=2, precision=1, recall=1, ranking_correct=0, ranking_total=0, ranking_accuracy=1, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=2766.384

### Corpus Degradation

**Passed:** YES

| Metric | Value |
|--------|-------|
| degradation_slope_per_1k | -0.0185 |
| baseline_precision5 | 0.4833 |
| final_precision5 | 0.3000 |
| baseline_recall5 | 0.9500 |
| final_recall5 | 0.5500 |
| baseline_fragility_probe | 1 |
| final_fragility_probe | 1 |

#### Degradation Curve

| Corpus Size | Precision@5 | Recall@5 | MiSES Jaccard | Fragility (light) | Fragility Probe (verified) | Latency P50 | Latency P95 |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 100 | 0.483 | 0.950 | 1.000 | 0.000 | 1.000 | 2595.975843ms | 3503.25854ms |
| 1000 | 0.450 | 0.850 | 1.000 | 0.000 | 0.750 | 2410.263395ms | 3552.312651ms |
| 5000 | 0.350 | 0.650 | 1.000 | 0.000 | 1.000 | 2304.482119ms | 3402.565479ms |
| 10000 | 0.300 | 0.550 | 1.000 | 0.000 | 1.000 | 2520.593751ms | 4294.071597ms |

#### Notes
- Degradation slope: -0.018519 precision@5 per 1K docs
- Precision@5: 0.483 (100 docs) → 0.300 (10000 docs)
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
| degradation slope v1 | -0.020202020202020204 |
| degradation slope v41 | -0.018518518518518514 |
