# Canonical Run: `c85daff7`

| Field | Value |
|-------|-------|
| **Run ID** | `c85daff7` |
| **Suite** | v2 |
| **Embedding** | OpenAI |
| **Date** | 2026-03-11 |
| **Duration** | 20m 44s |
| **Pass Rate** | **12/12** |
| **Source** | `AuditCrux/results/v2-canonical.json` |

## Results by Category

| Category | V1 | V3.1 | V4.1 | Key Metric |
|---|---|---|---|---|
| Supersession / Relation-bootstrapped Retrieval | PASS | PASS | PASS | recall=0.833 |
| Format-aware Retrieval | PASS | PASS | PASS | — |
| Retrieval Lane Decomposition | PASS | PASS | PASS | — |
| Temporal Reconstruction / Scale Degradation | PASS | PASS | PASS | — |

## Detailed Metrics

### Supersession / Relation-bootstrapped Retrieval (V1)

> Missing expected docs: v2-ss-a2 | Ranking: v2-ss-a2 not in citations (expected above v2-ss-a1) | Fragility 0 outside expected range [0.3, 1] | Fragility 0 outside expected range [0.3, 1] | Fragility 0 outside expected range [0.3, 1] | Missing expected docs: v2-ss-a4 | Fragility 0 outside expected range [0.3, 1]

| Metric | Value |
|---|---|
| `avg_recall` | 0.833 |
| `avg_precision` | 0.444 |
| `avg_ranking_accuracy` | 0.900 |
| `query_count` | 6 |
| `latency_ms` | 4134.411 |

<details><summary>6 queries</summary>

- **What is the current data classification policy at Meridian?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, ranking_correct=1, ranking_total=2, ranking_accuracy=0.500, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=8024.092
- **What is the platform SLA availability target?**
  - expected_found=1, expected_total=1, precision=0.500, recall=1, ranking_correct=1, ranking_total=1, ranking_accuracy=1, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=4452.571
- **How many replicas does payment-service run in production?**
  - expected_found=1, expected_total=1, precision=0.333, recall=1, ranking_correct=1, ranking_total=1, ranking_accuracy=1, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=1345.532
- **What is the current incident response playbook?**
  - expected_found=1, expected_total=1, precision=0.500, recall=1, ranking_correct=2, ranking_total=2, ranking_accuracy=1, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=2647.785
- **What encryption standard is required for restricted data?**
  - expected_found=1, expected_total=2, precision=0.333, recall=0.500, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=2378.520
- **What is the evidence collection procedure for security incidents?**
  - expected_found=1, expected_total=1, precision=0.500, recall=1, ranking_correct=1, ranking_total=1, ranking_accuracy=1, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=5957.969

</details>

### Format-aware Retrieval (V1)

> Missing expected docs: v2-cc-1b | Fragility 0 outside expected range [0.3, 1] | Missing expected docs: v2-cc-1c | Missing expected docs: v2-cc-2a | Fragility 0 outside expected range [0.3, 1] | Missing expected docs: v2-cc-2d | Fragility 0 outside expected range [0.3, 1] | Fragility 0 outside expected range [0.3, 1] | Missing expected docs: v2-cc-5a | Fragility 0 outside expected range [0.3, 1] | Missing expected docs: v2-cc-2d | Missing expected docs: v2-cc-5c

| Metric | Value |
|---|---|
| `avg_recall` | 0.667 |
| `avg_precision` | 0.617 |
| `chain_recalls` | [0.5833333333333333,0.5,1,0.75,0.5] |
| `query_count` | 10 |
| `latency_ms` | 5276.657 |

<details><summary>10 queries</summary>

- **Why did payment-service SLA breach occur in October and how was it fixed?**
  - expected_found=2, expected_total=3, precision=0.667, recall=0.667, fragility_score=0, fragility_in_range=false, distinct_domains=3, latency_ms=4932.821
