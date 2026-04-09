# Retrieval Quality Audit v2 — Enterprise Corpus Report

**Run ID:** 5b125495
**Started:** 2026-03-12T01:12:40.773Z
**Finished:** 2026-03-12T01:31:19.100Z
**Host:** unknown
**Corpus:** Meridian Financial Services (enterprise, heterogeneous MIME)

## Mode: V1

### Supersession Accuracy (20 docs, 4 chains)

**Passed:** YES

| Metric | Value |
|--------|-------|
| avg_recall | 0.8333 |
| avg_precision | 0.4722 |
| avg_ranking_accuracy | 0.9000 |
| query_count | 6 |
| latency_ms | 2250.9009 |

#### Query Details

**Query:** "What is the current data classification policy at Meridian?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v2-ss-a1,v2-ss-a2,v2-ss-a4,v2-ss-d1,v2-ss-a3,v2-ss-c4,v2-ss-c5,v2-ss-b3,v2-ss-d5,v2-ss-c2, ranking_correct=1, ranking_total=2, ranking_accuracy=0.500, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=2445.792
- Missing expected docs: v2-ss-a4
- Ranking: v2-ss-a4 not in citations (expected above v2-ss-a1)

**Query:** "What is the platform SLA availability target?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, retrieved_ids=v2-ss-c2,v2-ss-c3,v2-ss-c5,v2-ss-c1,v2-ss-c4,v2-ss-b3,v2-ss-b5,v2-ss-a4,v2-ss-d5,v2-ss-d4, ranking_correct=1, ranking_total=1, ranking_accuracy=1, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=1538.683

**Query:** "How many replicas does payment-service run in production?"

Metrics: expected_found=1, expected_total=1, precision=0.333, recall=1, retrieved_found=1, retrieved_recall=1, retrieved_ids=v2-ss-b3,v2-ss-b4,v2-ss-b1,v2-ss-b5,v2-ss-c1,v2-ss-d5,v2-ss-b2,v2-ss-c2,v2-ss-d4,v2-ss-c5, ranking_correct=1, ranking_total=1, ranking_accuracy=1, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=1184.041

**Query:** "What is the current incident response playbook?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, retrieved_ids=v2-ss-d2,v2-ss-d5,v2-ss-d1,v2-ss-d4,v2-ss-d3,v2-ss-c5,v2-ss-c1,v2-ss-c2,v2-ss-c3,v2-ss-b5, ranking_correct=2, ranking_total=2, ranking_accuracy=1, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=3323.004

**Query:** "What encryption standard is required for restricted data?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v2-ss-a1,v2-ss-a2,v2-ss-a4,v2-ss-a3,v2-ss-a5,v2-ss-c2,v2-ss-d3,v2-ss-d5,v2-ss-c4,v2-ss-b3, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=1652.623
- Missing expected docs: v2-ss-a4

**Query:** "What is the evidence collection procedure for security incidents?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, retrieved_ids=v2-ss-d5,v2-ss-d1,v2-ss-d2,v2-ss-d3,v2-ss-d4,v2-ss-a2,v2-ss-c3,v2-ss-c5,v2-ss-c1,v2-ss-b5, ranking_correct=1, ranking_total=1, ranking_accuracy=1, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=3361.263

#### Notes
- Missing expected docs: v2-ss-a4
- Ranking: v2-ss-a4 not in citations (expected above v2-ss-a1)
- Missing expected docs: v2-ss-a4

### Causal Chain Retrieval (25 docs, 5 chains)

**Passed:** YES

| Metric | Value |
|--------|-------|
| avg_recall | 0.6167 |
| avg_precision | 0.5667 |
| query_count | 10 |
| latency_ms | 4065.0138 |

#### Query Details

**Query:** "Why did payment-service SLA breach occur in October and how was it fixed?"

Metrics: expected_found=2, expected_total=3, precision=0.667, recall=0.667, retrieved_found=3, retrieved_recall=1, retrieved_ids=v2-cc-1a,v2-cc-1b,v2-cc-1e,v2-cc-2b,v2-cc-5c,v2-cc-1d,v2-cc-2a,v2-cc-4a,v2-cc-5e,v2-cc-3e, fragility_score=0, fragility_in_range=false, distinct_domains=3, latency_ms=3823.449
- Missing expected docs: v2-cc-1b
- Fragility 0 outside expected range [0.3, 1]

