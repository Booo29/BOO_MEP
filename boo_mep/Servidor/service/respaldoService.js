const express = require("express");
const app = express.Router();

const { connection } = require("../config");
const { exec } = require('child_process');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads'); 
    },
    filename: (req, file, cb) => {
        const uniqueName = `restore_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

const RestoreRespaldo = (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    const backupFilePath = file.path;
    const dbName = "boo_mep"; 
    const user = "root"; 
    const password = "una"; 
    const host = "localhost"; 
    const port = 3306;
    const mysqldumpPath = `"C:\\Program Files\\MariaDB 10.6\\bin\\mysql.exe"`;


    const command = `${mysqldumpPath} -h ${host} -P ${port} -u ${user} -p${password} ${dbName} < ${backupFilePath}`;

   
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error al restaurar el respaldo: ${error.message}`);
            return res.status(500).json({ error: "Error al restaurar el respaldo" });
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
        }
        console.log(`Respaldo restaurado exitosamente desde: ${backupFilePath}`);
        return res.status(200).json({ message: "Respaldo restaurado exitosamente" });
    });
};

const GetRespaldo = (req, res) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup_${timestamp}.sql`;
    const backupFilePath = `./backup/${backupFileName}`;
    const dbName = "boo_mep"; 
    const user = "root"; 
    const password = "una"; 
    const host = "localhost"; 
    const port = 3306; 
    const mysqldumpPath = `"C:\\Program Files\\MariaDB 10.6\\bin\\mysqldump.exe"`;
    const command = `${mysqldumpPath} -h ${host} -P ${port} -u ${user} -p${password} ${dbName} > ${backupFilePath}`;
    

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error al crear el respaldo: ${error.message}`);
            return res.status(500).json({ error: "Error al crear el respaldo" });
        }
        if (stderr) {
            console.error(`Error en la salida estándar: ${stderr}`);
            return res.status(500).json({ error: "Error en la salida estándar" });
        }
        console.log(`Respaldo creado exitosamente: ${backupFilePath}`);
        return res.status(200).json({ message: "Respaldo creado exitosamente", filePath: backupFilePath });
    });
}
// const RestoreRespaldo = (req, res) => {
//     const backupFilePath = req.body.filePath; 
//     const dbName = "boo_mep"; 
//     const user = "root"; 
//     const password = "una"; 
//     const host = "localhost"; 
//     const port = 3306; 
//     const command = `mysql -h ${host} -P ${port} -u ${user} -p${password} ${dbName} < ${backupFilePath}`;

//     exec(command, (error, stdout, stderr) => {
//         if (error) {
//             console.error(`Error al restaurar el respaldo: ${error.message}`);
//             return res.status(500).json({ error: "Error al restaurar el respaldo" });
//         }
//         if (stderr) {
//             console.error(`Error en la salida estándar: ${stderr}`);
//             return res.status(500).json({ error: "Error en la salida estándar" });
//         }
//         console.log(`Respaldo restaurado exitosamente desde: ${backupFilePath}`);
//         return res.status(200).json({ message: "Respaldo restaurado exitosamente" });
//     });
// }

const GetRespaldoList = (req, res) => {
    const backupDir = './backup'; 

    fs.readdir(backupDir, (err, files) => {
        if (err) {
            console.error(`Error al leer el directorio de respaldos: ${err.message}`);
            return res.status(500).json({ error: "Error al leer el directorio de respaldos" });
        }
        const backupFiles = files.filter(file => file.endsWith('.sql'));
        return res.status(200).json({ backups: backupFiles });
    });
}

const DeleteRespaldo = (req, res) => {
    const backupFilePath = req.body.filePath; // Ruta del archivo de respaldo a eliminar

    fs.unlink(backupFilePath, (err) => {
        if (err) {
            console.error(`Error al eliminar el respaldo: ${err.message}`);
            return res.status(500).json({ error: "Error al eliminar el respaldo" });
        }
        console.log(`Respaldo eliminado exitosamente: ${backupFilePath}`);
        return res.status(200).json({ message: "Respaldo eliminado exitosamente" });
    });
}

app.post("/respaldo", GetRespaldo);
app.post("/restaurar", upload.single('respaldo'), RestoreRespaldo);
app.get("/respaldo/lista", GetRespaldoList);
app.delete("/respaldo/eliminar", DeleteRespaldo);

module.exports = app;
