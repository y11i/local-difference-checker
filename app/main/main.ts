import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { app, BrowserWindow, ipcMain, nativeTheme, shell } from 'electron';
import { registerFileHandlers } from './ipc/files.js';
import { registerPreferencesHandlers } from './ipc/preferences.js';
import { getPreferences } from './preferencesStore.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !!process.env.VITE_DEV_SERVER_URL;

// Set app name early (before app.whenReady)
app.setName('Local Difference Checker');

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  const preferences = getPreferences();
  nativeTheme.themeSource = preferences.theme;
  const prefersDark = nativeTheme.shouldUseDarkColors;

  // Resolve paths correctly for both dev and production
  // Use .cjs extension to ensure CommonJS even with "type": "module" in package.json
  const preloadPath = isDev
    ? path.join(__dirname, 'preload.cjs')
    : path.join(app.getAppPath(), 'dist', 'main', 'preload.cjs');

  // Resolve icon path for both dev and production
  let iconPath: string | undefined;
  if (process.platform === 'darwin') {
    // macOS uses .icns
    iconPath = isDev
      ? path.join(__dirname, '..', '..', 'build', 'icon.icns')
      : path.join(app.getAppPath(), 'build', 'icon.icns');
  } else if (process.platform === 'win32') {
    // Windows uses .ico
    iconPath = isDev
      ? path.join(__dirname, '..', '..', 'build', 'icon.ico')
      : path.join(app.getAppPath(), 'build', 'icon.ico');
  } else {
    // Linux uses .png
    iconPath = isDev
      ? path.join(__dirname, '..', '..', 'build', 'icon.png')
      : path.join(app.getAppPath(), 'build', 'icon.png');
  }
  
  // Only set icon if file exists
  if (iconPath && !existsSync(iconPath)) {
    console.warn(`Icon file not found: ${iconPath}, using default icon`);
    iconPath = undefined;
  }

  mainWindow = new BrowserWindow({
    width: 1110,
    height: 820,
    minWidth: 800,
    minHeight: 600,
    title: 'Local Difference Checker',
    icon: iconPath, // Set the app icon
    backgroundColor: prefersDark ? '#020617' : '#ffffff',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    trafficLightPosition: process.platform === 'darwin' ? { x: 14, y: 18 } : undefined,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // In production, load from the packaged app
    const htmlPath = path.join(app.getAppPath(), 'dist', 'renderer', 'index.html');
    mainWindow.loadFile(htmlPath).catch((error) => {
      console.error('Failed to load HTML file:', error);
      console.error('App path:', app.getAppPath());
      console.error('Attempted path:', htmlPath);
    });
    
    // Enable dev tools if DEBUG environment variable is set
    if (process.env.DEBUG === 'true') {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  }

  // Log any errors from the renderer
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  mainWindow.webContents.on('console-message', (event, level, message) => {
    console.log(`[Renderer ${level}]:`, message);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  registerFileHandlers();
  registerPreferencesHandlers();

  ipcMain.handle('app:get-version', () => app.getVersion());
  
  ipcMain.handle('window:minimize', () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
  });
  
  ipcMain.handle('window:maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });
  
  ipcMain.handle('window:close', () => {
    if (mainWindow) {
      mainWindow.close();
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
