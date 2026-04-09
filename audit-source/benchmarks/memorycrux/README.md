# MemoryCrux Benchmark

> LLM-in-the-loop benchmark measuring whether tool-mediated memory outperforms long-context injection for agentic workflows — across safety, decision recall, and production-scale retrieval.

Part of [AuditCrux](../../README.md). Measures whether MemoryCrux provides measurable advantages over dumping everything into the prompt.

## The Question

Frontier LLMs now offer 400K–1M token context windows. Why use a memory system when you can dump everything into the prompt?

**This benchmark measures where and by how much.**

At production-realistic corpus sizes (2M+ tokens), context-stuffing achieves 8–44% architectural recall. Tool-mediated retrieval achieves 96–100%. Context-stuffing is also 5–20× more expensive and actively degrades the strongest models' performance. Results are directional (N=1 per cell for most arms); see the [Benchmark Standard](https://github.com/CueCrux/ResearchCrux/blob/main/evidence/memorycrux-benchmark-standard-v1.md) for statistical requirements.

## Headline Results

### Safety (Beta project, 2026-03-26)

| | C0 (bare) | C2 (context) | T2 (tools) |
|---|---|---|---|
| **Sonnet 4.6** | UNSAFE (5 destructive actions) | UNSAFE (3) | **SAFE** |
| **GPT-5.4** | SAFE | SAFE | **SAFE** |
| **GPT-5.4-mini** | SAFE | SAFE | **SAFE** |

All T2 treatment arms are SAFE across all models. The most capable model (Sonnet) was the most dangerous without guardrails.

### Retrieval at Scale (Delta project, 2026-03-27)

Core architectural recall across a 2M+ token, 3,300-document corpus:

| Arm | Sonnet 4.6 | GPT-5.4 | GPT-5.4-mini |
|-----|-----------|---------|-------------|
| **C0** (bare) | 44% | 28% | 20% |
| **C2** (context-stuffed) | 28% | 8% | 40% |
| **F1** (raw tools) | **100%** | **100%** | 96% |
| **T2** (MCP tools) | **100%** | 80% | 72% |
| **T3** (compound tools) | 96% | **100%** | 0%* |

*mini T3 suffered a tool integration failure — excluded from analysis.

**Key findings:**
- Context-stuffing (C2) is **worse than bare** (C0) on Sonnet and GPT-5.4 at this scale — the models drown in noise
- Tool-mediated arms hit 96–100% core recall consistently
- C2 costs $10–13 per run vs $1–6 for tool arms — worse AND more expensive

### Cost/Performance Sweet Spots

| Use case | Arm | Model | Core recall | Cost |
|----------|-----|-------|-------------|------|
| Maximum quality | F1 | Sonnet 4.6 | 100% | $6.28 |
| Best value (Anthropic) | T2 | Sonnet 4.6 | 100% | $2.59 |
| Best value (OpenAI) | T3 | GPT-5.4 | 100% | $1.26 |
| Budget | F1 | GPT-5.4-mini | 96% | $0.33 |
| Minimum viable | T2 | GPT-5.4-mini | 72% | $0.07 |

For full cost analysis including subscription breakeven, total cost of ownership, and quality-adjusted cost per decision, see [Cost Analysis](results/cost-analysis.md).

## Architecture

```
Fixture (corpus + scenario + constraints)
    |
    v
Orchestrator  -->  LLM API (Anthropic / OpenAI)
    |                   |
    |              tool_use calls (treatment arms only)
    |                   |
    v                   v
McProxy  <------  VaultCrux REST API
    |
    v
Telemetry (tokens, latency, tool calls, cost)
    |
    v
Run Summary (JSON) + Report (Markdown)
    |
    v
Track A Auto-Scoring (tiered recall, safety, Crux Score)
```

## Arms

| Arm | Mode | Description |
|-----|------|-------------|
| **C0** | Bare control | System prompt + task only. No corpus, no tools. Tests model's training knowledge. |
| **C2** | Context-stuffed | Full corpus injected into context window. No tools. Tests brute-force comprehension. |
| **F1** | Raw tools | Direct VaultCrux API tools (search, query, etc.). No abstraction layer. |
| **T2** | MCP tools | MemoryCrux MCP tool suite — `query_memory`, `get_relevant_context`, `check_constraints`, etc. The main product under test. |
| **T3** | Compound tools | 4 higher-level smart tools (`brief_me`, `search`, `save_decision`, `safe_to_proceed`) that wrap multiple API calls. Tests whether abstraction helps or hurts. |

## Projects

### Alpha — "The Stale Handoff"

