# MemoryCrux — Cost Analysis: Tool-Mediated Memory vs Context-Stuffing

**Date:** 2026-03-27
**Source:** [AuditCrux/benchmarks/memorycrux](https://github.com/CueCrux/AuditCrux/tree/main/benchmarks/memorycrux) — Delta project (3,346 docs, 2M+ tokens, 3 models, 5 arms)
**Pricing source:** Crux Platform Pricing Alignment Matrix v1.1 (23 March 2026)

---

## Summary

Frontier LLMs now offer 400K–1M token context windows. A common assumption is that you can skip external memory systems and "just dump everything into the prompt." The Delta benchmark measures the real cost of this approach at production scale.

**Result: context-stuffing is both the most expensive and the least effective approach.**

| | Context-stuffing (C2) | MemoryCrux T2 | Savings |
|---|---|---|---|
| **Sonnet 4.6** | $13.43/session, 28% recall | $2.59/session, 100% recall | **81% cheaper, 3.6× better** |
| **GPT-5.4** | $10.04/session, 8% recall | $1.53/session, 80% recall | **85% cheaper, 10× better** |
| **GPT-5.4-mini** | $0.42/session, 40% recall | $0.07/session, 72% recall | **83% cheaper, 1.8× better** |

---

## Subscription Breakeven

MemoryCrux is a paid service (Crux Platform tiers: Developer £9/mo, Starter £29/mo, Pro £79/mo, Team £199/mo). The subscription pays for itself through reduced LLM API costs:

| Tier | ≈ USD/mo | Breakeven (Sonnet T2) | Breakeven (GPT-5.4 T3) |
|------|---------|----------------------|------------------------|
| **Developer** | ~$11 | **1 session** | **1 session** |
| **Starter** | ~$37 | **3 sessions** | **4 sessions** |
| **Pro** | ~$100 | **9 sessions** | **11 sessions** |
| **Team** | ~$252 | **23 sessions** | **29 sessions** |

---

## Total Cost of Ownership

### 50 sessions/month over a 2M-token knowledge base

| Approach | LLM cost | Subscription | **Total/mo** | Core recall |
|----------|---------|-------------|-------------|-------------|
| C2 + Sonnet | $671.50 | $0 | **$671.50** | 28% |
| C2 + GPT-5.4 | $502.00 | $0 | **$502.00** | 8% |
| **T2 + Sonnet (Pro)** | $129.50 | $100 | **$229.50** | **100%** |
| **T3 + GPT-5.4 (Pro)** | $63.00 | $100 | **$163.00** | **100%** |
| F1 + mini (Developer) | $16.50 | $11 | **$27.50** | 96% |

### 200 sessions/month (team usage)

| Approach | LLM cost | Subscription | **Total/mo** | Core recall |
|----------|---------|-------------|-------------|-------------|
| C2 + Sonnet | $2,686 | $0 | **$2,686** | 28% |
| **T2 + Sonnet (Team)** | $518 | $252 | **$770** | **100%** |

At team scale, MemoryCrux saves **$1,916/month** (71%) while improving recall from 28% to 100%.

---

## Quality-Adjusted Cost

| Approach | Cost/session | Core recall | **Cost per correct decision** |
|----------|-------------|-------------|------------------------------|
| C2 + GPT-5.4 | $10.04 | 8% (2/25) | **$5.02** |
| C2 + Sonnet | $13.43 | 28% (7/25) | **$1.92** |
| T2 + Sonnet | $2.59 | 100% (25/25) | **$0.10** |
| T3 + GPT-5.4 | $1.26 | 100% (25/25) | **$0.05** |
| F1 + mini | $0.33 | 96% (24/25) | **$0.01** |

Cost per correct architectural decision: **$0.05–0.10 with MemoryCrux** vs **$1.92–5.02 with context-stuffing**. 20–50× cheaper.

---

## Session Profile

Delta sessions execute a 5-phase architectural review (Auth, Payments, Data Pipeline, Infrastructure, Synthesis) across 3,346 documents.

| Arm | Sonnet 4.6 | GPT-5.4 | Mini |
|-----|-----------|---------|------|
| C2 (context-stuffed) | 45.4 min | 3.4 min | 0.8 min |
| T2 (MCP tools) | 17.5 min | 13.0 min | 1.3 min |
| T3 (compound tools) | 29.5 min | 13.2 min | 9.3 min |

A Pro subscriber with $100/mo LLM budget running GPT-5.4 T3 gets ~79 sessions/month (~2.5/day), each completing a full 5-phase review in ~13 minutes at 100% architectural recall.

---

## Methodology

- All LLM costs measured from production benchmark runs against production VaultCrux infrastructure
- Costs include all API call overhead (embedding, retrieval, constraint checks)
- Core recall = percentage of 25 architectural decision keys correctly identified
- Subscription costs from Crux Platform Pricing Alignment Matrix v1.1 (GBP→USD at ~1.27)
- VaultCrux per-operation variable costs (~$0.01–0.05/session) excluded from LLM cost comparisons as negligible

**Full technical details:** [AuditCrux Delta Summary](https://github.com/CueCrux/AuditCrux/tree/main/benchmarks/memorycrux/results/delta-summary.md) | [Benchmark README](https://github.com/CueCrux/AuditCrux/tree/main/benchmarks/memorycrux/README.md) | [Methodology](https://github.com/CueCrux/AuditCrux/tree/main/benchmarks/memorycrux/METHODOLOGY.md)
