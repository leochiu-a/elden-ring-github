# elden-ring-github

## 1.2.0

### Minor Changes

- 51d697b: test: add comprehensive unit tests for PR approval functionality
  - Add vitest test cases for approval radio button detection in review dialogs
  - Test PR approval flag storage and retrieval mechanisms
  - Add test coverage for approval settings loading and changes
  - Implement time validation tests for approval banner display window
  - Test URL pattern validation for approval functionality on different PR pages
  - Update existing banner type tests to include 'approved' type support

- c7323b1: feat: add PR approval detection and banner display
  - Add new `showOnPRApprove` setting to control approval banner display
  - Implement detection of PR approval actions in GitHub's review dialog
  - Support approval detection on `/pull/:id/files` pages with banner display on main PR page
  - Add approval banner using `approve-pull-request.webp` image
  - Include approval functionality in popup settings with toggle control

## 1.1.0

### Minor Changes

- df4c237: Add support for PR creation banner with separate image
  - Added new setting "Show on PR creation" to control PR creation banner display
  - PR creation now shows `pull-request-created.png` instead of merged image
  - Renamed "Auto-show on merge" setting to "Show on PR merged" for consistency
  - Both PR creation and merge banners can now be controlled independently
  - Improved detection logic for GitHub's full page navigation vs SPA behavior

## 1.0.0

### Major Changes

Initial release of Elden Ring GitHub extension

- 🎉 **Epic Merge Banner** - Display stunning Elden Ring-themed banner when merging PRs
- 🔊 **Sound Effects** - Play iconic Elden Ring achievement sound on merge
- ⚙️ **Customizable Settings** - Configure banner duration and sound preferences
- 🎯 **Smart Detection** - Accurately detect PR merge events on GitHub
- 🧪 **Test Mode** - Preview banner effects from extension popup
- 🎨 **Responsive Design** - Beautiful display on all screen sizes
- ⚡ **High Performance** - Lightweight and optimized for GitHub's interface
