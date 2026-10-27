# Local security backports

Base: `cea0bad7931122bd93680006978c0d9007daa3d4`, selected upstream `skills/` tree `e08b97448f7c672ea6d5606e6996170a58513b61`.

- `media-use/audio/scripts/lib/heygen.mjs`: project `.env` files load only supported credential keys. Interpreter, runtime-hook, destination and host configuration stays in the host environment.
- `media-use/audio/scripts/lib/media-record.mjs`: voice IDs must be bounded filename IDs and unique within a run. Chosen destinations must stay in `assets/voice`, with existing symlink components rejected. Existing-file numbering remains supported. This does not claim race-safe confinement against a concurrent process that can replace project directories after allocation.
- `media-use/audio/scripts/lib/heygen.test.mjs`: upstream environment-loading tests use supported credential variables and preserve the caller's environment.

These files and this note are declared in `backbone.json` as `local_files`. Upstream refresh preserves their complete local contents; changes to these same upstream files need a manual rebase. The shared security regression tests run in an isolated Docker container on PRs and before daily update PR creation.

Remove each override only when an upstream revision contains the equivalent fix and the same regressions pass without the override. Keep host-provided `HYPERFRAMES_PYTHON` working. Verify project credential loading, traversal and symlink rejection, ordinary IDs, generated-file reuse and numbered alternatives before removing the backport. Do not remove these overrides merely because the rest of the upstream package updated.