- **What is the connection pool sizing recommendation for payment-service?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=3949.541
- **What happened with the credential leak incident INC-2025-1247?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=7654.034
- **What security controls were implemented after the credential exposure?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=5626.918
- **What was the outcome of the Redis 6 to Redis 7 migration?**
  - expected_found=2, expected_total=2, precision=1, recall=1, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=4143.069
- **How was the database audit trail finding F-2025-001 remediated?**
  - expected_found=2, expected_total=2, precision=1, recall=1, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=7417.846
- **What caused the user-service latency degradation and what was the fix?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=3744.998
- **What is the N+1 query pattern issue in user-service?**
  - expected_found=1, expected_total=1, precision=0.500, recall=1, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=4106.847
- **What security changes were made at Meridian in 2025?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=7877.887
- **What performance improvements were achieved in the platform this year?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=3312.610

</details>

### Retrieval Lane Decomposition (V1)

> Degradation slope: -0.009543 precision@5 per 1K docs | Precision@5: 0.433 (550 docs) -> 0.200 (25000 docs)

| Metric | Value |
|---|---|
| `scale_points` | [{"corpusSize":550,"precision5":0.43333333333333335,"recall5":0.7,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":0,"fragilityProbeCount":5,"latencyP50":2757.593364,"latencyP95":8849.895229},{"corpusSize":1000,"precision5":0.43333333333333335,"recall5":0.7,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":0,"fragilityProbeCount":5,"latencyP50":2727.505859,"latencyP95":8850.683989},{"corpusSize":2500,"precision5":0.34444444444444444,"recall5":0.5333333333333333,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":0,"fragilityProbeCount":5,"latencyP50":1941.95704,"latencyP95":12736.770596},{"corpusSize":5000,"precision5":0.23333333333333334,"recall5":0.3333333333333333,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":0,"fragilityProbeCount":5,"latencyP50":1907.974862,"latencyP95":5817.968924},{"corpusSize":10000,"precision5":0.2,"recall5":0.3333333333333333,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":0,"fragilityProbeCount":5,"latencyP50":2087.823913,"latencyP95":3584.242321},{"corpusSize":25000,"precision5":0.2,"recall5":0.3333333333333333,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":0,"fragilityProbeCount":5,"latencyP50":1656.246732,"latencyP95":4474.394584}] |
| `degradation_slope_per_1k` | -0.010 |
| `baseline_precision5` | 0.433 |
| `final_precision5` | 0.200 |
| `baseline_recall5` | 0.700 |
| `final_recall5` | 0.333 |

### Temporal Reconstruction / Scale Degradation (V1)

> Skipped: V1 does not support temporal reconstruction

| Metric | Value |
|---|---|
| `skipped` | true |

### Supersession / Relation-bootstrapped Retrieval (V3.1)

> Missing expected docs: v2-ss-a2 | Ranking: v2-ss-a2 not in citations (expected above v2-ss-a1) | Fragility 0 outside expected range [0.3, 1] | Fragility 0 outside expected range [0.3, 1] | Fragility 0 outside expected range [0.3, 1] | Missing expected docs: v2-ss-a4, v2-ss-a2 | Fragility 0 outside expected range [0.3, 1]

| Metric | Value |
|---|---|
| `avg_recall` | 0.750 |
| `avg_precision` | 0.389 |
| `avg_ranking_accuracy` | 0.900 |
| `query_count` | 6 |
| `latency_ms` | 3032.264 |

<details><summary>6 queries</summary>

- **What is the current data classification policy at Meridian?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, ranking_correct=1, ranking_total=2, ranking_accuracy=0.500, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=4944.569
- **What is the platform SLA availability target?**
  - expected_found=1, expected_total=1, precision=0.500, recall=1, ranking_correct=1, ranking_total=1, ranking_accuracy=1, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=1752.281
