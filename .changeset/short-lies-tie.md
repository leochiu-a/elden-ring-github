---
'elden-ring-github': minor
---

feat: add PR approval detection and banner display

- Add new `showOnPRApprove` setting to control approval banner display
- Implement detection of PR approval actions in GitHub's review dialog
- Support approval detection on `/pull/:id/files` pages with banner display on main PR page
- Add approval banner using `approve-pull-request.webp` image
- Include approval functionality in popup settings with toggle control
