const { app, BrowserWindow } = require('electron');
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
      contextIsolation: false,
    },
  });

  //mainWindow.loadFile(path.join(__dirname, 'build/index.html'));
  mainWindow.loadURL('http://localhost:3001');
  

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Inicia el backend al arrancar la aplicación
  startBackend();

  // Inicia el servidor Express
  startExpressServer();

  // Crea la ventana de la aplicación
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