**Query:** "What is the connection pool sizing recommendation for payment-service?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v2-cc-1d,v2-cc-1e,v2-cc-1b,v2-cc-1c,v2-cc-5d,v2-cc-5c,v2-cc-5a,v2-cc-4e,v2-cc-5e,v2-cc-2a, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=4049.495
- Missing expected docs: v2-cc-1c

**Query:** "What happened with the credential leak incident INC-2025-1247?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v2-cc-2b,v2-cc-2a,v2-cc-4b,v2-cc-4e,v2-cc-4a,v2-cc-4c,v2-cc-3e,v2-cc-2e,v2-cc-5a,v2-cc-5e, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=3338.809
- Missing expected docs: v2-cc-2a

**Query:** "What security controls were implemented after the credential exposure?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=1, retrieved_recall=0.500, retrieved_ids=v2-cc-2b,v2-cc-2a,v2-cc-2e,v2-cc-4e,v2-cc-4a,v2-cc-4b,v2-cc-4c,v2-cc-3e,v2-cc-5e,v2-cc-1e, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=4107.144
- Missing expected docs: v2-cc-2d

**Query:** "What was the outcome of the Redis 6 to Redis 7 migration?"

Metrics: expected_found=2, expected_total=2, precision=1, recall=1, retrieved_found=2, retrieved_recall=1, retrieved_ids=v2-cc-3a,v2-cc-3e,v2-cc-3d,v2-cc-3c,v2-cc-4b,v2-cc-2b,v2-cc-4e,v2-cc-3b,v2-cc-5a,v2-cc-5e, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=3177.895

**Query:** "How was the database audit trail finding F-2025-001 remediated?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v2-cc-4c,v2-cc-4b,v2-cc-4a,v2-cc-2b,v2-cc-4d,v2-cc-2a,v2-cc-4e,v2-cc-3e,v2-cc-5e,v2-cc-1e, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=3254.307
- Missing expected docs: v2-cc-4c

**Query:** "What caused the user-service latency degradation and what was the fix?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v2-cc-5c,v2-cc-5e,v2-cc-5b,v2-cc-5a,v2-cc-1b,v2-cc-1e,v2-cc-3c,v2-cc-1a,v2-cc-5d,v2-cc-2b, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=5298.931
- Missing expected docs: v2-cc-5a

**Query:** "What is the N+1 query pattern issue in user-service?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, retrieved_ids=v2-cc-5c,v2-cc-5e,v2-cc-5d,v2-cc-5b,v2-cc-1b,v2-cc-1c,v2-cc-5a,v2-cc-1d,v2-cc-4e,v2-cc-2a, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=3861.227

**Query:** "What security changes were made at Meridian in 2025?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=1, retrieved_recall=0.500, retrieved_ids=v2-cc-2a,v2-cc-2b,v2-cc-4b,v2-cc-3e,v2-cc-4a,v2-cc-3a,v2-cc-3d,v2-cc-4e,v2-cc-5a,v2-cc-5e, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=4889.558
- Missing expected docs: v2-cc-2d

**Query:** "What performance improvements were achieved in the platform this year?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=1, retrieved_recall=0.500, retrieved_ids=v2-cc-5a,v2-cc-5b,v2-cc-3c,v2-cc-1e,v2-cc-3e,v2-cc-1a,v2-cc-3d,v2-cc-5e,v2-cc-3a,v2-cc-2b, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=4849.324
- Missing expected docs: v2-cc-5c

#### Notes
- Missing expected docs: v2-cc-1b
- Fragility 0 outside expected range [0.3, 1]
- Missing expected docs: v2-cc-1c
- Missing expected docs: v2-cc-2a
- Missing expected docs: v2-cc-2d
- Missing expected docs: v2-cc-4c
- Missing expected docs: v2-cc-5a
- Missing expected docs: v2-cc-2d
- Missing expected docs: v2-cc-5c

### Corpus Degradation (550 base + noise to 25K)