- **How many replicas does payment-service run in production?**
  - expected_found=1, expected_total=1, precision=0.333, recall=1, ranking_correct=1, ranking_total=1, ranking_accuracy=1, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=1141.632
- **What is the current incident response playbook?**
  - expected_found=1, expected_total=1, precision=0.500, recall=1, ranking_correct=2, ranking_total=2, ranking_accuracy=1, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=3573.491
- **What encryption standard is required for restricted data?**
  - expected_found=0, expected_total=2, precision=0, recall=0, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=1625.848
- **What is the evidence collection procedure for security incidents?**
  - expected_found=1, expected_total=1, precision=0.500, recall=1, ranking_correct=1, ranking_total=1, ranking_accuracy=1, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=5155.764

</details>

### Format-aware Retrieval (V3.1)

> Missing expected docs: v2-cc-1b | Fragility 0 outside expected range [0.3, 1] | Missing expected docs: v2-cc-1c | Missing expected docs: v2-cc-2a | Fragility 0 outside expected range [0.3, 1] | Missing expected docs: v2-cc-2d | Fragility 0 outside expected range [0.3, 1] | Fragility 0 outside expected range [0.3, 1] | Missing expected docs: v2-cc-5a | Fragility 0 outside expected range [0.3, 1] | Missing expected docs: v2-cc-2d | Missing expected docs: v2-cc-5c

| Metric | Value |
|---|---|
| `avg_recall` | 0.667 |
| `avg_precision` | 0.617 |
| `chain_recalls` | [0.5833333333333333,0.5,1,0.75,0.5] |
| `query_count` | 10 |
| `latency_ms` | 5077.202 |

<details><summary>10 queries</summary>

- **Why did payment-service SLA breach occur in October and how was it fixed?**
  - expected_found=2, expected_total=3, precision=0.667, recall=0.667, fragility_score=0, fragility_in_range=false, distinct_domains=3, latency_ms=4903.378
- **What is the connection pool sizing recommendation for payment-service?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=5089.417
- **What happened with the credential leak incident INC-2025-1247?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=4507.856
- **What security controls were implemented after the credential exposure?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=7816.753
- **What was the outcome of the Redis 6 to Redis 7 migration?**
  - expected_found=2, expected_total=2, precision=1, recall=1, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=4577.873
- **How was the database audit trail finding F-2025-001 remediated?**
  - expected_found=2, expected_total=2, precision=1, recall=1, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=6960.362
- **What caused the user-service latency degradation and what was the fix?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=5097.523
- **What is the N+1 query pattern issue in user-service?**
  - expected_found=1, expected_total=1, precision=0.500, recall=1, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=3471.232
- **What security changes were made at Meridian in 2025?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=5904.372
- **What performance improvements were achieved in the platform this year?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=2443.258

</details>

### Retrieval Lane Decomposition (V3.1)

> Degradation slope: -0.012270 precision@5 per 1K docs | Precision@5: 0.433 (550 docs) -> 0.133 (25000 docs)

| Metric | Value |
|---|---|
| `scale_points` | [{"corpusSize":550,"precision5":0.43333333333333335,"recall5":0.7,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":0,"fragilityProbeCount":5,"latencyP50":2430.676865,"latencyP95":5479.490181},{"corpusSize":1000,"precision5":0.43333333333333335,"recall5":0.7,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":0,"fragilityProbeCount":5,"latencyP50":2304.616732,"latencyP95":5468.454722},{"corpusSize":2500,"precision5":0.36666666666666664,"recall5":0.6,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":0,"fragilityProbeCount":5,"latencyP50":1753.152432,"latencyP95":6011.542477},{"corpusSize":5000,"precision5":0.23333333333333334,"recall5":0.4,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":0,"fragilityProbeCount":5,"latencyP50":1659.824552,"latencyP95":3695.915079},{"corpusSize":10000,"precision5":0.3,"recall5":0.4666666666666667,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":0,"fragilityProbeCount":5,"latencyP50":1395.904973,"latencyP95":4695.301947},{"corpusSize":25000,"precision5":0.13333333333333333,"recall5":0.2,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":0,"fragilityProbeCount":5,"latencyP50":1272.808233,"latencyP95":4885.842878}] |
| `degradation_slope_per_1k` | -0.012 |
| `baseline_precision5` | 0.433 |
| `final_precision5` | 0.133 |
| `baseline_recall5` | 0.700 |
| `final_recall5` | 0.200 |

