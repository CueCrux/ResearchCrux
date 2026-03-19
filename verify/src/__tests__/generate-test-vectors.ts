#!/usr/bin/env tsx
/**
 * Generates cryptographic test vectors for the CROWN Receipt Protocol v0.1.
 *
 * Produces:
 *   protocol/test-vectors/test-key.json        — throwaway ed25519 keypair
 *   protocol/test-vectors/vector-minimal.json   — single unsigned receipt
 *   protocol/test-vectors/vector-signed.json    — single signed receipt
 *   protocol/test-vectors/vector-chain.json     — 3-deep signed chain
 *   protocol/test-vectors/vector-counterfactual.json — receipt with counterfactual evidence
 *
 * Each vector includes:
 *   - receipt: the full receipt object
 *   - canonicalPayload: the canonical payload object (Section 3.2)
 *   - canonicalJson: byte-exact canonical JSON string
 *   - expectedHash: the BLAKE3 digest with prefix
 *   - signature (if signed): base64 sig, kid, pubkey
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { ed25519 } from "@noble/curves/ed25519";
import { blake3 } from "@noble/hashes/blake3";
import { bytesToHex } from "@noble/hashes/utils";
import { buildCanonicalPayload, canonicalStringify } from "../canonical.js";
import type { CrownReceipt, CrownEvidence } from "../types.js";

const OUT = join(
  new URL(".", import.meta.url).pathname,
  "..",
  "..",
  "..",
  "protocol",
  "test-vectors"
);

mkdirSync(OUT, { recursive: true });

// --- Generate test keypair ---
const privateKey = ed25519.utils.randomPrivateKey();
const publicKey = ed25519.getPublicKey(privateKey);

const testKey = {
  _warning: "TEST ONLY — DO NOT USE IN PRODUCTION",
  algorithm: "ed25519",
  privateKeyHex: bytesToHex(privateKey),
  publicKeyHex: bytesToHex(publicKey),
  publicKeyB64: bytesToBase64(publicKey),
  kid: "crown-test-key:v1",
};

writeJSON("test-key.json", testKey);
console.log("Generated test-key.json");

// --- Helper functions ---

function bytesToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

function base64ToBytes(b64: string): Uint8Array {
  return new Uint8Array(Buffer.from(b64, "base64"));
}

function computeBlake3(input: string): string {
  const bytes = new TextEncoder().encode(input);
  return `blake3:${bytesToHex(blake3(bytes))}`;
}

function signMessage(message: string): string {
  const msgBytes = new TextEncoder().encode(message);
  const sig = ed25519.sign(msgBytes, privateKey);
  return bytesToBase64(sig);
}

function writeJSON(filename: string, data: unknown): void {
  writeFileSync(join(OUT, filename), JSON.stringify(data, null, 2) + "\n");
}

function makeEvidence(overrides: Partial<CrownEvidence> = {}): CrownEvidence {
  return {
    claimId: "claim-tv-001",
    sourceId: "doc-test-policy-001",
    role: "support",
    quoteHash:
      "blake3:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    observedAt: "2026-03-15T10:00:00.000Z",
    scoreComponents: { bm25: 0.8, vector: 0.9, rrf: 0.85 },
    chunkId: "chunk-tv-001",
    corpusId: "corpus-test",
    ...overrides,
  };
}

function buildVector(
  receipt: CrownReceipt,
  sign: boolean
): Record<string, unknown> {
  const canonicalPayload = buildCanonicalPayload(receipt);
  const canonicalJson = canonicalStringify(canonicalPayload);
  const expectedHash = computeBlake3(canonicalJson);

  // Update receipt with correct hash
  receipt.receiptHash = expectedHash;

  // Sign if requested
  if (sign) {
    const sigB64 = signMessage(expectedHash);
    receipt.signature = {
      sigB64,
      kid: testKey.kid,
      pubB64: testKey.publicKeyB64,
      signedAt: "2026-03-15T10:00:01.000Z",
    };
  }

  const vector: Record<string, unknown> = {
    _description: sign
      ? "Signed CROWN receipt test vector"
      : "Unsigned CROWN receipt test vector",
    _protocol: "CROWN Receipt Protocol v0.1",
    _section: "Section 5.5 — Independent Verification",
    receipt,
    verification: {
      canonicalPayload,
      canonicalJson,
      canonicalJsonHex: bytesToHex(new TextEncoder().encode(canonicalJson)),
      expectedHash,
      hashAlgorithm: "blake3",
    },
  };

  if (sign) {
    (vector.verification as Record<string, unknown>).signature = {
      algorithm: "ed25519",
      kid: testKey.kid,
      publicKeyHex: testKey.publicKeyHex,
      publicKeyB64: testKey.publicKeyB64,
      signatureB64: receipt.signature!.sigB64,
      signedMessage: expectedHash,
      _note:
        "Signature is over the receiptHash string (UTF-8 encoded), not the raw hash bytes",
    };
  }

  return vector;
}

// --- Vector 1: Minimal unsigned receipt ---

const minimalReceipt: CrownReceipt = {
  receiptId: "tv-minimal-001",
  snapshotId: "a0000001-0001-4000-8000-000000000001",
  answerId: "b0000001-0001-4000-8000-000000000001",
  mode: "light",
  modeRequested: "light",
  queryHash:
    "blake3:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
  fusion: { w_bm25: 0.4, w_vec: 0.6, rrf_k: 60 },
  retrieval: { topK: 10, rerankK: 25 },
  selection: {
    miSESSize: 1,
    citationIds: ["doc-test-policy-001"],
    coverage: { "test.com": ["doc-test-policy-001"] },
    distinctDomains: 1,
  },
  timings: { retrieveMs: 100, rerankMs: 30, llmMs: 800, totalMs: 930 },
  receiptHash: "", // computed below
  parentSnapId: null,
  signature: null,
  evidence: [makeEvidence()],
  generatedAt: "2026-03-15T10:00:01.000Z",
};

const v1 = buildVector(minimalReceipt, false);
writeJSON("vector-minimal.json", v1);
console.log("Generated vector-minimal.json");

// --- Vector 2: Signed receipt ---

const signedReceipt: CrownReceipt = {
  receiptId: "tv-signed-001",
  snapshotId: "a0000002-0001-4000-8000-000000000001",
  answerId: "b0000002-0001-4000-8000-000000000001",
  mode: "verified",
  modeRequested: "verified",
  queryHash:
    "blake3:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  fusion: { w_bm25: 0.4, w_vec: 0.6, rrf_k: 60 },
  retrieval: { topK: 10, rerankK: 25, filters: {}, audience: "tenant" },
  selection: {
    miSESSize: 2,
    citationIds: ["doc-test-policy-001", "doc-test-regulation-002"],
    coverage: {
      "test.com": ["doc-test-policy-001"],
      "regulator.gov": ["doc-test-regulation-002"],
    },
    distinctDomains: 2,
    fragilityScore: 0.5,
    loadBearingCitations: ["doc-test-policy-001", "doc-test-regulation-002"],
  },
  timings: { retrieveMs: 120, rerankMs: 35, llmMs: 1100, totalMs: 1255 },
  receiptHash: "", // computed below
  parentSnapId: null,
  signature: null, // set by buildVector
  evidence: [
    makeEvidence(),
    makeEvidence({
      claimId: "claim-tv-002",
      sourceId: "doc-test-regulation-002",
      quoteHash:
        "blake3:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      observedAt: "2026-03-15T10:00:00.500Z",
      chunkId: "chunk-tv-002",
    }),
  ],
  generatedAt: "2026-03-15T10:00:01.000Z",
};

const v2 = buildVector(signedReceipt, true);
writeJSON("vector-signed.json", v2);
console.log("Generated vector-signed.json");

// --- Vector 3: 3-deep signed chain ---

const chainReceipts: CrownReceipt[] = [];

for (let i = 0; i < 3; i++) {
  const receipt: CrownReceipt = {
    receiptId: `tv-chain-00${i + 1}`,
    snapshotId: `c000000${i + 1}-0001-4000-8000-00000000000${i + 1}`,
    answerId: "d0000001-0001-4000-8000-000000000001",
    mode: "verified",
    modeRequested: "verified",
    queryHash:
      "blake3:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    fusion: { w_bm25: 0.4, w_vec: 0.6, rrf_k: 60 },
    retrieval: { topK: 10, rerankK: 25 },
    selection: {
      miSESSize: 2,
      citationIds: ["doc-test-policy-001", "doc-test-regulation-002"],
      coverage: {
        "test.com": ["doc-test-policy-001"],
        "regulator.gov": ["doc-test-regulation-002"],
      },
      distinctDomains: 2,
      fragilityScore: 0.33,
      loadBearingCitations: ["doc-test-policy-001"],
    },
    timings: {
      retrieveMs: 100 + i * 10,
      rerankMs: 30 + i * 5,
      llmMs: 800 + i * 100,
      totalMs: 930 + i * 115,
    },
    receiptHash: "",
    parentSnapId:
      i === 0
        ? null
        : `c000000${i}-0001-4000-8000-00000000000${i}`,
    signature: null,
    evidence: [
      makeEvidence(),
      makeEvidence({
        claimId: "claim-tv-002",
        sourceId: "doc-test-regulation-002",
        quoteHash:
          "blake3:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      }),
    ],
    generatedAt: `2026-03-15T10:0${i}:01.000Z`,
  };
  chainReceipts.push(receipt);
}

const chainVectors = chainReceipts.map((r, i) => {
  const v = buildVector(r, true);
  return v;
});

const chainOutput = {
  _description: "3-deep signed CROWN receipt chain test vector",
  _protocol: "CROWN Receipt Protocol v0.1",
  _section: "Section 5.5 — Independent Verification, chain linkage",
  chain: chainVectors,
  expectedChainVerification: {
    valid: true,
    depth: 3,
    breaks: [],
    rootParentSnapId: null,
    linkage: [
      {
        from: chainReceipts[1].snapshotId,
        parentSnapId: chainReceipts[0].snapshotId,
      },
      {
        from: chainReceipts[2].snapshotId,
        parentSnapId: chainReceipts[1].snapshotId,
      },
    ],
  },
};

writeJSON("vector-chain.json", chainOutput);
console.log("Generated vector-chain.json");

// --- Vector 4: Receipt with counterfactual evidence ---

const counterfactualReceipt: CrownReceipt = {
  receiptId: "tv-counterfactual-001",
  snapshotId: "e0000001-0001-4000-8000-000000000001",
  answerId: "f0000001-0001-4000-8000-000000000001",
  mode: "audit",
  modeRequested: "audit",
  queryHash:
    "blake3:4a44dc15364204a80fe80e9039455cc1608281820fe2b24f1e5233ade6af1dd5",
  fusion: { w_bm25: 0.4, w_vec: 0.6, rrf_k: 60 },
  retrieval: {
    topK: 10,
    rerankK: 50,
    filters: {},
    audience: "tenant",
  },
  selection: {
    miSESSize: 2,
    citationIds: ["doc-test-policy-001", "doc-test-regulation-002"],
    coverage: {
      "test.com": ["doc-test-policy-001"],
      "regulator.gov": ["doc-test-regulation-002"],
    },
    distinctDomains: 2,
    fragilityScore: 0.25,
    loadBearingCitations: ["doc-test-policy-001"],
  },
  timings: { retrieveMs: 180, rerankMs: 55, llmMs: 1400, totalMs: 1635 },
  receiptHash: "",
  parentSnapId: null,
  signature: null,
  evidence: [
    makeEvidence(),
    makeEvidence({
      claimId: "claim-tv-002",
      sourceId: "doc-test-regulation-002",
      quoteHash:
        "blake3:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    }),
    makeEvidence({
      claimId: "claim-tv-003",
      sourceId: "doc-test-contradicting-003",
      role: "counterfactual",
      quoteHash:
        "blake3:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
      observedAt: "2026-03-15T10:00:00.200Z",
      chunkId: "chunk-tv-003",
    }),
  ],
  generatedAt: "2026-03-15T10:00:01.000Z",
};

const v4 = buildVector(counterfactualReceipt, true);
writeJSON("vector-counterfactual.json", v4);
console.log("Generated vector-counterfactual.json");

// --- Write README for test vectors ---
const readme = `# CROWN Protocol Test Vectors

Cryptographic test vectors for independent implementations of the
[CROWN Receipt Protocol v0.1](../crown-receipt-protocol-v0.1.md).

## Test Key

\`test-key.json\` contains a throwaway ed25519 keypair for use **only** with
these test vectors. **DO NOT use this key in production.**

## Vectors

| File | Description | Signed | Chain |
|------|-------------|:------:|:-----:|
| \`vector-minimal.json\` | Single receipt, minimal fields, unsigned | No | No |
| \`vector-signed.json\` | Single receipt, two evidence records, signed | Yes | No |
| \`vector-chain.json\` | 3-deep chain, all signed | Yes | Yes |
| \`vector-counterfactual.json\` | Receipt with counterfactual evidence, signed | Yes | No |

## Structure

Each vector file contains:

- \`receipt\` — the full CROWN receipt object
- \`verification.canonicalPayload\` — the canonical payload (Section 3.2)
- \`verification.canonicalJson\` — the byte-exact canonical JSON string
- \`verification.canonicalJsonHex\` — hex-encoded UTF-8 bytes of the canonical JSON
- \`verification.expectedHash\` — the expected BLAKE3 digest with \`blake3:\` prefix
- \`verification.signature\` (if signed) — signature details including the signed message

## How to use

1. Parse the \`receipt\` object.
2. Reconstruct the canonical payload from receipt fields per Section 3.2.
3. Serialise to canonical JSON (sorted keys at all nesting levels).
4. Compare your canonical JSON bytes to \`verification.canonicalJsonHex\`.
5. Compute BLAKE3 over the canonical JSON bytes.
6. Compare to \`verification.expectedHash\`.
7. If signed, verify the ed25519 signature over the \`expectedHash\` string
   using the public key from \`test-key.json\`.

If steps 4-7 all match, your implementation is correct.

## Verification with crown-verify

\`\`\`bash
cd ../verify
npm install
npx tsx src/cli.ts ../protocol/test-vectors/vector-minimal.json
npx tsx src/cli.ts ../protocol/test-vectors/vector-signed.json
\`\`\`

## Generated by

These vectors were generated by \`verify/src/__tests__/generate-test-vectors.ts\`
using [\`@noble/curves\`](https://github.com/paulmillr/noble-curves) (ed25519)
and [\`@noble/hashes\`](https://github.com/paulmillr/noble-hashes) (BLAKE3).
`;

writeFileSync(join(OUT, "README.md"), readme);
console.log("Generated README.md");

console.log("\nAll test vectors generated in protocol/test-vectors/");
