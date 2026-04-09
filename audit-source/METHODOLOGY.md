# Methodology

## The problem

Retrieval-augmented generation systems are evaluated almost exclusively on end-to-end answer quality: "does the output look right?" This conflates four independent failure modes:

1. The retrieval pipeline failed to surface relevant documents
2. The retrieval pipeline surfaced the right documents but ranked them poorly
3. The LLM received good candidates but chose to cite the wrong ones
4. The LLM cited the right documents but synthesized the answer incorrectly

Most benchmarks measure (4) and assume (1-3) are fine. When the answer is wrong, you cannot tell which layer failed. When the answer is right, you cannot tell whether the pipeline is fragile — whether removing one document or adding a thousand noise documents would break it.

This suite measures (1) and (2) directly. It separates pipeline retrieval quality from LLM citation behavior. It tests retrieval under controlled adversarial conditions: superseded documents, causal chains across formats, corpus scaling from 100 to 25,000 documents, temporal lifecycle transitions, and hybrid retrieval lane decomposition.

The CueCrux Engine is a retrieval system with three distinguishing features that require dedicated testing:

- **Multi-Source Evidence Synthesis (MiSES):** Answers are composed from multiple sources with a minimum domain diversity constraint (`minDomains=2` in verified/audit modes). This means single-source answers are rejected, and the citation set must span at least two independent domains.
- **Living state machine:** Documents have lifecycle states (active, superseded, deprecated, contested, dormant, stale) computed from an `artifact_relations` graph. The retrieval pipeline should prefer active documents over superseded ones.
- **CROWN receipt chain:** Every answer produces a cryptographic receipt linking it to the knowledge state at query time. Receipts form a chain via `parent_snap_id`, enabling verification that no knowledge mutations occurred between answers.

Standard retrieval benchmarks do not test any of these.

## Suite architecture

The audit programme consists of three suites, each testing a different aspect of retrieval quality:

### v1 — Baseline (4 categories, ~40 docs, scales to 10K)

Clean text corpus. Every document is `text/plain`. Tests the four fundamental retrieval properties:

| Category | What it tests | Corpus size |
|---|---|---|
| Supersession Accuracy | Do `supersedes` relations affect ranking? | 3 docs |
| Causal Chain Retrieval | Can the pipeline traverse `derived_from` chains? | 3 docs, 2 queries |
| Corpus Degradation | How does precision degrade from 100 to 10K docs? | 100 signal + noise |
| Temporal Reconstruction | Is `living_state` correct across 5 time snapshots? | 20 docs, 6 snapshots |

v1 establishes the baseline. If v1 fails, the Engine has a fundamental retrieval defect.

### v2 — Enterprise (4 categories, 550 docs, scales to 25K)

Heterogeneous MIME corpus modelled on a fictional enterprise ("Meridian Financial Services"). Same four categories as v1, but with:

- 8 document formats: Markdown, JSON, YAML, CSV, HTML, email threads, chat exports, meeting notes
- 20 fictional employees, 15 microservices, 10 project codenames
- Cross-format supersession chains (a Markdown policy superseded by a JSON config)
- Cross-format causal chains (a compliance email → an architecture ADR → a K8s deployment YAML)

v2 answers: "does the Engine work when the corpus looks like a real enterprise knowledge base?" The same four properties are tested, but the corpus is realistic enough to surface format-dependent retrieval failures.

### v3 — Capability Probes (6 categories, ~64 docs)

Small, focused tests that probe specific Engine capabilities surfaced by v2 results. Each category is a binary or stress test:

| Category | What it probes | Docs | Queries |
|---|---|---|---|
| Relation-Bootstrapped Retrieval | Does the relation graph expand retrieval candidates? | 8 | 1 |
| Format-Aware Ingestion Recall | Is recall format-dependent? | 18 | 3 |
| BM25 vs Vector Decomposition | Which retrieval lane finds which document class? | 12 | 6 |
| Temporal Edge Cases | Does the state machine handle boundary conditions? | 12 | 0 (DB checks) |
| Receipt Chain Stress | Does receipt verification degrade with chain depth? | 2 | 50 |
| Fragility Calibration | Is fragility scoring distinguishable across scenarios? | 12 | 3 |

v3 is fast (~5 minutes) and designed for CI gating.

## Engine versions

Each suite runs against three Engine versions (modes). The mode determines which features are active during retrieval:

| Mode | Relations | Living State | Receipt Chain | CoreCrux Integration |
|---|:---:|:---:|:---:|:---:|
| V1 | No | No | Yes | No |
| V3.1 | Yes | Yes | Yes | No |
| V4.1 | Yes | Yes | Yes | Yes |

