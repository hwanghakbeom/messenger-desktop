const { app, nativeImage } = require('electron');
const { isMac, isWindows } = require('./config');

const OVERLAY_SIZE = 16;
let overlayIcon;

/**
 * Extract unread count from a page title like "(3) Messenger".
 */
function parseUnreadCount(title) {
  const match = title.match(/^\((\d+)\)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Red dot used as the Windows taskbar overlay. Built once and reused.
 */
function getOverlayIcon() {
  if (overlayIcon) return overlayIcon;

  const radius = OVERLAY_SIZE / 2;
  const buf = Buffer.alloc(OVERLAY_SIZE * OVERLAY_SIZE * 4, 0);
  for (let y = 0; y < OVERLAY_SIZE; y++) {
    for (let x = 0; x < OVERLAY_SIZE; x++) {
      const dx = x - radius;
      const dy = y - radius;
      if (dx * dx + dy * dy <= radius * radius) {
        // Raw bitmaps are BGRA
        const idx = (y * OVERLAY_SIZE + x) * 4;
        buf[idx] = 48;      // B
        buf[idx + 1] = 59;  // G
        buf[idx + 2] = 255; // R
        buf[idx + 3] = 255; // A
      }
    }
  }

  overlayIcon = nativeImage.createFromBitmap(buf, { width: OVERLAY_SIZE, height: OVERLAY_SIZE });
  return overlayIcon;
}

/**
 * Reflect the unread count on the dock (macOS), taskbar (Windows) and tray tooltip.
 */
function updateUnreadBadge(count, { window, tray }) {
  if (isMac) {
    app.dock.setBadge(count > 0 ? String(count) : '');
  }

  if (isWindows && window && !window.isDestroyed()) {
    if (count > 0) {
      window.setOverlayIcon(getOverlayIcon(), `${count} unread`);
    } else {
      window.setOverlayIcon(null, '');
    }
  }

  if (tray) {
    tray.setToolTip(count > 0 ? `Messenger (${count} unread)` : 'Messenger');
  }
}

module.exports = { parseUnreadCount, updateUnreadBadge };
