# Input-boundary fixes

Three source-audit leads were checked with dummy fixtures in an offline Docker sandbox before applying these fixes.

| Boundary | Before | After |
|---|---|---|
| HyperFrames project environment | A project-selected Python probe executable wrote a scratch marker. | Project files load only supported credential variables; the same probe marker is absent. Host interpreter overrides remain supported. |
| HyperFrames voice paths | A crafted line ID caused the unmodified Gemini writer to create a WAV outside a dummy project using an injected response. | Invalid or duplicate IDs and existing symlink destinations are rejected before synthesis. |
| Expense participants | An extra share produced local adapter calls totaling 125 for an declared amount of 100, including a null participant after serialization. | Unknown share keys fail before any account read or write; beneficiaries derive from the fixed participant set. |

No real provider, credential or financial account was used. The expense reproduction demonstrates malformed dispatch, not acceptance by a live provider. File-path checks cover project-supplied paths and static symlinks, not a concurrent process replacing directories after allocation.

Run `python3 scripts/test-security-boundaries.py` with Python 3 and a local Docker engine. The runner stages only the selected source directories, without Git metadata or environment files. Tests run without external networking, host credentials or a writable source mount, using a non-root user, a 64 MiB scratch filesystem, resource limits and a 50-second test deadline.

The same tests gate PRs and daily upstream updates. See [HyperFrames backports](packages/hyperframes/PATCHES.md) for override ownership and removal conditions. The expense helper's existing Bun tests remain available with `bun test scripts/expense-sync/`.