### Temporal Reconstruction / Scale Degradation (V3.1)

> T0+30d: v2-tr-e1 expected=active actual=superseded | T0+30d: v2-tr-d1 expected=contested actual=superseded | T0+75d: v2-tr-d1 expected=contested actual=superseded | T0+120d: v2-tr-a5 expected=active actual=superseded | T0+180d: v2-tr-d6 expected=active actual=missing | T0+270d: v2-tr-d8 expected=active actual=missing

| Metric | Value |
|---|---|
| `reconstruction_accuracy` | 0.966 |
| `correct` | 172 |
| `total` | 178 |
| `receipts_generated` | 3 |
| `chains_verified` | 3 |
| `chains_intact` | 3 |
| `receipts_signed` | 0 |
| `db_chain_intact` | true |

### Supersession / Relation-bootstrapped Retrieval (V4.1)

> Missing expected docs: v2-ss-a2 | Ranking: v2-ss-a2 not in citations (expected above v2-ss-a1) | Fragility 0 outside expected range [0.3, 1] | Fragility 0 outside expected range [0.3, 1] | Fragility 0 outside expected range [0.3, 1] | Missing expected docs: v2-ss-a4, v2-ss-a2 | Fragility 0 outside expected range [0.3, 1]

| Metric | Value |
|---|---|
| `avg_recall` | 0.750 |
| `avg_precision` | 0.389 |
| `avg_ranking_accuracy` | 0.900 |
| `query_count` | 6 |
| `latency_ms` | 2344.691 |

<details><summary>6 queries</summary>

- **What is the current data classification policy at Meridian?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, ranking_correct=1, ranking_total=2, ranking_accuracy=0.500, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=3544.967
- **What is the platform SLA availability target?**
  - expected_found=1, expected_total=1, precision=0.500, recall=1, ranking_correct=1, ranking_total=1, ranking_accuracy=1, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=1910.021
- **How many replicas does payment-service run in production?**
  - expected_found=1, expected_total=1, precision=0.333, recall=1, ranking_correct=1, ranking_total=1, ranking_accuracy=1, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=931.554
- **What is the current incident response playbook?**
  - expected_found=1, expected_total=1, precision=0.500, recall=1, ranking_correct=2, ranking_total=2, ranking_accuracy=1, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=3060.627
- **What encryption standard is required for restricted data?**
  - expected_found=0, expected_total=2, precision=0, recall=0, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=1269.059
- **What is the evidence collection procedure for security incidents?**
  - expected_found=1, expected_total=1, precision=0.500, recall=1, ranking_correct=1, ranking_total=1, ranking_accuracy=1, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=3351.916

</details>

### Format-aware Retrieval (V4.1)

> Missing expected docs: v2-cc-1b | Fragility 0 outside expected range [0.3, 1] | Missing expected docs: v2-cc-1c | Missing expected docs: v2-cc-2a | Fragility 0 outside expected range [0.3, 1] | Missing expected docs: v2-cc-2d | Missing expected docs: v2-cc-3a | Fragility 0 outside expected range [0.3, 1] | Fragility 0 outside expected range [0.3, 1] | Missing expected docs: v2-cc-5a | Fragility 0 outside expected range [0.3, 1] | Missing expected docs: v2-cc-2d | Missing expected docs: v2-cc-5c