**Passed:** YES

| Metric | Value |
|--------|-------|
| degradation_slope_per_1k | -0.0109 |
| baseline_precision5 | 0.5000 |
| final_precision5 | 0.2333 |
| baseline_recall5 | 0.7667 |
| final_recall5 | 0.3333 |

#### Degradation Curve

| Corpus Size | Precision@5 | Recall@5 | MiSES Jaccard | Fragility Probe | Latency P50 | Latency P95 |
|---:|---:|---:|---:|---:|---:|---:|
| 550 | 0.500 | 0.767 | 1.000 | 1.000 | 2463.504496ms | 4207.05303ms |
| 1000 | 0.467 | 0.700 | 1.000 | 1.000 | 2158.781483ms | 4737.108732ms |
| 2500 | 0.367 | 0.567 | 1.000 | 1.000 | 1494.201334ms | 5266.234238ms |
| 5000 | 0.367 | 0.567 | 1.000 | 1.000 | 1543.358368ms | 4586.421769ms |
| 10000 | 0.167 | 0.233 | 1.000 | 1.000 | 1659.735353ms | 2516.316424ms |
| 25000 | 0.233 | 0.333 | 1.000 | 1.000 | 1397.745539ms | 3144.590626ms |

#### Notes
- Degradation slope: -0.010907 precision@5 per 1K docs
- Precision@5: 0.500 (550 docs) -> 0.233 (25000 docs)

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
| avg_recall | 0.8333 |
| avg_precision | 0.4722 |
| avg_ranking_accuracy | 0.9000 |
| query_count | 6 |
| latency_ms | 2527.2920 |

#### Query Details

**Query:** "What is the current data classification policy at Meridian?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v2-ss-a1,v2-ss-a2,v2-ss-a4,v2-ss-d1,v2-ss-a3,v2-ss-c4,v2-ss-c5,v2-ss-b3,v2-ss-d5,v2-ss-c2, ranking_correct=1, ranking_total=2, ranking_accuracy=0.500, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=2474.100
- Missing expected docs: v2-ss-a4
- Ranking: v2-ss-a4 not in citations (expected above v2-ss-a1)

**Query:** "What is the platform SLA availability target?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, retrieved_ids=v2-ss-c2,v2-ss-c3,v2-ss-c5,v2-ss-c1,v2-ss-c4,v2-ss-b3,v2-ss-b5,v2-ss-a4,v2-ss-d5,v2-ss-d4, ranking_correct=1, ranking_total=1, ranking_accuracy=1, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=1713.761

**Query:** "How many replicas does payment-service run in production?"

Metrics: expected_found=1, expected_total=1, precision=0.333, recall=1, retrieved_found=1, retrieved_recall=1, retrieved_ids=v2-ss-b3,v2-ss-b4,v2-ss-b1,v2-ss-b5,v2-ss-c1,v2-ss-d5,v2-ss-b2,v2-ss-c2,v2-ss-d4,v2-ss-c5, ranking_correct=1, ranking_total=1, ranking_accuracy=1, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=935.180

**Query:** "What is the current incident response playbook?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, retrieved_ids=v2-ss-d2,v2-ss-d5,v2-ss-d1,v2-ss-d4,v2-ss-d3,v2-ss-c5,v2-ss-c1,v2-ss-c2,v2-ss-c3,v2-ss-b5, ranking_correct=2, ranking_total=2, ranking_accuracy=1, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=3248.241

**Query:** "What encryption standard is required for restricted data?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v2-ss-a1,v2-ss-a2,v2-ss-a4,v2-ss-a3,v2-ss-a5,v2-ss-c2,v2-ss-d3,v2-ss-d5,v2-ss-c4,v2-ss-b3, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=1360.869
- Missing expected docs: v2-ss-a4

**Query:** "What is the evidence collection procedure for security incidents?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, retrieved_ids=v2-ss-d5,v2-ss-d1,v2-ss-d2,v2-ss-d3,v2-ss-d4,v2-ss-a2,v2-ss-c3,v2-ss-c5,v2-ss-c1,v2-ss-b5, ranking_correct=1, ranking_total=1, ranking_accuracy=1, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=5431.600

