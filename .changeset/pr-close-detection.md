---
'elden-ring-github': patch
---

Fix the PR close banner never triggering. Closing a pull request posts the
Rails comment form (`name="comment_and_close"`), which the old
`.State.State--closed` MutationObserver could never observe — the same
GitHub Primer redesign that previously broke merge detection. Detection now
records the close intent in storage on click and celebrates only once the PR
header actually shows the closed `StateLabel`, consuming the flag on fire so a
plain refresh of an already-closed PR never re-triggers the banner.
