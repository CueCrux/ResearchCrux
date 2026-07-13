# crown-verify — single-file standalone build

`crown-verify.mjs` is the entire CROWN receipt verifier bundled into **one
file**. No `npm install`, no CueCrux code, no network — any Node ≥ 20 runs it:

```bash
node crown-verify.mjs path/to/receipt.json
node crown-verify.mjs ../../protocol/test-vectors/vector-chain.json
```

It performs the full independent verification procedure from
[CROWN Protocol v0.1 §5.5](../../protocol/crown-receipt-protocol-v0.1.md#55-independent-verification):
canonical-payload reconstruction → BLAKE3 hash check → chain linkage →
Ed25519 signature check. Exit code is non-zero when any receipt fails.

Scope note (per the protocol): only the canonical-payload fields (§3.2) are
integrity-protected — extra fields outside that set do not affect the hash.
What a CROWN receipt proves and does not prove is enumerated in the
[assurance & coverage matrix](https://github.com/CueCrux/Crux/blob/main/docs/assurance-coverage-matrix.md).

## Reproducing this file

The bundle is deterministic from `verify/src` (esbuild, noble-hashes/curves
inlined — both pure-JS, audited):

```bash
cd verify
npm ci
npx esbuild src/cli.ts --bundle --platform=node --format=esm \
  --outfile=standalone/crown-verify.mjs --legal-comments=inline
```

Current build: `sha256 8631d81cb32034a2e68dda4de97ab969127c3031da3e45161fd1166313288dcb`
(from `verify/src` at the commit that last touched this directory — recompute
with `sha256sum crown-verify.mjs`).

## SCITT / COSE

CROWN receipts map to SCITT signed statements per the
[SCITT compatibility profile](../../protocol/scitt-compat/crown-scitt-profile.md);
COSE_Sign1 encoding examples live in
[`protocol/scitt-compat/cose-example/`](../../protocol/scitt-compat/cose-example/).