| Metric | Value |
|---|---|
| `avg_recall` | 0.617 |
| `avg_precision` | 0.567 |
| `chain_recalls` | [0.5833333333333333,0.5,0.75,0.75,0.5] |
| `query_count` | 10 |
| `latency_ms` | 5140.549 |

<details><summary>10 queries</summary>

- **Why did payment-service SLA breach occur in October and how was it fixed?**
  - expected_found=2, expected_total=3, precision=0.667, recall=0.667, fragility_score=0, fragility_in_range=false, distinct_domains=3, latency_ms=4163.977
- **What is the connection pool sizing recommendation for payment-service?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=3156.553
- **What happened with the credential leak incident INC-2025-1247?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=5998.161
- **What security controls were implemented after the credential exposure?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=9405.014
- **What was the outcome of the Redis 6 to Redis 7 migration?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=4071.507
- **How was the database audit trail finding F-2025-001 remediated?**
  - expected_found=2, expected_total=2, precision=1, recall=1, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=6053.669
- **What caused the user-service latency degradation and what was the fix?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=3925.057
- **What is the N+1 query pattern issue in user-service?**
  - expected_found=1, expected_total=1, precision=0.500, recall=1, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=4852.112
- **What security changes were made at Meridian in 2025?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=6380.329
- **What performance improvements were achieved in the platform this year?**
  - expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=3399.107

</details>

### Retrieval Lane Decomposition (V4.1)

> Degradation slope: -0.008180 precision@5 per 1K docs | Precision@5: 0.433 (550 docs) -> 0.233 (25000 docs)

| Metric | Value |
|---|---|
| `scale_points` | [{"corpusSize":550,"precision5":0.43333333333333335,"recall5":0.7,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":0,"fragilityProbeCount":5,"latencyP50":2069.421712,"latencyP95":6090.067995},{"corpusSize":1000,"precision5":0.43333333333333335,"recall5":0.7,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":0,"fragilityProbeCount":5,"latencyP50":2144.965646,"latencyP95":4317.516462},{"corpusSize":2500,"precision5":0.4,"recall5":0.6333333333333333,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":0,"fragilityProbeCount":5,"latencyP50":1685.058013,"latencyP95":4427.811993},{"corpusSize":5000,"precision5":0.3,"recall5":0.4666666666666667,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":0,"fragilityProbeCount":5,"latencyP50":1403.425784,"latencyP95":4948.372324},{"corpusSize":10000,"precision5":0.3,"recall5":0.4666666666666667,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":0,"fragilityProbeCount":5,"latencyP50":1262.74275,"latencyP95":4770.392287},{"corpusSize":25000,"precision5":0.23333333333333334,"recall5":0.36666666666666664,"misesJaccard":1,"fragilityMean":0,"fragilityProbeMean":0,"fragilityProbeCount":5,"latencyP50":1524.504863,"latencyP95":3445.544908}] |
| `degradation_slope_per_1k` | -0.008 |
| `baseline_precision5` | 0.433 |
| `final_precision5` | 0.233 |
| `baseline_recall5` | 0.700 |
| `final_recall5` | 0.367 |

### Temporal Reconstruction / Scale Degradation (V4.1)

> T0+30d: v2-tr-e1 expected=active actual=superseded | T0+30d: v2-tr-d1 expected=contested actual=superseded | T0+75d: v2-tr-d1 expected=contested actual=superseded | T0+120d: v2-tr-a5 expected=active actual=superseded | T0+180d: v2-tr-d6 expected=active actual=missing | T0+270d: v2-tr-d8 expected=active actual=missing

| Metric | Value |
|---|---|
| `reconstruction_accuracy` | 0.966 |
| `correct` | 172 |
| `total` | 178 |
| `receipts_generated` | 3 |
| `chains_verified` | 3 |
| `chains_intact` | 3 |
| `receipts_signed` | 0 |
| `db_chain_intact` | true |

---

*Generated from [AuditCrux](https://github.com/CueCrux/AuditCrux) canonical results.*