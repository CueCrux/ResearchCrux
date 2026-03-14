import { readFileSync, readdirSync, existsSync } from "fs";
import { join, basename } from "path";

// --- Types matching AuditCrux result JSON ---

export interface QueryResult {
  query: string;
  metrics: Record<string, unknown>;
  notes: string[];
}

export interface CategoryResult {
  category: string;
  mode: string;
  passed: boolean;
  metrics: Record<string, unknown>;
  queries: QueryResult[];
  notes: string[];
}

export interface AuditRun {
  runId: string;
  startedAt: string;
  finishedAt: string;
  host: string;
  results: CategoryResult[];
  /** Derived metadata */
  sourceFile: string;
  suite: string;
  embedding: string;
}

/**
 * v1/v2 format uses `modes: { V1: { cat1: {...}, cat2: {...} }, V3.1: {...} }`
 * v3 format uses flat `results: [{ category, mode, passed, ... }]`
 */
function parseAuditJson(raw: string, sourceFile: string): AuditRun {
  const data = JSON.parse(raw);
  const { runId, startedAt, finishedAt, host } = data;

  let results: CategoryResult[];

  if (data.results && Array.isArray(data.results)) {
    // v3 flat format
    results = data.results;
  } else if (data.modes) {
    // v1/v2 nested format: modes.V1.cat1, modes.V3.1.cat2, etc.
    results = [];
    for (const [mode, cats] of Object.entries(data.modes)) {
      for (const catResult of Object.values(cats as Record<string, CategoryResult>)) {
        results.push({ ...catResult, mode });
      }
    }
  } else {
    throw new Error(`Unknown audit result format in ${sourceFile}`);
  }

  // Derive suite and embedding from filename
  const name = basename(sourceFile, ".json");
  const suite = deriveSuite(name);
  const embedding = deriveEmbedding(name);

  return { runId, startedAt, finishedAt, host, results, sourceFile, suite, embedding };
}

function deriveSuite(filename: string): string {
  if (filename.includes("v1")) return "v1";
  if (filename.includes("v2")) return "v2";
  if (filename.includes("v3")) return "v3";
  return "unknown";
}

function deriveEmbedding(filename: string): string {
  if (filename.includes("nomic")) return "EmbedderCrux/nomic";
  if (filename.includes("relation-expansion")) return "OpenAI (relation-expansion)";
  return "OpenAI";
}

export function readAuditCruxResults(auditCruxDir: string): AuditRun[] {
  const resultsDir = join(auditCruxDir, "results");
  if (!existsSync(resultsDir)) {
    console.warn(`AuditCrux results directory not found: ${resultsDir}`);
    return [];
  }

  const jsonFiles = readdirSync(resultsDir)
    .filter((f) => f.endsWith(".json") && !f.includes("embeddings-cache"));

  return jsonFiles.map((file) => {
    const raw = readFileSync(join(resultsDir, file), "utf-8");
    return parseAuditJson(raw, file);
  });
}

export function summarizeRun(run: AuditRun): {
  totalCategories: number;
  passed: number;
  failed: number;
  passRate: string;
  durationMs: number;
  categories: Map<string, { passed: boolean; mode: string; metrics: Record<string, unknown> }>;
} {
  const totalCategories = run.results.length;
  const passed = run.results.filter((r) => r.passed).length;
  const failed = totalCategories - passed;
  const passRate = `${passed}/${totalCategories}`;
  const durationMs =
    new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime();

  const categories = new Map<string, { passed: boolean; mode: string; metrics: Record<string, unknown> }>();
  for (const r of run.results) {
    categories.set(`${r.category}:${r.mode}`, {
      passed: r.passed,
      mode: r.mode,
      metrics: r.metrics,
    });
  }

  return { totalCategories, passed, failed, passRate, durationMs, categories };
}
