# The CROWN Receipt Protocol

**Version:** 0.1 (Draft)
**Date:** March 2026
**Status:** Implemented, pre-standardisation
**Authors:** CueCrux Engineering

---

## 1. Overview

CROWN (Cryptographic Receipt of Witnessed kNowledge) is a protocol for producing, chaining, and independently verifying cryptographic receipts that anchor AI-assisted decisions to the evidence that produced them.

A CROWN receipt proves three things:

1. **What evidence was retrieved.** The receipt contains the hashed identities and quote hashes of every document cited in the answer, including counterfactual evidence considered but not selected.
2. **That the evidence was current.** The receipt is anchored to a specific knowledge state via a `knowledge_state_cursor` that identifies the exact position in the knowledge plane's append-only log at the time of the query.
3. **That the receipt has not been tampered with.** The receipt payload is hashed (BLAKE3) and signed (ed25519 via Vault Transit), and each receipt links to its predecessor via a `parent_snap_id`, forming an append-only hash chain.

A CROWN receipt does **not** prove that the answer is correct. It proves that the answer was derived from specific evidence, under specific retrieval conditions, at a specific point in time. This is the distinction between proof of process and proof of conclusion. The regulatory value is in the former: the ability to demonstrate, after the fact, exactly what the system knew and how it arrived at a specific output.

---

## 2. Data Structure

### 2.1 Receipt Schema

A CROWN receipt (internally: `crown_snapshot`) contains the following fields:

| Field | Type | Description |
|---|---|---|
| `snap_id` | UUID | Unique receipt identifier (auto-generated) |
| `answer_id` | UUID | The answer this receipt covers |
| `parent_snap_id` | UUID or null | Previous receipt in the chain (null for chain root) |
| `generated_at` | ISO 8601 timestamp | When the receipt was generated |
| `mode` | Enum: `light`, `verified`, `audit` | Assurance level applied |
| `mode_requested` | String | Assurance level originally requested by the caller |
| `query_hash` | String | BLAKE3 or SHA256 hash of the query text, prefixed with algorithm (e.g., `blake3:a1b2c3...`) |
| `query_text` | String | The full query string |
| `fusion` | Object | Retrieval fusion weights applied (BM25 weight, vector weight, RRF k) |
| `retrieval` | Object | Retrieval configuration metadata |
| `selection` | Object | Citation selection result (see Section 2.2) |
| `timings` | Object | Execution timings (retrieve, rerank, LLM, total in milliseconds) |
| `receipt_hash` | String | BLAKE3 hash of the canonical receipt payload (see Section 3) |
| `signature` | String or null | Base64-encoded ed25519 signature of the receipt hash |
| `signing_kid` | String or null | Key identifier, format `{keyName}:v{version}` |
| `signing_pub` | String or null | Base64-encoded ed25519 public key used for signing |
| `signed_at` | ISO 8601 timestamp or null | When the signature was produced |
| `knowledge_state_cursor` | Object or null | Position in the CoreCrux knowledge plane (see Section 7) |
| `trigger_action_receipt_id` | UUID or null | Action receipt that triggered a chain rebuild, if applicable |
| `tenant_id` | String | Multi-tenant isolation identifier |

### 2.2 Selection Object

The `selection` field captures the MiSES (Minimal Sufficient Evidence Set) composition:

| Field | Type | Description |
|---|---|---|
| `miSESSize` | Integer | Number of citations in the minimal sufficient set |
| `citationIds` | String[] | Ordered list of cited document identifiers |
| `coverage` | Object or null | Domain coverage map (domain → citation IDs) |
| `distinctDomains` | Integer or null | Number of distinct source domains represented |
| `fragilityScore` | Number or null | Leave-one-out fragility score (0.0 to 1.0) |
| `loadBearingCitations` | String[] or null | Citations whose removal would violate the domain diversity constraint |
| `counterfactual` | Object or null | Counterfactual evidence considered but not selected |

### 2.3 Evidence Records

Each receipt is accompanied by zero or more evidence records (internally: `crown_evidence`):

