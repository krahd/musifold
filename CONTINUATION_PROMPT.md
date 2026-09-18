# Musifold continuation prompt

Resume the Musifold consolidation using the persistent-adversarial-executor and llm-git-bridge-client workflows.

Read `STATUS.md` → `PLAN.md` → latest `WORKLOG.md` → this file, then inspect actual bridge/repository state before mutation. `krahd/musifold` is the canonical home for the broader music-geometry project and for *Piano Without Fear of Black Keys*. Preserve `krahd/ableton-note-helper` as predecessor/specific-tool lineage; do not collapse or rewrite its history.

Do not redo completed recovery. The verified starting Musifold main HEAD was `bffbb27d78c7242011c52e2c8640f947ca406409`. The recovered v1.3 book already contains the register/shape revision; only remaining known content corrections are the stale final philosophy pipeline and an explicit octave-number/scientific-pitch convention. Migrate a single canonical manuscript plus assets/style/build/PDF into `book/`, avoiding redundant split source copies.

Keep current software claims truthful: the web app currently implements Ableton Note/Push layouts, even though Musifold is the broader project. After book integration, rebuild with Pandoc + WeasyPrint and perform PDF preflight plus rendered visual QA. Then reconcile `krahd/tom-work-admin` from fresh actual state.

Use small, dependent bridge transactions. After any timeout or ambiguous operation inspect authoritative state before retrying. A safe-branch commit/push is not protected-branch promotion. Continue through all non-blocked phases without asking the user to say continue. Completion requires final artefacts, validations, accurate state files, central administration reconciliation, and an adversarial completion audit.
