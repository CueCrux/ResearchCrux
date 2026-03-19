# ADR-001: BLAKE3 as primary hash algorithm

**Status:** Accepted
**Date:** March 2026

## Context

CROWN receipts require a hash function for receipt payload integrity. The hash must be fast (receipts are generated on every query), collision-resistant, and widely implementable.

## Decision

BLAKE3 is the primary hash algorithm. SHA256 is retained for backward compatibility with receipts generated before the migration.

## Rationale

- **Performance:** BLAKE3 is ~4x faster than SHA256 on modern hardware and parallelises across cores. Receipt generation is latency-sensitive (target: <5ms overhead).
- **Security:** BLAKE3 provides 256-bit security, equivalent to SHA256. It is based on the BLAKE family, which was a SHA-3 finalist.
- **Simplicity:** BLAKE3 has a single output size (256-bit), no configuration parameters, and no known weaknesses.
- **Library availability:** Native implementations exist for Rust, C, Go, Python, JavaScript, and most other languages. The `@noble/hashes` (JS) and `@napi-rs/blake-hash` (native binding) packages are audited.

**Why not SHA-3?** SHA-3 (Keccak) is slower than both SHA256 and BLAKE3 on non-hardware-accelerated platforms. Since CROWN targets server and browser environments, software performance matters.

**Why not SHA256 exclusively?** SHA256 is adequate for security but slower. Given that receipt hashing is on the critical path of every query, the performance difference is measurable at scale.

## Consequences

- All new receipts use `blake3:` prefixed hashes
- Legacy `sha256:` hashes remain valid and verifiable indefinitely
- Verifiers must support both algorithms (the prefix makes detection automatic)
- The verify library depends on `@noble/hashes` for both BLAKE3 and SHA256