| Field | Type | Description |
|---|---|---|
| `snap_id` | UUID | Links to the parent receipt |
| `evidence_set_id` | UUID | Groups evidence records for this receipt |
| `claim_id` | BigInt | Evidence identifier (derived from citation ID) |
| `source_id` | BigInt | Source artifact identifier |
| `role` | Enum: `support`, `counterfactual` | Whether this evidence supports or was considered against the conclusion |
| `quote_hash` | String | Hash of the quoted text passage |
| `ts_observed` | ISO 8601 timestamp | When the evidence was observed in the corpus |
| `score_components` | Object | Fusion scores (BM25, vector, combined) |
| `chunk_id` | String or null | Specific chunk within the source artifact |
| `corpus_id` | String or null | Corpus identifier for multi-corpus deployments |

---

## 3. Hash Chain Construction

### 3.1 Canonical JSON Serialisation

The receipt payload must be serialised to a deterministic canonical form before hashing. CROWN uses sorted-key JSON serialisation:

1. All object keys are sorted alphabetically at every nesting level.
2. Arrays preserve insertion order.
3. Null values are included (not omitted).
4. Numbers use their JSON standard representation (no trailing zeros, no scientific notation for integers).

This canonicalisation is necessary because the receipt payload passes through PostgreSQL's JSONB storage, which does not preserve key ordering. Without canonical serialisation, a receipt reconstructed from database storage would produce a different hash than the original — breaking chain verification silently. This was identified and fixed during implementation; the fix is load-bearing for chain integrity.

### 3.2 Receipt Payload

The canonical receipt payload is constructed from the following fields, in this order after canonicalisation:

```jsonc
{
  "answerId": UUID,
  "citations": [{ "id": string, "quoteHash": string }],
  "counterfactual": object or null,
  "fusion": object,
  "generatedAt": ISO 8601 string,
  "mode": string,
  "modeRequested": string,
  "queryHash": string,
  "retrieval": object,
  "selection": object,
  "timings": object
}
```

Quote hashes are normalised before inclusion: legacy SHA256 hashes (without an algorithm prefix) are detected and prefixed with `sha256:` for consistency with the current BLAKE3-prefixed format.

### 3.3 Hashing

The canonical JSON string is hashed using BLAKE3 (256-bit). The result is stored as a prefixed hex string: `blake3:{hex_digest}`.

BLAKE3 is the primary hash algorithm. SHA256 is supported for backward compatibility with receipts generated before the BLAKE3 migration. The prefix ensures that verification code can select the correct algorithm automatically.

The BLAKE3 implementation uses the `@napi-rs/blake-hash` native binding. If native BLAKE3 is unavailable at runtime (e.g., due to platform constraints), the system falls back to SHA256 with a `sha256:` prefix and logs a warning.

### 3.4 Chain Linking

Each receipt stores the `snap_id` of its immediate predecessor as `parent_snap_id`. The first receipt in a chain has `parent_snap_id = null`. This forms a singly-linked append-only chain. Receipts are never modified after creation.

A chain represents the sequence of answers produced by a specific engine instance. Forking (multiple receipts with the same parent) is permitted — it indicates concurrent queries. Merging is not supported; chains are strictly append-only.

---

## 4. Signing

### 4.1 Key Management

CROWN receipts are signed using ed25519 keys managed by HashiCorp Vault Transit. The signing key is identified by a configurable key name (environment variable `CROWN_SIGNING_VAULT_TRANSIT_KEY`). Vault manages key generation, storage, rotation, and version tracking.

The signing operation uses raw ed25519 (not prehashed). The digest of the receipt hash is passed directly to Vault Transit's `sign` endpoint. Vault returns the signature along with the key version used.

### 4.2 Signature Format

The signature is stored as three fields on the receipt:

- `signature`: Base64-encoded raw ed25519 signature bytes
- `signing_kid`: Key identifier in the format `{keyName}:v{version}`, e.g., `crown-key:v1`
- `signing_pub`: Base64-encoded ed25519 public key for the version used

The public key is cached (60-second TTL) and exported from Vault Transit via the `export/public-key` endpoint.

### 4.3 Key Rotation

