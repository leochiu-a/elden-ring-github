# Elden Ring GitHub Merger Extension

A Chrome extension that displays an epic Elden Ring banner when you merge pull requests on GitHub.

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" button
4. Select this folder (`elden-ring-github`)
5. The extension should now be installed and active

## Testing

To test the extension:

1. Go to any GitHub repository with pull requests
2. Open a mergeable pull request
3. Click the "Merge pull request" button
4. You should see the Elden Ring banner appear after merging

## Features

- Detects GitHub merge actions automatically
- Shows an epic "MERGE ACCOMPLISHED" banner in Elden Ring style
- Auto-hides after 5 seconds
- Can be closed manually with the X button
- Responsive design for mobile and desktop

## Files Structure

- `manifest.json` - Chrome extension configuration
- `content.js` - Main script that detects merges and shows banner
- `styles.css` - Elden Ring themed styling for the banner
- `assets/` - Directory for future assets (icons, images)

## Customization

You can modify the banner text in `content.js`:
- Change "MERGE ACCOMPLISHED" to any other text
- Modify the subtitle text
- Adjust timing and animations

The styling can be customized in `styles.css`:
- Change colors (currently uses Elden Ring gold theme)
- Modify animations and effects
- Adjust responsive breakpoints