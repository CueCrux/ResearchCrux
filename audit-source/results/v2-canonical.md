# Retrieval Quality Audit v2 — Enterprise Corpus Report

**Run ID:** c85daff7
**Started:** 2026-03-11T02:03:50.973Z
**Finished:** 2026-03-11T02:24:35.343Z
**Host:** unknown
**Corpus:** Meridian Financial Services (enterprise, heterogeneous MIME)

## Mode: V1

### Supersession Accuracy (20 docs, 4 chains)

**Passed:** YES

| Metric | Value |
|--------|-------|
| avg_recall | 0.8333 |
| avg_precision | 0.4444 |
| avg_ranking_accuracy | 0.9000 |
| query_count | 6 |
| latency_ms | 4134.4114 |

#### Query Details

**Query:** "What is the current data classification policy at Meridian?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, ranking_correct=1, ranking_total=2, ranking_accuracy=0.500, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=8024.092
- Missing expected docs: v2-ss-a2
- Ranking: v2-ss-a2 not in citations (expected above v2-ss-a1)
- Fragility 0 outside expected range [0.3, 1]

**Query:** "What is the platform SLA availability target?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, ranking_correct=1, ranking_total=1, ranking_accuracy=1, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=4452.571
- Fragility 0 outside expected range [0.3, 1]

**Query:** "How many replicas does payment-service run in production?"

Metrics: expected_found=1, expected_total=1, precision=0.333, recall=1, ranking_correct=1, ranking_total=1, ranking_accuracy=1, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=1345.532

**Query:** "What is the current incident response playbook?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, ranking_correct=2, ranking_total=2, ranking_accuracy=1, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=2647.785
- Fragility 0 outside expected range [0.3, 1]

**Query:** "What encryption standard is required for restricted data?"

Metrics: expected_found=1, expected_total=2, precision=0.333, recall=0.500, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=2378.520
- Missing expected docs: v2-ss-a4

**Query:** "What is the evidence collection procedure for security incidents?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, ranking_correct=1, ranking_total=1, ranking_accuracy=1, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=5957.969
- Fragility 0 outside expected range [0.3, 1]

#### Notes
- Missing expected docs: v2-ss-a2
- Ranking: v2-ss-a2 not in citations (expected above v2-ss-a1)
- Fragility 0 outside expected range [0.3, 1]
- Fragility 0 outside expected range [0.3, 1]
- Fragility 0 outside expected range [0.3, 1]
- Missing expected docs: v2-ss-a4
- Fragility 0 outside expected range [0.3, 1]

### Causal Chain Retrieval (25 docs, 5 chains)

**Passed:** YES

| Metric | Value |
|--------|-------|
| avg_recall | 0.6667 |
| avg_precision | 0.6167 |
| query_count | 10 |
| latency_ms | 5276.6570 |

#### Query Details

**Query:** "Why did payment-service SLA breach occur in October and how was it fixed?"

Metrics: expected_found=2, expected_total=3, precision=0.667, recall=0.667, fragility_score=0, fragility_in_range=false, distinct_domains=3, latency_ms=4932.821
- Missing expected docs: v2-cc-1b
- Fragility 0 outside expected range [0.3, 1]

**Query:** "What is the connection pool sizing recommendation for payment-service?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=3949.541
- Missing expected docs: v2-cc-1c

**Query:** "What happened with the credential leak incident INC-2025-1247?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=7654.034
- Missing expected docs: v2-cc-2a
- Fragility 0 outside expected range [0.3, 1]

**Query:** "What security controls were implemented after the credential exposure?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=5626.918
- Missing expected docs: v2-cc-2d

**Query:** "What was the outcome of the Redis 6 to Redis 7 migration?"

Metrics: expected_found=2, expected_total=2, precision=1, recall=1, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=4143.069
- Fragility 0 outside expected range [0.3, 1]

**Query:** "How was the database audit trail finding F-2025-001 remediated?"

Metrics: expected_found=2, expected_total=2, precision=1, recall=1, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=7417.846
- Fragility 0 outside expected range [0.3, 1]

**Query:** "What caused the user-service latency degradation and what was the fix?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=3744.998
- Missing expected docs: v2-cc-5a
- Fragility 0 outside expected range [0.3, 1]