When the Vault Transit key is rotated to a new version, new receipts are signed with the new version. Old receipts remain verifiable because each receipt stores the public key that was used to sign it (`signing_pub`). A verifier does not need access to Vault — only the public key embedded in the receipt.

### 4.4 Unsigned Receipts

If Vault Transit is unavailable at receipt creation time (e.g., network partition, Vault sealed), the receipt is persisted without a signature. The `signature`, `signing_kid`, `signing_pub`, and `signed_at` fields are null. The receipt hash and chain linkage remain intact.

Unsigned receipts MUST NOT be mutated after creation to add a signature. If the issuer wishes to attest to an unsigned receipt after signing capability is restored, it MUST emit a separate detached attestation referencing the original `receipt_hash`. See `security-considerations.md` §3 for operational requirements and verifier behavior.

The system tracks the ratio of signed to unsigned receipts as an operational metric.

---

## 5. Verification

### 5.1 Verify-Chain Endpoint

The `GET /v1/receipts/:answerId/verify-chain` endpoint verifies the integrity of the receipt chain for a given answer.

### 5.2 Chain Traversal

The chain is loaded using a recursive Common Table Expression (CTE) with a depth limit of 50:

```sql
WITH RECURSIVE chain AS (
  SELECT snap_id, parent_snap_id, receipt_hash, mode, mode_requested,
         query_hash, fusion, retrieval, selection, timings,
         generated_at, answer_id, 1 AS depth
  FROM crown_snapshots
  WHERE answer_id = $1
    AND snap_id = (
      SELECT snap_id FROM crown_snapshots
      WHERE answer_id = $1
      ORDER BY generated_at DESC LIMIT 1
    )
  UNION ALL
  SELECT cs.snap_id, cs.parent_snap_id, cs.receipt_hash, cs.mode,
         cs.mode_requested, cs.query_hash, cs.fusion, cs.retrieval,
         cs.selection, cs.timings, cs.generated_at, cs.answer_id,
         c.depth + 1
  FROM crown_snapshots cs
  JOIN chain c ON cs.snap_id = c.parent_snap_id
  WHERE c.depth < 50
) SELECT * FROM chain ORDER BY depth ASC
```

The depth limit of 50 prevents unbounded recursion. Benchmark evidence (run e782fbd0, Cat 5) confirms that verification latency is 2-4ms at depth 50 with no degradation — the CTE executes in effectively O(1) time relative to chain depth.

### 5.3 Verification Procedure

For each receipt in the chain:

1. Load the associated evidence records from `crown_evidence`.
2. Reconstruct the canonical receipt payload from the stored fields.
3. Serialise using canonical JSON (sorted keys, as described in Section 3.1).
4. Compute the BLAKE3 hash (or SHA256 for legacy receipts).
5. Compare the computed hash to the stored `receipt_hash`.
6. If the hashes differ, record a break: `{ snapId, reason }`.

### 5.4 Verification Response

```json
{
  "ok": true,
  "data": {
    "valid": true,
    "depth": 50,
    "breaks": []
  }
}
```

A `break` indicates that a receipt's stored hash does not match the recomputed hash from its stored payload. This would indicate data corruption or tampering. In benchmark testing (50 receipt depths, run e782fbd0), zero breaks have been observed.

### 5.5 Independent Verification

A third party can verify a CROWN receipt chain without access to the CueCrux Engine:

1. Obtain the receipt chain (exported as JSON or via API).
2. For each receipt, reconstruct the canonical payload and compute the hash.
3. Verify that each receipt's `parent_snap_id` points to the preceding receipt.
4. Verify the ed25519 signature using the embedded `signing_pub` public key.

Steps 1-3 require only a BLAKE3 implementation and a JSON serialiser. Step 4 requires an ed25519 signature verification library. No CueCrux-specific infrastructure is needed. This is the independence property: a receipt that only its issuer can verify is a vendor claim; a receipt that anyone can verify is proof.

---

## 6. Assurance Modes

CROWN receipts are produced at three assurance levels:

