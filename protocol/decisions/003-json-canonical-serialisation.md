# ADR-003: JSON with canonical serialisation over CBOR

**Status:** Accepted
**Date:** March 2026

## Context

The receipt payload must be serialised to a deterministic form for hashing. Two mainstream options exist: JSON with sorted keys, or CBOR (Concise Binary Object Representation). SCITT uses COSE/CBOR envelopes.

## Decision

CROWN uses JSON with canonical serialisation (sorted keys at all nesting levels) as the primary format. CBOR/COSE wrapping is deferred to the SCITT compatibility layer.

## Rationale

- **Human readability:** Receipts are inspected by compliance engineers, auditors, and developers. JSON is directly readable; CBOR requires decoding tools. For a protocol whose value proposition is transparency, readability is a feature.
- **Debuggability:** When a hash chain breaks, the first diagnostic step is to inspect the canonical payload. With JSON, this is `cat` + `jq`. With CBOR, it requires `cbor-diag` or equivalent.
- **Existing API surface:** The CueCrux Engine API returns JSON. Receipts flow through HTTP endpoints, PostgreSQL JSONB columns, and JavaScript frontends. JSON is the native format at every layer.
- **Canonical form simplicity:** Sorted-key JSON is a well-understood technique with one page of specification. Deterministic CBOR (RFC 7049 §3.9, updated in RFC 8949 §4.2) has subtleties around map key ordering, integer encoding, and indefinite-length items.
- **PostgreSQL compatibility:** JSONB storage doesn't preserve key ordering (the root cause of the canonical serialisation requirement). This is a JSON-specific problem; using CBOR would introduce a different storage layer.

**Why not CBOR now?** SCITT uses COSE Sign1, which wraps CBOR. A future SCITT compatibility layer can wrap the existing JSON receipt payload in a COSE envelope without changing the internal format. The JSON canonical form becomes the COSE payload bytes. This is additive, not a migration.

## Consequences

- The canonical JSON specification is minimal: sorted keys, preserved arrays, included nulls, standard numbers
- JSONB round-tripping through PostgreSQL requires explicit re-canonicalisation (implemented and tested)
- A SCITT bridge will produce COSE Sign1 envelopes containing the canonical JSON as the payload
- Alternative implementations must match the exact byte output of `JSON.stringify` with sorted keys
- Test vectors include hex-encoded canonical JSON bytes for cross-language verification