#### Notes
- Missing expected docs: v2-ss-a4
- Ranking: v2-ss-a4 not in citations (expected above v2-ss-a1)
- Missing expected docs: v2-ss-a4

### Causal Chain Retrieval (25 docs, 5 chains)

**Passed:** YES

| Metric | Value |
|--------|-------|
| avg_recall | 0.5667 |
| avg_precision | 0.5000 |
| query_count | 10 |
| latency_ms | 4938.7099 |

#### Query Details

**Query:** "Why did payment-service SLA breach occur in October and how was it fixed?"

Metrics: expected_found=2, expected_total=3, precision=0.667, recall=0.667, retrieved_found=3, retrieved_recall=1, retrieved_ids=v2-cc-1a,v2-cc-1b,v2-cc-1e,v2-cc-2b,v2-cc-5c,v2-cc-1d,v2-cc-2a,v2-cc-4a,v2-cc-5e,v2-cc-3e, fragility_score=0, fragility_in_range=false, distinct_domains=3, latency_ms=7921.642
- Missing expected docs: v2-cc-1b
- Fragility 0 outside expected range [0.3, 1]

**Query:** "What is the connection pool sizing recommendation for payment-service?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v2-cc-1d,v2-cc-1e,v2-cc-1b,v2-cc-1c,v2-cc-5d,v2-cc-5c,v2-cc-5a,v2-cc-4e,v2-cc-5e,v2-cc-2a, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=2744.626
- Missing expected docs: v2-cc-1c

**Query:** "What happened with the credential leak incident INC-2025-1247?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v2-cc-2b,v2-cc-2a,v2-cc-4b,v2-cc-4e,v2-cc-4a,v2-cc-4c,v2-cc-3e,v2-cc-2e,v2-cc-5a,v2-cc-5e, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=3533.695
- Missing expected docs: v2-cc-2a

**Query:** "What security controls were implemented after the credential exposure?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=1, retrieved_recall=0.500, retrieved_ids=v2-cc-2b,v2-cc-2a,v2-cc-2e,v2-cc-4e,v2-cc-4a,v2-cc-4b,v2-cc-4c,v2-cc-3e,v2-cc-5e,v2-cc-1e, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=5557.969
- Missing expected docs: v2-cc-2d

**Query:** "What was the outcome of the Redis 6 to Redis 7 migration?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v2-cc-3a,v2-cc-3e,v2-cc-3d,v2-cc-3c,v2-cc-4b,v2-cc-2b,v2-cc-4e,v2-cc-3b,v2-cc-5a,v2-cc-5e, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=2969.534
- Missing expected docs: v2-cc-3a

**Query:** "How was the database audit trail finding F-2025-001 remediated?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v2-cc-4c,v2-cc-4b,v2-cc-4a,v2-cc-2b,v2-cc-4d,v2-cc-2a,v2-cc-4e,v2-cc-3e,v2-cc-5e,v2-cc-1e, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=4549.857
- Missing expected docs: v2-cc-4c

**Query:** "What caused the user-service latency degradation and what was the fix?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v2-cc-5c,v2-cc-5e,v2-cc-5b,v2-cc-5a,v2-cc-1b,v2-cc-1e,v2-cc-3c,v2-cc-1a,v2-cc-5d,v2-cc-2b, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=4192.745
- Missing expected docs: v2-cc-5a

**Query:** "What is the N+1 query pattern issue in user-service?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, retrieved_ids=v2-cc-5c,v2-cc-5e,v2-cc-5d,v2-cc-5b,v2-cc-1b,v2-cc-1c,v2-cc-5a,v2-cc-1d,v2-cc-4e,v2-cc-2a, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=3483.452

**Query:** "What security changes were made at Meridian in 2025?"

Metrics: expected_found=1, expected_total=2, precision=0.333, recall=0.500, retrieved_found=1, retrieved_recall=0.500, retrieved_ids=v2-cc-2a,v2-cc-2b,v2-cc-4b,v2-cc-3e,v2-cc-4a,v2-cc-3a,v2-cc-3d,v2-cc-4e,v2-cc-5a,v2-cc-5e, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=11331.170
- Missing expected docs: v2-cc-2d

