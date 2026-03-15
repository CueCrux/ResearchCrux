# DQP Functionality Shift Recommendation

**Date:** 2026-03-14
**Status:** Recommendation — informed by v4 isolation benchmarks and platform doc cross-reference
**Depends on:** `dqp-findings.md`, `embedding-comparison.md`, v4 isolation probes (AuditCrux RESULTS.md)

---

## Verdict

Shift DQP from a universal baseline treatment to a targeted product feature. The evidence supports this as the intended operating model, not a retreat.

---

## Evidence Cross-Reference

### 1. The master plan already says Tier 3 is gate-controlled

The DQP Master Plan (§2) defines 9 corpus classes. Tier 3 (hierarchical summaries, proposition extraction) defaults:

| Class | Tier 3 Default | Rationale |
|-------|---------------|-----------|
| `system` | Always ON | Platform docs, runbooks, API specs |
| `private_team` | ON if `dqp_tier3_private=true` | Paid tenant entitlement |
| `private_pro` | Gate by quality score | Pro tier corpus |
| `private_starter` | OFF (upsell path) | Free/starter gated |
| `private_free` | OFF (upsell path) | Free gated |
| `public_high` | Gate by document type | Only policy/regulation/adr/specification |
| `public_standard` | OFF | Not eligible |
| `public_low` | OFF | Not eligible |
| `agent_grounding` | Gate by agent tier | Contextual |

**Code:** `Engine/src/dqp/corpus-classifier.ts` — `shouldApplyTier3()` implements this gating.
**Implication:** The v4 benchmark treated all 1025 docs as a single tenant with uniform DQP treatment. This contradicts the plan's per-class gating. Cat 7/8 failures measure an operating mode the plan never intended as default.

### 2. The retrieval stack has unused capacity that would help more than DQP tuning

**Relation expansion** (`FEATURE_RELATION_EXPANSION`): Implemented but OFF. The v3 benchmark run `e26bf4ed` with relation expansion shows improved cross-format causal chain retrieval. This directly addresses Cat 7 broad recall — expanding related documents adds candidates without relying on broader embedding similarity.

**Format-aware ingest**: Production, 100% recall across MIME types (v3 Cat 2). Already working. The annotation strategy (LLM prose summaries for structured docs) is proven.

**Multi-lane retrieval** (`FEATURE_MULTI_LANE_RETRIEVAL`): Implemented but OFF. The four-lane architecture (base_local_768, premium_portable_1024, premium_openai_small_1536, pro_openai_large_3072) provides mode-aware quality scaling without universal cost. Light mode = lane 0 only; verified = lane 0+1; audit = all lanes.

**Content-type-aware scoring**: Production. Different vec/bm25 weight ratios for structured vs informal vs prose content. Already active.

**Reputation priors**: Production. Domain-based reputation scores influence fused scores. Already active.

**Not yet implemented:** Rerank (planned for verified/audit modes). This is the single biggest missing piece for precision under corpus competition.

### 3. The embedding A/B is already done

`embedding-comparison.md` shows 40/40 parity between OpenAI and EmbedderCrux/nomic across v1-v3. nomic has 2x better scale degradation slope. The production decision is made — nomic is baseline. No further A/B needed.

### 4. The feedback-to-upgrade loop exists but isn't wired

Migration `046_embedding_upgrade_jobs.sql` defines 4 upgrade reasons: `auto_score`, `paid`, `watchcrux`, `ui_feedback`. The `quality.ts` route handles boost estimation and job creation. But the WebCrux UI doesn't emit `ui_feedback` upgrade requests yet. This is the fastest path to a real product loop: user flags poor grounding → system upgrades the artifact → receipts/relevance/latency improve measurably.

### 5. Cat 7/8 failures are corpus-design artifacts, not retrieval defects

| Finding | Evidence |
|---------|----------|
| Cat 7 broad recall = 0.333 with DQP on OR off | No-split fix eliminated DQP as cause; corpus max doc ~384 tokens (too small for thematic recall target ≥0.70) |
| Cat 8 P@1 drops 0.850 → 0.675 with DQP | `fallbackChunk` whitespace flattening paradoxically improves FTS token boundaries for structured numbered-list docs — content-format dependency, not a chunking defect |
| Full corpus (1025 docs) degrades both by ~50% | Cross-category contamination — Cat 7/8 queries compete against 765 irrelevant docs. Per-tenant isolation (the production model) wouldn't have this problem |

---

## Recommended Shifts

### A. Tier 3 as product feature, not universal baseline

Apply Tier 3 only where `shouldApplyTier3()` returns true:
- System docs, private team/pro docs, and eligible public_high document types
- Gate via corpus class + quality score + document type
- This is what the plan says. Benchmarks should test this gating, not bypass it.

### B. Practical sequence

The priority ordering below reflects a key insight: fix the measurement harness first (or in parallel), so that subsequent feature changes are judged through a truthful benchmark, not one that blends corpus stress with feature correctness into a single distorted number.

