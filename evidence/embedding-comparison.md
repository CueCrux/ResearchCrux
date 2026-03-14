# Embedding Provider Comparison

Side-by-side comparison of OpenAI (`text-embedding-3-small`, 768d) versus EmbedderCrux (`nomic-embed-text-v1.5`, 768d) across all three benchmark suites.

---

## Canonical Runs

| Suite | OpenAI Run | EmbedderCrux/nomic Run | OpenAI Pass | nomic Pass |
|-------|-----------|----------------------|-------------|------------|
| v1 — Baseline | `110ada93` | `a86b1733` | 12/12 | 12/12 |
| v2 — Enterprise | `c85daff7` | `5b125495` | 12/12 | 12/12 |
| v3 — Capability | `e782fbd0` | `8dd5efff` | 16/16 | 16/16 |
| **Total** | | | **40/40** | **40/40** |

Both providers achieve identical pass rates across all suites.

---

## Key Metric Differences

### Scale Degradation (v1 Corpus: 100 → 10,000 docs)

| Metric | OpenAI | EmbedderCrux/nomic | Advantage |
|--------|--------|-------------------|-----------|
| Degradation slope | -0.020/1K docs | -0.010/1K docs | nomic 2x better |
| Precision at 10K docs | 0.300 | 0.400 | nomic +33% |

EmbedderCrux/nomic halves the degradation rate under scale, retaining 33% more precision at 10,000 documents.

### Scale Degradation (v2 Corpus: 550 → 25,000 docs)

| Metric | OpenAI | EmbedderCrux/nomic |
|--------|--------|-------------------|
| Degradation slope | -0.010/1K docs | -0.008/1K docs |
| Recall at 25K docs | 0.367 | convergent |

Enterprise corpus with heterogeneous formats shows convergence between providers. The format diversity dominates over embedding quality.

### Capability Probes (v3)

100% identical results across all v3 categories for both providers:

| Category | OpenAI | nomic |
|----------|--------|-------|
| Cat 1 (Relation-bootstrapped) | PASS | PASS |
| Cat 2 (Format-aware) | PASS | PASS |
| Cat 3 (Lane decomposition) | PASS | PASS |
| Cat 4 (Temporal edge cases) | PASS | PASS |
| Cat 5 (Receipt chain) | PASS | PASS |
| Cat 6 (Fragility calibration) | PASS | PASS |

---

## Production Decision

EmbedderCrux with `nomic-embed-text-v1.5` is the production embedding provider. Reasons:

1. **Better scale behavior** — 2x lower degradation slope, 33% more precision at scale
2. **Self-hosted** — runs on CoreCrux-GPU-1 (RTX 4000 SFF Ada, 20GB), no external API dependency
3. **Identical capability** — no regression on any capability probe
4. **Cost** — zero per-embedding cost after hardware investment

---

## Data Sources

All results from [CueCrux/AuditCrux](https://github.com/CueCrux/AuditCrux) canonical runs:

- `results/v1-canonical.json` (OpenAI) vs `results/v1-nomic-canonical.json`
- `results/v2-canonical.json` (OpenAI) vs `results/v2-nomic-canonical.json`
- `results/v3-canonical.json` (OpenAI) vs `results/v3-nomic-canonical.json`

---

*Generated from AuditCrux canonical results.*
