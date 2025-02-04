const { app, BrowserWindow, dialog, Menu } = require('electron');
const {autoUpdater} = require("electron-updater");
const path = require('path');
const { spawn } = require('child_process');
const express = require('express'); 

let mainWindow;


// Función para iniciar el servidor Express
function startExpressServer() {
  const expressApp = express();
  const PORT = 3001;

  // Sirve la carpeta 'build' que contiene los archivos estáticos de React
  expressApp.use(express.static(path.join(__dirname, 'build')));

  // Maneja todas las rutas con el archivo `index.html` para compatibilidad con React Router
  expressApp.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });

  // Inicia el servidor Express
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

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      const progressElement = document.createElement('progress');
      progressElement.id = 'update-progress';
      progressElement.max = 100;
      progressElement.value = 0;
      progressElement.style.position = 'fixed';
      progressElement.style.top = '20px';
      progressElement.style.left = '20px';
      progressElement.style.width = '90%';
      document.body.appendChild(progressElement);
    `);
  });
  

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

autoUpdater.on('update-available', () => {
  //mainWindow.webContents.send('update_available');
  const dialogOpts = {
    type: 'info',
    buttons: ['Actualizar', 'Después'],
    title: 'Actualización disponible',
    message: 'Una nueva versión está disponible. ¿Desea actualizar ahora?'
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) {
      autoUpdater.downloadUpdate();
      mainWindow.webContents.send('update_available');
    }
    });
});

autoUpdater.on('download-progress', (progressObj) => {
  const { percent } = progressObj;

  // Actualizar la barra de progreso en la ventana principal
  mainWindow.webContents.executeJavaScript(`
    const progressElement = document.getElementById('update-progress');
    if (progressElement) {
      progressElement.value = ${percent};
    }
  `);
});


autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded');
  const dialogOpts = {
    type: 'info',
    buttons: ['Reiniciar ahora', 'Más tarde'],
    title: 'Actualización descargada',
    message: 'La nueva versión se descargó. ¿Quieres reiniciar ahora?',
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

app.whenReady().then(() => {
  // Inicia el backend al arrancar la aplicación
  startBackend();

  // Inicia el servidor Express
  startExpressServer();

  // Crea la ventana de la aplicación
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