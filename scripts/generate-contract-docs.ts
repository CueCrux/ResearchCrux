#!/usr/bin/env tsx
/**
 * Generates API and MCP contract documentation for ResearchCrux.
 *
 * Writes: contracts/README.md, contracts/mcp/tool-catalog.md,
 *         contracts/mcp/proof-tools.md, contracts/api/proof-surface.md,
 *         contracts/api/crown-receipt-api.md
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, resolve } from "path";
import { mdTable } from "./lib/markdown-writer.js";

const ROOT = resolve(import.meta.dirname, "..");
const CONTRACTS_DIR = join(ROOT, "contracts");

mkdirSync(join(CONTRACTS_DIR, "api"), { recursive: true });
mkdirSync(join(CONTRACTS_DIR, "mcp"), { recursive: true });

// --- MCP Tool Inventory ---
// Extracted from VaultCrux/apps/mcp/src/tools/*.ts METHODS sets

interface ToolDomain {
  name: string;
  file: string;
  methods: { name: string; description: string; params: string }[];
}

const domains: ToolDomain[] = [
  {
    name: "Proof",
    file: "proof.ts",
    methods: [
      { name: "proof_document", description: "Submit a document for proof generation. Creates a proof job that processes the document, generates CROWN receipts for each answer chunk.", params: "`artefact_id` (required), `mode` (`light`|`verified`|`audit`), `metadata` (optional object)" },
      { name: "get_proof_status", description: "Check the status of a proof job. Returns current state (queued, processing, completed, failed) and progress.", params: "`proof_job_id` (required)" },
      { name: "get_proof_chunks", description: "Retrieve processed chunks from a completed proof job. Supports cursor-based pagination.", params: "`proof_job_id` (required), `cursor` (optional)" },
      { name: "get_proof_receipt", description: "Retrieve the CROWN receipt for a specific answer. Returns the full receipt with hash, signature, and evidence.", params: "`answer_id` (required)" },
      { name: "get_proofpack", description: "Retrieve a complete proof pack for a receipt. Bundles the receipt, evidence records, and chain metadata.", params: "`receipt_id` (required)" },
    ],
  },
  {
    name: "Retrieval",
    file: "retrieval.ts",
    methods: [
      { name: "query_vault", description: "Query the knowledge vault with natural language. Returns ranked results with CROWN receipt provenance.", params: "`query` (required), `top_k`, `mode`, `filters`" },
      { name: "get_journal", description: "Retrieve the answer journal for a session. Shows historical queries and answers.", params: "`session_id`, `limit`, `offset`" },
      { name: "action_journal.query", description: "Query the action journal for receipted actions taken by agents.", params: "`query`, `limit`" },
      { name: "get_stale_pins", description: "Retrieve pinned answers whose underlying evidence has changed.", params: "`limit`" },
      { name: "get_session_context", description: "Get accumulated context for the current session.", params: "`session_id`" },
    ],
  },
  {
    name: "Watch",
    file: "watch.ts",
    methods: [
      { name: "watch_answer", description: "Subscribe to confidence drift monitoring for an answer. WatchCrux tracks evidence changes.", params: "`answer_id` (required), `threshold`" },
      { name: "unwatch_answer", description: "Remove a watch subscription.", params: "`watch_id` (required)" },
      { name: "get_watches", description: "List active watches for the current tenant.", params: "`limit`, `offset`" },
      { name: "get_watch_alerts", description: "Retrieve alerts triggered by watched answers whose confidence has drifted.", params: "`limit`, `since`" },
    ],
  },
  {
    name: "Intel",
    file: "intel.ts",
    methods: [
      { name: "query_with_threshold", description: "Query with explicit confidence threshold. Only returns results meeting the threshold.", params: "`query`, `threshold`" },
      { name: "get_passport", description: "Retrieve an answer passport — portable proof of provenance.", params: "`answer_id`" },
      { name: "verify_passport", description: "Verify an answer passport's integrity and chain.", params: "`passport`" },
      { name: "register_belief", description: "Register a belief (agent assertion) grounded in evidence.", params: "`statement`, `evidence_ids`" },
      { name: "get_beliefs", description: "Retrieve registered beliefs.", params: "`limit`, `filter`" },
      { name: "diff_receipts", description: "Compare two CROWN receipts to identify evidence differences.", params: "`receipt_id_a`, `receipt_id_b`" },
      { name: "get_blast_radius", description: "Estimate the impact of a document change on existing answers.", params: "`document_id`" },
      { name: "get_break_analysis", description: "Analyze which answers would break if specific evidence were removed.", params: "`evidence_ids`" },
      { name: "get_counterfactual_summary", description: "Summarize counterfactual evidence considered but not used.", params: "`answer_id`" },
      { name: "explain_last_answer", description: "Get a natural language explanation of the last answer's evidence basis.", params: "(none)" },
      { name: "get_domain_affinity", description: "Show which knowledge domains the tenant most frequently queries.", params: "`limit`" },
      { name: "annotate_session", description: "Add metadata annotations to a session.", params: "`session_id`, `annotations`" },
      { name: "get_knowledge_gaps", description: "Identify areas where the corpus lacks coverage.", params: "`query`" },
      { name: "get_daily_briefing", description: "Get a daily briefing of evidence changes and watch alerts.", params: "(none)" },
      { name: "set_policy", description: "Set retrieval policy (e.g., minimum assurance mode, domain requirements).", params: "`policy`" },
      { name: "get_active_policy", description: "Retrieve the current retrieval policy.", params: "(none)" },
      { name: "schedule_recheck", description: "Schedule a recheck of an answer against current evidence.", params: "`answer_id`, `when`" },
      { name: "pin_receipt", description: "Pin a receipt for long-term retention.", params: "`receipt_id`" },
      { name: "get_trust_level", description: "Get the computed trust level for a source or domain.", params: "`source_id`" },
      { name: "tip_agent", description: "Tip an agent for a helpful response (economy integration).", params: "`agent_id`, `amount`" },
      { name: "create_coalition", description: "Create a multi-agent coalition for collaborative reasoning.", params: "`name`, `agent_ids`" },
      { name: "join_coalition", description: "Join an existing coalition.", params: "`coalition_id`" },
      { name: "create_handoff_package", description: "Create a handoff package for transferring context between agents.", params: "`session_id`, `context`" },
      { name: "accept_handoff_package", description: "Accept a handoff package from another agent.", params: "`package_id`" },
      { name: "set_reasoning_profile", description: "Set the reasoning profile (controls retrieval strategy and evidence standards).", params: "`profile`" },
      { name: "get_reasoning_profile", description: "Get the current reasoning profile.", params: "(none)" },
      { name: "find_contradictions", description: "Find contradictions in the evidence corpus.", params: "`query`" },
      { name: "forecast_obsolescence", description: "Predict which documents are likely to become stale.", params: "`limit`" },
    ],
  },
  {
    name: "Feedback",
    file: "feedback.ts",
    methods: [
      { name: "submit_feature_request", description: "Submit a feature request from within the MCP session.", params: "`title`, `description`" },
      { name: "vote_feature_request", description: "Vote on an existing feature request.", params: "`request_id`" },
      { name: "get_feature_requests", description: "List feature requests.", params: "`limit`, `status`" },
      { name: "declare_revenue_willingness", description: "Declare willingness to pay for a feature.", params: "`request_id`, `amount`" },
      { name: "submit_feedback_survey", description: "Submit a feedback survey.", params: "`survey`" },
      { name: "respond_to_survey", description: "Respond to a feedback survey.", params: "`survey_id`, `responses`" },
    ],
  },
  {
    name: "Economy",
    file: "economy.ts",
    methods: [
      { name: "get_balance", description: "Get the current credit balance for the tenant.", params: "(none)" },
      { name: "get_credit_balance", description: "Get detailed credit balance breakdown.", params: "(none)" },
      { name: "get_escrow_holds", description: "List active escrow holds.", params: "`limit`" },
      { name: "get_credit_escrow", description: "Get escrow details for a specific hold.", params: "`escrow_id`" },
      { name: "get_spend_receipt", description: "Get a spend receipt for a completed transaction.", params: "`transaction_id`" },
      { name: "get_pricing", description: "Get current pricing information.", params: "(none)" },
      { name: "get_economy_dashboard", description: "Get economy dashboard with usage and spend overview.", params: "(none)" },
      { name: "convert_credits_to_discount", description: "Convert accumulated credits to a discount.", params: "`amount`" },
      { name: "get_subscription_discount_preview", description: "Preview discount from credit conversion.", params: "`amount`" },
      { name: "tip_platform", description: "Tip the platform (appreciation/revenue signal).", params: "`amount`, `message`" },
      { name: "browse_bundles", description: "Browse available credit bundles.", params: "(none)" },
      { name: "purchase_bundle", description: "Purchase a credit bundle.", params: "`bundle_id`" },
    ],
  },
  {
    name: "Organization",
    file: "org.ts",
    methods: [
      { name: "list_seats", description: "List team seats for the tenant.", params: "`limit`, `offset`" },
      { name: "invite_seat", description: "Invite a new team member.", params: "`email`, `role`" },
      { name: "change_seat_role", description: "Change a team member's role.", params: "`seat_id`, `role`" },
      { name: "revoke_seat", description: "Revoke a team member's access.", params: "`seat_id`" },
    ],
  },
  {
    name: "Public",
    file: "public.ts",
    methods: [
      { name: "register_agent", description: "Register a new agent identity.", params: "`name`, `capabilities`" },
      { name: "request_sponsor", description: "Request sponsorship for agent credits.", params: "`agent_id`, `reason`" },
    ],
  },
];

// --- Generate tool catalog ---

const catalogLines: string[] = [];
catalogLines.push("# MCP Tool Catalog");
catalogLines.push("");
catalogLines.push("Complete inventory of MCP tools exposed by VaultCrux. Tools are organized by domain.");
catalogLines.push("");

// Summary table
const summaryRows = domains.map((d) => [
  d.name,
  `\`${d.file}\``,
  String(d.methods.length),
  d.methods.map((m) => `\`${m.name}\``).join(", "),
]);
catalogLines.push(mdTable(["Domain", "Source", "Tools", "Methods"], summaryRows));
catalogLines.push("");

// Total count
const totalTools = domains.reduce((sum, d) => sum + d.methods.length, 0);
catalogLines.push(`**Total: ${totalTools} tools across ${domains.length} domains.**`);
catalogLines.push("");

// Per-domain sections
for (const domain of domains) {
  catalogLines.push(`## ${domain.name}`);
  catalogLines.push("");
  catalogLines.push(`Source: \`VaultCrux/apps/mcp/src/tools/${domain.file}\``);
  catalogLines.push("");

  const rows = domain.methods.map((m) => [
    `\`${m.name}\``,
    m.description,
    m.params,
  ]);
  catalogLines.push(mdTable(["Method", "Description", "Parameters"], rows));
  catalogLines.push("");
}

catalogLines.push("---");
catalogLines.push("");
catalogLines.push("*Generated by `npm run contracts:generate`.*");

writeFileSync(join(CONTRACTS_DIR, "mcp", "tool-catalog.md"), catalogLines.join("\n"));
console.log("Generated MCP tool catalog");

// --- Generate proof tools detail page ---

const proofDomain = domains.find((d) => d.name === "Proof")!;
const proofLines: string[] = [];
proofLines.push("# Proof MCP Tools");
proofLines.push("");
proofLines.push("Detailed documentation for the Proof domain MCP tools. These tools manage the proof lifecycle: submitting documents for proof, checking status, retrieving receipts and proof packs.");
proofLines.push("");

for (const method of proofDomain.methods) {
  proofLines.push(`## \`${method.name}\``);
  proofLines.push("");
  proofLines.push(method.description);
  proofLines.push("");
  proofLines.push("**Parameters:**");
  proofLines.push("");
  proofLines.push(method.params);
  proofLines.push("");

  // Add endpoint mapping
  const endpointMap: Record<string, string> = {
    proof_document: "POST /v1/proof/jobs",
    get_proof_status: "GET /v1/proof/jobs/:proofJobId",
    get_proof_chunks: "GET /v1/proof/jobs/:proofJobId/chunks",
    get_proof_receipt: "GET /v1/proof/answers/:answerId/receipt",
    get_proofpack: "GET /v1/proof/receipts/:receiptId/proofpack",
  };

  if (endpointMap[method.name]) {
    proofLines.push(`**API Endpoint:** \`${endpointMap[method.name]}\``);
    proofLines.push("");
  }
}

proofLines.push("---");
proofLines.push("");
proofLines.push("See also: [CROWN Receipt Protocol](../../protocol/crown-receipt-protocol-v0.1.md) | [JSON Schema](../../proof-gallery/schema/crown-receipt.schema.json) | [Tool Catalog](tool-catalog.md)");
proofLines.push("");
proofLines.push("*Generated by `npm run contracts:generate`.*");

writeFileSync(join(CONTRACTS_DIR, "mcp", "proof-tools.md"), proofLines.join("\n"));
console.log("Generated proof tools documentation");

// --- Generate API proof surface ---

const apiLines: string[] = [];
apiLines.push("# Proof API Surface");
apiLines.push("");
apiLines.push("HTTP API endpoints for the CROWN proof system. All endpoints require authentication via API key or session token.");
apiLines.push("");

const endpoints = [
  {
    method: "POST",
    path: "/v1/proof/jobs",
    description: "Create a new proof job",
    body: "{ tenantId, agentId, artefact_id, mode, idempotencyKey?, metadata? }",
    response: "{ id, status, createdAt }",
  },
  {
    method: "GET",
    path: "/v1/proof/jobs/:proofJobId",
    description: "Get proof job status",
    body: "—",
    response: "{ id, status, progress, chunks?, createdAt, completedAt? }",
  },
  {
    method: "GET",
    path: "/v1/proof/jobs/:proofJobId/chunks",
    description: "Get proof chunks (paginated)",
    body: "—",
    response: "{ chunks: [...], cursor?, hasMore }",
  },
  {
    method: "GET",
    path: "/v1/proof/answers/:answerId/receipt",
    description: "Get CROWN receipt for an answer",
    body: "—",
    response: "CrownReceipt (see JSON Schema)",
  },
  {
    method: "GET",
    path: "/v1/proof/receipts/:receiptId/proofpack",
    description: "Get complete proof pack",
    body: "—",
    response: "{ receipt, evidence, chain, integrity }",
  },
  {
    method: "GET",
    path: "/v1/receipts/:answerId/verify-chain",
    description: "Verify receipt chain integrity",
    body: "—",
    response: "{ valid, depth, receipts, latencyMs }",
  },
];

apiLines.push(mdTable(
  ["Method", "Path", "Description"],
  endpoints.map((e) => [e.method, `\`${e.path}\``, e.description]),
));
apiLines.push("");

for (const ep of endpoints) {
  apiLines.push(`### ${ep.method} \`${ep.path}\``);
  apiLines.push("");
  apiLines.push(ep.description);
  apiLines.push("");
  if (ep.body !== "—") {
    apiLines.push("**Request body:**");
    apiLines.push("");
    apiLines.push("```json");
    apiLines.push(ep.body);
    apiLines.push("```");
    apiLines.push("");
  }
  apiLines.push("**Response:**");
  apiLines.push("");
  apiLines.push(`\`${ep.response}\``);
  apiLines.push("");
}

apiLines.push("---");
apiLines.push("");
apiLines.push("See also: [CROWN Receipt Protocol](../../protocol/crown-receipt-protocol-v0.1.md) | [JSON Schema](../../proof-gallery/schema/crown-receipt.schema.json) | [MCP Proof Tools](../mcp/proof-tools.md)");
apiLines.push("");
apiLines.push("*Generated by `npm run contracts:generate`.*");

writeFileSync(join(CONTRACTS_DIR, "api", "proof-surface.md"), apiLines.join("\n"));
console.log("Generated API proof surface documentation");

// --- Generate CROWN receipt API ---

const crownLines: string[] = [];
crownLines.push("# CROWN Receipt API");
crownLines.push("");
crownLines.push("Endpoints specific to CROWN receipt creation, verification, and chain traversal.");
crownLines.push("");

crownLines.push("## Assurance Modes");
crownLines.push("");
crownLines.push(mdTable(
  ["Mode", "Domain Diversity", "Fragility", "Signing", "Use Case"],
  [
    ["`light`", "Not enforced", "No", "Optional", "Development, low-stakes queries"],
    ["`verified`", "minDomains >= 2", "Yes (leave-one-out)", "Yes", "Production queries"],
    ["`audit`", "minDomains >= 2", "Yes (leave-one-out)", "Yes", "Regulatory audit trails"],
  ],
));
crownLines.push("");

crownLines.push("## Receipt Fields");
crownLines.push("");
crownLines.push("See [crown-receipt.schema.json](../../proof-gallery/schema/crown-receipt.schema.json) for the complete JSON Schema.");
crownLines.push("");

crownLines.push("## Chain Verification");
crownLines.push("");
crownLines.push("Receipts form an append-only linked list via `parentSnapId`. Chain verification traverses the list using a recursive CTE (depth limit 50). Verified performance: 2–4ms regardless of depth.");
crownLines.push("");
crownLines.push("For independent verification without CueCrux infrastructure, see the [verification walkthrough](../../proof-gallery/redacted/verification-walkthrough.md).");
crownLines.push("");

crownLines.push("## Signing");
crownLines.push("");
crownLines.push("Receipts are signed with **ed25519** via HashiCorp Vault Transit. Each receipt carries its public key (`signature.pubB64`), enabling verification without access to the signing infrastructure. Key rotation is transparent — old receipts remain verifiable.");
crownLines.push("");

crownLines.push("---");
crownLines.push("");
crownLines.push("See also: [CROWN Receipt Protocol v0.1](../../protocol/crown-receipt-protocol-v0.1.md) | [Proof API Surface](proof-surface.md)");
crownLines.push("");
crownLines.push("*Generated by `npm run contracts:generate`.*");

writeFileSync(join(CONTRACTS_DIR, "api", "crown-receipt-api.md"), crownLines.join("\n"));
console.log("Generated CROWN receipt API documentation");

// --- Generate contracts README ---

const contractsReadme = `# API & MCP Contracts

Published API surface and MCP tool specifications for the CueCrux platform.

## MCP Tools

| Document | Description |
|----------|-------------|
| [Tool Catalog](mcp/tool-catalog.md) | Complete inventory of all ${totalTools} MCP tools across ${domains.length} domains |
| [Proof Tools](mcp/proof-tools.md) | Detailed proof lifecycle tool documentation |

## HTTP API

| Document | Description |
|----------|-------------|
| [Proof Surface](api/proof-surface.md) | HTTP endpoints for proof jobs, receipts, and verification |
| [CROWN Receipt API](api/crown-receipt-api.md) | Receipt-specific API: assurance modes, chain verification, signing |

## JSON Schemas

Machine-readable schemas are published in the [proof gallery](../proof-gallery/schema/):

- [crown-receipt.schema.json](../proof-gallery/schema/crown-receipt.schema.json)
- [crown-evidence.schema.json](../proof-gallery/schema/crown-evidence.schema.json)

---

*Generated by \`npm run contracts:generate\`.*
`;

writeFileSync(join(CONTRACTS_DIR, "README.md"), contractsReadme);
console.log("Contracts generation complete.");
