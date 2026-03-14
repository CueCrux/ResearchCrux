#!/usr/bin/env tsx
/**
 * Generates the benchmark ledger from AuditCrux canonical results.
 *
 * Reads:  ../AuditCrux/results/*.json
 * Writes: evidence/ledger/README.md, evidence/ledger/run-*.md,
 *         evidence/ledger/changelog.md, evidence/ledger/latest.json
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, resolve } from "path";
import { readAuditCruxResults, summarizeRun, type AuditRun } from "./lib/audit-reader.js";
import { mdTable, mdSection, formatDate, formatDuration, formatNumber } from "./lib/markdown-writer.js";

function main() {
  const ROOT = resolve(import.meta.dirname, "..");
  const AUDIT_CRUX_DIR = resolve(ROOT, "../AuditCrux");
  const LEDGER_DIR = join(ROOT, "evidence", "ledger");

  mkdirSync(LEDGER_DIR, { recursive: true });

  const runs = readAuditCruxResults(AUDIT_CRUX_DIR);
  if (runs.length === 0) {
    console.error("No AuditCrux results found. Ensure ../AuditCrux/results/ contains canonical JSON files.");
    process.exit(1);
  }

  runs.sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());
  console.log(`Found ${runs.length} canonical runs`);

  for (const run of runs) {
    const summary = summarizeRun(run);
    const page = generateRunPage(run, summary);
    const filename = `run-${run.runId}.md`;
    writeFileSync(join(LEDGER_DIR, filename), page);
    console.log(`  Generated ${filename}`);
  }

  const index = generateLedgerIndex(runs);
  writeFileSync(join(LEDGER_DIR, "README.md"), index);
  console.log("  Generated ledger README.md");

  const changelog = generateChangelog(runs);
  writeFileSync(join(LEDGER_DIR, "changelog.md"), changelog);
  console.log("  Generated changelog.md");

  const latest = generateLatestJson(runs);
  writeFileSync(join(LEDGER_DIR, "latest.json"), JSON.stringify(latest, null, 2));
  console.log("  Generated latest.json");

  console.log("Ledger generation complete.");
}

// ============================================================
// Generators
// ============================================================

function generateRunPage(
  run: AuditRun,
  summary: ReturnType<typeof summarizeRun>,
): string {
  const lines: string[] = [];

  lines.push(`# Canonical Run: \`${run.runId}\``);
  lines.push("");
  lines.push(`| Field | Value |`);
  lines.push(`|-------|-------|`);
  lines.push(`| **Run ID** | \`${run.runId}\` |`);
  lines.push(`| **Suite** | ${run.suite} |`);
  lines.push(`| **Embedding** | ${run.embedding} |`);
  lines.push(`| **Date** | ${formatDate(run.startedAt)} |`);
  lines.push(`| **Duration** | ${formatDuration(summary.durationMs)} |`);
  lines.push(`| **Pass Rate** | **${summary.passRate}** |`);
  lines.push(`| **Source** | \`AuditCrux/results/${run.sourceFile}\` |`);
  lines.push("");

  // Pass/fail matrix
  lines.push("## Results by Category");
  lines.push("");

  // Group by category
  const categories = new Map<string, Map<string, { passed: boolean; metrics: Record<string, unknown> }>>();
  for (const r of run.results) {
    if (!categories.has(r.category)) categories.set(r.category, new Map());
    categories.get(r.category)!.set(r.mode, { passed: r.passed, metrics: r.metrics });
  }

  // Get all modes
  const modes = [...new Set(run.results.map((r) => r.mode))].sort();

  const headers = ["Category", ...modes, "Key Metric"];
  const rows: string[][] = [];

  for (const [cat, modeResults] of categories) {
    const row = [catName(cat)];
    for (const mode of modes) {
      const result = modeResults.get(mode);
      row.push(result ? (result.passed ? "PASS" : "**FAIL**") : "—");
    }
    // Extract most interesting metric from first mode
    const firstResult = modeResults.values().next().value;
    row.push(extractKeyMetric(cat, firstResult?.metrics ?? {}));
    rows.push(row);
  }

  lines.push(mdTable(headers, rows));
  lines.push("");

  // Detailed metrics per category
  lines.push("## Detailed Metrics");
  lines.push("");

  for (const r of run.results) {
    lines.push(`### ${catName(r.category)} (${r.mode})`);
    lines.push("");
    if (r.notes.length > 0) {
      lines.push(`> ${r.notes.join(" | ")}`);
      lines.push("");
    }

    const metricRows = Object.entries(r.metrics)
      .filter(([, v]) => typeof v !== "object" || v === null)
      .map(([k, v]) => [
        `\`${k}\``,
        typeof v === "number" ? formatNumber(v) : String(v),
      ]);

    if (metricRows.length > 0) {
      lines.push(mdTable(["Metric", "Value"], metricRows));
      lines.push("");
    }

    // Query-level details
    if (r.queries.length > 0) {
      lines.push(`<details><summary>${r.queries.length} queries</summary>`);
      lines.push("");
      for (const q of r.queries) {
        lines.push(`- **${truncate(q.query, 100)}**`);
        const metricEntries = Object.entries(q.metrics)
          .filter(([, v]) => typeof v !== "object" && !Array.isArray(v))
          .map(([k, v]) => `${k}=${typeof v === "number" ? formatNumber(v) : v}`);
        if (metricEntries.length > 0) {
          lines.push(`  - ${metricEntries.join(", ")}`);
        }
      }
      lines.push("");
      lines.push("</details>");
      lines.push("");
    }
  }

  lines.push("---");
  lines.push("");
  lines.push(`*Generated from [AuditCrux](https://github.com/CueCrux/AuditCrux) canonical results.*`);

  return lines.join("\n");
}

function generateLedgerIndex(runs: AuditRun[]): string {
  const lines: string[] = [];

  lines.push("# Benchmark Ledger");
  lines.push("");
  lines.push("Living index of all canonical audit runs. Each run page contains pass/fail matrix, per-category metrics, and query-level details.");
  lines.push("");
  lines.push("Evidence is generated from [CueCrux/AuditCrux](https://github.com/CueCrux/AuditCrux) (MIT) canonical results.");
  lines.push("");

  // Summary stats
  const totalPassed = runs.reduce((sum, r) => sum + r.results.filter((c) => c.passed).length, 0);
  const totalCategories = runs.reduce((sum, r) => sum + r.results.length, 0);
  lines.push(`**${runs.length} canonical runs** | **${totalPassed}/${totalCategories} categories passed** | [Changelog](changelog.md) | [Latest (JSON)](latest.json)`);
  lines.push("");

  // Run table
  const headers = ["Run ID", "Suite", "Embedding", "Date", "Duration", "Pass Rate", "Details"];
  const rows = runs.map((run) => {
    const summary = summarizeRun(run);
    return [
      `\`${run.runId}\``,
      run.suite,
      run.embedding,
      formatDate(run.startedAt),
      formatDuration(summary.durationMs),
      `**${summary.passRate}**`,
      `[View](run-${run.runId}.md)`,
    ];
  });

  lines.push(mdTable(headers, rows));
  lines.push("");

  // Category legend
  lines.push("## Category Reference");
  lines.push("");
  lines.push(mdTable(
    ["Category", "Name", "Tests"],
    [
      ["cat1", "Supersession / Relation-bootstrapped Retrieval", "Amendment detection, ranking accuracy"],
      ["cat2", "Format-aware Retrieval", "Cross-format recall (MD, JSON, CSV, YAML, chat, notes)"],
      ["cat3", "Retrieval Lane Decomposition", "BM25 vs vector vs hybrid isolation"],
      ["cat4", "Temporal Reconstruction / Scale Degradation", "Point-in-time accuracy, recall under scale"],
      ["cat5", "Receipt Chain Verification", "Chain depth, integrity, latency"],
      ["cat6", "Fragility Calibration", "Leave-one-out analysis, domain diversity"],
    ],
  ));
  lines.push("");

  lines.push("---");
  lines.push("");
  lines.push("*This ledger is regenerated from source by running `npm run ledger:generate`.*");

  return lines.join("\n");
}

function generateChangelog(runs: AuditRun[]): string {
  const lines: string[] = [];

  lines.push("# Benchmark Changelog");
  lines.push("");
  lines.push("Metric deltas between canonical runs, grouped by suite.");
  lines.push("");

  // Group runs by suite
  const bySuite = new Map<string, AuditRun[]>();
  for (const run of runs) {
    const key = run.suite;
    if (!bySuite.has(key)) bySuite.set(key, []);
    bySuite.get(key)!.push(run);
  }

  for (const [suite, suiteRuns] of bySuite) {
    if (suiteRuns.length < 2) {
      lines.push(mdSection(2, `Suite ${suite}`, "Single run — no deltas to report."));
      lines.push("");
      continue;
    }

    lines.push(`## Suite ${suite}`);
    lines.push("");

    // Compare OpenAI vs nomic runs
    const openai = suiteRuns.find((r) => r.embedding === "OpenAI");
    const nomic = suiteRuns.find((r) => r.embedding === "EmbedderCrux/nomic");

    if (openai && nomic) {
      lines.push(`### OpenAI (\`${openai.runId}\`) vs EmbedderCrux/nomic (\`${nomic.runId}\`)`);
      lines.push("");

      const oSum = summarizeRun(openai);
      const nSum = summarizeRun(nomic);

      lines.push(mdTable(
        ["Metric", "OpenAI", "EmbedderCrux/nomic", "Delta"],
        [
          ["Pass Rate", oSum.passRate, nSum.passRate, comparePasses(oSum, nSum)],
          ["Duration", formatDuration(oSum.durationMs), formatDuration(nSum.durationMs), formatDuration(nSum.durationMs - oSum.durationMs)],
        ],
      ));
      lines.push("");

      // Per-category comparison
      const catKeys = [...oSum.categories.keys()];
      const catRows: string[][] = [];
      for (const key of catKeys) {
        const oResult = oSum.categories.get(key);
        const nResult = nSum.categories.get(key);
        if (oResult && nResult) {
          catRows.push([
            key,
            oResult.passed ? "PASS" : "FAIL",
            nResult.passed ? "PASS" : "FAIL",
            oResult.passed === nResult.passed ? "=" : "CHANGED",
          ]);
        }
      }
      if (catRows.length > 0) {
        lines.push(mdTable(["Category:Mode", "OpenAI", "nomic", "Delta"], catRows));
        lines.push("");
      }
    }
  }

  lines.push("---");
  lines.push("");
  lines.push("*Generated by `npm run ledger:generate`.*");

  return lines.join("\n");
}

function generateLatestJson(runs: AuditRun[]): Record<string, unknown> {
  // Pick latest run per suite (prefer nomic for production)
  const latest: Record<string, unknown> = {};

  for (const run of runs) {
    const key = `${run.suite}_${run.embedding.includes("nomic") ? "nomic" : "openai"}`;
    const summary = summarizeRun(run);
    latest[key] = {
      runId: run.runId,
      suite: run.suite,
      embedding: run.embedding,
      date: formatDate(run.startedAt),
      passRate: summary.passRate,
      totalCategories: summary.totalCategories,
      passed: summary.passed,
      failed: summary.failed,
      durationMs: summary.durationMs,
    };
  }

  return {
    generatedAt: new Date().toISOString(),
    runs: latest,
  };
}

// ============================================================
// Helpers
// ============================================================

const CAT_NAMES: Record<string, string> = {
  cat1: "Supersession / Relation-bootstrapped Retrieval",
  cat2: "Format-aware Retrieval",
  cat3: "Retrieval Lane Decomposition",
  cat4: "Temporal Reconstruction / Scale Degradation",
  cat5: "Receipt Chain Verification",
  cat6: "Fragility Calibration",
};

function catName(cat: string): string {
  return CAT_NAMES[cat] ?? cat;
}

function extractKeyMetric(cat: string, metrics: Record<string, unknown>): string {
  const m = metrics;
  if (cat === "cat1") {
    const recall = m.avg_recall ?? m.recall;
    return recall !== undefined ? `recall=${formatNumber(recall as number)}` : "—";
  }
  if (cat === "cat2") {
    const r = m.avg_retrieved_recall ?? m.avg_citation_recall;
    return r !== undefined ? `avg_recall=${formatNumber(r as number)}` : "—";
  }
  if (cat === "cat3") {
    return m.bm25_retrieved_recall !== undefined
      ? `bm25=${formatNumber(m.bm25_retrieved_recall as number)}`
      : "—";
  }
  if (cat === "cat4") {
    const acc = m.accuracy ?? m.lifecycle_accuracy;
    return acc !== undefined ? `accuracy=${formatNumber(acc as number)}` : "—";
  }
  if (cat === "cat5") {
    const depth = m.max_depth ?? m.chain_depth;
    return depth !== undefined ? `depth=${depth}` : "—";
  }
  if (cat === "cat6") {
    const f = m.fragility_score ?? m.f1_fragility;
    return f !== undefined ? `fragility=${formatNumber(f as number)}` : "—";
  }
  return "—";
}

function comparePasses(
  a: ReturnType<typeof summarizeRun>,
  b: ReturnType<typeof summarizeRun>,
): string {
  const diff = b.passed - a.passed;
  if (diff === 0) return "=";
  return diff > 0 ? `+${diff}` : `${diff}`;
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

// --- Run ---
main();
