# elden-ring-github

## 2.0.1

### Patch Changes

- 3f555cd: Restore the layered-gold look of the reference banner artwork. The caption is a
  deep matte gold face with the image-creator's warm ghost (blurTint [255,208,66]
  @ 0.18) stacked on top and blended additively via `mix-blend-mode: plus-lighter`
  (falling back to `screen`). Where the ghost aligns over the face it adds to it —
  the bright overlap tone (~255,213,57) — and where it spreads past the letters it
  becomes the dim offset echo, so overlapping text shows a real blended colour
  instead of flat gold. The ghost is a separate layer so its outward-spread
  (scaleX -> 1.11) can animate after the fade-in.
- 1053958: Restyle the "closed PR" banner to the Elden Ring death-screen look. Its caption
  now renders in deep blood-red (`rgb(130, 16, 29)`) with a restrained red echo
  instead of the shared victory gold, matching `src/assets/close-pull-request.png`.

  Introduces a per-event theme registry (`bannerThemes.ts`): each `BannerType`
  maps to a `BannerTheme` (face color, sheen color, sheen opacity), so restyling
  an event or adding a new look is a one-line change there — the canvas renderer
  (`eldenBanner.ts`) and DOM assembly (`banner.ts`) take colors as arguments and
  stay untouched. The smoky dark band remains shared across all events.

## 2.0.0

### Major Changes

- 34909b2: Render the banner sheen echo behind the opaque caption. The banner is now
  composed of three stacked layers — smoky band, sheen echo, and opaque gold
  caption — so the caption masks the echo's aligned core and only the offset
  echo emerges from behind the letters. Previously the sheen was drawn on top of
  the caption, showing through as a misregistered "ghost" duplicate that grew
  with caption length and screen width.

### Minor Changes

- 7448d0b: Redesign the popup with a "Gilded Obsidian" theme — an Erdtree-gold radial
  glow, embossed panels, a two-font hierarchy (display serif for titles/tabs,
  readable serif for body), and higher-contrast, larger text for legibility.
  Simplify the header to "Elden Ring / GitHub", add a "View on GitHub" link in
  the About tab, and set the package author.

### Patch Changes

- aa28ed5: Fix the PR close banner never triggering. Closing a pull request posts the
  Rails comment form (`name="comment_and_close"`), which the old
  `.State.State--closed` MutationObserver could never observe — the same
  GitHub Primer redesign that previously broke merge detection. Detection now
  records the close intent in storage on click and celebrates only once the PR
  header actually shows the closed `StateLabel`, consuming the flag on fire so a
  plain refresh of an already-closed PR never re-triggers the banner.

## 1.4.0

### Minor Changes

- 5f8ed57: Add a PR close banner option with settings toggle, popup control, and reusable banner rendering helper.

### Patch Changes

- 5439f7e: Refactor close detection module and consolidate settings management. Renamed `closeWatcher` to `closeHandler` for naming consistency and merged `SettingsStore` into `ShowSettings` to reduce unnecessary abstraction.

## 1.3.0

### Minor Changes

- 8b9da43: feat: add lost grace discovered support

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
