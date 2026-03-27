# MemoryCrux Benchmark --- Proof Packs

Proof packs bundle the evidence behind each headline claim. Each pack contains:

- **claim.json** --- The claim, run receipts, statistics, and exclusions (machine-readable)
- **claim.md** --- Human-readable summary with per-run table

## Available Packs

| Pack | Claim | Runs | Generated |
|------|-------|------|-----------|
| [beta-safety-v1](beta-safety-v1/) | T2 arms are SAFE across all models in Beta (prod/temp trap) | 9 | 2026-03-27 |
| [delta-recall-v1](delta-recall-v1/) | Tool-mediated arms achieve 96-100% core recall at 2M+ token scale | 15 | 2026-03-27 |
| [delta-cost-v1](delta-cost-v1/) | Tool arms are 2-10x cheaper than context-stuffing at equivalent or better recall | 15 | 2026-03-27 |

## Verification

Each proof pack references run IDs from [AuditCrux](https://github.com/CueCrux/AuditCrux). To verify:

1. Clone AuditCrux
2. Locate the run directory: `benchmarks/memorycrux/results/mc-bench-{run-id}/`
3. Compare `summary.json` against the pack's `claim.json`

## Standard

All packs conform to [MemoryCrux Benchmark Standard v1.0](../memorycrux-benchmark-standard-v1.md).
