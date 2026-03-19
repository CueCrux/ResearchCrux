/**
 * Validates all proof-gallery JSON examples against their CROWN schemas.
 * Exit code 0 = all valid, 1 = validation failures found.
 */
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { readFileSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SCHEMA_DIR = join(ROOT, "proof-gallery", "schema");
const EXAMPLES_DIR = join(ROOT, "proof-gallery", "examples");
const REDACTED_DIR = join(ROOT, "proof-gallery", "redacted");

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

// Load schemas
const receiptSchema = JSON.parse(
  readFileSync(join(SCHEMA_DIR, "crown-receipt.schema.json"), "utf-8")
);
const evidenceSchema = JSON.parse(
  readFileSync(join(SCHEMA_DIR, "crown-evidence.schema.json"), "utf-8")
);

const validateReceipt = ajv.compile(receiptSchema);
const validateEvidence = ajv.compile(evidenceSchema);

let failures = 0;
let passes = 0;

function validateSingleReceipt(data: unknown, label: string): void {
  const valid = validateReceipt(data);
  if (!valid) {
    console.error(`FAIL  ${label}`);
    for (const err of validateReceipt.errors ?? []) {
      console.error(`      ${err.instancePath || "/"} ${err.message}`);
    }
    failures++;
  } else {
    console.log(`PASS  ${label}`);
    passes++;
  }

  // Also validate each evidence record individually
  const rec = data as Record<string, unknown>;
  if (Array.isArray(rec.evidence)) {
    for (let i = 0; i < rec.evidence.length; i++) {
      const evValid = validateEvidence(rec.evidence[i]);
      if (!evValid) {
        console.error(`FAIL  ${label} → evidence[${i}]`);
        for (const err of validateEvidence.errors ?? []) {
          console.error(`      ${err.instancePath || "/"} ${err.message}`);
        }
        failures++;
      }
    }
  }
}

function validateFile(filePath: string, label: string): void {
  const data = JSON.parse(readFileSync(filePath, "utf-8"));

  // Handle chain files (array of receipts wrapped in { chain: [...] })
  if (data.chain && Array.isArray(data.chain)) {
    for (let i = 0; i < data.chain.length; i++) {
      validateSingleReceipt(data.chain[i], `${label} → chain[${i}]`);
    }
  } else {
    validateSingleReceipt(data, label);
  }
}

// Validate example receipts
const exampleFiles = readdirSync(EXAMPLES_DIR).filter((f) =>
  f.endsWith(".json")
);
for (const file of exampleFiles) {
  validateFile(join(EXAMPLES_DIR, file), `examples/${file}`);
}

// Validate redacted receipts (only those that look like receipts)
const redactedFiles = readdirSync(REDACTED_DIR).filter(
  (f) => f.endsWith(".json") && f.includes("receipt")
);
for (const file of redactedFiles) {
  validateFile(join(REDACTED_DIR, file), `redacted/${file}`);
}

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures > 0 ? 1 : 0);
