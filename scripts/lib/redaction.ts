/**
 * Allowlist-based redaction for CROWN receipts and proof packs.
 *
 * Only explicitly safe fields pass through. Everything else is stripped or
 * replaced with [REDACTED]. This prevents accidental content leaks.
 */

const SAFE_SCALARS = new Set([
  "receiptId",
  "snapshotId",
  "answerId",
  "mode",
  "modeRequested",
  "modeApplied",
  "receiptHash",
  "parentSnapId",
  "triggerActionReceiptId",
  "generatedAt",
  "queryHash",
  "provenanceOk",
  "signed",
]);

const SAFE_OBJECTS = new Set([
  "fusion",
  "retrieval",
  "timings",
  "signature",
  "selection",
  "counterfactual",
]);

const REDACT_IN_SELECTION = new Set(["citationIds", "coverage", "loadBearingCitations"]);

export interface RedactionMeta {
  level: "public" | "partial";
  redactedAt: string;
  redactedFields: string[];
}

export function redactReceipt(receipt: Record<string, unknown>): {
  redacted: Record<string, unknown>;
  meta: RedactionMeta;
} {
  const redacted: Record<string, unknown> = {};
  const redactedFields: string[] = [];

  for (const [key, value] of Object.entries(receipt)) {
    if (SAFE_SCALARS.has(key)) {
      redacted[key] = value;
    } else if (SAFE_OBJECTS.has(key)) {
      if (key === "selection" && value && typeof value === "object") {
        redacted[key] = redactSelection(value as Record<string, unknown>, redactedFields);
      } else if (key === "counterfactual" && value && typeof value === "object") {
        redacted[key] = redactCounterfactual(value as Record<string, unknown>, redactedFields);
      } else {
        redacted[key] = value;
      }
    } else if (key === "evidence" && Array.isArray(value)) {
      redacted[key] = value.map((ev) => redactEvidence(ev, redactedFields));
    } else {
      redactedFields.push(key);
    }
  }

  const meta: RedactionMeta = {
    level: "public",
    redactedAt: new Date().toISOString(),
    redactedFields,
  };

  redacted._redaction = meta;
  return { redacted, meta };
}

function redactSelection(
  sel: Record<string, unknown>,
  redactedFields: string[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(sel)) {
    if (REDACT_IN_SELECTION.has(key)) {
      if (Array.isArray(value)) {
        out[key] = value.map(() => "[REDACTED]");
      } else if (typeof value === "object" && value !== null) {
        out[key] = Object.fromEntries(
          Object.keys(value as Record<string, unknown>).map((k) => [k, ["[REDACTED]"]]),
        );
      }
      redactedFields.push(`selection.${key}`);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function redactCounterfactual(
  cf: Record<string, unknown>,
  redactedFields: string[],
): Record<string, unknown> {
  const out: Record<string, unknown> = { found: cf.found };
  if (cf.note) {
    out.note = "[REDACTED]";
    redactedFields.push("counterfactual.note");
  }
  if (Array.isArray(cf.citations)) {
    out.citations = (cf.citations as Array<Record<string, unknown>>).map((c) => ({
      id: "[REDACTED]",
      quoteHash: c.quoteHash, // hashes are safe
    }));
    redactedFields.push("counterfactual.citations.id");
  }
  return out;
}

function redactEvidence(
  ev: Record<string, unknown>,
  redactedFields: string[],
): Record<string, unknown> {
  // Keep: role, quoteHash, observedAt, scoreComponents
  // Redact: claimId, sourceId, chunkId, corpusId
  const out: Record<string, unknown> = {
    role: ev.role,
    quoteHash: ev.quoteHash,
    observedAt: ev.observedAt,
    scoreComponents: ev.scoreComponents,
  };

  for (const field of ["claimId", "sourceId", "chunkId", "corpusId"]) {
    if (ev[field] !== undefined && ev[field] !== null) {
      out[field] = "[REDACTED]";
      if (!redactedFields.includes(`evidence.${field}`)) {
        redactedFields.push(`evidence.${field}`);
      }
    }
  }

  return out;
}