**Query:** "What is the N+1 query pattern issue in user-service?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=4106.847

**Query:** "What security changes were made at Meridian in 2025?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=7877.887
- Missing expected docs: v2-cc-2d

**Query:** "What performance improvements were achieved in the platform this year?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=3312.610
- Missing expected docs: v2-cc-5c

#### Notes
- Missing expected docs: v2-cc-1b
- Fragility 0 outside expected range [0.3, 1]
- Missing expected docs: v2-cc-1c
- Missing expected docs: v2-cc-2a
- Fragility 0 outside expected range [0.3, 1]
- Missing expected docs: v2-cc-2d
- Fragility 0 outside expected range [0.3, 1]
- Fragility 0 outside expected range [0.3, 1]
- Missing expected docs: v2-cc-5a
- Fragility 0 outside expected range [0.3, 1]
- Missing expected docs: v2-cc-2d
- Missing expected docs: v2-cc-5c

### Corpus Degradation (550 base + noise to 25K)

**Passed:** YES

| Metric | Value |
|--------|-------|
| degradation_slope_per_1k | -0.0095 |
| baseline_precision5 | 0.4333 |
| final_precision5 | 0.2000 |
| baseline_recall5 | 0.7000 |
| final_recall5 | 0.3333 |

#### Degradation Curve

| Corpus Size | Precision@5 | Recall@5 | MiSES Jaccard | Fragility Probe | Latency P50 | Latency P95 |
|---:|---:|---:|---:|---:|---:|---:|
| 550 | 0.433 | 0.700 | 1.000 | 0.000 | 2757.593364ms | 8849.895229ms |
| 1000 | 0.433 | 0.700 | 1.000 | 0.000 | 2727.505859ms | 8850.683989ms |
| 2500 | 0.344 | 0.533 | 1.000 | 0.000 | 1941.95704ms | 12736.770596ms |
| 5000 | 0.233 | 0.333 | 1.000 | 0.000 | 1907.974862ms | 5817.968924ms |
| 10000 | 0.200 | 0.333 | 1.000 | 0.000 | 2087.823913ms | 3584.242321ms |
| 25000 | 0.200 | 0.333 | 1.000 | 0.000 | 1656.246732ms | 4474.394584ms |

#### Notes
- Degradation slope: -0.009543 precision@5 per 1K docs
- Precision@5: 0.433 (550 docs) -> 0.200 (25000 docs)

### Temporal Reconstruction (60 docs, 6 lifecycles)

**Passed:** YES

| Metric | Value |
|--------|-------|
| skipped | true |

#### Notes
- Skipped: V1 does not support temporal reconstruction

## Mode: V3.1

### Supersession Accuracy (20 docs, 4 chains)

**Passed:** YES

| Metric | Value |
|--------|-------|
| avg_recall | 0.7500 |
| avg_precision | 0.3889 |
| avg_ranking_accuracy | 0.9000 |
| query_count | 6 |
| latency_ms | 3032.2641 |

#### Query Details

**Query:** "What is the current data classification policy at Meridian?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, ranking_correct=1, ranking_total=2, ranking_accuracy=0.500, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=4944.569
- Missing expected docs: v2-ss-a2
- Ranking: v2-ss-a2 not in citations (expected above v2-ss-a1)
- Fragility 0 outside expected range [0.3, 1]

**Query:** "What is the platform SLA availability target?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, ranking_correct=1, ranking_total=1, ranking_accuracy=1, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=1752.281
- Fragility 0 outside expected range [0.3, 1]

**Query:** "How many replicas does payment-service run in production?"

Metrics: expected_found=1, expected_total=1, precision=0.333, recall=1, ranking_correct=1, ranking_total=1, ranking_accuracy=1, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=1141.632

**Query:** "What is the current incident response playbook?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, ranking_correct=2, ranking_total=2, ranking_accuracy=1, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=3573.491
- Fragility 0 outside expected range [0.3, 1]

**Query:** "What encryption standard is required for restricted data?"

Metrics: expected_found=0, expected_total=2, precision=0, recall=0, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=1625.848
- Missing expected docs: v2-ss-a4, v2-ss-a2

**Query:** "What is the evidence collection procedure for security incidents?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, ranking_correct=1, ranking_total=1, ranking_accuracy=1, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=5155.764
- Fragility 0 outside expected range [0.3, 1]

