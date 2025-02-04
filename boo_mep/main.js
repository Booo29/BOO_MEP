const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const express = require('express'); 
const { autoUpdater } = require('electron-updater');

let mainWindow;


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

function checkForUpdates() {
  autoUpdater.autoDownload = true; // Descarga automáticamente las actualizaciones
  autoUpdater.checkForUpdatesAndNotify(); // Verifica actualizaciones
}

autoUpdater.on('update-available', () => {
  console.log('Nueva actualización disponible. Descargando...');
});

autoUpdater.on('update-downloaded', () => {
  console.log('Actualización descargada. Se instalará al cerrar.');
  autoUpdater.quitAndInstall();
});


app.whenReady().then(() => {

  startBackend();

  startExpressServer();

  createWindow();

  checkForUpdates(); 

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
