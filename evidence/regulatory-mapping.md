# Regulatory Mapping — CROWN Capabilities to Compliance Requirements

This document maps specific CueCrux CROWN capabilities to regulatory requirements under the EU AI Act and DORA, with benchmark evidence citations. Each row identifies a regulatory obligation, the CROWN capability that addresses it, and the benchmark run that provides measured evidence.

---

## EU AI Act

### Article 13 — Transparency and Provision of Information to Deployers

Article 13(1) requires that high-risk AI systems be designed and developed in such a way that their operation is sufficiently transparent to enable deployers to interpret the system's output and use it appropriately.

| Requirement | Article Reference | CROWN Capability | Benchmark Evidence |
|---|---|---|---|
| System output must be interpretable by deployers | Art. 13(1) | CROWN receipt exposes the full evidence set (citations, fusion weights, retrieval configuration) for every answer. Deployers can inspect exactly which documents were used and how they were scored. | Cat 1 supersession: correct ranking accuracy 1.0 (run `110ada93`). Cat 2 causal chain: recall 1.0 for connected evidence (run `110ada93`). |
| Deployers must understand the system's intended purpose and level of accuracy | Art. 13(2) | Three assurance modes (`light`, `verified`, `audit`) with distinct guarantees. `verified` enforces minDomains=2 and produces fragility scores. Mode applied is recorded on every receipt. | Cat 6 fragility: F1=1.0 fragility for minimum-domain citation sets (run `e782fbd0`). Mode tracking verified across all 40 canonical test cases. |
| Output must include measures of confidence or accuracy where appropriate | Art. 13(3)(d) | Fragility score (0.0-1.0) on every `verified`/`audit` receipt quantifies how sensitive the conclusion is to losing individual evidence sources. | Cat 6 calibration: monotonic ordering F1 > F2 >= F3 confirmed (run `e782fbd0`). |
| System must enable deployers to monitor operation for anomalies | Art. 13(3)(e) | Receipt chain provides complete operational history. Each receipt records timings, fusion weights, and knowledge state cursor. Anomalies (latency spikes, degraded recall, unsigned receipts) are detectable by chain inspection. | Cat 5: 50-depth chain verified intact with 2-4ms latency, zero breaks (run `e782fbd0`). |

### Article 14 — Human Oversight

Article 14(4) requires measures enabling human oversight of AI system output, including the ability to correctly interpret output with the aid of provided tools.

| Requirement | Article Reference | CROWN Capability | Benchmark Evidence |
|---|---|---|---|
| Individuals assigned oversight must understand system capabilities and limitations | Art. 14(4)(a) | Benchmark suite itself serves as a capabilities and limitations document. Every known limitation is measured and published. | 40/40 passed with documented limitations (embedding space, relation expansion, fragility calibration). |
| Individuals must be able to correctly interpret AI output | Art. 14(4)(b) | Receipt exposes MiSES composition, load-bearing citations, domain coverage, and counterfactual evidence. An oversight operator can see not just what was cited, but what was considered and why. | Cat 3 decomposition: all three retrieval lanes (BM25, vector, hybrid) contribute; V-class docs retrieved but not cited, documented as LLM selection characteristic (run `e782fbd0`). |
| Individuals must be able to decide not to use the system in a particular situation | Art. 14(4)(d) | Fragility score enables risk-aware decisions: a fragility of 1.0 means the answer breaks if any single source is removed. A human overseer can reject high-fragility answers. | Cat 6: F1=1.0 correctly identifies maximum-fragility scenarios (run `e782fbd0`). |

---

## DORA (Digital Operational Resilience Act)

### Article 8 — ICT Risk Management Framework: Identification

Article 8 requires financial entities to identify, classify, and adequately document all ICT-supported business functions, information assets, and ICT assets.

| Requirement | Article Reference | CROWN Capability | Benchmark Evidence |
|---|---|---|---|
| Document all information assets and their interdependencies | Art. 8(1) | `artifact_relations` graph documents supersession, derivation, contradiction, and elaboration relationships between all ingested documents. Living state machine classifies each artifact's lifecycle status. | Cat 4 temporal: 96.63% accuracy on enterprise corpus lifecycle classification (run `c85daff7`). 100% on edge cases (run `e782fbd0`). |
| Identify sources of ICT risk, including exposure to dependencies | Art. 8(4) | Fragility scoring identifies which citations are load-bearing for each answer. Domain coverage analysis identifies single-source dependencies. | Cat 6: fragility 1.0 when answer depends on minimum-domain set (run `e782fbd0`). |

