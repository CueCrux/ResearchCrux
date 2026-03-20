# CROWN Privacy Considerations

**Version:** 0.1 (Draft)
**Date:** March 2026
**Aligned to:** [draft-kamimura-scitt-refusal-events-02](https://datatracker.ietf.org/doc/draft-kamimura-scitt-refusal-events-02/) Section 8

CROWN receipts are designed for auditability. Auditability and privacy are in tension. This document describes the privacy properties, risks, and mitigations for CROWN receipts, particularly when registered with SCITT Transparency Services.

---

## 1. Query Content

CROWN receipts contain two query-related fields:

- `queryHash`: a BLAKE3 or SHA256 hash of the query text. The original query cannot be recovered from the hash.
- `queryText`: the full query string in plaintext.

`queryText` may contain sensitive information: legal questions, medical queries, competitive intelligence requests, or personally identifiable information. Exposure of query text could reveal what a tenant is researching, which may itself be competitively or legally sensitive.

### Mitigations

**Mode-based disclosure.** CROWN assurance modes provide natural guidance:

| Mode | `queryText` | `queryHash` | Rationale |
|---|---|---|---|
| `light` | SHOULD be omitted | Present | Development queries; minimal disclosure |
| `verified` | OPTIONAL | Present | Production queries; tenant decides |
| `audit` | Present | Present | Regulatory audit; full disclosure required for compliance |

**Redacted proof packs.** The CROWN proof gallery includes a redacted proof pack format where `queryText` and evidence content are replaced with `[REDACTED]` while hash anchors and signatures remain intact. A redacted receipt is independently verifiable (hash integrity, signature, chain linkage) without exposing query content. This enables sharing proof of process with third parties (auditors, regulators, counterparties) without disclosing what was asked.

**Hash-only registration.** When registering with a SCITT Transparency Service, the Issuer MAY submit a receipt with `queryText` omitted, retaining only `queryHash`. The full receipt (with `queryText`) can be stored in the tenant's encrypted storage and disclosed selectively. The Transparency Log receipt proves registration timing and hash integrity regardless of whether `queryText` is included.

---

## 2. Evidence Content

CROWN evidence records contain:

- `quoteHash`: a hash of the quoted text passage. The original text cannot be recovered.
- `citationIds`: identifiers of cited documents.
- `coverage`: a domain-to-citation mapping showing which source domains contributed to the answer.
- `scoreComponents`: BM25, vector, and combined retrieval scores.

### Risks

**Source pattern inference.** The `coverage` field and `citationIds` reveal which source domains a tenant queries. Over time, this reveals research patterns: a legal team repeatedly querying regulatory sources, a trading desk querying specific market data providers, a pharmaceutical company querying clinical trial databases.

**Retrieval score leakage.** `scoreComponents` reveals the relative ranking of sources for a given query. This could expose which sources a tenant's corpus weights most heavily, revealing corpus composition to anyone with access to the receipt.

**Cross-receipt correlation.** Multiple receipts referencing the same `citationIds` reveal repeated use of specific sources. Combined with timestamps, this can reveal research cadence and intensity.

### Mitigations

**Redacted evidence records.** The redacted proof pack format replaces `citationIds` and domain information with hashed equivalents. The evidence set hash remains verifiable without exposing source identities.

**Aggregated disclosure.** For regulatory compliance, tenants MAY provide aggregated evidence summaries (e.g., "answer was supported by N sources across M domains, fragility score F") rather than full evidence records. The receipt hash proves that the full evidence set exists; the aggregated summary provides interpretability without full disclosure.

**Tenant-controlled access.** Evidence records are stored in the tenant's encrypted storage (per-tenant Vault Transit encryption). Access to evidence content requires tenant authorisation. The SCITT Transparency Service stores only the receipt payload, not the evidence records, unless the tenant explicitly includes them.

---

## 3. Tenant Isolation

CROWN receipts carry a `tenantId` field. In a multi-tenant deployment:

- Receipts are encrypted at rest using per-tenant keys (Vault Transit envelope encryption).
- Cross-tenant receipt access is prohibited at the infrastructure level.
- The SCITT Transparency Service SHOULD maintain per-tenant isolation: queries against the log SHOULD NOT return receipts from other tenants.

### Risk: Transparency Service as aggregation point

If multiple tenants register receipts with the same SCITT Transparency Service, the Service operator could observe cross-tenant patterns (registration frequency, payload sizes, timing patterns) even without access to encrypted content. This is a structural property of transparency logs — the log operator sees metadata.

### Mitigation

Tenants with high sensitivity requirements SHOULD operate their own SCITT Transparency Service or register with a Service that provides per-tenant log isolation. The CROWN protocol does not mandate a specific Transparency Service; tenants choose their trust model.

---

## 4. Correlation Risks

Receipt metadata enables several correlation attacks:

**Temporal patterns.** `generatedAt` timestamps reveal query frequency and timing. A burst of receipts at specific times could reveal organisational decision-making patterns (e.g., increased query volume before board meetings or regulatory filings).

**Chain cadence.** Sequential `parentSnapId` chains reveal query cadence. The gap between consecutive `generatedAt` values in a chain reveals how frequently the system is queried for a specific topic.

**Knowledge state correlation.** `knowledgeStateCursor` values reveal corpus mutation rate. An observer tracking cursor progression across receipts can infer how frequently the tenant's knowledge base is updated, which may reveal operational tempo.

**Mode selection patterns.** The distribution of `light`/`verified`/`audit` mode receipts reveals the tenant's compliance posture. A sudden shift from `verified` to `audit` mode could signal an anticipated regulatory inquiry.

### Mitigations

- Implementations SHOULD apply access controls on chain traversal endpoints.
- Implementations SHOULD rate-limit queries against the receipt chain.
- Tenants MAY introduce jitter in registration timing to obscure temporal patterns.
- The `knowledgeStateCursor` MAY be omitted from receipts shared with third parties (the cursor is primarily useful for internal temporal reconstruction, not external verification).

---

## 5. Actor Privacy

CROWN receipts do not include user identity fields. This is a deliberate design choice. The receipt attests to the system's behaviour (what evidence was retrieved, what mode was applied, what confidence was produced), not to who asked the question.

This contrasts with [draft-kamimura-scitt-refusal-events-02](https://datatracker.ietf.org/doc/draft-kamimura-scitt-refusal-events-02/) Section 8.2, which includes an `actor-hash` field for pseudonymised user identity. The difference reflects the different audit requirements:

- **Refusal events** need actor attribution to detect patterns of adversarial probing (the same user repeatedly triggering refusals).
- **Evidence provenance** needs system attribution to verify that the retrieval process was correct, regardless of who initiated it.

If user attribution is required for regulatory purposes (e.g., tracking which human operator relied on an AI-assisted decision), the mapping between receipt and user identity SHOULD be maintained in a separate, access-controlled system outside the receipt payload. This prevents user identity from being exposed through the receipt chain or the SCITT Transparency Service.

---

## 6. Harmful Content

Unlike refusal events (which are triggered by harmful content), CROWN receipts are triggered by ordinary retrieval queries. The primary harmful-content risk is indirect: a receipt's evidence set could reference sources that contain harmful content (extremist material, CSAM, disinformation).

### Mitigation

CROWN receipts do not store source content. `quoteHash` provides verification without reproduction. `citationIds` identify sources but do not carry their content. The evidence record's `role` field (`support` or `counterfactual`) indicates how the source was used but does not reproduce what it said.

For deployments where even source identification is sensitive, the redacted proof pack format replaces `citationIds` with hashed equivalents.