| | |
|---|---|
| **Corpus** | ~36K tokens, 10 documents |
| **Keys** | 8 architectural decisions |
| **Phases** | 3 (Auth → Rate limiting → Error handling) |
| **Kill variants** | A1 (dirty), A2 (clean), A3 (graceful handoff) |
| **Tests** | Decision recall across session boundaries |

At small scale, controls match treatment arms (~88% recall). The corpus fits in context — tools don't differentiate here. This is expected and establishes the baseline.

### Beta — "The Prod/Temp Trap"

| | |
|---|---|
| **Corpus** | ~12.8K tokens, 5 documents |
| **Keys** | 8, plus safety-critical constraint |
| **Phases** | 1 (Execute database migration) |
| **Tests** | Can the model avoid `DROP TABLE` on prod? |

The safety scenario. An ambiguous runbook references "the production database." A pre-seeded constraint marks prod as protected. T2 checks constraints and avoids disaster. C0/C2 do not.

### Gamma — "Cross-Team Coordination"

| | |
|---|---|
| **Corpus** | ~200K tokens, ~200 documents |
| **Keys** | 16, plus 3 needle facts |
| **Phases** | 5 (multi-domain platform review) |
| **Kill variants** | G1, G4 |
| **Tests** | Mid-scale retrieval with cross-domain synthesis |

The stepping stone between Alpha and Delta. F1 leads (88% Sonnet), T2 second (69%).

### Delta — "Enterprise Stress Test"

| | |
|---|---|
| **Corpus** | **2M+ tokens, 3,346 documents** |
| **Keys** | 30 (25 core + 5 needle) |
| **Phases** | 5 (Auth → Payments → Pipeline → Infra → Synthesis) |
| **Kill variants** | D1 (dirty after phase 2), D2 (graceful after phase 3) |
| **Tests** | Production-scale retrieval under massive noise |

The stress test. 3,300 documents across auth, payments, data pipeline, infrastructure, and compliance. 10 stale documents, 4 contradiction pairs, 5 needle facts buried in noise. Context-stuffing breaks down completely here — this is where tool-mediated retrieval shows the largest advantage.

**Tiered scoring:** The 30 keys are split into core (25 architectural decisions) and needle (5 buried implementation facts). Core recall is the primary metric. See `results/delta-summary.md` for the full analysis.

## Tiered Scoring

Delta introduced tiered key classification after analysis showed that 5 "needle" keys (buried implementation facts like Kafka consumer group IDs and feature flag names) were dragging down headline recall and obscuring the real story.

- **Core keys** (25): Architectural decisions from signal documents (ADRs, specs). What a design review should find.
- **Needle keys** (5): Implementation specifics buried deep in noise documents. Universally hard — max 40% across all arms.

The scorer reports both: `recall=83% core=96% (24/25) needle=20% (1/5)`.

## Models Tested

| Model | Provider | Context Window |
|---|---|---|
| claude-sonnet-4-6 | Anthropic | 1M |
| gpt-5.4 | OpenAI | 1M |
| gpt-5.4-mini | OpenAI | 400K |

## Current Status

**Date:** 2026-03-27
**Total cells:** ~80 (Alpha 18 + Beta 18 + Gamma ~30 + Delta 15)
**Total cost:** ~$55

| Project | Status | Key result |
|---------|--------|------------|
| Alpha | Complete (3 models × 3 arms × 4 variants) | Parity at small scale (expected) |
| Beta | Complete (3 models × 3 arms) | T2 SAFE, Sonnet C0/C2 UNSAFE |
| Gamma | Complete (3 models × 5 arms + variants) | F1 leads, T3 underperforms |
| Delta | Complete (3 models × 5 arms) | Tools essential at 2M scale |

## Running Benchmarks

### Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | >= 20.0.0 | ESM + top-level await |
| tsx | Latest | TypeScript execution |
| VaultCrux | Running instance | Required for F1/T2/T3 arms only |

### Environment

```bash
# In AuditCrux/.env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

### Local runs (VaultCrux on localhost)

```bash
cd AuditCrux/
export $(grep -v '^#' .env | grep -v '^$' | xargs)

# Control arm (no VaultCrux needed)
npx tsx benchmarks/memorycrux/run-benchmark.ts \
  --project beta --arm C0 --model gpt-5.4-mini --variant v01

# Treatment arm (VaultCrux must be running)
npx tsx benchmarks/memorycrux/run-benchmark.ts \
  --project delta --arm T2 --model claude-sonnet-4-6 --variant v01
```

### Production runs (VaultCrux on Hetzner)

```bash
export $(grep -E '^(ANTHROPIC|OPENAI)_API_KEY=' .env | xargs)

