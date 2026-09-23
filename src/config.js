const path = require('path');

const isMac = process.platform === 'darwin';
const isWindows = process.platform === 'win32';
const isDev = process.argv.includes('--dev');

module.exports = {
  MESSENGER_URL: 'https://www.messenger.com/',
  HELP_URL: 'https://www.facebook.com/help/messenger-app',
  // Subdomains (e.g. www.) are matched automatically
  ALLOWED_HOSTNAMES: ['messenger.com', 'facebook.com'],
  SESSION_PARTITION: 'persist:messenger',

  ICON_PATH: path.join(__dirname, '../assets/icon.png'),
  CUSTOM_CSS_PATH: path.join(__dirname, '../css/custom.css'),

  DEFAULT_WINDOW_BOUNDS: { width: 1200, height: 800 },
  MIN_WINDOW_SIZE: { minWidth: 800, minHeight: 600 },

  // Keep in sync with src/preload.js (sandboxed preloads cannot require local modules)
  IPC_CHANNELS: {
    NEW_MESSAGE: 'click-new-message',
    FOCUS_SEARCH: 'focus-search'
  },

  isMac,
  isWindows,
  isDev
};
