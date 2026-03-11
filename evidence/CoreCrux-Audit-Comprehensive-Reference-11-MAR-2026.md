# CueCrux Audit Suite — Comprehensive Reference

This document collates all evidence, configuration, corpus definitions, and canonical results for the CueCrux retrieval quality audit suites v1, v2, and v3. It is designed for RAG ingestion to support informed decisions about the Engine and CoreCrux retrieval pipeline.

**Canonical Runs:** `110ada93` (v1), `c85daff7` (v2), `e782fbd0` (v3) — **40/40 categories passed**
**Date:** March 2026
**Infrastructure:** CueCrux-Data-1 (i9-13900, 192GB DDR5, 2x1.92TB NVMe RAID-1, PostgreSQL 16 + pgvector)

---

## Table of Contents

1. [Engine Retrieval Pipeline Configuration](#1-engine-retrieval-pipeline-configuration)
2. [CROWN Receipt System](#2-crown-receipt-system)
3. [Assurance Modes](#3-assurance-modes)
4. [Database Schema](#4-database-schema)
5. [Audit Suite v1 — Baseline Corpus](#5-audit-suite-v1--baseline-corpus)
6. [Audit Suite v2 — Enterprise Corpus](#6-audit-suite-v2--enterprise-corpus)
7. [Audit Suite v3 — Capability Probes](#7-audit-suite-v3--capability-probes)
8. [Canonical Results](#8-canonical-results)
9. [Known Limitations and Gaps](#9-known-limitations-and-gaps)
10. [Environment and Setup](#10-environment-and-setup)

---

## 1. Engine Retrieval Pipeline Configuration

### 1.1 RRF Fusion

Reciprocal Rank Fusion combines multiple ranked lists into a single score.

**Source:** `Engine/src/utils/rrf.ts`, `Engine/src/services/retrieval.ts`

| Parameter | Value | Source |
|---|---|---|
| k (damping constant) | 60 | `DEFAULT_RRF_K = 60` |
| W_VEC (vector weight) | 0.6 | env `W_VEC`, default 0.6 |
| W_BM25 (keyword weight) | 0.4 | env `W_BM25`, default 0.4 |
| W_REP (reputation weight) | 0 | env `W_REP`, default 0 |
| W_TIME (time weight) | 0 | env `W_TIME`, default 0 |
| W_LIC (license weight) | 0 | env `W_LIC`, default 0 |
| W_RISK (risk weight) | 0 | env `W_RISK`, default 0 |

**Formula:** `score(id) += weight / (k + rank + 1)` for each ranked list.

**RRF input construction:** Intra-lane (separate BM25 and vector ranked lists, weight 1 each), cross-lane (per-lane ranked by `baseScore`, weight 1 each), recency lane (weight = `freshness.bias` if > 0). Final sort: RRF score descending, `baseScore` as tiebreaker.

**Pool sizing:** `POOL_MULTIPLIER = 4` (retrieval over-fetches 4x), `MIN_POOL_SIZE = 200`.

### 1.2 Content-Type-Aware Weight Overrides

**Source:** `Engine/src/services/retrieval.ts`, `resolveContentTypeWeights()`

| Content Type | Condition | vec | bm25 |
|---|---|---|---|
| `entity-enriched` | always | 0.8 | 0.2 |
| Structured MIME (`application/json`, `x-yaml`, `yaml`, `text/yaml`, `text/csv`) | `source` content type | 0.8 | 0.2 |
| `annotation` | always | base (0.6) | base (0.4) |
| `ocr-extracted` | always | 0.7 | 0.3 |
| All others | — | base vec | base bm25 |

**Zero-BM25 redistribution:** When `ftsScore == 0` (pure semantic match), `effectiveVecW = vec + bm25`, `effectiveBm25W = 0`. Prevents penalising vector-only documents.

### 1.3 Recency Scoring

**Source:** `Engine/src/services/retrieval.ts`

| Parameter | Value |
|---|---|
| `RECENCY_HALF_LIFE_DAYS` | 90 |
| Formula | `exp(-ln(2) * max(0, deltaDays) / 90)` |
| Future dates | Score = 1.0 |
| 90-day-old doc | Score = 0.5 |
| 180-day-old doc | Score = 0.25 |
| Timestamp source | `observedAt` preferred, fallback `publishedAt` |

Applied as `weights.time * recencyScore` in `computeBaseScore`.

### 1.4 Risk Penalty

**Source:** `Engine/src/services/retrieval.ts`, `computeRiskPenalty()`

| riskFlag | penalty |
|---|---|
| `none` / default | 0 |
| `copyright` | 0.15 |
| `medical` | 0.2 |
| `pii` | 0.3 |
| `blocked` | 1.0 |

Applied as `score -= weights.risk * riskPenalty`. Default `W_RISK = 0` so penalty is inactive unless enabled. Blocked-flag candidates can be hard-excluded via `filters.excludeRisk`.

### 1.5 Embedding Configuration

**Source:** `Engine/src/services/embeddings.ts`, `Engine/src/services/laneConfig.ts`

| Lane Key | Dimensions | Provider | Model | Materialized View |
|---|---|---|---|---|
| `base_local_768` | 768 | embeddercrux | `nomic-ai/nomic-embed-text-v1.5` | `hybrid_fast_768` |
| `premium_portable_1024` | 1024 | portable | `portable:embed@1024` | `hybrid_fast_1024` |
| `premium_openai_small_1536` | 1536 | openai | `text-embedding-3-small` | `hybrid_fast` |
| `pro_openai_large_3072` | 3072 | openai | `text-embedding-3-large` | `hybrid_fast_3072` |

**Canonical audit runs use:** `text-embedding-3-small` at 768 dimensions (OpenAI provider).

Multi-lane retrieval gated by `FEATURE_MULTI_LANE_RETRIEVAL` env flag (default `false`).

**Embedding cache:** SHA-256 keyed by content, stored at `results/embeddings-cache-{provider}-{dim}.json`.

### 1.6 MiSES Algorithm (Minimal Sufficient Evidence Set)

**Source:** `Engine/src/services/mises.ts`, `Engine/src/services/crown/policy.ts`

| Parameter | Value |
|---|---|
| `MISES_MAX_SIZE` | 3 (range: 1–50) |
| `MISES_RECENCY_DAYS` | 365 (range: 1–3650) |
| `MISES_GREEDY` | false |

**Domain requirement by mode:**
- `light`: `minDomains = 1`
- `verified`: `minDomains = 2` (flag-controlled via `REQUIRE_TWO_DOMAINS_VERIFIED`)
- `audit`: `minDomains = 2` (flag-controlled via `REQUIRE_TWO_DOMAINS_AUDIT`)

**Selection algorithm:** Citations ranked by `publishedAt` descending (most recent first). Greedy domain-diverse selection up to `maxSize`. Recency cutoff: `now - MISES_RECENCY_DAYS * 86_400_000`; citations outside window still eligible as fallback.

### 1.7 Fragility Scoring

**Source:** `Engine/src/services/mises-fragility.ts`

**Algorithm:** Leave-one-out analysis. A citation is **load-bearing** if removing it would:
1. Reduce the set below 1 citation, OR
2. Be the sole representative of its domain AND `remainingDomains < minDomains`

**Formula:** `fragilityScore = loadBearingCitations.count / selected.length`
- Range: 0.0 (robust) to 1.0 (brittle)

**Downstream thresholds:**
- `>= 0.7` → `high_fragility_score`, maps to `"break"` status
- `0.5–0.7` → `"drift"` status
- Signal fires at `fragility >= 0.5`

**Pressure blending:** `(1 - confidence) * log2(dependents_count + 1) / 5`. If 3+ citation fragility samples: `blended = 0.4 * heuristic + 0.6 * citationAvg`. If `citationFragility.max >= 0.8` and exceeds blended, use max directly.

**Trunk score formula:** `trunk_score = 0.30 * dependency + 0.25 * usage + 0.25 * reliability + 0.20 * fragility_influence`

### 1.8 Answers Endpoint Pipeline Flow

**Source:** `Engine/src/routes/answers.ts`

Pipeline stages in order:
1. **Auth / plan resolution** — reads `X-Plan` header, resolves mode, applies downgrades
2. **PKP entitlement** — resolves `allowedCorpusIds` if `PKP_ENABLED`
3. **Hybrid retrieval** — `hybridRetrieve()` returns candidates from materialized views, applies RRF fusion
4. **Candidate scoring** — `computeBaseScore()` with vec/bm25/rep/time/lic/risk weights + content-type overrides
5. **Reranking** (optional) — `rerankK` parameter
6. **Counterfactual probe** — if `audit` mode or `planSwitches.counterfactual !== "off"`
7. **LLM call** — `askLLM({ question, contexts })`
8. **Citation packing** — `packCitations()`, `minDistinctDomains: 2`
9. **MiSES** — `buildMiSES(citations, { mode, minDomains })` — only if not `light` mode
10. **Fragility** — `assessFragility(misesResult, allCitations, minDomains)`
11. **Candidate digest** — BLAKE3 over `(chunk_id, scores, lane_scores)` tuples; skipped for `light`
12. **CROWN snapshot** — `saveSnapshot()` — writes `crown_snapshots` + `crown_evidence`, signs via Vault Transit Ed25519
13. **Confidence computation** — `confidenceDenominator = max(1, planSwitches.minDomains)`
14. **Response** — returns answer, citations, CROWN metadata, receipt ID

---

## 2. CROWN Receipt System

### 2.1 Receipt Structure

**Source:** `Engine/src/services/receipts.ts`, `Engine/src/utils/hashing.ts`

| Field | Description |
|---|---|
| Receipt ID | `rcpt_{snapshotId first 12 chars no dashes}` |
| Hash algorithm | BLAKE3 (canonical form `blake3:<hex>`); SHA256 deprecated |
| Canonical JSON | Keys sorted recursively before hashing |
| Hash chain | `prefixedHash(canonicalJson(payload))` → `blake3:<hex>` |
| Signing | Ed25519 via Vault Transit |
| Signing key | `CROWN_SIGNING_VAULT_TRANSIT_KEY` env var |
| Chain depth limit | 50 hops (recursive CTE) |
| Unsigned receipts | Persisted if signing fails (no signature, no kid) |

**Signed fields:** `signature` (base64), `signing_kid`, `signing_pub`, `signed_at`.

### 2.2 Knowledge State Cursor

Structure: `{shardId, epoch, segmentSeq, offset}` — anchors each receipt to the CoreCrux event log position at query time. Present in V4.1 receipts.

### 2.3 CROWN Config Constants

| Constant | Value |
|---|---|
| `CROWN_CF_THRESHOLD` | 0.7 (counterfactual threshold) |
| `CROWN_SIGNING_VAULT_TRANSIT_KEY` | env var (optional) |
| `CROWN_SIGNING_PRIVATE_KEY_B64` | env var (optional, dev only) |
| `CROWN_SIGNING_KID` | env var (optional) |

---

## 3. Assurance Modes

**Source:** `Engine/src/flags.ts`, `Engine/src/services/crown/policy.ts`, `Engine/src/services/laneConfig.ts`

| Property | light | verified | audit |
|---|---|---|---|
| MiSES | off | on | on |
| Counterfactual | off | conditional | forced |
| Provenance | deferred | inline | strict |
| Receipt required | no | no | yes |
| minDomains (default) | 1 | 2 | 2 |
| Retrieval lanes | `base_local_768` | `base_local_768`, `premium_portable_1024` | all 4 lanes |
| Credit cost | 1 | 3 | 8 |
| Confidence band | [0.60, 0.80] | [0.80, 0.95] | [0.95, 1.0] |
| C3 budget (ms) | 100 | 160 | 400 |
| Freshness SLA | P14D (14 days) | P7D (7 days) | P1D (1 day) |

**Audit quota:** 1000/day, burst limit 30, burst window 60s.

**Mode downgrade:** `audit → verified` if `!auditAllowed` (free plan) or `!featureAuditEnabled`.

---

## 4. Database Schema

### 4.1 Tables Used by Audit

| Table | Purpose |
|---|---|
| `artifacts` | Document metadata (id, sha256, title, url, domain, mime, published_at, tenant_id) |
| `artifact_chunks` | Chunked content with `content_tsv` (tsvector for BM25) |
| `artifact_policies` | License and risk flags per artifact |
| `engine.embeddings_768` | Vector embeddings (lane_key: `base_local_768`, model: `text-embedding-3-small`) |
| `engine.artifact_relations` | Typed edges: supersedes, contradicts, elaborates, derived_from, cites, supports, duplicates, about_same_entity |
| `engine.artifact_living_state` | Lifecycle status: dormant, active, stale, contested, superseded, deprecated |
| `crown_snapshots` | CROWN receipt snapshots |
| `crown_evidence` | Evidence records linked to snapshots |

### 4.2 Insertion Logic

**Artifact SHA-256:** `sha256(id + ':' + content)` — deterministic, deduplication key.

**Cleanup order (FK-safe):** `crown_evidence` → `crown_snapshots` → `artifact_living_state` → `artifact_relations` → `artifact_dependents` → `embeddings_768` → `embeddings_1536` → `embeddings` → `artifact_policies` → `artifact_chunks` → `artifacts`

**Materialized views refreshed after insert:** `hybrid_fast` and `hybrid_fast_768`.

**Living state review window:** 7 days.

### 4.3 Relation Types

| Type | Description |
|---|---|
| `supersedes` | New version replaces old |
| `contradicts` | Documents disagree |
| `elaborates` | Expands on parent |
| `derived_from` | Causally derived |
| `cites` | References another |
| `supports` | Provides evidence for |
| `duplicates` | Copies of same content |
| `about_same_entity` | Different perspectives on same topic |

Each relation has a confidence score (0.0–1.0).

### 4.4 Living State Values

| Status | Meaning |
|---|---|
| `active` | Current, authoritative |
| `superseded` | Replaced by newer version |
| `deprecated` | Marked for removal |
| `contested` | Contradicted by another document |
| `stale` | Not formally superseded but outdated |
| `dormant` | Exists but not actively referenced |

---

## 5. Audit Suite v1 — Baseline Corpus

**Run ID:** `110ada93` | **Result:** 12/12 | **Duration:** 9m 18s | **Tenant:** `__audit__`

Tests retrieval quality on a clean text corpus (~40 docs). If v1 fails, the engine has a fundamental retrieval defect.

### 5.1 Engine Modes Tested

| Mode | Relations | Living State | Receipt Chain | CoreCrux |
|---|:---:|:---:|:---:|:---:|
| V1 | — | — | Yes | — |
| V3.1 | Yes | Yes | Yes | — |
| V4.1 | Yes | Yes | Yes | Yes |

### 5.2 Category 1 — Supersession Accuracy (3 docs)

**Tests:** When document B supersedes document A, does the engine rank B above A?

| ID | Domain | Title | Published |
|---|---|---|---|
| `audit-ss-a` | `engineering.audit.test` | Data Pipeline Configuration: Pattern Alpha Reference Guide | ~18 months ago |
| `audit-ss-b` | `engineering.audit.test` | Pipeline Configuration Update: Transition from Pattern Alpha to Pattern Beta | ~6 months ago |
| `audit-ss-c` | `ops.audit.test` | Operational Advisory: Pattern Alpha Retention for Legacy Systems | ~3 months ago |

**Content detail:**
- **audit-ss-a:** Pattern Alpha for high-throughput data pipelines. Backpressure-aware flow control. Parameters: `buffer_high_watermark` 80%, `buffer_low_watermark` 20%, `max_batch_size` 1000, `flush_interval_ms` 100, `error_boundary_mode` circuit-breaker. Partitioning by `tenant_id` min 8 partitions/node. Dead-letter queue after 3 retries. `checkpoint_interval` 5000ms. Validated at 500K events/sec, sub-10ms p99.
- **audit-ss-b:** Supersedes Alpha. Pattern Beta addresses head-of-line blocking, cross-partition dependency failures, checkpoint write amplification on NVMe at >1M events/sec. Single `target_utilization` 70%, adaptive flow control, dynamic sharding, cooperative failure model. Migration requires simultaneous restart.
- **audit-ss-c:** For kernel < 5.15, Alpha remains recommended (Beta requires `io_uring`). Alpha modifications: `buffer_high_watermark` → 85%, `error_boundary_mode` → bulkhead.

**Relations:** `audit-ss-b` supersedes `audit-ss-a` (0.95). `audit-ss-c` elaborates `audit-ss-b` (0.85).

**Living states:** `audit-ss-a` → superseded (0.3), `audit-ss-b` → active (0.9), `audit-ss-c` → active (0.85).

**Ground truth query:** "What is the current recommended approach for data pipeline configuration?" — mode: verified, topK: 10, expectedDocIds: `[audit-ss-b, audit-ss-c]`, expectedRanking: B above A, expectedMiSES: `[audit-ss-b, audit-ss-c]`, expectedFragilityRange: [0.3, 1.0].

**Pass criteria:** `recall >= 0.5 AND ranking_accuracy >= 0.5`

### 5.3 Category 2 — Causal Chain Retrieval (3 docs)

**Tests:** Can the engine surface documents connected by causal relationships across vocabulary gaps?

| ID | Domain | Title | Published |
|---|---|---|---|
| `audit-cc-a` | `compliance.audit.test` | Financial Transaction Processing: Regulatory Performance Mandate | ~12 months ago |
| `audit-cc-b` | `architecture.audit.test` | Architecture Decision Record: In-Memory Caching Tier for Settlement Processing | ~8 months ago |
| `audit-cc-c` | `incidents.audit.test` | Post-Incident Report: Settlement Processing Latency Degradation (INC-2025-0891) | ~2 months ago |

**Content detail:**
- **audit-cc-a:** FCA directive FCA/2024/TR-7. Transaction acknowledgment within 100ms at p99. DR failover within 60 seconds. Metrics retained 7 years.
- **audit-cc-b:** ADR-2024-0147. Sharded in-memory store, 64GB/node, 4GB/shard. LRU eviction + global memory pressure at 85%. Static memory allocation. UDP multicast invalidation bus.
- **audit-cc-c:** INC-2025-0891. 2025-09-14. p99 latency 12ms → >200ms for 47 minutes. Root cause: batch import of 2.3M records triggered 85% memory pressure → aggressive eviction → cascade reload. 12,000 active sessions affected. Corrective: dedicated memory pools, threshold → 75%, circuit breaker at 50ms p99.

**Relations:** `audit-cc-b` derived_from `audit-cc-a` (0.9). `audit-cc-c` derived_from `audit-cc-b` (0.85).

**Ground truth queries:**
1. "Why did the latency incident occur?" — mode: light, expected: `[audit-cc-c]`
2. "What caused the settlement processing outage and what was the root regulatory constraint?" — mode: verified, expected: `[audit-cc-c, audit-cc-a]`

**Pass criteria:** Primary query (incident) `recall >= 1.0`

### 5.4 Category 3 — Corpus Degradation Under Scale

**Tests:** How does retrieval quality degrade from 100 to 10,000 documents?

**Scale points:** [100, 1000, 5000, 10000] total docs.

**Composition:** 10 signal docs + 90 context docs + N noise docs per scale point.

**Signal documents (10):**

| ID | Domain | Title |
|---|---|---|
| `audit-scale-s1` | security | TLS Certificate Rotation Policy (90-day, ACME v2, zero-downtime) |
| `audit-scale-s2` | performance | Database Connection Pool Sizing Guide (formula: `(core_count * 2) + effective_spindle_count`) |
| `audit-scale-s3` | performance | Connection Pool Monitoring and Tuning (utilization >80% → increase 25%) |
| `audit-scale-s4` | operations | Incident Escalation Policy v3 (SEV1-4, 5-min to eng manager) |
| `audit-scale-s5` | security | API Key Rotation and Management (180-day, 256-bit CSPRNG, Vault) |
| `audit-scale-s6` | compliance | Data Retention and Deletion Policy (24-month default, GDPR Art 17 30-day delete) |
| `audit-scale-s7` | architecture | Service Mesh Configuration Standards (mTLS, circuit breakers 5s/3/30s) |
| `audit-scale-s8` | operations | Deployment Rollback Procedure (5-min rollback, auto-trigger >1% error rate) |
| `audit-scale-s9` | security | Network Segmentation Requirements (DMZ/application/data tiers) |
| `audit-scale-s10` | compliance | Audit Logging Requirements (immutable, 7-year financial retention, hash chaining) |

**Context documents (90):** IDs `audit-scale-ctx-0` through `audit-scale-ctx-89`. Generic infrastructure overview text.

**Noise documents:** IDs `audit-scale-noise-{N}`. Deterministic from 10 paragraph templates shuffled via SHA-256.

**10 benchmark queries** (light mode, topK=5) covering each signal doc. **4 fragility probes** (verified mode).

**Pass criteria:** `final_precision5 >= 0.1` (some signal survives at largest scale)

### 5.5 Category 4 — Temporal Reconstruction (20 docs)

**Tests:** Can the system correctly reconstruct knowledge state at different points in time?

**Temporal baseline:** `T0 = Date.now() - 180 days`. Documents published at offsets T0+0d, T0+30d, T0+60d, T0+90d, T0+120d, T0+150d.

**Document groups:**

| Phase | Day | IDs | Count |
|---|---|---|---|
| Foundational | T0+0 | audit-tr-f1 through f5 | 5 |
| Updates | T0+30 | audit-tr-u1 through u3 | 3 |
| New | T0+60 | audit-tr-n1 through n3 | 3 |
| Supersessions | T0+90 | audit-tr-s1 through s4 | 4 |
| Deprecation notices | T0+120 | audit-tr-d1 through d3 | 3 |
| Consolidation | T0+150 | audit-tr-c1, c2 | 2 |

**Key temporal chain:** API Design Standards v1 (f1) → v2 (u1, supersedes f1) → v3 (s1, supersedes u1). Authentication Framework v1 (f2) → v2 (u2) → v3 (s2). Logging Standards v1 (f4) contradicted by Binary Format (n2).

**Relations (8):** u1→f1, u2→f2 (supersedes); n2→f4 (contradicts); s1→u1, s2→u2 (supersedes); c1→u3, c2→n1, c2→n3 (supersedes).

**Living states (20 docs):** f1=superseded, f2=superseded, f3=active, f4=contested, f5=active, u1=superseded, u2=superseded, u3=deprecated, n1=deprecated, n2=active, n3=deprecated, s1=active, s2=active, s3=active, s4=active, d1/d2/d3=deprecated, c1=active, c2=active.

**Temporal snapshots tested:** T0+15d, T0+45d, T0+75d, T0+105d, T0+135d — checking which docs exist and their expected states at each point.

**Receipt verifiability queries (3):** Run in `verified` mode to generate CROWN receipts.

**Pass criteria:** `reconstruction_accuracy >= 0.5`. Skipped for V1 mode.

---

## 6. Audit Suite v2 — Enterprise Corpus

**Run ID:** `c85daff7` | **Result:** 12/12 | **Duration:** 20m 45s | **Tenant:** `__audit_v2__`

Tests retrieval quality on a heterogeneous enterprise corpus (Meridian Financial Services). 550 base docs, 9 MIME types, cross-format supersession and causal chains, scales to 25,000 docs.

### 6.1 MIME Types

| Type | MIME Value |
|---|---|
| Markdown | `text/markdown` |
| JSON | `application/json` |
| YAML | `application/x-yaml` |
| CSV | `text/csv` |
| HTML | `text/html` |
| Email | `text/plain` |
| Meeting Notes | `text/plain` |
| Chat Export | `text/plain` |
| Wiki Scratchpad | `text/markdown` |

### 6.2 Category 1 — Supersession (20 docs, 4 chains, 6 queries)

**Tests:** Cross-format supersession with realistic enterprise document evolution.

#### Chain A — Data Classification Policy

| ID | Title | MIME | Age |
|---|---|---|---|
| `v2-ss-a1` | Data Classification Policy v1 | markdown | 18 months |
| `v2-ss-a2` | Data Classification Policy v2 | markdown | 10 months |
| `v2-ss-a3` | RE: Data Classification Policy v2 — Gaps in cloud storage | email | 8 months |
| `v2-ss-a4` | Data Classification Policy v2.1 — Cloud Storage Amendment | markdown | 7 months |
| `v2-ss-a5` | Sync: Security policy review — 2025-03-15 | meeting notes | 6 months |

#### Chain B — K8s/Terraform Config Drift

| ID | Title | MIME | Age |
|---|---|---|---|
| `v2-ss-b1` | payment-service K8s deployment (3 replicas, 512Mi, DB_POOL_MAX=20) | YAML | 12 months |
| `v2-ss-b2` | Terraform output: payment-service infra update (4 replicas, 1Gi) | JSON | 6 months |
| `v2-ss-b3` | #platform-ops: payment-service config discussion | chat | 5 months |
| `v2-ss-b4` | payment-service K8s deployment (updated, 4 replicas, 1Gi, DB_POOL_MAX=50) | YAML | 5 months |
| `v2-ss-b5` | Production infrastructure asset inventory — Q2 2025 | CSV | 4 months |

#### Chain C — SLA Target

| ID | Title | MIME | Age |
|---|---|---|---|
| `v2-ss-c1` | Q3 2024 Engineering QBR — Platform Reliability (99.9% SLA) | HTML | 14 months |
| `v2-ss-c2` | Engineering Standard: Platform SLA Requirements v2.0 (99.95%) | markdown | 9 months |
| `v2-ss-c3` | Feature flag configuration: SLA monitoring thresholds | JSON | 9 months |
| `v2-ss-c4` | RE: Updated SLA targets for 2025 | email | 9 months |
| `v2-ss-c5` | Draft: SLA monitoring notes — personal (references old 99.9%) | wiki | 8 months |

#### Chain D — Incident Response Playbook

| ID | Title | MIME | Age |
|---|---|---|---|
| `v2-ss-d1` | Incident Response Playbook v1 (PLB-SEC-001 v1.0) | markdown | 16 months |
| `v2-ss-d2` | Incident Response Playbook v2 | markdown | 8 months |
| `v2-ss-d3` | #security-oncall: playbook v2 section 4 issue | chat | 7 months |
| `v2-ss-d4` | Security ops standup — 2025-02-20 | meeting notes | 7 months |
| `v2-ss-d5` | Incident Response Playbook v2.1 (corrected section 4) | markdown | 6 months |

**Relations (14):** a2→a1 supersedes, a4→a2 elaborates, a3→a2 elaborates, b4→b1 supersedes, b2→b1 supersedes, b5→b4 elaborates, c2→c1 supersedes, c3→c2 elaborates, c4→c2 supports, c5→c1 cites, d2→d1 supersedes, d3→d2 contradicts, d5→d2 supersedes, d5→d1 supersedes.

**Ground truth queries (6):**
1. "What is the current data classification policy at Meridian?" — verified, expected: a4, a2
2. "What is the platform SLA availability target?" — verified, expected: c2
3. "How many replicas does payment-service run?" — light, expected: b4
4. "What is the current incident response playbook?" — verified, expected: d5
5. "What encryption standard is required for restricted data?" — light, expected: a4, a2
6. "What is the evidence collection procedure for security incidents?" — verified, expected: d5

**Pass criteria:** `avg_recall >= 0.5`

### 6.3 Category 2 — Causal Chain (25 docs, 5 chains, 10 queries)

**Tests:** Cross-format causal chains where each chain traverses 5 different MIME types.

#### Chain 1 — SLA Breach Resolution (CSV → Email → JSON → ADR → Meeting Notes)
- `v2-cc-1a` SLA Performance Report (CSV) → `v2-cc-1b` postmortem email → `v2-cc-1c` DB config JSON (maxConnections=50) → `v2-cc-1d` ADR-042 Connection Pool Sizing (markdown) → `v2-cc-1e` standup notes

#### Chain 2 — Security Incident (Chat → Markdown → JSON → YAML → HTML)
- `v2-cc-2a` #security-oncall credential leak INC-2025-1247 (chat) → `v2-cc-2b` Incident Report (markdown) → `v2-cc-2c` API gateway config (JSON) → `v2-cc-2d` CI pipeline secret scanning (YAML) → `v2-cc-2e` Security Dashboard Q4 (HTML)

#### Chain 3 — Redis Migration (Markdown RFC → YAML → CSV → Email → Chat)
- `v2-cc-3a` RFC-0018 Redis 6→7 (markdown) → `v2-cc-3b` canary deployment (YAML) → `v2-cc-3c` benchmark comparison (CSV) → `v2-cc-3d` rollout email → `v2-cc-3e` migration complete (chat)

#### Chain 4 — SOC 2 Compliance (HTML → Email → Markdown → JSON → CSV)
- `v2-cc-4a` SOC 2 Type II audit (HTML) → `v2-cc-4b` remediation email → `v2-cc-4c` Remediation Plan F-2025-001 (markdown) → `v2-cc-4d` pgaudit feature flags (JSON) → `v2-cc-4e` vendor compliance matrix (CSV)

#### Chain 5 — N+1 Performance (Meeting Notes → CSV → Markdown → JSON → HTML)
- `v2-cc-5a` perf review meeting → `v2-cc-5b` performance metrics (CSV) → `v2-cc-5c` RCA N+1 query pattern (markdown) → `v2-cc-5d` query caching config (JSON) → `v2-cc-5e` Performance Dashboard (HTML)

**Pass criteria:** `avg_recall >= 0.3`

### 6.4 Category 3 — Corpus Degradation (550 base → 25K)

**Signal docs (50):** Spanning all 9 MIME types across financial services topics (KYC, settlement, FX, risk scoring, payment processing, compliance).

**Scale points:** [550, 1000, 2500, 5000, 10000, 25000]

**Notable signal docs:**
- s1: KYC Re-verification Policy (POL-COMP-017 v3.2)
- s7: kyc-service DB config (maxConnections=75)
- s13: kyc-service K8s deployment (KYC_EDD_THRESHOLD_EUR=500000)
- s25: Engineering QBR Q3 2025
- s32: BIN range allocation email (4532-17xx)
- s45: Settlement discrepancy incident INC-2025-1215 (EUR 47,832.19)

**15 benchmark queries + 5 fragility probes.**

**Context docs (500):** `v2-scale-ctx-0` to `v2-scale-ctx-499`, 9 MIME types × 20 topics × 15 services.

**Noise generator:** Deterministic via SHA-256 seed, cycles all 9 MIME types.

**Pass criteria:** `last.precision5 >= 0.1`

### 6.5 Category 4 — Temporal Reconstruction (60 docs, 6 lifecycles)

**Tests:** Full document lifecycle tracking with 6 parallel lifecycles spanning 345 days.

| Lifecycle | Topic | Doc Count |
|---|---|---|
| A | API Authentication Standard (v1 → v1.1 → v2 → archived) | 10 |
| B | Infrastructure Cost Optimization (spot instances → reserved) | 10 |
| C | KYC Vendor Assessment (Onfido/Jumio/Veriff evaluation → migration) | 10 |
| D | Data Privacy Policy (v1 → v2 → contested by chat) | 10 |
| E | CI/CD Pipeline (v1 → v2 → v2.1 with SAST) | 10 |
| F | Monitoring Standards (threshold-based → SLO-based alerting, 150→18 alerts/week) | 10 |

**Temporal snapshots tested:** T0+30d, T0+75d, T0+120d, T0+180d, T0+270d, T0+345d.

**Pass criteria:** `reconstruction_accuracy >= 0.5`. Skipped for V1.

---

## 7. Audit Suite v3 — Capability Probes

**Run ID:** `e782fbd0` | **Result:** 16/16 | **Duration:** 5m 8s | **Tenant:** `__audit_v3__`

Small, focused corpus (~64 docs) probing 6 specific Engine capabilities and edge cases.

### 7.1 Category 1 — Relation-Bootstrapped Retrieval (8 docs, 1 query)

**Tests:** Binary probe — does the pipeline use `artifact_relations` edges to expand the candidate set?

| ID | Domain | Title | MIME | Purpose |
|---|---|---|---|---|
| `v3-rel-orig` | compliance | Meridian Data Residency Framework v1 | markdown | Query target (vocabulary match) |
| `v3-rel-amend` | compliance | Cross-Border Information Relay Protocol — Amendment 2025-Q3 | markdown | Zero keyword overlap with query; only discoverable via relation |
| `v3-rel-support1` | legal | EU GDPR Adequacy Decision Reference Guide | markdown | Supporting |
| `v3-rel-support2` | infra | Data Center Location Matrix | markdown | Supporting |
| `v3-rel-noise1-4` | eng/platform/security/product | Various unrelated docs | text/plain | Noise |

**Key design:** `v3-rel-amend` uses "transnational information relay", "bilateral data flow" — zero vocabulary overlap with "data residency", "geographic locality", "sovereignty".

**Relation:** `v3-rel-amend` supersedes `v3-rel-orig` (0.95).

**Query:** "What is the current data residency framework at Meridian? What are the geographic locality and sovereignty requirements?"

**Expected:** `v3-rel-orig` found (recall = 1.0). Amendment found = relation expansion active (informational check, not pass/fail).

**Result:** Relation expansion NOT active (expected). Amendment appears in `retrievedIds` via vector similarity but is not cited. Original correctly found and cited.

**Pass criteria:** `avg_recall >= 1.0`

### 7.2 Category 2 — Format-Aware Ingestion Recall (18 docs, 3 queries)

**Tests:** Retrieved recall stratified by MIME type.

**Design:** 3 topics × 6 formats. Same factual content in markdown, JSON, YAML, CSV, chat, meeting notes.

| Topic | Query | Core Fact |
|---|---|---|
| A: Rate Limiting | "What are the rate limiting rules?" | payment-service 200 req/min standard, burst 50/10s; premium 500 req/min, burst 150 |
| B: Backup Schedule | "What is the database backup schedule?" | Daily full at 02:00 UTC, WAL every 60s, 30-day/7-day retention |
| C: Alert Thresholds | "What are the alerting thresholds?" | p95 >200ms warning, p99 >500ms critical (5min eval), p99 >2000ms emergency (1min) |

**Tier model:**
- Tier 1 (markdown): pass if recall >= 0.9
- Tier 2 (CSV + JSON): pass if csv >= 0.5 AND json >= 0.3
- Tier 3 (YAML, chat, notes): baseline documentation only

**Pass criteria:** `avg_retrieved_recall >= 0.3`

### 7.3 Category 3 — BM25 vs Vector Decomposition (12 docs, 6 queries)

**Tests:** Relative contribution of keyword (BM25) vs semantic (vector) retrieval.

| Class | Count | Strategy | Examples |
|---|---|---|---|
| K (Keyword) | 4 | Rare unique terms | "XK7-Bravo protocol", "ERR_SETTLE_RECON_MISMATCH", "RB-2025-0417" |
| V (Vector) | 4 | Paraphrased content, zero keyword overlap | "Caller Identity Verification Framework" (paraphrase of API key policy) |
| H (Hybrid) | 4 | Both keyword-matchable AND semantically similar | "API Key Rotation Policy", "Incident Response Playbook v3" |

**Key finding:** V-class docs achieve 100% retrieved recall but 0% citation recall — LLM does not cite docs lacking keyword anchors, even when semantically equivalent.

**Pass criteria:** `combined_retrieved_recall >= 0.6 AND all three lanes deliver at least one candidate`

### 7.4 Category 4 — Temporal Edge Cases (12 docs, 0 API queries)

**Tests:** Three misclassification patterns from v2 results. DB state checks only.

#### Pattern A — Contested → Superseded
v1 (T0) → v2 supersedes v1 (T0+10d) → bug report contradicts v2 (T0+12d) → v2.1 supersedes v2 (T0+25d)

Expected: a1=superseded, a2=superseded (resolved by v2.1), a3=deprecated, a4=active.

#### Pattern B — Rapid Succession (4 versions in 10 days)
v1 (T0+80d) → v2 (T0+85d) → v2 Errata (T0+88d) → v2.1 (T0+89d)

Expected: b1=superseded, b2=superseded, b3=deprecated, b4=active.

#### Pattern C — Window Boundary (near 90-day edge)
Docs at T0+85d, T0+88d, T0+91d, T0+95d.

Expected: c1=superseded, c2=active, c3=active, c4=active.

**Pass criteria:** `accuracy >= 0.5`. Skipped for V1.

### 7.5 Category 5 — Receipt Chain Stress (2 docs, 50 queries)

**Tests:** Receipt chain verification at increasing depth up to CTE limit of 50. Runs once (V4.1 verified mode only).

**Seed docs:**
- `v3-rcpt-a` (security): Production Access Control Matrix — 4 tiers, tier 4 = Terraform/DDL/Vault/network
- `v3-rcpt-b` (platform): SLA Definitions — 99.95% monthly availability, p50 <100ms, p95 <300ms, p99 <1000ms

**Query generation:** 25 access control paraphrases + 25 SLA paraphrases = 50 queries (deterministic).

**Depth checkpoints:** [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]

**Pass criteria:** All chains intact at depth ≤ 20, latency at depth 50 < 10,000ms.

### 7.6 Category 6 — Fragility Calibration (12 docs, 3 queries)

**Tests:** Leave-one-out fragility scoring produces distinguishable scores for known domain configurations.

| Scenario | Docs | Domains | Domain Distribution | Expected Fragility |
|---|---|---|---|---|
| F1 (Maximum) | 2 | 2 unique | Each doc sole domain rep | 0.8–1.0 |
| F2 (Moderate) | 4 | 3 | alpha×1, beta×1, gamma×2 | 0.3–0.7 |
| F3 (Low) | 6 | 4 | alpha×2, beta×1, gamma×1, delta×2 | 0.1–0.5 |

**F1 docs:** `v3-frag-f1a` (unique-alpha.test, AES-256-GCM) + `v3-frag-f1b` (unique-beta.test, ChaCha20-Poly1305). Removing either breaks minDomains=2.

**F2 docs:** Network segmentation policies. Alpha (Cilium/mTLS) + Beta (Calico/Istio) = sole domain reps. Gamma has 2 docs = redundancy.

**F3 docs:** Incident response runbooks. Alpha×2, beta×1 (sole), gamma×1 (sole), delta×2. 2 of 6 load-bearing.

**Pass criteria:** `(F1 > 0 AND F1 > F2 AND F2 >= F3) OR all-zero baseline`. Monotonic ordering is the correctness signal.

---

## 8. Canonical Results

### 8.1 Suite v1 — Run 110ada93

| Category | V1 | V3.1 | V4.1 |
|---|---|---|---|
| **Cat 1: Supersession** | recall=1.0, ranking=1.0, MiSES=1.0, fragility=1.0 | recall=1.0, ranking=1.0 | recall=1.0, ranking=1.0 |
| **Cat 2: Causal Chain** | avg_recall=1.0, avg_precision=0.75 | avg_recall=1.0 | avg_recall=1.0 |
| **Cat 3: Degradation** | slope=-0.020/1K, final recall@5=0.55 | slope=-0.020/1K | slope=-0.019/1K, final recall@5=0.55 |
| **Cat 4: Temporal** | skipped (V1) | accuracy=1.0 (54/54), 3 chains intact | accuracy=1.0 (54/54), knowledge cursor present |

**Cross-mode:** V4.1 degradation slope (-0.019) marginally better than V1 (-0.020). MiSES Jaccard = 1.0 at all scale points.

### 8.2 Suite v2 — Run c85daff7

| Category | V1 | V3.1 | V4.1 |
|---|---|---|---|
| **Cat 1: Supersession** | recall=0.833, ranking=0.900 | recall=0.750, ranking=0.900 | recall=0.750, ranking=0.900 |
| **Cat 2: Causal Chain** | avg_recall=0.667 | avg_recall=0.667 | avg_recall=0.617 |
| **Cat 3: Degradation** | slope=-0.010/1K, recall@25K=0.333 | slope=-0.012/1K, recall@25K=0.200 | slope=-0.008/1K, recall@25K=0.367 |
| **Cat 4: Temporal** | skipped | accuracy=96.63% (172/178) | accuracy=96.63% (172/178) |

**V2 misclassifications (6):**
- T0+30d: v2-tr-e1 expected=active actual=superseded
- T0+30d: v2-tr-d1 expected=contested actual=superseded
- T0+75d: v2-tr-d1 expected=contested actual=superseded
- T0+120d: v2-tr-a5 expected=active actual=superseded
- T0+180d: v2-tr-d6 expected=active actual=missing
- T0+270d: v2-tr-d8 expected=active actual=missing

**V4.1 retains 83% more recall than V3.1 at 25,000 documents** (0.367 vs 0.200).

### 8.3 Suite v3 — Run e782fbd0

Results identical across V1, V3.1, V4.1 (except Cat 4 skipped for V1, Cat 5 runs V4.1 only).

| Category | Result | Key Metrics |
|---|---|---|
| **Cat 1: Relation Expansion** | PASS | recall=1.0, amendment NOT found (relation expansion not active — baseline) |
| **Cat 2: Format Recall** | PASS | retrieved_recall=1.0 all formats; citation: markdown=1.0, JSON=0.33, CSV=0.67, YAML/chat/notes=0.0 |
| **Cat 3: BM25 vs Vector** | PASS | combined_retrieved_recall=1.0; BM25 cited=1.0, vector cited=0.0, hybrid cited=1.0 |
| **Cat 4: Temporal Edges** | PASS | accuracy=100% (12/12) — all 3 patterns correct |
| **Cat 5: Receipt Chain** | PASS | max depth=50, all chains intact, latency 2-4ms, slope=-0.04 ms/depth |
| **Cat 6: Fragility** | PASS | F1=1.0, F2=0.0, F3=0.0, monotonic ordering correct |

**Receipt chain depth curve:**

| Depth | Latency (ms) | Intact |
|---|---|---|
| 5 | 4 | YES |
| 10 | 3 | YES |
| 15 | 2 | YES |
| 20 | 3 | YES |
| 25 | 3 | YES |
| 30 | 3 | YES |
| 35 | 3 | YES |
| 40 | 3 | YES |
| 45 | 3 | YES |
| 50 | 2 | YES |

### 8.4 Degradation Curves

#### v1 (clean text, 100 → 10K)

| Corpus Size | Precision@5 (V1) | Recall@5 (V1) | Precision@5 (V4.1) | Recall@5 (V4.1) | MiSES Jaccard |
|---|---|---|---|---|---|
| 100 | 0.500 | 0.950 | 0.483 | 0.950 | 1.000 |
| 1,000 | 0.500 | 0.950 | 0.450 | 0.850 | 1.000 |
| 5,000 | 0.400 | 0.750 | 0.350 | 0.650 | 1.000 |
| 10,000 | 0.300 | 0.550 | 0.300 | 0.550 | 1.000 |

#### v2 (enterprise, 550 → 25K)

| Corpus Size | Precision@5 (V1) | Recall@5 (V1) | Precision@5 (V4.1) | Recall@5 (V4.1) | MiSES Jaccard |
|---|---|---|---|---|---|
| 550 | 0.433 | 0.700 | 0.433 | 0.700 | 1.000 |
| 1,000 | 0.433 | 0.700 | 0.433 | 0.700 | 1.000 |
| 2,500 | 0.344 | 0.533 | 0.400 | 0.633 | 1.000 |
| 5,000 | 0.233 | 0.333 | 0.300 | 0.467 | 1.000 |
| 10,000 | 0.200 | 0.333 | 0.300 | 0.467 | 1.000 |
| 25,000 | 0.200 | 0.333 | 0.233 | 0.367 | 1.000 |

---

## 9. Known Limitations and Gaps

### 9.1 Architectural Gaps

| Gap | Status | Impact |
|---|---|---|
| **Relation expansion not active** | Documented baseline | `artifact_relations` used for living state + MiSES but NOT for retrieval candidate expansion. Zero-overlap superseding docs not found via relation edges. |
| **Format-aware chunking by MIME** | Not implemented | All MIME types chunked identically. Structured formats (JSON, YAML) not parsed structure-aware. |
| **Temporal reconstruction API** | Not deployed | Cat 4 uses `artifact_living_state` DB query as proxy. V4.1 `decision_causal_chain` projection pending. |

### 9.2 Measurement Limitations

| Limitation | Detail |
|---|---|
| **Embedding space** | Canonical runs use OpenAI `text-embedding-3-small` at 768d. EmbedderCrux (nomic-embed-text-v1.5) deployed but not benchmarked. |
| **Fragility calibration range** | Only `minDomains=2` tested. Binary-like behavior: 1.0 at domain minimum, 0.0 with redundancy. `minDomains=3` pending. |
| **Synthetic corpus** | All corpora are synthetic. Enterprise corpus (Meridian Financial Services) approximates real structure but is fictional. |
| **LLM nondeterminism** | Citation recall may vary ±0.1 between runs. Retrieved recall is deterministic given fixed embeddings. |

### 9.3 Observed Failure Patterns

| Pattern | Frequency | Root Cause |
|---|---|---|
| Cross-format supersession miss | v2 Cat 1 recall drops to 0.75 | Vocabulary overlap between query and superseding JSON/YAML doc is lower |
| Cross-format causal chain miss | v2 Cat 2 recall 0.62–0.67 | YAML deployment specs and incident reports share no terminology |
| V-class citation gap | v3 Cat 3 vector citation recall = 0.0 | LLM does not cite semantically-equivalent docs lacking keyword anchors |
| Contested→superseded overwrite | v2 Cat 4 (2 instances) | Ambiguous relation topology in enterprise corpus |
| Active→missing near window edge | v2 Cat 4 (2 instances) | 90-day temporal window boundary effects |

---

## 10. Environment and Setup

### 10.1 Infrastructure

| Component | Specification |
|---|---|
| Server | CueCrux-Data-1 (Hetzner EX63 dedicated) |
| CPU | Intel i9-13900 |
| RAM | 192GB DDR5 ECC |
| Storage | 2x1.92TB NVMe RAID-1 |
| Database | PostgreSQL 16 with pgvector (`pgvector/pgvector:pg16` image) |
| Node.js | 22.x |
| Tailscale IP | 100.75.64.43 |

### 10.2 Environment Variables

| Variable | Purpose | Example |
|---|---|---|
| `BENCH_TARGET` | Engine API base URL | `http://127.0.0.1:3333` |
| `API_KEY` | Engine API key | `test-api-key` |
| `DATABASE_URL` | PostgreSQL connection | `postgres://cuecrux:cuecrux@localhost:5432/cuecrux` |
| `AUDIT_EMBEDDING_PROVIDER` | Embedding provider | `openai` |
| `OPENAI_API_KEY` | OpenAI API key | — |
| `EMBEDDERCRUX_BASE_URL` | Local embedder URL | `http://127.0.0.1:8080` |
| `EMBEDDING_DIM` | Embedding dimensions | `768` |
| `ANSWERS_RATE_LIMIT_MAX` | Rate limit per minute | `5000` (must be high for Cat 5) |
| `FEATURE_EMBEDDING_JOBS` | Background embedding | `false` (sync for audit) |

### 10.3 Running the Audits

```bash
git clone https://github.com/CueCrux/AuditCrux.git
cd AuditCrux
npm install
cp .env.example .env  # configure with Engine credentials

npm run audit:v1       # ~10 min, runs Cat 1-4 across V1/V3.1/V4.1
npm run audit:v2       # ~20 min, runs Cat 1-4 across V1/V3.1/V4.1
npm run audit:v3       # ~5 min, runs Cat 1-6 across V1/V3.1/V4.1
npm run audit:v3:dry   # validate corpus only (no queries)
npm run audit:all      # all three suites sequentially
```

**CLI flags:** `--mode V1|V3.1|V4.1|all` `--cat 1|2|3|4|5|6|all` `--dry-run`

### 10.4 Output

Results written to `scripts/audit-results/`:
- `audit-{version}-{timestamp}.json` — machine-readable
- `audit-{version}-{timestamp}.md` — human-readable report

### 10.5 Production Deployment Notes

- Engine `.env`: comment out `CROWN_SIGNING_PRIVATE_KEY_B64` (conflicts with Vault Transit in production)
- Set `ANSWERS_RATE_LIMIT_MAX=5000` (default 20 is too low for Cat 5's 50 queries)
- Engine container DATABASE_URL must use container DNS name (`postgres-engine:5432`), not `host.docker.internal:5433`
- Kill zombie tsx processes on port 3333 before running
- Vault Transit does NOT support `prehashed: true` for ed25519 keys (use pure Ed25519)

---

## Appendix: Scoring Formulas

### Citation Recall
`citation_recall = expected_docs_cited_by_LLM / total_expected_docs`

### Retrieved Recall
`retrieved_recall = expected_docs_returned_by_pipeline / total_expected_docs`

### Ranking Accuracy
`ranking_accuracy = correctly_ordered_pairs / total_expected_pairs`

### MiSES Accuracy
`mises_accuracy = expected_MiSES_docs_in_citations / total_expected_MiSES_docs`

### Fragility Score
`fragility = load_bearing_citations / total_selected_citations`

A citation is load-bearing if removing it either:
1. Reduces the citation set below 1, OR
2. Removes the sole domain representative when `remainingDomains < minDomains`

### Degradation Slope
`slope = (final_precision5 - baseline_precision5) / ((final_corpus_size - baseline_corpus_size) / 1000)`

### Jaccard Similarity (for MiSES comparison)
`jaccard(A, B) = |A ∩ B| / |A ∪ B|`
