<!-- AI_TEMPLATE_START: This is a structured PR description template for AI processing -->

## Summary

<!-- AI_INSTRUCTION: Provide a clear, concise explanation of what changed and why. Focus on the business value and technical impact. -->

This PR enhances the Elden Ring GitHub extension by adding support for multiple celebration sound effects, giving users more customization options for their GitHub PR celebrations. Users can now choose between the classic "You Died" sound and the new "Lost Grace Discovered" sound effect.

### Key Changes

<!-- AI_INSTRUCTION: List the most important changes made in this PR. Use bullet points for clarity. -->

- **Sound Type Selection**: Added a new dropdown in the settings UI allowing users to choose between "You Died" and "Lost Grace Discovered" sound effects
- **New Audio Asset**: Introduced `lost-grace-discovered.mp3` as an alternative celebration sound
- **Asset Reorganization**: Renamed `elden_ring_sound.mp3` to `you-die-sound.mp3` for clearer naming convention
- **Settings Type Enhancement**: Extended `EldenRingSettings` interface to include `soundType` property
- **Dynamic Sound Loading**: Updated sound playback logic to dynamically load the selected sound type across all celebration triggers
- **Version Bump**: Updated extension version to v1.2.0
- **Documentation**: Updated README with new sound type option and revised asset structure

## Type of Change

<!-- AI_INSTRUCTION: Check ALL applicable boxes based on the code changes. Use [x] to mark selected items. -->

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [x] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [x] 📚 Documentation update
- [ ] ♻️ Refactoring (no functional changes)
- [ ] 🎨 Style/formatting changes
- [x] 🧪 Test improvements
- [ ] 🔧 Configuration changes

## Test Plan

<!-- AI_INSTRUCTION: Provide specific testing instructions. Include both manual and automated testing steps. -->

### Manual Testing

- Install the extension with the updated changes
- Open the extension popup on any GitHub page
- Verify the new "Sound Type" dropdown appears in settings with two options: "You Died" and "Lost Grace Discovered"
- Select "You Died" and trigger a test banner - verify the classic sound plays
- Select "Lost Grace Discovered" and trigger a test banner - verify the new grace discovery sound plays
- Verify sound selection persists after closing and reopening the popup
- Test all three celebration triggers (PR merge, PR create, PR approve) to ensure the selected sound plays correctly for each
- Verify that toggling "Play sound effect" off/on still works correctly with both sound types

### Automated Testing

- Added unit test for sound type selection logic (src/content/content.test.ts:166)
- Existing audio playback test updated to use new sound type parameter (src/content/content.test.ts:156)
- All tests pass with the new sound type functionality

## Breaking Changes

<!-- AI_INSTRUCTION: If this is a breaking change, provide detailed migration instructions. If no breaking changes, write "None" -->

None

**Note**: While `elden_ring_sound.mp3` was renamed to `you-die-sound.mp3`, this is an internal asset change and does not affect users. The extension handles this transparently by defaulting to 'you-die-sound' for existing installations.

## Checklist

<!-- AI_INSTRUCTION: Check ALL completed items. Ensure all items are addressed before marking as ready for review. -->

- [x] 📝 Code follows the style guidelines
- [x] 👀 Self-review has been performed
- [x] 🧪 Tests have been added/updated
- [x] 📖 Documentation has been updated

<!-- AI_TEMPLATE_END -->
