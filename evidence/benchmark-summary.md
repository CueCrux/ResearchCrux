# Benchmark Summary — Reference Card

**Suite:** [CueCrux/AuditCrux](https://github.com/CueCrux/AuditCrux) (MIT, open source)
**Date:** March 2026
**Engine:** CueCrux Engine on CueCrux-Data-1 (i9-13900, 192GB DDR5, NVMe RAID-1)

---

## Pass Rates

| Suite | Run ID | Categories | Result |
|---|---|---|---|
| v1 — Baseline Corpus | `110ada93` | 4 categories × 3 modes | **12/12** |
| v2 — Enterprise Corpus | `c85daff7` | 4 categories × 3 modes | **12/12** |
| v3 — Capability Probes | `e782fbd0` | 6 categories × 3 modes | **16/16** |
| v4 — Production Quality (Phase 7.3) | `16554101` | 13 categories | **13/13 × 3** |
| **Total** | | **27 categories** | **79/79** |

### v4 Suite — Phase 7.3 Canonical Baseline (2026-03-22)

**Corpus:** 1074 unique docs / 1127 ingested, 462 queries, 13 categories
**Config:** `config-manifest-6.7.json`, EmbedderCrux nomic-embed-text-v1.5 (768d), gpt-4o-mini
**Validated:** 13/13 × 3 (runs `16554101`, `ca505454`, `5e5ccff5`)

| Category | Metric | Run 1 | Run 2 | Run 3 | Target |
|---|---|---|---|---|---|
| Cat 1 | supersession_recall | 1.000 | 1.000 | 1.000 | ≥0.80 |
| Cat 2 | avg_citation_recall | 0.670 | 0.715 | 0.696 | ≥0.50 |
| Cat 3 | lane_decomposition | PASS | PASS | PASS | all lanes contribute |
| Cat 5 | chain_integrity | 1.000 | 1.000 | 1.000 | 1.000 |
| Cat 6 | fragility_calibration | PASS | PASS | PASS | score < 1.0 |
| Cat 7 | broad_recall | ≥0.70 | ≥0.70 | ≥0.70 | ≥0.70 |
| Cat 8 | P@1 | ≥0.75 | ≥0.75 | ≥0.75 | ≥0.75 |
| Cat 9 | dedup_detection | 1.000 | 1.000 | 1.000 | ≥0.90 |
| Cat 10 | chain_completeness | ≥0.90 | ≥0.90 | ≥0.90 | ≥0.90 |
| Cat 11 | broad_recall | 0.927 | 0.927 | 0.927 | ≥0.70 |
| Cat 12 | parent_child_recall | 1.000 | 1.000 | 1.000 | ≥0.80 |
| Cat 12v2 | overlap_recall | PASS | PASS | PASS | ≥0.80 |
| Cat 13 | temporal_reconstruction | PASS | PASS | PASS | ≥0.90 |

#### Two-Layer Narrative

**Layer 1 (owned):** Cat 2 (format-aware citation) and Cat 12 (relation-pair preservation) are product-owned improvements.

**Layer 2 (observed):** Cat 11 broad_recall 0.722→0.927 is an external factor (LLM model drift), confirmed by full attribution matrix (runs `f9b80070`, `b5f84195`). Neither `FEATURE_FORMAT_AWARE_CITATION` nor `FEATURE_RELATION_PAIR_PRESERVATION` caused the improvement.

---

## Key Metrics

### Supersession Accuracy

| Corpus | Recall | Ranking Accuracy |
|---|---|---|
| Clean text (v1) | 1.000 | 1.000 |
| Enterprise (v2) | 0.750 – 0.833 | 0.900 |

### Causal Chain Retrieval

| Corpus | Avg Recall | Notes |
|---|---|---|
| Clean text (v1) | 1.000 | Same-format chains |
| Enterprise (v2) | 0.617 – 0.667 | Cross-format chains (5 MIME types per chain) |

### Corpus Scale Degradation

| Corpus | V1 Slope | V4.1 Slope | V4.1 Recall at Max Scale |
|---|---|---|---|
| Clean (100 → 10K) | -0.020/1K docs | -0.019/1K docs | 0.550 at 10K |
| Enterprise (550 → 25K) | -0.010/1K docs | -0.008/1K docs | 0.367 at 25K |

V4.1 retains 83% more recall than V3.1 at 25,000 documents.

### Temporal Reconstruction

| Corpus | Accuracy | Correct/Total |
|---|---|---|
| Clean text (v1) | 100% | 54/54 |
| Enterprise (v2) | 96.63% | 172/178 |
| Edge cases (v3) | 100% | 12/12 |

### Receipt Chain Verification

| Metric | Value |
|---|---|
| Max verified depth | 50 (CTE limit) |
| Chain integrity | 100% (all depths) |
| Verification latency | 2-4ms (flat, depth-independent) |

### Format Recall (v3)

| Format | Retrieved Recall | Citation Recall |
|---|---|---|
| Markdown | 1.00 | 1.00 |
| JSON | 1.00 | 0.33 |
| CSV | 1.00 | 0.67 |
| YAML | 1.00 | 0.00 |
| Chat transcripts | 1.00 | 0.00 |
| Meeting notes | 1.00 | 0.00 |

100% pipeline retrieval across all formats. Citation gap is LLM selection preference, not pipeline defect.

### Retrieval Lane Decomposition (v3)

| Lane | Retrieved Recall | Citation Recall |
|---|---|---|
| BM25 (keyword) | 1.00 | 1.00 |
| Vector (semantic) | 1.00 | 0.00 |
| Hybrid | 1.00 | 1.00 |

Both retrieval lanes contribute. V-class (semantic-only) docs are retrieved but not cited.

---

## Known Limitations

- **Embedding space:** v4 canonical runs use EmbedderCrux/nomic-embed-text-v1.5 (768d). Earlier v1-v3 runs cover both OpenAI and nomic. See [embedding comparison](embedding-comparison.md).
- **Relation expansion:** Active in v4 baseline (`FEATURE_RELATION_EXPANSION=true`). Relation-pair preservation (`FEATURE_RELATION_PAIR_PRESERVATION=true`) injects children that survive rerank but miss topK cutoff.
- **Corpus:** Synthetic (reproducible but not ecologically validated).
- **LLM nondeterminism:** Citation recall may vary ±0.1 between runs. Retrieved recall is deterministic.
- **Cat 11 externally contingent:** broad_recall 0.722→0.927 is not attributable to any shipped code mechanism. Full attribution matrix (2 runs) ruled out both Phase 7.3 flags. Most likely cause: upstream LLM model/provider drift. Monitored via model-drift sentinel pack.
- **Model provenance:** Baseline runs used gpt-4o-mini (OpenAI). Model/provider drift is a first-class release variable — model provenance pinned in config manifest.
- **DQP:** Advanced retrieval techniques cause severe recall regression and remain parked per audit guidance. See [DQP findings](dqp-findings.md).

---

## Full Results

- Raw output files: [AuditCrux/results/](https://github.com/CueCrux/AuditCrux/tree/main/results)
- Methodology: [AuditCrux/METHODOLOGY.md](https://github.com/CueCrux/AuditCrux/blob/main/METHODOLOGY.md)
- Detailed results: [AuditCrux/RESULTS.md](https://github.com/CueCrux/AuditCrux/blob/main/RESULTS.md)
- Whitepaper: [Retrieval Quality Benchmark v1](../whitepapers/retrieval-quality-benchmark-v1.md)
