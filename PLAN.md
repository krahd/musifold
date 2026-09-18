# Musifold consolidation plan

## Objective

Make `krahd/musifold` the canonical home for the broader cross-instrument music-geometry project and for *Piano Without Fear of Black Keys*, while preserving Ableton Note Helper as explicit project lineage rather than collapsing the two repositories.

## Definition of done

The consolidation is complete when:

1. Musifold states its broad project identity accurately without claiming software features that do not yet exist.
2. *Piano Without Fear of Black Keys* has one canonical source tree inside Musifold, with reproducible PDF build instructions and the v1.3 register/shape revision fully reconciled.
3. The book's stale three-layer/physical-realisation language is removed where it conflicts with the four-layer model: function → pitch spelling → register → instrument geometry.
4. The final PDF builds from the repository source, passes structural preflight, and is visually checked after the final source change.
5. Musifold's repository documentation and cross-repository administration boundary describe the book and Ableton Note Helper relationship correctly.
6. `krahd/tom-work-admin` records Musifold as the canonical broader project and retains Ableton Note Helper only with its correct lineage/legacy relationship.
7. All repository mutations are committed and pushed on verified safe branches; protected-branch promotion is reported separately and never inferred.

## Canonical ownership

- `krahd/musifold`: Musifold software, project documentation, music-geometry pedagogy, and the canonical source/build of *Piano Without Fear of Black Keys*.
- `krahd/ableton-note-helper`: preserved predecessor/specific reference-tool lineage; do not rewrite its history as Musifold.
- Google Drive folder `Piano Without Fear of Black Keys`: historical/source mirror from before repository consolidation, not the future canonical source.
- `krahd/tom-work-admin`: global project identity, repository relationships, lifecycle, and cross-domain administrative state.

## In scope

- Recover and audit current Musifold state.
- Establish persistent project state in Musifold.
- Integrate the book under a Musifold-owned `book/` tree.
- Remove redundant split-source copies from the migrated form; keep one canonical Markdown manuscript plus assets/style/build metadata.
- Add a short scientific-pitch-notation convention because v1.3 exercises now use octave numbers.
- Fix the stale one-page-philosophy pipeline.
- Rebuild and visually audit the PDF.
- Update Musifold README, changelog and WORK-ADMIN boundary to reflect the book without overstating the current web app.
- Reconcile `tom-work-admin` after Musifold is verified.

## Out of scope

- Rewriting the existing Musifold web application into a piano/guitar trainer in this consolidation.
- Deleting or rewriting the Ableton Note Helper repository/history.
- Treating the temporary `deployments/history-through-cu/` mirror as Musifold source.
- Creating a separate repository for the book.

## Execution phases

### Phase 1 — Ground and persist

- Materialise current Musifold `main` and verify clean HEAD.
- Persist this audited plan plus `STATUS.md`, `WORKLOG.md`, and `CONTINUATION_PROMPT.md` on a safe branch.

Acceptance: state files accurately describe current evidence and one exact next action.

### Phase 2 — Book migration and conceptual reconciliation

- Start from the verified v1.3 artefact produced from the Drive v1.2 source.
- Create `book/` with one canonical manuscript, original SVG teaching assets, stylesheet, build script, book README, and the built PDF.
- Apply only the remaining conceptual corrections: scientific pitch-notation convention and four-layer wording in the one-page philosophy.
- Verify there are no conflicting ASCII transformation arrows or stale three-layer statements in the canonical manuscript.

Acceptance: migrated source is internally coherent and no independent duplicate source set can drift.

### Phase 3 — Musifold-facing integration

- Update root README to describe the software as the current implementation of a broader Musifold project and link the book as a first-class pedagogical artefact.
- Preserve explicit Ableton Note Helper lineage.
- Update WORK-ADMIN to make the book's project-specific source ownership explicit while leaving scholarly manuscripts/publication submissions in their normal domain repositories.
- Add a changelog entry for the consolidation.

Acceptance: project identity, current software capabilities, lineage, and book ownership are all distinguishable.

### Phase 4 — Build and adversarial document QA

- Build PDF from repository book source with Pandoc + WeasyPrint.
- Preflight the PDF and render representative pages, including cover/preface, the movable-shape section, cross-instrument exercise, dense appendix material, and final philosophy/source page.
- Fix clipping, sparse/broken pagination, glyph, or consistency defects and rerun checks.

Acceptance: reproducible final PDF passes structural and visual QA after the final content edit.

### Phase 5 — Central administration reconciliation

- Materialise current `krahd/tom-work-admin` and reconcile actual state before editing.
- Register or update Musifold's project/repository identity and relationships; correct stale Ableton Note Helper ownership claims without deleting historical provenance.
- Run configured validation if available.

Acceptance: central administration points to Musifold as the broad project home and contains no contradictory canonical-owner statement.

### Phase 6 — Completion audit

- Materialise the final safe branches and verify exact commits/content.
- Check required artefacts and state files against this plan.
- Record any protected-branch promotion still outside the bridge as an explicit external boundary rather than claiming it happened.

## Adversarial audit repairs

The plan deliberately avoids four failure modes found during recovery:

- **False repo creation:** no separate book repository is needed; Musifold already exists and is bridge-visible.
- **Conceptual duplication:** the migrated book will have one canonical Markdown manuscript rather than canonical-plus-split source copies that can drift.
- **Feature overclaim:** the root app currently implements Ableton Note/Push layouts; project positioning may broaden, but software copy must not imply piano/guitar UI that is not implemented.
- **Publication-boundary conflict:** the book is a Musifold project artefact/manual, not a scholarly manuscript submission; WORK-ADMIN will state that distinction explicitly rather than silently contradicting ecosystem policy.

## Recovery and timeout discipline

Every bridge mutation uses a fresh transaction ID, exact base SHA, and a small coherent patch. Dependent edits wait for the prior durable result. If a result or materialisation is ambiguous, inspect repository/mailbox reality before retrying. PDF build/render checks are performed locally from exact candidate source before repository publication of the built artefact.
