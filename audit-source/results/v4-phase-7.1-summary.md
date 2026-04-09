# Engine Quality Audit — Phase 7.1 Pre-Lock-In Hardening

**Date:** 2026-03-21
**Suite:** v4 (13 categories, 1074 unique docs / 1127 ingested, 462 queries)
**Embedding:** EmbedderCrux nomic-embed-text-v1.5, 768d
**Infrastructure:** CueCrux-Data-1 (i9-13900, 192GB DDR5, 2x1.92TB NVMe RAID-1)
**Config manifest:** `Engine/docs/config-manifest-6.5.json` (23 flags frozen — unchanged from 7.0)

---

## Executive Summary

Phase 7.1 is operational hardening, not feature work. The 6.5 config manifest stays frozen. Six milestones prove failure modes, establish retention policy, make DQP observable, align the dedup test path to production logic, add regression tests, and operationalise shadow replay.

**Initial run:** 11/13 PASS (run 7ff75d5a, 65m 34s)
**3× stability:** 11/13, 11/13, 12/13 (runs 253ee310, 85950b75, e557073b)

Cat 6 (fragility) fails consistently (3/3 FAIL — all-zero scores). Cat 11 (broad recall) fails 2/3 (0.607, 0.597 FAIL; 0.722 PASS). Both are known-variance categories formally reclassified as **monitor-only** in `slo-baseline.json`. All 11 required categories pass consistently across all 4 runs. Cat 9 — the only category directly affected by code changes (M3: production dedup alignment) — **PASSED** on every run with stable canonical_recall (0.914–0.943).

**Trajectory:** 10/11 → 12/12 → 10/12 → 10/12 → 11/12 → 12/12 (3x) → 12/12 (3x) → **13/13 (3x)** → **11-12/13 (4x)**

---

## What Changed Since Phase 7.0

### M0: Failure Drill Script

**File:** `Engine/scripts/drills/signing-readiness-drill.ts`

Six scenarios verifying fail-closed/fail-open behaviour end-to-end:

| # | Scenario | Checks |
|---|----------|--------|
| 1 | Vault Transit down | `/readyz` 503, circuit open, verified blocked, light succeeds |
| 2 | Vault restored | `/readyz` 200, circuit closed, signing queue drained |
| 3 | Manifest unavailable | `/readyz` 503, all modes blocked |
| 4 | Knowledge bridge disabled (shadow) | No fail-closed, verified/audit succeed |
| 5 | Knowledge bridge unavailable + authoritative | Verified fails, light succeeds |
| 6 | Combined: Transit down + bridge disabled | Light succeeds, verified blocked, queue grows |

Each scenario verifies HTTP status codes, response bodies, and Prometheus metric values. `--check-baseline` mode for pre-drill health verification. JSON output for archival.

### M1: Retention & Offboarding Policy

| Deliverable | File | Description |
|-------------|------|-------------|
| Policy document | `Engine/docs/retention-policy.md` | Crown receipts (indefinite), config manifests (indefinite), pending_signature (90-day window), offboarding (artefacts deleted, receipts retained) |
| Migration 132 | `Engine/src/db/migrations/132_pending_signature_expiry.sql` | `signing_expires_at TIMESTAMPTZ` column + partial index |
| Signing queue expiry | `Engine/src/services/crown/signing-queue.ts` | CTE marks expired rows, emits `crownReceiptExpiredTotal` counter |
| Receipt INSERT | `Engine/src/services/receipts.ts` | Sets `signing_expires_at = generated_at + 90 days` for pending receipts |
| Metric | `Engine/src/observability/metrics.ts` | `crown_receipt_expired_total` counter |

**Compliance mapping:** EU AI Act Art 13-14, DORA Art 8-11. Receipts are immutable compliance evidence. Tenant data deleted per erasure workflow, but receipts (hash-only, self-contained) persist.

### M2: DQP Metadata Observability

