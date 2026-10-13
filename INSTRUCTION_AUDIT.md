# Instruction cleanup — 2026-10-14

Global instructions were reduced from 2,737 words to about 1,120. Repeated Conventional Commits rules and dependency-debugging instructions were consolidated. Dated project anecdotes and repeated explanations were removed.

Preserved: explicit commit/push/PR gates, runtime proof before upstream PRs, one-line comments, deleted-comment rulings, interface/body-destructuring/RGBA preferences, independent RN worktree dependencies, disabled skills, Pstack host compatibility, and installer ownership. An independent review checked those semantics.

Human-writing now preserves requirements and caveats instead of demanding 30–50% cuts. It allows necessary context, retains exact quotes/code/identifiers, distinguishes proposals from facts, and no longer forces first person or treats every rewrite as loss of meaning. Sending still needs authorization.

Technical corrections:

- Gradient props are version-specific; use installed types and matching docs rather than universally mandating experimental_backgroundImage. Current docs expose backgroundImage. [RN View style props](https://reactnative.dev/docs/view-style-props)
- Modern RN effects require architecture/platform support checks; boxShadow/filter/mixBlendMode are not universal replacements across targets. [RN View style props](https://reactnative.dev/docs/view-style-props)
- startTransition changes React update priority; its callback runs immediately, so it is not a general delayed-work scheduler. [React startTransition](https://react.dev/reference/react/startTransition)
- Keep idle work, frame work, and actual navigation completion separate. [RN InteractionManager](https://reactnative.dev/docs/0.82/interactionmanager), [React Navigation transitionEnd](https://reactnavigation.org/docs/stack-navigator/#transitionend)
- Metro can support configured symlinks; the user's policy remains narrower: do not share a whole RN worktree node_modules by symlink. [Metro watchFolders](https://metrobundler.dev/docs/configuration/#watchfolders)

Verification: shared metadata/link validation, diff checks, independent semantic review, and live delivery checks. No application code or native dependency was changed, so a device build is not evidence needed for these prose changes.
