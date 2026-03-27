# ResearchCrux

[![CI](https://github.com/CueCrux/ResearchCrux/actions/workflows/ci.yml/badge.svg)](https://github.com/CueCrux/ResearchCrux/actions/workflows/ci.yml)
[![Spec Quality](https://github.com/CueCrux/ResearchCrux/actions/workflows/spec-quality.yml/badge.svg)](https://github.com/CueCrux/ResearchCrux/actions/workflows/spec-quality.yml)
[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)

> Public evidence layer: protocol specs, proof gallery, regulatory mappings, API contracts.

Part of [CueCrux](https://github.com/CueCrux). Where outsiders can verify claims without accessing the machinery.

ResearchCrux is the **public evidence and protocol layer** for the CueCrux platform. It contains protocol specifications, living benchmark evidence, proof galleries, and published API/MCP contracts, all generated from or grounded in the platform itself.

**VaultCrux** is infrastructure. **CueCrux** is the Reasoning OS. **ResearchCrux** is where outsiders can verify claims without accessing the machinery.

---

## Version Matrix

| Dimension | Current Value |
|-----------|---------------|
| CROWN Protocol | v0.1 |
| SCITT Application Profile | v0.2 (Pre-submission Review) |
| Receipt Schema | 1.1 (llmModel + llmRequestId hash-bound) |
| Benchmark Phase | 7.4 (12/12 x 5, 2026-03-24) |
| Audit Source | [AuditCrux](https://github.com/CueCrux/AuditCrux) -- runs `037b303a` through `fabf5dc8` |
| Config Manifest | 6.7 + schema 1.1 |

> **Source of truth:** Benchmark status is mirrored from [AuditCrux](https://github.com/CueCrux/AuditCrux), which is the operational source of truth for all quality metrics. ResearchCrux publishes the evidence; AuditCrux produces it.

---

## Quick Navigation

| Section | Description | Start Here |
|---------|-------------|------------|
| [Protocol Specs](protocol/) | CROWN receipt protocol specification, hash chain construction, IETF SCITT alignment | [CROWN v0.1](protocol/crown-receipt-protocol-v0.1.md) |
| [SCITT Compatibility](protocol/scitt-compat/) | CDDL schema, COSE encoding, registration policy, privacy considerations for SCITT integration | [Integration Guide](protocol/scitt-compat/scitt-integration.md) |
| [Living Evidence](evidence/) | Benchmark ledger with historical runs, DQP findings, embedding comparison | [Ledger Index](evidence/ledger/README.md) |
| [MemoryCrux Benchmark Standard](evidence/memorycrux-benchmark-standard-v1.md) | Normative spec: arms, scoring, controls, anti-gaming, reproducibility, governance | [Standard v1.0](evidence/memorycrux-benchmark-standard-v1.md) |
| [MemoryCrux Cost Analysis](evidence/memorycrux-cost-analysis.md) | Tool-mediated memory vs context-stuffing: subscription breakeven, TCO, quality-adjusted cost | [Cost Analysis](evidence/memorycrux-cost-analysis.md) |
| [MemoryCrux Governance](evidence/memorycrux-governance.md) | Benchmark council, decision authority, external rerun program, amendment process | [Charter](evidence/memorycrux-governance.md) |
| [MemoryCrux Proof Packs](evidence/memorycrux-proof-packs/) | Per-claim evidence bundles: safety, recall, cost — with run receipts and statistics | [Proof Packs](evidence/memorycrux-proof-packs/README.md) |
| [Proof Gallery](proof-gallery/) | CROWN receipt examples, redacted proof packs, verification walkthrough | [Gallery Index](proof-gallery/README.md) |
| [Regulatory Mapping](evidence/regulatory-mapping.md) | EU AI Act (Art. 13, 14) and DORA (Art. 8–11) mapped to CROWN capabilities | [Mapping](evidence/regulatory-mapping.md) |
| [API & MCP Contracts](contracts/) | Published API surface, MCP tool catalog, JSON schemas | [Contracts Index](contracts/README.md) |
| [Whitepapers](whitepapers/) | Retrieval quality benchmark methodology and results | [Benchmark v1](whitepapers/retrieval-quality-benchmark-v1.md) |
| [Manifesto](manifesto/) | Product philosophy: "Receipts Over Vibes" | [Manifesto v2.3](manifesto/Crux-Manifesto-v2.3.md) |

---

## Audiences

- **Compliance engineers** evaluating EU AI Act (Article 13, 14) and DORA (Articles 8-11) obligations: [regulatory-mapping.md](evidence/regulatory-mapping.md)
- **Standards participants** evaluating CROWN as a SCITT application profile: [SCITT integration guide](protocol/scitt-compat/scitt-integration.md)
- **Technical evaluators** who need measured performance and architecture evidence: [benchmark ledger](evidence/ledger/README.md)
- **Integrators** building on the CueCrux API or MCP surface: [contracts](contracts/README.md)

---

## Evidence Generation

This repository contains no runnable infrastructure. Evidence is generated from canonical audit runs using the generation scripts in this repo:

```bash
npm install
npm run generate          # regenerate all evidence from source
npm run ledger:generate   # benchmark ledger only
npm run proof:generate    # proof gallery only
npm run contracts:generate # API/MCP contract docs only
```

The benchmark suite itself is published separately at [CueCrux/AuditCrux](https://github.com/CueCrux/AuditCrux) (MIT).

---

## Canonical Results

### Current Baseline: v4 Phase 7.4 (2026-03-24)

| Suite | Run ID | Embedding | Categories | Result |
|-------|--------|-----------|------------|--------|
| v4 - Production (schema 1.1) | `037b303a` | EmbedderCrux/nomic | 12 categories | **12/12** |
| v4 - Production (schema 1.1) | `80434381` | EmbedderCrux/nomic | 12 categories | **12/12** |
| v4 - Production (schema 1.1) | `69341abe` | EmbedderCrux/nomic | 12 categories | **12/12** |
| v4 - Production (schema 1.1) | `e0bfbd9b` | EmbedderCrux/nomic | 12 categories | **12/12** |
| v4 - Production (schema 1.1) | `fabf5dc8` | EmbedderCrux/nomic | 12 categories | **12/12** |

**Corpus:** 1074 unique docs, 462 queries, 12 categories. **LLM:** gpt-4o-mini (OpenAI). **Schema:** Receipt schema 1.1 (llmModel + llmRequestId hash-bound).

Key metrics across 5 canonical runs:

| Category | Metric | Range | Target |
|---|---|---|---|
| Cat 2 (Format-Aware Citation) | avg_citation_recall | 0.633-0.693 | >=0.50 |
| Cat 8 (Proposition Precision) | precision_at_1 | 0.963 (5x) | >=0.80 |
| Cat 11 (Chunking Stress) | broad_recall | 0.927 (5x) | >=0.70 |
| Cat 12 (Hard-Negative Overlap) | parent_child_recall | 1.000 (5x) | >=0.80 |

Phase 7.4 adds LLM metadata binding (schema 1.1) to CROWN receipts. Zero retrieval code changed. Cat 7, 8, 11, 12 are perfectly deterministic across all 5 runs. Cat 5 receipt chain 10/10 intact (schema 1.1 validated).

### Legacy Suites (v1-v3)

| Suite | Run ID | Embedding | Categories | Result |
|-------|--------|-----------|------------|--------|
| v1 - Baseline | `110ada93` | OpenAI | 4 × 3 modes | **12/12** |
| v2 - Enterprise | `c85daff7` | OpenAI | 4 × 3 modes | **12/12** |
| v3 - Capability | `e782fbd0` | OpenAI | 6 × 3 modes | **16/16** |
| v1 - Baseline | `a86b1733` | EmbedderCrux/nomic | 4 × 3 modes | **12/12** |
| v2 - Enterprise | `5b125495` | EmbedderCrux/nomic | 4 × 3 modes | **12/12** |
| v3 - Capability | `8dd5efff` | EmbedderCrux/nomic | 6 × 3 modes | **16/16** |

See the [benchmark ledger](evidence/ledger/README.md) for per-run details, metric deltas, and downloadable evidence.

---

## Citation

> CueCrux. *Retrieval Quality Benchmarking for Enterprise Knowledge Systems.* ResearchCrux, v1.0. March 2026. https://github.com/CueCrux/ResearchCrux
>
> CueCrux. *The CROWN Receipt Protocol, v0.1.* ResearchCrux. March 2026. https://github.com/CueCrux/ResearchCrux

---

## License

CC BY 4.0. See [LICENSE](LICENSE).

## Key Links

- Platform overview: [CueCrux](https://github.com/CueCrux)
- Crux Manifesto v2.3: [manifesto/Crux-Manifesto-v2.3.md](manifesto/Crux-Manifesto-v2.3.md)
- Related repos: [Engine](https://github.com/CueCrux/Engine) (retrieval implementation), [AuditCrux](https://github.com/CueCrux/AuditCrux) (benchmark suite), [CoreCrux](https://github.com/CueCrux/CoreCrux) (provenance spine)