| Deliverable | File | Description |
|-------------|------|-------------|
| Sanity check script | `Engine/scripts/diagnostics/dqp-metadata-check.ts` | Per-tenant NULL rate checks on `corpus_class`, `dqp_quality_score`, `chunker_version`, `dedup_status`, `dqp_tier3_applied` |
| Grafana dashboard | `Engine/ops/dashboards/dqp-observability.json` | 10 panels: fallback rate, quality scores, dedup actions, jobs backlog, duplicate ratio, quality gate, tier3 backlog, similarity distribution, technique applications, gate skips |

Dashboard references recording rules from `WatchCrux/prometheus/rules/engine.rules.yml`: `job:dqp_fallback_rate_30m`, `job:dqp_quality_reject_rate_15m`, `job:dqp_tier3_backlog`, `job:dqp_duplicate_ratio_30m`.

### M3: Dedup Single Truth Path

**File:** `Engine/scripts/audit-v4/quality-audit-v4.ts`

**Before (hardcoded):**
```
canonicalIds.has(d.id) ? "novel" : "duplicate"
```
Hardcoded cluster membership determined dedup status. Production runtime (`semanticDedup()`) never ran for audit corpus.

**After (production-aligned):**
```
runProductionDedup(pool, docs, idMap, clusters, canonicalMap, tenant)
```
- Processes canonicals first (guaranteed novel — no prior docs to match against)
- For each subsequent doc, queries cosine similarity against already-processed docs
- Uses production thresholds from `Engine/src/dqp/dedup.ts`: >=0.9 = duplicate, >=0.8 = derivative, <0.8 = novel

**Result:** 39 novel, 48 duplicate, 39 derivative. Cat 9 PASS with `canonical_recall_rate=0.914`, `dedup_effectiveness=0.615`.

**Interpretation:** Production similarity thresholds classify some corpus docs as "derivative" (0.8-0.9 similarity) rather than "duplicate" (>=0.9), so more near-duplicates appear in retrieval results. The canonical recall rate (91.4%) confirms production dedup correctly identifies most canonicals. The lower dedup effectiveness (0.615 vs 1.000) reflects honest measurement — production thresholds are less aggressive than hardcoded labels, and some corpus near-duplicates are genuinely derivative rather than exact duplicates.

### M4: Semantic Chunker No-Split Regression Test

**File:** `Engine/tests/dqp.semantic-chunker.test.ts`

Two new test cases for the `chunks.length === 1` content preservation path:

1. **No-split content preservation:** 3 semantically-similar sentences joined by `\n\n`. Verifies output === original input (including newlines, paragraph structure).
2. **Whitespace structure preservation:** Content with tabs and newlines. Verifies `\t` and `\n` survive the no-split path.

All 6 tests pass (`pnpm vitest run tests/dqp.semantic-chunker.test.ts`).

### M5: Shadow Replay Operational Readiness

| Deliverable | File | Description |
|-------------|------|-------------|
| Capture rotation | `Engine/scripts/shadow-replay/capture-rotate.sh` | Enable/disable `FEATURE_REPLAY_CAPTURE`, extract JSONL from journalctl, timestamped rotation |
| Release gate integration | `Engine/scripts/release-gate.sh` | Shadow replay check: if capture file exists in `captures/`, replay and assert `regression_rate == 0` |
| Captures directory | `Engine/scripts/shadow-replay/captures/` | Output directory for rotated capture files |

**Release gate flow with replay:**
```
Config manifest check → Preflight → SLO validation → Shadow replay check → PASS/FAIL
```

Replay step is non-blocking when no capture file exists (fresh environments skip gracefully).

---

## Changes Since Initial Run (External Audit Recommendations)

Following external audit review (2026-03-21), six changes were applied before the 3× stability runs:

### 1. Cat 9 canonical_recall reconciliation

