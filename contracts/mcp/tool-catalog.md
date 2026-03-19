# MCP Tool Catalog

Complete inventory of MCP tools exposed by VaultCrux. Tools are organized by domain.

| Domain | Source | Tools | Methods |
|---|---|---|---|
| Proof | `proof.ts` | 5 | `proof_document`, `get_proof_status`, `get_proof_chunks`, `get_proof_receipt`, `get_proofpack` |
| Retrieval | `retrieval.ts` | 5 | `query_vault`, `get_journal`, `action_journal.query`, `get_stale_pins`, `get_session_context` |
| Watch | `watch.ts` | 4 | `watch_answer`, `unwatch_answer`, `get_watches`, `get_watch_alerts` |
| Intel | `intel.ts` | 28 | `query_with_threshold`, `get_passport`, `verify_passport`, `register_belief`, `get_beliefs`, `diff_receipts`, `get_blast_radius`, `get_break_analysis`, `get_counterfactual_summary`, `explain_last_answer`, `get_domain_affinity`, `annotate_session`, `get_knowledge_gaps`, `get_daily_briefing`, `set_policy`, `get_active_policy`, `schedule_recheck`, `pin_receipt`, `get_trust_level`, `tip_agent`, `create_coalition`, `join_coalition`, `create_handoff_package`, `accept_handoff_package`, `set_reasoning_profile`, `get_reasoning_profile`, `find_contradictions`, `forecast_obsolescence` |
| Feedback | `feedback.ts` | 6 | `submit_feature_request`, `vote_feature_request`, `get_feature_requests`, `declare_revenue_willingness`, `submit_feedback_survey`, `respond_to_survey` |
| Economy | `economy.ts` | 12 | `get_balance`, `get_credit_balance`, `get_escrow_holds`, `get_credit_escrow`, `get_spend_receipt`, `get_pricing`, `get_economy_dashboard`, `convert_credits_to_discount`, `get_subscription_discount_preview`, `tip_platform`, `browse_bundles`, `purchase_bundle` |
| Organization | `org.ts` | 4 | `list_seats`, `invite_seat`, `change_seat_role`, `revoke_seat` |
| Public | `public.ts` | 2 | `register_agent`, `request_sponsor` |

**Total: 66 tools across 8 domains.**

## Proof

Source: `VaultCrux/apps/mcp/src/tools/proof.ts`

| Method | Description | Parameters |
|---|---|---|
| `proof_document` | Submit a document for proof generation. Creates a proof job that processes the document, generates CROWN receipts for each answer chunk. | `artefact_id` (required), `mode` (`light`|`verified`|`audit`), `metadata` (optional object) |
| `get_proof_status` | Check the status of a proof job. Returns current state (queued, processing, completed, failed) and progress. | `proof_job_id` (required) |
| `get_proof_chunks` | Retrieve processed chunks from a completed proof job. Supports cursor-based pagination. | `proof_job_id` (required), `cursor` (optional) |
| `get_proof_receipt` | Retrieve the CROWN receipt for a specific answer. Returns the full receipt with hash, signature, and evidence. | `answer_id` (required) |
| `get_proofpack` | Retrieve a complete proof pack for a receipt. Bundles the receipt, evidence records, and chain metadata. | `receipt_id` (required) |

## Retrieval

Source: `VaultCrux/apps/mcp/src/tools/retrieval.ts`

| Method | Description | Parameters |
|---|---|---|
| `query_vault` | Query the knowledge vault with natural language. Returns ranked results with CROWN receipt provenance. | `query` (required), `top_k`, `mode`, `filters` |
| `get_journal` | Retrieve the answer journal for a session. Shows historical queries and answers. | `session_id`, `limit`, `offset` |
| `action_journal.query` | Query the action journal for receipted actions taken by agents. | `query`, `limit` |
| `get_stale_pins` | Retrieve pinned answers whose underlying evidence has changed. | `limit` |
| `get_session_context` | Get accumulated context for the current session. | `session_id` |

## Watch

Source: `VaultCrux/apps/mcp/src/tools/watch.ts`

| Method | Description | Parameters |
|---|---|---|
| `watch_answer` | Subscribe to confidence drift monitoring for an answer. WatchCrux tracks evidence changes. | `answer_id` (required), `threshold` |
| `unwatch_answer` | Remove a watch subscription. | `watch_id` (required) |
| `get_watches` | List active watches for the current tenant. | `limit`, `offset` |
| `get_watch_alerts` | Retrieve alerts triggered by watched answers whose confidence has drifted. | `limit`, `since` |

## Intel

Source: `VaultCrux/apps/mcp/src/tools/intel.ts`

