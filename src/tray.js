const { Tray, Menu } = require('electron');

/**
 * Create the system tray icon.
 *
 * @param {object} options
 * @param {Electron.NativeImage} options.icon
 * @param {() => void} options.onShow
 * @param {() => void} options.onQuit
 */
function createTray({ icon, onShow, onQuit }) {
  const tray = new Tray(icon.resize({ width: 16, height: 16 }));
  tray.setToolTip('Messenger');

  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Show Messenger', click: onShow },
    { type: 'separator' },
    { label: 'Quit', click: onQuit }
  ]));

  tray.on('click', onShow);

  return tray;
}

module.exports = { createTray };
