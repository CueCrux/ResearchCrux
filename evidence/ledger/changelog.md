# Benchmark Changelog

Metric deltas between canonical runs, grouped by suite.

## Suite v1

### OpenAI (`110ada93`) vs EmbedderCrux/nomic (`a86b1733`)

| Metric | OpenAI | EmbedderCrux/nomic | Delta |
|---|---|---|---|
| Pass Rate | 12/12 | 12/12 | = |
| Duration | 9m 18s | 9m 56s | 37s |

| Category:Mode | OpenAI | nomic | Delta |
|---|---|---|---|
| cat1:V1 | PASS | PASS | = |
| cat2:V1 | PASS | PASS | = |
| cat3:V1 | PASS | PASS | = |
| cat4:V1 | PASS | PASS | = |
| cat1:V3.1 | PASS | PASS | = |
| cat2:V3.1 | PASS | PASS | = |
| cat3:V3.1 | PASS | PASS | = |
| cat4:V3.1 | PASS | PASS | = |
| cat1:V4.1 | PASS | PASS | = |
| cat2:V4.1 | PASS | PASS | = |
| cat3:V4.1 | PASS | PASS | = |
| cat4:V4.1 | PASS | PASS | = |

## Suite v2

### OpenAI (`c85daff7`) vs EmbedderCrux/nomic (`5b125495`)

| Metric | OpenAI | EmbedderCrux/nomic | Delta |
|---|---|---|---|
| Pass Rate | 12/12 | 12/12 | = |
| Duration | 20m 44s | 18m 38s | -126s |

| Category:Mode | OpenAI | nomic | Delta |
|---|---|---|---|
| cat1:V1 | PASS | PASS | = |
| cat2:V1 | PASS | PASS | = |
| cat3:V1 | PASS | PASS | = |
| cat4:V1 | PASS | PASS | = |
| cat1:V3.1 | PASS | PASS | = |
| cat2:V3.1 | PASS | PASS | = |
| cat3:V3.1 | PASS | PASS | = |
| cat4:V3.1 | PASS | PASS | = |
| cat1:V4.1 | PASS | PASS | = |
| cat2:V4.1 | PASS | PASS | = |
| cat3:V4.1 | PASS | PASS | = |
| cat4:V4.1 | PASS | PASS | = |

## Suite v3

### OpenAI (`e782fbd0`) vs EmbedderCrux/nomic (`8dd5efff`)

| Metric | OpenAI | EmbedderCrux/nomic | Delta |
|---|---|---|---|
| Pass Rate | 16/16 | 16/16 | = |
| Duration | 5m 10s | 4m 13s | -57s |

| Category:Mode | OpenAI | nomic | Delta |
|---|---|---|---|
| cat1:V1 | PASS | PASS | = |
| cat2:V1 | PASS | PASS | = |
| cat3:V1 | PASS | PASS | = |
| cat4:V1 | PASS | PASS | = |
| cat5:V4.1 | PASS | PASS | = |
| cat6:V1 | PASS | PASS | = |
| cat1:V3.1 | PASS | PASS | = |
| cat2:V3.1 | PASS | PASS | = |
| cat3:V3.1 | PASS | PASS | = |
| cat4:V3.1 | PASS | PASS | = |
| cat6:V3.1 | PASS | PASS | = |
| cat1:V4.1 | PASS | PASS | = |
| cat2:V4.1 | PASS | PASS | = |
| cat3:V4.1 | PASS | PASS | = |
| cat4:V4.1 | PASS | PASS | = |
| cat6:V4.1 | PASS | PASS | = |

## Suite v4 — DQP Isolation Probes

### DQP off (`iso-baseline`) vs DQP on / no-split fix (`iso-nosplit`) — Cat 7+8 only (260 docs)

| Metric | DQP off | DQP on (no-split) | Delta |
|---|---|---|---|
| Pass Rate | 1/2 | 0/2 | -1 |

| Category | DQP off | DQP on | Delta | Notes |
|---|---|---|---|---|
| cat7 (broad recall ≥0.70) | 0.333 FAIL | 0.333 FAIL | = | Corpus-limited, not DQP-related |
| cat8 (P@1 ≥0.80) | 0.850 PASS | 0.675 FAIL | -0.175 | Content-format dependency: flattened text improves FTS token boundaries |

### Isolated corpus (`iso-baseline`, 260 docs) vs Full corpus (`iso-full`, 1025 docs) — DQP off

| Metric | Isolated (260) | Full (1025) | Delta |
|---|---|---|---|
| Pass Rate | 1/2 | 0/2 | -1 |

| Category | Isolated | Full | Delta | Notes |
|---|---|---|---|---|
| cat7 (broad recall) | 0.333 | 0.133 | -0.200 | Cross-category contamination halves recall |
| cat8 (P@1) | 0.850 | 0.488 | -0.362 | Irrelevant docs displace correct top-1 results |

### Key Findings

1. **No-split fix verified**: Cat 7 scores identical with DQP on/off — semantic chunker no longer flattens single-chunk docs
2. **Cat 8 content-format gap**: `fallbackChunk` whitespace flattening (`split(/\s+/).join(" ")`) paradoxically improves FTS precision for structured numbered-list docs
3. **Cat 7 corpus-limited**: v4 corpus max doc ~384 tokens, insufficient for broad recall target — needs v5 corpus with 500-2000+ token docs
4. **Corpus contamination**: Full 1025-doc corpus degrades Cat 7/8 by ~50% vs isolated 260-doc corpus

