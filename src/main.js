const { app, nativeImage } = require('electron');
const Store = require('electron-store');
const contextMenu = require('electron-context-menu');
const { ICON_PATH, isMac, isDev } = require('./config');
const { configureSession, createMainWindow } = require('./window');
const { createTray } = require('./tray');
const { createMenu } = require('./menu');
const { updateUnreadBadge } = require('./badge');

// Both packages are ESM; require() returns the module namespace in newer Electron
const store = new (Store.default || Store)();
const setupContextMenu = contextMenu.default || contextMenu;

let mainWindow = null;
let tray = null;
let appIcon = null;
let isQuitting = false;

function getAppIcon() {
  if (!appIcon) {
    appIcon = nativeImage.createFromPath(ICON_PATH);
  }
  return appIcon;
}

function createWindow() {
  mainWindow = createMainWindow({
    store,
    icon: getAppIcon(),
    // Hide to tray instead of quitting, unless the user is actually quitting
    shouldHideOnClose: () => tray !== null && !isQuitting,
    onUnreadCountChange: count => updateUnreadBadge(count, { window: mainWindow, tray })
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Bring the main window to front, recreating it if it was closed.
 */
function showMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow();
    return;
  }
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.show();
  mainWindow.focus();
}

function sendToMainWindow(channel) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel);
  }
}

// Single instance lock — a second launch just focuses the existing window
if (!app.requestSingleInstanceLock()) {
  app.exit(0);
} else {
  setupContextMenu({
    showSaveImageAs: true,
    showCopyImageAddress: true,
    showSearchWithGoogle: false,
    showInspectElement: isDev
  });

  app.whenReady().then(() => {
    if (isMac) {
      app.dock.setIcon(getAppIcon());
    }

    configureSession();
    createMenu({ appName: app.name, sendToWindow: sendToMainWindow });
    tray = createTray({
      icon: getAppIcon(),
      onShow: showMainWindow,
      onQuit: () => app.quit()
    });
    createWindow();

    // macOS: clicking the dock icon reopens the window
    app.on('activate', showMainWindow);
  });

  app.on('second-instance', showMainWindow);

  // Set before windows receive 'close', so they close instead of hiding to tray
  app.on('before-quit', () => {
    isQuitting = true;
  });

  // Quit when all windows are closed (except on macOS)
  app.on('window-all-closed', () => {
    if (!isMac) {
      app.quit();
    }
  });

  // Accept self-signed certificates only in development
  app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    if (isDev) {
      event.preventDefault();
      callback(true);
    } else {
      callback(false);
    }
  });
}