| Mode | Domain Diversity | Fragility Scoring | Receipt Signing | Use Case |
|---|:---:|:---:|:---:|---|
| `light` | Not enforced | No | Optional | Development, low-stakes queries |
| `verified` | `minDomains >= 2` | Yes (leave-one-out) | Yes | Production, compliance-relevant queries |
| `audit` | `minDomains >= 2` | Yes (leave-one-out) | Yes | Regulatory audit, formal evidence |

The `verified` and `audit` modes enforce that the citation set spans at least two independent source domains. This prevents single-source answers from being presented as verified conclusions. The `audit` mode applies additional budget constraints (higher retrieval budget, stricter timing limits) to maximise evidence completeness at the cost of latency.

---

## 7. Knowledge State Cursor

### 7.1 Structure

```json
{
  "shardId": 0,
  "epoch": 142,
  "segmentSeq": 7,
  "offset": 48192
}
```

| Field | Type | Description |
|---|---|---|
| `shardId` | Integer | Shard in the CoreCrux knowledge cluster |
| `epoch` | Integer | Epoch/generation number |
| `segmentSeq` | Integer | Sequence number within the current segment |
| `offset` | Integer | Byte offset within the segment |

### 7.2 Purpose

The knowledge state cursor anchors a CROWN receipt to a specific position in the CoreCrux knowledge plane's append-only event log. This cursor proves that the receipt was generated at a known point in the knowledge timeline — not just "at some time" but "after event X and before event Y."

This enables temporal queries: given a receipt with cursor `{epoch: 142, segmentSeq: 7, offset: 48192}`, an auditor can determine exactly which knowledge mutations had been applied at the time of the query and which had not. Combined with the receipt chain, this provides a complete audit trail from query to evidence to knowledge state.

### 7.3 Population

The cursor is populated by the knowledge bridge when the receipt is appended to the CoreCrux event log via gRPC (`AppendBatchResponse`). Receipts produced without CoreCrux integration (V1 and V3.1 modes) have a null cursor. The presence of a non-null cursor in the benchmark results (run 110ada93, Cat 4) confirms that CoreCrux event lineage is active.

---

## 8. IETF SCITT Alignment

### 8.1 SCITT Overview

The IETF Supply Chain Integrity, Transparency, and Trust (SCITT) working group is developing a standard architecture for signed statements about supply chain artifacts. The core concepts are:

- **Claim:** A statement about an artifact (e.g., "this software build was scanned for vulnerabilities").
- **Receipt:** A countersignature from a transparency service confirming that the claim has been registered.
- **Transparency Log:** An append-only ledger of registered claims.

### 8.2 Where CROWN Maps to SCITT

| SCITT Concept | CROWN Equivalent | Notes |
|---|---|---|
| Claim | Receipt payload (evidence set, selection, fusion) | A CROWN receipt is a claim about the evidence that produced a specific answer |
| Receipt | The `receipt_hash` + `signature` | BLAKE3 hash + ed25519 signature serve the same role as a SCITT receipt |
| Transparency Log | The `crown_snapshots` chain (parent_snap_id linkage) | Append-only, hash-chained, with recursive CTE verification |
| Artifact | The answer (identified by `answer_id`) | The thing the receipt is about |
| Issuer | The CueCrux Engine instance (identified by signing key) | Key managed via Vault Transit |

### 8.3 Where CROWN Diverges

**Envelope format.** SCITT uses COSE (CBOR Object Signing and Encryption) envelopes per RFC 9052. CROWN uses JSON with BLAKE3 hashing and separate ed25519 signing. Alignment would require wrapping the CROWN receipt payload in a COSE Sign1 envelope.

**Registration policy.** SCITT transparency services apply a registration policy that determines which claims to accept. CROWN receipts are self-issued by the engine — there is no independent transparency service that evaluates claims before registration. Adding an independent registrar would strengthen the trust model.

**Content type.** SCITT is artifact-agnostic (software packages, SBOMs, vulnerability reports). CROWN is specific to retrieval-augmented generation evidence. The claim structure (citations, fusion weights, fragility scores) is domain-specific. A SCITT-aligned version would define a content type for RAG evidence claims.

