/**
 * Canonical JSON serialisation as specified in CROWN Protocol v0.1, Section 3.1.
 *
 * Rules:
 * 1. All object keys sorted alphabetically at every nesting level.
 * 2. Arrays preserve insertion order.
 * 3. Null values are included (not omitted).
 * 4. Numbers use their JSON standard representation.
 */

export function canonicalStringify(value: unknown): string {
  return JSON.stringify(value, sortedReplacer);
}

function sortedReplacer(_key: string, value: unknown): unknown {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }
  const sorted: Record<string, unknown> = {};
  for (const k of Object.keys(value as Record<string, unknown>).sort()) {
    sorted[k] = (value as Record<string, unknown>)[k];
  }
  return sorted;
}

/**
 * Build the canonical receipt payload from a receipt, as specified in Section 3.2.
 *
 * The payload includes only the fields that contribute to the receipt hash.
 * Citations are derived from evidence records.
 */
export function buildCanonicalPayload(
  receipt: {
    answerId: string;
    mode: string;
    modeRequested?: string;
    queryHash: string;
    fusion: Record<string, unknown>;
    retrieval: Record<string, unknown>;
    selection: Record<string, unknown>;
    timings: Record<string, unknown>;
    generatedAt?: string;
    evidence: Array<{
      sourceId: string;
      quoteHash: string;
      role: string;
    }>;
  },
  options?: { includeCounterfactual?: boolean }
): Record<string, unknown> {
  // Build citations array from evidence records (support role only for citations)
  const citations = receipt.evidence
    .filter((e) => e.role === "support")
    .map((e) => ({
      id: e.sourceId,
      quoteHash: normaliseHashPrefix(e.quoteHash),
    }));

  // Build counterfactual from evidence records
  const counterfactualEvidence = receipt.evidence.filter(
    (e) => e.role === "counterfactual"
  );
  const counterfactual =
    counterfactualEvidence.length > 0
      ? counterfactualEvidence.map((e) => ({
          id: e.sourceId,
          quoteHash: normaliseHashPrefix(e.quoteHash),
        }))
      : null;

  const payload: Record<string, unknown> = {
    answerId: receipt.answerId,
    citations,
    counterfactual,
    fusion: receipt.fusion,
    generatedAt: receipt.generatedAt ?? null,
    mode: receipt.mode,
    modeRequested: receipt.modeRequested ?? receipt.mode,
    queryHash: receipt.queryHash,
    retrieval: receipt.retrieval,
    selection: receipt.selection,
    timings: receipt.timings,
  };

  return payload;
}

/**
 * Normalise hash prefixes as specified in Section 3.2.
 * Legacy SHA256 hashes without a prefix get `sha256:` prepended.
 */
function normaliseHashPrefix(hash: string): string {
  if (hash.startsWith("blake3:") || hash.startsWith("sha256:")) {
    return hash;
  }
  // Assume unprefixed hex is SHA256 (legacy format)
  if (/^[0-9a-f]{64}$/i.test(hash)) {
    return `sha256:${hash}`;
  }
  return hash;
}
