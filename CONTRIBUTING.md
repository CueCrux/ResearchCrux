# Contributing to ResearchCrux

ResearchCrux is the public evidence and protocol layer for [CueCrux](https://github.com/CueCrux). It contains the CROWN Receipt Protocol specification, benchmark evidence, and an independent verification library. Contributions are welcome.

## What we're looking for

### Protocol feedback and extensions

The CROWN Receipt Protocol (v0.1) is an open specification under CC BY 4.0. We welcome:

- **Issues** identifying ambiguities, gaps, or inconsistencies in the protocol spec
- **Protocol extension proposals** for new use cases (e.g., multi-party verification, alternative hash algorithms, COSE envelope wrapping for SCITT compatibility)
- **Review of the SCITT alignment** (Section 8) — especially from anyone involved in IETF SCITT or related standards work

### Verification implementations

The `verify/` directory contains a reference verification library in TypeScript. We welcome:

- **Alternative language implementations** — Python, Go, Rust, or any language with BLAKE3 + ed25519 support. Independent implementations strengthen the protocol's credibility as a standard.
- **Bug reports** where the verification library disagrees with the protocol spec
- **Test vectors** — additional receipt examples that exercise edge cases (chain forks, legacy SHA256 hashes, unsigned receipts, key rotation scenarios)

### Evidence and benchmark contributions

- **Independent benchmark runs** using the [AuditCrux](https://github.com/CueCrux/AuditCrux) test suite
- **Regulatory mapping updates** — corrections or additions to `evidence/regulatory-mapping.md` as the EU AI Act, DORA, and other frameworks evolve

## How to contribute

1. **Open an issue first** for non-trivial changes — this lets us align on scope before you invest time.
2. **Fork and branch** from `main`.
3. **Run CI locally** before submitting:
   ```bash
   # Root: typecheck + schema validation + markdown lint
   npm ci && npm run ci && npm run lint:md

   # Verify library
   cd verify && npm ci && npm test
   ```
4. **Submit a pull request** with a clear description of what changed and why.

## What we won't merge

- Changes that introduce CueCrux product dependencies into the `verify/` library or the protocol spec. The independence property is load-bearing.
- Backward-incompatible changes to the receipt schema within a major version (see Section 9.1).
- Marketing content. ResearchCrux is an evidence layer, not a product page.

## Code of conduct

Be respectful, constructive, and specific. We're building an open standard — disagreement is expected and valuable when it's about the protocol, not the people.

## License

All contributions are licensed under [CC BY 4.0](LICENSE), consistent with the rest of ResearchCrux.
