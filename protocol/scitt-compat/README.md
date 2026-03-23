# SCITT Compatibility Layer

CROWN as a [SCITT](https://datatracker.ietf.org/wg/scitt/about/) application profile. These artifacts package the existing CROWN Receipt Protocol for integration with IETF SCITT (Supply Chain Integrity, Transparency, and Trust) infrastructure.

## Documents

| Document | Description | Start Here If... |
|---|---|---|
| [crown-scitt-profile.md](crown-scitt-profile.md) | Standalone SCITT profile spec: protected header, payload, media types, verification | You implement a Transparency Service or want the concise spec |
| [scitt-integration.md](scitt-integration.md) | How CROWN maps to SCITT: terminology, encoding, registration, verification | You want to understand the CROWN-to-SCITT bridge |
| [crown-receipt.cddl](crown-receipt.cddl) | CDDL schema ([RFC 8610](https://www.rfc-editor.org/rfc/rfc8610.html)) for CBOR-encoded CROWN receipts | You want to implement CROWN in CBOR/COSE |
| [registration-policy.md](registration-policy.md) | What a SCITT Transparency Service checks before accepting a CROWN Signed Statement | You operate or evaluate a Transparency Service |
| [privacy-considerations.md](privacy-considerations.md) | Privacy properties, risks, and mitigations for CROWN receipts | You are assessing CROWN for a privacy-sensitive deployment |
| [cose-example/](cose-example/cose-walkthrough.md) | Worked COSE_Sign1 Signed Statement with hex walkthrough and generation script | You want to see the CBOR/COSE encoding in practice |

## Context

The SCITT architecture ([draft-ietf-scitt-architecture](https://datatracker.ietf.org/doc/draft-ietf-scitt-architecture/), currently in AUTH48) provides a standard framework for signed statements about supply chain artifacts. CROWN extends this framework to a new domain: AI retrieval-evidence provenance.

CROWN is complementary to other emerging SCITT application profiles for AI auditability:

- **CAP-SRP** ([draft-kamimura-scitt-refusal-events-02](https://datatracker.ietf.org/doc/draft-kamimura-scitt-refusal-events/)) — refusal provenance
- **VCP** ([draft-kamimura-scitt-vcp-02](https://datatracker.ietf.org/doc/draft-kamimura-scitt-vcp/)) — algorithmic trading audit trails
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

## Implementation Status

A plain-language summary of what is implemented, what is draft, and what is pending. For the detailed version, see [Section 7 of the integration guide](scitt-integration.md#7-what-crown-does-not-claim-yet).

### Implemented and verified

| Capability | Status | Evidence |
|---|---|---|
| Receipt hash chain (parentSnapId) | Production | Depth 50, flat latency (~3ms). [AuditCrux Cat 5](https://github.com/CueCrux/AuditCrux) |
| Ed25519 signing (Vault Transit) | Production | Key rotation, public key embedding, signing queue with 90-day expiry |
| Standalone verification CLI | Published | [`crown-verify`](../../verify/), test vectors in [proof-gallery](../../proof-gallery/) |
| JSON Schema | Published | [crown-receipt.schema.json](../../proof-gallery/schema/crown-receipt.schema.json) |
| CDDL Schema (CBOR) | Published | [crown-receipt.cddl](crown-receipt.cddl) |
| Retrieval quality benchmark | Production | 13/13 × 3 (1074 docs, 462 queries). [Benchmark ledger](../../evidence/ledger/README.md) |
| Regulatory mapping | Published | EU AI Act Art. 13/14, DORA Art. 8-11. [Mapping](../../evidence/regulatory-mapping.md) |
| COSE_Sign1 Signed Statements | Production | Engine wraps every receipt in COSE_Sign1 (RFC 9052). CBOR payload, protected header with kid + CWT Claims. API supports `Accept: application/cose` |
| COSE_Sign1 walkthrough | Published | [Worked example](cose-example/cose-walkthrough.md) with hex walkthrough |
| CBOR encoding path | Production | Engine produces CBOR-encoded receipt payload (kebab-case keys per CDDL) inside COSE_Sign1. M8 deployment (2026-03-23), 13/13 × 3 validated |
| COSE_Sign1 envelope verification in audit pipeline | Production | AuditCrux Cat 3 verifies COSE_Sign1 structure, ed25519 signature, protected header (alg, kid, CWT Claims), and CBOR payload integrity |
| Media types | Production | `application/cose` (envelope), `application/vnd.crown.receipt+cbor` (payload content-type in protected header). Content negotiation via `Accept: application/cose` |

### Draft (specified, not yet exercised end-to-end)

| Capability | Status | What remains |
|---|---|---|
| SCRAPI registration flow | Specified in Section 3 | No live registration against an operational Transparency Service |

### Pending (not yet started)

| Capability | Notes |
|---|---|
| Transparency Service interop test | Requires an operational SCITT TS accepting third-party profiles |
| IANA content-type registration | Deferred until profile stability warrants it |
| Multi-TS registration guidance | Deployment concern, deferred |