#### Notes
- Missing expected docs: v2-ss-a2
- Ranking: v2-ss-a2 not in citations (expected above v2-ss-a1)
- Fragility 0 outside expected range [0.3, 1]
- Fragility 0 outside expected range [0.3, 1]
- Fragility 0 outside expected range [0.3, 1]
- Missing expected docs: v2-ss-a4, v2-ss-a2
- Fragility 0 outside expected range [0.3, 1]

### Causal Chain Retrieval (25 docs, 5 chains)

**Passed:** YES

| Metric | Value |
|--------|-------|
| avg_recall | 0.6667 |
| avg_precision | 0.6167 |
| query_count | 10 |
| latency_ms | 5077.2024 |

#### Query Details

**Query:** "Why did payment-service SLA breach occur in October and how was it fixed?"

Metrics: expected_found=2, expected_total=3, precision=0.667, recall=0.667, fragility_score=0, fragility_in_range=false, distinct_domains=3, latency_ms=4903.378
- Missing expected docs: v2-cc-1b
- Fragility 0 outside expected range [0.3, 1]

**Query:** "What is the connection pool sizing recommendation for payment-service?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=5089.417
- Missing expected docs: v2-cc-1c

**Query:** "What happened with the credential leak incident INC-2025-1247?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=4507.856
- Missing expected docs: v2-cc-2a
- Fragility 0 outside expected range [0.3, 1]

**Query:** "What security controls were implemented after the credential exposure?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=7816.753
- Missing expected docs: v2-cc-2d

**Query:** "What was the outcome of the Redis 6 to Redis 7 migration?"

Metrics: expected_found=2, expected_total=2, precision=1, recall=1, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=4577.873
- Fragility 0 outside expected range [0.3, 1]

**Query:** "How was the database audit trail finding F-2025-001 remediated?"

Metrics: expected_found=2, expected_total=2, precision=1, recall=1, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=6960.362
- Fragility 0 outside expected range [0.3, 1]

**Query:** "What caused the user-service latency degradation and what was the fix?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=5097.523
- Missing expected docs: v2-cc-5a
- Fragility 0 outside expected range [0.3, 1]

**Query:** "What is the N+1 query pattern issue in user-service?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=3471.232

**Query:** "What security changes were made at Meridian in 2025?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=5904.372
- Missing expected docs: v2-cc-2d

**Query:** "What performance improvements were achieved in the platform this year?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=2443.258
- Missing expected docs: v2-cc-5c

#### Notes
- Missing expected docs: v2-cc-1b
- Fragility 0 outside expected range [0.3, 1]
- Missing expected docs: v2-cc-1c
- Missing expected docs: v2-cc-2a
- Fragility 0 outside expected range [0.3, 1]
- Missing expected docs: v2-cc-2d
- Fragility 0 outside expected range [0.3, 1]
- Fragility 0 outside expected range [0.3, 1]
- Missing expected docs: v2-cc-5a
- Fragility 0 outside expected range [0.3, 1]
- Missing expected docs: v2-cc-2d
- Missing expected docs: v2-cc-5c

### Corpus Degradation (550 base + noise to 25K)

**Passed:** YES

| Metric | Value |
|--------|-------|
| degradation_slope_per_1k | -0.0123 |
| baseline_precision5 | 0.4333 |
| final_precision5 | 0.1333 |
| baseline_recall5 | 0.7000 |
| final_recall5 | 0.2000 |

#### Degradation Curve

| Corpus Size | Precision@5 | Recall@5 | MiSES Jaccard | Fragility Probe | Latency P50 | Latency P95 |
|---:|---:|---:|---:|---:|---:|---:|
| 550 | 0.433 | 0.700 | 1.000 | 0.000 | 2430.676865ms | 5479.490181ms |
| 1000 | 0.433 | 0.700 | 1.000 | 0.000 | 2304.616732ms | 5468.454722ms |
| 2500 | 0.367 | 0.600 | 1.000 | 0.000 | 1753.152432ms | 6011.542477ms |
| 5000 | 0.233 | 0.400 | 1.000 | 0.000 | 1659.824552ms | 3695.915079ms |
| 10000 | 0.300 | 0.467 | 1.000 | 0.000 | 1395.904973ms | 4695.301947ms |
| 25000 | 0.133 | 0.200 | 1.000 | 0.000 | 1272.808233ms | 4885.842878ms |

