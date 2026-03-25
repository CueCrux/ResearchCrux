# SCITT Interop Pack: End-to-End Walkthrough

**Profile:** CROWN SCITT Application Profile v0.2
**Date:** March 2026
**Purpose:** One canonical CROWN receipt, all the way through the SCITT path.

This document shows a single receipt travelling from creation through COSE_Sign1 wrapping, SCRAPI registration, and verification. Every step has concrete artifacts you can inspect, decode, and verify independently.

---

## Artifacts Inventory

| File | Size | Description |
|------|------|-------------|
| [`signed-statement.cbor`](../cose-example/signed-statement.cbor) | 1,188 bytes | Complete COSE_Sign1 Signed Statement (the thing a TS receives) |
| [`receipt-payload.cbor`](../cose-example/receipt-payload.cbor) | 967 bytes | CBOR-encoded receipt payload (kebab-case keys per CDDL) |
| [`vector-llm-metadata.json`](../../test-vectors/vector-llm-metadata.json) | — | Source receipt (schema 1.1, with `llmModel` and `llmRequestId`) |
| [`test-key.json`](../../test-vectors/test-key.json) | 354 bytes | Ed25519 test key (kid: `crown-test-key:v1`). **TEST ONLY** |
| [`crown-receipt.cddl`](../crown-receipt.cddl) | 6,274 bytes | CDDL schema for CBOR receipt payload |
| [`scrapi-request.http`](scrapi-request.http) | - | SCRAPI registration request template |
| [`scrapi-response-mock.json`](scrapi-response-mock.json) | - | Mock SCRAPI registration response (illustrative) |
| [`verification-output.txt`](verification-output.txt) | - | Captured `crown-verify --cose` output |
| [`cose-walkthrough.md`](../cose-example/cose-walkthrough.md) | - | Byte-level hex walkthrough of the COSE_Sign1 structure |

**Verification tool:** [`crown-verify`](../../../verify/), standalone CLI, zero CueCrux dependencies.

---

## Step 1: Receipt Creation

The Engine generates a CROWN receipt for every answered query. The receipt captures the full retrieval-evidence chain: what was asked, how retrieval was configured, which documents were selected, and how the answer was composed.

**Source:** [`vector-llm-metadata.json`](../../test-vectors/vector-llm-metadata.json) (schema 1.1)

Key fields from the receipt:

| Field | Value |
|-------|-------|
| `snapshotId` | `d0000001-0001-4000-8000-000000000001` |
| `answerId` | `c0000001-0001-4000-8000-000000000001` |
| `mode` | `verified` |
| `parentSnapId` | `null` (chain root) |
| `llmModel` | `gpt-4o-mini-2024-07-18` |
| `llmRequestId` | `chatcmpl-tv-llm-metadata-001` |
| `citations` | 2 documents across 1 domain |

### Canonical payload and hash

The receipt's integrity hash is computed from a **canonical JSON payload**, a deterministic projection of the receipt with keys sorted alphabetically at all nesting levels. Schema 1.1 adds `llmModel` and `llmRequestId` to the hash-bound payload:

```json
{
  "answerId": "c0000001-0001-4000-8000-000000000001",
  "citations": [
    {"id": "doc-llm-test-001", "quoteHash": "blake3:bbb..."},
    {"id": "doc-llm-test-002", "quoteHash": "blake3:ccc..."}
  ],
  "counterfactual": null,
  "fusion": {"rrf_k": 60, "w_bm25": 0.4, "w_vec": 0.6},
  "generatedAt": "2026-03-24T12:00:01.000Z",
  "llmModel": "gpt-4o-mini-2024-07-18",
  "llmRequestId": "chatcmpl-tv-llm-metadata-001",
  "mode": "verified",
  "modeRequested": "verified",
  ...
}
```

**Hash:** `BLAKE3(canonicalJson) = blake3:efc1ecbc4b27b7461b04fe88fc5b38a39c188f638481e0f8f854cbdc27208e4d`

This hash is the `receiptHash`, the chain integrity mechanism. It is **independent** of COSE signing. A verifier can recompute it from the receipt fields without any COSE tooling.

---

## Step 2: CBOR Encoding

