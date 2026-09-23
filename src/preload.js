// Runs sandboxed: only a subset of `electron` is available, and local modules
// cannot be required. Custom CSS is injected from the main process instead.
const { ipcRenderer } = require('electron');

// Keep in sync with IPC_CHANNELS in src/config.js
const NEW_MESSAGE = 'click-new-message';
const FOCUS_SEARCH = 'focus-search';

ipcRenderer.on(NEW_MESSAGE, () => {
  document.querySelector('[aria-label="New message"], [aria-label="새 메시지"]')?.click();
});

ipcRenderer.on(FOCUS_SEARCH, () => {
  document.querySelector('input[type="search"], [aria-label="Search Messenger"]')?.focus();
});
