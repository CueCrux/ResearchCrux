/**
 * COSE Sign1 Wrapped CROWN Signed Statement — Generator
 *
 * Takes the signed test vector receipt, converts the payload to CBOR
 * with kebab-case keys per the CDDL schema, wraps it in a COSE_Sign1
 * envelope with the test ed25519 key, and writes out:
 *   - receipt-payload.cbor   (raw CBOR-serialised receipt payload, kebab-case keys)
 *   - signed-statement.cbor  (complete COSE_Sign1 Signed Statement)
 *   - cose-walkthrough.md    (annotated hex walkthrough)
 *
 * The protected header includes kid (label 4) and CWT Claims (label 15)
 * per SCITT requirements. The signature is computed over the COSE
 * Sig_structure per RFC 9052 Section 4.4.
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
  "../../test-vectors/vector-llm-metadata.json"
);
const KEY_PATH = resolve(__dirname, "../../test-vectors/test-key.json");

// ── COSE constants (RFC 9052 / IANA COSE registry) ──────────────────
const COSE_SIGN1_TAG = 18;

// COSE Header Parameters
const COSE_HDR_ALG = 1; // Algorithm
const COSE_HDR_CONTENT_TYPE = 3; // Content Type
const COSE_HDR_KID = 4; // Key Identifier
const COSE_HDR_CWT_CLAIMS = 15; // CWT Claims (RFC 8392)

// COSE Algorithm Values
const COSE_ALG_EDDSA = -8; // EdDSA (ed25519)

// CWT claim keys (RFC 8392 §4)
const CWT_CLAIM_ISS = 1;
const CWT_CLAIM_SUB = 2;

const CONTENT_TYPE = "application/vnd.crown.receipt+cbor";
const TEST_ISSUER = "https://engine.cuecrux.com";

/**
 * Convert camelCase keys to kebab-case recursively (mirrors Engine cose.ts logic).
 */
function camelToKebab(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function toKebabKeys(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(toKebabKeys);
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    result[camelToKebab(key)] = toKebabKeys(value);
  }
  return result;
}

// ── Load inputs ─────────────────────────────────────────────────────
const vector = JSON.parse(readFileSync(VECTOR_PATH, "utf-8"));
const testKey = JSON.parse(readFileSync(KEY_PATH, "utf-8"));

const receipt = vector.receipt;

// Build canonical payload from receipt (mirrors verify/src/canonical.ts buildCanonicalPayload).
// This handles both schema 1.0 vectors (which may have verification.canonicalPayload)
// and schema 1.1 vectors (which may only have canonicalPayloadFields).
const canonicalPayload = vector.verification?.canonicalPayload ?? buildCanonicalPayloadFromReceipt(receipt);

function buildCanonicalPayloadFromReceipt(r: Record<string, unknown>): Record<string, unknown> {
  const evidence = r.evidence as Array<{ sourceId: string; quoteHash: string; role: string }>;
  const citations = evidence
    .filter((e) => e.role === "support")
    .map((e) => ({ id: e.sourceId, quoteHash: e.quoteHash }));
  const counterfactualEvidence = evidence.filter((e) => e.role === "counterfactual");
  const counterfactual = counterfactualEvidence.length > 0
    ? counterfactualEvidence.map((e) => ({ id: e.sourceId, quoteHash: e.quoteHash }))
    : null;

  const payload: Record<string, unknown> = {
    answerId: r.answerId,
    citations,
    counterfactual,
    fusion: r.fusion,
    generatedAt: r.generatedAt ?? null,
    // LLM metadata (schema 1.1): include if present on receipt
    ...(r.llmModel !== undefined ? { llmModel: r.llmModel } : {}),
    ...(r.llmRequestId !== undefined ? { llmRequestId: r.llmRequestId } : {}),
    mode: r.mode,
    modeRequested: r.modeRequested ?? r.mode,
    queryHash: r.queryHash,
    retrieval: r.retrieval,
    selection: r.selection,
    timings: r.timings,
  };
  return payload;
}

// ── Step 1: Encode canonical payload to CBOR (kebab-case keys per CDDL) ─
// Convert camelCase keys to kebab-case and add CDDL-required identifying fields.
const kebabPayload = toKebabKeys(canonicalPayload) as Record<string, unknown>;
// Add fields that are in CDDL but not in the hashed JSON payload
kebabPayload["snap-id"] = receipt.snapshotId ?? "test-snap-00000000";
kebabPayload["tenant-id"] = receipt.tenantId ?? "tenant";
kebabPayload["receipt-hash"] = receipt.receiptHash ?? vector.verification?.receiptHash ?? "";
kebabPayload["parent-snap-id"] = receipt.parentSnapId ?? null;

const payloadCbor: Buffer = cbor.encode(kebabPayload);
writeFileSync(resolve(OUT_DIR, "receipt-payload.cbor"), payloadCbor);

