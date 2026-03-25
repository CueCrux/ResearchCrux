# Benchmark Ledger

Living index of all canonical audit runs. Each run page contains pass/fail matrix, per-category metrics, and query-level details.

Evidence is generated from [CueCrux/AuditCrux](https://github.com/CueCrux/AuditCrux) (MIT) canonical results.

**20 canonical runs** | **96/96 categories passed (v1-v3)** | **v4: 12/12 x 5 (Phase 7.4)** | [Changelog](changelog.md) | [Latest (JSON)](latest.json)

| Run ID | Suite | Embedding | Date | Duration | Pass Rate | Details |
|---|---|---|---|---|---|---|
| `110ada93` | v1 | OpenAI | 2026-03-10 | 9m 18s | **12/12** | [View](run-110ada93.md) |
| `c85daff7` | v2 | OpenAI | 2026-03-11 | 20m 44s | **12/12** | [View](run-c85daff7.md) |
| `e782fbd0` | v3 | OpenAI | 2026-03-11 | 5m 10s | **16/16** | [View](run-e782fbd0.md) |
| `a86b1733` | v1 | EmbedderCrux/nomic | 2026-03-12 | 9m 56s | **12/12** | [View](run-a86b1733.md) |
| `5b125495` | v2 | EmbedderCrux/nomic | 2026-03-12 | 18m 38s | **12/12** | [View](run-5b125495.md) |
| `8dd5efff` | v3 | EmbedderCrux/nomic | 2026-03-12 | 4m 13s | **16/16** | [View](run-8dd5efff.md) |
| `e26bf4ed` | v3 | OpenAI (relation-expansion) | 2026-03-12 | 3m 47s | **16/16** | [View](run-e26bf4ed.md) |
| `iso-baseline` | v4-isolation | EmbedderCrux/nomic | 2026-03-14 | — | **1/2** | DQP off, cat7+8 only |
| `iso-nosplit` | v4-isolation | EmbedderCrux/nomic | 2026-03-14 | — | **0/2** | DQP on (no-split fix) |
| `iso-full` | v4-isolation | EmbedderCrux/nomic | 2026-03-14 | — | **0/2** | Full corpus (1025 docs) |
| `16554101` | v4 | EmbedderCrux/nomic | 2026-03-22 | — | **13/13** | Phase 7.3 canonical (run 1/3) |
| `ca505454` | v4 | EmbedderCrux/nomic | 2026-03-22 | — | **13/13** | Phase 7.3 canonical (run 2/3) |
| `5e5ccff5` | v4 | EmbedderCrux/nomic | 2026-03-22 | — | **13/13** | Phase 7.3 canonical (run 3/3) |
| `f9b80070` | v4-attribution | EmbedderCrux/nomic | 2026-03-22 | — | **13/13** | Attribution: RELATION_PAIR off -> Cat 11 = 0.927 |
| `b5f84195` | v4-attribution | EmbedderCrux/nomic | 2026-03-22 | — | **13/13** | Attribution: FORMAT_AWARE_CITATION off -> Cat 11 = 0.927 |
| `037b303a` | v4 | EmbedderCrux/nomic | 2026-03-24 | 61m | **12/12** | Phase 7.4 schema 1.1 (run 1/5) |
| `80434381` | v4 | EmbedderCrux/nomic | 2026-03-24 | 55m | **12/12** | Phase 7.4 schema 1.1 (run 2/5) |
| `69341abe` | v4 | EmbedderCrux/nomic | 2026-03-24 | 55m | **12/12** | Phase 7.4 schema 1.1 (run 3/5) |
| `e0bfbd9b` | v4 | EmbedderCrux/nomic | 2026-03-24 | 55m | **12/12** | Phase 7.4 schema 1.1 (run 4/5) |
| `fabf5dc8` | v4 | EmbedderCrux/nomic | 2026-03-25 | 53m | **12/12** | Phase 7.4 schema 1.1 (run 5/5) |

## Category Reference

| Category | Name | Tests |
|---|---|---|
| cat1 | Supersession / Relation-bootstrapped Retrieval | Amendment detection, ranking accuracy |
| cat2 | Format-aware Retrieval | Cross-format recall (MD, JSON, CSV, YAML, chat, notes) |
| cat3 | Retrieval Lane Decomposition | BM25 vs vector vs hybrid isolation |
| cat4 | Temporal Reconstruction / Scale Degradation | Point-in-time accuracy, recall under scale |
| cat5 | Receipt Chain Verification | Chain depth, integrity, latency |
| cat6 | Fragility Calibration | Leave-one-out analysis, domain diversity |
| cat7 | Broad Recall (v4) | Thematic recall across 15+ docs, target ≥0.70 |
| cat8 | Precision@1 (v4) | Exact top-1 retrieval accuracy, target ≥0.80 |
| cat9 | DQP Semantic Chunking (v4) | Chunking quality on structured docs |
| cat10 | DQP Quality Gating (v4) | Confidence-gated retrieval |
| cat11 | Chunking Stress (v5) | Long-doc chunking (500-2000+ tokens) |
| cat12 | Hard-Negative Overlap | Parent-child recall, relation-pair preservation |
| cat12v2 | Hard-Negative Overlap v2 | Extended overlap scenarios |

---

*This ledger is regenerated from source by running `npm run ledger:generate`.*