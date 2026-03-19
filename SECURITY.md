# Security Policy

## Scope

This policy covers:

- The **CROWN Receipt Protocol** specification (`protocol/`)
- The **crown-verify** reference verification library (`verify/`)
- The **JSON schemas** and **test vectors** used for validation

This policy does **not** cover the CueCrux Engine implementation of CROWN, which has its own security practices.

## Reporting a vulnerability

If you discover a security issue in the CROWN protocol specification or the crown-verify library, please report it responsibly.

**Email:** security@cuecrux.com

Please include:

- A description of the vulnerability
- Steps to reproduce or a proof of concept
- The affected component (protocol spec, verify library, schemas, test vectors)
- Your assessment of severity and impact

**Do not** open a public GitHub issue for security vulnerabilities.

## Response

- We will acknowledge your report within **48 hours**.
- We will provide an initial assessment within **5 business days**.
- We will coordinate disclosure timing with you before any public announcement.

## What qualifies as a security issue

- Flaws in the CROWN hash chain construction that allow undetected tampering
- Weaknesses in the canonical JSON serialisation that produce hash collisions
- Signature verification bypasses in crown-verify
- Ambiguities in the protocol spec that could lead implementations to accept invalid receipts
- Test vectors that are internally inconsistent (would cause correct implementations to fail)

## What does not qualify

- Bugs in the CueCrux Engine (report to the Engine repo)
- Feature requests or protocol extension proposals (use GitHub Issues)
- The fact that CROWN receipts prove process, not truth (this is by design — see Section 1 of the protocol spec)

## Cryptographic dependencies

The crown-verify library uses:

- [@noble/hashes](https://github.com/paulmillr/noble-hashes) (BLAKE3, SHA256) — audited by Cure53
- [@noble/curves](https://github.com/paulmillr/noble-curves) (ed25519) — audited by Cure53

If you discover vulnerabilities in these upstream libraries, please report them to their respective maintainers and notify us so we can assess impact on CROWN verification.
