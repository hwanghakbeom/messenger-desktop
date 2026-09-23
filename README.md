# Messenger Desktop (Unofficial)

Unofficial Facebook Messenger desktop app for **macOS** and **Windows**, built with Electron.

## Features

- Cross-platform: macOS and Windows support
- All Messenger features including video/audio calls
- Persistent login sessions
- Dark mode support (macOS)
- Keyboard shortcuts
- Context menus
- Native notifications
- Native system integration

## Requirements

**macOS:**
- macOS 13 (Ventura) or later

**Windows:**
- Windows 10 or later (64-bit)

**Development:**
- Node.js 22.12 or later (see `.nvmrc`)

## Installation

Download the latest build from [Releases](https://github.com/hwanghakbeom/messenger-desktop/releases/latest).

| Platform | File |
|---|---|
| macOS (Apple Silicon) | `Messenger-<version>-arm64.dmg` |
| macOS (Intel) | `Messenger-<version>.dmg` |
| Windows (installer) | `Messenger-<version>-x64.exe` |
| Windows (portable) | `Messenger-<version>-portable.exe` |

The builds are not signed with a Developer ID certificate, so the OS will warn on first launch:

- **macOS:** after copying to Applications, run `xattr -cr /Applications/Messenger.app`, then open it normally. Native notifications require a signed build and will not appear.
- **Windows:** on the SmartScreen dialog, click **More info → Run anyway**.

## Development

### Installation

```bash
# Clone the repository
git clone https://github.com/hwanghakbeom/messenger-desktop.git
cd messenger-desktop

# Install dependencies
npm install
```

### Running in Development

```bash
# Start the app
npm start

# Start with developer tools
npm run dev
```

### Building

```bash
# Build for current platform
npm run build

# Build for macOS only
npm run build:mac

# Build for Windows only
npm run build:win

# Build for both macOS and Windows
npm run build:all

# Output will be in dist/ folder
```

**Build outputs:**

macOS:
- `dist/Messenger-1.0.0.dmg` - DMG installer
- `dist/Messenger-1.0.0-mac.zip` - Portable ZIP

Windows:
- `dist/Messenger-1.0.0-x64.exe` - 64-bit installer (NSIS)
- `dist/Messenger-1.0.0-portable.exe` - Portable version (no installation)

### Releasing

Releases are built by GitHub Actions (`.github/workflows/release.yml`) on macOS and Windows runners.

```bash
npm version patch        # bumps package.json and creates tag vX.Y.Z
git push --follow-tags   # the tag push triggers build + GitHub Release
```

The tag must match the `package.json` version. To build without releasing, run the workflow manually from the Actions tab; installers are attached to the run as artifacts.

### Code Signing and Notarization

**macOS:**

To distribute on macOS, you need:
1. Apple Developer Program membership ($99/year)
2. Developer ID Application certificate
3. App-specific password for notarization

Set environment variables:

```bash
export APPLE_ID="your@email.com"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export APPLE_TEAM_ID="TEAM123456"
```

Then build:

```bash
npm run build:mac
```

The app will be automatically signed and notarized.

**Windows:**

Code signing on Windows is optional but recommended for distribution:
1. Purchase a code signing certificate (e.g., from DigiCert, Sectigo)
2. Configure certificate path in environment variables
3. No additional setup required for unsigned builds (will show SmartScreen warning)

## Keyboard Shortcuts

**macOS:**
- `Cmd+N` - New message
- `Cmd+F` - Search
- `Cmd+,` - Preferences (coming soon)
- `Cmd+W` - Close window
- `Cmd+Q` - Quit app

**Windows:**
- `Ctrl+N` - New message
- `Ctrl+F` - Search
- `Ctrl+W` - Close window
- `Alt+F4` - Quit app

## Project Structure

```
messenger-desktop/
├── src/
│   ├── main.js          # App lifecycle (entry point)
│   ├── config.js        # Constants and platform flags
│   ├── window.js        # Main window, session, navigation rules
│   ├── badge.js         # Unread count badge (dock/taskbar/tray)
│   ├── tray.js          # System tray icon
│   ├── menu.js          # Application menu
│   └── preload.js       # Sandboxed preload (menu actions)
├── css/
│   └── custom.css       # Custom styles
├── assets/
│   └── icon.icns        # App icon
├── build/
│   └── entitlements.mac.plist
└── scripts/
    └── notarize.js      # Notarization script
```

## Privacy

This app is a simple wrapper around messenger.com. It does not:

- Collect any user data
- Modify any Messenger functionality
- Send data to third parties

Your login credentials and messages are handled entirely by Facebook's servers.

## Legal

This is an unofficial app and is not affiliated with Meta or Facebook. "Messenger" and "Facebook" are trademarks of Meta Platforms, Inc.

## License

MIT License - see LICENSE file for details

## Credits

Inspired by:
- [Caprine](https://github.com/sindresorhus/caprine)
- [messenger-mac](https://github.com/stefanminch/messenger-mac)

## Support

For issues and feature requests, please visit:
https://github.com/hwanghakbeom/messenger-desktop/issues