#### Notes
- Degradation slope: -0.012270 precision@5 per 1K docs
- Precision@5: 0.433 (550 docs) -> 0.133 (25000 docs)

### Temporal Reconstruction (60 docs, 6 lifecycles)

**Passed:** YES

| Metric | Value |
|--------|-------|
| reconstruction_accuracy | 0.9663 |
| correct | 172 |
| total | 178 |
| receipts_generated | 3 |
| chains_verified | 3 |
| chains_intact | 3 |
| receipts_signed | 0 |
| db_chain_intact | true |

#### Notes
- T0+30d: v2-tr-e1 expected=active actual=superseded
- T0+30d: v2-tr-d1 expected=contested actual=superseded
- T0+75d: v2-tr-d1 expected=contested actual=superseded
- T0+120d: v2-tr-a5 expected=active actual=superseded
- T0+180d: v2-tr-d6 expected=active actual=missing
- T0+270d: v2-tr-d8 expected=active actual=missing

## Mode: V4.1

### Supersession Accuracy (20 docs, 4 chains)

**Passed:** YES

| Metric | Value |
|--------|-------|
| avg_recall | 0.7500 |
| avg_precision | 0.3889 |
| avg_ranking_accuracy | 0.9000 |
| query_count | 6 |
| latency_ms | 2344.6906 |

#### Query Details

**Query:** "What is the current data classification policy at Meridian?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, ranking_correct=1, ranking_total=2, ranking_accuracy=0.500, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=3544.967
- Missing expected docs: v2-ss-a2
- Ranking: v2-ss-a2 not in citations (expected above v2-ss-a1)
- Fragility 0 outside expected range [0.3, 1]

**Query:** "What is the platform SLA availability target?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, ranking_correct=1, ranking_total=1, ranking_accuracy=1, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=1910.021
- Fragility 0 outside expected range [0.3, 1]

**Query:** "How many replicas does payment-service run in production?"

Metrics: expected_found=1, expected_total=1, precision=0.333, recall=1, ranking_correct=1, ranking_total=1, ranking_accuracy=1, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=931.554

**Query:** "What is the current incident response playbook?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, ranking_correct=2, ranking_total=2, ranking_accuracy=1, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=3060.627
- Fragility 0 outside expected range [0.3, 1]

**Query:** "What encryption standard is required for restricted data?"

Metrics: expected_found=0, expected_total=2, precision=0, recall=0, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=1269.059
- Missing expected docs: v2-ss-a4, v2-ss-a2

**Query:** "What is the evidence collection procedure for security incidents?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, ranking_correct=1, ranking_total=1, ranking_accuracy=1, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=3351.916
- Fragility 0 outside expected range [0.3, 1]

#### Notes
- Missing expected docs: v2-ss-a2
- Ranking: v2-ss-a2 not in citations (expected above v2-ss-a1)
- Fragility 0 outside expected range [0.3, 1]
- Fragility 0 outside expected range [0.3, 1]
- Fragility 0 outside expected range [0.3, 1]
- Missing expected docs: v2-ss-a4, v2-ss-a2
- Fragility 0 outside expected range [0.3, 1]

### Causal Chain Retrieval (25 docs, 5 chains)

**Passed:** YES

| Metric | Value |
|--------|-------|
| avg_recall | 0.6167 |
| avg_precision | 0.5667 |
| query_count | 10 |
| latency_ms | 5140.5486 |

#### Query Details

**Query:** "Why did payment-service SLA breach occur in October and how was it fixed?"

Metrics: expected_found=2, expected_total=3, precision=0.667, recall=0.667, fragility_score=0, fragility_in_range=false, distinct_domains=3, latency_ms=4163.977
- Missing expected docs: v2-cc-1b
- Fragility 0 outside expected range [0.3, 1]

**Query:** "What is the connection pool sizing recommendation for payment-service?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=3156.553
- Missing expected docs: v2-cc-1c

**Query:** "What happened with the credential leak incident INC-2025-1247?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=5998.161
- Missing expected docs: v2-cc-2a
- Fragility 0 outside expected range [0.3, 1]

**Query:** "What security controls were implemented after the credential exposure?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=9405.014
- Missing expected docs: v2-cc-2d

