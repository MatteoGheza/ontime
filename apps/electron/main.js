const {
  app,
  BrowserWindow,
  Menu,
  globalShortcut,
  Tray,
  dialog,
  ipcMain,
  shell,
  Notification,
} = require('electron');
const path = require('path');
const electronConfig = require('./electron.config');

const env = process.env.NODE_ENV || 'production';
const isProduction = env === 'production';
const isMac = process.platform === 'darwin';
const isWindows = process.platform === 'win32';

// path to server
const nodePath = isProduction
  ? path.join(__dirname, electronConfig.server.pathToEntrypoint)
  : path.join(__dirname, '../server/dist/index.cjs');

if (!isProduction) {
  console.log(`Electron running in ${env} environment`);
  console.log(`Ontime server at ${nodePath}`);
  process.traceProcessWarnings = true;
}

// path to icons
const trayIcon = path.join(__dirname, electronConfig.assets.pathToAssets, 'background.png');
const appIcon = path.join(__dirname, electronConfig.assets.pathToAssets, 'logo.png');
let loaded = 'Nothing loaded';
let isQuitting = false;

// initialise
let win;
let splash;
let tray = null;

(async () => {

  // in dev mode, we expect both UI and server to be running
  if (!isProduction)  {
    return
  }

  try {
    const ontimeServer = require(nodePath)
    const { startServer, startOSCServer } = ontimeServer;

    // Start express server
    loaded = await startServer();

    // Start OSC Server
    await startOSCServer();
  } catch (error) {
    loaded = error;
  }
})();

/**
 * @description utility function to create a notification
 * @param title
 * @param text
 */
function showNotification(title, text) {
  new Notification({
    title,
    body: text,
    silent: true,
  }).show();
}

function appShutdown() {
  // terminate node service
  (async () => {
    console.log('asking for shutdown 1', nodePath)
    const ontimeServer = require(nodePath)
    console.log('asking for shutdown 2', ontimeServer)
    const { shutdown } = ontimeServer;
    await shutdown(electronConfig.appIni.shutdownCode);
  })();

  isQuitting = true;
  tray.destroy();
  win.destroy();
  app.quit();
}

function bringToFront() {
  win.show();
  win.focus();
}

function askToQuit() {
  bringToFront();
  win.send('user-request-shutdown');
}

// Ensure there isn't another instance of the app running already
const lock = app.requestSingleInstanceLock();
if (!lock) {
  dialog.showErrorBox('Multiple instances', 'An instance of the App is already running.');
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window.
    if (win) {
      if (win.isMinimized()) {
        win.restore();
      }
      bringToFront();
    }
  });
}

function createWindow() {
  splash = new BrowserWindow({
    width: 333,
    height: 333,
    transparent: true,
    icon: appIcon,
    resizable: false,
    frame: false,
    alwaysOnTop: true,
    focusable: false,
    skipTaskbar: true,
  });
  splash.setIgnoreMouseEvents(true);
  splash.loadURL(`file://${__dirname}/src/splash/splash.html`);

  win = new BrowserWindow({
    width: 1920,
    height: 1000,
    minWidth: 525,
    minHeight: 405,
    maxWidth: 1920,
    maxHeight: 1440,
    backgroundColor: '#101010', // $gray-1350
    icon: appIcon,
    show: false,
    textAreasAreResizable: false,
    enableWebSQL: false,
    darkTheme: true,
    webPreferences: {
      preload: path.join(__dirname, './src/preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.setMenu(null);
}

app.disableHardwareAcceleration();
app.whenReady().then(() => {
  // Set app title in windows
  if (isWindows) {
    app.setAppUserModelId(app.name);
  }

  createWindow();

  // register global shortcuts
  // (available regardless of whether app is in focus)
  // bring focus to window
  globalShortcut.register('Alt+1', () => {
   bringToFront();
  });

  // cheat to schedule process
  setTimeout(() => {
    // Load page served by node or use React dev run
    const clientUrl = isProduction
      ? electronConfig.reactAppUrl.production
      : electronConfig.reactAppUrl.development;

    win.loadURL(clientUrl).then(() => {
      win.webContents.setBackgroundThrottling(false);

      win.show();
      win.focus();

      splash.destroy();

      if (typeof loaded === 'string') {
        tray.setToolTip(loaded);
      } else {
        tray.setToolTip('Initialising error: please restart Ontime');
      }
    });
  }, 0);

  // recreate window if no others open
  app.on('activate', () => {
    win.show();
  });

  // Hide on close
  win.on('close', function (event) {
    event.preventDefault();
    if (!isQuitting) {
      showNotification('Window Closed', 'App running in background');
      win.hide();
    }
  });

  // create tray
  tray = new Tray(trayIcon);

  // Define context menu
  const { getTrayMenu } = require('./src/menu/trayMenu.js');
  const trayMenuTemplate = getTrayMenu(bringToFront, askToQuit)
  const trayContextMenu = Menu.buildFromTemplate(trayMenuTemplate);
  tray.setContextMenu(trayContextMenu);
});

const { getApplicationMenu } = require('./src/menu/applicationMenu.js');
const template = getApplicationMenu(isMac, askToQuit)
const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

// unregister shortcuts before quitting
app.once('will-quit', () => {
  globalShortcut.unregisterAll();
});

// Get messages from react
// Test message
ipcMain.on('test-message', (event, arg) => {
  showNotification('Test Message', 'test from react', arg);
});

// Ask for main window reload
// Test message
ipcMain.on('reload', () => {
    win?.reload();
});

// Terminate
ipcMain.on('shutdown', () => {
  console.log('Electron got IPC shutdown');
  appShutdown();
});

// Window manipulation
ipcMain.on('set-window', (event, arg) => {
  switch (arg) {
    case 'to-max':
      win.maximize();
      break;
    case 'to-tray':
      win.maximize();
      break;
    case 'show-dev':
      win.webContents.openDevTools({ mode: 'detach' });
      break;
    default:
      console.log('Electron unhandled window request', arg)
  }
});

// Open links external
ipcMain.on('send-to-link', (event, arg) => {
  if (arg === 'help') {
    shell.openExternal(electronConfig.externalUrls.help);
  } else {
    shell.openExternal(arg);
  }
});