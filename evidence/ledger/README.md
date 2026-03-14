# Benchmark Ledger

Living index of all canonical audit runs. Each run page contains pass/fail matrix, per-category metrics, and query-level details.

Evidence is generated from [CueCrux/AuditCrux](https://github.com/CueCrux/AuditCrux) (MIT) canonical results.

**7 canonical runs** | **96/96 categories passed** | [Changelog](changelog.md) | [Latest (JSON)](latest.json)

| Run ID | Suite | Embedding | Date | Duration | Pass Rate | Details |
|---|---|---|---|---|---|---|
| `110ada93` | v1 | OpenAI | 2026-03-10 | 9m 18s | **12/12** | [View](run-110ada93.md) |
| `c85daff7` | v2 | OpenAI | 2026-03-11 | 20m 44s | **12/12** | [View](run-c85daff7.md) |
| `e782fbd0` | v3 | OpenAI | 2026-03-11 | 5m 10s | **16/16** | [View](run-e782fbd0.md) |
| `a86b1733` | v1 | EmbedderCrux/nomic | 2026-03-12 | 9m 56s | **12/12** | [View](run-a86b1733.md) |
| `5b125495` | v2 | EmbedderCrux/nomic | 2026-03-12 | 18m 38s | **12/12** | [View](run-5b125495.md) |
| `8dd5efff` | v3 | EmbedderCrux/nomic | 2026-03-12 | 4m 13s | **16/16** | [View](run-8dd5efff.md) |
| `e26bf4ed` | v3 | OpenAI (relation-expansion) | 2026-03-12 | 3m 47s | **16/16** | [View](run-e26bf4ed.md) |

## Category Reference

| Category | Name | Tests |
|---|---|---|
| cat1 | Supersession / Relation-bootstrapped Retrieval | Amendment detection, ranking accuracy |
| cat2 | Format-aware Retrieval | Cross-format recall (MD, JSON, CSV, YAML, chat, notes) |
| cat3 | Retrieval Lane Decomposition | BM25 vs vector vs hybrid isolation |
| cat4 | Temporal Reconstruction / Scale Degradation | Point-in-time accuracy, recall under scale |
| cat5 | Receipt Chain Verification | Chain depth, integrity, latency |
| cat6 | Fragility Calibration | Leave-one-out analysis, domain diversity |

---

*This ledger is regenerated from source by running `npm run ledger:generate`.*