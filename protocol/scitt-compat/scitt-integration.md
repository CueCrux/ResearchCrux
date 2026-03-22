# CROWN as a SCITT Application Profile

**Version:** 0.1 (Draft)
**Date:** March 2026
**Status:** Pre-standardisation
**Aligned to:** [draft-ietf-scitt-architecture](https://datatracker.ietf.org/doc/draft-ietf-scitt-architecture/), [draft-ietf-scitt-scrapi](https://datatracker.ietf.org/doc/draft-ietf-scitt-scrapi/)

This document describes how CROWN receipts integrate with the IETF SCITT (Supply Chain Integrity, Transparency, and Trust) architecture. CROWN is an application profile for SCITT — it defines domain-specific claim semantics for AI retrieval-evidence provenance. It does not extend or modify the SCITT architecture.

---

## 1. Mapping to SCITT

This specification maps directly to SCITT primitives:

| CROWN Concept | SCITT Primitive | Notes |
|---|---|---|
| CROWN receipt payload | Signed Statement payload | Serialised per the CDDL schema in `crown-receipt.cddl` |
| CueCrux Engine instance | Issuer | Identified by ed25519 signing key managed via Vault Transit |
| Answer (`answerId`) | Artifact | The thing the receipt is about |
| `receiptHash` + ed25519 `signature` | Signed Statement signature | COSE_Sign1 envelope for SCITT; native JSON+ed25519 for standalone |
| SCITT inclusion proof | Receipt | Countersignature from Transparency Service confirming registration |
| `crown_snapshots` chain (`parentSnapId`) | Application-level integrity chain | Complementary to (not replacing) the Transparency Log |
| Evidence records | Supplementary claim data | Accompanies the receipt; linked by `snapId` |
| Assurance mode (`light`/`verified`/`audit`) | Registration policy input | Transparency Services MAY apply mode-specific acceptance rules |

The `parentSnapId` chain and the SCITT Transparency Log serve different purposes. The chain provides application-level integrity: a verifier can traverse the chain to detect gaps or tampering in the receipt sequence. The Transparency Log provides third-party verifiability: a verifier can confirm that a receipt was registered at a specific time without trusting the Issuer. These mechanisms are complementary. A CROWN receipt registered with a SCITT Transparency Service carries both guarantees.

---

## 2. Encoding as Signed Statements

A CROWN receipt is carried as the payload of a SCITT Signed Statement:

1. The receipt is serialised. CBOR encoding per the CDDL schema (`crown-receipt.cddl`) is RECOMMENDED for SCITT integration. JSON encoding per the existing JSON Schema is permitted for standalone deployments and backward compatibility.

2. The serialised bytes become the COSE_Sign1 payload per [RFC 9052](https://www.rfc-editor.org/rfc/rfc9052.html).

3. The protected header MUST contain:
   - Algorithm identifier for EdDSA (ed25519)
   - Content type: `application/vnd.crown.receipt+cbor` (for CBOR) or `application/vnd.crown.receipt+json` (for JSON)

4. The Issuer is the CueCrux Engine instance's signing identity. The ed25519 key is managed via HashiCorp Vault Transit. The key identifier (`signing_kid`) and public key (`signing_pub`) are embedded in the receipt and in the COSE protected header.

5. Evidence records MAY be included as additional Signed Statements linked to the receipt by `snapId`, or bundled in the receipt payload's `selection` field.

### Content Types

| Encoding | Content Type | Use Case |
|---|---|---|
| CBOR | `application/vnd.crown.receipt+cbor` | SCITT Transparency Service registration |
| JSON | `application/vnd.crown.receipt+json` | Standalone verification, API responses, proof gallery |

A future revision may request IANA registration of these content types. This document does not request IANA actions at this time.

---

## 3. Registration

After creating a Signed Statement, the Issuer SHOULD register it with a SCITT Transparency Service via [SCRAPI](https://datatracker.ietf.org/doc/draft-ietf-scitt-scrapi/).

The Transparency Service returns a Receipt (SCITT inclusion proof) confirming that the Signed Statement has been registered in the append-only log. Issuers SHOULD store Receipts for future verification requests.

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

A verifiable CROWN evidence trail consists of:

1. The CROWN receipt Signed Statement
2. The SCITT Receipt (inclusion proof from Transparency Service)
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

A SCITT Transparency Service MAY apply a Registration Policy that validates incoming CROWN Signed Statements before acceptance. See [registration-policy.md](registration-policy.md) for the full policy specification.

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

- **End-to-end Transparency Service interop.** No CROWN receipt has been registered with a live SCITT Transparency Service and verified via a returned SCITT Receipt (inclusion proof). The encoding path (JSON → CBOR → COSE_Sign1 → SCRAPI registration) is specified but not yet exercised against an operational log. This is the primary gap between "credible profile" and "interoperable profile."

- **COSE_Sign1 production path.** The current Engine produces JSON receipts signed with ed25519 via Vault Transit. The CBOR/COSE_Sign1 encoding described in Section 2 is specified in the CDDL schema but not yet produced by the Engine's signing pipeline. A worked example with real signatures does not yet exist.

### Intentionally deferred

- **IANA content-type registration.** `application/vnd.crown.receipt+cbor` and `application/vnd.crown.receipt+json` are defined for use but not yet submitted to IANA. Registration will be requested when the profile reaches a stability level that justifies it.

- **Multi-Transparency-Service registration.** The spec does not address registering the same receipt with multiple Transparency Services. This is a deployment concern, not a protocol concern, and is deferred.

### Implemented and verified

- **Receipt hash chain.** `parentSnapId` chain integrity verified to depth 50 with flat latency (~3ms). See [AuditCrux Cat 5](https://github.com/CueCrux/AuditCrux) results.

- **Ed25519 signing via Vault Transit.** Production signing with key rotation, public key embedding, and offline verification. Signing queue with 90-day expiry for transient Vault unavailability.

- **Standalone verification.** The `crown-verify` CLI ([verify/](../../verify/)) performs receipt hash recomputation and chain linkage checks without SCITT infrastructure. Published test vectors in [proof-gallery/](../../proof-gallery/).

- **Retrieval quality evidence.** 13-category benchmark suite with 1074 docs, 462 queries, 13/13 × 3 canonical passes. Methodology separates retrieval failure from LLM citation failure. See [benchmark evidence](../../evidence/ledger/README.md).

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