**Query:** "What performance improvements were achieved in the platform this year?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=1, retrieved_recall=0.500, retrieved_ids=v2-cc-5a,v2-cc-5b,v2-cc-3c,v2-cc-1e,v2-cc-3e,v2-cc-1a,v2-cc-3d,v2-cc-5e,v2-cc-3a,v2-cc-2b, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=3102.408
- Missing expected docs: v2-cc-5c

#### Notes
- Missing expected docs: v2-cc-1b
- Fragility 0 outside expected range [0.3, 1]
- Missing expected docs: v2-cc-1c
- Missing expected docs: v2-cc-2a
- Missing expected docs: v2-cc-2d
- Missing expected docs: v2-cc-3a
- Missing expected docs: v2-cc-4c
- Missing expected docs: v2-cc-5a
- Missing expected docs: v2-cc-2d
- Missing expected docs: v2-cc-5c

### Corpus Degradation (550 base + noise to 25K)

**Passed:** YES

| Metric | Value |
|--------|-------|
| degradation_slope_per_1k | -0.0150 |
| baseline_precision5 | 0.5000 |
| final_precision5 | 0.1333 |
| baseline_recall5 | 0.7667 |
| final_recall5 | 0.2000 |

#### Degradation Curve

| Corpus Size | Precision@5 | Recall@5 | MiSES Jaccard | Fragility Probe | Latency P50 | Latency P95 |
|---:|---:|---:|---:|---:|---:|---:|
| 550 | 0.500 | 0.767 | 1.000 | 1.000 | 2132.125063ms | 4369.97123ms |
| 1000 | 0.467 | 0.700 | 1.000 | 1.000 | 2231.262139ms | 4972.003579ms |
| 2500 | 0.400 | 0.633 | 1.000 | 1.000 | 1580.950445ms | 4860.787431ms |
| 5000 | 0.233 | 0.367 | 1.000 | 1.000 | 1261.583064ms | 3355.548014ms |
| 10000 | 0.200 | 0.300 | 1.000 | 1.000 | 1356.159637ms | 2329.7778ms |
| 25000 | 0.133 | 0.200 | 1.000 | 1.000 | 1481.340007ms | 3251.245692ms |

#### Notes
- Degradation slope: -0.014997 precision@5 per 1K docs
- Precision@5: 0.500 (550 docs) -> 0.133 (25000 docs)

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
| avg_recall | 0.8333 |
| avg_precision | 0.4722 |
| avg_ranking_accuracy | 0.9000 |
| query_count | 6 |
| latency_ms | 2609.2276 |

#### Query Details

**Query:** "What is the current data classification policy at Meridian?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v2-ss-a1,v2-ss-a2,v2-ss-a4,v2-ss-d1,v2-ss-a3,v2-ss-c4,v2-ss-c5,v2-ss-b3,v2-ss-d5,v2-ss-c2, ranking_correct=1, ranking_total=2, ranking_accuracy=0.500, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=2294.150
- Missing expected docs: v2-ss-a4
- Ranking: v2-ss-a4 not in citations (expected above v2-ss-a1)

**Query:** "What is the platform SLA availability target?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, retrieved_ids=v2-ss-c2,v2-ss-c3,v2-ss-c5,v2-ss-c1,v2-ss-c4,v2-ss-b3,v2-ss-b5,v2-ss-a4,v2-ss-d5,v2-ss-d4, ranking_correct=1, ranking_total=1, ranking_accuracy=1, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=1518.974

**Query:** "How many replicas does payment-service run in production?"

Metrics: expected_found=1, expected_total=1, precision=0.333, recall=1, retrieved_found=1, retrieved_recall=1, retrieved_ids=v2-ss-b3,v2-ss-b4,v2-ss-b1,v2-ss-b5,v2-ss-c1,v2-ss-d5,v2-ss-b2,v2-ss-c2,v2-ss-d4,v2-ss-c5, ranking_correct=1, ranking_total=1, ranking_accuracy=1, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=1053.719

