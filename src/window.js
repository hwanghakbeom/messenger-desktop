const { BrowserWindow, session, shell, nativeTheme } = require('electron');
const fs = require('fs');
const path = require('path');
const {
  MESSENGER_URL,
  ALLOWED_HOSTNAMES,
  SESSION_PARTITION,
  CUSTOM_CSS_PATH,
  DEFAULT_WINDOW_BOUNDS,
  MIN_WINDOW_SIZE,
  isDev
} = require('./config');
const { parseUnreadCount } = require('./badge');

let customCSS;

/**
 * Check if a URL belongs to an allowed domain.
 */
function isAllowedURL(url) {
  try {
    const { hostname } = new URL(url);
    return ALLOWED_HOSTNAMES.some(
      allowed => hostname === allowed || hostname.endsWith('.' + allowed)
    );
  } catch {
    return false;
  }
}

/**
 * Read custom CSS once. Done in the main process because the sandboxed
 * preload script has no access to `fs`.
 */
function getCustomCSS() {
  if (customCSS === undefined) {
    try {
      customCSS = fs.readFileSync(CUSTOM_CSS_PATH, 'utf8');
    } catch (error) {
      console.error('Failed to read custom CSS:', error);
      customCSS = '';
    }
  }
  return customCSS;
}

/**
 * One-time setup of the persistent Messenger session.
 */
function configureSession() {
  const ses = session.fromPartition(SESSION_PARTITION);

  // Match the actual Electron Chrome version so messenger.com treats us as a supported browser
  const chromeVersion = process.versions.chrome;
  ses.setUserAgent(
    `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`
  );
}

/**
 * Keep navigation inside Messenger/Facebook; open everything else in the default browser.
 */
function restrictNavigation(webContents) {
  webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedURL(url)) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  webContents.on('will-navigate', (event, url) => {
    if (!isAllowedURL(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}

/**
 * Create the main Messenger window.
 *
 * @param {object} options
 * @param {object} options.store - electron-store instance for bounds/zoom persistence
 * @param {Electron.NativeImage} options.icon
 * @param {() => boolean} options.shouldHideOnClose - hide instead of closing (tray mode)
 * @param {(count: number) => void} options.onUnreadCountChange
 */
function createMainWindow({ store, icon, shouldHideOnClose, onUnreadCountChange }) {
  const win = new BrowserWindow({
    ...DEFAULT_WINDOW_BOUNDS,
    ...store.get('windowBounds', {}),
    ...MIN_WINDOW_SIZE,
    title: 'Messenger',
    icon,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      // Persistent session keeps the user logged in
      partition: SESSION_PARTITION
    },
    titleBarStyle: 'default',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#1a1a2e' : '#ffffff',
    show: false // Shown on ready-to-show to avoid a blank flash
  });

  const { webContents } = win;

  restrictNavigation(webContents);

  webContents.on('page-title-updated', (event, title) => {
    event.preventDefault();
    win.setTitle(title.includes('Messenger') ? title : 'Messenger');
    onUnreadCountChange(parseUnreadCount(title));
  });

  webContents.on('dom-ready', () => {
    const css = getCustomCSS();
    if (css) {
      webContents.insertCSS(css);
    }
  });

  // Chromium remembers zoom per origin afterwards, so restoring once is enough
  webContents.once('did-finish-load', () => {
    webContents.setZoomLevel(store.get('zoomLevel', 0));
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  win.on('close', event => {
    store.set('windowBounds', win.getBounds());
    store.set('zoomLevel', webContents.getZoomLevel());

    if (shouldHideOnClose()) {
      event.preventDefault();
      win.hide();
    }
  });

  win.loadURL(MESSENGER_URL);

  if (isDev) {
    webContents.openDevTools();
  }

  return win;
}

module.exports = { configureSession, createMainWindow };
