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
| **Total** | | **14 categories** | **40/40** |

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

- **Embedding space:** Canonical runs use OpenAI text-embedding-3-small (768d). EmbedderCrux integration pending.
- **Relation expansion:** Not active — relation graph used for state classification and MiSES, not candidate retrieval.
- **Corpus:** Synthetic (reproducible but not ecologically validated).
- **LLM nondeterminism:** Citation recall may vary ±0.1 between runs. Retrieved recall is deterministic.

---

## Full Results

- Raw output files: [AuditCrux/results/](https://github.com/CueCrux/AuditCrux/tree/main/results)
- Methodology: [AuditCrux/METHODOLOGY.md](https://github.com/CueCrux/AuditCrux/blob/main/METHODOLOGY.md)
- Detailed results: [AuditCrux/RESULTS.md](https://github.com/CueCrux/AuditCrux/blob/main/RESULTS.md)
- Whitepaper: [Retrieval Quality Benchmark v1](../whitepapers/retrieval-quality-benchmark-v1.md)
