# Canonical Run: `110ada93`

| Field | Value |
|-------|-------|
| **Run ID** | `110ada93` |
| **Suite** | v1 |
| **Embedding** | OpenAI |
| **Date** | 2026-03-10 |
| **Duration** | 9m 18s |
| **Pass Rate** | **12/12** |
| **Source** | `AuditCrux/results/v1-canonical.json` |

## Results by Category

| Category | V1 | V3.1 | V4.1 | Key Metric |
|---|---|---|---|---|
| Supersession / Relation-bootstrapped Retrieval | PASS | PASS | PASS | recall=1 |
| Format-aware Retrieval | PASS | PASS | PASS | — |
| Retrieval Lane Decomposition | PASS | PASS | PASS | — |
| Temporal Reconstruction / Scale Degradation | PASS | PASS | PASS | — |

## Detailed Metrics

### Supersession / Relation-bootstrapped Retrieval (V1)

| Metric | Value |
|---|---|
| `recall` | 1 |
| `precision` | 1 |
| `ranking_accuracy` | 1 |
| `mises_accuracy` | 1 |
| `fragility_in_range` | true |
| `latency_ms` | 2019.495 |

<details><summary>1 queries</summary>

- **What is the current recommended approach for data pipeline configuration?**
  - expected_found=2, expected_total=2, precision=1, recall=1, ranking_correct=1, ranking_total=1, ranking_accuracy=1, mises_expected_found=2, mises_expected_total=2, mises_accuracy=1, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=2019.495

</details>

### Format-aware Retrieval (V1)

| Metric | Value |
|---|---|
| `avg_recall` | 1 |
| `avg_precision` | 0.750 |
| `causal_chain_query_recall` | 1 |
| `latency_ms` | 2410.088 |

<details><summary>2 queries</summary>

- **Why did the latency incident occur?**
  - expected_found=1, expected_total=1, precision=0.500, recall=1, ranking_correct=0, ranking_total=0, ranking_accuracy=1, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=2587.189
- **What caused the settlement processing outage and what was the root regulatory constraint?**
  - expected_found=2, expected_total=2, precision=1, recall=1, ranking_correct=0, ranking_total=0, ranking_accuracy=1, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=2232.988

</details>

### Retrieval Lane Decomposition (V1)

> Degradation slope: -0.020202 precision@5 per 1K docs | Precision@5: 0.500 (100 docs) → 0.300 (10000 docs) | Fragility probe mean: 1.000 (100 docs) → 1.000 (10000 docs) — stable with scale

| Metric | Value |
|---|---|
| `scale_points` | [{"corpusSize":100,"precision5":0.5,"recall5":0.95,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":1,"fragilityProbeCount":4,"latencyP50":2498.257137,"latencyP95":4805.556921},{"corpusSize":1000,"precision5":0.5,"recall5":0.95,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":0.75,"fragilityProbeCount":4,"latencyP50":2483.863899,"latencyP95":3617.845344},{"corpusSize":5000,"precision5":0.4,"recall5":0.75,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":1,"fragilityProbeCount":4,"latencyP50":1944.157871,"latencyP95":2816.664689},{"corpusSize":10000,"precision5":0.3,"recall5":0.55,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":1,"fragilityProbeCount":4,"latencyP50":1980.239969,"latencyP95":3788.017856}] |
| `degradation_slope_per_1k` | -0.020 |
| `baseline_precision5` | 0.500 |
| `final_precision5` | 0.300 |
| `baseline_recall5` | 0.950 |
| `final_recall5` | 0.550 |
| `baseline_fragility_probe` | 1 |
| `final_fragility_probe` | 1 |

### Temporal Reconstruction / Scale Degradation (V1)

> Skipped: V1 does not support temporal reconstruction

| Metric | Value |
|---|---|
| `skipped` | true |

### Supersession / Relation-bootstrapped Retrieval (V3.1)

| Metric | Value |
|---|---|
| `recall` | 1 |
| `precision` | 1 |
| `ranking_accuracy` | 1 |
| `mises_accuracy` | 1 |
| `fragility_in_range` | true |
| `latency_ms` | 1858.130 |

<details><summary>1 queries</summary>

- **What is the current recommended approach for data pipeline configuration?**
  - expected_found=2, expected_total=2, precision=1, recall=1, ranking_correct=1, ranking_total=1, ranking_accuracy=1, mises_expected_found=2, mises_expected_total=2, mises_accuracy=1, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=1858.130

</details>

### Format-aware Retrieval (V3.1)

| Metric | Value |
|---|---|
| `avg_recall` | 1 |
| `avg_precision` | 0.750 |
| `causal_chain_query_recall` | 1 |
| `latency_ms` | 2210.838 |

<details><summary>2 queries</summary>

- **Why did the latency incident occur?**
  - expected_found=1, expected_total=1, precision=0.500, recall=1, ranking_correct=0, ranking_total=0, ranking_accuracy=1, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=2053.859
- **What caused the settlement processing outage and what was the root regulatory constraint?**
  - expected_found=2, expected_total=2, precision=1, recall=1, ranking_correct=0, ranking_total=0, ranking_accuracy=1, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=2367.817

</details>

### Retrieval Lane Decomposition (V3.1)

> Degradation slope: -0.020202 precision@5 per 1K docs | Precision@5: 0.500 (100 docs) → 0.300 (10000 docs) | Fragility probe mean: 1.000 (100 docs) → 1.000 (10000 docs) — stable with scale

