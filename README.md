# Elden Ring GitHub 🏆

A Chrome extension that displays epic Elden Ring-themed banners when you create, approve, or merge pull requests on GitHub. Transform your development milestones into legendary moments!

👉 [Elden Ring GitHub (Chrome Extension Store)](https://chromewebstore.google.com/detail/elden-ring-github/dfhmjflkbjjmlapbghecjfhnnmehcbke?authuser=1&hl=en)

## ✨ Features

- 🆕 **PR Creation Banner** - Celebrate new pull request creation with a dedicated banner
- ✅ **PR Approval Banner** - Epic celebration when you approve pull requests
- 🎉 **PR Merge Banner** - Shows an epic "MERGE ACCOMPLISHED" banner when PRs are merged
- ☠️ **PR Close Banner** - Dramatic "You Died" moment whenever a pull request is closed
- 🔊 **Sound Effects** - Plays the iconic Elden Ring achievement sound
- ⚙️ **Independent Controls** - Separate settings to enable/disable creation, approval, and merge banners

![Elden Ring GitHub](./public/elden-ring-pr-merged.webp)

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

3. **Start creating and merging**:
   - Navigate to any GitHub repository
   - Create or merge pull requests and enjoy epic celebrations! 🎉

## 🎮 Usage

### Automatic Mode

**For PR Creation:**

1. Navigate to any GitHub repository
2. Go to the "Compare" page (e.g., from comparing branches)
3. Click "Create pull request" button
4. Watch your PR creation celebrated with an epic banner! ✨

**For PR Approval:**

1. Visit any GitHub pull request page or files view
2. Click "Review changes" → Select "Approve" → "Submit review"
3. Navigate back to the main PR page to see your approval celebrated! ✅

**For PR Merging:**

1. Visit any GitHub pull request page
2. Click "Merge pull request" → "Confirm merge"
3. Watch as your merge is celebrated with epic fanfare! 🎉

### Test Mode

1. Click the extension icon in your Chrome toolbar
2. Press "Test Banner" to preview the effect
3. Configure settings to your liking

## ⚙️ Configuration

Access settings by clicking the extension icon:

- **🎉 Show on PR merged**: Toggle banner display when PRs are merged
- **🆕 Show on PR creation**: Toggle banner display when PRs are created
- **✅ Show on PR approve**: Toggle banner display when PRs are approved
- **🔊 Play sound effect**: Toggle the iconic Elden Ring achievement sound
- **🎵 Sound Type**: Choose between different celebration sounds:
  - **You Died** - The classic defeat sound
  - **Lost Grace Discovered** - The grace discovery sound
  - **Flask of Crimson Tears** - Drink up after an epic fight
  - **New Item Fanfare** - The loot discovery chime
- **⏱️ Banner Duration**: Choose how long celebrations last (3-10 seconds)
- **📊 Page Status**: See if you're currently on a GitHub page
- **🧪 Test Banner**: Preview the banner effect anytime

## 🛠️ Development

### Tech Stack

- **TypeScript** - Type-safe development with modern ES features
- **tsdown** - Lightning-fast TypeScript bundler
- **oxlint** - Super-fast linting for code quality

### Project Structure

```
src/
├── content/              # Content script (GitHub integration)
│   ├── content.ts       # PR creation & merge detection logic
│   └── styles.css       # Banner styling
├── popup/               # Extension popup interface
│   ├── popup.ts        # Settings and test functionality
│   ├── popup.html      # Popup UI structure
│   └── popup.css       # Popup styling
├── types/              # TypeScript type definitions
│   ├── settings.ts     # Settings interface
│   └── global.d.ts     # Global type declarations
└── assets/             # Static resources
    ├── you-die-sound.mp3           # "You Died" sound effect
    ├── lost-grace-discovered.mp3   # Lost Grace discovery sound
    ├── flask-of-crimson-tears.mp3  # Flask of Crimson Tears refill
    ├── new-item.mp3                # New item pickup fanfare
    ├── pull-request-created.png    # PR creation banner
    ├── pull-request-merged.png     # PR merge banner
    ├── approve-pull-request.png    # PR approval banner
    ├── close-pull-request.png      # PR close banner
    └── icon*.png        # Extension icons

dist/                   # Built extension (Chrome loads this)
├── manifest.json
├── content/
├── popup/
└── assets/
```

## ⚖️ Disclaimer

This extension is an unofficial fan-made project. It is not affiliated with, endorsed, or sponsored by FromSoftware or Bandai Namco Entertainment. All game audio, names, and assets are trademarks and copyright of their respective owners.
