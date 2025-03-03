const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const express = require('express'); 
const { autoUpdater } = require('electron-updater');
const mysql = require('mysql');

let mainWindow;

function updateDatabase() {
  const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'una',
    database: 'boo_mep',
    multipleStatements: true
  });

  connection.connect((err) => {
    if (err) {
      console.log("Error al conectar con la base de datos", err);
      return;
    }
    console.log("Conexión exitosa con la DB");

    // Verificar si la columna Asi_Sesion existe
    connection.query(
      "SHOW COLUMNS FROM asistencia LIKE 'Asi_Sesion'", 
      (err, results) => {
        if (err) {
          console.error("Error verificando la base de datos:", err);
          connection.end();
          return;
        }

        if (results.length === 0) {
          console.log("La columna 'Asi_Sesion' no existe. Agregando...");

          connection.query(
            "ALTER TABLE asistencia ADD COLUMN Asi_Sesion INT DEFAULT 1 NOT NULL", 
            (err) => {
              if (err) {
                console.error("Error al agregar la columna 'Asi_Sesion':", err);
              } else {
                console.log("Columna 'Asi_Sesion' agregada correctamente.");
              }
              connection.end(); // Cerrar la conexión después de la consulta
            }
          );
        } else {
          console.log("La columna 'Asi_Sesion' ya existe. No se realizaron cambios.");
          connection.end(); // Cerrar la conexión si la columna ya existe
        }
      }
    );
  });
}

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

  updateDatabase();

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