### Article 9 — ICT Risk Management Framework: Protection and Prevention

| Requirement | Article Reference | CROWN Capability | Benchmark Evidence |
|---|---|---|---|
| Ensure ICT systems are continuously monitored and controlled | Art. 9(1) | Receipt chain provides append-only audit trail of all answers. Knowledge state cursor anchors each receipt to the corpus state at query time. | Cat 5: chain intact at depth 50, verification sub-5ms (run `e782fbd0`). |
| Maintain detailed records of activities before and during ICT disruptions | Art. 9(3)(b) | Temporal reconstruction: the system can answer "what did we know at time T?" by replaying the receipt chain and living state at any point. | Cat 4: 100% temporal reconstruction on clean corpus (run `110ada93`). |

### Article 10 — ICT Risk Management Framework: Detection

| Requirement | Article Reference | CROWN Capability | Benchmark Evidence |
|---|---|---|---|
| Detect anomalous activities and identify potential ICT-related incidents | Art. 10(1) | Receipt chain enables anomaly detection: unsigned receipts indicate signing infrastructure failures. Fragility score spikes indicate evidence degradation. Latency anomalies indicate infrastructure issues. | Cat 5: latency slope -0.04 ms/depth (flat baseline for anomaly detection) (run `e782fbd0`). |

### Article 11 — ICT Risk Management Framework: Response and Recovery

| Requirement | Article Reference | CROWN Capability | Benchmark Evidence |
|---|---|---|---|
| Establish ICT business continuity policy and ICT response and recovery plans | Art. 11(1) | Receipt chain is independently verifiable without CueCrux infrastructure. Verification requires only BLAKE3 and ed25519 — no vendor dependency for audit trail integrity. | Cat 5: independent verification procedure specified in [CROWN Protocol v0.1](../whitepapers/crown-receipt-protocol-v0.1.md) Section 5.5. |
| Maintain adequate records to enable investigation of ICT-related incidents | Art. 11(6) | Every answer produces a receipt containing: query text, evidence set with quote hashes, retrieval configuration, fusion weights, timing data, knowledge state cursor, and cryptographic signature. The chain is append-only and tamper-evident. | Cat 4 + Cat 5: chain integrity verified across 54 temporal states (run `110ada93`) and 50 chain depths (run `e782fbd0`). |

---

## Summary

| Regulatory Obligation | Source | Primary CROWN Capability | Primary Benchmark Category | Canonical Run |
|---|---|---|---|---|
| Transparency of AI-assisted decisions | EU AI Act Art. 13 | Receipt chain with evidence set exposure | Cat 1 (supersession), Cat 2 (causal) | `110ada93` |
| Confidence/accuracy measures | EU AI Act Art. 13(3)(d) | Fragility scoring | Cat 6 (fragility calibration) | `e782fbd0` |
| Human oversight interpretability | EU AI Act Art. 14(4)(b) | MiSES composition, counterfactual evidence | Cat 3 (lane decomposition) | `e782fbd0` |
| ICT risk identification | DORA Art. 8 | Artifact relations, living state | Cat 4 (temporal reconstruction) | `c85daff7` |
| Continuous monitoring | DORA Art. 9 | Append-only receipt chain | Cat 5 (receipt chain stress) | `e782fbd0` |
| Temporal evidence reconstruction | DORA Art. 9(3)(b) | Knowledge state cursor, temporal replay | Cat 4 (temporal reconstruction) | `110ada93` |
| Anomaly detection | DORA Art. 10 | Receipt chain operational metrics | Cat 5 (receipt chain stress) | `e782fbd0` |
| Audit trail for incident investigation | DORA Art. 11(6) | Full receipt: query, evidence, config, signature | Cat 4 + Cat 5 | `110ada93`, `e782fbd0` |
| Vendor-independent verification | DORA Art. 11 | Independent verification (BLAKE3 + ed25519) | Cat 5, Protocol Spec §5.5 | `e782fbd0` |
