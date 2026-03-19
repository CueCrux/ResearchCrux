# CROWN Protocol — Security Considerations

**Version:** 0.1 (Draft)
**Status:** Companion to the CROWN Receipt Protocol v0.1

This document enumerates the known security properties, assumptions, and limitations of the CROWN Receipt Protocol. It is intended for security reviewers, standards participants, and implementers. An IETF-style "Security Considerations" section would draw from this document.

---

## 1. What CROWN proves and does not prove

CROWN receipts prove **process**: that a specific answer was derived from specific evidence, under specific retrieval conditions, at a specific point in time.

CROWN receipts do **not** prove:

- That the answer is factually correct
- That the corpus is complete, unbiased, or authoritative
- That the LLM faithfully represented the evidence in its response
- That no other evidence existed that would have changed the answer

This distinction is fundamental. An attacker who controls the corpus can cause the system to produce receipts for misleading answers. The receipts will be valid — they accurately record that the system retrieved and cited the attacker's documents. CROWN is an audit trail protocol, not a fact-checking protocol.

## 2. Signing key compromise

**Threat:** An attacker obtains the Vault Transit signing key (or a version of it).

**Impact:** The attacker can produce valid signatures on forged receipts. All receipts signed by the compromised key version become suspect.

**Mitigations:**

- Each receipt embeds the key version (`signing_kid`). Key rotation creates a clean boundary: receipts signed before and after rotation are distinguishable.
- Vault Transit's key management (HSM-backed in production configurations) limits the blast radius of a compromise.
- The hash chain protects existing history — an attacker cannot insert a forged receipt into an existing linear chain without breaking the `parentSnapId` linkage.

**Residual risk:** Because Section 3.4 explicitly allows chain forking (concurrent queries produce multiple receipts sharing a `parent_snap_id`), the chain alone does not fully protect against a compromised signer. An attacker with a compromised key can mint a plausible new branch that is structurally indistinguishable from legitimate concurrent query behavior. The real defense is key versioning + revocation/status publication + append-only publication of the full receipt history, not the chain structure by itself.

### 2.1 Key rotation policy

Implementations MUST support versioned signing keys and embed `signing_kid` in every signed receipt. Deployments SHOULD rotate active online signing keys on a defined cryptoperiod; the CueCrux reference profile uses 90 days. Historical verification keys MUST remain available for as long as receipts signed by them may be relied upon. Historical receipts MUST NOT be mutated or re-signed in place.

### 2.2 Compromise response

On suspected or confirmed compromise, the issuer MUST:

1. Immediately stop signing with the affected key version.
2. Begin signing with a new key version.
3. Publish a signed key-status or revocation notice identifying the affected `kid` and the uncertainty interval (the time window during which the compromised key may have been used by an unauthorized party).

Verifiers MUST treat receipts from the compromised `kid` within the uncertainty interval as untrusted, even if the signature mathematically verifies.

## 3. Unsigned receipt window

**Threat:** When Vault Transit is unavailable (network partition, sealed Vault, maintenance), receipts are persisted without signatures. An attacker who gains database access during this window could modify unsigned receipts.

