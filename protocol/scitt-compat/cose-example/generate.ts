/**
 * COSE Sign1 Wrapped CROWN Receipt — Generator
 *
 * Takes the signed test vector receipt, serialises the canonical payload
 * to CBOR, wraps it in a COSE_Sign1 envelope with the test ed25519 key,
 * and writes out:
 *   - receipt-payload.cbor   (raw CBOR-serialised receipt payload)
 *   - signed-statement.cbor  (complete COSE_Sign1 envelope)
 *   - cose-walkthrough.md    (annotated hex walkthrough)
 *
 * The signature is computed fresh over the COSE Sig_structure per RFC 9052
 * Section 4.4, not copied from the JSON test vector (which signs the
 * receiptHash string, not the COSE structure).
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import cbor, { Tagged } from "cbor";
import { ed25519 } from "@noble/curves/ed25519";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = __dirname;
const VECTOR_PATH = resolve(
  __dirname,
  "../../test-vectors/vector-signed.json"
);
const KEY_PATH = resolve(__dirname, "../../test-vectors/test-key.json");

// ── COSE constants (RFC 9052 / IANA COSE registry) ──────────────────
const COSE_SIGN1_TAG = 18;

// COSE Header Parameters
const COSE_HDR_ALG = 1; // Algorithm
const COSE_HDR_KID = 4; // Key Identifier
const COSE_HDR_CONTENT_TYPE = 3; // Content Type

// COSE Algorithm Values
const COSE_ALG_EDDSA = -8; // EdDSA (ed25519)

const CONTENT_TYPE = "application/vnd.crown.receipt+cbor";

// ── Load inputs ─────────────────────────────────────────────────────
const vector = JSON.parse(readFileSync(VECTOR_PATH, "utf-8"));
const testKey = JSON.parse(readFileSync(KEY_PATH, "utf-8"));

const receipt = vector.receipt;
const canonicalPayload = vector.verification.canonicalPayload;

// ── Step 1: Encode canonical payload to CBOR ────────────────────────
// We serialise the canonical JSON payload object (not the JSON string)
// to CBOR. This is the payload that goes inside the COSE_Sign1 envelope.
const payloadCbor: Buffer = cbor.encode(canonicalPayload);
writeFileSync(resolve(OUT_DIR, "receipt-payload.cbor"), payloadCbor);

// ── Step 2: Build protected header ──────────────────────────────────
const protectedHeaderMap = new Map<number, unknown>([
  [COSE_HDR_ALG, COSE_ALG_EDDSA],
  [COSE_HDR_CONTENT_TYPE, CONTENT_TYPE],
]);
const protectedHeaderBytes: Buffer = cbor.encode(protectedHeaderMap);

// ── Step 3: Build unprotected header ────────────────────────────────
const unprotectedHeader = new Map<number, unknown>([
  [COSE_HDR_KID, Buffer.from(testKey.kid, "utf-8")],
]);

// ── Step 4: Build Sig_structure and sign ────────────────────────────
// Per RFC 9052 Section 4.4:
// Sig_structure = ["Signature1", body_protected, external_aad, payload]
const externalAad = Buffer.alloc(0); // no external AAD
const sigStructure = [
  "Signature1",
  protectedHeaderBytes,
  externalAad,
  payloadCbor,
];
const sigStructureCbor: Buffer = cbor.encode(sigStructure);

// Sign with the test private key
const privateKey = Buffer.from(testKey.privateKeyHex, "hex");
const signature = ed25519.sign(sigStructureCbor, privateKey);

// ── Step 5: Assemble COSE_Sign1 ────────────────────────────────────
// COSE_Sign1 = CBOR Tag 18 [ protected, unprotected, payload, signature ]
const coseSign1Array = [
  protectedHeaderBytes,
  unprotectedHeader,
  payloadCbor,
  Buffer.from(signature),
];
const coseSign1: Buffer = cbor.encode(new Tagged(COSE_SIGN1_TAG, coseSign1Array));
writeFileSync(resolve(OUT_DIR, "signed-statement.cbor"), coseSign1);

// ── Step 6: Verify round-trip ───────────────────────────────────────
const pubKey = Buffer.from(testKey.publicKeyHex, "hex");
const valid = ed25519.verify(signature, sigStructureCbor, pubKey);
if (!valid) {
  console.error("ERROR: Signature verification failed!");
  process.exit(1);
}

// ── Step 7: Generate walkthrough ────────────────────────────────────
function hexDump(buf: Buffer | Uint8Array, indent = ""): string {
  const hex = Buffer.from(buf).toString("hex");
  const lines: string[] = [];
  for (let i = 0; i < hex.length; i += 64) {
    lines.push(indent + hex.slice(i, i + 64));
  }
  return lines.join("\n");
}

function hexSnippet(buf: Buffer | Uint8Array, maxBytes = 32): string {
  const hex = Buffer.from(buf).toString("hex");
  if (buf.length <= maxBytes) return hex;
  return hex.slice(0, maxBytes * 2) + "...";
}

const walkthrough = `# COSE Sign1 Wrapped CROWN Receipt — Walkthrough

**Generated:** ${new Date().toISOString().split("T")[0]}
**Source:** \`vector-signed.json\` from \`protocol/test-vectors/\`
**Key:** \`test-key.json\` (throwaway ed25519 — TEST ONLY)

This document shows the byte-level structure of a CROWN receipt wrapped in a
COSE_Sign1 envelope per [RFC 9052](https://www.rfc-editor.org/rfc/rfc9052.html).
This is the format used when registering CROWN receipts with a SCITT
Transparency Service.

---

## File Inventory

| File | Size | Description |
|---|---|---|
| \`receipt-payload.cbor\` | ${payloadCbor.length} bytes | CBOR-serialised canonical receipt payload |
| \`signed-statement.cbor\` | ${coseSign1.length} bytes | Complete COSE_Sign1 envelope (CBOR tag 18) |
| \`generate.ts\` | — | Generation script (reproduces all files deterministically) |

---

## 1. Receipt Payload (CBOR)

The canonical receipt payload from the JSON test vector, serialised to CBOR.
This is the payload that goes inside the COSE_Sign1 envelope.

**Source JSON fields** (sorted keys per Section 3.1):

| Field | Value |
|---|---|
| \`answerId\` | \`${canonicalPayload.answerId}\` |
| \`mode\` | \`${canonicalPayload.mode}\` |
| \`modeRequested\` | \`${canonicalPayload.modeRequested}\` |
| \`generatedAt\` | \`${canonicalPayload.generatedAt}\` |
| \`citations\` | ${canonicalPayload.citations.length} entries |
| \`fragilityScore\` | ${canonicalPayload.selection.fragilityScore} |
| \`distinctDomains\` | ${canonicalPayload.selection.distinctDomains} |

**CBOR bytes** (\`receipt-payload.cbor\`, ${payloadCbor.length} bytes):

\`\`\`text
${hexDump(payloadCbor)}
\`\`\`

---

## 2. Protected Header

The COSE protected header is a CBOR-serialised map carried as a byte string
in the first element of the COSE_Sign1 array.

**Contents:**

| Label | Name | Value | Meaning |
|---|---|---|---|
| 1 | Algorithm | -8 | EdDSA (ed25519) |
| 3 | Content Type | \`${CONTENT_TYPE}\` | CROWN receipt in CBOR encoding |

**CBOR bytes** (${protectedHeaderBytes.length} bytes):

\`\`\`text
${hexDump(protectedHeaderBytes)}
\`\`\`

---

## 3. Unprotected Header

Carried as a CBOR map (not byte-wrapped) in the second element.

| Label | Name | Value |
|---|---|---|
| 4 | Key ID | \`${testKey.kid}\` (UTF-8 bytes) |

The Key ID identifies which signing key was used. In production, this
corresponds to the Vault Transit key name and version (e.g., \`crown-key:v3\`).

---

## 4. Signature

**Sig_structure** (the message that is actually signed, per RFC 9052 §4.4):

\`\`\`text
Sig_structure = [
  "Signature1",           // context string
  protected_header_bytes, // ${protectedHeaderBytes.length} bytes
  external_aad,           // empty (0 bytes)
  payload                 // ${payloadCbor.length} bytes (receipt-payload.cbor)
]
\`\`\`

**Sig_structure CBOR** (${sigStructureCbor.length} bytes):

\`\`\`text
${hexDump(sigStructureCbor)}
\`\`\`

**Ed25519 signature** (64 bytes):

\`\`\`text
${hexDump(Buffer.from(signature))}
\`\`\`

**Verification:** \`ed25519.verify(signature, sig_structure_cbor, public_key)\` = **${valid}**

---

## 5. Complete COSE_Sign1 Envelope

The final structure is a CBOR tag 18 wrapping a 4-element array:

\`\`\`text
COSE_Sign1 = Tag(18) [
  protected:   ${protectedHeaderBytes.length} bytes (header map as bstr)
  unprotected: { 4: "${testKey.kid}" }
  payload:     ${payloadCbor.length} bytes (receipt CBOR)
  signature:   64 bytes (ed25519)
]
\`\`\`

**Total size:** ${coseSign1.length} bytes (\`signed-statement.cbor\`)

**Full hex dump:**

\`\`\`text
${hexDump(coseSign1)}
\`\`\`

---

## 6. Comparison: JSON vs COSE

| Property | JSON (standalone) | COSE (SCITT) |
|---|---|---|
| Payload format | Canonical JSON string | CBOR-serialised map |
| Signature input | UTF-8 bytes of \`receiptHash\` string | CBOR-encoded Sig_structure |
| Signature algorithm | ed25519 (same) | ed25519 (same) |
| Key identifier | \`signing_kid\` field in receipt | COSE header label 4 (kid) |
| Content type | \`application/json\` | \`${CONTENT_TYPE}\` |
| Envelope overhead | ~0 (signature fields in receipt) | ~${coseSign1.length - payloadCbor.length} bytes (COSE framing) |
| SCITT compatible | Requires wrapping | Native |
| Human readable | Yes | Requires CBOR decoder |

The JSON format remains the primary format for API responses, the proof gallery,
and standalone verification. The COSE format is used when registering receipts
with a SCITT Transparency Service.

---

## 7. Reproducing

\`\`\`bash
cd protocol/scitt-compat/cose-example
npm install
npm run generate
\`\`\`

This regenerates all three output files from the test vector. The CBOR output
is deterministic: the same input always produces the same bytes.

---

## References

- [RFC 9052](https://www.rfc-editor.org/rfc/rfc9052.html) — COSE Structures and Process
- [RFC 9053](https://www.rfc-editor.org/rfc/rfc9053.html) — COSE Initial Algorithms (EdDSA = -8)
- [CROWN Receipt Protocol v0.1](../../crown-receipt-protocol-v0.1.md) — Source protocol specification
- [SCITT Integration Guide](../scitt-integration.md) — CROWN-to-SCITT mapping
- [Test Vectors](../../test-vectors/) — Source receipt and key material
`;

writeFileSync(resolve(OUT_DIR, "cose-walkthrough.md"), walkthrough);

// ── Summary ─────────────────────────────────────────────────────────
console.log("COSE Sign1 CROWN receipt generated:");
console.log(`  receipt-payload.cbor   ${payloadCbor.length} bytes`);
console.log(`  signed-statement.cbor  ${coseSign1.length} bytes`);
console.log(`  cose-walkthrough.md    generated`);
console.log(`  Signature valid: ${valid}`);
