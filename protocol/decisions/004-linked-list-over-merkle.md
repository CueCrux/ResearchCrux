# ADR-004: Linked-list chain over Merkle tree

**Status:** Accepted
**Date:** March 2026

## Context

CROWN receipts form an append-only sequence. Two data structures are commonly used for append-only verifiable logs: singly-linked lists (each entry points to its predecessor) and Merkle trees (each entry is a leaf, with inclusion proofs via tree hashes). Certificate Transparency (RFC 6962) and SCITT reference implementations use Merkle trees.

## Decision

CROWN uses a singly-linked list via `parent_snap_id`, not a Merkle tree.

## Rationale

- **Single-issuer model:** CROWN chains are produced by a single CueCrux Engine instance. The primary use case is sequential verification ("walk the chain, check each hash"). Merkle trees add value when you need efficient inclusion proofs for a third party ("prove that receipt X is in the log without downloading the entire log"). In the current architecture, the verifier has access to the full chain.
- **Implementation simplicity:** A linked list is a single SQL column (`parent_snap_id`). Verification is a recursive CTE with O(n) complexity. A Merkle tree requires maintaining tree state, computing intermediate hashes, and storing proof paths. The operational complexity is higher for no current benefit.
- **Benchmark evidence:** Chain verification at depth 50 completes in 2-4ms (run e782fbd0, Cat 5). Performance is not a bottleneck.
- **Forking support:** Concurrent queries produce forks (multiple receipts with the same parent). A linked-list DAG handles this naturally. Merkle trees require explicit fork-handling logic.

**When to reconsider:** If CROWN adopts an independent transparency service (Section 8.4 of the protocol spec), Merkle-based inclusion proofs become valuable. A transparency service needs to prove "this receipt is in the log" without revealing the entire log. This ADR should be revisited when the SCITT compatibility layer is implemented.

## Consequences

- Chain verification is O(depth) with a depth limit of 50 (configurable)
- No inclusion proofs are available — verifiers must access the full chain
- Forking is naturally supported (DAG, not strictly linear)
- Migration to a Merkle structure is additive: tree hashes can be computed over existing chains without modifying receipts
- The depth limit of 50 prevents unbounded recursion but means very long chains require pagination
