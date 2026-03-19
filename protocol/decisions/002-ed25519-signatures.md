# ADR-002: Ed25519 for receipt signing

**Status:** Accepted
**Date:** March 2026

## Context

CROWN receipts require digital signatures for tamper detection and issuer attribution. The signing algorithm must be supported by HashiCorp Vault Transit, have broad library availability, and produce compact signatures.

## Decision

Ed25519 (EdDSA over Curve25519) is the signing algorithm.

## Rationale

- **Vault Transit support:** Ed25519 is a first-class key type in Vault Transit, with native sign/verify/export operations.
- **Deterministic signatures:** Ed25519 produces deterministic signatures (no random nonce), which simplifies testing and eliminates a class of implementation bugs related to weak RNG.
- **Compact:** 64-byte signatures and 32-byte public keys. Base64-encoded, these fit comfortably in JSON fields.
- **Performance:** Ed25519 signing and verification are faster than ECDSA P-256 or RSA.
- **Library availability:** Audited pure-JS implementation in `@noble/curves`. Native support in Go, Rust, Python, and virtually every language.
- **Standards alignment:** Ed25519 is specified in RFC 8032 and is widely used in COSE (RFC 9053), which eases a future SCITT compatibility path.

**Why not ECDSA P-256?** P-256 is adequate but has non-deterministic signatures (without RFC 6979) and a more complex implementation surface. Ed25519 is simpler and harder to misuse.

**Why not RSA?** RSA signatures are 256-512 bytes, which adds meaningful size to receipt payloads when stored at scale. Key generation is also slower.

## Consequences

- Each receipt stores `sigB64` (64 bytes base64), `kid`, and `pubB64` (32 bytes base64)
- The public key is embedded in each receipt, enabling verification without access to the signing authority
- Key rotation is handled by Vault Transit versioning; old receipts remain verifiable via their embedded public key
- The verify library depends on `@noble/curves` for ed25519
