/**
 * CROWN receipt chain verification — Section 5.3 and 5.5 of the protocol spec.
 *
 * This module implements the full independent verification procedure:
 * 1. Reconstruct the canonical payload from receipt fields.
 * 2. Compute the hash (BLAKE3 or SHA256, auto-detected).
 * 3. Compare against the stored receipt hash.
 * 4. Verify the ed25519 signature if present.
 * 5. Verify chain linkage (parent_snap_id → preceding receipt's snapshot_id).
 */

import type {
  CrownReceipt,
  VerifyResult,
  ChainVerifyResult,
  ReceiptBreak,
} from "./types.js";
import { buildCanonicalPayload, canonicalStringify } from "./canonical.js";
import { computeHash, detectAlgorithm } from "./hash.js";
import { verifySignature } from "./signature.js";

/**
 * Verify a single CROWN receipt.
 *
 * Checks hash integrity and signature validity.
 * Does NOT check chain linkage (use verifyChain for that).
 */
export function verifyReceipt(receipt: CrownReceipt): VerifyResult {
  const breaks: ReceiptBreak[] = [];

  // Step 1-2: Reconstruct canonical payload and compute hash
  const payload = buildCanonicalPayload(receipt);
  const canonicalJson = canonicalStringify(payload);
  const algorithm = detectAlgorithm(receipt.receiptHash);

  let computedHash: string;
  if (algorithm === "unknown") {
    breaks.push({
      receiptId: receipt.receiptId,
      snapshotId: receipt.snapshotId,
      reason: `Unknown hash algorithm prefix in receiptHash: ${receipt.receiptHash}`,
    });
    computedHash = "";
  } else {
    computedHash = computeHash(canonicalJson, algorithm);
  }

  // Step 3: Compare hashes
  const hashMatch = computedHash === receipt.receiptHash;
  if (!hashMatch && algorithm !== "unknown") {
    breaks.push({
      receiptId: receipt.receiptId,
      snapshotId: receipt.snapshotId,
      reason: "Hash mismatch: recomputed hash does not match stored receiptHash",
      expected: receipt.receiptHash,
      actual: computedHash,
    });
  }

  // Step 4: Verify signature if present
  let signatureValid: boolean | null = null;
  if (receipt.signature) {
    signatureValid = verifySignature(
      receipt.signature.sigB64,
      receipt.receiptHash,
      receipt.signature.pubB64
    );
    if (!signatureValid) {
      breaks.push({
        receiptId: receipt.receiptId,
        snapshotId: receipt.snapshotId,
        reason: "Signature verification failed",
      });
    }
  }

  return {
    valid: breaks.length === 0,
    receiptId: receipt.receiptId,
    hashMatch,
    signatureValid,
    breaks,
  };
}

/**
 * Verify a CROWN receipt chain.
 *
 * Accepts either:
 * - An array of receipts (ordered root → latest)
 * - A chain wrapper object { chain: CrownReceipt[] }
 *
 * Verifies each receipt individually, then checks chain linkage.
 */
export function verifyChain(
  input: CrownReceipt[] | { chain: CrownReceipt[] }
): ChainVerifyResult {
  const receipts = Array.isArray(input) ? input : input.chain;
  const allBreaks: ReceiptBreak[] = [];
  const results: VerifyResult[] = [];

  // Verify each receipt individually
  for (const receipt of receipts) {
    const result = verifyReceipt(receipt);
    results.push(result);
    allBreaks.push(...result.breaks);
  }

  // Verify chain linkage (Section 5.5, step 3)
  for (let i = 1; i < receipts.length; i++) {
    const current = receipts[i];
    const previous = receipts[i - 1];

    if (current.parentSnapId !== previous.snapshotId) {
      const linkBreak: ReceiptBreak = {
        receiptId: current.receiptId,
        snapshotId: current.snapshotId,
        reason: `Chain linkage broken: parentSnapId "${current.parentSnapId}" does not match previous receipt snapshotId "${previous.snapshotId}"`,
        expected: previous.snapshotId,
        actual: current.parentSnapId ?? "null",
      };
      allBreaks.push(linkBreak);
    }
  }

  // Verify root receipt has null parentSnapId
  if (receipts.length > 0 && receipts[0].parentSnapId != null) {
    allBreaks.push({
      receiptId: receipts[0].receiptId,
      snapshotId: receipts[0].snapshotId,
      reason: `Chain root has non-null parentSnapId: "${receipts[0].parentSnapId}"`,
    });
  }

  return {
    valid: allBreaks.length === 0,
    depth: receipts.length,
    receipts: results,
    breaks: allBreaks,
  };
}
