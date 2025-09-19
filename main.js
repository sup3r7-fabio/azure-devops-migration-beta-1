const { app, BrowserWindow, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', () => {
  createWindow();

  // Auto-update: check for updates on launch.
  // By default electron-updater uses the `publish` settings in package.json (build.publish.url).
  // You can override with the GENERIC_UPDATES_URL env var for local testing, e.g.
  // $env:GENERIC_UPDATES_URL = 'http://localhost:8080/' (PowerShell)
  const feedUrl = process.env.GENERIC_UPDATES_URL;
  if (feedUrl) {
    // For generic provider override, set the url on the updater's config
    try {
      autoUpdater.setFeedURL({ provider: 'generic', url: feedUrl });
      console.info(`AutoUpdater: using generic feed ${feedUrl}`);
    } catch (e) {
      console.warn('AutoUpdater: failed to set feed URL override', e && e.stack ? e.stack : e);
    }
  }

  // Check for updates and notify the user
  autoUpdater.checkForUpdatesAndNotify().catch(err => {
    console.warn('AutoUpdater check failed:', err && err.stack ? err.stack : err);
  });

  autoUpdater.on('update-available', (info) => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update available',
      message: `Version ${info.version} is available and will be downloaded.`
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update ready',
      message: `Version ${info.version} downloaded. The app will now restart to apply the update.`,
    }).then(() => {
      setImmediate(() => autoUpdater.quitAndInstall());
    });
  });

  autoUpdater.on('error', (err) => {
    console.error('AutoUpdater error:', err == null ? 'unknown' : (err.stack || err).toString());
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});
