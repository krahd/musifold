# Cross-Repository Administration

Global repository registry, cross-domain status, and the master calendar are maintained in `krahd/tom-work-admin`.

This repository remains canonical for **Musifold** source, tests, documentation, deployment, and project-specific technical state.

Any manuscript or publication artefact belongs canonically in `krahd/academic-writing`; submission-specific professional or artistic packages belong in `krahd/professional-opportunities`; grant, funding, and compute application packages belong in `krahd/grant-applications`.

## Temporary cross-project deployment mirror

`deployments/history-through-cu/` is an explicit temporary exception to this repository's normal project boundary. It is **not Musifold source** and must not be treated as canonical for that project.

It exists solely so the already configured public GitHub Pages deployment can expose the **History Through CU** CU150 prototype while the new private `krahd/history-through-cu` repository awaits its own Pages activation.

Canonical History Through CU source remains:

`krahd/history-through-cu/site/`

The deployed mirror should be removed after `krahd/history-through-cu` has a verified direct public Pages deployment.

## Mandatory synchronisation rule

`krahd/tom-work-admin` **must be kept current** whenever work here materially changes the project's administratively meaningful state. Updating the administration repository is part of completing the change, not optional later cleanup.

Update this repository first for substantive project changes, then update `krahd/tom-work-admin` in the same work session when any of the following changes:

- project lifecycle state, scope, supported musical/reference functionality, or major technical direction;
- release/version, deployment, public availability, compatibility, test status, or major validation milestone;
- relationship to another active project, manuscript, submission, grant, repository, or other cross-domain dependency;
- deadline, release target, deprecation, or other material cross-domain date;
- current next action or major technical/content gate.

## Ownership boundary

Keep source, tests, documentation, deployment configuration, and project-specific evidence here. `tom-work-admin` stores only the concise cross-repository view and must point back to canonical project sources rather than duplicate them.

The temporary History Through CU directory remains a generated deployment artefact whose substantive source is owned elsewhere.

## Completion check

Before considering a material project-state change complete, verify that:

1. this repository reflects the substantive change;
2. `krahd/tom-work-admin` reflects any resulting global status, relationship, date, or next-action change;
3. related domain repositories are updated where the change affects them;
4. no stale cross-domain status remains in `tom-work-admin`.