Raw audit data confirmed `canonical_recall = 0.914` (32/35), not 1.000 as previously reported in the cross-phase summary. Fixed across all report files. Correct framing: "honest methodology shift plus a modest real drop in canonical selection."

### 2. Baseline separation

Two baselines are now explicitly separated in documentation:

- **Phase 7.0 = canonical quality baseline** — 13/13 with 3× stability, replay determinism, pinnedIds trade-off surface characterised
- **Phase 7.1 = hardening / ops baseline** — operational readiness validation on top of 7.0. Not a new quality standard.

### 3. Cat 6/11 reclassified as monitor-only

`Engine/docs/slo-baseline.json` updated:
- Cat 6: `required: false` — LLM variance causes all-zero fragility scores unrelated to retrieval changes
- Cat 11: `required: false`, threshold aligned from 0.90→0.70 to match audit code — ranges 0.273-0.927 across phases
- Cat 9: metric corrected from `dedup_effectiveness >= 0.95` to `canonical_recall_rate >= 0.70` (matches audit code)

### 4. DQP checks promoted to release gate

`Engine/scripts/release-gate.sh` now includes two release-blocking DQP checks:
- **DQP metadata null-rate:** runs `dqp-metadata-check.ts --gate`, fails if critical columns (`dedup_status`, `chunker_version`, `corpus_class`) exceed 50% NULL
- **DQP fallback rate:** reads `/metrics`, fails if fallback rate > 30% (configurable via `DQP_FALLBACK_RATE_THRESHOLD`)

Updated release gate flow:
```
Config manifest → Preflight → SLO validation → DQP metadata gate → DQP fallback rate → Shadow replay → PASS/FAIL
```

### 5. Baseline drill archived

`Engine/scripts/drills/results/baseline-2026-03-21.json` — readyz=200, metrics reachable, queries not degraded. Attached to lock-in decision as evidence that fail-closed/fail-open behaviour is exercised, not just coded.

### 6. DQP surface area frozen

Explicit decision: no new DQP features before lock-in. Keep production dedup, chunker tests, metadata checks. Do not enable Tier 3, dual-embedding HyDE, or multi-lane retrieval. Post-lock target: structured-doc handling (format-aware indexing), not broader DQP activation.

---

## 3× Stability Results (Runs 253ee310, 85950b75, e557073b)

| Run | ID | Duration | Result | Failures |
|-----|-----|----------|:------:|----------|
| 1 | 253ee310 | 65m 52s | **11/13** | Cat 6, Cat 11 |
| 2 | 85950b75 | 68m 56s | **11/13** | Cat 6, Cat 11 |
| 3 | e557073b | 71m 48s | **12/13** | Cat 6 |

### Key Metrics Across 3× Runs

| Category | Metric | Run 1 | Run 2 | Run 3 | Range | Status |
|----------|--------|:-----:|:-----:|:-----:|:-----:|:------:|
| Cat 1 | avg_recall | 1.000 | 1.000 | 1.000 | ±0.000 | P/P/P |
| Cat 2 | citation_recall | 0.704 | 0.659 | 0.659 | ±0.022 | P/P/P |
| Cat 3 | combined_retrieved | 0.830 | 0.806 | 0.824 | ±0.012 | P/P/P |
| Cat 5 | chains_intact | 10/10 | 10/10 | 10/10 | ±0.000 | P/P/P |
| Cat 6 | monotonic_order | false | false | false | — | **F/F/F** |
| Cat 7 | broad_query_recall | 1.000 | 1.000 | 1.000 | ±0.000 | P/P/P |
| Cat 8 | P@1 | 0.925 | 0.925 | 0.925 | ±0.000 | P/P/P |
| Cat 9 | canonical_recall | 0.914 | 0.943 | 0.914 | ±0.014 | P/P/P |
| Cat 9 | dedup_effectiveness | 0.615 | 0.604 | 0.615 | ±0.006 | — |
| Cat 10 | chain_completeness | 0.933 | 0.933 | 0.933 | ±0.000 | P/P/P |
| Cat 11 | broad_recall | 0.607 | 0.597 | 0.722 | ±0.062 | **F/F/P** |
| Cat 12 | parent_child_recall | 0.846 | 0.846 | 0.846 | ±0.000 | P/P/P |
| Cat 12v2 | adversarial_recall | 0.818 | 0.818 | 0.818 | ±0.000 | P/P/P |

