> **Provenance:** This directory is a read-only mirror of selected content from [CueCrux/AuditCrux](https://github.com/CueCrux/AuditCrux) (MIT licensed). It is included here so that ResearchCrux remains self-contained for public readers. The canonical source is the AuditCrux repository.

# AuditCrux

> Reproducible retrieval quality audit suite -- v4 (12 categories, 1074 docs, 462 queries) + v1-v3 legacy (40/40).

Part of [CueCrux](../README.md) — measures and verifies Engine retrieval quality.

## Contents

- [Why this exists](#why-this-exists)
- [Prerequisites](#prerequisites)
- [Quickstart](#quickstart)
- [Current Status — Phase 7.4](#current-status----phase-74-v740)
- [What each category tests](#what-each-category-tests)
- [Regression Suites](#regression-suites)
- [Known limitations](#known-limitations)
- [MemoryCrux Benchmark](#memorycrux-benchmark)
- [Crux Score — Agent Effectiveness Metric Standard](#crux-score--agent-effectiveness-metric-standard)
- [How to interpret results](#how-to-interpret-results)
- [Contributing](#contributing)
- [Public Evidence Layer](#public-evidence-layer)
- [Key Links](#key-links)

## Why this exists

Most retrieval-augmented generation systems ship without a reproducible quality benchmark. You get a demo, a vague claim about accuracy, and a suggestion to "tune your prompts." There is no published methodology for measuring whether a retrieval engine correctly handles document supersession, causal chain traversal, format heterogeneity, or corpus degradation under scale. This suite exists to fill that gap. Every number has a run ID. Every claim can be reproduced.

The suite measures retrieval quality across three progressively harder corpus configurations, three engine modes, and twelve v4 test categories (plus legacy v1-v3 suites covering an additional 40 category-mode combinations). It separates pipeline retrieval quality (did the right documents reach the scoring layer?) from LLM citation selection (did the model choose to cite them?). It documents known limitations by name, not by omission.

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | >= 20.0.0 | Required for `fetch` and ESM support |
| CueCrux Engine | Running instance | Reachable at `BENCH_TARGET` URL |
| PostgreSQL | Engine's database | Direct connection for corpus insertion and Cat 4 DB checks |
| Embedding provider | OpenAI or EmbedderCrux | Must match the Engine's embedding space |

Required environment variables (see [.env.example](.env.example) for full documentation):

```
BENCH_TARGET=http://127.0.0.1:3333
API_KEY=your-engine-api-key
DATABASE_URL=postgres://user:pass@host:port/engine
OPENAI_API_KEY=sk-...               # if using OpenAI embeddings
AUDIT_EMBEDDING_PROVIDER=openai      # or embeddercrux
```

The Engine must have `ANSWERS_RATE_LIMIT_MAX=5000` (or higher) set in its environment. Cat 5 alone issues 50 queries per run.

## Quickstart

```bash
npm install
cp .env.example .env   # edit with your credentials
npm run audit:v3       # run the v3 capability probe suite (~5 min)
```

To run all three suites:

```bash
npm run audit:v1       # baseline corpus, 4 categories, ~10 min
npm run audit:v2       # enterprise corpus (25K docs), 4 categories, ~20 min
npm run audit:v3       # capability probes, 8 categories, ~5 min
```

Results are written to `scripts/audit-results/` as both `.md` (human-readable) and `.json` (machine-readable).

## Current Status -- Phase 7.4 (v7.4.0)

**Canonical quality baseline:** 12/12 x 5 (runs `037b303a`, `80434381`, `69341abe`, `e0bfbd9b`, `fabf5dc8`)
**Date:** 2026-03-24
**Schema:** Receipt schema 1.1 (llmModel + llmRequestId hash-bound)
**Config manifest:** [`Engine/docs/config-manifest-6.7.json`](../Engine/docs/config-manifest-6.7.json)
**SLO baseline:** [`Engine/docs/slo-baseline.json`](../Engine/docs/slo-baseline.json) v1.3.0

### v4 -- Production Quality (Phase 7.4 baseline)

| Cat | Name | Metric | Run 1 | Run 2 | Run 3 | Run 4 | Run 5 | Target |
|---|---|---|:---:|:---:|:---:|:---:|:---:|---|
| 1 | Supersession / Relation Retrieval | supersession_recall | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | >=0.80 |
| 2 | Format-Aware Ingestion Recall | avg_citation_recall | 0.678 | 0.633 | 0.644 | 0.670 | 0.693 | >=0.50 |
| 3 | Retrieval Lane Decomposition | lane_contribution | PASS | PASS | PASS | PASS | PASS | all lanes |
| 5 | Receipt Chain Verification | chain_integrity | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 |
| 6 | Fragility Calibration | fragility_ordering | PASS | PASS | PASS | PASS | PASS | monotonic |
| 7 | Broad Recall | broad_recall | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | >=0.70 |
| 8 | Proposition Precision@1 | P@1 | 0.963 | 0.963 | 0.963 | 0.963 | 0.963 | >=0.75 |
| 9 | Dedup Detection | dedup_recall | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | >=0.90 |
| 10 | Causal Chain Completeness | chain_completeness | PASS | PASS | PASS | PASS | PASS | >=0.90 |
| 11 | Chunking Stress | broad_recall | 0.927 | 0.927 | 0.927 | 0.927 | 0.927 | >=0.70 |
| 12 | Hard-Negative Overlap | parent_child_recall | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | >=0.80 |
| 13 | Temporal Reconstruction | accuracy | PASS | PASS | PASS | PASS | PASS | >=0.90 |

**Corpus:** 1074 unique docs / 1127 ingested, 462 queries

#### Phase 7.4 Deployment Scope

Phase 7.4 adds LLM metadata binding to CROWN receipts (schema 1.0 -> 1.1). Two new fields (`llmModel`, `llmRequestId`) are hash-bound in the canonical payload via BLAKE3. **Zero retrieval, ranking, or answering code was modified.** 5x server-side validation confirms the 7.3 quality baseline is maintained with zero variance on all non-LLM-contingent metrics.

Cat 7, 8, 11, 12 are perfectly deterministic across all 5 runs. Cat 2 citation_recall varies 0.633-0.693 (LLM-contingent, within 7.3 baseline range of 0.670-0.715).

#### Two-Layer Narrative (inherited from Phase 7.3)

- **Layer 1 (product-owned):** Cat 2 format-aware citation and Cat 12 relation-pair preservation are engineering improvements attributable to shipped code.
- **Layer 2 (externally contingent):** Cat 11 broad_recall 0.927 is not attributable to any code change. Full attribution matrix (runs `f9b80070`, `b5f84195`) ruled out both 7.3 flags. Most likely cause: upstream LLM model drift.

#### Attribution Matrix

| Run | Flag Disabled | Cat 11 broad_recall | Conclusion |
|---|---|:---:|---|
| `f9b80070` | `FEATURE_RELATION_PAIR_PRESERVATION=false` | 0.927 | Not the cause |
| `b5f84195` | `FEATURE_FORMAT_AWARE_CITATION=false` | 0.927 | Not the cause |

### Production Config (config-manifest-6.7 + schema 1.1)

| Flag | Value | Notes |
|---|:---:|---|
| `FEATURE_EVIDENCE_SELECTOR` | **on** | Evidence selection pipeline |
| `EVIDENCE_SELECTOR_MAX_CONTEXTS` | **6** | Max contexts for evidence selector |
| `FEATURE_PRE_SELECTOR_FRAGILITY` | **on** | Fragility scoring before selection |
| `FEATURE_DECOMPOSITION_CACHE` | **on** | Query decomposition caching |
| `DECOMPOSITION_RETRY_ON_LOW_COVERAGE` | **on** | Retry decomposition on low coverage |
| `FEATURE_RELATION_EXPANSION` | **on** | Relation-based candidate expansion |
| `FEATURE_CROSS_ENCODER_RERANK` | **on** | BGE-reranker-v2-m3 on GPU |
| `FEATURE_QUERY_PROFILES` | **on** | Query profile classification |
| `FEATURE_QUERY_DECOMPOSITION` | **on** | Sub-query generation |
| `FEATURE_QDRANT_DUAL_WRITE` | **on** | Write to both Postgres + Qdrant |
| `FEATURE_QDRANT_READ` | **on** | Read vectors from Qdrant |
| `FEATURE_SURFACE_ROUTING` | **on** | Surface-level query routing |
| `FEATURE_ADMISSION_CONTROLLER` | **on** | Query admission control |
| `FEATURE_COVERAGE_ANSWER_SPLIT` | **on** | Coverage-aware answer splitting |
| `FEATURE_REPRESENTATIVE_SELECTION` | **on** | Representative chunk selection |
| `FEATURE_DEDUP_RETRIEVAL_PENALTY` | **on** | Dedup penalty in retrieval scoring |
| `FEATURE_CITATION_CONTROLLER` | **on** | Citation selection controller |
| `FEATURE_CITATION_CASCADE` | **on** | Citation cascade pipeline |
| `FEATURE_CITATION_CASCADE_PROFILE` | **broad_only** | Cascade profile (frozen M1) |
| `ABLATION_PINNED_IDS_POLICY` | **profile_scoped** | Pinned IDs policy (frozen M0) |
| `FEATURE_LEXICAL_SHADOW` | **on** | Lexical shadow scoring |
| `FEATURE_FORMAT_AWARE_CITATION` | **on** | LLM hint for structured-doc citation (7.3) |
| `FEATURE_RELATION_PAIR_PRESERVATION` | **on** | Inject relation children past topK (7.3) |
| `FEATURE_MULTI_LANE_RETRIEVAL` | **off** | Multi-lane RRF (parked -- dilutes quality) |
| `LLM_PROMPT_STYLE` | **evidence_selector** | Prompt template style |
| `VECTOR_DIM` | **768** | nomic-embed-text-v1.5 |
| `RECEIPT_SCHEMA_VERSION` | **1.1** | LLM metadata hash-bound (7.4) |

**Frozen flags (do not change):** `ABLATION_PINNED_IDS_POLICY`, `FEATURE_CITATION_CASCADE_PROFILE` -- M0+M1 frozen per audit guidance.

**Parked (do not reopen):** `FEATURE_MULTI_LANE_RETRIEVAL`, DQP Tier 3 -- recent quality movement dominated by answer-model behavior, not retrieval richness.

### Legacy Suites (v1-v3)

| Suite | Run ID | Categories | Result |
|---|---|---|---|
| v1 — Baseline Corpus | `110ada93` | 4 categories × 3 modes | **12/12** |
| v2 — Enterprise Corpus | `c85daff7` | 4 categories × 3 modes | **12/12** |
| v3 — Capability Probes | `e782fbd0` | 6 categories × 3 modes | **16/16** |

Full results with per-query metrics: [RESULTS.md](RESULTS.md)

### Phase Changelog

| Phase | Date | Change | Impact |
|-------|------|--------|--------|
| 7.4 | 2026-03-24 | LLM metadata binding (schema 1.1): `llmModel` + `llmRequestId` hash-bound in receipt payload via BLAKE3 | Zero retrieval changes. Category count 13 -> 12 (Cat 12v2 retired from canonical suite). 5x server validation confirms 7.3 quality baseline maintained |
| 7.3 | 2026-03-22 | Format-aware citation prompting + relation-pair preservation | Cat 2 citation_recall 0.670-0.715. Cat 12 parent_child_recall 1.000. Cat 11 broad_recall 0.927 (externally contingent) |
| 7.2 | 2026-03-22 | Cat 6 graduated scoring, Cat 11 stabilized via M0+M1 | 13/13 x 3. M0+M1 frozen. 7.2 = quality baseline |
| 7.0 | 2026-03-20 | Cat 12v2 adversarial, shadow replay, release gate | 13/13 x 3. First stabilisation baseline |

## What each category tests

### v1/v2: Supersession Accuracy

When document B supersedes document A, queries about the topic should rank B above A. The test inserts documents with known `supersedes` relations and verifies that the Engine's retrieval + MiSES (Multi-Source Evidence Synthesis) composition respects the supersession chain. v1 uses 3 clean-text documents. v2 uses 20 documents across 4 supersession chains in mixed formats (Markdown policies, JSON configs, email threads, meeting notes).

### v1/v2: Causal Chain Retrieval

A regulation causes an architecture decision, which causes an incident. Queries about the incident should surface the upstream regulation. The test builds multi-hop causal chains using `derived_from` and `cites` relations and measures whether the Engine retrieves documents across the chain. v2 extends this to 5 chains spanning 25 documents in heterogeneous formats.

### v1/v2: Corpus Degradation Under Scale

As the corpus grows from 100 to 10K (v1) or 550 to 25K (v2) documents, retrieval quality degrades. This category measures the degradation slope: precision@5 and recall@5 at each scale point. A healthy system degrades gracefully (slope > -0.03 per 1K docs). The test also runs fragility probes in `verified` mode at each scale point to verify that the leave-one-out fragility scoring remains stable.

### v1/v2: Temporal Reconstruction

Documents have lifecycles: published, updated, superseded, deprecated, contested. The Engine assigns `living_state` labels based on relation graphs and temporal windows. This category inserts documents at 5-6 time snapshots and verifies that the state machine produces correct classifications at each point. v2 uses 60 documents across 6 independent lifecycles with cross-format evidence.

### v3 Cat 1: Relation-Bootstrapped Retrieval

Tests whether `artifact_relations` edges expand the retrieval candidate set. A query matches document A by vocabulary. Document B uses completely different terminology but has a `supersedes` relation to A. If the Engine uses relations during candidate expansion, B appears. Current status: relation expansion is implemented and gated behind `FEATURE_RELATION_EXPANSION` (default `false` for backward compatibility). With the flag enabled, `amendment_found=true` — the amendment document surfaces in the candidate pool via the `supersedes` relation edge despite zero vocabulary overlap with the query. The baseline (flag off) behaviour is preserved and still passes Cat 1.

### v3 Cat 2: Format-Aware Ingestion Recall

The same factual content expressed in 6 formats: Markdown, JSON, YAML, CSV, chat transcript, and meeting notes. Measures retrieval recall stratified by MIME type. Current result: all 6 formats achieve 100% retrieved recall (the pipeline finds them). Citation recall varies by format — the LLM prefers citing prose over structured data. This distinction between retrieved recall and citation recall is a key finding.

### v3 Cat 3: BM25 vs Vector Decomposition

Decomposes the hybrid retrieval pipeline into its BM25 (keyword) and vector (semantic) contributions. Three document classes: K-class (rare unique terms, BM25-favorable), V-class (paraphrased content with zero keyword overlap, vector-favorable), H-class (both keyword-matchable and semantically similar). All three classes achieve 100% retrieved recall. V-class documents are retrieved but rarely cited — the LLM favors documents with keyword anchors. Pass criteria use retrieved recall, not citation recall.

### v3 Cat 4: Temporal Edge Cases

Three patterns that stress the living state machine: (A) contested-to-superseded transitions, (B) rapid succession (4 versions within 10 days), (C) documents near the 90-day window boundary. Direct DB state verification, no API queries. Current result: 12/12 correct across all patterns.

### v3 Cat 5: Receipt Chain Stress

50 queries in `verified` mode against 2 documents, building a receipt chain up to the CTE depth limit of 50. Measures chain integrity and verification latency at 10 depth checkpoints. Current result: all chains intact at depth 50, verification latency ~3ms (flat, no degradation with depth).

### v3 Cat 6: Fragility Calibration

Three scenarios with controlled domain distribution to test whether leave-one-out fragility scoring produces distinguishable scores. F1 (2 docs, 2 domains) should produce high fragility. F2 (4 docs, 3 domains) moderate. F3 (6 docs, 4 domains) low. Current result: F1=1.0, F2=0.0, F3=0.0. Monotonic ordering is correct (F1 > F2 >= F3). F2 and F3 produce 0.0 because the leave-one-out probe only triggers when removing a citation would violate the `minDomains=2` constraint, which requires the citation set to be exactly at the minimum.

> **Note on expected ranges:** The `results/v3-canonical.md` file shows F2 and F3 as "OUT OF RANGE" against their original expected ranges ([0.3, 0.7] and [0.1, 0.5] respectively). Those expected ranges were set assuming fragility would be proportional to the fraction of load-bearing citations. The actual Engine implementation produces a binary distribution — 1.0 when the citation set is exactly at `minDomains`, 0.0 when redundant domain coverage exists. The test PASSes because the monotonic ordering F1 > F2 >= F3 is the correct pass criterion. The expected ranges in the result file are a documentation artefact, not a failure signal.

### v3 Cat 7: Broad-Query Recall

Tests whether broad, theme-level questions recover an entire source cluster when hierarchical summary chunks are present. Each topic includes multiple source chunks plus a `hierarchical_summary` chunk inserted with the same artifact lineage metadata the DQP pipeline uses. Pass criteria use retrieved recall, not citation recall: the summary must appear in the retrieved set for every query and the average retrieved recall across the topic cluster must remain at or above 0.75.

### v3 Cat 8: Proposition Precision@1

Tests whether targeted fact queries rank `proposition` chunks first once proposition-aware retrieval weights are active. Each topic includes one source chunk and one derived proposition chunk sharing the same artifact key. The category measures retrieved precision@1 using the first ID in `retrievedIds`; citation precision@1 is recorded as a diagnostic only because LLM citation ordering is not stable enough to be the primary pass criterion.

### v4 Cat 9: Dedup Detection

Tests whether semantically duplicate documents are correctly identified and consolidated. Inserts near-identical documents with minor paraphrasing and verifies the dedup pipeline detects them. Pass criterion: dedup_recall ≥0.90.

### v4 Cat 10: Causal Chain Completeness

Tests multi-document causal chains: given a query about a downstream effect, measures whether the full causal chain (upstream causes, intermediary documents) is retrieved. Pass criterion: chain_completeness ≥0.90.

### v4 Cat 11: Chunking Stress

Tests broad recall on long documents (500-2000+ tokens) that exercise the semantic chunker. Measures whether all relevant chunks from a large document set are retrieved for theme-level queries. Pass criterion: broad_recall ≥0.70. Note: Cat 11's improvement from 0.722 to 0.927 in Phase 7.3 is externally contingent (LLM model drift), not attributable to any shipped code change.

### v4 Cat 12: Hard-Negative Overlap

Tests parent-child document retrieval when relation-expanded children compete with hard-negative overlapping documents. A parent ADR makes the topK cutoff; its implementing runbook docs are found by relation expansion but rank below topK. Measures whether relation-pair preservation injects the child. Pass criterion: parent_child_recall ≥0.80.

### v4 Cat 12v2: Hard-Negative Overlap v2

Extended overlap scenarios with additional hard-negative patterns. Pass criterion: overlap_recall ≥0.80.

### v4 Cat 13: Temporal Reconstruction

Point-in-time accuracy for document lifecycle states across temporal snapshots. Pass criterion: accuracy ≥0.90.

## Regression Suites

### Prompt-Spillover Suite

Categories sensitive to LLM prompt wording: Cat 2, 10, 11. Run when changing prompt text in `Engine/src/services/llm.ts` or `prompt_hashes` in the config manifest.

```bash
./scripts/audit-v4/prompt-spillover-suite.sh          # single run
./scripts/audit-v4/prompt-spillover-suite.sh --runs 3  # 3× stability
```

### Model-Drift Sentinel Pack

Canary suite for detecting upstream LLM model/provider changes: Cat 2, 11, 12. Run when the model provider or model ID changes.

```bash
./scripts/audit-v4/model-drift-sentinel.sh            # single run
./scripts/audit-v4/model-drift-sentinel.sh --runs 3    # 3× stability
```

## Known limitations

**Embedding space.** v4 canonical runs use EmbedderCrux/nomic-embed-text-v1.5 (768d). Legacy v1-v3 runs cover both OpenAI and nomic. The embedding cache is keyed by provider to prevent cross-contamination.

**Format-aware citation gap (Cat 2).** All formats achieve 100% retrieved recall. The remaining gap is citation recall: the LLM prefers citing prose over structured data. Phase 7.3 added `FEATURE_FORMAT_AWARE_CITATION` which improved avg_citation_recall from ~0.626 to 0.670-0.715 by hinting the LLM to cite structured docs. The gap is substantially narrowed but not fully closed — still LLM-bounded.

**Relation expansion and pair preservation.** `FEATURE_RELATION_EXPANSION=true` (production default since Phase 7.0). `FEATURE_RELATION_PAIR_PRESERVATION=true` (Phase 7.3) injects relation-expanded children that survive reranking but miss the topK cutoff (capped at 2 injections). This restored Cat 12 parent_child_recall from 0.846 to 1.000.

**Cat 11 externally contingent.** broad_recall improved 0.722→0.927 in Phase 7.3 but is not attributable to any shipped code. Full attribution matrix (runs `f9b80070`, `b5f84195`) ruled out both 7.3 flags. Most likely cause: upstream LLM model/provider drift. Monitored via model-drift sentinel pack.

**Model provenance.** Baseline runs used gpt-4o-mini (OpenAI). Model/provider drift is a first-class release variable. Model provenance is pinned in the config manifest and tracked in audit JSON output.

**Fragility scoring is corpus-dependent.** Fragility scores measure how sensitive a specific answer is to the removal of individual citations. The score depends on the number of domains represented in the citation set and the `minDomains` constraint. A fragility score of 0.0 does not mean "robust" in the abstract — it means "no single citation removal violates the domain diversity constraint for this specific query."

**LLM citation nondeterminism.** The LLM that selects which retrieved documents to cite in the final answer is nondeterministic. Citation recall can vary between runs for the same corpus. Retrieved recall (measuring pipeline quality before LLM selection) is deterministic given fixed embeddings and corpus. The suite reports both metrics and uses retrieved recall for pass/fail criteria where LLM nondeterminism would cause instability.

**Synthetic corpus.** All corpus documents are synthetic. They are designed to test specific retrieval properties, not to represent real-world document distributions. The Meridian Financial Services corpus (v2) is the most realistic but is still entirely fictional.

## MemoryCrux Benchmark

> LLM-in-the-loop benchmark proving that tool-mediated memory outperforms long-context injection for agentic workflows — across safety, decision recall, and production-scale retrieval. Full documentation in [`benchmarks/memorycrux/`](benchmarks/memorycrux/README.md).

**Date:** 2026-03-27. **Cells:** ~80 (Alpha 18 + Beta 18 + Gamma ~30 + Delta 15). **Cost:** ~$55.

Tests two claims across 4 projects (Alpha→Delta), 5 arms (C0/C2/F1/T2/T3), and 3 models (Sonnet 4.6, GPT-5.4, GPT-5.4-mini):

| Claim | Status | Evidence |
|---|---|---|
| **Safety layer** | **PROVEN** | All T2 arms SAFE across 3 models (Beta). Sonnet C0/C2 UNSAFE — most capable model was most dangerous without guardrails. |
| **Retrieval at scale** | **PROVEN** | At 2M+ tokens (Delta), tool arms achieve 96–100% core recall. Context-stuffing achieves 8–44% — worse than bare control. |

### Delta Headline (2M+ token stress test)

| Arm | Sonnet 4.6 | GPT-5.4 | GPT-5.4-mini |
|-----|-----------|---------|-------------|
| **C0** (bare) | 44% | 28% | 20% |
| **C2** (context-stuffed) | 28% | 8% | 40% |
| **F1** (raw tools) | **100%** | **100%** | 96% |
| **T2** (MCP tools) | **100%** | 80% | 72% |
| **T3** (compound tools) | 96% | **100%** | 0%* |

*mini T3 suffered a tool integration failure — excluded from analysis.

**Key findings:** Context-stuffing (C2) is worse than bare (C0) on the strongest models at 2M scale — the models drown in noise. C2 costs $10–13 per run vs $1–6 for tool arms. Tool-mediated retrieval is both cheaper and dramatically more effective.

See [`benchmarks/memorycrux/results/delta-summary.md`](benchmarks/memorycrux/results/delta-summary.md) for the full 15-cell analysis and [`benchmarks/memorycrux/METHODOLOGY.md`](benchmarks/memorycrux/METHODOLOGY.md) for scoring definitions.

## Crux Score — Agent Effectiveness Metric Standard

> Universal metric for measuring AI agent session effectiveness. See [`METRICS.md`](METRICS.md).

The **Crux Score (Cx)** is expressed in **Effective Minutes (Em)** — quality-adjusted minutes of expert work replaced by the agent. It combines 16 fundamental dimensions across 5 categories (time, information, continuity, safety, economic) into a single time-anchored composite. Safety is a hard gate: an unsafe session scores 0 Em regardless of other performance.

The standard is designed to be adopted by any agent benchmark, not just MemoryCrux. Definitions are immutable once published (see lifecycle rules in METRICS.md). New metrics may be added; existing definitions cannot change.

## How to interpret results

**Citation recall vs retrieved recall.** Citation recall measures which expected documents the LLM chose to cite in its answer. Retrieved recall measures which expected documents the retrieval pipeline returned to the LLM before citation selection. Retrieved recall isolates pipeline quality from LLM behavior. When retrieved recall is 1.0 but citation recall is 0.33, the pipeline found everything — the LLM just chose to cite different documents.

**Fragility scores.** A fragility score of 1.0 means removing any single citation would violate the domain diversity constraint (`minDomains=2`). A score of 0.0 means no single removal violates the constraint. This is a structural property of the citation set, not a judgment about answer quality. Fragility is only computed in `verified` and `audit` modes where `minDomains=2` is enforced.

**Degradation slopes.** A slope of -0.02 precision@5 per 1K documents means that adding 1,000 noise documents reduces precision@5 by 0.02. The v1 baseline slope is -0.020 (V1 mode) and -0.019 (V4.1 mode). The v2 enterprise slope is -0.010 (V1) and -0.008 (V4.1). The enterprise corpus degrades more slowly because the heterogeneous format distribution provides more distinctive content per document.

**Pass/fail criteria.** Each category has specific, documented pass criteria. A PASS means the measured metrics exceed the threshold. Categories designed to document baselines (Cat 1 relation expansion, Cat 2 format recall, Cat 6 fragility calibration) have relaxed thresholds that characterize current behavior rather than assert ideal behavior. Categories 7 and 8 intentionally use retrieval-stage metrics (`retrieved_recall`, retrieved precision@1) so the suite measures DQP retrieval behavior directly instead of LLM citation preferences.

## Contributing

### Adding corpus documents

Each category's corpus is defined in a TypeScript file under `scripts/audit-v{N}/lib/corpus/`. Documents follow the `CorpusDoc` or `CorpusDocV2` type. To add documents:

1. Add your document objects to the appropriate category file
2. Add corresponding ground truth entries (expected doc IDs, expected rankings)
3. Ensure document IDs are unique across the category
4. Run `npm run audit:v3 -- --dry-run` to validate ID uniqueness and reference integrity

### Adding categories

1. Create a new corpus file: `scripts/audit-v3/lib/corpus/cat7-your-category.ts`
2. Export `getCat7Corpus()` returning `{ docs, relations?, livingStates?, groundTruths }`
3. Add a `runCat7()` function to the orchestrator (`quality-audit-v3.ts`)
4. Wire it into the mode/category dispatch loop
5. Add the category to the `V3CategoryId` type in `types-v3.ts`
6. Document what it tests and why in this README

### Running a new canonical result

After changes, run the full suite and record the result:

```bash
npm run audit:v3 -- --mode all --cat all
```

Copy the generated `.md` and `.json` files from `scripts/audit-results/` to `results/` with the appropriate version prefix. Add a row to [RESULTS.md](RESULTS.md).

## Public Evidence Layer

Results from this suite are published in [ResearchCrux](../ResearchCrux/README.md), which is the public-facing evidence and protocol layer. Outsiders reviewing CROWN claims start there. Key surfaces:

- [Benchmark ledger](../ResearchCrux/evidence/ledger/README.md) -- per-run metrics, deltas, and downloadable evidence
- [Proof gallery](../ResearchCrux/proof-gallery/README.md) -- CROWN receipt examples with verification walkthroughs
- [SCITT integration guide](../ResearchCrux/protocol/scitt-compat/scitt-integration.md) -- CROWN-to-SCITT mapping (standards-facing)
- [Regulatory mapping](../ResearchCrux/evidence/regulatory-mapping.md) -- EU AI Act and DORA coverage

AuditCrux produces the evidence; ResearchCrux publishes it.

## Key Links

- Platform overview: [CueCrux README](../README.md)
- Progress tracker: [PlanCrux/docs/master-plan/progress-tracker.md](../PlanCrux/docs/master-plan/progress-tracker.md)
- Related repos: [Engine](../Engine/README.md) (system under test), [EmbedderCrux](../EmbedderCrux/README.md) (embedding provider), [ResearchCrux](../ResearchCrux/README.md) (published evidence)

## License

MIT
