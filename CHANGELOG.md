# elden-ring-github

## 1.1.0

### Minor Changes

- df4c237: Add support for PR creation banner with separate image
  - Added new setting "Show on PR creation" to control PR creation banner display
  - PR creation now shows `pull-request-created.png` instead of merged image
  - Renamed "Auto-show on merge" setting to "Show on PR merged" for consistency
  - Both PR creation and merge banners can now be controlled independently
  - Improved detection logic for GitHub's full page navigation vs SPA behavior