| Phase | Action | Rationale |
|-------|--------|-----------|
| **0** | **Fix benchmark: per-tenant or per-category isolation** | Cat 7/8 lose ~50% of their score under full-corpus contamination. Judging relation expansion or rerank through that lens risks false negatives. Run in parallel with Phase 1. |
| **1** | **Enable `FEATURE_RELATION_EXPANSION=true`** | Best immediate lever for Cat 7 broad recall. Expands related candidates via graph edges instead of hoping broader embeddings do all the lifting. Target: Cat 7 materially above 0.333, with 0.50 as first milestone. |
| **2** | **Implement rerank (verified/audit modes)** | Highest-ROI precision fix for Cat 8. The fallback-flattening result is a clue: the system often finds the right material but can't consistently place it first once the corpus gets noisy. That is rerank territory. |
| **3** | **Enable `FEATURE_MULTI_LANE_RETRIEVAL=true`** | Quality scales by mode instead of by brute force. Light stays cheap, verified gets more quality, audit gets the full treatment. Requires MV updates for lanes beyond base_local_768. |
| **4** | **Wire WebCrux `ui_feedback` → upgrade jobs** | Backend exists (migration 046, `quality.ts`), UI doesn't emit yet. Once relation expansion and rerank are in, this becomes one of the most valuable switches — real-world evidence instead of lab numbers. |
| **5** | **Build v5 / Cat 11 corpus (500-2000+ token docs)** | Validates semantic chunker on genuine multi-chunk splits. Important, but a validation asset, not the first rescue boat for today's Cat 7/8 outcomes. |

### C. Performance improvements to add now

**Query-class routing.** Broad thematic recall (Cat 7) and precise fact lookup (Cat 8) should not use the same retrieval recipe. Broad queries should get larger candidate pools plus relation expansion; precision queries should get tighter lexical weighting plus rerank. This inference fits the Cat 7/Cat 8 split cleanly.

**Lexical shadow representation for structured docs.** Keep the preserved original text for provenance and display, but also index a normalised (whitespace-flattened) shadow version for FTS. The benchmark already shows flattened text helps structured precision queries (Cat 8 P@1 = 0.850 vs 0.675 with paragraph structure). A dual representation recovers Cat 8 precision without undoing the no-split fix. This is an inference from benchmark behaviour, not something the docs state outright.

**Delay HyDE dual-embedding until after rerank and multi-lane.** HyDE is implemented and gated (`FEATURE_DQP_HYDE_DUAL_EMBEDDING`), and it likely helps vocabulary-gap cases, but the biggest immediate misses are relation expansion inactive and rerank absent. It is a second-wave optimisation, not the first spanner to reach for.

### D. Proposition extraction for precision-heavy document classes only

The DQP plan positions proposition extraction as Premium (team/enterprise). Use it for:
- Policy, specification, runbook, ADR documents
- Private team docs with density score ≥ 0.6
- Not blanket public corpus

---

## What NOT to do

1. **Don't lower Cat 7/8 targets** — the targets are reasonable; the corpus and benchmark methodology need fixing
2. **Don't revert the no-split fix** — it's verified correct (Cat 7 identical DQP on/off)
3. **Don't A/B embeddings again** — decision is made, nomic is baseline with measurably better scale behaviour; enterprise-scale differences are largely corpus-driven rather than embedding-driven
4. **Don't apply DQP universally** — the master plan explicitly gates Tier 3 by corpus class; benchmarking against universal application tests an invalid operating mode
5. **Don't reach for HyDE dual-embedding first** — relation expansion and rerank address the actual gaps; HyDE is second-wave

---

## Verification Plan

| Phase | Step | Validates | Target |
|-------|------|-----------|--------|
| 0 | Per-tenant/per-category benchmark isolation | Truthful measurement baseline | Cat 8 ≥ 0.850 reproduces `iso-baseline` result |
| 1 | Enable `FEATURE_RELATION_EXPANSION`, run v3 full suite | No regressions from relation expansion | Cat 1-6 pass rate remains 16/16 |
| 1 | Run Cat 7+8 with relation expansion + isolated corpus | Broad recall improvement | Cat 7 ≥ 0.50 (up from 0.333) |
| 2 | Implement rerank, run Cat 8 with isolated corpus | Precision@1 under corpus competition | Cat 8 P@1 ≥ 0.80 with DQP on |
| 3 | Enable multi-lane, run full suite | Mode-aware quality scaling | Cats 1-6 stable, Cat 3 improved |
| 4 | Wire `ui_feedback` → upgrade jobs in WebCrux | Product loop closure | End-to-end feedback → re-embed measured |
| 5 | Build v5 corpus (Cat 11), run with semantic chunking | Multi-chunk split validation | Cat 11 within-chunk recall ≥ 0.90 |

---

## Source Documents

| Document | Location |
|----------|----------|
| DQP Master Plan v1.0 | `PlanCrux/docs/master-plan/Data-Quality-Pipeline-Master-Plan-v1_0.md` |
| RAG Pack 03: Embeddings & Ingestion | `PlanCrux/docs/master-plan/RAG-Pack-03-Embeddings-Ingestion.md` |
| Embedding Comparison | `ResearchCrux/evidence/embedding-comparison.md` |
| DQP Benchmark Findings | `ResearchCrux/evidence/dqp-findings.md` |
| v4 Isolation Results | `AuditCrux/RESULTS.md` (v4 DQP Isolation Probes section) |
| Corpus Classifier | `Engine/src/dqp/corpus-classifier.ts` |
| Retrieval Service | `Engine/src/services/retrieval.ts` |
| Quality Routes | `Engine/src/routes/quality.ts` |
| Upgrade Jobs Migration | `Engine/src/db/migrations/046_embedding_upgrade_jobs.sql` |

---

*Cross-referenced from v4 isolation benchmarks (2026-03-14) and platform documentation.*
