# CROWN as a SCITT Application Profile

**Version:** 0.2 (Pre-submission Review)
**Date:** March 2026
**Status:** Pre-standardisation
**Aligned to:** [draft-ietf-scitt-architecture](https://datatracker.ietf.org/doc/draft-ietf-scitt-architecture/), [draft-ietf-scitt-scrapi](https://datatracker.ietf.org/doc/draft-ietf-scitt-scrapi/)

This document describes how CROWN receipts integrate with the IETF SCITT (Supply Chain Integrity, Transparency, and Trust) architecture. CROWN is an application profile for SCITT -- it defines domain-specific claim semantics for AI retrieval-evidence provenance. It does not extend or modify the SCITT architecture.

### Reviewer Checklist

| Item | Status | Reference |
|------|--------|-----------|
| SCITT primitive mapping complete | Done | [Section 1](#1-mapping-to-scitt) |
| CDDL schema present | Done | [crown-receipt.cddl](crown-receipt.cddl) |
| COSE_Sign1 envelope path defined and exercised | Done | [Section 2](#2-encoding-as-signed-statements), [COSE walkthrough](cose-example/cose-walkthrough.md) |
| Benchmark evidence backing | Done | 12/12 x 5, Phase 7.4. [Ledger](../../evidence/ledger/README.md) |
| Registration policy specified | Done | [registration-policy.md](registration-policy.md) |
| Privacy considerations | Done | [privacy-considerations.md](privacy-considerations.md) |
| Live Transparency Service interop | **Not yet** | No operational TS accepts third-party profiles (ecosystem gap). See [Section 7](#7-what-crown-does-not-claim-yet) |
| IANA content-type registration | Deferred | Awaiting profile stability |

> **What this document does not claim:** Live end-to-end interop with a SCITT Transparency Service. The full encoding path (receipt -> CBOR -> COSE_Sign1 -> SCRAPI -> verification) is walked in the [interop pack](interop-pack/README.md), but SCRAPI registration and TS Receipt steps are illustrative. This is stated explicitly in [Section 7](#7-what-crown-does-not-claim-yet). As of March 2026, no operational TS accepts third-party application profiles.

---

## 1. Mapping to SCITT

This specification maps directly to SCITT primitives:

| CROWN Concept | SCITT Primitive | Notes |
|---|---|---|
| CROWN receipt payload wrapped in COSE_Sign1 | **Signed Statement** | CBOR payload per CDDL, signed via Vault Transit ed25519 |
| CueCrux Engine instance | **Issuer** | Identified by ed25519 signing key; CWT Claims `iss`/`sub` in protected header |
| Answer (`answerId`) | **Artifact** | The thing the Signed Statement is about |
| COSE_Sign1 envelope (RFC 9052 §4.2) | **Signed Statement envelope** | Protected header carries `alg`, `content type`, `kid`, CWT Claims |
| `receiptHash` (BLAKE3 of canonical JSON) | Application-level chain hash | Chain integrity mechanism, orthogonal to COSE signature |
| TS-produced countersignature (inclusion proof) | **Receipt** | Countersignature from Transparency Service confirming registration |
| Signed Statement + TS Receipt | **Transparent Statement** | Full auditable unit with third-party verifiability |
| `crown_snapshots` chain (`parentSnapId`) | Application-level integrity chain | Complementary to (not replacing) the Transparency Log |
| Evidence records | Supplementary claim data | Accompanies the Signed Statement; linked by `snapId` |
| Assurance mode (`light`/`verified`/`audit`) | Registration policy input | Transparency Services MAY apply mode-specific acceptance rules |

The `parentSnapId` chain and the SCITT Transparency Log serve different purposes. The chain provides application-level integrity: a verifier can traverse the chain to detect gaps or tampering in the receipt sequence. The Transparency Log provides third-party verifiability: a verifier can confirm that a receipt was registered at a specific time without trusting the Issuer. These mechanisms are complementary. A CROWN receipt registered with a SCITT Transparency Service carries both guarantees.

---

## 2. Encoding as Signed Statements

A CROWN receipt is carried as the payload of a SCITT Signed Statement:

1. The receipt payload is serialised as a CBOR map with kebab-case keys per the CDDL schema (`crown-receipt.cddl`). The CBOR payload includes identifying fields (`snap-id`, `tenant-id`, `receipt-hash`, `parent-snap-id`) alongside the receipt content.

2. The CBOR-serialised bytes become the COSE_Sign1 payload per [RFC 9052](https://www.rfc-editor.org/rfc/rfc9052.html). The `receiptHash` (BLAKE3 of canonical JSON) is computed independently and included in the CBOR payload — these are orthogonal: canonical JSON for chain integrity, CBOR for COSE signing.

3. The protected header MUST contain:
   - Algorithm identifier (label 1): EdDSA (ed25519), value `-8`
   - Content type (label 3): `application/vnd.crown.receipt+cbor`
   - Key ID (label 4): signing key identifier (e.g., `engine-provenance:v3`)
   - CWT Claims (label 15, [RFC 8392](https://www.rfc-editor.org/rfc/rfc8392.html)): `iss` (Issuer URI) and `sub` (receipt URN)

4. The Issuer is the CueCrux Engine instance's signing identity. The ed25519 key is managed via HashiCorp Vault Transit. The key identifier is resolved before signing and bound in the protected header (label 4). The Issuer URI (CWT `iss`) defaults to `https://engine.cuecrux.com` (configurable via `CROWN_SCITT_ISSUER`). The subject (CWT `sub`) is `urn:crown:receipt:<snapshotId>`.

5. The COSE_Sign1 envelope is the **Signed Statement**. On the wire, it is served with `Content-Type: application/cose`. Evidence records MAY be included as additional Signed Statements linked by `snapId`, or bundled in the receipt payload's `selection` field.

### Media Types

| Context | Media Type | Use |
|---|---|---|
| COSE_Sign1 envelope on the wire | `application/cose` | `Accept` / `Content-Type` header for Signed Statement retrieval |
| Payload content type (protected header label 3) | `application/vnd.crown.receipt+cbor` | Describes the COSE payload format |
| JSON API responses | `application/json` | Default API format; JSON receipt with `coseEnvelope` base64 field |
| Standalone JSON verification | `application/vnd.crown.receipt+json` | `crown-verify` CLI, proof gallery |

A future revision may request IANA registration of the `vnd.crown.receipt` content types. This document does not request IANA actions at this time.

---

## 3. Registration

After creating a Signed Statement (COSE_Sign1 envelope), the Issuer SHOULD register it with a SCITT Transparency Service via [SCRAPI](https://datatracker.ietf.org/doc/draft-ietf-scitt-scrapi/).

The Transparency Service returns a Receipt (SCITT countersignature / inclusion proof) confirming that the Signed Statement has been registered in the append-only log. The combination of the Signed Statement and the TS Receipt forms a **Transparent Statement**. Issuers SHOULD store Receipts for future verification requests.

### Registration timing

Registration timing affects audit trail integrity. CROWN assurance modes provide natural guidance:

| Mode | Registration Timing | Rationale |
|---|---|---|
| `audit` | Prompt (within seconds to minutes) | Regulatory audit trails require timely registration for temporal guarantees |
| `verified` | Prompt to batched (within minutes to hours) | Production queries benefit from timely registration but tolerate batching |
| `light` | Batched (within hours to daily) | Development and low-stakes queries; batched registration is acceptable |

### Chain and log interaction

The `parentSnapId` chain is maintained independently of the Transparency Log. Receipts are chained at creation time (before registration). The Transparency Log records the chain as-is. A verifier checking both the chain integrity and the SCITT Receipt gets two independent guarantees:

1. The chain was not tampered with after creation (application-level hash chain).
2. The chain was registered at a known time and cannot be retroactively modified (Transparency Log inclusion proof).

---

## 4. Verification

A verifiable CROWN evidence trail (Transparent Statement) consists of:

1. The CROWN Signed Statement (COSE_Sign1 envelope containing CBOR receipt payload)
2. The SCITT Receipt (countersignature / inclusion proof from Transparency Service)
3. The evidence records (linked by `snapId`)

Verifiers confirm:

- The SCITT Receipt is valid for the claimed Transparency Service
- The Issuer's ed25519 signature is valid (COSE_Sign1 verification)
- The `receiptHash` matches recomputation of the canonical payload (per [protocol spec Section 3](../crown-receipt-protocol-v0.1.md#3-hash-chain-construction))
- Chain linkage is correct (`parentSnapId` points to preceding receipt)
- Timestamps are consistent (each receipt's `generatedAt` >= its parent's)

The standalone `crown-verify` CLI performs steps 3–5 without requiring SCITT infrastructure. Steps 1–2 require access to the Transparency Service or its public keys.

This demonstrates that a CROWN receipt was logged and that it was derived from specific evidence. It does not prove that the answer was correct — only that it was derived from specific evidence, under specific retrieval conditions, at a specific point in time. This is proof of process, not proof of conclusion.

---

## 5. Registration Policy Considerations

A SCITT Transparency Service MAY apply a Registration Policy that validates incoming CROWN Signed Statements before acceptance into the log. See [registration-policy.md](registration-policy.md) for the full policy specification.

Transparency Services SHOULD NOT attempt to enforce:

- **Chain completeness.** Whether every answer has a receipt, or whether the chain has gaps. This is an application-level semantic constraint, verified by auditors, not by the Transparency Service. (Analogous to Kamimura's completeness invariant in [draft-kamimura-scitt-refusal-events-02](https://datatracker.ietf.org/doc/draft-kamimura-scitt-refusal-events/) Section 3.6.)
- **Fragility score validation.** Whether the fragility score is correctly computed. This requires access to the evidence set and domain-specific logic.
- **Evidence content inspection.** The Transparency Service should not inspect or validate the content of evidence records. This is a privacy boundary.

---

## 6. Relationship to Other SCITT Application Profiles

CROWN is one of several emerging SCITT application profiles for AI system auditability:

| Profile | Domain | What It Proves |
|---|---|---|
| CAP-SRP ([draft-kamimura-scitt-refusal-events-02](https://datatracker.ietf.org/doc/draft-kamimura-scitt-refusal-events/)) | AI content refusal | That a generation request was refused, and why |
| VCP ([draft-kamimura-scitt-vcp-02](https://datatracker.ietf.org/doc/draft-kamimura-scitt-vcp/)) | Algorithmic trading | That a trading decision followed a verifiable audit trail |
| CROWN | Retrieval-augmented generation | That an AI-assisted answer was derived from specific, current evidence |

Together, these profiles address distinct layers of AI decision auditability:

- **Refusal provenance** (CAP-SRP): Did the system refuse when it should have?
- **Evidence provenance** (CROWN): When the system did answer, was the answer grounded in specific, current evidence?
- **Decision provenance** (VCP): Did the automated decision follow a verifiable process?

A complete AI audit trail for regulated industries may require multiple profiles operating in concert. The SCITT architecture's content-agnostic design enables this — each profile defines its own claim semantics while sharing the same registration, verification, and transparency infrastructure.

---

## 7. What CROWN Does Not Claim Yet

This section explicitly states what is not yet implemented, not yet demonstrated, or intentionally deferred. Standards readers should treat this as the current boundary of the profile.

### Not yet demonstrated

- **End-to-end Transparency Service interop.** No CROWN receipt has been registered with a live SCITT Transparency Service and verified via a returned SCITT Receipt (inclusion proof). The full encoding path (JSON → CBOR → COSE_Sign1 → SCRAPI registration → TS Receipt → Transparent Statement) is walked end-to-end in the [SCITT Interop Pack](interop-pack/README.md), with the SCRAPI registration and TS Receipt steps clearly labelled as illustrative. As of March 2026, no operational TS accepts third-party application profiles — this is a gap in the SCITT ecosystem, not in the CROWN implementation.

- ~~**COSE_Sign1 production path.**~~ **Resolved.** The Engine now wraps every receipt in a COSE_Sign1 envelope (RFC 9052 §4.2). The canonical JSON receipt is the COSE payload, signed via Vault Transit ed25519. The API supports `Accept: application/vnd.crown.receipt+cbor` for raw CBOR envelope retrieval. The `crown-verify` CLI supports `--cose` mode for standalone COSE_Sign1 verification.

### Intentionally deferred

- **IANA content-type registration.** `application/vnd.crown.receipt+cbor` and `application/vnd.crown.receipt+json` are defined for use but not yet submitted to IANA. Registration will be requested when the profile reaches a stability level that justifies it.

- **Multi-Transparency-Service registration.** The spec does not address registering the same receipt with multiple Transparency Services. This is a deployment concern, not a protocol concern, and is deferred.

### Implemented and verified

- **Receipt hash chain.** `parentSnapId` chain integrity verified to depth 50 with flat latency (~3ms). See [AuditCrux Cat 5](https://github.com/CueCrux/AuditCrux) results.

- **Ed25519 signing via Vault Transit.** Production signing with key rotation, public key embedding, and offline verification. Signing queue with 90-day expiry for transient Vault unavailability.

- **COSE_Sign1 production signing (SCITT Signed Statements).** Every receipt is wrapped in a COSE_Sign1 envelope (RFC 9052 §4.2) with ed25519 signature via Vault Transit. CBOR-encoded receipt payload (kebab-case keys per CDDL). Protected header carries `alg`, `content type`, `kid`, and CWT Claims (`iss`/`sub`). API supports `Accept: application/cose` for raw Signed Statement retrieval.

- **Standalone verification.** The `crown-verify` CLI ([verify/](../../verify/)) performs receipt hash recomputation, chain linkage checks, and COSE_Sign1 envelope verification (`--cose` mode) without SCITT infrastructure. Published test vectors in [proof-gallery/](../../proof-gallery/).

- **Retrieval quality evidence.** 12-category benchmark suite with 1074 docs, 462 queries, 12/12 x 5 canonical passes (Phase 7.4). Methodology separates retrieval failure from LLM citation failure. See [benchmark evidence](../../evidence/ledger/README.md).

- **CDDL schema.** CBOR type definition for CROWN receipts published at [`crown-receipt.cddl`](crown-receipt.cddl), modelled on existing SCITT application profile patterns.

---

## References

- [draft-ietf-scitt-architecture](https://datatracker.ietf.org/doc/draft-ietf-scitt-architecture/) — SCITT Architecture (AUTH48, approaching RFC status)
- [draft-ietf-scitt-scrapi](https://datatracker.ietf.org/doc/draft-ietf-scitt-scrapi/) — SCITT Reference APIs
- [RFC 9052](https://www.rfc-editor.org/rfc/rfc9052.html) — CBOR Object Signing and Encryption (COSE): Structures and Process
- [RFC 8610](https://www.rfc-editor.org/rfc/rfc8610.html) — Concise Data Definition Language (CDDL)
- [draft-kamimura-scitt-refusal-events-02](https://datatracker.ietf.org/doc/draft-kamimura-scitt-refusal-events/) — Verifiable AI Refusal Events using SCITT
- [draft-kamimura-scitt-vcp-02](https://datatracker.ietf.org/doc/draft-kamimura-scitt-vcp/) — VeritasChain Protocol: SCITT Profile for Algorithmic Trading
- [CROWN Receipt Protocol v0.1](../crown-receipt-protocol-v0.1.md) — The CROWN protocol specification
