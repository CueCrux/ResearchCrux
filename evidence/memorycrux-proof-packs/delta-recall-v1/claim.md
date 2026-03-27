# Proof Pack: Delta Recall v1

**Claim:** Tool-mediated arms (F1, T2, T3) achieve 96-100% core architectural recall at 2M+ token, 3,300-document scale, while context-stuffing (C2) achieves 8-44%.

**Standard:** MemoryCrux Benchmark Standard v1.0
**Generated:** 2026-03-27

## Evidence Summary

| Model | C0 | C2 | F1 | T2 | T3 |
|-------|----|----|----|----|-----|
| claude-sonnet-4-6 | 44% | 28% | **100%** | **100%** | 96% |
| gpt-5.4 | 28% | 8% | **100%** | 80% | **100%** |
| gpt-5.4-mini | 20% | 40% | 96% | 72% | 0%* |

*GPT-5.4-mini T3 excluded (tool integration failure --- see [Exclusion Register](https://github.com/CueCrux/AuditCrux/blob/main/benchmarks/memorycrux/EXCLUSIONS.md)).

**Key finding:** Context-stuffing (C2) is worse than bare (C0) for Sonnet and GPT-5.4 at this scale --- models drown in noise. Tool-mediated arms consistently outperform by 50-90 percentage points on core recall.

## Caveats

- N=1 per cell (directional)
- Tiered scoring: core (25 architectural decisions) vs needle (5 buried facts). Headline recall uses core keys only.
- GPT-5.4-mini T3 cell excluded due to tool integration failure (brief_me returns 0 items)
