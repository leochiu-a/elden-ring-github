# Elden Ring GitHub Merger 🏆

A Chrome extension that displays an epic Elden Ring-themed banner when you successfully merge pull requests on GitHub. Transform your mundane merges into epic victories!

## ✨ Features

- 🎉 **Epic Merge Banner** - Shows a stunning "MERGE ACCOMPLISHED" banner with Elden Ring aesthetics
- 🔊 **Sound Effects** - Plays the iconic Elden Ring achievement sound (toggleable)
- ⚙️ **Customizable Settings** - Adjust banner duration and sound preferences
- 🎯 **Smart Detection** - Only triggers on actual PR merges, not other GitHub actions
- 🧪 **Test Mode** - Preview the banner anytime from the extension popup
- 🎨 **Responsive Design** - Works beautifully on all screen sizes

## 🚀 Quick Start

### Installation

1. **Build the extension**:

   ```bash
   pnpm install
   pnpm run build
   ```

2. **Load in Chrome**:
   - Open `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the `dist/` folder

3. **Start merging**:
   - Navigate to any GitHub pull request
   - Merge away and enjoy the epic celebration! 🎉

## 🎮 Usage

### Automatic Mode

1. Visit any GitHub pull request page
2. Click "Merge pull request" → "Confirm merge"
3. Watch as your merge is celebrated with epic fanfare!

### Test Mode

1. Click the extension icon in your Chrome toolbar
2. Press "Test Banner" to preview the effect
3. Configure settings to your liking

## ⚙️ Configuration

Access settings by clicking the extension icon:

- **🔊 Sound Effects**: Toggle the Elden Ring achievement sound
- **⏱️ Banner Duration**: Choose how long the celebration lasts (3-10 seconds)
- **📊 Page Status**: See if you're on a GitHub page

## 🛠️ Development

### Tech Stack

- **TypeScript** - Type-safe development with modern ES features
- **tsdown** - Lightning-fast TypeScript bundler
- **oxlint** - Super-fast linting for code quality

### Project Structure

```
src/
├── content/              # Content script (GitHub integration)
│   ├── content.ts       # Main merge detection logic
│   └── styles.css       # Banner styling
├── popup/               # Extension popup interface
│   ├── popup.ts        # Settings and test functionality
│   ├── popup.html      # Popup UI structure
│   └── popup.css       # Popup styling
├── types/              # TypeScript type definitions
│   ├── settings.ts     # Settings interface
│   └── global.d.ts     # Global type declarations
└── assets/             # Static resources
    ├── elden_ring_sound.mp3
    └── pull-request-merged.png

dist/                   # Built extension (Chrome loads this)
├── manifest.json
├── content/
├── popup/
└── assets/
```