**Query:** "What is the current incident response playbook?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, retrieved_ids=v2-ss-d2,v2-ss-d5,v2-ss-d1,v2-ss-d4,v2-ss-d3,v2-ss-c5,v2-ss-c1,v2-ss-c2,v2-ss-c3,v2-ss-b5, ranking_correct=2, ranking_total=2, ranking_accuracy=1, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=2160.774

**Query:** "What encryption standard is required for restricted data?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v2-ss-a1,v2-ss-a2,v2-ss-a4,v2-ss-a3,v2-ss-a5,v2-ss-c2,v2-ss-d3,v2-ss-d5,v2-ss-c4,v2-ss-b3, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=1345.756
- Missing expected docs: v2-ss-a4

**Query:** "What is the evidence collection procedure for security incidents?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, retrieved_ids=v2-ss-d5,v2-ss-d1,v2-ss-d2,v2-ss-d3,v2-ss-d4,v2-ss-a2,v2-ss-c3,v2-ss-c5,v2-ss-c1,v2-ss-b5, ranking_correct=1, ranking_total=1, ranking_accuracy=1, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=7281.992

#### Notes
- Missing expected docs: v2-ss-a4
- Ranking: v2-ss-a4 not in citations (expected above v2-ss-a1)
- Missing expected docs: v2-ss-a4

### Causal Chain Retrieval (25 docs, 5 chains)

**Passed:** YES

| Metric | Value |
|--------|-------|
| avg_recall | 0.6167 |
| avg_precision | 0.5500 |
| query_count | 10 |
| latency_ms | 3463.3613 |

#### Query Details

**Query:** "Why did payment-service SLA breach occur in October and how was it fixed?"

Metrics: expected_found=2, expected_total=3, precision=0.667, recall=0.667, retrieved_found=3, retrieved_recall=1, retrieved_ids=v2-cc-1a,v2-cc-1b,v2-cc-1e,v2-cc-2b,v2-cc-5c,v2-cc-1d,v2-cc-2a,v2-cc-4a,v2-cc-5e,v2-cc-3e, fragility_score=0, fragility_in_range=false, distinct_domains=3, latency_ms=3700.393
- Missing expected docs: v2-cc-1b
- Fragility 0 outside expected range [0.3, 1]

**Query:** "What is the connection pool sizing recommendation for payment-service?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v2-cc-1d,v2-cc-1e,v2-cc-1b,v2-cc-1c,v2-cc-5d,v2-cc-5c,v2-cc-5a,v2-cc-4e,v2-cc-5e,v2-cc-2a, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=2991.457
- Missing expected docs: v2-cc-1c

**Query:** "What happened with the credential leak incident INC-2025-1247?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v2-cc-2b,v2-cc-2a,v2-cc-4b,v2-cc-4e,v2-cc-4a,v2-cc-4c,v2-cc-3e,v2-cc-2e,v2-cc-5a,v2-cc-5e, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=1634.649
- Missing expected docs: v2-cc-2a

**Query:** "What security controls were implemented after the credential exposure?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=1, retrieved_recall=0.500, retrieved_ids=v2-cc-2b,v2-cc-2a,v2-cc-2e,v2-cc-4e,v2-cc-4a,v2-cc-4b,v2-cc-4c,v2-cc-3e,v2-cc-5e,v2-cc-1e, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=4507.430
- Missing expected docs: v2-cc-2d

**Query:** "What was the outcome of the Redis 6 to Redis 7 migration?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v2-cc-3a,v2-cc-3e,v2-cc-3d,v2-cc-3c,v2-cc-4b,v2-cc-2b,v2-cc-4e,v2-cc-3b,v2-cc-5a,v2-cc-5e, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=2856.264
- Missing expected docs: v2-cc-3a

**Query:** "How was the database audit trail finding F-2025-001 remediated?"

Metrics: expected_found=2, expected_total=2, precision=1, recall=1, retrieved_found=2, retrieved_recall=1, retrieved_ids=v2-cc-4c,v2-cc-4b,v2-cc-4a,v2-cc-2b,v2-cc-4d,v2-cc-2a,v2-cc-4e,v2-cc-3e,v2-cc-5e,v2-cc-1e, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=2815.705