**Query:** "What was the outcome of the Redis 6 to Redis 7 migration?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=4071.507
- Missing expected docs: v2-cc-3a
- Fragility 0 outside expected range [0.3, 1]

**Query:** "How was the database audit trail finding F-2025-001 remediated?"

Metrics: expected_found=2, expected_total=2, precision=1, recall=1, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=6053.669
- Fragility 0 outside expected range [0.3, 1]

**Query:** "What caused the user-service latency degradation and what was the fix?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=false, distinct_domains=2, latency_ms=3925.057
- Missing expected docs: v2-cc-5a
- Fragility 0 outside expected range [0.3, 1]

**Query:** "What is the N+1 query pattern issue in user-service?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=4852.112

**Query:** "What security changes were made at Meridian in 2025?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=6380.329
- Missing expected docs: v2-cc-2d

**Query:** "What performance improvements were achieved in the platform this year?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=3399.107
- Missing expected docs: v2-cc-5c

#### Notes
- Missing expected docs: v2-cc-1b
- Fragility 0 outside expected range [0.3, 1]
- Missing expected docs: v2-cc-1c
- Missing expected docs: v2-cc-2a
- Fragility 0 outside expected range [0.3, 1]
- Missing expected docs: v2-cc-2d
- Missing expected docs: v2-cc-3a
- Fragility 0 outside expected range [0.3, 1]
- Fragility 0 outside expected range [0.3, 1]
- Missing expected docs: v2-cc-5a
- Fragility 0 outside expected range [0.3, 1]
- Missing expected docs: v2-cc-2d
- Missing expected docs: v2-cc-5c

### Corpus Degradation (550 base + noise to 25K)

**Passed:** YES

| Metric | Value |
|--------|-------|
| degradation_slope_per_1k | -0.0082 |
| baseline_precision5 | 0.4333 |
| final_precision5 | 0.2333 |
| baseline_recall5 | 0.7000 |
| final_recall5 | 0.3667 |

#### Degradation Curve

| Corpus Size | Precision@5 | Recall@5 | MiSES Jaccard | Fragility Probe | Latency P50 | Latency P95 |
|---:|---:|---:|---:|---:|---:|---:|
| 550 | 0.433 | 0.700 | 1.000 | 0.000 | 2069.421712ms | 6090.067995ms |
| 1000 | 0.433 | 0.700 | 1.000 | 0.000 | 2144.965646ms | 4317.516462ms |
| 2500 | 0.400 | 0.633 | 1.000 | 0.000 | 1685.058013ms | 4427.811993ms |
| 5000 | 0.300 | 0.467 | 1.000 | 0.000 | 1403.425784ms | 4948.372324ms |
| 10000 | 0.300 | 0.467 | 1.000 | 0.000 | 1262.74275ms | 4770.392287ms |
| 25000 | 0.233 | 0.367 | 1.000 | 0.000 | 1524.504863ms | 3445.544908ms |

#### Notes
- Degradation slope: -0.008180 precision@5 per 1K docs
- Precision@5: 0.433 (550 docs) -> 0.233 (25000 docs)

### Temporal Reconstruction (60 docs, 6 lifecycles)

**Passed:** YES

| Metric | Value |
|--------|-------|
| reconstruction_accuracy | 0.9663 |
| correct | 172 |
| total | 178 |
| receipts_generated | 3 |
| chains_verified | 3 |
| chains_intact | 3 |
| receipts_signed | 0 |
| db_chain_intact | true |

#### Notes
- T0+30d: v2-tr-e1 expected=active actual=superseded
- T0+30d: v2-tr-d1 expected=contested actual=superseded
- T0+75d: v2-tr-d1 expected=contested actual=superseded
- T0+120d: v2-tr-a5 expected=active actual=superseded
- T0+180d: v2-tr-d6 expected=active actual=missing
- T0+270d: v2-tr-d8 expected=active actual=missing

## Cross-Mode Comparison

| Finding | Value |
|---------|-------|
| supersession improvement v41 vs v1 | recall 0.833 -> 0.750 |
| causal completeness improvement | avg_recall 0.667 -> 0.617 |
| degradation slope v1 | -0.00954328561690525 |
| degradation slope v41 | -0.0081799591002045 |