The canonical JSON payload is re-encoded as CBOR with **kebab-case keys** per the [CDDL schema](../crown-receipt.cddl). This is the COSE_Sign1 payload (the bytes that get signed).

Key transformations:

| JSON (camelCase) | CBOR (kebab-case) | CBOR type |
|---|---|---|
| `answerId` | `answer-id` | tstr |
| `queryHash` | `query-hash` | tstr |
| `llmModel` | `llm-model` | tstr / null |
| `llmRequestId` | `llm-request-id` | tstr / null |
| `miSESSize` | `mi-ses-size` | uint |
| `parentSnapId` | `parent-snap-id` | tstr / null |

Additional CDDL-required fields added to the CBOR payload (not in the hashed JSON):

| Field | Value | Purpose |
|-------|-------|---------|
| `snap-id` | `d0000001-...` | Receipt identifier for CWT subject binding |
| `tenant-id` | `tenant` | Issuer-scoped isolation |
| `receipt-hash` | `blake3:efc1ecbc...` | Cross-reference to chain integrity hash |

**Output:** [`receipt-payload.cbor`](../cose-example/receipt-payload.cbor) (967 bytes)

---

## Step 3: COSE_Sign1 Wrapping

The CBOR payload is wrapped in a COSE_Sign1 envelope per [RFC 9052](https://www.rfc-editor.org/rfc/rfc9052.html) §4.2.

### Protected header

The protected header is a CBOR-serialised map carried as a byte string:

| Label | Name | Value | RFC |
|-------|------|-------|-----|
| 1 | Algorithm | `-8` (EdDSA / ed25519) | RFC 9053 §2.2 |
| 3 | Content Type | `application/vnd.crown.receipt+cbor` | - |
| 4 | Key ID (kid) | `crown-test-key:v1` (UTF-8 bytes) | RFC 9052 §3.1 |
| 15 | CWT Claims | `{ 1: "https://engine.cuecrux.com", 2: "urn:crown:receipt:d0000001-..." }` | RFC 8392 |

CWT Claims bind the issuer identity:

- **`iss` (1):** `https://engine.cuecrux.com` (the Engine instance that generated the receipt)
- **`sub` (2):** `urn:crown:receipt:d0000001-0001-4000-8000-000000000001` (the specific receipt)

### Sig_structure

Per RFC 9052 §4.4, the message that is actually signed:

```text
Sig_structure = [
  "Signature1",           // context string
  protected_header_bytes, // CBOR bstr (147 bytes)
  external_aad,           // empty (0 bytes)
  payload_bytes           // CBOR receipt payload (967 bytes)
]
```

### Signature

Ed25519 signature (64 bytes) over the CBOR-encoded Sig_structure.

### Assembly

```text
COSE_Sign1 = [
  protected:   147 bytes (CBOR map: alg, ct, kid, CWT Claims)
  unprotected: {} (empty map)
  payload:     967 bytes (CBOR receipt, kebab-case keys)
  signature:   64 bytes (ed25519)
]
```

**Output:** [`signed-statement.cbor`](../cose-example/signed-statement.cbor) (1,188 bytes)

For the full byte-level hex walkthrough, see [`cose-walkthrough.md`](../cose-example/cose-walkthrough.md).

---

## Step 4: SCRAPI Registration

The Signed Statement is submitted to a SCITT Transparency Service via SCRAPI ([draft-ietf-scitt-scrapi](https://datatracker.ietf.org/doc/draft-ietf-scitt-scrapi/), Section 2.1).

### Request

```http
POST /entries HTTP/1.1
Host: ts.example.com
Content-Type: application/cose
Accept: application/json
```

The request body is the raw bytes of `signed-statement.cbor` (1,188 bytes). See [`scrapi-request.http`](scrapi-request.http) for the complete template.

### TS processing

The Transparency Service:

1. **Parses** the COSE_Sign1 4-element array
2. **Validates** the protected header per the [registration policy](../registration-policy.md):
   - Algorithm is EdDSA (-8)
   - Content type is `application/vnd.crown.receipt+cbor`
   - Kid is present (UTF-8 bstr)
   - CWT Claims contain `iss` and `sub`
3. **Verifies** the ed25519 signature over the Sig_structure
4. **Decodes** the CBOR payload and applies mandatory checks (mode, timestamp, payload structure per CDDL)
5. **Logs** the entry to the append-only transparency log
6. **Returns** a registration response with entry ID

### Response (illustrative)

> **Note:** No live SCITT Transparency Service currently accepts third-party application profiles. The response below follows the SCRAPI specification and is labelled illustrative. See [Section 7: What This Proves](#step-7-what-this-proves-and-what-remains) for the honest boundary.

```json
{
  "entryId": "urn:uuid:e0000001-0001-4000-8000-000000000001",
  "operationId": "urn:uuid:f0000001-0001-4000-8000-000000000001",
  "status": "succeeded",
  "entryInformation": {
    "signedStatementTimestamp": "2026-03-24T12:00:01.000Z",
    "issuer": "https://engine.cuecrux.com",
    "subject": "urn:crown:receipt:d0000001-0001-4000-8000-000000000001",
    "registrationTimestamp": "2026-03-24T12:00:02.345Z"
  }
}
```

See [`scrapi-response-mock.json`](scrapi-response-mock.json) for the full mock response.

---

## Step 5: Transparency Service Receipt

After registration, the TS issues a **SCITT Receipt**, a countersignature that proves the Signed Statement was included in the transparency log.

> **Note:** This step is illustrative. CROWN has not yet obtained a TS Receipt from an operational Transparency Service.

A SCITT Receipt would be a COSE_Sign1 envelope containing:

| Component | Content |
|-----------|---------|
| Protected header | TS algorithm, TS kid, SCITT-specific claims |
| Payload | Inclusion proof (Merkle tree path or equivalent) |
| Signature | TS private key over Sig_structure |

The combination of the original Signed Statement (Step 3) and the TS Receipt forms a **Transparent Statement**, the fully auditable, log-backed artifact.

### What CROWN provides without a TS

Even without a Transparency Service, CROWN receipts provide:

- **Cryptographic binding:** ed25519 signature ties receipt to issuer
- **Hash chain integrity:** `parentSnapId` links form an append-only chain verified by BLAKE3
- **Issuer identity:** CWT Claims (`iss`/`sub`) in protected header
- **Evidence provenance:** full retrieval configuration and citation evidence frozen at generation time

A TS adds **third-party transparency**: proof that the receipt was logged at a specific time and cannot be retroactively altered without detection.

---

## Step 6: Verification

### COSE_Sign1 envelope verification

Using the standalone `crown-verify` CLI:

```bash
crown-verify --cose signed-statement.cbor \
  --pub "lSeDZswguHg6GlB53SY2jPcrNqPN+Z2TLBKkGUtDUEE="
```

**Output:**

```text
PASS  signed-statement.cbor  [cose:valid]
  kid: crown-test-key:v1
  content-type: application/vnd.crown.receipt+cbor
  issuer: https://engine.cuecrux.com
  subject: urn:crown:receipt:d0000001-0001-4000-8000-000000000001
  Embedded receipt (CBOR, kebab-case keys)
  receipt-hash: blake3:efc1ecbc4b27b7461b04fe88fc5b38a39c188f638481e0f8f854cbdc27208e4d
  snap-id: d0000001-0001-4000-8000-000000000001
  tenant-id: tenant

1 envelope checked, 0 issue(s)
```

See [`verification-output.txt`](verification-output.txt) for the captured output.

### What each check proves

| Check | What it proves |
|-------|---------------|
| `cose:valid` | Ed25519 signature over Sig_structure is valid; the envelope has not been tampered with |
| `kid: crown-test-key:v1` | The signing key is identified in the protected header (SCITT requirement) |
| `content-type` | The payload is a CBOR-encoded CROWN receipt (not opaque bytes) |
| `issuer` | The Engine instance is bound via CWT Claims in the protected header |
| `subject` | The specific receipt is bound via CWT Claims |
| `receipt-hash` | The CBOR payload carries the BLAKE3 hash of the canonical JSON payload; cross-links envelope signing to chain integrity |
| `snap-id` | The receipt identifier matches the CWT subject URN |

### Receipt hash verification (independent of COSE)

A verifier can also check the receipt hash chain without COSE tooling:

```bash
crown-verify vector-llm-metadata.json
```

This recomputes the canonical payload, hashes it with BLAKE3, and compares against the stored `receiptHash`. If the receipt has a `parentSnapId`, the verifier checks that the parent exists and the chain is intact.

---

## Step 7: What This Proves and What Remains

### Demonstrated (production-verified)

| Capability | Evidence |
|------------|----------|
| Receipt creation | Engine generates receipts for every answered query |
| Canonical JSON hashing (BLAKE3) | Deterministic, independently reproducible |
| CBOR encoding (kebab-case per CDDL) | `receipt-payload.cbor`, decode with any CBOR library |
| COSE_Sign1 wrapping (RFC 9052) | `signed-statement.cbor`, parse with any COSE library |
| Protected header (alg, ct, kid, CWT Claims) | Verified by `crown-verify --cose` above |
| Ed25519 signature | Verified above: `cose:valid` |
| Standalone verification CLI | `crown-verify`, zero CueCrux dependencies |
| COSE_Sign1 in audit pipeline | AuditCrux Cat 3 verifies every envelope: structure, signature, header, payload integrity |
| LLM metadata binding (schema 1.1) | `llmModel` and `llmRequestId` hash-bound in canonical payload |
| Receipt chain (parentSnapId) | Depth 50, flat latency. 12/12 × 5 audit passes (Phase 7.4) |

### Specified but not yet exercised end-to-end

| Capability | Status |
|------------|--------|
| SCRAPI registration against a live TS | Specified in [Section 4](#step-4-scrapi-registration); no operational TS accepts third-party profiles |
| TS Receipt (inclusion proof) | Described in [Section 5](#step-5-transparency-service-receipt); requires live TS |
| Transparent Statement assembly | Depends on TS Receipt |

### Intentionally deferred

| Capability | Rationale |
|------------|-----------|
| IANA content-type registration | Deferred until profile stability warrants it |
| Multi-TS registration | Deployment concern, not protocol concern |

### The honest boundary

CROWN is a **credible SCITT application profile** with production-verified COSE_Sign1 signing, a published CDDL schema, standalone verification tooling, and concrete test vectors. The profile is ready for serious review.

The gap between "credible profile" and "fully interoperable profile" is a live Transparency Service that accepts the CROWN profile identifier (`urn:ietf:params:scitt:profile:crown`) and returns a TS Receipt. As of March 2026, no operational TS accepts third-party profiles. This is a gap in the SCITT ecosystem, not in the CROWN implementation.

---

## Reproducing This Pack

All artifacts are deterministically reproducible:

```bash
# Regenerate COSE_Sign1 artifacts
cd protocol/scitt-compat/cose-example
npm install && npm run generate

# Run verification
cd ../../../verify
npx tsx src/cli.ts --cose \
  ../protocol/scitt-compat/cose-example/signed-statement.cbor \
  --pub "lSeDZswguHg6GlB53SY2jPcrNqPN+Z2TLBKkGUtDUEE="

# Run all verify tests (JSON receipt + COSE)
npx tsx src/__tests__/verify.test.ts
npx tsx src/__tests__/cose.test.ts
```

---

## References

- [RFC 9052](https://www.rfc-editor.org/rfc/rfc9052.html): COSE Structures and Process
- [RFC 9053](https://www.rfc-editor.org/rfc/rfc9053.html): COSE Initial Algorithms (EdDSA = -8)
- [RFC 8392](https://www.rfc-editor.org/rfc/rfc8392.html): CBOR Web Token (CWT)
- [RFC 8610](https://www.rfc-editor.org/rfc/rfc8610.html): Concise Data Definition Language (CDDL)
- [draft-ietf-scitt-architecture](https://datatracker.ietf.org/doc/draft-ietf-scitt-architecture/): SCITT Architecture (AUTH48)
- [draft-ietf-scitt-scrapi](https://datatracker.ietf.org/doc/draft-ietf-scitt-scrapi/): SCITT Reference APIs
- [CROWN Receipt Protocol v0.1](../../crown-receipt-protocol-v0.1.md): Source protocol specification
- [CROWN SCITT Profile v0.2](../crown-scitt-profile.md): Standalone profile specification
- [Registration Policy](../registration-policy.md): What a TS checks before accepting a CROWN Signed Statement