**Query:** "What caused the user-service latency degradation and what was the fix?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=2, retrieved_recall=1, retrieved_ids=v2-cc-5c,v2-cc-5e,v2-cc-5b,v2-cc-5a,v2-cc-1b,v2-cc-1e,v2-cc-3c,v2-cc-1a,v2-cc-5d,v2-cc-2b, fragility_score=1, fragility_in_range=true, distinct_domains=2, latency_ms=4243.272
- Missing expected docs: v2-cc-5a

**Query:** "What is the N+1 query pattern issue in user-service?"

Metrics: expected_found=1, expected_total=1, precision=0.500, recall=1, retrieved_found=1, retrieved_recall=1, retrieved_ids=v2-cc-5c,v2-cc-5e,v2-cc-5d,v2-cc-5b,v2-cc-1b,v2-cc-1c,v2-cc-5a,v2-cc-1d,v2-cc-4e,v2-cc-2a, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=2698.302

**Query:** "What security changes were made at Meridian in 2025?"

Metrics: expected_found=1, expected_total=2, precision=0.333, recall=0.500, retrieved_found=1, retrieved_recall=0.500, retrieved_ids=v2-cc-2a,v2-cc-2b,v2-cc-4b,v2-cc-3e,v2-cc-4a,v2-cc-3a,v2-cc-3d,v2-cc-4e,v2-cc-5a,v2-cc-5e, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=6591.506
- Missing expected docs: v2-cc-2d

**Query:** "What performance improvements were achieved in the platform this year?"

Metrics: expected_found=1, expected_total=2, precision=0.500, recall=0.500, retrieved_found=1, retrieved_recall=0.500, retrieved_ids=v2-cc-5a,v2-cc-5b,v2-cc-3c,v2-cc-1e,v2-cc-3e,v2-cc-1a,v2-cc-3d,v2-cc-5e,v2-cc-3a,v2-cc-2b, fragility_score=0, fragility_in_range=true, distinct_domains=2, latency_ms=2594.634
- Missing expected docs: v2-cc-5c

#### Notes
- Missing expected docs: v2-cc-1b
- Fragility 0 outside expected range [0.3, 1]
- Missing expected docs: v2-cc-1c
- Missing expected docs: v2-cc-2a
- Missing expected docs: v2-cc-2d
- Missing expected docs: v2-cc-3a
- Missing expected docs: v2-cc-5a
- Missing expected docs: v2-cc-2d
- Missing expected docs: v2-cc-5c

### Corpus Degradation (550 base + noise to 25K)

**Passed:** YES

| Metric | Value |
|--------|-------|
| degradation_slope_per_1k | -0.0082 |
| baseline_precision5 | 0.5000 |
| final_precision5 | 0.3000 |
| baseline_recall5 | 0.7667 |
| final_recall5 | 0.4333 |

#### Degradation Curve

| Corpus Size | Precision@5 | Recall@5 | MiSES Jaccard | Fragility Probe | Latency P50 | Latency P95 |
|---:|---:|---:|---:|---:|---:|---:|
| 550 | 0.500 | 0.767 | 1.000 | 1.000 | 1959.148962ms | 3127.508954ms |
| 1000 | 0.467 | 0.700 | 1.000 | 1.000 | 1689.744513ms | 2941.901594ms |
| 2500 | 0.400 | 0.633 | 1.000 | 1.000 | 1568.703974ms | 3645.90841ms |
| 5000 | 0.267 | 0.400 | 1.000 | 1.000 | 1167.583072ms | 2185.380911ms |
| 10000 | 0.200 | 0.300 | 1.000 | 1.000 | 1411.700757ms | 4840.707966ms |
| 25000 | 0.300 | 0.433 | 1.000 | 1.000 | 1183.082363ms | 2645.546194ms |

#### Notes
- Degradation slope: -0.008180 precision@5 per 1K docs
- Precision@5: 0.500 (550 docs) -> 0.300 (25000 docs)

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
| supersession improvement v41 vs v1 | recall 0.833 -> 0.833 |
| causal completeness improvement | avg_recall 0.617 -> 0.617 |
| degradation slope v1 | -0.010906612133605999 |
| degradation slope v41 | -0.0081799591002045 |