// ── Step 2: Build protected header (kid + CWT Claims per SCITT) ─────
const testSubject = `urn:crown:receipt:${kebabPayload["snap-id"]}`;
const cwtClaims = new Map<number, unknown>([
  [CWT_CLAIM_ISS, TEST_ISSUER],
  [CWT_CLAIM_SUB, testSubject],
]);
const protectedHeaderMap = new Map<number, unknown>([
  [COSE_HDR_ALG, COSE_ALG_EDDSA],
  [COSE_HDR_CONTENT_TYPE, CONTENT_TYPE],
  [COSE_HDR_KID, Buffer.from(testKey.kid, "utf-8")],
  [COSE_HDR_CWT_CLAIMS, cwtClaims],
]);
const protectedHeaderBytes: Buffer = cbor.encode(protectedHeaderMap);

// ── Step 3: Unprotected header (empty — all identity in protected) ──
const unprotectedHeader = new Map<number, unknown>();

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

const walkthrough = `# COSE Sign1 CROWN Signed Statement — Walkthrough

**Generated:** ${new Date().toISOString().split("T")[0]}
**Source:** \`vector-llm-metadata.json\` (schema 1.1) from \`protocol/test-vectors/\`
**Key:** \`test-key.json\` (throwaway ed25519 — TEST ONLY)

This document shows the byte-level structure of a CROWN Signed Statement — a
COSE_Sign1 envelope per [RFC 9052](https://www.rfc-editor.org/rfc/rfc9052.html)
wrapping a CBOR-encoded receipt payload. This is the format registered with a
SCITT Transparency Service.

---

## File Inventory

| File | Size | Description |
|---|---|---|
| \`receipt-payload.cbor\` | ${payloadCbor.length} bytes | CBOR-serialised receipt payload (kebab-case keys per CDDL) |
| \`signed-statement.cbor\` | ${coseSign1.length} bytes | Complete COSE_Sign1 Signed Statement (CBOR tag 18) |
| \`generate.ts\` | — | Generation script (reproduces all files deterministically) |

---

## 1. Receipt Payload (CBOR)

The receipt payload from the JSON test vector, converted to CBOR with kebab-case
keys per the CDDL schema. This is the payload inside the COSE_Sign1 envelope.

**Source fields** (kebab-case CBOR keys):

| Field | Value |
|---|---|
| \`answer-id\` | \`${canonicalPayload.answerId}\` |
| \`mode\` | \`${canonicalPayload.mode}\` |
| \`mode-requested\` | \`${canonicalPayload.modeRequested}\` |
| \`generated-at\` | \`${canonicalPayload.generatedAt}\` |
| \`llm-model\` | \`${canonicalPayload.llmModel ?? "-"}\` |
| \`llm-request-id\` | \`${canonicalPayload.llmRequestId ?? "-"}\` |
| \`citations\` | ${canonicalPayload.citations.length} entries |
| \`snap-id\` | \`${kebabPayload["snap-id"]}\` |
| \`tenant-id\` | \`${kebabPayload["tenant-id"]}\` |

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
| 4 | Key ID | \`${testKey.kid}\` | Signing key identifier |
| 15 | CWT Claims | \`{ iss: "${TEST_ISSUER}", sub: "${testSubject}" }\` | Issuer identity binding |

**CBOR bytes** (${protectedHeaderBytes.length} bytes):

\`\`\`text
${hexDump(protectedHeaderBytes)}
\`\`\`

---

## 3. Unprotected Header

Empty map — all identity-binding fields are in the protected header per SCITT requirements.

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

## 5. Complete COSE_Sign1 Signed Statement

The final structure is a CBOR tag 18 wrapping a 4-element array:

\`\`\`text
COSE_Sign1 = Tag(18) [
  protected:   ${protectedHeaderBytes.length} bytes (alg, ct, kid, CWT Claims)
  unprotected: {} (empty)
  payload:     ${payloadCbor.length} bytes (CBOR receipt, kebab-case keys)
  signature:   64 bytes (ed25519)
]
\`\`\`

**Total size:** ${coseSign1.length} bytes (\`signed-statement.cbor\`)

**Full hex dump:**

\`\`\`text
${hexDump(coseSign1)}
\`\`\`

---

## 6. Comparison: JSON vs COSE Signed Statement

| Property | JSON (standalone) | COSE Signed Statement (SCITT) |
|---|---|---|
| Payload format | Canonical JSON string | CBOR-serialised map (kebab-case keys per CDDL) |
| Signature input | UTF-8 bytes of \`receiptHash\` string | CBOR-encoded Sig_structure (RFC 9052 §4.4) |
| Signature algorithm | ed25519 (same) | ed25519 (same) |
| Key identifier | \`signing_kid\` field in receipt | COSE protected header label 4 (kid) |
| Issuer identity | N/A | CWT Claims (label 15): \`iss\` + \`sub\` in protected header |
| Content type | \`application/json\` | Payload: \`${CONTENT_TYPE}\`; Envelope: \`application/cose\` |
| Envelope overhead | ~0 (signature fields in receipt) | ~${coseSign1.length - payloadCbor.length} bytes (COSE framing + CWT) |
| SCITT compatible | Requires wrapping | Native Signed Statement |
| Human readable | Yes | Requires CBOR decoder |

The JSON format remains the default for API responses and standalone verification.
The COSE_Sign1 envelope is the **Signed Statement** — every receipt signed by
the Engine is wrapped in COSE_Sign1 with CBOR payload. Clients can request the
raw Signed Statement via \`Accept: application/cose\`.

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
