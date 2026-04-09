# CoreCrux Decision Plane EAGAIN Fix — Audit Results

**Date:** 2026-03-24
**Scope:** flock self-lock reentry bug in corecrux-decision scan path

## Root Cause

`scan_decision_events()` opened fresh `ShardStorage` handles per HTTP request. On Linux, `flock(LOCK_EX|LOCK_NB)` on an already-locked file from a different file description (even same process) returns EAGAIN. The daemon held exclusive flocks on all shards, so every decision-plane read failed with "resource temporarily unavailable".

## Fix Applied

| Component | Change |
|-----------|--------|
| `corecrux-decision/src/lib.rs` | Added `scan_decision_events_from_storages()` daemon-safe entry point; made `replay_decision_frames()` public |
| `corecruxd/src/dataplane_store.rs` | Added `scan_decision_events_pooled()` using existing `StdRwLock<ShardStorage>` guards |
| `corecruxd/src/pool.rs` | Pool-level `scan_decision_events()` delegation |
| `corecruxd/src/http.rs` | All 3 decision handlers switched from `scan_decision_events()` to `pool.scan_decision_events()` |
| `corecruxd/src/metrics.rs` | 3 new CounterVecs: `decision_read_path_total{source}`, `shard_open_attempts_total{caller}`, `lock_contention_total{caller}` |
| `corecrux-storage/src/lib.rs` | Lock-reentry regression test (`second_open_on_locked_shard_returns_would_block`) |
| `corecruxctl/src/chaos.rs` | 3 chaos faults: `lock_reentry`, `self_lock_contention`, `reopen_locked_shard` |

## Production Verification (GPU-1)

- Binary: `cargo build --release -p corecruxd --features cuda`
- Projections bootstrapped: `CORECRUXD_PROJECTIONS_ENABLED=1` + `corecruxctl projections rebuild`
- Session index: HTTP 200, 5 seeded decisions (~40s scan latency, pre-projection)
- Metrics: `corecrux_decision_read_path_total{source="pooled"} 2`, zero `reopened`
- readyz: all 4 projections healthy across 4 shards

## MemoryCrux Audit Results

Run ID: `ea4e02ff` (2026-03-24T01:02:22Z)

| Category | Tools | Tests | Passed | Failed | Skipped | Verdict |
|----------|-------|-------|--------|--------|---------|---------|
| A: Core Memory | 7 | 14 | 14 | 0 | 0 | PASS |
| B: Decision Plane | 0 | 0 | 0 | 0 | 0 | SKIP |
| C: Platform Wiring | 3 | 8 | 8 | 0 | 0 | PASS |
| D: Constraints | 6 | 24 | 24 | 0 | 0 | PASS |

**46/46 tests passed, 1 category skipped.**

Cat B (Decision Plane) gracefully skipped: VaultCrux proxies decision-plane calls to CoreCrux, but CoreCrux runs on GPU-1 (not localhost). The skip confirms the graceful-degradation design works correctly — `upstream_down` error triggers skip, not fail.

## Latency Percentiles

| Category | P50 | P95 |
|----------|-----|-----|
| A: Core Memory | 4ms | 27ms |
| C: Platform Wiring | 4ms | 6ms |
| D: Constraints | 5ms | 10ms |

## Known Limitations

- Decision plane scan takes ~40s for 1.56M frames (full event replay, no indexed projection)
- Cat B requires VaultCrux→CoreCrux network path (Tailscale or vSwitch)
- `corecruxctl projections rebuild` requires daemon stopped (flock contention)

## Production Audit Results (vaultcrux.com → CoreCrux GPU-1)

Run ID: `5fa1b2f0` (2026-03-24T08:40:52Z), target: `https://vaultcrux.com`

| Category | Tools | Tests | Passed | Failed | Skipped | Verdict |
|----------|-------|-------|--------|--------|---------|---------|
| A: Core Memory | 7 | 14 | 14 | 0 | 0 | PASS |
| B: Decision Plane | 6 | 13 | 11 | 0 | 2 | PASS |
| C: Platform Wiring | 3 | 8 | 8 | 0 | 0 | PASS |
| D: Constraints | 6 | 24 | 24 | 0 | 0 | PASS |

**57/59 tests passed, 4/4 categories PASS.**

Cat B detail:
- All 5 read endpoints PASS (get_decision_context, get_causal_chain, reconstruct_knowledge_state, get_correction_chain, get_decisions_on_stale_context)
- All 4 missing-param tests PASS (upstream correctly rejects bad input)
- `record_decision_context` happy_path + mutation_readback SKIP: CoreCrux has no HTTP record route (uses gRPC AppendBatch)
- Read latency: ~28s per call (full 1.56M frame scan, pre-projection)

Production wiring:
- VaultCrux-App: `CORECRUX_BASE_URL=http://100.111.227.102:4006`, `FEATURE_MEMORY_DECISION_PLANE=true`
- CoreCrux GPU-1: port 4006 (HTTP), 4007 (gRPC), `CORECRUXD_AUTH_MODE=dev`
- `__service__` tenant + BFF service key seeded on production VaultCrux DB
- `__audit_memory__` and `default` tenants created for rate-limiter FK compatibility

## Production Audit Results — Post Local Storage Fix

Run ID: `3e6dbecb` (2026-03-24T09:06:53Z), target: `https://vaultcrux.com`

| Category | Tools | Tests | Passed | Failed | Skipped | Verdict |
|----------|-------|-------|--------|--------|---------|---------|
| A: Core Memory | 7 | 14 | 14 | 0 | 0 | PASS |
| B: Decision Plane | 6 | 13 | 13 | 0 | 0 | PASS |
| C: Platform Wiring | 3 | 8 | 8 | 0 | 0 | PASS |
| D: Constraints | 6 | 24 | 24 | 0 | 0 | PASS |

**59/59 tests passed, 4/4 categories PASS, 0 skipped.**

Fix: `record_decision_context` now writes to VaultCrux local Postgres (`vaultcrux.memory_decision_contexts`) instead of proxying to CoreCrux gRPC. Session reads check local DB first, fall back to CoreCrux for legacy event-sourced data.

- `record_decision_context` happy_path: PASS (207ms)
- `record_decision_context` missing_fields: PASS (178ms)
- `record_decision_context` mutation_readback: PASS (205ms)

## Evidence Files

- `AuditCrux/scripts/audit-results/audit-memory-2026-03-24T01-02-22.json` (localhost)
- `AuditCrux/scripts/audit-results/audit-memory-2026-03-24T01-02-22.md` (localhost)
- `AuditCrux/scripts/audit-results/audit-memory-2026-03-24T08-40-52.json` (production, pre-fix: 57/59)
- `AuditCrux/scripts/audit-results/audit-memory-2026-03-24T08-40-52.md` (production, pre-fix: 57/59)
- `AuditCrux/scripts/audit-results/audit-memory-2026-03-24T09-09-55.json` (production, post-fix: 59/59)
- `AuditCrux/scripts/audit-results/audit-memory-2026-03-24T09-09-55.md` (production, post-fix: 59/59)
