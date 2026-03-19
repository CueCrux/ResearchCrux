#!/usr/bin/env node
/**
 * crown-verify CLI — Verify CROWN receipt chains from the command line.
 *
 * Usage:
 *   crown-verify <receipt.json>           Verify a single receipt
 *   crown-verify <chain.json>             Verify a receipt chain
 *   crown-verify <file1> <file2> ...      Verify multiple files
 *   cat receipt.json | crown-verify -     Read from stdin
 *
 * Exit codes:
 *   0 = all receipts valid
 *   1 = verification failures found
 *   2 = usage error
 */

import { readFileSync } from "node:fs";
import { verifyReceipt, verifyChain } from "./verify.js";
import type { CrownReceipt, ChainVerifyResult, VerifyResult } from "./types.js";

function usage(): never {
  console.error("Usage: crown-verify <receipt.json> [receipt2.json ...]");
  console.error("       cat receipt.json | crown-verify -");
  process.exit(2);
}

function readInput(path: string): string {
  if (path === "-") {
    return readFileSync(0, "utf-8");
  }
  return readFileSync(path, "utf-8");
}

function printResult(result: VerifyResult): void {
  const status = result.valid ? "PASS" : "FAIL";
  const sig =
    result.signatureValid === null
      ? "unsigned"
      : result.signatureValid
        ? "sig:valid"
        : "sig:INVALID";
  const hash = result.hashMatch ? "hash:ok" : "hash:MISMATCH";

  console.log(`  ${status}  ${result.receiptId}  [${hash}, ${sig}]`);

  for (const b of result.breaks) {
    console.log(`         ${b.reason}`);
    if (b.expected) console.log(`         expected: ${b.expected}`);
    if (b.actual) console.log(`         actual:   ${b.actual}`);
  }
}

function printChainResult(result: ChainVerifyResult, label: string): void {
  const status = result.valid ? "PASS" : "FAIL";
  console.log(`${status}  ${label}  (depth: ${result.depth})`);
  for (const r of result.receipts) {
    printResult(r);
  }
  // Print chain-level breaks (linkage issues)
  const chainBreaks = result.breaks.filter(
    (b) =>
      b.reason.includes("Chain linkage") || b.reason.includes("Chain root")
  );
  for (const b of chainBreaks) {
    console.log(`  FAIL  ${b.reason}`);
  }
}

function main(): void {
  const args = process.argv.slice(2);
  if (args.length === 0) usage();

  let failures = 0;
  let total = 0;

  for (const path of args) {
    const raw = readInput(path);
    const data = JSON.parse(raw);

    if (data.chain && Array.isArray(data.chain)) {
      // Chain file
      const result = verifyChain(data as { chain: CrownReceipt[] });
      printChainResult(result, path);
      total += result.depth;
      failures += result.breaks.length;
    } else if (Array.isArray(data)) {
      // Array of receipts
      const result = verifyChain(data as CrownReceipt[]);
      printChainResult(result, path);
      total += result.depth;
      failures += result.breaks.length;
    } else {
      // Single receipt
      const result = verifyReceipt(data as CrownReceipt);
      const label = path === "-" ? "stdin" : path;
      console.log(
        `${result.valid ? "PASS" : "FAIL"}  ${label}`
      );
      printResult(result);
      total++;
      if (!result.valid) failures++;
    }
  }

  console.log(`\n${total} receipt(s) checked, ${failures} issue(s)`);
  process.exit(failures > 0 ? 1 : 0);
}

main();
