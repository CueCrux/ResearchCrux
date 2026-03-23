/**
 * COSE_Sign1 verification for CROWN receipts (RFC 9052 §4.2).
 *
 * Parses CBOR-encoded COSE_Sign1 envelopes and verifies ed25519 signatures
 * over the Sig_structure. Requires cbor-x for CBOR decoding.
 *
 * The COSE_Sign1 payload may be CBOR-encoded (kebab-case keys per CDDL) or
 * legacy canonical JSON. After envelope verification, the payload can be
 * extracted and passed to the standard receipt verifier for hash chain checks.
 */

import { ed25519 } from "@noble/curves/ed25519";

// Re-export for CLI
export type CoseVerifyResult = {
  valid: boolean;
  signatureValid: boolean;
  payloadBytes: Uint8Array | null;
  kid: string | null;
  contentType: string | null;
  /** CWT issuer claim (iss) from protected header, if present */
  issuer: string | null;
  /** CWT subject claim (sub) from protected header, if present */
  subject: string | null;
  error?: string;
};

// COSE header labels
const COSE_HEADER_ALG = 1;
const COSE_HEADER_CONTENT_TYPE = 3;
const COSE_HEADER_KID = 4;

/** Get a value from a Map or plain object (cbor-x may return either for CBOR maps). */
function mapGet(mapOrObj: unknown, key: number | string): unknown {
  if (mapOrObj instanceof Map) return mapOrObj.get(key);
  if (mapOrObj && typeof mapOrObj === "object") return (mapOrObj as Record<string | number, unknown>)[key];
  return undefined;
}

/**
 * Verify a COSE_Sign1 envelope and extract the payload.
 *
 * @param envelope - CBOR-encoded COSE_Sign1 bytes
 * @param publicKeyB64 - Base64-encoded ed25519 public key
 * @returns Verification result with extracted payload on success
 */
export async function verifyCoseSign1(
  envelope: Uint8Array,
  publicKeyB64: string,
): Promise<CoseVerifyResult> {
  try {
    // Dynamic import cbor-x (optional dependency)
    const { decode: cborDecode, encode: cborEncode } = await import("cbor-x");

    // Decode COSE_Sign1 array — may be plain array or CBOR tag 18 wrapped
    let decoded = cborDecode(envelope);
    // cbor-x decodes CBOR tag 18 as a Tagged object with a .value property
    if (decoded && typeof decoded === "object" && !Array.isArray(decoded) && "value" in decoded) {
      decoded = (decoded as { value: unknown }).value;
    }
    if (!Array.isArray(decoded) || decoded.length !== 4) {
      return {
        valid: false,
        signatureValid: false,
        payloadBytes: null,
        kid: null,
        contentType: null,
        issuer: null,
        subject: null,
        error: `Invalid COSE_Sign1: expected 4-element array, got ${Array.isArray(decoded) ? decoded.length : typeof decoded}`,
      };
    }

    const [protectedRaw, unprotectedRaw, payloadRaw, signatureRaw] = decoded;

    const protectedBytes = protectedRaw instanceof Uint8Array
      ? protectedRaw
      : new Uint8Array(protectedRaw);
    const payload = payloadRaw instanceof Uint8Array
      ? payloadRaw
      : new Uint8Array(payloadRaw);
    const signature = signatureRaw instanceof Uint8Array
      ? signatureRaw
      : new Uint8Array(signatureRaw);

    // Decode protected header for metadata (cbor-x may return Map or plain object)
    const protectedHeader = cborDecode(protectedBytes);
    const contentType = mapGet(protectedHeader, COSE_HEADER_CONTENT_TYPE);

    // Extract kid — check protected header first (SCITT-compliant), then unprotected (legacy)
    let kid: string | null = null;
    const protectedKidBuf = mapGet(protectedHeader, COSE_HEADER_KID);
    if (protectedKidBuf instanceof Uint8Array) {
      kid = new TextDecoder().decode(protectedKidBuf);
    } else if (typeof protectedKidBuf === "string") {
      kid = protectedKidBuf;
    } else {
      const unprotectedKidBuf = mapGet(unprotectedRaw, COSE_HEADER_KID);
      if (unprotectedKidBuf instanceof Uint8Array) {
        kid = new TextDecoder().decode(unprotectedKidBuf);
      } else if (typeof unprotectedKidBuf === "string") {
        kid = unprotectedKidBuf;
      }
    }

    // Extract CWT Claims (label 15) from protected header
    let issuer: string | null = null;
    let subject: string | null = null;
    const cwtClaims = mapGet(protectedHeader, 15); // COSE_HEADER_CWT_CLAIMS
    if (cwtClaims && typeof cwtClaims === "object") {
      const iss = mapGet(cwtClaims, 1); // CWT_CLAIM_ISS
      if (typeof iss === "string") issuer = iss;
      const sub = mapGet(cwtClaims, 2); // CWT_CLAIM_SUB
      if (typeof sub === "string") subject = sub;
    }

    // Build Sig_structure: ["Signature1", protected_bytes, b"", payload]
    // Use Buffer (not Uint8Array) to avoid cbor-x adding typed-array tags (d840)
    const sigStructure = [
      "Signature1",
      Buffer.from(protectedBytes),
      Buffer.alloc(0), // external_aad: empty
      Buffer.from(payload),
    ];
    const sigStructureBytes = cborEncode(sigStructure);

    // Verify ed25519 signature
    const publicKey = base64ToBytes(publicKeyB64);
    const signatureValid = ed25519.verify(
      signature,
      new Uint8Array(sigStructureBytes),
      publicKey,
    );

    return {
      valid: signatureValid,
      signatureValid,
      payloadBytes: payload,
      kid,
      contentType: typeof contentType === "string" ? contentType : null,
      issuer,
      subject,
    };
  } catch (err) {
    return {
      valid: false,
      signatureValid: false,
      payloadBytes: null,
      kid: null,
      contentType: null,
      issuer: null,
      subject: null,
      error: err instanceof Error ? err.message : String(err),
    };
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