| Method | Description | Parameters |
|---|---|---|
| `query_with_threshold` | Query with explicit confidence threshold. Only returns results meeting the threshold. | `query`, `threshold` |
| `get_passport` | Retrieve an answer passport — portable proof of provenance. | `answer_id` |
| `verify_passport` | Verify an answer passport's integrity and chain. | `passport` |
| `register_belief` | Register a belief (agent assertion) grounded in evidence. | `statement`, `evidence_ids` |
| `get_beliefs` | Retrieve registered beliefs. | `limit`, `filter` |
| `diff_receipts` | Compare two CROWN receipts to identify evidence differences. | `receipt_id_a`, `receipt_id_b` |
| `get_blast_radius` | Estimate the impact of a document change on existing answers. | `document_id` |
| `get_break_analysis` | Analyze which answers would break if specific evidence were removed. | `evidence_ids` |
| `get_counterfactual_summary` | Summarize counterfactual evidence considered but not used. | `answer_id` |
| `explain_last_answer` | Get a natural language explanation of the last answer's evidence basis. | (none) |
| `get_domain_affinity` | Show which knowledge domains the tenant most frequently queries. | `limit` |
| `annotate_session` | Add metadata annotations to a session. | `session_id`, `annotations` |
| `get_knowledge_gaps` | Identify areas where the corpus lacks coverage. | `query` |
| `get_daily_briefing` | Get a daily briefing of evidence changes and watch alerts. | (none) |
| `set_policy` | Set retrieval policy (e.g., minimum assurance mode, domain requirements). | `policy` |
| `get_active_policy` | Retrieve the current retrieval policy. | (none) |
| `schedule_recheck` | Schedule a recheck of an answer against current evidence. | `answer_id`, `when` |
| `pin_receipt` | Pin a receipt for long-term retention. | `receipt_id` |
| `get_trust_level` | Get the computed trust level for a source or domain. | `source_id` |
| `tip_agent` | Tip an agent for a helpful response (economy integration). | `agent_id`, `amount` |
| `create_coalition` | Create a multi-agent coalition for collaborative reasoning. | `name`, `agent_ids` |
| `join_coalition` | Join an existing coalition. | `coalition_id` |
| `create_handoff_package` | Create a handoff package for transferring context between agents. | `session_id`, `context` |
| `accept_handoff_package` | Accept a handoff package from another agent. | `package_id` |
| `set_reasoning_profile` | Set the reasoning profile (controls retrieval strategy and evidence standards). | `profile` |
| `get_reasoning_profile` | Get the current reasoning profile. | (none) |
| `find_contradictions` | Find contradictions in the evidence corpus. | `query` |
| `forecast_obsolescence` | Predict which documents are likely to become stale. | `limit` |

## Feedback

Source: `VaultCrux/apps/mcp/src/tools/feedback.ts`

| Method | Description | Parameters |
|---|---|---|
| `submit_feature_request` | Submit a feature request from within the MCP session. | `title`, `description` |
| `vote_feature_request` | Vote on an existing feature request. | `request_id` |
| `get_feature_requests` | List feature requests. | `limit`, `status` |
| `declare_revenue_willingness` | Declare willingness to pay for a feature. | `request_id`, `amount` |
| `submit_feedback_survey` | Submit a feedback survey. | `survey` |
| `respond_to_survey` | Respond to a feedback survey. | `survey_id`, `responses` |

## Economy

Source: `VaultCrux/apps/mcp/src/tools/economy.ts`

| Method | Description | Parameters |
|---|---|---|
| `get_balance` | Get the current credit balance for the tenant. | (none) |
| `get_credit_balance` | Get detailed credit balance breakdown. | (none) |
| `get_escrow_holds` | List active escrow holds. | `limit` |
| `get_credit_escrow` | Get escrow details for a specific hold. | `escrow_id` |
| `get_spend_receipt` | Get a spend receipt for a completed transaction. | `transaction_id` |
| `get_pricing` | Get current pricing information. | (none) |
| `get_economy_dashboard` | Get economy dashboard with usage and spend overview. | (none) |
| `convert_credits_to_discount` | Convert accumulated credits to a discount. | `amount` |
| `get_subscription_discount_preview` | Preview discount from credit conversion. | `amount` |
| `tip_platform` | Tip the platform (appreciation/revenue signal). | `amount`, `message` |
| `browse_bundles` | Browse available credit bundles. | (none) |
| `purchase_bundle` | Purchase a credit bundle. | `bundle_id` |

## Organization

Source: `VaultCrux/apps/mcp/src/tools/org.ts`

| Method | Description | Parameters |
|---|---|---|
| `list_seats` | List team seats for the tenant. | `limit`, `offset` |
| `invite_seat` | Invite a new team member. | `email`, `role` |
| `change_seat_role` | Change a team member's role. | `seat_id`, `role` |
| `revoke_seat` | Revoke a team member's access. | `seat_id` |

## Public

Source: `VaultCrux/apps/mcp/src/tools/public.ts`

| Method | Description | Parameters |
|---|---|---|
| `register_agent` | Register a new agent identity. | `name`, `capabilities` |
| `request_sponsor` | Request sponsorship for agent credits. | `agent_id`, `reason` |

---

*Generated by `npm run contracts:generate`.*
