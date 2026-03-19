/**
 * CROWN Receipt Protocol v0.1 — Type definitions for independent verification.
 *
 * These types mirror the receipt schema from Section 2 of the protocol spec,
 * using the JSON API field names (camelCase) as used in the proof gallery examples.
 */

export interface CrownEvidence {
  claimId: string;
  sourceId: string;
  role: "support" | "counterfactual";
  quoteHash: string;
  observedAt: string;
  scoreComponents?: Record<string, number>;
  chunkId?: string | null;
  corpusId?: string | null;
}

export interface CrownSignature {
  sigB64: string;
  kid: string;
  pubB64: string;
  signedAt?: string;
}

export interface CrownReceipt {
  receiptId: string;
  snapshotId: string;
  answerId: string;
  mode: "light" | "verified" | "audit";
  modeRequested?: string;
  queryHash: string;
  fusion: Record<string, unknown>;
  retrieval: Record<string, unknown>;
  selection: Record<string, unknown>;
  timings: Record<string, unknown>;
  receiptHash: string;
  parentSnapId?: string | null;
  triggerActionReceiptId?: string | null;
  signature?: CrownSignature | null;
  evidence: CrownEvidence[];
  generatedAt?: string;
}

export interface ReceiptBreak {
  receiptId: string;
  snapshotId: string;
  reason: string;
  expected?: string;
  actual?: string;
}

export interface VerifyResult {
  valid: boolean;
  receiptId: string;
  hashMatch: boolean;
  signatureValid: boolean | null;
  breaks: ReceiptBreak[];
}

export interface ChainVerifyResult {
  valid: boolean;
  depth: number;
  receipts: VerifyResult[];
  breaks: ReceiptBreak[];
}
