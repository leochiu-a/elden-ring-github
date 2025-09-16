# Elden Ring GitHub Merger

A Chrome extension that displays an epic Elden Ring banner when you merge pull requests on GitHub.

## Features

- 🎉 Shows an epic "MERGE ACCOMPLISHED" banner when merging PRs
- 🔊 Plays Elden Ring sound effect (can be disabled)
- ⚙️ Customizable banner duration
- 🎨 Elden Ring themed styling with gold accents
- 📱 Responsive design
- 🧪 Test banner from extension popup

## Development

This project uses modern TypeScript tooling:

- **TypeScript** - Type-safe development
- **tsdown** - Fast TypeScript bundler
- **oxlint** - Super fast linting
- **prettier** - Code formatting

### Project Structure

```
src/
├── content/           # Content script (runs on GitHub pages)
│   ├── content.ts
│   └── styles.css
├── popup/             # Extension popup
│   ├── popup.ts
│   ├── popup.html
│   └── popup.css
└── assets/            # Static assets
    ├── elden_ring_sound.mp3
    └── pull-request-merged.png

dist/                  # Built extension (load this in Chrome)
├── manifest.json
├── content/
├── popup/
└── assets/
```

## Installation

### For Development

1. Run `npm run build` to create the `dist/` folder
2. Open `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked extension"
5. Select the `dist/` folder (not the project root)

### For Updates

1. Make changes to files in `src/`
2. Run `npm run build`
3. Click the reload button on your extension in `chrome://extensions/`

## Usage

1. Go to any GitHub pull request
2. Click "Merge pull request"
3. Enjoy the epic banner!

You can also test the banner by clicking the extension icon and pressing "Test Banner".

## Configuration

- **Auto-show on merge**: Enable/disable automatic banner display
- **Play sound effect**: Toggle the Elden Ring sound
- **Banner Duration**: Choose how long the banner stays visible (3-10 seconds)
