# MemoryCrux Benchmark — Governance Charter

**Date:** 2026-03-27
**Standard:** [MemoryCrux Benchmark Standard v1.0](memorycrux-benchmark-standard-v1.md)
**License:** CC BY 4.0

---

## 1. Benchmark Council

### Composition

| Role | Count | Requirement |
|------|-------|-------------|
| Internal member | 2 | CueCrux team, active benchmark contributor |
| External member | 1 | Independent researcher, engineer, or standards participant. Not employed by or contracted to CueCrux. |

**Quorum:** 2 of 3 members.

**Current council:**
- Internal: Myles Mayberry (lead), _TBD_ (second internal)
- External: _Open seat_ — nominations welcome via [CONTRIBUTING.md](../CONTRIBUTING.md)

### Term

- Internal members serve indefinitely or until replaced.
- External members serve 12-month terms, renewable.
- The external seat MUST be filled before the standard can advance to v2.0.

---

## 2. Decision Authority

| Change Type | Authority | Process |
|------------|-----------|---------|
| **Scoring bug fix** | Any maintainer | Ship immediately. Post-hoc council notification within 7 days. |
| **New project or arm** | Council (2/3) | Proposal → 14-day review → vote |
| **Methodology change** | Council (2/3) | Proposal → 14-day review → vote. Requires standard version bump. |
| **Exclusion rule change** | Council (2/3) | Proposal → 14-day review → vote |
| **Standard version bump (minor)** | Council (2/3) | Changes documented in changelog → vote |
| **Standard version bump (major)** | Council (3/3 unanimous) | 90-day notice → RFC → vote |
| **Deprecation** | Council (2/3) | 90-day notice → vote |
| **Fixture change** | Any maintainer | Requires fixture hash rotation. Council notification. |

---

## 3. Changelog Requirements

Every change to scoring, methodology, fixtures, or the standard MUST be recorded in the appropriate changelog:

- **AuditCrux METHODOLOGY.md:** Version header updated, change described.
- **ResearchCrux CHANGELOG.md:** Entry with date, description, council sign-off status.
- **Standard document:** Changelog table at end of document.

Each entry MUST include:
- Date
- Author
- Council sign-off status (approved / post-hoc / pending)
- Affected standard version

---

## 4. External Rerun Program

### Purpose

Enable third parties to independently verify benchmark results and earn a rerun badge.

### Process

1. **Request:** Third party submits a rerun request via GitHub issue on ResearchCrux.
2. **Setup:** Third party clones AuditCrux, installs harness, obtains API keys.
3. **Execution:** Run the full matrix on published fixtures using the published harness version.
4. **Submission:** Submit results (summary.json files) to the council.
5. **Verification:** Council compares results against published medians.
6. **Badge:** If results are within 1 standard deviation of published medians for ≥80% of cells, badge is awarded.

### Badge Display

Rerun badges are listed in ResearchCrux with:
- Organization name
- Date of rerun
- Harness version used
- Number of cells verified
- Link to submitted results (if the third party consents to publication)

---

## 5. Conflict of Interest

- CueCrux team members are the primary benchmark authors and MemoryCrux developers. This is a known and disclosed conflict.
- The external council seat exists specifically to counterbalance this conflict.
- All benchmark methodology, scoring code, and fixtures are public (CC BY 4.0 / MIT).
- The benchmark standard is designed to be adoptable by third parties without CueCrux involvement.

---

## 6. Amendment Process

This charter may be amended by unanimous council vote. Amendments take effect 30 days after approval.

---

## Changelog

| Date | Change | Author | Sign-off |
|------|--------|--------|----------|
| 2026-03-27 | Initial charter | Myles Mayberry | Post-hoc (council not yet fully constituted) |