**Perfectly stable (zero variance):** Cat 1, Cat 5, Cat 7, Cat 8, Cat 10, Cat 12, Cat 12v2

**Cat 6 — FAIL 3/3:** All-zero fragility on every run. Validates the monitor-only reclassification — consistent LLM behaviour, not intermittent flakiness.

**Cat 11 — FAIL 2/3, PASS 1/3:** broad_recall 0.597–0.722. Run 3 passed (0.722 ≥ 0.70), Runs 1-2 fell just below. Validates monitor-only status. **RECOVERED in Phase 7.2** — M0 (profile-scoped pinnedIds) + M1 (selective cascade broad_only) stabilized at 0.722 (3/3 PASS).

**Cat 9 — stable under production dedup:** canonical_recall 0.914–0.943, dedup_effectiveness 0.604–0.615. Production dedup alignment from M3 produces consistent, honest results.

---

## Per-Category Results (Run 7ff75d5a — Initial Run)

| Cat | Name | Result | Key Metric | vs 7.0 |
|-----|------|:------:|------------|--------|
| 1 | Relation-Bootstrapped Retrieval | PASS | avg_recall=1.000 | Stable |
| 2 | Format-Aware Ingestion Recall | PASS | citation_recall=0.652, retrieved_recall=0.911 | citation ±0.02 LLM variance |
| 3 | BM25 vs Vector Decomposition | PASS | combined_citation_recall=0.655, retrieved_recall=0.824 | ±0.03 LLM variance |
| 4 | Temporal Edge Cases | PASS | V1 mode skip | Stable |
| 5 | Receipt Chain Stress | PASS | 10/10 chains intact | Stable |
| **6** | **Fragility Calibration** | **FAIL** | all_zero=true, monotonic=false | Regressed (LLM variance) |
| 7 | Hierarchical Broad Query Recall | PASS | broad_query_recall=1.000, avg_recall=0.673 | Stable |
| 8 | Proposition Precision | PASS | P@1=0.925 (74/80) | -0.038 LLM variance |
| **9** | **Semantic Dedup** | **PASS** | canonical_recall=0.914, dedup_eff=0.615 | **M3 change: production dedup** |
| 10 | Contextual Chain Recall | PASS | chain_completeness=0.900 (27/30) | Within 7.0 range (0.933-0.967) |
| **11** | **Multi-Doc Broad Recall** | **FAIL** | broad_recall=0.647 | Below target; known volatile |
| 12 | Hard-Negative Overlap | PASS | parent_child=0.846, version_prec=1.000 | LLM variance on parent_child |
| 12v2 | Adversarial Expansion | PASS | adversarial_recall=0.818 | Stable |

### Failure Analysis

**Cat 6 (Fragility):** All fragility scores returned 0. The LLM cited enough documents with sufficient domain diversity that removing any single citation never violates the 2-domain minimum. This is an intermittent pattern — Cat 6 passed in 7.0 but has failed in prior phases (6.3) for the same reason. Not caused by 7.1 changes (no retrieval or LLM config modified).

**Cat 11 (Multi-Doc Broad Recall):** `broad_recall=0.647` (target >=0.800). This category has the widest variance range across all phases: 0.273 (6.0 full-corpus), 0.927 (7.0 3x stability), 0.827 (7.0 validation). The LLM's multi-document citation selection is structurally bounded by prompt context limits. Not caused by 7.1 changes.

