/**
 * Hashing functions for CROWN receipt verification.
 *
 * Uses @noble/hashes for both BLAKE3 and SHA256 — pure JavaScript,
 * no native bindings, no CueCrux dependencies.
 */

import { blake3 } from "@noble/hashes/blake3";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";

/**
 * Compute a prefixed hash of the input string.
 *
 * The algorithm is selected based on the prefix of the stored receipt hash,
 * as specified in Section 3.3. BLAKE3 is the default; SHA256 is used for
 * backward compatibility with legacy receipts.
 */
export function computeHash(
  input: string,
  algorithm: "blake3" | "sha256" = "blake3"
): string {
  const bytes = new TextEncoder().encode(input);
  if (algorithm === "sha256") {
    return `sha256:${bytesToHex(sha256(bytes))}`;
  }
  return `blake3:${bytesToHex(blake3(bytes))}`;
}

/**
 * Detect which hash algorithm was used from a prefixed hash string.
 */
export function detectAlgorithm(
  prefixedHash: string
): "blake3" | "sha256" | "unknown" {
  if (prefixedHash.startsWith("blake3:")) return "blake3";
  if (prefixedHash.startsWith("sha256:")) return "sha256";
  return "unknown";
}