**Impact:** Unsigned receipts lack signature-based tamper detection. The hash chain still provides integrity (modifying an unsigned receipt's payload would break the chain), but the receipt cannot be attributed to the signing authority. Hash-linked is not the same as continuously attested.

### 3.1 Operational requirements

Unsigned receipts are a temporary degraded state, not a co-equal receipt class.

- The system MUST track the signed/unsigned ratio as an operational metric.
- The system SHOULD alert within **60 seconds** of the first unsigned receipt.
- Receipts still unsigned after **15 minutes** MUST be flagged in audit reports.

### 3.2 Immutability and detached attestation

If signing is temporarily unavailable, the receipt payload MAY be persisted in an immutable unsigned state and marked `pending_signature`. The original receipt object MUST NOT later be mutated to add a signature.

If the issuer wishes to attest to an unsigned receipt after recovery, it MUST emit a separate **detached attestation** over the original `receipt_hash`. This attestation is a distinct record that references the original receipt; it does not modify the receipt itself.

### 3.3 Verifier behavior

A verifier encountering an unsigned receipt:

- MAY verify hash-chain integrity.
- MUST NOT treat the receipt as issuer-attested proof.
- If the head receipt is unsigned, the chain does not satisfy `verified` or `audit` mode requirements.
- If an unsigned receipt appears inside an otherwise signed chain, the verifier MUST downgrade the result to a degraded state (e.g., `integrity-only` or `attestation-gap`) rather than treating the chain as fully verified.

## 4. Replay and contextual mispresentation

**Threat:** A valid receipt from one context is presented in another to misrepresent what evidence was available.

**Binding properties that limit replay:**

- `tenant_id` binds the receipt to a specific tenant
- `answer_id` binds the receipt to a specific answer
- `knowledge_state_cursor` binds the receipt to a specific point in the knowledge timeline
- `generated_at` provides a timestamp

### 4.1 Mandatory context checks

When a verifier knows the expected context, it MUST compare at least `tenant_id`, `answer_id`, and any applicable time or knowledge-state constraints before accepting the receipt as valid for that workflow.

A verifier that checks only the hash and signature MAY report the receipt as **cryptographically valid**, but MUST NOT claim **contextual validity**.

### 4.2 Audience binding (optional, outer envelope only)

The core CROWN receipt format SHOULD NOT include an `intended_verifier` or audience field. Receipts are designed to be portable and independently verifiable — baking designated-verifier semantics into the base format conflicts with SCITT-style transparent auditability.

If a deployment needs recipient binding for bilateral workflows, it MAY define an outer **presentation envelope** containing audience (`aud`), expiry, and nonce/challenge fields. When an audience field is present, verifiers MUST reject on audience mismatch.

This follows the model of RFC 7519 (JWT `aud` claim): optional, but binding when present.

## 5. Chain forking

Section 3.4 of the protocol spec states that forking is permitted: multiple receipts may share the same `parent_snap_id` when concurrent queries occur. This means the receipt "chain" is technically a directed acyclic graph (DAG), not a linear chain.

**Implications for verifiers:**

- A verifier traversing the chain from a specific receipt will follow a single linear path to the root. This path is unambiguous.
- A verifier enumerating all receipts for an answer may encounter forks. This is normal operational behavior, not evidence of tampering.
- A verifier should not reject a receipt solely because its parent has other children.

**Residual risk:** An attacker with database access or a compromised signing key could create a fork to insert a misleading receipt alongside a legitimate one. The fork itself is structurally indistinguishable from concurrent query behavior. Defense relies on append-only publication of the full receipt history and key-status monitoring (see §2), not on chain structure alone.

## 6. Canonical serialisation attacks

The hash chain's integrity depends on deterministic canonical JSON serialisation (Section 3.1). If two implementations produce different canonical forms for the same receipt, they will compute different hashes.

**Mitigations:**

- The serialisation rules are minimal and unambiguous: sorted keys, preserved arrays, included nulls, standard number representation
- The test vectors (`protocol/test-vectors/`) include byte-exact canonical JSON for verification
- JSON is a well-specified format with consistent behavior across languages

**Residual risk:** Edge cases in number representation (e.g., `1.0` vs `1`, very large integers, floating-point precision) could cause divergence between implementations. The protocol should specify exact handling of these cases in a future version.

## 7. Hash algorithm transition

The protocol supports BLAKE3 (primary) and SHA256 (legacy), distinguished by prefix. A future version may need to add additional algorithms.

**Considerations:**

- The prefix-based algorithm detection means a downgrade attack (replacing a BLAKE3 hash with a SHA256 hash of different content) would change the stored `receiptHash` and break verification
- Adding a new algorithm requires verifiers to support it; otherwise, they reject receipts as unverifiable
- The protocol does not currently define an algorithm negotiation mechanism

## 8. Transparency service gap

CROWN receipts are self-issued by the CueCrux Engine. There is no independent transparency service that countersigns or registers receipts. This means:

- The issuer (CueCrux) is the only party that can attest to the completeness of the receipt chain
- There is no independent proof that all receipts were published (an issuer could silently omit unfavorable receipts)
- The SCITT architecture (Section 8 of the protocol spec) addresses this gap, but it is not yet implemented

**Path forward:** An independent transparency service that accepts CROWN receipts and provides inclusion proofs would close this gap. This is the primary architectural gap for SCITT alignment.

## 9. Corpus manipulation

**Threat:** An attacker who can insert, modify, or delete documents in the corpus can influence what evidence is retrieved and cited.

**Impact:** The receipt will accurately record that the system cited the attacker's documents. The receipt is valid — the system did exactly what it claims. But the answer may be misleading because the underlying evidence was compromised.

**Mitigations:**

- `distinctDomains` and domain diversity requirements (in `verified` and `audit` modes) make single-source manipulation harder
- `fragilityScore` identifies answers that depend heavily on a single citation
- The `knowledge_state_cursor` enables after-the-fact investigation of what was in the corpus at the time

**Non-mitigation:** CROWN does not and cannot solve the corpus integrity problem. It makes corpus manipulation auditable, not impossible.

---

## Summary of resolved decisions

| # | Decision | Resolution |
|---|----------|------------|
| 1 | Key rotation policy | Versioned `kid`, 90-day active signing profile, immediate revoke-and-replace on compromise, no re-signing history (§2.1, §2.2) |
| 2 | Unsigned receipt window | Temporary degraded state only, alert at 60s, flag after 15min, detached attestation instead of mutating history (§3.1–§3.3) |
| 3 | Replay binding | Mandatory context checks in base protocol; audience binding only in optional outer presentation envelope (§4.1, §4.2) |
