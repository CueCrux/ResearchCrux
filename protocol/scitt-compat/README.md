# SCITT Compatibility Layer

CROWN as a [SCITT](https://datatracker.ietf.org/wg/scitt/about/) application profile. These artifacts package the existing CROWN Receipt Protocol for integration with IETF SCITT (Supply Chain Integrity, Transparency, and Trust) infrastructure.

## Documents

| Document | Description | Start Here If... |
|---|---|---|
| [scitt-integration.md](scitt-integration.md) | How CROWN maps to SCITT: terminology, encoding, registration, verification | You want to understand the CROWN-to-SCITT bridge |
| [crown-receipt.cddl](crown-receipt.cddl) | CDDL schema ([RFC 8610](https://www.rfc-editor.org/rfc/rfc8610.html)) for CBOR-encoded CROWN receipts | You want to implement CROWN in CBOR/COSE |
| [registration-policy.md](registration-policy.md) | What a SCITT Transparency Service checks before accepting a CROWN receipt | You operate or evaluate a Transparency Service |
| [privacy-considerations.md](privacy-considerations.md) | Privacy properties, risks, and mitigations for CROWN receipts | You are assessing CROWN for a privacy-sensitive deployment |
| [cose-example/](cose-example/cose-walkthrough.md) | Worked COSE_Sign1 wrapped receipt with hex walkthrough and generation script | You want to see the CBOR/COSE encoding in practice |

## Context

The SCITT architecture ([draft-ietf-scitt-architecture](https://datatracker.ietf.org/doc/draft-ietf-scitt-architecture/), currently in AUTH48) provides a standard framework for signed statements about supply chain artifacts. CROWN extends this framework to a new domain: AI retrieval-evidence provenance.

CROWN is complementary to other emerging SCITT application profiles for AI auditability:

- **CAP-SRP** ([draft-kamimura-scitt-refusal-events-02](https://datatracker.ietf.org/doc/draft-kamimura-scitt-refusal-events-02/)) — refusal provenance
- **VCP** ([draft-kamimura-scitt-vcp-02](https://datatracker.ietf.org/doc/draft-kamimura-scitt-vcp-02/)) — algorithmic trading audit trails
- **CROWN** — retrieval-evidence provenance for RAG systems

## What CROWN already has (outside this directory)

The SCITT compatibility layer builds on the existing CROWN implementation:

- [Protocol spec](../crown-receipt-protocol-v0.1.md) — full specification with hash chain construction, signing, verification, and assurance modes
- [Test vectors](../test-vectors/) — deterministic test key + 4 receipt vectors for independent implementation
- [Security considerations](../security-considerations.md) — 9-section threat analysis
- [Architecture Decision Records](../decisions/) — rationale for BLAKE3, ed25519, JSON canonical serialisation, linked-list chain
- [Verification library](../../verify/) — standalone `crown-verify` CLI and programmatic API (zero CueCrux dependencies)
- [Proof gallery](../../proof-gallery/) — full and redacted receipt examples with JSON schemas
- [Regulatory mapping](../../evidence/regulatory-mapping.md) — EU AI Act Article 13/14 and DORA Article 8–11 mapped to CROWN capabilities with benchmark citations

## Planned additions

- Content type registration guidance
- Interoperability test results against SCITT Transparency Service implementations
