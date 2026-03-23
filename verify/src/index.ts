/**
 * crown-verify — Standalone CROWN receipt chain verifier
 *
 * Verifies CROWN receipt chains as specified in the CROWN Receipt Protocol v0.1,
 * Section 5.5 (Independent Verification). No CueCrux dependencies required.
 *
 * Dependencies: @noble/hashes (BLAKE3), @noble/curves (ed25519)
 */

export { verifyReceipt, verifyChain } from "./verify.js";
export { verifyCoseSign1 } from "./cose.js";
export type {
  CrownReceipt,
  CrownEvidence,
  CrownSignature,
  VerifyResult,
  ChainVerifyResult,
  ReceiptBreak,
} from "./types.js";
export type { CoseVerifyResult } from "./cose.js";