**V1** is the baseline: pure hybrid retrieval (BM25 + vector) with RRF fusion, no relation awareness, no living state filtering.

**V3.1** adds `artifact_relations` and `artifact_living_state`. The retrieval pipeline can use relation edges for MiSES composition and living state for document freshness filtering.

**V4.1** adds CoreCrux integration: an external knowledge graph service that provides authoritative entity resolution and analytics. In the current deployment, V4.1 queries CoreCrux via gRPC and falls back to V3.1 behavior when CoreCrux is unavailable.

Running all three modes against the same corpus reveals whether relation awareness and living state improve retrieval quality. The canonical result shows that V1 and V3.1 produce identical retrieval results for most categories — the relation graph currently affects MiSES composition and living state classification, but not candidate retrieval. V4.1 shows marginally slower degradation under scale (slope -0.019 vs -0.020 per 1K docs).

## Corpus design

### Synthetic vs real

All corpus documents are synthetic. This is deliberate:

1. **Reproducibility.** The corpus is generated deterministically from TypeScript code. Any researcher can produce an identical corpus and verify results.
2. **Control.** Synthetic documents allow precise control over vocabulary overlap, format distribution, relation topology, and temporal ordering. Real corpora introduce confounders that make it impossible to isolate specific retrieval properties.
3. **No data licensing issues.** The corpus can be published under MIT without clearance.

The tradeoff is ecological validity. The Meridian Financial Services corpus (v2) is designed to approximate real enterprise knowledge bases — it has the same format distribution, organizational structure, and document lifecycle patterns — but it is not a real knowledge base.

### Contamination design (Cat 3)

Cat 3 tests retrieval under scale by adding noise documents. The noise generation strategy is critical:

- **Topical noise, not random noise.** Noise documents are topically related to signal documents (same domain vocabulary) but do not answer the benchmark queries. This is harder than random noise — the retrieval pipeline must distinguish between "about the same topic" and "answers this question."
- **Deterministic generation.** Noise documents are generated from a hash-based template system indexed by document number. The same corpus size produces the same noise documents across runs.
- **Format distribution.** In v2, noise documents are assigned MIME types using a hash-based selection that approximates the enterprise format distribution. This prevents the noise from being trivially distinguishable by format alone.

### Document class design (Cat 3 v3)

The BM25 vs Vector Decomposition category uses three document classes designed to isolate retrieval lane contributions:

| Class | Design principle | Example |
|---|---|---|
| K (Keyword) | Contains rare unique terms that BM25 can match exactly. Vector similarity may not help because the terms are domain-specific jargon with no embedding-space neighbors. | "XK7-Bravo protocol", "ERR_SETTLE_RECON_MISMATCH", "RB-2025-0417" |
| V (Vector) | Paraphrased content with zero keyword overlap with the query. Only vector similarity can find these. | Query: "API key rotation policy" → Doc about "credential lifecycle management and periodic secret renewal" |
| H (Hybrid) | Both keyword-matchable and semantically similar. Both BM25 and vector lanes should contribute. | Standard technical documentation with expected terminology |

This design reveals which retrieval lane carries which load. The canonical result: K-class (BM25 recall 1.0), V-class (vector retrieved recall 1.0, citation recall 0.0), H-class (hybrid recall 1.0). V-class documents are consistently retrieved but not cited — a finding about LLM citation preference, not pipeline quality.

## Citation recall vs retrieved recall

This is the most important methodological distinction in the suite.

**Citation recall** = (expected documents cited by the LLM) / (total expected documents)

**Retrieved recall** = (expected documents returned by the retrieval pipeline) / (total expected documents)

The retrieval pipeline returns a ranked candidate set to the LLM. The LLM then selects which candidates to cite in its answer. These are different operations with different failure modes.

When citation recall is low but retrieved recall is high, the pipeline is working correctly — the LLM is choosing not to cite some retrieved documents. This happens consistently with V-class (semantic-only) documents in Cat 3: the LLM prefers citing documents that have keyword anchors matching the query, even when semantically equivalent documents are available.

When both are low, the pipeline failed to retrieve the expected documents.

The suite reports both metrics. Pass/fail criteria use retrieved recall for categories where LLM nondeterminism would cause instability (Cat 2 format recall, Cat 3 decomposition). Citation recall is used where the LLM's selection behavior is the thing being tested (Cat 1 supersession ranking, Cat 6 fragility).

## Embedding space dependency

