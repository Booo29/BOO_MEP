const express = require("express");
const app = express.Router();

const { connection } = require("../config");

const PostEstudiantes = (req, res) => {
    const estudiantes = Array.isArray(req.body) ? req.body : [req.body]; // Acepta objeto o array

    // Verificar que los datos tengan la estructura correcta
    for (const estudiante of estudiantes) {
        const { Est_Identificacion, Est_Nombre, Est_PrimerApellido, Est_SegundoApellido, Grado_Seccion_Id_Grado_Seccion } = estudiante;
        if (!Est_Identificacion || !Est_Nombre || !Est_PrimerApellido || !Est_SegundoApellido || !Grado_Seccion_Id_Grado_Seccion) {
            return res.status(400).send("Todos los campos son obligatorios: Est_Identificacion, Est_Nombre, Est_PrimerApellido, Est_SegundoApellido, Grado_Seccion_Id_Grado_Seccion.");
        }
    }

    // Iniciar una transacción
    connection.beginTransaction((err) => {
        if (err) {
            console.error("Error al iniciar la transacción:", err);
            return res.status(500).send("Error al iniciar la transacción.");
        }

        const query = `
            INSERT INTO estudiantes (Est_Identificacion, Est_Nombre, Est_PrimerApellido, Est_SegundoApellido, Grado_Seccion_Id_Grado_Seccion) 
            VALUES (?, ?, ?, ?, ?)
        `;

        // Procesar cada estudiante
        const promises = estudiantes.map(estudiante => {
            const { Est_Identificacion, Est_Nombre, Est_PrimerApellido, Est_SegundoApellido, Grado_Seccion_Id_Grado_Seccion } = estudiante;

            return new Promise((resolve, reject) => {
                connection.query(query, [Est_Identificacion, Est_Nombre, Est_PrimerApellido, Est_SegundoApellido, Grado_Seccion_Id_Grado_Seccion], (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results);
                });
            });
        });

        // Ejecutar todas las promesas
        Promise.all(promises)
            .then(() => {
                // Confirmar la transacción
                connection.commit((err) => {
                    if (err) {
                        console.error("Error al confirmar la transacción:", err);
                        return res.status(500).send("Error al confirmar la transacción.");
                    }
                    res.status(201).send("Estudiantes guardados con éxito.");
                });
            })
            .catch((err) => {
                // Revertir la transacción en caso de error
                connection.rollback(() => {
                    console.error("Error al guardar estudiantes. Transacción revertida:", err);
                    res.status(500).send("Error al guardar estudiantes. Transacción revertida.");
                });
            });
    });
};


app.post("/estudiantes", PostEstudiantes);

module.exports = app;