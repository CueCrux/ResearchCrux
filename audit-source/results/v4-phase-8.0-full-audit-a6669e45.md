# Retrieval Quality Audit v4 — Expanded Corpus Report

**Run ID:** a6669e45
**Started:** 2026-04-03T15:53:34.232Z
**Finished:** 2026-04-03T17:07:54.769Z
**Model:** gpt-4o-mini (openai), cascade: gpt-4o-mini
**Host:** unknown

## Summary

| Category | Mode | Passed |
|----------|------|:------:|
| cat1 | V1 | YES |
| cat2 | V1 | YES |
| cat3 | V1 | YES |
| cat4 | V1 | YES |
| cat5 | V4.1 | YES |
| cat6 | V1 | YES |
| cat7 | V1 | YES |
| cat8 | V1 | YES |
| cat9 | V1 | YES |
| cat10 | V1 | YES |
| cat11 | V1 | YES |
| cat12 | V1 | YES |
| cat12v2 | V1 | YES |

## cat1 [V1]

**Passed:** YES

| Metric | Value |
|--------|-------|
| avg_recall | 1 |
| amendment_found | false |
| relation_expansion_active | false |

**Notes:**
- Relation expansion not active (baseline)

## cat2 [V1]

**Passed:** YES

| Metric | Value |
|--------|-------|
| avg_citation_recall | 0.6815 |
| avg_retrieved_recall | 0.9111 |
| query_count | 45 |
| tier1_retrieved_recall | 0.9111 |

**Notes:**
- text/markdown: cited=41/45 (0.91), retrieved=41/45 (0.91)
- application/json: cited=28/45 (0.62), retrieved=41/45 (0.91)
- application/x-yaml: cited=20/45 (0.44), retrieved=41/45 (0.91)
- text/csv: cited=39/45 (0.87), retrieved=41/45 (0.91)
- text/plain (chat): cited=27/45 (0.60), retrieved=41/45 (0.91)
- text/plain (notes): cited=29/45 (0.64), retrieved=41/45 (0.91)

## cat3 [V1]

**Passed:** YES

| Metric | Value |
|--------|-------|
| combined_citation_recall | 0.6970 |
| combined_retrieved_recall | 0.8485 |
| bm25_citation_recall | 0.9818 |
| vector_citation_recall | 0.1636 |
| hybrid_citation_recall | 0.9455 |
| bm25_retrieved_recall | 0.9818 |
| vector_retrieved_recall | 0.6000 |
| hybrid_retrieved_recall | 0.9636 |
| bm25_found | 54 |
| vector_found | 9 |
| hybrid_found | 52 |
| lane_bm25_retrieved | true |
| lane_vector_retrieved | true |
| lane_hybrid_retrieved | true |

**Notes:**
- BM25: cited=54/55, retrieved=54/55
- Vector: cited=9/55, retrieved=33/55
- Hybrid: cited=52/55, retrieved=53/55

## cat4 [V1]

**Passed:** YES

| Metric | Value |
|--------|-------|
| skipped | true |

**Notes:**
- Skipped: V1

## cat5 [V4.1]

**Passed:** YES

| Metric | Value |
|--------|-------|
| chains_intact | 10 |
| total_verified | 10 |
| all_intact_at_20 | true |

## cat6 [V1]

**Passed:** YES

| Metric | Value |
|--------|-------|
| f1_fragility | 1 |
| f2_fragility | 0 |
| f3_fragility | 0 |
| monotonic_order | true |
| all_zero | false |
| llm_invariant | false |
| graduated_score | 1 |

**Notes:**
- Calibration: F1=1.000, F2=0.000, F3=0.000, monotonic=true
- Graduated: score=1, llm_invariant=false

## cat7 [V1]

**Passed:** YES

| Metric | Value |
|--------|-------|
| broad_query_recall | 1 |
| avg_recall | 0.7800 |
| query_count | 36 |

**Notes:**
- Broad query recall: 1.000 (target: ≥0.7)

## cat8 [V1]

**Passed:** YES

| Metric | Value |
|--------|-------|
| precision_at_1 | 0.9625 |
| precision_at_1_hits | 77 |
| precision_at_1_total | 80 |
| avg_precision | 0.9625 |

**Notes:**
- Precision@1: 0.963 (target: ≥0.8)

## cat9 [V1]

**Passed:** YES

| Metric | Value |
|--------|-------|
| canonical_recall_rate | 1 |
| avg_dupes_per_cluster | 1.2286 |
| dedup_effectiveness | 0.5275 |
| total_clusters | 35 |
| total_canonical_found | 35 |
| total_dupes_in_results | 43 |