The audit suite embeds corpus documents using the same embedding provider as the Engine. Cosine similarity is only meaningful within a single embedding space. Using OpenAI embeddings for the audit while the Engine uses EmbedderCrux (nomic-embed-text-v1.5) would produce meaningless retrieval results.

**Current state:** The canonical runs use OpenAI `text-embedding-3-small` at 768 dimensions. The production Engine also uses OpenAI for the base lane. EmbedderCrux is deployed on CoreCrux-GPU-1 but not yet integrated into the audit suite's embedding workflow.

**Cache isolation:** The embedding cache is keyed by `{provider}-{dimension}` (e.g., `embeddings-cache-openai-768.json`). Switching providers invalidates the cache automatically — there is no risk of cross-contamination between embedding spaces.

**Impact on results:** Retrieval patterns are embedding-dependent. Switching to EmbedderCrux may change which documents are retrieved for a given query. The relative ordering (BM25-favorable vs vector-favorable) should be preserved, but absolute recall numbers may shift. A new canonical run will be required after the embedding switch.

## How to reproduce results

### Environment

The canonical runs were executed on CueCrux-Data-1:

| Component | Specification |
|---|---|
| CPU | Intel i9-13900 (24 cores, 32 threads) |
| RAM | 192 GB DDR5 ECC |
| Storage | 2x 1.92TB NVMe RAID-1 |
| PostgreSQL | pgvector/pgvector:pg16 |
| Node.js | 22.x |
| Engine | CueCrux Engine, commit at 2026-03-11 |

### Commands

```bash
# Clone and install
git clone https://github.com/cuecrux/crux-audit.git
cd crux-audit
npm install

# Configure (edit .env with your Engine credentials)
cp .env.example .env

# Run individual suites
npm run audit:v1                                    # ~10 min
npm run audit:v2                                    # ~20 min
npm run audit:v3                                    # ~5 min

# Run v3 with specific options
npx tsx scripts/audit-v3/quality-audit-v3.ts --mode V4.1 --cat 3
npx tsx scripts/audit-v3/quality-audit-v3.ts --dry-run

# Run all suites
npm run audit:all                                   # ~35 min
```

### Expected runtime

| Suite | Corpus Insert | Queries | Total |
|---|---|---|---|
| v1 | ~2 min (includes 4 scale points) | ~8 min (40 queries × 3 modes) | ~10 min |
| v2 | ~5 min (includes 6 scale points to 25K) | ~15 min (40 queries × 3 modes) | ~20 min |
| v3 | ~1 min (64 docs, cached embeddings) | ~4 min (63 queries × 3 modes) | ~5 min |

Timings assume a local Engine with sub-second database access. Remote Engine connections add network latency per query.

### Verifying results

Results are written to `scripts/audit-results/` with timestamps. Compare against the canonical results in `results/`:

```bash
# Quick pass/fail check
grep "PASSED\|FAILED" scripts/audit-results/audit-v3-*.md

# Detailed comparison
diff results/v3-canonical.md scripts/audit-results/audit-v3-*.md
```

Results should match the canonical run within LLM nondeterminism bounds (citation recall may vary by ±0.1, retrieved recall should be identical given the same embeddings and corpus).

## Scoring methodology

### Precision and recall

Precision@K = (expected documents found in top K citations) / min(K, total citations returned)

Recall = (expected documents found) / (total expected documents)

Both are computed per query. Category-level metrics are averages across queries.

### Ranking accuracy

For categories with expected ranking pairs `[higher, lower]`:

- If `higher` appears above `lower` in the citation list: correct
- If `higher` appears but `lower` does not: correct (presence implies higher rank than absence)
- If `higher` does not appear: incorrect
- If `lower` appears above `higher`: incorrect

Ranking accuracy = correct pairs / total pairs.

### Fragility score

The Engine's leave-one-out fragility score. For each citation in the answer, the Engine simulates removing that citation and checks whether the remaining set still satisfies the `minDomains` constraint. The fragility score is the fraction of citations whose removal would violate the constraint.

Fragility 1.0: every citation is load-bearing. Removing any one breaks domain diversity.
Fragility 0.0: no single removal breaks domain diversity. The citation set has redundant domain coverage.

### Degradation slope

Linear regression slope of precision@5 across corpus scale points, normalized per 1K documents. A slope of -0.020 means each additional 1,000 noise documents reduces precision@5 by 0.020.

### MiSES Jaccard

Jaccard similarity between the expected MiSES composition and the actual `crown.citationIds`. Measures whether the Engine's multi-source evidence synthesis selected the expected document combination.