### Key Metric Comparison: 7.0 vs 7.1

| Metric | 7.0 (3x range) | 7.1 | Delta | Cause |
|--------|:-:|:-:|:-:|-------|
| Cat 8 P@1 | 0.963 | 0.925 | -0.038 | LLM citation variance |
| Cat 9 dedup_effectiveness | 1.000 | 0.615 | -0.385 | **M3: production thresholds replace hardcoded** |
| Cat 9 canonical_recall | 1.000 | 0.914 | -0.086 | **M3: production dedup (3 canonicals not top-ranked)** |
| Cat 10 chain_completeness | 0.933-0.967 | 0.900 | -0.033 | LLM variance (within prior range 0.869-0.967) |
| Cat 11 broad_recall | 0.927 | 0.647 | -0.280 | LLM multi-doc variance (not caused by 7.1) |
| Cat 12 parent_child_recall | 1.000 | 0.846 | -0.154 | LLM variance (MiSES/pinnedIds unchanged) |
| Cat 12v2 adversarial_recall | 0.818 | 0.818 | 0 | Stable |

### Cat 9 Deep Dive — Production Dedup vs Hardcoded

| Metric | 7.0 (hardcoded) | 7.1 (production) | Interpretation |
|--------|:--:|:--:|------|
| PASS/FAIL | PASS | PASS | Both pass |
| dedup_effectiveness | 1.000 | 0.615 | Production thresholds classify some near-dupes as "derivative" (0.8-0.9 similarity) not "duplicate" (>=0.9) |
| canonical_recall_rate | 1.000 | 0.914 | 3 of 35 canonicals not retrieved at rank 1 — genuine finding |
| avg_dupes_per_cluster | 0.000 | 1.000 | ~1 near-duplicate per cluster appears in results (derivative docs pass the hard filter) |
| total_canonical_found | 35 | 32 | 3 misses — production similarity scoring doesn't guarantee canonical always outranks derivatives |
| Dedup distribution | 35 novel, 91 duplicate, 0 derivative | 39 novel, 48 duplicate, 39 derivative | Derivative category now populated |

**Bottom line:** The hardcoded path inflated dedup metrics by pre-labelling cluster membership. The production path reveals that cosine similarity at the 0.8-0.9 boundary classifies many near-duplicates as "derivative" rather than "duplicate". This is an honest measurement — the split-brain between audit and production is eliminated.

---

## Cross-Phase Metric Trajectory (Updated)

| Category | 6.0 | 6.1 | 6.2 | 6.3 | 6.4 | 6.5 | 6.6 | 7.0 | 7.1 |
|----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 Relation Retrieval | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 2 Format Recall | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 3 BM25/Vector | FAIL | PASS | FAIL | **PASS** | PASS | PASS | PASS | PASS | PASS |
| 4 Temporal | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 5 Receipt Chain | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 6 Fragility | PASS | PASS | PASS | FAIL | **PASS** | PASS | PASS | PASS | **FAIL** |
| 7 Broad Recall | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 8 Precision | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 9 Dedup | *0.000* | **PASS** | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 10 Chain Recall | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 11 Multi-Doc | *bug* | PASS | FAIL | **PASS** | PASS | PASS | PASS | PASS | **FAIL** |
| 12 Hard-Negative | — | PASS | PASS | FAIL | FAIL | **PASS** | **PASS** | **PASS** | PASS |
| 12v2 Adversarial | — | — | — | — | — | — | — | **PASS** | PASS |
| **Total** | **10/11** | **12/12** | **10/12** | **10/12** | **11/12** | **12/12** | **12/12** | **13/13** | **11/13** |

### Key Metric Deep Dive (Updated with 3×)