**Notes:**
- Cluster c1: canonical=YES, dupes_retrieved=1/3
- Cluster c3: canonical=YES, dupes_retrieved=1/3
- Cluster c5: canonical=YES, dupes_retrieved=2/2
- Cluster c6: canonical=YES, dupes_retrieved=3/3
- Cluster c8: canonical=YES, dupes_retrieved=2/2
- Cluster c9: canonical=YES, dupes_retrieved=2/2
- Cluster c10: canonical=YES, dupes_retrieved=1/2
- Cluster c11: canonical=YES, dupes_retrieved=1/1
- Cluster c12: canonical=YES, dupes_retrieved=2/2
- Cluster c13: canonical=YES, dupes_retrieved=1/1
- Cluster c14: canonical=YES, dupes_retrieved=1/2
- Cluster c15: canonical=YES, dupes_retrieved=2/2
- Cluster c18: canonical=YES, dupes_retrieved=1/3
- Cluster c19: canonical=YES, dupes_retrieved=3/3
- Cluster c20: canonical=YES, dupes_retrieved=1/3
- Cluster c21: canonical=YES, dupes_retrieved=2/3
- Cluster c22: canonical=YES, dupes_retrieved=1/3
- Cluster c23: canonical=YES, dupes_retrieved=2/3
- Cluster c24: canonical=YES, dupes_retrieved=1/3
- Cluster c25: canonical=YES, dupes_retrieved=2/3
- Cluster c26: canonical=YES, dupes_retrieved=1/3
- Cluster c27: canonical=YES, dupes_retrieved=2/3
- Cluster c28: canonical=YES, dupes_retrieved=1/3
- Cluster c29: canonical=YES, dupes_retrieved=2/3
- Cluster c30: canonical=YES, dupes_retrieved=1/3
- Cluster c31: canonical=YES, dupes_retrieved=1/3
- Cluster c32: canonical=YES, dupes_retrieved=1/3
- Cluster c33: canonical=YES, dupes_retrieved=1/3
- Cluster c34: canonical=YES, dupes_retrieved=1/3
- Canonical recall: 35/35 (1.00)
- Avg dupes retrieved per cluster: 1.23 / max 2.6
- Dedup effectiveness: 0.527 (1.0 = perfect dedup, 0.0 = no dedup)

## cat10 [V1]

**Passed:** YES

| Metric | Value |
|--------|-------|
| avg_retrieved_recall | 0.9344 |
| chain_completeness | 0.9333 |
| total_chains | 30 |
| chains_with_all_expected | 28 |
| total_expected_found | 57 |
| total_expected | 61 |

**Notes:**
- Chain ch11: found 0/2 expected, chain docs retrieved: 0/4, missing: v4-ctx-ch11-b, v4-ctx-ch11-c
- Chain ch13: found 0/2 expected, chain docs retrieved: 0/4, missing: v4-ctx-ch13-b, v4-ctx-ch13-c
- Retrieved recall across chains: 57/61 (0.934)
- Chains with all expected docs: 28/30 (0.93)

## cat11 [V1]

**Passed:** YES

| Metric | Value |
|--------|-------|
| within_chunk_precision | 0.9750 |
| cross_chunk_recall | 1 |
| broad_recall | 0.9267 |
| multi_doc_precision | 1 |

**Notes:**
- Within-chunk precision: 0.975 (39/40)
- Cross-chunk recall: 1.000 (20/20)
- Broad recall: 0.927 (target: >=0.7)
- Multi-doc precision: 1.000 (target: >=0.75)

## cat12 [V1]

**Passed:** YES

| Metric | Value |
|--------|-------|
| iac_discrimination | 1 |
| devex_discrimination | 1 |
| overlap_zone_recall | 1 |
| version_precision | 1 |
| parent_child_recall | 1 |
| overall_recall | 1 |
| avg_retrieved_recall | 1 |

**Notes:**
- IaC discrimination: 1.000 (6/6)
- DevEx discrimination: 1.000 (6/6)
- Overlap zone: 1.000 (6/6)
- Version precision: 1.000 (9/9)
- Parent/child recall: 1.000 (13/13)
- Overall recall: 1.000 (target: >=0.7)
- Avg retrieved recall: 1.000 (target: >=0.75)

## cat12v2 [V1]

**Passed:** YES

| Metric | Value |
|--------|-------|
| iac_discrimination | 1 |
| devex_discrimination | 0.8333 |
| overlap_zone_recall | 1 |
| version_precision | 1 |
| parent_child_recall | 1 |
| adversarial_recall | 0.6818 |
| adversarial_parent_child_recall | 0.7692 |
| overall_recall | 0.9630 |
| avg_retrieved_recall | 0.8824 |

**Notes:**
- --- v1 baseline (queries 0-35) ---
- IaC discrimination: 1.000 (6/6)
- DevEx discrimination: 0.833 (5/6)
- Overlap zone: 1.000 (6/6)
- Version precision: 1.000 (9/9)
- Parent/child recall: 1.000 (13/13)
- --- v2 adversarial (queries 36-50) ---
- Adversarial recall: 0.682 (15/22)
- Adversarial parent/child: 0.769 (10/13)
- --- Combined ---
- Overall recall: 0.963 (target: >=0.7)
- Avg retrieved recall: 0.882 (target: >=0.75)
