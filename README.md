# ResearchCrux

This repository contains the published research, protocol specifications, and benchmark evidence for the CueCrux platform. It includes whitepapers on retrieval quality measurement and the CROWN receipt protocol, the Crux Manifesto (product philosophy), and regulatory compliance mappings with benchmark citations.

This repository is for:

- **Compliance engineers** evaluating whether CueCrux satisfies EU AI Act (Article 13, Article 14) and DORA (Articles 8–11) obligations — start with `evidence/regulatory-mapping.md`
- **Standards participants** assessing the CROWN receipt protocol for IETF SCITT alignment — start with `whitepapers/crown-receipt-protocol-v0.1.md`
- **Technical evaluators** who need to understand the architecture and its measured performance — start with `whitepapers/retrieval-quality-benchmark-v1.md`

There is no runnable code in this repository. The benchmark suite itself is published separately at [CueCrux/AuditCrux](https://github.com/CueCrux/AuditCrux).

## Citation

> CueCrux. *Retrieval Quality Benchmarking for Enterprise Knowledge Systems.* ResearchCrux, v1.0. March 2026. https://github.com/CueCrux/ResearchCrux

> CueCrux. *The CROWN Receipt Protocol, v0.1.* ResearchCrux. March 2026. https://github.com/CueCrux/ResearchCrux

## Contents

- [whitepapers/retrieval-quality-benchmark-v1.md](whitepapers/retrieval-quality-benchmark-v1.md) — Retrieval quality measurement methodology, benchmark results across three corpus configurations and three engine generations, regulatory mapping
- [whitepapers/crown-receipt-protocol-v0.1.md](whitepapers/crown-receipt-protocol-v0.1.md) — CROWN receipt protocol specification: schema, hash chain construction, signing, verification, IETF SCITT alignment analysis
- [manifesto/crux-manifesto-v2.2.md](manifesto/crux-manifesto-v2.2.md) — Product philosophy ("Receipts Over Vibes")
- [evidence/benchmark-summary.md](evidence/benchmark-summary.md) — One-page benchmark reference card with run IDs and key metrics
- [evidence/regulatory-mapping.md](evidence/regulatory-mapping.md) — Regulatory requirement mapping (EU AI Act Article 13, DORA Articles 8-11) to CROWN capabilities with benchmark evidence

## License

CC BY 4.0. See [LICENSE](LICENSE).
