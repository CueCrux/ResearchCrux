# crown-verify

Standalone verification library for [CROWN Receipt Protocol v0.1](../protocol/crown-receipt-protocol-v0.1.md) receipt chains.

**Zero CueCrux dependencies.** This library uses only:

- [@noble/hashes](https://github.com/paulmillr/noble-hashes) — BLAKE3 and SHA256 (pure JS, audited)
- [@noble/curves](https://github.com/paulmillr/noble-curves) — ed25519 signatures (pure JS, audited)

## What it verifies

Given a CROWN receipt (or chain of receipts), `crown-verify` performs the independent verification procedure specified in [Section 5.5](../protocol/crown-receipt-protocol-v0.1.md#55-independent-verification):

1. **Hash integrity** — reconstructs the canonical receipt payload, computes the BLAKE3 hash, and compares it to the stored `receiptHash`.
2. **Chain linkage** — verifies that each receipt's `parentSnapId` points to the preceding receipt's `snapshotId`, and that the chain root has a null parent.
3. **Signature validity** — verifies the ed25519 signature using the public key embedded in the receipt (if signed).

## Quick start

```bash
# Install
npm install

# Verify a single receipt
npx tsx src/cli.ts path/to/receipt.json

# Verify a receipt chain
npx tsx src/cli.ts path/to/chain.json

# Verify against the proof gallery examples
npx tsx src/cli.ts ../proof-gallery/examples/receipt-light.json

# Run tests
npm test
```

## CLI usage

```
crown-verify <receipt.json>           Verify a single receipt
crown-verify <chain.json>             Verify a receipt chain
crown-verify <file1> <file2> ...      Verify multiple files
cat receipt.json | crown-verify -     Read from stdin
```

### Exit codes

| Code | Meaning |
|------|---------|
| 0    | All receipts valid |
| 1    | Verification failures found |
| 2    | Usage error |

### Output format

```
PASS  receipt-light.json
  PASS  crown-example-light-001  [hash:ok, unsigned]

FAIL  receipt-verified.json
  FAIL  crown-example-verified-001  [hash:ok, sig:INVALID]
         Signature verification failed
```

## Programmatic API

```typescript
import { verifyReceipt, verifyChain } from "crown-verify";

// Single receipt
const result = verifyReceipt(receipt);
// { valid: true, receiptId: "...", hashMatch: true, signatureValid: null, breaks: [] }

// Receipt chain
const chainResult = verifyChain({ chain: [receipt1, receipt2, receipt3] });
// { valid: true, depth: 3, receipts: [...], breaks: [] }
```

## How canonical hashing works

Per [Section 3.1](../protocol/crown-receipt-protocol-v0.1.md#31-canonical-json-serialisation), the receipt payload is serialised with sorted keys at every nesting level before hashing. This is necessary because the receipt passes through PostgreSQL JSONB storage, which does not preserve key ordering.

The canonical payload (Section 3.2) includes: `answerId`, `citations`, `counterfactual`, `fusion`, `generatedAt`, `mode`, `modeRequested`, `queryHash`, `retrieval`, `selection`, `timings`.

The hash is computed as `blake3:{hex_digest}` (or `sha256:{hex_digest}` for legacy receipts). The algorithm prefix ensures automatic detection during verification.

## License

CC BY 4.0 — same as the CROWN protocol specification.
