# CROWN Receipt Verification Walkthrough

This guide demonstrates how to independently verify a CROWN receipt without any CueCrux infrastructure. You need only two cryptographic primitives: **BLAKE3** (hashing) and **ed25519** (signature verification).

---

## 1. Obtain the Receipt

A CROWN receipt is a JSON object. The fields relevant to verification are:

```json
{
  "receiptHash": "blake3:3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d",
  "parentSnapId": null,
  "signature": {
    "sigB64": "TUVBSUJBQ0tFTkQtU0lHTkFUVVJFLUVYQU1QTEU=",
    "kid": "crown-signing:v1",
    "pubB64": "TUVBSUJBQ0tFTkQtUFVCTElDLUtFWS1FWEFNUExF"
  },
  "answerId": "f0e1d2c3-b4a5-6789-0abc-def123456789",
  "mode": "verified",
  "queryHash": "blake3:9f86d081...",
  "fusion": { "w_bm25": 0.4, "w_vec": 0.6, "rrf_k": 60 },
  "retrieval": { "topK": 10, "rerankK": 25 },
  "selection": { "miSESSize": 3, "citationIds": ["..."], "coverage": {...} },
  "timings": { "retrieveMs": 142, "totalMs": 1384 },
  "generatedAt": "2026-03-11T14:40:00.000Z"
}
```

---

## 2. Reconstruct the Canonical Payload

The `receiptHash` is computed over a **canonical JSON serialization** of specific payload fields. The canonicalization rules are:

1. **Sort all keys** at every nesting level (alphabetical, recursive)
2. **Include null values** (do not strip them)
3. **Preserve array order** (arrays are not sorted)
4. **No whitespace** in the serialized output

The payload fields, in sorted order after canonicalization:

- `answerId`
- `citations` (from the receipt's evidence/citation data)
- `counterfactual`
- `fusion`
- `generatedAt`
- `mode`
- `modeRequested`
- `queryHash`
- `retrieval`
- `selection`
- `timings`

Example in pseudocode:

```python
import json

payload = {
    "answerId": receipt["answerId"],
    "citations": receipt.get("citations", []),
    "counterfactual": receipt.get("counterfactual", {}),
    "fusion": receipt["fusion"],
    "generatedAt": receipt["generatedAt"],
    "mode": receipt["mode"],
    "modeRequested": receipt["modeRequested"],
    "queryHash": receipt["queryHash"],
    "retrieval": receipt["retrieval"],
    "selection": receipt["selection"],
    "timings": receipt["timings"],
}

# Recursive key sort
def sort_keys(obj):
    if isinstance(obj, dict):
        return {k: sort_keys(v) for k, v in sorted(obj.items())}
    if isinstance(obj, list):
        return [sort_keys(item) for item in obj]
    return obj

canonical = json.dumps(sort_keys(payload), separators=(',', ':'))
```

---

## 3. Verify the Hash

Compute the BLAKE3 hash of the canonical JSON string and compare to `receiptHash`:

```python
from blake3 import blake3

computed_hash = "blake3:" + blake3(canonical.encode("utf-8")).hexdigest()

assert computed_hash == receipt["receiptHash"], "Hash mismatch — receipt tampered"
```

The `blake3:` prefix distinguishes the algorithm. Older receipts may use `sha256:` prefix — use SHA-256 for those.

---

## 4. Verify the Signature

If `signature` is not null, verify the ed25519 signature over the raw `receiptHash` bytes:

```python
import base64
from nacl.signing import VerifyKey

# Decode the public key and signature
pub_bytes = base64.b64decode(receipt["signature"]["pubB64"])
sig_bytes = base64.b64decode(receipt["signature"]["sigB64"])

# The signed message is the receipt hash string (not the canonical payload)
message = receipt["receiptHash"].encode("utf-8")

# Verify
verify_key = VerifyKey(pub_bytes)
verify_key.verify(message, sig_bytes)  # raises BadSignatureError if invalid
```

**Key rotation:** Each receipt carries its own `pubB64`, so old receipts remain verifiable even after key rotation. The `kid` field (`{keyName}:v{version}`) identifies which key version was used.

---

## 5. Verify the Chain

CROWN receipts form an append-only linked list via `parentSnapId`. To verify chain integrity:

```python
def verify_chain(receipts):
    """receipts: list ordered newest → oldest"""
    for i, receipt in enumerate(receipts):
        # 1. Verify this receipt's hash
        verify_hash(receipt)

        # 2. Verify this receipt's signature (if signed)
        if receipt.get("signature"):
            verify_signature(receipt)

        # 3. Verify chain link
        if i < len(receipts) - 1:
            expected_parent = receipts[i + 1]["snapshotId"]
            assert receipt["parentSnapId"] == expected_parent, \
                f"Chain break at receipt {receipt['receiptId']}"

    # First receipt in chain should have no parent
    assert receipts[-1]["parentSnapId"] is None, "Chain root has unexpected parent"
```

**Performance:** In the CueCrux Engine, chain verification uses a recursive CTE with a depth limit of 50. Verification latency is 2–4ms regardless of depth (effectively O(1)).

---

## 6. What This Proves (and Doesn't)

### Proves:
- **Evidence identity:** Which documents were retrieved (via hashed references)
- **Evidence currency:** When each piece of evidence was observed
- **Retrieval configuration:** Exact fusion weights, top-K, filters at time of answer
- **Answer robustness:** Fragility score showing sensitivity to evidence removal
- **Temporal anchor:** Receipt chain establishes ordering and completeness
- **Integrity:** No fields have been modified since signing

### Does NOT prove:
- **Answer correctness:** CROWN proves the process, not the conclusion
- **Evidence content:** Redacted packs show hashes, not content — you need the original documents to verify content
- **Completeness of retrieval:** The receipt shows what was retrieved, not what exists in the corpus

---

## Tools

- **BLAKE3:** [github.com/BLAKE3-team/BLAKE3](https://github.com/BLAKE3-team/BLAKE3) — available in Python, Rust, Go, JavaScript
- **ed25519:** Any ed25519 implementation (libsodium, tweetnacl, Go crypto/ed25519)
- **JSON canonicalization:** Sort keys recursively, serialize with no whitespace

---

## Reference

- [CROWN Receipt Protocol v0.1](../../protocol/crown-receipt-protocol-v0.1.md) — full specification
- [CROWN Receipt JSON Schema](../schema/crown-receipt.schema.json) — machine-readable schema
- [Regulatory Mapping](../../evidence/regulatory-mapping.md) — how CROWN maps to EU AI Act and DORA

---

*This walkthrough uses example data from the fictional Meridian Financial Services corpus. No real tenant data is included.*