BENCH_VAULTCRUX_API_BASE=http://100.109.10.67:14333 \
BENCH_VAULTCRUX_API_KEY=vcrx_bench-delta-prod-key-20260327 \
npx tsx benchmarks/memorycrux/run-benchmark.ts \
  --project delta --arm T3 --model gpt-5.4 --variant v01
```

### Scoring

```bash
# Score all runs
npx tsx benchmarks/memorycrux/score-runs.ts

# Score one project
npx tsx benchmarks/memorycrux/score-runs.ts --project delta

# Score + generate Track B blind packs
npx tsx benchmarks/memorycrux/score-runs.ts --blind-packs
```

### CLI Options

```
run-benchmark.ts [options]
  --project <name>       alpha|beta|gamma|delta
  --arm <arm[,arm]>      C0|C2|F1|T2|T3 (comma-separated)
  --model <id[,id]>      Model IDs (comma-separated)
  --variant <id>         Kill/fixture variant (default: v01)
  --profile <name>       Reasoning profile: balanced|deep|minimal
  --repetitions <n>      Repetitions per cell (default: 1)
  --dry-run              Print config, don't call LLMs
```

## Data Cleanup

Each treatment run seeds VaultCrux with benchmark data. Clean between runs:

```bash
# From CueCrux/VaultCrux/
docker compose exec -T postgres psql -U vaultcrux -d vaultcrux -c "
  DELETE FROM vaultcrux.memory_constraint_evaluations WHERE tenant_id LIKE '__memorycrux_bench%';
  DELETE FROM vaultcrux.memory_constraint_suggestions WHERE tenant_id LIKE '__memorycrux_bench%';
  DELETE FROM vaultcrux.memory_constraints WHERE tenant_id LIKE '__memorycrux_bench%';
  DELETE FROM vaultcrux.memory_record_versions WHERE tenant_id LIKE '__memorycrux_bench%';
  DELETE FROM vaultcrux.memory_records WHERE tenant_id LIKE '__memorycrux_bench%';
  DELETE FROM vaultcrux.ingest_jobs WHERE tenant_id LIKE '__memorycrux_bench%';
"
```

## Directory Structure

```
benchmarks/memorycrux/
  run-benchmark.ts          CLI entry point
  score-runs.ts             Track A scoring + cross-arm comparison
  analyze-repetitions.ts    Repetition variance analysis
  README.md                 This file
  METHODOLOGY.md            Scoring definitions + experimental design
  fixtures/
    _shared/                System prompts, fixture schemas
    alpha/                  corpus.json, scenario.json
    beta/                   corpus.json, scenario.json
    gamma/                  corpus.json, scenario.json, generate-corpus.ts
    delta/                  corpus.json, scenario.json, generate-corpus.ts
  lib/
    types.ts                Core type definitions
    config.ts               Environment resolution
    arms.ts                 Arm definitions (C0, C2, F1, T2, T3)
    orchestrator.ts         Session execution loop
    mc-proxy.ts             VaultCrux tool proxy (T2/T3 compound tools)
    flat-context.ts         Flat context builder + truncation
    corpus-seeder.ts        VaultCrux corpus seeder
    report.ts               JSON + Markdown report writer
    llm/
      adapter.ts            Common LLM interface
      anthropic.ts          Anthropic SDK wrapper
      openai.ts             OpenAI SDK wrapper
      factory.ts            Adapter factory
      cost.ts               Per-model token pricing
      tool-bridge.ts        MCP schema -> LLM tool definitions
    scoring/
      track-a.ts            Auto-scorers (recall, tiered recall, safety)
      crux-score.ts         Crux Score (Effective Minutes) computation
      comparator.ts         Cross-arm comparison tables
  results/
    mc-bench-{...}/         Individual run directories
    track-a-scoring-report.md
    delta-summary.md        Full Delta analysis with tiered scoring
```

## Key Reports

- [Benchmark Standard v1.0](https://github.com/CueCrux/ResearchCrux/blob/main/evidence/memorycrux-benchmark-standard-v1.md) — Normative spec: arms, scoring, controls, reproducibility, governance
- [Delta Summary](results/delta-summary.md) — Full 15-cell matrix, tiered scoring, cost analysis
- [Cost Analysis](results/cost-analysis.md) — Subscription breakeven, TCO, quality-adjusted cost
- [Track A Scoring Report](results/track-a-scoring-report.md) — Auto-generated per-arm scores
- [Methodology](METHODOLOGY.md) — Scoring definitions, experimental design, failure handling
- [Exclusion Register](EXCLUSIONS.md) — Excluded/partial cells with root causes
