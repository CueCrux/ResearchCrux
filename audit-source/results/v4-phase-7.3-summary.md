# Engine Quality Audit — Phase 7.3 (M8 Revalidation)

**Date:** 2026-03-23
**Suite:** v4 (13 categories, 1074 unique docs / 1127 ingested, 462 queries)
**Embedding:** EmbedderCrux nomic-embed-text-v1.5, 768d
**Infrastructure:** CueCrux-Data-1 (i9-13900, 192GB DDR5, 2×1.92TB NVMe RAID-1)
**Config manifest:** `Engine/docs/config-manifest-6.7.json` (6.6 base + M8 COSE_Sign1 additions)

---

## Executive Summary

Post-M8 deployment revalidation of the 7.3 quality baseline. The M8 milestone added COSE_Sign1 envelope signing (RFC 9052) with SCITT-compliant protected headers (kid + CWT Claims), CBOR-first payload encoding, and Vault Transit ed25519 signing. No retrieval code was changed.

**Key results:**
- **13/13 × 3 validated** (runs 5f947a4c, 185903ed, f134f66c)
- **Cat 7 broad_query_recall: 1.000 (3/3)** — all 12 broad themes fully covered
- **Cat 11 broad_recall: 0.927 (3/3)** — stable
- **Cat 2 avg_citation_recall: 0.704 / 0.659 / 0.659** — within expected LLM variance

**Trajectory:** ... → **13/13 (7.3, 3×)** → **13/13 (M8 revalidation, 3×)**

---

## Results Summary

| Run | ID | Cat 7 (broad_query_recall) | Cat 11 (broad_recall) | Cat 2 (avg_citation_recall) | Result |
|-----|------|---|---|---|---|
| 1 | 5f947a4c | 1.000 | 0.927 | 0.704 | 13/13 |
| 2 | 185903ed | 1.000 | 0.927 | 0.659 | 13/13 |
| 3 | f134f66c | 1.000 | 0.927 | 0.659 | 13/13 |

---

## Root Cause: Cat 7 False Failure (Surface Routing Disabled)

Initial M8 audit runs showed Cat 7 failing at broad_query_recall 0.644-0.667 (target ≥0.700). Investigation revealed the root cause:

**`FEATURE_QDRANT_READ: "false"` was set on the Engine during audit setup.** Surface routing uses `qdrantSummarySearch()` to find group centroids. With Qdrant read disabled, this call throws `qdrant_not_configured` and fails silently → surface routing returns 0 candidates → `coverageIds` contains only topK (22 docs) instead of all surface candidates (180 docs) → `retrieved_recall` drops from 1.000 to 0.33-0.87 per theme.

**Fix:** Re-enabled `FEATURE_QDRANT_READ: "true"` on the Engine AND set `QDRANT_URL` + `QDRANT_API_KEY` in the audit script environment so that `insertSummaryEmbeddings` writes group centroids to Qdrant (not just Postgres). This restores the full surface routing pipeline.

**Evidence:**
- Without Qdrant: Theme G retrievedIds=22, retrieved_recall=0.333 (5/15)
- With Qdrant: Theme G retrievedIds=180, retrieved_recall=1.000 (15/15)

**Lesson:** `QDRANT_URL` is required in audit script env when `FEATURE_QDRANT_READ=true` on the Engine. This was already documented in memory (`engine-audit-local-setup.md`) but was missed during M8 deployment setup.

---

## M8 Deployment Changes

| Change | Impact on Quality |
|--------|-------------------|
| COSE_Sign1 envelope signing (RFC 9052) | None — signing is post-retrieval |
| CBOR-first payload (kebab-case per CDDL) | None — payload encoding orthogonal to retrieval |
| Protected header: kid + CWT Claims (iss/sub) | None — header construction only |
| Migrations 128-133 (crown schema extensions) | None — no retrieval table changes |
| `SIGNATURES_ENABLED: "true"` | None — enables signing pipeline only |
| Vendored prom-client fix (Gauge.inc/dec) | Bug fix — prevented Engine startup crash |

---

## Production Config (Post-M8 Revalidation)

```yaml
# Phase 7.2 (frozen)
ABLATION_PINNED_IDS_POLICY: "profile_scoped"
FEATURE_CITATION_CASCADE: "true"
FEATURE_CITATION_CASCADE_PROFILE: "broad_only"
LLM_CASCADE_MODEL: "gpt-4o-mini"

# Phase 7.3 (frozen)
FEATURE_FORMAT_AWARE_CITATION: "true"
FEATURE_RELATION_PAIR_PRESERVATION: "true"

# M8 additions
SIGNATURES_ENABLED: "true"
CROWN_SIGNING_VAULT_TRANSIT_KEY: "engine-provenance"
CROWN_SCITT_ISSUER: "https://engine.cuecrux.com"

# Critical for audit
FEATURE_QDRANT_READ: "true"  # REQUIRED for surface routing (Cat 7)
CIRCUIT_BREAKER_ENABLED: "false"  # Disabled during audit, re-enable after
```

---

## Audit Environment

```bash
DATABASE_URL="postgres://cuecrux:...@100.75.64.43:5433/engine"
BENCH_TARGET="http://100.75.64.43:3333"
EMBEDDING_PROVIDER="embeddercrux"
EMBEDDERCRUX_BASE_URL="http://100.75.64.43:8079"
EMBEDDING_DIM=768
QDRANT_URL="http://100.75.64.43:6333"        # REQUIRED
QDRANT_API_KEY="kCexWISTy8Vw+CS8ukSj2aHaT2s0lf/Qrl5PQ4Xk3L4="  # REQUIRED
```

---

## Decision Log

| Decision | Rationale |
|----------|-----------|
| Re-enabled `FEATURE_QDRANT_READ` during audit | Surface routing requires Qdrant summary search; without it, Cat 7 false-fails |
| Reverted `FEATURE_THEME_AWARE_RETRIEVAL` to false | Experimental; no measurable improvement; not in 7.3 baseline |
| Reverted `ADMISSION_MIN_NOVEL_RATIO` to 0.30 | Experimental; not in 7.3 baseline |
| Kept `FEATURE_QUERY_DECOMPOSITION: "true"` | Part of 7.3 baseline; decomposition + surface routing together enable full theme coverage |
| M8 code does not affect retrieval | Confirmed via md5sum comparison of retrieval.ts, answers.ts, queryClassifier.ts, queryDecomposition.ts between prod and local |

---

## Files

| File | Description |
|------|-------------|
| `Engine/scripts/audit-results/audit-v4-2026-03-23T08-57-01.json` | Run 1 (5f947a4c) |
| `Engine/scripts/audit-results/audit-v4-2026-03-23T10-14-27.json` | Run 2 (185903ed) |
| `Engine/scripts/audit-results/audit-v4-2026-03-23T11-35-36.json` | Run 3 (f134f66c) |
