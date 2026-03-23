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
 *   crown-verify --cose <envelope.cbor> --pub <base64_pubkey>
 *                                         Verify a COSE_Sign1 envelope
 *
 * Exit codes:
 *   0 = all receipts valid
 *   1 = verification failures found
 *   2 = usage error
 */

import { readFileSync } from "node:fs";
import { verifyReceipt, verifyChain } from "./verify.js";
import { verifyCoseSign1 } from "./cose.js";
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

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length === 0) usage();

  // COSE_Sign1 verification mode
  const coseIdx = args.indexOf("--cose");
  if (coseIdx !== -1) {
    const cosePath = args[coseIdx + 1];
    const pubIdx = args.indexOf("--pub");
    const pubKey = pubIdx !== -1 ? args[pubIdx + 1] : undefined;
    if (!cosePath || !pubKey) {
      console.error("Usage: crown-verify --cose <envelope.cbor> --pub <base64_pubkey>");
      process.exit(2);
    }
    const envelopeBytes = readFileSync(cosePath);
    const result = await verifyCoseSign1(new Uint8Array(envelopeBytes), pubKey);
    const status = result.valid ? "PASS" : "FAIL";
    console.log(`${status}  ${cosePath}  [cose:${result.signatureValid ? "valid" : "INVALID"}]`);
    if (result.kid) console.log(`  kid: ${result.kid}`);
    if (result.contentType) console.log(`  content-type: ${result.contentType}`);
    if (result.issuer) console.log(`  issuer: ${result.issuer}`);
    if (result.subject) console.log(`  subject: ${result.subject}`);
    if (result.error) console.log(`  error: ${result.error}`);
    if (result.valid && result.payloadBytes) {
      // Try to extract and verify receipt from payload (JSON or CBOR)
      try {
        const payloadStr = new TextDecoder().decode(result.payloadBytes);
        const receipt = JSON.parse(payloadStr) as CrownReceipt;
        if (receipt.receiptHash || receipt.snapshotId) {
          console.log("  Embedded receipt (JSON) — verifying hash integrity...");
          const receiptResult = verifyReceipt({
            ...receipt,
            receiptId: receipt.receiptId ?? `cose_${cosePath}`,
            signature: { sigB64: "", kid: result.kid ?? "", pubB64: pubKey },
          });
          const hashStatus = receiptResult.hashMatch ? "ok" : "MISMATCH";
          console.log(`  hash: ${hashStatus}`);
        }
      } catch {
        // JSON parse failed — try CBOR decoding (kebab-case keys per CDDL)
        try {
          const { decode: cborDecode } = await import("cbor-x");
          const cborPayload = cborDecode(result.payloadBytes) as Record<string, unknown>;
          const receiptHash = cborPayload["receipt-hash"];
          const snapId = cborPayload["snap-id"];
          console.log("  Embedded receipt (CBOR, kebab-case keys)");
          if (typeof receiptHash === "string") console.log(`  receipt-hash: ${receiptHash}`);
          if (typeof snapId === "string") console.log(`  snap-id: ${snapId}`);
          const tenantId = cborPayload["tenant-id"];
          if (typeof tenantId === "string") console.log(`  tenant-id: ${tenantId}`);
        } catch {
          console.log("  Payload is opaque (not JSON or CBOR)");
        }
      }
    }
    console.log(`\n1 envelope checked, ${result.valid ? 0 : 1} issue(s)`);
    process.exit(result.valid ? 0 : 1);
  }

  let failures = 0;
  let total = 0;

  for (const path of args) {
    const raw = readInput(path);
    const data = JSON.parse(raw);

    if (data.chain && Array.isArray(data.chain)) {
      // Chain file — may be bare receipts or test vector wrappers
      const receipts = data.chain.map((item: Record<string, unknown>) =>
        item.receipt ? item.receipt : item
      ) as CrownReceipt[];
      const result = verifyChain(receipts);
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
      // Single receipt or test vector wrapper
      const receipt = (
        data.receipt ? data.receipt : data
      ) as CrownReceipt;
      const result = verifyReceipt(receipt);
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
