---
'elden-ring-github': patch
---

Fix PR creation banner not appearing under GitHub's Turbo soft navigation. The compare form now submits without a full page reload, so `checkForPRCreationSuccess` is re-checked on DOM change (not only on init), mirroring the close feature.
