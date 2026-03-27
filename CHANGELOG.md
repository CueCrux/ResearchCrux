# Changelog

All notable changes to the ResearchCrux public evidence layer.

This file tracks changes to protocol specifications, benchmark evidence, and published artifacts. For per-run audit details, see the [benchmark ledger](evidence/ledger/README.md).

---

## 2026-03-27 -- MemoryCrux Benchmark Standard v1.0

- **MemoryCrux Benchmark Standard v1.0 published:** Normative spec for arms, scoring, controls, anti-gaming, reproducibility, and deprecation policy. ([standard](evidence/memorycrux-benchmark-standard-v1.md))
- **Governance charter published:** Benchmark council (2 internal + 1 external), decision authority, external rerun program, amendment process. ([charter](evidence/memorycrux-governance.md))
- **METRICS.md promoted:** Status changed from DRAFT to Published v1.0 (no formula changes).
- **Scoring bug fixes (AuditCrux):** UNSAFE logic escape, constraint hit rate inflation, S_gate null for non-Beta projects, brittle isKillVariant detection. All with unit tests.
- **Failure handling rulebook:** Codified in METHODOLOGY.md with 8 failure types, retry rules, and cell dispositions.
- **Exclusion register:** EXCLUSIONS.md created with template and seeded with Delta mini-T3 exclusion.
- **Reproducibility tooling:** BLAKE3 fixture hashing, run manifest metadata, integrity verification.
- **Semantic scorer:** Optional LLM-based scoring layer (opt-in via --semantic flag) with scorer agreement reporting.

## 2026-03-25 -- Phase 7.4 Alignment

- **Receipt schema 1.1:** `llmModel` and `llmRequestId` added to canonical receipt payload, hash-bound via BLAKE3. `undefined` = schema 1.0 (omitted from hash), `null` = schema 1.1 LLM not called (included in hash).
- **Benchmark baseline updated:** Phase 7.4, 12/12 x 5 on production server (runs `037b303a` through `fabf5dc8`). Zero retrieval code changes from Phase 7.3.
- **Protocol spec updated:** [crown-receipt-protocol-v0.1.md](protocol/crown-receipt-protocol-v0.1.md) Sections 2.1, 3.2, 9.1 updated for schema 1.1 fields.
- **Test vector added:** `vector-llm-metadata.json` (schema 1.1 test vector).
- **SCITT integration doc:** Added reviewer checklist and interop status summary. Benchmark references aligned to Phase 7.4.
- **Version matrix added** to README for protocol/benchmark/schema cross-referencing.
- **Source-of-truth note added:** ResearchCrux publishes evidence; AuditCrux produces it.
- **Category count:** v4 suite now 12 categories (Cat 12v2 retired from canonical suite). Legacy v1-v3 suites unchanged (40/40).

## 2026-03-22 -- Phase 7.3 (Initial Publication)

- **CROWN Receipt Protocol v0.1** published with hash chain construction, signing, verification, and assurance modes.
- **SCITT compatibility layer** v0.2 (Pre-submission Review): CDDL schema, COSE_Sign1 encoding, registration policy, privacy considerations.
- **Benchmark evidence:** Phase 7.3, 13/13 x 3 (runs `16554101`, `ca505454`, `5e5ccff5`).
- **Proof gallery:** Full and redacted receipt examples with JSON schemas.
- **Regulatory mapping:** EU AI Act (Art. 13, 14) and DORA (Art. 8-11).
- **Verification library:** `crown-verify` CLI with JSON, chain, and COSE_Sign1 modes.
- **COSE interop pack:** End-to-end SCITT path walkthrough with deterministic artifacts.
- **API/MCP contracts:** Published REST and MCP tool surfaces.
