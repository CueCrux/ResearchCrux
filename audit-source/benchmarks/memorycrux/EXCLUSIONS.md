# MemoryCrux Benchmark — Exclusion Register

Every excluded or partially scored cell must be recorded here with the failure type, rule applied, and disposition. Rules are defined in [METHODOLOGY.md § Failure Handling Rulebook](METHODOLOGY.md#failure-handling-rulebook).

---

## Excluded Cells

| Date | Run ID | Cell | Failure Type | Rule | Disposition | Notes |
|------|--------|------|-------------|------|-------------|-------|
| 2026-03-27 | `mc-bench-delta-T3-gpt-5.4-mini-v01-*` | Delta / T3 / gpt-5.4-mini / v01 | Tool integration failure | `brief_me` compound tool returned 0 knowledge items | Excluded (`†`) | mc-proxy routing issue: `brief_me` wraps multiple API calls but the inner `query_memory` call returned empty results due to tenant isolation bug in compound tool layer. Model capability not at fault. Scored as 0% in tables with `†` annotation. |

## Partial Cells

_None recorded._

---

## Template

When adding a new entry, use this format:

```
| YYYY-MM-DD | `run-id` | Project / Arm / Model / Variant | Failure type from rulebook | Rule name | Excluded/Partial/Scored | Root cause and notes |
```