### Phase 0+1 Execution — 2026-03-14

#### v3 regression with `FEATURE_RELATION_EXPANSION=true` (Run `2df50997`)

| Metric | v3 canonical (`8dd5efff`) | v3 + relation expansion (`2df50997`) | Delta |
|---|---|---|---|
| Pass Rate | 16/16 | 16/22 | = (same tests, more modes) |
| Cat 7 avg_recall | 0.750 | 0.750 | = |
| Cat 8 P@1 (V1) | 0.333 | 0.333 | = |
| Cat 8 P@1 (V3.1) | 0.500 | 0.500 | = |

**No regressions** from enabling relation expansion. Cat 7/8 unchanged because v3 corpus has no populated `artifact_relations` rows.

#### v4 Cat 7+8 per-tenant isolation + relation expansion (Run `47f31b67`)

| Metric | No isolation (1025 docs) | Isolated no-DQP (260 docs) | Isolated + relation expansion |
|---|---|---|---|
| Cat 7 avg_recall | 0.205 | 0.333 | 0.306 |
| Cat 8 P@1 | 0.333–0.488 | 0.850 | 0.625 |

| Observation | Detail |
|---|---|
| Cat 8 P@1 0.625 | Per-tenant isolation eliminates cross-category contamination (+25-88% vs full-corpus). Remaining gap from 0.850 baseline is DQP content-format effect + absence of rerank. |
| Cat 7 avg_recall 0.306 | `artifact_relations` table empty — relation expansion code is active but has no data to expand. Improvement requires populating relations during ingest or via audit runner. |
| Relation data gap | Phase 1 flag is on, code deployed, but v4 corpus ingest doesn't insert relations. Next: audit runner inserts test relations, or ingest pipeline learns to extract them. |

#### v4 Cat 7+8 cross-encoder rerank (Run `7c8cdd9e`)

| Metric | Isolated no-DQP (260 docs) | Isolated + cross-encoder rerank (80 docs clean) |
|---|---|---|
| Cat 8 P@1 | 0.850 | **0.887** |
| Cat 7 avg_recall | 0.333 | 0.234 |

| Observation | Detail |
|---|---|
| Cat 8 P@1 0.887 PASS | Cross-encoder rerank (BGE-reranker-v2-m3 on GPU via vSwitch) improves precision by +4.4%. 71/80 queries hit correct doc at position 1. Exceeds 0.80 target. |
| Cat 7 avg_recall 0.234 | Broad recall limited by topK ceiling (20) vs 15 expected docs per theme. Cross-encoder rescores but doesn't add more candidates. Needs query decomposition or higher topK to improve. |
| Relation expansion + vector scoring | 29-30 candidates expanded per Cat 7 query with pgvector cosine similarity scoring. Expanded candidates compete fairly but Cat 7's topK ceiling is the bottleneck. |
| Cross-category contamination | Previous Cat 8 run (P@1=0.650) had stale Cat 7 data in MV. MV doesn't filter by tenant_id — retrieval sees all tenants. Clean corpus run eliminated contamination. |

### Infrastructure

- **BGE-reranker-v2-m3** deployed on CoreCrux-GPU-1 at port 8082, GPU-accelerated, accessible via vSwitch at `10.80.0.2:8082`
- **Engine rerank.ts** upgraded from cosine-only to cross-encoder when `FEATURE_CROSS_ENCODER_RERANK=true` and `RERANKER_BASE_URL` set
- **retrieval.ts** relation expansion now computes vector similarity for expanded candidates via pgvector `<=>` operator

---

## Phase 3: Multi-Lane Retrieval Infrastructure (2026-03-14)

### Migration 124 deployed

- Added `embedding_scope` column (text, default 'chunk') to `engine.embeddings_1024`, `engine.embeddings_1536`, `engine.embeddings_3072`
- Rebuilt `hybrid_fast_1024` MV with `doc_tsv`, `doc_embedding`, `lane_key`, HNSW indexes for both embedding columns
- Rebuilt `hybrid_fast_3072` MV with `doc_tsv`, `doc_embedding`, `lane_key` (no vector index — pgvector 2000-dim limit prevents HNSW/IVFFlat on 3072-dim)
- All MVs now structurally match `hybrid_fast_768` from migration 123

### Feature flag enabled

- `FEATURE_MULTI_LANE_RETRIEVAL=true` on prod
- Verified mode: base_local_768 + premium_portable_1024 (2 lanes)
- Audit mode: all 4 lanes (768 + 1024 + 1536 + 3072)
- Smoke-tested: no errors, empty premium lanes degrade gracefully (0 candidates, base lane unaffected)

### Pending

- Premium lane embedding tables are empty — no upgrade worker jobs queued yet
- Embedding upgrade workers need jobs to be enqueued via ingest pipeline or backfill script
- 3072-dim MV needs halfvec or dimensionality reduction for ANN indexing

---

*Generated by `npm run ledger:generate`.*