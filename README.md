# ResearchCrux

ResearchCrux is the **public evidence and protocol layer** for the CueCrux platform. It contains protocol specifications, living benchmark evidence, proof galleries, and published API/MCP contracts — all generated from or grounded in the platform itself.

**VaultCrux** is infrastructure. **CueCrux** is the Reasoning OS. **ResearchCrux** is where outsiders can verify claims without accessing the machinery.

---

## Quick Navigation

| Section | Description | Start Here |
|---------|-------------|------------|
| [Protocol Specs](protocol/) | CROWN receipt protocol specification, hash chain construction, IETF SCITT alignment | [CROWN v0.1](protocol/crown-receipt-protocol-v0.1.md) |
| [Living Evidence](evidence/) | Benchmark ledger with historical runs, DQP findings, embedding comparison | [Ledger Index](evidence/ledger/README.md) |
| [Proof Gallery](proof-gallery/) | CROWN receipt examples, redacted proof packs, verification walkthrough | [Gallery Index](proof-gallery/README.md) |
| [Regulatory Mapping](evidence/regulatory-mapping.md) | EU AI Act (Art. 13, 14) and DORA (Art. 8–11) mapped to CROWN capabilities | [Mapping](evidence/regulatory-mapping.md) |
| [API & MCP Contracts](contracts/) | Published API surface, MCP tool catalog, JSON schemas | [Contracts Index](contracts/README.md) |
| [Whitepapers](whitepapers/) | Retrieval quality benchmark methodology and results | [Benchmark v1](whitepapers/retrieval-quality-benchmark-v1.md) |
| [Manifesto](manifesto/) | Product philosophy — "Receipts Over Vibes" | [Manifesto v2.2](manifesto/crux-manifesto-v2.2.md) |

---

## Audiences

- **Compliance engineers** evaluating EU AI Act (Article 13, 14) and DORA (Articles 8–11) obligations — start with [regulatory-mapping.md](evidence/regulatory-mapping.md)
- **Standards participants** assessing the CROWN receipt protocol for IETF SCITT alignment — start with [CROWN v0.1](protocol/crown-receipt-protocol-v0.1.md)
- **Technical evaluators** who need measured performance and architecture evidence — start with the [benchmark ledger](evidence/ledger/README.md)
- **Integrators** building on the CueCrux API or MCP surface — start with [contracts](contracts/README.md)

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

| Suite | Run ID | Embedding | Categories | Result |
|-------|--------|-----------|------------|--------|
| v1 — Baseline | `110ada93` | OpenAI | 4 × 3 modes | **12/12** |
| v1 — Baseline | `a86b1733` | EmbedderCrux/nomic | 4 × 3 modes | **12/12** |
| v2 — Enterprise | `c85daff7` | OpenAI | 4 × 3 modes | **12/12** |
| v2 — Enterprise | `5b125495` | EmbedderCrux/nomic | 4 × 3 modes | **12/12** |
| v3 — Capability | `e782fbd0` | OpenAI | 6 × 3 modes | **16/16** |
| v3 — Capability | `8dd5efff` | EmbedderCrux/nomic | 6 × 3 modes | **16/16** |
| **Total** | | | **14 categories** | **80/80** |

See the [benchmark ledger](evidence/ledger/README.md) for per-run details, metric deltas, and downloadable evidence.

---

## Citation

> CueCrux. *Retrieval Quality Benchmarking for Enterprise Knowledge Systems.* ResearchCrux, v1.0. March 2026. https://github.com/CueCrux/ResearchCrux

> CueCrux. *The CROWN Receipt Protocol, v0.1.* ResearchCrux. March 2026. https://github.com/CueCrux/ResearchCrux

---

## License

CC BY 4.0. See [LICENSE](LICENSE).
