/**
 * COSE_Sign1 verification tests for crown-verify.
 *
 * Tests verifyCoseSign1() against:
 *   1. Pre-generated signed-statement.cbor from cose-example/
 *   2. Dynamically generated envelopes using the test key
 *   3. Invalid/malformed envelopes
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { verifyCoseSign1 } from "../cose.js";

const __dir = new URL(".", import.meta.url).pathname;
const EXAMPLE_DIR = join(__dir, "..", "..", "..", "protocol", "scitt-compat", "cose-example");
const KEY_PATH = join(__dir, "..", "..", "..", "protocol", "test-vectors", "test-key.json");

const testKey = JSON.parse(readFileSync(KEY_PATH, "utf-8"));

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string): void {
  if (condition) {
    console.log(`  PASS  ${message}`);
    passed++;
  } else {
    console.error(`  FAIL  ${message}`);
    failed++;
  }
}

// --- Test 1: Verify pre-generated signed-statement.cbor ---
console.log("COSE_Sign1 verification (pre-generated signed-statement.cbor):");

const signedStatement = readFileSync(join(EXAMPLE_DIR, "signed-statement.cbor"));
const result1 = await verifyCoseSign1(new Uint8Array(signedStatement), testKey.publicKeyB64);

assert(result1.valid, "envelope signature is valid");
assert(result1.signatureValid, "signatureValid flag is true");
assert(result1.payloadBytes !== null, "payload bytes extracted");
assert(result1.kid === testKey.kid, `kid matches test key (${result1.kid})`);
assert(
  result1.contentType === "application/vnd.crown.receipt+cbor",
  `content-type is correct (${result1.contentType})`,
);
assert(result1.issuer !== null, `CWT issuer present (${result1.issuer})`);
assert(result1.subject !== null, `CWT subject present (${result1.subject})`);
assert(!result1.error, `no error (${result1.error ?? "none"})`);

// Verify payload is valid CBOR with kebab-case keys
if (result1.payloadBytes) {
  const { decode: cborDecode } = await import("cbor-x");
  const payload = cborDecode(result1.payloadBytes) as Record<string, unknown>;
  assert(typeof payload["snap-id"] === "string", "CBOR payload has snap-id (kebab-case)");
  assert(typeof payload["receipt-hash"] === "string", "CBOR payload has receipt-hash (kebab-case)");
  assert(typeof payload["mode"] === "string", "CBOR payload has mode");
  assert("parent-snap-id" in payload, "CBOR payload has parent-snap-id key");
  // Verify no camelCase keys leaked through
  const hasCamelCase = Object.keys(payload).some((k) => /[A-Z]/.test(k));
  assert(!hasCamelCase, "CBOR payload has no camelCase keys (all kebab-case)");
}

// --- Test 2: Wrong public key → signature invalid ---
console.log("\nCOSE_Sign1 verification (wrong public key):");

// Generate a different key's base64 (flip bytes)
const wrongKeyHex = testKey.publicKeyHex.split("").reverse().join("");
const wrongKeyB64 = Buffer.from(wrongKeyHex, "hex").toString("base64");
const result2 = await verifyCoseSign1(new Uint8Array(signedStatement), wrongKeyB64);

assert(!result2.valid, "wrong key → invalid");
assert(!result2.signatureValid, "wrong key → signatureValid is false");
// Metadata should still be extractable even with wrong key
assert(result2.kid === testKey.kid, "kid still extractable with wrong key");

// --- Test 3: Malformed envelope (not CBOR) ---
console.log("\nCOSE_Sign1 verification (malformed input):");

const malformed = new Uint8Array([0x00, 0x01, 0x02, 0x03]);
const result3 = await verifyCoseSign1(malformed, testKey.publicKeyB64);

assert(!result3.valid, "malformed → invalid");
assert(result3.error !== undefined, `malformed → error message (${result3.error?.slice(0, 60)})`);

// --- Test 4: Truncated envelope ---
console.log("\nCOSE_Sign1 verification (truncated):");

const truncated = new Uint8Array(signedStatement.subarray(0, 20));
const result4 = await verifyCoseSign1(truncated, testKey.publicKeyB64);

assert(!result4.valid, "truncated → invalid");

// --- Test 5: Dynamically generated envelope ---
console.log("\nCOSE_Sign1 dynamic generation + verification:");

const { ed25519 } = await import("@noble/curves/ed25519");
const { encode: cborEncode } = await import("cbor-x");

const privateKey = Buffer.from(testKey.privateKeyHex, "hex");

// Build a minimal CBOR payload
const testPayload: Record<string, unknown> = {
  "snap-id": "test-snap-00000001",
  "answer-id": "test-answer-00000001",
  "mode": "verified",
  "receipt-hash": "blake3:0000000000000000000000000000000000000000000000000000000000000000",
  "parent-snap-id": null,
  "tenant-id": "test-tenant",
  "generated-at": new Date().toISOString(),
};
const payloadCbor = cborEncode(testPayload);

// Build protected header with kid + CWT claims
const protectedHeaderMap = new Map<number, unknown>([
  [1, -8], // alg = EdDSA
  [3, "application/vnd.crown.receipt+cbor"], // content-type
  [4, Buffer.from(testKey.kid, "utf-8")], // kid
  [15, new Map<number, unknown>([
    [1, "https://test.cuecrux.com"], // iss
    [2, "urn:crown:receipt:test-snap-00000001"], // sub
  ])],
]);
const protectedBytes = cborEncode(protectedHeaderMap);

// Build Sig_structure
const sigStructure = ["Signature1", Buffer.from(protectedBytes), Buffer.alloc(0), Buffer.from(payloadCbor)];
const sigStructureCbor = cborEncode(sigStructure);

// Sign with test key
const signature = ed25519.sign(new Uint8Array(sigStructureCbor), privateKey);

// Assemble COSE_Sign1 (no tag 18 — matching Engine's buildCoseSign1 which omits the tag)
const coseArray = [
  Buffer.from(protectedBytes),
  new Map<number, unknown>(),
  Buffer.from(payloadCbor),
  Buffer.from(signature),
];
const envelope = cborEncode(coseArray);

const result5 = await verifyCoseSign1(new Uint8Array(envelope), testKey.publicKeyB64);

assert(result5.valid, "dynamic envelope → valid");
assert(result5.signatureValid, "dynamic envelope → signatureValid");
assert(result5.kid === testKey.kid, `dynamic envelope → kid (${result5.kid})`);
assert(result5.issuer === "https://test.cuecrux.com", `dynamic envelope → issuer (${result5.issuer})`);
assert(result5.subject === "urn:crown:receipt:test-snap-00000001", `dynamic envelope → subject (${result5.subject})`);
assert(result5.contentType === "application/vnd.crown.receipt+cbor", `dynamic envelope → content-type`);

if (result5.payloadBytes) {
  const { decode: cborDecode } = await import("cbor-x");
  const decoded = cborDecode(result5.payloadBytes) as Record<string, unknown>;
  assert(decoded["snap-id"] === "test-snap-00000001", "dynamic envelope → payload snap-id");
  assert(decoded["receipt-hash"] === testPayload["receipt-hash"], "dynamic envelope → payload receipt-hash");
}

// --- Summary ---
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
