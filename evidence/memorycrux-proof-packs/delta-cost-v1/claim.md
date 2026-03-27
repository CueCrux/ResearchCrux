# Proof Pack: Delta Cost v1

**Claim:** Tool-mediated arms are 2-10x cheaper than context-stuffing at equivalent or better recall for the Delta project (2M+ tokens).

**Standard:** MemoryCrux Benchmark Standard v1.0
**Generated:** 2026-03-27

## Evidence Summary

| Model | Arm | Core Recall | Cost | Cost vs C2 |
|-------|-----|-------------|------|------------|
| claude-sonnet-4-6 | C2 | 28% | $13.27 | baseline |
| claude-sonnet-4-6 | T2 | 100% | $2.59 | **5.1x cheaper** |
| claude-sonnet-4-6 | F1 | 100% | $6.28 | 2.1x cheaper |
| gpt-5.4 | C2 | 8% | $10.95 | baseline |
| gpt-5.4 | T2 | 80% | $1.67 | **6.6x cheaper** |
| gpt-5.4 | F1 | 100% | $4.52 | 2.4x cheaper |
| gpt-5.4-mini | C2 | 40% | $1.68 | baseline |
| gpt-5.4-mini | F1 | 96% | $0.33 | **5.1x cheaper** |

**Key finding:** Context-stuffing fills the context window with 2M+ tokens on every call, burning tokens on noise. Tool arms retrieve only relevant documents, dramatically reducing token consumption while achieving higher recall.

## Caveats

- Costs based on published token pricing at time of benchmark (March 2026)
- C2 cost reflects full corpus injection; actual deployment would batch/cache
- Tool arm costs include VaultCrux API latency but not infrastructure costs
- For full cost analysis including subscription breakeven: see [Cost Analysis](../memorycrux-cost-analysis.md)
