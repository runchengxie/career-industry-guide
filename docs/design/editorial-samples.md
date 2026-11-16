# Editorial design samples

Scope: homepage plus all 3 industry pages and all 13 role pages. The rollout keeps the same structure everywhere; there is no sample-only branch left in the templates.

Status (2026-11-16): rolled out. The earlier sample used per-page conditionals; those are gone. `scripts/check-editorial.mjs` now asserts the structure on every industry and role page instead of asserting sample-specific copy.

## Direction

Keep the warm paper, pine green, serif headings and restrained research character. Improve the sequence from intent → boundary → industry → role → evidence. Do not add rankings, estimated salaries, invented job tasks or new data.

- Home: short value proposition, visible verified-role count derived from the dataset, compact industry introductions. Keep the existing complete comparison/filter and sources. Detailed scope is expandable, not removed.
- Every industry: an overview drawn from the existing comparison fields, with links to roles, evidence and unknowns. The medical-care caveat belongs only on the elderly-care page.
- Every role: label the material as a research lead, add the same task-oriented navigation and practice presentation. Existing business descriptions must not become asserted job duties or hiring criteria.
- Shared layout gains an opt-in compact notice; charts and datasets are untouched.

## Verification

Run repository checks, rendered-page regression assertions, and desktop/mobile/light/dark browser checks. Check narrow viewports for overflow and preserve keyboard focus, source anchors, no-JavaScript reading and URL-based filters. Keep this work in a draft PR, not deployed, pending review.
