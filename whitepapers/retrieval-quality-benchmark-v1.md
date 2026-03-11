# Retrieval Quality Benchmarking for Enterprise Knowledge Systems

**Version:** 1.0
**Date:** March 2026
**Authors:** CueCrux Engineering
**Benchmark Suite:** [CueCrux/AuditCrux](https://github.com/CueCrux/AuditCrux) (MIT, reproducible)

---

## Abstract

Retrieval-augmented generation systems are evaluated primarily on end-to-end answer quality, conflating retrieval pipeline failures with language model synthesis failures. No widely adopted benchmark tests the retrieval properties that matter in regulated enterprise contexts: whether superseded documents are correctly deprioritised, whether causal chains can be traversed across vocabulary gaps, whether retrieval quality degrades gracefully under corpus scale pressure, or whether temporal knowledge states can be reconstructed for audit purposes.

This paper presents a retrieval quality benchmark programme consisting of three suites (14 test categories) executed across three engine generations. The benchmark separates pipeline retrieval quality from language model citation selection, introduces the retrieved recall metric to isolate pipeline behavior from LLM nondeterminism, and measures performance against two corpus types: a synthetic clean corpus for mechanism validation and a 25,000-document enterprise corpus with 9 MIME types for production validity. The canonical result is 40/40 categories passed across all suites and engine modes, with specific findings on cross-format retrieval gaps, BM25 vs vector lane contributions, and receipt chain verification scaling.

The full benchmark suite, corpus definitions, and canonical results are published as open source. Every result cited in this paper has a run ID and can be independently reproduced.

---

## 1. The Problem

Standard retrieval benchmarks test factual lookup: given a question, does the system return a document that contains the answer? This is a necessary but insufficient evaluation for enterprise knowledge systems. The failure modes that matter in regulated enterprise contexts are qualitatively different from factual lookup failures.

**Supersession accuracy.** When a policy is updated, the previous version remains in the corpus. Both versions share vocabulary. A system that retrieves the superseded version has not failed in any way that standard recall metrics would detect — it returned a document that contains relevant information. But the information is wrong, because it is no longer current. In a compliance context, an AI-assisted decision based on a superseded policy is not a retrieval error. It is a regulatory exposure.

**Causal chain retrieval.** Enterprise decisions are connected by causal chains: a regulation causes an architecture decision, which causes a deployment change, which causes an incident. Understanding the incident requires traversing the chain. Standard retrieval evaluates each query in isolation. It does not measure whether a system can surface documents connected by causal relationships when the documents share no vocabulary — when the regulation uses legal terminology and the incident report uses operational terminology, but the connection is real.

**Corpus scale degradation.** Retrieval quality degrades as the corpus grows. This degradation is not linear, not predictable from small-corpus performance, and not tested by benchmarks that operate on fixed-size document collections. An enterprise corpus grows continuously. A system that performs well at 500 documents and poorly at 25,000 has a failure mode that is invisible until production deployment.

**Temporal knowledge state reconstruction.** Documents have lifecycles: they are published, updated, superseded, deprecated, contested. A regulatory auditor asking "what did the system know at the time of this decision?" requires the ability to reconstruct the knowledge state at a specific point in time. Standard retrieval benchmarks operate in a static present tense. They do not test temporal reconstruction.

These four failure modes share a property: they are invisible to standard benchmarks but material to enterprise compliance requirements. The EU AI Act Article 13 requires that high-risk AI systems provide sufficient transparency for users to interpret output and use it appropriately. DORA Articles 8-11 require that financial entities maintain comprehensive audit trails for ICT-related decisions. A retrieval system that cannot demonstrate supersession accuracy, causal completeness, scale stability, and temporal reconstruction cannot satisfy these requirements — regardless of how well it performs on factual lookup.

---

## 2. Benchmark Methodology

The benchmark programme consists of three suites, each testing retrieval quality under progressively harder conditions. The full methodology is documented in the [AuditCrux METHODOLOGY.md](https://github.com/CueCrux/AuditCrux/blob/main/METHODOLOGY.md). This section summarises the design.

### 2.1 Suite Architecture

| Suite | Corpus | Categories | Scale | Purpose |
|---|---|---|---|---|
| v1 | Clean text, ~40 docs | 4 | 100 → 10,000 | Mechanism validation |
| v2 | Enterprise, 550 docs, 9 MIME types | 4 | 550 → 25,000 | Production validity |
| v3 | Focused probes, ~64 docs | 6 | Fixed | Capability verification |

**v1** establishes the baseline with a clean text corpus. Every document is plain text. If v1 fails, the engine has a fundamental retrieval defect.

**v2** uses a heterogeneous enterprise corpus modeled on a fictional financial services firm (Meridian Financial Services). Documents span 9 MIME types: Markdown, JSON, YAML, CSV, HTML, email threads, chat exports, meeting notes, and wiki scratchpads. Supersession chains cross format boundaries (a Markdown policy superseded by a JSON configuration). Causal chains cross format boundaries (a compliance email leading to an architecture decision record leading to a Kubernetes deployment YAML). The corpus scales from 550 base documents to 25,000 with deterministic, topically-related noise.

**v3** probes specific engine capabilities with small, targeted corpora: relation-bootstrapped retrieval, format-aware ingestion recall, BM25 vs vector lane decomposition, temporal edge cases, receipt chain stress testing, and fragility calibration.

### 2.2 Engine Generations

Each suite runs against three engine modes:

| Mode | Relations | Living State | Receipt Chain | CoreCrux Integration |
|---|:---:|:---:|:---:|:---:|
| V1 | — | — | Yes | — |
| V3.1 | Yes | Yes | Yes | — |
| V4.1 | Yes | Yes | Yes | Yes |

Running all three modes against the same corpus reveals whether relation awareness and living state classification improve retrieval quality relative to the baseline.

### 2.3 Citation Recall vs Retrieved Recall

The benchmark introduces a distinction between two recall metrics:

**Citation recall** = (expected documents cited by the LLM) / (total expected documents)

**Retrieved recall** = (expected documents returned by the retrieval pipeline to the LLM) / (total expected documents)

The retrieval pipeline returns a ranked candidate set. The language model selects which candidates to cite. These are different operations with different failure modes. When citation recall is low but retrieved recall is high, the pipeline is functioning correctly — the language model is choosing not to cite some retrieved documents. This distinction is essential for attributing failures to the correct layer.

The benchmark reports both metrics. Pass/fail criteria use retrieved recall for categories where LLM nondeterminism would cause instability (format recall, lane decomposition) and citation recall for categories where the model's selection behavior is the property being tested (supersession ranking, fragility).

---

## 3. Results

All results reference canonical runs stored in the [AuditCrux results/ directory](https://github.com/CueCrux/AuditCrux/tree/main/results). Every metric cited below can be independently verified by re-running the suite against an identically configured engine instance.

### 3.1 Supersession Accuracy

**v1 (run 110ada93):** 100% recall, 100% ranking accuracy across all three engine modes. When document B supersedes document A, the engine consistently ranks B above A.

**v2 (run c85daff7):** 83.3% recall (V1), 75.0% recall (V3.1, V4.1). 90.0% ranking accuracy across all modes. The recall reduction from v1 to v2 is attributable to cross-format supersession chains: when a Markdown policy is superseded by a JSON configuration, the vocabulary overlap between the query and the superseding document is lower, reducing retrieval probability. Ranking accuracy remains high — when both documents are retrieved, the superseding document is correctly ranked above the superseded document in 9 out of 10 cases.

### 3.2 Causal Chain Retrieval

**v1 (run 110ada93):** 100% average recall across all engine modes. The engine retrieves documents connected by `derived_from` and `cites` relations even when the documents share no vocabulary with each other.

**v2 (run c85daff7):** 66.7% average recall (V1, V3.1), 61.7% recall (V4.1). Causal chains spanning 5 documents across 5 MIME types are harder to traverse than same-format chains. The missing documents are consistently those with the least vocabulary overlap with the query (e.g., a Kubernetes YAML deployment specification when the query uses incident management terminology). The relation graph connects these documents, but the current retrieval pipeline does not use relation edges for candidate expansion.

### 3.3 Corpus Scale Degradation

**v1 (run 110ada93):** Degradation slope of -0.020 precision@5 per 1,000 documents (V1) and -0.019 (V4.1). Recall@5 drops from 0.950 at 100 documents to 0.550 at 10,000 documents.

**v2 (run c85daff7):** Degradation slope of -0.010 precision@5 per 1,000 documents (V1), -0.012 (V3.1), and -0.008 (V4.1). The enterprise corpus degrades approximately 50% more slowly than the clean text corpus. V4.1 degrades slowest, retaining 36.7% recall at 25,000 documents compared to 20.0% for V3.1 — an 83% recall advantage at maximum scale.

The slower degradation in the enterprise corpus is attributable to format heterogeneity: documents in different MIME types produce more distinctive embeddings, improving discrimination under noise pressure. MiSES Jaccard similarity remains 1.0 at all scale points — the multi-source evidence synthesis layer consistently selects the expected document combination even as overall recall degrades.

### 3.4 Temporal Reconstruction

**v1 (run 110ada93):** 100% accuracy (54/54 state classifications correct) for V3.1 and V4.1. All receipt chains intact. V1 does not support living state (skipped).

**v2 (run c85daff7):** 96.63% accuracy (172/178 correct). Six misclassifications across three patterns: contested-to-superseded overwrites (2 instances), active-to-superseded at lifecycle boundaries (2 instances), and active-to-missing near the 90-day temporal window edge (2 instances). All receipt chains intact.

**v3 edge cases (run e782fbd0):** 100% accuracy (12/12 correct) on three targeted edge patterns — contested-to-superseded transitions, rapid succession (4 versions within 10 days), and window boundary visibility. The v3 result confirms that the state machine logic is correct; the v2 misclassifications are caused by ambiguous relation topology in the enterprise corpus, not by state machine defects.

### 3.5 Receipt Chain Verification

**v3 (run e782fbd0):** All chains intact at all depths up to the recursive CTE limit of 50. Verification latency is 2-4ms regardless of depth — effectively O(1). The latency slope is -0.04 ms/depth (flat within measurement noise). The receipt chain verification system does not exhibit the expected linear degradation with chain depth.

### 3.6 Fragility Calibration

**v3 (run e782fbd0):** Three scenarios with controlled domain distribution. F1 (2 documents, 2 domains) produces fragility 1.0 — both citations are load-bearing, and removing either violates the `minDomains=2` constraint. F2 (4 documents, 3 domains) and F3 (6 documents, 4 domains) produce fragility 0.0 — sufficient domain redundancy exists that no single citation removal violates the constraint. The monotonic ordering F1 > F2 >= F3 is satisfied.

The leave-one-out fragility score measures domain diversity constraint sensitivity, not answer robustness in the abstract. A score of 0.0 means the citation set has redundant domain coverage for the active constraint. Full calibration across a wider range of constraint configurations is pending.

---

## 4. Format-Aware Ingestion Results

The v3 suite (run e782fbd0) measures retrieval recall stratified by MIME type. The same factual content is expressed in 6 formats, and the benchmark measures whether each format is retrieved and cited.

| Format | Citation Recall | Retrieved Recall |
|---|---|---|
| text/markdown | 1.00 | 1.00 |
| application/json | 0.33 | 1.00 |
| text/csv | 0.67 | 1.00 |
| application/x-yaml | 0.00 | 1.00 |
| text/plain (chat) | 0.00 | 1.00 |
| text/plain (notes) | 0.00 | 1.00 |

**Retrieved recall is 100% across all formats.** The retrieval pipeline finds every document regardless of format. The pipeline does not have a format-dependent retrieval gap.

**Citation recall varies from 0% to 100%.** The language model strongly prefers citing prose-formatted documents (Markdown) over structured data (JSON, CSV) or informal formats (YAML, chat transcripts, meeting notes). This is a citation selection characteristic of the language model, not a pipeline defect. The distinction between retrieved recall and citation recall is what makes this attribution possible.

The BM25 vs vector lane decomposition (also v3 run e782fbd0) confirms that the hybrid retrieval pipeline finds documents through both keyword matching (BM25) and semantic similarity (vector). K-class documents (rare unique terms) achieve 100% BM25 recall. V-class documents (paraphrased content with zero keyword overlap) achieve 100% vector retrieved recall but 0% citation recall — the language model does not cite documents lacking keyword anchors matching the query, even when they are semantically equivalent.

---

## 5. Known Limitations

**Embedding space.** The canonical runs use OpenAI `text-embedding-3-small` at 768 dimensions. The production engine deployment uses the same provider for the base lane. A local embedding provider (EmbedderCrux, running nomic-embed-text-v1.5) is deployed but not yet integrated into the benchmark suite. Switching embedding providers will require a new canonical run. The embedding cache is keyed by provider to prevent cross-contamination.

**Relation expansion not active.** The engine's `artifact_relations` graph is used for living state classification and MiSES composition, but not for retrieval candidate expansion. The v3 Cat 1 result documents this explicitly: a document linked by a `supersedes` relation but sharing zero vocabulary with the query is not retrieved via the relation graph. This is an architectural gap, documented as a baseline rather than obscured.

**Fragility calibration range.** The current calibration covers the `minDomains=2` constraint only. The fragility score is binary-like under this constraint: 1.0 when the citation set is exactly at the domain minimum, 0.0 when redundant domain coverage exists. Full calibration across `minDomains=3` and variable citation set sizes is pending.

**Synthetic corpus.** All corpus documents are synthetic, designed to test specific retrieval properties. The Meridian Financial Services corpus (v2) approximates real enterprise knowledge bases in format distribution and organizational structure but is entirely fictional. Ecological validity is traded for reproducibility and control.

**LLM nondeterminism.** The language model that selects citations is nondeterministic. Citation recall may vary by ±0.1 between runs for the same corpus. Retrieved recall is deterministic given fixed embeddings and corpus. The benchmark reports both metrics and attributes failures to the correct layer.

---

## 6. Regulatory Mapping

The benchmark categories map directly to specific regulatory requirements. This section identifies the mapping; a detailed compliance reference is provided in [evidence/regulatory-mapping.md](../evidence/regulatory-mapping.md).

### EU AI Act Article 13 — Transparency

Article 13 requires that high-risk AI systems be designed to ensure their operation is sufficiently transparent to enable users to interpret output and use it appropriately. Three benchmark categories provide evidence for this requirement:

- **Supersession accuracy** (Cat 1) demonstrates that the system correctly prioritises current context over superseded context. A user relying on the system's output can trust that the evidence base reflects the current state of organisational knowledge.
- **Causal chain retrieval** (Cat 2) demonstrates that the system surfaces connected evidence, not isolated fragments. A user can trace the reasoning chain from regulation to architecture to implementation.
- **Fragility scoring** (Cat 6) provides an explicit, per-answer measure of how sensitive a conclusion is to the removal of individual evidence sources. This is a transparency mechanism: the user knows not just what the system concluded, but how robust that conclusion is.

### DORA Articles 8-11 — ICT Risk Management and Audit Trail

DORA requires financial entities to maintain a comprehensive ICT risk management framework including audit trails that enable the investigation of ICT-related incidents. Two benchmark categories provide evidence for this requirement:

- **Temporal reconstruction** (Cat 4) demonstrates the ability to answer "what did the system know at the time of this decision?" with 96.63% accuracy on the enterprise corpus and 100% on targeted edge cases. The CROWN receipt chain anchors each answer to the knowledge state at query time.
- **Receipt chain verification** (Cat 5) demonstrates that the cryptographic audit trail scales to 50 receipt depth with sub-5ms verification latency and no chain integrity failures. An independent party can verify the chain without access to the system that produced it.

---

## 7. Reproducibility

The benchmark suite is published at [CueCrux/AuditCrux](https://github.com/CueCrux/AuditCrux) under MIT license.

### Canonical Runs

| Run ID | Suite | Date | Result | Duration |
|---|---|---|---|---|
| 110ada93 | v1 — Baseline | 2026-03-10 | 12/12 | 9m 18s |
| c85daff7 | v2 — Enterprise | 2026-03-11 | 12/12 | 20m 45s |
| e782fbd0 | v3 — Capability Probes | 2026-03-11 | 16/16 | 5m 8s |

### Environment

The canonical runs were executed on CueCrux-Data-1: Intel i9-13900, 192GB DDR5 ECC, 2x1.92TB NVMe RAID-1, PostgreSQL 16 with pgvector, Node.js 22.x.

### Commands

```bash
git clone https://github.com/CueCrux/AuditCrux.git
cd AuditCrux
npm install
cp .env.example .env  # configure with Engine credentials
npm run audit:v1       # ~10 min
npm run audit:v2       # ~20 min
npm run audit:v3       # ~5 min
```

Results should match the canonical run within LLM nondeterminism bounds. Retrieved recall should be identical given the same embeddings and corpus. Citation recall may vary by ±0.1.