**Transparency log structure.** SCITT does not prescribe a specific log structure but references Merkle-tree-based approaches (RFC 6962). CROWN uses a simpler parent_snap_id linked list. A Merkle tree would provide stronger inclusion proofs but is not required for the current use case (single-issuer chains verified by the issuer's own database).

### 8.4 SCITT Compatibility Layer

The SCITT compatibility artifacts are published in [`protocol/scitt-compat/`](scitt-compat/):

| Artifact | Description |
|---|---|
| [CDDL Schema](scitt-compat/crown-receipt.cddl) | CBOR type definition for CROWN receipts, modelled on [draft-kamimura-scitt-refusal-events-02](https://datatracker.ietf.org/doc/draft-kamimura-scitt-refusal-events-02/) Section 4 |
| [SCITT Integration](scitt-compat/scitt-integration.md) | Terminology mapping, COSE Sign1 encoding, registration guidance, verification procedure |
| [Registration Policy](scitt-compat/registration-policy.md) | Mandatory, recommended, and out-of-scope checks for Transparency Services accepting CROWN receipts |
| [Privacy Considerations](scitt-compat/privacy-considerations.md) | Query content, evidence content, tenant isolation, correlation risks, actor privacy |

Content types: `application/vnd.crown.receipt+cbor` (SCITT registration) and `application/vnd.crown.receipt+json` (standalone verification, API responses).

### 8.5 Remaining SCITT Gaps

Full SCITT alignment additionally requires:

1. **Independent transparency service.** Deploy a registrar that accepts CROWN receipts and countersigns them, providing independent confirmation of registration.
2. **Merkle-based log.** Replace or supplement the `parent_snap_id` chain with a Merkle tree for efficient inclusion proofs (see [ADR-004](decisions/004-linked-list-over-merkle.md)).
3. **IANA content type registration.** Formal registration of the `application/vnd.crown.receipt+cbor` and `application/vnd.crown.receipt+json` content types.

These changes are additive — they do not require modifying the existing receipt structure. The current CROWN protocol can be wrapped in SCITT without breaking backward compatibility.

---

## 9. Interoperability Commitment

### 9.1 Schema Stability

This document describes CROWN protocol version 0.1. The receipt schema defined in Section 2 is the stable interface. Fields may be added in future versions but will not be removed or have their types changed. The canonical JSON serialisation algorithm (Section 3.1) will not change within a major version.

### 9.2 Verification Library

An independent verification library is published at [`verify/`](../verify/). It requires only BLAKE3, SHA256, and ed25519 implementations (via `@noble/hashes` and `@noble/curves`) with zero CueCrux dependencies. The library provides both a programmatic API and a CLI (`crown-verify`) for receipt and chain verification. Test vectors with a deterministic ed25519 keypair are available in [`protocol/test-vectors/`](test-vectors/).

### 9.3 Backward Compatibility

Receipts issued under version 0.1 will remain verifiable under all future protocol versions. The algorithm prefix on `receipt_hash` (`blake3:` or `sha256:`) ensures that the correct hash algorithm is selected automatically during verification, even if future versions introduce additional algorithms.

---

## Appendix A: Benchmark Evidence

All protocol claims in this document are supported by benchmark evidence from the CueCrux retrieval quality audit suite ([AuditCrux](https://github.com/CueCrux/AuditCrux)):

| Claim | Evidence | Run ID |
|---|---|---|
| Chain verification at depth 50 | Cat 5: all chains intact, 2-4ms latency | e782fbd0 |
| Verification latency O(1) | Cat 5: slope -0.04 ms/depth (flat) | e782fbd0 |
| Hash chain integrity | Cat 5: zero breaks across 50 depths × 50 queries | e782fbd0 |
| Knowledge state cursor populated | Cat 4: cursor present in 3/3 receipts (V4.1) | 110ada93 |
| Temporal reconstruction accuracy | Cat 4: 100% v1, 96.63% v2 enterprise | 110ada93, c85daff7 |
| Fragility scoring operational | Cat 6: F1=1.0, monotonic ordering correct | e782fbd0 |
