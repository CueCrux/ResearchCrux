# DQP Benchmark Findings

**Date:** 2026-03-13
**Status:** Engineering investigation — published for transparency

---

## Summary

Document Quality Pipeline (DQP) techniques — semantic chunking, late chunking, quality gating, semantic deduplication, HyDE, context notation, and hierarchical retrieval — were systematically evaluated against the v4 benchmark corpus (975 documents, 139 queries, 10 categories).

**Result: DQP causes severe recall regression.** The production system runs without DQP.

---

## Results

| Config | DQP Features | Pass Rate | Recall | Duration |
|--------|-------------|-----------|--------|----------|
| **R0** | **All off (baseline)** | **8/10** | **89.5%** | **1663s** |
| R1 | Semantic chunk + late chunk + quality gate | 4/10 | 24.3% | 2331s |
| R2 | R1 + semantic dedup | 3/10 | 4.4% | 2344s |
| R3 | R1 + HyDE | 3/10 | 8.7% | 2381s |
| R4 | R1 + dedup + HyDE + context notation | 3/10 | 10.4% | 1896s |
| R5 | R4 + hierarchical | 3/10 | 12.8% | 1924s |
| R6 | Full stack (all techniques) | 3/10 | 12.8% | 2140s |

The critical transition is R0 → R1. Enabling Tier 1 alone drops recall from 89.5% to 24.3%. Subsequent techniques provide marginal recovery (12.8% at best) but cannot undo the initial damage.

---

## Category Impact

**Stable across all configs:**
- Cat 1 (Relevance): PASS — basic relevance unaffected
- Cat 4 (Temporal): PASS — timestamp reconstruction preserved
- Cat 5 (Receipt chain): PASS — provenance chain integrity preserved

**Regression with DQP:**

| Category | R0 (baseline) | R1 (Tier 1) | R6 (full stack) |
|----------|---------------|-------------|-----------------|
| Cat 2 (Format) | 85.6% PASS | 48.5% PASS | 25.6% FAIL |
| Cat 3 (BM25/Vector/Hybrid) | PASS | FAIL | FAIL |
| Cat 6 (Fragility) | PASS (scores=0) | FAIL (scores=1.0) | FAIL |
| Cat 9 (Dedup detection) | 94.3% PASS | 0% FAIL | FAIL |
| Cat 10 (Multi-doc) | 93.4% PASS | 0% FAIL | 0% FAIL |

Cat 10 is the most severe: 93.4% → 0% — complete collapse of multi-document retrieval.

---

## Root Cause

The semantic chunker is the primary regression driver. Two mechanisms:

1. **Content fragmentation:** Documents split at semantic boundaries lose the holistic signal that whole-doc embeddings preserve. Queries designed against whole documents fail to match fragments.

2. **BM25 term disruption:** Re-chunking redistributes terms across chunks, destroying the term frequency patterns that BM25 ranking depends on. Cat 3 BM25 lane goes from 52 found docs to 1.

Later techniques (dedup, HyDE, context notation, hierarchical) partially compensate but cannot recover from the initial chunking damage.

---

## Corpus Statistics

| Config | Artifacts | Chunks | Embeddings | Chunk Ratio |
|--------|-----------|--------|------------|-------------|
| R0 | 975 | 975 | 975 | 1.00x |
| R1–R6 | 975 | 1,234 | 1,227 | 1.27x |

DQP creates ~27% more chunks via semantic splitting. 7 chunks excluded by quality gating.

---

## Why We Publish This

This finding demonstrates that advanced retrieval techniques do not automatically improve quality. The CueCrux production system uses baseline retrieval (R0) because it produces measurably better results. Publishing negative results is part of our commitment to evidence-based engineering.

The benchmark suite is open source at [CueCrux/AuditCrux](https://github.com/CueCrux/AuditCrux) (MIT). These results can be independently reproduced.

---

## Environment

- **Server:** CueCrux-Data-1 (EX63 dedicated, i9-13900, 192GB DDR5 ECC, NVMe RAID-1)
- **Embedder:** EmbedderCrux TEI (nomic-embed-text-v1.5) on CoreCrux-GPU-1 via embedder-pool-router
- **Corpus:** v4 (975 documents, 139 queries, 10 categories)
- **Harness:** `Engine/scripts/benchmark/run-benchmark.sh`

---

*Source: `Engine/scripts/audit-results/benchmark-v4-summary-2026-03-13.md`*