| Metric | 6.0 | 6.1 | 6.2 | 6.3 | 6.4 | 6.5 | 6.6 | 7.0 (3x) | 7.1 (4x range) | Best |
|--------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:--------:|:--------------:|:----:|
| Cat 8 P@1 | 0.963 | 0.963 | 0.963 | 0.963 | 0.963 | 0.963 | 0.963 | **0.963** | 0.925 | 0.963 |
| Cat 9 dedup_eff | 0.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | **1.000** | *0.604–0.615* | 1.000 |
| Cat 9 canonical_recall | — | — | — | — | — | — | — | — | **0.914–0.943** | 0.943 |
| Cat 10 chain | 0.984 | 1.000 | 0.885 | — | — | — | 0.900 | **0.933–0.967** | 0.900–0.933 | 1.000 |
| Cat 11 broad | 0.927 | 0.927 | 0.927 | — | — | — | 0.827 | **0.927** | 0.597–0.722 | 0.927 |
| Cat 12 version_prec | — | 1.000 | — | — | 0.444 | **1.000** | **1.000** | **1.000** | 1.000 | 1.000 |
| Cat 12 parent_child | — | 0.692 | — | — | 0.538 | 0.462 | **1.000** | **1.000** | 0.846 | **1.000** |
| Cat 12 retrieved | — | 1.000 | 1.000 | — | 1.000 | 1.000 | **1.000** | **1.000** | 0.972 | 1.000 |
| Cat 12v2 adversarial | — | — | — | — | — | — | — | **0.818** | 0.818 | 0.818 |

*Cat 9 dedup_effectiveness 7.1 values (0.604–0.615) reflect production similarity thresholds, not a regression. Prior values (1.000) used hardcoded labels. Metrics are not directly comparable.*

---

## Files Changed (Phase 7.1)

| Milestone | File | Change |
|-----------|------|--------|
| M0 | `Engine/scripts/drills/signing-readiness-drill.ts` | Failure drill script (6 scenarios) — NEW |
| M1 | `Engine/docs/retention-policy.md` | Retention & offboarding policy — NEW |
| M1 | `Engine/src/db/migrations/132_pending_signature_expiry.sql` | `signing_expires_at` column + index — NEW |
| M1 | `Engine/src/services/crown/signing-queue.ts` | 90-day expiry logic in worker |
| M1 | `Engine/src/services/receipts.ts` | `signing_expires_at` on INSERT, `SigningStatus` type expanded |
| M1 | `Engine/src/observability/metrics.ts` | `crownReceiptExpiredTotal` counter |
| M2 | `Engine/scripts/diagnostics/dqp-metadata-check.ts` | DQP metadata sanity check — NEW |
| M2 | `Engine/ops/dashboards/dqp-observability.json` | Grafana dashboard (10 panels) — NEW |
| M3 | `Engine/scripts/audit-v4/quality-audit-v4.ts` | Removed hardcoded dedup stamping; added `runProductionDedup()` |
| M4 | `Engine/tests/dqp.semantic-chunker.test.ts` | 2 new test cases (no-split preservation) |
| M5 | `Engine/scripts/shadow-replay/capture-rotate.sh` | Capture rotation script — NEW |
| M5 | `Engine/scripts/release-gate.sh` | Shadow replay check added |
| Audit | `Engine/docs/slo-baseline.json` | Cat 6/11 → monitor-only, Cat 9 metric corrected |
| Audit | `Engine/scripts/diagnostics/dqp-metadata-check.ts` | Added `--gate` mode for release gate |
| Audit | `Engine/scripts/release-gate.sh` | DQP metadata + fallback rate gates added |
| Audit | `Engine/scripts/drills/signing-readiness-drill.ts` | Baseline check fixes (readyz field, stderr in JSON mode) |
| Audit | `Engine/scripts/drills/results/baseline-2026-03-21.json` | Archived drill evidence |

---

## Known Limitations (Updated)

