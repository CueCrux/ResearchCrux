# CROWN SCITT Application Profile

**Version:** 0.1 (Draft)
**Date:** March 2026
**Status:** Pre-standardisation
**Aligned to:** [draft-ietf-scitt-architecture](https://datatracker.ietf.org/doc/draft-ietf-scitt-architecture/), [draft-ietf-scitt-scrapi](https://datatracker.ietf.org/doc/draft-ietf-scitt-scrapi/)

This document is a standalone profile specification for Transparency Service implementers. It defines everything a TS needs to accept, validate, and store CROWN Signed Statements.

For the full integration narrative, see [scitt-integration.md](scitt-integration.md).

---

## 1. Profile Identifier

**Profile:** `urn:ietf:params:scitt:profile:crown`

Transparency Services MAY use this identifier to apply profile-specific registration policies.

---

## 2. Signed Statement Format

A CROWN Signed Statement is a COSE_Sign1 envelope ([RFC 9052](https://www.rfc-editor.org/rfc/rfc9052.html) §4.2) containing a CBOR-encoded receipt payload.

### 2.1 Protected Header

The protected header is a CBOR-serialised map with the following labels:

| Label | Name | Value | Required |
|---|---|---|---|
| 1 | Algorithm | `-8` (EdDSA / ed25519) | MUST |
| 3 | Content Type | `application/vnd.crown.receipt+cbor` | MUST |
| 4 | Key ID (kid) | UTF-8 bytes of key identifier (e.g., `engine-provenance:v3`) | MUST |
| 15 | CWT Claims ([RFC 8392](https://www.rfc-editor.org/rfc/rfc8392.html)) | Map: `{ 1: iss, 2: sub }` | MUST |

**CWT Claims detail:**

| CWT Key | Name | Value Format | Example |
|---|---|---|---|
| 1 | `iss` (Issuer) | URI identifying the Engine instance | `https://engine.cuecrux.com` |
| 2 | `sub` (Subject) | URN identifying the receipt | `urn:crown:receipt:<snapshotId>` |

### 2.2 Unprotected Header

The unprotected header SHOULD be an empty map. All identity-binding fields are in the protected header.

### 2.3 Payload

The COSE_Sign1 payload is a CBOR-encoded map with kebab-case keys per the CDDL schema ([crown-receipt.cddl](crown-receipt.cddl)).

Required top-level keys:

| Key | CBOR Type | Description |
|---|---|---|
| `snap-id` | tstr (UUID) | Unique receipt identifier |
| `answer-id` | tstr (UUID) | Artifact identifier — the answer this receipt covers |
| `parent-snap-id` | tstr / null | Previous receipt in the chain (null for chain root) |
| `generated-at` | tstr (RFC 3339) | Receipt creation timestamp |
| `mode` | tstr | Assurance mode: `light`, `verified`, or `audit` |
| `mode-requested` | tstr | Mode originally requested by the caller |
| `query-hash` | tstr | BLAKE3 hash of the query, prefixed `blake3:` |
| `receipt-hash` | tstr | BLAKE3 hash of the canonical JSON payload, prefixed `blake3:` |
| `tenant-id` | tstr | Tenant scope identifier |
| `fusion` | map | Retrieval fusion weights |
| `retrieval` | map | Retrieval configuration snapshot |
| `selection` | map | MiSES citation selection |
| `timings` | map | Timing breakdown (ms) |

The full schema with sub-map definitions and extension points is in [crown-receipt.cddl](crown-receipt.cddl).

### 2.4 Signature

EdDSA (ed25519) over the CBOR-encoded Sig_structure ([RFC 9052](https://www.rfc-editor.org/rfc/rfc9052.html) §4.4):

```
Sig_structure = [
  "Signature1",           // context string
  protected_header_bytes, // CBOR bstr
  external_aad,           // empty (0 bytes)
  payload_bytes           // CBOR receipt payload
]
```

The 64-byte ed25519 signature is the fourth element of the COSE_Sign1 array.

---

## 3. Media Types

| Context | Media Type |
|---|---|
| Signed Statement on the wire | `application/cose` |
| Payload content type (protected header label 3) | `application/vnd.crown.receipt+cbor` |
| JSON API fallback | `application/json` |

---

## 4. Key Discovery

The Issuer's ed25519 public keys are available via the Engine's key discovery endpoint:

```
GET /receipts/signing-keys
```

Response contains all active key versions with kid identifiers matching the COSE protected header label 4.

A future revision may define a JWK Set or COSE Key Set endpoint.

---

## 5. Chain Integrity Model

CROWN receipts are linked into an append-only chain via `parent-snap-id`. This is an **application-level** integrity mechanism, complementary to the Transparency Log:

- **Chain integrity:** A verifier traverses the `parent-snap-id` chain to detect gaps or tampering in the receipt sequence.
- **Log integrity:** The Transparency Service's inclusion proof confirms that a Signed Statement was registered at a specific time.

These mechanisms serve different purposes. A Transparency Service SHOULD NOT attempt to enforce chain completeness — this is an application-level semantic constraint verified by auditors, not by the TS.

The `receipt-hash` field contains `blake3:<hex>` — the BLAKE3 hash of the canonical JSON representation of the receipt payload. This is the chain integrity hash. It is orthogonal to the COSE signature (which signs the CBOR payload). A verifier checking both gets two independent guarantees:

1. The canonical payload was not tampered with (receiptHash chain).
2. The CBOR payload was signed by the claimed Issuer (COSE signature).

---

## 6. Registration Policy

A Transparency Service accepting CROWN Signed Statements SHOULD validate:

1. The COSE_Sign1 envelope is well-formed (4-element array, valid CBOR).
2. The protected header contains required labels (1, 3, 4, 15).
3. The algorithm is `-8` (EdDSA).
4. The content type is `application/vnd.crown.receipt+cbor`.
5. The CWT Claims contain `iss` and `sub`.
6. The payload is valid CBOR and contains required keys (`snap-id`, `answer-id`, `receipt-hash`, `mode`).
7. The `mode` value is one of `light`, `verified`, `audit`.

A Transparency Service SHOULD NOT validate:
- Chain completeness (application-level concern).
- Fragility score correctness (requires domain-specific logic).
- Evidence content (privacy boundary).

See [registration-policy.md](registration-policy.md) for the full policy specification.

---

## 7. Verification Procedure

To verify a CROWN Transparent Statement (Signed Statement + TS Receipt):

1. **TS Receipt verification:** Confirm the TS Receipt (countersignature) is valid for the claimed Transparency Service.
2. **COSE_Sign1 verification:** Reconstruct the Sig_structure from the protected header and payload. Verify the ed25519 signature against the Issuer's public key (identified by kid in protected header).
3. **receiptHash verification:** Extract `receipt-hash` from the CBOR payload. Reconstruct the canonical JSON payload from the CBOR fields. Compute `blake3:<hex>` and compare.
4. **Chain linkage:** Verify that `parent-snap-id` points to the preceding receipt's `snap-id`.
5. **Temporal consistency:** Verify that `generated-at` >= the parent receipt's `generated-at`.

Steps 1–2 require access to the Transparency Service or its public keys.
Steps 3–5 can be performed standalone via the `crown-verify` CLI (`--cose` mode).

---

## References

- [draft-ietf-scitt-architecture](https://datatracker.ietf.org/doc/draft-ietf-scitt-architecture/) — SCITT Architecture
- [draft-ietf-scitt-scrapi](https://datatracker.ietf.org/doc/draft-ietf-scitt-scrapi/) — SCITT Reference APIs
- [RFC 9052](https://www.rfc-editor.org/rfc/rfc9052.html) — COSE Structures and Process
- [RFC 8392](https://www.rfc-editor.org/rfc/rfc8392.html) — CBOR Web Token (CWT)
- [RFC 8610](https://www.rfc-editor.org/rfc/rfc8610.html) — Concise Data Definition Language (CDDL)
- [crown-receipt.cddl](crown-receipt.cddl) — CROWN receipt CDDL schema
- [registration-policy.md](registration-policy.md) — CROWN registration policy
- [scitt-integration.md](scitt-integration.md) — Full CROWN-to-SCITT mapping
