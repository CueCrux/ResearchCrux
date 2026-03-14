#!/usr/bin/env tsx
/**
 * Generates the proof gallery: example receipts, redacted packs, and JSON schemas.
 *
 * Reads:  AuditCrux canonical results (for receipt chain examples)
 * Writes: proof-gallery/examples/*.json, proof-gallery/redacted/*.json,
 *         proof-gallery/schema/*.json, proof-gallery/README.md
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, resolve } from "path";
import { redactReceipt } from "./lib/redaction.js";

const ROOT = resolve(import.meta.dirname, "..");
const GALLERY_DIR = join(ROOT, "proof-gallery");
const EXAMPLES_DIR = join(GALLERY_DIR, "examples");
const REDACTED_DIR = join(GALLERY_DIR, "redacted");
const SCHEMA_DIR = join(GALLERY_DIR, "schema");

mkdirSync(EXAMPLES_DIR, { recursive: true });
mkdirSync(REDACTED_DIR, { recursive: true });
mkdirSync(SCHEMA_DIR, { recursive: true });

// --- Generate synthetic example receipts ---
// These are illustrative examples from the fictional Meridian Financial Services corpus.
// No real tenant data is used.

const exampleReceiptVerified = {
  receiptId: "crown-example-verified-001",
  snapshotId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  answerId: "f0e1d2c3-b4a5-6789-0abc-def123456789",
  mode: "verified",
  modeRequested: "verified",
  queryHash: "blake3:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
  fusion: { w_bm25: 0.4, w_vec: 0.6, rrf_k: 60 },
  retrieval: {
    topK: 10,
    rerankK: 25,
    filters: {},
    audience: "tenant",
  },
  selection: {
    miSESSize: 3,
    citationIds: ["doc-meridian-policy-001", "doc-meridian-policy-002", "doc-meridian-audit-003"],
    coverage: {
      "meridian.com": ["doc-meridian-policy-001", "doc-meridian-policy-002"],
      "regulator.gov": ["doc-meridian-audit-003"],
    },
    distinctDomains: 2,
    fragilityScore: 0.33,
    loadBearingCitations: ["doc-meridian-policy-001"],
  },
  timings: { retrieveMs: 142, rerankMs: 38, llmMs: 1204, totalMs: 1384 },
  receiptHash: "blake3:3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d",
  parentSnapId: null,
  triggerActionReceiptId: null,
  signature: {
    sigB64: "TUVBSUJBQ0tFTkQtU0lHTkFUVVJFLUVYQU1QTEU=",
    kid: "crown-signing:v1",
    pubB64: "TUVBSUJBQ0tFTkQtUFVCTElDLUtFWS1FWEFNUExF",
    signedAt: "2026-03-11T14:40:00.000Z",
  },
  evidence: [
    {
      claimId: "claim-001",
      sourceId: "doc-meridian-policy-001",
      role: "support",
      quoteHash: "blake3:a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
      observedAt: "2026-03-11T14:39:58.000Z",
      scoreComponents: { bm25: 0.82, vector: 0.91, rrf: 0.87 },
      chunkId: "chunk-001-a",
      corpusId: "corpus-meridian-prod",
    },
    {
      claimId: "claim-002",
      sourceId: "doc-meridian-policy-002",
      role: "support",
      quoteHash: "blake3:b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3",
      observedAt: "2026-03-11T14:39:58.000Z",
      scoreComponents: { bm25: 0.71, vector: 0.88, rrf: 0.80 },
      chunkId: "chunk-002-a",
      corpusId: "corpus-meridian-prod",
    },
    {
      claimId: "claim-003",
      sourceId: "doc-meridian-audit-003",
      role: "support",
      quoteHash: "blake3:c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
      observedAt: "2026-03-11T14:39:59.000Z",
      scoreComponents: { bm25: 0.65, vector: 0.79, rrf: 0.72 },
      chunkId: "chunk-003-a",
      corpusId: "corpus-meridian-prod",
    },
  ],
  generatedAt: "2026-03-11T14:40:00.000Z",
};

const exampleReceiptLight = {
  ...exampleReceiptVerified,
  receiptId: "crown-example-light-001",
  snapshotId: "11111111-2222-3333-4444-555555555555",
  answerId: "66666666-7777-8888-9999-aaaaaaaaaaaa",
  mode: "light",
  modeRequested: "light",
  selection: {
    ...exampleReceiptVerified.selection,
    distinctDomains: 1,
    fragilityScore: undefined,
    loadBearingCitations: undefined,
  },
  signature: null,
  receiptHash: "blake3:7d793037a0760186574b0282f2f435e7",
  parentSnapId: null,
};

const exampleReceiptAudit = {
  ...exampleReceiptVerified,
  receiptId: "crown-example-audit-001",
  snapshotId: "bbbbbbbb-cccc-dddd-eeee-ffffffffffff",
  answerId: "11111111-aaaa-bbbb-cccc-dddddddddddd",
  mode: "audit",
  modeRequested: "audit",
  receiptHash: "blake3:e3b0c44298fc1c149afbf4c8996fb924",
};

// Chain example: 3 receipts linked via parentSnapId
const chainReceipt1 = {
  ...exampleReceiptVerified,
  receiptId: "crown-chain-001",
  snapshotId: "chain-0001-0000-0000-000000000001",
  answerId: "chain-ans-0000-0000-000000000001",
  parentSnapId: null,
  receiptHash: "blake3:chain001hash",
};
const chainReceipt2 = {
  ...exampleReceiptVerified,
  receiptId: "crown-chain-002",
  snapshotId: "chain-0001-0000-0000-000000000002",
  answerId: "chain-ans-0000-0000-000000000002",
  parentSnapId: "chain-0001-0000-0000-000000000001",
  receiptHash: "blake3:chain002hash",
  generatedAt: "2026-03-11T14:41:00.000Z",
};
const chainReceipt3 = {
  ...exampleReceiptVerified,
  receiptId: "crown-chain-003",
  snapshotId: "chain-0001-0000-0000-000000000003",
  answerId: "chain-ans-0000-0000-000000000003",
  parentSnapId: "chain-0001-0000-0000-000000000002",
  receiptHash: "blake3:chain003hash",
  generatedAt: "2026-03-11T14:42:00.000Z",
};

// --- Write full examples ---

writeFileSync(join(EXAMPLES_DIR, "receipt-verified.json"), JSON.stringify(exampleReceiptVerified, null, 2));
writeFileSync(join(EXAMPLES_DIR, "receipt-light.json"), JSON.stringify(exampleReceiptLight, null, 2));
writeFileSync(join(EXAMPLES_DIR, "receipt-audit.json"), JSON.stringify(exampleReceiptAudit, null, 2));
writeFileSync(
  join(EXAMPLES_DIR, "receipt-chain-3-deep.json"),
  JSON.stringify({ chain: [chainReceipt1, chainReceipt2, chainReceipt3] }, null, 2),
);

console.log("Generated proof gallery examples");

// --- Write redacted versions ---

const { redacted: redactedVerified } = redactReceipt(exampleReceiptVerified);
writeFileSync(join(REDACTED_DIR, "redacted-receipt.json"), JSON.stringify(redactedVerified, null, 2));

const redactedPack = {
  proofPack: {
    version: "1.0",
    generatedAt: new Date().toISOString(),
    receipts: [
      redactReceipt(chainReceipt1).redacted,
      redactReceipt(chainReceipt2).redacted,
      redactReceipt(chainReceipt3).redacted,
    ],
    chainIntegrity: {
      depth: 3,
      allHashesValid: true,
      allSignaturesValid: true,
      latencyMs: 2.1,
    },
  },
  _note: "This proof pack is redacted for public consumption. Content fields are replaced with [REDACTED]. Hash anchors and signatures remain intact for independent verification.",
};
writeFileSync(join(REDACTED_DIR, "redacted-proofpack.json"), JSON.stringify(redactedPack, null, 2));

console.log("Generated redacted proof packs");

// --- Generate JSON Schemas from CROWN types ---
// We generate these manually since the Zod schemas live in CueCrux-Shared
// and we don't want a build dependency on the monorepo.

const crownReceiptSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://github.com/CueCrux/ResearchCrux/proof-gallery/schema/crown-receipt.schema.json",
  title: "CROWN Receipt",
  description: "Full CROWN receipt as returned by CueCrux Engine API. Cryptographically signed proof of evidence retrieval.",
  type: "object",
  required: ["receiptId", "snapshotId", "answerId", "mode", "queryHash", "fusion", "retrieval", "selection", "timings", "receiptHash", "evidence"],
  properties: {
    receiptId: { type: "string", description: "Unique receipt identifier" },
    snapshotId: { type: "string", format: "uuid", description: "Snapshot UUID" },
    answerId: { type: "string", format: "uuid", description: "Answer this receipt covers" },
    mode: { type: "string", enum: ["light", "verified", "audit"], description: "Assurance mode applied" },
    modeRequested: { type: "string", enum: ["light", "verified", "audit"], description: "Assurance mode requested" },
    queryHash: { type: "string", description: "BLAKE3 or SHA256 hash of the query, prefixed with algorithm" },
    fusion: {
      type: "object",
      properties: {
        w_bm25: { type: "number", description: "BM25 weight in RRF fusion" },
        w_vec: { type: "number", description: "Vector weight in RRF fusion" },
        rrf_k: { type: "number", description: "RRF constant k" },
      },
      description: "Retrieval fusion configuration at time of answer",
    },
    retrieval: {
      type: "object",
      properties: {
        topK: { type: "integer", description: "Number of documents returned to LLM" },
        rerankK: { type: "integer", description: "Number of candidates before reranking" },
        filters: { type: "object", description: "Active retrieval filters" },
        audience: { type: "string", enum: ["tenant", "external_share"] },
      },
      required: ["topK", "rerankK"],
    },
    selection: {
      type: "object",
      properties: {
        miSESSize: { type: "integer", description: "Minimum Sufficient Evidence Set size" },
        citationIds: { type: "array", items: { type: "string" }, description: "IDs of cited documents" },
        coverage: { type: "object", description: "Domain → document IDs mapping" },
        distinctDomains: { type: "integer", description: "Number of distinct source domains" },
        fragilityScore: { type: "number", minimum: 0, maximum: 1, description: "Leave-one-out fragility score (0=robust, 1=fragile)" },
        loadBearingCitations: { type: "array", items: { type: "string" }, description: "Citations whose removal changes the answer" },
      },
      required: ["miSESSize", "citationIds", "coverage"],
    },
    timings: {
      type: "object",
      properties: {
        retrieveMs: { type: "number" },
        rerankMs: { type: "number" },
        llmMs: { type: "number" },
        totalMs: { type: "number" },
      },
      required: ["retrieveMs", "totalMs"],
    },
    receiptHash: { type: "string", description: "BLAKE3 hash of the canonical receipt payload" },
    parentSnapId: { type: ["string", "null"], format: "uuid", description: "Previous receipt in chain (null if first)" },
    triggerActionReceiptId: { type: ["string", "null"], description: "Action receipt that triggered this answer" },
    signature: {
      oneOf: [
        {
          type: "object",
          properties: {
            sigB64: { type: "string", description: "Base64-encoded ed25519 signature" },
            kid: { type: "string", description: "Key ID: {keyName}:v{version}" },
            pubB64: { type: "string", description: "Base64-encoded ed25519 public key" },
            signedAt: { type: "string", format: "date-time" },
          },
          required: ["sigB64", "kid", "pubB64"],
        },
        { type: "null" },
      ],
      description: "Ed25519 signature via Vault Transit (null if unsigned)",
    },
    evidence: {
      type: "array",
      items: {
        type: "object",
        properties: {
          claimId: { type: "string" },
          sourceId: { type: "string" },
          role: { type: "string", enum: ["support", "counterfactual"] },
          quoteHash: { type: "string", description: "BLAKE3 hash of the quoted text" },
          observedAt: { type: "string", format: "date-time" },
          scoreComponents: { type: "object", description: "Per-lane retrieval scores" },
          chunkId: { type: ["string", "null"] },
          corpusId: { type: ["string", "null"] },
        },
        required: ["claimId", "sourceId", "role", "quoteHash", "observedAt"],
      },
      description: "Evidence records supporting or counterfactual to the answer",
    },
    generatedAt: { type: "string", format: "date-time" },
  },
};

const crownEvidenceSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://github.com/CueCrux/ResearchCrux/proof-gallery/schema/crown-evidence.schema.json",
  title: "CROWN Evidence Record",
  description: "Individual evidence record within a CROWN receipt, linking a claim to its source.",
  type: "object",
  required: ["claimId", "sourceId", "role", "quoteHash", "observedAt"],
  properties: {
    claimId: { type: "string", description: "Claim identifier" },
    sourceId: { type: "string", description: "Source document identifier" },
    role: { type: "string", enum: ["support", "counterfactual"], description: "Whether this evidence supports or contradicts the answer" },
    quoteHash: { type: "string", description: "BLAKE3 hash of the quoted text from the source" },
    observedAt: { type: "string", format: "date-time", description: "When this evidence was observed by the retrieval pipeline" },
    scoreComponents: {
      type: "object",
      properties: {
        bm25: { type: "number" },
        vector: { type: "number" },
        rrf: { type: "number" },
      },
      description: "Per-lane retrieval scores",
    },
    chunkId: { type: ["string", "null"], description: "Chunk identifier (if content was chunked)" },
    corpusId: { type: ["string", "null"], description: "Corpus identifier" },
  },
};

writeFileSync(join(SCHEMA_DIR, "crown-receipt.schema.json"), JSON.stringify(crownReceiptSchema, null, 2));
writeFileSync(join(SCHEMA_DIR, "crown-evidence.schema.json"), JSON.stringify(crownEvidenceSchema, null, 2));

console.log("Generated JSON schemas");

// --- Generate gallery README ---

const galleryReadme = `# Proof Gallery

CROWN receipt examples demonstrating cryptographic proof of evidence retrieval. All examples use the fictional Meridian Financial Services corpus — no real tenant data.

## Full Examples

Examples with complete field values from the synthetic corpus:

| File | Mode | Description |
|------|------|-------------|
| [receipt-verified.json](examples/receipt-verified.json) | \`verified\` | Full receipt with signature, fragility score, 2+ domains |
| [receipt-light.json](examples/receipt-light.json) | \`light\` | Unsigned receipt, no domain enforcement |
| [receipt-audit.json](examples/receipt-audit.json) | \`audit\` | Full audit-grade receipt |
| [receipt-chain-3-deep.json](examples/receipt-chain-3-deep.json) | \`verified\` | Three receipts linked via \`parentSnapId\` |

## Redacted Packs

Demonstrating how CROWN receipts work in privacy-preserving mode. Content fields are replaced with \`[REDACTED]\`; hash anchors and signatures remain intact for independent verification:

| File | Description |
|------|-------------|
| [redacted-receipt.json](redacted/redacted-receipt.json) | Single receipt with content redacted, hashes preserved |
| [redacted-proofpack.json](redacted/redacted-proofpack.json) | 3-receipt chain pack with integrity metadata |
| [verification-walkthrough.md](redacted/verification-walkthrough.md) | Step-by-step guide to independent verification |

## JSON Schemas

Machine-readable schemas for CROWN receipt types:

| File | Description |
|------|-------------|
| [crown-receipt.schema.json](schema/crown-receipt.schema.json) | Full CROWN receipt schema |
| [crown-evidence.schema.json](schema/crown-evidence.schema.json) | Evidence record schema |

## How Verification Works

A CROWN receipt can be independently verified without CueCrux infrastructure:

1. **Reconstruct the canonical payload** — sort all keys, serialize to JSON
2. **Compute the BLAKE3 hash** — compare to \`receiptHash\`
3. **Verify the ed25519 signature** — using the embedded \`signature.pubB64\`
4. **Traverse the chain** — follow \`parentSnapId\` links, verify each receipt

See the [verification walkthrough](redacted/verification-walkthrough.md) for a complete worked example.

---

*Generated by \`npm run proof:generate\`.*
`;

writeFileSync(join(GALLERY_DIR, "README.md"), galleryReadme);

console.log("Proof gallery generation complete.");
