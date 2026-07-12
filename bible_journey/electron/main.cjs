/**
 * Electron 薄殼（預留）
 * 使用方式（日後）：
 *   npm run build
 *   electron electron/main.cjs
 */
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 760,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.once('ready-to-show', () => win.show());
  const dist = path.join(__dirname, '..', 'dist', 'index.html');
  win.loadFile(dist);
}

app.whenReady().then(createWindow);