| Metric | Value |
|---|---|
| `scale_points` | [{"corpusSize":100,"precision5":0.5,"recall5":0.95,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":1,"fragilityProbeCount":4,"latencyP50":2713.010983,"latencyP95":4402.311979},{"corpusSize":1000,"precision5":0.5,"recall5":0.95,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":0.75,"fragilityProbeCount":4,"latencyP50":2580.367745,"latencyP95":3519.171915},{"corpusSize":5000,"precision5":0.4,"recall5":0.75,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":1,"fragilityProbeCount":4,"latencyP50":2834.797781,"latencyP95":3589.87266},{"corpusSize":10000,"precision5":0.3,"recall5":0.55,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":1,"fragilityProbeCount":4,"latencyP50":2332.070214,"latencyP95":3454.067153}] |
| `degradation_slope_per_1k` | -0.020 |
| `baseline_precision5` | 0.500 |
| `final_precision5` | 0.300 |
| `baseline_recall5` | 0.950 |
| `final_recall5` | 0.550 |
| `baseline_fragility_probe` | 1 |
| `final_fragility_probe` | 1 |

### Temporal Reconstruction / Scale Degradation (V3.1)

> V3.1 and V4.1 produce identical Cat 4 results: both query artifact_living_state directly. V4.1 differentiation will come from decision_causal_chain projection and temporal reconstruction API when deployed.

| Metric | Value |
|---|---|
| `reconstruction_accuracy` | 1 |
| `correct` | 54 |
| `total` | 54 |
| `receipts_generated` | 3 |
| `chains_verified` | 3 |
| `chains_intact` | 3 |
| `receipts_signed` | 0 |
| `db_chain_intact` | true |
| `knowledge_cursor_present` | 3 |

### Supersession / Relation-bootstrapped Retrieval (V4.1)

| Metric | Value |
|---|---|
| `recall` | 1 |
| `precision` | 1 |
| `ranking_accuracy` | 1 |
| `mises_accuracy` | 1 |
| `fragility_in_range` | true |
| `latency_ms` | 2171.343 |

<details><summary>1 queries</summary>

- **What is the current recommended approach for data pipeline configuration?**
  - expected_found=2, expected_total=2, precision=1, recall=1, ranking_correct=1, ranking_total=1, ranking_accuracy=1, mises_expected_found=2, mises_expected_total=2, mises_accuracy=1, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=2171.343

</details>

### Format-aware Retrieval (V4.1)

| Metric | Value |
|---|---|
| `avg_recall` | 1 |
| `avg_precision` | 0.750 |
| `causal_chain_query_recall` | 1 |
| `latency_ms` | 2527.222 |

<details><summary>2 queries</summary>

- **Why did the latency incident occur?**
  - expected_found=1, expected_total=1, precision=0.500, recall=1, ranking_correct=0, ranking_total=0, ranking_accuracy=1, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=2288.059
- **What caused the settlement processing outage and what was the root regulatory constraint?**
  - expected_found=2, expected_total=2, precision=1, recall=1, ranking_correct=0, ranking_total=0, ranking_accuracy=1, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=2766.384

</details>

### Retrieval Lane Decomposition (V4.1)

> Degradation slope: -0.018519 precision@5 per 1K docs | Precision@5: 0.483 (100 docs) → 0.300 (10000 docs) | Fragility probe mean: 1.000 (100 docs) → 1.000 (10000 docs) — stable with scale

| Metric | Value |
|---|---|
| `scale_points` | [{"corpusSize":100,"precision5":0.4833333333333333,"recall5":0.95,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":1,"fragilityProbeCount":4,"latencyP50":2595.975843,"latencyP95":3503.25854},{"corpusSize":1000,"precision5":0.45,"recall5":0.85,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":0.75,"fragilityProbeCount":4,"latencyP50":2410.263395,"latencyP95":3552.312651},{"corpusSize":5000,"precision5":0.35,"recall5":0.65,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":1,"fragilityProbeCount":4,"latencyP50":2304.482119,"latencyP95":3402.565479},{"corpusSize":10000,"precision5":0.3,"recall5":0.55,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":1,"fragilityProbeCount":4,"latencyP50":2520.593751,"latencyP95":4294.071597}] |
| `degradation_slope_per_1k` | -0.019 |
| `baseline_precision5` | 0.483 |
| `final_precision5` | 0.300 |
| `baseline_recall5` | 0.950 |
| `final_recall5` | 0.550 |
| `baseline_fragility_probe` | 1 |
| `final_fragility_probe` | 1 |

### Temporal Reconstruction / Scale Degradation (V4.1)

> knowledge_state_cursor present in 3/3 receipts (CoreCrux event lineage active) | Temporal reconstruction endpoint not yet deployed (404) — Cat 4 uses artifact_living_state DB query as proxy

| Metric | Value |
|---|---|
| `reconstruction_accuracy` | 1 |
| `correct` | 54 |
| `total` | 54 |
| `receipts_generated` | 3 |
| `chains_verified` | 3 |
| `chains_intact` | 3 |
| `receipts_signed` | 0 |
| `db_chain_intact` | true |
| `knowledge_cursor_present` | 3 |

---

*Generated from [AuditCrux](https://github.com/CueCrux/AuditCrux) canonical results.*