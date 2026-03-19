/**
 * Ed25519 signature verification for CROWN receipts.
 *
 * Uses @noble/curves — pure JavaScript, audited, no native bindings.
 * Verifies signatures as specified in Section 4.2 of the CROWN Protocol v0.1.
 */

import { ed25519 } from "@noble/curves/ed25519";

/**
 * Verify an ed25519 signature against a message and public key.
 *
 * @param signatureB64 - Base64-encoded raw ed25519 signature bytes
 * @param message - The message that was signed (the receipt hash string)
 * @param publicKeyB64 - Base64-encoded ed25519 public key
 * @returns true if signature is valid, false otherwise
 */
export function verifySignature(
  signatureB64: string,
  message: string,
  publicKeyB64: string
): boolean {
  try {
    const signature = base64ToBytes(signatureB64);
    const publicKey = base64ToBytes(publicKeyB64);
    const messageBytes = new TextEncoder().encode(message);

    return ed25519.verify(signature, messageBytes, publicKey);
  } catch {
    return false;
  }
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
