const { app, BrowserWindow, dialog, Menu } = require('electron');
const {autoUpdater} = require("electron-updater");
const path = require('path');
const { spawn } = require('child_process');
const express = require('express'); 
// const ProgressBar = require('electron-progressbar');
// const log = require('electron-log');

let mainWindow;

let updateCheck = false;
let updateFound = false;
let updateNotAvailable = false;

function startExpressServer() {
  const expressApp = express();
  const PORT = 3001;

  expressApp.use(express.static(path.join(__dirname, 'build')));

  expressApp.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });

  expressApp.listen(PORT, () => {
    console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
  });
}

async function startBackend() {

  const isDev = (await import('electron-is-dev')).default;

  const backendPath = isDev
    ? path.join(__dirname, 'Servidor', 'index.js') 
    : path.join(process.resourcesPath, 'Servidor', 'index.js'); 

    
  const backend = spawn('node', [backendPath]);
  

  backend.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  backend.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  backend.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
    },
  });

  //mainWindow.loadFile(path.join(__dirname, 'build/index.html'));
  mainWindow.loadURL('http://localhost:3001');

  Menu.setApplicationMenu(null);
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}



app.whenReady().then(() => {

  startBackend();

  startExpressServer();

  createWindow();

  autoUpdater.checkForUpdatesAndNotify();


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

autoUpdater.on("update-available", (_event, releaseNotes, releaseName) => {
  const dialogOpts = {
      type: 'info',
      buttons: ['Ok'],
      title: `Update Available`,
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail: `A new version download started.`
  };

  if (!updateCheck) {
      dialog.showMessageBox(dialogOpts);
      updateCheck = true;
  }
});

autoUpdater.on("download-progress", (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  console.log(log_message);
});

autoUpdater.on("update-downloaded", (_event) => {
  if (!updateFound) {
      updateFound = true;

      setTimeout(() => {
          autoUpdater.quitAndInstall();
      }, 3500);
  }
});

autoUpdater.on("update-not-available", (_event) => {
  const dialogOpts = {
      type: 'info',
      buttons: ['Ok'],
      title: `Update Not available for `,
      message: "A message!",
      detail: `Update Not available for `
  };

  if (!updateNotAvailable) {
      updateNotAvailable = true;
      dialog.showMessageBox(dialogOpts);
  }
});