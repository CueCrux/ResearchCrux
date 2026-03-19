/**
 * Tests for crown-verify against proof gallery examples.
 *
 * Uses a simple test runner (no test framework dependency).
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { verifyReceipt, verifyChain } from "../verify.js";
import { buildCanonicalPayload, canonicalStringify } from "../canonical.js";
import { computeHash } from "../hash.js";
import type { CrownReceipt } from "../types.js";

const GALLERY = join(
  new URL(".", import.meta.url).pathname,
  "..",
  "..",
  "..",
  "proof-gallery"
);

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

// --- Test canonical JSON ---
console.log("Canonical JSON:");

assert(
  canonicalStringify({ b: 1, a: 2 }) === '{"a":2,"b":1}',
  "sorts top-level keys"
);

assert(
  canonicalStringify({ b: { d: 1, c: 2 }, a: 3 }) ===
    '{"a":3,"b":{"c":2,"d":1}}',
  "sorts nested keys"
);

assert(
  canonicalStringify({ a: null }) === '{"a":null}',
  "preserves null values"
);

assert(
  canonicalStringify({ a: [3, 1, 2] }) === '{"a":[3,1,2]}',
  "preserves array order"
);

// --- Test hash computation ---
console.log("\nHash computation:");

const testHash = computeHash("hello", "blake3");
assert(testHash.startsWith("blake3:"), "BLAKE3 hash has correct prefix");
assert(testHash.length > 10, "BLAKE3 hash has non-empty digest");

const sha256Hash = computeHash("hello", "sha256");
assert(sha256Hash.startsWith("sha256:"), "SHA256 hash has correct prefix");

// --- Test receipt verification against gallery examples ---
console.log("\nReceipt verification (proof gallery):");

function loadReceipt(filename: string): CrownReceipt {
  return JSON.parse(
    readFileSync(join(GALLERY, "examples", filename), "utf-8")
  );
}

// Test that canonical payload builds without error
for (const file of [
  "receipt-light.json",
  "receipt-verified.json",
  "receipt-audit.json",
]) {
  const receipt = loadReceipt(file);
  const payload = buildCanonicalPayload(receipt);
  assert(
    typeof payload.answerId === "string" && Array.isArray(payload.citations),
    `${file}: canonical payload builds correctly`
  );

  // Verify that computing a hash produces a consistent result
  const canonical = canonicalStringify(payload);
  const hash1 = computeHash(canonical, "blake3");
  const hash2 = computeHash(canonical, "blake3");
  assert(hash1 === hash2, `${file}: hash is deterministic`);
}

// --- Test end-to-end hash verification ---
console.log("\nEnd-to-end hash verification:");

const lightReceipt = loadReceipt("receipt-light.json");
const lightResult = verifyReceipt(lightReceipt);
assert(lightResult.valid, "receipt-light.json: full verification passes");
assert(lightResult.hashMatch, "receipt-light.json: hash matches");
assert(
  lightResult.signatureValid === null,
  "receipt-light.json: unsigned (signature null)"
);

// Signed examples have placeholder signatures — hash should match, sig should fail
for (const file of ["receipt-verified.json", "receipt-audit.json"]) {
  const receipt = loadReceipt(file);
  const result = verifyReceipt(receipt);
  assert(result.hashMatch, `${file}: hash matches stored receiptHash`);
  assert(
    result.signatureValid === false,
    `${file}: placeholder signature correctly rejected`
  );
}

// --- Test chain verification ---
console.log("\nChain verification:");

const chainData = JSON.parse(
  readFileSync(join(GALLERY, "examples", "receipt-chain-3-deep.json"), "utf-8")
);
const chainResult = verifyChain(chainData as { chain: CrownReceipt[] });

assert(chainResult.depth === 3, "chain has depth 3");

// Check chain linkage is correct
const chain = chainData.chain as CrownReceipt[];
assert(chain[0].parentSnapId === null, "chain root has null parentSnapId");
assert(
  chain[1].parentSnapId === chain[0].snapshotId,
  "chain[1] links to chain[0]"
);
assert(
  chain[2].parentSnapId === chain[1].snapshotId,
  "chain[2] links to chain[1]"
);

// --- Test redacted receipt ---
console.log("\nRedacted receipt:");

const redacted = JSON.parse(
  readFileSync(join(GALLERY, "redacted", "redacted-receipt.json"), "utf-8")
);
const redactedPayload = buildCanonicalPayload(redacted as CrownReceipt);
assert(
  typeof redactedPayload.answerId === "string",
  "redacted receipt: canonical payload builds"
);

// --- Summary ---
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
