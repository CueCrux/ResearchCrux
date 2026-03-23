# CROWN Registration Policy for SCITT Transparency Services

**Version:** 0.2 (Pre-submission Review)
**Date:** March 2026
**Aligned to:** [draft-ietf-scitt-scrapi](https://datatracker.ietf.org/doc/draft-ietf-scitt-scrapi/) Section 5.4

This document defines the Registration Policy for SCITT Transparency Services accepting CROWN receipt Signed Statements. A Transparency Service MAY apply all, some, or none of these checks depending on its operational context. Checks are categorised as mandatory, recommended, or out-of-scope.

---

## 1. Mandatory Checks

A Transparency Service implementing CROWN support MUST validate the following before accepting a Signed Statement:

**Protected header:**
- The COSE protected header contains an algorithm identifier for EdDSA (ed25519).
- The COSE protected header contains a content type of `application/vnd.crown.receipt+cbor` or `application/vnd.crown.receipt+json`.

**Payload structure:**
- The payload deserialises successfully to a valid `crown-receipt` per the CDDL schema (`crown-receipt.cddl`).
- `answer-id` is present and is a valid UUID (binary 16 bytes or RFC 9562 string).
- `mode` is one of `light`, `verified`, or `audit`.
- `generated-at` is present and is a valid timestamp (CBOR tag 0, tag 1, or untagged epoch).
- `query-hash` is present and has a valid algorithm prefix (`blake3:` or `sha256:`).
- `receipt-hash` is present and has a valid algorithm prefix.
- `snap-id` is present and is a valid UUID.

**Temporal validity:**
- `generated-at` is within acceptable clock skew of the Transparency Service's current time. A default tolerance of 5 minutes is RECOMMENDED; deployments MAY configure this.

---

## 2. Recommended Checks

A Transparency Service SHOULD perform the following checks when feasible:

**Hash integrity:**
- `receipt-hash` matches recomputation of the canonical receipt payload using the algorithm indicated by the prefix. This requires the Transparency Service to implement canonical JSON serialisation (protocol spec Section 3.1) and BLAKE3 hashing. If the Transparency Service cannot perform this check, it SHOULD log this limitation.

**Signature validity:**
- If `signature` is non-null, the ed25519 signature is valid for the `receipt-hash` using the public key in `signing-pub`. This confirms the Issuer's identity.
- If `signature` is null (unsigned receipt), the Transparency Service SHOULD accept the receipt but MAY flag it as unsigned in its metadata.

**Chain reference:**
- If `parent-snap-id` is non-null, a receipt with that `snap-id` exists in the log. This confirms chain continuity. If the referenced parent does not exist, the Transparency Service SHOULD accept the receipt but MAY flag it as a chain gap.

**Issuer authorisation:**
- If the Transparency Service maintains an authorised-issuer list, the Issuer identity (derived from the COSE signing key) is on the list.

---

## 3. Out-of-Scope Checks

A Transparency Service SHOULD NOT perform the following checks. These are application-level concerns verified by auditors, not by the registration infrastructure:

**Chain completeness.** Whether every answer produced by the system has a corresponding receipt, or whether the chain has gaps. This is an application-level semantic constraint. A Transparency Service that rejects receipts due to chain gaps would prevent legitimate recovery scenarios (e.g., receipts generated during a Vault Transit outage that are submitted retroactively).

**Fragility score validation.** Whether the fragility score is correctly computed. This requires access to the full evidence set and leave-one-out analysis — domain-specific logic that belongs in the application layer.

**Evidence content inspection.** The content of evidence records (quote text, source documents). The Transparency Service operates on the receipt payload, not on the underlying evidence. Evidence content is a privacy boundary: tenants may submit redacted proof packs where quote text is replaced with `[REDACTED]` while hash anchors are preserved.

**Mode enforcement.** Whether a receipt labelled `verified` actually meets the `verified` mode requirements (minDomains >= 2, fragility scoring enabled). The Transparency Service accepts the Issuer's mode declaration at face value. Mode compliance is verified by auditors using the evidence set.

**Answer correctness.** Whether the answer referenced by the receipt is factually correct. CROWN proves process, not conclusion.

---

## 4. Error Handling

When a Transparency Service rejects a CROWN Signed Statement, it SHOULD return an HTTP 400 response with a [Concise Problem Details](https://www.rfc-editor.org/rfc/rfc9290.html) body (per SCRAPI Section 2) indicating the specific validation failure:

| Failure | Suggested Detail |
|---|---|
| Missing required field | `"detail": "Required field 'answer-id' missing from CROWN receipt payload"` |
| Invalid mode value | `"detail": "Field 'mode' must be one of: light, verified, audit"` |
| Timestamp out of range | `"detail": "Field 'generated-at' exceeds acceptable clock skew (5 minutes)"` |
| Invalid hash prefix | `"detail": "Field 'receipt-hash' must be prefixed with 'blake3:' or 'sha256:'"` |
| Hash mismatch | `"detail": "Recomputed receipt hash does not match stored 'receipt-hash'"` |
| Signature invalid | `"detail": "ed25519 signature verification failed for claimed 'signing-pub'"` |
| Payload deserialisation failure | `"detail": "Payload does not conform to crown-receipt CDDL schema"` |

Transient failures (Transparency Service overloaded, storage unavailable) SHOULD return HTTP 503 with a `Retry-After` header per SCRAPI conventions.

---

## 5. Deployment Considerations

### Minimal deployment

Accept all CROWN Signed Statements that pass mandatory checks. Log all receipts. Perform recommended checks asynchronously for monitoring purposes.

### Regulated deployment (EU AI Act, DORA)

Apply all mandatory and recommended checks synchronously. Require `audit` mode receipts to be registered promptly (within minutes). Retain receipts for the regulatory retention period (minimum 2 years for DORA Article 11). Expose a chain-traversal query endpoint for auditors.

### Multi-issuer deployment

Multiple CueCrux Engine instances (e.g., across tenants or regions) may register with the same Transparency Service. Each Issuer has its own ed25519 signing key. The Transparency Service SHOULD maintain a per-Issuer index to support efficient chain queries. The `tenant-id` field in the receipt payload provides tenant isolation; the Transparency Service SHOULD NOT expose cross-tenant queries.