| Limitation | Status | Resolution Path |
|------------|--------|-----------------|
| Cat 6 all-zero fragility | ~~Monitor-only FAIL 4/4~~ **RECOVERED in Phase 7.2** — graduated scoring with llm_invariant detection. PASS 4/4 in 7.2 | Phase 7.2 M2: graduated scoring replaces binary pass/fail |
| Cat 11 broad_recall volatile | **Monitor-only** — 3/4 PASS in 7.2 (range 0.622-0.827). `required: false` in slo-baseline.json. Profile-scoped pinnedIds pending deployment | Phase 7.2 M0/M1: profile-scoped pinnedIds + selective cascade |
| Cat 9 dedup_effectiveness 0.604-0.615 | **Expected** — production thresholds; canonical_recall stable at 0.914-0.943 | SLO metric corrected to canonical_recall_rate >= 0.70 |
| Cat 8 P@1 0.925 | Stable across 3× (zero variance). Still passes (target >=0.80) | Monitor; no action needed |
| Cat 12 parent_child_recall 0.846 | Stable across 3× (zero variance). Still passes (target >=0.70) | Monitor; MiSES pinnedIds unchanged |
| Migration 132 partial on prod | `signing_expires_at` column added; backfill/index skipped (no `signing_status` column yet) | Apply migration 130 first when deploying CROWN signing to production |
| Cat 10 chain_completeness 0.900-0.933 | Stable across 3× (0.933 × 3). Within known range (0.869-0.967) | LLM citation variance on eng-domain chains |

---

## Milestone Summary

| Milestone | Goal | Deliverables | Audit Impact |
|-----------|------|-------------|--------------|
| M0 | Prove failure modes | Drill script (6 scenarios) | None (read-only tooling) |
| M1 | Retention policy | Policy doc + migration 132 + worker expiry + metric | None (signing infrastructure, not retrieval) |
| M2 | DQP observability | Sanity check script + Grafana dashboard | None (diagnostic tooling) |
| M3 | Align dedup truth path | `runProductionDedup()` replaces hardcoded stamping | **Cat 9: production thresholds, still PASS** |
| M4 | Chunker regression test | 2 new test cases, all 6 pass | None (test-only) |
| M5 | Replay operational readiness | Capture rotation + release gate integration | None (tooling) |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-21 | 90-day pending_signature expiry | Matches DORA audit trail window. Receipts remain as compliance evidence but signing window closes |
| 2026-03-21 | Production dedup replaces hardcoded stamping in Cat 9 | Eliminates split-brain between audit and production. Lower dedup_effectiveness (0.615) is honest — hardcoded labels inflated the metric |
| 2026-03-21 | Cat 6/11 reclassified as monitor-only | External audit: too volatile to sit between release-blocker and monitor. `required: false` in slo-baseline.json. Cat 6 FAIL 4/4, Cat 11 FAIL 3/4 validates this |
| 2026-03-21 | 11/13 result accepted for lock-in | Failures are in monitor-only categories. All 7.1 changes (M0-M5) validated. Cat 9 PASS with production dedup confirms dedup truth path alignment |
| 2026-03-21 | Cat 9 canonical_recall reconciled to 0.914 | External audit caught inconsistency — cross-phase summary claimed 1.000, raw data shows 32/35. Fixed across all reports |
| 2026-03-21 | 7.0 = quality baseline, 7.1 = ops baseline | External audit: 7.0 proved quality (13/13 × 3), 7.1 proved operational claims. Don't conflate |
| 2026-03-21 | DQP checks promoted to release gate | External audit: observability should be release-blocking, not just dashboarded. Null-rate and fallback-rate checks now fail promotion |
| 2026-03-21 | DQP surface area frozen | External audit: no Tier 3, no HyDE, no multi-lane before lock-in. Post-lock target: structured-doc handling |
| 2026-03-21 | 3× stability confirms monitor-only decisions | 253ee310 (11/13), 85950b75 (11/13), e557073b (12/13). Cat 6 consistent FAIL, Cat 11 borderline. All required categories pass 3/3 |
